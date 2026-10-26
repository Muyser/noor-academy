import mongoose from 'mongoose';

// Lecture / Lesson Sub-schema
const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_ar: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'text'],
      default: 'video',
    },
    // Used when type === 'video'
    video_url: {
      type: String,
      default: '',
    },
    // Used when type === 'pdf'
    file_url: {
      type: String,
      default: '',
    },
    file_name: {
      type: String,
      default: '',
    },
    // Used when type === 'text'
    content: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '0:00',
    },
    is_preview: {
      type: Boolean,
      default: false, // Flag for free preview access
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Section / Module Sub-schema
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_ar: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    lectures: [lectureSchema],
  },
  { timestamps: true }
);

// Main Course Schema (No slugs)
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_ar: {
      type: String,
      default: '',
      trim: true,
    },
    modality: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    level: {
      type: String,
      default: 'A1 → B1',
      trim: true,
    },
    difficulty: {
      type: String,
      default: 'Beginner Friendly',
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    instructor: {
      type: String,
      default: 'Prof. Ahmed Nour',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    short_description: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviews_count: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    outcomes: [String],
    requirements: [String],
    includes: [String],
    honors: [String], // Added field for course honors & recognitions

    // Offline Specific Logistics
    location: {
      type: String,
      default: '',
    },
    schedule_days: {
      type: String,
      default: '',
    },
    schedule_time: {
      type: String,
      default: '',
    },
    start_date: {
      type: String,
      default: '',
    },
    end_date: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 30,
    },

    // Online Specific Syllabus
    duration: {
      type: String,
      default: '0 hours',
    },
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;