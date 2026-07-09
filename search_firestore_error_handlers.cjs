const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'src', 'components', 'Dashboard.tsx'), 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('getDocs') || line.includes('onSnapshot')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    // print next 5 lines to see if there is an error catch block
    for (let i = idx + 1; i < Math.min(lines.length, idx + 6); i++) {
      console.log(`  ${i + 1}: ${lines[i]}`);
    }
  }
});
