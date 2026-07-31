import { createServer } from 'vite';
import { build as esbuild } from 'esbuild';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import electron from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function startDev() {
  // Start Vite dev server for Renderer
  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts')
  });
  await server.listen();

  const devUrl = server.resolvedUrls?.local[0] || 'http://localhost:5173/';
  console.log(`Vite Dev Server running at: ${devUrl}`);

  // Build Main process
  await esbuild({
    entryPoints: [path.join(projectRoot, 'src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron', 'cheerio', 'sql.js'],
    outfile: path.join(projectRoot, 'dist/main/index.js'),
    format: 'cjs'
  });

  // Build Preload process
  await esbuild({
    entryPoints: [path.join(projectRoot, 'src/preload/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    outfile: path.join(projectRoot, 'dist/preload/index.js'),
    format: 'cjs'
  });

  console.log('Starting Electron...');
  const electronProcess = spawn(electron, ['.'], {
    cwd: projectRoot,
    env: { ...process.env, VITE_DEV_SERVER_URL: devUrl },
    stdio: 'inherit'
  });

  electronProcess.on('close', () => {
    server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('Dev failed:', err);
  process.exit(1);
});
