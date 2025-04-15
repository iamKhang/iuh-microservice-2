/**
 * Inventory controller - handles HTTP requests and responses
 */

const inventoryService = require('../services/inventory.service');

// Get all inventory items
const getAllItems = (req, res, next) => {
  try {
    const items = inventoryService.getAllItems();
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single inventory item by ID
const getItemById = (req, res, next) => {
  try {
    const { id } = req.params;
    const item = inventoryService.getItemById(id);
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Add a new inventory item
const addItem = (req, res, next) => {
  try {
    const newItem = inventoryService.addItem(req.body);
    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: newItem,
    });
  } catch (error) {
    if (error.message.includes('Missing required fields') || 
        error.message.includes('must be')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Update an existing inventory item
const updateItem = (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedItem = inventoryService.updateItem(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('must be')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Delete an inventory item
const deleteItem = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = inventoryService.deleteItem(id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Process an order (reduce inventory)
const processOrder = (req, res, next) => {
  try {
    const result = inventoryService.processOrder(req.body.items);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('Order failed') || 
        error.message.includes('must be an array') ||
        error.message.includes('must have an id and quantity')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  processOrder,
};
