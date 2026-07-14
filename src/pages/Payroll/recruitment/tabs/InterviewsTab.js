import React, { useState, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EventIcon from '@mui/icons-material/Event';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getUpcomingInterviewsAction,
  createInterviewAction,
  updateInterviewAction,
  submitInterviewFeedbackAction,
  deleteInterviewAction,
} from 'redux/actions/recruitment.actions';

const modeConfig = {
  in_person: { label: 'In Person', color: 'primary' },
  phone: { label: 'Phone', color: 'info' },
  video: { label: 'Video', color: 'secondary' },
};

const resultConfig = {
  pending: { label: 'Pending', color: 'warning' },
  pass: { label: 'Pass', color: 'success' },
  fail: { label: 'Fail', color: 'error' },
  on_hold: { label: 'On Hold', color: 'default' },
};

const summaryCards = [
  { key: 'upcoming', label: 'Upcoming Interviews', icon: EventIcon, color: '#1976d2', bg: '#e3f2fd' },
  { key: 'pendingFeedback', label: 'Pending Feedback', icon: PendingActionsIcon, color: '#ed6c02', bg: '#fff3e0' },
  { key: 'passed', label: 'Passed', icon: CheckCircleIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'failed', label: 'Failed', icon: CancelIcon, color: '#d32f2f', bg: '#fbe9e7' },
];

const emptyForm = {
  application_id: '',
  round_number: 1,
  round_name: '',
  interview_date: '',
  interview_mode: 'in_person',
  location: '',
};

const emptyFeedback = {
  rating: 0,
  feedback: '',
  result: 'pending',
};

const formatInterviewDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
  } catch {
    return date;
  }
};

export default function InterviewsTab({ upcomingInterviews, applications, refreshInterviews }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Schedule dialog
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Feedback dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ ...emptyFeedback });

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const interviews = upcomingInterviews || [];
  const appList = applications || [];

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  // Summary counts
  const summary = useMemo(() => {
    const now = new Date();
    return interviews.reduce((acc, iv) => {
      if (iv.interview_date && new Date(iv.interview_date) >= now) acc.upcoming += 1;
      if (iv.result === 'pending' && (!iv.feedback || !iv.rating)) acc.pendingFeedback += 1;
      if (iv.result === 'pass') acc.passed += 1;
      if (iv.result === 'fail') acc.failed += 1;
      return acc;
    }, { upcoming: 0, pendingFeedback: 0, passed: 0, failed: 0 });
  }, [interviews]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...interviews];
    if (modeFilter !== 'all') {
      list = list.filter((iv) => iv.interview_mode === modeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((iv) =>
        (iv.candidate_name || '').toLowerCase().includes(q) ||
        (iv.job_title || '').toLowerCase().includes(q) ||
        (iv.round_name || '').toLowerCase().includes(q) ||
        (iv.location || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [interviews, modeFilter, search]);

  const paginatedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- Schedule Dialog ---
  const openSchedule = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (iv) => {
    setEditId(iv.id);
    setForm({
      application_id: iv.application_id || '',
      round_number: iv.round_number || 1,
      round_name: iv.round_name || '',
      interview_date: iv.interview_date ? iv.interview_date.substring(0, 16) : '',
      interview_mode: iv.interview_mode || 'in_person',
      location: iv.location || '',
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = {
      ...form,
      application_id: Number(form.application_id),
      round_number: Number(form.round_number),
    };
    if (editId) {
      dispatch(updateInterviewAction({ id: editId, ...payload }, s, l)).then(() => {
        refreshInterviews();
        setOpen(false);
      });
    } else {
      dispatch(createInterviewAction(payload, s, l)).then(() => {
        refreshInterviews();
        setOpen(false);
      });
    }
  };

  // --- Feedback Dialog ---
  const openFeedback = (iv) => {
    setFeedbackInterview(iv);
    setFeedbackForm({
      rating: iv.rating || 0,
      feedback: iv.feedback || '',
      result: iv.result || 'pending',
    });
    setFeedbackOpen(true);
  };

  const handleFeedbackSubmit = () => {
    const payload = {
      id: feedbackInterview.id,
      rating: Number(feedbackForm.rating),
      feedback: feedbackForm.feedback,
      result: feedbackForm.result,
    };
    dispatch(submitInterviewFeedbackAction(payload, s, l)).then(() => {
      refreshInterviews();
      setFeedbackOpen(false);
    });
  };

  // --- Delete ---
  const openDeleteConfirm = (iv) => {
    setDeleteTarget(iv);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    dispatch(deleteInterviewAction(deleteTarget.id, s, l)).then(() => {
      refreshInterviews();
      setDeleteOpen(false);
      setDeleteTarget(null);
    });
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const setFb = (k, v) => setFeedbackForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      {/* Summary Cards */}
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
                <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: card.color }}>
                  {summary[card.key]}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }}>
                  {card.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}>
        <TextField
          size='small'
          placeholder='Search candidate, job, round...'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240, flex: 1 }}
        />
        <TextField
          size='small'
          select
          label='Mode'
          value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value='all'>All Modes</MenuItem>
          <MenuItem value='in_person'>In Person</MenuItem>
          <MenuItem value='phone'>Phone</MenuItem>
          <MenuItem value='video'>Video</MenuItem>
        </TextField>
        <Button
          size='small'
          variant='contained'
          startIcon={<AddIcon />}
          onClick={openSchedule}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          Schedule Interview
        </Button>
      </Box>

      {/* Data Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Candidate</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Job Title</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Round</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Round Name</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Date / Time</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Mode</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Result</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Rating</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 4 }}>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      No interviews found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((iv) => {
                  const mc = modeConfig[iv.interview_mode] || modeConfig.in_person;
                  const rc = resultConfig[iv.result] || resultConfig.pending;
                  return (
                    <TableRow key={iv.id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{iv.candidate_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{iv.job_title || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{iv.round_number || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{iv.round_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{formatInterviewDate(iv.interview_date)}</TableCell>
                      <TableCell>
                        <Chip size='small' label={mc.label} color={mc.color}
                          sx={{ fontSize: 10, height: 22 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{iv.location || '-'}</TableCell>
                      <TableCell>
                        <Chip size='small' label={rc.label} color={rc.color} variant='outlined'
                          sx={{ fontSize: 10, height: 22, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        {iv.rating ? (
                          <Rating value={Number(iv.rating)} precision={0.5} size='small' readOnly />
                        ) : (
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>-</Typography>
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.3 }}>
                          <Tooltip title='Feedback'>
                            <IconButton size='small' color='primary' onClick={() => openFeedback(iv)}>
                              <RateReviewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton size='small' onClick={() => openEdit(iv)}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton size='small' color='error' onClick={() => openDeleteConfirm(iv)}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filtered.length > 0 && (
          <TablePagination
            component='div'
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid', borderColor: 'divider', '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: 11 } }}
          />
        )}
      </Paper>

      {/* Schedule / Edit Interview Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Interview' : 'Schedule Interview'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label='Application'
            size='small'
            fullWidth
            required
            select
            value={form.application_id}
            onChange={(e) => set('application_id', e.target.value)}
          >
            <MenuItem value=''>-- Select Application --</MenuItem>
            {appList.map((app) => (
              <MenuItem key={app.id} value={app.id}>
                {app.candidate_name} &mdash; {app.job_title}
              </MenuItem>
            ))}
          </TextField>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Round Number'
                size='small'
                fullWidth
                type='number'
                inputProps={{ min: 1 }}
                value={form.round_number}
                onChange={(e) => set('round_number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Round Name'
                size='small'
                fullWidth
                value={form.round_name}
                onChange={(e) => set('round_name', e.target.value)}
                placeholder='e.g. Technical, HR, Managerial'
              />
            </Grid>
          </Grid>
          <TextField
            label='Interview Date & Time'
            size='small'
            fullWidth
            required
            type='datetime-local'
            value={form.interview_date}
            onChange={(e) => set('interview_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Interview Mode'
                size='small'
                fullWidth
                select
                value={form.interview_mode}
                onChange={(e) => set('interview_mode', e.target.value)}
              >
                <MenuItem value='in_person'>In Person</MenuItem>
                <MenuItem value='phone'>Phone</MenuItem>
                <MenuItem value='video'>Video</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Location'
                size='small'
                fullWidth
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder='Office / Meeting link'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={!form.application_id || !form.interview_date}
            sx={{ textTransform: 'none' }}
          >
            {editId ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Interview Feedback</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {feedbackInterview && (
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Candidate</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{feedbackInterview.candidate_name || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Job Title</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{feedbackInterview.job_title || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Round</Typography>
                  <Typography sx={{ fontSize: 12 }}>{feedbackInterview.round_number} - {feedbackInterview.round_name || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Mode</Typography>
                  <Typography sx={{ fontSize: 12 }}>{(modeConfig[feedbackInterview.interview_mode] || {}).label || feedbackInterview.interview_mode}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Date / Time</Typography>
                  <Typography sx={{ fontSize: 12 }}>{formatInterviewDate(feedbackInterview.interview_date)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Rating</Typography>
            <Rating
              value={Number(feedbackForm.rating)}
              precision={0.5}
              onChange={(_, v) => setFb('rating', v || 0)}
              size='large'
            />
          </Box>
          <TextField
            label='Feedback'
            size='small'
            fullWidth
            multiline
            rows={4}
            value={feedbackForm.feedback}
            onChange={(e) => setFb('feedback', e.target.value)}
            placeholder='Write detailed interview feedback...'
          />
          <TextField
            label='Result'
            size='small'
            fullWidth
            select
            value={feedbackForm.result}
            onChange={(e) => setFb('result', e.target.value)}
          >
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='pass'>Pass</MenuItem>
            <MenuItem value='fail'>Fail</MenuItem>
            <MenuItem value='on_hold'>On Hold</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleFeedbackSubmit}
            sx={{ textTransform: 'none' }}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Interview</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete the interview
            {deleteTarget ? ` for ${deleteTarget.candidate_name || 'this candidate'}` : ''}?
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
