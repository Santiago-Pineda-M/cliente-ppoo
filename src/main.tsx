import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/Infrastructure/UI/App';
import '@/Infrastructure/UI/styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('No existe #root en index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
