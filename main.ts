// gta6-clipper-01 entry (Node 22, standard library only).
//
// The entry is the YouTube video itself: IShowSpeed meets an alligator in GTA 6,
// cut into a vertical Short with make.fun's pitch on its end card. This program
// only hands the video's address to the gate: it reads VIDEO.json from the
// repository root, checks the address is really a YouTube video address, and
// writes the same bytes to /output/VIDEO.json. Nothing about the video's views
// is decided here; the house reads those from YouTube itself.
//
// Local check (what the grader runs, with its own dirs):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const VIDEO_FILE = 'VIDEO.json';

function videoAddressIsUsable(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  const hostOk = parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com' || parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtube.com');
  if (!hostOk) return false;
  const id = parsed.hostname === 'youtu.be'
    ? parsed.pathname.replace(/^\//, '')
    : parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop() ?? '';
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

const sourcePath = join(REPO_ROOT, VIDEO_FILE);
const targetPath = join(OUT_DIR, VIDEO_FILE);
const contents = readFileSync(sourcePath, 'utf8');
let record: { url?: unknown };
try {
  record = JSON.parse(contents) as { url?: unknown };
} catch {
  console.error(`${VIDEO_FILE} is not valid JSON: ${sourcePath}`);
  process.exit(1);
}
if (typeof record.url !== 'string' || !videoAddressIsUsable(record.url)) {
  console.error(`${VIDEO_FILE} holds no usable YouTube video address: ${sourcePath}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(targetPath, contents);
