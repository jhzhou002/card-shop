const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 获取分类列表
router.get('/', categoryController.getCategories);

// 获取分类详情
router.get('/:id', categoryController.getCategoryDetail);

// 获取分类下的商品
router.get('/:id/goods', categoryController.getCategoryGoods);

module.exports = router;