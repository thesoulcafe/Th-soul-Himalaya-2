import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Suppress potential MetaMask/Web3 injected errors that might be misreported in AI Studio environment
if (typeof window !== 'undefined') {
  const isWeb3Error = (msg: string) => {
    const lowerMsg = String(msg).toLowerCase();
    return lowerMsg.includes('metamask') || 
           lowerMsg.includes('ethereum') || 
           lowerMsg.includes('web3') || 
           lowerMsg.includes('failed to connect') ||
           lowerMsg.includes('wallet') ||
           lowerMsg.includes('inpage.js');
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
  
  // Also suppress console errors that might trigger UI notifications
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const msg = args.join(' ');
    if (isWeb3Error(msg)) return;
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('error', suppressInjectedErrors, true);
  window.addEventListener('unhandledrejection', suppressInjectedErrors, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
