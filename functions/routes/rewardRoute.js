const express = require('express');
const rewardController = require('../controllers/rewardController');
const router = express.Router();
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');

router.post('/reward', requireLogin, checkRole(['leader']), rewardController.createReward);
router.get('/reward',requireLogin, rewardController.getAllReward);
router.put('/reward/:id',requireLogin, checkRole(['leader']), rewardController.updateReward);
router.delete('/reward/:id',requireLogin, checkRole(['leader']), rewardController.deleteReward);
router.post('/selectReward/:id',requireLogin, rewardController.selectRewardForTroop);



module.exports = router;
