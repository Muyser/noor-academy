import Gallery from '../models/GalleryModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'all' ? { category } : {};

    const items = await Gallery.find(query).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new gallery item (Image or Video with Cloudinary upload)
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req, res) => {
  try {
    const { title, title_ar, category, description, description_ar } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and media file (image or video) are required' });
    }

    // Determine if file is video or image
    const isVideo = req.file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    // Convert memory buffer to Base64 for Cloudinary upload
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'noor_pro_gallery',
      resource_type: resourceType, // Handles video or image dynamically
    });

    const newGalleryItem = await Gallery.create({
      title: title.trim(),
      title_ar: title_ar ? title_ar.trim() : '',
      category: category || 'events',
      image: uploadResponse.secure_url, // URL works for both images and video players
      type: resourceType, // 'image' or 'video'
      description: description || '',
      description_ar: description_ar || '',
    });

    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing gallery item (Image or Video)
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    item.title = req.body.title !== undefined ? req.body.title.trim() : item.title;
    item.title_ar = req.body.title_ar !== undefined ? req.body.title_ar.trim() : item.title_ar;
    item.category = req.body.category || item.category;
    item.description = req.body.description !== undefined ? req.body.description : item.description;
    item.description_ar = req.body.description_ar !== undefined ? req.body.description_ar : item.description_ar;

    // If a new media file (image or video) is uploaded
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'noor_pro_gallery',
        resource_type: resourceType,
      });

      item.image = uploadResponse.secure_url;
      item.type = resourceType;
    }

    const updatedItem = await item.save();

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Gallery item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};