# 常见问题

## index.html 没有更新数据

检查 `index.html` 是否包含嵌入数据标记：

```html
<!-- __EMBEDDED_DATA_START__ -->
...
<!-- __EMBEDDED_DATA_END__ -->
```

缺少标记时，构建脚本会停止并提示：

```text
Embedded data markers not found in index.html
```

## 趋势看板没有项目

检查单日报页是否有：

```html
<section class="section" id="opensource">
```

并且项目卡片是否使用：

```html
<article class="repo-card">
```

构建脚本会从 `#opensource` 到 `#relations` 之间解析项目卡片。详细 class 名清单见 [OUTPUT_SPEC.md](OUTPUT_SPEC.md)。

## 构建输出出现 Warning

```text
Warning: 20260623.html — #opensource section not found.
Warning: 20260623.html — no repo cards or news cards found.
```

说明日报 HTML 结构与构建脚本预期的不一致。常见原因：模板修改了 section id 或 class 名。检查日报文件和 `OUTPUT_SPEC.md` 中的约定是否对齐。

## 移动端出现横向滚动

优先检查日历网格。推荐：

```css
.cal-grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
```

小屏下避免给 `.cal-cell` 设置固定 `min-height`，如果同时使用 `aspect-ratio: 1`，固定最小高度可能让 7 列反向撑宽。

## 外链安全检查

所有外链应包含：

```html
target="_blank" rel="noopener noreferrer"
```

本地日报链接可以直接使用相对路径：

```html
<a href="20260623.html">2026-06-23</a>
```
