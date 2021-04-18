const INSTRUCTIONS = {
  // Clear the display
  CLS: {
    pattern: /^E0$/,
    operation: (state, _, { renderer }) => {
      renderer.clear();
      return state;
    },
  },

  // Return from a subroutine
  RET: {
    pattern: /^EE$/,
    // Set the program counter to the address at the top of the stack, then subtract 1 from the stack pointer
    operation: ({ stack, ...state }) => ({
      ...state,
      pc: stack[stack.length - 1],
      stack: stack.slice(0, -1),
    }),
  },

  // Jump to location nnn
  JP_ADDR: {
    pattern: /1[A-F0-9][A-F0-9][A-F0-9]/,
    operation: (state, { nnn }) => ({
      ...state,
      pc: nnn,
    }),
  },

  // Call subroutine at nnn
  CALL_ADDR: {
    pattern: /2[A-F0-9][A-F0-9][A-F0-9]/,
    // Put the current PC on the top of the stack, then set the PC to nnn.
    operation: (state, { nnn }) => ({
      ...state,
      stack: state.stack.concat(state.pc),
      pc: nnn,
    }),
  },

  // Skip next instruction if Vx = kk
  SE_Vx_BYTE: {
    pattern: /3[A-F0-9][A-F0-9][A-F0-9]/,
    operation: (state, { x, kk }) => ({
      ...state,
      pc: state.v[x] === kk ? state.pc + 2 : state.pc,
    }),
  },

  // Skip next instruction if Vx != kk
  SNE_Vx_BYTE: {
    pattern: /4[A-F0-9][A-F0-9][A-F0-9]/,
    operation: (state, { x, kk }) => ({
      ...state,
      pc: state.v[x] !== kk ? state.pc + 2 : state.pc,
    }),
  },

  // Skip next instruction if Vx = Vy
  SE_Vx_Vy: {
    pattern: /5[A-F0-9][A-F0-9]0/,
    operation: (state, { x, y }) => ({
      ...state,
      pc: state.v[x] === state.v[y] ? state.pc + 2 : state.pc,
    }),
  },

  // Set Vx = kk
  LD_Vx_BYTE: {
    pattern: /6[A-F0-9][A-F0-9][A-F0-9]/,
    operation: ({ v, ...state }, { x, kk }) => {
      v[x] = kk;
      return { ...state, v };
    },
  },

  // Set Vx = Vx + kk
  ADD_Vx_BYTE: {
    pattern: /7[A-F0-9][A-F0-9][A-F0-9]/,
    operation: ({ v, ...state }, { x, kk }) => {
      v[x] = kk + v[x];
      return { ...state, v };
    },
  },

  // Set Vx = Vy
  LD_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]0/,
    operation: ({ v, ...state }, { x, y }) => {
      v[x] = v[y];
      return { ...state, v };
    },
  },

  // Set Vx = Vx OR Vy
  OR_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]1/,
    operation: ({ v, ...state }, { x, y }) => {
      v[x] = v[x] | v[y];
      return { ...state, v };
    },
  },

  // Set Vx = Vx AND Vy
  AND_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]2/,
    operation: ({ v, ...state }, { x, y }) => {
      v[x] = v[x] & v[y];
      return { ...state, v };
    },
  },

  // Set Vx = Vx XOR Vy
  XOR_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]3/,
    operation: ({ v, ...state }, { x, y }) => {
      v[x] = v[x] ^ v[y];
      return { ...state, v };
    },
  },

  // Set Vx = Vx + Vy, set VF = carry
  ADD_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]4/,
    operation: ({ v, ...state }, { x, y }) => {
      const sum = v[x] + v[y];
      v[0xf] = sum > 0xff ? 1 : 0;
      v[x] = sum;
      return { ...state, v };
    },
  },

  // Set Vx = Vx - Vy, set VF = NOT borrow
  SUB_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]5/,
    operation: ({ v, ...state }, { x, y }) => {
      const sum = v[x] - v[y];
      v[0xf] = sum > 0x0 ? 1 : 0;
      v[x] = sum;
      return { ...state, v };
    },
  },

  // Set Vx = Vx SHR 1
  SHR_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]6/,
    // If the least-significant bit of Vx is 1, then set VF to 1, otherwise 0. Then divide Vx by 2
    operation: ({ v, ...state }, { x }) => {
      v[0xf] = v[x] & 0x1;
      v[x] = v[x] >> 1;
      return { ...state, v };
    },
  },

  // Set Vx = Vy - Vx, set VF = NOT borrow
  SUBN_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]7/,
    operation: ({ v, ...state }, { x, y }) => {
      const sum = v[y] - v[x];
      v[0xf] = sum > 0x0 ? 1 : 0;
      v[x] = sum;
      return { ...state, v };
    },
  },

  // Set Vx = Vx SHL 1
  SHL_Vx_Vy: {
    pattern: /8[A-F0-9][A-F0-9]E/,
    // If the most-significant bit of Vx is 1, then set VF to 1, otherwise 0. Then multiply Vx by 2
    operation: ({ v, ...state }, { x }) => {
      v[0xf] = v[x] >> 7;
      v[x] = v[x] << 1;
      return { ...state, v };
    },
  },

  // Skip next instruction if Vx != Vy
  SNE_Vx_Vy: {
    pattern: /9[A-F0-9][A-F0-9]0/,
    operation: (state, { x, y }) => ({
      ...state,
      pc: state.v[x] !== state.v[y] ? state.pc + 2 : state.pc,
    }),
  },

  // Set I = nnn
  LD_I_ADDR: {
    pattern: /A[A-F0-9][A-F0-9][A-F0-9]/,
    operation: (state, { nnn }) => ({
      ...state,
      i: nnn,
    }),
  },

  // Jump to location nnn + V0
  JP_V0_ADDR: {
    pattern: /B[A-F0-9][A-F0-9][A-F0-9]/,
    operation: (state, { nnn }) => ({
      ...state,
      pc: nnn + state.v[0x0],
    }),
  },

  // Set Vx = random byte AND kk
  RND_Vx_BYTE: {
    pattern: /C[A-F0-9][A-F0-9][A-F0-9]/,
    operation: ({ v, ...state }, { x, kk }) => {
      const randomByte = Math.floor(Math.random() * 0xff);
      v[x] = kk & randomByte;
      return { ...state, v };
    },
  },

  // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision
  DRW_Vx_Vy_NIBBLE: {
    pattern: /D[A-F0-9][A-F0-9][A-F0-9]/,
    operation: ({ v, ...state }, { x, y, n: height }, { renderer }) => {
      v[0xf] = 0;

      for (let row = 0; row < height; row++) {
        const sprite = state.memory[state.i + row];

        for (let col = 0; col < 8; col++) {
          const val = sprite & (1 << (7 - col)) ? 1 : 0;
          const pixelErased = renderer.setPixel(v[x] + col, v[y] + row, val);
          if (pixelErased) v[0xf] = 1;
        }
      }

      return { ...state, v };
    },
  },

  // Skip next instruction if key with the value of Vx is pressed
  SKP_Vx: {
    pattern: /E[A-F0-9]9E/,
    operation: (state, { x }, { keyboard }) => ({
      ...state,
      pc: keyboard.isKeyPressed(state.v[x]) ? state.pc + 2 : state.pc,
    }),
  },

  // Skip next instruction if key with the value of Vx is not pressed
  SKNP_Vx: {
    pattern: /E[A-F0-9]A1/,
    operation: (state, { x }, { keyboard }) => ({
      ...state,
      pc: keyboard.isKeyPressed(state.v[x]) ? state.pc : state.pc + 2,
    }),
  },

  // Set Vx = delay timer value
  LD_Vx_DT: {
    pattern: /F[A-F0-9]07/,
    operation: ({ v, ...state }, { x }) => {
      v[x] = state.delayTimer;
      return { ...state, v };
    },
  },

  // Wait for a key press, store the value of the key in Vx
  LD_Vx_K: {
    pattern: /F[A-F0-9]0A/,
    operation: ({ v, ...state }, { x }, { keyboard }) => {
      const newState = { ...state, paused: true };
      keyboard.setOnNextKeyPress(() => (key) => {
        v[x] = key;
        newState.v = v;
        newState.paused = false;
      });
      return newState;
    },
  },

  // Set delay timer = Vx
  LD_DT_Vx: {
    pattern: /F[A-F0-9]15/,
    operation: (state, { x }) => ({
      ...state,
      delayTimer: state.v[x],
    }),
  },

  // Set sound timer = Vx
  LD_ST_Vx: {
    pattern: /F[A-F0-9]18/,
    operation: (state, { x }) => ({
      ...state,
      soundTimer: state.v[x],
    }),
  },

  // Set I = I + Vx
  ADD_I_Vx: {
    pattern: /F[A-F0-9]1E/,
    operation: (state, { x }) => ({
      ...state,
      i: state.i + state.v[x],
    }),
  },

  // Set I = location of sprite for digit Vx
  LD_F_Vx: {
    pattern: /F[A-F0-9]29/,
    // Multiply by 5 because each sprite is 5 bytes long
    operation: (state, { x }) => ({
      ...state,
      i: state.v[x] * 5,
    }),
  },

  // Store BCD representation of Vx in memory locations I, I+1, and I+2
  LD_B_Vx: {
    pattern: /F[A-F0-9]33/,
    operation: ({ memory, ...state }, { x }) => {
      const BCD = state.v[x]
        .toString()
        .padStart(3, '0')
        .split('')
        .map((digit) => Number(digit));

      BCD.forEach((digit, idx) => (memory[state.i + idx] = digit));
      return { ...state, memory };
    },
  },

  // Store registers V0 through Vx in memory starting at location I
  LD_I_Vx: {
    pattern: /F[A-F0-9]55/,
    operation: ({ memory, ...state }, { x }) => {
      state.v
        .slice(0, x + 1)
        .forEach((bit, idx) => (memory[state.i + idx] = bit));
      return { ...state, memory };
    },
  },

  // Read registers V0 through Vx from memory starting at location I
  LD_Vx_I: {
    pattern: /F[A-F0-9]65/,
    operation: ({ v, ...state }, { x }) => {
      state.memory
        .slice(state.i, state.i + x + 1)
        .forEach((bit, idx) => (v[idx] = bit));
      return { ...state, v };
    },
  },
};

export default INSTRUCTIONS;
