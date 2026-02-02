import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '@/services/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    // detectSessionInUrl: true handles the token exchange automatically
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login');
          return;
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
