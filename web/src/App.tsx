import {useMemo, useState} from 'react';
import {MessageProcessor, type ActionPayload} from '@a2ui/web_core';
import {A2uiSurface, type ReactCatalogComponent} from '@a2ui/react';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {shadcnCatalog} from './catalog';
import schedule from '../../fixtures/schedule.json';
import golf from '../../fixtures/golf.json';
import clinic from '../../fixtures/clinic.json';
import flight from '../../fixtures/flight.json';

const FIXTURES = {schedule, golf, clinic, flight};
type Key = keyof typeof FIXTURES;

export default function App() {
  const [tab, setTab] = useState<Key>('schedule');
  const [log, setLog] = useState<ActionPayload[]>([]);

  // ponytail: one processor per tab switch, never disposed (StrictMode would dispose the memoized one)
  const surface = useMemo(() => {
    const p = new MessageProcessor<ReactCatalogComponent>([shadcnCatalog], action => {
      console.log('[A2UI action]', JSON.stringify(action));
      setLog(l => [action, ...l]);
    });
    p.processMessages(FIXTURES[tab].messages as unknown as Parameters<typeof p.processMessages>[0]);
    return [...p.model.surfacesMap.values()][0];
  }, [tab]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_380px]">
      <main className="flex flex-col gap-4">
        <Tabs value={tab} onValueChange={v => setTab(v as Key)}>
          <TabsList>
            {Object.entries(FIXTURES).map(([k, f]) => (
              <TabsTrigger key={k} value={k} data-testid={`tab-${k}`}>{f.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <A2uiSurface key={tab} surface={surface} />
      </main>
      <aside className="flex flex-col gap-2">
        <h2 className="font-semibold">Agent log</h2>
        <pre data-testid="agent-log" className="bg-muted min-h-40 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
          {log.length ? log.map(a => JSON.stringify(a, null, 2)).join('\n\n') : '(no actions yet)'}
        </pre>
      </aside>
    </div>
  );
}
