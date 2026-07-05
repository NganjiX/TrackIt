import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: ChatBubble[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
}

/**
 * Chat interface for the AI assistant (AI-01).
 */
export function ChatWindow({
  messages,
  input,
  onInputChange,
  onSend,
  isSending,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSending) onSend();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[400px] glass-card rounded-xl border-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
            <Bot className="h-12 w-12 text-gold mb-4" />
            <p className="font-medium text-foreground mb-1">{t('assistant.welcome')}</p>
            <p className="text-sm max-w-md">{t('assistant.welcomeDesc')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-gold-700 dark:text-gold" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-navy text-white'
                  : 'bg-muted/50 text-foreground',
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-navy dark:text-navy-200" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-gold" />
            </div>
            <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              {t('assistant.thinking')}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('assistant.inputPlaceholder')}
          disabled={isSending}
        />
        <Button type="submit" variant="gold" disabled={!input.trim() || isSending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
