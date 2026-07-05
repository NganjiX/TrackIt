import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { Button } from '@/components/ui/button';
import { ChatWindow, type ChatBubble } from '@/components/assistant/ChatWindow';
import { StarterQuestions } from '@/components/assistant/StarterQuestions';
import { assistantApi } from '@/features/assistant/api/assistant.api';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * AI Assistant chat page with grounded business advice (AI-01..05).
 */
export function AssistantPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const language = (i18n.language === 'rw' ? 'rw' : 'en') as 'en' | 'rw';

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');

  const { data: suggestionsData } = useQuery({
    queryKey: ['assistant', 'suggestions', language],
    queryFn: () => assistantApi.getSuggestions(language),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['assistant', 'sessions'],
    queryFn: assistantApi.listSessions,
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      assistantApi.chat({ message, sessionId, language }),
    onSuccess: (data, message) => {
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', content: message },
        { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply },
      ]);
      setInput('');
      queryClient.invalidateQueries({ queryKey: ['assistant', 'sessions'] });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const loadSession = async (id: string) => {
    try {
      const { data } = await assistantApi.getMessages(id);
      setSessionId(id);
      setMessages(
        data.map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })),
      );
    } catch (e) {
      toast({ variant: 'destructive', title: (e as ApiError).message });
    }
  };

  const startNewChat = () => {
    setSessionId(undefined);
    setMessages([]);
    setInput('');
  };

  const sendMessage = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || chatMutation.isPending) return;
    chatMutation.mutate(message);
  };

  return (
    <div>
      <PageHeader
        title={t('pages.assistant')}
        actions={
          <Button variant="outline" size="sm" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
            {t('assistant.newChat')}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {sessionsData?.data.length ? (
          <div className="hidden lg:block space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              {t('assistant.recentChats')}
            </p>
            {sessionsData.data.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => loadSession(session.id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-start gap-2 ${
                  sessionId === session.id ? 'bg-muted/50' : ''
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="line-clamp-2">{session.preview || t('assistant.newChat')}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          {messages.length === 0 && suggestionsData?.suggestions && (
            <StarterQuestions
              suggestions={suggestionsData.suggestions}
              onSelect={sendMessage}
              disabled={chatMutation.isPending}
            />
          )}
          <ChatWindow
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={() => sendMessage()}
            isSending={chatMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
