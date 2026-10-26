import cloudinary from '../config/cloudinary.js'; // Adjust relative path to your file
import BlogPost from '../models/BlogPost.js';

// Helper to stream buffer to Cloudinary using your imported instance
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'noor_academy/blogs' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Helper to generate clean URL slug from title
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove non-word chars
    .replace(/\-\-+/g, '-');      // Replace multiple - with single -
};

// @desc    Get all blog posts
// @route   GET /api/posts
// @access  Public
export const getBlogPosts = async (req, res) => {
  try {
    const filter = req.query.includeDrafts === 'true' ? {} : { status: 'published' };
    
    const posts = await BlogPost.find(filter).sort({ publish_date: -1, createdAt: -1 });
    const formatted = posts.map((post) => ({
      id: post._id,
      title: post.title,
      title_ar: post.title_ar,
      slug: post.slug,
      category: post.category,
      author: post.author,
      cover_image: post.cover_image,
      excerpt: post.excerpt,
      content: post.content,
      publish_date: post.publish_date,
      read_time: post.read_time,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      status: post.status,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blog post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({
      id: post._id,
      title: post.title,
      title_ar: post.title_ar,
      slug: post.slug,
      category: post.category,
      author: post.author,
      cover_image: post.cover_image,
      excerpt: post.excerpt,
      content: post.content,
      publish_date: post.publish_date,
      read_time: post.read_time,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      status: post.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private/Admin
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      slug,
      category,
      author,
      excerpt,
      content,
      publish_date,
      read_time,
      seo_title,
      seo_description,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Article title is required' });
    }

    const finalSlug = slug ? slug.trim().toLowerCase() : generateSlug(title);

    const existingPost = await BlogPost.findOne({ slug: finalSlug });
    if (existingPost) {
      return res.status(400).json({ message: 'A blog post with this slug already exists' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Cover image file is required' });
    }

    // Upload cover image buffer to Cloudinary
    const coverImageUrl = await uploadToCloudinary(req.file.buffer);

    const post = await BlogPost.create({
      title: title.trim(),
      title_ar: title_ar ? title_ar.trim() : '',
      slug: finalSlug,
      category: category ? category.trim() : 'Learning',
      author: author ? author.trim() : 'Noor Pro Academy',
      cover_image: coverImageUrl,
      excerpt: excerpt || '',
      content: content || '',
      publish_date: publish_date || new Date().toISOString().split('T')[0],
      read_time: read_time || '5 min read',
      seo_title: seo_title || '',
      seo_description: seo_description || '',
      status: status || 'published',
    });

    res.status(201).json({
      id: post._id,
      title: post.title,
      title_ar: post.title_ar,
      slug: post.slug,
      category: post.category,
      author: post.author,
      cover_image: post.cover_image,
      excerpt: post.excerpt,
      content: post.content,
      publish_date: post.publish_date,
      read_time: post.read_time,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      status: post.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/posts/:id
// @access  Private/Admin
export const updateBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    post.title = req.body.title ? req.body.title.trim() : post.title;
    post.title_ar = req.body.title_ar !== undefined ? req.body.title_ar : post.title_ar;
    
    if (req.body.slug) {
      post.slug = req.body.slug.trim().toLowerCase();
    }

    post.category = req.body.category !== undefined ? req.body.category : post.category;
    post.author = req.body.author !== undefined ? req.body.author : post.author;
    
    if (req.file) {
      post.cover_image = await uploadToCloudinary(req.file.buffer);
    }

    post.excerpt = req.body.excerpt !== undefined ? req.body.excerpt : post.excerpt;
    post.content = req.body.content !== undefined ? req.body.content : post.content;
    post.publish_date = req.body.publish_date !== undefined ? req.body.publish_date : post.publish_date;
    post.read_time = req.body.read_time !== undefined ? req.body.read_time : post.read_time;
    post.seo_title = req.body.seo_title !== undefined ? req.body.seo_title : post.seo_title;
    post.seo_description = req.body.seo_description !== undefined ? req.body.seo_description : post.seo_description;
    post.status = req.body.status || post.status;

    const updated = await post.save();

    res.json({
      id: updated._id,
      title: updated.title,
      title_ar: updated.title_ar,
      slug: updated.slug,
      category: updated.category,
      author: updated.author,
      cover_image: updated.cover_image,
      excerpt: updated.excerpt,
      content: updated.content,
      publish_date: updated.publish_date,
      read_time: updated.read_time,
      seo_title: updated.seo_title,
      seo_description: updated.seo_description,
      status: updated.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
export const deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Blog post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};