import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useKeyboard, useSpeaker, useRenderer, useCPU } from './hooks';
// import * from '../'

const Main = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: orange;
`;

const Header = styled.header`
  color: blue;
  font-size: 20px;
`;

const Canvas = styled.canvas`
  border: 1px solid black;
`;

function App() {
  const keyboard = useKeyboard();
  const speaker = useSpeaker();
  const renderer = useRenderer();
  const cpu = useCPU(renderer, keyboard, speaker);

  const animationRef = useRef(null);
  const [roms, setRoms] = useState([]);

  useEffect(() => {
    const fetchAllRoms = async () => {
      const response = await fetch('/roms/index.json');
      const roms = await response.json();
      setRoms(roms);
      console.log(roms);
    };

    fetchAllRoms();
  }, []);

  const selectRom = async (rom) => {
    cancel();

    const response = await fetch(`/roms/${rom}`);
    cpu.loadProgram(await response.arrayBuffer());
    animationRef.current = requestAnimationFrame(step);
  };

  const step = () => {
    cpu.cycle();
    animationRef.current = requestAnimationFrame(step);
  };

  const cancel = () => {
    cancelAnimationFrame(animationRef.current);
    renderer.clear();
    cpu.reset();
  };

  return (
    <Main>
      <Header>CHIP 8</Header>
      <Canvas ref={renderer.ref} />
      <button onClick={cancel}>STOP</button>
      <select onChange={(e) => selectRom(e.target.value)}>
        {roms.map((rom) => (
          <option key={rom} value={rom}>
            {rom}
          </option>
        ))}
      </select>
    </Main>
  );
}

export default App;
