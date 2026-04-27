const fs = require('fs');
let content = fs.readFileSync('Frontend/src/Chat/chatmainpage.jsx', 'utf8');

const target = /socket\.on\("userOffline", \(\{ userId, lastSeen \}\) => \{\s*dispatch\(updateUserPresence\(\{ userId, lastSeen \}\)\);\s*\}\);\s*\/\/ Conversations load করো\s*dispatch\(fetchConversations\(\)\);\s*return \(\) => \{\s*socket\.off\("newMessageNotification"\);\s*socket\.off\("userOffline"\);\s*\};/;

const replacement = `socket.on("user-status", ({ userId, isOnline, lastSeen }) => {
      dispatch(updateUserPresence({ userId, isOnline, lastSeen }));
    });

    socket.on("onlineUsers", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    // Conversations load করো
    dispatch(fetchConversations());

    return () => {
      socket.off("newMessageNotification");
      socket.off("user-status");
      socket.off("onlineUsers");
    };`;

if (target.test(content)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('Frontend/src/Chat/chatmainpage.jsx', content);
    console.log('Successfully updated chatmainpage.jsx');
} else {
    console.log('Could not find target block');
}
