const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// 获取公开设置（网站信息等）
router.get('/public', settingController.getPublicSettings);

module.exports = router;