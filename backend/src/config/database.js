const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建Sequelize实例
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'card_shop',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    // 默认配置
    timestamps: false, // 由于我们在SQL中手动定义了created_at和updated_at
    underscored: true, // 使用下划线命名
    freezeTableName: true, // 不要复数化表名
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接已建立');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

module.exports = {
  sequelize,
  testConnection
};