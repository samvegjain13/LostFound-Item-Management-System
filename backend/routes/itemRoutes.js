const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @desc    Search items by name
// @route   GET /api/items/search?name=xyz
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const items = await Item.find({
      itemName: { $regex: name, $options: 'i' }
    }).populate('user', 'name email');

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all items
// @route   GET /api/items
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await Item.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    const item = await Item.create({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      user: req.user._id
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this item' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
