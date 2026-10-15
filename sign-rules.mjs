/**
 * Sign: Pip paints what the note says.
 * The kid writes the note. Pip does only what the blocks say.
 */

function sign(id, label, kind, word, extra = {}) {
  return {
    id,
    label,
    kind,
    word,
    sticker: extra.sticker || null,
    cracked: !!extra.cracked,
  };
}

function matches(item, test) {
  if (test === 'cracked') return !!item.cracked;
  return item.kind === test;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function beginSign(level) {
  const state = clone(level.start);
  state.cursor = 0;
  // Where Pip stands: 'sign' means beside state.signs[state.cursor], 'door' means by the door.
  state.focus = 'sign';
  state.painted = null;
  state.paintSerial = Date.now();
  state.log = [];
  return state;
}

const TEST_LABEL = {
  club: 'a club sign',
  school: 'a school sign',
  shop: 'a shop sign',
  cracked: 'cracked',
};

const ORDER = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

// The board prints club, school, or shop, never the hidden name (bakery, fort).
function seenAs(signs, item) {
  const group = signs.filter((entry) => entry.kind === item.kind && !!entry.cracked === !!item.cracked);
  const kind = item.cracked ? 'cracked club sign' : `${item.kind} sign`;
  if (group.length < 2) return kind;
  const place = group.indexOf(item);
  return `${ORDER[place] || `${place + 1}th`} ${kind}`;
}

function paint(state, item, word) {
  state.focus = 'sign';
  state.painted = {id: item.id, from: item.word, serial: ++state.paintSerial};
  state.log.push(`Painting the ${seenAs(state.signs, item)}: ${item.word} → ${word}.`);
  item.word = word;
}

export const signHandlers = {
  async sign_words(node, state) {
    const item = state.signs[state.cursor];
    if (item) paint(state, item, node.fields.WORD);
  },
  async sign_repaint(node, state) {
    const item = state.signs[state.cursor];
    if (item) {
      paint(state, item, node.fields.WORD);
      if (item.sticker) state.log.push(`I painted over the whole ${seenAs(state.signs, item)}. The star sticker is gone.`);
      item.sticker = null;
    }
  },
  async sign_door(node, state) {
    state.focus = 'door';
    state.painted = {id: 'door', from: state.door, serial: ++state.paintSerial};
    state.log.push(`Walking to the door. Painting it ${node.fields.COLOR}.`);
    state.door = node.fields.COLOR;
  },
  async sign_each(node, state, run) {
    state.log.push(`Visiting all ${state.signs.length} signs.`);
    for (let i = 0; i < state.signs.length; i++) {
      state.cursor = i;
      state.focus = 'sign';
      await run(node.inputs.DO);
    }
  },
  async sign_each_club(node, state, run) {
    state.log.push('Visiting the club signs only.');
    for (let i = 0; i < state.signs.length; i++) {
      if (state.signs[i].kind !== 'club') continue;
      state.cursor = i;
      state.focus = 'sign';
      await run(node.inputs.DO);
    }
  },
  async sign_if(node, state, run) {
    const item = state.signs[state.cursor];
    if (!item) return;
    const hit = matches(item, node.fields.TEST);
    state.log.push(`Is the ${seenAs(state.signs, item)} ${TEST_LABEL[node.fields.TEST]}? ${hit ? 'Yes.' : 'No, skipping it.'}`);
    if (hit) await run(node.inputs.DO);
  },
  async sign_if_else(node, state, run) {
    const item = state.signs[state.cursor];
    if (!item) return;
    const hit = matches(item, node.fields.TEST);
    state.log.push(`Is the ${seenAs(state.signs, item)} ${TEST_LABEL[node.fields.TEST]}? ${hit ? 'Yes.' : 'No, doing the else part.'}`);
    if (hit) await run(node.inputs.DO);
    else await run(node.inputs.ELSE);
  },
};

export function checkSign(state, level) {
  for (const goal of level.goal.signs) {
    const item = state.signs.find((entry) => entry.id === goal.id);
    if (!item) return {ok: false, message: 'A sign is missing.'};
    if (item.word !== goal.word) {
      return {
        ok: false,
        message: `The ${seenAs(state.signs, item)} says ${item.word}. It should say ${goal.word}.`,
      };
    }
    if (goal.sticker && item.sticker !== goal.sticker) {
      return {
        ok: false,
        message: `The star on the ${seenAs(state.signs, item)} is gone. "Change the sign" paints over everything. "Change the words" leaves the sticker alone.`,
      };
    }
  }
  if (level.goal.door && state.door !== level.goal.door) {
    return {
      ok: false,
      message: `The door is ${state.door || 'unpainted'}. It should be ${level.goal.door}.`,
    };
  }
  return {ok: true, message: level.win};
}

const club = (id, label, word, extra) => sign(id, label, 'club', word, extra);
const school = (id, label, word) => sign(id, label, 'school', word);
const shop = (id, label, word) => sign(id, label, 'shop', word);

export const signLevels = [
  {
    id: 1,
    goalText: 'Press Run. Pip should paint the clubhouse sign so it says *PLAY*.',
    win: 'The sign says PLAY.',
    maxBlocks: 1,
    blocks: ['sign_words'],
    wordOptions: [['PLAY', 'PLAY']],
    testOptions: [],
    starter: true,
    start: {signs: [club('club', 'clubhouse sign', 'HELLO')], door: null},
    goal: {signs: [club('club', 'clubhouse sign', 'PLAY')], door: null},
  },
  {
    id: 2,
    goalText: 'The sign should say *PLAY*, and the door should be *blue*.',
    win: 'The sign and the door are both right.',
    maxBlocks: 2,
    blocks: ['sign_words', 'sign_door'],
    wordOptions: [['PLAY', 'PLAY']],
    doorOptions: [['blue', 'blue'], ['red', 'red'], ['yellow', 'yellow']],
    testOptions: [],
    start: {signs: [club('club', 'clubhouse sign', 'HELLO')], door: 'red'},
    goal: {signs: [club('club', 'clubhouse sign', 'PLAY')], door: 'blue'},
  },
  {
    id: 3,
    goalText: 'Make *every* club sign say *PLAY*. You only get *two blocks*, so one block has to visit every sign.',
    win: 'Every club sign says PLAY.',
    maxBlocks: 2,
    blocks: ['sign_each', 'sign_words'],
    wordOptions: [['PLAY', 'PLAY']],
    testOptions: [],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO'),
        club('fort', 'fort sign', 'HELLO'),
        club('gate', 'gate sign', 'HELLO'),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'PLAY'),
        club('fort', 'fort sign', 'PLAY'),
        club('gate', 'gate sign', 'PLAY'),
      ],
      door: null,
    },
  },
  {
    id: 4,
    goalText: 'Make the *club* signs say *PLAY*. The *school* sign has to stay *SCHOOL*.',
    win: 'The club signs say PLAY, and the school sign still says SCHOOL.',
    maxBlocks: 2,
    blocks: ['sign_each_club', 'sign_each', 'sign_words'],
    wordOptions: [['PLAY', 'PLAY']],
    testOptions: [],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO'),
        club('fort', 'fort sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'PLAY'),
        club('fort', 'fort sign', 'PLAY'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
  },
  {
    id: 5,
    goalText: '*Club* signs say *PLAY*, the door is *blue*, and the *school* sign stays *SCHOOL*.',
    win: 'The clubs, the door, and the school are all correct.',
    maxBlocks: 3,
    blocks: ['sign_each_club', 'sign_each', 'sign_words', 'sign_door'],
    wordOptions: [['PLAY', 'PLAY']],
    doorOptions: [['blue', 'blue'], ['red', 'red'], ['yellow', 'yellow']],
    testOptions: [],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO'),
        club('fort', 'fort sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: 'red',
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'PLAY'),
        club('fort', 'fort sign', 'PLAY'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: 'blue',
    },
  },
  {
    id: 6,
    goalText: 'Visit every sign. Change a sign *only* when it is a *club* sign.',
    win: 'Pip checked each sign and painted only the club ones.',
    maxBlocks: 4,
    blocks: ['sign_each', 'sign_if', 'sign_words'],
    wordOptions: [['PLAY', 'PLAY']],
    testOptions: [['a club sign', 'club']],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
        club('gate', 'gate sign', 'HELLO'),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'PLAY'),
        school('school', 'school sign', 'SCHOOL'),
        club('gate', 'gate sign', 'PLAY'),
      ],
      door: null,
    },
  },
  {
    id: 7,
    goalText: 'Make the *shop* signs say *OPEN*. Leave the clubhouse and the school as they are.',
    win: 'The shops say OPEN. Everything else is untouched.',
    maxBlocks: 4,
    blocks: ['sign_each', 'sign_if', 'sign_words'],
    wordOptions: [['PLAY', 'PLAY'], ['OPEN', 'OPEN'], ['SCHOOL', 'SCHOOL']],
    testOptions: [['a club sign', 'club'], ['a school sign', 'school'], ['a shop sign', 'shop']],
    start: {
      signs: [
        shop('bakery', 'bakery sign', 'CLOSED'),
        shop('market', 'market sign', 'CLOSED'),
        club('club', 'clubhouse sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
    goal: {
      signs: [
        shop('bakery', 'bakery sign', 'OPEN'),
        shop('market', 'market sign', 'OPEN'),
        club('club', 'clubhouse sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
  },
  {
    id: 8,
    goalText: 'The club signs should say *PLAY*. Keep the *star stickers*.',
    win: 'The signs say PLAY, and the stars are still there.',
    maxBlocks: 3,
    blocks: ['sign_each', 'sign_words', 'sign_repaint'],
    wordOptions: [['PLAY', 'PLAY']],
    testOptions: [],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO', {sticker: 'star'}),
        club('fort', 'fort sign', 'HELLO', {sticker: 'star'}),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'PLAY', {sticker: 'star'}),
        club('fort', 'fort sign', 'PLAY', {sticker: 'star'}),
      ],
      door: null,
    },
  },
  {
    id: 9,
    goalText: '*Cracked* signs should say *FIX ME*. Other club signs should say *PLAY*. Leave the school alone.',
    win: 'The cracked sign asks for a fix, the other club sign says PLAY, and the school is unchanged.',
    maxBlocks: 6,
    blocks: ['sign_each', 'sign_if_else', 'sign_if', 'sign_words'],
    wordOptions: [['FIX ME', 'FIX ME'], ['PLAY', 'PLAY'], ['SCHOOL', 'SCHOOL']],
    testOptions: [['cracked', 'cracked'], ['a club sign', 'club'], ['a school sign', 'school']],
    elseTests: [['cracked', 'cracked']],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO', {cracked: true}),
        club('fort', 'fort sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'FIX ME', {cracked: true}),
        club('fort', 'fort sign', 'PLAY'),
        school('school', 'school sign', 'SCHOOL'),
      ],
      door: null,
    },
  },
  {
    id: 10,
    goalText: 'One short note for the whole street. *Cracked* signs say *FIX ME*, other *club* signs say *PLAY*, *shops* say *OPEN*, and *schools* stay *SCHOOL*.',
    win: 'One note took care of the whole street.',
    maxBlocks: 8,
    blocks: ['sign_each', 'sign_if_else', 'sign_if', 'sign_words'],
    wordOptions: [['FIX ME', 'FIX ME'], ['PLAY', 'PLAY'], ['OPEN', 'OPEN'], ['SCHOOL', 'SCHOOL']],
    testOptions: [
      ['cracked', 'cracked'],
      ['a club sign', 'club'],
      ['a school sign', 'school'],
      ['a shop sign', 'shop'],
    ],
    elseTests: [['cracked', 'cracked'], ['a club sign', 'club'], ['a shop sign', 'shop']],
    start: {
      signs: [
        club('club', 'clubhouse sign', 'HELLO', {cracked: true}),
        club('fort', 'fort sign', 'HELLO'),
        school('school', 'school sign', 'SCHOOL'),
        school('library', 'library sign', 'SCHOOL'),
        shop('bakery', 'bakery sign', 'CLOSED'),
        shop('market', 'market sign', 'CLOSED'),
      ],
      door: null,
    },
    goal: {
      signs: [
        club('club', 'clubhouse sign', 'FIX ME', {cracked: true}),
        club('fort', 'fort sign', 'PLAY'),
        school('school', 'school sign', 'SCHOOL'),
        school('library', 'library sign', 'SCHOOL'),
        shop('bakery', 'bakery sign', 'OPEN'),
        shop('market', 'market sign', 'OPEN'),
      ],
      door: null,
    },
  },
];
