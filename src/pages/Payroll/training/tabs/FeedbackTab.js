import React, { useState, useContext, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Rating, Chip, Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getFeedbackBySessionAction,
  createFeedbackAction,
  deleteFeedbackAction,
} from 'redux/actions/training.actions';

const ADMIN_ROLES = ['Administrator', 'HR Manager'];

const emptyForm = {
  session_id: '',
  overall_rating: 0,
  content_rating: 0,
  trainer_rating: 0,
  relevance_rating: 0,
  comments: '',
  suggestions: '',
  response_file: null,
};

const getLoginData = () => {
  try {
    return JSON.parse(sessionStorage.getItem('login') || '{}');
  } catch {
    return {};
  }
};

const getSessionFormMeta = (session) => ({
  url: session?.feedback_form_url || session?.feedback_form_path || session?.feedback_form || '',
  name: session?.feedback_form_name || session?.feedback_template_name || '',
});

const getResponseFileMeta = (feedbackItem) => ({
  url:
    feedbackItem?.response_file_url ||
    feedbackItem?.filled_form_url ||
    feedbackItem?.feedback_file_url ||
    feedbackItem?.attachment_url ||
    '',
  name:
    feedbackItem?.response_file_name ||
    feedbackItem?.filled_form_name ||
    feedbackItem?.feedback_file_name ||
    feedbackItem?.attachment_name ||
    '',
});

export default function FeedbackTab({ sessions }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const feedback = useSelector((s) => s.TrainingReducer.feedback);
  const loginData = useMemo(() => getLoginData(), []);

  const employeeId = loginData?.employee_id;
  const roleName = loginData?.role_name || '';
  const isAdmin = ADMIN_ROLES.includes(roleName);

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  const [selectedSession, setSelectedSession] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const uploadInputRef = useRef(null);

  const sessionList = sessions || [];
  const feedbackList = Array.isArray(feedback) ? feedback : [];

  const selectedSessionData = useMemo(
    () => sessionList.find((sess) => String(sess.id) === String(selectedSession)),
    [sessionList, selectedSession],
  );
  const sessionForm = getSessionFormMeta(selectedSessionData);

  const employeeResponses = useMemo(() => {
    if (!employeeId) return [];
    return feedbackList.filter((fb) => String(fb.employee_id) === String(employeeId));
  }, [employeeId, feedbackList]);

  const visibleFeedback = isAdmin ? feedbackList : employeeResponses;
  const hasSubmitted = employeeResponses.length > 0;
  const latestEmployeeResponse = employeeResponses[0] || null;

  const averages = useMemo(() => {
    if (!feedbackList.length) return { overall: 0, content: 0, trainer: 0, relevance: 0 };
    const sum = feedbackList.reduce(
      (acc, fb) => {
        acc.overall += Number(fb.overall_rating) || 0;
        acc.content += Number(fb.content_rating) || 0;
        acc.trainer += Number(fb.trainer_rating) || 0;
        acc.relevance += Number(fb.relevance_rating) || 0;
        return acc;
      },
      { overall: 0, content: 0, trainer: 0, relevance: 0 },
    );
    const count = feedbackList.length;
    return {
      overall: +(sum.overall / count).toFixed(1),
      content: +(sum.content / count).toFixed(1),
      trainer: +(sum.trainer / count).toFixed(1),
      relevance: +(sum.relevance / count).toFixed(1),
    };
  }, [feedbackList]);

  const recommendRate = useMemo(() => {
    if (!feedbackList.length) return 0;
    const count = feedbackList.filter((fb) => fb.would_recommend === 1 || fb.would_recommend === true).length;
    return Math.round((count / feedbackList.length) * 100);
  }, [feedbackList]);

  const paginatedRows = visibleFeedback.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const summaryCards = [
    { key: 'overall', label: 'Overall Avg', icon: StarIcon, color: '#ed6c02', bg: '#fff3e0', value: averages.overall },
    { key: 'content', label: 'Content Avg', icon: SchoolIcon, color: '#1976d2', bg: '#e3f2fd', value: averages.content },
    { key: 'trainer', label: 'Trainer Avg', icon: PersonIcon, color: '#9c27b0', bg: '#f3e5f5', value: averages.trainer },
    { key: 'relevance', label: 'Relevance Avg', icon: ThumbUpAltIcon, color: '#2e7d32', bg: '#e8f5e9', value: averages.relevance },
  ];

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    setPage(0);
    if (sessionId) {
      dispatch(getFeedbackBySessionAction(sessionId, s, l));
    }
  };

  const openSubmit = () => {
    setForm({ ...emptyForm, session_id: selectedSession });
    setOpen(true);
  };

  const handleSubmit = () => {
    const payload = new FormData();
    payload.append('session_id', Number(form.session_id));
    payload.append('employee_id', employeeId ? Number(employeeId) : '');
    payload.append('overall_rating', Number(form.overall_rating));
    payload.append('content_rating', Number(form.content_rating));
    payload.append('trainer_rating', Number(form.trainer_rating));
    payload.append('relevance_rating', Number(form.relevance_rating));
    payload.append('comments', form.comments || '');
    payload.append('suggestions', form.suggestions || '');
    if (form.response_file) {
      payload.append('response_file', form.response_file);
    }

    dispatch(createFeedbackAction(payload, s, l)).then(() => {
      dispatch(getFeedbackBySessionAction(selectedSession, s, l));
      setOpen(false);
      setForm({ ...emptyForm });
    });
  };

  const openDeleteConfirm = (fb) => {
    setDeleteTarget(fb);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    dispatch(deleteFeedbackAction(deleteTarget.id, s, l)).then(() => {
      dispatch(getFeedbackBySessionAction(selectedSession, s, l));
      setDeleteOpen(false);
      setDeleteTarget(null);
    });
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <TextField
        size='small'
        select
        label='Select Training Session'
        value={selectedSession}
        onChange={(e) => handleSessionChange(e.target.value)}
        sx={{ minWidth: 320, mb: 2 }}
        fullWidth
      >
        <MenuItem value=''>-- Select Session --</MenuItem>
        {sessionList.map((sess) => (
          <MenuItem key={sess.id} value={sess.id}>
            {sess.session_name} - {sess.program_name}
          </MenuItem>
        ))}
      </TextField>

      {!selectedSession ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Select a training session to view the assigned feedback form and responses.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
                  Feedback Form
                </Typography>
                {sessionForm.url ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Chip
                      icon={<DescriptionOutlinedIcon />}
                      label={sessionForm.name || 'Uploaded feedback form'}
                      variant='outlined'
                      sx={{ maxWidth: '100%' }}
                    />
                    <Button
                      size='small'
                      startIcon={<DownloadOutlinedIcon />}
                      component={Link}
                      href={sessionForm.url}
                      target='_blank'
                      rel='noreferrer'
                      underline='none'
                      sx={{ textTransform: 'none' }}
                    >
                      Download Form
                    </Button>
                    <Button
                      size='small'
                      startIcon={<VisibilityOutlinedIcon />}
                      component={Link}
                      href={sessionForm.url}
                      target='_blank'
                      rel='noreferrer'
                      underline='none'
                      sx={{ textTransform: 'none' }}
                    >
                      View Form
                    </Button>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {isAdmin
                      ? 'No feedback form is attached to this session yet. Upload one from Sessions.'
                      : 'No feedback form has been published for this session yet.'}
                  </Typography>
                )}
              </Box>

              {!isAdmin && (
                <Box>
                  {hasSubmitted ? (
                    <Chip color='success' label='Feedback Submitted' />
                  ) : (
                    <Chip color='warning' variant='outlined' label='Pending Submission' />
                  )}
                </Box>
              )}
            </Box>

            {!isAdmin && latestEmployeeResponse && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>
                Your latest response is available below. You can also open the uploaded response file if one was attached.
              </Typography>
            )}
          </Paper>

          {isAdmin && (
            <>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {summaryCards.map((card) => (
                  <Grid key={card.key} size={{ xs: 6, sm: 3 }}>
                    <Paper elevation={0} sx={{
                      p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                      borderLeft: `4px solid ${card.color}`, display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '50%', bgcolor: card.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <card.icon sx={{ fontSize: 20, color: card.color }} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: card.color }}>
                            {card.value}
                          </Typography>
                          <Rating value={card.value} precision={0.1} size='small' readOnly sx={{ ml: 0.5 }} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }}>
                          {card.label}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }} />
                <Paper elevation={0} sx={{
                  px: 2, py: 0.8, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <ThumbUpAltIcon sx={{ fontSize: 16, color: recommendRate >= 70 ? 'success.main' : 'warning.main' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    {recommendRate}% would recommend
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    ({feedbackList.length} response{feedbackList.length !== 1 ? 's' : ''})
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

          {!isAdmin && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
              <Button
                size='small'
                variant='contained'
                startIcon={<AddIcon />}
                onClick={openSubmit}
                disabled={!sessionForm.url || !employeeId}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                {hasSubmitted ? 'Upload Updated Feedback' : 'Submit Filled Form'}
              </Button>
              {!employeeId && (
                <Typography sx={{ fontSize: 12, color: 'error.main' }}>
                  Logged-in employee details were not found. Please sign in again.
                </Typography>
              )}
            </Box>
          )}

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>
                      {isAdmin ? 'Employee Name' : 'My Response'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Overall Rating</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Content</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Trainer</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Relevance</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Comments</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Filled Form</TableCell>
                    {isAdmin && (
                      <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} align='center' sx={{ py: 4 }}>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                          {isAdmin ? 'No feedback submitted yet.' : 'You have not submitted feedback for this session yet.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((fb) => {
                      const responseFile = getResponseFileMeta(fb);
                      return (
                        <TableRow key={fb.id} hover>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                            {isAdmin ? (fb.employee_name || '-') : 'Submitted'}
                          </TableCell>
                          <TableCell>
                            <Rating value={Number(fb.overall_rating) || 0} precision={0.5} size='small' readOnly />
                          </TableCell>
                          <TableCell>
                            <Rating value={Number(fb.content_rating) || 0} precision={0.5} size='small' readOnly />
                          </TableCell>
                          <TableCell>
                            <Rating value={Number(fb.trainer_rating) || 0} precision={0.5} size='small' readOnly />
                          </TableCell>
                          <TableCell>
                            <Rating value={Number(fb.relevance_rating) || 0} precision={0.5} size='small' readOnly />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, maxWidth: 240 }}>
                            <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {fb.comments || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            {responseFile.url ? (
                              <Link href={responseFile.url} target='_blank' rel='noreferrer' underline='hover'>
                                {responseFile.name || 'Open file'}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell align='right'>
                              <Tooltip title='Delete'>
                                <IconButton size='small' color='error' onClick={() => openDeleteConfirm(fb)}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {visibleFeedback.length > 0 && (
              <TablePagination
                component='div'
                count={visibleFeedback.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ borderTop: '1px solid', borderColor: 'divider', '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 11 } }}
              />
            )}
          </Paper>
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Submit Filled Feedback Form</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label='Session'
            size='small'
            fullWidth
            value={selectedSessionData?.session_name || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label='Employee'
            size='small'
            fullWidth
            value={loginData?.employee_name || loginData?.name || employeeId || ''}
            InputProps={{ readOnly: true }}
          />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Overall Rating *</Typography>
                <Rating
                  value={Number(form.overall_rating)}
                  precision={0.5}
                  onChange={(_, v) => set('overall_rating', v || 0)}
                  size='large'
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Content Rating</Typography>
                <Rating
                  value={Number(form.content_rating)}
                  precision={0.5}
                  onChange={(_, v) => set('content_rating', v || 0)}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Trainer Rating</Typography>
                <Rating
                  value={Number(form.trainer_rating)}
                  precision={0.5}
                  onChange={(_, v) => set('trainer_rating', v || 0)}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Relevance Rating</Typography>
                <Rating
                  value={Number(form.relevance_rating)}
                  precision={0.5}
                  onChange={(_, v) => set('relevance_rating', v || 0)}
                />
              </Box>
            </Grid>
          </Grid>
          <TextField
            label='Comments'
            size='small'
            fullWidth
            multiline
            rows={3}
            value={form.comments}
            onChange={(e) => set('comments', e.target.value)}
            placeholder='Share your feedback about the training...'
          />
          <TextField
            label='Suggestions'
            size='small'
            fullWidth
            multiline
            rows={3}
            value={form.suggestions}
            onChange={(e) => set('suggestions', e.target.value)}
            placeholder='Any suggestions for improvement...'
          />

          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Filled Feedback Form *</Typography>
            <input
              ref={uploadInputRef}
              type='file'
              accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
              style={{ display: 'none' }}
              onChange={(e) => set('response_file', e.target.files?.[0] || null)}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Button
                variant='outlined'
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => uploadInputRef.current?.click()}
                sx={{ textTransform: 'none' }}
              >
                Upload Filled Form
              </Button>
              <Typography sx={{ fontSize: 12, color: form.response_file ? 'text.primary' : 'text.secondary' }}>
                {form.response_file ? form.response_file.name : 'No file selected'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!form.overall_rating || !form.response_file || !employeeId}
            sx={{ textTransform: 'none' }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Feedback</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete the feedback
            {deleteTarget ? ` from ${deleteTarget.employee_name || 'this employee'}` : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete} sx={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
