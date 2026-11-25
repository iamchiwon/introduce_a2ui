// 번역 자막: docs/narration.<lang>.json + manifest 문장 시간 → out/introduce_a2ui.<lang>.srt
// 사용: node video/scripts/srt-translate.mjs en
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const lang = process.argv[2] ?? 'en';
const videoDir = join(import.meta.dirname, '..');
const root = join(videoDir, '..');
const maxLine = 42; // 유튜브 권장 줄 길이
const minCue = 1.0;

const manifest = JSON.parse(await readFile(join(videoDir, 'public/audio/manifest.json'), 'utf8'));
const { sentences: table } = JSON.parse(await readFile(join(root, `docs/narration.${lang}.json`), 'utf8'));

function wrap(text) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/u)) {
    if (line && (line + ' ' + word).length > maxLine) { lines.push(line); line = word; }
    else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

const stamp = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const cues = [];
const missing = [];
for (const scene of manifest.scenes) {
  scene.sentences.forEach((s, i) => {
    const key = `${scene.id}.${i}`;
    const row = table[key];
    // 원문이 바뀌었으면 번역도 다시 해야 한다
    if (!row || row.ko !== s.text) { missing.push(key); return; }
    const start = scene.audioStartSec + s.startSec;
    const end = scene.audioStartSec + s.endSec;
    const lines = wrap(row.en);
    let groups = [];
    for (let j = 0; j < lines.length; j += 2) groups.push(lines.slice(j, j + 2));
    // 너무 짧게 쪼개지면 한 큐로 합친다
    if (groups.length > 1 && (end - start) / groups.length < minCue) groups = [lines];
    const total = groups.reduce((n, g) => n + g.join(' ').length, 0);
    let t = start;
    for (const g of groups) {
      const d = (end - start) * g.join(' ').length / total;
      cues.push({ start: t, end: t + d, text: g.join('\n') });
      t += d;
    }
  });
}
if (missing.length) {
  console.error(`번역 누락 또는 원문 불일치: ${missing.join(', ')}`);
  process.exit(1);
}
for (let i = 1; i < cues.length; i++) {
  if (cues[i].start < cues[i - 1].end - 1e-6) throw new Error(`큐 겹침: #${i}`);
}
const out = join(videoDir, 'out', `introduce_a2ui.${lang}.srt`);
await mkdir(join(videoDir, 'out'), { recursive: true });
await writeFile(out, cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));
console.log(`${out} (${cues.length}개 큐)`);
