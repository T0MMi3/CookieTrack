const troopService = require('../services/trooperService');

const createTrooper = async (req, res) => {
  try {
    const troopId = await troopService.createTrooper(req.body);
    console.log('Trooper created successfully:', troopId);
    res.status(201).json({ id: troopId });
  } catch (error) {
    console.error('Failed to create trooper',error.message);
    res.status(500).json({ message: error.message });
  }
};


const getAllTroopers = async (req, res) => {
  try {
    const troopers = await troopService.getAllTroopers();
    console.log('Fetch all trooper successfully');
    res.status(200).json(troopers);
  } catch (error) {
    console.error('Failed to fetch all trooper', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getTrooperById = async (req, res) => {
  const { id } = req.params;
  try {
    const troop = await troopService.getTrooperById(id);
    console.log('Get trooper by id successfully:', troop);
    res.status(200).json(troop);
  } catch (error) {
    console.error('Failed to get trooper by id', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateTrooper = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await troopService.updateTrooper(id, req.body);
    console.log('Trooper updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update trooper', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteTrooper = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await troopService.deleteTrooper(id);
    console.log('Trooper deleted successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete trooper', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllTroopersByOwnerId = async (req, res) => {
  const { id } = req.params;
  try {
    const troopers = await troopService.getAllTroopersByOwnerId(id);
    console.log('Fetch all troopers with ownerId successfully');
    res.status(200).json(troopers);
  } catch (error) {
    console.error('Failed to fetch all troopers with ownerId', error.message);
    res.status(500).json({ message: error.message });
  }
};





module.exports = {
  createTrooper,
  getAllTroopers,
  getTrooperById,
  updateTrooper,
  deleteTrooper,
  getAllTroopersByOwnerId
};
