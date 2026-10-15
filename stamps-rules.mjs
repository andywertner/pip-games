/**
 * Stamps: Pip already made the changes. The kid stamps each one.
 */

function change(id, title, before, after, fields) {
  return {
    id,
    title,
    before,
    after,
    asked: !!fields.asked,
    check: fields.check,
    exact: fields.exact !== false,
    note: fields.note || '',
    expected: fields.expected,
    stamp: null,
  };
}

function testMatches(item, test) {
  if (test === 'check_failed') return item.check === 'fail';
  if (test === 'not_asked') return !item.asked;
  if (test === 'asked_and_passed') return item.asked && item.check === 'pass';
  if (test === 'exact') return item.exact === true;
  if (test === 'not_exact') return item.exact === false;
  return false;
}

export function beginStamps(level) {
  const state = JSON.parse(JSON.stringify(level.start));
  state.cursor = 0;
  state.log = [];
  return state;
}

const TEST_LABEL = {
  check_failed: 'did the check fail',
  not_asked: 'is this something we did not ask for',
  asked_and_passed: 'did we ask for it and did the check pass',
  exact: 'is it exactly what we asked',
  not_exact: 'is it different from what we asked',
};

export const stampHandlers = {
  async stamp_yes(_node, state) {
    const item = state.changes[state.cursor];
    if (item) {
      item.stamp = 'yes';
      state.log.push(`Stamped YES on "${item.title}". Keeping it.`);
    }
  },
  async stamp_no(_node, state) {
    const item = state.changes[state.cursor];
    if (item) {
      item.stamp = 'no';
      state.log.push(`Stamped PUT IT BACK on "${item.title}". Undoing it.`);
    }
  },
  async stamp_each(node, state, run) {
    state.log.push(`Looking at all ${state.changes.length} changes, one at a time.`);
    for (let i = 0; i < state.changes.length; i++) {
      state.cursor = i;
      await run(node.inputs.DO);
    }
  },
  async stamp_if(node, state, run) {
    const item = state.changes[state.cursor];
    if (!item) return;
    const hit = testMatches(item, node.fields.TEST);
    state.log.push(`"${item.title}": ${TEST_LABEL[node.fields.TEST]}? ${hit ? 'Yes.' : 'No, so no stamp.'}`);
    if (hit) await run(node.inputs.DO);
  },
  async stamp_if_else(node, state, run) {
    const item = state.changes[state.cursor];
    if (!item) return;
    const hit = testMatches(item, node.fields.TEST);
    state.log.push(`"${item.title}": ${TEST_LABEL[node.fields.TEST]}? ${hit ? 'Yes.' : 'No.'}`);
    if (hit) await run(node.inputs.DO);
    else await run(node.inputs.ELSE);
  },
};

export function checkStamps(state, level) {
  for (const item of state.changes) {
    if (!item.stamp) {
      return {ok: false, message: `${item.title} has no stamp yet.`};
    }
    if (item.stamp !== item.expected) {
      const wanted = item.expected === 'yes' ? 'yes' : 'put it back';
      const got = item.stamp === 'yes' ? 'yes' : 'put it back';
      return {
        ok: false,
        message: `${item.title} is stamped "${got}". It should be "${wanted}".`,
      };
    }
  }
  return {ok: true, message: level.win};
}

const yes = {expected: 'yes'};
const no = {expected: 'no'};

export const stampLevels = [
  {
    id: 1,
    goalText: 'Pip painted the window. You *did not ask* for that. Stamp the change.',
    win: 'The window goes back. You kept only what you asked for.',
    maxBlocks: 1,
    blocks: ['stamp_no'],
    testOptions: [],
    cardFields: ['asked'],
    starter: 'no',
    start: {
      changes: [
        change('window', 'The window', 'clear glass', 'painted over', {
          asked: false, check: 'pass', ...no,
          note: 'The task was the sign, not the window.',
        }),
      ],
    },
  },
  {
    id: 2,
    goalText: 'Pip changed the sign to PLAY. That is *what you asked for*. Stamp the change.',
    win: 'You kept the change you asked for.',
    maxBlocks: 1,
    blocks: ['stamp_yes', 'stamp_no'],
    testOptions: [],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', ...yes,
        }),
      ],
    },
  },
  {
    id: 3,
    goalText: 'Pip changed the sign, but the *check failed*. Decide what to do.',
    win: 'A failed check means the change comes back out.',
    maxBlocks: 3,
    blocks: ['stamp_if', 'stamp_no', 'stamp_yes'],
    testOptions: [['the check failed', 'check_failed']],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY?', {
          asked: true, check: 'fail', ...no,
          note: 'Pip tried the sign. The check failed.',
        }),
      ],
    },
  },
  {
    id: 4,
    goalText: 'One change is the sign you *asked for*. One is a window you *did not ask for*. Stamp both.',
    win: 'You kept the sign and sent the window back.',
    maxBlocks: 5,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [['we did not ask for this', 'not_asked']],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', ...yes,
        }),
        change('window', 'The window', 'clear glass', 'painted over', {
          asked: false, check: 'pass', ...no,
        }),
      ],
    },
  },
  {
    id: 5,
    goalText: 'We asked Pip to paint the clubhouse sign *PLAY*. He painted *PLAY?* instead, so the check failed. A sign that does not match the order comes back out, even though we asked him to paint it.',
    win: 'PLAY? did not match the order, so that sign goes back. The doorbell label stays.',
    maxBlocks: 6,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [
      ['the check failed', 'check_failed'],
      ['we did not ask for this', 'not_asked'],
    ],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY?', {
          asked: true, check: 'fail', ...no,
          note: 'The order was PLAY. Pip added a question mark, so the letters do not match.',
        }),
        change('door', 'The door', 'red', 'striped', {
          asked: false, check: 'pass', ...no,
        }),
        change('bell', 'The doorbell label', 'RING', 'PRESS', {
          asked: true, check: 'pass', ...yes,
        }),
      ],
    },
  },
  {
    id: 6,
    goalText: 'Stamp yes only when *two things are both true*: we *asked* for the change, and the *check passed*.',
    win: 'Both parts had to be true. The door passed the check, and we still did not ask for it.',
    maxBlocks: 5,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [['the check passed and we asked for this', 'asked_and_passed']],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('door', 'The door', 'red', 'blue', {
          asked: false, check: 'pass', ...no,
          note: 'The check passed. The task never mentioned the door.',
        }),
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', ...yes,
        }),
      ],
    },
  },
  {
    id: 7,
    goalText: 'Pip painted the clubhouse sign *PLAY*. He also took down the *sample card* that shows the right letters, and he painted a mural. Keep *only the sign*.',
    win: 'The sign stays. The sample card goes back up, and the mural goes back.',
    maxBlocks: 5,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [['the check passed and we asked for this', 'asked_and_passed']],
    cardFields: ['asked', 'check'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', ...yes,
        }),
        change('sample', 'The sample card', 'PLAY, beside the sign', 'card taken down', {
          asked: true, check: 'fail', ...no,
          note: 'This card shows the right letters so we can check Pip\'s painting. He was at the right sign, and he took the card down. With the sample gone, the check failed.',
        }),
        change('mural', 'The mural', 'plain wall', "Pip's painting", {
          asked: false, check: 'pass', ...no,
        }),
      ],
    },
  },
  {
    id: 8,
    goalText: '*PLAY* is what we asked for. *PLAY!* is not. Look closely.',
    win: 'You kept the exact words and sent the almost-right ones back.',
    maxBlocks: 4,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [['it is exactly what we asked', 'exact']],
    cardFields: ['asked', 'check', 'exact'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', exact: true, ...yes,
        }),
        change('button', 'The button', 'Play', 'PLAY!', {
          asked: true, check: 'pass', exact: false, ...no,
          note: 'We asked for PLAY. Pip wrote PLAY!',
        }),
      ],
    },
  },
  {
    id: 9,
    goalText: 'A *failed check* comes back out even when the words look right. So does anything that is *not exactly* what we asked.',
    win: 'The rule kept the one exact change that passed the check.',
    maxBlocks: 6,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [
      ['the check failed', 'check_failed'],
      ['it is exactly what we asked', 'exact'],
    ],
    cardFields: ['asked', 'check', 'exact'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', exact: true, ...yes,
        }),
        change('button', 'The button', 'Play', 'PLAY!', {
          asked: true, check: 'pass', exact: false, ...no,
        }),
        change('mural', 'The mural', 'plain wall', "Pip's painting", {
          asked: false, check: 'pass', exact: false, ...no,
        }),
        change('sample', 'The sample card', 'PLAY, beside the sign', 'PLAY, behind the sign', {
          asked: true, check: 'fail', exact: true, ...no,
          note: 'The letters still say PLAY. Pip hung the sample card behind the sign, so nobody can check the painting.',
        }),
      ],
    },
  },
  {
    id: 10,
    goalText: 'Five changes, and only a *few blocks*. A perfect sign still goes back if *nobody asked* for it. Keep a change only when we asked, the check passed, and the words are *exact*.',
    win: 'The clubhouse and the shop stay. The garden sign, the button, and the sample card go back.',
    maxBlocks: 6,
    blocks: ['stamp_each', 'stamp_if_else', 'stamp_yes', 'stamp_no'],
    testOptions: [
      ['the check passed and we asked for this', 'asked_and_passed'],
      ['it is exactly what we asked', 'exact'],
    ],
    cardFields: ['asked', 'check', 'exact'],
    start: {
      changes: [
        change('sign', 'The clubhouse sign', 'HELLO', 'PLAY', {
          asked: true, check: 'pass', exact: true, ...yes,
        }),
        change('shop', 'The shop sign', 'CLOSED', 'OPEN', {
          asked: true, check: 'pass', exact: true, ...yes,
        }),
        change('garden', 'The garden sign', 'blank wood', 'GROW', {
          asked: false, check: 'pass', exact: true, ...no,
          note: 'The letters are right and the paint check passed. Nobody asked for a garden sign.',
        }),
        change('button', 'The button', 'Play', 'PLAY!', {
          asked: true, check: 'pass', exact: false, ...no,
          note: 'We asked for PLAY. Pip wrote PLAY!',
        }),
        change('sample', 'The sample card', 'PLAY, beside the sign', 'PLAY, behind the sign', {
          asked: true, check: 'fail', exact: true, ...no,
          note: 'The letters say PLAY, but the sample card is behind the sign, so the check failed.',
        }),
      ],
    },
  },
];
