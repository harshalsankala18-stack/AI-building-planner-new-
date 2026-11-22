import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handlers to display any uncaught runtime exceptions visibly
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global window.onerror caught:', message, source, lineno, colno, error);
  const container = document.getElementById('studio-global-error-banner');
  if (!container) {
    const banner = document.createElement('div');
    banner.id = 'studio-global-error-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:999999;background:#991b1b;color:#ffffff;padding:12px 16px;font-family:monospace;font-size:12px;white-space:pre-wrap;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
    banner.innerText = `[Pascal Studio Runtime Error]\n${String(message)}\nat ${source}:${lineno}:${colno}`;
    document.body.appendChild(banner);
  }
};

window.onunhandledrejection = (event) => {
  console.error('Global onunhandledrejection caught:', event.reason);
  const container = document.getElementById('studio-global-error-banner');
  if (!container) {
    const banner = document.createElement('div');
    banner.id = 'studio-global-error-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:999999;background:#991b1b;color:#ffffff;padding:12px 16px;font-family:monospace;font-size:12px;white-space:pre-wrap;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
    banner.innerText = `[Pascal Studio Unhandled Rejection]\n${event.reason?.stack || event.reason?.message || String(event.reason)}`;
    document.body.appendChild(banner);
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
