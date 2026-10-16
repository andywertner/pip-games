import {esc, pip} from './art.mjs';
import {TOOL_LABEL} from './hello-rules.mjs';
import {newItem} from './draw-rules.mjs';

const TOOL_EMOJI = {broom: '🧹', can: '🚿', brush: '🖌️'};

export function renderHello(state) {
  const lit = state.lights === 'on';
  const wall = lit ? '#fff6d5' : '#aeb3c7';
  const windowFill = lit ? '#ffe9a8' : '#5d6d9a';
  const dirt = state.floor === 'dirty'
    ? [[60, 172], [96, 184], [140, 176], [190, 186], [236, 174], [272, 183], [120, 190], [210, 178]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#8a6b4a"/>`).join('')
    : '';
  const puddle = state.floor === 'wet'
    ? '<ellipse cx="160" cy="184" rx="46" ry="8" fill="#7cc3ee" opacity="0.8"/>'
    : '';
  const plant = state.plants === 'watered'
    ? `<path d="M262 128 q-14 -22 0 -40 q14 18 0 40" fill="#4caf50"/>
       <path d="M262 132 q-24 -8 -26 -30 q22 4 26 30" fill="#5cc45f"/>
       <path d="M262 132 q24 -8 26 -30 q-22 4 -26 30" fill="#5cc45f"/>`
    : `<path d="M262 134 q-10 -8 -4 -22 q8 10 4 22" fill="#b4a06a"/>
       <path d="M262 136 q-18 2 -22 -12 q16 -2 22 12" fill="#c2b07a"/>
       <path d="M262 136 q18 2 22 -12 q-16 -2 -22 12" fill="#c2b07a"/>`;
  const sign = state.sign === 'painted'
    ? '<text x="70" y="78" text-anchor="middle" font-size="22" font-weight="700" font-family="sans-serif" fill="#2d5cb8">HI!</text>'
    : '<text x="70" y="78" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#999">blank</text>';
  const tool = state.holding
    ? `<text x="186" y="128" font-size="22" aria-label="${esc(TOOL_LABEL[state.holding])}">${TOOL_EMOJI[state.holding]}</text>`
    : '';
  const wave = state.waving
    ? `<g class="wave"><text x="178" y="104" font-size="22">👋</text></g>`
    : '';
  return `
    <div class="scene-box">
      <svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pip in the clubhouse">
        <rect width="320" height="200" fill="${wall}"/>
        <rect y="160" width="320" height="40" fill="${lit ? '#d9b382' : '#8f7a5c'}"/>
        <rect x="200" y="30" width="70" height="56" fill="${windowFill}" stroke="#5a4634" stroke-width="3"/>
        <line x1="235" y1="30" x2="235" y2="86" stroke="#5a4634" stroke-width="3"/>
        <line x1="200" y1="58" x2="270" y2="58" stroke="#5a4634" stroke-width="3"/>
        <rect x="30" y="52" width="80" height="44" rx="5" fill="#ffe08a" stroke="#6b5424" stroke-width="3"/>
        ${sign}
        <rect x="248" y="134" width="28" height="26" rx="3" fill="#c9661f"/>
        ${plant}
        ${dirt}
        ${puddle}
        ${pip(142, 102)}
        ${tool}
        ${wave}
      </svg>
    </div>`;
}

const COLOR_HEX = {
  gray: '#9a9a9a',
  orange: '#f28c28',
  blue: '#3d7be8',
  green: '#4caf50',
  red: '#e04b4b',
  purple: '#9b59b6',
  yellow: '#f4d35e',
};

const PLACE_XY = {middle: [100, 82], rug: [100, 112], sky: [100, 34], hill: [163, 78], pond: [45, 118]};

function hatArt() {
  return `<rect x="-8" y="-22" width="16" height="3" fill="#222"/><rect x="-5" y="-31" width="10" height="10" fill="#222"/>`;
}

function subjectArt(item) {
  const c = COLOR_HEX[item.color] || COLOR_HEX.gray;
  const stroke = 'stroke="#333" stroke-width="1"';
  switch (item.subject) {
    case 'cat':
      return `
        <path d="M11 8 q10 -2 9 -12" fill="none" stroke="${c}" stroke-width="3"/>
        <ellipse cx="0" cy="8" rx="12" ry="8" fill="${c}" ${stroke}/>
        <polygon points="-9,-10 -7,-20 -1,-12" fill="${c}" ${stroke}/>
        <polygon points="9,-10 7,-20 1,-12" fill="${c}" ${stroke}/>
        <circle cx="0" cy="-6" r="9" fill="${c}" ${stroke}/>
        <circle cx="-3.5" cy="-7" r="1.3" fill="#222"/><circle cx="3.5" cy="-7" r="1.3" fill="#222"/>
        <polygon points="-1.5,-3 1.5,-3 0,-1" fill="#e07a9a"/>`;
    case 'dog':
      return `
        <path d="M11 6 q8 -4 6 -12" fill="none" stroke="${c}" stroke-width="3"/>
        <ellipse cx="0" cy="8" rx="12" ry="8" fill="${c}" ${stroke}/>
        <circle cx="0" cy="-6" r="9" fill="${c}" ${stroke}/>
        <ellipse cx="-9" cy="-3" rx="3.2" ry="6.5" fill="#333" opacity="0.55"/>
        <ellipse cx="9" cy="-3" rx="3.2" ry="6.5" fill="#333" opacity="0.55"/>
        <circle cx="-3.5" cy="-8" r="1.3" fill="#222"/><circle cx="3.5" cy="-8" r="1.3" fill="#222"/>
        <ellipse cx="0" cy="-2.5" rx="2.4" ry="1.6" fill="#222"/>
        <path d="M-1 0 q1 4 3 1" fill="#e07a9a"/>`;
    case 'fish':
      return `
        <polygon points="11,0 20,-8 20,8" fill="${c}" ${stroke}/>
        <ellipse cx="0" cy="0" rx="13" ry="7.5" fill="${c}" ${stroke}/>
        <circle cx="-6" cy="-2" r="1.5" fill="#222"/>
        <path d="M-2 -7 q4 -1 7 3" fill="none" stroke="#333" stroke-width="0.8" opacity="0.6"/>`;
    case 'sun':
      return `
        ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) =>
          `<line x1="0" y1="-12" x2="0" y2="-17" stroke="${c}" stroke-width="2.5" transform="rotate(${deg})"/>`).join('')}
        <circle cx="0" cy="0" r="9.5" fill="${c}" ${stroke}/>`;
    case 'ball':
      return `
        <circle cx="0" cy="0" r="11" fill="${c}" ${stroke}/>
        <path d="M-10.5 -3 q10.5 6 21 0" fill="none" stroke="#fff" stroke-width="3"/>`;
    case 'tree':
      return `
        <rect x="-3" y="0" width="6" height="15" fill="#8d6b4a"/>
        <circle cx="0" cy="-5" r="11" fill="${c}" ${stroke}/>`;
    default:
      return `<circle r="10" fill="${c}"/>`;
  }
}

function drawScene(items, label) {
  const shapes = items.map((item) => {
    const [cx, cy] = PLACE_XY[item.place] || PLACE_XY.middle;
    const scale = item.size === 'big' ? 1.6 : 1;
    const offsets = item.count === 3 ? [-34, 0, 34] : item.count === 2 ? [-22, 22] : [0];
    return offsets.map((dx) => `
      <g transform="translate(${cx + dx} ${cy}) scale(${scale})">
        ${subjectArt(item)}
        ${item.hat ? hatArt() : ''}
      </g>`).join('');
  }).join('');
  return `
    <svg class="draw-scene" viewBox="0 0 200 150" role="img" aria-label="${esc(label)}">
      <rect width="200" height="150" fill="#d6f0ff"/>
      <rect y="100" width="200" height="50" fill="#b6e3a8"/>
      <ellipse cx="165" cy="106" rx="46" ry="22" fill="#9ad27f"/>
      <ellipse cx="45" cy="128" rx="34" ry="12" fill="#7cc3ee" stroke="#5aa6d6"/>
      <rect x="66" y="118" width="68" height="20" rx="5" fill="#d98c5f" stroke="#a8603a"/>
      <line x1="74" y1="118" x2="74" y2="138" stroke="#a8603a"/>
      <line x1="126" y1="118" x2="126" y2="138" stroke="#a8603a"/>
      ${shapes}
    </svg>`;
}

export function renderDraw(state, level) {
  const target = level.goal.items.map((goal) => newItem(goal.subject, goal));
  return `
    <div class="draw-panels">
      <figure class="draw-panel">
        <figcaption>Make this</figcaption>
        ${drawScene(target, 'The picture to make')}
      </figure>
      <figure class="draw-panel pip-panel">
        <figcaption>Pip drew</figcaption>
        ${drawScene(state.items, "Pip's drawing")}
      </figure>
    </div>
    <svg class="pip-badge" viewBox="0 0 40 62" width="52" height="78" aria-hidden="true">${pip(2, 2)}</svg>`;
}
