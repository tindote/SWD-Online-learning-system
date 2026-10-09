const CategoryModel = require('../models/categoryModel');

const validateCategoryInput = (data) => {
  const errors = [];
  const { name } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Category name is required');
  }

  return errors;
};

const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAll();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.getById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validateCategoryInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors
      });
    }

    const { name, description } = req.body;
    const newCategory = await CategoryModel.create({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await CategoryModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    const errors = validateCategoryInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors
      });
    }

    const { name, description } = req.body;
    const updatedCategory = await CategoryModel.update(id, {
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await CategoryModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
    }

    await CategoryModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `Category with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
