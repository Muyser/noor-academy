import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    name_ar: {
      type: String,
      default: '',
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    description_ar: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    flag: {
      type: String,
      default: '🌐',
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Language = mongoose.model('Language', languageSchema);
export default Language;