/**
 * In-memory inventory data store
 * In a real application, this would be replaced with a database
 */

// Sample initial inventory data
let inventory = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 1200,
    quantity: 50,
    category: 'Electronics',
    sku: 'LAP-001',
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest smartphone model',
    price: 800,
    quantity: 100,
    category: 'Electronics',
    sku: 'PHN-001',
  },
  {
    id: '3',
    name: 'Headphones',
    description: 'Noise-cancelling headphones',
    price: 200,
    quantity: 75,
    category: 'Accessories',
    sku: 'ACC-001',
  },
];

// Get all inventory items
const getAllItems = () => {
  return [...inventory];
};

// Get a single inventory item by ID
const getItemById = (id) => {
  return inventory.find(item => item.id === id);
};

// Add a new inventory item
const addItem = (item) => {
  const newItem = {
    ...item,
    id: String(inventory.length + 1), // Simple ID generation
  };
  inventory.push(newItem);
  return newItem;
};

// Update an existing inventory item
const updateItem = (id, updates) => {
  const index = inventory.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  inventory[index] = { ...inventory[index], ...updates };
  return inventory[index];
};

// Delete an inventory item
const deleteItem = (id) => {
  const index = inventory.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  inventory.splice(index, 1);
  return true;
};

// Update inventory quantity (e.g., when processing an order)
const updateQuantity = (id, change) => {
  const item = getItemById(id);
  if (!item) return null;
  
  const newQuantity = item.quantity + change;
  if (newQuantity < 0) return { error: 'Insufficient inventory' };
  
  return updateItem(id, { quantity: newQuantity });
};

module.exports = {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  updateQuantity,
};
