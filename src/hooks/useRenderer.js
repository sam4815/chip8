import { useEffect, useRef } from 'react';

const CHIP_8_HEIGHT = 32;
const CHIP_8_WIDTH = 64;

const init2DArray = (n, m) =>
  Array.from({ length: n }).map(() =>
    Array.from({ length: m }).map(() => [0, 0, 0])
  );

const useRenderer = (theme) => {
  const canvasRef = useRef(null);
  const display = useRef(init2DArray(CHIP_8_WIDTH, CHIP_8_HEIGHT));
  const smoothing = useRef(true);
  const scale = useRef(1);
  const canvasTheme = useRef(theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.style.width = '100%';
    scale.current = canvas.offsetWidth / CHIP_8_WIDTH;

    context.canvas.width = CHIP_8_WIDTH * scale.current;
    context.canvas.height = CHIP_8_HEIGHT * scale.current;
  }, [canvasRef]);

  useEffect(() => {
    canvasTheme.current = theme;
  }, [theme]);

  const setPixel = (x, y, val) => {
    x = x % CHIP_8_WIDTH;
    y = y % CHIP_8_HEIGHT;

    const collision = display.current[x][y][0] & val;
    display.current[x][y][0] ^= val;
    return collision;
  };

  const clear = () => {
    display.current = init2DArray(CHIP_8_WIDTH, CHIP_8_HEIGHT);
  };

  const draw = () => {
    const context = canvasRef.current.getContext('2d');
    context.fillStyle = canvasTheme.current.background;
    context.fillRect(
      0,
      0,
      CHIP_8_WIDTH * scale.current,
      CHIP_8_HEIGHT * scale.current
    );

    context.fillStyle = canvasTheme.current.fill;

    display.current.forEach((row, x) =>
      row.forEach((pixelBuffer, y) => {
        const frames = smoothing.current
          ? pixelBuffer
          : pixelBuffer.slice(0, 1);

        if (frames.some(Boolean)) {
          context.fillRect(
            x * scale.current,
            y * scale.current,
            Math.ceil(scale.current + 1),
            Math.ceil(scale.current + 1)
          );
        }

        display.current[x][y].unshift(pixelBuffer[0]);
        display.current[x][y].pop();
      })
    );
  };

  const toggleSmoothing = () => {
    smoothing.current = !smoothing.current;
  };

  return { ref: canvasRef, draw, setPixel, clear, toggleSmoothing };
};

export default useRenderer;
