# 发卡网系统 (Card Shop System)

基于 Vue 3 + Node.js + MySQL 开发的现代化发卡网系统

## 技术栈

### 前端
- Vue 3
- Vite
- Element Plus
- Vue Router
- Pinia
- Axios

### 后端
- Node.js
- Express
- Sequelize ORM
- JWT
- bcrypt
- MySQL

## 项目结构

```
card-shop-system/
├── frontend/          # Vue前端项目
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── views/      # 页面
│   │   ├── router/     # 路由
│   │   ├── stores/     # 状态管理
│   │   ├── api/        # API接口
│   │   └── utils/      # 工具函数
│   └── package.json
├── backend/           # Node.js后端项目
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── models/     # 数据模型
│   │   ├── routes/     # 路由
│   │   ├── middleware/ # 中间件
│   │   ├── utils/      # 工具函数
│   │   └── config/     # 配置文件
│   └── package.json
├── database/          # 数据库脚本
│   └── init.sql
└── docs/             # 文档
```

## 功能模块

1. **用户系统**
   - 用户注册/登录
   - 用户等级管理
   - 余额管理

2. **商品系统**
   - 商品分类管理
   - 商品管理
   - 库存管理

3. **订单系统**
   - 订单创建
   - 订单查询
   - 自动发货

4. **支付系统**
   - 支付宝/微信支付
   - 余额支付
   - 支付回调处理

5. **后台管理**
   - 管理员登录
   - 数据统计
   - 系统设置

## 快速开始

### 环境要求
- Node.js >= 16
- MySQL >= 8.0
- Redis (可选)

### 安装依赖

后端:
```bash
cd backend
npm install
```

前端:
```bash
cd frontend
npm install
```

### 配置数据库

1. 创建MySQL数据库
2. 导入 `database/init.sql`
3. 修改后端配置文件

### 运行项目

后端:
```bash
cd backend
npm run dev
```

前端:
```bash
cd frontend
npm run dev
```

## License

MIT