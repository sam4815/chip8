import { useEffect, useState } from 'react';
import styled from 'styled-components';
import color from 'tinycolor2';
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import Icon, {
  BgColorsOutlined,
  ToolOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { ReactComponent as Random } from './assets/random.svg';
import { useKeyboard, useSpeaker, useRenderer, useCPU } from './hooks';

const { Content, Sider } = Layout;
const { Item, SubMenu } = Menu;

const FullPageLayout = styled(Layout)`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const Main = styled(Content)`
  display: flex;
  align-items: center;
  height: 100%;
`;

const LIGHT_THEME = {
  fill: '#FFFFFF',
  background: '#EAD7D7',
};

const DARK_THEME = {
  fill: '#b4e5af',
  background: '#000000',
};

const App = () => {
  // UI hooks
  const [theme, setTheme] = useState(DARK_THEME);

  // Emulator hooks
  const keyboard = useKeyboard();
  const speaker = useSpeaker();
  const renderer = useRenderer(theme);
  const cpu = useCPU(renderer, keyboard, speaker);

  const [roms, setRoms] = useState([]);

  useEffect(() => {
    const fetchAllRoms = async () => {
      const response = await fetch(`${process.env.PUBLIC_URL}/roms/index.json`);
      const roms = await response.json();
      setRoms(roms);
      loadRom(roms[Math.floor(Math.random() * roms.length)]);
    };

    fetchAllRoms();
  }, []);

  const loadRom = async (rom) => {
    renderer.clear();

    const response = await fetch(`${process.env.PUBLIC_URL}/roms/${rom}`);
    cpu.loadRom(await response.arrayBuffer());

    cpu.start();
  };

  const setRandomRom = () => {
    loadRom(roms[Math.floor(Math.random() * roms.length)]);
  };

  const setRandomTheme = () => {
    const getRandomColour = () =>
      `#${Math.floor(Math.random() * 2 ** 24)
        .toString(16)
        .padStart(6, 0)}`;

    setTheme({ fill: getRandomColour(), background: getRandomColour() });
  };

  const siderTheme = color(theme.background).isLight() ? 'light' : 'dark';

  return (
    <FullPageLayout>
      <Sider
        width="250px"
        collapsible
        defaultCollapsed={true}
        theme={siderTheme}
        style={{ overflow: 'auto' }}
      >
        <Menu theme={siderTheme} mode="inline">
          <SubMenu
            key="games"
            icon={<RocketOutlined />}
            title="Games"
            style={{ marginTop: '20px' }}
          >
            <Item key="randomrom" onClick={() => setRandomRom()}>
              <Icon component={Random} /> Random
            </Item>
            {roms.map((rom) => (
              <Item key={rom} onClick={() => loadRom(rom)}>
                {rom.match(/[^.]+/)}
              </Item>
            ))}
          </SubMenu>
          <SubMenu key="themes" icon={<BgColorsOutlined />} title="Themes">
            <Item key="randomtheme" onClick={() => setRandomTheme()}>
              <Icon component={Random} /> Random
            </Item>
            <Item key="dark" onClick={() => setTheme(DARK_THEME)}>
              Dark
            </Item>
            <Item key="light" onClick={() => setTheme(LIGHT_THEME)}>
              Light
            </Item>
          </SubMenu>
          <SubMenu key="devtools" icon={<ToolOutlined />} title="Dev Tools">
            {cpu.isRunning() ? (
              <Item key="pause" onClick={() => cpu.stop()}>
                Pause
              </Item>
            ) : (
              <Item key="resume" onClick={() => cpu.start()}>
                Resume
              </Item>
            )}
            <Item key="console" onClick={() => cpu.toggleLogging()}>
              Toggle Console Logging
            </Item>
            <Item key="smoothing" onClick={() => renderer.toggleSmoothing()}>
              Toggle Smoothing
            </Item>
          </SubMenu>
        </Menu>
      </Sider>
      <Layout>
        <Main style={{ background: theme.background }}>
          <canvas ref={renderer.ref} />
        </Main>
      </Layout>
    </FullPageLayout>
  );
};

export default App;
