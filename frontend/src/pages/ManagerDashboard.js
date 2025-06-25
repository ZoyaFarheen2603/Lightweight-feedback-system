import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, Select, MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useSnackbar } from 'notistack';
import { safeEnqueueSnackbar } from '../utils/safeSnackbar';

const safeText = (val) => (typeof val === 'string' ? val : JSON.stringify(val ?? '-'));

function ManagerDashboard() {
  const { user, logout, token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [form, setForm] = useState({ strengths: '', areas_to_improve: '', sentiment: 'positive' });
  const [formLoading, setFormLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [fulfillLoading, setFulfillLoading] = useState(null);
  const [requestDialog, setRequestDialog] = useState({ open: false, req: null });
  const [formTags, setFormTags] = useState([]);
  const [formTagInput, setFormTagInput] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:8000/dashboard/manager', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeamStats(res.data);
      } catch (err) {
        setError('Failed to fetch team stats');
      }
      setLoading(false);
    };
    fetchStats();
  }, [token]);

  useEffect(() => {
    const fetchRequests = async () => {
      setRequestsLoading(true);
      try {
        const res = await axios.get('http://localhost:8000/feedback-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch {}
      setRequestsLoading(false);
    };
    fetchRequests();
  }, [token]);

  const latestSelectedId = useRef(null);
  const handleSelectMember = async (member) => {
    latestSelectedId.current = member.id;
    setSelectedMember(member);
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await axios.get(`http://localhost:8000/feedback/${member.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (latestSelectedId.current === member.id) {
        setFeedbackList(res.data);
      }
    } catch (err) {
      setFeedbackError('Failed to fetch feedback');
    }
    setFeedbackLoading(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post('http://localhost:8000/feedback', {
        ...form,
        employee_id: selectedMember.id,
        tags: formTags.join(','),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      safeEnqueueSnackbar(enqueueSnackbar, 'Feedback submitted!');
      setForm({ strengths: '', areas_to_improve: '', sentiment: 'positive' });
      setFormTags([]);
      setFormTagInput('');
      handleSelectMember(selectedMember);
    } catch (err) {
      safeEnqueueSnackbar(enqueueSnackbar, 'Failed to submit feedback', { variant: 'error' });
    }
    setFormLoading(false);
  };

  const handleFulfillRequest = (req) => {
    const member = teamStats.find(m => m.id === req.employee_id);
    setSelectedMember(member);
    setForm({ strengths: '', areas_to_improve: '', sentiment: 'positive' });
    setRequestDialog({ open: true, req });
  };

  const handleMarkFulfilled = async () => {
    setFulfillLoading(requestDialog.req.id);
    try {
      await axios.post(`http://localhost:8000/feedback-request/${requestDialog.req.id}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      safeEnqueueSnackbar(enqueueSnackbar, 'Request marked as fulfilled', { variant: 'success' });
      setRequests(requests.filter(r => r.id !== requestDialog.req.id));
      setRequestDialog({ open: false, req: null });
    } catch {
      safeEnqueueSnackbar(enqueueSnackbar, 'Failed to mark as fulfilled', { variant: 'error' });
    }
    setFulfillLoading(null);
  };

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Manager Dashboard</Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>Logged in as: {user?.role} ({user?.user_id})</Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box maxWidth={1000} mx="auto" p={3}>
        <Typography variant="h5" mb={2}>Team Overview</Typography>
        <Box mb={3}>
          <Typography variant="subtitle1" mb={1}>Pending Feedback Requests</Typography>
          {requestsLoading ? (
            <CircularProgress size={24} />
          ) : requests.length === 0 ? (
            <Alert severity="info">No pending requests.</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{teamStats.find(m => m.id === req.employee_id)?.name || req.employee_id}</TableCell>
                      <TableCell>{req.message || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {(req.tags || '').split(',').filter(Boolean).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" startIcon={<AssignmentIcon />} onClick={() => handleFulfillRequest(req)}>
                          Fulfill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Feedback Count</TableCell>
                  <TableCell>Sentiment Trend</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(teamStats) && teamStats.length > 0 ? teamStats.map(member => (
                  <TableRow key={member.id} selected={selectedMember?.id === member.id}>
                    <TableCell>{typeof member.name === 'string' ? member.name : JSON.stringify(member.name)}</TableCell>
                    <TableCell>{typeof member.email === 'string' ? member.email : JSON.stringify(member.email)}</TableCell>
                    <TableCell>{typeof member.feedback_count === 'number' ? member.feedback_count : JSON.stringify(member.feedback_count)}</TableCell>
                    <TableCell>
                      {member.sentiments && typeof member.sentiments === 'object' ? (
                        <>
                          <span style={{ color: 'green' }}>+{String(member.sentiments.positive ?? '0')}</span> /{' '}
                          <span style={{ color: 'orange' }}>{String(member.sentiments.neutral ?? '0')}</span> /{' '}
                          <span style={{ color: 'red' }}>-{String(member.sentiments.negative ?? '0')}</span>
                        </>
                      ) : (typeof member.sentiments === 'string' ? member.sentiments : JSON.stringify(member.sentiments))}
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleSelectMember(member)}>
                        View Feedback
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {selectedMember && (
          <Box mt={4}>
            <Typography variant="h6" mb={2}>Feedback for {typeof selectedMember.name === 'string' ? selectedMember.name : JSON.stringify(selectedMember.name)}</Typography>
            {feedbackLoading ? (
              <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
            ) : feedbackError ? (
              <Alert severity="error">{feedbackError}</Alert>
            ) : feedbackList.length === 0 ? (
              <Alert severity="info">No feedback yet.</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Strengths</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(feedbackList) && feedbackList.length > 0 ? feedbackList.map(fb => (
                      <TableRow key={fb.id}>
                        <TableCell>{fb.created_at ? new Date(fb.created_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>{typeof fb.strengths === 'string' ? fb.strengths : JSON.stringify(fb.strengths)}</TableCell>
                      </TableRow>
                    )) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" mb={1}>Submit New Feedback</Typography>
              <form onSubmit={handleFormSubmit}>
                <TextField
                  label="Strengths"
                  name="strengths"
                  value={form.strengths}
                  onChange={handleFormChange}
                  required
                  multiline
                  minRows={2}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Areas to Improve"
                  name="areas_to_improve"
                  value={form.areas_to_improve}
                  onChange={handleFormChange}
                  required
                  multiline
                  minRows={2}
                  fullWidth
                  margin="normal"
                />
                <Select
                  name="sentiment"
                  value={form.sentiment}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  margin="normal"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                </Select>
                <TextField
                  label="Add Tag"
                  value={formTagInput}
                  onChange={e => setFormTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && formTagInput.trim()) {
                      setFormTags([...formTags, formTagInput.trim()]);
                      setFormTagInput('');
                      e.preventDefault();
                    }
                  }}
                  fullWidth
                  size="small"
                  margin="normal"
                />
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                  {formTags.map((tag, idx) => (
                    <Chip key={idx} label={tag} onDelete={() => setFormTags(formTags.filter((_, i) => i !== idx))} size="small" />
                  ))}
                </Stack>
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" color="primary" disabled={formLoading}>
                    {formLoading ? <CircularProgress size={20} /> : 'Submit Feedback'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Box>
        )}
      </Box>
      <Dialog open={requestDialog.open} onClose={() => setRequestDialog({ open: false, req: null })}>
        <DialogTitle>Fulfill Feedback Request</DialogTitle>
        <DialogContent>
        <Typography variant="body2" mb={1}>
  <strong>Employee:</strong> {safeText(teamStats.find(m => m.id === requestDialog.req?.employee_id)?.name)}
</Typography>
<Typography variant="body2" mb={1}>
  <strong>Message:</strong> {safeText(requestDialog.req?.message)}
</Typography>

          <Stack direction="row" spacing={1} mb={2}>
            {(requestDialog.req?.tags || '').split(',').filter(Boolean).map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" />
            ))}
          </Stack>
          <Alert severity="info">Fill out the feedback form below, then mark this request as fulfilled.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog({ open: false, req: null })}>Cancel</Button>
          <Button onClick={handleMarkFulfilled} variant="contained" disabled={fulfillLoading}>
            {fulfillLoading ? <CircularProgress size={18} /> : 'Mark as Fulfilled'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManagerDashboard; 