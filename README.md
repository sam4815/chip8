![deploy](https://github.com/sam4815/chip8/actions/workflows/deploy.yaml/badge.svg)

# chip8

![Chip 8 Title](./public/chip8title.png)

[play](https://sam4815.github.io/chip8)

## About

This project was my first foray into the world of emulators. Emulation has been a really interesting topic to learn about; in addition to deepening my understanding of computer fundamentals like memory, registers, bytecode, and a lot more, being able to play games from the past has been fun and nostalgic. My eventual goal is to build a Gameboy Advance emulator, but here I've started with a more primitive virtual machine known as the [CHIP-8](https://en.wikipedia.org/wiki/CHIP-8).

Most CHIP-8 emulators and tutorials are written in vanilla JS or lower-level languages like C. To provide a bit more of a challenge and ensure I didn't blindly copy an existing tutorial, I structured the emulator as a React project and attempted to make it as idiomatic as possible by encapsulating state in hooks, favouring a functional approach over class-based, etc. Ultimately this proved a little misguided when I realized just how performance-intensive emulators can be. For instance, attempting to make the CPU state immutable by cloning it or using `immer` instead of mutating it directly was adding too large a performance overhead for the emulator to function properly, so I ended up switching to `useRef`. Similarly, modelling the screen as a DOM tree with a div for each pixel worked initially but also proved too expensive to function without noticeable lag, so I switched to the Canvas API. Compromises aside, I'm still quite happy with how the code turned out.

The key mappings can be found in [useKeyboard](src/hooks/useKeyboard.js). Most of the CHIP-8 games I found are, sadly, poorly-documented, so it's a little difficult to work out the controls for them, and randomly cycling through the available ROMs might be a confusing experience. However, games like Pong (`1` to move up, `Q` to move down) and Brick (`Q` to move left, `E` to move right) work as expected. The multiplayer Tron game is worth checking out, and Rocket can be fun too (`V` to launch 🚀).
