# 输出规范

完整的内容规范见 SKILL.md。本文档记录构建脚本依赖的 HTML 结构约定。

## 构建脚本依赖的 class 名

`build.js`（→ `scripts/build-fusion-index.js`）通过正则匹配以下 HTML 结构提取数据。修改日报模板时**必须保留**这些 class 和 id：

```html
<!-- 项目区域分界 -->
<section class="section" id="opensource"> ... </section>
<section class="section" id="relations"> ... </section>

<!-- 项目卡片 -->
<article class="repo-card">
  <a class="repo-name" href="...">...</a>
  <div class="repo-desc">...</div>
  <div class="repo-desc-cn">...</div>
  <div class="repo-meta">语言 ★ stars ⑂ forks 本周 +N AI 相关</div>
  <div class="tag-line"><span class="tag">...</span></div>
</article>

<!-- 新闻卡片 -->
<article class="repo-card news-card">...</article>

<!-- 关联卡片 -->
<article class="repo-card relation-card">...</article>
```

如果日报模板改了这些 class 名，需要同步更新 `scripts/build-fusion-index.js` 中的正则表达式。

## 嵌入数据标记

`index.html` 必须包含：

```html
<!-- __EMBEDDED_DATA_START__ -->
<script id="__embedded_data__">
window.__FUSION_DATA__ = {"generated_at":"","report_count":0,"reports":[]};
</script>
<!-- __EMBEDDED_DATA_END__ -->
```

## CSS 注意点

日历网格：

```css
grid-template-columns: repeat(7, minmax(0, 1fr));
```

移动端不要给日历单元格设置会撑宽布局的固定最小宽度。

外链：

```html
target="_blank" rel="noopener noreferrer"
```
