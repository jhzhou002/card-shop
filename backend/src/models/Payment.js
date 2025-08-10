module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    payment_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '支付单号'
    },
    trade_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '第三方交易号'
    },
    payment_method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '支付方式'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '支付金额'
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: '手续费'
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '支付状态'
    },
    callback_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '回调数据'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '支付时间'
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
    tableName: 'payments',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['payment_no']
      },
      {
        fields: ['trade_no']
      }
    ]
  });

  return Payment;
};