import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import AppRouter from './router/AppRouter';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { isDark } = useContext(ThemeContext);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#334155',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          },
          success: {
            style: {
              background: isDark ? '#064e3b' : '#ecfdf5',
              color: isDark ? '#6ee7b7' : '#065f46',
              border: `1px solid ${isDark ? '#065f46' : '#a7f3d0'}`,
            },
            iconTheme: { primary: '#10b981', secondary: isDark ? '#064e3b' : '#ecfdf5' },
          },
          error: {
            style: {
              background: isDark ? '#7f1d1d' : '#fef2f2',
              color: isDark ? '#fca5a5' : '#991b1b',
              border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`,
            },
            iconTheme: { primary: '#ef4444', secondary: isDark ? '#7f1d1d' : '#fef2f2' },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
