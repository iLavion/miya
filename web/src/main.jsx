import 'react-material-symbols/outlined';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './lib/css/global.css'

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ElectronProvider } from './lib/context/ElectronContext.jsx';
import App from './app.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ElectronProvider>
      <App />
    </ElectronProvider>
  </StrictMode>
);
