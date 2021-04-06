import INSTRUCTIONS from './instructions';

const decodeOpcode = (opcode) => {
  // Lowest 12 bits of the instruction
  const nnn = opcode & 0xfff;
  // Lowest 8 bits of the instruction
  const kk = opcode & 0xff;
  // Nibbles
  const x = (opcode & 0x0f00) >> 8;
  const y = (opcode & 0x00f0) >> 4;
  const n = opcode & 0x000f;

  const [instruction] = Object.entries(INSTRUCTIONS).find(([, { pattern }]) =>
    opcode.toString(16).toUpperCase().match(pattern)
  );

  return { instruction, nnn, kk, x, y, n };
};

export default decodeOpcode;
