import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    question_ar: {
      type: String,
      default: '',
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    answer_ar: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
      lowercase: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Faq = mongoose.model('Faq', faqSchema);
export default Faq;