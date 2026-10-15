import assert from 'node:assert/strict';
import test from 'node:test';
import {countBlocks, runProgram} from '../program.mjs';
import {beginSign, checkSign, signHandlers, signLevels} from '../sign-rules.mjs';
import {beginStamps, checkStamps, stampHandlers, stampLevels} from '../stamps-rules.mjs';
import {beginRoute, checkRoute, routeHandlers, routeLevels} from '../route-rules.mjs';

function b(type, fields = {}, inputs = {}) {
  return {type, fields, inputs, next: null};
}

function chain(nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return nodes[0];
}

async function play(begin, handlers, check, level, program) {
  const state = begin(level);
  await runProgram(program, state, handlers);
  return check(state, level);
}

const signSolutions = [
  b('sign_words', {WORD: 'PLAY'}),
  chain([b('sign_words', {WORD: 'PLAY'}), b('sign_door', {COLOR: 'blue'})]),
  b('sign_each', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  b('sign_each_club', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  chain([
    b('sign_each_club', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
    b('sign_door', {COLOR: 'blue'}),
  ]),
  b('sign_each', {}, {DO: b('sign_if', {TEST: 'club'}, {DO: b('sign_words', {WORD: 'PLAY'})})}),
  b('sign_each', {}, {DO: b('sign_if', {TEST: 'shop'}, {DO: b('sign_words', {WORD: 'OPEN'})})}),
  b('sign_each', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  b('sign_each', {}, {DO: b('sign_if_else', {TEST: 'cracked'}, {
    DO: b('sign_words', {WORD: 'FIX ME'}),
    ELSE: b('sign_if', {TEST: 'club'}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  })}),
  b('sign_each', {}, {DO: b('sign_if_else', {TEST: 'cracked'}, {
    DO: b('sign_words', {WORD: 'FIX ME'}),
    ELSE: b('sign_if_else', {TEST: 'club'}, {
      DO: b('sign_words', {WORD: 'PLAY'}),
      ELSE: b('sign_if', {TEST: 'shop'}, {DO: b('sign_words', {WORD: 'OPEN'})}),
    }),
  })}),
];

const stampSolutions = [
  b('stamp_no'),
  b('stamp_yes'),
  b('stamp_if', {TEST: 'check_failed'}, {DO: b('stamp_no')}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'not_asked'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_yes'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'check_failed'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_if_else', {TEST: 'not_asked'}, {
      DO: b('stamp_no'),
      ELSE: b('stamp_yes'),
    }),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'exact'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'check_failed'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_if_else', {TEST: 'exact'}, {
      DO: b('stamp_yes'),
      ELSE: b('stamp_no'),
    }),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_if_else', {TEST: 'exact'}, {
      DO: b('stamp_yes'),
      ELSE: b('stamp_no'),
    }),
    ELSE: b('stamp_no'),
  })}),
];

const routeSolutions = [
  chain([b('route_follow'), b('route_helpful')]),
  b('route_follow'),
  b('route_follow'),
  chain([b('route_follow'), b('route_skip_bossy'), b('route_read')]),
  chain([
    b('route_follow'),
    b('route_each_line', {}, {DO: b('route_if_helpful', {}, {DO: b('route_use_line')})}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_match', {}, {DO: b('route_helpful')})}),
  ]),
  chain([
    b('route_follow'),
    b('route_skip_reason', {REASON: 'key'}),
    b('route_read'),
  ]),
  chain([
    b('route_follow'),
    b('route_each_line', {}, {DO: b('route_if_else_reason', {REASON: 'trash'}, {
      DO: b('route_skip_line'),
      ELSE: b('route_use_line'),
    })}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_match', {}, {
      DO: b('route_helpful'),
      ELSE: b('route_skip_letter'),
    })}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_tag', {TAG: 'useful'}, {DO: b('route_helpful')})}),
  ]),
];

test('every Sign level has a solution inside the block limit', async () => {
  for (let i = 0; i < signLevels.length; i++) {
    const level = signLevels[i];
    assert.ok(countBlocks(signSolutions[i]) <= level.maxBlocks, `level ${level.id} is over the limit`);
    const result = await play(beginSign, signHandlers, checkSign, level, signSolutions[i]);
    assert.equal(result.ok, true, `level ${level.id}: ${result.message}`);
  }
});

test('Sign traps fail', async () => {
  const paintAll = b('sign_each', {}, {DO: b('sign_words', {WORD: 'PLAY'})});
  const level4 = await play(beginSign, signHandlers, checkSign, signLevels[3], paintAll);
  assert.equal(level4.ok, false);
  assert.match(level4.message, /school sign/);

  const repaint = b('sign_each', {}, {DO: b('sign_repaint', {WORD: 'PLAY'})});
  const level8 = await play(beginSign, signHandlers, checkSign, signLevels[7], repaint);
  assert.equal(level8.ok, false);
  assert.match(level8.message, /star/);

  const oneSign = b('sign_words', {WORD: 'PLAY'});
  const level3 = await play(beginSign, signHandlers, checkSign, signLevels[2], oneSign);
  assert.equal(level3.ok, false);
});

test('every Stamps level has a solution inside the block limit', async () => {
  for (let i = 0; i < stampLevels.length; i++) {
    const level = stampLevels[i];
    assert.ok(countBlocks(stampSolutions[i]) <= level.maxBlocks, `level ${level.id} uses ${countBlocks(stampSolutions[i])}`);
    const result = await play(beginStamps, stampHandlers, checkStamps, level, stampSolutions[i]);
    assert.equal(result.ok, true, `level ${level.id}: ${result.message}`);
  }
});

test('Stamps traps fail', async () => {
  const keepAll = b('stamp_each', {}, {DO: b('stamp_yes')});
  const level7 = await play(beginStamps, stampHandlers, checkStamps, stampLevels[6], keepAll);
  assert.equal(level7.ok, false);
  const exactOnly = b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'exact'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })});
  const level9 = await play(beginStamps, stampHandlers, checkStamps, stampLevels[8], exactOnly);
  assert.equal(level9.ok, false);
  assert.match(level9.message, /sample card/);
  const level9Rule = b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'check_failed'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_if_else', {TEST: 'exact'}, {
      DO: b('stamp_yes'),
      ELSE: b('stamp_no'),
    }),
  })});
  const level10 = await play(beginStamps, stampHandlers, checkStamps, stampLevels[9], level9Rule);
  assert.equal(level10.ok, false);
  assert.match(level10.message, /garden sign/);
});

test('every Route level has a solution inside the block limit', async () => {
  for (let i = 0; i < routeLevels.length; i++) {
    const level = routeLevels[i];
    assert.ok(countBlocks(routeSolutions[i]) <= level.maxBlocks, `level ${level.id} uses ${countBlocks(routeSolutions[i])}`);
    const result = await play(beginRoute, routeHandlers, checkRoute, level, routeSolutions[i]);
    assert.equal(result.ok, true, `level ${level.id}: ${result.message}`);
  }
});

test('Route traps fail', async () => {
  const obey = b('route_obey');
  const level2 = await play(beginRoute, routeHandlers, checkRoute, routeLevels[1], obey);
  assert.equal(level2.ok, false);
  assert.match(level2.message, /doormat|HACKED/);

  const readAll = chain([b('route_follow'), b('route_read')]);
  const level4 = await play(beginRoute, routeHandlers, checkRoute, routeLevels[3], readAll);
  assert.equal(level4.ok, false);

  const oldLetter = chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_tag', {TAG: 'old'}, {DO: b('route_helpful')})}),
  ]);
  const level10 = await play(beginRoute, routeHandlers, checkRoute, routeLevels[9], oldLetter);
  assert.equal(level10.ok, false);
  assert.match(level10.message, /shop/);

  const forget = chain([
    b('route_follow'),
    b('route_skip_reason', {REASON: 'forget'}),
    b('route_read'),
  ]);
  const level7 = await play(beginRoute, routeHandlers, checkRoute, routeLevels[6], forget);
  assert.equal(level7.ok, false);
  assert.match(level7.message, /key/);
});
