import { useEffect, useState } from 'react';

const KEYMAP = {
  49: 0x1, // 1
  50: 0x2, // 2
  51: 0x3, // 3
  52: 0xc, // 4
  81: 0x4, // Q
  87: 0x5, // W
  69: 0x6, // E
  82: 0xd, // R
  65: 0x7, // A
  83: 0x8, // S
  68: 0x9, // D
  70: 0xe, // F
  90: 0xa, // Z
  88: 0x0, // X
  67: 0xb, // C
  86: 0xf, // V
};

const useKeyboard = () => {
  const [pressed, setPressed] = useState([]);
  const [onNextKeyPress, setOnNextKeyPress] = useState(null);

  const isKeyPressed = (key) => pressed[key];

  useEffect(() => {
    const onKeyDown = ({ keyCode }) => {
      const key = KEYMAP[keyCode];
      if (key === undefined) return;

      setPressed((draft) => {
        draft[key] = true;
        return draft;
      });

      if (onNextKeyPress !== null) {
        onNextKeyPress(key);
        setOnNextKeyPress(null);
      }
    };

    const onKeyUp = ({ keyCode }) => {
      const key = KEYMAP[keyCode];
      if (key === undefined) return;

      setPressed((draft) => {
        draft[key] = false;
        return draft;
      });
    };

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    return () => {
      window.removeEventListener('keydown', onKeyDown, false);
      window.removeEventListener('keyup', onKeyUp, false);
    };
  }, [onNextKeyPress]);

  return { isKeyPressed, setOnNextKeyPress };
};

export default useKeyboard;
