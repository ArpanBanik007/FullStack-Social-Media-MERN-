import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Conversations fetch
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/messages/conversations", {
        withCredentials: true,
      });
      return data.conversations;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// Messages fetch
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, cursor }, { rejectWithValue }) => {
    try {
      const url = cursor
        ? `http://localhost:8000/api/v1/messages/${conversationId}?before=${cursor}&limit=30`
        : `http://localhost:8000/api/v1/messages/${conversationId}?limit=30`;
      const { data } = await axios.get(url, { withCredentials: true });
      return { ...data, cursor };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/v1/messages/send", payload, {
        withCredentials: true,
      });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/messages/search-users?q=${query}`,
        { withCredentials: true }
      );
      return data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// React to message
export const reactToMessageAction = createAsyncThunk(
  "chat/reactToMessage",
  async ({ messageId, emoji }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `http://localhost:8000/api/v1/messages/${messageId}/react`,
        { emoji },
        { withCredentials: true }
      );
      return { messageId, reactions: data.reactions };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: [],
    selectedConversation: null,
    onlineUsers: [],
    typingUsers: [],
    hasMore: false,
    nextCursor: null,
    searchResults: [],
    loading: false,
    msgLoading: false,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
      state.messages = [];
      state.nextCursor = null;
      state.hasMore = false;
      state.typingUsers = [];
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addMessage: (state, action) => {
      // Duplicate check
      const exists = state.messages.find(
        (m) => m._id === action.payload._id
      );
      if (!exists) state.messages.push(action.payload);
    },
    updateLastMessage: (state, action) => {
      const { conversationId, preview, lastMessageAt } = action.payload;
      const conv = state.conversations.find(
        (c) => String(c._id) === String(conversationId)
      );
      if (conv) {
        conv.lastMessage = preview;
        conv.lastMessageAt = lastMessageAt;
      }
      // Sort by latest
      state.conversations.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
    },
    setTypingUser: (state, action) => {
      const { userName } = action.payload;
      if (!state.typingUsers.includes(userName)) {
        state.typingUsers.push(userName);
      }
    },
    removeTypingUser: (state, action) => {
      const { userId } = action.payload;
      state.typingUsers = state.typingUsers.filter((u) => u !== userId);
    },
    markMessagesSeenLocally: (state, action) => {
      const { seenBy, currentUserId, chatId } = action.payload;
      if (String(seenBy) !== String(currentUserId)) {
        state.messages = state.messages.map((m) =>
          String(m.senderId?._id) === String(currentUserId)
            ? { ...m, status: "seen" }
            : m
        );
      }

      // Also reset unreadCounts if seenBy === currentUserId
      if (String(seenBy) === String(currentUserId) && chatId) {
        const conv = state.conversations.find((c) => String(c._id) === String(chatId));
        if (conv && conv.unreadCounts) {
           conv.unreadCounts[currentUserId] = 0;
        }
      }
    },
    deleteMessageLocally: (state, action) => {
      const { messageId, deleteFor } = action.payload;
      if (deleteFor === "me") {
        state.messages = state.messages.filter((m) => m._id !== messageId);
      } else {
        state.messages = state.messages.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true } : m
        );
      }
    },
    editMessageLocally: (state, action) => {
      const { messageId, content } = action.payload;
      state.messages = state.messages.map((m) =>
        m._id === messageId ? { ...m, content, isEdited: true } : m
      );
    },
    updateReactions: (state, action) => {
      const { messageId, reactions } = action.payload;
      state.messages = state.messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      );
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateUserPresence: (state, action) => {
      const { userId, lastSeen } = action.payload;
      state.conversations.forEach((conv) => {
        const other = conv.members?.find((m) => String(m._id) === String(userId));
        if (other) {
          other.lastSeen = lastSeen;
        }
      });
      // Update selectedConversation if it's the active one
      if (state.selectedConversation?._other && String(state.selectedConversation._other._id) === String(userId)) {
        state.selectedConversation._other.lastSeen = lastSeen;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.msgLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { messages, hasMore, nextCursor, cursor } = action.payload;
        state.messages = cursor
          ? [...messages, ...state.messages]
          : messages;
        state.hasMore = hasMore;
        state.nextCursor = nextCursor;
        state.msgLoading = false;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.msgLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const exists = state.messages.find(
          (m) => m._id === action.payload._id
        );
        if (!exists) state.messages.push(action.payload);

        if (state.selectedConversation && !state.selectedConversation._id) {
          state.selectedConversation._id = action.payload.chatId;
          state.selectedConversation.isNew = false;
        }
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(reactToMessageAction.fulfilled, (state, action) => {
        const { messageId, reactions } = action.payload;
        state.messages = state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        );
      });
  },
});

export const {
  setSelectedConversation,
  setOnlineUsers,
  addMessage,
  updateLastMessage,
  setTypingUser,
  removeTypingUser,
  markMessagesSeenLocally,
  deleteMessageLocally,
  editMessageLocally,
  updateReactions,
  clearSearchResults,
  updateUserPresence,
} = chatSlice.actions;

export default chatSlice.reducer;