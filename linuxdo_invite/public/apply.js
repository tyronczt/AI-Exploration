const API_BASE = '/api';

// ==================== 表单提交 ====================

// 刷新验证码
function refreshCaptcha() {
  document.getElementById('captchaImg').src = API_BASE + '/captcha?' + Date.now();
}

// 表单提交
document.getElementById('applyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const condition1 = document.getElementById('condition1').checked;
  const condition2 = document.getElementById('condition2').checked;
  const wechatName = document.getElementById('wechatName').value.trim();
  const captchaCode = document.getElementById('captchaCode').value.trim();

  // 验证条件勾选
  if (!condition1 || !condition2) {
    showError('请先阅读并勾选两个申请条件');
    return;
  }

  // 验证微信名
  if (!wechatName) {
    showError('请输入微信名');
    return;
  }

  // 验证验证码
  if (!captchaCode) {
    showError('请输入验证码');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';

  try {
    const response = await fetch(API_BASE + '/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wechatName, captchaCode })
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('successMessage').textContent = result.message;
      document.getElementById('successModal').style.display = 'flex';
      document.getElementById('applyForm').reset();
      refreshCaptcha();

      // 保存微信名到 localStorage，方便查询进度
      localStorage.setItem('lastWechatName', wechatName);
    } else {
      showError(result.message);
      refreshCaptcha();
    }
  } catch (error) {
    showError('网络错误，请稍后重试');
    refreshCaptcha();
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '提交申请';
  }
});

// ==================== 进度查询 ====================

// 显示查询卡片
function showQueryCard() {
  document.getElementById('applyCard').style.display = 'none';
  document.getElementById('progressCard').style.display = 'none';
  document.getElementById('queryCard').style.display = 'block';

  // 自动填充上次申请的微信名
  const lastWechatName = localStorage.getItem('lastWechatName');
  if (lastWechatName) {
    document.getElementById('queryWechatName').value = lastWechatName;
  }

  // 自动聚焦到输入框
  setTimeout(() => {
    document.getElementById('queryWechatName').focus();
  }, 100);
}

// 显示申请卡片
function showApplyCard() {
  document.getElementById('queryCard').style.display = 'none';
  document.getElementById('progressCard').style.display = 'none';
  document.getElementById('applyCard').style.display = 'block';
}

// 查询进度
async function queryProgress() {
  const wechatName = document.getElementById('queryWechatName').value.trim();

  if (!wechatName) {
    showError('请输入微信名');
    return;
  }

  const queryBtn = document.getElementById('queryBtn');
  queryBtn.disabled = true;
  queryBtn.textContent = '查询中...';

  try {
    const response = await fetch(API_BASE + '/application/status?wechatName=' + encodeURIComponent(wechatName));
    const result = await response.json();

    if (result.success) {
      showProgress(result.data);
      // 保存微信名到 localStorage
      localStorage.setItem('lastWechatName', wechatName);
    } else {
      showError(result.message);
    }
  } catch (error) {
    showError('网络错误，请稍后重试');
  } finally {
    queryBtn.disabled = false;
    queryBtn.textContent = '查询进度';
  }
}

// 格式化日期 YYYY-MM-DD
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

// 显示进度
function showProgress(data) {
  // 隐藏查询卡片，显示进度卡片
  document.getElementById('queryCard').style.display = 'none';
  document.getElementById('progressCard').style.display = 'block';

  // 微信名脱敏显示
  const maskedName = maskWechatName(data.wechat_name);
  document.getElementById('progressWechatName').textContent = `微信名：${maskedName}`;

  // 申请时间
  const applyTime = new Date(data.apply_time).toLocaleString('zh-CN');
  document.getElementById('applyTime').textContent = `申请时间：${applyTime}`;

  // 重置所有时间线状态
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    item.classList.remove('active', 'completed');
  });

  // 隐藏所有特殊状态时间线
  document.getElementById('timeline-unqualified').style.display = 'none';
  document.getElementById('timeline-in_queue').style.display = 'none';
  document.getElementById('timeline-sent').style.display = 'none';

  // 根据状态激活对应的时间线
  document.getElementById('timeline-applied').classList.add('completed', 'active');

  if (data.status === 'not_qualified') {
    // 不符合条件
    document.getElementById('timeline-unqualified').style.display = 'block';
    document.getElementById('timeline-unqualified').classList.add('active');
    const remark = data.remark || '不符合申请条件';
    document.getElementById('unqualifiedRemark').textContent = `原因：${remark}`;
  } else if (data.status === 'in_queue') {
    // 申请队列中
    document.getElementById('timeline-in_queue').style.display = 'block';
    document.getElementById('timeline-in_queue').classList.add('active');
    // 显示预计邀请日期
    if (data.expected_date) {
      document.getElementById('expectedDateDisplay').textContent = `预计邀请日期：${formatDateShort(data.expected_date)}`;
    }
  } else if (data.status === 'sent') {
    // 已发送
    document.getElementById('timeline-in_queue').style.display = 'block';
    document.getElementById('timeline-sent').style.display = 'block';
    document.getElementById('timeline-in_queue').classList.add('completed');
    document.getElementById('timeline-sent').classList.add('active');

    if (data.invite_date) {
      document.getElementById('inviteDate').textContent = `邀请日期：${formatDateShort(data.invite_date)}`;
    }
    if (data.invite_code) {
      const maskedCode = maskInviteCode(data.invite_code);
      document.getElementById('inviteCodeDisplay').textContent = `邀请码：${maskedCode}`;
    }
    if (data.remark) {
      document.getElementById('progressRemark').textContent = `备注：${data.remark}`;
    }
  }
}

// 微信名脱敏
function maskWechatName(name) {
  if (!name) return '';
  if (name.length <= 2) {
    return name.length === 1 ? name + '*' : name[0] + '*';
  }
  return name[0] + '***' + name[name.length - 1];
}

// 邀请码脱敏：前2后2明文，中间******
function maskInviteCode(code) {
  if (!code) return '';
  if (code.length <= 4) return code[0] + '******' + code[code.length - 1];
  return code.substring(0, 2) + '******' + code.substring(code.length - 2);
}

// ==================== 弹窗控制 ====================

// 关闭成功弹窗
function closeModal() {
  document.getElementById('successModal').style.display = 'none';
  // 关闭弹窗后显示进度
  showQueryCard();
}

// 关闭错误弹窗
function closeErrorModal() {
  document.getElementById('errorModal').style.display = 'none';
}

// 显示错误
function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').style.display = 'flex';
}

// 点击弹窗外部关闭
document.getElementById('successModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('successModal')) {
    closeModal();
  }
});

document.getElementById('errorModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('errorModal')) {
    closeErrorModal();
  }
});

// ==================== 页面初始化 ====================

// 页面加载时，检查是否有上次的申请记录
window.addEventListener('DOMContentLoaded', () => {
  const lastWechatName = localStorage.getItem('lastWechatName');
  if (lastWechatName) {
    // 自动显示查询卡片
    showQueryCard();
  }
});

// 回车键提交查询
document.getElementById('queryWechatName').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    queryProgress();
  }
});
