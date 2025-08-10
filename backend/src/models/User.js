module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码hash'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: '余额'
    },
    level: {
      type: DataTypes.ENUM('普通', '会员', '高级', '特权'),
      allowNull: false,
      defaultValue: '普通',
      comment: '用户等级'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '状态: 1正常 0禁用'
    },
    api_key: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'API密钥'
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: '累计消费'
    },
    reg_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '注册IP'
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '最后登录IP'
    },
    last_login_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
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
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        fields: ['username']
      },
      {
        fields: ['email']
      }
    ]
  });

  return User;
};