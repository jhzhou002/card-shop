const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

// 上传图片（需要管理员权限）
router.post('/image', auth('admin'), uploadController.uploadImage);

module.exports = router;