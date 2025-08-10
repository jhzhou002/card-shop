const { Category, Good } = require('../models');
const { createError } = require('../utils/errors');
const { getPagination, formatPagination } = require('../utils/helpers');

// 获取分类列表
const getCategories = async (req, res, next) => {
  try {
    const { status = 1 } = req.query;

    const categories = await Category.findAll({
      where: { status },
      attributes: ['id', 'name', 'description', 'icon', 'sort_order'],
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    });

    // 获取每个分类下的商品数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const goodCount = await Good.count({
          where: {
            category_id: category.id,
            status: 1
          }
        });

        return {
          ...category.toJSON(),
          goods_count: goodCount
        };
      })
    );

    res.json({
      success: true,
      message: '获取成功',
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// 获取分类详情
const getCategoryDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, status: 1 },
      attributes: ['id', 'name', 'description', 'icon']
    });

    if (!category) {
      throw createError.notFound('分类不存在');
    }

    // 获取分类下的商品数量
    const goodCount = await Good.count({
      where: {
        category_id: id,
        status: 1
      }
    });

    const result = {
      ...category.toJSON(),
      goods_count: goodCount
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

// 获取分类下的商品
const getCategoryGoods = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'sort_order' } = req.query;

    // 验证分类是否存在
    const category = await Category.findOne({
      where: { id, status: 1 }
    });

    if (!category) {
      throw createError.notFound('分类不存在');
    }

    const { offset, limit: queryLimit } = getPagination(page, limit);

    // 排序
    let order = [['sort_order', 'ASC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'sales') order = [['sales', 'DESC']];
    else if (sort === 'created_at') order = [['created_at', 'DESC']];

    const goods = await Good.findAndCountAll({
      where: {
        category_id: id,
        status: 1
      },
      attributes: {
        exclude: ['cost_price']
      },
      order,
      offset,
      limit: queryLimit
    });

    const result = formatPagination(goods, page, queryLimit);

    res.json({
      success: true,
      message: '获取成功',
      data: {
        category: {
          id: category.id,
          name: category.name,
          description: category.description
        },
        goods: result
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryDetail,
  getCategoryGoods
};