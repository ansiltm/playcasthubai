const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./app', []);
files.push(...walkSync('./components', []));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace hardcoded Tailwind classes with semantic ones that respect dark mode
  let newContent = content
    .replace(/bg-white/g, 'bg-bubble-surface')
    .replace(/text-gray-900/g, 'text-text-main')
    .replace(/text-gray-800/g, 'text-text-main')
    .replace(/text-gray-700/g, 'text-text-main')
    .replace(/text-gray-600/g, 'text-text-muted')
    .replace(/text-gray-500/g, 'text-text-muted')
    .replace(/border-gray-100/g, 'border-border-main')
    .replace(/border-blue-100/g, 'border-border-main')
    .replace(/bg-gray-50/g, 'bg-bubble-bg')
    .replace(/bg-blue-50\/50/g, 'bg-bubble-input')
    .replace(/bg-blue-50/g, 'bg-bubble-input');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Done replacing colors!');
