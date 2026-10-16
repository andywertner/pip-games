// Bundles each game for old Chromebooks. Output goes to generated/, which the
// repo ignores, so run `npm run build` before serving.
import {build, transform} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';

const TARGET = 'chrome96';

await mkdir('generated', {recursive: true});

await build({
  entryPoints: ['hello.mjs', 'draw.mjs', 'sign.mjs', 'stamps.mjs', 'route.mjs'],
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

// GitHub Pages caches files for 10 minutes. A fresh version on every link keeps
// a new page from pairing with an old stylesheet or script.
const version = Date.now().toString(36);
for (const page of ['index.html', 'hello.html', 'draw.html', 'sign.html', 'stamps.html', 'route.html']) {
  const html = await readFile(page, 'utf8');
  const stamped = html.replace(
      /(href|src)="((?:common|games)\.css|generated\/[a-z]+\.js)(?:\?v=[^"]*)?"/g,
      `$1="$2?v=${version}"`);
  await writeFile(page, stamped);
}
console.log('asset links stamped', version);
