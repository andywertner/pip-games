/**
 * Pip Draws: Pip draws what the note says. Anything the note leaves out, Pip
 * guesses. A clearer note gets a closer picture.
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const DEFAULT_COLOR = {sun: 'yellow'};

export const PLACE_LABEL = {
  middle: 'in the middle',
  rug: 'on the rug',
  sky: 'in the sky',
  hill: 'on the hill',
  pond: 'in the pond',
};

const ATTR_WORD = {color: 'colour', size: 'size', count: 'how many', place: 'where'};

export function plural(subject, count) {
  if (count === 1) return subject;
  return subject === 'fish' ? 'fish' : `${subject}s`;
}

export function newItem(subject, extra = {}) {
  return {
    subject,
    color: DEFAULT_COLOR[subject] || 'gray',
    size: 'small',
    count: 1,
    place: 'middle',
    hat: false,
    said: {},
    ...extra,
  };
}

export function beginDraw(level) {
  const items = clone((level.start && level.start.items) || []).map((item) =>
    newItem(item.subject, {...item, said: {color: true, size: true, count: true, place: true}}));
  return {
    items,
    current: items.length ? items.length - 1 : -1,
    habit: level.habit || null,
    noHat: false,
    log: [],
  };
}

function current(state) {
  return state.items[state.current] || null;
}

export const drawHandlers = {
  async draw_subject(node, state) {
    const subject = node.fields.SUBJECT;
    const item = newItem(subject);
    if (state.habit === 'hat' && !state.noHat) item.hat = true;
    state.items.push(item);
    state.current = state.items.length - 1;
    state.log.push(`Drawing a ${subject}.${item.hat ? ' I gave it a hat. I love hats.' : ''}`);
  },
  async draw_color(node, state) {
    const item = current(state);
    if (!item) {
      state.log.push('Nothing to colour yet. Draw something first.');
      return;
    }
    item.color = node.fields.COLOR;
    item.said.color = true;
    state.log.push(`Colouring the ${item.subject} ${item.color}.`);
  },
  async draw_size(node, state) {
    const item = current(state);
    if (!item) {
      state.log.push('Nothing to resize yet. Draw something first.');
      return;
    }
    item.size = node.fields.SIZE;
    item.said.size = true;
    state.log.push(`Making the ${item.subject} ${item.size}.`);
  },
  async draw_count(node, state) {
    const item = current(state);
    if (!item) {
      state.log.push('Nothing to copy yet. Draw something first.');
      return;
    }
    item.count = Number(node.fields.COUNT);
    item.said.count = true;
    state.log.push(`Drawing ${item.count} ${plural(item.subject, item.count)}.`);
  },
  async draw_place(node, state) {
    const item = current(state);
    if (!item) {
      state.log.push('Nothing to move yet. Draw something first.');
      return;
    }
    item.place = node.fields.PLACE;
    item.said.place = true;
    state.log.push(`Putting the ${item.subject} ${PLACE_LABEL[item.place]}.`);
  },
  async draw_no(_node, state) {
    state.noHat = true;
    for (const item of state.items) item.hat = false;
    state.log.push('No hat. Got it. No hats today.');
  },
  async draw_bigger(node, state) {
    const subject = node.fields.SUBJECT;
    const item = state.items.find((entry) => entry.subject === subject);
    if (!item) {
      state.log.push(`There is no ${subject} to make bigger.`);
      return;
    }
    item.size = 'big';
    item.said.size = true;
    state.log.push(`Making only the ${subject} bigger. Everything else stays the same.`);
  },
  async draw_redo(_node, state) {
    const item = current(state);
    if (!item) {
      state.log.push('Nothing to draw again yet.');
      return;
    }
    const fresh = newItem(item.subject, {size: 'big', said: {size: true}});
    if (state.habit === 'hat' && !state.noHat) fresh.hat = true;
    state.items[state.current] = fresh;
    state.log.push(`Starting the ${item.subject} over, bigger this time. Back to my usual guesses for everything else.`);
  },
};

function guessNote(item, attr) {
  return item.said[attr] ? '' : ` You did not say ${ATTR_WORD[attr]}, so Pip guessed.`;
}

export function checkDraw(state, level) {
  const attrs = level.attrs;
  const taken = new Set();
  for (const goal of level.goal.items) {
    const index = state.items.findIndex((entry, i) => entry.subject === goal.subject && !taken.has(i));
    if (index < 0) {
      return {ok: false, message: `There is no ${goal.subject} in Pip's picture.`};
    }
    taken.add(index);
    const item = state.items[index];
    const want = newItem(goal.subject, goal);
    const name = item.count > 1 ? plural(item.subject, item.count) : item.subject;
    if (attrs.includes('count') && item.count !== want.count) {
      return {
        ok: false,
        message: `Pip drew ${item.count} ${plural(item.subject, item.count)}. The picture needs ${want.count}.${guessNote(item, 'count')}`,
      };
    }
    if (attrs.includes('color') && item.color !== want.color) {
      return {ok: false, message: `The ${name} ${item.count > 1 ? 'are' : 'is'} ${item.color}. The picture needs ${want.color}.${guessNote(item, 'color')}`};
    }
    if (attrs.includes('size') && item.size !== want.size) {
      return {ok: false, message: `The ${item.subject} is ${item.size}. The picture needs ${want.size}.${guessNote(item, 'size')}`};
    }
    if (attrs.includes('place') && item.place !== want.place) {
      return {ok: false, message: `The ${item.subject} is ${PLACE_LABEL[item.place]}. It should be ${PLACE_LABEL[want.place]}.${guessNote(item, 'place')}`};
    }
    if (attrs.includes('hat') && item.hat && !want.hat) {
      return {ok: false, message: `Pip put a hat on the ${item.subject}. Pip loves hats. Tell him "no hat".`};
    }
  }
  const extra = state.items.find((_, i) => !taken.has(i));
  if (extra) {
    return {ok: false, message: `Pip also drew a ${extra.subject}. The picture does not need that.`};
  }
  return {ok: true, message: level.win};
}

const SUBJECTS = [['cat', 'cat'], ['dog', 'dog'], ['fish', 'fish'], ['sun', 'sun'], ['ball', 'ball'], ['tree', 'tree']];
const COLORS = [['orange', 'orange'], ['blue', 'blue'], ['green', 'green'], ['red', 'red'], ['purple', 'purple']];
const SIZES = [['big', 'big'], ['small', 'small']];
const COUNTS = [['2', '2'], ['3', '3']];
const PLACES = [['on the rug', 'rug'], ['in the sky', 'sky'], ['on the hill', 'hill'], ['in the pond', 'pond']];
const NOS = [['hat', 'hat']];

export const drawLevels = [
  {
    id: 1,
    goalText: 'Pip draws what the note says. Tell Pip to *draw a cat*, then press Run.',
    win: 'A cat! Pip drew exactly what the note said.',
    maxBlocks: 1,
    blocks: ['draw_subject'],
    subjectOptions: SUBJECTS,
    attrs: ['subject'],
    goal: {items: [{subject: 'cat'}]},
  },
  {
    id: 2,
    goalText: 'The picture shows an *orange* cat. If the note does not say a colour, Pip *guesses*.',
    win: 'An orange cat. When you say the colour, Pip does not have to guess.',
    maxBlocks: 2,
    blocks: ['draw_subject', 'draw_color'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    attrs: ['subject', 'color'],
    goal: {items: [{subject: 'cat', color: 'orange'}]},
  },
  {
    id: 3,
    goalText: 'A *big orange* cat. Every detail you leave out turns into a guess.',
    win: 'Big and orange. Two details, no guessing.',
    maxBlocks: 3,
    blocks: ['draw_subject', 'draw_color', 'draw_size'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    sizeOptions: SIZES,
    attrs: ['subject', 'color', 'size'],
    goal: {items: [{subject: 'cat', color: 'orange', size: 'big'}]},
  },
  {
    id: 4,
    goalText: '*Three blue fish*. If you do not say how many, Pip draws one.',
    win: 'Three blue fish. Numbers count too.',
    maxBlocks: 3,
    blocks: ['draw_subject', 'draw_color', 'draw_count'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    countOptions: COUNTS,
    attrs: ['subject', 'color', 'count'],
    goal: {items: [{subject: 'fish', color: 'blue', count: 3}]},
  },
  {
    id: 5,
    goalText: 'A cat *on the rug*. If you do not say where, Pip puts it in the middle.',
    win: 'The cat is on the rug, right where the picture shows.',
    maxBlocks: 2,
    blocks: ['draw_subject', 'draw_place'],
    subjectOptions: SUBJECTS,
    placeOptions: PLACES,
    attrs: ['subject', 'place'],
    goal: {items: [{subject: 'cat', place: 'rug'}]},
  },
  {
    id: 6,
    goalText: '*Two things*: an *orange cat on the rug* and a *sun in the sky*. Details go right after the thing they are about.',
    win: 'Cat on the rug, sun in the sky. Each detail stuck to the right thing.',
    maxBlocks: 5,
    blocks: ['draw_subject', 'draw_color', 'draw_place'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    placeOptions: PLACES,
    attrs: ['subject', 'color', 'place'],
    goal: {items: [{subject: 'cat', color: 'orange', place: 'rug'}, {subject: 'sun', place: 'sky'}]},
  },
  {
    id: 7,
    goalText: 'Pip *loves hats* and puts one on everything. The picture is a *green dog* with *no hat*. You can tell Pip what you do *not* want.',
    win: 'A green dog, no hat. Saying "no" is part of a good note.',
    maxBlocks: 3,
    habit: 'hat',
    blocks: ['draw_subject', 'draw_color', 'draw_no'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    noOptions: NOS,
    attrs: ['subject', 'color', 'hat'],
    goal: {items: [{subject: 'dog', color: 'green'}]},
  },
  {
    id: 8,
    goalText: 'Pip already drew an orange cat, but it is too *small*. You have *one block*. Fix just that one thing.',
    win: 'Bigger cat, still orange. A small fix beats starting over.',
    maxBlocks: 1,
    blocks: ['draw_bigger', 'draw_color'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    attrs: ['subject', 'color', 'size'],
    start: {items: [{subject: 'cat', color: 'orange', size: 'small'}]},
    goal: {items: [{subject: 'cat', color: 'orange', size: 'big'}]},
  },
  {
    id: 9,
    goalText: 'Pip drew a *blue dog on the hill*. It should be *big*. Two fix blocks look alike. One of them *throws away* the colour and the place.',
    win: 'Only the size changed. The colour and the place stayed. That is the fix you wanted.',
    maxBlocks: 1,
    blocks: ['draw_redo', 'draw_bigger'],
    subjectOptions: SUBJECTS,
    attrs: ['subject', 'color', 'size', 'place'],
    start: {items: [{subject: 'dog', color: 'blue', size: 'small', place: 'hill'}]},
    goal: {items: [{subject: 'dog', color: 'blue', size: 'big', place: 'hill'}]},
  },
  {
    id: 10,
    goalText: 'The whole picture in one note: a *big purple fish in the pond*, and *no hat*. Pip still loves hats.',
    win: 'Big, purple, in the pond, no hat. Nothing left for Pip to guess.',
    maxBlocks: 5,
    habit: 'hat',
    blocks: ['draw_subject', 'draw_color', 'draw_size', 'draw_place', 'draw_no'],
    subjectOptions: SUBJECTS,
    colorOptions: COLORS,
    sizeOptions: SIZES,
    placeOptions: PLACES,
    noOptions: NOS,
    attrs: ['subject', 'color', 'size', 'place', 'hat'],
    goal: {items: [{subject: 'fish', color: 'purple', size: 'big', place: 'pond'}]},
  },
];
