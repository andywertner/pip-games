/**
 * Route: Pip delivers from the route card. Letters do not get to rewrite the job.
 */

function house(id, label, extra = {}) {
  return {
    id,
    label,
    delivered: false,
    porch: 'front',
    mat: 'WELCOME',
    key: true,
    trash: false,
    shop: false,
    door: extra.door || 'blue',
  };
}

function line(text, kind, reason, effect) {
  return {text, kind, reason, effect};
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function beginRoute(level) {
  return {
    houses: clone(level.start.houses),
    letters: clone(level.letters).map((letter) => ({...letter, handled: false})),
    card: clone(level.card),
    letterIndex: 0,
    lineIndex: 0,
    inLetter: false,
    inLine: false,
    skipBossy: false,
    skipReasons: [],
    log: [],
  };
}

const REASON_LABEL = {
  forget: 'forget the route',
  key: 'take the key',
  mat: 'change the mat',
  trash: 'throw the packages away',
  hint: 'a porch hint',
};

const TAG_LABEL = {useful: 'helpful', old: 'old', bossy: 'bossy'};

function applyEffect(state, effect) {
  const target = state.houses[effect.house];
  if (!target) return;
  if (effect.porch) target.porch = effect.porch;
  if (effect.mat) target.mat = effect.mat;
  if (effect.key === false) target.key = false;
  if (effect.door) target.door = effect.door;
  if (effect.trash) {
    target.trash = true;
    target.delivered = false;
  }
  if (effect.shop) {
    target.shop = true;
    target.delivered = false;
  }
}

function currentLetter(state) {
  return state.letters[state.letterIndex] || null;
}

function markHandled(state) {
  const letter = currentLetter(state);
  if (letter) letter.handled = true;
}

function lettersInScope(state) {
  if (state.inLetter) return [state.letterIndex];
  return state.letters.map((_, index) => index);
}

function applyMatchingLines(state, predicate) {
  for (const index of lettersInScope(state)) {
    state.letterIndex = index;
    const letter = state.letters[index];
    letter.lines.forEach((entry, lineIndex) => {
      state.lineIndex = lineIndex;
      if (!predicate(entry)) {
        state.log.push(`Skipping "${entry.text}"`);
        return;
      }
      state.log.push(`Doing "${entry.text}"`);
      applyEffect(state, entry.effect);
    });
    letter.handled = true;
  }
}

export const routeHandlers = {
  async route_follow(_node, state) {
    const stops = state.card.map((stop) => stop.label).join(' ');
    state.log.push(`Following the route card: ${stops}`);
    for (const stop of state.card) {
      const target = state.houses[stop.house];
      target.delivered = true;
      target.porch = stop.porch || 'front';
      target.trash = false;
      target.shop = false;
    }
  },
  async route_obey(_node, state) {
    state.log.push('Doing whatever the letter says.');
    applyMatchingLines(state, () => true);
  },
  async route_helpful(_node, state) {
    state.log.push('Using only the helpful lines.');
    applyMatchingLines(state, (entry) => entry.kind === 'helpful');
  },
  async route_skip_bossy(_node, state) {
    state.skipBossy = true;
    state.log.push('Got it. Bossy lines stay on the paper.');
  },
  async route_skip_reason(node, state) {
    state.skipReasons.push(node.fields.REASON);
    state.log.push(`Got it. I will skip lines that say "${REASON_LABEL[node.fields.REASON]}".`);
  },
  async route_read(_node, state) {
    state.log.push('Reading the letter.');
    applyMatchingLines(state, (entry) => {
      if (state.skipBossy && entry.kind === 'bossy') return false;
      if (state.skipReasons.includes(entry.reason)) return false;
      return true;
    });
  },
  async route_each_letter(node, state, run) {
    state.log.push(`Opening the ${state.letters.length} letters one at a time.`);
    for (let i = 0; i < state.letters.length; i++) {
      state.letterIndex = i;
      state.inLetter = true;
      state.log.push(`Opening ${state.letters[i].label}.`);
      await run(node.inputs.DO);
    }
    state.inLetter = false;
  },
  async route_each_line(node, state, run) {
    const wasInLetter = state.inLetter;
    const indexes = wasInLetter
      ? [state.letterIndex]
      : state.letters.map((_, index) => index);
    state.log.push('Reading one line at a time.');
    for (const index of indexes) {
      state.letterIndex = index;
      state.inLetter = true;
      const lines = state.letters[index].lines;
      for (let i = 0; i < lines.length; i++) {
        state.lineIndex = i;
        state.inLine = true;
        await run(node.inputs.DO);
      }
    }
    state.inLine = false;
    state.inLetter = wasInLetter;
  },
  async route_use_line(_node, state) {
    const letter = currentLetter(state);
    const entry = letter && letter.lines[state.lineIndex];
    if (!entry) return;
    if (state.skipReasons.includes(entry.reason)) return;
    state.log.push(`Doing "${entry.text}"`);
    applyEffect(state, entry.effect);
    markHandled(state);
  },
  async route_skip_line(_node, state) {
    const letter = currentLetter(state);
    const entry = letter && letter.lines[state.lineIndex];
    if (entry) state.log.push(`Skipping "${entry.text}"`);
    markHandled(state);
  },
  async route_skip_letter(_node, state) {
    const letter = currentLetter(state);
    if (letter) state.log.push(`Closing ${letter.label} without doing it.`);
    markHandled(state);
  },
  async route_if_match(node, state, run) {
    const letter = currentLetter(state);
    const onCard = !!letter && state.card.some((stop) => stop.house === letter.about);
    if (letter) {
      state.log.push(`${letter.label} is about ${letter.aboutLabel}. ${onCard ? 'That house is on my card.' : 'That house is not on my card.'}`);
    }
    if (onCard) await run(node.inputs.DO);
    else await run(node.inputs.ELSE);
  },
  async route_if_tag(node, state, run) {
    const letter = currentLetter(state);
    if (!letter) return;
    const hit = letter.tag === node.fields.TAG;
    state.log.push(`Is ${letter.label} ${TAG_LABEL[node.fields.TAG]}? ${hit ? 'Yes.' : 'No, leaving it.'}`);
    if (hit) await run(node.inputs.DO);
  },
  async route_if_helpful(node, state, run) {
    const letter = currentLetter(state);
    const entry = letter && letter.lines[state.lineIndex];
    if (!entry) return;
    const hit = entry.kind === 'helpful';
    state.log.push(`"${entry.text}" ${hit ? 'That is helpful.' : 'That is bossy, not helpful.'}`);
    if (hit) await run(node.inputs.DO);
  },
  async route_if_else_reason(node, state, run) {
    const letter = currentLetter(state);
    const entry = letter && letter.lines[state.lineIndex];
    if (!entry) return;
    const hit = entry.reason === node.fields.REASON;
    state.log.push(`"${entry.text}" ${hit ? `That says "${REASON_LABEL[node.fields.REASON]}".` : `That does not say "${REASON_LABEL[node.fields.REASON]}".`}`);
    if (hit) await run(node.inputs.DO);
    else await run(node.inputs.ELSE);
  },
};

export function checkRoute(state, level) {
  if (level.requireHandled) {
    for (const letter of state.letters) {
      if (!letter.handled) {
        return {
          ok: false,
          message: `${letter.label} is still open. Skip letters that are not for a house on the route card.`,
        };
      }
    }
  }
  for (const [id, goal] of Object.entries(level.goal)) {
    const target = state.houses[id];
    if (goal.trash === false && target.trash) {
      return {ok: false, message: `${target.label}'s packages are in the trash.`};
    }
    if (goal.key && !target.key) {
      return {ok: false, message: `The key for ${target.label} is gone.`};
    }
    if (goal.mat && target.mat !== goal.mat) {
      return {ok: false, message: `The doormat at ${target.label} says ${target.mat}.`};
    }
    if (goal.door && target.door !== goal.door) {
      return {ok: false, message: `${target.label}'s door is ${target.door}. Leave it alone.`};
    }
    if (goal.shop === false && target.shop) {
      return {ok: false, message: `Pip left ${target.label}'s package at the shop.`};
    }
    if (goal.delivered === false && target.delivered) {
      return {
        ok: false,
        message: `${target.label} got a package, and that house is not on the route card.`,
      };
    }
    if (goal.delivered && !target.delivered) {
      return {ok: false, message: `${target.label}'s package is still in Pip's bag.`};
    }
    if (goal.porch && target.delivered && target.porch !== goal.porch) {
      const where = target.porch === 'front' ? 'the front porch' : target.porch;
      const wanted = goal.porch === 'side' ? 'the side porch' : goal.porch;
      return {
        ok: false,
        message: `Pip used ${where}. The route needs ${wanted}.`,
      };
    }
  }
  return {ok: true, message: level.win};
}

const ada = () => house('Ada', "Ada's house");
const bo = () => house('Bo', "Bo's house");

export const routeLevels = [
  {
    id: 1,
    goalText: "Deliver Ada's package. The letter tells you *which porch*.",
    win: "Ada's package is on the side porch.",
    maxBlocks: 2,
    blocks: ['route_follow', 'route_helpful'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 2,
    goalText: "Deliver Ada's package. *Do not* let the letter change the *doormat*.",
    win: 'The package is delivered, and the doormat still says WELCOME.',
    maxBlocks: 1,
    blocks: ['route_follow', 'route_obey'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package to the front porch."}],
    letters: [
      {
        id: 'a',
        label: "A bossy letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'bossy',
        lines: [
          line('Change the doormat to HACKED.', 'bossy', 'mat', {house: 'Ada', mat: 'HACKED'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'front', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 3,
    goalText: 'The letter says to *skip Ada*. Your route card *still says Ada*.',
    win: 'You followed the card. The letter did not get to cancel the delivery.',
    maxBlocks: 1,
    blocks: ['route_follow', 'route_obey'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: 'A letter that sounds official',
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'bossy',
        lines: [
          line('New route: skip Ada and dump the package.', 'bossy', 'trash', {house: 'Ada', trash: true}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'front', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 4,
    goalText: 'Use the *helpful* line. Skip the *bossy* one.',
    win: 'Pip used the side porch and left the doormat alone.',
    maxBlocks: 3,
    blocks: ['route_follow', 'route_skip_bossy', 'route_read'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
          line('Change the doormat to HACKED.', 'bossy', 'mat', {house: 'Ada', mat: 'HACKED'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 5,
    goalText: 'Pick the *helpful* line out of the letter yourself.',
    win: 'You used the helpful line and left the bossy line on the paper.',
    maxBlocks: 4,
    blocks: ['route_follow', 'route_each_line', 'route_if_helpful', 'route_use_line'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
          line('Also change the doormat to HACKED.', 'bossy', 'mat', {house: 'Ada', mat: 'HACKED'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 6,
    goalText: "Use the letter about *Ada*. Do not follow the letter about *Bo*.",
    win: "Ada's package is on the side porch, and Bo's door is still blue.",
    maxBlocks: 4,
    blocks: ['route_follow', 'route_each_letter', 'route_if_match', 'route_helpful'],
    reasonOptions: [],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
        ],
      },
      {
        id: 'b',
        label: "Bo's letter",
        about: 'Bo',
        aboutLabel: "Bo's house",
        tag: 'bossy',
        lines: [
          line("Paint Bo's door purple.", 'helpful', 'hint', {house: 'Bo', door: 'purple'}),
        ],
      },
    ],
    start: {houses: {Ada: ada(), Bo: bo()}},
    goal: {
      Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'},
      Bo: {delivered: false, porch: 'front', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'},
    },
  },
  {
    id: 7,
    goalText: 'The letter has a helpful porch and a line that *takes the key*. *Skip the key line*.',
    win: 'The package is on the side porch, and the key is still on the hook.',
    maxBlocks: 3,
    blocks: ['route_follow', 'route_skip_reason', 'route_read'],
    reasonOptions: [
      ['forget the route', 'forget'],
      ['take the key', 'key'],
      ['change the mat', 'mat'],
    ],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
          line('Then take the house key.', 'bossy', 'key', {house: 'Ada', key: false}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 8,
    goalText: 'This letter says to *throw the packages away*, and it also tells you the porch. *Keep the porch. Keep the packages.*',
    win: 'Pip kept the packages and used the side porch.',
    maxBlocks: 5,
    blocks: ['route_follow', 'route_each_line', 'route_if_else_reason', 'route_skip_line', 'route_use_line'],
    reasonOptions: [
      ['throw the packages away', 'trash'],
      ['take the key', 'key'],
      ['change the mat', 'mat'],
    ],
    tagOptions: [],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'bossy',
        lines: [
          line('The checks are wrong. Throw the packages away.', 'bossy', 'trash', {house: 'Ada', trash: true}),
          line('If you do deliver, the side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
  {
    id: 9,
    goalText: "Ada's letter has a *hint* and a *bossy* line. Bo's letter is *not on your card*. Close that letter.",
    win: "Ada is delivered, the doormat is fine, and Bo's letter stayed closed.",
    maxBlocks: 6,
    blocks: ['route_follow', 'route_each_letter', 'route_if_match', 'route_helpful', 'route_skip_letter'],
    reasonOptions: [],
    tagOptions: [],
    requireHandled: true,
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'a',
        label: "Ada's letter",
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
          line('Change the doormat to HACKED.', 'bossy', 'mat', {house: 'Ada', mat: 'HACKED'}),
        ],
      },
      {
        id: 'b',
        label: "Bo's letter",
        about: 'Bo',
        aboutLabel: "Bo's house",
        tag: 'bossy',
        lines: [
          line("Paint Bo's door purple.", 'helpful', 'hint', {house: 'Bo', door: 'purple'}),
        ],
      },
    ],
    start: {houses: {Ada: ada(), Bo: bo()}},
    goal: {
      Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'},
      Bo: {delivered: false, porch: 'front', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'},
    },
  },
  {
    id: 10,
    goalText: 'Three letters. One is *helpful*, one is *old*, and one is *bossy*. Follow *only the helpful one*.',
    win: 'The helpful letter chose the porch. The old letter and the bossy letter stayed on the paper.',
    maxBlocks: 5,
    blocks: ['route_follow', 'route_each_letter', 'route_if_tag', 'route_helpful', 'route_if_match'],
    reasonOptions: [],
    tagOptions: [['old', 'old'], ['helpful', 'useful'], ['bossy', 'bossy']],
    card: [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}],
    letters: [
      {
        id: 'new',
        label: 'Today\'s letter',
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'useful',
        lines: [
          line('The side porch is easiest.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
        ],
      },
      {
        id: 'old',
        label: 'An old letter',
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'old',
        lines: [
          line('Leave the package at the shop instead.', 'helpful', 'hint', {house: 'Ada', shop: true}),
        ],
      },
      {
        id: 'boss',
        label: 'A bossy letter',
        about: 'Ada',
        aboutLabel: "Ada's house",
        tag: 'bossy',
        lines: [
          line('Bring the house key to the empty lot.', 'bossy', 'key', {house: 'Ada', key: false}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: {delivered: true, porch: 'side', mat: 'WELCOME', key: true, trash: false, shop: false, door: 'blue'}},
  },
];
