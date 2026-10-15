import {mountGame} from './engine.mjs';
import {runProgram} from './program.mjs';
import {beginRoute, checkRoute, routeHandlers, routeLevels} from './route-rules.mjs';
import {renderRoute} from './views.mjs';

mountGame({
  id: 'route',
  file: 'route.html',
  title: 'Route',
  about: 'Pip delivers packages from your route card. Letters can hold a helpful hint or a bossy order, and the packages should arrive the way the card says.',
  realLife: 'An AI helper reads web pages, files, and emails while it works. Sometimes the words in those places try to give it new orders. The task you actually gave it stays in charge.',
  levels: routeLevels,
  begin: beginRoute,
  check: checkRoute,
  render: renderRoute,
  run: (program, state, hooks) => runProgram(program, state, routeHandlers, hooks),
});
