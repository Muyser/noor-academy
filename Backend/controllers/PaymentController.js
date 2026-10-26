import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import Enrollment from "../models/EnrollmentModel.js";
import Course from "../models/Course.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Initialize one-time Stripe payment session for a course
 * @route   POST /api/payments/initialize
 * @access  Private (Authenticated Student)
 */
export const initializePayment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const amount = course.price || 0;
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "This is a free course. Use free enrollment instead." });
    }

    const gatewayTransactionId = `txn_stripe_${Date.now()}`;

    // Create a pending transaction record
    await Transaction.create({
      userId,
      courseId,
      paymentGateway: "stripe",
      gatewayTransactionId,
      amount,
      currency: "USD",
      status: "pending",
      type: "course_purchase",
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: course.title,
              description: course.short_description || "Noor Pro Academy Course Access"
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { 
        userId: userId.toString(), 
        courseId: courseId.toString(), 
        gatewayTransactionId 
      },
      success_url: `${clientUrl}/dashboard?payment=success&course=${courseId}`,
      cancel_url: `${clientUrl}/courses/${courseId}?payment=cancelled`,
    });

    return res.status(200).json({
      success: true,
      message: "Stripe checkout session initialized successfully",
      session_url: session.url,
      gatewayTransactionId,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Stripe Webhook Handler (Auto-Enrollment)
// ==========================================
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const gatewayTransactionId = session.metadata?.gatewayTransactionId;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (gatewayTransactionId) {
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { gatewayTransactionId },
        { status: "completed" },
        { new: true }
      );

      if (updatedTransaction && userId && courseId) {
        // Automatically grant active enrollment upon successful payment
        const existingEnrollment = await Enrollment.findOne({ student: userId, course: courseId });
        
        if (!existingEnrollment) {
          await Enrollment.create({
            student: userId,
            course: courseId,
            status: "active",
            payment_method: "card",
            payment_status: "completed",
            progress: 0,
            completed_lectures: [],
          });
        } else {
          existingEnrollment.status = "active";
          existingEnrollment.payment_status = "completed";
          await existingEnrollment.save();
        }
      }
    }
  }

  res.status(200).json({ received: true });
};

// ==========================================
// Get User Transaction History
// ==========================================
export const getMyTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId })
      .populate("courseId", "title title_ar image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};