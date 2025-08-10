-- 发卡网系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `card_shop` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `card_shop`;

-- 1. 管理员表
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '管理员用户名',
  `password` varchar(255) NOT NULL COMMENT '密码hash',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `role` enum('super_admin','admin','operator') DEFAULT 'admin' COMMENT '角色',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `last_login_ip` varchar(45) DEFAULT NULL COMMENT '最后登录IP',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 2. 用户表
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码hash',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `balance` decimal(10,2) DEFAULT 0.00 COMMENT '余额',
  `level` enum('普通','会员','高级','特权') DEFAULT '普通' COMMENT '用户等级',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `api_key` varchar(64) DEFAULT NULL COMMENT 'API密钥',
  `total_spent` decimal(10,2) DEFAULT 0.00 COMMENT '累计消费',
  `reg_ip` varchar(45) DEFAULT NULL COMMENT '注册IP',
  `last_login_ip` varchar(45) DEFAULT NULL COMMENT '最后登录IP',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 商品分类表
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `description` text COMMENT '分类描述',
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 4. 商品表
CREATE TABLE `goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `name` varchar(200) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `image` varchar(255) DEFAULT NULL COMMENT '商品图片',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '成本价',
  `stock` int(11) DEFAULT 0 COMMENT '库存数量',
  `sales` int(11) DEFAULT 0 COMMENT '销量',
  `type` enum('virtual','physical') DEFAULT 'virtual' COMMENT '商品类型',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1上架 0下架',
  `is_hot` tinyint(1) DEFAULT 0 COMMENT '是否热门',
  `is_recommend` tinyint(1) DEFAULT 0 COMMENT '是否推荐',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `buy_limit` int(11) DEFAULT 0 COMMENT '购买限制(0不限制)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 5. 卡密表
CREATE TABLE `cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `good_id` int(11) NOT NULL COMMENT '商品ID',
  `card_info` text NOT NULL COMMENT '卡密信息',
  `status` enum('unused','used','expired') DEFAULT 'unused' COMMENT '状态',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `order_id` int(11) DEFAULT NULL COMMENT '订单ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`good_id`) REFERENCES `goods`(`id`) ON DELETE CASCADE,
  INDEX `idx_good_status` (`good_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='卡密表';

-- 6. 订单表
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID(可为空，支持游客下单)',
  `good_id` int(11) NOT NULL COMMENT '商品ID',
  `good_name` varchar(200) NOT NULL COMMENT '商品名称(冗余)',
  `good_price` decimal(10,2) NOT NULL COMMENT '商品价格(冗余)',
  `quantity` int(11) NOT NULL COMMENT '购买数量',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总额',
  `contact_info` varchar(200) DEFAULT NULL COMMENT '联系方式',
  `status` enum('pending','paid','delivered','completed','cancelled','refunded') DEFAULT 'pending' COMMENT '订单状态',
  `pay_method` varchar(50) DEFAULT NULL COMMENT '支付方式',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `deliver_time` datetime DEFAULT NULL COMMENT '发货时间',
  `trade_no` varchar(100) DEFAULT NULL COMMENT '支付流水号',
  `remark` text COMMENT '备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`good_id`) REFERENCES `goods`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_order_no` (`order_no`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 订单详情表(卡密信息)
CREATE TABLE `order_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `card_id` int(11) NOT NULL COMMENT '卡密ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE,
  INDEX `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

-- 8. 支付方式表
CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '支付方式名称',
  `code` varchar(20) NOT NULL UNIQUE COMMENT '支付方式代码',
  `config` json COMMENT '支付配置',
  `fee_rate` decimal(5,4) DEFAULT 0.0000 COMMENT '手续费率',
  `min_amount` decimal(10,2) DEFAULT 0.00 COMMENT '最小金额',
  `max_amount` decimal(10,2) DEFAULT 99999.99 COMMENT '最大金额',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付方式表';

-- 9. 支付记录表
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `payment_no` varchar(50) NOT NULL UNIQUE COMMENT '支付单号',
  `trade_no` varchar(100) DEFAULT NULL COMMENT '第三方交易号',
  `payment_method` varchar(20) NOT NULL COMMENT '支付方式',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `fee` decimal(10,2) DEFAULT 0.00 COMMENT '手续费',
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending' COMMENT '支付状态',
  `callback_data` json COMMENT '回调数据',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_payment_no` (`payment_no`),
  INDEX `idx_trade_no` (`trade_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- 10. 用户余额记录表
CREATE TABLE `balance_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `type` enum('recharge','consume','refund','reward') NOT NULL COMMENT '类型',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `balance_before` decimal(10,2) NOT NULL COMMENT '变动前余额',
  `balance_after` decimal(10,2) NOT NULL COMMENT '变动后余额',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `related_id` int(11) DEFAULT NULL COMMENT '关联ID(订单ID等)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 11. 系统设置表
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) NOT NULL UNIQUE COMMENT '设置键',
  `value` text COMMENT '设置值',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `type` enum('string','number','boolean','json') DEFAULT 'string' COMMENT '数据类型',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- 12. 操作日志表
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_type` enum('admin','user','guest') NOT NULL COMMENT '用户类型',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID',
  `action` varchar(100) NOT NULL COMMENT '操作行为',
  `resource` varchar(100) DEFAULT NULL COMMENT '操作资源',
  `resource_id` int(11) DEFAULT NULL COMMENT '资源ID',
  `ip_address` varchar(45) NOT NULL COMMENT 'IP地址',
  `user_agent` text COMMENT '用户代理',
  `data` json COMMENT '请求数据',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_type`, `user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 13. 文章表
CREATE TABLE `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '文章标题',
  `content` longtext NOT NULL COMMENT '文章内容',
  `summary` text COMMENT '文章摘要',
  `author_id` int(11) DEFAULT NULL COMMENT '作者ID',
  `category` varchar(50) DEFAULT NULL COMMENT '分类',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态: 1发布 0草稿',
  `is_top` tinyint(1) DEFAULT 0 COMMENT '是否置顶',
  `view_count` int(11) DEFAULT 0 COMMENT '浏览次数',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`author_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 插入初始数据
INSERT INTO `admins` (`username`, `password`, `email`, `role`) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'super_admin');

INSERT INTO `categories` (`name`, `description`, `sort_order`) VALUES 
('游戏点卡', '各类游戏充值卡', 1),
('话费充值', '手机话费充值卡', 2),
('视频会员', '各平台视频会员', 3),
('软件授权', '软件许可证', 4);

INSERT INTO `payment_methods` (`name`, `code`, `fee_rate`, `status`, `sort_order`) VALUES
('支付宝', 'alipay', 0.0060, 1, 1),
('微信支付', 'wechat', 0.0060, 1, 2),
('余额支付', 'balance', 0.0000, 1, 3);

INSERT INTO `settings` (`key_name`, `value`, `description`, `type`) VALUES
('site_name', '发卡网系统', '网站名称', 'string'),
('site_description', '专业的虚拟商品发卡平台', '网站描述', 'string'),
('site_keywords', '发卡,虚拟商品,自动发货', '网站关键词', 'string'),
('register_enabled', '1', '是否允许用户注册', 'boolean'),
('guest_buy_enabled', '1', '是否允许游客购买', 'boolean'),
('min_recharge_amount', '1.00', '最小充值金额', 'number'),
('max_recharge_amount', '10000.00', '最大充值金额', 'number');

-- 创建索引
CREATE INDEX idx_orders_created_status ON orders(created_at, status);
CREATE INDEX idx_goods_category_status ON goods(category_id, status);
CREATE INDEX idx_cards_good_status ON cards(good_id, status);