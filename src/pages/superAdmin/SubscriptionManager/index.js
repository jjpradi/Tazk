import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, Chip, Tab, Tabs, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Switch, FormControlLabel, Grid,
  Select, MenuItem, FormControl, InputLabel, InputAdornment, Paper
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, Save as SaveIcon, Close as CloseIcon,
  People as PeopleIcon, ContentCopy as CopyIcon
} from '@mui/icons-material';
import SubscriptionPlanService from '../../../services/subscriptionPlan_services';

const COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale' },
  { id: 3, name: 'Sales' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Payroll' },
  { id: 9, name: 'Asset Management' },
  { id: 10, name: 'Lead Management' },
  { id: 11, name: 'Projects' },
  { id: 12, name: 'Stact' },
];

const EMPTY_PLAN = {
  company_type_id: '',
  plan_name: '',
  plan_description: '',
  Price: '',
  Original_Price: '',
  monthly_price_for_monthly: '',
  monthly_price_for_yearly: '',
  gst_percentage: 18,
  Offer: '',
  Free_Trial: '',
  duration_days: '',
  web_access: 1,
  mobile_app_access: 1,
};

export default function SubscriptionManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PLAN });
  const [saving, setSaving] = useState(false);

  // Delete / Companies dialogs
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [companiesDialog, setCompaniesDialog] = useState(null);
  const [companies, setCompanies] = useState([]);

  const selectedType = COMPANY_TYPES[activeTab];

  const fetchPlans = useCallback(async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      const res = await SubscriptionPlanService.getPlansByCompanyType(selectedType.id);
      setPlans(res.data || []);
    } catch {
      setError('Failed to load plans');
    }
    setLoading(false);
  }, [selectedType]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const openFormDialog = (plan, duplicate) => {
    const src = plan || {};
    const typeId = src.company_type_id || selectedType.id;
    setEditingPlan(duplicate ? null : plan);
    setForm({
      company_type_id: typeId,
      plan_name: (src.plan_name || '') + (duplicate ? ' (Copy)' : ''),
      plan_description: src.plan_description || '',
      Price: src.Price || '',
      Original_Price: src.Original_Price || '',
      monthly_price_for_monthly: src.monthly_price_for_monthly || '',
      monthly_price_for_yearly: src.monthly_price_for_yearly || '',
      gst_percentage: src.gst_percentage ?? 18,
      Offer: src.Offer || '',
      Free_Trial: src.Free_Trial || '',
      duration_days: src.duration_days || '',
      web_access: src.web_access ?? 1,
      mobile_app_access: src.mobile_app_access ?? 1,
    });
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    setFormOpen(false);
    setEditingPlan(null);
  };

  const handleSave = async () => {
    if (!form.plan_name.trim()) { setError('Plan name is required'); return; }
    if (!form.company_type_id) { setError('Company type is required'); return; }
    setSaving(true);
    try {
      if (editingPlan) {
        await SubscriptionPlanService.updatePlan(editingPlan.id, form);
        showSuccess(`Updated plan "${form.plan_name}"`);
      } else {
        await SubscriptionPlanService.createPlan(form);
        showSuccess(`Created plan "${form.plan_name}"`);
      }
      closeFormDialog();
      fetchPlans();
    } catch {
      setError('Failed to save plan');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await SubscriptionPlanService.deletePlan(deleteDialog.id);
      showSuccess(`Deleted plan "${deleteDialog.plan_name}"`);
      setDeleteDialog(null);
      fetchPlans();
    } catch {
      setError('Failed to delete plan. It may be in use.');
    }
  };

  const handleViewCompanies = async (plan) => {
    setCompaniesDialog(plan);
    try {
      const res = await SubscriptionPlanService.getCompaniesOnPlan(plan.id);
      setCompanies(res.data || []);
    } catch {
      setCompanies([]);
    }
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const calcEffectivePrice = () => {
    const orig = Number(form.Original_Price) || 0;
    const offer = Number(form.Offer) || 0;
    if (orig && offer) return (orig - (orig * offer / 100)).toFixed(2);
    return form.Price || '-';
  };

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
        <Box>
          <Typography variant="h6">Subscription Plans</Typography>
          <Typography variant="caption" color="text.secondary">
            Manage subscription plans, pricing, and access per company type
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={fetchPlans}>
            Refresh
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => openFormDialog(null, false)}>
            New Plan
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1, py: 0 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Company Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { minHeight: 40, py: 0.5, textTransform: 'none', fontSize: 13 } }}>
          {COMPANY_TYPES.map((ct, idx) => (
            <Tab key={ct.id} label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {ct.name}
                {activeTab === idx && plans.length > 0 && (
                  <Chip label={plans.length} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                )}
              </Box>
            } />
          ))}
        </Tabs>
      </Box>

      {/* Plans Table */}
      <Card sx={{ flex: 1, mt: 0.5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Plan Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Original</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Offer</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Monthly (M/Y)</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>GST</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Trial</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5' }}>Access</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#f5f5f5', width: 130 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10}><Typography sx={{ p: 2 }}>Loading...</Typography></TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={10}>
                  <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                    No plans for {selectedType?.name}. Click "New Plan" to create one.
                  </Typography>
                </TableCell></TableRow>
              ) : (
                plans.map(plan => (
                  <TableRow key={plan.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' }, cursor: 'pointer' }}
                    onDoubleClick={() => openFormDialog(plan, false)}>
                    <TableCell sx={{ py: 0.75 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>{plan.plan_name}</Typography>
                      {plan.plan_description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {plan.plan_description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.Price ? `₹${plan.Price}` : '-'}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.Original_Price ? `₹${plan.Original_Price}` : '-'}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.Offer ? `${plan.Offer}%` : '-'}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>
                      {plan.monthly_price_for_monthly || '-'} / {plan.monthly_price_for_yearly || '-'}
                    </TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.gst_percentage ?? '-'}%</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.duration_days ? `${plan.duration_days}d` : '-'}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{plan.Free_Trial ? `${plan.Free_Trial}d` : '-'}</TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {plan.web_access ? <Chip label="W" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 9, minWidth: 0 }} /> : null}
                        {plan.mobile_app_access ? <Chip label="M" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: 9, minWidth: 0 }} /> : null}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.75 }}>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openFormDialog(plan, false)}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                        <Tooltip title="Duplicate"><IconButton size="small" onClick={() => openFormDialog(plan, true)}><CopyIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                        <Tooltip title="Companies"><IconButton size="small" onClick={() => handleViewCompanies(plan)}><PeopleIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(plan)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Plan Form Dialog */}
      <Dialog open={formOpen} onClose={closeFormDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: 16 }}>
              {editingPlan ? `Edit: ${editingPlan.plan_name}` : 'Create New Plan'}
            </Typography>
            {editingPlan && <Chip label={`ID: ${editingPlan.id}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />}
          </Box>
          <IconButton size="small" onClick={closeFormDialog}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 1.5, py: 0 }} onClose={() => setError('')}>{error}</Alert>}

          {/* Basic Info */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}>Basic Info</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company Type</InputLabel>
                  <Select value={form.company_type_id} label="Company Type"
                    onChange={(e) => updateField('company_type_id', e.target.value)}>
                    {COMPANY_TYPES.map(ct => (
                      <MenuItem key={ct.id} value={ct.id}>{ct.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Plan Name" value={form.plan_name}
                  onChange={(e) => updateField('plan_name', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Description" value={form.plan_description}
                  onChange={(e) => updateField('plan_description', e.target.value)} />
              </Grid>
            </Grid>
          </Paper>

          {/* Pricing */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}>Pricing</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Selling Price" type="number"
                  value={form.Price} onChange={(e) => updateField('Price', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Original Price (MRP)" type="number"
                  value={form.Original_Price} onChange={(e) => updateField('Original_Price', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField fullWidth size="small" label="Offer %" type="number"
                  value={form.Offer} onChange={(e) => updateField('Offer', e.target.value)}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField fullWidth size="small" label="GST %" type="number"
                  value={form.gst_percentage} onChange={(e) => updateField('gst_percentage', e.target.value)}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField fullWidth size="small" label="Effective Price" disabled value={calcEffectivePrice()}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Monthly (Monthly Billing)" type="number"
                  value={form.monthly_price_for_monthly} onChange={(e) => updateField('monthly_price_for_monthly', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Monthly (Yearly Billing)" type="number"
                  value={form.monthly_price_for_yearly} onChange={(e) => updateField('monthly_price_for_yearly', e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }} />
              </Grid>
            </Grid>
          </Paper>

          {/* Duration & Access */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}>Duration & Access</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Duration (Days)" type="number"
                  value={form.duration_days} onChange={(e) => updateField('duration_days', e.target.value)}
                  helperText={form.duration_days ? `≈ ${Math.round(form.duration_days / 30)} months` : ''} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth size="small" label="Free Trial (Days)" type="number"
                  value={form.Free_Trial} onChange={(e) => updateField('Free_Trial', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControlLabel
                  control={<Switch checked={form.web_access === 1}
                    onChange={(e) => updateField('web_access', e.target.checked ? 1 : 0)} />}
                  label={<Typography variant="body2">Web Access</Typography>} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControlLabel
                  control={<Switch checked={form.mobile_app_access === 1}
                    onChange={(e) => updateField('mobile_app_access', e.target.checked ? 1 : 0)} />}
                  label={<Typography variant="body2">Mobile Access</Typography>} />
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={closeFormDialog}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleSave} disabled={saving}
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}>
            {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16 }}>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{deleteDialog?.plan_name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} size="small">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} size="small">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Companies Dialog */}
      <Dialog open={!!companiesDialog} onClose={() => setCompaniesDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Typography variant="h6" sx={{ fontSize: 15 }}>Companies on "{companiesDialog?.plan_name}"</Typography>
          <IconButton size="small" onClick={() => setCompaniesDialog(null)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {companies.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No companies currently on this plan.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Start</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>End</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Days Left</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontSize: 12 }}>{c.company_name || c.company_id}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{c.sStartDate ? new Date(c.sStartDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{c.sEndDate ? new Date(c.sEndDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{c.sRemainingDays ?? '-'}</TableCell>
                    <TableCell>
                      {c.sIsExpired ? <Chip label="Expired" size="small" color="error" sx={{ height: 20, fontSize: 10 }} />
                        : c.isTrial ? <Chip label="Trial" size="small" color="warning" sx={{ height: 20, fontSize: 10 }} />
                        : <Chip label="Active" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
