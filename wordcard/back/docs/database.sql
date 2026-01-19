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
