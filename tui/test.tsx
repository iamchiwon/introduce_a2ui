// npm test: renders the 4 fixtures (snapshot vs screens/*.txt) and drives the golf form end to end.
import React from 'react';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {stripVTControlCharacters as strip} from 'node:util';
import {render} from 'ink-testing-library';
import {App, CASES} from './src/app.js';

const tick = () => new Promise(r => setTimeout(r, 60));
const UPDATE = process.env.UPDATE === '1';
mkdirSync('screens', {recursive: true});

for (const c of CASES) {
  const r = render(<App initial={c} />);
  await tick();
  const frame = strip(r.lastFrame()!);
  const file = `screens/${c}.txt`;
  if (UPDATE || !existsSync(file)) writeFileSync(file, frame + '\n');
  assert.equal(frame + '\n', readFileSync(file, 'utf8'), `snapshot ${c}`);
  assert.match(frame, /Agent log/);
  r.unmount();
  console.log('ok snapshot', c);
}

// golf: course(1) date(2) tee(3) players(4) cart(5) caddie(6) request(7) submit(8)
const r = render(<App initial="golf" />);
const frame = () => strip(r.lastFrame()!);
const keys = async (...ks: string[]) => { for (const k of ks) { r.stdin.write(k); await tick(); } };
const TAB = '\t', RIGHT = '\u001B[C', LEFT = '\u001B[D', ENTER = '\r';
await tick();

// required checks fail: button disabled + messages
assert.match(frame(), /\(비활성\) 예약하기/);
assert.match(frame(), /⚠ 골프장을 선택하세요\.\s+⚠ 티타임을 선택하세요\./);

await keys(TAB, ' ');                       // course = skyhill
assert.doesNotMatch(frame(), /골프장을 선택하세요/);
assert.match(frame(), /\(비활성\)/);        // teeTime still required
await keys(...Array(7).fill(TAB), ENTER);   // Enter on disabled button: no action
assert.match(frame(), /no actions yet/);

await keys(...Array(3).fill(TAB), RIGHT, RIGHT, ' '); // wrap to course, → tee, pick 08:00
assert.match(frame(), /2026-12-06 \["08:00"\] · 4명/); // formatString follows data model (arrays interpolate as JSON)
await keys(TAB, LEFT);                              // players 4 → 3
assert.match(frame(), /2026-12-06 \["08:00"\] · 3명/);
await keys(TAB, TAB, ' ', TAB, '클', '럽');         // caddie off, request text
assert.match(frame(), /클럽▁/);
assert.doesNotMatch(frame(), /\(비활성\)/);
await keys(TAB, ENTER);                             // submit
const log = frame().match(/\{"name":"golf_submit".*/s)?.[0] ?? '';
const flat = log.replace(/[│\n ]/g, '');
for (const kv of ['"course":["skyhill"]', '"teeTime":["08:00"]', '"players":3', '"caddie":false', '"cart":true', '"request":"클럽"', '"date":"2026-12-06"'])
  assert.ok(flat.includes(kv), `action payload has ${kv}:\n${log}`);
console.log(frame());
r.unmount();
console.log('ok golf interaction');
