
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DocumentManager from './components/DocumentManager';
import { Spinner } from './components/icons';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for auth state in localStorage to persist login
    if (localStorage.getItem('isAuthenticated') === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);


  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner className="h-12 w-12 text-cyan-400" />
        </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <DocumentManager onLogout={handleLogout} />;
};

export default App;
