import { useState, useRef } from 'react';
import { INSTRUCTIONS, SPRITES, decodeOpcode } from '../utilities';

const INITIAL_STATE = {
  // Load sprites into memory
  memory: new Uint8Array(4096),
  v: new Uint8Array(16),
  i: 0,
  delayTimer: 0,
  soundTimer: 0,
  pc: 0x200,
  stack: new Array(),
  paused: false,
  speed: 10,
  cycle: 0,
};

const useCPU = (renderer, keyboard, speaker) => {
  const [traces, setTraces] = useState([]);
  const state = useRef({ ...INITIAL_STATE });

  const reset = () => {
    state.current = { ...INITIAL_STATE };
    setTraces([]);
  };

  const loadProgram = (ROM) => {
    reset();

    for (let i = 0; i < SPRITES.length; i++) {
      state.current.memory[i] = SPRITES[i];
    }

    const program = new Uint8Array(ROM);
    const memoryStart = 0x200;

    for (let i = 0; i < program.length; i++) {
      state.current.memory[memoryStart + i] = program[i];
    }
  };

  const playSound = () =>
    state.current.soundTimer > 0 ? speaker.play(440) : speaker.stop();

  const updateTimers = () => {
    state.current.delayTimer = Math.max(state.current.delayTimer - 1, 0);
    state.current.soundTimer = Math.max(state.current.soundTimer - 1, 0);
  };

  const nextInstruction = () => {
    state.current.pc = state.current.pc + 2;
  };

  const cycle = () => {
    for (let i = 0; i < state.current.speed; i++) {
      const { memory, pc, paused } = state.current;
      if (paused) continue;

      // Combine two pieces of 8-bit memory to get full 16-bit opcode
      const opcode = (memory[pc] << 8) | (memory[pc + 1] << 0);
      nextInstruction();
      executeInstruction(opcode);
    }

    if (!state.current.paused) updateTimers();
    playSound();
    renderer.draw();
  };

  const executeInstruction = (opcode) => {
    const { instruction, ...data } = decodeOpcode(opcode);
    const { operation } = INSTRUCTIONS[instruction];

    const { pc, v, stack, cycle } = state.current;
    const { x, y } = data;
    const trace = {
      instruction,
      pc,
      v,
      x,
      y,
      stack,
      cycle,
    };
    setTraces((traces) => [trace].concat(traces.slice(0, 19)));

    state.current = operation(state.current, data, {
      keyboard,
      renderer,
      speaker,
    });
    state.current.cycle = state.current.cycle + 1;
  };

  return { cycle, loadProgram, traces: traces };
};

export default useCPU;
