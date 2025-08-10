// 自定义API错误类
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// 常用错误创建函数
const createError = {
  badRequest: (message = '请求参数错误') => new ApiError(400, message),
  unauthorized: (message = '未授权访问') => new ApiError(401, message),
  forbidden: (message = '权限不足') => new ApiError(403, message),
  notFound: (message = '资源不存在') => new ApiError(404, message),
  conflict: (message = '资源冲突') => new ApiError(409, message),
  tooManyRequests: (message = '请求过于频繁') => new ApiError(429, message),
  internal: (message = '服务器内部错误') => new ApiError(500, message)
};

module.exports = {
  ApiError,
  createError
};