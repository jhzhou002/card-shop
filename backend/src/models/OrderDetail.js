module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define('OrderDetail', {
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
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '卡密ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'order_details',
    timestamps: false,
    indexes: [
      {
        fields: ['order_id']
      }
    ]
  });

  return OrderDetail;
};