import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: 'Learning',
      trim: true,
    },
    author: {
      type: String,
      default: 'Noor Pro Academy',
      trim: true,
    },
    cover_image: {
      type: String,
      default: '',
    },
    excerpt: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    publish_date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    read_time: {
      type: String,
      default: '5 min read',
    },
    seo_title: {
      type: String,
      default: '',
    },
    seo_description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;