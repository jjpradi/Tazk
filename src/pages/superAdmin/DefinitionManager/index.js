import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, MenuItem, TextField,
  Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Snackbar, Alert, Skeleton, Select, FormControl, InputLabel, Divider,
  Switch, FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Widgets as WidgetsIcon, Notifications as NotifIcon,
  ViewColumn as FieldsIcon, Description as TemplateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import RoleManagerService from '../../../services/roleManager_services';

const COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale' }, { id: 3, name: 'Sales' },
  { id: 4, name: 'Service' }, { id: 5, name: 'Payroll' },
  { id: 7, name: 'Retail Shop' }, { id: 8, name: 'Super Admin' },
  { id: 9, name: 'Asset Management' }, { id: 10, name: 'Lead Management' },
  { id: 11, name: 'Projects' }, { id: 12, name: 'Stact' },
];

// Subscription tiers per company type (matching MenuBuilder)
const SUBSCRIPTION_TIERS = {
  2:  { 1: 'Starter', 2: 'Retail', 3: 'Retail Chain', 4: 'Retail Chain+' },
  3:  { 1: 'Starter', 2: 'Standard', 3: 'Premium', 4: 'Premium+' },
  4:  { 1: 'Service' },
  5:  { 1: 'Starter', 2: 'Essential', 3: 'Essential+', 4: 'Comprehensive' },
  7:  {},  // no subscription
  8:  {},  // no subscription
  9:  { 1: 'Starter', 2: 'Basic', 3: 'Pro', 4: 'Enterprise' },
  10: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' },
  11: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' },
  12: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' },
};

const TIER_COLORS = { 1: 'default', 2: 'info', 3: 'warning', 4: 'success' };

const cellSx = { fontSize: 12, py: 0.75 };
const headerCellSx = { ...cellSx, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };
const stickyHeaderSx = { position: 'sticky', top: 0, zIndex: 2, bgcolor: 'grey.100' };

function getTierLabel(ctId, tier) {
  return SUBSCRIPTION_TIERS[ctId]?.[tier] || `Tier ${tier}`;
}

function hasTiers(ctId) {
  return Object.keys(SUBSCRIPTION_TIERS[ctId] || {}).length > 0;
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function DefinitionManager() {
  const [companyTab, setCompanyTab] = useState(0);
  const [section, setSection] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const ctId = COMPANY_TYPES[companyTab]?.id;
  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
        <WidgetsIcon color="primary" /> Definition Manager
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 12 }}>
        Manage master definitions for dashboard widgets, notification types, and field visibility.
        Control which subscription plans have access to each item.
      </Typography>

      <Paper variant="outlined" sx={{ mb: 1.5, flexShrink: 0, borderRadius: 1 }}>
        <Tabs value={companyTab} onChange={(_, v) => setCompanyTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 12, textTransform: 'none' } }}>
          {COMPANY_TYPES.map(ct => <Tab key={ct.id} label={ct.name} />)}
        </Tabs>
      </Paper>

      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs value={section} onChange={(_, v) => setSection(v)}
          sx={{ px: 2, flexShrink: 0, minHeight: 40, borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 40, py: 0.5, fontSize: 13, textTransform: 'none' } }}>
          <Tab icon={<WidgetsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Dashboard Widgets" />
          <Tab icon={<NotifIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Notification Types" />
          <Tab icon={<TemplateIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Notification Templates" />
          <Tab icon={<FieldsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Field Definitions" />
        </Tabs>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {section === 0 && <WidgetsPanel ctId={ctId} showSnack={showSnack} />}
          {section === 1 && <NotificationsPanel ctId={ctId} showSnack={showSnack} />}
          {section === 2 && <TemplatesPanel ctId={ctId} showSnack={showSnack} />}
          {section === 3 && <FieldsPanel ctId={ctId} showSnack={showSnack} />}
        </Box>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} variant="filled" sx={{ fontSize: 12 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// Subscription Tier Picker (reused in all 3 dialogs)
// ════════════════════════════════════════════════════════════════════
function SubscriptionTierPicker({ ctId, tierMap, setTierMap }) {
  const tiers = SUBSCRIPTION_TIERS[ctId] || {};
  const tierKeys = Object.keys(tiers);
  if (!tierKeys.length) return null;

  return (
    <Grid size={{ xs: 12 }}>
      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
        Minimum Subscription Tier
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Select the minimum subscription plan required to access this item. Lower tiers won't see it.
      </Typography>
      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontSize: 12 }}>Min. Tier for {COMPANY_TYPES.find(c => c.id === ctId)?.name}</InputLabel>
        <Select value={tierMap[ctId] ?? 1} label={`Min. Tier for ${COMPANY_TYPES.find(c => c.id === ctId)?.name}`}
          onChange={e => setTierMap(prev => ({ ...prev, [ctId]: parseInt(e.target.value) }))}
          sx={{ fontSize: 13 }}>
          {tierKeys.map(t => (
            <MenuItem key={t} value={parseInt(t)} sx={{ fontSize: 13 }}>
              T{t} — {tiers[t]}
            </MenuItem>
          ))}
          <MenuItem value={0} sx={{ fontSize: 13, color: 'error.main' }}>Not Available (hidden)</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );
}

// ════════════════════════════════════════════════════════════════════
// WIDGETS PANEL
// ════════════════════════════════════════════════════════════════════
function WidgetsPanel({ ctId, showSnack }) {
  const [items, setItems] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, isEdit: false, data: {}, tierMap: {} });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [widgetRes, subRes] = await Promise.all([
        RoleManagerService.getWidgets(ctId),
        hasTiers(ctId) ? RoleManagerService.getWidgetSubscriptionsByCompanyType(ctId) : Promise.resolve({ data: [] }),
      ]);
      setItems(widgetRes.data || []);
      const sm = {};
      (subRes.data || []).forEach(s => { sm[s.widget_id] = s.subscription_tier; });
      setSubMap(sm);
    } catch { showSnack('Failed to load widgets', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const d = dialog.data;
    if (!d.widget_key?.trim() || !d.widget_name?.trim()) {
      showSnack('Key and Name are required', 'error');
      return;
    }
    try {
      let itemId = d.id;
      if (dialog.isEdit) {
        await RoleManagerService.updateWidget(d.id, d);
      } else {
        const res = await RoleManagerService.createWidget({ ...d, company_type_id: ctId });
        itemId = res.data?.id;
      }
      // Save subscription tier
      if (hasTiers(ctId) && itemId) {
        const tier = dialog.tierMap[ctId];
        if (tier !== undefined) {
          await RoleManagerService.setWidgetSubscriptions(itemId, [
            { company_type_id: ctId, subscription_tier: tier, is_active: tier > 0 ? 1 : 0 },
          ]);
        }
      }
      showSnack(dialog.isEdit ? 'Widget updated' : 'Widget created');
      setDialog({ open: false, isEdit: false, data: {}, tierMap: {} });
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete widget "${item.widget_name || item.widget_key}"? This may affect existing role configurations.`)) return;
    try {
      await RoleManagerService.deleteWidget(item.id);
      showSnack('Widget deleted');
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const openAdd = () => setDialog({ open: true, isEdit: false, data: { widget_key: '', widget_name: '', widget_group: '', description: '', sort_order: 0 }, tierMap: { [ctId]: 1 } });
  const openEdit = (item) => setDialog({ open: true, isEdit: true, data: { ...item }, tierMap: { [ctId]: subMap[item.id] ?? 1 } });
  const setField = (key, val) => setDialog(prev => ({ ...prev, data: { ...prev.data, [key]: val } }));
  const setTierMap = (fn) => setDialog(prev => ({ ...prev, tierMap: typeof fn === 'function' ? fn(prev.tierMap) : fn }));

  const groups = {};
  items.forEach(w => { const g = w.widget_group || 'Ungrouped'; if (!groups[g]) groups[g] = []; groups[g].push(w); });

  const showTier = hasTiers(ctId);

  if (loading) return <TableSkeleton />;

  return (
    <Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
          {items.length} widget(s) for {COMPANY_TYPES.find(c => c.id === ctId)?.name}
        </Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ fontSize: 11, textTransform: 'none' }}>Add Widget</Button>
      </Box>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 180 }}>Widget Key</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 200 }}>Widget Name</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Group</TableCell>
              {showTier && <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Min. Plan</TableCell>}
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx }}>Description</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 60 }}>Order</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 90 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groups).map(([groupName, groupItems]) => (
              <React.Fragment key={groupName}>
                <TableRow>
                  <TableCell colSpan={showTier ? 7 : 6} sx={{ ...cellSx, bgcolor: 'grey.50', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.5 }}>
                    {groupName} <Chip label={groupItems.length} size="small" sx={{ height: 16, fontSize: 9, ml: 0.5 }} />
                  </TableCell>
                </TableRow>
                {groupItems.map(w => (
                  <TableRow key={w.id} hover>
                    <TableCell sx={cellSx}>
                      <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{w.widget_key}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>{w.widget_name}</TableCell>
                    <TableCell sx={cellSx}>
                      {w.widget_group && <Chip label={w.widget_group} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                    </TableCell>
                    {showTier && (
                      <TableCell sx={cellSx}>
                        {subMap[w.id] !== undefined ? (
                          <Chip label={getTierLabel(ctId, subMap[w.id])} size="small" color={TIER_COLORS[subMap[w.id]] || 'default'}
                            variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                        ) : <Chip label="All Plans" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />}
                      </TableCell>
                    )}
                    <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{w.description || '-'}</TableCell>
                    <TableCell align="center" sx={cellSx}>{w.sort_order}</TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <IconButton size="small" onClick={() => openEdit(w)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(w)} sx={{ p: 0.25, ml: 0.5, '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={showTier ? 7 : 6} align="center" sx={{ ...cellSx, py: 4, color: 'text.secondary' }}>
                No widgets defined. Click "Add Widget" to create one.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16 }}>{dialog.isEdit ? 'Edit Widget' : 'Add Widget'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Widget Key" fullWidth size="small" value={dialog.data.widget_key || ''}
                onChange={e => setField('widget_key', e.target.value)} disabled={dialog.isEdit}
                helperText={!dialog.isEdit ? 'Unique identifier (e.g. salesTodayCard)' : ''}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 13 } } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Widget Name" fullWidth size="small" value={dialog.data.widget_name || ''}
                onChange={e => setField('widget_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Group" fullWidth size="small" value={dialog.data.widget_group || ''}
                onChange={e => setField('widget_group', e.target.value)}
                helperText="e.g. CARDS, CHARTS, TABLES" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Sort Order" fullWidth size="small" type="number"
                value={dialog.data.sort_order ?? 0}
                onChange={e => setField('sort_order', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" fullWidth size="small" multiline rows={2}
                value={dialog.data.description || ''}
                onChange={e => setField('description', e.target.value)} />
            </Grid>
            <SubscriptionTierPicker ctId={ctId} tierMap={dialog.tierMap} setTierMap={setTierMap} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSave} size="small"
            disabled={!dialog.data.widget_key?.trim() || !dialog.data.widget_name?.trim()}>
            {dialog.isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL
// ════════════════════════════════════════════════════════════════════
function NotificationsPanel({ ctId, showSnack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, isEdit: false, data: {} });
  const [errors,setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getNotificationTypes(ctId);
      setItems(res.data || []);
    } catch { showSnack('Failed to load notification types', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateForm = (data) => {
    // const d = dialog.data;
    const err = {};

    if (!data.notification_key?.trim()) {
      err.notification_key = "Notification Key is required";
    }
    if (!data.notification_name?.trim()) {
      err.notification_name = "Notification Name is required";
    }
    if (!data.notification_group?.trim()) {
      err.notification_group = "Notification Group is required";
    }
    if (!data.description?.trim()) {
      err.description = "Description is required";
    }
    if (data.sort_order === "" || data.sort_order === null || data.sort_order === undefined) {
      err.sort_order = "Sort Order is required";
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = async () => {
    const d = dialog.data;

    const isValid = validateForm(d);
    if(!isValid) return;

    // if (!d.notification_key?.trim() || !d.notification_name?.trim()) {
    //   showSnack('Key and Name are required', 'error');
    //   return;
    // }
    try {
      if (dialog.isEdit) {
        await RoleManagerService.updateNotificationType(d.id, d);
      } else {
        await RoleManagerService.createNotificationType({ ...d, company_type_id: ctId });
      }
      showSnack(dialog.isEdit ? 'Notification type updated' : 'Notification type created');
      setDialog({ open: false, isEdit: false, data: {} });
      setErrors({});
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete notification type "${item.notification_name || item.notification_key}"?`)) return;
    try {
      await RoleManagerService.deleteNotificationType(item.id);
      showSnack('Notification type deleted');
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to delete', 'error'); }
  };

  

  const openAdd = () => setDialog({ open: true, isEdit: false, data: { notification_key: '', notification_name: '', notification_group: '', description: '', sort_order: 0 } });
  const openEdit = (item) => setDialog({ open: true, isEdit: true, data: { ...item } });
  const setField = (key, val) => {
    setDialog(prev => ({
       ...prev, 
       data: { ...prev.data, [key]: val } }));
    setErrors(prev => ({
      ...prev,
      [key]: ""
    }));
    };

  const groups = {};
  items.forEach(n => { const g = n.notification_group || 'Ungrouped'; if (!groups[g]) groups[g] = []; groups[g].push(n); });

  if (loading) return <TableSkeleton />;

  return (
    <Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
          {items.length} notification type(s) for {COMPANY_TYPES.find(c => c.id === ctId)?.name}
        </Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ fontSize: 11, textTransform: 'none' }}>Add Notification Type</Button>
      </Box>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 200 }}>Notification Key</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 200 }}>Name</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Group</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx }}>Description</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 60 }}>Order</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 90 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groups).map(([groupName, groupItems]) => (
              <React.Fragment key={groupName}>
                <TableRow>
                  <TableCell colSpan={6} sx={{ ...cellSx, bgcolor: 'grey.50', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.5 }}>
                    {groupName} <Chip label={groupItems.length} size="small" sx={{ height: 16, fontSize: 9, ml: 0.5 }} />
                  </TableCell>
                </TableRow>
                {groupItems.map(n => (
                  <TableRow key={n.id} hover>
                    <TableCell sx={cellSx}>
                      <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{n.notification_key}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>{n.notification_name}</TableCell>
                    <TableCell sx={cellSx}>
                      {n.notification_group && <Chip label={n.notification_group} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{n.description || '-'}</TableCell>
                    <TableCell align="center" sx={cellSx}>{n.sort_order}</TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <IconButton size="small" onClick={() => openEdit(n)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(n)} sx={{ p: 0.25, ml: 0.5, '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ ...cellSx, py: 4, color: 'text.secondary' }}>
                No notification types defined. Click "Add Notification Type" to create one.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16 }}>{dialog.isEdit ? 'Edit Notification Type' : 'Add Notification Type'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Notification Key" fullWidth size="small" value={dialog.data.notification_key || ''}
                onChange={e => setField('notification_key', e.target.value)} disabled={dialog.isEdit}
                // helperText={!dialog.isEdit ? 'e.g. order_placed' : ''}
                error={!!errors.notification_key}
                helperText={errors.notification_key}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 13 } } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Name" fullWidth size="small" value={dialog.data.notification_name || ''}
                onChange={e => setField('notification_name', e.target.value)}
                error={!!errors.notification_name}
                helperText={errors.notification_key}
                />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Group" fullWidth size="small" value={dialog.data.notification_group || ''}
                onChange={e => setField('notification_group', e.target.value)}
                // helperText="e.g. Orders, Inventory, HR" 
                 error={!!errors.notification_group}
                helperText={errors.notification_group}
                />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Sort Order" fullWidth size="small" type="number"
                value={dialog.data.sort_order ?? 0}
                onChange={e => setField('sort_order', parseInt(e.target.value) || 0)} 
                error={!!errors.sort_order}
                helperText={errors.sort_order}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" fullWidth size="small" multiline rows={2}
                value={dialog.data.description || ''} onChange={e => setField('description', e.target.value)} 
                error={!!errors.description}
                helperText={errors.description}
                />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSave} size="small"
            //disabled={!dialog.data.notification_key?.trim() || !dialog.data.notification_name?.trim()}
            // disabled={Object.keys(errors).length > 0}
            >
            {dialog.isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATES PANEL
// ════════════════════════════════════════════════════════════════════

const CHANNELS = ['in_app', 'push', 'email', 'sms', 'whatsapp'];
const CHANNEL_COLORS = { in_app: 'primary', push: 'secondary', email: 'info', sms: 'warning', whatsapp: 'success' };

function TemplatesPanel({ ctId, showSnack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, isEdit: false, data: {} });
  const [filterChannel, setFilterChannel] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getNotificationTemplates(ctId);
      setItems(res.data?.data || []);
    } catch { showSnack('Failed to load templates', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const d = dialog.data;
    if (!d.notification_key?.trim() || !d.channel || !d.body_template?.trim()) {
      showSnack('Key, channel, and body template are required', 'error');
      return;
    }
    try {
      if (dialog.isEdit) {
        await RoleManagerService.updateNotificationTemplate(d.id, d);
      } else {
        await RoleManagerService.createNotificationTemplate({ ...d, company_type_id: ctId });
      }
      showSnack(dialog.isEdit ? 'Template updated' : 'Template created');
      setDialog({ open: false, isEdit: false, data: {} });
      fetchData();
    } catch (e) {
      showSnack(e.response?.data?.error || 'Failed to save', 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete template "${item.notification_key} / ${item.channel}"?`)) return;
    try {
      await RoleManagerService.deleteNotificationTemplate(item.id);
      showSnack('Template deleted');
      fetchData();
    } catch (e) { showSnack(e.response?.data?.error || 'Delete failed', 'error'); }
  };

  const openAdd = () => setDialog({
    open: true, isEdit: false,
    data: { notification_key: '', channel: 'in_app', title_template: '', body_template: '', email_subject_template: '', sms_template_id: '', whatsapp_template_name: '', is_active: 1 },
  });
  const openEdit = (item) => setDialog({ open: true, isEdit: true, data: { ...item } });
  const setField = (key, val) => setDialog(prev => ({ ...prev, data: { ...prev.data, [key]: val } }));

  const filtered = filterChannel ? items.filter(i => i.channel === filterChannel) : items;
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.notification_key]) acc[item.notification_key] = [];
    acc[item.notification_key].push(item);
    return acc;
  }, {});

  if (loading) return <Box sx={{ p: 2 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)}</Box>;

  return (
    <Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">{items.length} template(s)</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Channel</InputLabel>
            <Select value={filterChannel} label="Channel" onChange={e => setFilterChannel(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {CHANNELS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={fetchData}><RefreshIcon /></IconButton>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Template</Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ ...headerCellSx, minWidth: 160 }}>Notification Key</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 100 }}>Channel</TableCell>
              <TableCell sx={{ ...headerCellSx, minWidth: 150 }}>Title Template</TableCell>
              <TableCell sx={{ ...headerCellSx, minWidth: 250 }}>Body Template</TableCell>
              <TableCell sx={{ ...headerCellSx, width: 70 }}>Active</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, width: 80 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(grouped).map(([key, templates]) => (
              templates.map((item, idx) => (
                <TableRow key={item.id} hover sx={{ borderTop: idx === 0 ? '2px solid' : 'none', borderColor: 'divider' }}>
                  {idx === 0 && (
                    <TableCell rowSpan={templates.length} sx={{ ...cellSx, fontFamily: 'monospace', fontWeight: 600, verticalAlign: 'top', borderRight: '1px solid', borderColor: 'divider' }}>
                      {key}
                    </TableCell>
                  )}
                  <TableCell sx={cellSx}>
                    <Chip label={item.channel} size="small" color={CHANNEL_COLORS[item.channel] || 'default'} variant="outlined" sx={{ fontSize: 10 }} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{item.title_template || '-'}</TableCell>
                  <TableCell sx={{ ...cellSx, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.body_template}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={item.is_active ? 'Yes' : 'No'} size="small" color={item.is_active ? 'success' : 'default'} sx={{ fontSize: 10, height: 20 }} />
                  </TableCell>
                  <TableCell align="center" sx={cellSx}>
                    <IconButton size="small" onClick={() => openEdit(item)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item)} sx={{ p: 0.25, ml: 0.5, '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No templates defined for this company type</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{dialog.isEdit ? 'Edit Template' : 'Add Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Notification Key" fullWidth size="small" value={dialog.data.notification_key || ''}
                onChange={e => setField('notification_key', e.target.value)} disabled={dialog.isEdit}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }} placeholder="e.g. late_checkin" />
            </Grid>
            <Grid size={{ xs: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Channel</InputLabel>
                <Select value={dialog.data.channel || ''} label="Channel" onChange={e => setField('channel', e.target.value)} disabled={dialog.isEdit}>
                  {CHANNELS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <FormControlLabel control={<Switch checked={dialog.data.is_active === 1} onChange={e => setField('is_active', e.target.checked ? 1 : 0)} />} label="Active" />
            </Grid>
            <Grid size={{ xs: 12 }}><Divider sx={{ my: 0.5 }} /></Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Title Template" fullWidth size="small" value={dialog.data.title_template || ''}
                onChange={e => setField('title_template', e.target.value)} placeholder="e.g. Late Check-In - {{employee_name}}" helperText="Use {{placeholder}} for dynamic values" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Body Template" fullWidth size="small" multiline rows={3} value={dialog.data.body_template || ''}
                onChange={e => setField('body_template', e.target.value)} placeholder="e.g. You checked in {{late_by}} late at {{time}}" />
            </Grid>
            {(dialog.data.channel === 'email') && (
              <Grid size={{ xs: 12 }}>
                <TextField label="Email Subject Template" fullWidth size="small" value={dialog.data.email_subject_template || ''}
                  onChange={e => setField('email_subject_template', e.target.value)} />
              </Grid>
            )}
            {(dialog.data.channel === 'sms') && (
              <Grid size={{ xs: 6 }}>
                <TextField label="SMS DLT Template ID" fullWidth size="small" value={dialog.data.sms_template_id || ''}
                  onChange={e => setField('sms_template_id', e.target.value)} />
              </Grid>
            )}
            {(dialog.data.channel === 'whatsapp') && (
              <Grid size={{ xs: 6 }}>
                <TextField label="WhatsApp Template Name" fullWidth size="small" value={dialog.data.whatsapp_template_name || ''}
                  onChange={e => setField('whatsapp_template_name', e.target.value)} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{dialog.isEdit ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// FIELDS PANEL
// ════════════════════════════════════════════════════════════════════
function FieldsPanel({ ctId, showSnack }) {
  const [items, setItems] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, isEdit: false, data: {}, tierMap: {} });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fieldRes, subRes] = await Promise.all([
        RoleManagerService.getFields(ctId),
        hasTiers(ctId) ? RoleManagerService.getFieldSubscriptionsByCompanyType(ctId) : Promise.resolve({ data: [] }),
      ]);
      setItems(fieldRes.data || []);
      const sm = {};
      (subRes.data || []).forEach(s => { sm[s.field_id] = s.subscription_tier; });
      setSubMap(sm);
    } catch { showSnack('Failed to load field definitions', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const d = dialog.data;
    if (!d.field_key?.trim() || !d.field_name?.trim()) {
      showSnack('Key and Name are required', 'error');
      return;
    }
    try {
      let itemId = d.id;
      if (dialog.isEdit) {
        await RoleManagerService.updateFieldDefinition(d.id, d);
      } else {
        const res = await RoleManagerService.createFieldDefinition({ ...d, company_type_id: ctId });
        itemId = res.data?.id;
      }
      if (hasTiers(ctId) && itemId) {
        const tier = dialog.tierMap[ctId];
        if (tier !== undefined) {
          await RoleManagerService.setFieldSubscriptions(itemId, [
            { company_type_id: ctId, subscription_tier: tier, is_active: tier > 0 ? 1 : 0 },
          ]);
        }
      }
      showSnack(dialog.isEdit ? 'Field definition updated' : 'Field definition created');
      setDialog({ open: false, isEdit: false, data: {}, tierMap: {} });
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete field definition "${item.field_name || item.field_key}"?`)) return;
    try {
      await RoleManagerService.deleteFieldDefinition(item.id);
      showSnack('Field definition deleted');
      fetchData();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const openAdd = () => setDialog({ open: true, isEdit: false, data: { field_key: '', field_name: '', field_group: '', menu_key: '', description: '' }, tierMap: { [ctId]: 1 } });
  const openEdit = (item) => setDialog({ open: true, isEdit: true, data: { ...item }, tierMap: { [ctId]: subMap[item.id] ?? 1 } });
  const setField = (key, val) => setDialog(prev => ({ ...prev, data: { ...prev.data, [key]: val } }));
  const setTierMap = (fn) => setDialog(prev => ({ ...prev, tierMap: typeof fn === 'function' ? fn(prev.tierMap) : fn }));

  const groups = {};
  items.forEach(f => { const g = f.field_group || f.menu_key || 'Ungrouped'; if (!groups[g]) groups[g] = []; groups[g].push(f); });

  const showTier = hasTiers(ctId);

  if (loading) return <TableSkeleton />;

  return (
    <Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
          {items.length} field definition(s) for {COMPANY_TYPES.find(c => c.id === ctId)?.name}
        </Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ fontSize: 11, textTransform: 'none' }}>Add Field Definition</Button>
      </Box>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 160 }}>Field Key</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 160 }}>Field Name</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Group</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Menu Key</TableCell>
              {showTier && <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 100 }}>Min. Plan</TableCell>}
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx }}>Description</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 90 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groups).map(([groupName, groupItems]) => (
              <React.Fragment key={groupName}>
                <TableRow>
                  <TableCell colSpan={showTier ? 7 : 6} sx={{ ...cellSx, bgcolor: 'grey.50', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.5 }}>
                    {groupName} <Chip label={groupItems.length} size="small" sx={{ height: 16, fontSize: 9, ml: 0.5 }} />
                  </TableCell>
                </TableRow>
                {groupItems.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={cellSx}>
                      <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>{f.field_key}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>{f.field_name}</TableCell>
                    <TableCell sx={cellSx}>
                      {f.field_group && <Chip label={f.field_group} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {f.menu_key ? <Chip label={f.menu_key} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: 10 }} /> : '-'}
                    </TableCell>
                    {showTier && (
                      <TableCell sx={cellSx}>
                        {subMap[f.id] !== undefined ? (
                          <Chip label={getTierLabel(ctId, subMap[f.id])} size="small" color={TIER_COLORS[subMap[f.id]] || 'default'}
                            variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                        ) : <Chip label="All Plans" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />}
                      </TableCell>
                    )}
                    <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{f.description || '-'}</TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <IconButton size="small" onClick={() => openEdit(f)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(f)} sx={{ p: 0.25, ml: 0.5, '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={showTier ? 7 : 6} align="center" sx={{ ...cellSx, py: 4, color: 'text.secondary' }}>
                No field definitions. Click "Add Field Definition" to create one.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16 }}>{dialog.isEdit ? 'Edit Field Definition' : 'Add Field Definition'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Field Key" fullWidth size="small" value={dialog.data.field_key || ''}
                onChange={e => setField('field_key', e.target.value)} disabled={dialog.isEdit}
                helperText={!dialog.isEdit ? 'e.g. customer_phone' : ''}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 13 } } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Field Name" fullWidth size="small" value={dialog.data.field_name || ''}
                onChange={e => setField('field_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Group" fullWidth size="small" value={dialog.data.field_group || ''}
                onChange={e => setField('field_group', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Menu Key" fullWidth size="small" value={dialog.data.menu_key || ''}
                onChange={e => setField('menu_key', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" fullWidth size="small" multiline rows={2}
                value={dialog.data.description || ''} onChange={e => setField('description', e.target.value)} />
            </Grid>
            <SubscriptionTierPicker ctId={ctId} tierMap={dialog.tierMap} setTierMap={setTierMap} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSave} size="small"
            disabled={!dialog.data.field_key?.trim() || !dialog.data.field_name?.trim()}>
            {dialog.isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// Shared
// ════════════════════════════════════════════════════════════════════
function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={36} sx={{ mb: 0.5 }} />
      ))}
    </Box>
  );
}
