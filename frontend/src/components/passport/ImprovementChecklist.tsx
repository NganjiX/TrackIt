import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ImprovementChecklistItem } from '@/features/passport/api/passport.api';

interface ImprovementChecklistProps {
  items: ImprovementChecklistItem[];
}

/**
 * Server-computed improvement checklist (PASS-04).
 */
export function ImprovementChecklist({ items }: ImprovementChecklistProps) {
  const { t } = useTranslation();
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{t('passport.improvementChecklist')}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3 text-sm',
                item.completed ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 shrink-0" />
              )}
              <span>{t(`passport.checklist.${item.id}`)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
