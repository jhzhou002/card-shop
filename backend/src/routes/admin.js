const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, checkRole } = require('../middleware/auth');

// 所有路由都需要管理员认证
router.use(auth('admin'));

// 获取管理员信息
router.get('/profile', adminController.getProfile);

// 统计数据
router.get('/stats', adminController.getStats);

// 商品管理
router.get('/goods', adminController.getGoods);
router.post('/goods', checkRole(['super_admin', 'admin']), adminController.createGood);
router.put('/goods/:id', checkRole(['super_admin', 'admin']), adminController.updateGood);
router.delete('/goods/:id', checkRole(['super_admin', 'admin']), adminController.deleteGood);

// 订单管理
router.get('/orders', adminController.getOrders);
router.put('/orders/:id', adminController.updateOrder);

// 用户管理
router.get('/users', checkRole(['super_admin', 'admin']), adminController.getUsers);
router.put('/users/:id', checkRole(['super_admin', 'admin']), adminController.updateUser);

// 分类管理
router.get('/categories', adminController.getCategories);
router.post('/categories', checkRole(['super_admin', 'admin']), adminController.createCategory);
router.put('/categories/:id', checkRole(['super_admin', 'admin']), adminController.updateCategory);
router.delete('/categories/:id', checkRole(['super_admin', 'admin']), adminController.deleteCategory);

// 卡密管理
router.get('/cards', adminController.getCards);
router.post('/cards', adminController.importCards);
router.delete('/cards/:id', adminController.deleteCard);

// 系统日志
router.get('/logs', checkRole(['super_admin', 'admin']), adminController.getLogs);

module.exports = router;