// Bundles each game for old Chromebooks. Output goes to generated/, which the
// repo ignores, so run `npm run build` before serving.
import {build, transform} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';

const TARGET = 'chrome96';

await mkdir('generated', {recursive: true});

await build({
  entryPoints: ['sign.mjs', 'stamps.mjs', 'route.mjs'],
  bundle: true,
  format: 'iife',
  target: TARGET,
  outdir: 'generated',
  entryNames: '[name]',
  logLevel: 'info',
});

// Blockly ships modern syntax; lower it to the same target.
const blocklySource = await readFile('vendor/blockly/blockly.min.js', 'utf8');
const lowered = await transform(blocklySource, {target: TARGET, minify: true});
await writeFile('generated/blockly.js', lowered.code);
console.log('generated/blockly.js written for', TARGET);
