/**
 * Hello Pip: the first job. Snap blocks together, put them in order, use the
 * little arrows, fill a slot, and throw away what does not belong.
 * Pip only does what connected blocks say.
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const TOOL_LABEL = {broom: 'broom', can: 'watering can', brush: 'paintbrush'};
const TARGET_LABEL = {plants: 'the plants', floor: 'the floor', sign: 'the sign'};

export function beginHello(level) {
  const state = clone(level.start);
  state.waving = false;
  state.sweptWithout = false;
  state.log = [];
  return state;
}

function holdingText(state) {
  return state.holding ? `a ${TOOL_LABEL[state.holding]}` : 'nothing';
}

export const helloHandlers = {
  async hello_wave(_node, state) {
    state.waving = true;
    state.log.push('Waving hello!');
  },
  async hello_lights(_node, state) {
    state.lights = 'on';
    state.log.push('Lights on.');
  },
  async hello_grab(node, state) {
    state.holding = node.fields.TOOL;
    state.log.push(`Picking up the ${TOOL_LABEL[state.holding]}.`);
  },
  async hello_sweep(_node, state) {
    if (state.holding !== 'broom') {
      state.sweptWithout = true;
      state.log.push(`I cannot sweep. I am holding ${holdingText(state)}.`);
      return;
    }
    state.floor = 'clean';
    state.log.push('Sweeping the floor.');
  },
  async hello_water(node, state) {
    if (state.holding !== 'can') {
      state.log.push(`I cannot water anything. I am holding ${holdingText(state)}.`);
      return;
    }
    const target = node.fields.TARGET;
    if (target === 'plants') {
      state.plants = 'watered';
      state.log.push('Watering the plants.');
    } else if (target === 'floor') {
      state.floor = 'wet';
      state.log.push('Watering the floor. Splash. The plants are still dry.');
    } else {
      state.log.push('Watering the sign. It is dripping, and the plants are still dry.');
    }
  },
  async tool_broom(_node, state) {
    state.holding = 'broom';
    state.log.push('Holding the broom.');
  },
  async tool_brush(_node, state) {
    state.holding = 'brush';
    state.log.push('Holding the paintbrush.');
  },
  async tool_can(_node, state) {
    state.holding = 'can';
    state.log.push('Holding the watering can.');
  },
  async job_paint(node, state, run) {
    state.holding = null;
    state.log.push('Job card: paint the sign.');
    await run(node.inputs.DO);
    if (state.holding === 'brush') {
      state.sign = 'painted';
      state.log.push('Painting the sign. Done!');
    } else {
      state.log.push(`I cannot paint with ${holdingText(state)}.`);
    }
  },
  async job_sweep(node, state, run) {
    state.holding = null;
    state.log.push('Job card: sweep the floor.');
    await run(node.inputs.DO);
    if (state.holding === 'broom') {
      state.floor = 'clean';
      state.log.push('Sweeping the floor. Done!');
    } else {
      state.sweptWithout = true;
      state.log.push(`I cannot sweep with ${holdingText(state)}.`);
    }
  },
  async job_water(node, state, run) {
    state.holding = null;
    state.log.push('Job card: water the plants.');
    await run(node.inputs.DO);
    if (state.holding === 'can') {
      state.plants = 'watered';
      state.log.push('Watering the plants. Done!');
    } else {
      state.log.push(`I cannot water the plants with ${holdingText(state)}.`);
    }
  },
};

export function checkHello(state, level) {
  const goal = level.goal;
  if (goal.waving && !state.waving) {
    return {ok: false, message: 'Pip did not wave. Make sure the block is snapped under "Pip, please".'};
  }
  if (goal.floor === 'clean' && state.floor !== 'clean') {
    return {
      ok: false,
      message: state.sweptWithout
        ? 'The floor is still dirty. Pip tried to sweep before he had the broom.'
        : 'The floor is still dirty.',
    };
  }
  if (goal.plants === 'watered' && state.plants !== 'watered') {
    return {ok: false, message: 'The plants are still dry.'};
  }
  if (goal.sign === 'painted' && state.sign !== 'painted') {
    return {ok: false, message: 'The sign is still blank.'};
  }
  if (goal.lights === 'off' && state.lights === 'on') {
    return {ok: false, message: 'The lights came on. Nobody asked for that. Drag that block to the trash.'};
  }
  return {ok: true, message: level.win};
}

const ROOM = {lights: 'off', floor: 'dirty', plants: 'dry', sign: 'blank', holding: null};

export const helloLevels = [
  {
    id: 1,
    goalText: 'Drag *wave hello* under *Pip, please* so the two blocks *snap together*. Then press *Run*.',
    win: 'Pip waved! The blocks snapped together, so Pip could read them.',
    maxBlocks: 1,
    blocks: ['hello_wave'],
    start: ROOM,
    goal: {waving: true},
  },
  {
    id: 2,
    goalText: 'Pip needs the *broom first*. Then he can *sweep*. Snap the two blocks in the *right order*.',
    win: 'The floor is clean. Pick up the broom, then sweep. Order matters.',
    maxBlocks: 2,
    blocks: ['hello_sweep', 'hello_grab'],
    toolOptions: [['broom', 'broom']],
    start: ROOM,
    goal: {floor: 'clean'},
  },
  {
    id: 3,
    goalText: 'Pip is holding the watering can. Click the *little arrow* on the block and pick *the plants*.',
    win: 'The plants got a drink. The little arrow changes what the block says.',
    maxBlocks: 1,
    blocks: ['hello_water'],
    targetOptions: [['the floor', 'floor'], ['the plants', 'plants'], ['the sign', 'sign']],
    start: {...ROOM, holding: 'can'},
    goal: {plants: 'watered'},
  },
  {
    id: 4,
    goalText: 'The job card has a *slot*. Put the *right tool* in the slot so Pip can *paint the sign*.',
    win: 'The sign is painted. The right tool went in the slot.',
    maxBlocks: 2,
    blocks: ['job_paint', 'tool_broom', 'tool_brush', 'tool_can'],
    start: ROOM,
    goal: {sign: 'painted'},
  },
  {
    id: 5,
    goalText: 'Two job cards. Put the right tool in *each* slot. *Sweep* the floor and *water* the plants.',
    win: 'Clean floor, happy plants. Every slot got the right tool.',
    maxBlocks: 4,
    blocks: ['job_sweep', 'job_water', 'tool_broom', 'tool_brush', 'tool_can'],
    start: ROOM,
    goal: {floor: 'clean', plants: 'watered'},
  },
  {
    id: 6,
    goalText: 'Someone left a *messy note*. Fix it. Swap the *wrong tool*, and drag the *extra block* to the *trash*. Pip should paint the sign and water the plants, and *nothing else*.',
    win: 'Fixed! Pip painted the sign and watered the plants, and the lights stayed off.',
    maxBlocks: 4,
    blocks: ['job_paint', 'job_water', 'hello_lights', 'tool_broom', 'tool_brush', 'tool_can'],
    starter: {
      type: 'job_paint', fields: {}, inputs: {DO: {type: 'tool_broom', fields: {}, inputs: {}, next: null}},
      next: {
        type: 'job_water', fields: {}, inputs: {DO: {type: 'tool_can', fields: {}, inputs: {}, next: null}},
        next: {type: 'hello_lights', fields: {}, inputs: {}, next: null},
      },
    },
    start: ROOM,
    goal: {sign: 'painted', plants: 'watered', lights: 'off'},
  },
];
