module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    good_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    card_info: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '卡密信息'
    },
    status: {
      type: DataTypes.ENUM('unused', 'used', 'expired'),
      allowNull: false,
      defaultValue: 'unused',
      comment: '状态'
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '使用时间'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '订单ID'
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
    tableName: 'cards',
    timestamps: false,
    indexes: [
      {
        fields: ['good_id', 'status']
      }
    ]
  });

  return Card;
};