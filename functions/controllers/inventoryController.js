const inventoryService = require('../services/inventoryService');

const createParentInventory = async (req, res) => {
  try {
    const inventoryId = await inventoryService.createParentInventory(req.body);
    console.log('Parent Inventory created successfully:', { id: inventoryId });
    res.status(201).json({ message: 'Parent Inventory created successfully', inventoryId });
  } catch (error) {
    console.error('Failed to create Parent Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const createLeaderInventory = async (req, res) => {
  try {
    const inventoryId = await inventoryService.createTroopInventory(req.body);
    console.log('Troop Inventory created successfully:', { id: inventoryId });
    res.status(201).json({ message: 'Troop Inventory created successfully', inventoryId });
  } catch (error) {
    console.error('Failed to create Troop Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const createTrooperInventory = async (req, res) => {
  try {
    const inventoryId = await inventoryService.createTrooperInventory(req.body);
    console.log('Trooper Inventory created successfully:', { id: inventoryId });
    res.status(201).json({ message: 'Trooper Inventory created successfully', inventoryId });
  } catch (error) {
    console.error('Failed to create Trooper Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateParentInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryService.updateParentInventory(id, req.body);
    console.log('Parent Inventory updated successfully:', result);
    res.status(200).json({ message: 'Parent Inventory updated successfully', result });
  } catch (error) {
    console.error('Failed to update Parent Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateLeaderInventory = async (req, res) => {
  try {
    const result = await inventoryService.updateLeaderInventory(req.body);
    console.log('Leader Inventory updated successfully:', result);
    res.status(200).json({ message: 'Leader Inventory updated successfully', result });
  } catch (error) {
    console.error('Failed to update Leader Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateTrooperInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryService.updateTrooperInventory(id, req.body);
    console.log('Trooper Inventory updated successfully:', result);
    res.status(200).json({ message: 'Trooper Inventory updated successfully', result });
  } catch (error) {
    console.error('Failed to update Trooper Inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateTrooperCookie = async (req, res) => {
  const { trooperId } = req.params;
  try {
    const result = await inventoryService.updateTrooperCookie(trooperId, req.body.cookiesToAdd);
    console.log('Trooper Inventory cookies updated successfully:', result);
    res.status(200).json({ message: 'Trooper Inventory cookies updated successfully', result });
  } catch (error) {
    console.error('Failed to update Trooper Inventory cookies:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllInventories = async (req, res) => {
  try {
    const inventories = await inventoryService.getAllInventories();
    console.log('Fetched all inventories successfully:', inventories);
    res.status(200).json(inventories);
  } catch (error) {
    console.error('Failed to fetch all inventories:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getLeaderInventory = async (req, res) => {
  try {
    const inventories = await inventoryService.getLeaderInventory();
    console.log('Fetched leader inventory successfully:', inventories);
    res.status(200).json(inventories);
  } catch (error) {
    console.error('Failed to fetch leader inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getInventoryByOwnerId = async (req, res) => {
  const { id } = req.params;
  try {
    const inventories = await inventoryService.getInventoryByOwnerId(id);
    console.log('Fetched inventory by owner ID successfully:', inventories);
    res.status(200).json(inventories);
  } catch (error) {
    console.error('Failed to fetch inventory by owner ID:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await inventoryService.deleteInventory(id);
    console.log('Deleted inventory successfully:', result);
    res.status(200).json({ message: 'Inventory deleted successfully', result });
  } catch (error) {
    console.error('Failed to delete inventory:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createParentInventory,
  createLeaderInventory,
  createTrooperInventory,
  updateParentInventory,
  updateLeaderInventory,
  updateTrooperInventory,
  updateTrooperCookie,
  getAllInventories,
  getLeaderInventory,
  getInventoryByOwnerId,
  deleteInventory
};