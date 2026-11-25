// Ink catalog for the A2UI v1.0 basic catalog: web_core APIs/functions + @a2ui/react binder, Ink views.
import React, {useState} from 'react';
import {Box, Text, useFocus, useInput} from 'ink';
import {Catalog} from '@a2ui/web_core';
import {
  basicCatalog, BASIC_FUNCTIONS, ButtonApi, CardApi, CheckBoxApi, ChoicePickerApi, ColumnApi,
  DateTimeInputApi, DividerApi, RowApi, SliderApi, TextApi, TextFieldApi,
} from '@a2ui/web_core/catalogs/basic/v1';
import {createComponentImplementation as impl} from '@a2ui/react';

const Errors = ({p}: {p: any}) =>
  p.validationErrors?.length ? <Text color="red">{p.validationErrors.map((e: string) => `⚠ ${e}`).join('  ')}</Text> : null;

// Labeled, focusable field shell. `onKey` receives Ink's (input, key) while focused.
function Field({p, onKey, children}: {p: any; onKey: (i: string, k: any) => void; children: React.ReactNode}) {
  const {isFocused} = useFocus();
  useInput(onKey, {isActive: isFocused});
  return (
    <Box flexDirection="column" flexGrow={p.weight} flexBasis={p.weight ? 0 : undefined}>
      {p.label && <Text color={isFocused ? 'cyan' : undefined} bold={isFocused}>{isFocused ? '▸ ' : '  '}{p.label}</Text>}
      <Box paddingLeft={2}>{children}</Box>
      <Box paddingLeft={2}><Errors p={p} /></Box>
    </Box>
  );
}

const Kids = ({ids, build}: {ids?: any[]; build: (id: string) => React.ReactNode}) =>
  <>{(ids ?? []).map((id, i) => <React.Fragment key={i}>{build(id)}</React.Fragment>)}</>;

// ISO date/time step helpers (value kinds: "YYYY-MM-DD", "HH:MM", "YYYY-MM-DDTHH:MM").
function shift(v: string, p: any, days: number, mins: number) {
  const date = p.enableDate !== false && /^\d{4}-\d{2}-\d{2}/.test(v || 'x') || (p.enableDate && !v);
  const base = v || (p.enableDate ? new Date().toISOString().slice(0, 10) : '09:00');
  const d = new Date(Date.UTC(2000, 0, 1));
  if (date) d.setTime(Date.parse(base.slice(0, 10) + 'T00:00Z'));
  const t = base.match(/(\d{2}):(\d{2})/);
  if (t) d.setUTCHours(+t[1], +t[2]);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCMinutes(d.getUTCMinutes() + mins);
  const iso = d.toISOString();
  let out = date ? iso.slice(0, 10) : '';
  if (t) out += (date ? 'T' : '') + iso.slice(11, 16);
  if (p.min && out < p.min) out = v; // ISO strings compare lexically
  if (p.max && out > p.max) out = v;
  return out;
}

const components = [
  impl(CardApi, ({props, buildChild}) => (
    <Box borderStyle="round" paddingX={1} flexDirection="column">{props.child && buildChild(props.child as string)}</Box>
  )),
  impl(ColumnApi, ({props, buildChild}) => (
    <Box flexDirection="column" gap={1} flexGrow={(props as any).weight}><Kids ids={props.children as any} build={buildChild} /></Box>
  )),
  impl(RowApi, ({props, buildChild}) => (
    <Box flexDirection="row" gap={2} alignItems={props.align === 'end' ? 'flex-end' : undefined} flexGrow={(props as any).weight}>
      <Kids ids={props.children as any} build={buildChild} />
    </Box>
  )),
  impl(TextApi, ({props}) => {
    const s = String(props.text ?? '');
    const h = s.match(/^#+\s*(.*)$/s);
    return <Box flexGrow={(props as any).weight}><Text bold={!!h} dimColor={props.variant === 'caption'}>{h ? h[1] : s}</Text></Box>;
  }),
  impl(DividerApi, () => <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} />),
  impl(TextFieldApi, ({props: p}) => {
    const v = String(p.value ?? '');
    return (
      <Field p={p} onKey={(i, k) => {
        if (k.backspace || k.delete) p.setValue?.(v.slice(0, -1));
        else if (k.return && p.variant === 'longText') p.setValue?.(v + '\n');
        else if (i && !k.ctrl && !k.meta && !k.tab && !k.return && !k.upArrow && !k.downArrow && !k.leftArrow && !k.rightArrow) p.setValue?.(v + i);
      }}>
        <Text>{v ? v : <Text dimColor>{p.placeholder ?? ''}</Text>}<Text dimColor>▁</Text></Text>
      </Field>
    );
  }),
  impl(CheckBoxApi, ({props: p}) => (
    <Field p={{...p, label: undefined}} onKey={i => i === ' ' && p.setValue?.(!p.value)}>
      <Text>{p.value ? '[x]' : '[ ]'} {p.label}</Text>
    </Field>
  )),
  impl(ChoicePickerApi, ({props: p}) => {
    const [cur, setCur] = useState(0);
    const opts = p.options ?? [];
    const sel: string[] = Array.isArray(p.value) ? p.value : [];
    const multi = p.variant === 'multipleSelection';
    return (
      <Field p={p} onKey={(i, k) => {
        if (k.leftArrow) setCur(c => Math.max(0, c - 1));
        if (k.rightArrow) setCur(c => Math.min(opts.length - 1, c + 1));
        if (i === ' ') {
          const v = opts[cur].value;
          p.setValue?.(multi ? (sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]) : [v]);
        }
      }}>
        <Box gap={1} flexWrap="wrap">
          {opts.map((o: any, i: number) => {
            const on = sel.includes(o.value);
            const mark = p.displayStyle === 'chips' ? '' : multi ? (on ? '[x] ' : '[ ] ') : on ? '(•) ' : '( ) ';
            const chip = p.displayStyle === 'chips';
            return <Text key={o.value} inverse={chip && on} underline={i === cur}>{chip ? (on ? `[${o.label}]` : ` ${o.label} `) : mark + o.label}</Text>;
          })}
        </Box>
      </Field>
    );
  }),
  impl(SliderApi, ({props: p}) => {
    const min = p.min ?? 0, max = p.max ?? 100, v = Number(p.value ?? min);
    const step = p.steps ? (max - min) / p.steps : 1;
    const n = Math.round(((v - min) / (max - min || 1)) * 20);
    return (
      <Field p={p} onKey={(_, k) => {
        if (k.leftArrow) p.setValue?.(Math.max(min, v - step));
        if (k.rightArrow) p.setValue?.(Math.min(max, v + step));
      }}>
        <Text>{min} {'━'.repeat(n)}●{'─'.repeat(20 - n)} {max}  <Text bold>{v}</Text></Text>
      </Field>
    );
  }),
  impl(DateTimeInputApi, ({props: p}) => {
    const v = String(p.value ?? '');
    const dateOnly = p.enableDate && !p.enableTime;
    return (
      <Field p={p} onKey={(_, k) => {
        // ←/→: ±1 day (or ±30 min for time-only); ↑/↓: ±30 min when time is enabled.
        const day = p.enableDate || dateOnly;
        if (k.leftArrow) p.setValue?.(shift(v, p, day ? -1 : 0, day ? 0 : -30));
        if (k.rightArrow) p.setValue?.(shift(v, p, day ? 1 : 0, day ? 0 : 30));
        if (p.enableTime && k.upArrow) p.setValue?.(shift(v, p, 0, 30));
        if (p.enableTime && k.downArrow) p.setValue?.(shift(v, p, 0, -30));
      }}>
        <Text>◀ {v.replace('T', ' ') || '----'} ▶</Text>
      </Field>
    );
  }),
  impl(ButtonApi, ({props: p, buildChild}) => {
    const {isFocused} = useFocus();
    const ok = p.isValid !== false;
    useInput((_, k) => { if (k.return && ok) p.action?.(); }, {isActive: isFocused});
    return (
      <Box flexDirection="column">
        <Box borderStyle={isFocused ? 'bold' : 'round'} borderColor={!ok ? 'gray' : isFocused ? 'cyan' : 'green'} paddingX={1} alignSelf="flex-start">
          {!ok ? <Text dimColor>{'(비활성) '}</Text> : null}{p.child && buildChild(p.child as string)}
        </Box>
        <Errors p={p} />
      </Box>
    );
  }),
];

export const inkCatalog = new Catalog(basicCatalog.id, '1.0', components as any, BASIC_FUNCTIONS);
