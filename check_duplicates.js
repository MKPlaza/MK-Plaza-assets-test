const fs = require('fs');
const content = fs.readFileSync('src/gamePayloads.ts', 'utf8');
const keys = [];
const regex = /'([^']+)':\s*{/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (keys.includes(match[1])) {
    console.log('Duplicate key:', match[1]);
  }
  keys.push(match[1]);
}
