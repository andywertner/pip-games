import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginRoute, checkRoute, routeHandlers, routeLevels} from './route-rules.mjs';
import {renderRoute} from './views.mjs';

mountGame({
  id: 'route',
  file: 'route.html',
  title: 'Route',
  emoji: '📦',
  about: 'Pip delivers packages. Your route card is the job. On the way he finds notes taped to packages, stuck on doors, or left in mailboxes. Some notes help with the delivery. Some try to give Pip a different job.',
  realLife: 'An AI helper reads web pages, files, and emails while it works. Sometimes the words in those places try to give it new orders. The task you actually gave it stays in charge.',
  levels: routeLevels,
  begin: beginRoute,
  check: checkRoute,
  render: renderRoute,
  run: (program, state, hooks) => runProgram(program, state, routeHandlers, hooks),
});
