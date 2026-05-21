const express = require('express');
const sharedController = require('../controllers/documentController');
const router = express.Router();
const upload = require('../utils/fileUpload'); 
const { requireLogin, checkRole, checkUserOwnership } = require('../utils/roleCheck');

router.post('/document/:id',  requireLogin, upload.single('file'), sharedController.uploadDocument);
router.post('/profilePic/:id', requireLogin, upload.single('file'), sharedController.uploadProfilePic);
router.post('/rewardImg/:id', requireLogin, upload.single('file'), sharedController.uploadRewardImg);
router.delete('/document/:id', requireLogin, sharedController.deleteDocument);
router.delete('/rewardImg/:id', requireLogin, sharedController.deleteReward);
router.post('/documentMeta/:id', requireLogin, sharedController.saveDocumentMeta);
router.post('/profilePicMeta/:id', requireLogin, sharedController.saveProfilePicMeta);
router.post('/rewardImgMeta/:id', requireLogin, sharedController.saveRewardImgMeta);

module.exports = router;
