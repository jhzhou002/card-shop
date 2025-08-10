const express = require('express');
const router = express.Router();

// 导入路由模块
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const goodRoutes = require('./goods');
const orderRoutes = require('./orders');
const categoryRoutes = require('./categories');
const paymentRoutes = require('./payments');
const uploadRoutes = require('./upload');
const settingRoutes = require('./settings');

// 公共路由（不需要认证）
router.use('/auth', authRoutes);
router.use('/goods', goodRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);

// 用户路由（需要用户认证）
router.use('/user', userRoutes);

// 管理员路由（需要管理员认证）
router.use('/admin', adminRoutes);

// 系统设置路由
router.use('/settings', settingRoutes);

// API状态检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;