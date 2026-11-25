import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const videoDir = join(import.meta.dirname, '..');
const maxLineLength = 20;

function normalize(text) {
  return text.normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '');
}

function wrap(text) {
  const lines = [];
  let remaining = [...text.trim()];
  while (remaining.length > maxLineLength) {
    const window = remaining.slice(0, maxLineLength + 1);
    const comma = window.slice(0, maxLineLength).findLastIndex((character) => /[,，]/u.test(character));
    const space = window.lastIndexOf(' ');
    const end = comma >= maxLineLength / 2 ? comma + 1 : space > 0 ? space : maxLineLength;
    lines.push(remaining.slice(0, end).join('').trim());
    remaining = [...remaining.slice(end).join('').trimStart()];
  }
  if (remaining.length) lines.push(remaining.join(''));
  return Array.from({ length: Math.ceil(lines.length / 2) }, (_, index) =>
    lines.slice(index * 2, index * 2 + 2).join('\n'));
}

function ttsBoundary(previous, next, tts) {
  const before = normalize(previous);
  const after = normalize(next);
  if (tts.startsWith(before)) return before.length;
  if (tts.endsWith(after)) return tts.length - after.length;

  // Original terms can occupy several spoken words. Use nearby unchanged text as an anchor.
  const estimate = tts.length * before.length / (before.length + after.length);
  const previousWords = previous.trim().split(/\s+/u);
  const nextWords = next.trim().split(/\s+/u);
  for (const size of [2, 1]) {
    const endings = normalize(previousWords.slice(-size).join(''));
    const beginnings = normalize(nextWords.slice(0, size).join(''));
    const matches = [];
    for (const [anchor, offset] of [[endings, endings.length], [beginnings, 0]]) {
      if (!anchor || /[A-Za-z0-9]/u.test(anchor)) continue;
      for (let index = tts.indexOf(anchor); index !== -1; index = tts.indexOf(anchor, index + 1)) {
        matches.push(index + offset);
      }
    }
    if (matches.length) return matches.sort((a, b) => Math.abs(a - estimate) - Math.abs(b - estimate))[0];
  }
  return estimate;
}

function cueTimes(sentence, cues) {
  if (cues.length === 1) return [[sentence.startSec, sentence.endSec]];
  const spoken = normalize(sentence.tts);
  let character = 0;
  const words = sentence.words.flatMap((word) => {
    const length = normalize(word.text).length;
    if (!length) return [];
    const from = character;
    character += length;
    return [{ ...word, from, to: character }];
  });

  const text = cues.join(' ').replaceAll('\n', ' ');
  let cursor = 0;
  let lastPosition = 0;
  const boundaries = cues.slice(0, -1).map((cue) => {
    cursor += cue.length;
    const ideal = ttsBoundary(text.slice(0, cursor), text.slice(cursor), spoken);
    const position = Math.max(lastPosition, Math.min(character, ideal * character / spoken.length));
    lastPosition = position;
    cursor++;
    if (!words.length) {
      const time = sentence.startSec + (sentence.endSec - sentence.startSec) * ideal / spoken.length;
      return [time, time];
    }
    const index = words.findIndex(({ to }) => to >= position);
    const word = words[index];
    if (position === word.to) return [word.endSec, words[index + 1]?.startSec ?? word.endSec];
    const progress = (position - word.from) / (word.to - word.from);
    const time = word.startSec + (word.endSec - word.startSec) * progress;
    return [time, time];
  });
  return cues.map((_, index) => [
    boundaries[index - 1]?.[1] ?? sentence.startSec,
    boundaries[index]?.[0] ?? sentence.endSec,
  ]);
}

function timecode(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');
  return `${clock},${String(milliseconds % 1000).padStart(3, '0')}`;
}

async function main() {
  const manifest = JSON.parse(await readFile(join(videoDir, 'public/audio/manifest.json'), 'utf8'));
  const blocks = [];
  let lastEnd = 0;
  for (const scene of manifest.scenes) {
    for (const sentence of scene.sentences) {
      const cues = wrap(sentence.text);
      const times = cueTimes(sentence, cues);
      for (const [index, cue] of cues.entries()) {
        const [start, end] = times[index].map((relative) => Math.round((scene.audioStartSec + relative) * 1000));
        const startMillis = Math.max(lastEnd, start);
        const endMillis = Math.max(startMillis + 1, end);
        blocks.push(`${blocks.length + 1}\n${timecode(startMillis)} --> ${timecode(endMillis)}\n${cue}`);
        lastEnd = endMillis;
      }
    }
  }
  if (!blocks.length) throw new Error('manifest에 자막을 생성할 문장이 없습니다.');
  const outDir = join(videoDir, 'out');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'introduce_a2ui.ko.srt'), `${blocks.join('\n\n')}\n`);
  console.log(`video/out/introduce_a2ui.ko.srt (${blocks.length}개 큐)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
