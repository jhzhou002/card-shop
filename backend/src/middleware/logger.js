const { Log } = require('../models');

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求开始时间
  req.startTime = startTime;
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // 只在开发环境输出请求日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
};

// 操作日志记录
const logAction = async (req, action, resource = null, resourceId = null, data = null) => {
  try {
    const logData = {
      user_type: req.admin ? 'admin' : (req.user ? 'user' : 'guest'),
      user_id: req.admin?.id || req.user?.id || null,
      action,
      resource,
      resource_id: resourceId,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      data: data ? JSON.stringify(data) : null
    };

    await Log.create(logData);
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
};

module.exports = {
  requestLogger,
  logAction
};