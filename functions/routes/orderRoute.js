const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');


router.post('/order', requireLogin, orderController.createOrder);
router.get('/order', requireLogin, checkRole(['leader']), orderController.getAllOrders);
router.put('/order/:id',requireLogin, orderController.updateOrder);
router.put('/orderPayment/:id',requireLogin, orderController.updateOrderPaidAmount);
router.delete('/order/:id', requireLogin, orderController.deleteOrder);
router.get('/ordersTrooper/:id',requireLogin, orderController.getOrdersByTrooperId);
router.put('/orderComplete/:id',requireLogin,  orderController.markOrderComplete);
router.get('/ordersOwner/:id',requireLogin,orderController.getOrdersByOwnerId);
router.put('/orderComplete/:id',requireLogin, orderController.markOrderComplete);
router.put('/orderPickup/:id',requireLogin,  orderController.parentPickup);
router.put('/archiveOrders',requireLogin, checkRole(['leader']),  orderController.archiveOrders);
router.put('/updateNeedToOrder/:varietyId', requireLogin, checkRole(['leader']), orderController.updateNeedToOrder);

module.exports = router;
