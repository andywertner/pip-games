// Correct programs for every level. The teacher button loads these into the
// workspace, and the tests check that each one still wins.

function b(type, fields = {}, inputs = {}) {
  return {type, fields, inputs, next: null};
}

function chain(nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  return nodes[0];
}

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
