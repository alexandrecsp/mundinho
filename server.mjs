// Servidor estático sem dependências. Módulos ES não carregam por file://,
// então o portal precisa de um servidor, mesmo que local.
//   node server.mjs          → só neste computador
//   node server.mjs --rede   → também no tablet/celular da mesma rede Wi-Fi
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';

const root = import.meta.dirname;
const port = Number(process.env.PORT ?? 8123);
const onNetwork = process.argv.includes('--rede');
const host = onNetwork ? '0.0.0.0' : 'localhost';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

async function resolveFile(pathname) {
  const path = normalize(join(root, decodeURIComponent(pathname)));
  if (path !== root && !path.startsWith(root + sep)) return null;
  const info = await stat(path).catch(() => null);
  if (!info) return null;
  if (!info.isDirectory()) return { path, info };
  const index = join(path, 'index.html');
  const indexInfo = await stat(index).catch(() => null);
  return indexInfo ? { path: index, info: indexInfo } : null;
}

const server = createServer(async (request, response) => {
  const file = await resolveFile(new URL(request.url, 'http://localhost').pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Não encontrado');
    return;
  }

  const headers = {
    'content-type': TYPES[extname(file.path)] ?? 'application/octet-stream',
    'accept-ranges': 'bytes',
    'cache-control': 'no-cache',
  };

  // Safari só toca vídeo quando o servidor responde a pedidos de intervalo.
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.range ?? '');
  if (range) {
    const start = Number(range[1] || 0);
    const end = range[2] ? Math.min(Number(range[2]), file.info.size - 1) : file.info.size - 1;
    response.writeHead(206, {
      ...headers,
      'content-range': `bytes ${start}-${end}/${file.info.size}`,
      'content-length': end - start + 1,
    });
    createReadStream(file.path, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, { ...headers, 'content-length': file.info.size });
  createReadStream(file.path).pipe(response);
});

server.on('error', (error) => {
  if (error.code !== 'EADDRINUSE') throw error;
  console.error(`\n  A porta ${port} já está em uso. Tente outra: PORT=8124 npm start\n`);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`\n  Mundinho rodando em http://localhost:${port}`);
  if (onNetwork) {
    for (const address of Object.values(networkInterfaces()).flat()) {
      if (address?.family === 'IPv4' && !address.internal) {
        console.log(`  Na rede local:      http://${address.address}:${port}`);
      }
    }
  }
  console.log('');
});
