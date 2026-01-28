import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '@/components/SnackbarProvider';
import { AppLayout, AuthLayout, VibeLayout } from '@/layouts';
import {
  Login,
  AuthCallback,
  Settings,
  Screens,
  Components,
  VibePrototyping,
  Context,
  Insights,
  Collaborate,
  SharedView,
  Home,
  Prototypes,
  Integrations,
} from '@/pages';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize, isLoading } = useAuthStore();
  const { config } = useThemeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <ThemeProvider theme={config.muiTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={config.muiTheme}>
        <CssBaseline />
        <SnackbarProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route
                element={
                  <PublicRoute>
                    <AuthLayout />
                  </PublicRoute>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Protected routes with AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Prototypes list */}
                <Route path="/prototypes" element={<Prototypes />} />

                {/* Repository */}
                <Route path="/repository/screens" element={<Screens />} />
                <Route path="/repository/components" element={<Components />} />

                {/* Product Context */}
                <Route path="/context" element={<Context />} />

                {/* Insights (renamed from Analytics) */}
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/:projectId" element={<Insights />} />
                <Route path="/insights/:projectId/:variantId" element={<Insights />} />

                {/* Integrations */}
                <Route path="/integrations" element={<Integrations />} />

                {/* Settings (includes User Management for admins) */}
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Vibe Concepting with VibeLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <VibeLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/prototypes/:projectId" element={<VibePrototyping />} />
              </Route>

              {/* Collaborative view (full-screen) */}
              <Route
                path="/collaborate/:shareLink"
                element={
                  <ProtectedRoute>
                    <Collaborate />
                  </ProtectedRoute>
                }
              />

              {/* Public shared view */}
              <Route path="/view/:shareLink" element={<SharedView />} />

              {/* Auth callback for OAuth */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Legacy routes redirect */}
              <Route path="/screens" element={<Navigate to="/repository/screens" replace />} />
              <Route path="/components" element={<Navigate to="/repository/components" replace />} />
              <Route path="/analytics" element={<Navigate to="/insights" replace />} />
              <Route path="/admin" element={<Navigate to="/settings" replace />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
