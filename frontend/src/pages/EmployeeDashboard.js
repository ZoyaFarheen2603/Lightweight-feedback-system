import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stack, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useSnackbar } from 'notistack';
import AddIcon from '@mui/icons-material/Add';
import ReactMarkdown from 'react-markdown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { safeEnqueueSnackbar } from '../utils/safeSnackbar';
import { safeText } from '../utils/safeText';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
  // All hooks at the top
  const { user, logout, token } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ackLoading, setAckLoading] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestTags, setRequestTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;
    const fetchFeedback = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://localhost:8000/feedback/${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbackList(res.data);
      } catch (err) {
        setError('Failed to fetch feedback');
      }
      setLoading(false);
    };
    fetchFeedback();
  }, [token, user]);

  // Guard: Only render dashboard when auth is ready
  if (!user || !token) {
    return (
      <Box bgcolor="#f5f5f5" minHeight="100vh">
        <Typography variant="h3" fontWeight={700} color="#4f2ac3" align="center" mt={4} mb={2}>
          Lightweight Feedback System
        </Typography>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Employee Dashboard</Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => {}}>Request Feedback</Button>
          </Toolbar>
        </AppBar>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const fetchComments = async (feedbackId) => {
    setCommentsLoading(c => ({ ...c, [feedbackId]: true }));
    try {
      const res = await axios.get(`http://localhost:8000/feedback/${feedbackId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(c => ({ ...c, [feedbackId]: res.data }));
    } catch {}
    setCommentsLoading(c => ({ ...c, [feedbackId]: false }));
  };

  const handleAcknowledge = async (feedbackId) => {
    setAckLoading(feedbackId);
    try {
      await axios.post(`http://localhost:8000/feedback/${feedbackId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh feedback list
      const res = await axios.get(`http://localhost:8000/feedback/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackList(res.data);
      safeEnqueueSnackbar(enqueueSnackbar, 'Feedback acknowledged!');

    } catch (err) {
      safeEnqueueSnackbar(enqueueSnackbar, 'Failed to acknowledge feedback', { variant: 'error' });
    }
    setAckLoading(null);
  };

  const handleRequestFeedback = async () => {
    setRequestLoading(true);
    try {
      await axios.post('http://localhost:8000/feedback-request', {
        message: requestMsg,
        tags: requestTags.join(','),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      safeEnqueueSnackbar(enqueueSnackbar, 'Feedback request sent!', { variant: 'success' });
      setRequestOpen(false);
      setRequestMsg('');
      setRequestTags([]);
      setTagInput('');
    } catch (err) {
      safeEnqueueSnackbar(enqueueSnackbar, 'Failed to send request', { variant: 'error' });
    }
    setRequestLoading(false);
  };

  const handleAddComment = async (feedbackId) => {
    setCommentLoading(c => ({ ...c, [feedbackId]: true }));
    try {
      await axios.post(`http://localhost:8000/feedback/${feedbackId}/comment`, {
        comment: commentInputs[feedbackId],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentInputs(c => ({ ...c, [feedbackId]: '' }));
      fetchComments(feedbackId);
      safeEnqueueSnackbar(enqueueSnackbar, 'Comment added!', { variant: 'success' });
    } catch {
      safeEnqueueSnackbar(enqueueSnackbar, 'Failed to add comment', { variant: 'error' });
    }
    setCommentLoading(c => ({ ...c, [feedbackId]: false }));
  };

  // Debug logs for employee data
  console.log('feedbackList', feedbackList);
  console.log('comments', comments);

  // Global debug log for runtime inspection
  window._lastProps = { feedbackList, comments };

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h3" fontWeight={700} color="#4f2ac3" align="center" mt={4} mb={2}>
        Lightweight Feedback System
      </Typography>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Employee Dashboard</Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setRequestOpen(true)}>
            Request Feedback
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
            Back
          </Button>
        </Toolbar>
      </AppBar>
      <Box className="dashboard-main" maxWidth={900} mx="auto" p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">My Feedback</Typography>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : Array.isArray(feedbackList) && feedbackList.length > 0 ? (
          <Box>
            {console.log('Mapping feedbackList:', feedbackList)}
            {feedbackList.map(fb => (
              <Accordion key={fb.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">{new Date(fb.created_at).toLocaleString()}</Typography>
                    <Box>
                      <Chip label={fb.sentiment} color={fb.sentiment === 'positive' ? 'success' : fb.sentiment === 'neutral' ? 'warning' : 'error'} size="small" sx={{ mr: 1 }} />
                      {fb.acknowledged ? (
                        <Chip label="Acknowledged" color="primary" size="small" />
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleAcknowledge(fb.id)}
                          disabled={ackLoading === fb.id}
                        >
                          {ackLoading === fb.id ? <CircularProgress size={16} /> : 'Acknowledge'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Debug logs for markdown fields */}
                  {console.log('fb.strengths', fb.strengths, 'typeof:', typeof fb.strengths)}
                  {console.log('fb.areas_to_improve', fb.areas_to_improve, 'typeof:', typeof fb.areas_to_improve)}
                  <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
                  <Typography variant="body2">{String(safeText(fb.strengths))}</Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Areas to Improve</Typography>
                  <Typography variant="body2">{String(safeText(fb.areas_to_improve))}</Typography>
                  <Box mt={2} mb={1}>
                    <Stack direction="row" spacing={1}>
                      {(fb.tags ?? '').split(',').filter(Boolean).map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" />
                      ))}
                    </Stack>
                  </Box>
                  {/* Comments Section TEMPORARILY REMOVED FOR DEBUGGING */}
                  {/*
                  {console.log('Mapping comments[fb.id]:', comments[fb.id])}
                  {Array.isArray(comments[fb.id]) && comments[fb.id].length > 0 ? (
                    comments[fb.id].map(c => (
                      <Paper key={c.id} sx={{ p: 1, mb: 1 }}>
                        <Typography variant="body2"><b>{c.user_id === user.user_id ? 'You' : c.user_id}</b> ({new Date(c.created_at).toLocaleString()}):</Typography>
                        {console.log('c.comment', c.comment, 'typeof:', typeof c.comment)}
                        <Typography variant="body2">{String(safeText(c.comment))}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                  )}
                  */}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Alert severity="info">No feedback yet.</Alert>
        )}
        {/* Request Feedback Dialog */}
        <Dialog open={requestOpen} onClose={() => setRequestOpen(false)}>
          <DialogTitle>Request Feedback</DialogTitle>
          <DialogContent>
            <TextField
              label="Message"
              value={requestMsg}
              onChange={e => setRequestMsg(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              margin="normal"
            />
            <TextField
              label="Add Tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  setRequestTags([...requestTags, tagInput.trim()]);
                  setTagInput('');
                  e.preventDefault();
                }
              }}
              fullWidth
              size="small"
              margin="normal"
            />
            <Stack direction="row" spacing={1} mt={1} mb={2}>
              {requestTags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  onDelete={() => setRequestTags(tags => tags.filter((_, i) => i !== idx))}
                  size="small"
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestFeedback} variant="contained" disabled={requestLoading}>
              {requestLoading ? <CircularProgress size={18} /> : 'Send Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default EmployeeDashboard; 