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
  if (target.trash) return '<div class="pkg trash">🗑️ In the trash</div>';
  if (target.shop) return '<div class="pkg shop">🏪 Left at the shop</div>';
  if (!target.delivered) return '<div class="pkg bag">🎒 Still in Pip\'s bag</div>';
  const porch = target.porch === 'side' ? 'Side porch' : 'Front porch';
  return `<div class="pkg ok">📦 ${esc(porch)}</div>`;
}

export function renderRoute(state, level) {
  const houses = Object.values(state.houses).map((target) => `
    <article class="house">
      <div class="door" style="background:${esc(target.door)}"></div>
      <div class="house-facts">
        <h3>🏠 ${esc(target.label)}</h3>
        <p>Mat: <b>${esc(target.mat)}</b> · Key: <b>${target.key ? 'on the hook' : 'gone'}</b></p>
        ${packageMarkup(target)}
      </div>
    </article>`).join('');
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
        <header>✉️ ${esc(letter.label)} <span>${esc(TAG_LABEL[letter.tag] || letter.tag)}</span></header>
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
    </div>
    <div class="scene-label">Houses</div>
    <div class="house-row">${houses}</div>
    <div class="scene-label">Letters</div>
    <div class="letter-row">${letters}</div>`;
}
