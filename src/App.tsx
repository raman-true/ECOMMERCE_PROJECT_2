import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppRoutes } from './AppRoutes'; // Import the new AppRoutes component
import { initializeStorageBuckets } from './lib/storage';
import { logSetupVerification } from './utils/setupVerification';

function App() {
  useEffect(() => {
    // Initialize storage buckets on app start
    initializeStorageBuckets().catch(console.error);
    
    // Verify setup in development mode
    if (import.meta.env.DEV) {
      setTimeout(() => {
        logSetupVerification().catch(console.error);
      }, 2000); // Wait 2 seconds for initialization
    }
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes /> {/* Render AppRoutes here */}
      </BrowserRouter>
    </AppProvider>
  );
}




export default App;
