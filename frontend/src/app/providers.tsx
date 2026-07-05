import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUiStore } from '@/store/ui.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers: React Query, theme initialization.
 */
export function Providers({ children }: ProvidersProps) {
  const { theme, setTheme } = useUiStore();

  useEffect(() => {
    setTheme(theme);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
