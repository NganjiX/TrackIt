import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StarterQuestionsProps {
  suggestions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

/**
 * Clickable starter questions for the AI assistant (AI-03).
 */
export function StarterQuestions({ suggestions, onSelect, disabled }: StarterQuestionsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-gold" />
        {t('assistant.starterPrompt')}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            className="text-left h-auto py-2 px-3 whitespace-normal"
            onClick={() => onSelect(question)}
            disabled={disabled}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
