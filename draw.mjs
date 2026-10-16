import {drawSolutions} from './answers.mjs';
import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginDraw, checkDraw, drawHandlers, drawLevels} from './draw-rules.mjs';
import {renderDraw} from './views-new.mjs';

mountGame({
  id: 'draw',
  file: 'draw.html',
  title: 'Draw',
  emoji: '🖍️',
  about: 'Pip draws whatever your note says. Anything the note leaves out, Pip guesses. Make Pip\'s drawing match the picture.',
  realLife: 'When people ask an AI to make a picture or write something, they type a note called a prompt. Details that are not in the prompt get filled in by a guess. A clear prompt gets a closer result.',
  levels: drawLevels,
  solutions: drawSolutions,
  begin: beginDraw,
  check: checkDraw,
  render: renderDraw,
  stepMs: 650,
  run: (program, state, hooks) => runProgram(program, state, drawHandlers, hooks),
});
