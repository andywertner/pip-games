/**
 * Runs a block program. The same runner is used by the pages and the tests.
 * A program is a linked tree: {type, fields, inputs, next}.
 */

export async function runProgram(node, state, handlers, hooks) {
  while (node) {
    if (hooks && hooks.before) await hooks.before(node, state);
    const handler = handlers[node.type];
    if (!handler) {
      throw new Error('Unknown block: ' + node.type);
    }
    await handler(node, state, (child) => runProgram(child, state, handlers, hooks));
    if (hooks && hooks.after) await hooks.after(node, state);
    node = node.next;
  }
}

export function countBlocks(node) {
  let total = 0;
  while (node) {
    if (node.type !== 'pip_note') total += 1;
    if (node.inputs) {
      for (const child of Object.values(node.inputs)) {
        total += countBlocks(child);
      }
    }
    node = node.next;
  }
  return total;
}
