const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');
const { ApiError } = require('../utils/errors');

// JWT认证中间件
const auth = (userType = 'user') => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new ApiError(401, '未提供认证令牌');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user;
      if (userType === 'admin') {
        user = await Admin.findByPk(decoded.id);
        if (!user || user.status !== 1) {
          throw new ApiError(401, '管理员账户无效或已被禁用');
        }
        req.admin = user;
      } else {
        user = await User.findByPk(decoded.id);
        if (!user || user.status !== 1) {
          throw new ApiError(401, '用户账户无效或已被禁用');
        }
        req.user = user;
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError(401, '无效的认证令牌'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError(401, '认证令牌已过期'));
      }
      next(error);
    }
  };
};

// 可选认证中间件（登录用户和游客都可以访问）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.status === 1) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败不影响请求继续
    next();
  }
};

// 角色权限检查
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new ApiError(401, '需要管理员权限'));
    }

    if (typeof roles === 'string') {
      roles = [roles];
    }

    if (!roles.includes(req.admin.role)) {
      return next(new ApiError(403, '权限不足'));
    }

    next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  checkRole
};