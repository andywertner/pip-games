import assert from 'node:assert/strict';
import test from 'node:test';
import {countBlocks, runProgram} from '../program.mjs';
import {beginSign, checkSign, signHandlers, signLevels} from '../sign-rules.mjs';
import {beginStamps, checkStamps, stampHandlers, stampLevels} from '../stamps-rules.mjs';
import {beginRoute, checkRoute, routeHandlers, routeLevels} from '../route-rules.mjs';
import {beginHello, checkHello, helloHandlers, helloLevels} from '../hello-rules.mjs';
import {beginDraw, checkDraw, drawHandlers, drawLevels} from '../draw-rules.mjs';
import {drawSolutions, helloSolutions, routeSolutions, signSolutions, stampSolutions} from '../answers.mjs';

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

test('every Hello level has a solution inside the block limit', async () => {
  for (let i = 0; i < helloLevels.length; i++) {
    const level = helloLevels[i];
    assert.ok(countBlocks(helloSolutions[i]) <= level.maxBlocks, `level ${level.id} uses ${countBlocks(helloSolutions[i])}`);
    const result = await play(beginHello, helloHandlers, checkHello, level, helloSolutions[i]);
    assert.equal(result.ok, true, `level ${level.id}: ${result.message}`);
  }
});

test('Hello traps fail', async () => {
  const backwards = chain([b('hello_sweep'), b('hello_grab', {TOOL: 'broom'})]);
  const level2 = await play(beginHello, helloHandlers, checkHello, helloLevels[1], backwards);
  assert.equal(level2.ok, false);
  assert.match(level2.message, /before he had the broom/);

  const floor = b('hello_water', {TARGET: 'floor'});
  const level3 = await play(beginHello, helloHandlers, checkHello, helloLevels[2], floor);
  assert.equal(level3.ok, false);

  const broom = b('job_paint', {}, {DO: b('tool_broom')});
  const level4 = await play(beginHello, helloHandlers, checkHello, helloLevels[3], broom);
  assert.equal(level4.ok, false);
  assert.match(level4.message, /blank/);

  const messy = helloLevels[5].starter;
  const level6 = await play(beginHello, helloHandlers, checkHello, helloLevels[5], messy);
  assert.equal(level6.ok, false);
  assert.ok(countBlocks(messy) > helloLevels[5].maxBlocks, 'the messy note must be over the limit');
});

test('every Draw level has a solution inside the block limit', async () => {
  for (let i = 0; i < drawLevels.length; i++) {
    const level = drawLevels[i];
    assert.ok(countBlocks(drawSolutions[i]) <= level.maxBlocks, `level ${level.id} uses ${countBlocks(drawSolutions[i])}`);
    const result = await play(beginDraw, drawHandlers, checkDraw, level, drawSolutions[i]);
    assert.equal(result.ok, true, `level ${level.id}: ${result.message}`);
  }
});

test('Draw traps fail', async () => {
  const plainCat = b('draw_subject', {SUBJECT: 'cat'});
  const level2 = await play(beginDraw, drawHandlers, checkDraw, drawLevels[1], plainCat);
  assert.equal(level2.ok, false);
  assert.match(level2.message, /gray.*guessed/);

  const oneFish = chain([b('draw_subject', {SUBJECT: 'fish'}), b('draw_color', {COLOR: 'blue'})]);
  const level4 = await play(beginDraw, drawHandlers, checkDraw, drawLevels[3], oneFish);
  assert.equal(level4.ok, false);
  assert.match(level4.message, /drew 1 fish/);

  const hatDog = chain([b('draw_subject', {SUBJECT: 'dog'}), b('draw_color', {COLOR: 'green'})]);
  const level7 = await play(beginDraw, drawHandlers, checkDraw, drawLevels[6], hatDog);
  assert.equal(level7.ok, false);
  assert.match(level7.message, /hat/);

  const redo = b('draw_redo');
  const level9 = await play(beginDraw, drawHandlers, checkDraw, drawLevels[8], redo);
  assert.equal(level9.ok, false);
  assert.match(level9.message, /gray/);

  const wrongOrder = chain([
    b('draw_subject', {SUBJECT: 'sun'}), b('draw_subject', {SUBJECT: 'cat'}),
    b('draw_color', {COLOR: 'orange'}), b('draw_place', {PLACE: 'rug'}), b('draw_place', {PLACE: 'sky'}),
  ]);
  const level6 = await play(beginDraw, drawHandlers, checkDraw, drawLevels[5], wrongOrder);
  assert.equal(level6.ok, false);
});

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
  assert.match(level2.message, /gate/);

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
