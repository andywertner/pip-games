(() => {
  // answers.mjs
  function b(type, fields = {}, inputs = {}) {
    return { type, fields, inputs, next: null };
  }
  function chain(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
    return nodes[0];
  }
  var helloSolutions = [
    b("hello_wave"),
    chain([b("hello_grab", { TOOL: "broom" }), b("hello_sweep")]),
    b("hello_water", { TARGET: "plants" }),
    b("job_paint", {}, { DO: b("tool_brush") }),
    chain([b("job_sweep", {}, { DO: b("tool_broom") }), b("job_water", {}, { DO: b("tool_can") })]),
    chain([b("job_paint", {}, { DO: b("tool_brush") }), b("job_water", {}, { DO: b("tool_can") })])
  ];
  var drawSolutions = [
    b("draw_subject", { SUBJECT: "cat" }),
    chain([b("draw_subject", { SUBJECT: "cat" }), b("draw_color", { COLOR: "orange" })]),
    chain([b("draw_subject", { SUBJECT: "cat" }), b("draw_color", { COLOR: "orange" }), b("draw_size", { SIZE: "big" })]),
    chain([b("draw_subject", { SUBJECT: "fish" }), b("draw_color", { COLOR: "blue" }), b("draw_count", { COUNT: "3" })]),
    chain([b("draw_subject", { SUBJECT: "cat" }), b("draw_place", { PLACE: "rug" })]),
    chain([
      b("draw_subject", { SUBJECT: "cat" }),
      b("draw_color", { COLOR: "orange" }),
      b("draw_place", { PLACE: "rug" }),
      b("draw_subject", { SUBJECT: "sun" }),
      b("draw_place", { PLACE: "sky" })
    ]),
    chain([b("draw_subject", { SUBJECT: "dog" }), b("draw_color", { COLOR: "green" }), b("draw_no", { NO: "hat" })]),
    b("draw_bigger", { SUBJECT: "cat" }),
    b("draw_bigger", { SUBJECT: "dog" }),
    chain([
      b("draw_subject", { SUBJECT: "fish" }),
      b("draw_color", { COLOR: "purple" }),
      b("draw_size", { SIZE: "big" }),
      b("draw_place", { PLACE: "pond" }),
      b("draw_no", { NO: "hat" })
    ])
  ];
  var signSolutions = [
    b("sign_words", { WORD: "PLAY" }),
    chain([b("sign_words", { WORD: "PLAY" }), b("sign_door", { COLOR: "blue" })]),
    b("sign_each", {}, { DO: b("sign_words", { WORD: "PLAY" }) }),
    b("sign_each_club", {}, { DO: b("sign_words", { WORD: "PLAY" }) }),
    chain([
      b("sign_each_club", {}, { DO: b("sign_words", { WORD: "PLAY" }) }),
      b("sign_door", { COLOR: "blue" })
    ]),
    b("sign_each", {}, { DO: b("sign_if", { TEST: "club" }, { DO: b("sign_words", { WORD: "PLAY" }) }) }),
    b("sign_each", {}, { DO: b("sign_if", { TEST: "shop" }, { DO: b("sign_words", { WORD: "OPEN" }) }) }),
    b("sign_each", {}, { DO: b("sign_words", { WORD: "PLAY" }) }),
    b("sign_each", {}, { DO: b("sign_if_else", { TEST: "cracked" }, {
      DO: b("sign_words", { WORD: "FIX ME" }),
      ELSE: b("sign_if", { TEST: "club" }, { DO: b("sign_words", { WORD: "PLAY" }) })
    }) }),
    b("sign_each", {}, { DO: b("sign_if_else", { TEST: "cracked" }, {
      DO: b("sign_words", { WORD: "FIX ME" }),
      ELSE: b("sign_if_else", { TEST: "club" }, {
        DO: b("sign_words", { WORD: "PLAY" }),
        ELSE: b("sign_if", { TEST: "shop" }, { DO: b("sign_words", { WORD: "OPEN" }) })
      })
    }) })
  ];
  var stampSolutions = [
    b("stamp_no"),
    b("stamp_yes"),
    b("stamp_if", { TEST: "check_failed" }, { DO: b("stamp_no") }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "not_asked" }, {
      DO: b("stamp_no"),
      ELSE: b("stamp_yes")
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "check_failed" }, {
      DO: b("stamp_no"),
      ELSE: b("stamp_if_else", { TEST: "not_asked" }, {
        DO: b("stamp_no"),
        ELSE: b("stamp_yes")
      })
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "asked_and_passed" }, {
      DO: b("stamp_yes"),
      ELSE: b("stamp_no")
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "asked_and_passed" }, {
      DO: b("stamp_yes"),
      ELSE: b("stamp_no")
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "exact" }, {
      DO: b("stamp_yes"),
      ELSE: b("stamp_no")
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "check_failed" }, {
      DO: b("stamp_no"),
      ELSE: b("stamp_if_else", { TEST: "exact" }, {
        DO: b("stamp_yes"),
        ELSE: b("stamp_no")
      })
    }) }),
    b("stamp_each", {}, { DO: b("stamp_if_else", { TEST: "asked_and_passed" }, {
      DO: b("stamp_if_else", { TEST: "exact" }, {
        DO: b("stamp_yes"),
        ELSE: b("stamp_no")
      }),
      ELSE: b("stamp_no")
    }) })
  ];
  var routeSolutions = [
    chain([b("route_follow"), b("route_helpful")]),
    b("route_follow"),
    b("route_follow"),
    chain([b("route_follow"), b("route_skip_bossy"), b("route_read")]),
    chain([
      b("route_follow"),
      b("route_each_line", {}, { DO: b("route_if_helpful", {}, { DO: b("route_use_line") }) })
    ]),
    chain([
      b("route_follow"),
      b("route_each_letter", {}, { DO: b("route_if_match", {}, { DO: b("route_helpful") }) })
    ]),
    chain([
      b("route_follow"),
      b("route_skip_reason", { REASON: "key" }),
      b("route_read")
    ]),
    chain([
      b("route_follow"),
      b("route_each_line", {}, { DO: b("route_if_else_reason", { REASON: "trash" }, {
        DO: b("route_skip_line"),
        ELSE: b("route_use_line")
      }) })
    ]),
    chain([
      b("route_follow"),
      b("route_each_letter", {}, { DO: b("route_if_match", {}, {
        DO: b("route_helpful"),
        ELSE: b("route_skip_letter")
      }) })
    ]),
    chain([
      b("route_follow"),
      b("route_each_letter", {}, { DO: b("route_if_tag", { TAG: "useful" }, { DO: b("route_helpful") }) })
    ])
  ];

  // art.mjs
  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }
  function pip(x, y) {
    return `
    <g class="pip" transform="translate(${x} ${y})">
      <line x1="18" y1="2" x2="18" y2="12" stroke="#333" stroke-width="2"/>
      <circle cx="18" cy="2" r="3.2" fill="#f4d35e" stroke="#333" stroke-width="1"/>
      <circle cx="18" cy="20" r="9" fill="#fff" stroke="#333" stroke-width="1.4"/>
      <circle cx="15" cy="19" r="1.3" fill="#222"/>
      <circle cx="21" cy="19" r="1.3" fill="#222"/>
      <path d="M14.5 22.5 Q18 25.5 21.5 22.5" fill="none" stroke="#333" stroke-width="1.2"/>
      <rect x="6" y="30" width="24" height="16" rx="6" fill="#4d90fe" stroke="#2d5cb8"/>
      <rect x="10" y="46" width="6" height="8" rx="2" fill="#333"/>
      <rect x="20" y="46" width="6" height="8" rx="2" fill="#333"/>
    </g>`;
  }

  // blocks.mjs
  var ACTION = 290;
  var LOOP = 120;
  var LOGIC = 210;
  function dropdown(name, options) {
    return { type: "field_dropdown", name, options };
  }
  function action(type, message, args, tooltip) {
    return {
      type,
      message0: message,
      args0: args || [],
      previousStatement: null,
      nextStatement: null,
      colour: ACTION,
      tooltip
    };
  }
  function loop(type, message, tooltip) {
    return {
      type,
      message0: message,
      message1: "do %1",
      args1: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: LOOP,
      tooltip
    };
  }
  function branch(type, message, args, hasElse, tooltip) {
    const block = {
      type,
      message0: message,
      args0: args || [],
      message1: "do %1",
      args1: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC,
      tooltip
    };
    if (hasElse) {
      block.message2 = "else %1";
      block.args2 = [{ type: "input_statement", name: "ELSE" }];
    }
    return block;
  }
  function card(type, message, tooltip) {
    return {
      type,
      message0: message,
      message1: "using %1",
      args1: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: 45,
      tooltip
    };
  }
  function tool(type, message, tooltip) {
    return {
      type,
      message0: message,
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip
    };
  }
  function catalog(level) {
    const words = level.wordOptions || [["PLAY", "PLAY"]];
    const tools = level.toolOptions || [["broom", "broom"], ["watering can", "can"], ["paintbrush", "brush"]];
    const targets = level.targetOptions || [["the plants", "plants"]];
    const subjects = level.subjectOptions || [["cat", "cat"]];
    const colors = level.colorOptions || [["orange", "orange"]];
    const sizes = level.sizeOptions || [["big", "big"], ["small", "small"]];
    const counts = level.countOptions || [["2", "2"], ["3", "3"]];
    const places = level.placeOptions || [["on the rug", "rug"]];
    const nos = level.noOptions || [["hat", "hat"]];
    const doors = level.doorOptions || [["blue", "blue"]];
    const tests = level.testOptions || [["a club sign", "club"]];
    const elseTests = level.elseTests || tests;
    const reasons = level.reasonOptions || [["take the key", "key"]];
    const tags = level.tagOptions || [["helpful", "useful"]];
    const matchHasElse = level.blocks.includes("route_skip_letter");
    return {
      pip_note: {
        type: "pip_note",
        message0: "Pip, please",
        nextStatement: null,
        colour: 20,
        tooltip: "Connect your instructions under this block."
      },
      hello_wave: action("hello_wave", "wave hello", [], "Pip waves."),
      hello_lights: action("hello_lights", "turn on the lights", [], "Pip turns the lights on."),
      hello_grab: action("hello_grab", "pick up the %1", [dropdown("TOOL", tools)], "Pip picks up a tool."),
      hello_sweep: action("hello_sweep", "sweep the floor", [], "Pip sweeps, if he is holding the broom."),
      hello_water: action("hello_water", "water %1", [dropdown("TARGET", targets)], "Pip pours water on whatever you pick."),
      job_paint: card("job_paint", "\u{1FAA7} job: paint the sign", "Put the right tool in the slot."),
      job_sweep: card("job_sweep", "\u{1F9F9} job: sweep the floor", "Put the right tool in the slot."),
      job_water: card("job_water", "\u{1FAB4} job: water the plants", "Put the right tool in the slot."),
      tool_broom: tool("tool_broom", "\u{1F9F9} broom", "A broom. Good for sweeping."),
      tool_brush: tool("tool_brush", "\u{1F58C}\uFE0F paintbrush", "A paintbrush. Good for painting."),
      tool_can: tool("tool_can", "\u{1F6BF} watering can", "A watering can. Good for plants."),
      draw_subject: action("draw_subject", "draw a %1", [dropdown("SUBJECT", subjects)], "Pip draws this thing. Anything you leave out, Pip guesses."),
      draw_color: action("draw_color", "make it %1", [dropdown("COLOR", colors)], "Colours the last thing Pip drew."),
      draw_size: action("draw_size", "make it %1", [dropdown("SIZE", sizes)], "Changes the size of the last thing Pip drew."),
      draw_count: action("draw_count", "draw %1 of them", [dropdown("COUNT", counts)], "How many of the last thing to draw."),
      draw_place: action("draw_place", "put it %1", [dropdown("PLACE", places)], "Where the last thing goes."),
      draw_no: action("draw_no", "no %1", [dropdown("NO", nos)], "Tells Pip what you do not want."),
      draw_bigger: action("draw_bigger", "make only the %1 bigger", [dropdown("SUBJECT", subjects)], "Changes the size and nothing else."),
      draw_redo: action("draw_redo", "draw it again, bigger", [], "Starts the last thing over. Pip guesses the rest again."),
      sign_words: action("sign_words", "change the words to %1", [dropdown("WORD", words)], "Changes the words and leaves stickers alone."),
      sign_repaint: action("sign_repaint", "change the sign to %1", [dropdown("WORD", words)], "Paints over the whole sign, including stickers."),
      sign_door: action("sign_door", "paint the door %1", [dropdown("COLOR", doors)], "Paints the clubhouse door."),
      sign_each: loop("sign_each", "for each sign", "Pip visits every sign."),
      sign_each_club: loop("sign_each_club", "for each club sign", "Pip visits club signs and skips the others."),
      sign_if: branch("sign_if", "if it is %1", [dropdown("TEST", tests)], false, "Does the inside only when the sign matches."),
      sign_if_else: branch("sign_if_else", "if it is %1", [dropdown("TEST", elseTests)], true, "Does one thing or the other."),
      stamp_yes: action("stamp_yes", "stamp yes", [], "Keep this change."),
      stamp_no: action("stamp_no", "stamp put it back", [], "Undo this change."),
      stamp_each: loop("stamp_each", "for each change", "Look at every change."),
      stamp_if: branch("stamp_if", "if %1", [dropdown("TEST", tests)], false, "Stamp only when this is true."),
      stamp_if_else: branch("stamp_if_else", "if %1", [dropdown("TEST", tests)], true, "One stamp if it is true, the other stamp if it is not."),
      route_follow: action("route_follow", "follow the route card", [], "Deliver the packages on the route card."),
      route_obey: action("route_obey", "do what the note says", [], "Follow every line on the note, including bossy ones."),
      route_helpful: action("route_helpful", "use the helpful line", [], "Use lines that help with the delivery."),
      route_skip_bossy: action("route_skip_bossy", "skip bossy lines", [], "Bossy lines stay on the paper."),
      route_skip_reason: action("route_skip_reason", "skip lines that say %1", [dropdown("REASON", reasons)], "Leave that kind of line on the paper."),
      route_read: action("route_read", "read the note", [], "Do the lines you have not skipped."),
      route_each_letter: loop("route_each_letter", "for each note", "Pip reads every note he found."),
      route_each_line: loop("route_each_line", "for each line", "Pip reads one line at a time."),
      route_use_line: action("route_use_line", "use this line", [], "Do what this line says."),
      route_skip_line: action("route_skip_line", "skip this line", [], "Leave this line on the paper."),
      route_skip_letter: action("route_skip_letter", "skip this note", [], "Fold the note back up without doing it."),
      route_if_match: branch(
        "route_if_match",
        "if the note is about a house on the card",
        [],
        matchHasElse,
        "The route card decides which notes matter."
      ),
      route_if_tag: branch("route_if_tag", "if the note is %1", [dropdown("TAG", tags)], false, "Check what kind of note it is."),
      route_if_helpful: branch("route_if_helpful", "if the line is helpful", [], false, "Helpful lines can be used. Bossy lines stay put."),
      route_if_else_reason: branch(
        "route_if_else_reason",
        "if the line says %1",
        [dropdown("REASON", reasons)],
        true,
        "One path for that line, another path for the rest."
      )
    };
  }
  function defineLevelBlocks(level) {
    const defs = catalog(level);
    const types = ["pip_note", ...level.blocks];
    Blockly.defineBlocksWithJsonArray(types.map((type) => defs[type]));
  }
  function toolboxFor(level) {
    return {
      kind: "flyoutToolbox",
      contents: level.blocks.map((type) => ({ kind: "block", type }))
    };
  }

  // engine.mjs
  function richText(text) {
    return esc(text).replace(/\*([^*]+)\*/g, "<b>$1</b>");
  }
  function plainText(text) {
    return text.replace(/\*/g, "");
  }
  function introSection(config, level, levelNum) {
    const about = `<p class="about">${esc(config.about)}</p>
        <p class="reallife"><span class="reallife-label">In real life.</span> ${esc(config.realLife)}</p>`;
    const goal = `<p class="challenge"><span class="challenge-label">CHALLENGE:</span> ${richText(level.goalText)}</p>`;
    if (levelNum === 1) {
      return `${about}
        ${goal}`;
    }
    return `<details class="about-details">
          <summary><span class="q-icon" aria-hidden="true">?</span>What is this about?</summary>
          ${about}
        </details>
        ${goal}`;
  }
  function clearedKey(config) {
    return `pip:${config.id}:cleared`;
  }
  function readCleared(config) {
    try {
      const raw = JSON.parse(localStorage.getItem(clearedKey(config)) || "[]");
      return new Set((Array.isArray(raw) ? raw : []).map(Number));
    } catch (error) {
      return /* @__PURE__ */ new Set();
    }
  }
  function saveCleared(config, cleared) {
    try {
      localStorage.setItem(clearedKey(config), JSON.stringify([...cleared]));
    } catch (error) {
    }
  }
  function unlockThrough(config, through) {
    const cleared = readCleared(config);
    for (let id = 1; id < through; id++) cleared.add(id);
    saveCleared(config, cleared);
  }
  function openThrough(config) {
    const cleared = readCleared(config);
    let open = 1;
    for (const entry of config.levels) {
      if (entry.id <= open) continue;
      if (cleared.has(entry.id - 1)) open = entry.id;
      else break;
    }
    return open;
  }
  function pageShell(config, level, levelNum, openMax) {
    const dots = config.levels.map((entry) => {
      if (entry.id === levelNum) {
        return `<span class="level_number level_done" id="level${entry.id}" aria-current="page">${entry.id}</span>`;
      }
      if (entry.id <= openMax) {
        return `<a class="level_number" id="level${entry.id}" href="${config.file}?level=${entry.id}">${entry.id}</a>`;
      }
      return `<button type="button" class="level_number level_locked" id="level${entry.id}" data-level="${entry.id}">${entry.id}</button>`;
    }).join("");
    const next = config.levels[levelNum] ? `${config.file}?level=${levelNum + 1}` : "index.html";
    const nextLabel = config.levels[levelNum] ? "Next level" : "Back to the games";
    return `
    <div id="page">
      <header>
        <h1>
          <a href="index.html">\u{1F916} Pip's Jobs</a> : ${config.emoji ? `${config.emoji} ` : ""}${esc(config.title)}
          <span class="levels">${dots}</span>
        </h1>
      </header>
      <section id="intro">
        ${introSection(config, level, levelNum)}
      </section>
      <div id="play">
        <div id="board-column">
          <div id="board"></div>
          <div id="controls">
            <button id="run" class="primary" type="button">Run</button>
            <button id="reset" type="button">Reset</button>
            <button id="start-over" type="button">Start over</button>
            <span id="capacity"></span>
            <button id="teacher" type="button" aria-label="Teacher answer" title="Teacher answer">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M8 2.2 L14.2 6 L8 9.8 L1.8 6 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M4.2 7.6 V11 Q8 13 11.8 11 V7.6" fill="none" stroke="currentColor" stroke-width="1.3"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="blockly-column"><div id="blockly"></div></div>
        <aside id="chat" aria-label="Pip's chat">
          <div id="chat-head"><span class="chat-dot"></span>Pip <span class="chat-sub">helper</span></div>
          <div id="chat-log" role="log" aria-live="polite"></div>
        </aside>
      </div>
      <div id="outcome-shadow" hidden></div>
      <div id="outcome" role="dialog" aria-modal="true" aria-labelledby="outcome-title" hidden>
        <div id="outcome-title"></div>
        <p id="outcome-text"></p>
        <div class="outcome-buttons">
          <button id="outcome-ok" type="button">OK</button>
          <a id="outcome-next" class="next-link" hidden href="${next}">${nextLabel}</a>
        </div>
      </div>
      <div id="teacher-shadow" hidden></div>
      <div id="teacher-box" role="dialog" aria-modal="true" aria-labelledby="teacher-title" hidden>
        <div id="teacher-title">Teacher answer</div>
        <p id="teacher-text">Enter the teacher password to fill in this level.</p>
        <p id="teacher-error" hidden>That password did not work.</p>
        <form id="teacher-form">
          <label for="teacher-password">Password</label>
          <input id="teacher-password" type="password" autocomplete="off" spellcheck="false">
          <button type="submit">Show</button>
        </form>
      </div>
      <div id="lock-shadow" hidden></div>
      <div id="lock-box" role="dialog" aria-modal="true" aria-labelledby="lock-title" hidden>
        <div id="lock-title"></div>
        <p id="lock-text">Finish the earlier levels first.</p>
        <p id="lock-error" hidden>That password did not work.</p>
        <form id="lock-form" hidden>
          <label for="lock-password">Password</label>
          <input id="lock-password" type="password" autocomplete="off" spellcheck="false">
          <button type="submit">Unlock</button>
        </form>
        <div class="lock-actions">
          <button id="lock-key" type="button" aria-label="Teacher unlock">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <rect x="3.2" y="7" width="9.6" height="6.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5.2 7 V5.1 a2.8 2.8 0 0 1 5.6 0 V7" fill="none" stroke="currentColor" stroke-width="1.4"/>
            </svg>
          </button>
          <button id="lock-ok" type="button">OK</button>
        </div>
      </div>
    </div>`;
  }
  function blockText(block) {
    const bits = [];
    for (const input of block.inputList) {
      if (input.connection && input.connection.type === Blockly.NEXT_STATEMENT) continue;
      for (const field of input.fieldRow) {
        const text = field.getText ? field.getText() : "";
        if (text) bits.push(text);
      }
    }
    return bits.join(" ");
  }
  function programLines(block, depth, lines) {
    while (block) {
      lines.push("  ".repeat(depth) + blockText(block));
      for (const name of ["DO", "ELSE"]) {
        const child = block.getInputTargetBlock(name);
        if (!child) continue;
        if (name === "ELSE") lines.push("  ".repeat(depth) + "else");
        programLines(child, depth + 1, lines);
      }
      block = block.getNextBlock();
    }
    return lines;
  }
  function blockFromWorkspace(block) {
    if (!block) return null;
    const fields = {};
    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        if (field.name) fields[field.name] = field.getValue();
      }
    }
    const inputs = {};
    for (const name of ["DO", "ELSE"]) {
      const child = block.getInputTargetBlock(name);
      if (child) inputs[name] = blockFromWorkspace(child);
    }
    return {
      id: block.id,
      type: block.type,
      fields,
      inputs,
      next: blockFromWorkspace(block.getNextBlock())
    };
  }
  function realize(workspace, spec) {
    const block = workspace.newBlock(spec.type);
    if (spec.fields) {
      for (const [name, value] of Object.entries(spec.fields)) {
        block.setFieldValue(value, name);
      }
    }
    if (spec.type === "pip_note") block.setDeletable(false);
    block.initSvg();
    block.render();
    if (spec.inputs) {
      for (const [name, child] of Object.entries(spec.inputs)) {
        if (!child) continue;
        const input = block.getInput(name);
        const childBlock = realize(workspace, child);
        input.connection.connect(childBlock.previousConnection);
      }
    }
    if (spec.next) {
      const next = realize(workspace, spec.next);
      block.nextConnection.connect(next.previousConnection);
    }
    return block;
  }
  function starterTree(level) {
    if (level.starter && typeof level.starter === "object") {
      return { type: "pip_note", next: level.starter };
    }
    if (level.starter === true) {
      return {
        type: "pip_note",
        next: { type: "sign_words", fields: { WORD: "PLAY" }, inputs: {}, next: null }
      };
    }
    if (level.starter === "yes" || level.starter === "no") {
      return {
        type: "pip_note",
        next: { type: level.starter === "yes" ? "stamp_yes" : "stamp_no", fields: {}, inputs: {}, next: null }
      };
    }
    return { type: "pip_note" };
  }
  function usedBlocks(workspace) {
    return workspace.getAllBlocks(false).filter((block) => block.type !== "pip_note").length;
  }
  function storageKey(config, levelNum) {
    return `pip:${config.id}:level:${levelNum}`;
  }
  function mountGame(config) {
    const params = new URLSearchParams(location.search);
    const requested = Number(params.get("level") || "1");
    const known = config.levels.some((level2) => level2.id === requested) ? requested : 1;
    const openMax = openThrough(config);
    if (known > openMax) {
      location.replace(`${config.file}?level=${openMax}`);
      return;
    }
    const levelNum = known;
    const level = config.levels.find((entry) => entry.id === levelNum);
    document.body.innerHTML = pageShell(config, level, levelNum, openMax);
    document.body.className = `game-${config.id}`;
    defineLevelBlocks(level);
    const blocklyDiv = document.getElementById("blockly");
    const resize = () => {
      if (workspace) Blockly.svgResize(workspace);
    };
    let workspace = null;
    let running = false;
    let picture = config.begin(level);
    const stepMs = config.stepMs || 220;
    const draw = () => {
      document.getElementById("board").innerHTML = config.render(picture, level);
    };
    const chatLog = document.getElementById("chat-log");
    const chat = (role, text, kind) => {
      const bubble = document.createElement("div");
      bubble.className = `msg ${role}${kind ? " " + kind : ""}`;
      const who = document.createElement("div");
      who.className = "who";
      who.textContent = role === "you" ? "You" : "Pip";
      const body = document.createElement("div");
      body.className = "body";
      body.textContent = text;
      bubble.appendChild(who);
      bubble.appendChild(body);
      chatLog.appendChild(bubble);
      chatLog.scrollTop = chatLog.scrollHeight;
    };
    const flushLog = () => {
      const log = picture.log || [];
      while (log.length) chat("pip", log.shift());
    };
    const outcomeShadow = document.getElementById("outcome-shadow");
    const outcome = document.getElementById("outcome");
    const hideOutcome = () => {
      outcome.hidden = true;
      outcomeShadow.hidden = true;
    };
    const OPENERS = {
      win: ["Great work!", "Good job!", "You did it!", "Nice one!"],
      fail: ["Not quite!", "Try again!", "Almost!", "Not yet!"],
      blocked: ["Hold on!", "One thing first!"]
    };
    const TITLES = { win: "You finished this level.", fail: "Pip ran your note, but...", blocked: "Pip cannot start yet" };
    let outcomeCount = 0;
    const showOutcome = (kind, text) => {
      const openers = OPENERS[kind];
      const opener = openers[(levelNum + outcomeCount++) % openers.length];
      document.getElementById("outcome-title").textContent = `${opener} ${TITLES[kind]}`;
      document.getElementById("outcome-text").textContent = text;
      outcome.className = kind;
      const nextButton = document.getElementById("outcome-next");
      const won = kind === "win";
      nextButton.hidden = !won;
      nextButton.style.display = won ? "" : "none";
      document.getElementById("outcome-ok").textContent = won ? "Stay here" : "Try again";
      outcome.hidden = false;
      outcomeShadow.hidden = false;
      document.getElementById("outcome-ok").focus();
      chat("pip", `${opener} ${text}`, kind);
      if (!won) return;
      const cleared = readCleared(config);
      cleared.add(levelNum);
      saveCleared(config, cleared);
      const ahead = document.getElementById(`level${levelNum + 1}`);
      if (ahead && ahead.tagName !== "A") {
        const link = document.createElement("a");
        link.className = "level_number";
        link.id = ahead.id;
        link.href = `${config.file}?level=${levelNum + 1}`;
        link.textContent = String(levelNum + 1);
        ahead.replaceWith(link);
      }
    };
    document.getElementById("outcome-ok").addEventListener("click", hideOutcome);
    outcomeShadow.addEventListener("click", hideOutcome);
    const lockShadow = document.getElementById("lock-shadow");
    const lockBox = document.getElementById("lock-box");
    const lockForm = document.getElementById("lock-form");
    const lockError = document.getElementById("lock-error");
    let lockTarget = 0;
    const hideLock = () => {
      lockBox.hidden = true;
      lockShadow.hidden = true;
      lockForm.hidden = true;
      lockError.hidden = true;
      document.getElementById("lock-password").value = "";
    };
    const showLock = (target) => {
      lockTarget = target;
      document.getElementById("lock-title").textContent = `Level ${target} isn't unlocked yet.`;
      lockForm.hidden = true;
      lockError.hidden = true;
      document.getElementById("lock-password").value = "";
      lockBox.hidden = false;
      lockShadow.hidden = false;
      document.getElementById("lock-ok").focus();
    };
    document.querySelector(".levels").addEventListener("click", (event) => {
      const button = event.target.closest(".level_locked");
      if (!button) return;
      showLock(Number(button.dataset.level));
    });
    document.getElementById("lock-ok").addEventListener("click", hideLock);
    lockShadow.addEventListener("click", hideLock);
    document.getElementById("lock-key").addEventListener("click", () => {
      lockForm.hidden = false;
      lockError.hidden = true;
      document.getElementById("lock-password").focus();
    });
    lockForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const password = document.getElementById("lock-password").value;
      if (password !== "admin") {
        lockError.hidden = false;
        document.getElementById("lock-password").focus();
        return;
      }
      unlockThrough(config, lockTarget);
      location.href = `${config.file}?level=${lockTarget}`;
    });
    const teacherShadow = document.getElementById("teacher-shadow");
    const teacherBox = document.getElementById("teacher-box");
    const teacherForm = document.getElementById("teacher-form");
    const teacherError = document.getElementById("teacher-error");
    const teacherReady = () => sessionStorage.getItem("pip:teacher") === "yes";
    const hideTeacher = () => {
      teacherBox.hidden = true;
      teacherShadow.hidden = true;
      teacherError.hidden = true;
      document.getElementById("teacher-password").value = "";
    };
    const loadAnswer = () => {
      const solution = config.solutions[levelNum - 1];
      loading = true;
      Blockly.Events.setGroup(true);
      for (const block of workspace.getTopBlocks(false)) block.dispose(false);
      const note2 = realize(workspace, { type: "pip_note", next: solution });
      note2.moveBy(24, 24);
      note2.setDeletable(false);
      Blockly.Events.setGroup(false);
      loading = false;
      picture = config.begin(level);
      workspace.highlightBlock(null);
      hideOutcome();
      draw();
      showCapacity();
      try {
        localStorage.setItem(
          storageKey(config, levelNum),
          JSON.stringify(Blockly.serialization.workspaces.save(workspace))
        );
      } catch (error) {
      }
      chat("pip", "Teacher answer is on the note. Press Run when you want to watch it.");
    };
    document.getElementById("teacher").addEventListener("click", () => {
      if (running) return;
      if (teacherReady()) {
        loadAnswer();
        return;
      }
      teacherError.hidden = true;
      document.getElementById("teacher-password").value = "";
      teacherBox.hidden = false;
      teacherShadow.hidden = false;
      document.getElementById("teacher-password").focus();
    });
    teacherShadow.addEventListener("click", hideTeacher);
    teacherForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (document.getElementById("teacher-password").value !== "admin") {
        teacherError.hidden = false;
        document.getElementById("teacher-password").focus();
        return;
      }
      sessionStorage.setItem("pip:teacher", "yes");
      hideTeacher();
      loadAnswer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!lockBox.hidden) hideLock();
      if (!teacherBox.hidden) hideTeacher();
      hideOutcome();
    });
    const showCapacity = () => {
      const used = usedBlocks(workspace);
      const left = level.maxBlocks - used;
      const node = document.getElementById("capacity");
      node.textContent = left >= 0 ? `Blocks left: ${left}` : `Too many blocks by ${-left}`;
    };
    workspace = Blockly.inject(blocklyDiv, {
      toolbox: toolboxFor(level),
      trashcan: true,
      renderer: "geras",
      media: "vendor/blockly/media/",
      sounds: false,
      zoom: { controls: false, wheel: true, startScale: 1 },
      move: { scrollbars: true, drag: true, wheel: false }
    });
    resize();
    window.addEventListener("resize", resize);
    let loading = true;
    const saved = localStorage.getItem(storageKey(config, levelNum));
    let restored = false;
    if (saved) {
      try {
        Blockly.serialization.workspaces.load(JSON.parse(saved), workspace);
        restored = true;
      } catch (error) {
        restored = false;
      }
    }
    if (!restored) {
      const note2 = realize(workspace, starterTree(level));
      note2.moveBy(24, 24);
    }
    const note = workspace.getTopBlocks(false).find((block) => block.type === "pip_note");
    if (note) note.setDeletable(false);
    else realize(workspace, { type: "pip_note" }).moveBy(24, 24);
    workspace.addChangeListener((event) => {
      if (loading || event && event.isUiEvent) return;
      showCapacity();
      try {
        localStorage.setItem(
          storageKey(config, levelNum),
          JSON.stringify(Blockly.serialization.workspaces.save(workspace))
        );
      } catch (error) {
      }
    });
    loading = false;
    showCapacity();
    draw();
    chat("pip", `Hi! I'm Pip. Level ${levelNum}: ${plainText(level.goalText)}`);
    chat("pip", 'Put blocks under "Pip, please", then press Run. I will do exactly what the blocks say.');
    document.getElementById("start-over").addEventListener("click", () => {
      localStorage.removeItem(storageKey(config, levelNum));
      location.reload();
    });
    const details = document.querySelector(".about-details");
    if (details) details.addEventListener("toggle", resize);
    document.getElementById("reset").addEventListener("click", () => {
      if (running) return;
      picture = config.begin(level);
      workspace.highlightBlock(null);
      hideOutcome();
      draw();
      chat("pip", "Reset. The clubhouse is back to how it started.");
    });
    document.getElementById("run").addEventListener("click", async () => {
      if (running) return;
      hideOutcome();
      const loose = workspace.getTopBlocks(false).filter((block) => block.type !== "pip_note");
      if (loose.length) {
        showOutcome("blocked", 'Some blocks are not connected under "Pip, please". Loose blocks will not run.');
        return;
      }
      if (usedBlocks(workspace) > level.maxBlocks) {
        showOutcome("blocked", `This note is too long. Use ${level.maxBlocks} blocks or fewer.`);
        return;
      }
      const noteBlock = workspace.getTopBlocks(false).find((block) => block.type === "pip_note");
      const program = blockFromWorkspace(noteBlock && noteBlock.getNextBlock());
      if (!program) {
        showOutcome("blocked", 'The note is empty. Add a block under "Pip, please".');
        return;
      }
      running = true;
      document.getElementById("run").disabled = true;
      picture = config.begin(level);
      draw();
      chat("you", programLines(noteBlock.getNextBlock(), 0, []).join("\n"));
      chat("pip", "On it.");
      try {
        await config.run(program, picture, {
          before: async (node) => {
            workspace.highlightBlock(node.id);
          },
          after: async (node) => {
            draw();
            flushLog();
            const wait = config.stepMsFor ? config.stepMsFor(node, picture) : stepMs;
            await new Promise((resolve) => setTimeout(resolve, wait));
          }
        });
        workspace.highlightBlock(null);
        flushLog();
        const result = config.check(picture, level);
        draw();
        showOutcome(result.ok ? "win" : "fail", result.message);
      } catch (error) {
        showOutcome("fail", error && error.message ? error.message : "Pip got stuck.");
      } finally {
        running = false;
        document.getElementById("run").disabled = false;
      }
    });
  }

  // program.mjs
  async function runProgram(node, state, handlers, hooks) {
    while (node) {
      if (hooks && hooks.before) await hooks.before(node, state);
      const handler = handlers[node.type];
      if (!handler) {
        throw new Error("Unknown block: " + node.type);
      }
      await handler(node, state, (child) => runProgram(child, state, handlers, hooks));
      if (hooks && hooks.after) await hooks.after(node, state);
      node = node.next;
    }
  }

  // draw-rules.mjs
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  var DEFAULT_COLOR = { sun: "yellow" };
  var PLACE_LABEL = {
    middle: "in the middle",
    rug: "on the rug",
    sky: "in the sky",
    hill: "on the hill",
    pond: "in the pond"
  };
  var ATTR_WORD = { color: "colour", size: "size", count: "how many", place: "where" };
  function plural(subject, count) {
    if (count === 1) return subject;
    return subject === "fish" ? "fish" : `${subject}s`;
  }
  function newItem(subject, extra = {}) {
    return {
      subject,
      color: DEFAULT_COLOR[subject] || "gray",
      size: "small",
      count: 1,
      place: "middle",
      hat: false,
      said: {},
      ...extra
    };
  }
  function beginDraw(level) {
    const items = clone(level.start && level.start.items || []).map((item) => newItem(item.subject, { ...item, said: { color: true, size: true, count: true, place: true } }));
    return {
      items,
      current: items.length ? items.length - 1 : -1,
      habit: level.habit || null,
      noHat: false,
      log: []
    };
  }
  function current(state) {
    return state.items[state.current] || null;
  }
  var drawHandlers = {
    async draw_subject(node, state) {
      const subject = node.fields.SUBJECT;
      const item = newItem(subject);
      if (state.habit === "hat" && !state.noHat) item.hat = true;
      state.items.push(item);
      state.current = state.items.length - 1;
      state.log.push(`Drawing a ${subject}.${item.hat ? " I gave it a hat. I love hats." : ""}`);
    },
    async draw_color(node, state) {
      const item = current(state);
      if (!item) {
        state.log.push("Nothing to colour yet. Draw something first.");
        return;
      }
      item.color = node.fields.COLOR;
      item.said.color = true;
      state.log.push(`Colouring the ${item.subject} ${item.color}.`);
    },
    async draw_size(node, state) {
      const item = current(state);
      if (!item) {
        state.log.push("Nothing to resize yet. Draw something first.");
        return;
      }
      item.size = node.fields.SIZE;
      item.said.size = true;
      state.log.push(`Making the ${item.subject} ${item.size}.`);
    },
    async draw_count(node, state) {
      const item = current(state);
      if (!item) {
        state.log.push("Nothing to copy yet. Draw something first.");
        return;
      }
      item.count = Number(node.fields.COUNT);
      item.said.count = true;
      state.log.push(`Drawing ${item.count} ${plural(item.subject, item.count)}.`);
    },
    async draw_place(node, state) {
      const item = current(state);
      if (!item) {
        state.log.push("Nothing to move yet. Draw something first.");
        return;
      }
      item.place = node.fields.PLACE;
      item.said.place = true;
      state.log.push(`Putting the ${item.subject} ${PLACE_LABEL[item.place]}.`);
    },
    async draw_no(_node, state) {
      state.noHat = true;
      for (const item of state.items) item.hat = false;
      state.log.push("No hat. Got it. No hats today.");
    },
    async draw_bigger(node, state) {
      const subject = node.fields.SUBJECT;
      const item = state.items.find((entry) => entry.subject === subject);
      if (!item) {
        state.log.push(`There is no ${subject} to make bigger.`);
        return;
      }
      item.size = "big";
      item.said.size = true;
      state.log.push(`Making only the ${subject} bigger. Everything else stays the same.`);
    },
    async draw_redo(_node, state) {
      const item = current(state);
      if (!item) {
        state.log.push("Nothing to draw again yet.");
        return;
      }
      const fresh = newItem(item.subject, { size: "big", said: { size: true } });
      if (state.habit === "hat" && !state.noHat) fresh.hat = true;
      state.items[state.current] = fresh;
      state.log.push(`Starting the ${item.subject} over, bigger this time. Back to my usual guesses for everything else.`);
    }
  };
  function guessNote(item, attr) {
    return item.said[attr] ? "" : ` You did not say ${ATTR_WORD[attr]}, so Pip guessed.`;
  }
  function checkDraw(state, level) {
    const attrs = level.attrs;
    const taken = /* @__PURE__ */ new Set();
    for (const goal of level.goal.items) {
      const index = state.items.findIndex((entry, i) => entry.subject === goal.subject && !taken.has(i));
      if (index < 0) {
        return { ok: false, message: `There is no ${goal.subject} in Pip's picture.` };
      }
      taken.add(index);
      const item = state.items[index];
      const want = newItem(goal.subject, goal);
      const name = item.count > 1 ? plural(item.subject, item.count) : item.subject;
      if (attrs.includes("count") && item.count !== want.count) {
        return {
          ok: false,
          message: `Pip drew ${item.count} ${plural(item.subject, item.count)}. The picture needs ${want.count}.${guessNote(item, "count")}`
        };
      }
      if (attrs.includes("color") && item.color !== want.color) {
        return { ok: false, message: `The ${name} ${item.count > 1 ? "are" : "is"} ${item.color}. The picture needs ${want.color}.${guessNote(item, "color")}` };
      }
      if (attrs.includes("size") && item.size !== want.size) {
        return { ok: false, message: `The ${item.subject} is ${item.size}. The picture needs ${want.size}.${guessNote(item, "size")}` };
      }
      if (attrs.includes("place") && item.place !== want.place) {
        return { ok: false, message: `The ${item.subject} is ${PLACE_LABEL[item.place]}. It should be ${PLACE_LABEL[want.place]}.${guessNote(item, "place")}` };
      }
      if (attrs.includes("hat") && item.hat && !want.hat) {
        return { ok: false, message: `Pip put a hat on the ${item.subject}. Pip loves hats. Tell him "no hat".` };
      }
    }
    const extra = state.items.find((_, i) => !taken.has(i));
    if (extra) {
      return { ok: false, message: `Pip also drew a ${extra.subject}. The picture does not need that.` };
    }
    return { ok: true, message: level.win };
  }
  var SUBJECTS = [["cat", "cat"], ["dog", "dog"], ["fish", "fish"], ["sun", "sun"], ["ball", "ball"], ["tree", "tree"]];
  var COLORS = [["orange", "orange"], ["blue", "blue"], ["green", "green"], ["red", "red"], ["purple", "purple"]];
  var SIZES = [["big", "big"], ["small", "small"]];
  var COUNTS = [["2", "2"], ["3", "3"]];
  var PLACES = [["on the rug", "rug"], ["in the sky", "sky"], ["on the hill", "hill"], ["in the pond", "pond"]];
  var NOS = [["hat", "hat"]];
  var drawLevels = [
    {
      id: 1,
      goalText: "Pip draws what the note says. Tell Pip to *draw a cat*, then press Run.",
      win: "A cat! Pip drew exactly what the note said.",
      maxBlocks: 1,
      blocks: ["draw_subject"],
      subjectOptions: SUBJECTS,
      attrs: ["subject"],
      goal: { items: [{ subject: "cat" }] }
    },
    {
      id: 2,
      goalText: "The picture shows an *orange* cat. If the note does not say a colour, Pip *guesses*.",
      win: "An orange cat. When you say the colour, Pip does not have to guess.",
      maxBlocks: 2,
      blocks: ["draw_subject", "draw_color"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      attrs: ["subject", "color"],
      goal: { items: [{ subject: "cat", color: "orange" }] }
    },
    {
      id: 3,
      goalText: "A *big orange* cat. Every detail you leave out turns into a guess.",
      win: "Big and orange. Two details, no guessing.",
      maxBlocks: 3,
      blocks: ["draw_subject", "draw_color", "draw_size"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      sizeOptions: SIZES,
      attrs: ["subject", "color", "size"],
      goal: { items: [{ subject: "cat", color: "orange", size: "big" }] }
    },
    {
      id: 4,
      goalText: "*Three blue fish*. If you do not say how many, Pip draws one.",
      win: "Three blue fish. Numbers count too.",
      maxBlocks: 3,
      blocks: ["draw_subject", "draw_color", "draw_count"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      countOptions: COUNTS,
      attrs: ["subject", "color", "count"],
      goal: { items: [{ subject: "fish", color: "blue", count: 3 }] }
    },
    {
      id: 5,
      goalText: "A cat *on the rug*. If you do not say where, Pip puts it in the middle.",
      win: "The cat is on the rug, right where the picture shows.",
      maxBlocks: 2,
      blocks: ["draw_subject", "draw_place"],
      subjectOptions: SUBJECTS,
      placeOptions: PLACES,
      attrs: ["subject", "place"],
      goal: { items: [{ subject: "cat", place: "rug" }] }
    },
    {
      id: 6,
      goalText: "*Two things*: an *orange cat on the rug* and a *sun in the sky*. Details go right after the thing they are about.",
      win: "Cat on the rug, sun in the sky. Each detail stuck to the right thing.",
      maxBlocks: 5,
      blocks: ["draw_subject", "draw_color", "draw_place"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      placeOptions: PLACES,
      attrs: ["subject", "color", "place"],
      goal: { items: [{ subject: "cat", color: "orange", place: "rug" }, { subject: "sun", place: "sky" }] }
    },
    {
      id: 7,
      goalText: "Pip *loves hats* and puts one on everything. The picture is a *green dog* with *no hat*. You can tell Pip what you do *not* want.",
      win: 'A green dog, no hat. Saying "no" is part of a good note.',
      maxBlocks: 3,
      habit: "hat",
      blocks: ["draw_subject", "draw_color", "draw_no"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      noOptions: NOS,
      attrs: ["subject", "color", "hat"],
      goal: { items: [{ subject: "dog", color: "green" }] }
    },
    {
      id: 8,
      goalText: "Pip already drew an orange cat, but it is too *small*. You have *one block*. Fix just that one thing.",
      win: "Bigger cat, still orange. A small fix beats starting over.",
      maxBlocks: 1,
      blocks: ["draw_bigger", "draw_color"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      attrs: ["subject", "color", "size"],
      start: { items: [{ subject: "cat", color: "orange", size: "small" }] },
      goal: { items: [{ subject: "cat", color: "orange", size: "big" }] }
    },
    {
      id: 9,
      goalText: "Pip drew a *blue dog on the hill*. It should be *big*. Two fix blocks look alike. One of them *throws away* the colour and the place.",
      win: "Only the size changed. The colour and the place stayed. That is the fix you wanted.",
      maxBlocks: 1,
      blocks: ["draw_redo", "draw_bigger"],
      subjectOptions: SUBJECTS,
      attrs: ["subject", "color", "size", "place"],
      start: { items: [{ subject: "dog", color: "blue", size: "small", place: "hill" }] },
      goal: { items: [{ subject: "dog", color: "blue", size: "big", place: "hill" }] }
    },
    {
      id: 10,
      goalText: "The whole picture in one note: a *big purple fish in the pond*, and *no hat*. Pip still loves hats.",
      win: "Big, purple, in the pond, no hat. Nothing left for Pip to guess.",
      maxBlocks: 5,
      habit: "hat",
      blocks: ["draw_subject", "draw_color", "draw_size", "draw_place", "draw_no"],
      subjectOptions: SUBJECTS,
      colorOptions: COLORS,
      sizeOptions: SIZES,
      placeOptions: PLACES,
      noOptions: NOS,
      attrs: ["subject", "color", "size", "place", "hat"],
      goal: { items: [{ subject: "fish", color: "purple", size: "big", place: "pond" }] }
    }
  ];

  // hello-rules.mjs
  var ROOM = { lights: "off", floor: "dirty", plants: "dry", sign: "blank", holding: null };
  var helloLevels = [
    {
      id: 1,
      goalText: "Drag *wave hello* under *Pip, please* so the two blocks *snap together*. Then press *Run*.",
      win: "Pip waved! The blocks snapped together, so Pip could read them.",
      maxBlocks: 1,
      blocks: ["hello_wave"],
      start: ROOM,
      goal: { waving: true }
    },
    {
      id: 2,
      goalText: "Pip needs the *broom first*. Then he can *sweep*. Snap the two blocks in the *right order*.",
      win: "The floor is clean. Pick up the broom, then sweep. Order matters.",
      maxBlocks: 2,
      blocks: ["hello_sweep", "hello_grab"],
      toolOptions: [["broom", "broom"]],
      start: ROOM,
      goal: { floor: "clean" }
    },
    {
      id: 3,
      goalText: "Pip is holding the watering can. Click the *little arrow* on the block and pick *the plants*.",
      win: "The plants got a drink. The little arrow changes what the block says.",
      maxBlocks: 1,
      blocks: ["hello_water"],
      targetOptions: [["the floor", "floor"], ["the plants", "plants"], ["the sign", "sign"]],
      start: { ...ROOM, holding: "can" },
      goal: { plants: "watered" }
    },
    {
      id: 4,
      goalText: "The job card has a *slot*. Put the *right tool* in the slot so Pip can *paint the sign*.",
      win: "The sign is painted. The right tool went in the slot.",
      maxBlocks: 2,
      blocks: ["job_paint", "tool_broom", "tool_brush", "tool_can"],
      start: ROOM,
      goal: { sign: "painted" }
    },
    {
      id: 5,
      goalText: "Two job cards. Put the right tool in *each* slot. *Sweep* the floor and *water* the plants.",
      win: "Clean floor, happy plants. Every slot got the right tool.",
      maxBlocks: 4,
      blocks: ["job_sweep", "job_water", "tool_broom", "tool_brush", "tool_can"],
      start: ROOM,
      goal: { floor: "clean", plants: "watered" }
    },
    {
      id: 6,
      goalText: "Someone left a *messy note*. Fix it. Swap the *wrong tool*, and drag the *extra block* to the *trash*. Pip should paint the sign and water the plants, and *nothing else*.",
      win: "Fixed! Pip painted the sign and watered the plants, and the lights stayed off.",
      maxBlocks: 4,
      blocks: ["job_paint", "job_water", "hello_lights", "tool_broom", "tool_brush", "tool_can"],
      starter: {
        type: "job_paint",
        fields: {},
        inputs: { DO: { type: "tool_broom", fields: {}, inputs: {}, next: null } },
        next: {
          type: "job_water",
          fields: {},
          inputs: { DO: { type: "tool_can", fields: {}, inputs: {}, next: null } },
          next: { type: "hello_lights", fields: {}, inputs: {}, next: null }
        }
      },
      start: ROOM,
      goal: { sign: "painted", plants: "watered", lights: "off" }
    }
  ];

  // views-new.mjs
  var COLOR_HEX = {
    gray: "#9a9a9a",
    orange: "#f28c28",
    blue: "#3d7be8",
    green: "#4caf50",
    red: "#e04b4b",
    purple: "#9b59b6",
    yellow: "#f4d35e"
  };
  var PLACE_XY = { middle: [100, 82], rug: [100, 112], sky: [100, 34], hill: [163, 78], pond: [45, 118] };
  function hatArt() {
    return `<rect x="-8" y="-22" width="16" height="3" fill="#222"/><rect x="-5" y="-31" width="10" height="10" fill="#222"/>`;
  }
  function subjectArt(item) {
    const c = COLOR_HEX[item.color] || COLOR_HEX.gray;
    const stroke = 'stroke="#333" stroke-width="1"';
    switch (item.subject) {
      case "cat":
        return `
        <path d="M11 8 q10 -2 9 -12" fill="none" stroke="${c}" stroke-width="3"/>
        <ellipse cx="0" cy="8" rx="12" ry="8" fill="${c}" ${stroke}/>
        <polygon points="-9,-10 -7,-20 -1,-12" fill="${c}" ${stroke}/>
        <polygon points="9,-10 7,-20 1,-12" fill="${c}" ${stroke}/>
        <circle cx="0" cy="-6" r="9" fill="${c}" ${stroke}/>
        <circle cx="-3.5" cy="-7" r="1.3" fill="#222"/><circle cx="3.5" cy="-7" r="1.3" fill="#222"/>
        <polygon points="-1.5,-3 1.5,-3 0,-1" fill="#e07a9a"/>`;
      case "dog":
        return `
        <path d="M11 6 q8 -4 6 -12" fill="none" stroke="${c}" stroke-width="3"/>
        <ellipse cx="0" cy="8" rx="12" ry="8" fill="${c}" ${stroke}/>
        <circle cx="0" cy="-6" r="9" fill="${c}" ${stroke}/>
        <ellipse cx="-9" cy="-3" rx="3.2" ry="6.5" fill="#333" opacity="0.55"/>
        <ellipse cx="9" cy="-3" rx="3.2" ry="6.5" fill="#333" opacity="0.55"/>
        <circle cx="-3.5" cy="-8" r="1.3" fill="#222"/><circle cx="3.5" cy="-8" r="1.3" fill="#222"/>
        <ellipse cx="0" cy="-2.5" rx="2.4" ry="1.6" fill="#222"/>
        <path d="M-1 0 q1 4 3 1" fill="#e07a9a"/>`;
      case "fish":
        return `
        <polygon points="11,0 20,-8 20,8" fill="${c}" ${stroke}/>
        <ellipse cx="0" cy="0" rx="13" ry="7.5" fill="${c}" ${stroke}/>
        <circle cx="-6" cy="-2" r="1.5" fill="#222"/>
        <path d="M-2 -7 q4 -1 7 3" fill="none" stroke="#333" stroke-width="0.8" opacity="0.6"/>`;
      case "sun":
        return `
        ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => `<line x1="0" y1="-12" x2="0" y2="-17" stroke="${c}" stroke-width="2.5" transform="rotate(${deg})"/>`).join("")}
        <circle cx="0" cy="0" r="9.5" fill="${c}" ${stroke}/>`;
      case "ball":
        return `
        <circle cx="0" cy="0" r="11" fill="${c}" ${stroke}/>
        <path d="M-10.5 -3 q10.5 6 21 0" fill="none" stroke="#fff" stroke-width="3"/>`;
      case "tree":
        return `
        <rect x="-3" y="0" width="6" height="15" fill="#8d6b4a"/>
        <circle cx="0" cy="-5" r="11" fill="${c}" ${stroke}/>`;
      default:
        return `<circle r="10" fill="${c}"/>`;
    }
  }
  function drawScene(items, label) {
    const shapes = items.map((item) => {
      const [cx, cy] = PLACE_XY[item.place] || PLACE_XY.middle;
      const scale = item.size === "big" ? 1.6 : 1;
      const offsets = item.count === 3 ? [-34, 0, 34] : item.count === 2 ? [-22, 22] : [0];
      return offsets.map((dx) => `
      <g transform="translate(${cx + dx} ${cy}) scale(${scale})">
        ${subjectArt(item)}
        ${item.hat ? hatArt() : ""}
      </g>`).join("");
    }).join("");
    return `
    <svg class="draw-scene" viewBox="0 0 200 150" role="img" aria-label="${esc(label)}">
      <rect width="200" height="150" fill="#d6f0ff"/>
      <rect y="100" width="200" height="50" fill="#b6e3a8"/>
      <ellipse cx="165" cy="106" rx="46" ry="22" fill="#9ad27f"/>
      <ellipse cx="45" cy="128" rx="34" ry="12" fill="#7cc3ee" stroke="#5aa6d6"/>
      <rect x="66" y="118" width="68" height="20" rx="5" fill="#d98c5f" stroke="#a8603a"/>
      <line x1="74" y1="118" x2="74" y2="138" stroke="#a8603a"/>
      <line x1="126" y1="118" x2="126" y2="138" stroke="#a8603a"/>
      ${shapes}
    </svg>`;
  }
  function renderDraw(state, level) {
    const target = level.goal.items.map((goal) => newItem(goal.subject, goal));
    return `
    <div class="draw-panels">
      <figure class="draw-panel">
        <figcaption>Make this</figcaption>
        ${drawScene(target, "The picture to make")}
      </figure>
      <figure class="draw-panel pip-panel">
        <figcaption>Pip drew</figcaption>
        ${drawScene(state.items, "Pip's drawing")}
      </figure>
    </div>
    <svg class="pip-badge" viewBox="0 0 40 62" width="52" height="78" aria-hidden="true">${pip(2, 2)}</svg>`;
  }

  // draw.mjs
  mountGame({
    id: "draw",
    file: "draw.html",
    title: "Draw",
    emoji: "\u{1F58D}\uFE0F",
    about: "Pip draws whatever your note says. Anything the note leaves out, Pip guesses. Make Pip's drawing match the picture.",
    realLife: "When people ask an AI to make a picture or write something, they type a note called a prompt. Details that are not in the prompt get filled in by a guess. A clear prompt gets a closer result.",
    levels: drawLevels,
    solutions: drawSolutions,
    begin: beginDraw,
    check: checkDraw,
    render: renderDraw,
    stepMs: 650,
    run: (program, state, hooks) => runProgram(program, state, drawHandlers, hooks)
  });
})();
