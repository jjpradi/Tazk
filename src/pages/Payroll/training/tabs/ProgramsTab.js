import React, { useState, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, Card, CardContent, Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createProgramAction, updateProgramAction, deleteProgramAction,
} from 'redux/actions/training.actions';

const categoryOptions = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft_skills', label: 'Soft Skills' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'safety', label: 'Safety' },
  { value: 'domain', label: 'Domain' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const typeOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'online', label: 'Online' },
  { value: 'on_the_job', label: 'On the Job' },
];

const categoryChipColor = {
  technical: 'primary',
  soft_skills: 'success',
  compliance: 'error',
  leadership: 'secondary',
  onboarding: 'info',
  safety: 'warning',
  domain: 'default',
  other: 'default',
};

const statusChipColor = {
  draft: 'default',
  active: 'success',
  completed: 'info',
  cancelled: 'error',
};

const typeChipConfig = {
  internal: { color: 'primary', variant: 'outlined' },
  external: { color: 'secondary', variant: 'outlined' },
  online: { color: 'info', variant: 'outlined' },
  on_the_job: { color: 'warning', variant: 'outlined' },
};

const formatINR = (val) => {
  if (val == null || val === '' || val === 0) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val);
};

const summaryCards = [
  { key: 'active', label: 'Active Programs', icon: SchoolIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'sessions', label: 'Total Sessions', icon: EventIcon, color: '#1976d2', bg: '#e3f2fd' },
  { key: 'enrolled', label: 'Total Enrolled', icon: GroupIcon, color: '#9c27b0', bg: '#f3e5f5' },
  { key: 'mandatory', label: 'Mandatory Programs', icon: GavelIcon, color: '#ed6c02', bg: '#fff3e0' },
];

const emptyForm = {
  program_name: '', program_code: '', category: 'technical', training_type: 'internal',
  description: '', objectives: '', duration_hours: '', cost_per_head: '',
  trainer_name: '', trainer_org: '', max_capacity: '', is_mandatory: false,
  status: 'draft',
  no_of_sessions: '', no_of_days: '', no_of_participants: '',
  department: '', total_budget: '', total_expenses: '',
};

const labelForValue = (options, val) => {
  const opt = options.find((o) => o.value === val);
  return opt ? opt.label : val || '-';
};

export default function ProgramsTab({ programs, skills, refreshPrograms }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const list = programs || [];

  // Summary counts
  const summary = useMemo(() => {
    const counts = { active: 0, sessions: 0, enrolled: 0, mandatory: 0 };
    list.forEach((p) => {
      if (p.status === 'active') counts.active += 1;
      counts.sessions += Number(p.session_count) || 0;
      counts.enrolled += Number(p.total_enrolled) || 0;
      if (p.is_mandatory) counts.mandatory += 1;
    });
    return counts;
  }, [list]);

  // Filtered list
  const filtered = useMemo(() => {
    let result = list;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.program_name || '').toLowerCase().includes(q) ||
          (p.program_code || '').toLowerCase().includes(q) ||
          (p.trainer_name || '').toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [list, search, categoryFilter, statusFilter]);

  // Handlers
  const handleOpen = (row) => {
    if (row) {
      setEditId(row.id);
      setForm({
        program_name: row.program_name || '',
        program_code: row.program_code || '',
        category: row.category || 'technical',
        training_type: row.training_type || 'internal',
        description: row.description || '',
        objectives: row.objectives || '',
        duration_hours: row.duration_hours ?? '',
        cost_per_head: row.cost_per_head ?? '',
        trainer_name: row.trainer_name || '',
        trainer_org: row.trainer_org || '',
        max_capacity: row.max_capacity ?? '',
        is_mandatory: !!row.is_mandatory,
        status: row.status || 'draft',
        no_of_sessions: row.no_of_sessions ?? '',
        no_of_days: row.no_of_days ?? '',
        no_of_participants: row.no_of_participants ?? '',
        department: row.department || '',
        total_budget: row.total_budget ?? '',
        total_expenses: row.total_expenses ?? '',
      });
    } else {
      setEditId(null);
      setForm({ ...emptyForm });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setForm((prev) => ({ ...prev, is_mandatory: e.target.checked }));
  };

  const handleSubmit = () => {
    if (!form.program_name.trim()) return;
    const payload = {
      ...form,
      duration_hours: form.duration_hours !== '' ? Number(form.duration_hours) : null,
      cost_per_head: form.cost_per_head !== '' ? Number(form.cost_per_head) : null,
      max_capacity: form.max_capacity !== '' ? Number(form.max_capacity) : null,
      no_of_sessions: form.no_of_sessions !== '' ? Number(form.no_of_sessions) : null,
      no_of_days: form.no_of_days !== '' ? Number(form.no_of_days) : null,
      no_of_participants: form.no_of_participants !== '' ? Number(form.no_of_participants) : null,
      total_budget: form.total_budget !== '' ? Number(form.total_budget) : null,
      total_expenses: form.total_expenses !== '' ? Number(form.total_expenses) : null,
    };
    if (editId) {
      payload.id = editId;
      dispatch(updateProgramAction(payload, setModalTypeHandler, setLoaderStatusHandler)).then(() => {
        refreshPrograms();
        handleClose();
      });
    } else {
      dispatch(createProgramAction(payload, setModalTypeHandler, setLoaderStatusHandler)).then(() => {
        refreshPrograms();
        handleClose();
      });
    }
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteProgramAction(deleteDialog.id, setModalTypeHandler, setLoaderStatusHandler)).then(() => {
      refreshPrograms();
      setDeleteDialog({ open: false, id: null, name: '' });
    });
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: card.bg, boxShadow: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                  <Icon sx={{ fontSize: 40, color: card.color }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                      {summary[card.key]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search programs..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select size="small" label="Category" value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categoryOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          select size="small" label="Status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen(null)}>
          Add Program
        </Button>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Program Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Duration (hrs)</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Cost/Head</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Sessions</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Enrolled</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Mandatory</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No programs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                const tConfig = typeChipConfig[row.training_type] || { color: 'default', variant: 'outlined' };
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.program_name || '-'}</TableCell>
                    <TableCell>{row.program_code || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={labelForValue(categoryOptions, row.category)}
                        color={categoryChipColor[row.category] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelForValue(typeOptions, row.training_type)}
                        color={tConfig.color}
                        variant={tConfig.variant}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{row.duration_hours ?? '-'}</TableCell>
                    <TableCell align="right">{formatINR(row.cost_per_head)}</TableCell>
                    <TableCell align="right">{row.session_count ?? 0}</TableCell>
                    <TableCell align="right">{row.total_enrolled ?? 0}</TableCell>
                    <TableCell align="center">
                      {row.is_mandatory ? <CheckCircleIcon color="success" fontSize="small" /> : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labelForValue(statusOptions, row.status)}
                        color={statusChipColor[row.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small" color="error"
                          onClick={() => setDeleteDialog({ open: true, id: row.id, name: row.program_name })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editId ? 'Edit Program' : 'Add Program'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Program Name *" name="program_name"
                value={form.program_name} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Program Code" name="program_code"
                value={form.program_code} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth select size="small" label="Category" name="category"
                value={form.category} onChange={handleChange}
              >
                {categoryOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth select size="small" label="Training Type" name="training_type"
                value={form.training_type} onChange={handleChange}
              >
                {typeOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small" label="Description" name="description"
                value={form.description} onChange={handleChange}
                multiline rows={4}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth size="small" label="Objectives" name="objectives"
                value={form.objectives} onChange={handleChange}
                multiline rows={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Duration (hours)" name="duration_hours"
                type="number" value={form.duration_hours} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Cost per Head (INR)" name="cost_per_head"
                type="number" value={form.cost_per_head} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Trainer Name" name="trainer_name"
                value={form.trainer_name} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Trainer Organization" name="trainer_org"
                value={form.trainer_org} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Max Capacity" name="max_capacity"
                type="number" value={form.max_capacity} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Department" name="department"
                value={form.department} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="No. of Sessions" name="no_of_sessions"
                type="number" value={form.no_of_sessions} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="No. of Days" name="no_of_days"
                type="number" value={form.no_of_days} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="No. of Participants / Enrolled" name="no_of_participants"
                type="number" value={form.no_of_participants} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Total Budget (INR)" name="total_budget"
                type="number" value={form.total_budget} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="Total Expenses (INR)" name="total_expenses"
                type="number" value={form.total_expenses} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth select size="small" label="Status" name="status"
                value={form.status} onChange={handleChange}
              >
                {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={form.is_mandatory} onChange={handleSwitchChange} />}
                label="Mandatory Program"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.program_name.trim()}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Program</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
