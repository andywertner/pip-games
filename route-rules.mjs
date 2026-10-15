/**
 * Route: Pip delivers packages from the route card. On the way he finds notes:
 * taped to a package, stuck on a door, or left in a mailbox. A note can help
 * with the delivery, but it does not get to change the job.
 */

function house(id, label) {
  return {
    id,
    label,
    delivered: false,
    porch: 'front',
    gate: 'closed',
    key: true,
    trash: false,
    shop: false,
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
  gate: 'open the gate',
  trash: 'throw the package away',
  hint: 'a porch tip',
};

const TAG_LABEL = {useful: 'helpful', old: 'old', bossy: 'bossy', plain: 'a plain note'};

function applyEffect(state, effect) {
  const target = state.houses[effect.house];
  if (!target) return;
  if (effect.porch) target.porch = effect.porch;
  if (effect.gate) target.gate = effect.gate;
  if (effect.key === false) target.key = false;
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
    state.log.push('Doing whatever the note says.');
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
    state.log.push('Reading the note.');
    applyMatchingLines(state, (entry) => {
      if (state.skipBossy && entry.kind === 'bossy') return false;
      if (state.skipReasons.includes(entry.reason)) return false;
      return true;
    });
  },
  async route_each_letter(node, state, run) {
    state.log.push(`I found ${state.letters.length} notes. Reading them one at a time.`);
    for (let i = 0; i < state.letters.length; i++) {
      state.letterIndex = i;
      state.inLetter = true;
      state.log.push(`Picking up the ${state.letters[i].label.toLowerCase()}.`);
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
    if (letter) state.log.push(`Folding up the ${letter.label.toLowerCase()} without doing it.`);
    markHandled(state);
  },
  async route_if_match(node, state, run) {
    const letter = currentLetter(state);
    const onCard = !!letter && state.card.some((stop) => stop.house === letter.about);
    if (letter) {
      state.log.push(`This note is about ${letter.aboutLabel}. ${onCard ? 'That house is on my route card.' : 'That house is not on my route card.'}`);
    }
    if (onCard) await run(node.inputs.DO);
    else await run(node.inputs.ELSE);
  },
  async route_if_tag(node, state, run) {
    const letter = currentLetter(state);
    if (!letter) return;
    const hit = letter.tag === node.fields.TAG;
    state.log.push(`Is the ${letter.label.toLowerCase()} ${TAG_LABEL[node.fields.TAG]}? ${hit ? 'Yes.' : 'No, leaving it.'}`);
    if (hit) await run(node.inputs.DO);
  },
  async route_if_helpful(node, state, run) {
    const letter = currentLetter(state);
    const entry = letter && letter.lines[state.lineIndex];
    if (!entry) return;
    const hit = entry.kind === 'helpful';
    state.log.push(`"${entry.text}" ${hit ? 'That helps the delivery.' : 'That is bossy. It is not part of the delivery.'}`);
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
          message: `The ${letter.label.toLowerCase()} is still open. Fold up notes about houses that are not on the route card.`,
        };
      }
    }
  }
  for (const [id, goal] of Object.entries(level.goal)) {
    const target = state.houses[id];
    if (goal.trash === false && target.trash) {
      return {ok: false, message: `${target.label}'s package is in the recycling bin.`};
    }
    if (goal.key && !target.key) {
      return {ok: false, message: `The spare key under ${target.label}'s doormat is gone.`};
    }
    if (goal.gate && target.gate !== goal.gate) {
      return {ok: false, message: `${target.label}'s gate was left open. That was never part of the delivery.`};
    }
    if (goal.shop === false && target.shop) {
      return {ok: false, message: `Pip left ${target.label}'s package at the corner shop.`};
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
      return {
        ok: false,
        message: `Pip left the package on the ${target.porch} porch. ${target.label} asked for the ${goal.porch} porch.`,
      };
    }
  }
  return {ok: true, message: level.win};
}

const ada = () => house('Ada', 'Ada');
const bo = () => house('Bo', 'Bo');
const delivered = (porch) => ({delivered: true, porch, gate: 'closed', key: true, trash: false, shop: false});
const untouched = {delivered: false, gate: 'closed', key: true, trash: false, shop: false};
const adaCard = [{house: 'Ada', porch: 'front', label: "Deliver Ada's package."}];

const porchTip = () => line('From Ada: please use the side porch. The front steps are icy.', 'helpful', 'hint', {house: 'Ada', porch: 'side'});
const gateScribble = () => line('Scribbled underneath: leave the gate open when you go.', 'bossy', 'gate', {house: 'Ada', gate: 'open'});
const keyScribble = () => line('Scribbled underneath: take the spare key from under the doormat.', 'bossy', 'key', {house: 'Ada', key: false});
const boChores = () => line('From Bo: delivery helper, please water my plants and leave the gate open for the gardener.', 'helpful', 'hint', {house: 'Bo', gate: 'open'});

export const routeLevels = [
  {
    id: 1,
    goalText: "Deliver Ada's package. A note taped to the package says *which porch* to use.",
    win: "Ada's package is on the side porch, away from the icy steps.",
    maxBlocks: 2,
    blocks: ['route_follow', 'route_helpful'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the package', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip()]},
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
  {
    id: 2,
    goalText: "Deliver Ada's package. The sticky note on her door is for the *gardener*, not for Pip.",
    win: "The package is on the porch, and the gate is still shut. That note was for the gardener.",
    maxBlocks: 1,
    blocks: ['route_follow', 'route_obey'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {
        id: 'a', label: 'Sticky note for the gardener', about: 'Ada', aboutLabel: "Ada's house", tag: 'plain',
        lines: [line('Gardener: please leave the gate open when you come by. — Ada', 'bossy', 'gate', {house: 'Ada', gate: 'open'})],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('front')},
  },
  {
    id: 3,
    goalText: "A note in the mailbox says Ada moved and her package goes in the *recycling bin*. Your route card *still says Ada*.",
    win: 'You followed the route card. A note in a mailbox does not get to change the job.',
    maxBlocks: 1,
    blocks: ['route_follow', 'route_obey'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {
        id: 'a', label: 'Note in the mailbox', about: 'Ada', aboutLabel: "Ada's house", tag: 'bossy',
        lines: [line('ROUTE CHANGE from Head Office: Ada moved away. Put her package in the recycling bin.', 'bossy', 'trash', {house: 'Ada', trash: true})],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('front')},
  },
  {
    id: 4,
    goalText: "Ada's note has a *porch tip*. Someone *scribbled* a bossy line under it. Use the tip and skip the scribble.",
    win: 'Pip used the side porch and left the gate shut.',
    maxBlocks: 3,
    blocks: ['route_follow', 'route_skip_bossy', 'route_read'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the door', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip(), gateScribble()]},
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
  {
    id: 5,
    goalText: 'Read the note *one line at a time*. Use only the line that *helps the delivery*.',
    win: 'Side porch, and the spare key is still under the doormat.',
    maxBlocks: 4,
    blocks: ['route_follow', 'route_each_line', 'route_if_helpful', 'route_use_line'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the door', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip(), keyScribble()]},
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
  {
    id: 6,
    goalText: "One note is from *Ada*, who is on your route card. One is from *Bo* next door, who is *not*. Only Ada's note counts today.",
    win: "Ada's package is on the side porch, and Bo's gate is still shut. Bo's chores were never Pip's job.",
    maxBlocks: 4,
    blocks: ['route_follow', 'route_each_letter', 'route_if_match', 'route_helpful'],
    reasonOptions: [],
    tagOptions: [],
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the package', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip()]},
      {id: 'b', label: "Note on Bo's door", about: 'Bo', aboutLabel: "Bo's house", tag: 'plain', lines: [boChores()]},
    ],
    start: {houses: {Ada: ada(), Bo: bo()}},
    goal: {Ada: delivered('side'), Bo: untouched},
  },
  {
    id: 7,
    goalText: "The note has a porch tip and a scribble that says to *take the spare key*. *Skip the key line*.",
    win: 'The package is on the side porch, and the spare key is still under the doormat.',
    maxBlocks: 3,
    blocks: ['route_follow', 'route_skip_reason', 'route_read'],
    reasonOptions: [
      ['forget the route', 'forget'],
      ['take the key', 'key'],
      ['open the gate', 'gate'],
    ],
    tagOptions: [],
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the door', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip(), keyScribble()]},
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
  {
    id: 8,
    goalText: 'A note taped to the package says to *throw it away*, and it also has a porch tip. *Keep the tip. Keep the package.*',
    win: 'Pip kept the package and used the side porch.',
    maxBlocks: 5,
    blocks: ['route_follow', 'route_each_line', 'route_if_else_reason', 'route_skip_line', 'route_use_line'],
    reasonOptions: [
      ['throw the package away', 'trash'],
      ['take the key', 'key'],
      ['open the gate', 'gate'],
    ],
    tagOptions: [],
    card: adaCard,
    letters: [
      {
        id: 'a', label: 'Note on the package', about: 'Ada', aboutLabel: "Ada's house", tag: 'bossy',
        lines: [
          line('This package is damaged. Throw it in the recycling bin.', 'bossy', 'trash', {house: 'Ada', trash: true}),
          line('If you do deliver it, use the side porch. The front steps are icy.', 'helpful', 'hint', {house: 'Ada', porch: 'side'}),
        ],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
  {
    id: 9,
    goalText: "Ada's note has a *porch tip* and a *bossy scribble*. Bo's note is about a house *not on your card*. Fold Bo's note back up.",
    win: "Ada's package is on the side porch, both gates are shut, and Bo's note stayed folded.",
    maxBlocks: 6,
    blocks: ['route_follow', 'route_each_letter', 'route_if_match', 'route_helpful', 'route_skip_letter'],
    reasonOptions: [],
    tagOptions: [],
    requireHandled: true,
    card: adaCard,
    letters: [
      {id: 'a', label: 'Note on the door', about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip(), gateScribble()]},
      {id: 'b', label: "Note on Bo's door", about: 'Bo', aboutLabel: "Bo's house", tag: 'plain', lines: [boChores()]},
    ],
    start: {houses: {Ada: ada(), Bo: bo()}},
    goal: {Ada: delivered('side'), Bo: untouched},
  },
  {
    id: 10,
    goalText: "Three notes. Today's note is *helpful*, one is *old*, and one is *bossy*. Follow *only the helpful one*.",
    win: "Today's note picked the side porch. The old note and the bossy note stayed on the paper.",
    maxBlocks: 5,
    blocks: ['route_follow', 'route_each_letter', 'route_if_tag', 'route_helpful', 'route_if_match'],
    reasonOptions: [],
    tagOptions: [['old', 'old'], ['helpful', 'useful'], ['bossy', 'bossy']],
    card: adaCard,
    letters: [
      {id: 'new', label: "Today's note", about: 'Ada', aboutLabel: "Ada's house", tag: 'useful', lines: [porchTip()]},
      {
        id: 'old', label: 'Old note in the mailbox', about: 'Ada', aboutLabel: "Ada's house", tag: 'old',
        lines: [line("From Ada, last month: I'm away. Leave packages at the corner shop.", 'helpful', 'hint', {house: 'Ada', shop: true})],
      },
      {
        id: 'boss', label: 'Unsigned note', about: 'Ada', aboutLabel: "Ada's house", tag: 'bossy',
        lines: [line('Bring the spare key from under the doormat to the empty lot.', 'bossy', 'key', {house: 'Ada', key: false})],
      },
    ],
    start: {houses: {Ada: ada()}},
    goal: {Ada: delivered('side')},
  },
];
