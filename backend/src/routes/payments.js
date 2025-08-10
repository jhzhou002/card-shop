const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 获取支付方式列表
router.get('/methods', paymentController.getMethods);

// 创建支付订单
router.post('/create', paymentController.createPayment);

// 查询支付状态
router.get('/status/:payment_no', paymentController.getPaymentStatus);

// 微信支付页面
router.get('/wechat/:payment_no', paymentController.wechatPaymentPage);

// 支付宝支付页面  
router.get('/alipay/:payment_no', paymentController.alipayPaymentPage);

// 支付回调
router.post('/notify', paymentController.handleNotify);

module.exports = router;