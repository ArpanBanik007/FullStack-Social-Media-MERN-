const fs = require('fs');
let content = fs.readFileSync('Frontend/src/slices/chat.slice.js', 'utf8');

const target = /updateUserPresence: \(state, action\) => \{[\s\S]*?if \(state\.selectedConversation\?\._other && String\(state\.selectedConversation\._other\._id\) === String\(userId\)\) \{\s*state\.selectedConversation\._other\.lastSeen = lastSeen;\s*\}\s*\}/;

const replacement = `updateUserPresence: (state, action) => {
      const { userId, lastSeen, isOnline } = action.payload;
      
      if (isOnline !== undefined) {
        if (isOnline) {
          if (!state.onlineUsers.includes(userId)) state.onlineUsers.push(userId);
        } else {
          state.onlineUsers = state.onlineUsers.filter(id => String(id) !== String(userId));
        }
      }

      state.conversations.forEach((conv) => {
        const other = conv.members?.find((m) => String(m._id) === String(userId));
        if (other && lastSeen) {
          other.lastSeen = lastSeen;
        }
      });
      // Update selectedConversation if it's the active one
      if (state.selectedConversation?._other && String(state.selectedConversation._other._id) === String(userId) && lastSeen) {
        state.selectedConversation._other.lastSeen = lastSeen;
      }
    }`;

if (target.test(content)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('Frontend/src/slices/chat.slice.js', content);
    console.log('Successfully updated updateUserPresence');
} else {
    console.log('Could not find target block');
}
