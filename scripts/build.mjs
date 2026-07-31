import { build as viteBuild } from 'vite';
import { build as esbuild } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function buildAll() {
  console.log('Building Renderer with Vite...');
  await viteBuild({
    configFile: path.join(projectRoot, 'vite.config.ts')
  });

  console.log('Building Main process...');
  await esbuild({
    entryPoints: [path.join(projectRoot, 'src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron', 'cheerio', 'sql.js'],
    outfile: path.join(projectRoot, 'dist/main/index.js'),
    format: 'cjs'
  });

  console.log('Building Preload process...');
  await esbuild({
    entryPoints: [path.join(projectRoot, 'src/preload/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    outfile: path.join(projectRoot, 'dist/preload/index.js'),
    format: 'cjs'
  });

  console.log('Build completed successfully!');
}

buildAll().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
