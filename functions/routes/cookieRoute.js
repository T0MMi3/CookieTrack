const express = require('express');
const cookieController = require('../controllers/cookieController');
const router = express.Router();
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');


router.post('/cookie', requireLogin,  checkRole(['leader']),cookieController.createCookie);
router.get('/cookie',  requireLogin,  checkRole(['leader']),cookieController.getAllCookie);
//router.get('/cookies', cookieController.getMonthlyCookies);
router.put('/cookie/:id', requireLogin, checkRole(['leader']), cookieController.updateCookie);
router.delete('/cookie/:id', requireLogin, checkRole(['leader']), cookieController.deleteCookie);
//router.post('/cookieManager', cookieController.createCookie);

module.exports = router;
