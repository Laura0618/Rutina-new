import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/archivo/wdth.css';
import App from './App';
import { SyncProvider } from './store/SyncProvider';
import { TimerProvider } from './store/TimerProvider';
import './index.css';

registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento #root.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SyncProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </SyncProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
