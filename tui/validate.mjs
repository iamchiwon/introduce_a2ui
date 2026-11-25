// Runs each fixture through @a2ui/web_core and fails on any processing error.
import {readFileSync, readdirSync} from 'node:fs';
import {MessageProcessor} from '@a2ui/web_core';
import {basicCatalog} from '@a2ui/web_core/catalogs/basic/v1';
const dir = new URL('../fixtures/', import.meta.url);
let bad = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const {messages} = JSON.parse(readFileSync(new URL(f, dir)));
  const p = new MessageProcessor([basicCatalog]);
  try {
    p.processMessages(messages);
    const s = [...p.model.surfacesMap.values()][0];
    console.log('ok', f, s.id, 'components:', s.componentsModel.size ?? [...s.componentsModel.entries?.() ?? []].length);
  } catch (e) { bad++; console.error('FAIL', f, e.message, JSON.stringify(e.details ?? '', null, 1)?.slice(0, 1500)); }
}
process.exit(bad);
