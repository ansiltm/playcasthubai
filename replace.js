const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.git') || file.includes('.next') || file.includes('dist')) {
            next();
          } else {
            walk(file, (err, res) => {
              results = results.concat(res);
              next();
            });
          }
        } else {
          if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

walk(__dirname, (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace PlaycastHub to PlaycastHub
    content = content.replace(/PlaycastHub/g, 'PlaycastHub');
    content = content.replace(/PlaycastHub/g, 'PlaycastHub');
    content = content.replace(/playcasthub/g, 'playcasthub');
    
    if (content !== original) {
      console.log('Updated', file);
      fs.writeFileSync(file, content, 'utf8');
    }
  });
});
