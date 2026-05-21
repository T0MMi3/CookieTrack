const saleDataService = require('../services/saleDataService');

const createSaleData = async (req, res) => {
  try {
    const saleDataId = await saleDataService.createSaleData(req.body);
    console.log('Sale data created successfully:', saleDataId);
    res.status(201).json({ id: saleDataId });
  } catch (error) {
    console.error('Failed to create sale data:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSaleData = async (req, res) => {
  const { id } = req.params;
  try {
    const saleData = await saleDataService.getSaleData(id);
    console.log('Sale data fetched successfully:', saleData);
    res.status(200).json(saleData);
  } catch (error) {
    console.error('Failed to fetch sale data by id:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateSaleData = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await saleDataService.updateSaleData(id, req.body);
    console.log('Sale data updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update sale data:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteSaleData = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await saleDataService.deleteSaleData(id);
    console.log('Sale data deleted successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete sale data:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSaleDatasByTrooperId = async (req, res) => {
  const { id } = req.params;
  try {
    const saleDatas = await saleDataService.getSaleDatasByTrooperId(id);
    console.log('Sale data fetched by trooperId successfully:', saleDatas);
    res.status(200).json(saleDatas);
  } catch (error) {
    console.error('Failed to fetch sale data by trooperId:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSaleDataByOwnerId = async (req, res) => {
  const { id } = req.params;
  try {
    const saleDatas = await saleDataService.getSaleDataByOwnerId(id);
    console.log('Sale data fetched by ownerId successfully:', saleDatas);
    res.status(200).json(saleDatas);
  } catch (error) {
    console.error('Failed to fetch sale data by ownerId:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllSaleData = async (req, res) => {
  try {
    const saleDatas = await saleDataService.getAllSaleData();
    console.log('Sale data fetched successfully:', saleDatas);
    res.status(200).json(saleDatas);
  } catch (error) {
    console.error('Failed to fetch all sale data:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSaleData,
  getSaleData,
  updateSaleData,
  deleteSaleData,
  getSaleDatasByTrooperId,
  getSaleDataByOwnerId,
  getAllSaleData
};