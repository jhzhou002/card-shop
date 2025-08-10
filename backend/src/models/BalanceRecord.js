module.exports = (sequelize, DataTypes) => {
  const BalanceRecord = sequelize.define('BalanceRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    type: {
      type: DataTypes.ENUM('recharge', 'consume', 'refund', 'reward'),
      allowNull: false,
      comment: '类型'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '金额'
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动前余额'
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动后余额'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述'
    },
    related_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联ID(订单ID等)'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'balance_records',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      }
    ]
  });

  return BalanceRecord;
};