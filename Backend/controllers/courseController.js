import Course from '../models/Course.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper to stream large video and file buffers to Cloudinary in chunks
const uploadToCloudinary = (buffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const isVideo = resourceType === 'video' || resourceType === 'auto';
    const uploadMethod = isVideo && buffer.length > 20 * 1024 * 1024 
      ? cloudinary.uploader.upload_large_stream 
      : cloudinary.uploader.upload_stream;

    const uploadStream = uploadMethod(
      { 
        folder: 'noor_academy/courses', 
        resource_type: resourceType,
        chunk_size: 6 * 1024 * 1024 // 6MB chunks for reliable streaming
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @desc    Get all courses (with optional modality filter)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { modality, status, search } = req.query;
    let query = {};

    if (modality) query.modality = modality;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { title_ar: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    const formatted = courses.map((c) => ({
      id: c._id,
      title: c.title,
      title_ar: c.title_ar,
      modality: c.modality,
      category: c.category,
      level: c.level,
      difficulty: c.difficulty,
      price: c.price,
      currency: c.currency,
      instructor: c.instructor,
      image: c.image,
      short_description: c.short_description,
      description: c.description,
      rating: c.rating,
      reviews_count: c.reviews_count,
      featured: c.featured,
      status: c.status,
      outcomes: c.outcomes,
      requirements: c.requirements,
      includes: c.includes,
      honors: c.honors,
      // Offline info
      location: c.location,
      schedule_days: c.schedule_days,
      schedule_time: c.schedule_time,
      start_date: c.start_date,
      end_date: c.end_date,
      capacity: c.capacity,
      // Online info
      duration: c.duration,
      sections_count: c.sections ? c.sections.length : 0,
      lessons_count: c.sections
        ? c.sections.reduce((acc, sec) => acc + sec.lectures.length, 0)
        : 0,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course by ID (includes sections and lectures)
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course (Online or Offline)
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      modality,
      category,
      level,
      difficulty,
      price,
      currency,
      instructor,
      short_description,
      description,
      featured,
      status,
      outcomes,
      requirements,
      includes,
      honors,
      location,
      schedule_days,
      schedule_time,
      start_date,
      end_date,
      capacity,
      duration,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'image');
    }

    const parseArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') return input.split('\n').filter(Boolean);
      return [];
    };

    const course = await Course.create({
      title: title.trim(),
      title_ar: title_ar ? title_ar.trim() : '',
      modality: modality || 'online',
      category: category || 'general',
      level: level || 'A1 → B1',
      difficulty: difficulty || 'Beginner Friendly',
      price: price !== undefined ? Number(price) : 0,
      currency: currency || 'USD',
      instructor: instructor || 'Prof. Ahmed Nour',
      image: imageUrl,
      short_description: short_description || '',
      description: description || '',
      featured: featured === 'true' || featured === true,
      status: status || 'published',
      outcomes: parseArray(outcomes),
      requirements: parseArray(requirements),
      includes: parseArray(includes),
      honors: parseArray(honors),
      location: location || '',
      schedule_days: schedule_days || '',
      schedule_time: schedule_time || '',
      start_date: start_date || '',
      end_date: end_date || '',
      capacity: capacity ? Number(capacity) : 30,
      duration: duration || '0 hours',
      sections: [],
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.file) {
      course.image = await uploadToCloudinary(req.file.buffer, 'image');
    }

    const parseArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') return input.split('\n').filter(Boolean);
      return undefined;
    };

    course.title = req.body.title ? req.body.title.trim() : course.title;
    course.title_ar = req.body.title_ar !== undefined ? req.body.title_ar : course.title_ar;
    course.modality = req.body.modality || course.modality;
    course.category = req.body.category || course.category;
    course.level = req.body.level || course.level;
    course.difficulty = req.body.difficulty || course.difficulty;
    course.price = req.body.price !== undefined ? Number(req.body.price) : course.price;
    course.currency = req.body.currency || course.currency;
    course.instructor = req.body.instructor || course.instructor;
    course.short_description = req.body.short_description !== undefined ? req.body.short_description : course.short_description;
    course.description = req.body.description !== undefined ? req.body.description : course.description;
    course.featured = req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : course.featured;
    course.status = req.body.status || course.status;

    if (req.body.outcomes !== undefined) course.outcomes = parseArray(req.body.outcomes);
    if (req.body.requirements !== undefined) course.requirements = parseArray(req.body.requirements);
    if (req.body.includes !== undefined) course.includes = parseArray(req.body.includes);
    if (req.body.honors !== undefined) course.honors = parseArray(req.body.honors);

    // Offline / On-site fields
    course.location = req.body.location !== undefined ? req.body.location : course.location;
    course.schedule_days = req.body.schedule_days !== undefined ? req.body.schedule_days : course.schedule_days;
    course.schedule_time = req.body.schedule_time !== undefined ? req.body.schedule_time : course.schedule_time;
    course.start_date = req.body.start_date !== undefined ? req.body.start_date : course.start_date;
    course.end_date = req.body.end_date !== undefined ? req.body.end_date : course.end_date;
    course.capacity = req.body.capacity !== undefined ? Number(req.body.capacity) : course.capacity;
    course.duration = req.body.duration !== undefined ? req.body.duration : course.duration;

    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();
    res.json({ message: 'Course removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new section to a course
// @route   POST /api/courses/:id/sections
// @access  Private/Admin
export const addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, title_ar, order } = req.body;
    if (!title) return res.status(400).json({ message: 'Section title is required' });

    const newSection = {
      title: title.trim(),
      title_ar: title_ar ? title_ar.trim() : '',
      order: order ? Number(order) : course.sections.length + 1,
      lectures: [],
    };

    course.sections.push(newSection);
    await course.save();

    res.status(201).json(course.sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a lecture/lesson to a section (supports video/PDF upload)
// @route   POST /api/courses/:id/sections/:sectionId/lectures
// @access  Private/Admin
export const addLecture = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const { title, title_ar, type, duration, is_preview, content, order } = req.body;

    let mediaUrl = '';
    let fileName = '';

    if (req.file) {
      const resourceType = type === 'video' ? 'video' : 'raw';
      mediaUrl = await uploadToCloudinary(req.file.buffer, resourceType);
      fileName = req.file.originalname;
    }

    const newLecture = {
      title: title ? title.trim() : 'Untitled Lecture',
      title_ar: title_ar ? title_ar.trim() : '',
      type: type || 'video',
      video_url: type === 'video' ? mediaUrl : '',
      file_url: type === 'pdf' ? mediaUrl : '',
      file_name: fileName,
      content: type === 'text' ? content : '',
      duration: duration || '0:00',
      is_preview: is_preview === 'true' || is_preview === true,
      order: order ? Number(order) : section.lectures.length + 1,
    };

    section.lectures.push(newLecture);
    await course.save();

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};