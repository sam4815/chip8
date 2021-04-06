import decodeOpcode from './decodeOpcode';

describe('decodeOpcode', () => {
  it('pulls the instruction and relevant bits out of an opcode', () => {
    const opcode = 0x3ab2;
    const { instruction, nnn, kk, x, y, n } = decodeOpcode(opcode);

    expect(instruction).toEqual('SE_Vx_BYTE');
    expect(nnn).toEqual(0xab2);
    expect(kk).toEqual(0xb2);
    expect(x).toEqual(0xa);
    expect(y).toEqual(0xb);
    expect(n).toEqual(0x2);
  });

  it('pulls ADD_Vx_BYTE out of an opcode', () => {
    const opcode = 0x7ab2;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('ADD_Vx_BYTE');
  });

  it('pulls ADD_I_Vx out of an opcode', () => {
    const opcode = 0xfa1e;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('ADD_I_Vx');
  });

  it('pulls LD_Vx_I out of an opcode', () => {
    const opcode = 0xf265;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('LD_Vx_I');
  });

  it('pulls SHL_Vx_Vy out of an opcode', () => {
    const opcode = 0x8e6e;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('SHL_Vx_Vy');
  });

  it('pulls XOR_Vx_Vy out of an opcode', () => {
    const opcode = 0x8e23;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('XOR_Vx_Vy');
  });

  it('pulls ADD_Vx_BYTE out of an opcode', () => {
    const opcode = 0x7e23;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('ADD_Vx_BYTE');
  });

  it('pulls RET out of an opcode', () => {
    const opcode = 0x00ee;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('RET');
  });

  it('pulls CLS out of an opcode', () => {
    const opcode = 0x00e0;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('CLS');
  });

  it('pulls SE_Vx_BYTE out of an opcode', () => {
    const opcode = 0x3aaa;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('SE_Vx_BYTE');
  });

  it('pulls JP_V0_ADDR out of an opcode', () => {
    const opcode = 0xbaaa;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('JP_V0_ADDR');
  });

  it('pulls SKP_Vx out of an opcode', () => {
    const opcode = 0xe49e;
    const { instruction } = decodeOpcode(opcode);
    expect(instruction).toEqual('SKP_Vx');
  });
});
