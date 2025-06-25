import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 40, color: 'red' }}>Something went wrong: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <ErrorBoundary>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/manager" element={
                  <PrivateRoute role="manager">
                    <ManagerDashboard />
                  </PrivateRoute>
                } />
                <Route path="/employee" element={
                  <PrivateRoute role="employee">
                    <EmployeeDashboard />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
