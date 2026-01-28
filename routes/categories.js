const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      icon,
      createdBy: req.userId
    });

    await category.save();
    await category.populate('createdBy', 'name');
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (Admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();
    await category.populate('createdBy', 'name');
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;