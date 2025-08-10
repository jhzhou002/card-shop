const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成随机字符串
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 生成订单号
const generateOrderNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${timestamp}${random}`;
};

// 生成支付单号
const generatePaymentNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PAY${timestamp}${random}`;
};

// 生成JWT Token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// 密码加密
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 分页参数处理
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

// 分页数据格式化
const formatPagination = (data, page, limit) => {
  const { count: total, rows } = data;
  const totalPages = Math.ceil(total / limit);
  
  return {
    rows,
    pagination: {
      current: parseInt(page),
      pageSize: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// IP地址获取
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// 数据脱敏
const maskSensitiveData = (data, fields = []) => {
  const masked = { ...data };
  fields.forEach(field => {
    if (masked[field]) {
      const value = masked[field].toString();
      if (value.length <= 4) {
        masked[field] = '****';
      } else {
        masked[field] = value.substring(0, 2) + '****' + value.substring(value.length - 2);
      }
    }
  });
  return masked;
};

// 金额格式化（分转元）
const formatAmount = (amount) => {
  return (amount / 100).toFixed(2);
};

// 金额转换（元转分）
const parseAmount = (amount) => {
  return Math.round(parseFloat(amount) * 100);
};

// 延迟函数
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成API Key
const generateApiKey = () => {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateRandomString,
  generateOrderNo,
  generatePaymentNo,
  generateToken,
  hashPassword,
  comparePassword,
  getPagination,
  formatPagination,
  getClientIP,
  maskSensitiveData,
  formatAmount,
  parseAmount,
  sleep,
  generateApiKey
};