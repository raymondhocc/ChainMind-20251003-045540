import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { chatService, MODELS } from '@/lib/chat';
import type { Message, SessionInfo } from '../../worker/types';
import { v4 as uuidv4 } from 'uuid';
export type ChatStoreState = {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  messages: Message[];
  streamingMessage: string | null;
  isProcessing: boolean;
  isLoadingHistory: boolean;
  model: string;
  isSidebarOpen: boolean;
};
export type ChatStoreActions = {
  initialize: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  newSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
};
export const useChatStore = create<ChatStoreState & ChatStoreActions>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    streamingMessage: null,
    isProcessing: false,
    isLoadingHistory: true,
    model: MODELS[0].id,
    isSidebarOpen: false, // Default to false for mobile sheet
    initialize: async () => {
      set({ isLoadingHistory: true });
      await get().fetchSessions();
      const sessions = get().sessions;
      if (sessions.length > 0) {
        await get().switchSession(sessions[0].id);
      } else {
        await get().newSession();
      }
      set({ isLoadingHistory: false });
    },
    fetchSessions: async () => {
      const response = await chatService.listSessions();
      if (response.success && response.data) {
        set({ sessions: response.data });
      }
    },
    switchSession: async (sessionId: string) => {
      if (get().activeSessionId === sessionId) return;
      set({ isLoadingHistory: true, activeSessionId: sessionId, messages: [] });
      chatService.switchSession(sessionId);
      const response = await chatService.getMessages();
      if (response.success && response.data) {
        set({
          messages: response.data.messages,
          model: response.data.model,
        });
      }
      set({ isLoadingHistory: false });
    },
    newSession: async () => {
      chatService.newSession();
      const newSessionId = chatService.getSessionId();
      set({
        activeSessionId: newSessionId,
        messages: [],
        streamingMessage: null,
        isProcessing: false,
      });
      // A new session is only created on the backend when the first message is sent.
    },
    deleteSession: async (sessionId: string) => {
      const response = await chatService.deleteSession(sessionId);
      if (response.success) {
        const wasActiveSession = get().activeSessionId === sessionId;
        set(state => {
          state.sessions = state.sessions.filter(s => s.id !== sessionId);
        });
        if (wasActiveSession) {
          const remainingSessions = get().sessions;
          if (remainingSessions.length > 0) {
            await get().switchSession(remainingSessions[0].id);
          } else {
            await get().newSession();
          }
        }
      }
    },
    sendMessage: async (messageContent: string) => {
      if (!messageContent.trim() || get().isProcessing) return;
      const activeSessionId = get().activeSessionId;
      if (!activeSessionId) return;
      set({ isProcessing: true, streamingMessage: '' });
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: messageContent,
        timestamp: Date.now(),
      };
      set((state) => {
        state.messages.push(userMessage);
      });
      const isNewSession = !get().sessions.some(s => s.id === activeSessionId);
      if (isNewSession) {
        await chatService.createSession(undefined, activeSessionId, messageContent);
        await get().fetchSessions();
      }
      await chatService.sendMessage(messageContent, get().model, (chunk) => {
        set((state) => {
          state.streamingMessage = (state.streamingMessage ?? '') + chunk;
        });
      });
      const response = await chatService.getMessages();
      if (response.success && response.data) {
        set({
          messages: response.data.messages,
          model: response.data.model,
        });
      }
      set({ isProcessing: false, streamingMessage: null });
    },
    setModel: async (model: string) => {
      set({ model });
      await chatService.updateModel(model);
    },
    toggleSidebar: () => {
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    },
    setSidebarOpen: (isOpen: boolean) => {
      set({ isSidebarOpen: isOpen });
    },
  }))
);