import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Debounced search with premium styling. */
export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(timer);
  }, [local, onChange]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className={`relative flex-1 max-w-md ${className ?? ''}`}>
      <MaterialIcon
        name="search"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none"
      />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        className="pl-10 bg-white/80 border-outline-variant/60 focus-visible:ring-secondary-fixed/30"
      />
    </div>
  );
}
