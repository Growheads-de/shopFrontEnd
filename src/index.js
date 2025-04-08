import { createRoot } from 'react-dom/client';
import { lazy } from 'react';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

const App = lazy(() => import('./App.js'));


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<BrowserRouter><App /></BrowserRouter>); 
