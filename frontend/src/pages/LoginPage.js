import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { safeEnqueueSnackbar } from '../utils/safeSnackbar';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      const res = await axios.post('http://localhost:8000/auth/login', form);
      const { access_token } = res.data;
  
      localStorage.setItem('token', access_token);
  
      // decode the payload safely
      const payload = decodePayload(access_token);
      if (!payload || !payload.role) {
        safeEnqueueSnackbar(enqueueSnackbar, 'Invalid token received', { variant: 'error' });
        return;
      }
  
      safeEnqueueSnackbar(enqueueSnackbar, 'Login successful!', { variant: 'success' });
      if (payload.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      safeEnqueueSnackbar(enqueueSnackbar, 'Invalid credentials', { variant: 'error' });
    } finally {
      setLoading(false);  // ensures spinner stops even on error
    }
  };

  
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
    <h1>Login Page</h1>  {/* DEBUG: remove this after test */}
    <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2} align="center">Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Box mt={2} display="flex" justifyContent="center">
            <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default LoginPage; 