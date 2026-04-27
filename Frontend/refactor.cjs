const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk('c:/Social Media By (MERN)/Frontend/src');
let changedFiles = 0;

files.forEach(file => {
  if (file.endsWith('axios.js')) return; // Skip the axios config file itself

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('http://localhost:8000') || content.includes('http://localhost:8000/api/v1')) {
    const dir = path.dirname(file);
    let relativePath = path.relative(dir, 'c:/Social Media By (MERN)/Frontend/src/utils/axios.js').replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;

    // Remove old axios import
    content = content.replace(/import axios from ["']axios["'];?\n?/g, '');
    
    // Inject custom API import at the top
    content = `import API from "${relativePath}";\n` + content;

    // Replace http://localhost:8000/api/v1 with nothing (since it's in baseURL)
    // Be careful with templates like `http://localhost:8000/api/v1/posts/${postId}`
    content = content.replace(/http:\/\/localhost:8000\/api\/v1/g, '');
    content = content.replace(/http:\/\/localhost:8000/g, '');

    // Replace axios.get, axios.post, etc. with API.get, etc.
    content = content.replace(/axios\./g, 'API.');
    content = content.replace(/axios\(/g, 'API(');

    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated', file);
  }
});
console.log('Total changed:', changedFiles);
