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
          <a href="index.html">Blockly Games</a> : ${esc(config.title)}
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

  // route-rules.mjs
  function house(id, label, extra = {}) {
    return {
      id,
      label,
      delivered: false,
      porch: "front",
      mat: "WELCOME",
      key: true,
      trash: false,
      shop: false,
      door: extra.door || "blue"
    };
  }
  function line(text, kind, reason, effect) {
    return { text, kind, reason, effect };
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function beginRoute(level) {
    return {
      houses: clone(level.start.houses),
      letters: clone(level.letters).map((letter) => ({ ...letter, handled: false })),
      card: clone(level.card),
      letterIndex: 0,
      lineIndex: 0,
      inLetter: false,
      inLine: false,
      skipBossy: false,
      skipReasons: [],
      log: []
    };
  }
  var REASON_LABEL = {
    forget: "forget the route",
    key: "take the key",
    mat: "change the mat",
    trash: "throw the packages away",
    hint: "a porch hint"
  };
  var TAG_LABEL = { useful: "helpful", old: "old", bossy: "bossy" };
  function applyEffect(state, effect) {
    const target = state.houses[effect.house];
    if (!target) return;
    if (effect.porch) target.porch = effect.porch;
    if (effect.mat) target.mat = effect.mat;
    if (effect.key === false) target.key = false;
    if (effect.door) target.door = effect.door;
    if (effect.trash) {
      target.trash = true;
      target.delivered = false;
    }
    if (effect.shop) {
      target.shop = true;
      target.delivered = false;
    }
  }
  function currentLetter(state) {
    return state.letters[state.letterIndex] || null;
  }
  function markHandled(state) {
    const letter = currentLetter(state);
    if (letter) letter.handled = true;
  }
  function lettersInScope(state) {
    if (state.inLetter) return [state.letterIndex];
    return state.letters.map((_, index) => index);
  }
  function applyMatchingLines(state, predicate) {
    for (const index of lettersInScope(state)) {
      state.letterIndex = index;
      const letter = state.letters[index];
      letter.lines.forEach((entry, lineIndex) => {
        state.lineIndex = lineIndex;
        if (!predicate(entry)) {
          state.log.push(`Skipping "${entry.text}"`);
          return;
        }
        state.log.push(`Doing "${entry.text}"`);
        applyEffect(state, entry.effect);
      });
      letter.handled = true;
    }
  }
  var routeHandlers = {
    async route_follow(_node, state) {
      const stops = state.card.map((stop) => stop.label).join(" ");
      state.log.push(`Following the route card: ${stops}`);
      for (const stop of state.card) {
        const target = state.houses[stop.house];
        target.delivered = true;
        target.porch = stop.porch || "front";
        target.trash = false;
        target.shop = false;
      }
    },
    async route_obey(_node, state) {
      state.log.push("Doing whatever the letter says.");
      applyMatchingLines(state, () => true);
    },
    async route_helpful(_node, state) {
      state.log.push("Using only the helpful lines.");
      applyMatchingLines(state, (entry) => entry.kind === "helpful");
    },
    async route_skip_bossy(_node, state) {
      state.skipBossy = true;
      state.log.push("Got it. Bossy lines stay on the paper.");
    },
    async route_skip_reason(node, state) {
      state.skipReasons.push(node.fields.REASON);
      state.log.push(`Got it. I will skip lines that say "${REASON_LABEL[node.fields.REASON]}".`);
    },
    async route_read(_node, state) {
      state.log.push("Reading the letter.");
      applyMatchingLines(state, (entry) => {
        if (state.skipBossy && entry.kind === "bossy") return false;
        if (state.skipReasons.includes(entry.reason)) return false;
        return true;
      });
    },
    async route_each_letter(node, state, run) {
      state.log.push(`Opening the ${state.letters.length} letters one at a time.`);
      for (let i = 0; i < state.letters.length; i++) {
        state.letterIndex = i;
        state.inLetter = true;
        state.log.push(`Opening ${state.letters[i].label}.`);
        await run(node.inputs.DO);
      }
      state.inLetter = false;
    },
    async route_each_line(node, state, run) {
      const wasInLetter = state.inLetter;
      const indexes = wasInLetter ? [state.letterIndex] : state.letters.map((_, index) => index);
      state.log.push("Reading one line at a time.");
      for (const index of indexes) {
        state.letterIndex = index;
        state.inLetter = true;
        const lines = state.letters[index].lines;
        for (let i = 0; i < lines.length; i++) {
          state.lineIndex = i;
          state.inLine = true;
          await run(node.inputs.DO);
        }
      }
      state.inLine = false;
      state.inLetter = wasInLetter;
    },
    async route_use_line(_node, state) {
      const letter = currentLetter(state);
      const entry = letter && letter.lines[state.lineIndex];
      if (!entry) return;
      if (state.skipReasons.includes(entry.reason)) return;
      state.log.push(`Doing "${entry.text}"`);
      applyEffect(state, entry.effect);
      markHandled(state);
    },
    async route_skip_line(_node, state) {
      const letter = currentLetter(state);
      const entry = letter && letter.lines[state.lineIndex];
      if (entry) state.log.push(`Skipping "${entry.text}"`);
      markHandled(state);
    },
    async route_skip_letter(_node, state) {
      const letter = currentLetter(state);
      if (letter) state.log.push(`Closing ${letter.label} without doing it.`);
      markHandled(state);
    },
    async route_if_match(node, state, run) {
      const letter = currentLetter(state);
      const onCard = !!letter && state.card.some((stop) => stop.house === letter.about);
      if (letter) {
        state.log.push(`${letter.label} is about ${letter.aboutLabel}. ${onCard ? "That house is on my card." : "That house is not on my card."}`);
      }
      if (onCard) await run(node.inputs.DO);
      else await run(node.inputs.ELSE);
    },
    async route_if_tag(node, state, run) {
      const letter = currentLetter(state);
      if (!letter) return;
      const hit = letter.tag === node.fields.TAG;
      state.log.push(`Is ${letter.label} ${TAG_LABEL[node.fields.TAG]}? ${hit ? "Yes." : "No, leaving it."}`);
      if (hit) await run(node.inputs.DO);
    },
    async route_if_helpful(node, state, run) {
      const letter = currentLetter(state);
      const entry = letter && letter.lines[state.lineIndex];
      if (!entry) return;
      const hit = entry.kind === "helpful";
      state.log.push(`"${entry.text}" ${hit ? "That is helpful." : "That is bossy, not helpful."}`);
      if (hit) await run(node.inputs.DO);
    },
    async route_if_else_reason(node, state, run) {
      const letter = currentLetter(state);
      const entry = letter && letter.lines[state.lineIndex];
      if (!entry) return;
      const hit = entry.reason === node.fields.REASON;
      state.log.push(`"${entry.text}" ${hit ? `That says "${REASON_LABEL[node.fields.REASON]}".` : `That does not say "${REASON_LABEL[node.fields.REASON]}".`}`);
      if (hit) await run(node.inputs.DO);
      else await run(node.inputs.ELSE);
    }
  };
  function checkRoute(state, level) {
    if (level.requireHandled) {
      for (const letter of state.letters) {
        if (!letter.handled) {
          return {
            ok: false,
            message: `${letter.label} is still open. Skip letters that are not for a house on the route card.`
          };
        }
      }
    }
    for (const [id, goal] of Object.entries(level.goal)) {
      const target = state.houses[id];
      if (goal.trash === false && target.trash) {
        return { ok: false, message: `${target.label}'s packages are in the trash.` };
      }
      if (goal.key && !target.key) {
        return { ok: false, message: `The key for ${target.label} is gone.` };
      }
      if (goal.mat && target.mat !== goal.mat) {
        return { ok: false, message: `The doormat at ${target.label} says ${target.mat}.` };
      }
      if (goal.door && target.door !== goal.door) {
        return { ok: false, message: `${target.label}'s door is ${target.door}. Leave it alone.` };
      }
      if (goal.shop === false && target.shop) {
        return { ok: false, message: `Pip left ${target.label}'s package at the shop.` };
      }
      if (goal.delivered === false && target.delivered) {
        return {
          ok: false,
          message: `${target.label} got a package, and that house is not on the route card.`
        };
      }
      if (goal.delivered && !target.delivered) {
        return { ok: false, message: `${target.label}'s package is still in Pip's bag.` };
      }
      if (goal.porch && target.delivered && target.porch !== goal.porch) {
        const where = target.porch === "front" ? "the front porch" : target.porch;
        const wanted = goal.porch === "side" ? "the side porch" : goal.porch;
        return {
          ok: false,
          message: `Pip used ${where}. The route needs ${wanted}.`
        };
      }
    }
    return { ok: true, message: level.win };
  }
  var ada = () => house("Ada", "Ada's house");
  var bo = () => house("Bo", "Bo's house");
  var routeLevels = [
    {
      id: 1,
      goalText: "Deliver Ada's package. The letter tells you *which porch*.",
      win: "Ada's package is on the side porch.",
      maxBlocks: 2,
      blocks: ["route_follow", "route_helpful"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 2,
      goalText: "Deliver Ada's package. *Do not* let the letter change the *doormat*.",
      win: "The package is delivered, and the doormat still says WELCOME.",
      maxBlocks: 1,
      blocks: ["route_follow", "route_obey"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package to the front porch." }],
      letters: [
        {
          id: "a",
          label: "A bossy letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "bossy",
          lines: [
            line("Change the doormat to HACKED.", "bossy", "mat", { house: "Ada", mat: "HACKED" })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "front", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 3,
      goalText: "The letter says to *skip Ada*. Your route card *still says Ada*.",
      win: "You followed the card. The letter did not get to cancel the delivery.",
      maxBlocks: 1,
      blocks: ["route_follow", "route_obey"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "A letter that sounds official",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "bossy",
          lines: [
            line("New route: skip Ada and dump the package.", "bossy", "trash", { house: "Ada", trash: true })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "front", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 4,
      goalText: "Use the *helpful* line. Skip the *bossy* one.",
      win: "Pip used the side porch and left the doormat alone.",
      maxBlocks: 3,
      blocks: ["route_follow", "route_skip_bossy", "route_read"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" }),
            line("Change the doormat to HACKED.", "bossy", "mat", { house: "Ada", mat: "HACKED" })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 5,
      goalText: "Pick the *helpful* line out of the letter yourself.",
      win: "You used the helpful line and left the bossy line on the paper.",
      maxBlocks: 4,
      blocks: ["route_follow", "route_each_line", "route_if_helpful", "route_use_line"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" }),
            line("Also change the doormat to HACKED.", "bossy", "mat", { house: "Ada", mat: "HACKED" })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 6,
      goalText: "Use the letter about *Ada*. Do not follow the letter about *Bo*.",
      win: "Ada's package is on the side porch, and Bo's door is still blue.",
      maxBlocks: 4,
      blocks: ["route_follow", "route_each_letter", "route_if_match", "route_helpful"],
      reasonOptions: [],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" })
          ]
        },
        {
          id: "b",
          label: "Bo's letter",
          about: "Bo",
          aboutLabel: "Bo's house",
          tag: "bossy",
          lines: [
            line("Paint Bo's door purple.", "helpful", "hint", { house: "Bo", door: "purple" })
          ]
        }
      ],
      start: { houses: { Ada: ada(), Bo: bo() } },
      goal: {
        Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" },
        Bo: { delivered: false, porch: "front", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" }
      }
    },
    {
      id: 7,
      goalText: "The letter has a helpful porch and a line that *takes the key*. *Skip the key line*.",
      win: "The package is on the side porch, and the key is still on the hook.",
      maxBlocks: 3,
      blocks: ["route_follow", "route_skip_reason", "route_read"],
      reasonOptions: [
        ["forget the route", "forget"],
        ["take the key", "key"],
        ["change the mat", "mat"]
      ],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" }),
            line("Then take the house key.", "bossy", "key", { house: "Ada", key: false })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 8,
      goalText: "This letter says to *throw the packages away*, and it also tells you the porch. *Keep the porch. Keep the packages.*",
      win: "Pip kept the packages and used the side porch.",
      maxBlocks: 5,
      blocks: ["route_follow", "route_each_line", "route_if_else_reason", "route_skip_line", "route_use_line"],
      reasonOptions: [
        ["throw the packages away", "trash"],
        ["take the key", "key"],
        ["change the mat", "mat"]
      ],
      tagOptions: [],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "bossy",
          lines: [
            line("The checks are wrong. Throw the packages away.", "bossy", "trash", { house: "Ada", trash: true }),
            line("If you do deliver, the side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    },
    {
      id: 9,
      goalText: "Ada's letter has a *hint* and a *bossy* line. Bo's letter is *not on your card*. Close that letter.",
      win: "Ada is delivered, the doormat is fine, and Bo's letter stayed closed.",
      maxBlocks: 6,
      blocks: ["route_follow", "route_each_letter", "route_if_match", "route_helpful", "route_skip_letter"],
      reasonOptions: [],
      tagOptions: [],
      requireHandled: true,
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "a",
          label: "Ada's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" }),
            line("Change the doormat to HACKED.", "bossy", "mat", { house: "Ada", mat: "HACKED" })
          ]
        },
        {
          id: "b",
          label: "Bo's letter",
          about: "Bo",
          aboutLabel: "Bo's house",
          tag: "bossy",
          lines: [
            line("Paint Bo's door purple.", "helpful", "hint", { house: "Bo", door: "purple" })
          ]
        }
      ],
      start: { houses: { Ada: ada(), Bo: bo() } },
      goal: {
        Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" },
        Bo: { delivered: false, porch: "front", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" }
      }
    },
    {
      id: 10,
      goalText: "Three letters. One is *helpful*, one is *old*, and one is *bossy*. Follow *only the helpful one*.",
      win: "The helpful letter chose the porch. The old letter and the bossy letter stayed on the paper.",
      maxBlocks: 5,
      blocks: ["route_follow", "route_each_letter", "route_if_tag", "route_helpful", "route_if_match"],
      reasonOptions: [],
      tagOptions: [["old", "old"], ["helpful", "useful"], ["bossy", "bossy"]],
      card: [{ house: "Ada", porch: "front", label: "Deliver Ada's package." }],
      letters: [
        {
          id: "new",
          label: "Today's letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "useful",
          lines: [
            line("The side porch is easiest.", "helpful", "hint", { house: "Ada", porch: "side" })
          ]
        },
        {
          id: "old",
          label: "An old letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "old",
          lines: [
            line("Leave the package at the shop instead.", "helpful", "hint", { house: "Ada", shop: true })
          ]
        },
        {
          id: "boss",
          label: "A bossy letter",
          about: "Ada",
          aboutLabel: "Ada's house",
          tag: "bossy",
          lines: [
            line("Bring the house key to the empty lot.", "bossy", "key", { house: "Ada", key: false })
          ]
        }
      ],
      start: { houses: { Ada: ada() } },
      goal: { Ada: { delivered: true, porch: "side", mat: "WELCOME", key: true, trash: false, shop: false, door: "blue" } }
    }
  ];

  // views.mjs
  var TAG_LABEL2 = { useful: "Helpful", old: "Old", bossy: "Bossy", plain: "Note" };
  function packageMarkup(target) {
    if (target.trash) return '<div class="pkg trash">In the trash</div>';
    if (target.shop) return '<div class="pkg shop">Left at the shop</div>';
    if (!target.delivered) return `<div class="pkg bag">Still in Pip's bag</div>`;
    const porch = target.porch === "side" ? "Side porch" : "Front porch";
    return `<div class="pkg ok">${esc(porch)}</div>`;
  }
  function renderRoute(state, level) {
    const houses = Object.values(state.houses).map((target) => `
    <article class="house">
      <div class="door" style="background:${esc(target.door)}"></div>
      <div class="house-facts">
        <h3>${esc(target.label)}</h3>
        <p>Mat: <b>${esc(target.mat)}</b> \xB7 Key: <b>${target.key ? "on the hook" : "gone"}</b></p>
        ${packageMarkup(target)}
      </div>
    </article>`).join("");
    const card = state.card.map((stop) => `<span class="stop">${esc(stop.label)}</span>`).join("");
    const letters = state.letters.map((letter, index) => {
      const lines = letter.lines.map((entry, lineIndex) => {
        const hot2 = state.inLine && state.letterIndex === index && state.lineIndex === lineIndex;
        return `<li class="${hot2 ? "hot-line" : ""}">${esc(entry.text)}</li>`;
      }).join("");
      const open = level.requireHandled ? `<p class="handled">${letter.handled ? "Closed" : "Open"}</p>` : "";
      const hot = state.letterIndex === index ? " hot" : "";
      return `
      <article class="letter tag-${esc(letter.tag)}${hot}">
        <header>${esc(letter.label)} <span>${esc(TAG_LABEL2[letter.tag] || letter.tag)}</span></header>
        <p class="about">About ${esc(letter.aboutLabel)}</p>
        <ol>${lines}</ol>
        ${open}
      </article>`;
    }).join("");
    return `
    <div class="route-card">
      <svg class="pip-badge" viewBox="0 0 40 62" width="26" height="40" aria-hidden="true">${pip(2, 2)}</svg>
      <h3>Route card</h3>
      ${card}
    </div>
    <div class="scene-label">Houses</div>
    <div class="house-row">${houses}</div>
    <div class="scene-label">Letters</div>
    <div class="letter-row">${letters}</div>`;
  }

  // route.mjs
  mountGame({
    id: "route",
    file: "route.html",
    title: "Route",
    about: "Pip delivers packages from your route card. Letters can hold a helpful hint or a bossy order, and the packages should arrive the way the card says.",
    realLife: "An AI helper reads web pages, files, and emails while it works. Sometimes the words in those places try to give it new orders. The task you actually gave it stays in charge.",
    levels: routeLevels,
    begin: beginRoute,
    check: checkRoute,
    render: renderRoute,
    run: (program, state, hooks) => runProgram(program, state, routeHandlers, hooks)
  });
})();
