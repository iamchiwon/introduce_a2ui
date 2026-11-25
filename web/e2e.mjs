// Run `npm run build` first (or `npm run e2e`). Starts `vite preview`, screenshots each case, then submits one form.
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const PORT = 4179;
const URL = `http://localhost:${PORT}/`;
const server = spawn('node_modules/.bin/vite', ['preview', '--port', String(PORT), '--strictPort'], {stdio: 'pipe'});
let browser;
const fail = msg => { console.error('FAIL', msg); process.exitCode = 1; };
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(URL)).ok) break; } catch {}
    if (i > 50) throw new Error('preview server did not start');
    await new Promise(r => setTimeout(r, 200));
  }
  mkdirSync('screenshots', {recursive: true});
  browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1280, height: 1000}});
  page.on('console', m => m.text().startsWith('[A2UI action]') && console.log(m.text()));
  page.on('pageerror', e => fail(e.message));
  await page.goto(URL);

  for (const k of ['schedule', 'golf', 'clinic', 'flight']) {
    await page.getByTestId(`tab-${k}`).click();
    await page.locator('h2').first().waitFor();
    await page.screenshot({path: `screenshots/${k}.png`, fullPage: true});
    console.log('ok screenshot', k);
  }

  // schedule: empty title -> error shown + button disabled; typing -> summary updates, submit logs action.
  await page.getByTestId('tab-schedule').click();
  const submit = page.getByRole('button', {name: '일정 저장'});
  if (!(await page.getByText('제목을 입력하세요.').isVisible())) fail('check message not shown');
  if (!(await submit.isDisabled())) fail('button should be disabled while checks fail');
  await page.getByPlaceholder('예: 팀 회의').fill('A2UI 데모');
  await page.getByText('A2UI 데모 · 2026-12-01T10:00 ~ 2026-12-01T11:00').waitFor();
  await page.getByRole('radio', {name: '매주'}).click();
  await submit.click();
  const log = page.getByTestId('agent-log');
  await log.getByText('"name": "schedule_submit"').waitFor();
  const text = await log.innerText();
  if (!text.includes('"title": "A2UI 데모"') || !text.includes('"weekly"')) fail('action context not resolved:\n' + text);
  if (await page.locator('[aria-invalid=true]').count()) fail('field still marked invalid');
  await page.waitForTimeout(300); // let transition-colors settle
  await page.screenshot({path: 'screenshots/action.png', fullPage: true});
  console.log('ok action');

} catch (e) {
  fail(e.message);
} finally {
  await browser?.close();
  server.kill();
}
