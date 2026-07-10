import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Suppress potential MetaMask/Web3 injected errors that might be misreported in AI Studio environment
if (typeof window !== 'undefined') {
  const isWeb3Error = (msg: string) => {
    const lowerMsg = msg.toLowerCase();
    return lowerMsg.includes('metamask') || 
           lowerMsg.includes('ethereum') || 
           lowerMsg.includes('web3') || 
           lowerMsg.includes('failed to connect') ||
           lowerMsg.includes('wallet');
  };

  const suppressInjectedErrors = (e: ErrorEvent | PromiseRejectionEvent) => {
    let msg = '';
    if ('message' in e) {
      msg = e.message || '';
    } else if ('reason' in e && e.reason) {
      msg = typeof e.reason === 'string' ? e.reason : (e.reason.message || String(e.reason));
    }
    
    if (isWeb3Error(msg)) {
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
    try {
      const msg = args.map(arg => {
        if (!arg) return '';
        if (typeof arg === 'string') return arg;
        if (arg.message) return arg.message;
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch { return String(arg); }
        }
        return String(arg);
      }).join(' ');
      
      return isWeb3Error(msg);
    } catch (err) {
      return false;
    }
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
