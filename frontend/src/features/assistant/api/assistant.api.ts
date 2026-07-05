import { apiClient } from '@/lib/api/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  createdAt: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  language: string;
}

export interface ChatSession {
  id: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export const assistantApi = {
  getSuggestions: (language: 'en' | 'rw' = 'en') =>
    apiClient<{ language: string; suggestions: string[] }>(
      `/ai-assistant/suggestions?language=${language}`,
    ),

  chat: (data: { message: string; sessionId?: string; language?: 'en' | 'rw' }) =>
    apiClient<ChatResponse>('/ai-assistant/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listSessions: () =>
    apiClient<{ data: ChatSession[] }>('/ai-assistant/sessions'),

  getMessages: (sessionId: string) =>
    apiClient<{ data: ChatMessage[] }>(`/ai-assistant/sessions/${sessionId}/messages`),
};
