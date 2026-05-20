import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { audioMap } from '../src/utils/audioMap.js';

const audioDir = path.join(__dirname, '../public/assets/audio');
const files = fs.readdirSync(audioDir);

const validFiles = new Set(Object.values(audioMap).map(p => path.basename(p)));

let deleted = 0;
for (const file of files) {
  if (file.endsWith('.mp3') && !validFiles.has(file)) {
    fs.unlinkSync(path.join(audioDir, file));
    console.log(`Deleted unused audio: ${file}`);
    deleted++;
  }
}

console.log(`Cleanup complete. Deleted ${deleted} unused audio files.`);
