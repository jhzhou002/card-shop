const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/login', authController.login);

// 管理员登录
router.post('/admin/login', authController.adminLogin);

// 刷新Token
router.post('/refresh', auth(), authController.refreshToken);

// 退出登录
router.post('/logout', auth(), authController.logout);

// 修改密码
router.put('/password', auth(), authController.changePassword);

// 忘记密码
router.post('/forgot-password', authController.forgotPassword);

// 重置密码
router.post('/reset-password', authController.resetPassword);

module.exports = router;