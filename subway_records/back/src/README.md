# 地铁打卡记录小程序后端服务（MySQL版）

## 项目概述

这是地铁打卡记录小程序的后端服务。

## 技术栈

- Node.js
- Express.js
- MySQL (使用Sequelize ORM)
- JWT认证

## 环境要求

- Node.js >= 14
- MySQL >= 5.7

## 安装依赖

```bash
npm install
```

## 数据库配置

1. 创建MySQL数据库：

```sql
CREATE DATABASE subway_checkin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 复制 `.env.example` 文件为 `.env` 并配置数据库连接：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的MySQL连接信息：

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=subway_checkin
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-jwt-secret-key
```

3. 初始化数据库表：

```sql
-- 执行 mysql-schema.sql 文件中的SQL语句
mysql -u root -p subway_checkin < mysql-schema.sql
```

## 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API端点

- `POST /api/users/login` - 微信登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/stats` - 获取用户统计信息

- `GET /api/stations` - 获取站点列表
- `GET /api/stations/:id` - 获取站点详情
- `GET /api/stations/nearby` - 获取附近站点
- `GET /api/stations/search` - 搜索站点
- `GET /api/stations/popular` - 获取热门站点

- `POST /api/checkins` - 创建打卡记录
- `GET /api/checkins` - 获取用户的打卡记录
- `GET /api/checkins/:id` - 获取单条打卡记录
- `PUT /api/checkins/:id` - 更新打卡记录
- `DELETE /api/checkins/:id` - 删除打卡记录

- `GET /api/analysis` - 获取用户分析数据
- `GET /api/analysis/trend` - 获取通勤时间趋势
- `GET /api/analysis/suggestions` - 获取出行建议

## 数据库结构

### 主要表

- `users` - 用户表
- `stations` - 地铁站表
- `checkins` - 打卡记录表
- `achievements` - 成就表
- `user_preferred_stations` - 用户偏好站点关联表
- `user_achievements` - 用户成就关联表

### 视图

- `user_stats` - 用户统计视图
- `station_stats` - 站点统计视图