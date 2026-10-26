import Language from '../models/Language.js';

// @desc    Get all languages
// @route   GET /api/languages
// @access  Public
export const getLanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ order: 1 });
    const formatted = languages.map((lang) => ({
      id: lang._id,
      name: lang.name,
      name_ar: lang.name_ar,
      slug: lang.slug,
      description: lang.description,
      description_ar: lang.description_ar,
      image: lang.image,
      flag: lang.flag,
      order: lang.order,
      status: lang.status,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new language
// @route   POST /api/admin/languages (or /api/languages)
// @access  Private/Admin
export const createLanguage = async (req, res) => {
  try {
    const { name, name_ar, slug, description, description_ar, image, flag, order, status } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Language name and slug are required' });
    }

    const languageExists = await Language.findOne({ slug });
    if (languageExists) {
      return res.status(400).json({ message: 'Language with this slug already exists' });
    }

    const language = await Language.create({
      name: name.trim(),
      name_ar: name_ar ? name_ar.trim() : '',
      slug: slug.trim().toLowerCase(),
      description: description || '',
      description_ar: description_ar || '',
      image: image || '',
      flag: flag || '🌐',
      order: order !== undefined ? Number(order) : 1,
      status: status || 'active',
    });

    res.status(201).json({
      id: language._id,
      name: language.name,
      name_ar: language.name_ar,
      slug: language.slug,
      description: language.description,
      description_ar: language.description_ar,
      image: language.image,
      flag: language.flag,
      order: language.order,
      status: language.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update language
// @route   PUT /api/admin/languages/:id
// @access  Private/Admin
export const updateLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    language.name = req.body.name || language.name;
    language.name_ar = req.body.name_ar !== undefined ? req.body.name_ar : language.name_ar;
    language.slug = req.body.slug ? req.body.slug.trim().toLowerCase() : language.slug;
    language.description = req.body.description !== undefined ? req.body.description : language.description;
    language.description_ar = req.body.description_ar !== undefined ? req.body.description_ar : language.description_ar;
    language.image = req.body.image !== undefined ? req.body.image : language.image;
    language.flag = req.body.flag !== undefined ? req.body.flag : language.flag;
    language.order = req.body.order !== undefined ? Number(req.body.order) : language.order;
    language.status = req.body.status || language.status;

    const updated = await language.save();

    res.json({
      id: updated._id,
      name: updated.name,
      name_ar: updated.name_ar,
      slug: updated.slug,
      description: updated.description,
      description_ar: updated.description_ar,
      image: updated.image,
      flag: updated.flag,
      order: updated.order,
      status: updated.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete language
// @route   DELETE /api/admin/languages/:id
// @access  Private/Admin
export const deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    await language.deleteOne();
    res.json({ message: 'Language removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};