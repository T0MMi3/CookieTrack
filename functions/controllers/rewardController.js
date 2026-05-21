const rewardService = require('../services/rewardService');

const createReward = async (req, res) => {
  try {
    const RewardId = await rewardService.createReward(req.body);
    console.log('Reward created successfully:', RewardId);
    res.status(201).json({ id: RewardId });
  } catch (error) {
    console.error('Failed to create reward:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllReward = async (req, res) => {
  try {
    const Rewards = await rewardService.getAllRewards();
    console.log('Rewards fetched successfully:', Rewards);
    res.status(200).json(Rewards);
  } catch (error) {
    console.error('Failed to fetch all rewards: ', error.message)
    res.status(500).json({ message: error.message });
  }
};

const updateReward = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await rewardService.updateReward(id, req.body);
    console.log('Reward updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update reward',error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteReward = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await rewardService.deleteReward(id);
    console.log('Reward deleted successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete reward',error.message)
    res.status(500).json({ message: error.message });
  }
};

const selectRewardForTroop = async (req, res) => {
  const { id } = req.params;
  const { rewardId, userId, selectedChoice } = req.body;
  try {
    const result = await rewardService.selectRewardForTroop(id,rewardId,userId, selectedChoice);
    console.log('Reward selection is successful:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to select reward',error.message)
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createReward,
  getAllReward,
  updateReward,
  deleteReward,
  selectRewardForTroop
};
