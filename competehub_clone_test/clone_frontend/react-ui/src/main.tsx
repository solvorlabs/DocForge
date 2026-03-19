import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import { SocketProvider } from './contexts/SocketContext.tsx';
import { GameProvider } from './contexts/GameContext.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

const mantineTheme = createTheme({
  fontFamily: 'Geist Variable, sans-serif',
  primaryColor: 'violet',
  colors: {
    violet: [
      '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc',
      '#a855f7', '#9333ea', '#7c3aed', '#6d28d9',
      '#5b21b6', '#4c1d95',
    ],
  },
});

document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UserProvider>
            <SocketProvider>
              <GameProvider>
                <Toaster
                  position="top-right"
                  theme="dark"
                  richColors
                  toastOptions={{
                    style: {
                      background: 'oklch(0.14 0.025 280)',
                      border: '1px solid oklch(0.35 0.04 280 / 0.4)',
                      color: 'oklch(0.92 0.01 270)',
                    },
                  }}
                />
                <App />
              </GameProvider>
            </SocketProvider>
          </UserProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>
);
