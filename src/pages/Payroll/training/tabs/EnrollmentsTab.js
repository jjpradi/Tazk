import React, { useState, useContext, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, Card, CardContent, Select,
  FormControl, InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { format } from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getEnrollmentsBySessionAction,
  createEnrollmentAction,
  updateEnrollmentAction,
  deleteEnrollmentAction,
} from 'redux/actions/training.actions';

const attendanceOptions = [
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'attended', label: 'Attended' },
  { value: 'absent', label: 'Absent' },
  { value: 'partially_attended', label: 'Partially Attended' },
];

const completionOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'exempted', label: 'Exempted' },
];

const attendanceChipColor = {
  enrolled: 'default',
  attended: 'success',
  absent: 'error',
  partially_attended: 'warning',
};

const completionChipColor = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  failed: 'error',
  exempted: 'default',
};

const summaryCards = [
  { key: 'total', label: 'Total Enrolled', icon: PeopleIcon, color: '#1976d2', bg: '#e3f2fd' },
  { key: 'attended', label: 'Attended', icon: EventAvailableIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'completed', label: 'Completed', icon: CheckCircleIcon, color: '#9c27b0', bg: '#f3e5f5' },
  { key: 'pending', label: 'Pending', icon: HourglassEmptyIcon, color: '#ed6c02', bg: '#fff3e0' },
];

const formatLabel = (val) => {
  if (!val) return '-';
  return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (val) => {
  if (!val) return '-';
  try {
    return format(new Date(val), 'dd MMM yyyy');
  } catch {
    return val;
  }
};

const emptyEnrollForm = {
  employee_id: '',
};

const emptyUpdateForm = {
  attendance_status: 'enrolled',
  completion_status: 'pending',
  score: '',
  certificate_url: '',
  completed_date: '',
  notes: '',
};

export default function EnrollmentsTab({ sessions, refreshSessions }) {
  const dispatch = useDispatch();
  const enrollments = useSelector((s) => s.TrainingReducer.enrollments);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [selectedSession, setSelectedSession] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Enroll dialog
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ ...emptyEnrollForm });

  // Update dialog
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateEmployeeName, setUpdateEmployeeName] = useState('');
  const [updateForm, setUpdateForm] = useState({ ...emptyUpdateForm });

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const sessionList = sessions || [];
  const list = enrollments || [];

  const selectedSessionObj = useMemo(
    () => sessionList.find((s) => s.id === selectedSession),
    [sessionList, selectedSession],
  );

  // Summary counts
  const summary = useMemo(() => {
    const counts = { total: list.length, attended: 0, completed: 0, pending: 0 };
    list.forEach((e) => {
      if (e.attendance_status === 'attended') counts.attended += 1;
      if (e.completion_status === 'completed') counts.completed += 1;
      if (e.completion_status === 'pending') counts.pending += 1;
    });
    return counts;
  }, [list]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) =>
      (e.employee_name || '').toLowerCase().includes(q) ||
      (e.emp_code || '').toLowerCase().includes(q),
    );
  }, [list, search]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  // Handlers
  const handleSessionChange = useCallback(
    (e) => {
      const sessionId = e.target.value;
      setSelectedSession(sessionId);
      setPage(0);
      setSearch('');
      if (sessionId) {
        dispatch(
          getEnrollmentsBySessionAction(sessionId, setModalTypeHandler, setLoaderStatusHandler),
        );
      }
    },
    [dispatch, setModalTypeHandler, setLoaderStatusHandler],
  );

  const refreshEnrollments = useCallback(() => {
    if (selectedSession) {
      dispatch(
        getEnrollmentsBySessionAction(selectedSession, setModalTypeHandler, setLoaderStatusHandler),
      );
    }
  }, [dispatch, selectedSession, setModalTypeHandler, setLoaderStatusHandler]);

  // Enroll
  const handleEnrollOpen = () => {
    setEnrollForm({ ...emptyEnrollForm });
    setEnrollOpen(true);
  };

  const handleEnrollClose = () => {
    setEnrollOpen(false);
    setEnrollForm({ ...emptyEnrollForm });
  };

  const handleEnrollSubmit = () => {
    if (!enrollForm.employee_id) return;
    const data = {
      employee_id: Number(enrollForm.employee_id),
      session_id: selectedSession,
    };
    dispatch(createEnrollmentAction(data, setModalTypeHandler, setLoaderStatusHandler)).then(() => {
      dispatch(
        getEnrollmentsBySessionAction(selectedSession, setModalTypeHandler, setLoaderStatusHandler),
      );
      refreshSessions();
    });
    handleEnrollClose();
  };

  // Update
  const handleUpdateOpen = (enrollment) => {
    setUpdateId(enrollment.id);
    setUpdateEmployeeName(enrollment.employee_name || `Employee #${enrollment.employee_id}`);
    setUpdateForm({
      attendance_status: enrollment.attendance_status || 'enrolled',
      completion_status: enrollment.completion_status || 'pending',
      score: enrollment.score ?? '',
      certificate_url: enrollment.certificate_url || '',
      completed_date: enrollment.completed_date
        ? enrollment.completed_date.substring(0, 10)
        : '',
      notes: enrollment.notes || '',
    });
    setUpdateOpen(true);
  };

  const handleUpdateClose = () => {
    setUpdateOpen(false);
    setUpdateId(null);
    setUpdateEmployeeName('');
    setUpdateForm({ ...emptyUpdateForm });
  };

  const handleUpdateSubmit = () => {
    const data = { ...updateForm };
    if (data.score !== '' && data.score !== null) data.score = Number(data.score);
    else delete data.score;
    if (!data.completed_date) delete data.completed_date;
    if (!data.certificate_url) delete data.certificate_url;

    dispatch(updateEnrollmentAction(updateId, data, setModalTypeHandler, setLoaderStatusHandler))
      .then(() => {
        refreshEnrollments();
        refreshSessions();
      });
    handleUpdateClose();
  };

  // Delete
  const handleDeleteOpen = (enrollment) => {
    setDeleteDialog({
      open: true,
      id: enrollment.id,
      name: enrollment.employee_name || `Employee #${enrollment.employee_id}`,
    });
  };

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteConfirm = () => {
    dispatch(
      deleteEnrollmentAction(deleteDialog.id, setModalTypeHandler, setLoaderStatusHandler),
    ).then(() => {
      refreshEnrollments();
      refreshSessions();
    });
    handleDeleteClose();
  };

  return (
    <Box>
      {/* Session Selector */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Training Session</InputLabel>
          <Select
            value={selectedSession}
            onChange={handleSessionChange}
            label="Select Training Session"
          >
            {sessionList.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.session_name} — {s.program_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {!selectedSession ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a training session to view enrollments
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Choose a session from the dropdown above to manage enrollments
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Session Info */}
          {selectedSessionObj && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              {selectedSessionObj.session_name} — {selectedSessionObj.program_name}
              {' '}({selectedSessionObj.enrolled_count ?? list.length} enrolled)
            </Typography>
          )}

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <Grid key={card.key} size={{ xs: 6, sm: 3 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      background: card.bg,
                      borderColor: card.color,
                      borderWidth: 1,
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ color: card.color, fontSize: 28 }} />
                        <Box>
                          <Typography variant="h5" sx={{ color: card.color, fontWeight: 700 }}>
                            {summary[card.key]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {card.label}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Toolbar */}
          <Paper sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ minWidth: 260 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleEnrollOpen}
            >
              Enroll Employee
            </Button>
          </Paper>

          {/* Data Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Emp Code</TableCell>
                  <TableCell>Enrollment Date</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Completion</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell>Certificate</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {search ? 'No enrollments match your search' : 'No enrollments found for this session'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {row.employee_name || `Employee #${row.employee_id}`}
                      </TableCell>
                      <TableCell>{row.emp_code || '-'}</TableCell>
                      <TableCell>{formatDate(row.enrollment_date || row.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatLabel(row.attendance_status)}
                          color={attendanceChipColor[row.attendance_status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatLabel(row.completion_status)}
                          color={completionChipColor[row.completion_status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.score != null && row.score !== '' ? row.score : '-'}
                      </TableCell>
                      <TableCell>
                        {row.certificate_url ? (
                          <Typography
                            variant="body2"
                            component="a"
                            href={row.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'primary.main', textDecoration: 'none' }}
                          >
                            View
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Update Enrollment">
                          <IconButton size="small" onClick={() => handleUpdateOpen(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Enrollment">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOpen(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filtered.length > 5 && (
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </TableContainer>
        </>
      )}

      {/* Enroll Employee Dialog */}
      <Dialog open={enrollOpen} onClose={handleEnrollClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enroll Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Employee ID"
                type="number"
                fullWidth
                size="small"
                value={enrollForm.employee_id}
                onChange={(e) => setEnrollForm((f) => ({ ...f, employee_id: e.target.value }))}
                required
                helperText="Enter the employee ID to enroll"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Session"
                fullWidth
                size="small"
                value={
                  selectedSessionObj
                    ? `${selectedSessionObj.session_name} — ${selectedSessionObj.program_name}`
                    : selectedSession
                }
                slotProps={{ input: { readOnly: true } }}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEnrollClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEnrollSubmit}
            disabled={!enrollForm.employee_id}
          >
            Enroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Enrollment Dialog */}
      <Dialog open={updateOpen} onClose={handleUpdateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Enrollment</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Employee"
                fullWidth
                size="small"
                value={updateEmployeeName}
                slotProps={{ input: { readOnly: true } }}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Attendance Status</InputLabel>
                <Select
                  value={updateForm.attendance_status}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, attendance_status: e.target.value }))
                  }
                  label="Attendance Status"
                >
                  {attendanceOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Completion Status</InputLabel>
                <Select
                  value={updateForm.completion_status}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, completion_status: e.target.value }))
                  }
                  label="Completion Status"
                >
                  {completionOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Score"
                type="number"
                fullWidth
                size="small"
                value={updateForm.score}
                onChange={(e) => setUpdateForm((f) => ({ ...f, score: e.target.value }))}
                slotProps={{ input: { inputProps: { min: 0, max: 100 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Completed Date"
                type="date"
                fullWidth
                size="small"
                value={updateForm.completed_date}
                onChange={(e) =>
                  setUpdateForm((f) => ({ ...f, completed_date: e.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Certificate URL"
                fullWidth
                size="small"
                value={updateForm.certificate_url}
                onChange={(e) =>
                  setUpdateForm((f) => ({ ...f, certificate_url: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={updateForm.notes}
                onChange={(e) => setUpdateForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateClose}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSubmit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Enrollment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteDialog.name}</strong> from this session?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
