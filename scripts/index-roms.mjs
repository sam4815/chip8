import fs from 'fs';

const directory = './public/roms/';
const filename = 'index.json';

fs.readdir(directory, (_, files) => {
  const index = files.filter((f) => !f.startsWith('.') && f !== filename);
  fs.writeFileSync(`${directory}${filename}`, JSON.stringify(index, null, 2));
});
