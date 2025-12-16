import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const packsDir = path.join(repoRoot, 'e2e', 'packs');
const tmpDir = path.join(packsDir, '.tmp');

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...opts,
  });
}

function ensureEmptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function listWorkspacePackages() {
  const packagesRoot = path.join(repoRoot, 'packages');
  const dirs = fs
    .readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesRoot, entry.name));

  return dirs
    .map((dir) => {
      const pkgJsonPath = path.join(dir, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) return null;
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      return { dir, name: pkg.name, private: Boolean(pkg.private) };
    })
    .filter((pkg) => pkg && typeof pkg.name === 'string' && pkg.name.startsWith('@error-mock/'))
    .filter((pkg) => !pkg.private);
}

function stableTarballName(pkgName) {
  return `${pkgName.replace('@', '').replace('/', '-')}.tgz`;
}

function packOne({ dir, name }) {
  ensureEmptyDir(tmpDir);
  run('pnpm', ['-C', dir, 'pack', '--pack-destination', tmpDir]);

  const tgzs = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.tgz'));
  if (tgzs.length !== 1) {
    throw new Error(`Expected 1 tarball in ${tmpDir}, got ${tgzs.length}: ${tgzs.join(', ')}`);
  }

  const from = path.join(tmpDir, tgzs[0]);
  const to = path.join(packsDir, stableTarballName(name));
  fs.rmSync(to, { force: true });
  fs.renameSync(from, to);
  ensureEmptyDir(tmpDir);
  return to;
}

function main() {
  fs.mkdirSync(packsDir, { recursive: true });
  ensureEmptyDir(tmpDir);

  const pkgs = listWorkspacePackages();
  if (pkgs.length === 0) {
    throw new Error('No @error-mock/* packages found under ./packages');
  }

  // Build all packages first so dist/ exists for packing.
  run('pnpm', ['-r', '--filter', '@error-mock/*', 'build']);

  console.log(`\n[pack] Packing ${pkgs.length} packages into ${path.relative(repoRoot, packsDir)}/`);
  const results = pkgs.map((pkg) => packOne(pkg));

  console.log('\n[pack] Done:');
  for (const file of results) {
    console.log(`- ${path.relative(repoRoot, file)}`);
  }
}

main();
