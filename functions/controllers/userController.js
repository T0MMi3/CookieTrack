const userService = require('../services/userService');
const documentService = require('../services/documentService')

const createUser = async (req, res) => {
  try {
    const userId = await userService.registerUser(req.body);
    console.log('User created successfully:', userId);
    res.status(201).json({ id: userId });
  } catch (error) {
    console.error('Failed to create User', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    console.log('Fetch all user successfully:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch all User',error);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(id);
    console.log('Fetch user by id successfully:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to fetch User by id',error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUser(id, req.body);
    console.log('User updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update user', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUser(id);
    console.log('User deleted successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete user', error.message);
    res.status(500).json({ message: error.message });
  }
};

const attachRoleAsCustomClaim = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.attachRoleAsCustomClaim(id);
    console.log('Role as customClaim set successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to set role as customClaim', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getRole = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = await userService.getRole(id);
    console.log(userId);
    res.status(201).json({ role: userId });
  } catch (error) {
    console.error('Failed to get userRole', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  attachRoleAsCustomClaim,
  getRole
};
