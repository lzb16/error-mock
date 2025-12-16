import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const packsDir = path.join(repoRoot, 'e2e', 'packs');
const consumersRoot = path.join(repoRoot, 'e2e', 'consumers');

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...opts,
  });
}

function toFileSpec(fromDir, targetFile) {
  const rel = path.relative(fromDir, targetFile).replace(/\\/g, '/');
  return `file:${rel.startsWith('.') ? rel : `./${rel}`}`;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyDir(src, dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
}

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function ensurePacksExist() {
  const required = [
    'error-mock-core.tgz',
    'error-mock-parser.tgz',
    'error-mock-ui.tgz',
    'error-mock-plugin.tgz',
  ];
  const missing = required.filter((f) => !fs.existsSync(path.join(packsDir, f)));
  if (missing.length === 0) return;

  console.log('[e2e] Missing packs, running e2e:pack...');
  run(process.execPath, [path.join(repoRoot, 'scripts', 'e2e-pack.mjs')]);
}

function prepareViteConsumer() {
  const consumerDir = path.join(consumersRoot, 'vite');
  fs.rmSync(consumerDir, { recursive: true, force: true });
  fs.mkdirSync(consumerDir, { recursive: true });

  // Copy example source (no workspace-specific config).
  const exampleDir = path.join(repoRoot, 'examples', 'vite-example');
  copyDir(path.join(exampleDir, 'src'), path.join(consumerDir, 'src'));
  copyFile(path.join(exampleDir, 'index.html'), path.join(consumerDir, 'index.html'));
  const tsconfig = JSON.parse(fs.readFileSync(path.join(exampleDir, 'tsconfig.json'), 'utf8'));
  delete tsconfig.extends;
  writeJson(path.join(consumerDir, 'tsconfig.json'), tsconfig);

  // Consumer Vite config: import plugin from installed package.
  writeText(
    path.join(consumerDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
  server: {
    port: 4173,
    strictPort: true,
  },
});
`
  );

  const pkg = {
    name: 'error-mock-e2e-vite-consumer',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@error-mock/plugin': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-plugin.tgz')),
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      typescript: '^5.3.0',
      vite: '^5.0.10',
    },
    pnpm: {
      overrides: {
        '@error-mock/core': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-core.tgz')),
        '@error-mock/parser': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-parser.tgz')),
        '@error-mock/ui': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-ui.tgz')),
      },
    },
  };

  writeJson(path.join(consumerDir, 'package.json'), pkg);
  return consumerDir;
}

function prepareUmi3Consumer() {
  const consumerDir = path.join(consumersRoot, 'umi3');
  fs.rmSync(consumerDir, { recursive: true, force: true });
  fs.mkdirSync(consumerDir, { recursive: true });

  const exampleDir = path.join(repoRoot, 'examples', 'umi3-example');
  copyFile(path.join(exampleDir, '.umirc.ts'), path.join(consumerDir, '.umirc.ts'));
  copyFile(path.join(exampleDir, 'tsconfig.json'), path.join(consumerDir, 'tsconfig.json'));

  // Copy only real source, exclude any generated Umi folders that may exist.
  const srcDir = path.join(consumerDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });
  for (const sub of ['api', 'pages', 'utils']) {
    const from = path.join(exampleDir, 'src', sub);
    if (!fs.existsSync(from)) continue;
    copyDir(from, path.join(srcDir, sub));
  }

  const pkg = {
    name: 'error-mock-e2e-umi3-consumer',
    private: true,
    scripts: {
      dev: 'NODE_OPTIONS=--openssl-legacy-provider umi dev',
      build: 'NODE_OPTIONS=--openssl-legacy-provider umi build',
    },
    dependencies: {
      react: '^17.0.2',
      'react-dom': '^17.0.2',
      umi: '^3.5.41',
    },
    devDependencies: {
      '@error-mock/plugin': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-plugin.tgz')),
      '@types/react': '^17.0.0',
      '@types/react-dom': '^17.0.0',
      typescript: '^4.9.5',
    },
    pnpm: {
      overrides: {
        '@error-mock/core': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-core.tgz')),
        '@error-mock/parser': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-parser.tgz')),
        '@error-mock/ui': toFileSpec(consumerDir, path.join(packsDir, 'error-mock-ui.tgz')),
      },
    },
  };

  writeJson(path.join(consumerDir, 'package.json'), pkg);
  return consumerDir;
}

function installConsumer(consumerDir) {
  console.log(`\n[e2e] Installing deps in ${path.relative(repoRoot, consumerDir)}/`);
  execFileSync('pnpm', ['install', '--ignore-workspace'], { cwd: consumerDir, stdio: 'inherit' });
}

function main() {
  ensurePacksExist();

  fs.rmSync(consumersRoot, { recursive: true, force: true });
  fs.mkdirSync(consumersRoot, { recursive: true });

  const viteDir = prepareViteConsumer();
  const umiDir = prepareUmi3Consumer();

  installConsumer(viteDir);
  installConsumer(umiDir);

  console.log('\n[e2e] Ready:');
  console.log(`- Vite: pnpm -C ${path.relative(repoRoot, viteDir)} dev`);
  console.log(`- Umi3: pnpm -C ${path.relative(repoRoot, umiDir)} dev`);
}

main();
