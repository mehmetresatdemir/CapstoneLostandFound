const LostItem = require('../models/LostItem');

// @desc    Get all lost items
// @route   GET /api/lostitems
// @access  Public
exports.getLostItems = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Filter
    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const lostItems = await LostItem.find(query)
      .populate('user', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lostItems.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: lostItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lost item
// @route   GET /api/lostitems/:id
// @access  Public
exports.getLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create lost item
// @route   POST /api/lostitems
// @access  Private
exports.createLostItem = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Auto-fill contact info
    if (!req.body.contactInfo) {
      req.body.contactInfo = {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      };
    }

    // If files uploaded
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    const lostItem = await LostItem.create(req.body);

    res.status(201).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lost item
// @route   PUT /api/lostitems/:id
// @access  Private
exports.updateLostItem = async (req, res, next) => {
  try {
    let lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Make sure user is item owner
    if (lostItem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // If new files uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      req.body.images = [...(lostItem.images || []), ...newImages];
    }

    lostItem = await LostItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lost item
// @route   DELETE /api/lostitems/:id
// @access  Private
exports.deleteLostItem = async (req, res, next) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);

    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }

    // Make sure user is item owner
    if (lostItem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // Soft delete
    lostItem.isActive = false;
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: 'Lost item deleted',
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's lost items
// @route   GET /api/lostitems/user/me
// @access  Private
exports.getMyLostItems = async (req, res, next) => {
  try {
    const lostItems = await LostItem.find({
      user: req.user.id,
      isActive: true
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: lostItems.length,
      data: lostItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
