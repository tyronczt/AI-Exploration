document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copyButton');
  const statusDiv = document.getElementById('status');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.querySelector('.progress-container');
  const progressText = document.getElementById('progressText');

  function showProgress() {
    progressContainer.style.display = 'block';
    progressText.style.display = 'block';
    statusDiv.style.display = 'none';
  }

  function hideProgress() {
    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressText.style.display = 'none';
    }, 1000);
  }

  function updateProgress(percentage, message) {
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = message;
  }

  copyButton.addEventListener('click', async () => {
    try {
      // 获取当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('yuque.com')) {
        statusDiv.textContent = '请在语雀文章页面使用此功能！';
        statusDiv.className = 'status error';
        statusDiv.style.display = 'block';
        return;
      }

      // 发送复制命令到content script
      copyButton.disabled = true;
      copyButton.textContent = '复制中...';
      showProgress();
      updateProgress(0, '准备复制...');
      
      // 向content script发送消息
      chrome.tabs.sendMessage(tab.id, { action: 'copyArticle' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送消息失败:', chrome.runtime.lastError);
          statusDiv.textContent = '操作失败：无法与页面通信';
          statusDiv.className = 'status error';
          statusDiv.style.display = 'block';
          hideProgress();
          copyButton.disabled = false;
          copyButton.textContent = '复制文章内容';
        }
      });
    } catch (error) {
      console.error('操作失败:', error);
      statusDiv.textContent = '操作失败：' + error.message;
      statusDiv.className = 'status error';
      statusDiv.style.display = 'block';
      hideProgress();
      copyButton.disabled = false;
      copyButton.textContent = '复制文章内容';
    }
  });

  // 监听来自content script的消息
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateProgress') {
      updateProgress(message.percentage, message.message);
    }
    else if (message.action === 'copySuccess') {
      statusDiv.textContent = '复制成功！可以直接粘贴到公众号编辑器了';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'block';
      hideProgress();
    } 
    else if (message.action === 'copyError') {
      statusDiv.textContent = '复制失败：' + message.error;
      statusDiv.className = 'status error';
      statusDiv.style.display = 'block';
      hideProgress();
    }
    
    copyButton.disabled = false;
    copyButton.textContent = '复制文章内容';
  });
}); 