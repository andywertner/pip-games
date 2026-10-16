import {helloSolutions} from './answers.mjs';
import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginHello, checkHello, helloHandlers, helloLevels} from './hello-rules.mjs';
import {renderHello} from './views-new.mjs';

mountGame({
  id: 'hello',
  file: 'hello.html',
  title: 'Hello Pip',
  emoji: '👋',
  about: 'Meet Pip, your helper. Pip only does what the blocks say, and only when they are snapped together under "Pip, please". Learn to connect blocks, put them in order, use the little arrows, and fill a slot.',
  realLife: 'When people work with an AI helper, they write instructions and the helper follows them exactly. Clear, connected, in-order instructions are the whole trick.',
  levels: helloLevels,
  solutions: helloSolutions,
  begin: beginHello,
  check: checkHello,
  render: renderHello,
  stepMs: 700,
  run: (program, state, hooks) => runProgram(program, state, helloHandlers, hooks),
});
