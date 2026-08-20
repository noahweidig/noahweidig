#!/usr/bin/env node
/**
 * Generate GitHub statistics cards (overview.svg + languages.svg).
 *
 * Ported from the Zig implementation in noahweidig/github-stats, which is
 * itself based on jstrieb/github-stats (MIT). The cards now use a single
 * `prefers-color-scheme` aware SVG each instead of separate light/dark files.
 *
 * Environment variables:
 *   ACCESS_TOKEN     GitHub token (falls back to GITHUB_TOKEN)
 *   EXCLUDE_REPOS    comma/space separated glob patterns of repos to skip
 *   EXCLUDE_LANGS    comma separated language names to skip
 *   EXCLUDE_PRIVATE  "true" to omit private repositories
 *   OUTPUT_DIR       output directory (default: stats)
 *   MAX_RETRIES      retries against the contributors API (default: 5)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const TOKEN = process.env.ACCESS_TOKEN || process.env.GITHUB_TOKEN;
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'stats');
const TEMPLATE_DIR = path.join(__dirname, 'templates');
const MAX_RETRIES = Number(process.env.MAX_RETRIES ?? 5);
const EXCLUDE_PRIVATE = /^true$/i.test(process.env.EXCLUDE_PRIVATE || '');
const EXCLUDE_REPOS = splitList(process.env.EXCLUDE_REPOS, /[\s,|"']+/);
const EXCLUDE_LANGS = splitList(process.env.EXCLUDE_LANGS, /[,\t\r\n|"']+/);

if (!TOKEN) {
  console.error('ACCESS_TOKEN (or GITHUB_TOKEN) must be set.');
  process.exit(1);
}

function splitList(value, separator) {
  if (!value) return [];
  return value.split(separator).map((s) => s.trim()).filter(Boolean);
}

/** Translate a shell-style glob into a regular expression. */
function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

function matchAny(patterns, name) {
  return patterns.some((pattern) => globToRegExp(pattern).test(name));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'noahweidig-github-stats',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function graphql(query, variables) {
  const { status, body } = await request('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (status !== 200 || !body || body.errors) {
    throw new Error(
      `GraphQL request failed (${status}): ${JSON.stringify(body?.errors ?? body)}`,
    );
  }
  return body.data;
}

async function getBasicInfo() {
  const data = await graphql(`query {
    viewer {
      login
      name
      contributionsCollection { contributionYears }
    }
  }`);
  const viewer = data.viewer;

  let emails = [];
  const response = await request('https://api.github.com/user/emails');
  if (response.status === 200 && Array.isArray(response.body)) {
    emails = response.body.map((e) => e.email).filter(Boolean);
  } else {
    console.warn('Could not read user emails; token may lack `user:email`.');
  }
  if (emails.length === 0) {
    emails = [`${viewer.login}@users.noreply.github.com`];
  }

  return {
    user: viewer.login,
    name: viewer.name || viewer.login,
    years: viewer.contributionsCollection.contributionYears,
    emails,
  };
}

const REPOS_QUERY = `query ($from: DateTime, $to: DateTime) {
  viewer {
    contributionsCollection(from: $from, to: $to) {
      totalRepositoryContributions
      totalIssueContributions
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      commitContributionsByRepository(maxRepositories: 100) {
        repository {
          nameWithOwner
          stargazerCount
          forkCount
          isPrivate
          languages(first: 100, orderBy: { direction: DESC, field: SIZE }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
}`;

function isoDate(year, month) {
  const y = year + Math.floor(month / 12);
  const m = (month % 12) + 1;
  return `${y}-${String(m).padStart(2, '0')}-01T00:00:00Z`;
}

async function getReposByYear(state, year, startMonth, months) {
  const data = await graphql(REPOS_QUERY, {
    from: isoDate(year, startMonth),
    to: isoDate(year, startMonth + months),
  });
  const stats = data.viewer.contributionsCollection;
  const contributions = stats.commitContributionsByRepository;

  // GitHub caps the response at 100 repositories, so subdivide the window
  // when we hit the limit to avoid silently dropping data.
  if (contributions.length >= 100) {
    for (const factor of [2, 3]) {
      if (months % factor === 0) {
        for (let i = 0; i < factor; i += 1) {
          await getReposByYear(
            state, year, startMonth + (months / factor) * i, months / factor,
          );
        }
        return;
      }
    }
    console.warn(
      `More than 100 repos returned for ${startMonth + 1}/${year}; ` +
      'some data may be omitted due to GitHub API limitations.',
    );
  }

  state.contributions += stats.totalRepositoryContributions
    + stats.totalIssueContributions
    + stats.totalCommitContributions
    + stats.totalPullRequestContributions
    + stats.totalPullRequestReviewContributions;

  for (const { repository: raw } of contributions) {
    if (state.seen.has(raw.nameWithOwner)) continue;
    state.seen.add(raw.nameWithOwner);

    const repository = {
      name: raw.nameWithOwner,
      stars: raw.stargazerCount,
      forks: raw.forkCount,
      private: raw.isPrivate,
      languages: (raw.languages?.edges ?? []).map((edge) => ({
        name: edge.node.name,
        size: edge.size,
        color: edge.node.color,
      })),
      views: 0,
      lines_changed: 0,
    };

    const views = await request(
      `https://api.github.com/repos/${raw.nameWithOwner}/traffic/views`,
    );
    if (views.status === 200 && views.body) {
      repository.views = views.body.count ?? 0;
    }

    state.repositories.push(repository);
  }
}

/** Lines changed by `user` according to the contributor statistics API. */
async function fetchLinesChanged(repository, user) {
  const { status, body } = await request(
    `https://api.github.com/repos/${repository.name}/stats/contributors`,
  );
  if (status === 200 && Array.isArray(body)) {
    let total = 0;
    for (const author of body) {
      if (author?.author?.login !== user) continue;
      for (const week of author.weeks ?? []) {
        total += (week.a ?? 0) + (week.d ?? 0);
      }
    }
    repository.lines_changed = total;
  }
  return status;
}

/** Fallback used when the contributors API keeps rate limiting us. */
function cloneLinesChanged(repository, user, emails) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-stats-'));
  const repoPath = path.join(dir, repository.name.replace(/\//g, '_'));
  try {
    execFileSync('git', [
      'clone', '--bare', '--filter=blob:limit=1m', '--no-tags',
      '--single-branch',
      `https://${user}:${TOKEN}@github.com/${repository.name}.git`,
      repoPath,
    ], { stdio: 'ignore' });
    const log = execFileSync('git', [
      '-C', repoPath, 'log', '--numstat', '--pretty=tformat:',
      ...emails.flatMap((email) => ['--author', email]),
    ], { encoding: 'utf-8' });
    let total = 0;
    for (const line of log.split('\n')) {
      const [additions, deletions] = line.trim().split(/\s+/);
      total += (Number(additions) || 0) + (Number(deletions) || 0);
    }
    return total;
  } catch (error) {
    console.warn(`Could not clone ${repository.name}: ${error.message}`);
    return 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function getLinesChanged(repositories, user, emails) {
  for (const repository of repositories) {
    for (let attempt = 0; ; attempt += 1) {
      const status = await fetchLinesChanged(repository, user);
      if (status === 200) break;
      // 202 means GitHub is still computing the statistics; 403/429 are rate
      // limits. Both are worth a short retry before falling back to cloning.
      if (![202, 403, 429].includes(status)) {
        console.warn(`Failed to get contributors for ${repository.name} (${status})`);
        break;
      }
      if (attempt >= MAX_RETRIES) {
        console.log(`Cloning ${repository.name} to get lines changed...`);
        repository.lines_changed = cloneLinesChanged(repository, user, emails);
        break;
      }
      await sleep(1000 + Math.floor(Math.random() * 4000));
    }
  }
}

function fillTemplate(template, values) {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (match, name) => {
    if (!(name in values)) throw new Error(`Unknown template field: ${name}`);
    const value = values[name];
    return typeof value === 'number' ? value.toLocaleString('en-US') : value;
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLanguages(template, languages, total) {
  const progress = [];
  const list = [];
  languages.forEach(([name, { size, color }], i) => {
    const percent = total === 0 ? 0 : (100 * size) / total;
    const fill = color || '#000';
    progress.push(
      `<span style="background-color: ${escapeHtml(fill)}; width: ${percent.toFixed(3)}%;" class="progress-item"></span>`,
    );
    list.push(
      `<li style="animation-delay: ${(i + 1) * 150}ms;">
  <svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill: ${escapeHtml(fill)};" viewBox="0 0 16 16" version="1.1" width="16" height="16"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
  <span class="lang">${escapeHtml(name)}</span>
  <span class="percent">${percent.toFixed(2)}%</span>
</li>`,
    );
  });
  return fillTemplate(template, {
    progress: progress.join('\n'),
    lang_list: list.join('\n'),
  });
}

async function main() {
  const info = await getBasicInfo();
  console.log(`Collecting statistics for ${info.name} (${info.user})...`);

  const state = { repositories: [], seen: new Set(), contributions: 0 };
  for (const year of info.years) {
    await getReposByYear(state, year, 0, 12);
  }

  const repositories = state.repositories.filter(
    (repository) => !matchAny(EXCLUDE_REPOS, repository.name)
      && !(EXCLUDE_PRIVATE && repository.private),
  );
  await getLinesChanged(repositories, info.user, info.emails);

  const aggregate = {
    name: escapeHtml(info.name),
    contributions: state.contributions,
    stars: 0,
    forks: 0,
    lines_changed: 0,
    views: 0,
    repos: repositories.length,
  };
  const languages = new Map();
  let languagesTotal = 0;

  for (const repository of repositories) {
    aggregate.stars += repository.stars;
    aggregate.forks += repository.forks;
    aggregate.lines_changed += repository.lines_changed;
    aggregate.views += repository.views;
    for (const language of repository.languages) {
      if (matchAny(EXCLUDE_LANGS, language.name)) continue;
      const entry = languages.get(language.name) || { size: 0, color: null };
      entry.size += language.size;
      entry.color = language.color || entry.color;
      languages.set(language.name, entry);
      languagesTotal += language.size;
    }
  }

  const sorted = [...languages.entries()].sort((a, b) => b[1].size - a[1].size);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const overview = fillTemplate(
    fs.readFileSync(path.join(TEMPLATE_DIR, 'overview.svg'), 'utf-8'),
    aggregate,
  );
  const languagesSvg = renderLanguages(
    fs.readFileSync(path.join(TEMPLATE_DIR, 'languages.svg'), 'utf-8'),
    sorted,
    languagesTotal,
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, 'overview.svg'), overview);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'languages.svg'), languagesSvg);
  console.log(`Wrote overview.svg and languages.svg to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
