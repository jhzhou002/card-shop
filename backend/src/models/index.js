const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 导入所有模型
const Admin = require('./Admin')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Good = require('./Good')(sequelize, DataTypes);
const Card = require('./Card')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderDetail = require('./OrderDetail')(sequelize, DataTypes);
const PaymentMethod = require('./PaymentMethod')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const BalanceRecord = require('./BalanceRecord')(sequelize, DataTypes);
const Setting = require('./Setting')(sequelize, DataTypes);
const Log = require('./Log')(sequelize, DataTypes);
const Article = require('./Article')(sequelize, DataTypes);

// 定义关联关系
// 分类与商品 (一对多)
Category.hasMany(Good, { foreignKey: 'category_id', as: 'goods' });
Good.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 商品与卡密 (一对多)
Good.hasMany(Card, { foreignKey: 'good_id', as: 'cards' });
Card.belongsTo(Good, { foreignKey: 'good_id', as: 'good' });

// 用户与订单 (一对多)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 商品与订单 (一对多)
Good.hasMany(Order, { foreignKey: 'good_id', as: 'orders' });
Order.belongsTo(Good, { foreignKey: 'good_id', as: 'good' });

// 订单与订单详情 (一对多)
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 卡密与订单详情 (一对多)
Card.hasMany(OrderDetail, { foreignKey: 'card_id', as: 'orderDetails' });
OrderDetail.belongsTo(Card, { foreignKey: 'card_id', as: 'card' });

// 订单与支付记录 (一对多)
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 用户与余额记录 (一对多)
User.hasMany(BalanceRecord, { foreignKey: 'user_id', as: 'balanceRecords' });
BalanceRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 管理员与文章 (一对多)
Admin.hasMany(Article, { foreignKey: 'author_id', as: 'articles' });
Article.belongsTo(Admin, { foreignKey: 'author_id', as: 'author' });

module.exports = {
  sequelize,
  Admin,
  User,
  Category,
  Good,
  Card,
  Order,
  OrderDetail,
  PaymentMethod,
  Payment,
  BalanceRecord,
  Setting,
  Log,
  Article
};