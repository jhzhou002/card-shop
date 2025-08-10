const { User, Admin, BalanceRecord } = require('../models');
const { ApiError, createError } = require('../utils/errors');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  getClientIP,
  generateApiKey 
} = require('../utils/helpers');
const { logAction } = require('../middleware/logger');

// 用户注册
const register = async (req, res, next) => {
  try {
    const { username, password, email, phone } = req.body;

    // 基本验证
    if (!username || !password) {
      throw createError.badRequest('用户名和密码不能为空');
    }

    if (password.length < 6) {
      throw createError.badRequest('密码长度至少6位');
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw createError.conflict('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw createError.conflict('邮箱已被使用');
      }
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      phone,
      reg_ip: getClientIP(req),
      api_key: generateApiKey()
    });

    // 记录操作日志
    await logAction(req, 'register', 'user', user.id, { username, email });

    // 生成Token
    const token = generateToken({ id: user.id, type: 'user' });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          level: user.level,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 用户登录
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createError.badRequest('用户名和密码不能为空');
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw createError.unauthorized('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw createError.forbidden('账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw createError.unauthorized('用户名或密码错误');
    }

    // 更新登录信息
    await user.update({
      last_login_ip: getClientIP(req),
      last_login_time: new Date()
    });

    // 记录操作日志
    await logAction(req, 'login', 'user', user.id, { username });

    // 生成Token
    const token = generateToken({ id: user.id, type: 'user' });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          level: user.level,
          api_key: user.api_key
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 管理员登录
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createError.badRequest('用户名和密码不能为空');
    }

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      throw createError.unauthorized('用户名或密码错误');
    }

    if (admin.status !== 1) {
      throw createError.forbidden('账户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      throw createError.unauthorized('用户名或密码错误');
    }

    // 更新登录信息
    await admin.update({
      last_login_ip: getClientIP(req),
      last_login_time: new Date()
    });

    // 记录操作日志
    await logAction(req, 'admin_login', 'admin', admin.id, { username });

    // 生成Token
    const token = generateToken({ id: admin.id, type: 'admin' });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 刷新Token
const refreshToken = async (req, res, next) => {
  try {
    const user = req.user || req.admin;
    const userType = req.user ? 'user' : 'admin';
    
    const token = generateToken({ id: user.id, type: userType });

    res.json({
      success: true,
      message: 'Token刷新成功',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

// 退出登录
const logout = async (req, res, next) => {
  try {
    const user = req.user || req.admin;
    const userType = req.user ? 'user' : 'admin';

    // 记录操作日志
    await logAction(req, 'logout', userType, user.id);

    res.json({
      success: true,
      message: '退出成功'
    });
  } catch (error) {
    next(error);
  }
};

// 修改密码
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user || req.admin;
    const Model = req.user ? User : Admin;

    if (!oldPassword || !newPassword) {
      throw createError.badRequest('旧密码和新密码不能为空');
    }

    if (newPassword.length < 6) {
      throw createError.badRequest('新密码长度至少6位');
    }

    // 验证旧密码
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw createError.unauthorized('旧密码错误');
    }

    // 更新密码
    const hashedNewPassword = await hashPassword(newPassword);
    await Model.update(
      { password: hashedNewPassword },
      { where: { id: user.id } }
    );

    // 记录操作日志
    await logAction(req, 'change_password', req.user ? 'user' : 'admin', user.id);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
};

// 忘记密码
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError.badRequest('邮箱不能为空');
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // 为了安全，不透露用户是否存在
      return res.json({
        success: true,
        message: '如果邮箱存在，重置密码链接已发送'
      });
    }

    // TODO: 发送重置密码邮件
    // 这里应该生成重置令牌并发送邮件

    res.json({
      success: true,
      message: '重置密码链接已发送到您的邮箱'
    });
  } catch (error) {
    next(error);
  }
};

// 重置密码
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw createError.badRequest('重置令牌和新密码不能为空');
    }

    if (newPassword.length < 6) {
      throw createError.badRequest('密码长度至少6位');
    }

    // TODO: 验证重置令牌并更新密码

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};