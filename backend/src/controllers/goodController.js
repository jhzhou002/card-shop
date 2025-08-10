const { Op } = require('sequelize');
const { Good, Category, Card } = require('../models');
const { ApiError, createError } = require('../utils/errors');
const { getPagination, formatPagination } = require('../utils/helpers');

// 获取商品列表
const getGoods = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category_id, 
      status = 1,
      is_hot,
      is_recommend,
      sort = 'sort_order'
    } = req.query;

    const { offset, limit: queryLimit } = getPagination(page, limit);
    
    // 构建查询条件
    const where = { status };
    if (category_id) where.category_id = category_id;
    if (is_hot !== undefined) where.is_hot = is_hot;
    if (is_recommend !== undefined) where.is_recommend = is_recommend;

    // 排序
    let order = [['sort_order', 'ASC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'sales') order = [['sales', 'DESC']];
    else if (sort === 'created_at') order = [['created_at', 'DESC']];

    const goods = await Good.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['cost_price'] // 不返回成本价
      },
      order,
      offset,
      limit: queryLimit
    });

    const result = formatPagination(goods, page, queryLimit);

    res.json({
      success: true,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 获取商品详情
const getGoodDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const good = await Good.findOne({
      where: { id, status: 1 },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['cost_price'] // 不返回成本价
      }
    });

    if (!good) {
      throw createError.notFound('商品不存在');
    }

    // 获取库存数量（可用卡密数量）
    const availableStock = await Card.count({
      where: {
        good_id: id,
        status: 'unused'
      }
    });

    const result = {
      ...good.toJSON(),
      available_stock: availableStock
    };

    res.json({
      success: true,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 获取热门商品
const getHotGoods = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const goods = await Good.findAll({
      where: {
        status: 1,
        is_hot: 1
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['cost_price']
      },
      order: [['sort_order', 'ASC'], ['sales', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: '获取成功',
      data: goods
    });
  } catch (error) {
    next(error);
  }
};

// 获取推荐商品
const getRecommendGoods = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const goods = await Good.findAll({
      where: {
        status: 1,
        is_recommend: 1
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['cost_price']
      },
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: '获取成功',
      data: goods
    });
  } catch (error) {
    next(error);
  }
};

// 搜索商品
const searchGoods = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!keyword || keyword.trim().length === 0) {
      throw createError.badRequest('搜索关键词不能为空');
    }

    const { offset, limit: queryLimit } = getPagination(page, limit);

    const goods = await Good.findAndCountAll({
      where: {
        status: 1,
        [Op.or]: [
          { name: { [Op.like]: `%${keyword.trim()}%` } },
          { description: { [Op.like]: `%${keyword.trim()}%` } }
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['cost_price']
      },
      order: [['sales', 'DESC'], ['sort_order', 'ASC']],
      offset,
      limit: queryLimit
    });

    const result = formatPagination(goods, page, queryLimit);

    res.json({
      success: true,
      message: '搜索成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoods,
  getGoodDetail,
  getHotGoods,
  getRecommendGoods,
  searchGoods
};