import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Render the main React application into the DOM root element
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
