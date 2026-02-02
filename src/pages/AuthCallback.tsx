import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '@/services/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback - explicitly exchange code for session
    // since detectSessionInUrl is disabled to prevent race conditions
    const handleCallback = async () => {
      try {
        // Get the code from URL hash or query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Check for error in callback
        const errorParam = hashParams.get('error') || queryParams.get('error');
        if (errorParam) {
          console.error('Auth callback error:', errorParam);
          navigate('/login');
          return;
        }

        // Try to exchange code for session (PKCE flow)
        const code = queryParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Auth code exchange error:', error);
            navigate('/login');
            return;
          }
        } else {
          // Fallback: check if we have a session already (implicit flow)
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error('Auth callback error:', error);
            navigate('/login');
            return;
          }
        }

        // Successfully authenticated, redirect to home
        navigate('/');
      } catch (error) {
        console.error('Auth callback exception:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography color="text.secondary">Completing sign in...</Typography>
    </Box>
  );
}
