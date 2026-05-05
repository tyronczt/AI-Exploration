const API_BASE = '/api';

// 当前页码
let appPage = 1;
let isAdmin = false;

// 页面加载时检查登录状态
(async function init() {
  try {
    const res = await fetch(API_BASE + '/admin/check');
    const data = await res.json();
    isAdmin = data.isAdmin;
    if (!data.isAdmin) {
      showLoginPanel();
    } else {
      showAdminPanel();
      loadApplications();
    }
  } catch {
    showLoginPanel();
  }
})();

// 显示登录面板
function showLoginPanel() {
  document.getElementById('adminContent').style.display = 'none';
  document.getElementById('loginPanel').style.display = 'flex';
}

// 显示管理面板
function showAdminPanel() {
  document.getElementById('loginPanel').style.display = 'none';
  document.getElementById('adminContent').style.display = 'block';
}

// 登录
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('loginError');

  loginBtn.disabled = true;
  loginBtn.textContent = '登录中...';
  errorMsg.style.display = 'none';

  try {
    const response = await fetch(API_BASE + '/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (result.success) {
      isAdmin = true;
      showAdminPanel();
      loadApplications();
    } else {
      errorMsg.textContent = result.message || '密码错误';
      errorMsg.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = '登录';
    }
  } catch (error) {
    errorMsg.textContent = '网络错误，请稍后重试';
    errorMsg.style.display = 'block';
    loginBtn.disabled = false;
    loginBtn.textContent = '登录';
  }
});

// 脱敏微信名：前1后1明文，中间***
function maskWechatName(name) {
  if (!name) return '';
  if (name.length <= 1) return name + '*';
  if (name.length === 2) return name[0] + '*';
  return name[0] + '***' + name[name.length - 1];
}

// 脱敏邀请码：前2后2明文，中间******
function maskInviteCode(code) {
  if (!code) return '-';
  if (code.length <= 4) return code[0] + '******' + code[code.length - 1];
  return code.substring(0, 2) + '******' + code.substring(code.length - 2);
}

// 格式化日期时间（处理时区问题）
function formatDateTime(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return '-';
  // 处理 MySQL DATETIME 格式，按本地时区解析
  const d = new Date(dateStr.replace(' ', 'T') + '.000+08:00');
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// 格式化日期（处理空值和时区问题）
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr.trim() === '') return '-';
  // 直接截取日期部分，避免时区问题
  const datePart = dateStr.split('T')[0];
  if (!datePart || datePart === 'null') return '-';
  return datePart;
}

// 转换日期为 YYYY-MM-DD 格式（用于表单回填）
function toDateInputValue(dateStr) {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr.trim() === '') return '';
  const datePart = dateStr.split('T')[0];
  if (!datePart || datePart === 'null') return '';
  return datePart;
}

// 获取状态文本
function getAppStatusText(status) {
  const map = { 'not_qualified': '不符合条件', 'in_queue': '申请队列中', 'sent': '已发送' };
  return map[status] || status;
}

function getAppStatusClass(status) {
  const map = { 'not_qualified': 'status-error', 'in_queue': 'status-warning', 'sent': 'status-success' };
  return map[status] || '';
}

// ==================== 申请记录 ====================

async function loadApplications(page = 1) {
  appPage = page;
  try {
    const res = await fetch(API_BASE + '/admin/applications?page=' + page + '&pageSize=10');
    const data = await res.json();
    if (data.success) {
      renderApplications(data.data);
    } else {
      showToast(data.message || '加载申请记录失败');
    }
  } catch (err) {
    console.error('加载申请记录失败:', err);
    showToast('加载申请记录失败');
  }
}

function renderApplications(result) {
  // 更新总数显示
  document.getElementById('totalCount').textContent = `共 ${result.total} 条记录`;
  
  const tbody = document.getElementById('applicationsTableBody');

  if (result.list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">暂无申请记录</td></tr>';
  } else {
    tbody.innerHTML = result.list.map(item => `
      <tr>
        <td>${item.wechat_name}</td>
        <td>${formatDateTime(item.apply_time)}</td>
        <td><span class="status-badge ${getAppStatusClass(item.status)}">${getAppStatusText(item.status)}</span></td>
        <td class="invite-code-cell" title="${item.invite_code || ''}">${maskInviteCode(item.invite_code)}</td>
        <td>${formatDate(item.expected_date)}</td>
        <td>${formatDate(item.invite_date)}</td>
        <td class="remark-cell" title="${item.remark || ''}">${item.remark || '-'}</td>
        <td>
          <button class="btn-edit" onclick="editApplication(${item.id})">编辑</button>
          <button class="btn-delete" onclick="deleteApplication(${item.id})">删除</button>
        </td>
      </tr>
    `).join('');
  }

  renderPagination('applicationsPagination', result.page, result.totalPages, loadApplications);
}

// 编辑申请记录
function editApplication(id) {
  fetch(API_BASE + '/admin/applications?page=' + appPage + '&pageSize=10')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const item = data.data.list.find(i => i.id === id);
        if (item) {
          document.getElementById('editAppId').value = item.id;
          document.getElementById('editAppStatus').value = item.status;
          document.getElementById('editAppInviteDate').value = toDateInputValue(item.invite_date);
          document.getElementById('editAppInviteCode').value = item.invite_code || '';
          document.getElementById('editAppExpectedDate').value = toDateInputValue(item.expected_date);
          document.getElementById('editAppRemark').value = item.remark || '';
          document.getElementById('editAppModal').style.display = 'flex';
        }
      }
    });
}

document.getElementById('editAppForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editAppId').value;
  const status = document.getElementById('editAppStatus').value;
  const invite_date = document.getElementById('editAppInviteDate').value;
  const invite_code = document.getElementById('editAppInviteCode').value.trim();
  const expected_date = document.getElementById('editAppExpectedDate').value;
  const remark = document.getElementById('editAppRemark').value;

  try {
    const res = await fetch(API_BASE + '/admin/applications/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, invite_date, invite_code, expected_date, remark })
    });
    const data = await res.json();
    if (data.success) {
      closeEditAppModal();
      loadApplications(appPage);
      showToast('更新成功');
    } else {
      showToast(data.message);
    }
  } catch {
    showToast('更新失败');
  }
});

function closeEditAppModal() {
  document.getElementById('editAppModal').style.display = 'none';
}

// 删除申请记录
async function deleteApplication(id) {
  if (!confirm('确定要删除这条申请记录吗？')) return;

  try {
    const res = await fetch(API_BASE + '/admin/applications/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadApplications(appPage);
      showToast('删除成功');
    } else {
      showToast(data.message);
    }
  } catch {
    showToast('删除失败');
  }
}

// ==================== 分页 ====================

function renderPagination(containerId, currentPage, totalPages, callback) {
  const container = document.getElementById(containerId);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  if (currentPage > 1) {
    html += `<button onclick="${callback.name}(${currentPage - 1})">上一页</button>`;
  }
  html += `<span class="page-info">第 ${currentPage} / ${totalPages} 页</span>`;
  if (currentPage < totalPages) {
    html += `<button onclick="${callback.name}(${currentPage + 1})">下一页</button>`;
  }
  container.innerHTML = html;
}

// ==================== 其他 ====================

async function logout() {
  try {
    await fetch(API_BASE + '/admin/logout', { method: 'POST' });
  } catch {}
  isAdmin = false;
  showLoginPanel();
  document.getElementById('loginPassword').value = '';
}

function showToast(message) {
  document.getElementById('toastMessage').textContent = message;
  const modal = document.getElementById('toastModal');
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.display = 'none'; }, 2000);
}

// 点击弹窗外部关闭
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal && modal.id !== 'toastModal') {
      modal.style.display = 'none';
    }
  });
});
