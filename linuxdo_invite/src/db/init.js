const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  // 先连接不带数据库，创建数据库
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  console.log('✅ 数据库连接成功');

  // 创建数据库
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ 数据库 ${process.env.DB_NAME} 已创建或已存在`);

  // 使用该数据库
  await connection.query(`USE \`${process.env.DB_NAME}\``);

  // 创建申请记录表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wechat_name VARCHAR(100) NOT NULL COMMENT '申请人微信名',
      status ENUM('not_qualified', 'in_queue', 'sent') DEFAULT 'in_queue' COMMENT '状态：不符合条件/申请队列中/已发送',
      apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
      invite_date DATE NULL COMMENT '邀请日期（管理员发送日期）',
      invite_code VARCHAR(50) NULL COMMENT '邀请码',
      expected_date DATE NULL COMMENT '预计邀请日期',
      remark TEXT NULL COMMENT '备注',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='申请记录表'
  `);
  console.log('✅ 申请记录表 applications 已创建');

  // 如果 invite_code 字段不存在，则添加
  try {
    await connection.query(`ALTER TABLE applications ADD COLUMN invite_code VARCHAR(50) NULL COMMENT '邀请码' AFTER invite_date`);
    console.log('✅ 已添加 invite_code 字段');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ invite_code 字段已存在或添加失败:', err.message);
    }
  }

  // 如果 expected_date 字段不存在，则添加
  try {
    await connection.query(`ALTER TABLE applications ADD COLUMN expected_date DATE NULL COMMENT '预计邀请日期' AFTER invite_code`);
    console.log('✅ 已添加 expected_date 字段');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ expected_date 字段已存在或添加失败:', err.message);
    }
  }

  await connection.end();
  console.log('\n🎉 数据库初始化完成！');
}

initDatabase().catch(err => {
  console.error('❌ 数据库初始化失败:', err.message);
  process.exit(1);
});
