
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DocumentManager from './components/DocumentManager';
import OfflineBanner from './components/OfflineBanner';
import { Spinner } from './components/icons';

const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen text-cyan-400">
      <div className="text-2xl font-bold animate-pulse">SYSTEM_BOOT_SUCCESSFUL</div>
    </div>
  );
};

export default App;
