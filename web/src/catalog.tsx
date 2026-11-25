// Basic Catalog v1 rendered with shadcn/ui: schemas come from web_core, only the views are replaced.
import type {CSSProperties, ReactNode} from 'react';
import {Catalog} from '@a2ui/web_core';
import {
  basicCatalog,
  ButtonApi,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DateTimeInputApi,
  DividerApi,
  RowApi,
  SliderApi,
  TextApi,
  TextFieldApi,
} from '@a2ui/web_core/catalogs/basic/v1';
import {createComponentImplementation, type ReactCatalogComponent} from '@a2ui/react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Separator} from '@/components/ui/separator';
import {Slider} from '@/components/ui/slider';
import {Textarea} from '@/components/ui/textarea';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';

type ChildRef = string | {id: string; basePath: string};
type Build = (id: string, basePath?: string) => ReactNode;

const flex = (weight?: number): CSSProperties | undefined =>
  weight ? {flex: weight, minWidth: 0} : undefined;
const build = (b: Build, c: ChildRef) => (typeof c === 'string' ? b(c) : b(c.id, c.basePath));
const key = (c: ChildRef) => (typeof c === 'string' ? c : `${c.basePath}/${c.id}`);
const ALIGN = {start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch'} as const;
const JUSTIFY = {
  start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch',
  spaceBetween: 'space-between', spaceAround: 'space-around', spaceEvenly: 'space-evenly',
} as const;

function Field({label, errors, style, children}: {
  label?: string; errors?: string[]; style?: CSSProperties; children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" style={style}>
      {label && <Label>{label}</Label>}
      {children}
      {errors?.map(e => <p key={e} className="text-destructive text-xs">{e}</p>)}
    </div>
  );
}

const Text = createComponentImplementation(TextApi, ({props}) => {
  const text = String(props.text ?? '');
  const h = /^(#{1,6})\s+(.*)$/.exec(text); // ponytail: only headings; add a markdown lib if agents send more
  if (h) return <h2 className="text-xl font-semibold" style={flex(props.weight)}>{h[2]}</h2>;
  return (
    <p className={props.variant === 'caption' ? 'text-muted-foreground text-sm' : ''} style={flex(props.weight)}>
      {text}
    </p>
  );
});

const box = (dir: 'row' | 'column') => ({props, buildChild}: {
  props: {children?: ChildRef[]; align?: keyof typeof ALIGN; justify?: keyof typeof JUSTIFY; weight?: number};
  buildChild: Build;
}) => (
  <div
    className="flex gap-4"
    style={{
      flexDirection: dir,
      alignItems: ALIGN[props.align ?? 'stretch'],
      justifyContent: JUSTIFY[props.justify ?? 'start'],
      ...flex(props.weight),
    }}
  >
    {(props.children ?? []).map(c => <div key={key(c)} style={{display: 'contents'}}>{build(buildChild, c)}</div>)}
  </div>
);
const Row = createComponentImplementation(RowApi, box('row'));
const Column = createComponentImplementation(ColumnApi, box('column'));

const CardImpl = createComponentImplementation(CardApi, ({props, buildChild}) => (
  <Card style={flex(props.weight)}>
    <CardContent>{build(buildChild, props.child as ChildRef)}</CardContent>
  </Card>
));

const Divider = createComponentImplementation(DividerApi, ({props}) => (
  <Separator orientation={props.axis ?? 'horizontal'} style={flex(props.weight)} />
));

const ButtonImpl = createComponentImplementation(ButtonApi, ({props, buildChild}) => (
  <Button
    variant={props.variant === 'primary' ? 'default' : props.variant === 'borderless' ? 'link' : 'outline'}
    disabled={props.isValid === false}
    onClick={() => void props.action?.()}
    style={flex(props.weight)}
  >
    {build(buildChild, props.child as ChildRef)}
  </Button>
));

const TextField = createComponentImplementation(TextFieldApi, ({props}) => {
  const common = {
    value: String(props.value ?? ''),
    placeholder: props.placeholder,
    'aria-invalid': props.isValid === false || undefined,
    onChange: (e: {target: {value: string}}) => props.setValue(e.target.value),
  };
  return (
    <Field label={props.label} errors={props.validationErrors} style={flex(props.weight)}>
      {props.variant === 'longText' ? (
        <Textarea {...common} />
      ) : (
        <Input {...common} type={props.variant === 'obscured' ? 'password' : props.variant === 'number' ? 'number' : 'text'} />
      )}
    </Field>
  );
});

const CheckBox = createComponentImplementation(CheckBoxApi, ({props, context}) => {
  const id = `cb-${context.componentModel.id}-${context.dataContext.path}`;
  return (
    <Field errors={props.validationErrors} style={flex(props.weight)}>
      <div className="flex items-center gap-2">
        <Checkbox id={id} checked={!!props.value} onCheckedChange={v => props.setValue(v === true)} />
        <Label htmlFor={id}>{props.label}</Label>
      </div>
    </Field>
  );
});

const ChoicePicker = createComponentImplementation(ChoicePickerApi, ({props, context}) => {
  const value = (props.value ?? []) as string[];
  const multi = props.variant === 'multipleSelection';
  const opts = props.options ?? [];
  let control: ReactNode;
  if (props.displayStyle === 'chips') {
    control = multi ? (
      <ToggleGroup type="multiple" variant="outline" className="flex-wrap" value={value} onValueChange={v => props.setValue(v)}>
        {opts.map(o => <ToggleGroupItem key={o.value} value={o.value}>{String(o.label)}</ToggleGroupItem>)}
      </ToggleGroup>
    ) : (
      <ToggleGroup type="single" variant="outline" className="flex-wrap" value={value[0] ?? ''} onValueChange={v => props.setValue(v ? [v] : [])}>
        {opts.map(o => <ToggleGroupItem key={o.value} value={o.value}>{String(o.label)}</ToggleGroupItem>)}
      </ToggleGroup>
    );
  } else if (multi) {
    control = opts.map(o => (
      <Label key={o.value} className="font-normal">
        <Checkbox
          checked={value.includes(o.value)}
          onCheckedChange={c => props.setValue(c ? [...value, o.value] : value.filter(v => v !== o.value))}
        />
        {String(o.label)}
      </Label>
    ));
  } else {
    control = (
      <RadioGroup value={value[0] ?? ''} onValueChange={v => props.setValue([v])}>
        {opts.map(o => (
          <Label key={o.value} className="font-normal">
            <RadioGroupItem value={o.value} id={`${context.componentModel.id}-${o.value}`} />
            {String(o.label)}
          </Label>
        ))}
      </RadioGroup>
    );
  }
  return <Field label={props.label} errors={props.validationErrors} style={flex(props.weight)}>{control}</Field>;
});

const SliderImpl = createComponentImplementation(SliderApi, ({props}) => {
  const min = props.min ?? 0;
  const max = props.max;
  const value = Number(props.value ?? min);
  return (
    <Field label={props.label ? `${props.label}: ${value}` : undefined} errors={props.validationErrors} style={flex(props.weight)}>
      <Slider
        min={min}
        max={max}
        step={props.steps ? (max - min) / props.steps : 1}
        value={[value]}
        onValueChange={([v]) => props.setValue(v)}
      />
    </Field>
  );
});

// Native inputs exchange the same ISO strings A2UI uses (YYYY-MM-DD, HH:mm, YYYY-MM-DDTHH:mm).
const DateTimeInput = createComponentImplementation(DateTimeInputApi, ({props}) => {
  const date = props.enableDate ?? false;
  const time = props.enableTime ?? false;
  const type = date && time ? 'datetime-local' : time ? 'time' : 'date';
  return (
    <Field label={props.label} errors={props.validationErrors} style={flex(props.weight)}>
      <Input
        type={type}
        value={String(props.value ?? '')}
        min={props.min}
        max={props.max}
        aria-invalid={props.isValid === false || undefined}
        onChange={e => props.setValue(e.target.value)}
      />
    </Field>
  );
});

export const shadcnCatalog = new Catalog<ReactCatalogComponent>(
  basicCatalog.id, // same id as fixtures' catalogId
  '1.0',
  [Text, Row, Column, CardImpl, Divider, ButtonImpl, TextField, CheckBox, ChoicePicker, SliderImpl, DateTimeInput],
  Array.from(basicCatalog.functions.values()),
);
