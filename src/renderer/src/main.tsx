import '@renderer/assets/main.css';
import 'highlight.js/styles/github-dark.css';

import App from '@renderer/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
