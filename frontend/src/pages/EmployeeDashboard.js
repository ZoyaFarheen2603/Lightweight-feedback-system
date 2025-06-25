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

function EmployeeDashboard() {
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

  useEffect(() => {
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
  }, [token, user.user_id]);

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

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Employee Dashboard</Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>Logged in as: {user?.role} ({user?.user_id})</Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box maxWidth={900} mx="auto" p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Feedback Timeline</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRequestOpen(true)}>
            Request Feedback
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : feedbackList.length === 0 ? (
          <Alert severity="info">No feedback received yet.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Strengths</TableCell>
                  <TableCell>Areas to Improve</TableCell>
                  <TableCell>Sentiment</TableCell>
                  <TableCell>Acknowledged</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(feedbackList) && feedbackList.length > 0 ? feedbackList.map(fb => (
                  <TableRow key={fb.id}>
                    <TableCell>{fb.created_at ? new Date(fb.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>{typeof fb.strengths === 'string' ? fb.strengths : JSON.stringify(fb.strengths)}</TableCell>
                    <TableCell>{typeof fb.areas_to_improve === 'string' ? fb.areas_to_improve : JSON.stringify(fb.areas_to_improve)}</TableCell>
                    <TableCell>{typeof fb.sentiment === 'string' ? fb.sentiment : JSON.stringify(fb.sentiment)}</TableCell>
                    <TableCell>{typeof fb.acknowledged === 'boolean' ? (fb.acknowledged ? 'Yes' : 'No') : JSON.stringify(fb.acknowledged)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {(fb.tags || '').split(',').filter(Boolean).map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {!fb.acknowledged && (
                        <Button onClick={() => handleAcknowledge(fb.id)} disabled={ackLoading === fb.id} variant="contained" color="primary" size="small">
                          {ackLoading === fb.id ? <CircularProgress size={18} /> : 'Acknowledge'}
                        </Button>
                      )}
                      <Accordion sx={{ mt: 1 }} onChange={(_, expanded) => expanded && fetchComments(fb.id)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2">Comments</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {commentsLoading[fb.id] ? (
                            <CircularProgress size={18} />
                          ) : (
                            <>
                              {(comments[fb.id] || []).length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                              ) : (
                                (comments[fb.id] || []).map(c => (
                                  <Box key={c.id} mb={1}>
                                    <Typography variant="caption" color="text.secondary">
                                      {c.user_id === user.user_id ? 'You' : `User ${c.user_id}`} • {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                                    </Typography>
                                    <ReactMarkdown>{typeof c.comment === 'string' ? c.comment : JSON.stringify(c.comment)}</ReactMarkdown>
                                  </Box>
                                ))
                              )}
                              <TextField
                                label="Add a comment (markdown supported)"
                                value={commentInputs[fb.id] || ''}
                                onChange={e => setCommentInputs(c => ({ ...c, [fb.id]: e.target.value }))}
                                fullWidth
                                multiline
                                minRows={2}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                              <Box mt={1} display="flex" justifyContent="flex-end">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleAddComment(fb.id)}
                                  disabled={commentLoading[fb.id] || !(commentInputs[fb.id] || '').trim()}
                                >
                                  {commentLoading[fb.id] ? <CircularProgress size={16} /> : 'Add Comment'}
                                </Button>
                              </Box>
                            </>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Dialog open={requestOpen} onClose={() => setRequestOpen(false)}>
        <DialogTitle>Request Feedback</DialogTitle>
        <DialogContent>
          <TextField
            label="Message (optional)"
            value={requestMsg}
            onChange={e => setRequestMsg(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
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
            margin="normal"
            placeholder="e.g. communication, leadership"
          />
          <Stack direction="row" spacing={1} mt={1}>
            {requestTags.map((tag, idx) => (
              <Chip key={idx} label={tag} onDelete={() => setRequestTags(requestTags.filter((_, i) => i !== idx))} />
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
  );
}

export default EmployeeDashboard; 