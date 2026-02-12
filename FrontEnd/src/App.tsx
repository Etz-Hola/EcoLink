import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-id';

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <WalletProvider>
              <AppProvider>
                <Router>
                  <Toaster position="top-right" />
                  <AppRoutes />
                </Router>
              </AppProvider>
            </WalletProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;