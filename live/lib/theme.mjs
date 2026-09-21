const fallback = Object.freeze({
  page: '#0f1413',
  surface: '#18201d',
  surfaceRaised: '#202a26',
  selected: '#29352f',
  border: '#405048',
  borderStrong: '#78a88f',
  text: '#e2ebe6',
  muted: '#9aaca3',
  dim: '#8fa299',
  accent: '#8fe0bd',
  success: '#65d6a6',
  warning: '#e8c56b',
  error: '#ef8f86',
  user: '#d7e78e',
  parent: '#8fe0bd',
  worker: '#c5a7e8',
  tool: '#80b8ec',
  memory: '#8ed3a8',
  native: '#e8b879'
});

const hex = value => `#${value.toString(16).padStart(2, '0')}`;
const rgb = (red, green, blue) => `${hex(red)}${hex(green).slice(1)}${hex(blue).slice(1)}`;

function xterm(index) {
  if (index < 0 || index > 255) return undefined;
  const basic = [
    '#000000','#800000','#008000','#808000','#000080','#800080','#008080','#c0c0c0',
    '#808080','#ff0000','#00ff00','#ffff00','#0000ff','#ff00ff','#00ffff','#ffffff'
  ];
  if (index < 16) return basic[index];
  if (index < 232) {
    const value=index-16, red=Math.floor(value/36), green=Math.floor(value%36/6), blue=value%6;
    const channel=n=>n===0?0:55+n*40;
    return rgb(channel(red),channel(green),channel(blue));
  }
  const gray=8+(index-232)*10;
  return rgb(gray,gray,gray);
}

export function ansiToHex(value) {
  if (typeof value !== 'string') return undefined;
  const truecolor=value.match(/\x1b\[(?:38|48);2;(\d{1,3});(\d{1,3});(\d{1,3})m/);
  if (truecolor) {
    const channels=truecolor.slice(1).map(Number);
    if (channels.every(channel=>channel>=0&&channel<=255)) return rgb(...channels);
  }
  const indexed=value.match(/\x1b\[(?:38|48);5;(\d{1,3})m/);
  return indexed?xterm(Number(indexed[1])):undefined;
}

function foreground(theme, token) {
  try{return ansiToHex(theme?.getFgAnsi?.(token));}catch{return undefined;}
}
function background(theme, token) {
  try{return ansiToHex(theme?.getBgAnsi?.(token));}catch{return undefined;}
}
function first(...values){return values.find(Boolean);}

export function createThemeSnapshot(ui) {
  const theme=ui?.theme;
  const accent=first(foreground(theme,'accent'),fallback.accent);
  const colors={
    page:first(background(theme,'toolPendingBg'),background(theme,'selectedBg'),fallback.page),
    surface:first(background(theme,'userMessageBg'),background(theme,'customMessageBg'),fallback.surface),
    surfaceRaised:first(background(theme,'customMessageBg'),background(theme,'toolSuccessBg'),fallback.surfaceRaised),
    selected:first(background(theme,'selectedBg'),fallback.selected),
    border:first(foreground(theme,'borderMuted'),foreground(theme,'border'),fallback.border),
    borderStrong:accent,
    text:first(foreground(theme,'text'),foreground(theme,'toolOutput'),fallback.text),
    muted:first(foreground(theme,'muted'),fallback.muted),
    dim:first(foreground(theme,'muted'),fallback.dim),
    accent,
    success:first(foreground(theme,'success'),fallback.success),
    warning:first(foreground(theme,'warning'),fallback.warning),
    error:first(foreground(theme,'error'),fallback.error),
    // Keep the live map monochrome: each active Pi theme contributes one identity color.
    user:accent,
    parent:accent,
    worker:accent,
    tool:accent,
    memory:accent,
    native:accent
  };
  let available=[];
  try{available=(ui?.getAllThemes?.()??[]).map(item=>item?.name).filter(Boolean);}catch{}
  return {
    name:theme?.name||'Pi fallback',
    colorMode:theme?.getColorMode?.()||'truecolor',
    available:[...new Set(available)],
    colors
  };
}

export function themeEvent(ui) {
  const theme=createThemeSnapshot(ui);
  return {
    kind:'theme',
    from:'parent',
    to:'parent',
    title:'Pi theme',
    text:theme.name,
    status:'observed',
    details:{theme}
  };
}
