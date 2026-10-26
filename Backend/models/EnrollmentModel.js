import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'active',
    },
    payment_method: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer_sudan', 'free'],
      default: 'free',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'rejected'],
      default: 'completed',
    },
    payment_proof: {
      screenshot_url: { type: String, default: '' },
      transaction_id: { type: String, default: '' },
      notes: { type: String, default: '' },
      uploaded_at: { type: Date },
    },
    progress: {
      type: Number,
      default: 0, // Percentage (0 - 100)
    },
    completed_lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approved_at: {
      type: Date,
    },
    rejection_reason: {
      type: String,
      default: '',
    },
    enrolled_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollments for the same student and course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;