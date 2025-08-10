const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// 所有路由都需要用户认证
router.use(auth('user'));

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 获取余额变动记录
router.get('/balance-records', userController.getBalanceRecords);

// 余额充值
router.post('/recharge', userController.recharge);

module.exports = router;