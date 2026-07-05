import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { passportApi } from '@/features/passport/api/passport.api';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

interface SharePassportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to generate and copy a shareable passport link (PASS-05).
 */
export function SharePassportDialog({ open, onOpenChange }: SharePassportDialogProps) {
  const { t } = useTranslation();
  const [shareUrl, setShareUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState(7);

  const mutation = useMutation({
    mutationFn: () => passportApi.createShareLink(days),
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      setExpiresAt(data.expiresAt);
      setCopied(false);
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: t('passport.linkCopied') });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t('passport.shareLink')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('passport.expiresIn')}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-sm text-white"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7} className="bg-[#111111] text-white">7 {t('passport.days')}</option>
              <option value={14} className="bg-[#111111] text-white">14 {t('passport.days')}</option>
              <option value={30} className="bg-[#111111] text-white">30 {t('passport.days')}</option>
            </select>
          </div>

          {!shareUrl ? (
            <Button
              variant="gold"
              className="w-full"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {t('passport.generateLink')}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t('passport.shareUrl')}</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {t('passport.expiresAt', {
                      date: new Date(expiresAt).toLocaleDateString(),
                    })}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
