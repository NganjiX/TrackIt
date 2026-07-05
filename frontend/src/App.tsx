import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router';
import { Providers } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';

/**
 * Root application component.
 */
export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </Providers>
  );
}
