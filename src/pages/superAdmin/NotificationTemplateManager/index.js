import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, TextField, Typography, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert,
  Chip, Select, FormControl, InputLabel, MenuItem, Skeleton, Switch,
  FormControlLabel, Divider,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  Notifications as NotificationsIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';
import RoleManagerService from '../../../services/roleManager_services';

const COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale' }, { id: 3, name: 'Sales' },
  { id: 4, name: 'Service' }, { id: 5, name: 'Payroll' },
  { id: 7, name: 'Retail Shop' }, { id: 9, name: 'Asset Management' },
  { id: 10, name: 'Lead Management' }, { id: 11, name: 'Projects' },
  { id: 12, name: 'Stact' },
];

const CHANNELS = ['in_app', 'push', 'email', 'sms', 'whatsapp'];

const CHANNEL_COLORS = {
  in_app: 'primary', push: 'secondary', email: 'info', sms: 'warning', whatsapp: 'success',
};

const cellSx = { fontSize: 12, py: 0.75 };
const headerCellSx = { ...cellSx, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };

function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)}
    </Box>
  );
}

export default function NotificationTemplateManager() {
  const [companyTab, setCompanyTab] = useState(3); // default Payroll
  const [section, setSection] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const ctId = COMPANY_TYPES[companyTab]?.id;
  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Notification Template Manager
      </Typography>

      <Tabs value={companyTab} onChange={(_, v) => setCompanyTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1 }}>
        {COMPANY_TYPES.map(ct => <Tab key={ct.id} label={ct.name} />)}
      </Tabs>

      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs value={section} onChange={(_, v) => setSection(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
          <Tab label="Templates" sx={{ minHeight: 40 }} />
          <Tab label="Notification Types" sx={{ minHeight: 40 }} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {section === 0 && <TemplatesPanel ctId={ctId} showSnack={showSnack} />}
          {section === 1 && <NotificationTypesPanel ctId={ctId} showSnack={showSnack} />}
        </Box>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

// ============================================================
// TEMPLATES PANEL
// ============================================================

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

  if (loading) return <TableSkeleton />;

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
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>
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

// ============================================================
// NOTIFICATION TYPES PANEL (read from sa_notification_types)
// ============================================================

function NotificationTypesPanel({ ctId, showSnack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, isEdit: false, data: {} });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getNotificationTypesForCompanyType(ctId);
      setItems(res.data?.data || res.data || []);
    } catch { showSnack('Failed to load notification types', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const d = dialog.data;
    if (!d.notification_key?.trim() || !d.notification_name?.trim()) {
      showSnack('Key and name are required', 'error');
      return;
    }
    try {
      if (dialog.isEdit) {
        await RoleManagerService.updateNotificationType(d.id, d);
      } else {
        await RoleManagerService.createNotificationType({ ...d, company_type_id: ctId });
      }
      showSnack(dialog.isEdit ? 'Updated' : 'Created');
      setDialog({ open: false, isEdit: false, data: {} });
      fetchData();
    } catch (e) { showSnack(e.response?.data?.error || 'Save failed', 'error'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.notification_name}"?`)) return;
    try {
      await RoleManagerService.deleteNotificationType(item.id);
      showSnack('Deleted');
      fetchData();
    } catch (e) { showSnack('Delete failed', 'error'); }
  };

  const openAdd = () => setDialog({ open: true, isEdit: false, data: { notification_key: '', notification_name: '', notification_group: '', description: '', sort_order: 0 } });
  const openEdit = (item) => setDialog({ open: true, isEdit: true, data: { ...item } });
  const setField = (key, val) => setDialog(prev => ({ ...prev, data: { ...prev.data, [key]: val } }));

  const grouped = items.reduce((acc, item) => {
    const g = item.notification_group || 'other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  if (loading) return <TableSkeleton />;

  return (
    <Box>
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">{items.length} notification type(s)</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={fetchData}><RefreshIcon /></IconButton>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Type</Button>
        </Box>
      </Box>

      {Object.entries(grouped).map(([group, groupItems]) => (
        <Box key={group}>
          <Typography variant="overline" sx={{ px: 2, py: 0.5, display: 'block', bgcolor: 'grey.50', fontWeight: 700, letterSpacing: 1 }}>{group}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...headerCellSx, minWidth: 180 }}>Key</TableCell>
                  <TableCell sx={{ ...headerCellSx, minWidth: 200 }}>Name</TableCell>
                  <TableCell sx={headerCellSx}>Description</TableCell>
                  <TableCell sx={{ ...headerCellSx, width: 60 }}>Order</TableCell>
                  <TableCell sx={{ ...headerCellSx, width: 60 }}>Active</TableCell>
                  <TableCell align="center" sx={{ ...headerCellSx, width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupItems.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }}>{item.notification_key}</TableCell>
                    <TableCell sx={cellSx}>{item.notification_name}</TableCell>
                    <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{item.description || '-'}</TableCell>
                    <TableCell sx={cellSx}>{item.sort_order}</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip label={item.is_active ? 'Yes' : 'No'} size="small" color={item.is_active ? 'success' : 'default'} sx={{ fontSize: 10, height: 20 }} />
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <IconButton size="small" onClick={() => openEdit(item)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item)} sx={{ p: 0.25, ml: 0.5, '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {items.length === 0 && (
        <Typography align="center" sx={{ py: 4, color: 'text.secondary' }}>No notification types for this company type</Typography>
      )}

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.isEdit ? 'Edit Notification Type' : 'Add Notification Type'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Key" fullWidth size="small" value={dialog.data.notification_key || ''}
                onChange={e => setField('notification_key', e.target.value)} disabled={dialog.isEdit}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace' } } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Name" fullWidth size="small" value={dialog.data.notification_name || ''}
                onChange={e => setField('notification_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Group" fullWidth size="small" value={dialog.data.notification_group || ''}
                onChange={e => setField('notification_group', e.target.value)} placeholder="e.g. attendance, requests, sales" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Sort Order" fullWidth size="small" type="number" value={dialog.data.sort_order || 0}
                onChange={e => setField('sort_order', parseInt(e.target.value) || 0)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" fullWidth size="small" multiline rows={2} value={dialog.data.description || ''}
                onChange={e => setField('description', e.target.value)} />
            </Grid>
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
