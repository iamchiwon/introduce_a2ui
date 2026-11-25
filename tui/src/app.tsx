import React, {useEffect, useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {readFileSync} from 'node:fs';
import {ComponentContext, MessageProcessor} from '@a2ui/web_core';
import {inkCatalog} from './catalog.js';

export const CASES = ['schedule', 'golf', 'clinic', 'flight'];
// @a2ui/react's A2uiSurface hosts every node in a DOM custom element, so it can't run in Ink.
// This walks the tree and calls each implementation's DOM-free `render` (GenericBinder wrapper).
// ponytail: static tree only; subscribe to surface.componentsModel if updateComponents must re-render.
function InkSurface({surface}: {surface: any}) {
  const build = (id: string, base = '/'): React.ReactNode => {
    const m = surface.componentsModel.get(id);
    const impl = m && surface.defaultCatalog.components.get(m.type);
    if (!impl) return <Text color="red">[unknown {m?.type ?? id}]</Text>;
    const Render = impl.render;
    return <Render key={id} context={ctx(id, base)} buildChild={build} />;
  };
  const cache = useMemo(() => new Map<string, ComponentContext>(), [surface]);
  const ctx = (id: string, base: string) => {
    const k = base + '#' + id;
    if (!cache.has(k)) cache.set(k, new ComponentContext(surface, id, base));
    return cache.get(k)!;
  };
  return <>{build('root')}</>;
}

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../fixtures/${name}.json`, import.meta.url), 'utf8'));

function Surface({name}: {name: string}) {
  const [log, setLog] = useState<string[]>([]);
  const surface = useMemo(() => {
    const p = new MessageProcessor([inkCatalog]);
    p.processMessages(load(name).messages);
    return [...p.model.surfacesMap.values()][0];
  }, [name]);
  useEffect(() => {
    const sub = surface.onAction.subscribe((a: unknown) => setLog(l => [...l, JSON.stringify(a)]));
    return () => sub.unsubscribe();
  }, [surface]);
  return (
    <Box flexDirection="column" width={72}>
      <InkSurface surface={surface} />
      <Text dimColor>Tab/Shift+Tab 이동 · ←/→ 조절 · Space 선택 · Enter 버튼 · Ctrl+C 종료</Text>
      <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1}>
        <Text bold>Agent log</Text>
        {log.length ? log.map((l, i) => <Text key={i}>{l}</Text>) : <Text dimColor>(no actions yet)</Text>}
      </Box>
    </Box>
  );
}

export function App({initial}: {initial?: string}) {
  const [name, setName] = useState(initial && CASES.includes(initial) ? initial : undefined);
  useInput(i => { const n = Number(i); if (!name && n >= 1 && n <= CASES.length) setName(CASES[n - 1]); }, {isActive: !name});
  if (name) return <Surface name={name} />;
  return (
    <Box flexDirection="column">
      <Text bold>A2UI TUI — 케이스 선택 (숫자 키)</Text>
      {CASES.map((c, i) => <Text key={c}>{i + 1}. {c} — {load(c).name}</Text>)}
    </Box>
  );
}
