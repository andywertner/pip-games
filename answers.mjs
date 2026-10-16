// Correct programs for every level. The teacher button loads these into the
// workspace, and the tests check that each one still wins.

function b(type, fields = {}, inputs = {}) {
  return {type, fields, inputs, next: null};
}

function chain(nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return nodes[0];
}

export const helloSolutions = [
  b('hello_wave'),
  chain([b('hello_grab', {TOOL: 'broom'}), b('hello_sweep')]),
  b('hello_water', {TARGET: 'plants'}),
  b('job_paint', {}, {DO: b('tool_brush')}),
  chain([b('job_sweep', {}, {DO: b('tool_broom')}), b('job_water', {}, {DO: b('tool_can')})]),
  chain([b('job_paint', {}, {DO: b('tool_brush')}), b('job_water', {}, {DO: b('tool_can')})]),
];

export const drawSolutions = [
  b('draw_subject', {SUBJECT: 'cat'}),
  chain([b('draw_subject', {SUBJECT: 'cat'}), b('draw_color', {COLOR: 'orange'})]),
  chain([b('draw_subject', {SUBJECT: 'cat'}), b('draw_color', {COLOR: 'orange'}), b('draw_size', {SIZE: 'big'})]),
  chain([b('draw_subject', {SUBJECT: 'fish'}), b('draw_color', {COLOR: 'blue'}), b('draw_count', {COUNT: '3'})]),
  chain([b('draw_subject', {SUBJECT: 'cat'}), b('draw_place', {PLACE: 'rug'})]),
  chain([
    b('draw_subject', {SUBJECT: 'cat'}), b('draw_color', {COLOR: 'orange'}), b('draw_place', {PLACE: 'rug'}),
    b('draw_subject', {SUBJECT: 'sun'}), b('draw_place', {PLACE: 'sky'}),
  ]),
  chain([b('draw_subject', {SUBJECT: 'dog'}), b('draw_color', {COLOR: 'green'}), b('draw_no', {NO: 'hat'})]),
  b('draw_bigger', {SUBJECT: 'cat'}),
  b('draw_bigger', {SUBJECT: 'dog'}),
  chain([
    b('draw_subject', {SUBJECT: 'fish'}), b('draw_color', {COLOR: 'purple'}), b('draw_size', {SIZE: 'big'}),
    b('draw_place', {PLACE: 'pond'}), b('draw_no', {NO: 'hat'}),
  ]),
];

export const signSolutions = [
  b('sign_words', {WORD: 'PLAY'}),
  chain([b('sign_words', {WORD: 'PLAY'}), b('sign_door', {COLOR: 'blue'})]),
  b('sign_each', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  b('sign_each_club', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  chain([
    b('sign_each_club', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
    b('sign_door', {COLOR: 'blue'}),
  ]),
  b('sign_each', {}, {DO: b('sign_if', {TEST: 'club'}, {DO: b('sign_words', {WORD: 'PLAY'})})}),
  b('sign_each', {}, {DO: b('sign_if', {TEST: 'shop'}, {DO: b('sign_words', {WORD: 'OPEN'})})}),
  b('sign_each', {}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  b('sign_each', {}, {DO: b('sign_if_else', {TEST: 'cracked'}, {
    DO: b('sign_words', {WORD: 'FIX ME'}),
    ELSE: b('sign_if', {TEST: 'club'}, {DO: b('sign_words', {WORD: 'PLAY'})}),
  })}),
  b('sign_each', {}, {DO: b('sign_if_else', {TEST: 'cracked'}, {
    DO: b('sign_words', {WORD: 'FIX ME'}),
    ELSE: b('sign_if_else', {TEST: 'club'}, {
      DO: b('sign_words', {WORD: 'PLAY'}),
      ELSE: b('sign_if', {TEST: 'shop'}, {DO: b('sign_words', {WORD: 'OPEN'})}),
    }),
  })}),
];

export const stampSolutions = [
  b('stamp_no'),
  b('stamp_yes'),
  b('stamp_if', {TEST: 'check_failed'}, {DO: b('stamp_no')}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'not_asked'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_yes'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'check_failed'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_if_else', {TEST: 'not_asked'}, {
      DO: b('stamp_no'),
      ELSE: b('stamp_yes'),
    }),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'exact'}, {
    DO: b('stamp_yes'),
    ELSE: b('stamp_no'),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'check_failed'}, {
    DO: b('stamp_no'),
    ELSE: b('stamp_if_else', {TEST: 'exact'}, {
      DO: b('stamp_yes'),
      ELSE: b('stamp_no'),
    }),
  })}),
  b('stamp_each', {}, {DO: b('stamp_if_else', {TEST: 'asked_and_passed'}, {
    DO: b('stamp_if_else', {TEST: 'exact'}, {
      DO: b('stamp_yes'),
      ELSE: b('stamp_no'),
    }),
    ELSE: b('stamp_no'),
  })}),
];

export const routeSolutions = [
  chain([b('route_follow'), b('route_helpful')]),
  b('route_follow'),
  b('route_follow'),
  chain([b('route_follow'), b('route_skip_bossy'), b('route_read')]),
  chain([
    b('route_follow'),
    b('route_each_line', {}, {DO: b('route_if_helpful', {}, {DO: b('route_use_line')})}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_match', {}, {DO: b('route_helpful')})}),
  ]),
  chain([
    b('route_follow'),
    b('route_skip_reason', {REASON: 'key'}),
    b('route_read'),
  ]),
  chain([
    b('route_follow'),
    b('route_each_line', {}, {DO: b('route_if_else_reason', {REASON: 'trash'}, {
      DO: b('route_skip_line'),
      ELSE: b('route_use_line'),
    })}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_match', {}, {
      DO: b('route_helpful'),
      ELSE: b('route_skip_letter'),
    })}),
  ]),
  chain([
    b('route_follow'),
    b('route_each_letter', {}, {DO: b('route_if_tag', {TAG: 'useful'}, {DO: b('route_helpful')})}),
  ]),
];
