-- 创建数据库
CREATE DATABASE IF NOT EXISTS english_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_learning;

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    level_id BIGINT DEFAULT 1 COMMENT '用户等级',
    total_points INT DEFAULT 0 COMMENT '总积分',
    current_streak INT DEFAULT 0 COMMENT '连续学习天数',
    max_streak INT DEFAULT 0 COMMENT '最大连续学习天数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    -- 微信登录相关字段
    openid VARCHAR(100) UNIQUE COMMENT '微信用户唯一标识',
    unionid VARCHAR(100) UNIQUE COMMENT '微信开放平台唯一标识',
    session_key VARCHAR(100) COMMENT '微信会话密钥',
    wechat_nickname VARCHAR(100) COMMENT '微信昵称',
    wechat_avatar VARCHAR(255) COMMENT '微信头像URL',
    wechat_gender TINYINT COMMENT '微信性别：0-未知，1-男，2-女',
    wechat_country VARCHAR(50) COMMENT '微信用户所在国家',
    wechat_province VARCHAR(50) COMMENT '微信用户所在省份',
    wechat_city VARCHAR(50) COMMENT '微信用户所在城市',
    wechat_language VARCHAR(20) COMMENT '微信用户语言偏好',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_openid (openid),
    INDEX idx_unionid (unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 词库表
CREATE TABLE wordbooks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '词库ID',
    name VARCHAR(100) NOT NULL COMMENT '词库名称',
    description TEXT COMMENT '词库描述',
    category VARCHAR(50) NOT NULL COMMENT '分类：CET4,CET6,TOEFL,IELTS,GRE等',
    difficulty_level TINYINT NOT NULL DEFAULT 1 COMMENT '难度等级：1-5',
    word_count INT DEFAULT 0 COMMENT '单词数量',
    cover_image_url VARCHAR(255) COMMENT '封面图片URL',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
    creator_id BIGINT COMMENT '创建者ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_creator (creator_id),
    INDEX idx_status (status),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='词库表';

-- 单词表
CREATE TABLE words (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '单词ID',
    wordbook_id BIGINT NOT NULL COMMENT '所属词库ID',
    word VARCHAR(100) NOT NULL COMMENT '单词',
    pronunciation VARCHAR(200) COMMENT '音标',
    audio_url VARCHAR(255) COMMENT '音频URL',
    part_of_speech VARCHAR(50) COMMENT '词性',
    chinese_meaning TEXT NOT NULL COMMENT '中文释义',
    english_definition TEXT COMMENT '英文释义',
    example_sentence TEXT COMMENT '例句',
    example_translation TEXT COMMENT '例句翻译',
    difficulty_level TINYINT DEFAULT 1 COMMENT '难度等级：1-5',
    frequency_rank INT COMMENT '词频排名',
    tags VARCHAR(255) COMMENT '标签，逗号分隔',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_wordbook (wordbook_id),
    INDEX idx_word (word),
    INDEX idx_difficulty (difficulty_level),
    UNIQUE KEY uk_wordbook_word (wordbook_id, word),
    FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词表';

-- 用户词库关联表
CREATE TABLE user_wordbooks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    wordbook_id BIGINT NOT NULL COMMENT '词库ID',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习进度百分比',
    learned_count INT DEFAULT 0 COMMENT '已学单词数',
    total_count INT DEFAULT 0 COMMENT '总单词数',
    last_study_at TIMESTAMP NULL COMMENT '最后学习时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user (user_id),
    INDEX idx_wordbook_user (wordbook_id),
    UNIQUE KEY uk_user_wordbook (user_id, wordbook_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户词库关联表';

-- 角色表
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(200) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    name VARCHAR(100) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    description VARCHAR(200) COMMENT '权限描述',
    type TINYINT NOT NULL COMMENT '权限类型：1-菜单权限，2-操作权限',
    path VARCHAR(100) COMMENT '菜单路径',
    component VARCHAR(200) COMMENT '菜单组件',
    icon VARCHAR(50) COMMENT '菜单图标',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role (role_id),
    INDEX idx_permission (permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 初始化角色数据
INSERT INTO roles (name, code, description) VALUES
('超级管理员', 'admin', '拥有系统所有权限'),
('普通管理员', 'manager', '拥有部分管理权限'),
('浏览用户', 'viewer', '仅拥有浏览权限');

-- 初始化权限数据（菜单权限）
INSERT INTO permissions (name, code, description, type, path, component, icon, parent_id, sort) VALUES
('仪表盘', 'dashboard', '仪表盘', 1, '/dashboard', 'views/Dashboard.vue', 'el-icon-data-analysis', 0, 1),
('词库管理', 'wordbook', '词库管理', 1, '/wordbooks', 'views/Wordbooks.vue', 'el-icon-document', 0, 2),
('单词管理', 'word', '单词管理', 1, '/words', 'views/Words.vue', 'el-icon-edit', 0, 3),
('用户管理', 'user', '用户管理', 1, '/users', 'views/Users.vue', 'el-icon-user', 0, 4),
('统计分析', 'statistics', '统计分析', 1, '/statistics', 'views/Statistics.vue', 'el-icon-data-line', 0, 5),
('权限管理', 'permission', '权限管理', 1, '/permissions', 'views/Permissions.vue', 'el-icon-setting', 0, 6),
('角色管理', 'role', '角色管理', 1, '/roles', 'views/Roles.vue', 'el-icon-user-solid', 0, 7);

-- 初始化权限数据（操作权限）
INSERT INTO permissions (name, code, description, type, parent_id) VALUES
('词库查看', 'wordbook:view', '查看词库', 2, (SELECT id FROM permissions WHERE code = 'wordbook')),
('词库创建', 'wordbook:create', '创建词库', 2, (SELECT id FROM permissions WHERE code = 'wordbook')),
('词库编辑', 'wordbook:edit', '编辑词库', 2, (SELECT id FROM permissions WHERE code = 'wordbook')),
('词库删除', 'wordbook:delete', '删除词库', 2, (SELECT id FROM permissions WHERE code = 'wordbook')),
('单词查看', 'word:view', '查看单词', 2, (SELECT id FROM permissions WHERE code = 'word')),
('单词创建', 'word:create', '创建单词', 2, (SELECT id FROM permissions WHERE code = 'word')),
('单词编辑', 'word:edit', '编辑单词', 2, (SELECT id FROM permissions WHERE code = 'word')),
('单词删除', 'word:delete', '删除单词', 2, (SELECT id FROM permissions WHERE code = 'word')),
('用户查看', 'user:view', '查看用户', 2, (SELECT id FROM permissions WHERE code = 'user')),
('用户编辑', 'user:edit', '编辑用户', 2, (SELECT id FROM permissions WHERE code = 'user')),
('用户删除', 'user:delete', '删除用户', 2, (SELECT id FROM permissions WHERE code = 'user'));

-- 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id) 
SELECT (SELECT id FROM roles WHERE code = 'admin') AS role_id, id AS permission_id 
FROM permissions;
