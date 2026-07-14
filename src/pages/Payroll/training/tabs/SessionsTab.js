import React, { useState, useContext, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { format } from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createSessionAction,
  updateSessionAction,
  deleteSessionAction,
} from 'redux/actions/training.actions';

const modeConfig = {
  classroom: { label: 'Classroom', color: 'primary' },
  virtual: { label: 'Virtual', color: 'info' },
  hybrid: { label: 'Hybrid', color: 'secondary' },
};

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

const summaryCards = [
  { key: 'scheduled', label: 'Scheduled', icon: EventIcon, color: '#ed6c02', bg: '#fff3e0' },
  { key: 'in_progress', label: 'In Progress', icon: PlayCircleOutlineIcon, color: '#0288d1', bg: '#e1f5fe' },
  { key: 'completed', label: 'Completed', icon: CheckCircleIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'cancelled', label: 'Cancelled', icon: CancelIcon, color: '#d32f2f', bg: '#fbe9e7' },
];

const emptyForm = {
  program_id: '',
  session_name: '',
  start_date: '',
  end_date: '',
  venue: '',
  mode: 'classroom',
  meeting_link: '',
  trainer_name: '',
  max_capacity: '',
  status: 'scheduled',
  notes: '',
  feedback_form: null,
  feedback_form_name: '',
  feedback_form_url: '',
};

const formatSessionDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
  } catch {
    return date;
  }
};

export default function SessionsTab({ sessions, programs, refreshSessions }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const feedbackFormInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add/Edit dialog
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sessionList = sessions || [];
  const programList = programs || [];

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  // Summary counts
  const summary = useMemo(() => {
    return sessionList.reduce((acc, sess) => {
      if (acc[sess.status] !== undefined) acc[sess.status] += 1;
      return acc;
    }, { scheduled: 0, in_progress: 0, completed: 0, cancelled: 0 });
  }, [sessionList]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = [...sessionList];
    if (programFilter !== 'all') {
      list = list.filter((sess) => String(sess.program_id) === String(programFilter));
    }
    if (modeFilter !== 'all') {
      list = list.filter((sess) => sess.mode === modeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((sess) =>
        (sess.session_name || '').toLowerCase().includes(q) ||
        (sess.program_name || '').toLowerCase().includes(q) ||
        (sess.trainer_name || '').toLowerCase().includes(q) ||
        (sess.venue || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessionList, programFilter, modeFilter, search]);

  const paginatedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- Add/Edit Dialog ---
  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (sess) => {
    setEditId(sess.id);
    setForm({
      program_id: sess.program_id || '',
      session_name: sess.session_name || '',
      start_date: sess.start_date ? sess.start_date.substring(0, 16) : '',
      end_date: sess.end_date ? sess.end_date.substring(0, 16) : '',
      venue: sess.venue || '',
      mode: sess.mode || 'classroom',
      meeting_link: sess.meeting_link || '',
      trainer_name: sess.trainer_name || '',
      max_capacity: sess.max_capacity || '',
      status: sess.status || 'scheduled',
      notes: sess.notes || '',
      feedback_form: null,
      feedback_form_name: sess.feedback_form_name || sess.feedback_template_name || '',
      feedback_form_url: sess.feedback_form_url || sess.feedback_form_path || sess.feedback_form || '',
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = new FormData();
    payload.append('program_id', Number(form.program_id));
    payload.append('session_name', form.session_name || '');
    payload.append('start_date', form.start_date || '');
    payload.append('end_date', form.end_date || '');
    payload.append('venue', form.venue || '');
    payload.append('mode', form.mode || 'classroom');
    payload.append('meeting_link', form.meeting_link || '');
    payload.append('trainer_name', form.trainer_name || '');
    payload.append('max_capacity', form.max_capacity ? Number(form.max_capacity) : '');
    payload.append('status', form.status || 'scheduled');
    payload.append('notes', form.notes || '');
    payload.append('feedback_form_name', form.feedback_form_name || '');
    payload.append('feedback_form_url', form.feedback_form_url || '');
    if (form.feedback_form) {
      payload.append('feedback_form', form.feedback_form);
    }
    if (editId) {
      payload.append('id', editId);
      dispatch(updateSessionAction(payload, s, l)).then(() => {
        refreshSessions();
        setOpen(false);
      });
    } else {
      dispatch(createSessionAction(payload, s, l)).then(() => {
        refreshSessions();
        setOpen(false);
      });
    }
  };

  // --- Delete ---
  const openDeleteConfirm = (sess) => {
    setDeleteTarget(sess);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    dispatch(deleteSessionAction(deleteTarget.id, s, l)).then(() => {
      refreshSessions();
      setDeleteOpen(false);
      setDeleteTarget(null);
    });
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

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
          placeholder='Search session, program, trainer...'
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
          label='Program'
          value={programFilter}
          onChange={(e) => { setProgramFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value='all'>All Programs</MenuItem>
          {programList.map((prog) => (
            <MenuItem key={prog.id} value={prog.id}>
              {prog.program_name || prog.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size='small'
          select
          label='Mode'
          value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value='all'>All Modes</MenuItem>
          <MenuItem value='classroom'>Classroom</MenuItem>
          <MenuItem value='virtual'>Virtual</MenuItem>
          <MenuItem value='hybrid'>Hybrid</MenuItem>
        </TextField>
        <Button
          size='small'
          variant='contained'
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}
        >
          Schedule Session
        </Button>
      </Box>

      {/* Data Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Session Name</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Program</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Start Date</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>End Date</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Venue / Link</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Mode</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Trainer</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Enrolled / Capacity</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Feedback Form</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align='center' sx={{ py: 4 }}>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      No sessions found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((sess) => {
                  const mc = modeConfig[sess.mode] || modeConfig.classroom;
                  const sc = statusConfig[sess.status] || statusConfig.scheduled;
                  const venueDisplay = sess.mode === 'virtual'
                    ? (sess.meeting_link || '-')
                    : sess.mode === 'hybrid'
                      ? (sess.venue || sess.meeting_link || '-')
                      : (sess.venue || '-');
                  return (
                    <TableRow key={sess.id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{sess.session_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{sess.program_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{formatSessionDate(sess.start_date)}</TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{formatSessionDate(sess.end_date)}</TableCell>
                      <TableCell sx={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {venueDisplay}
                      </TableCell>
                      <TableCell>
                        <Chip size='small' label={mc.label} color={mc.color}
                          sx={{ fontSize: 10, height: 22 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{sess.trainer_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {sess.enrolled_count ?? 0} / {sess.max_capacity ?? '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {sess.feedback_form_url || sess.feedback_form_path || sess.feedback_form ? (
                          <Chip
                            size='small'
                            icon={<DescriptionOutlinedIcon />}
                            label={sess.feedback_form_name || 'Uploaded'}
                            variant='outlined'
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size='small' label={sc.label} color={sc.color} variant='outlined'
                          sx={{ fontSize: 10, height: 22, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align='right'>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.3 }}>
                          <Tooltip title='Edit'>
                            <IconButton size='small' onClick={() => openEdit(sess)}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton size='small' color='error' onClick={() => openDeleteConfirm(sess)}>
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

      {/* Add / Edit Session Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Session' : 'Schedule Session'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Program'
                size='small'
                fullWidth
                required
                select
                value={form.program_id}
                onChange={(e) => set('program_id', e.target.value)}
              >
                <MenuItem value=''>-- Select Program --</MenuItem>
                {programList.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.program_name || prog.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Session Name'
                size='small'
                fullWidth
                value={form.session_name}
                onChange={(e) => set('session_name', e.target.value)}
                placeholder='e.g. Batch 1 - Morning'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Start Date & Time'
                size='small'
                fullWidth
                type='datetime-local'
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='End Date & Time'
                size='small'
                fullWidth
                type='datetime-local'
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Venue'
                size='small'
                fullWidth
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                placeholder='Training room, Hall A, etc.'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Mode'
                size='small'
                fullWidth
                select
                value={form.mode}
                onChange={(e) => set('mode', e.target.value)}
              >
                <MenuItem value='classroom'>Classroom</MenuItem>
                <MenuItem value='virtual'>Virtual</MenuItem>
                <MenuItem value='hybrid'>Hybrid</MenuItem>
              </TextField>
            </Grid>
            {(form.mode === 'virtual' || form.mode === 'hybrid') && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label='Meeting Link'
                  size='small'
                  fullWidth
                  value={form.meeting_link}
                  onChange={(e) => set('meeting_link', e.target.value)}
                  placeholder='https://meet.google.com/...'
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Trainer Name'
                size='small'
                fullWidth
                value={form.trainer_name}
                onChange={(e) => set('trainer_name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Max Capacity'
                size='small'
                fullWidth
                type='number'
                inputProps={{ min: 1 }}
                value={form.max_capacity}
                onChange={(e) => set('max_capacity', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Status'
                size='small'
                fullWidth
                select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <MenuItem value='scheduled'>Scheduled</MenuItem>
                <MenuItem value='in_progress'>In Progress</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='cancelled'>Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Notes'
                size='small'
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder='Additional notes about this session...'
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                  Feedback Form For Employees
                </Typography>
                <input
                  ref={feedbackFormInputRef}
                  type='file'
                  accept='.pdf,.doc,.docx'
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    set('feedback_form', file);
                    set('feedback_form_name', file?.name || form.feedback_form_name || '');
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant='outlined'
                    startIcon={<UploadFileOutlinedIcon />}
                    onClick={() => feedbackFormInputRef.current?.click()}
                    sx={{ textTransform: 'none' }}
                  >
                    {form.feedback_form || form.feedback_form_url ? 'Replace Form' : 'Upload Form'}
                  </Button>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {form.feedback_form?.name || form.feedback_form_name || 'No feedback form uploaded'}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Employees will download this form in the Feedback tab and upload the completed version there.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={!form.program_id}
            sx={{ textTransform: 'none' }}
          >
            {editId ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Session</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete the session
            {deleteTarget ? ` "${deleteTarget.session_name || 'this session'}"` : ''}?
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
