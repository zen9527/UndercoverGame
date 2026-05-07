import React from 'react';
import ReactDOM from 'react-dom/client';
import HostApp from './HostApp';
import '../shared/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HostApp />
  </React.StrictMode>
);
