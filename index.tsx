import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Could not find root element to mount to. Please ensure your index.html has a <div id='root'></div>.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Startup Error</h1><p>${errorMsg}</p></div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("React Mounting Error:", err);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>Application Crash</h1><p>${err instanceof Error ? err.message : 'Unknown error'}</p></div>`;
  }
}