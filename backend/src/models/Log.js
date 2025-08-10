module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_type: {
      type: DataTypes.ENUM('admin', 'user', 'guest'),
      allowNull: false,
      comment: '用户类型'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作行为'
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '操作资源'
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '资源ID'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: 'IP地址'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '用户代理'
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '请求数据'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'logs',
    timestamps: false,
    indexes: [
      {
        fields: ['user_type', 'user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Log;
};