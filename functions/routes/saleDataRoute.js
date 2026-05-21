const express = require('express');
const saleDataController = require('../controllers/saleDataController');
const router = express.Router();
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');



router.post('/saleData', requireLogin,  saleDataController.createSaleData);
router.get('/saleData/:id',requireLogin, saleDataController.getSaleData);
router.put('/saleData/:id', requireLogin, saleDataController.updateSaleData);
router.delete('/saleData/:id',requireLogin,  saleDataController.deleteSaleData);
router.get('/saleDataTrooperId/:id', requireLogin,  saleDataController.getSaleDatasByTrooperId);
router.get('/saleDataOwnerId/:id',requireLogin,   saleDataController.getSaleDataByOwnerId);
router.get('/saleDatas', requireLogin, saleDataController.getAllSaleData);






module.exports = router;
