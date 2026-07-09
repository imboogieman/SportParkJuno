import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevents third-party browser extensions (such as MetaMask or other Web3 wallets)
// from throwing unhandled errors inside the sandboxed preview iframe context.
if (typeof window !== 'undefined') {
  const isExtensionError = (msg: string): boolean => {
    const lower = msg.toLowerCase();
    return lower.includes('metamask') || lower.includes('ethereum') || lower.includes('web3');
  };

  const isFirestoreQuotaError = (msg: string, errorObj?: any): boolean => {
    const lower = msg.toLowerCase();
    const errCode = (errorObj && typeof errorObj === 'object' && 'code' in errorObj) ? String(errorObj.code) : '';
    return lower.includes('quota') || lower.includes('resource-exhausted') || errCode === 'resource-exhausted';
  };

  const errorHandler = (event: ErrorEvent) => {
    if (isExtensionError(event.message || '') || isExtensionError(event.error?.message || '')) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isFirestoreQuotaError(event.message || '', event.error)) {
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    }
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = (reason && (reason.message || String(reason))) || '';
    if (isExtensionError(msg)) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isFirestoreQuotaError(msg, reason)) {
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    }
  };

  // Intercept console.error and console.warn to capture Firestore SDK internal quota messages
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const msg = args.map(arg => (arg && typeof arg === 'object' && arg.message) ? arg.message : String(arg)).join(' ');
    if (isFirestoreQuotaError(msg)) {
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const msg = args.map(arg => (arg && typeof arg === 'object' && arg.message) ? arg.message : String(arg)).join(' ');
    if (isFirestoreQuotaError(msg)) {
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    }
    originalConsoleWarn.apply(console, args);
  };

  window.addEventListener('error', errorHandler, true);
  window.addEventListener('unhandledrejection', rejectionHandler, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

