// src/pages/ManagerDashboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, TextField, Select, MenuItem,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

function ManagerDashboard() {
  const { user, logout, token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, feedbackId: null });
  const [editDialog, setEditDialog] = useState({ open: false, feedback: null });

  const [formTags, setFormTags] = useState([]);
  const [formTagInput, setFormTagInput] = useState('');

  const latestSelectedId = useRef(null);

  // Fetch team stats
  const fetchTeamStats = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${config.endpoints.dashboard}/manager`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamStats(res.data);
    } catch {
      setError('Failed to fetch team stats');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token || !user) return; // Wait until both are available
    fetchTeamStats();
  }, [token, user]);

  // Fetch feedback requests
  useEffect(() => {
    (async () => {
      setRequestsLoading(true);
      try {
        const res = await axios.get(config.endpoints.feedbackRequests, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch { }
      setRequestsLoading(false);
    })();
  }, [token]);

  // Fetch user feedback
  const handleSelectMember = async (member) => {
    latestSelectedId.current = member.id;
    setSelectedMember(member);
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await axios.get(`${config.endpoints.feedback}/${member.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (latestSelectedId.current === member.id) {
        setFeedbackList(res.data);
      }
    } catch {
      setFeedbackError('Failed to fetch feedback');
    }
    setFeedbackLoading(false);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    setFormLoading(true);
    try {
      await axios.post(config.endpoints.feedback, {
        ...form,
        employee_id: selectedMember.id,
        tags: formTags.join(',')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Feedback submitted!', { variant: 'success' });
      setForm({ strengths: '', areas_to_improve: '', sentiment: 'positive' });
      setFormTags([]);
      await handleSelectMember(selectedMember);
      await fetchTeamStats();
    } catch {
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
    setFormLoading(false);
  };

  const handleFulfillRequest = (req) => {
    const member = teamStats.find(m => m.id === req.employee_id) || null;
    setSelectedMember(member);
    setForm({ strengths: '', areas_to_improve: '', sentiment: 'positive' });
    setRequestDialog({ open: true, req });
  };

  const handleMarkFulfilled = async () => {
    if (!requestDialog.req) return;

    setFulfillLoading(requestDialog.req.id);
    try {
      await axios.post(
        `${config.endpoints.feedbackRequests}/${requestDialog.req.id}/fulfill`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      enqueueSnackbar('Request marked as fulfilled', { variant: 'success' });
      setRequests(r => r.filter(item => item.id !== requestDialog.req.id));
      setRequestDialog({ open: false, req: null });
    } catch {
      enqueueSnackbar('Failed to mark as fulfilled', { variant: 'error' });
    }
    setFulfillLoading(null);
  };

  // Add this function to handle feedback deletion
  const handleDeleteFeedback = async (feedbackId) => {
    setDeleteDialog({ open: true, feedbackId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.feedbackId) return;
    try {
      await axios.delete(`${config.endpoints.feedback}/${deleteDialog.feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Feedback deleted!', { variant: 'success' });
      await handleSelectMember(selectedMember);
      await fetchTeamStats();
    } catch {
      enqueueSnackbar('Failed to delete feedback', { variant: 'error' });
    }
    setDeleteDialog({ open: false, feedbackId: null });
  };

  const handleEditFeedback = (feedback) => {
    setEditDialog({ open: true, feedback });
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    if (!editDialog.feedback) return;

    setFormLoading(true);
    try {
      await axios.put(`${config.endpoints.feedback}/${editDialog.feedback.id}`, {
        employee_id: editDialog.feedback.employee_id,
        strengths: editDialog.feedback.strengths,
        areas_to_improve: editDialog.feedback.areas_to_improve,
        sentiment: editDialog.feedback.sentiment,
        tags: editDialog.feedback.tags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Feedback updated!', { variant: 'success' });
      await handleSelectMember(selectedMember);
      await fetchTeamStats();
      setEditDialog({ open: false, feedback: null });
    } catch {
      enqueueSnackbar('Failed to update feedback', { variant: 'error' });
    }
    setFormLoading(false);
  };

  const handleEditFormChange = (e) => {
    setEditDialog(prev => ({
      ...prev,
      feedback: { ...prev.feedback, [e.target.name]: e.target.value }
    }));
  };

  // Guard: Only render dashboard when auth is ready
  if (!token || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h3" fontWeight={700} color="#4f2ac3" align="center" mt={4} mb={2}>
        Lightweight Feedback System
      </Typography>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Manager Dashboard</Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Logged in as: {String(user?.role)} ({String(user?.user_id)})
          </Typography>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box className="dashboard-main" maxWidth={1000} mx="auto" p={3}>
        {/* 1. Pending Feedback Requests */}
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
                  {(Array.isArray(requests) ? requests : []).map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        {String(
                          (Array.isArray(teamStats) ? teamStats : []).find(m => m.id === req.employee_id)?.name
                          ?? req.employee_id
                        )}
                      </TableCell>
                      <TableCell>{String(req.message ?? '-')}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {(req.tags ?? '').split(',').filter(Boolean).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleFulfillRequest(req)}
                        >
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

        {/* 2. Team Stats */}
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
                {(Array.isArray(teamStats) ? teamStats : []).length > 0 && (Array.isArray(teamStats) ? teamStats : []).map(member => (
                  <TableRow key={member.id} selected={selectedMember?.id === member.id}>
                    <TableCell>{String(member.name)}</TableCell>
                    <TableCell>{String(member.email)}</TableCell>
                    <TableCell>{String(member.feedback_count ?? 0)}</TableCell>
                    <TableCell>
                      {member.sentiments && typeof member.sentiments === 'object' ? (
                        <>
                          <span style={{ color: 'green' }}>+{String(member.sentiments.positive ?? 0)}</span> /{' '}
                          <span style={{ color: 'orange' }}>{String(member.sentiments.neutral ?? 0)}</span> /{' '}
                          <span style={{ color: 'red' }}>-{String(member.sentiments.negative ?? 0)}</span>
                        </>
                      ) : String(member.sentiments)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleSelectMember(member)}>
                        View Feedback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 3. Feedback Section */}
        {selectedMember && (
          <Box mt={4}>
            <Typography variant="h6" mb={2}>
              Feedback for {String(selectedMember.name)}
            </Typography>

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
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(feedbackList) ? feedbackList : []).map(fb => (
                      <TableRow key={fb.id}>
                        <TableCell>{fb.created_at ? new Date(fb.created_at).toLocaleString() : '-'}</TableCell>
                        <TableCell>{String(fb.strengths)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditFeedback(fb)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteFeedback(fb.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" mb={1}>Submit New Feedback</Typography>
              <form onSubmit={handleFormSubmit}>
                {/* Strengths */}
                <TextField
                  label="Strengths"
                  name="strengths"
                  value={form.strengths}
                  onChange={handleFormChange}
                  required multiline minRows={2} fullWidth margin="normal"
                />
                {/* Areas to Improve */}
                <TextField
                  label="Areas to Improve"
                  name="areas_to_improve"
                  value={form.areas_to_improve}
                  onChange={handleFormChange}
                  required multiline minRows={2} fullWidth margin="normal"
                />
                {/* Sentiment */}
                <Select
                  name="sentiment"
                  value={form.sentiment}
                  onChange={handleFormChange}
                  required fullWidth margin="normal" sx={{ mb: 2 }}
                >
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                </Select>
                {/* Tags */}
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
                  fullWidth size="small" margin="normal"
                />
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                  {formTags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      onDelete={() => setFormTags(tags => tags.filter((_, i) => i !== idx))}
                      size="small"
                    />
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

      {/* Dialog to mark a request fulfilled */}
      <Dialog open={requestDialog.open} onClose={() => setRequestDialog({ open: false, req: null })}>
        <DialogTitle>Fulfill Feedback Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}>
            <strong>Employee:</strong> {
              String(
                teamStats.find(m => m.id === requestDialog.req?.employee_id)?.name
                ?? '-'
              )
            }
          </Typography>
          <Typography variant="body2" mb={1}>
            <strong>Message:</strong> {String(requestDialog.req?.message ?? '-')}
          </Typography>
          <Stack direction="row" spacing={1} mb={2}>
            {(requestDialog.req?.tags ?? '').split(',').filter(Boolean).map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" />
            ))}
          </Stack>
          <Alert severity="info">
            Fill out the feedback form below, then mark this request as fulfilled.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog({ open: false, req: null })}>
            Cancel
          </Button>
          <Button onClick={handleMarkFulfilled} variant="contained" disabled={fulfillLoading}>
            {fulfillLoading ? <CircularProgress size={18} /> : 'Mark as Fulfilled'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to confirm feedback deletion */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, feedbackId: null })}>
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this feedback? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, feedbackId: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to edit feedback */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, feedback: null })} maxWidth="md" fullWidth>
        <DialogTitle>Edit Feedback</DialogTitle>
        <DialogContent>
          {editDialog.feedback && (
            <form onSubmit={handleUpdateFeedback}>
              <TextField
                label="Strengths"
                name="strengths"
                value={editDialog.feedback.strengths || ''}
                onChange={handleEditFormChange}
                required multiline minRows={2} fullWidth margin="normal"
              />
              <TextField
                label="Areas to Improve"
                name="areas_to_improve"
                value={editDialog.feedback.areas_to_improve || ''}
                onChange={handleEditFormChange}
                required multiline minRows={2} fullWidth margin="normal"
              />
              <Select
                name="sentiment"
                value={editDialog.feedback.sentiment || 'positive'}
                onChange={handleEditFormChange}
                required fullWidth margin="normal" sx={{ mb: 2 }}
              >
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
              </Select>
              <TextField
                label="Tags"
                name="tags"
                value={editDialog.feedback.tags || ''}
                onChange={handleEditFormChange}
                fullWidth margin="normal"
                helperText="Comma-separated tags"
              />
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, feedback: null })}>
            Cancel
          </Button>
          <Button onClick={handleUpdateFeedback} variant="contained" disabled={formLoading}>
            {formLoading ? <CircularProgress size={18} /> : 'Update Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManagerDashboard;
