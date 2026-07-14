import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, MenuItem, Switch, TextField,
  Tooltip, Typography, Checkbox, Select, FormControl, InputLabel, FormControlLabel,
  Alert, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Snackbar
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandLess, ExpandMore, Save as SaveIcon, Refresh as RefreshIcon,
  Security as SecurityIcon, Visibility, VisibilityOff
} from '@mui/icons-material';
import RoleManagerService from '../../../services/roleManager_services';

const COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale' },
  { id: 3, name: 'Sales' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Payroll' },
  { id: 6, name: 'Developer Console' },
  { id: 7, name: 'Retail Shop' },
  { id: 8, name: 'Super Admin' },
  { id: 9, name: 'Asset Management' },
  { id: 10, name: 'Lead Management' },
  { id: 11, name: 'Projects' },
  { id: 12, name: 'Stact' },
];

const ACTION_COLS = ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export', 'can_approve'];
const ACTION_LABELS = { can_view: 'View', can_create: 'Create', can_edit: 'Edit', can_delete: 'Delete', can_export: 'Export', can_approve: 'Approve' };
const SCOPE_OPTIONS = ['all', 'location', 'team', 'self'];

// ---- Main Component ----
export default function RoleManager() {
  const [companyTab, setCompanyTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [section, setSection] = useState(0); // 0=Menus, 1=Dashboard, 2=Notifications, 3=DataScope, 4=FieldVis
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [roleDialog, setRoleDialog] = useState({ open: false, name: '', description: '', isEdit: false });

  const ctId = COMPANY_TYPES[companyTab]?.id;

  // ---- Fetch roles ----
  const fetchRoles = useCallback(async () => {
    if (!ctId) return;
    setLoading(true);
    try {
      const res = await RoleManagerService.getRoles(ctId);
      setRoles(res.data || []);
      if (!selectedRole && res.data?.length) setSelectedRole(res.data[0].role_name);
    } catch (e) {
      showSnack('Failed to load roles', 'error');
    }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { setSelectedRole(null); setRoles([]); fetchRoles(); }, [fetchRoles]);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  // ---- Role CRUD ----
  const handleCreateRole = async () => {
    try {
      setSaving(true);
      await RoleManagerService.createRole(ctId, { role_name: roleDialog.name, role_description: roleDialog.description });
      showSnack('Role created');
      setRoleDialog({ open: false, name: '', description: '', isEdit: false });
      fetchRoles();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Failed to create role', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteRole = async (roleName) => {
    if (!window.confirm(`Delete role "${roleName}"? This removes all L1 defaults for this role.`)) return;
    try {
      setSaving(true);
      await RoleManagerService.deleteRole(ctId, roleName);
      showSnack('Role deleted');
      if (selectedRole === roleName) setSelectedRole(null);
      fetchRoles();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Failed to delete role', 'error');
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon /> L1 Role Defaults Manager
      </Typography>

      {/* Company Type Tabs */}
      <Tabs value={companyTab} onChange={(_, v) => setCompanyTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1, flexShrink: 0 }}>
        {COMPANY_TYPES.map(ct => <Tab key={ct.id} label={ct.name} />)}
      </Tabs>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left: Role List */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Roles</Typography>
                <Tooltip title="Add Role">
                  <IconButton size="small" onClick={() => setRoleDialog({ open: true, name: '', description: '', isEdit: false })}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {loading ? <CircularProgress size={24} /> : roles.map(r => (
                <Box key={r.role_name} sx={{
                  p: 1, mb: 0.5, cursor: 'pointer', borderRadius: 1,
                  bgcolor: selectedRole === r.role_name ? 'primary.light' : 'transparent',
                  color: selectedRole === r.role_name ? 'primary.contrastText' : 'text.primary',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  '&:hover': { bgcolor: selectedRole === r.role_name ? 'primary.light' : 'action.hover' }
                }} onClick={() => setSelectedRole(r.role_name)}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{r.role_name}</Typography>
                    {r.role_description && <Typography variant="caption" sx={{ opacity: 0.7 }}>{r.role_description}</Typography>}
                  </Box>
                  {!r.is_system && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.role_name); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Section Tabs + Content */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedRole ? (
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {selectedRole} <Chip label={`Company Type: ${COMPANY_TYPES[companyTab]?.name}`} size="small" sx={{ ml: 1 }} />
                </Typography>
                <Tabs value={section} onChange={(_, v) => setSection(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Tab label="Menu Access" />
                  <Tab label="Dashboard" />
                  <Tab label="Notifications" />
                  <Tab label="Data Scope" />
                  <Tab label="Field Visibility" />
                </Tabs>
                {section === 0 && <MenuAccessSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 1 && <DashboardSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 2 && <NotificationSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 3 && <DataScopeSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 4 && <FieldVisibilitySection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CardContent><Typography color="text.secondary">Select a role to manage L1 defaults</Typography></CardContent></Card>
          )}
        </Grid>
      </Grid>

      {/* Create Role Dialog */}
      <Dialog open={roleDialog.open} onClose={() => setRoleDialog({ ...roleDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Add Role for {COMPANY_TYPES[companyTab]?.name}</DialogTitle>
        <DialogContent>
          <TextField label="Role Name" fullWidth margin="dense" value={roleDialog.name} onChange={e => setRoleDialog({ ...roleDialog, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense" value={roleDialog.description} onChange={e => setRoleDialog({ ...roleDialog, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog({ ...roleDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRole} disabled={saving || !roleDialog.name.trim()}>
            {saving ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

// ---- Menu Access Section ----
function MenuAccessSection({ ctId, roleName, showSnack }) {
  const [menus, setMenus] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getMenuAccess(ctId, roleName);
      const { access = [], menus: menuTree = [] } = res.data || {};
      setMenus(menuTree);
      const map = {};
      access.forEach(m => {
        map[m.menu_id] = {};
        ACTION_COLS.forEach(col => { map[m.menu_id][col] = m[col] ?? 0; });
      });
      setOverrides(map);
    } catch (e) { showSnack('Failed to load menu access', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (menuId, col) => {
    setOverrides(prev => ({
      ...prev,
      [menuId]: { ...prev[menuId], [col]: prev[menuId]?.[col] ? 0 : 1 }
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([menu_id, actions]) => ({ menu_id: parseInt(menu_id), ...actions }));
      await RoleManagerService.setMenuAccess(ctId, roleName, items);
      showSnack('Menu access saved');
    } catch (e) { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  // Backend returns pre-built tree with `id` field; normalize to use `id` as key
  const tree = menus;

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={save} disabled={saving}>
          Save Menu Access
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 250 }}>Menu Item</TableCell>
              {ACTION_COLS.map(col => <TableCell key={col} align="center" sx={{ fontWeight: 'bold' }}>{ACTION_LABELS[col]}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {tree.map(node => (
              <MenuTreeRow key={node.id || node.menu_id} node={node} depth={0} overrides={overrides} toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function MenuTreeRow({ node, depth, overrides, toggle, expanded, setExpanded }) {
  const nodeId = node.id || node.menu_id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[nodeId] !== false;

  const getChildStatus = (node, col) => {
    if (!node.children || node.children.length === 0) {
      return {
        checked: !!overrides[node.id || node.menu_id]?.[col],
        indeterminate: false
      };
    }

    const childStatuses = node.children.map(child => getChildStatus(child, col))

    const allChecked = childStatuses.every(c => c.checked)
    const noneChecked = childStatuses.every(c => !c.checked)

    return {
      checked: allChecked,
      indeterminate: !allChecked && !noneChecked
    }
  }

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ pl: 2 + depth * 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren && (
              <IconButton size="small" onClick={() => setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }))}>
                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
            <Typography variant="body2" fontWeight={hasChildren ? 'bold' : 'normal'}>
              {node.message_id || node.menu_name || node.menu_key}
            </Typography>
            {node.menu_type !== 'item' && node.menu_type !== 'report' && (
              <Chip label={node.menu_type === 'report_category' ? 'category' : node.menu_type} size="small" variant="outlined" sx={{ ml: 0.5, height: 18, fontSize: 10 }} />
            )}
          </Box>
        </TableCell>
        {ACTION_COLS.map(col => {
          const isReport = node.menu_type === 'report' || node.menu_type === 'report_category';
          const disabledForReport = isReport && col !== 'can_view' && col !== 'can_export';
          const { checked, indeterminate } = getChildStatus(node, col)
          return (
            <TableCell key={col} align="center">
              <Checkbox size="small" checked={checked} indeterminate={indeterminate}
                onChange={() => toggle(nodeId, col)}
                disabled={disabledForReport || hasChildren} />
            </TableCell>
          );
        })}
      </TableRow>
      {hasChildren && isExpanded && node.children.map(child => (
        <MenuTreeRow key={child.id || child.menu_id} node={child} depth={depth + 1} overrides={overrides} toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
      ))}
    </>
  );
}

// ---- Dashboard Section ----
function DashboardSection({ ctId, roleName, showSnack }) {
  const [widgets, setWidgets] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getDashboardAccess(ctId, roleName);
      const { access = [], widgets: widgetList = [] } = res.data || {};
      setWidgets(widgetList);
      const map = {};
      access.forEach(w => { map[w.widget_key] = { is_visible: w.is_visible ?? 1, sort_order: w.sort_order ?? 0 }; });
      setOverrides(map);
    } catch (e) { showSnack('Failed to load dashboard access', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([widget_key, v]) => ({ widget_key, ...v }));
      await RoleManagerService.setDashboardAccess(ctId, roleName, items);
      showSnack('Dashboard access saved');
    } catch (e) { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={save} disabled={saving}>
          Save Dashboard
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Widget</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Visible</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {widgets.map(w => (
              <TableRow key={w.widget_key} hover>
                <TableCell>{w.widget_name || w.widget_key}</TableCell>
                <TableCell>{w.widget_group || '-'}</TableCell>
                <TableCell align="center">
                  <Switch size="small" checked={!!overrides[w.widget_key]?.is_visible}
                    onChange={() => setOverrides(prev => ({
                      ...prev, [w.widget_key]: { ...prev[w.widget_key], is_visible: prev[w.widget_key]?.is_visible ? 0 : 1 }
                    }))} />
                </TableCell>
                <TableCell>
                  <TextField size="small" type="number" sx={{ width: 60 }}
                    value={overrides[w.widget_key]?.sort_order ?? 0}
                    onChange={e => setOverrides(prev => ({
                      ...prev, [w.widget_key]: { ...prev[w.widget_key], sort_order: parseInt(e.target.value) || 0 }
                    }))} />
                </TableCell>
              </TableRow>
            ))}
            {widgets.length === 0 && <TableRow><TableCell colSpan={4} align="center">No widgets configured for this company type</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---- Notification Section ----
function NotificationSection({ ctId, roleName, showSnack }) {
  const [items, setItems] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const CHANNELS = ['notify_in_app', 'notify_push', 'notify_email', 'notify_sms', 'notify_whatsapp'];
  const CHANNEL_LABELS = { notify_in_app: 'In-App', notify_push: 'Push', notify_email: 'Email', notify_sms: 'SMS', notify_whatsapp: 'WhatsApp' };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getNotificationConfig(ctId, roleName);
      const { config = [], notificationTypes = [] } = res.data || {};
      setItems(notificationTypes);
      const map = {};
      config.forEach(n => {
        map[n.notification_key] = {};
        CHANNELS.forEach(ch => { map[n.notification_key][ch] = n[ch] ?? 0; });
      });
      setOverrides(map);
    } catch (e) { showSnack('Failed to load notifications', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (key, ch) => {
    setOverrides(prev => ({
      ...prev, [key]: { ...prev[key], [ch]: prev[key]?.[ch] ? 0 : 1 }
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const list = Object.entries(overrides).map(([notification_key, v]) => ({ notification_key, ...v }));
      await RoleManagerService.setNotificationConfig(ctId, roleName, list);
      showSnack('Notification config saved');
    } catch (e) { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={save} disabled={saving}>
          Save Notifications
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Notification</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
              {CHANNELS.map(ch => <TableCell key={ch} align="center" sx={{ fontWeight: 'bold' }}>{CHANNEL_LABELS[ch]}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(n => (
              <TableRow key={n.notification_key} hover>
                <TableCell>{n.notification_name || n.notification_key}</TableCell>
                <TableCell>{n.notification_group || '-'}</TableCell>
                {CHANNELS.map(ch => (
                  <TableCell key={ch} align="center">
                    <Checkbox size="small" checked={!!overrides[n.notification_key]?.[ch]} onChange={() => toggle(n.notification_key, ch)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center">No notification types configured</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---- Data Scope Section ----
function DataScopeSection({ ctId, roleName, showSnack }) {
  const [menus, setMenus] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getDataScope(ctId, roleName);
      const { scopes = [], menus: menuList = [] } = res.data || {};
      setMenus(menuList);
      const map = {};
      scopes.forEach(d => { map[d.menu_id] = d.data_scope || 'all'; });
      setOverrides(map);
    } catch (e) { showSnack('Failed to load data scope', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([menu_id, data_scope]) => ({ menu_id: parseInt(menu_id), data_scope }));
      await RoleManagerService.setDataScope(ctId, roleName, items);
      showSnack('Data scope saved');
    } catch (e) { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={save} disabled={saving}>
          Save Data Scope
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Menu Item</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 200 }}>Data Scope</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flattenTree(menus).map(m => (
              <TableRow key={m.id || m.menu_id} hover>
                <TableCell>{m.message_id || m.menu_name || m.menu_key}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select value={overrides[m.id || m.menu_id] || 'all'}
                      onChange={e => setOverrides(prev => ({ ...prev, [m.id || m.menu_id]: e.target.value }))}>
                      {SCOPE_OPTIONS.map(s => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
            {menus.length === 0 && <TableRow><TableCell colSpan={2} align="center">No menu items with data scope configured</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---- Field Visibility Section ----
function FieldVisibilitySection({ ctId, roleName, showSnack }) {
  const [fields, setFields] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getFieldVisibility(ctId, roleName);
      const { visibility = [], fields: fieldList = [] } = res.data || {};
      setFields(fieldList);
      const map = {};
      visibility.forEach(f => { map[f.field_id] = { is_visible: f.is_visible ?? 1, is_editable: f.is_editable ?? 1 }; });
      setOverrides(map);
    } catch (e) { showSnack('Failed to load field visibility', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([field_id, v]) => ({ field_id: parseInt(field_id), ...v }));
      await RoleManagerService.setFieldVisibility(ctId, roleName, items);
      showSnack('Field visibility saved');
    } catch (e) { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} onClick={save} disabled={saving}>
          Save Field Visibility
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Menu</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Visible</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Editable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map(f => (
              <TableRow key={f.field_id} hover>
                <TableCell>{f.field_name || f.field_key}</TableCell>
                <TableCell>{f.menu_key || '-'}</TableCell>
                <TableCell align="center">
                  <Switch size="small" checked={!!overrides[f.field_id]?.is_visible}
                    onChange={() => setOverrides(prev => ({
                      ...prev, [f.field_id]: { ...prev[f.field_id], is_visible: prev[f.field_id]?.is_visible ? 0 : 1 }
                    }))} />
                </TableCell>
                <TableCell align="center">
                  <Switch size="small" checked={!!overrides[f.field_id]?.is_editable}
                    disabled={!overrides[f.field_id]?.is_visible}
                    onChange={() => setOverrides(prev => ({
                      ...prev, [f.field_id]: { ...prev[f.field_id], is_editable: prev[f.field_id]?.is_editable ? 0 : 1 }
                    }))} />
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && <TableRow><TableCell colSpan={4} align="center">No field definitions configured for this company type</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---- Helpers ----
function flattenTree(nodes) {
  const result = [];
  const traverse = (items) => {
    for (const item of items) {
      result.push(item);
      if (item.children) traverse(item.children);
    }
  };
  traverse(nodes);
  return result;
}

function buildMenuTree(flatMenus) {
  const map = {};
  const roots = [];
  flatMenus.forEach(m => { map[m.menu_id] = { ...m, children: [] }; });
  flatMenus.forEach(m => {
    if (m.parent_id && map[m.parent_id]) {
      map[m.parent_id].children.push(map[m.menu_id]);
    } else {
      roots.push(map[m.menu_id]);
    }
  });
  return roots;
}
