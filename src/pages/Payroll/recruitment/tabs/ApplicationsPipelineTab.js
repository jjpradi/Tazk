import React, { useState, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Grid, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, InputAdornment, Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import * as XLSX from 'xlsx-js-style';
import {
  createApplicationAction,
  updateApplicationStatusAction,
  deleteApplicationAction,
} from 'redux/actions/recruitment.actions';

const STATUS_LIST = [
  'applied', 'screening', 'shortlisted', 'interview',
  'offered', 'accepted', 'rejected', 'withdrawn',
];

const statusChipConfig = {
  applied:     { color: 'default',   variant: 'filled',   bg: '#90a4ae', label: 'Applied' },
  screening:   { color: 'info',      variant: 'filled',   bg: '#29b6f6', label: 'Screening' },
  shortlisted: { color: 'primary',   variant: 'filled',   bg: '#42a5f5', label: 'Shortlisted' },
  interview:   { color: 'warning',   variant: 'filled',   bg: '#ffa726', label: 'Interview' },
  offered:     { color: 'secondary', variant: 'filled',   bg: '#ab47bc', label: 'Offered' },
  accepted:    { color: 'success',   variant: 'filled',   bg: '#66bb6a', label: 'Accepted' },
  rejected:    { color: 'error',     variant: 'filled',   bg: '#ef5350', label: 'Rejected' },
  withdrawn:   { color: 'default',   variant: 'outlined', bg: '#bdbdbd', label: 'Withdrawn' },
};

const summaryCardColors = {
  applied:     { bg: '#eceff1', text: '#546e7a', border: '#90a4ae' },
  screening:   { bg: '#e1f5fe', text: '#0277bd', border: '#29b6f6' },
  shortlisted: { bg: '#e3f2fd', text: '#1565c0', border: '#42a5f5' },
  interview:   { bg: '#fff3e0', text: '#e65100', border: '#ffa726' },
  offered:     { bg: '#f3e5f5', text: '#7b1fa2', border: '#ab47bc' },
  accepted:    { bg: '#e8f5e9', text: '#2e7d32', border: '#66bb6a' },
  rejected:    { bg: '#ffebee', text: '#c62828', border: '#ef5350' },
  withdrawn:   { bg: '#fafafa', text: '#757575', border: '#bdbdbd' },
};

const initialAddForm = { candidate_id: '', job_position_id: '', current_stage_id: '' };
const initialStatusForm = {
  status: '', current_stage_id: '', rejection_reason: '', offer_ctc: '', offer_date: '', joining_date: '',
};

export default function ApplicationsPipelineTab({
  applications = [],
  jobPositions = [],
  candidates = [],
  stages = [],
  refreshApplications,
}) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  // --- filters ---
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // --- dialogs ---
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(initialAddForm);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // --- computed ---
  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_LIST.forEach((st) => { counts[st] = 0; });
    applications.forEach((app) => {
      if (counts[app.status] !== undefined) counts[app.status] += 1;
    });
    return counts;
  }, [applications]);

  const filteredApps = useMemo(() => {
    let list = [...applications];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.candidate_name || '').toLowerCase().includes(q) ||
          (a.candidate_email || '').toLowerCase().includes(q) ||
          (a.job_title || '').toLowerCase().includes(q) ||
          (a.department_name || '').toLowerCase().includes(q),
      );
    }
    if (filterJob) list = list.filter((a) => String(a.job_position_id) === String(filterJob));
    if (filterStatus) list = list.filter((a) => a.status === filterStatus);
    return list;
  }, [applications, search, filterJob, filterStatus]);

  // --- handlers ---
  const handleAddChange = (e) => setAddForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleStatusChange = (e) => setStatusForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddSubmit = () => {
    if (!addForm.candidate_id || !addForm.job_position_id) return;
    dispatch(createApplicationAction(addForm, s, l)).then(() => {
      refreshApplications();
      setAddOpen(false);
      setAddForm(initialAddForm);
    });
  };

  const handleOpenStatusDialog = (app) => {
    setSelectedApp(app);
    setStatusForm({
      status: app.status || '',
      current_stage_id: app.current_stage_id || '',
      rejection_reason: app.rejection_reason || '',
      offer_ctc: app.offer_ctc || '',
      offer_date: app.offer_date || '',
      joining_date: app.joining_date || '',
    });
    setStatusOpen(true);
  };

  const handleStatusSubmit = () => {
    if (!selectedApp) return;
    const data = { id: selectedApp.id, ...statusForm };
    dispatch(updateApplicationStatusAction(data, s, l)).then(() => {
      refreshApplications();
      setStatusOpen(false);
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    dispatch(deleteApplicationAction({ id: deleteTarget.id }, s, l)).then(() => {
      refreshApplications();
      setDeleteOpen(false);
      setDeleteTarget(null);
    });
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '-';
    return Number(val).toLocaleString('en-IN');
  };
  const handleExport = () => {
    if (!filteredApps.length) return;
    setExportDialogOpen(true);
  };

  const handleConfirmExport = () => {
    if (!filteredApps.length) return;
    const valueOrHyphen = (value) => (value === null || value === undefined || value === '' ? '-' : value);

    const exportRows = filteredApps.map((app, index) => ({
      'Candidate Name': valueOrHyphen(app.candidate_name),
      'Job Title': valueOrHyphen(app.job_title), 
      DepartmentW: valueOrHyphen(app.department_name),
      Stage: valueOrHyphen(app.current_stage_name),
      Status: valueOrHyphen((statusChipConfig[app.status] || statusChipConfig.applied).label),
      Experience: valueOrHyphen(app.experience_years),
      'Expected CTC': valueOrHyphen(app.expected_ctc),
      Source: valueOrHyphen(app.source),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    XLSX.writeFile(workbook, `Applications_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportDialogOpen(false);
  };

  return (
    <Box>
      {/* -------- Pipeline Summary Bar -------- */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {STATUS_LIST.map((st) => {
          const cfg = summaryCardColors[st];
          return (
            <Grid key={st} size={{ xs: 6, sm: 3, md: 1.5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5, borderRadius: 2, textAlign: 'center',
                  bgcolor: cfg.bg, border: '1px solid', borderColor: cfg.border,
                  cursor: 'pointer', transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
                onClick={() => setFilterStatus(filterStatus === st ? '' : st)}
              >
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: cfg.text }}>
                  {statusCounts[st]}
                </Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: cfg.text, textTransform: 'capitalize' }}>
                  {statusChipConfig[st].label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* -------- Toolbar -------- */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small'
          placeholder='Search candidates...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select size='small' label='Job Position' value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value=''>All Positions</MenuItem>
          {jobPositions.map((jp) => (
            <MenuItem key={jp.id} value={jp.id}>{jp.title}</MenuItem>
          ))}
        </TextField>
        <TextField
          select size='small' label='Status' value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value=''>All Status</MenuItem>
          {STATUS_LIST.map((st) => (
            <MenuItem key={st} value={st}>{statusChipConfig[st].label}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
          <span>
            <IconButton size='small' onClick={handleExport} disabled={!filteredApps.length}>
              <FileDownloadIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant='contained' size='small' startIcon={<AddIcon />}
          onClick={() => { setAddForm(initialAddForm); setAddOpen(true); }}
          sx={{ textTransform: 'none' }}
        >
          New Application
        </Button>
      </Box>

      {/* -------- Data Table -------- */}
      {filteredApps.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PersonSearchIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No applications found</Typography>
          <Typography sx={{ fontSize: 11, mt: 0.5 }}>
            {applications.length > 0
              ? 'Try adjusting your filters'
              : 'Click "New Application" to add the first application'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Candidate Name</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Job Title</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Stage</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Experience</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Expected CTC</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Source</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApps.map((app) => {
                const sc = statusChipConfig[app.status] || statusChipConfig.applied;
                return (
                  <TableRow key={app.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{app.candidate_name}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{app.candidate_email}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{app.job_title || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{app.department_name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{app.current_stage_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={sc.label}
                        size='small'
                        color={sc.color}
                        variant={sc.variant}
                        sx={{ fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ fontSize: 12 }}>
                      {app.experience_years != null ? `${app.experience_years} yrs` : '-'}
                    </TableCell>
                    <TableCell align='right' sx={{ fontSize: 12 }}>
                      {formatCurrency(app.expected_ctc)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{app.source || '-'}</TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Update Status'>
                        <IconButton size='small' onClick={() => handleOpenStatusDialog(app)}>
                          <SwapHorizIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          size='small' color='error'
                          onClick={() => { setDeleteTarget(app); setDeleteOpen(true); }}
                        >
                          <DeleteOutlineIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* -------- Add Application Dialog -------- */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>New Application</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                select name='candidate_id' label='Candidate' size='small' fullWidth
                value={addForm.candidate_id} onChange={handleAddChange}
              >
                <MenuItem value='' disabled>Select Candidate</MenuItem>
                {candidates.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select name='job_position_id' label='Job Position' size='small' fullWidth
                value={addForm.job_position_id} onChange={handleAddChange}
              >
                <MenuItem value='' disabled>Select Job Position</MenuItem>
                {jobPositions.map((jp) => (
                  <MenuItem key={jp.id} value={jp.id}>{jp.title}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select name='current_stage_id' label='Initial Stage' size='small' fullWidth
                value={addForm.current_stage_id} onChange={handleAddChange}
              >
                <MenuItem value='' disabled>Select Stage</MenuItem>
                {stages.map((st) => (
                  <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} color='error'>Cancel</Button>
          <Button
            onClick={handleAddSubmit} variant='contained'
            disabled={!addForm.candidate_id || !addForm.job_position_id}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- Update Status Dialog -------- */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          Update Status — {selectedApp?.candidate_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                select name='status' label='Status' size='small' fullWidth
                value={statusForm.status} onChange={handleStatusChange}
              >
                {STATUS_LIST.map((st) => (
                  <MenuItem key={st} value={st}>{statusChipConfig[st].label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select name='current_stage_id' label='Stage' size='small' fullWidth
                value={statusForm.current_stage_id} onChange={handleStatusChange}
              >
                <MenuItem value='' disabled>Select Stage</MenuItem>
                {stages.map((st) => (
                  <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {statusForm.status === 'rejected' && (
              <Grid size={12}>
                <TextField
                  name='rejection_reason' label='Rejection Reason' size='small' fullWidth
                  multiline rows={2}
                  value={statusForm.rejection_reason} onChange={handleStatusChange}
                />
              </Grid>
            )}
            {(statusForm.status === 'offered' || statusForm.status === 'accepted') && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name='offer_ctc' label='Offer CTC' size='small' fullWidth type='number'
                    value={statusForm.offer_ctc} onChange={handleStatusChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name='offer_date' label='Offer Date' size='small' fullWidth
                    type='date' InputLabelProps={{ shrink: true }}
                    value={statusForm.offer_date} onChange={handleStatusChange}
                  />
                </Grid>
              </>
            )}
            {statusForm.status === 'accepted' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name='joining_date' label='Joining Date' size='small' fullWidth
                  type='date' InputLabelProps={{ shrink: true }}
                  value={statusForm.joining_date} onChange={handleStatusChange}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleStatusSubmit} variant='contained' disabled={!statusForm.status}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- Delete Confirmation Dialog -------- */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Delete Application</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete the application for{' '}
            <strong>{deleteTarget?.candidate_name}</strong>
            {deleteTarget?.job_title ? ` (${deleteTarget.job_title})` : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Download Excel</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Do you want to download the applications report as an Excel file?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmExport} variant='contained'>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
