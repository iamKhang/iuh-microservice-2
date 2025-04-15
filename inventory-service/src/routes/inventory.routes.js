/**
 * Inventory routes
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// Get all inventory items
router.get('/', inventoryController.getAllItems);

// Get a single inventory item by ID
router.get('/:id', inventoryController.getItemById);

// Add a new inventory item
router.post('/', inventoryController.addItem);

// Update an existing inventory item
router.put('/:id', inventoryController.updateItem);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteItem);

// Process an order (reduce inventory)
router.post('/order', inventoryController.processOrder);

module.exports = router;
