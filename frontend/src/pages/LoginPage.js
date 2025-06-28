import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { safeEnqueueSnackbar } from '../utils/safeSnackbar';
import { useAuth } from '../AuthContext';
//import { safeText } from '../utils/safeText';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();

  const decodePayload = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send as x-www-form-urlencoded, not JSON
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const res = await axios.post('http://localhost:8000/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const { access_token } = res.data;

      login(access_token); // Use context login to set token and user

      // decode the payload safely
      const payload = decodePayload(access_token);
      if (!payload || !payload.role) {
        safeEnqueueSnackbar(enqueueSnackbar, 'Invalid token received', { variant: 'error' });
        return;
      }

      safeEnqueueSnackbar(enqueueSnackbar, 'Login successful!', { variant: 'success' });
      setTimeout(() => {
        if (payload.role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/employee');
        }
      }, 0);
    } catch (err) {
      safeEnqueueSnackbar(enqueueSnackbar, 'Invalid credentials', { variant: 'error' });
    } finally {
      setLoading(false);  // ensures spinner stops even on error
    }
  };

  
  return (
    <Box position="relative" minHeight="100vh" width="100vw" sx={{ overflow: 'hidden', background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
      {/* Decorative SVG wave background */}
      <Box position="absolute" top={0} left={0} width="100%" zIndex={0}>
        <svg viewBox="0 0 1440 320" width="100%" height="180" style={{ display: 'block' }}>
          <path fill="#fff" fillOpacity="0.7" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,154.7C840,149,960,171,1080,186.7C1200,203,1320,213,1380,218.7L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </Box>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" zIndex={1} position="relative">
        <Typography variant="h3" fontWeight={700} color="#4f2ac3" mb={4} letterSpacing={1}>
          Lightweight Feedback System
        </Typography>
        <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
          <Typography variant="h4" mb={2} align="center" fontWeight={700} color="#4f2ac3">
            Login 
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <Box mt={2} display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage; 