(() => {
  // answers.mjs
  function b(type, fields = {}, inputs = {}) {
    return { type, fields, inputs, next: null };
  }
  function chain(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
    return nodes[0];
  }
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
  function catalog(level) {
    const words = level.wordOptions || [["PLAY", "PLAY"]];
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

  // sign-rules.mjs
  function sign(id, label, kind, word, extra = {}) {
    return {
      id,
      label,
      kind,
      word,
      sticker: extra.sticker || null,
      cracked: !!extra.cracked
    };
  }
  function matches(item, test) {
    if (test === "cracked") return !!item.cracked;
    return item.kind === test;
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function beginSign(level) {
    const state = clone(level.start);
    state.cursor = 0;
    state.focus = "sign";
    state.painted = null;
    state.paintSerial = Date.now();
    state.log = [];
    return state;
  }
  var TEST_LABEL = {
    club: "a club sign",
    school: "a school sign",
    shop: "a shop sign",
    cracked: "cracked"
  };
  var ORDER = ["first", "second", "third", "fourth", "fifth", "sixth"];
  function seenAs(signs, item) {
    const group = signs.filter((entry) => entry.kind === item.kind && !!entry.cracked === !!item.cracked);
    const kind = item.cracked ? "cracked club sign" : `${item.kind} sign`;
    if (group.length < 2) return kind;
    const place = group.indexOf(item);
    return `${ORDER[place] || `${place + 1}th`} ${kind}`;
  }
  function paint(state, item, word) {
    state.focus = "sign";
    state.painted = { id: item.id, from: item.word, serial: ++state.paintSerial };
    state.log.push(`Painting the ${seenAs(state.signs, item)}: ${item.word} \u2192 ${word}.`);
    item.word = word;
  }
  var signHandlers = {
    async sign_words(node, state) {
      const item = state.signs[state.cursor];
      if (item) paint(state, item, node.fields.WORD);
    },
    async sign_repaint(node, state) {
      const item = state.signs[state.cursor];
      if (item) {
        paint(state, item, node.fields.WORD);
        if (item.sticker) state.log.push(`I painted over the whole ${seenAs(state.signs, item)}. The star sticker is gone.`);
        item.sticker = null;
      }
    },
    async sign_door(node, state) {
      state.focus = "door";
      state.painted = { id: "door", from: state.door, serial: ++state.paintSerial };
      state.log.push(`Walking to the door. Painting it ${node.fields.COLOR}.`);
      state.door = node.fields.COLOR;
    },
    async sign_each(node, state, run) {
      state.log.push(`Visiting all ${state.signs.length} signs.`);
      for (let i = 0; i < state.signs.length; i++) {
        state.cursor = i;
        state.focus = "sign";
        await run(node.inputs.DO);
      }
    },
    async sign_each_club(node, state, run) {
      state.log.push("Visiting the club signs only.");
      for (let i = 0; i < state.signs.length; i++) {
        if (state.signs[i].kind !== "club") continue;
        state.cursor = i;
        state.focus = "sign";
        await run(node.inputs.DO);
      }
    },
    async sign_if(node, state, run) {
      const item = state.signs[state.cursor];
      if (!item) return;
      const hit = matches(item, node.fields.TEST);
      state.log.push(`Is the ${seenAs(state.signs, item)} ${TEST_LABEL[node.fields.TEST]}? ${hit ? "Yes." : "No, skipping it."}`);
      if (hit) await run(node.inputs.DO);
    },
    async sign_if_else(node, state, run) {
      const item = state.signs[state.cursor];
      if (!item) return;
      const hit = matches(item, node.fields.TEST);
      state.log.push(`Is the ${seenAs(state.signs, item)} ${TEST_LABEL[node.fields.TEST]}? ${hit ? "Yes." : "No, doing the else part."}`);
      if (hit) await run(node.inputs.DO);
      else await run(node.inputs.ELSE);
    }
  };
  function checkSign(state, level) {
    for (const goal of level.goal.signs) {
      const item = state.signs.find((entry) => entry.id === goal.id);
      if (!item) return { ok: false, message: "A sign is missing." };
      if (item.word !== goal.word) {
        return {
          ok: false,
          message: `The ${seenAs(state.signs, item)} says ${item.word}. It should say ${goal.word}.`
        };
      }
      if (goal.sticker && item.sticker !== goal.sticker) {
        return {
          ok: false,
          message: `The star on the ${seenAs(state.signs, item)} is gone. "Change the sign" paints over everything. "Change the words" leaves the sticker alone.`
        };
      }
    }
    if (level.goal.door && state.door !== level.goal.door) {
      return {
        ok: false,
        message: `The door is ${state.door || "unpainted"}. It should be ${level.goal.door}.`
      };
    }
    return { ok: true, message: level.win };
  }
  var club = (id, label, word, extra) => sign(id, label, "club", word, extra);
  var school = (id, label, word) => sign(id, label, "school", word);
  var shop = (id, label, word) => sign(id, label, "shop", word);
  var signLevels = [
    {
      id: 1,
      goalText: "Press Run. Pip should paint the clubhouse sign so it says *PLAY*.",
      win: "The sign says PLAY.",
      maxBlocks: 1,
      blocks: ["sign_words"],
      wordOptions: [["PLAY", "PLAY"]],
      testOptions: [],
      starter: true,
      start: { signs: [club("club", "clubhouse sign", "HELLO")], door: null },
      goal: { signs: [club("club", "clubhouse sign", "PLAY")], door: null }
    },
    {
      id: 2,
      goalText: "The sign should say *PLAY*, and the door should be *blue*.",
      win: "The sign and the door are both right.",
      maxBlocks: 2,
      blocks: ["sign_words", "sign_door"],
      wordOptions: [["PLAY", "PLAY"]],
      doorOptions: [["blue", "blue"], ["red", "red"], ["yellow", "yellow"]],
      testOptions: [],
      start: { signs: [club("club", "clubhouse sign", "HELLO")], door: "red" },
      goal: { signs: [club("club", "clubhouse sign", "PLAY")], door: "blue" }
    },
    {
      id: 3,
      goalText: "Make *every* club sign say *PLAY*. You only get *two blocks*, so one block has to visit every sign.",
      win: "Every club sign says PLAY.",
      maxBlocks: 2,
      blocks: ["sign_each", "sign_words"],
      wordOptions: [["PLAY", "PLAY"]],
      testOptions: [],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO"),
          club("fort", "fort sign", "HELLO"),
          club("gate", "gate sign", "HELLO")
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "PLAY"),
          club("fort", "fort sign", "PLAY"),
          club("gate", "gate sign", "PLAY")
        ],
        door: null
      }
    },
    {
      id: 4,
      goalText: "Make the *club* signs say *PLAY*. The *school* sign has to stay *SCHOOL*.",
      win: "The club signs say PLAY, and the school sign still says SCHOOL.",
      maxBlocks: 2,
      blocks: ["sign_each_club", "sign_each", "sign_words"],
      wordOptions: [["PLAY", "PLAY"]],
      testOptions: [],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO"),
          club("fort", "fort sign", "HELLO"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "PLAY"),
          club("fort", "fort sign", "PLAY"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      }
    },
    {
      id: 5,
      goalText: "*Club* signs say *PLAY*, the door is *blue*, and the *school* sign stays *SCHOOL*.",
      win: "The clubs, the door, and the school are all correct.",
      maxBlocks: 3,
      blocks: ["sign_each_club", "sign_each", "sign_words", "sign_door"],
      wordOptions: [["PLAY", "PLAY"]],
      doorOptions: [["blue", "blue"], ["red", "red"], ["yellow", "yellow"]],
      testOptions: [],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO"),
          club("fort", "fort sign", "HELLO"),
          school("school", "school sign", "SCHOOL")
        ],
        door: "red"
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "PLAY"),
          club("fort", "fort sign", "PLAY"),
          school("school", "school sign", "SCHOOL")
        ],
        door: "blue"
      }
    },
    {
      id: 6,
      goalText: "Visit every sign. Change a sign *only* when it is a *club* sign.",
      win: "Pip checked each sign and painted only the club ones.",
      maxBlocks: 4,
      blocks: ["sign_each", "sign_if", "sign_words"],
      wordOptions: [["PLAY", "PLAY"]],
      testOptions: [["a club sign", "club"]],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO"),
          school("school", "school sign", "SCHOOL"),
          club("gate", "gate sign", "HELLO")
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "PLAY"),
          school("school", "school sign", "SCHOOL"),
          club("gate", "gate sign", "PLAY")
        ],
        door: null
      }
    },
    {
      id: 7,
      goalText: "Make the *shop* signs say *OPEN*. Leave the clubhouse and the school as they are.",
      win: "The shops say OPEN. Everything else is untouched.",
      maxBlocks: 4,
      blocks: ["sign_each", "sign_if", "sign_words"],
      wordOptions: [["PLAY", "PLAY"], ["OPEN", "OPEN"], ["SCHOOL", "SCHOOL"]],
      testOptions: [["a club sign", "club"], ["a school sign", "school"], ["a shop sign", "shop"]],
      start: {
        signs: [
          shop("bakery", "bakery sign", "CLOSED"),
          shop("market", "market sign", "CLOSED"),
          club("club", "clubhouse sign", "HELLO"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      },
      goal: {
        signs: [
          shop("bakery", "bakery sign", "OPEN"),
          shop("market", "market sign", "OPEN"),
          club("club", "clubhouse sign", "HELLO"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      }
    },
    {
      id: 8,
      goalText: "The club signs should say *PLAY*. Keep the *star stickers*.",
      win: "The signs say PLAY, and the stars are still there.",
      maxBlocks: 3,
      blocks: ["sign_each", "sign_words", "sign_repaint"],
      wordOptions: [["PLAY", "PLAY"]],
      testOptions: [],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO", { sticker: "star" }),
          club("fort", "fort sign", "HELLO", { sticker: "star" })
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "PLAY", { sticker: "star" }),
          club("fort", "fort sign", "PLAY", { sticker: "star" })
        ],
        door: null
      }
    },
    {
      id: 9,
      goalText: "*Cracked* signs should say *FIX ME*. Other club signs should say *PLAY*. Leave the school alone.",
      win: "The cracked sign asks for a fix, the other club sign says PLAY, and the school is unchanged.",
      maxBlocks: 6,
      blocks: ["sign_each", "sign_if_else", "sign_if", "sign_words"],
      wordOptions: [["FIX ME", "FIX ME"], ["PLAY", "PLAY"], ["SCHOOL", "SCHOOL"]],
      testOptions: [["cracked", "cracked"], ["a club sign", "club"], ["a school sign", "school"]],
      elseTests: [["cracked", "cracked"]],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO", { cracked: true }),
          club("fort", "fort sign", "HELLO"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "FIX ME", { cracked: true }),
          club("fort", "fort sign", "PLAY"),
          school("school", "school sign", "SCHOOL")
        ],
        door: null
      }
    },
    {
      id: 10,
      goalText: "One short note for the whole street. *Cracked* signs say *FIX ME*, other *club* signs say *PLAY*, *shops* say *OPEN*, and *schools* stay *SCHOOL*.",
      win: "One note took care of the whole street.",
      maxBlocks: 8,
      blocks: ["sign_each", "sign_if_else", "sign_if", "sign_words"],
      wordOptions: [["FIX ME", "FIX ME"], ["PLAY", "PLAY"], ["OPEN", "OPEN"], ["SCHOOL", "SCHOOL"]],
      testOptions: [
        ["cracked", "cracked"],
        ["a club sign", "club"],
        ["a school sign", "school"],
        ["a shop sign", "shop"]
      ],
      elseTests: [["cracked", "cracked"], ["a club sign", "club"], ["a shop sign", "shop"]],
      start: {
        signs: [
          club("club", "clubhouse sign", "HELLO", { cracked: true }),
          club("fort", "fort sign", "HELLO"),
          school("school", "school sign", "SCHOOL"),
          school("library", "library sign", "SCHOOL"),
          shop("bakery", "bakery sign", "CLOSED"),
          shop("market", "market sign", "CLOSED")
        ],
        door: null
      },
      goal: {
        signs: [
          club("club", "clubhouse sign", "FIX ME", { cracked: true }),
          club("fort", "fort sign", "PLAY"),
          school("school", "school sign", "SCHOOL"),
          school("library", "library sign", "SCHOOL"),
          shop("bakery", "bakery sign", "OPEN"),
          shop("market", "market sign", "OPEN")
        ],
        door: null
      }
    }
  ];

  // views.mjs
  var KIND_COLOR = { club: "#ffe08a", school: "#d9e8ff", shop: "#ffd7c2" };
  var SIGN_W = 150;
  var SIGN_H = 86;
  var SIGN_GAP = 176;
  var SIGN_Y = 60;
  function signBoard(item, x, y, painted) {
    const fill = KIND_COLOR[item.kind] || "#fff";
    const crack = item.cracked ? `<path d="M${x + 24} ${y + 10} l12 16 l-9 6 l15 20" fill="none" stroke="#c0392b" stroke-width="3"/>` : "";
    const star = item.sticker === "star" ? `<text x="${x + SIGN_W - 24}" y="${y + 24}" font-size="22">\u2605</text>` : "";
    const ribbon = item.cracked ? `${item.kind} \xB7 cracked` : item.kind;
    const mid = x + SIGN_W / 2;
    const wordY = y + 42;
    const isPainting = painted && painted.id === item.id;
    const clipId = `paint-${item.id}-${painted ? painted.serial : 0}`;
    const word = isPainting ? `
      <text class="old-word" x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700" fill="#555">${esc(painted.from)}</text>
      <clipPath id="${clipId}"><rect class="paint-clip" x="${x + 6}" y="${y + 6}" width="${SIGN_W - 12}" height="${SIGN_H - 12}"/></clipPath>
      <g clip-path="url(#${clipId})">
        <rect x="${x + 6}" y="${y + 6}" width="${SIGN_W - 12}" height="${SIGN_H - 30}" fill="${fill}"/>
        <text x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700">${esc(item.word)}</text>
      </g>
      <rect class="brush" x="${x + 6}" y="${y + 4}" width="12" height="${SIGN_H - 26}" rx="3" fill="#333"/>` : `<text x="${mid}" y="${wordY}" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700">${esc(item.word)}</text>`;
    return `
    <g class="${isPainting ? "sign painting" : "sign"}">
      <rect x="${mid - 5}" y="${y + SIGN_H - 4}" width="10" height="70" fill="#8d6b4a"/>
      <rect class="board" x="${x}" y="${y}" width="${SIGN_W}" height="${SIGN_H}" rx="6" fill="${fill}" stroke="#6b5424" stroke-width="3"/>
      ${crack}
      ${star}
      ${word}
      <text x="${mid}" y="${y + SIGN_H - 14}" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#555">${esc(ribbon)}</text>
    </g>`;
  }
  var lastPaintSerial = 0;
  var lastPipX = null;
  function renderSign(state, level) {
    const signs = state.signs;
    if (state.painted && state.painted.serial !== lastPaintSerial) {
      lastPaintSerial = state.painted.serial;
    } else {
      state = { ...state, painted: null };
    }
    const hasDoor = !!(state.door || level.goal.door);
    const origin = hasDoor ? 230 : 90;
    const width = origin + signs.length * SIGN_GAP + 10;
    const height = 270;
    const paintingDoor = state.painted && state.painted.id === "door";
    const doorClip = `door-paint-${state.painted ? state.painted.serial : 0}`;
    const doorPanel = paintingDoor ? `
      <rect x="40" y="76" width="30" height="68" fill="${esc(state.painted.from || "#bbb")}" stroke="#333"/>
      <clipPath id="${doorClip}"><rect class="paint-clip" x="40" y="76" width="30" height="68"/></clipPath>
      <g clip-path="url(#${doorClip})">
        <rect x="40" y="76" width="30" height="68" fill="${esc(state.door)}" stroke="#333"/>
      </g>
      <rect class="brush brush-door" x="38" y="72" width="8" height="76" rx="3" fill="#333"/>` : `<rect x="40" y="76" width="30" height="68" fill="${esc(state.door || "#bbb")}" stroke="#333"/>`;
    const door = hasDoor ? `
    <g class="${paintingDoor ? "door painting" : "door"}" transform="translate(94 70)">
      <polygon points="0,44 55,8 110,44" fill="#e07a5f"/>
      <rect x="10" y="44" width="90" height="100" fill="#f6d48a" stroke="#8d6b4a"/>
      ${doorPanel}
      <circle cx="64" cy="112" r="2.5" fill="#f4d35e"/>
    </g>` : "";
    const boards = signs.map((item, index) => signBoard(item, origin + index * SIGN_GAP, SIGN_Y, state.painted)).join("");
    const pipX = state.focus === "door" ? 40 : origin + (state.cursor || 0) * SIGN_GAP - 54;
    const walkFrom = lastPipX === null ? pipX : lastPipX;
    lastPipX = pipX;
    const pipMarkup = walkFrom === pipX ? pip(pipX, 158) : `<g class="pip-walk" style="--walk-from: ${walkFrom - pipX}px">${pip(pipX, 158)}</g>`;
    return `
    <div class="scene-box">
      <svg class="scene" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pip and the signs">
        <rect width="${width}" height="${height}" fill="#c5ecff"/>
        <rect y="212" width="${width}" height="58" fill="#b6e3a8"/>
        ${door}
        ${boards}
        ${pipMarkup}
      </svg>
    </div>`;
  }

  // sign.mjs
  mountGame({
    id: "sign",
    file: "sign.html",
    title: "Sign",
    emoji: "\u{1F3A8}",
    about: "Pip paints whatever your note says. Make the street match the challenge, with everything else left alone.",
    realLife: "When people use an AI helper to write code, the helper does what their note says. A vague note can change things they never asked for, and a short exact note keeps the helper on the job.",
    levels: signLevels,
    solutions: signSolutions,
    begin: beginSign,
    check: checkSign,
    render: renderSign,
    stepMs: 260,
    stepMsFor: (node) => ["sign_words", "sign_repaint", "sign_door"].includes(node.type) ? 1700 : 260,
    run: (program, state, hooks) => runProgram(program, state, signHandlers, hooks)
  });
})();
