import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductLanding } from './components/ProductLanding';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductLanding />
  </StrictMode>,
);
