const ACTION = 290;
const LOOP = 120;
const LOGIC = 210;

function dropdown(name, options) {
  return {type: 'field_dropdown', name, options};
}

function action(type, message, args, tooltip) {
  return {
    type,
    message0: message,
    args0: args || [],
    previousStatement: null,
    nextStatement: null,
    colour: ACTION,
    tooltip,
  };
}

function loop(type, message, tooltip) {
  return {
    type,
    message0: message,
    message1: 'do %1',
    args1: [{type: 'input_statement', name: 'DO'}],
    previousStatement: null,
    nextStatement: null,
    colour: LOOP,
    tooltip,
  };
}

function branch(type, message, args, hasElse, tooltip) {
  const block = {
    type,
    message0: message,
    args0: args || [],
    message1: 'do %1',
    args1: [{type: 'input_statement', name: 'DO'}],
    previousStatement: null,
    nextStatement: null,
    colour: LOGIC,
    tooltip,
  };
  if (hasElse) {
    block.message2 = 'else %1';
    block.args2 = [{type: 'input_statement', name: 'ELSE'}];
  }
  return block;
}

function catalog(level) {
  const words = level.wordOptions || [['PLAY', 'PLAY']];
  const doors = level.doorOptions || [['blue', 'blue']];
  const tests = level.testOptions || [['a club sign', 'club']];
  const elseTests = level.elseTests || tests;
  const reasons = level.reasonOptions || [['take the key', 'key']];
  const tags = level.tagOptions || [['helpful', 'useful']];
  const matchHasElse = level.blocks.includes('route_skip_letter');
  return {
    pip_note: {
      type: 'pip_note',
      message0: 'Pip, please',
      nextStatement: null,
      colour: 20,
      tooltip: 'Connect your instructions under this block.',
    },
    sign_words: action('sign_words', 'change the words to %1', [dropdown('WORD', words)], 'Changes the words and leaves stickers alone.'),
    sign_repaint: action('sign_repaint', 'change the sign to %1', [dropdown('WORD', words)], 'Paints over the whole sign, including stickers.'),
    sign_door: action('sign_door', 'paint the door %1', [dropdown('COLOR', doors)], 'Paints the clubhouse door.'),
    sign_each: loop('sign_each', 'for each sign', 'Pip visits every sign.'),
    sign_each_club: loop('sign_each_club', 'for each club sign', 'Pip visits club signs and skips the others.'),
    sign_if: branch('sign_if', 'if it is %1', [dropdown('TEST', tests)], false, 'Does the inside only when the sign matches.'),
    sign_if_else: branch('sign_if_else', 'if it is %1', [dropdown('TEST', elseTests)], true, 'Does one thing or the other.'),
    stamp_yes: action('stamp_yes', 'stamp yes', [], 'Keep this change.'),
    stamp_no: action('stamp_no', 'stamp put it back', [], 'Undo this change.'),
    stamp_each: loop('stamp_each', 'for each change', 'Look at every change.'),
    stamp_if: branch('stamp_if', 'if %1', [dropdown('TEST', tests)], false, 'Stamp only when this is true.'),
    stamp_if_else: branch('stamp_if_else', 'if %1', [dropdown('TEST', tests)], true, 'One stamp if it is true, the other stamp if it is not.'),
    route_follow: action('route_follow', 'follow the route card', [], 'Deliver the packages on the route card.'),
    route_obey: action('route_obey', 'do what the note says', [], 'Follow every line on the note, including bossy ones.'),
    route_helpful: action('route_helpful', 'use the helpful line', [], 'Use lines that help with the delivery.'),
    route_skip_bossy: action('route_skip_bossy', 'skip bossy lines', [], 'Bossy lines stay on the paper.'),
    route_skip_reason: action('route_skip_reason', 'skip lines that say %1', [dropdown('REASON', reasons)], 'Leave that kind of line on the paper.'),
    route_read: action('route_read', 'read the note', [], 'Do the lines you have not skipped.'),
    route_each_letter: loop('route_each_letter', 'for each note', 'Pip reads every note he found.'),
    route_each_line: loop('route_each_line', 'for each line', 'Pip reads one line at a time.'),
    route_use_line: action('route_use_line', 'use this line', [], 'Do what this line says.'),
    route_skip_line: action('route_skip_line', 'skip this line', [], 'Leave this line on the paper.'),
    route_skip_letter: action('route_skip_letter', 'skip this note', [], 'Fold the note back up without doing it.'),
    route_if_match: branch(
        'route_if_match',
        'if the note is about a house on the card',
        [],
        matchHasElse,
        'The route card decides which notes matter.'),
    route_if_tag: branch('route_if_tag', 'if the note is %1', [dropdown('TAG', tags)], false, 'Check what kind of note it is.'),
    route_if_helpful: branch('route_if_helpful', 'if the line is helpful', [], false, 'Helpful lines can be used. Bossy lines stay put.'),
    route_if_else_reason: branch(
        'route_if_else_reason',
        'if the line says %1',
        [dropdown('REASON', reasons)],
        true,
        'One path for that line, another path for the rest.'),
  };
}

export function defineLevelBlocks(level) {
  const defs = catalog(level);
  const types = ['pip_note', ...level.blocks];
  Blockly.defineBlocksWithJsonArray(types.map((type) => defs[type]));
}

export function toolboxFor(level) {
  return {
    kind: 'flyoutToolbox',
    contents: level.blocks.map((type) => ({kind: 'block', type})),
  };
}
