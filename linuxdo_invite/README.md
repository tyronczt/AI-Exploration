# 邀请码管理系统

一个简单的邀请码申请与管理系统。

## 功能特性

### 用户端
- 填写微信名
- 勾选申请条件（关注公众号3天以上、点赞数超过7个）
- 图形验证码校验
- 提交后显示提示信息

### 管理员端
- 密码登录验证
- 申请记录管理（分页展示、编辑状态/备注/邀请日期、删除）
- 邀请码库存管理（添加、编辑状态、删除）
- 数据脱敏展示（微信名前1后1明文，邀请码前2后2明文）

## 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Node.js + Express
- 数据库：MySQL
- 验证码：svg-captcha

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

复制 `.env.example` 为 `.env`（如果不存在），或直接编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=linuxdo_invite
ADMIN_PASSWORD=your_password
SESSION_SECRET=your_session_secret
PORT=3000
```

### 3. 初始化数据库

```bash
npm run db:init
```

### 4. 启动服务

```bash
npm start
```

访问 http://localhost:3000

## 默认管理员密码

`your_password`（可在 `.env` 中修改）

## 目录结构

```
├── public/              # 前端静态文件
│   ├── index.html       # 用户申请页面
│   ├── login.html       # 管理员登录页面
│   ├── admin.html       # 管理员后台
│   ├── apply.js         # 用户申请逻辑
│   ├── admin.js         # 管理员后台逻辑
│   └── styles.css       # 样式文件
├── src/
│   ├── server.js        # Express 服务器入口
│   ├── db/
│   │   ├── connection.js  # 数据库连接池
│   │   └── init.js        # 数据库初始化脚本
│   └── routes/
│       └── api.js       # API 路由
├── package.json
├── .env
└── README.md
```

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/captcha | 获取图形验证码 |
| POST | /api/apply | 提交申请 |
| POST | /api/verify | 验证邀请码 |

### 管理员接口（需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/login | 登录 |
| POST | /api/admin/logout | 登出 |
| GET | /api/admin/check | 检查登录状态 |
| GET | /api/admin/applications | 获取申请记录（分页） |
| PUT | /api/admin/applications/:id | 更新申请记录 |
| DELETE | /api/admin/applications/:id | 删除申请记录 |
| GET | /api/admin/codes | 获取邀请码列表（分页） |
| POST | /api/admin/codes | 添加邀请码 |
| PUT | /api/admin/codes/:id | 更新邀请码 |
| DELETE | /api/admin/codes/:id | 删除邀请码 |
