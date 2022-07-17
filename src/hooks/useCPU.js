import { useRef, useState } from 'react';
import { INSTRUCTIONS, SPRITES, decodeOpcode } from '../utilities';

const INITIAL_STATE = {
  memory: new Uint8Array(4096),
  v: new Uint8Array(16),
  i: 0,
  delayTimer: 0,
  soundTimer: 0,
  pc: 0x200,
  stack: new Array(),
  paused: false,
  speed: 10,
  debugMode: false,
};

const useCPU = (renderer, keyboard, speaker) => {
  const state = useRef({ ...INITIAL_STATE });
  const [intervalId, setIntervalId] = useState(null);

  const reset = () => {
    state.current = { ...INITIAL_STATE };
  };

  const loadRom = (rom) => {
    reset();

    // Load sprites into memory
    for (let i = 0; i < SPRITES.length; i++) {
      state.current.memory[i] = SPRITES[i];
    }

    const program = new Uint8Array(rom);
    const memoryStart = 0x200;

    for (let i = 0; i < program.length; i++) {
      state.current.memory[memoryStart + i] = program[i];
    }
  };

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
    if (state.current.soundTimer > 0) speaker.play();
    renderer.draw();
  };

  const executeInstruction = (opcode) => {
    const { instruction, ...data } = decodeOpcode(opcode);
    const { operation } = INSTRUCTIONS[instruction];

    if (state.current.debugMode) console.log(instruction, data);

    state.current = operation(state.current, data, {
      keyboard,
      renderer,
      speaker,
    });
  };

  const start = () => {
    if (intervalId) return;

    const newIntervalId = setInterval(cycle, 20);
    setIntervalId(newIntervalId);
  };

  const stop = () => {
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const isRunning = () => Boolean(intervalId);

  const toggleLogging = () => {
    state.current.debugMode = !state.current.debugMode;
  };

  return { start, stop, isRunning, loadRom, toggleLogging };
};

export default useCPU;
