import React from 'react';
import {createRoot} from 'react-dom/client';
import '@crema/services';
import App from './App';
import {installDynamicImportRecovery} from './utils/dynamicImportRecovery';

installDynamicImportRecovery();

const root = createRoot(document.getElementById('root'));
root.render(<App />);
