import { useState } from 'react';
import { arrayOf, object, shape, string } from 'prop-types';
import styled from 'styled-components';

const Sidebar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 300px;
  transition: transform 150ms ease-in;
  transform: translateY(${(props) => (props.isOpen ? '0px' : '300px')});

  ::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.4;
  }
`;

const Toggle = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 50px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 15% 15% 10% 10% 30% 20%;
`;

const Cell = styled.div`
  font-size: 10px;
`;

const DevTools = ({ traces }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isOpen}>
        <Row>
          <Cell>Current Instruction</Cell>
          <Cell>Program Counter</Cell>
          <Cell>x</Cell>
          <Cell>y</Cell>
          <Cell>Register</Cell>
          <Cell>Stack</Cell>
        </Row>
        {traces.map(({ id, instruction, pc, x, y, v, stack }) => (
          <Row key={id}>
            <Cell>{instruction}</Cell>
            <Cell>{pc}</Cell>
            <Cell>{x}</Cell>
            <Cell>{y}</Cell>
            <Cell>{JSON.stringify(Object.values(v))}</Cell>
            <Cell>{JSON.stringify(stack)}</Cell>
          </Row>
        ))}
      </Sidebar>
      <Toggle onClick={() => setIsOpen((isOpen) => !isOpen)}>🛠️</Toggle>
    </>
  );
};

DevTools.propTypes = {
  traces: arrayOf(
    shape({
      instruction: string,
      data: object,
      state: object,
    })
  ),
};

export default DevTools;
