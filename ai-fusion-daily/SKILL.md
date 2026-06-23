---
name: ai-fusion-daily
description: Generate or update a single-file AI HOT + GitHub Trending fusion daily report with Chinese summaries, GitHub-style dashboard design, calendar browsing, trend dashboard, and local HTML verification. Use when the user asks for AI daily reports, AI/GitHub fusion reports, "B方案" fusion daily, "融合日报", keeping github_daily calendar/trend features, or rebuilding ai-fusion-daily pages.
---

# AI Fusion Daily

## Overview

Create a local `ai-fusion-daily/YYYYMMDD.html` report that combines AI HOT daily news with GitHub Trending projects, then maintain `ai-fusion-daily/index.html` as the calendar browser and trend dashboard.

Use the local repo's existing `github_daily/` report style as the visual baseline when present. The output must be usable from `file://` without external CSS, JS, images, or fonts.

## Workflow

1. Fetch AI news with the `aihot` skill's daily API. If today's report is not available, fall back to the latest available issue. If `aihot` is unavailable or returns an error, inform the user and stop — do not generate a report with fabricated news.
2. Fetch GitHub Trending data for the requested period, usually weekly. Prefer existing project conventions if the repo already has `github_daily/`. If the network request fails, inform the user and offer to retry or use cached data if available.
3. Generate or update `ai-fusion-daily/YYYYMMDD.html`.
4. Generate or update `ai-fusion-daily/index.html` with calendar browsing and trend dashboard.
5. Run `node build.js` (from the skill directory) to embed aggregate data into the index. The script supports incremental builds: unchanged daily files are reused from cache.
6. Verify with the in-app Browser or Playwright: desktop, mobile, links, no horizontal overflow.

## Daily Report Requirements

Create a single HTML file named by date, for example `ai-fusion-daily/20260623.html`.

Include:

- Hero with date, AI news count, GitHub project count, AI-related project count, and weekly star growth.
- Sticky anchor navigation for AI sections, open-source projects, and trend relations.
- AI HOT news grouped into exactly five fixed sections:
  - Model releases/updates
  - Product releases/updates
  - Industry dynamics
  - Papers/research
  - Tips and opinions
- Global continuous numbering across AI news, not reset per section.
- GitHub Trending project cards with rank, repo link, Chinese one-line title, rich Chinese description, language, stars, forks, weekly stars, AI-related marker, and tags.
- Trend relation cards that connect AI news themes to projects.
- Footer with total counts and data sources.
- A visible link back to `index.html`, typically "日历 / 趋势看板".

Theme: the current default is **dark-only**. A light/dark toggle is not implemented. If the user requests theme switching, add CSS variables for both themes and a toggle button, but do not assume it exists.

For AI news summaries, write enough Chinese context for the reader to understand what happened, why it matters, and which scenario it affects. Avoid 1-line teaser copy unless the source itself is too sparse.

For project descriptions, explain:

- What the project does.
- Why it is relevant to AI, developer tools, infrastructure, creative workflows, or the day's news.
- Who should care about it.

## Index Requirements

Create or update `ai-fusion-daily/index.html` as the project entrance.

It must preserve these two capabilities from `github_daily/index.html`:

- Calendar browsing: month navigation, report dates highlighted, recent reports list, and links to daily HTML pages.
- Trend dashboard: aggregate stats, star-growth ranking, AI-related project panel, language distribution, and links to daily/project pages.

Embed data between these exact markers so the build script can update it:

```html
<!-- __EMBEDDED_DATA_START__ -->
<script id="__embedded_data__">
window.__FUSION_DATA__ = {"generated_at":"","report_count":0,"reports":[]};
</script>
<!-- __EMBEDDED_DATA_END__ -->
```

The index should work from `file://` and should not depend on a dev server.

## Build Script

After daily pages are created, run from the skill directory:

```bash
node build.js
```

`build.js` is a thin wrapper that delegates to `scripts/build-fusion-index.js`. It defaults to the skill directory; pass a path argument to target a different report directory:

```bash
node build.js /path/to/ai-fusion-daily
```

The script scans `YYYYMMDD.html` files, extracts counts and project metadata, and replaces the embedded `window.__FUSION_DATA__` block in `index.html`. It supports incremental builds — files unchanged since the last run are reused from cache. Parse warnings are printed to stderr when HTML structure issues are detected.

## HTML/CSS Conventions

- Keep everything inline in one file per page.
- Use GitHub-like restrained dashboard styling when the user references `github_daily`.
- Keep cards at 8-12px radius.
- Do not use external resources.
- Use `target="_blank" rel="noopener noreferrer"` for external links.
- Convert timestamps to Beijing time human-readable text; do not display raw ISO strings.
- Ensure mobile layout has no horizontal scrolling. For 7-column calendars, use `grid-template-columns: repeat(7, minmax(0, 1fr))` and avoid fixed minimum cell widths on small screens.

## Verification Checklist

Before claiming completion, verify:

- `ai-fusion-daily/YYYYMMDD.html` opens locally.
- `ai-fusion-daily/index.html` opens locally.
- Calendar highlights the generated report date.
- Trend dashboard shows project rows and language rows.
- Daily page links back to `index.html`.
- Mobile viewport has no horizontal overflow.
- External links include `target="_blank"` and `rel="noopener noreferrer"`.

Prefer Playwright or the in-app Browser for this verification. If browser tooling is unavailable, inspect the DOM and run targeted static checks with `rg`.
