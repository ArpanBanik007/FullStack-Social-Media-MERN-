const fs = require('fs');
let content = fs.readFileSync('Frontend/src/Chat/ChattingPage.jsx', 'utf8');

const targetImport = /import \{ useNavigate \} from "react-router-dom";/;
if (!content.includes('import { getSocket } from "../socket.js";')) {
    content = content.replace(targetImport, 'import { useNavigate } from "react-router-dom";\nimport { getSocket } from "../socket.js";');
}

const targetEffect = /API\.put\(\`\/messages\/seen\/\$\{conversation\._id\}\`, \{\}, \{\s*withCredentials: true\s*\}\)\.catch\(err => console\.error\("Failed to mark messages as seen:", err\)\);/;

const replacementEffect = `const socket = getSocket();
      if (socket) {
        socket.emit("messageSeen", { chatId: conversation._id });
      }`;

if (targetEffect.test(content)) {
    content = content.replace(targetEffect, replacementEffect);
    fs.writeFileSync('Frontend/src/Chat/ChattingPage.jsx', content);
    console.log('Successfully updated ChattingPage.jsx');
} else {
    console.log('Could not find target block');
}
