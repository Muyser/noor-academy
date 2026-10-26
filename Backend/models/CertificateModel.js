import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
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
    student_name: {
      type: String,
      required: true,
      trim: true,
    },
    student_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    course_title: {
      type: String,
      required: true,
      trim: true,
    },
    course_title_ar: {
      type: String,
      default: '',
      trim: true,
    },
    instructor: {
      type: String,
      default: 'Noor Academy Instructor',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    certificate_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    certificate_template: {
      type: String,
      default: '',
    },
    issue_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate certificates for the same student and course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;