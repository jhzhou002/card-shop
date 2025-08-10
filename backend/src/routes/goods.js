const express = require('express');
const router = express.Router();
const goodController = require('../controllers/goodController');
const { auth, optionalAuth } = require('../middleware/auth');

// 获取商品列表（支持分页、筛选）
router.get('/', optionalAuth, goodController.getGoods);

// 获取商品详情
router.get('/:id', optionalAuth, goodController.getGoodDetail);

// 获取热门商品
router.get('/hot/list', goodController.getHotGoods);

// 获取推荐商品
router.get('/recommend/list', goodController.getRecommendGoods);

// 搜索商品
router.get('/search/:keyword', goodController.searchGoods);

module.exports = router;