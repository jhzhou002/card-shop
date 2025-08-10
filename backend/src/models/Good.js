module.exports = (sequelize, DataTypes) => {
  const Good = sequelize.define('Good', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '商品描述'
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '商品图片'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '成本价'
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '库存数量'
    },
    sales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '销量'
    },
    type: {
      type: DataTypes.ENUM('virtual', 'physical'),
      allowNull: false,
      defaultValue: 'virtual',
      comment: '商品类型'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '状态: 1上架 0下架'
    },
    is_hot: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否热门'
    },
    is_recommend: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: '是否推荐'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    buy_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '购买限制(0不限制)'
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
    tableName: 'goods',
    timestamps: false,
    indexes: [
      {
        fields: ['category_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['category_id', 'status']
      }
    ]
  });

  return Good;
};