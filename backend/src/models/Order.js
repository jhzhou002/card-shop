module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID(可为空，支持游客下单)'
    },
    good_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    good_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称(冗余)'
    },
    good_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '商品价格(冗余)'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '购买数量'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '订单总额'
    },
    contact_info: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '联系方式'
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'delivered', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '订单状态'
    },
    pay_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '支付方式'
    },
    pay_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '支付时间'
    },
    deliver_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发货时间'
    },
    trade_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '支付流水号'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['order_no']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['created_at', 'status']
      }
    ]
  });

  return Order;
};