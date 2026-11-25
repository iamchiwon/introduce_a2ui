import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { parseArgs, parseEnv } from 'node:util';

const videoDir = join(import.meta.dirname, '..');
const rootDir = join(videoDir, '..');
const audioDir = join(videoDir, 'public/audio');
const manifestPath = join(audioDir, 'manifest.json');
const model = 's2.1-pro';
const timing = { fps: 30, leadInSec: 2, gapSec: 0.8, tailSec: 5 };

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function normalizeAlignment(text) {
  return text.normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '');
}

function sentenceText(paragraph) {
  // Whitespace after the punctuation keeps version numbers such as 1.0 intact.
  return paragraph.replace(/\s+/g, ' ').trim().split(/(?<=[.!?。！？]["'”’)]?)\s+/u);
}

async function readScenes() {
  const narration = await readFile(join(rootDir, 'docs/narration.md'), 'utf8');
  const divider = /^---[ \t]*\r?$/m.exec(narration);
  if (!divider) throw new Error('narration.md에서 --- 구분선을 찾을 수 없습니다.');
  const { entries } = JSON.parse(await readFile(join(import.meta.dirname, 'pronunciation.json'), 'utf8'));
  const pronunciation = new Map(entries.map(({ from, to }) => [from, to]));
  const terms = [...pronunciation.keys()].sort((a, b) => b.length - a.length).map(RegExp.escape);
  const pattern = new RegExp(`(?<![A-Za-z0-9])(?:${terms.join('|')})(?![A-Za-z0-9])`, 'g');
  const parts = narration.slice(divider.index + divider[0].length)
    .split(/^## S(\d+)\.[ \t]+([^\r\n]+)\r?$/m);
  const scenes = [];
  for (let index = 1; index < parts.length; index += 3) {
    const [number, title, body] = parts.slice(index, index + 3);
    const id = `S${number.padStart(2, '0')}`;
    const paragraphs = body.trim().split(/\r?\n(?:[ \t]*\r?\n)+/).map(sentenceText);
    const sentences = paragraphs.flat().map((text) => ({
      text,
      tts: text.replace(pattern, (term) => pronunciation.get(term)),
    }));
    let sentenceIndex = 0;
    const ttsText = paragraphs.map((paragraph) =>
      paragraph.map(() => sentences[sentenceIndex++].tts).join(' ')).join('\n\n');
    if (!ttsText || scenes.some((scene) => scene.id === id)) {
      throw new Error(`빈 장면 또는 중복 장면입니다 (${id}).`);
    }
    scenes.push({ id, title: title.trim(), sentences, ttsText });
  }
  if (!scenes.length) throw new Error('narration.md에서 장면을 찾을 수 없습니다.');
  return scenes.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

function checkPronunciation(scenes, dryRun) {
  let valid = true;
  for (const { id, ttsText } of scenes) {
    if (dryRun) console.log(`${id}\n${ttsText}`);
    const tokens = [...new Set(ttsText.match(/[\p{Script=Latin}\p{N}]+(?:[._-][\p{Script=Latin}\p{N}]+)*/gu))];
    if (tokens.length) {
      console.error(`${id} 잔존 토큰: ${tokens.join(', ')}`);
      valid = false;
    } else if (dryRun) {
      console.log(`${id} 잔존 토큰 없음\n`);
    }
  }
  return valid;
}

async function synthesize(text, credentials) {
  const response = await fetch('https://api.fish.audio/v1/tts/stream/with-timestamp', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.FISH_AUDIO_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      model,
    },
    body: JSON.stringify({
      text,
      reference_id: credentials.VOICE_ID,
      format: 'mp3',
      normalize: true,
      language: 'ko',
      latency: 'balanced',
    }),
    signal: AbortSignal.timeout(300_000),
  }).catch((error) => { throw new Error(`Fish Audio 연결 실패 (${error.name}).`); });
  if (!response.ok) throw new Error(`Fish Audio HTTP ${response.status}.`);
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
    throw new Error('Fish Audio SSE 응답을 받지 못했습니다.');
  }

  const audioChunks = [];
  const snapshots = new Map();
  let dataLines = [];
  let eventType = '';
  function acceptEvent() {
    const data = dataLines.join('\n');
    dataLines = [];
    const isError = eventType === 'error';
    eventType = '';
    if (isError) throw new Error('Fish Audio 스트림에서 오류 이벤트를 받았습니다.');
    if (!data || data === '[DONE]') return;
    let event;
    try {
      event = JSON.parse(data);
    } catch {
      throw new Error('Fish Audio SSE 데이터가 올바른 JSON이 아닙니다.');
    }
    if (event.error) throw new Error('Fish Audio 스트림에서 오류 데이터를 받았습니다.');
    if (event.audio_base64) audioChunks.push(Buffer.from(event.audio_base64, 'base64'));
    if (event.alignment != null) snapshots.set(event.chunk_seq, event);
  }

  const lines = Readable.fromWeb(response.body).setEncoding('utf8');
  let pending = '';
  for await (const chunk of lines) {
    pending += chunk;
    const completeLines = pending.split(/\r?\n/);
    pending = completeLines.pop();
    for (const line of completeLines) {
      if (line === '') acceptEvent();
      else if (line.startsWith('event:')) eventType = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }
  if (pending.startsWith('data:')) dataLines.push(pending.slice(5).replace(/^ /, ''));
  acceptEvent();

  const audio = Buffer.concat(audioChunks);
  const chunks = [...snapshots.values()].sort((a, b) => a.chunk_seq - b.chunk_seq).map((event) => ({
    content: event.content ?? '',
    words: event.alignment.segments.map(({ text: word, start, end }) => {
      const offset = event.chunk_audio_offset_sec;
      if (![offset, start, end].every(Number.isFinite) || offset < 0 || start < 0 || end < start) {
        throw new Error('Fish Audio 단어 타임스탬프가 올바르지 않습니다.');
      }
      return { text: word, startSec: offset + start, endSec: offset + end };
    }),
  }));
  if (!audio.length || !chunks.some(({ words }) => words.length)) {
    throw new Error('Fish Audio 응답에 오디오 또는 단어 타임스탬프가 없습니다.');
  }
  return { audio, chunks };
}

function attachTiming(scene, chunks) {
  const source = normalizeAlignment(scene.ttsText);
  const chunkContent = chunks.map(({ content }) => normalizeAlignment(content)).join('');
  const hasChunkBoundaries = chunkContent === source && chunks.every(({ words }) =>
    words.some(({ text }) => normalizeAlignment(text)));
  const groups = hasChunkBoundaries ? chunks : [{ content: source, words: chunks.flatMap(({ words }) => words) }];
  let sourcePosition = 0;
  let approximate = false;
  const spans = groups.flatMap(({ content, words }) => {
    const input = normalizeAlignment(content);
    const spoken = words.map(({ text }) => normalizeAlignment(text)).join('');
    approximate ||= input !== spoken;
    const ratio = input.length / spoken.length;
    let position = sourcePosition;
    sourcePosition += input.length;
    return words.flatMap((word) => {
      const length = normalizeAlignment(word.text).length;
      if (!length) return [];
      const from = position;
      position += length * ratio;
      return [{ word, from, to: position }];
    });
  });

  let sentenceEnd = 0;
  let spanIndex = 0;
  const sentences = scene.sentences.map((sentence) => {
    const sentenceStart = sentenceEnd;
    sentenceEnd += normalizeAlignment(sentence.tts).length;
    const words = [];
    while (spanIndex < spans.length && spans[spanIndex].from < sentenceEnd - 1e-8) {
      const { word, from, to } = spans[spanIndex];
      const start = Math.max(sentenceStart, from);
      const end = Math.min(sentenceEnd, to);
      if (end > start + 1e-8) {
        const duration = word.endSec - word.startSec;
        const startRatio = (start - from) / (to - from);
        const endRatio = (end - from) / (to - from);
        let text = word.text;
        if (startRatio > 1e-8 || endRatio < 1 - 1e-8) {
          const normalized = normalizeAlignment(text);
          const first = Math.floor(startRatio * normalized.length);
          text = normalized.slice(first, Math.max(first + 1, Math.round(endRatio * normalized.length)));
        }
        words.push({ text, startSec: word.startSec + duration * startRatio, endSec: word.startSec + duration * endRatio });
      }
      if (to > sentenceEnd + 1e-8) break;
      spanIndex++;
    }
    if (!words.length) throw new Error(`${scene.id} 문장에 단어 타임스탬프를 배정할 수 없습니다.`);
    return { ...sentence, startSec: words[0].startSec, endSec: words.at(-1).endSec, words };
  });
  if (approximate) console.log(`${scene.id} 일부 문장 경계를 정렬 글자 수 비율로 보정했습니다.`);
  return sentences;
}

function probeDuration(path) {
  let duration;
  try {
    duration = Number(execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim());
  } catch {
    throw new Error('ffprobe로 MP3 길이를 확인할 수 없습니다.');
  }
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('MP3 길이가 올바르지 않습니다.');
  return duration;
}

async function readOptional(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function writeJson(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function prepareScene(scene, credentials, generate) {
  const audio = `audio/${scene.id}.mp3`;
  const mp3Path = join(videoDir, 'public', audio);
  const cachePath = join(audioDir, `${scene.id}.words.json`);
  const key = sha256(JSON.stringify([scene.ttsText, model, credentials.VOICE_ID]));
  const stored = await readOptional(cachePath);
  let cached = stored ? JSON.parse(stored) : undefined;
  const existing = cached?.key === key ? await readOptional(mp3Path) : undefined;
  let sentences;
  if (existing && cached.audioHash === sha256(existing)) {
    console.log(`${scene.id} 캐시 사용`);
    sentences = attachTiming(scene, cached.chunks);
  } else {
    if (!generate) return undefined;
    console.log(`${scene.id} Fish Audio 요청 중`);
    const { audio: bytes, chunks } = await synthesize(scene.ttsText, credentials);
    sentences = attachTiming(scene, chunks);
    const temporary = `${mp3Path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, bytes);
      cached = { key, audioHash: sha256(bytes), duration: probeDuration(temporary), chunks };
      await rename(temporary, mp3Path);
      await writeJson(cachePath, cached);
    } finally {
      await rm(temporary, { force: true });
    }
  }

  const lastWordEnd = sentences.at(-1).words.at(-1).endSec;
  console.log(`${scene.id} ffprobe ${cached.duration.toFixed(3)}초, 마지막 단어 ${lastWordEnd.toFixed(3)}초, 차이 ${(cached.duration - lastWordEnd).toFixed(3)}초`);
  return { id: scene.id, title: scene.title, audio, audioDurationSec: cached.duration, sentences };
}

async function writeManifest(scenes) {
  const storyboardFile = await readOptional(join(videoDir, 'storyboard.json'));
  const storyboard = storyboardFile ? JSON.parse(storyboardFile).scenes : undefined;
  let nextStart = 0;
  for (const [index, scene] of scenes.entries()) {
    scene.visualStartSec = nextStart;
    scene.audioStartSec = index === 0 ? timing.leadInSec : nextStart;
    const audioEnd = scene.audioStartSec + scene.audioDurationSec;
    const minSec = storyboard?.[scene.id]?.minSec ?? 0;
    nextStart = Math.max(audioEnd + timing.gapSec, scene.visualStartSec + minSec);
    scene.visualEndSec = index === scenes.length - 1 ? audioEnd + timing.tailSec : nextStart;
  }
  await writeJson(manifestPath, { model, ...timing, totalSec: scenes.at(-1).visualEndSec, scenes });
  console.log(`video/public/audio/manifest.json (${scenes.length}개 장면)`);
}

async function main() {
  const { values: options } = parseArgs({ options: {
    scene: { type: 'string' },
    'dry-run': { type: 'boolean' },
    'timeline-only': { type: 'boolean' },
  } });

  if (options['timeline-only']) {
    if (options.scene || options['dry-run']) throw new Error('--timeline-only는 단독으로 실행하세요.');
    const stored = await readOptional(manifestPath);
    const scenes = stored && JSON.parse(stored).scenes;
    if (!scenes?.length) throw new Error('타임라인을 재계산할 manifest가 없습니다.');
    await writeManifest(scenes);
    return;
  }

  const scenes = await readScenes();
  const selected = options.scene ? scenes.filter(({ id }) => id === options.scene) : scenes;
  if (!selected.length) throw new Error(`장면을 찾을 수 없습니다 (${options.scene}).`);
  if (!checkPronunciation(selected, options['dry-run'])) {
    process.exitCode = 1;
    return;
  }
  if (options['dry-run']) return;

  const env = await readOptional(join(rootDir, '.env'));
  const credentials = env ? parseEnv(env.toString()) : {};
  if (!credentials.FISH_AUDIO_API_KEY || !credentials.VOICE_ID) {
    throw new Error('저장소 루트 .env에 FISH_AUDIO_API_KEY와 VOICE_ID가 필요합니다.');
  }
  await mkdir(audioDir, { recursive: true });
  const ready = [];
  for (const scene of scenes) {
    const generate = selected.includes(scene);
    if (!generate && !checkPronunciation([scene], false)) continue;
    try {
      const entry = await prepareScene(scene, credentials, generate);
      if (entry) ready.push(entry);
    } catch (error) {
      throw new Error(`${scene.id}: ${error.message}`);
    }
  }
  await writeManifest(ready);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
