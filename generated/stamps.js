(() => {
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
      route_follow: action("route_follow", "follow the route card", [], "Deliver what the card says."),
      route_obey: action("route_obey", "do what the letter says", [], "Follow every line in the letter, including bossy ones."),
      route_helpful: action("route_helpful", "use the helpful line", [], "Use lines that help the delivery."),
      route_skip_bossy: action("route_skip_bossy", "skip bossy lines", [], "Bossy lines stay on the paper."),
      route_skip_reason: action("route_skip_reason", "skip lines that say %1", [dropdown("REASON", reasons)], "Leave that kind of line on the paper."),
      route_read: action("route_read", "read the letter", [], "Do the lines you have not skipped."),
      route_each_letter: loop("route_each_letter", "for each letter", "Pip opens every letter."),
      route_each_line: loop("route_each_line", "for each line", "Pip reads one line at a time."),
      route_use_line: action("route_use_line", "use this line", [], "Do what this line says."),
      route_skip_line: action("route_skip_line", "skip this line", [], "Leave this line on the paper."),
      route_skip_letter: action("route_skip_letter", "skip this letter", [], "Close the letter without doing it."),
      route_if_match: branch(
        "route_if_match",
        "if the letter is about a house on the card",
        [],
        matchHasElse,
        "The route card decides which letters matter."
      ),
      route_if_tag: branch("route_if_tag", "if the letter is %1", [dropdown("TAG", tags)], false, "Check the label on the envelope."),
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
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!lockBox.hidden) hideLock();
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

  // stamps-rules.mjs
  function change(id, title, before, after, fields) {
    return {
      id,
      title,
      before,
      after,
      asked: !!fields.asked,
      check: fields.check,
      exact: fields.exact !== false,
      note: fields.note || "",
      expected: fields.expected,
      stamp: null
    };
  }
  function testMatches(item, test) {
    if (test === "check_failed") return item.check === "fail";
    if (test === "not_asked") return !item.asked;
    if (test === "asked_and_passed") return item.asked && item.check === "pass";
    if (test === "exact") return item.exact === true;
    if (test === "not_exact") return item.exact === false;
    return false;
  }
  function beginStamps(level) {
    const state = JSON.parse(JSON.stringify(level.start));
    state.cursor = 0;
    state.log = [];
    return state;
  }
  var TEST_LABEL = {
    check_failed: "did the check fail",
    not_asked: "is this something we did not ask for",
    asked_and_passed: "did we ask for it and did the check pass",
    exact: "is it exactly what we asked",
    not_exact: "is it different from what we asked"
  };
  var stampHandlers = {
    async stamp_yes(_node, state) {
      const item = state.changes[state.cursor];
      if (item) {
        item.stamp = "yes";
        state.log.push(`Stamped YES on "${item.title}". Keeping it.`);
      }
    },
    async stamp_no(_node, state) {
      const item = state.changes[state.cursor];
      if (item) {
        item.stamp = "no";
        state.log.push(`Stamped PUT IT BACK on "${item.title}". Undoing it.`);
      }
    },
    async stamp_each(node, state, run) {
      state.log.push(`Looking at all ${state.changes.length} changes, one at a time.`);
      for (let i = 0; i < state.changes.length; i++) {
        state.cursor = i;
        await run(node.inputs.DO);
      }
    },
    async stamp_if(node, state, run) {
      const item = state.changes[state.cursor];
      if (!item) return;
      const hit = testMatches(item, node.fields.TEST);
      state.log.push(`"${item.title}": ${TEST_LABEL[node.fields.TEST]}? ${hit ? "Yes." : "No, so no stamp."}`);
      if (hit) await run(node.inputs.DO);
    },
    async stamp_if_else(node, state, run) {
      const item = state.changes[state.cursor];
      if (!item) return;
      const hit = testMatches(item, node.fields.TEST);
      state.log.push(`"${item.title}": ${TEST_LABEL[node.fields.TEST]}? ${hit ? "Yes." : "No."}`);
      if (hit) await run(node.inputs.DO);
      else await run(node.inputs.ELSE);
    }
  };
  function checkStamps(state, level) {
    for (const item of state.changes) {
      if (!item.stamp) {
        return { ok: false, message: `${item.title} has no stamp yet.` };
      }
      if (item.stamp !== item.expected) {
        const wanted = item.expected === "yes" ? "yes" : "put it back";
        const got = item.stamp === "yes" ? "yes" : "put it back";
        return {
          ok: false,
          message: `${item.title} is stamped "${got}". It should be "${wanted}".`
        };
      }
    }
    return { ok: true, message: level.win };
  }
  var yes = { expected: "yes" };
  var no = { expected: "no" };
  var stampLevels = [
    {
      id: 1,
      goalText: "Pip painted the window. You *did not ask* for that. Stamp the change.",
      win: "The window goes back. You kept only what you asked for.",
      maxBlocks: 1,
      blocks: ["stamp_no"],
      testOptions: [],
      cardFields: ["asked"],
      starter: "no",
      start: {
        changes: [
          change("window", "The window", "clear glass", "painted over", {
            asked: false,
            check: "pass",
            ...no,
            note: "The task was the sign, not the window."
          })
        ]
      }
    },
    {
      id: 2,
      goalText: "Pip changed the sign to PLAY. That is *what you asked for*. Stamp the change.",
      win: "You kept the change you asked for.",
      maxBlocks: 1,
      blocks: ["stamp_yes", "stamp_no"],
      testOptions: [],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            ...yes
          })
        ]
      }
    },
    {
      id: 3,
      goalText: "Pip changed the sign, but the *check failed*. Decide what to do.",
      win: "A failed check means the change comes back out.",
      maxBlocks: 3,
      blocks: ["stamp_if", "stamp_no", "stamp_yes"],
      testOptions: [["the check failed", "check_failed"]],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY?", {
            asked: true,
            check: "fail",
            ...no,
            note: "Pip tried the sign. The check failed."
          })
        ]
      }
    },
    {
      id: 4,
      goalText: "One change is the sign you *asked for*. One is a window you *did not ask for*. Stamp both.",
      win: "You kept the sign and sent the window back.",
      maxBlocks: 5,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [["we did not ask for this", "not_asked"]],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            ...yes
          }),
          change("window", "The window", "clear glass", "painted over", {
            asked: false,
            check: "pass",
            ...no
          })
        ]
      }
    },
    {
      id: 5,
      goalText: "We asked Pip to paint the clubhouse sign *PLAY*. He painted *PLAY?* instead, so the check failed. A sign that does not match the order comes back out, even though we asked him to paint it.",
      win: "PLAY? did not match the order, so that sign goes back. The doorbell label stays.",
      maxBlocks: 6,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [
        ["the check failed", "check_failed"],
        ["we did not ask for this", "not_asked"]
      ],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY?", {
            asked: true,
            check: "fail",
            ...no,
            note: "The order was PLAY. Pip added a question mark, so the letters do not match."
          }),
          change("door", "The door", "red", "striped", {
            asked: false,
            check: "pass",
            ...no
          }),
          change("bell", "The doorbell label", "RING", "PRESS", {
            asked: true,
            check: "pass",
            ...yes
          })
        ]
      }
    },
    {
      id: 6,
      goalText: "Stamp yes only when *two things are both true*: we *asked* for the change, and the *check passed*.",
      win: "Both parts had to be true. The door passed the check, and we still did not ask for it.",
      maxBlocks: 5,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [["the check passed and we asked for this", "asked_and_passed"]],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("door", "The door", "red", "blue", {
            asked: false,
            check: "pass",
            ...no,
            note: "The check passed. The task never mentioned the door."
          }),
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            ...yes
          })
        ]
      }
    },
    {
      id: 7,
      goalText: "Pip painted the clubhouse sign *PLAY*. He also took down the *sample card* that shows the right letters, and he painted a mural. Keep *only the sign*.",
      win: "The sign stays. The sample card goes back up, and the mural goes back.",
      maxBlocks: 5,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [["the check passed and we asked for this", "asked_and_passed"]],
      cardFields: ["asked", "check"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            ...yes
          }),
          change("sample", "The sample card", "PLAY, beside the sign", "card taken down", {
            asked: true,
            check: "fail",
            ...no,
            note: "This card shows the right letters so we can check Pip's painting. He was at the right sign, and he took the card down. With the sample gone, the check failed."
          }),
          change("mural", "The mural", "plain wall", "Pip's painting", {
            asked: false,
            check: "pass",
            ...no
          })
        ]
      }
    },
    {
      id: 8,
      goalText: "*PLAY* is what we asked for. *PLAY!* is not. Look closely.",
      win: "You kept the exact words and sent the almost-right ones back.",
      maxBlocks: 4,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [["it is exactly what we asked", "exact"]],
      cardFields: ["asked", "check", "exact"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            exact: true,
            ...yes
          }),
          change("button", "The button", "Play", "PLAY!", {
            asked: true,
            check: "pass",
            exact: false,
            ...no,
            note: "We asked for PLAY. Pip wrote PLAY!"
          })
        ]
      }
    },
    {
      id: 9,
      goalText: "A *failed check* comes back out even when the words look right. So does anything that is *not exactly* what we asked.",
      win: "The rule kept the one exact change that passed the check.",
      maxBlocks: 6,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [
        ["the check failed", "check_failed"],
        ["it is exactly what we asked", "exact"]
      ],
      cardFields: ["asked", "check", "exact"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            exact: true,
            ...yes
          }),
          change("button", "The button", "Play", "PLAY!", {
            asked: true,
            check: "pass",
            exact: false,
            ...no
          }),
          change("mural", "The mural", "plain wall", "Pip's painting", {
            asked: false,
            check: "pass",
            exact: false,
            ...no
          }),
          change("sample", "The sample card", "PLAY, beside the sign", "PLAY, behind the sign", {
            asked: true,
            check: "fail",
            exact: true,
            ...no,
            note: "The letters still say PLAY. Pip hung the sample card behind the sign, so nobody can check the painting."
          })
        ]
      }
    },
    {
      id: 10,
      goalText: "Five changes, and only a *few blocks*. A perfect sign still goes back if *nobody asked* for it. Keep a change only when we asked, the check passed, and the words are *exact*.",
      win: "The clubhouse and the shop stay. The garden sign, the button, and the sample card go back.",
      maxBlocks: 6,
      blocks: ["stamp_each", "stamp_if_else", "stamp_yes", "stamp_no"],
      testOptions: [
        ["the check passed and we asked for this", "asked_and_passed"],
        ["it is exactly what we asked", "exact"]
      ],
      cardFields: ["asked", "check", "exact"],
      start: {
        changes: [
          change("sign", "The clubhouse sign", "HELLO", "PLAY", {
            asked: true,
            check: "pass",
            exact: true,
            ...yes
          }),
          change("shop", "The shop sign", "CLOSED", "OPEN", {
            asked: true,
            check: "pass",
            exact: true,
            ...yes
          }),
          change("garden", "The garden sign", "blank wood", "GROW", {
            asked: false,
            check: "pass",
            exact: true,
            ...no,
            note: "The letters are right and the paint check passed. Nobody asked for a garden sign."
          }),
          change("button", "The button", "Play", "PLAY!", {
            asked: true,
            check: "pass",
            exact: false,
            ...no,
            note: "We asked for PLAY. Pip wrote PLAY!"
          }),
          change("sample", "The sample card", "PLAY, beside the sign", "PLAY, behind the sign", {
            asked: true,
            check: "fail",
            exact: true,
            ...no,
            note: "The letters say PLAY, but the sample card is behind the sign, so the check failed."
          })
        ]
      }
    }
  ];

  // views.mjs
  function askedLabel(value) {
    return value ? "Yes" : "No";
  }
  function renderStamps(state, level) {
    const fields = level.cardFields || [];
    const cards = state.changes.map((item, index) => {
      const bits = [];
      if (fields.includes("asked")) bits.push(`<span class="fact ${item.asked ? "good" : "bad"}">We asked: ${askedLabel(item.asked)}</span>`);
      if (fields.includes("check")) bits.push(`<span class="fact ${item.check === "pass" ? "good" : "bad"}">Check: ${item.check === "pass" ? "Passed" : "Failed"}</span>`);
      if (fields.includes("exact")) bits.push(`<span class="fact ${item.exact ? "good" : "bad"}">Exact: ${item.exact ? "Yes" : "No"}</span>`);
      const stamp = item.stamp === "yes" ? '<span class="stamp yes">\u2705 YES</span>' : item.stamp === "no" ? '<span class="stamp no">\u21A9\uFE0F PUT IT BACK</span>' : '<span class="stamp empty">no stamp</span>';
      const here = index === state.cursor ? " here" : "";
      return `
      <article class="change-card${here}">
        <div class="card-main">
          <header>${esc(item.title)}</header>
          <p class="diff">${esc(item.before)} \u2192 ${esc(item.after)}</p>
          <p class="facts">${bits.join(" ")}</p>
          ${item.note ? `<p class="note">${esc(item.note)}</p>` : ""}
        </div>
        ${stamp}
      </article>`;
    }).join("");
    return `
    <div class="scene-label">Pip already did this</div>
    <div class="card-list">${cards}</div>
    <svg class="pip-badge" viewBox="0 0 40 62" width="52" height="78" aria-hidden="true">${pip(2, 2)}</svg>`;
  }

  // stamps.mjs
  mountGame({
    id: "stamps",
    file: "stamps.html",
    title: "Stamps",
    emoji: "\u{1F4CB}",
    about: "Pip already changed the clubhouse. Stamp yes on changes you want to keep, and put the rest back, until only the changes you asked for remain.",
    realLife: "An AI helper often changes a project before you look. Some changes are what you asked for, and some only look helpful. Checking before you keep them is part of the job.",
    levels: stampLevels,
    begin: beginStamps,
    check: checkStamps,
    render: renderStamps,
    run: (program, state, hooks) => runProgram(program, state, stampHandlers, hooks)
  });
})();
