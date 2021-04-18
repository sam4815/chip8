import { useEffect, useRef } from 'react';

const HEIGHT = 32;
const WIDTH = 64;

const init2DArray = (n, m) =>
  Array.from({ length: n }).map(() => Array.from({ length: m }).fill(0));

const useRenderer = () => {
  const canvasRef = useRef(null);
  const display = useRef(init2DArray(WIDTH, HEIGHT));
  const scale = screen.width / WIDTH;

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.canvas.height = HEIGHT * scale;
    context.canvas.width = WIDTH * scale;
  }, [canvasRef]);

  const setPixel = (x, y, val) => {
    x = x % WIDTH;
    y = y % HEIGHT;

    const collision = display.current[x][y] & val;
    display.current[x][y] ^= val;
    return collision;
  };

  const clear = () => {
    display.current = init2DArray(WIDTH, HEIGHT);
  };

  const draw = () => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, WIDTH * scale, HEIGHT * scale);
    context.fillStyle = '#000';

    display.current.forEach((row, x) =>
      row.forEach(
        (val, y) => val && context.fillRect(x * scale, y * scale, scale, scale)
      )
    );
  };

  return { ref: canvasRef, draw, setPixel, clear };
};

export default useRenderer;
