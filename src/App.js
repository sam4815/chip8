import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useKeyboard, useSpeaker, useRenderer, useCPU } from './hooks';
import DevTools from './DevTools';

const Main = styled.div`
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: orange;
`;

const Header = styled.header`
  color: blue;
  font-size: 20px;
`;

const Canvas = styled.canvas`
  border: 1px solid black;
`;

const App = () => {
  const keyboard = useKeyboard();
  const speaker = useSpeaker();
  const renderer = useRenderer();
  const cpu = useCPU(renderer, keyboard, speaker);

  const [intervalId, setIntervalId] = useState(null);
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
    renderer.clear();

    const response = await fetch(`/roms/${rom}`);
    cpu.loadProgram(await response.arrayBuffer());

    setIntervalId(setInterval(cpu.cycle, 3));
  };

  const pause = () => {
    if (intervalId) clearInterval(intervalId);
    else setIntervalId(setInterval(cpu.cycle, 3));
  };

  return (
    <Main>
      <Header>CHIP 8</Header>
      <Canvas ref={renderer.ref} />
      <button onClick={pause}>PAUSE</button>
      <select onChange={(e) => selectRom(e.target.value)}>
        {roms.map((rom) => (
          <option key={rom} value={rom}>
            {rom}
          </option>
        ))}
      </select>
      <DevTools traces={cpu.traces} />
    </Main>
  );
};

export default App;
