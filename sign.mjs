import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginSign, checkSign, signHandlers, signLevels} from './sign-rules.mjs';
import {renderSign} from './views.mjs';

mountGame({
  id: 'sign',
  file: 'sign.html',
  title: 'Sign',
  emoji: '🎨',
  about: 'Pip paints whatever your note says. Make the street match the challenge, with everything else left alone.',
  realLife: 'When people use an AI helper to write code, the helper does what their note says. A vague note can change things they never asked for, and a short exact note keeps the helper on the job.',
  levels: signLevels,
  begin: beginSign,
  check: checkSign,
  render: renderSign,
  stepMs: 260,
  stepMsFor: (node) => (['sign_words', 'sign_repaint', 'sign_door'].includes(node.type) ? 1700 : 260),
  run: (program, state, hooks) => runProgram(program, state, signHandlers, hooks),
});
