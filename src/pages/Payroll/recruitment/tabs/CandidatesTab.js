import React, { useState, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, Card, CardContent, Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import * as XLSX from 'xlsx-js-style';
import {
  createCandidateAction, updateCandidateAction, deleteCandidateAction,
} from 'redux/actions/recruitment.actions';

const sourceOptions = [
  { value: 'portal', label: 'Portal' },
  { value: 'referral', label: 'Referral' },
  { value: 'agency', label: 'Agency' },
  { value: 'walk_in', label: 'Walk-In' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'naukri', label: 'Naukri' },
  { value: 'other', label: 'Other' },
];

const sourceChipColor = {
  portal: 'primary',
  referral: 'success',
  agency: 'info',
  walk_in: 'warning',
  linkedin: 'secondary',
  naukri: 'error',
  other: 'default',
};

const formatINR = (val) => {
  if (val == null || val === '' || val === 0) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val);
};

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  current_company: '', current_designation: '', experience_years: '',
  current_ctc: '', expected_ctc: '', notice_period_days: '',
  resume_url: '', source: 'portal', referred_by: '', notes: '',
};

const summaryCards = [
  { key: 'total', label: 'Total Candidates', icon: PeopleIcon, color: '#1976d2', bg: '#e3f2fd' },
  { key: 'referral', label: 'Referrals', icon: PersonAddIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'portal', label: 'Portal', icon: LanguageIcon, color: '#9c27b0', bg: '#f3e5f5' },
  { key: 'agency', label: 'Agency', icon: BusinessIcon, color: '#0288d1', bg: '#e1f5fe' },
];

export default function CandidatesTab({ candidates, refreshCandidates }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const list = candidates || [];

  // Summary counts
  const summary = useMemo(() => {
    const counts = { total: list.length, referral: 0, portal: 0, agency: 0 };
    list.forEach((c) => {
      if (counts[c.source] !== undefined) counts[c.source] += 1;
    });
    return counts;
  }, [list]);

  // Filter + search
  const filtered = useMemo(() => {
    let data = list;
    if (sourceFilter !== 'all') {
      data = data.filter((c) => c.source === sourceFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((c) =>
        (c.first_name || '').toLowerCase().includes(q) ||
        (c.last_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.current_company || '').toLowerCase().includes(q),
      );
    }
    return data;
  }, [list, sourceFilter, search]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Form helpers
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      first_name: c.first_name || '',
      last_name: c.last_name || '',
      email: c.email || '',
      phone: c.phone || '',
      current_company: c.current_company || '',
      current_designation: c.current_designation || '',
      experience_years: c.experience_years ?? '',
      current_ctc: c.current_ctc ?? '',
      expected_ctc: c.expected_ctc ?? '',
      notice_period_days: c.notice_period_days ?? '',
      resume_url: c.resume_url || '',
      source: c.source || 'portal',
      referred_by: c.referred_by || '',
      notes: c.notes || '',
    });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = { ...form };
    if (payload.experience_years !== '') payload.experience_years = Number(payload.experience_years);
    else payload.experience_years = null;
    if (payload.current_ctc !== '') payload.current_ctc = Number(payload.current_ctc);
    else payload.current_ctc = null;
    if (payload.expected_ctc !== '') payload.expected_ctc = Number(payload.expected_ctc);
    else payload.expected_ctc = null;
    if (payload.notice_period_days !== '') payload.notice_period_days = Number(payload.notice_period_days);
    else payload.notice_period_days = null;

    if (editId) {
      dispatch(updateCandidateAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler))
        .then(() => { refreshCandidates(); setOpen(false); });
    } else {
      dispatch(createCandidateAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        .then(() => { refreshCandidates(); setOpen(false); });
    }
  };

  const confirmDelete = (c) => {
    setDeleteDialog({ open: true, id: c.id, name: `${c.first_name || ''} ${c.last_name || ''}`.trim() });
  };

  const handleExport = () => {
    if (!filtered.length) return;
    setExportDialogOpen(true);
  };

  const handleConfirmExport = () => {
    if (!filtered.length) return;
    const valueOrHyphen = (value) => (value === null || value === undefined || value === '' ? '-' : value);

    const exportRows = filtered.map((c, index) => ({
      'S. No.': index + 1,
      'First Name': valueOrHyphen(c.first_name),
      'Last Name': valueOrHyphen(c.last_name),
      'Email': valueOrHyphen(c.email),
      'Phone': valueOrHyphen(c.phone),
      'Current Company': valueOrHyphen(c.current_company),
      'Current Designation': valueOrHyphen(c.current_designation),
      'Experience (yrs)': valueOrHyphen(c.experience_years),
      'Notice Period (days)': valueOrHyphen(c.notice_period_days),
      'Current CTC': valueOrHyphen(c.current_ctc),
      'Expected CTC': valueOrHyphen(c.expected_ctc),
      'Source': valueOrHyphen((sourceOptions.find((s) => s.value === c.source) || {}).label || c.source),
      'Referred By': valueOrHyphen(c.referred_by),
      'Resume URL': valueOrHyphen(c.resume_url),
      'Notes': valueOrHyphen(c.notes),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    XLSX.writeFile(workbook, `Candidates_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportDialogOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteCandidateAction(deleteDialog.id, setModalTypeHandler, setLoaderStatusHandler))
      .then(() => { refreshCandidates(); setDeleteDialog({ open: false, id: null, name: '' }); });
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {summaryCards.map((sc) => (
          <Grid key={sc.key} size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>
                      {sc.label}
                    </Typography>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: sc.color, lineHeight: 1.3 }}>
                      {summary[sc.key] || 0}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%', bgcolor: sc.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <sc.icon sx={{ fontSize: 20, color: sc.color }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size='small' placeholder='Search candidates...'
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          size='small' select label='Source' value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value='all'>All Sources</MenuItem>
          {sourceOptions.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
          <span>
            <IconButton size='small' onClick={handleExport} disabled={!filtered.length}>
              <FileDownloadIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Candidate
        </Button>
      </Box>

      {/* Data Table */}
      {filtered.length === 0 ? (
        <Paper elevation={0} sx={{
          p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2,
        }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            {list.length === 0
              ? 'No candidates in the database yet. Click "Add Candidate" to get started.'
              : 'No candidates match the current search or filter criteria.'}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>First Name</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Last Name</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }}>Current Company</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='center'>Exp (yrs)</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Current CTC</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='right'>Expected CTC</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='center'>Source</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='center'>Applications</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700 }} align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((c) => (
                  <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: 12 }}>{c.first_name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{c.last_name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12, maxWidth: 180 }}>
                      <Typography noWrap sx={{ fontSize: 12 }}>{c.email || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{c.phone || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12, maxWidth: 160 }}>
                      <Typography noWrap sx={{ fontSize: 12 }}>{c.current_company || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align='center'>
                      {c.experience_years != null ? c.experience_years : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }} align='right'>{formatINR(c.current_ctc)}</TableCell>
                    <TableCell sx={{ fontSize: 12 }} align='right'>{formatINR(c.expected_ctc)}</TableCell>
                    <TableCell align='center'>
                      <Chip
                        size='small' label={(sourceOptions.find((s) => s.value === c.source) || {}).label || c.source || '-'}
                        color={sourceChipColor[c.source] || 'default'}
                        sx={{ fontSize: 10, height: 22 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }} align='center'>
                      {c.applications_count ?? 0}
                    </TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center' }}>
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => openEdit(c)}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton size='small' color='error' onClick={() => confirmDelete(c)}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component='div' count={filtered.length} page={page} rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid', borderColor: 'divider', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: 12 } }}
          />
        </Paper>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Candidate' : 'Add Candidate'}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='First Name' size='small' fullWidth required
                value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Last Name' size='small' fullWidth
                value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Email' size='small' fullWidth type='email'
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Phone' size='small' fullWidth
                value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Current Company' size='small' fullWidth
                value={form.current_company} onChange={(e) => set('current_company', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Current Designation' size='small' fullWidth
                value={form.current_designation} onChange={(e) => set('current_designation', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Experience (years)' size='small' fullWidth type='number'
                value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Notice Period (days)' size='small' fullWidth type='number'
                value={form.notice_period_days} onChange={(e) => set('notice_period_days', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Current CTC' size='small' fullWidth type='number'
                value={form.current_ctc} onChange={(e) => set('current_ctc', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position='start'>INR</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Expected CTC' size='small' fullWidth type='number'
                value={form.expected_ctc} onChange={(e) => set('expected_ctc', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position='start'>INR</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Source' size='small' fullWidth select
                value={form.source} onChange={(e) => set('source', e.target.value)}>
                {sourceOptions.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Referred By' size='small' fullWidth
                value={form.referred_by} onChange={(e) => set('referred_by', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label='Resume URL' size='small' fullWidth
                value={form.resume_url} onChange={(e) => set('resume_url', e.target.value)}
                placeholder='https://...' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label='Notes' size='small' fullWidth multiline rows={3}
                value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.first_name.trim()}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Candidate</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete <strong>{deleteDialog.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
            sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDelete}
            sx={{ textTransform: 'none' }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Download Excel</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Do you want to download the candidates report as an Excel file?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleConfirmExport} sx={{ textTransform: 'none' }}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
