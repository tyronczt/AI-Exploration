const API_BASE = '/api';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function renderParagraphs(content) {
  return escapeHtml(content)
    .split(/\n+/)
    .filter(Boolean)
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

async function loadReferenceArticles() {
  const container = document.getElementById('referenceList');

  try {
    const res = await fetch(API_BASE + '/reference-articles');
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = '<div class="reference-empty">参考内容加载失败，请稍后重试。</div>';
      return;
    }

    if (result.data.length === 0) {
      container.innerHTML = '<div class="reference-empty">暂无参考内容。</div>';
      return;
    }

    container.innerHTML = result.data.map((item, index) => `
      <article class="reference-card">
        <div class="reference-card-head">
          <span class="reference-index">${String(index + 1).padStart(2, '0')}</span>
          ${item.category ? `<span class="reference-category">${escapeHtml(item.category)}</span>` : ''}
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="reference-content">${renderParagraphs(item.content)}</div>
      </article>
    `).join('');
  } catch (error) {
    console.error('加载参考小作文失败:', error);
    container.innerHTML = '<div class="reference-empty">参考内容加载失败，请稍后重试。</div>';
  }
}

loadReferenceArticles();
