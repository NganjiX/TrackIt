import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type CreateDocumentPayload,
  type DocumentCategory,
} from '@/features/documents/api/documents.api';

const schema = z.object({
  name: z.string().min(2),
  category: z.enum(['receipt', 'invoice', 'bill', 'contract', 'payment_proof', 'other']),
  date: z.string().min(1),
  amount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DocumentUploadFormProps {
  onSubmit: (file: File, data: CreateDocumentPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for uploading a document with metadata (DOC-01, DOC-02).
 */
export function DocumentUploadForm({ onSubmit, onCancel, isSubmitting }: DocumentUploadFormProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'receipt',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectClass = 'flex h-10 w-full rounded-md border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-sm text-white';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(selected.type)) {
      setFileError(t('documents.invalidType'));
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError(t('documents.fileTooLarge'));
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleFormSubmit = (data: FormValues) => {
    if (!file) {
      setFileError(t('documents.fileRequired'));
      return;
    }
    onSubmit(file, {
      name: data.name,
      category: data.category as DocumentCategory,
      fileKey: '',
      mimeType: file.type,
      fileSize: file.size,
      date: data.date,
      amount: data.amount,
      notes: data.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('documents.file')}</Label>
        <Input type="file" accept={ALLOWED_FILE_TYPES.join(',')} onChange={handleFileChange} />
        {file && (
          <p className="text-xs text-muted-foreground">
            {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t('documents.name')}</Label>
        <Input {...register('name')} placeholder={t('documents.namePlaceholder')} />
        {errors.name?.message && (
          <p className="text-xs text-destructive">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('documents.category')}</Label>
          <select {...register('category')} className={selectClass}>
            {(['receipt', 'invoice', 'bill', 'contract', 'payment_proof', 'other'] as const).map((cat) => (
              <option key={cat} value={cat} className="bg-[#111111] text-white">{t(`documents.categories.${cat}`)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>{t('documents.date')}</Label>
          <Input type="date" {...register('date')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('documents.amount')}</Label>
        <Input type="number" step="0.01" {...register('amount')} placeholder={t('documents.amountOptional')} />
      </div>

      <div className="space-y-2">
        <Label>{t('documents.notes')}</Label>
        <Input {...register('notes')} placeholder={t('documents.notesPlaceholder')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="gold" disabled={isSubmitting}>{t('documents.upload')}</Button>
      </div>
    </form>
  );
}
