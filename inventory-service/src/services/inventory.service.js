/**
 * Inventory service - business logic layer
 */

const inventoryModel = require('../models/inventory.model');

// Get all inventory items
const getAllItems = () => {
  return inventoryModel.getAllItems();
};

// Get a single inventory item by ID
const getItemById = (id) => {
  const item = inventoryModel.getItemById(id);
  if (!item) {
    throw new Error('Item not found');
  }
  return item;
};

// Add a new inventory item
const addItem = (itemData) => {
  // Validate required fields
  if (!itemData.name || !itemData.price || !itemData.quantity) {
    throw new Error('Missing required fields: name, price, and quantity are required');
  }
  
  // Validate data types
  if (typeof itemData.price !== 'number' || typeof itemData.quantity !== 'number') {
    throw new Error('Price and quantity must be numbers');
  }
  
  return inventoryModel.addItem(itemData);
};

// Update an existing inventory item
const updateItem = (id, updates) => {
  // Validate data types if provided
  if (updates.price !== undefined && typeof updates.price !== 'number') {
    throw new Error('Price must be a number');
  }
  
  if (updates.quantity !== undefined && typeof updates.quantity !== 'number') {
    throw new Error('Quantity must be a number');
  }
  
  const updatedItem = inventoryModel.updateItem(id, updates);
  if (!updatedItem) {
    throw new Error('Item not found');
  }
  
  return updatedItem;
};

// Delete an inventory item
const deleteItem = (id) => {
  const result = inventoryModel.deleteItem(id);
  if (!result) {
    throw new Error('Item not found');
  }
  
  return { success: true, message: 'Item deleted successfully' };
};

// Process an order (reduce inventory)
const processOrder = (orderItems) => {
  if (!Array.isArray(orderItems)) {
    throw new Error('Order items must be an array');
  }
  
  const results = [];
  
  // Process each item in the order
  for (const item of orderItems) {
    if (!item.id || !item.quantity) {
      throw new Error('Each order item must have an id and quantity');
    }
    
    // Reduce inventory by the ordered quantity
    const result = inventoryModel.updateQuantity(item.id, -item.quantity);
    
    if (result && result.error) {
      // If any item fails, we should roll back the entire transaction
      // In a real application with a database, you would use transactions
      throw new Error(`Order failed: ${result.error} for item ${item.id}`);
    }
    
    results.push({
      id: item.id,
      quantityReduced: item.quantity,
      newQuantity: result.quantity,
    });
  }
  
  return {
    success: true,
    message: 'Order processed successfully',
    items: results,
  };
};

module.exports = {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  processOrder,
};
