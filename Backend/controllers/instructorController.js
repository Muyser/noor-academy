import Instructor from '../models/Instructor.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Helper function to stream uploaded image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'noor_academy/instructors' },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// @desc    Get all instructors
// @route   GET /api/instructors
// @access  Public
export const getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().sort({ order: 1 });
    const formatted = instructors.map((inst) => ({
      id: inst._id,
      name: inst.name,
      role: inst.role,
      description: inst.description,
      image: inst.image,
      courses_count: inst.courses_count,
      averageRating: inst.averageRating,
      learners_count: inst.learners_count || 0,
      order: inst.order,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new instructor (with image file upload)
// @route   POST /api/admin/instructors
// @access  Private/Admin
export const createInstructor = async (req, res) => {
  try {
    const { name, role, description, courses_count, averageRating, order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }

    // 1. Check if an instructor with the same name already exists (case-insensitive)
    const existingInstructor = await Instructor.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingInstructor) {
      return res.status(400).json({ message: 'An instructor with this name already exists' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Instructor image file is required' });
    }

    // 2. Upload image buffer to Cloudinary only after duplicate check succeeds
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    const instructor = await Instructor.create({
      name: name.trim(),
      role: role.trim(),
      description: description || '',
      image: imageUrl,
      courses_count: courses_count ? Number(courses_count) : 0,
      averageRating: averageRating ? Number(averageRating) : 4.9,
      order: order ? Number(order) : 1,
    });

    res.status(201).json({
      id: instructor._id,
      name: instructor.name,
      role: instructor.role,
      description: instructor.description,
      image: instructor.image,
      courses_count: instructor.courses_count,
      averageRating: instructor.averageRating,
      learners_count: 0,
      order: instructor.order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update instructor
// @route   PUT /api/admin/instructors/:id
// @access  Private/Admin
export const updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    let imageUrl = instructor.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    instructor.name = req.body.name || instructor.name;
    instructor.role = req.body.role || instructor.role;
    instructor.description = req.body.description !== undefined ? req.body.description : instructor.description;
    instructor.image = imageUrl;
    instructor.courses_count = req.body.courses_count !== undefined ? Number(req.body.courses_count) : instructor.courses_count;
    instructor.averageRating = req.body.averageRating !== undefined ? Number(req.body.averageRating) : instructor.averageRating;
    instructor.order = req.body.order !== undefined ? Number(req.body.order) : instructor.order;

    const updated = await instructor.save();

    res.json({
      id: updated._id,
      name: updated.name,
      role: updated.role,
      description: updated.description,
      image: updated.image,
      courses_count: updated.courses_count,
      averageRating: updated.averageRating,
      order: updated.order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete instructor
// @route   DELETE /api/admin/instructors/:id
// @access  Private/Admin
export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    await instructor.deleteOne();
    res.json({ message: 'Instructor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};