# 使用指南

## 常见请求

生成当天融合日报：

```text
使用 $ai-fusion-daily 生成今天的 AI + GitHub 融合日报
```

重建入口页：

```text
使用 $ai-fusion-daily 重新构建 ai-fusion-daily/index.html 的日历浏览和趋势看板
```

沿用现有样式：

```text
使用 $ai-fusion-daily 参考 github_daily/index.html 的风格重新生成融合日报
```

增强描述内容：

```text
使用 $ai-fusion-daily 丰富资讯和项目描述，让读者从卡片里理解项目大体内容
```

## 构建输出示例

```text
Built /path/to/ai-fusion-daily/index.html
Reports: 3 (parsed 1, cached 2)
```

`parsed` 表示本次重新解析的文件数，`cached` 表示复用缓存的文件数。如果出现 `Warning`，说明某个日报的 HTML 结构有变化，需要检查 class 名是否被修改。
