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

  // hello-rules.mjs
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  var TOOL_LABEL = { broom: "broom", can: "watering can", brush: "paintbrush" };
  function beginHello(level) {
    const state = clone(level.start);
    state.waving = false;
    state.sweptWithout = false;
    state.log = [];
    return state;
  }
  function holdingText(state) {
    return state.holding ? `a ${TOOL_LABEL[state.holding]}` : "nothing";
  }
  var helloHandlers = {
    async hello_wave(_node, state) {
      state.waving = true;
      state.log.push("Waving hello!");
    },
    async hello_lights(_node, state) {
      state.lights = "on";
      state.log.push("Lights on.");
    },
    async hello_grab(node, state) {
      state.holding = node.fields.TOOL;
      state.log.push(`Picking up the ${TOOL_LABEL[state.holding]}.`);
    },
    async hello_sweep(_node, state) {
      if (state.holding !== "broom") {
        state.sweptWithout = true;
        state.log.push(`I cannot sweep. I am holding ${holdingText(state)}.`);
        return;
      }
      state.floor = "clean";
      state.log.push("Sweeping the floor.");
    },
    async hello_water(node, state) {
      if (state.holding !== "can") {
        state.log.push(`I cannot water anything. I am holding ${holdingText(state)}.`);
        return;
      }
      const target = node.fields.TARGET;
      if (target === "plants") {
        state.plants = "watered";
        state.log.push("Watering the plants.");
      } else if (target === "floor") {
        state.floor = "wet";
        state.log.push("Watering the floor. Splash. The plants are still dry.");
      } else {
        state.log.push("Watering the sign. It is dripping, and the plants are still dry.");
      }
    },
    async tool_broom(_node, state) {
      state.holding = "broom";
      state.log.push("Holding the broom.");
    },
    async tool_brush(_node, state) {
      state.holding = "brush";
      state.log.push("Holding the paintbrush.");
    },
    async tool_can(_node, state) {
      state.holding = "can";
      state.log.push("Holding the watering can.");
    },
    async job_paint(node, state, run) {
      state.holding = null;
      state.log.push("Job card: paint the sign.");
      await run(node.inputs.DO);
      if (state.holding === "brush") {
        state.sign = "painted";
        state.log.push("Painting the sign. Done!");
      } else {
        state.log.push(`I cannot paint with ${holdingText(state)}.`);
      }
    },
    async job_sweep(node, state, run) {
      state.holding = null;
      state.log.push("Job card: sweep the floor.");
      await run(node.inputs.DO);
      if (state.holding === "broom") {
        state.floor = "clean";
        state.log.push("Sweeping the floor. Done!");
      } else {
        state.sweptWithout = true;
        state.log.push(`I cannot sweep with ${holdingText(state)}.`);
      }
    },
    async job_water(node, state, run) {
      state.holding = null;
      state.log.push("Job card: water the plants.");
      await run(node.inputs.DO);
      if (state.holding === "can") {
        state.plants = "watered";
        state.log.push("Watering the plants. Done!");
      } else {
        state.log.push(`I cannot water the plants with ${holdingText(state)}.`);
      }
    }
  };
  function checkHello(state, level) {
    const goal = level.goal;
    if (goal.waving && !state.waving) {
      return { ok: false, message: 'Pip did not wave. Make sure the block is snapped under "Pip, please".' };
    }
    if (goal.floor === "clean" && state.floor !== "clean") {
      return {
        ok: false,
        message: state.sweptWithout ? "The floor is still dirty. Pip tried to sweep before he had the broom." : "The floor is still dirty."
      };
    }
    if (goal.plants === "watered" && state.plants !== "watered") {
      return { ok: false, message: "The plants are still dry." };
    }
    if (goal.sign === "painted" && state.sign !== "painted") {
      return { ok: false, message: "The sign is still blank." };
    }
    if (goal.lights === "off" && state.lights === "on") {
      return { ok: false, message: "The lights came on. Nobody asked for that. Drag that block to the trash." };
    }
    return { ok: true, message: level.win };
  }
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
  var TOOL_EMOJI = { broom: "\u{1F9F9}", can: "\u{1F6BF}", brush: "\u{1F58C}\uFE0F" };
  function renderHello(state) {
    const lit = state.lights === "on";
    const wall = lit ? "#fff6d5" : "#aeb3c7";
    const windowFill = lit ? "#ffe9a8" : "#5d6d9a";
    const dirt = state.floor === "dirty" ? [[60, 172], [96, 184], [140, 176], [190, 186], [236, 174], [272, 183], [120, 190], [210, 178]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#8a6b4a"/>`).join("") : "";
    const puddle = state.floor === "wet" ? '<ellipse cx="160" cy="184" rx="46" ry="8" fill="#7cc3ee" opacity="0.8"/>' : "";
    const plant = state.plants === "watered" ? `<path d="M262 128 q-14 -22 0 -40 q14 18 0 40" fill="#4caf50"/>
       <path d="M262 132 q-24 -8 -26 -30 q22 4 26 30" fill="#5cc45f"/>
       <path d="M262 132 q24 -8 26 -30 q-22 4 -26 30" fill="#5cc45f"/>` : `<path d="M262 134 q-10 -8 -4 -22 q8 10 4 22" fill="#b4a06a"/>
       <path d="M262 136 q-18 2 -22 -12 q16 -2 22 12" fill="#c2b07a"/>
       <path d="M262 136 q18 2 22 -12 q-16 -2 -22 12" fill="#c2b07a"/>`;
    const sign = state.sign === "painted" ? '<text x="70" y="78" text-anchor="middle" font-size="22" font-weight="700" font-family="sans-serif" fill="#2d5cb8">HI!</text>' : '<text x="70" y="78" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#999">blank</text>';
    const tool2 = state.holding ? `<text x="186" y="128" font-size="22" aria-label="${esc(TOOL_LABEL[state.holding])}">${TOOL_EMOJI[state.holding]}</text>` : "";
    const wave = state.waving ? `<g class="wave"><text x="178" y="104" font-size="22">\u{1F44B}</text></g>` : "";
    return `
    <div class="scene-box">
      <svg class="scene" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pip in the clubhouse">
        <rect width="320" height="200" fill="${wall}"/>
        <rect y="160" width="320" height="40" fill="${lit ? "#d9b382" : "#8f7a5c"}"/>
        <rect x="200" y="30" width="70" height="56" fill="${windowFill}" stroke="#5a4634" stroke-width="3"/>
        <line x1="235" y1="30" x2="235" y2="86" stroke="#5a4634" stroke-width="3"/>
        <line x1="200" y1="58" x2="270" y2="58" stroke="#5a4634" stroke-width="3"/>
        <rect x="30" y="52" width="80" height="44" rx="5" fill="#ffe08a" stroke="#6b5424" stroke-width="3"/>
        ${sign}
        <rect x="248" y="134" width="28" height="26" rx="3" fill="#c9661f"/>
        ${plant}
        ${dirt}
        ${puddle}
        ${pip(142, 102)}
        ${tool2}
        ${wave}
      </svg>
    </div>`;
  }

  // hello.mjs
  mountGame({
    id: "hello",
    file: "hello.html",
    title: "Hello Pip",
    emoji: "\u{1F44B}",
    about: 'Meet Pip, your helper. Pip only does what the blocks say, and only when they are snapped together under "Pip, please". Learn to connect blocks, put them in order, use the little arrows, and fill a slot.',
    realLife: "When people work with an AI helper, they write instructions and the helper follows them exactly. Clear, connected, in-order instructions are the whole trick.",
    levels: helloLevels,
    solutions: helloSolutions,
    begin: beginHello,
    check: checkHello,
    render: renderHello,
    stepMs: 700,
    run: (program, state, hooks) => runProgram(program, state, helloHandlers, hooks)
  });
})();
