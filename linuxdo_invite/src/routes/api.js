const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// ==================== 公开接口 ====================

// 查询申请进度
router.get('/application/status', async (req, res) => {
  try {
    const { wechatName } = req.query;

    if (!wechatName || wechatName.trim().length === 0) {
      return res.json({ success: false, message: '请输入微信名' });
    }

    // 查询最新的一条申请记录（使用 DATE_FORMAT 避免时区转换问题）
    const [rows] = await db.query(
      `SELECT id, wechat_name, status, 
       DATE_FORMAT(apply_time, '%Y-%m-%d %H:%i:%s') as apply_time, 
       DATE_FORMAT(invite_date, '%Y-%m-%d') as invite_date, 
       invite_code, 
       DATE_FORMAT(expected_date, '%Y-%m-%d') as expected_date, 
       remark 
       FROM applications 
       WHERE wechat_name = ? 
       ORDER BY apply_time DESC 
       LIMIT 1`,
      [wechatName.trim()]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: '未找到申请记录，请确认微信名是否正确' });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('查询申请进度失败:', error);
    res.json({ success: false, message: '查询失败，请稍后重试' });
  }
});

// 获取图形验证码
router.get('/captcha', (req, res) => {
  const captcha = require('svg-captcha');
  const c = captcha.create({
    ignoreChars: '0o1lI',
    noise: 3,
    height: 40,
    width: 120,
    fontSize: 40
  });
  req.session.captcha = c.text.toLowerCase();
  res.type('svg');
  res.status(200).send(c.data);
});

// 提交申请
router.post('/apply', async (req, res) => {
  try {
    const { wechatName, captchaCode } = req.body;

    // 验证验证码
    if (!captchaCode || captchaCode.toLowerCase() !== req.session.captcha) {
      return res.json({ success: false, message: '验证码错误' });
    }

    // 验证微信名
    if (!wechatName || wechatName.trim().length === 0) {
      return res.json({ success: false, message: '请输入微信名' });
    }

    // 保存申请记录
    await db.query(
      'INSERT INTO applications (wechat_name, status) VALUES (?, ?)',
      [wechatName.trim(), 'in_queue']
    );

    // 清除验证码
    delete req.session.captcha;

    res.json({ success: true, message: '您的申请已收到，会按照顺序在微信公众号后台给您发送邀请码' });
  } catch (error) {
    console.error('提交申请失败:', error);
    res.json({ success: false, message: '提交失败，请稍后重试' });
  }
});

// ==================== 管理员接口 ====================

// 管理员登录
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true, message: '登录成功' });
  } else {
    res.json({ success: false, message: '密码错误' });
  }
});

// 管理员登出
router.post('/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ success: true });
});

// 检查登录状态
router.get('/admin/check', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// 管理员中间件
const adminAuth = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.json({ success: false, message: '请先登录' });
  }
  next();
};

// ==================== 申请记录管理 ====================

// 获取申请记录列表（分页）
router.get('/admin/applications', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // 获取总数
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM applications');

    // 获取列表（使用 DATE_FORMAT 避免时区转换问题）
    const [rows] = await db.query(
      `SELECT id, wechat_name, status, 
       DATE_FORMAT(apply_time, '%Y-%m-%d %H:%i:%s') as apply_time, 
       DATE_FORMAT(invite_date, '%Y-%m-%d') as invite_date, 
       invite_code, 
       DATE_FORMAT(expected_date, '%Y-%m-%d') as expected_date, 
       remark 
       FROM applications 
       ORDER BY apply_time DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({
      success: true,
      data: {
        list: rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取申请记录失败:', error);
    res.json({ success: false, message: '获取数据失败' });
  }
});

// 更新申请记录
router.put('/admin/applications/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark, invite_date, invite_code, expected_date } = req.body;

    const inviteDateVal = invite_date || null;
    const expectedDateVal = expected_date || null;

    await db.query(
      'UPDATE applications SET status = ?, remark = ?, invite_date = ?, invite_code = ?, expected_date = ? WHERE id = ?',
      [status, remark || null, inviteDateVal, invite_code || null, expectedDateVal, id]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新申请记录失败:', error);
    res.json({ success: false, message: '更新失败' });
  }
});

// 删除申请记录
router.delete('/admin/applications/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM applications WHERE id = ?', [id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除申请记录失败:', error);
    res.json({ success: false, message: '删除失败' });
  }
});

module.exports = router;
