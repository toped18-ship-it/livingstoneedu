import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LiveDataProvider } from './lib/liveStore.tsx';
import './index.css';

import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Offline mode disabled per requirement: ensure no service workers cache the application
try {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }

  if (typeof window !== 'undefined' && 'caches' in window) {
    window.caches.keys().then((keys) => {
      for (const key of keys) {
        window.caches.delete(key).catch(() => {});
      }
    }).catch(() => {});
  }
} catch (e) {
  console.warn("ServiceWorker/Cache storage check skipped:", e);
}

// Safely remove initial preloader once JavaScript executes
try {
  const preloader = document.getElementById('app-preloader');
  if (preloader) preloader.remove();
} catch (e) {}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <LiveDataProvider>
          <App />
        </LiveDataProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
