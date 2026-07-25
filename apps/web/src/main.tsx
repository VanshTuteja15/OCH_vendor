import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { AuthTokenBridge } from './components/AuthTokenBridge';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function MissingClerkKey() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-xl font-bold text-och-blue mb-2">Clerk not configured</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Add <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code>{' '}
          to <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">apps/web/.env</code>, then restart
          the web dev server.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <QueryClientProvider client={queryClient}>
          <AuthTokenBridge>
            <App />
          </AuthTokenBridge>
        </QueryClientProvider>
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>
);
