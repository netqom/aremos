import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';
import * as path from 'path';
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;
export function ensureDir(p: string) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }
export function isAllowedMime(mime: string) { return ALLOWED.has(mime); }
export function extFor(mime: string) { if (mime==='image/jpeg') return '.jpg'; if (mime==='image/png') return '.png'; if (mime==='image/webp') return '.webp'; return ''; }
export async function saveMultipartFileToLocal(file: any, baseDir: string) {
  const mime = file.mimetype; if (!isAllowedMime(mime)) throw new Error('Dateityp nicht erlaubt (nur jpg/png/webp)');
  ensureDir(baseDir); const ext = extFor(mime); const filename = randomUUID()+ext; const full = path.join(baseDir, filename);
  let written = 0;
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(full);
    file.file.on('data', (chunk: Buffer) => { written += chunk.length; if (written > MAX_BYTES) { ws.destroy(); try { unlinkSync(full); } catch {} reject(new Error('Datei zu groß (max. 10 MB)')); } });
    file.file.on('error', (err: any) => reject(err));
    file.file.on('end', () => resolve());
    file.file.pipe(ws);
  });
  return { filename, mime, path: full };
}
export function deleteLocalFile(fullPath: string) { try { unlinkSync(fullPath); } catch {} }