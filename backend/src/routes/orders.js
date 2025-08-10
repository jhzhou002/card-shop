const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, optionalAuth } = require('../middleware/auth');

// 创建订单
router.post('/', optionalAuth, orderController.createOrder);

// 查询订单详情
router.get('/:orderNo', orderController.getOrderDetail);

// 获取用户订单列表
router.get('/user/list', auth(), orderController.getUserOrders);

module.exports = router;