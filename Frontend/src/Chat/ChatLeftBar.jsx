import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { searchUsers, clearSearchResults } from "../slices/chat.slice";
import ChatOnlineBar from "./ChatOnlineBar";

function ChatLeftBar({ conversations = [], onSelectChat, selectedId }) {
  const [search, setSearch] = useState("");
  const searchTimeout = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, onlineUsers } = useSelector((state) => state.chat);

  const isOnline = (userId) => onlineUsers.some((u) => String(u._id || u) === String(userId));

  // Debounced search
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.length >= 2) {
      searchTimeout.current = setTimeout(() => dispatch(searchUsers(val)), 400);
    } else {
      dispatch(clearSearchResults());
    }
  };

  // Search mode চলছে কিনা
  const isSearching = search.length >= 2;

  // Conversation list এ online status inject করো
  const enrichedConversations = conversations.map((conv) => ({
    ...conv,
    online: isOnline(conv._other?._id),
  }));

  const filtered = enrichedConversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .chat-leftbar {
          font-family: 'DM Sans', sans-serif;
          width: 320px;
          height: 100%;
          background: #111827;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .chat-leftbar-header { padding: 20px 16px 12px; flex-shrink: 0; }
        .chat-leftbar-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; }
        .chat-search {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 9px 14px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .chat-search::placeholder { color: rgba(255,255,255,0.25); }
        .chat-search:focus { border-color: rgba(6,182,212,0.4); }
        .chat-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .chat-list::-webkit-scrollbar { width: 4px; }
        .chat-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .conv-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
          margin-bottom: 2px;
        }
        .conv-item:hover { background: rgba(255,255,255,0.05); }
        .conv-item.selected { background: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.2); }
        .conv-avatar-wrap { position: relative; flex-shrink: 0; }
        .conv-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.06); }
        .conv-online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 11px; height: 11px;
          background: #22c55e; border-radius: 50%;
          border: 2px solid #111827;
          box-shadow: 0 0 5px rgba(34,197,94,0.6);
        }
        .conv-body { flex: 1; min-width: 0; }
        .conv-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
        .conv-name { font-size: 14px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; max-width: 160px; text-overflow: ellipsis; }
        .conv-time { font-size: 11px; color: rgba(255,255,255,0.25); flex-shrink: 0; }
        .conv-bottom { display: flex; justify-content: space-between; align-items: center; }
        .conv-msg { font-size: 12px; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
        .conv-msg.unread-msg { color: rgba(255,255,255,0.75); font-weight: 600; }
        .conv-badge { background: #06b6d4; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0; }
        .conv-empty { text-align: center; color: rgba(255,255,255,0.2); font-size: 13px; padding: 32px 16px; }
        .conv-seen-text { font-size: 11px; color: rgba(255,255,255,0.4); flex-shrink: 0; }
        .search-section-label { font-size: 11px; color: rgba(255,255,255,0.25); padding: 8px 12px 4px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
      `}</style>

      <div className="chat-leftbar">
        <div className="chat-leftbar-header">
          <div className="chat-leftbar-title">Messages</div>
          <input
            className="chat-search"
            placeholder="Search people or conversations..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Online users strip — search না করলে দেখাবে */}
        {!isSearching && <ChatOnlineBar />}

        <div className="chat-list">
          {isSearching && filtered.length > 0 && <div className="search-section-label">Conversations</div>}
          
          {(!isSearching && filtered.length === 0) ? (
            <div className="conv-empty">No conversations found</div>
          ) : (isSearching && filtered.length === 0 && searchResults.length === 0) ? (
            <div className="conv-empty">No results found</div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                className={`conv-item ${
                  selectedId === conv.id ? "selected" : ""
                }`}
                onClick={() => onSelectChat(conv)}
              >
                <div className="conv-avatar-wrap">
                  <img
                    className="conv-avatar"
                    src={conv.avatar}
                    alt={conv.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      const userId = conv._other?._id || conv.receiverId;
                      if(userId) navigate(`/profile/${userId}`);
                    }}
                  />
                  {conv.online && <div className="conv-online-dot" />}
                </div>
                <div className="conv-body">
                  <div className="conv-top">
                    <span className="conv-name">{conv.name}</span>
                    <span className="conv-time">{conv.time}</span>
                  </div>
                  <div className="conv-bottom">
                    <span
                      className={`conv-msg ${
                        conv.unread > 0 ? "unread-msg" : ""
                      }`}
                    >
                      {conv.lastMsg}
                    </span>
                    {conv.unread > 0 ? (
                      <span className="conv-badge">{conv.unread}</span>
                    ) : (
                      <span className="conv-seen-text">Seen</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Search results */}
          {isSearching && searchResults.length > 0 && (
            <>
              <div className="search-section-label">People</div>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="conv-item"
                  onClick={() => {
                    // Check if conversation already exists
                    const existingConv = conversations.find(c => String(c._other?._id) === String(user._id));

                    if (existingConv) {
                      onSelectChat(existingConv);
                    } else {
                      // নতুন conversation শুরু করবে — receiverId হিসেবে pass
                      onSelectChat({
                        _id: null,
                        id: null,
                        receiverId: user._id,
                        name: user.fullName || user.name || user.username || "Unknown",
                        avatar: user.avatar || "/default-avatar.png",
                        online: isOnline(user._id),
                        _other: user,
                        isNew: true,
                      });
                    }
                    setSearch("");
                    dispatch(clearSearchResults());
                  }}
                >
                  <div className="conv-avatar-wrap">
                    <img
                      className="conv-avatar"
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.fullName || user.name || user.username}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user._id}`);
                      }}
                    />
                    {isOnline(user._id) && <div className="conv-online-dot" />}
                  </div>
                  <div className="conv-body">
                    <div className="conv-top">
                      <span className="conv-name">{user.fullName || user.name || user.username || "Unknown"}</span>
                    </div>
                    <div className="conv-bottom">
                      <span className="conv-msg">@{user.username || user.email.split('@')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatLeftBar;
