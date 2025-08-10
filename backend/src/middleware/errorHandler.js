const { ApiError } = require('../utils/errors');

// 404错误处理
const notFound = (req, res, next) => {
  const error = new ApiError(404, `接口 ${req.originalUrl} 不存在`);
  next(error);
};

// 全局错误处理
const errorHandler = (err, req, res, next) => {
  let error = err;

  // 处理Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new ApiError(400, `数据验证失败: ${message}`);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => `${e.path} 已存在`).join(', ');
    error = new ApiError(400, message);
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ApiError(400, '关联数据不存在');
  } else if (err.name === 'SequelizeDatabaseError') {
    error = new ApiError(500, '数据库操作失败');
  }

  // 非ApiError的其他错误
  if (!(error instanceof ApiError)) {
    error = new ApiError(500, '服务器内部错误');
  }

  // 记录错误日志
  if (error.statusCode >= 500) {
    console.error('Server Error:', {
      message: error.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.statusCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

module.exports = {
  notFound,
  errorHandler
};