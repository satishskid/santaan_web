import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const ASSETS_DIR = path.join(PROJECT_ROOT, 'public', 'assets');

const LIMITS = {
  anyMaxBytes: 800_000,
  pngMaxBytes: 400_000,
  logoMaxBytes: 120_000,
  textureMaxBytes: 250_000,
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)}KB`;
  return `${(kb / 1024).toFixed(2)}MB`;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function shouldCheck(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'].includes(ext);
}

function relativeFromRoot(filePath) {
  return path.relative(PROJECT_ROOT, filePath);
}

function pickLimit(filePath, size) {
  const rel = relativeFromRoot(filePath).replaceAll(path.sep, '/');
  const ext = path.extname(filePath).toLowerCase();

  if (rel.endsWith('/santaan-logo.png')) {
    return { limit: LIMITS.logoMaxBytes, label: 'logoMaxBytes' };
  }
  if (rel.endsWith('/wonder-of-life-texture.png')) {
    return { limit: LIMITS.textureMaxBytes, label: 'textureMaxBytes' };
  }
  if (ext === '.png') {
    return { limit: LIMITS.pngMaxBytes, label: 'pngMaxBytes' };
  }
  return { limit: LIMITS.anyMaxBytes, label: 'anyMaxBytes' };
}

async function main() {
  const strict = process.argv.includes('--strict') || process.env.ASSETS_STRICT === '1';
  const assetsDirExists = await fileExists(ASSETS_DIR);
  if (!assetsDirExists) {
    console.log(`No public/assets directory found at ${ASSETS_DIR}`);
    return;
  }

  const allFiles = (await listFilesRecursive(ASSETS_DIR)).filter(shouldCheck);
  const stats = await Promise.all(
    allFiles.map(async (filePath) => {
      const s = await fs.stat(filePath);
      return { filePath, size: s.size };
    })
  );

  const offenders = [];
  for (const item of stats) {
    const { limit, label } = pickLimit(item.filePath, item.size);
    if (item.size > limit) {
      offenders.push({
        filePath: item.filePath,
        size: item.size,
        limit,
        label,
      });
    }
  }

  const top = stats
    .slice()
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .map((x) => `${formatBytes(x.size)}  ${relativeFromRoot(x.filePath)}`);

  console.log('Largest public/assets images:');
  for (const line of top) console.log(`- ${line}`);

  if (offenders.length === 0) {
    console.log('Asset size check passed.');
    return;
  }

  offenders.sort((a, b) => b.size - a.size);
  console.log(`\nAsset size check ${strict ? 'failed' : 'found oversize files'} . Offenders:`);
  for (const o of offenders) {
    console.log(
      `- ${formatBytes(o.size)} (limit ${formatBytes(o.limit)} via ${o.label})  ${relativeFromRoot(o.filePath)}`
    );
  }

  if (strict) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
