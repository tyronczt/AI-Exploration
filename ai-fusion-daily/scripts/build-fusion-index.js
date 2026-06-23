#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const files = fs.readdirSync(dir)
  .filter(file => /^\d{8}\.html$/.test(file))
  .sort();

// --- Load index.html and validate markers ---
const indexPath = path.join(dir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`index.html not found: ${indexPath}`);
  process.exit(1);
}

let index = fs.readFileSync(indexPath, 'utf8');
const marker = /<!-- __EMBEDDED_DATA_START__ -->[\s\S]*?<!-- __EMBEDDED_DATA_END__ -->/;
if (!marker.test(index)) {
  console.error('Embedded data markers not found in index.html');
  process.exit(1);
}

// --- Incremental build: reuse cached reports for unchanged files ---
const cachedData = loadCachedData(index);
const generatedAt = cachedData.generated_at ? new Date(cachedData.generated_at) : new Date(0);
const cachedMap = {};
(cachedData.reports || []).forEach(report => { cachedMap[report.url] = report; });

// --- Parse reports (skip unchanged files) ---
const reports = [];
let parsed = 0;
let skipped = 0;
let warned = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  const mtime = fs.statSync(filePath).mtime;

  if (cachedMap[file] && mtime <= generatedAt) {
    reports.push(cachedMap[file]);
    skipped++;
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const date = file.replace(/(\d{4})(\d{2})(\d{2})\.html$/, '$1-$2-$3');
  const repos = parseRepos(html, file);
  const newsCount = count(html, /class="repo-card news-card"/g);
  const relationCount = count(html, /class="repo-card relation-card"/g);
  const aiRepoCount = repos.filter(repo => repo.ai_related).length;
  const totalWeeklyStars = repos.reduce((sum, repo) => sum + repo.weekly_stars, 0);
  const topProject = repos.reduce((best, repo) =>
    repo.weekly_stars > (best.weekly_stars || 0) ? repo : best, repos[0] || {});

  if (repos.length === 0 && newsCount === 0) {
    console.warn(`  Warning: ${file} — no repo cards or news cards found. Check HTML structure.`);
    warned++;
  }

  // Slim repos: only keep fields the dashboard uses; drop long descriptions
  const slimRepos = repos.map(repo => ({
    name: repo.name,
    url: repo.url,
    weekly_stars: repo.weekly_stars,
    language: repo.language,
    ai_related: repo.ai_related
  }));

  reports.push({
    date,
    url: file,
    news_count: newsCount,
    repo_count: repos.length,
    ai_repo_count: aiRepoCount,
    relation_count: relationCount,
    total_weekly_stars: totalWeeklyStars,
    top_project: topProject.name || 'N/A',
    top_project_stars: topProject.weekly_stars || 0,
    top_project_desc: topProject.zh_one_liner || topProject.description || '',
    languages: langDist(repos),
    repos: slimRepos
  });
  parsed++;
});

reports.sort((a, b) => b.date.localeCompare(a.date));

const data = {
  generated_at: new Date().toISOString(),
  report_count: reports.length,
  reports
};

const embedded = `<!-- __EMBEDDED_DATA_START__ -->
<script id="__embedded_data__">
window.__FUSION_DATA__ = ${JSON.stringify(data, null, 2)};
</script>
<!-- __EMBEDDED_DATA_END__ -->`;

index = index.replace(marker, embedded);
fs.writeFileSync(indexPath, index, 'utf8');

console.log(`Built ${indexPath}`);
console.log(`Reports: ${reports.length} (parsed ${parsed}, cached ${skipped}${warned ? `, ${warned} warnings` : ''})`);

// --- Helper functions ---

function loadCachedData(html) {
  const match = html.match(/window\.__FUSION_DATA__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (!match) return {};
  try { return JSON.parse(match[1]); }
  catch (e) { return {}; }
}

function parseRepos(html, filename) {
  const sectionMatch = html.match(/<section class="section" id="opensource">([\s\S]*?)<section class="section" id="relations">/);
  if (!sectionMatch) {
    console.warn(`  Warning: ${filename} — #opensource section not found.`);
    return [];
  }

  const cards = sectionMatch[1].match(/<article class="repo-card[\s\S]*?<\/article>/g) || [];
  if (cards.length === 0) {
    console.warn(`  Warning: ${filename} — #opensource section found but no repo-card articles.`);
  }

  return cards.map(card => {
    const link = card.match(/<a class="repo-name" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const title = text(card.match(/<div class="repo-desc"[^>]*>([\s\S]*?)<\/div>/)?.[1]);
    const parts = title.split(' · ');
    const desc = text(card.match(/<div class="repo-desc-cn">([\s\S]*?)<\/div>/)?.[1]);
    const metaText = text(card.match(/<div class="repo-meta">([\s\S]*?)<\/div>/)?.[1]);
    const tagBlock = card.match(/<div class="tag-line">([\s\S]*?)<\/div>/)?.[1] || '';
    const tags = [...tagBlock.matchAll(/<span class="tag">([\s\S]*?)<\/span>/g)].map(match => text(match[1]));

    return {
      name: text(link?.[2] || 'N/A'),
      url: link?.[1] || '',
      zh_title: parts[0] || '',
      zh_one_liner: parts.slice(1).join(' · '),
      description: desc,
      language: text(metaText.match(/^([^★⑂本]+?)\s*★/)?.[1] || ''),
      stars: number(metaText.match(/★\s*([\d,]+)/)?.[1]),
      forks: number(metaText.match(/⑂\s*([\d,]+)/)?.[1]),
      weekly_stars: number(metaText.match(/本周\s*\+([\d,]+)/)?.[1]),
      ai_related: /AI\s*相关/.test(metaText),
      tags
    };
  }).filter(repo => repo.name !== 'N/A');
}

function text(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function number(value) {
  return Number(String(value || '0').replace(/[^0-9]/g, '')) || 0;
}

function count(textValue, regex) {
  return (textValue.match(regex) || []).length;
}

function langDist(repos) {
  return repos.reduce((acc, repo) => {
    const lang = repo.language || 'Other';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});
}
