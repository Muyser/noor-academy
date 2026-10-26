import Faq from '../models/Faq.js';

// @desc    Get all FAQs (sorted by display order)
// @route   GET /api/faqs
// @access  Public
export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    const formatted = faqs.map((f) => ({
      id: f._id,
      question: f.question,
      question_ar: f.question_ar,
      answer: f.answer,
      answer_ar: f.answer_ar,
      category: f.category,
      order: f.order,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
export const createFaq = async (req, res) => {
  try {
    const { question, question_ar, answer, answer_ar, category, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer in English are required' });
    }

    // Duplicate check for existing question
    const existingFaq = await Faq.findOne({
      question: { $regex: new RegExp(`^${question.trim()}$`, 'i') },
    });

    if (existingFaq) {
      return res.status(400).json({ message: 'An FAQ with this question already exists' });
    }

    const faq = await Faq.create({
      question: question.trim(),
      question_ar: question_ar ? question_ar.trim() : '',
      answer: answer.trim(),
      answer_ar: answer_ar ? answer_ar.trim() : '',
      category: category ? category.trim().toLowerCase() : 'general',
      order: order ? Number(order) : 1,
    });

    res.status(201).json({
      id: faq._id,
      question: faq.question,
      question_ar: faq.question_ar,
      answer: faq.answer,
      answer_ar: faq.answer_ar,
      category: faq.category,
      order: faq.order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    faq.question = req.body.question ? req.body.question.trim() : faq.question;
    faq.question_ar = req.body.question_ar !== undefined ? req.body.question_ar : faq.question_ar;
    faq.answer = req.body.answer ? req.body.answer.trim() : faq.answer;
    faq.answer_ar = req.body.answer_ar !== undefined ? req.body.answer_ar : faq.answer_ar;
    faq.category = req.body.category ? req.body.category.trim().toLowerCase() : faq.category;
    faq.order = req.body.order !== undefined ? Number(req.body.order) : faq.order;

    const updated = await faq.save();

    res.json({
      id: updated._id,
      question: updated.question,
      question_ar: updated.question_ar,
      answer: updated.answer,
      answer_ar: updated.answer_ar,
      category: updated.category,
      order: updated.order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await faq.deleteOne();
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};