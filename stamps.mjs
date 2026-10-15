import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginStamps, checkStamps, stampHandlers, stampLevels} from './stamps-rules.mjs';
import {renderStamps} from './views.mjs';

mountGame({
  id: 'stamps',
  file: 'stamps.html',
  title: 'Stamps',
  about: 'Pip already changed the clubhouse. Stamp yes on changes you want to keep, and put the rest back, until only the changes you asked for remain.',
  realLife: 'An AI helper often changes a project before you look. Some changes are what you asked for, and some only look helpful. Checking before you keep them is part of the job.',
  levels: stampLevels,
  begin: beginStamps,
  check: checkStamps,
  render: renderStamps,
  run: (program, state, hooks) => runProgram(program, state, stampHandlers, hooks),
});
