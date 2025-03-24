const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/journal.tsx');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Replace the problematic apostrophes with escaped ones
  const fixed = data.replace(/I'll/g, "I\\'ll").replace(/I've/g, "I\\'ve");
  
  fs.writeFile(filePath, fixed, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully fixed journal.tsx');
  });
}); 