// 发送进度更新
function updateProgress(message, percentage) {
  chrome.runtime.sendMessage({
    action: 'updateProgress',
    message: message,
    percentage: percentage
  });
}

// 移除复制限制
function removeCopyRestrictions() {
  // 移除禁止复制的样式
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
    }
  `;
  document.head.appendChild(style);

  // 移除禁止复制的事件监听器
  document.addEventListener('copy', (e) => {
    e.stopPropagation();
  }, true);
  document.addEventListener('cut', (e) => {
    e.stopPropagation();
  }, true);
  document.addEventListener('paste', (e) => {
    e.stopPropagation();
  }, true);
}

// 处理图片，获取URL
async function processImage(img) {
  try {
    // 获取原始图片URL
    let imageUrl = img.dataset.src || img.src;
    if (imageUrl.includes('cdn.nlark.com')) {
      imageUrl = imageUrl.replace(/\?.*$/, '');
    }
    
    // 创建图片链接
    const linkText = `[图片链接](${imageUrl})`;
    return linkText;
  } catch (error) {
    console.error('处理图片失败:', error);
    return '[图片处理失败]';
  }
}

// 处理代码块
function processCodeBlock(block) {
  const codeElement = block.querySelector('code');
  if (codeElement) {
    const language = block.querySelector('.language')?.textContent || '';
    const code = codeElement.textContent;
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }
  return block.textContent;
}

// 处理表格
function processTable(table) {
  const rows = table.querySelectorAll('tr');
  let markdown = '\n';
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td, th');
    const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
    
    // 添加行
    markdown += `| ${cellTexts.join(' | ')} |\n`;
    
    // 添加表头分隔符
    if (index === 0) {
      markdown += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
    }
  });
  
  return markdown + '\n';
}

// 处理文本样式
function processTextStyle(element) {
  let text = element.textContent;
  
  // 处理加粗
  if (element.matches('strong, b')) {
    text = `**${text}**`;
  }
  
  // 处理斜体
  if (element.matches('em, i')) {
    text = `*${text}*`;
  }
  
  // 处理删除线
  if (element.matches('del, s')) {
    text = `~~${text}~~`;
  }
  
  return text;
}

// 主要功能：复制文章内容
async function copyArticleContent() {
  try {
    updateProgress('正在获取文章内容...', 10);

    // 移除复制限制
    removeCopyRestrictions();

    // 获取文章标题
    const titleElement = document.querySelector('.article-title, .ne-title-text, .DocTitle');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    updateProgress('正在处理文章内容...', 30);

    // 获取文章主体内容
    const contentElement = document.querySelector('.lake-content, .ne-content, .article-content, .yuque-doc-content');
    if (!contentElement) {
      throw new Error('未找到文章内容！请确保您在语雀文章页面。');
    }

    // 创建一个新的div来存放处理后的内容
    const processedContent = document.createElement('div');
    processedContent.innerHTML = contentElement.innerHTML;

    // 移除like-btn后的内容
    const likeBtn = processedContent.querySelector('.like-btn');
    if (likeBtn) {
      let currentElement = likeBtn;
      while (currentElement.nextElementSibling) {
        currentElement.nextElementSibling.remove();
      }
    }

    // 添加基础样式，与语雀保持一致
    processedContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.8;
      color: #1f2329;
      font-size: 14px;
    `;

    // 设置标题样式
    processedContent.querySelectorAll('h1').forEach(h1 => {
      h1.style.cssText = 'font-size: 28px; margin: 24px 0 16px; font-weight: 600;';
    });
    processedContent.querySelectorAll('h2').forEach(h2 => {
      h2.style.cssText = 'font-size: 24px; margin: 20px 0 12px; font-weight: 600;';
    });
    processedContent.querySelectorAll('h3').forEach(h3 => {
      h3.style.cssText = 'font-size: 20px; margin: 16px 0 12px; font-weight: 600;';
    });
    processedContent.querySelectorAll('h4').forEach(h4 => {
      h4.style.cssText = 'font-size: 16px; margin: 12px 0 8px; font-weight: 600;';
    });
    processedContent.querySelectorAll('h5').forEach(h5 => {
      h5.style.cssText = 'font-size: 14px; margin: 12px 0 8px; font-weight: 600;';
    });
    processedContent.querySelectorAll('h6').forEach(h6 => {
      h6.style.cssText = 'font-size: 12px; margin: 12px 0 8px; font-weight: 600;';
    });

    // 设置段落样式
    processedContent.querySelectorAll('p').forEach(p => {
      p.style.cssText = 'margin: 8px 0;';
    });

    // 设置列表样式
    processedContent.querySelectorAll('ul, ol').forEach(list => {
      list.style.cssText = 'margin: 8px 0; padding-left: 24px;';
    });

    // 设置引用块样式
    processedContent.querySelectorAll('blockquote').forEach(blockquote => {
      blockquote.style.cssText = 'margin: 8px 0; padding: 8px 16px; border-left: 4px solid #e5e6eb; color: #86909c;';
    });

    updateProgress('正在处理图片...', 50);

    // 处理图片
    const images = processedContent.querySelectorAll('img');
    for (const img of images) {
      const imageMarkdown = await processImage(img);
      const imgWrapper = document.createElement('div');
      imgWrapper.textContent = imageMarkdown;
      img.parentNode.replaceChild(imgWrapper, img);
    }

    updateProgress('正在处理代码块...', 70);

    // 处理代码块
    const codeBlocks = processedContent.querySelectorAll('pre, .code-block');
    codeBlocks.forEach(block => {
      const codeElement = block.querySelector('code');
      if (codeElement) {
        const language = block.querySelector('.language')?.textContent || '';
        const code = codeElement.textContent;
        block.innerHTML = `<pre><code class="language-${language}">${code}</code></pre>`;
      }
      block.style.cssText = `
        background-color: #f6f8fa;
        padding: 16px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 14px;
        line-height: 1.5;
        overflow-x: auto;
      `;
    });

    updateProgress('正在处理表格...', 85);

    // 处理表格
    const tables = processedContent.querySelectorAll('table');
    tables.forEach(table => {
      table.style.cssText = `
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      `;
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.cssText = `
          border: 1px solid #d9d9d9;
          padding: 8px;
        `;
      });
    });

    updateProgress('正在复制到剪贴板...', 95);

    // 构建最终内容
    const finalContent = `
      <h1 style="font-size: 28px; margin: 0 0 16px; font-weight: 600;">${title}</h1>
      ${processedContent.innerHTML}
    `;

    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = finalContent;
    document.body.appendChild(tempContainer);

    // 使用 Selection API 复制内容
    const range = document.createRange();
    range.selectNode(tempContainer);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(tempContainer);

    updateProgress('复制完成！', 100);

    // 发送成功消息
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'copySuccess',
        title: title
      });
    }, 500);

  } catch (error) {
    console.error('复制失败:', error);
    chrome.runtime.sendMessage({
      action: 'copyError',
      error: error.message
    });
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyArticle') {
    copyArticleContent();
  }
}); 