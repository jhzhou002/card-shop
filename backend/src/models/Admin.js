module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '管理员用户名'
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
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'operator'),
      allowNull: false,
      defaultValue: 'admin',
      comment: '角色'
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '状态: 1启用 0禁用'
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
    tableName: 'admins',
    timestamps: false
  });

  return Admin;
};