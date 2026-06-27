import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(PROJECT_ROOT, 'content-config.yaml');

interface SourceConfig {
  repo: string;
  branch: string;
}

interface ContentConfig {
  sources: Record<string, SourceConfig>;
  defaults: Record<string, string>;
  target: string;
}

function getCliSource(): string | undefined {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--content=')) {
      return arg.split('=', 2)[1];
    }
  }
  const idx = process.argv.indexOf('--content');
  if (idx !== -1 && idx < process.argv.length - 1) {
    return process.argv[idx + 1];
  }
  return undefined;
}

function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

if (!existsSync(CONFIG_PATH)) {
  console.log(`No content-config.yaml found at ${CONFIG_PATH}, skipping sync.`);
  process.exit(0);
}

let config: ContentConfig;
try {
  config = loadYaml(readFileSync(CONFIG_PATH, 'utf-8')) as ContentConfig;
} catch (err) {
  console.error(`Failed to parse ${CONFIG_PATH}:`, (err as Error).message);
  process.exit(1);
}

if (!config.sources || Object.keys(config.sources).length === 0) {
  console.log('No content sources defined in config, skipping sync.');
  process.exit(0);
}

const cliSource = getCliSource();
const envSource = process.env.CONTENT_SOURCE;
const branch = getCurrentBranch();

const sourceName = cliSource || envSource || config.defaults?.[branch];

if (!sourceName) {
  if (branch === 'unknown') {
    console.error('Not a git repository. Set CONTENT_SOURCE or pass --content=<name>.');
  } else {
    console.error(
      `No content source configured for branch "${branch}". ` +
        `Set CONTENT_SOURCE, pass --content=<name>, or add a default in content-config.yaml`,
    );
  }
  process.exit(1);
}

const source = config.sources[sourceName];
if (!source) {
  console.error(
    `Content source "${sourceName}" not found. Available: ${Object.keys(config.sources).join(', ')}`,
  );
  process.exit(1);
}

const targetDir = resolve(PROJECT_ROOT, config.target || 'src/content');

console.log(`[content] Syncing from "${sourceName}" → ${source.repo}#${source.branch}`);

if (existsSync(targetDir)) {
  execSync(`rm -rf "${targetDir}"`, { stdio: 'pipe' });
}

try {
  execSync(`git clone --depth 1 --branch "${source.branch}" "${source.repo}" "${targetDir}"`, {
    stdio: 'inherit',
  });
} catch {
  console.error(`[content] Failed to clone ${source.repo}#${source.branch}`);
  process.exit(1);
}

const gitDir = resolve(targetDir, '.git');
if (existsSync(gitDir)) {
  execSync(`rm -rf "${gitDir}"`, { stdio: 'pipe' });
}

console.log('[content] Synced successfully');
