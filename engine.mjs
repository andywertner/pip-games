import {esc} from './art.mjs';
import {defineLevelBlocks, toolboxFor} from './blocks.mjs';

// Level text may mark important words with *stars*; they render bold.
function richText(text) {
  return esc(text).replace(/\*([^*]+)\*/g, '<b>$1</b>');
}

function plainText(text) {
  return text.replace(/\*/g, '');
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
    const raw = JSON.parse(localStorage.getItem(clearedKey(config)) || '[]');
    return new Set((Array.isArray(raw) ? raw : []).map(Number));
  } catch (error) {
    return new Set();
  }
}

function saveCleared(config, cleared) {
  try {
    localStorage.setItem(clearedKey(config), JSON.stringify([...cleared]));
  } catch (error) {
    // Ignore private-mode storage failures.
  }
}

// Opening level N means every level before it counts as finished.
// Level N itself stays unfinished, so N + 1 stays locked.
function unlockThrough(config, through) {
  const cleared = readCleared(config);
  for (let id = 1; id < through; id++) cleared.add(id);
  saveCleared(config, cleared);
}

// Level 1 is open. Each later level opens only after the one before it is finished.
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
  }).join('');
  const next = config.levels[levelNum] ? `${config.file}?level=${levelNum + 1}` : 'index.html';
  const nextLabel = config.levels[levelNum] ? 'Next level' : 'Back to the games';
  return `
    <div id="page">
      <header>
        <h1>
          <a href="index.html">🤖 Pip's Jobs</a> : ${config.emoji ? `${config.emoji} ` : ''}${esc(config.title)}
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
    // Statement inputs hold child blocks; programLines handles those.
    if (input.connection && input.connection.type === Blockly.NEXT_STATEMENT) continue;
    for (const field of input.fieldRow) {
      const text = field.getText ? field.getText() : '';
      if (text) bits.push(text);
    }
  }
  return bits.join(' ');
}

function programLines(block, depth, lines) {
  while (block) {
    lines.push('  '.repeat(depth) + blockText(block));
    for (const name of ['DO', 'ELSE']) {
      const child = block.getInputTargetBlock(name);
      if (!child) continue;
      if (name === 'ELSE') lines.push('  '.repeat(depth) + 'else');
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
  for (const name of ['DO', 'ELSE']) {
    const child = block.getInputTargetBlock(name);
    if (child) inputs[name] = blockFromWorkspace(child);
  }
  return {
    id: block.id,
    type: block.type,
    fields,
    inputs,
    next: blockFromWorkspace(block.getNextBlock()),
  };
}

function realize(workspace, spec) {
  const block = workspace.newBlock(spec.type);
  if (spec.fields) {
    for (const [name, value] of Object.entries(spec.fields)) {
      block.setFieldValue(value, name);
    }
  }
  if (spec.type === 'pip_note') block.setDeletable(false);
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
      type: 'pip_note',
      next: {type: 'sign_words', fields: {WORD: 'PLAY'}, inputs: {}, next: null},
    };
  }
  if (level.starter === 'yes' || level.starter === 'no') {
    return {
      type: 'pip_note',
      next: {type: level.starter === 'yes' ? 'stamp_yes' : 'stamp_no', fields: {}, inputs: {}, next: null},
    };
  }
  return {type: 'pip_note'};
}

function usedBlocks(workspace) {
  return workspace.getAllBlocks(false).filter((block) => block.type !== 'pip_note').length;
}

function storageKey(config, levelNum) {
  return `pip:${config.id}:level:${levelNum}`;
}

export function mountGame(config) {
  const params = new URLSearchParams(location.search);
  const requested = Number(params.get('level') || '1');
  const known = config.levels.some((level) => level.id === requested) ? requested : 1;
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

  const blocklyDiv = document.getElementById('blockly');
  const resize = () => {
    if (workspace) Blockly.svgResize(workspace);
  };

  let workspace = null;
  let running = false;
  let picture = config.begin(level);
  const stepMs = config.stepMs || 220;

  const draw = () => {
    document.getElementById('board').innerHTML = config.render(picture, level);
  };

  const chatLog = document.getElementById('chat-log');
  const chat = (role, text, kind) => {
    const bubble = document.createElement('div');
    bubble.className = `msg ${role}${kind ? ' ' + kind : ''}`;
    const who = document.createElement('div');
    who.className = 'who';
    who.textContent = role === 'you' ? 'You' : 'Pip';
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = text;
    bubble.appendChild(who);
    bubble.appendChild(body);
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
  };
  const flushLog = () => {
    const log = picture.log || [];
    while (log.length) chat('pip', log.shift());
  };

  const outcomeShadow = document.getElementById('outcome-shadow');
  const outcome = document.getElementById('outcome');
  const hideOutcome = () => {
    outcome.hidden = true;
    outcomeShadow.hidden = true;
  };
  const OPENERS = {
    win: ['Great work!', 'Good job!', 'You did it!', 'Nice one!'],
    fail: ['Not quite!', 'Try again!', 'Almost!', 'Not yet!'],
    blocked: ['Hold on!', 'One thing first!'],
  };
  const TITLES = {win: 'You finished this level.', fail: 'Pip ran your note, but...', blocked: 'Pip cannot start yet'};
  let outcomeCount = 0;
  // Every outcome goes to the popup and the chat: win, fail, or blocked.
  // Next level exists only on a win. A miss has no way forward.
  const showOutcome = (kind, text) => {
    const openers = OPENERS[kind];
    const opener = openers[(levelNum + outcomeCount++) % openers.length];
    document.getElementById('outcome-title').textContent = `${opener} ${TITLES[kind]}`;
    document.getElementById('outcome-text').textContent = text;
    outcome.className = kind;
    const nextButton = document.getElementById('outcome-next');
    const won = kind === 'win';
    nextButton.hidden = !won;
    nextButton.style.display = won ? '' : 'none';
    document.getElementById('outcome-ok').textContent = won ? 'Stay here' : 'Try again';
    outcome.hidden = false;
    outcomeShadow.hidden = false;
    document.getElementById('outcome-ok').focus();
    chat('pip', `${opener} ${text}`, kind);
    if (!won) return;
    const cleared = readCleared(config);
    cleared.add(levelNum);
    saveCleared(config, cleared);
    const ahead = document.getElementById(`level${levelNum + 1}`);
    if (ahead && ahead.tagName !== 'A') {
      const link = document.createElement('a');
      link.className = 'level_number';
      link.id = ahead.id;
      link.href = `${config.file}?level=${levelNum + 1}`;
      link.textContent = String(levelNum + 1);
      ahead.replaceWith(link);
    }
  };
  document.getElementById('outcome-ok').addEventListener('click', hideOutcome);
  outcomeShadow.addEventListener('click', hideOutcome);

  const lockShadow = document.getElementById('lock-shadow');
  const lockBox = document.getElementById('lock-box');
  const lockForm = document.getElementById('lock-form');
  const lockError = document.getElementById('lock-error');
  let lockTarget = 0;
  const hideLock = () => {
    lockBox.hidden = true;
    lockShadow.hidden = true;
    lockForm.hidden = true;
    lockError.hidden = true;
    document.getElementById('lock-password').value = '';
  };
  const showLock = (target) => {
    lockTarget = target;
    document.getElementById('lock-title').textContent = `Level ${target} isn't unlocked yet.`;
    lockForm.hidden = true;
    lockError.hidden = true;
    document.getElementById('lock-password').value = '';
    lockBox.hidden = false;
    lockShadow.hidden = false;
    document.getElementById('lock-ok').focus();
  };
  document.querySelector('.levels').addEventListener('click', (event) => {
    const button = event.target.closest('.level_locked');
    if (!button) return;
    showLock(Number(button.dataset.level));
  });
  document.getElementById('lock-ok').addEventListener('click', hideLock);
  lockShadow.addEventListener('click', hideLock);
  document.getElementById('lock-key').addEventListener('click', () => {
    lockForm.hidden = false;
    lockError.hidden = true;
    document.getElementById('lock-password').focus();
  });
  lockForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = document.getElementById('lock-password').value;
    if (password !== 'admin') {
      lockError.hidden = false;
      document.getElementById('lock-password').focus();
      return;
    }
    unlockThrough(config, lockTarget);
    location.href = `${config.file}?level=${lockTarget}`;
  });
  const teacherShadow = document.getElementById('teacher-shadow');
  const teacherBox = document.getElementById('teacher-box');
  const teacherForm = document.getElementById('teacher-form');
  const teacherError = document.getElementById('teacher-error');
  const teacherReady = () => sessionStorage.getItem('pip:teacher') === 'yes';
  const hideTeacher = () => {
    teacherBox.hidden = true;
    teacherShadow.hidden = true;
    teacherError.hidden = true;
    document.getElementById('teacher-password').value = '';
  };
  const loadAnswer = () => {
    const solution = config.solutions[levelNum - 1];
    loading = true;
    Blockly.Events.setGroup(true);
    for (const block of workspace.getTopBlocks(false)) block.dispose(false);
    const note = realize(workspace, {type: 'pip_note', next: solution});
    note.moveBy(24, 24);
    note.setDeletable(false);
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
          JSON.stringify(Blockly.serialization.workspaces.save(workspace)));
    } catch (error) {
      // Ignore private-mode storage failures.
    }
    chat('pip', 'Teacher answer is on the note. Press Run when you want to watch it.');
  };
  document.getElementById('teacher').addEventListener('click', () => {
    if (running) return;
    if (teacherReady()) {
      loadAnswer();
      return;
    }
    teacherError.hidden = true;
    document.getElementById('teacher-password').value = '';
    teacherBox.hidden = false;
    teacherShadow.hidden = false;
    document.getElementById('teacher-password').focus();
  });
  teacherShadow.addEventListener('click', hideTeacher);
  teacherForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (document.getElementById('teacher-password').value !== 'admin') {
      teacherError.hidden = false;
      document.getElementById('teacher-password').focus();
      return;
    }
    sessionStorage.setItem('pip:teacher', 'yes');
    hideTeacher();
    loadAnswer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!lockBox.hidden) hideLock();
    if (!teacherBox.hidden) hideTeacher();
    hideOutcome();
  });
  const showCapacity = () => {
    const used = usedBlocks(workspace);
    const left = level.maxBlocks - used;
    const node = document.getElementById('capacity');
    node.textContent = left >= 0
      ? `Blocks left: ${left}`
      : `Too many blocks by ${-left}`;
  };

  workspace = Blockly.inject(blocklyDiv, {
    toolbox: toolboxFor(level),
    trashcan: true,
    renderer: 'geras',
    media: 'vendor/blockly/media/',
    sounds: false,
    zoom: {controls: false, wheel: true, startScale: 1.0},
    move: {scrollbars: true, drag: true, wheel: false},
  });
  resize();
  window.addEventListener('resize', resize);

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
    const note = realize(workspace, starterTree(level));
    note.moveBy(24, 24);
  }
  const note = workspace.getTopBlocks(false).find((block) => block.type === 'pip_note');
  if (note) note.setDeletable(false);
  else realize(workspace, {type: 'pip_note'}).moveBy(24, 24);

  workspace.addChangeListener((event) => {
    if (loading || (event && event.isUiEvent)) return;
    showCapacity();
    try {
      localStorage.setItem(
          storageKey(config, levelNum),
          JSON.stringify(Blockly.serialization.workspaces.save(workspace)));
    } catch (error) {
      // Ignore private-mode storage failures.
    }
  });
  loading = false;
  showCapacity();
  draw();
  chat('pip', `Hi! I'm Pip. Level ${levelNum}: ${plainText(level.goalText)}`);
  chat('pip', 'Put blocks under "Pip, please", then press Run. I will do exactly what the blocks say.');

  document.getElementById('start-over').addEventListener('click', () => {
    localStorage.removeItem(storageKey(config, levelNum));
    location.reload();
  });

  const details = document.querySelector('.about-details');
  if (details) details.addEventListener('toggle', resize);

  document.getElementById('reset').addEventListener('click', () => {
    if (running) return;
    picture = config.begin(level);
    workspace.highlightBlock(null);
    hideOutcome();
    draw();
    chat('pip', 'Reset. The clubhouse is back to how it started.');
  });

  document.getElementById('run').addEventListener('click', async () => {
    if (running) return;
    hideOutcome();
    const loose = workspace.getTopBlocks(false).filter((block) => block.type !== 'pip_note');
    if (loose.length) {
      showOutcome('blocked', 'Some blocks are not connected under "Pip, please". Loose blocks will not run.');
      return;
    }
    if (usedBlocks(workspace) > level.maxBlocks) {
      showOutcome('blocked', `This note is too long. Use ${level.maxBlocks} blocks or fewer.`);
      return;
    }
    const noteBlock = workspace.getTopBlocks(false).find((block) => block.type === 'pip_note');
    const program = blockFromWorkspace(noteBlock && noteBlock.getNextBlock());
    if (!program) {
      showOutcome('blocked', 'The note is empty. Add a block under "Pip, please".');
      return;
    }
    running = true;
    document.getElementById('run').disabled = true;
    picture = config.begin(level);
    draw();
    chat('you', programLines(noteBlock.getNextBlock(), 0, []).join('\n'));
    chat('pip', 'On it.');
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
        },
      });
      workspace.highlightBlock(null);
      flushLog();
      const result = config.check(picture, level);
      draw();
      showOutcome(result.ok ? 'win' : 'fail', result.message);
    } catch (error) {
      showOutcome('fail', error && error.message ? error.message : 'Pip got stuck.');
    } finally {
      running = false;
      document.getElementById('run').disabled = false;
    }
  });
}
