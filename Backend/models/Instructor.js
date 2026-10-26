import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String, // Stores the secure Cloudinary image URL
      required: true,
    },
    courses_count: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0, // Will update based on student ratings
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for learners count linked to enrollments
instructorSchema.virtual('learners_count', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'instructor',
  count: true,
});

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;