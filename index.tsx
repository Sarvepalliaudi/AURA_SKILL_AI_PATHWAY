import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// Global error boundary for mounting
const mountApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Failed to render React app:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #ef4444;">Initialization Error</h1>
        <p style="color: #4b5563;">The application encountered a critical error during startup.</p>
        <pre style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left; display: inline-block; max-width: 90%; overflow: auto;">
          ${err instanceof Error ? err.message : String(err)}
        </pre>
        <div style="margin-top: 20px;">
          <button onclick="window.location.reload()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
};

// Use requestIdleCallback or setTimeout to ensure DOM is ready and modules loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}