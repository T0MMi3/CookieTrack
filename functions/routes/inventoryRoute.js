const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const router = express.Router();
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');



router.post('/parentInventory', requireLogin, inventoryController.createParentInventory);
router.post('/leaderInventory', requireLogin, checkRole(['leader']), inventoryController.createLeaderInventory);
router.post('/trooperInventory', requireLogin, inventoryController.createTrooperInventory);
router.put('/parentInventory/:id',requireLogin,inventoryController.updateParentInventory);
router.put('/leaderInventory',requireLogin, checkRole(['leader']), inventoryController.updateLeaderInventory);
router.put('/trooperInventory/:id',requireLogin,  inventoryController.updateTrooperInventory);
router.put('/trooperCookie/:trooperId',requireLogin,  inventoryController.updateTrooperCookie);
router.get('/inventories', requireLogin, checkRole(['leader']),  inventoryController.getAllInventories);
router.get('/leaderInventory',requireLogin,  inventoryController.getLeaderInventory);
router.get('/inventory/:id', requireLogin, inventoryController.getInventoryByOwnerId);
router.delete('/inventory/:id',requireLogin, checkRole(['leader']), inventoryController.deleteInventory);

module.exports = router;