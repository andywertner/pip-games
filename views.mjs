import {esc, pip} from './art.mjs';

const KIND_COLOR = {club: '#ffe08a', school: '#d9e8ff', shop: '#ffd7c2'};

const SIGN_W = 150;
const SIGN_H = 86;
const SIGN_GAP = 176;
const SIGN_Y = 60;

function signBoard(item, x, y, painted) {
  const fill = KIND_COLOR[item.kind] || '#fff';
  const crack = item.cracked
    ? `<path d="M${x + 24} ${y + 10} l12 16 l-9 6 l15 20" fill="none" stroke="#c0392b" stroke-width="3"/>`
    : '';
  const star = item.sticker === 'star'
    ? `<text x="${x + SIGN_W - 24}" y="${y + 24}" font-size="22">★</text>`
    : '';
  const ribbon = item.cracked ? `${item.kind} · cracked` : item.kind;
  const mid = x + SIGN_W / 2;
  const wordY = y + 42;
  const isPainting = painted && painted.id === item.id;
  const clipId = `paint-${item.id}-${painted ? painted.serial : 0}`;
  const word = isPainting
    ? `
      <text class="old-word" x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700" fill="#555">${esc(painted.from)}</text>
      <clipPath id="${clipId}"><rect class="paint-clip" x="${x + 6}" y="${y + 6}" width="${SIGN_W - 12}" height="${SIGN_H - 12}"/></clipPath>
      <g clip-path="url(#${clipId})">
        <rect x="${x + 6}" y="${y + 6}" width="${SIGN_W - 12}" height="${SIGN_H - 30}" fill="${fill}"/>
        <text x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700">${esc(item.word)}</text>
      </g>
      <rect class="brush" x="${x + 6}" y="${y + 4}" width="12" height="${SIGN_H - 26}" rx="3" fill="#333"/>`
    : `<text x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700">${esc(item.word)}</text>`;
  return `
    <g class="${isPainting ? 'sign painting' : 'sign'}">
      <rect x="${mid - 5}" y="${y + SIGN_H - 4}" width="10" height="70" fill="#8d6b4a"/>
      <rect class="board" x="${x}" y="${y}" width="${SIGN_W}" height="${SIGN_H}" rx="6" fill="${fill}" stroke="#6b5424" stroke-width="3"/>
      ${crack}
      ${star}
      ${word}
      <text x="${mid}" y="${y + SIGN_H - 14}" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#555">${esc(ribbon)}</text>
    </g>`;
}

let lastPaintSerial = 0;
let lastPipX = null;

export function renderSign(state, level) {
  const signs = state.signs;
  // Animate each paint stroke once. Later redraws show the finished sign.
  if (state.painted && state.painted.serial !== lastPaintSerial) {
    lastPaintSerial = state.painted.serial;
  } else {
    state = {...state, painted: null};
  }
  const hasDoor = !!(state.door || level.goal.door);
  const origin = hasDoor ? 230 : 90;
  const width = origin + signs.length * SIGN_GAP + 10;
  const height = 270;
  const paintingDoor = state.painted && state.painted.id === 'door';
  const doorClip = `door-paint-${state.painted ? state.painted.serial : 0}`;
  const doorPanel = paintingDoor
    ? `
      <rect x="40" y="76" width="30" height="68" fill="${esc(state.painted.from || '#bbb')}" stroke="#333"/>
      <clipPath id="${doorClip}"><rect class="paint-clip" x="40" y="76" width="30" height="68"/></clipPath>
      <g clip-path="url(#${doorClip})">
        <rect x="40" y="76" width="30" height="68" fill="${esc(state.door)}" stroke="#333"/>
      </g>
      <rect class="brush brush-door" x="38" y="72" width="8" height="76" rx="3" fill="#333"/>`
    : `<rect x="40" y="76" width="30" height="68" fill="${esc(state.door || '#bbb')}" stroke="#333"/>`;
  const door = hasDoor ? `
    <g class="${paintingDoor ? 'door painting' : 'door'}" transform="translate(94 70)">
      <polygon points="0,44 55,8 110,44" fill="#e07a5f"/>
      <rect x="10" y="44" width="90" height="100" fill="#f6d48a" stroke="#8d6b4a"/>
      ${doorPanel}
      <circle cx="64" cy="112" r="2.5" fill="#f4d35e"/>
    </g>` : '';
  const boards = signs
    .map((item, index) => signBoard(item, origin + index * SIGN_GAP, SIGN_Y, state.painted))
    .join('');
  const pipX = state.focus === 'door'
    ? 40
    : origin + (state.cursor || 0) * SIGN_GAP - 54;
  const walkFrom = lastPipX === null ? pipX : lastPipX;
  lastPipX = pipX;
  const pipMarkup = walkFrom === pipX
    ? pip(pipX, 158)
    : `<g class="pip-walk" style="--walk-from: ${walkFrom - pipX}px">${pip(pipX, 158)}</g>`;
  return `
    <div class="scene-box">
      <svg class="scene" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pip and the signs">
        <rect width="${width}" height="${height}" fill="#c5ecff"/>
        <rect y="212" width="${width}" height="58" fill="#b6e3a8"/>
        ${door}
        ${boards}
        ${pipMarkup}
      </svg>
    </div>`;
}

function askedLabel(value) {
  return value ? 'Yes' : 'No';
}

export function renderStamps(state, level) {
  const fields = level.cardFields || [];
  const cards = state.changes.map((item, index) => {
    const bits = [];
    if (fields.includes('asked')) bits.push(`<span class="fact ${item.asked ? 'good' : 'bad'}">We asked: ${askedLabel(item.asked)}</span>`);
    if (fields.includes('check')) bits.push(`<span class="fact ${item.check === 'pass' ? 'good' : 'bad'}">Check: ${item.check === 'pass' ? 'Passed' : 'Failed'}</span>`);
    if (fields.includes('exact')) bits.push(`<span class="fact ${item.exact ? 'good' : 'bad'}">Exact: ${item.exact ? 'Yes' : 'No'}</span>`);
    const stamp = item.stamp === 'yes'
      ? '<span class="stamp yes">✅ YES</span>'
      : item.stamp === 'no'
        ? '<span class="stamp no">↩️ PUT IT BACK</span>'
        : '<span class="stamp empty">no stamp</span>';
    const here = index === state.cursor ? ' here' : '';
    return `
      <article class="change-card${here}">
        <div class="card-main">
          <header>${esc(item.title)}</header>
          <p class="diff">${esc(item.before)} → ${esc(item.after)}</p>
          <p class="facts">${bits.join(' ')}</p>
          ${item.note ? `<p class="note">${esc(item.note)}</p>` : ''}
        </div>
        ${stamp}
      </article>`;
  }).join('');
  return `
    <div class="scene-label">Pip already did this</div>
    <div class="card-list">${cards}</div>
    <svg class="pip-badge" viewBox="0 0 40 62" width="52" height="78" aria-hidden="true">${pip(2, 2)}</svg>`;
}

const TAG_LABEL = {useful: 'Helpful', old: 'Old', bossy: 'Bossy', plain: 'Note'};

function packageMarkup(target) {
  if (target.trash) return '<div class="pkg trash">♻️ Package in the recycling bin</div>';
  if (target.shop) return '<div class="pkg shop">🏪 Package left at the corner shop</div>';
  if (!target.delivered) return '<div class="pkg bag">🎒 Package still in Pip\'s bag</div>';
  const porch = target.porch === 'side' ? 'side porch' : 'front porch';
  return `<div class="pkg ok">📦 Package on the ${esc(porch)}</div>`;
}

function box(x, y) {
  return `
    <g class="box">
      <rect x="${x}" y="${y}" width="20" height="16" fill="#c9965b" stroke="#7a5426"/>
      <rect x="${x + 8}" y="${y}" width="4" height="16" fill="#e8c88f"/>
    </g>`;
}

function houseArt(target) {
  const gate = target.gate === 'open'
    ? `<polygon points="14,92 4,84 4,110 14,118" fill="#a0703e" stroke="#6b4a26"/>`
    : `<rect x="14" y="92" width="26" height="26" fill="none" stroke="#6b4a26" stroke-width="2"/>
       <line x1="21" y1="92" x2="21" y2="118" stroke="#6b4a26" stroke-width="2"/>
       <line x1="27" y1="92" x2="27" y2="118" stroke="#6b4a26" stroke-width="2"/>
       <line x1="33" y1="92" x2="33" y2="118" stroke="#6b4a26" stroke-width="2"/>`;
  const key = target.key
    ? `<g class="spare-key">
         <circle cx="140" cy="131" r="3" fill="none" stroke="#c99a06" stroke-width="2"/>
         <line x1="143" y1="131" x2="151" y2="131" stroke="#c99a06" stroke-width="2"/>
         <line x1="149" y1="131" x2="149" y2="134" stroke="#c99a06" stroke-width="2"/>
       </g>`
    : '';
  const front = target.delivered && target.porch === 'front' ? box(110, 102) : '';
  const side = target.delivered && target.porch === 'side' ? box(188, 84) : '';
  const binBox = target.trash ? box(221, 83) : '';
  return `
    <svg class="house-art" viewBox="0 0 250 140" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(target.label)}'s house">
      <rect width="250" height="140" fill="#e4f4ff"/>
      <rect y="118" width="250" height="22" fill="#b6e3a8"/>
      <line x1="0" y1="92" x2="14" y2="92" stroke="#6b4a26" stroke-width="2"/>
      <line x1="40" y1="92" x2="58" y2="92" stroke="#6b4a26" stroke-width="2"/>
      <line x1="0" y1="104" x2="14" y2="104" stroke="#6b4a26" stroke-width="2"/>
      <line x1="40" y1="104" x2="58" y2="104" stroke="#6b4a26" stroke-width="2"/>
      <rect x="11" y="88" width="3" height="30" fill="#6b4a26"/>
      <rect x="40" y="88" width="3" height="30" fill="#6b4a26"/>
      ${gate}
      <polygon points="58,62 120,22 182,62" fill="#d9634a"/>
      <rect x="64" y="60" width="112" height="58" fill="#f6d48a" stroke="#8d6b4a"/>
      <rect x="76" y="72" width="20" height="18" fill="#bfe3ff" stroke="#8d6b4a"/>
      <rect x="144" y="72" width="20" height="18" fill="#bfe3ff" stroke="#8d6b4a"/>
      <rect x="110" y="80" width="20" height="38" fill="#3c6fd1" stroke="#333"/>
      <circle cx="126" cy="100" r="1.8" fill="#f4d35e"/>
      <rect x="104" y="118" width="32" height="4" fill="#cfe8f7" stroke="#9cc3dc"/>
      <rect x="100" y="122" width="40" height="4" fill="#cfe8f7" stroke="#9cc3dc"/>
      ${key}
      <rect x="102" y="127" width="38" height="9" rx="2" fill="#8a5a2b"/>
      <text x="121" y="134" text-anchor="middle" font-size="6" font-family="sans-serif" font-weight="700" fill="#f3e2c3">WELCOME</text>
      <rect x="176" y="100" width="42" height="5" fill="#b07a45"/>
      <rect x="178" y="105" width="3" height="13" fill="#8d5f33"/>
      <rect x="213" y="105" width="3" height="13" fill="#8d5f33"/>
      <line x1="176" y1="88" x2="218" y2="88" stroke="#8d5f33" stroke-width="2"/>
      <line x1="218" y1="88" x2="218" y2="100" stroke="#8d5f33" stroke-width="2"/>
      <text x="197" y="85" text-anchor="middle" font-size="7" font-family="sans-serif" fill="#6b4a26">side porch</text>
      ${binBox}
      <rect x="221" y="96" width="20" height="22" rx="2" fill="#3a9a5b"/>
      <text x="231" y="111" text-anchor="middle" font-size="9" fill="#fff">♻</text>
      ${front}
      ${side}
    </svg>`;
}

export function renderRoute(state, level) {
  const houses = Object.values(state.houses).map((target) => `
    <article class="house">
      <h3>🏠 ${esc(target.label)}'s house</h3>
      ${houseArt(target)}
      <p class="house-facts">Gate: <b>${target.gate === 'open' ? 'open' : 'shut'}</b> · 🔑 <b>${target.key ? 'under the mat' : 'gone'}</b></p>
      ${packageMarkup(target)}
    </article>`).join('');
  const inBag = state.card.filter((stop) => {
    const target = state.houses[stop.house];
    return target && !target.delivered && !target.trash && !target.shop;
  });
  const bag = inBag.length
    ? inBag.map((stop) => `📦 for ${esc(state.houses[stop.house].label)}`).join(', ')
    : 'empty';
  const card = state.card.map((stop) => `<span class="stop">${esc(stop.label)}</span>`).join('');
  const letters = state.letters.map((letter, index) => {
    const lines = letter.lines.map((entry, lineIndex) => {
      const hot = state.inLine && state.letterIndex === index && state.lineIndex === lineIndex;
      return `<li class="${hot ? 'hot-line' : ''}">${esc(entry.text)}</li>`;
    }).join('');
    const open = level.requireHandled
      ? `<p class="handled">${letter.handled ? 'Closed' : 'Open'}</p>`
      : '';
    const hot = state.letterIndex === index ? ' hot' : '';
    return `
      <article class="letter tag-${esc(letter.tag)}${hot}">
        <header>📝 ${esc(letter.label)} <span>${esc(TAG_LABEL[letter.tag] || letter.tag)}</span></header>
        <p class="about">About ${esc(letter.aboutLabel)}</p>
        <ol>${lines}</ol>
        ${open}
      </article>`;
  }).join('');
  return `
    <div class="route-card">
      <svg class="pip-badge" viewBox="0 0 40 62" width="26" height="40" aria-hidden="true">${pip(2, 2)}</svg>
      <h3>🗺️ Route card</h3>
      ${card}
      <span class="bag">🎒 Pip's bag: ${bag}</span>
    </div>
    <div class="house-row">${houses}</div>
    <div class="scene-label">📝 Notes Pip found</div>
    <div class="letter-row">${letters}</div>`;
}
