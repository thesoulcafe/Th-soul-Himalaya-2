import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Suppress potential MetaMask/Web3 injected errors that might be misreported in AI Studio environment
if (typeof window !== 'undefined') {
  const suppressInjectedErrors = (e: ErrorEvent | PromiseRejectionEvent) => {
    const msg = ('message' in e ? e.message : String(e.reason))?.toLowerCase() || '';
    if (msg.includes('metamask') || msg.includes('ethereum') || msg.includes('web3')) {
      e.stopImmediatePropagation();
      if ('preventDefault' in e) e.preventDefault();
      return true;
    }
  };
  window.addEventListener('error', suppressInjectedErrors, true);
  window.addEventListener('unhandledrejection', suppressInjectedErrors, true);

  // Also monkey-patch console methods for specific strings
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const isIgnorable = (args: any[]) => {
    const msg = args.map(arg => String(arg)).join(' ').toLowerCase();
    return msg.includes('metamask') || 
           msg.includes('ethereum') || 
           msg.includes('web3') || 
           msg.includes('failed to connect to metamask');
  };

  console.error = (...args: any[]) => {
    if (isIgnorable(args)) return;
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (isIgnorable(args)) return;
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
