const express = require('express');
const router = express.Router();
const trooperController = require('../controllers/trooperController');
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');

router.post('/trooper', requireLogin, trooperController.createTrooper);
router.get('/troopers', requireLogin, checkRole(['leader']), trooperController.getAllTroopers);
router.get('/troopers/:id',requireLogin,  trooperController.getTrooperById);
router.put('/trooper/:id',requireLogin,  trooperController.updateTrooper);
router.delete('/trooper/:id',requireLogin, trooperController.deleteTrooper);
router.get('/troopersOwnerId/:id',requireLogin,  trooperController.getAllTroopersByOwnerId);


module.exports = router;