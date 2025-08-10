const { sequelize } = require('../config/database');
const { Order, Good, User, Card, OrderDetail, Payment } = require('../models');
const { ApiError, createError } = require('../utils/errors');
const { generateOrderNo, getPagination, formatPagination } = require('../utils/helpers');
const { logAction } = require('../middleware/logger');

// 创建订单
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { good_id, quantity = 1, contact_info } = req.body;
    const user = req.user;

    if (!good_id) {
      throw createError.badRequest('商品ID不能为空');
    }

    if (quantity <= 0 || quantity > 100) {
      throw createError.badRequest('购买数量必须在1-100之间');
    }

    // 查询商品信息
    const good = await Good.findOne({
      where: { id: good_id, status: 1 },
      transaction
    });

    if (!good) {
      throw createError.notFound('商品不存在或已下架');
    }

    // 检查库存
    const availableCards = await Card.count({
      where: {
        good_id: good_id,
        status: 'unused'
      },
      transaction
    });

    if (availableCards < quantity) {
      throw createError.badRequest(`库存不足，当前可用库存: ${availableCards}`);
    }

    // 检查购买限制
    if (good.buy_limit > 0 && quantity > good.buy_limit) {
      throw createError.badRequest(`超出购买限制，每次最多购买 ${good.buy_limit} 件`);
    }

    // 计算订单金额
    const total_amount = (parseFloat(good.price) * quantity).toFixed(2);

    // 生成订单号
    const order_no = generateOrderNo();

    // 创建订单
    const order = await Order.create({
      order_no,
      user_id: user?.id || null,
      good_id,
      good_name: good.name,
      good_price: good.price,
      quantity,
      total_amount,
      contact_info,
      status: 'pending'
    }, { transaction });

    // 记录操作日志
    await logAction(req, 'create_order', 'order', order.id, {
      order_no,
      good_id,
      quantity,
      total_amount
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: {
        order_no: order.order_no,
        total_amount: order.total_amount,
        created_at: order.created_at
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 获取订单详情
const getOrderDetail = async (req, res, next) => {
  try {
    const { orderNo } = req.params;

    const order = await Order.findOne({
      where: { order_no: orderNo },
      include: [
        {
          model: Good,
          as: 'good',
          attributes: ['id', 'name', 'image', 'description']
        },
        {
          model: OrderDetail,
          as: 'details',
          include: [
            {
              model: Card,
              as: 'card',
              attributes: ['card_info']
            }
          ]
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['payment_method', 'amount', 'status', 'paid_at']
        }
      ]
    });

    if (!order) {
      throw createError.notFound('订单不存在');
    }

    // 只有订单所有者或管理员才能查看完整信息
    let showDetails = false;
    if (req.user && req.user.id === order.user_id) {
      showDetails = true;
    }
    if (req.admin) {
      showDetails = true;
    }

    const result = {
      ...order.toJSON(),
      details: showDetails && order.status === 'completed' ? order.details : null
    };

    // 移除敏感信息
    if (!showDetails) {
      delete result.user_id;
      delete result.contact_info;
    }

    res.json({
      success: true,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户订单列表
const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const user = req.user;

    const { offset, limit: queryLimit } = getPagination(page, limit);

    const where = { user_id: user.id };
    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Good,
          as: 'good',
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: queryLimit
    });

    const result = formatPagination(orders, page, queryLimit);

    res.json({
      success: true,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderDetail,
  getUserOrders
};