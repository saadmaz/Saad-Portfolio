// This file serves as the main JavaScript entry point for the application.
// It initializes the application, sets up event listeners, and manages routing between different pages.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);