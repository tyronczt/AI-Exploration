#!/usr/bin/env node
/**
 * build.js - 扫描报告并构建自包含的 index.html
 *
 * 用法:
 *   node build.js                  # 在脚本所在目录执行
 *   node build.js /path/to/dir     # 在指定目录执行
 *
 * 流程:
 *   1. 扫描目录中所有报告 HTML 文件
 *   2. 解析每份报告的仓库数据
 *   3. 将聚合数据内嵌到 index.html 中
 *   4. 输出自包含的 index.html（双击即可打开）
 */

const fs = require('fs');
const path = require('path');

const dir = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;

console.log(`📂 扫描目录: ${dir}`);

// ========== 1. 发现报告文件 ==========
const SKIP = new Set(['index.html', 'data.json', 'build.js', 'SKILL.md', 'README.md']);
const files = fs.readdirSync(dir).filter(f => {
  if (SKIP.has(f) || f.startsWith('template')) return false;
  return /^\d{8}(\.html)?$/.test(f) || /^github-trending-\d{4}-\d{2}-\d{2}\.html$/.test(f);
});

console.log(`📄 发现 ${files.length} 个报告文件`);
if (files.length === 0) {
  console.log('⚠️  未找到报告文件。');
  process.exit(0);
}

// ========== 2. 解析报告 ==========
const reports = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const dateStr = extractDate(file);
  if (!dateStr) return;

  let repos = extractReposData(content);
  if (!repos || repos.length === 0) repos = parseStaticHTML(content);
  if (repos.length === 0) { console.log(`⚠️  无法解析: ${file}`); return; }

  const totalWeeklyStars = repos.reduce((s, r) => s + (r.weekly_stars || 0), 0);
  const topRepo = repos.reduce((b, r) => (r.weekly_stars || 0) > (b.weekly_stars || 0) ? r : b, repos[0]);

  reports.push({
    date: dateStr,
    url: file.replace(/\.html$/, ''),
    repo_count: repos.length,
    total_weekly_stars: totalWeeklyStars,
    top_project: topRepo.name || topRepo.full_name || 'N/A',
    top_project_stars: topRepo.weekly_stars || 0,
    top_project_desc: topRepo.description || topRepo.zh_one_liner || '',
    languages: langDist(repos),
    repos: repos.map(r => ({
      name: r.name || r.full_name || 'N/A',
      url: r.url || `https://github.com/${r.name || r.full_name}`,
      description: r.description || '',
      language: r.language || '',
      stars: r.stars || 0,
      forks: r.forks || 0,
      weekly_stars: r.weekly_stars || 0,
      zh_title: r.zh_title || '',
      zh_one_liner: r.zh_one_liner || '',
      star_trend: r.star_trend || []
    }))
  });
  console.log(`✅ ${file} → ${repos.length} 个项目, +${totalWeeklyStars.toLocaleString()} stars`);
});

reports.sort((a, b) => a.date > b.date ? -1 : 1);
const data = { generated_at: new Date().toISOString(), report_count: reports.length, reports };

// ========== 3. 内嵌到 index.html ==========
const indexPath = path.join(dir, 'index.html');
if (!fs.existsSync(indexPath)) { console.error('❌ index.html 不存在'); process.exit(1); }

let html = fs.readFileSync(indexPath, 'utf-8');
html = html.replace(/<!-- __EMBEDDED_DATA_START__ -->[\s\S]*?<!-- __EMBEDDED_DATA_END__ -->\s*/g, '');
const tag = `<!-- __EMBEDDED_DATA_START__ -->\n<script id="__embedded_data__">\nwindow.__EMBEDDED_DATA__ = ${JSON.stringify(data, null, 2)};\n</script>\n<!-- __EMBEDDED_DATA_END__ -->`;
html = html.replace('</head>', tag + '\n</head>');

fs.writeFileSync(indexPath, html, 'utf-8');
console.log(`\n📦 已构建 index.html (${reports.length} 份报告, ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
console.log('🌐 双击 index.html 即可打开日历导航和趋势看板');

// ========== 工具函数 ==========

function extractDate(f) {
  let m = f.match(/^(\d{4})(\d{2})(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = f.match(/github-trending-(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

function extractReposData(html) {
  const m = html.match(/window\.REPOS_DATA\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return null;
  try { const d = JSON.parse(m[1]); return Array.isArray(d) ? d : null; } catch { return null; }
}

function parseStaticHTML(html) {
  const repos = [];
  const links = [...html.matchAll(/<a class="repo-name" href="(https:\/\/github\.com\/[^"]+)"[^>]*>[\s\S]*?<span class="owner">([^<]+)<\/span>([^<]+)/g)];
  const descs = [...html.matchAll(/<div class="repo-desc">([\s\S]*?)<\/div>/g)];
  const langs = [...html.matchAll(/<span class="lang-dot" style="background:([^"]+)"><\/span>\s*(\w[\w+#]*)/g)];
  const stars = [...html.matchAll(/<span class="item">⭐\s*([\d,]+)/g)];
  const forks = [...html.matchAll(/<span class="item">🍴\s*([\d,]+)/g)];
  const weekly = [...html.matchAll(/本周\s*\+([\d,]+)/g)];
  links.forEach((m, i) => repos.push({
    name: m[2] + m[3].trim(), url: m[1],
    description: descs[i] ? descs[i][1].replace(/<[^>]*>/g, '').trim() : '',
    language: langs[i] ? langs[i][2] : '',
    stars: stars[i] ? parseInt(stars[i][1].replace(/,/g, '')) : 0,
    forks: forks[i] ? parseInt(forks[i][1].replace(/,/g, '')) : 0,
    weekly_stars: weekly[i] ? parseInt(weekly[i][1].replace(/,/g, '')) : 0
  }));
  return repos;
}

function langDist(repos) {
  const c = {};
  repos.forEach(r => { const l = r.language || 'Other'; c[l] = (c[l] || 0) + 1; });
  return c;
}