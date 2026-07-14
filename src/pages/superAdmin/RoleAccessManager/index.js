import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, MenuItem, Switch, TextField,
  Tooltip, Typography, Checkbox, Select, FormControl, InputLabel,
  Alert, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Snackbar, Skeleton, Divider, Menu, ListItemIcon, ListItemText,
  LinearProgress, Badge
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandLess, ExpandMore, Save as SaveIcon,
  Security as SecurityIcon, Search as SearchIcon,
  ContentCopy as CopyIcon, CompareArrows as CompareIcon,
  Download as ExportIcon, UnfoldMore, UnfoldLess,
  DragIndicator as DragIcon, CheckCircle, Cancel,
  SelectAll as SelectAllIcon, WarningAmber
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import RoleManagerService from '../../../services/roleManager_services';

// ─── Constants ───
const COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale' }, { id: 3, name: 'Sales' },
  { id: 4, name: 'Service' }, { id: 5, name: 'Payroll' },
  { id: 6, name: 'Developer Console' }, { id: 7, name: 'Retail Shop' },
  { id: 8, name: 'Super Admin' }, { id: 9, name: 'Asset Management' },
  { id: 10, name: 'Lead Management' }, { id: 11, name: 'Projects' },
  { id: 12, name: 'Stact' },
];
const ACTION_COLS = ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export', 'can_approve'];
const ACTION_LABELS = { can_view: 'View', can_create: 'Create', can_edit: 'Edit', can_delete: 'Delete', can_export: 'Export', can_approve: 'Approve' };
const SCOPE_OPTIONS = ['all', 'location', 'team', 'self'];
const SCOPE_COLORS = { all: 'success', location: 'info', team: 'warning', self: 'default' };
const CHANNELS = ['notify_in_app', 'notify_push', 'notify_email', 'notify_sms', 'notify_whatsapp'];
const CHANNEL_LABELS = { notify_in_app: 'In-App', notify_push: 'Push', notify_email: 'Email', notify_sms: 'SMS', notify_whatsapp: 'WhatsApp' };
const CHANNEL_COLORS = { notify_in_app: '#1976d2', notify_push: '#2e7d32', notify_email: '#ed6c02', notify_sms: '#9c27b0', notify_whatsapp: '#00897b' };
const SECTION_TABS = ['Menu Access', 'Reports', 'Dashboard', 'Notifications', 'Data Scope', 'Fields'];

// ─── Helpers ───
function flattenTree(nodes) {
  const result = [];
  const traverse = (items, depth = 0) => {
    for (const item of items) {
      result.push({ ...item, _depth: depth });
      if (item.children?.length) traverse(item.children, depth + 1);
    }
  };
  traverse(nodes);
  return result;
}

function collectNodeIds(nodes) {
  const ids = [];
  const walk = (items) => {
    for (const item of items) {
      ids.push(item.id || item.menu_id);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(nodes);
  return ids;
}

function matchesSearch(node, search) {
  const name = (node.message_id || node.menu_name || node.menu_key || '').toLowerCase();
  if (name.includes(search)) return true;
  if (node.children?.length) return node.children.some(c => matchesSearch(c, search));
  return false;
}

function filterTree(nodes, search) {
  if (!search) return nodes;
  return nodes.reduce((acc, node) => {
    const name = (node.message_id || node.menu_name || node.menu_key || '').toLowerCase();
    if (name.includes(search)) {
      acc.push(node);
    } else if (node.children?.length) {
      const filtered = filterTree(node.children, search);
      if (filtered.length) acc.push({ ...node, children: filtered });
    }
    return acc;
  }, []);
}

// ─── Sticky header style ───
const stickyHeaderSx = {
  position: 'sticky', top: 0, zIndex: 2, bgcolor: 'grey.100',
};

const cellSx = { fontSize: 12, py: 0.5 };
const headerCellSx = { ...cellSx, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function RoleAccessManager() {
  const [companyTab, setCompanyTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [section, setSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [roleDialog, setRoleDialog] = useState({ open: false, name: '', description: '', isEdit: false, originalName: '' });
  const [copyAnchor, setCopyAnchor] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const ctId = COMPANY_TYPES[companyTab]?.id;

  const fetchRoles = useCallback(async () => {
    if (!ctId) return;
    setLoading(true);
    try {
      const res = await RoleManagerService.getRoles(ctId);
      setRoles(res.data || []);
      if (!selectedRole && res.data?.length) setSelectedRole(res.data[0].role_name);
    } catch { showSnack('Failed to load roles', 'error'); }
    setLoading(false);
  }, [ctId]);

  useEffect(() => { setSelectedRole(null); setRoles([]); fetchRoles(); }, [fetchRoles]);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleCreateRole = async () => {
    try {
      await RoleManagerService.createRole(ctId, { role_name: roleDialog.name, role_description: roleDialog.description });
      showSnack('Role created');
      setRoleDialog({ open: false, name: '', description: '', isEdit: false, originalName: '' });
      fetchRoles();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to create role', 'error'); }
  };

  const handleRenameRole = async () => {
    try {
      await RoleManagerService.updateRole(ctId, roleDialog.originalName, { role_name: roleDialog.name, role_description: roleDialog.description });
      showSnack('Role updated');
      if (selectedRole === roleDialog.originalName) setSelectedRole(roleDialog.name);
      setRoleDialog({ open: false, name: '', description: '', isEdit: false, originalName: '' });
      fetchRoles();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to update role', 'error'); }
  };

  const handleDeleteRole = async (roleName) => {
    if (!window.confirm(`Delete role "${roleName}"? This removes all L1 defaults for this role.`)) return;
    try {
      await RoleManagerService.deleteRole(ctId, roleName);
      showSnack('Role deleted');
      if (selectedRole === roleName) setSelectedRole(null);
      fetchRoles();
    } catch (e) { showSnack(e.response?.data?.message || 'Failed to delete role', 'error'); }
  };

  // ── Copy from role ──
  const handleCopyFromRole = async (sourceRole) => {
    setCopyAnchor(null);
    if (!window.confirm(`Copy ALL settings from "${sourceRole}" to "${selectedRole}"?\nThis will overwrite all current settings for ${selectedRole}.`)) return;
    showSnack('Copying role settings...', 'info');
    try {
      // Fetch all sections from source
      const [menuRes, reportRes, dashRes, notifRes, scopeRes, fieldRes] = await Promise.all([
        RoleManagerService.getMenuAccess(ctId, sourceRole),
        RoleManagerService.getReportAccess(ctId, sourceRole),
        RoleManagerService.getDashboardAccess(ctId, sourceRole),
        RoleManagerService.getNotificationConfig(ctId, sourceRole),
        RoleManagerService.getDataScope(ctId, sourceRole),
        RoleManagerService.getFieldVisibility(ctId, sourceRole),
      ]);
      // Write all sections to target
      const menuItems = (menuRes.data?.access || []).map(m => {
        const item = { menu_id: m.menu_id };
        ACTION_COLS.forEach(col => { item[col] = m[col] ?? 0; });
        return item;
      });
      const reportItems = (reportRes.data?.access || []).map(r => ({
        report_id: r.report_id, can_view: r.can_view ?? 0, can_export: r.can_export ?? 0,
      }));
      const dashItems = (dashRes.data?.access || []).map(w => ({
        widget_key: w.widget_key, is_visible: w.is_visible ?? 1, sort_order: w.sort_order ?? 0,
      }));
      const notifItems = (notifRes.data?.config || []).map(n => {
        const item = { notification_key: n.notification_key };
        CHANNELS.forEach(ch => { item[ch] = n[ch] ?? 0; });
        return item;
      });
      const scopeItems = (scopeRes.data?.scopes || []).map(d => ({
        menu_id: d.menu_id, data_scope: d.data_scope || 'all',
      }));
      const fieldItems = (fieldRes.data?.visibility || []).map(f => ({
        field_id: f.field_id, is_visible: f.is_visible ?? 1, is_editable: f.is_editable ?? 1,
      }));
      await Promise.all([
        menuItems.length && RoleManagerService.setMenuAccess(ctId, selectedRole, menuItems),
        reportItems.length && RoleManagerService.setReportAccess(ctId, selectedRole, reportItems),
        dashItems.length && RoleManagerService.setDashboardAccess(ctId, selectedRole, dashItems),
        notifItems.length && RoleManagerService.setNotificationConfig(ctId, selectedRole, notifItems),
        scopeItems.length && RoleManagerService.setDataScope(ctId, selectedRole, scopeItems),
        fieldItems.length && RoleManagerService.setFieldVisibility(ctId, selectedRole, fieldItems),
      ].filter(Boolean));
      showSnack(`Settings copied from "${sourceRole}" to "${selectedRole}"`);
      // Force re-render of current section
      setSection(prev => { const temp = prev; setSection(-1); return temp; });
      setTimeout(() => setSection(section), 50);
    } catch { showSnack('Failed to copy role settings', 'error'); }
  };

  // ── Export CSV ──
  const handleExport = async () => {
    showSnack('Generating export...', 'info');
    try {
      const [menuRes, reportRes, dashRes, notifRes, scopeRes, fieldRes] = await Promise.all([
        RoleManagerService.getMenuAccess(ctId, selectedRole),
        RoleManagerService.getReportAccess(ctId, selectedRole),
        RoleManagerService.getDashboardAccess(ctId, selectedRole),
        RoleManagerService.getNotificationConfig(ctId, selectedRole),
        RoleManagerService.getDataScope(ctId, selectedRole),
        RoleManagerService.getFieldVisibility(ctId, selectedRole),
      ]);
      let csv = `Role Access Export: ${selectedRole} — ${COMPANY_TYPES[companyTab]?.name}\n\n`;

      csv += 'MENU ACCESS\nMenu,View,Create,Edit,Delete,Export,Approve\n';
      (menuRes.data?.access || []).forEach(m => {
        csv += `${m.menu_key || m.menu_id},${ACTION_COLS.map(c => m[c] ?? 0).join(',')}\n`;
      });

      csv += '\nREPORTS\nReport,View,Export\n';
      (reportRes.data?.access || []).forEach(r => {
        csv += `${r.report_key || r.report_id},${r.can_view ?? 0},${r.can_export ?? 0}\n`;
      });

      csv += '\nDASHBOARD WIDGETS\nWidget,Visible,Order\n';
      (dashRes.data?.access || []).forEach(w => {
        csv += `${w.widget_key},${w.is_visible ?? 0},${w.sort_order ?? 0}\n`;
      });

      csv += '\nNOTIFICATIONS\nNotification,InApp,Push,Email,SMS,WhatsApp\n';
      (notifRes.data?.config || []).forEach(n => {
        csv += `${n.notification_key},${CHANNELS.map(c => n[c] ?? 0).join(',')}\n`;
      });

      csv += '\nDATA SCOPE\nMenu,Scope\n';
      (scopeRes.data?.scopes || []).forEach(d => {
        csv += `${d.menu_key || d.menu_id},${d.data_scope || 'all'}\n`;
      });

      csv += '\nFIELD VISIBILITY\nField,Menu,Visible,Editable\n';
      (fieldRes.data?.visibility || []).forEach(f => {
        csv += `${f.field_key || f.field_id},${f.menu_key || ''},${f.is_visible ?? 0},${f.is_editable ?? 0}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `role_access_${selectedRole}_${COMPANY_TYPES[companyTab]?.name.replace(/\s/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showSnack('Export downloaded');
    } catch { showSnack('Failed to export', 'error'); }
  };

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
        <SecurityIcon color="primary" /> Role Access Manager
      </Typography>

      {/* Company Type Tabs */}
      <Paper variant="outlined" sx={{ mb: 1.5, flexShrink: 0, borderRadius: 1 }}>
        <Tabs value={companyTab} onChange={(_, v) => setCompanyTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 12, textTransform: 'none' } }}>
          {COMPANY_TYPES.map(ct => <Tab key={ct.id} label={ct.name} />)}
        </Tabs>
      </Paper>

      <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        {/* ── Left: Role List ── */}
        <Grid size={{ xs: 12, md: 2.5 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Roles
              </Typography>
              <Tooltip title="Add Role">
                <IconButton size="small" onClick={() => setRoleDialog({ open: true, name: '', description: '', isEdit: false, originalName: '' })} sx={{ p: 0.25 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={40} sx={{ mx: 1, my: 0.25 }} />)
              ) : roles.map(r => (
                <Box key={r.role_name} onClick={() => setSelectedRole(r.role_name)} sx={{
                  px: 1.5, py: 0.75, mb: 0.25, cursor: 'pointer', borderRadius: 1, fontSize: 13,
                  bgcolor: selectedRole === r.role_name ? 'primary.50' : 'transparent',
                  borderLeft: selectedRole === r.role_name ? '3px solid' : '3px solid transparent',
                  borderColor: selectedRole === r.role_name ? 'primary.main' : 'transparent',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: selectedRole === r.role_name ? 'primary.50' : 'grey.50' },
                }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={selectedRole === r.role_name ? 700 : 500} noWrap sx={{ fontSize: 13 }}>
                      {r.role_name}
                    </Typography>
                    {r.role_description && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 10, display: 'block' }}>
                        {r.role_description}
                      </Typography>
                    )}
                  </Box>
                  {!r.is_system && (
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setRoleDialog({ open: true, name: r.role_name, description: r.role_description || '', isEdit: true, originalName: r.role_name }); }}
                        sx={{ p: 0.25, opacity: 0.4, '&:hover': { opacity: 1, color: 'primary.main' } }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.role_name); }}
                        sx={{ p: 0.25, opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* ── Right: Content Area ── */}
        <Grid size={{ xs: 12, md: 9.5 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedRole ? (
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Toolbar */}
              <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>{selectedRole}</Typography>
                  <Chip label={COMPANY_TYPES[companyTab]?.name} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" startIcon={<CopyIcon />} onClick={(e) => setCopyAnchor(e.currentTarget)}
                    sx={{ fontSize: 11, textTransform: 'none' }}>
                    Copy from Role
                  </Button>
                  <Menu anchorEl={copyAnchor} open={Boolean(copyAnchor)} onClose={() => setCopyAnchor(null)}>
                    {roles.filter(r => r.role_name !== selectedRole).map(r => (
                      <MenuItem key={r.role_name} onClick={() => handleCopyFromRole(r.role_name)}
                        sx={{ fontSize: 13 }}>
                        <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>{r.role_name}</ListItemText>
                      </MenuItem>
                    ))}
                    {roles.filter(r => r.role_name !== selectedRole).length === 0 && (
                      <MenuItem disabled sx={{ fontSize: 13 }}>No other roles</MenuItem>
                    )}
                  </Menu>
                  <Button size="small" startIcon={<CompareIcon />} onClick={() => setCompareOpen(true)}
                    sx={{ fontSize: 11, textTransform: 'none' }}>
                    Compare
                  </Button>
                  <Button size="small" startIcon={<ExportIcon />} onClick={handleExport}
                    sx={{ fontSize: 11, textTransform: 'none' }}>
                    Export
                  </Button>
                </Box>
              </Box>

              {/* Section Tabs */}
              <Tabs value={section} onChange={(_, v) => setSection(v)}
                sx={{ px: 2, flexShrink: 0, minHeight: 36, borderBottom: '1px solid', borderColor: 'divider',
                  '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 12, textTransform: 'none' } }}>
                {SECTION_TABS.map(label => <Tab key={label} label={label} />)}
              </Tabs>

              {/* Section Content */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {section === 0 && <MenuAccessSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 1 && <ReportsSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 2 && <DashboardSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 3 && <NotificationSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 4 && <DataScopeSection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
                {section === 5 && <FieldVisibilitySection ctId={ctId} roleName={selectedRole} showSnack={showSnack} />}
              </Box>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <SecurityIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                <Typography variant="body2">Select a role to manage access permissions</Typography>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Create / Rename Role Dialog */}
      <Dialog open={roleDialog.open} onClose={() => setRoleDialog({ ...roleDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16 }}>{roleDialog.isEdit ? 'Edit' : 'Add'} Role — {COMPANY_TYPES[companyTab]?.name}</DialogTitle>
        <DialogContent>
          <TextField label="Role Name" fullWidth margin="dense" size="small" value={roleDialog.name}
            onChange={e => setRoleDialog({ ...roleDialog, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense" size="small" value={roleDialog.description}
            onChange={e => setRoleDialog({ ...roleDialog, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog({ ...roleDialog, open: false })} size="small">Cancel</Button>
          <Button variant="contained" onClick={roleDialog.isEdit ? handleRenameRole : handleCreateRole} disabled={!roleDialog.name.trim()} size="small">
            {roleDialog.isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Roles Dialog */}
      <CompareRolesDialog open={compareOpen} onClose={() => setCompareOpen(false)} ctId={ctId} roles={roles} currentRole={selectedRole} />

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
// SECTION: Menu Access
// ════════════════════════════════════════════════════════════════════
function MenuAccessSection({ ctId, roleName, showSnack }) {
  const [menus, setMenus] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');

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
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
      // Auto-expand first level
      const exp = {};
      menuTree.forEach(n => { exp[n.id || n.menu_id] = true; });
      setExpanded(exp);
    } catch { showSnack('Failed to load menu access', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (menuId, col) => {
    setOverrides(prev => ({
      ...prev,
      [menuId]: { ...prev[menuId], [col]: prev[menuId]?.[col] ? 0 : 1 }
    }));
  };

  const toggleColumn = (col) => {
    const allIds = collectNodeIds(menus);
    const allChecked = allIds.every(id => overrides[id]?.[col]);
    setOverrides(prev => {
      const next = { ...prev };
      allIds.forEach(id => { next[id] = { ...next[id], [col]: allChecked ? 0 : 1 }; });
      return next;
    });
  };

  const expandAll = () => {
    const exp = {};
    const walk = (nodes) => nodes.forEach(n => {
      if (n.children?.length) { exp[n.id || n.menu_id] = true; walk(n.children); }
    });
    walk(menus);
    setExpanded(exp);
  };

  const collapseAll = () => setExpanded({});

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([menu_id, actions]) => ({ menu_id: parseInt(menu_id), ...actions }));
      await RoleManagerService.setMenuAccess(ctId, roleName, items);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Menu access saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);
  const changedCount = useMemo(() => {
    let count = 0;
    Object.keys(overrides).forEach(id => {
      ACTION_COLS.forEach(col => {
        if ((overrides[id]?.[col] ?? 0) !== (originalOverrides[id]?.[col] ?? 0)) count++;
      });
    });
    return count;
  }, [overrides, originalOverrides]);

  const filteredMenus = useMemo(() => filterTree(menus, search.toLowerCase()), [menus, search]);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <TextField size="small" placeholder="Search menus..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.disabled' }} /> } }}
          sx={{ width: 220, '& .MuiInputBase-root': { fontSize: 12, height: 32 } }} />
        <Button size="small" startIcon={<UnfoldMore />} onClick={expandAll} sx={{ fontSize: 11, textTransform: 'none' }}>Expand All</Button>
        <Button size="small" startIcon={<UnfoldLess />} onClick={collapseAll} sx={{ fontSize: 11, textTransform: 'none' }}>Collapse All</Button>
        <Box sx={{ flex: 1 }} />
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 280 }}>Menu Item</TableCell>
              {ACTION_COLS.map(col => (
                <TableCell key={col} align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 70 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                    <Checkbox size="small" sx={{ p: 0 }}
                      checked={collectNodeIds(menus).length > 0 && collectNodeIds(menus).every(id => overrides[id]?.[col])}
                      indeterminate={collectNodeIds(menus).some(id => overrides[id]?.[col]) && !collectNodeIds(menus).every(id => overrides[id]?.[col])}
                      onChange={() => toggleColumn(col)} />
                    <span>{ACTION_LABELS[col]}</span>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMenus.map(node => (
              <MenuTreeRow key={node.id || node.menu_id} node={node} depth={0} overrides={overrides} toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
            ))}
            {filteredMenus.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={cellSx}>
                {search ? 'No menus matching search' : 'No menu items configured'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save Bar */}
      {hasChanges && (
        <SaveBar saving={saving} changedCount={changedCount} onSave={save}
          onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} />
      )}
    </Box>
  );
}

function MenuTreeRow({ node, depth, overrides, toggle, expanded, setExpanded }) {
  const nodeId = node.id || node.menu_id;
  const hasChildren = node.children?.length > 0;
  const isExpanded = expanded[nodeId] ?? false;
  const depthColors = ['text.primary', 'text.primary', 'text.secondary'];

  return (
    <>
      <TableRow hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
        <TableCell sx={{ ...cellSx, pl: 1.5 + depth * 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }))} sx={{ p: 0.25 }}>
                {isExpanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
              </IconButton>
            ) : <Box sx={{ width: 22 }} />}
            <Typography variant="body2" noWrap sx={{
              fontSize: 12, fontWeight: depth === 0 ? 700 : depth === 1 ? 500 : 400,
              color: depthColors[Math.min(depth, 2)],
            }}>
              {node.message_id || node.menu_name || node.menu_key}
            </Typography>
            {node.menu_type && !['item', 'report'].includes(node.menu_type) && (
              <Chip label={node.menu_type === 'report_category' ? 'category' : node.menu_type} size="small"
                variant="outlined" sx={{ height: 16, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }} />
            )}
          </Box>
        </TableCell>
        {ACTION_COLS.map(col => {
          const isReport = node.menu_type === 'report' || node.menu_type === 'report_category';
          const disabled = isReport && col !== 'can_view' && col !== 'can_export';
          return (
            <TableCell key={col} align="center" sx={cellSx}>
              <Checkbox size="small" sx={{ p: 0 }} checked={!!overrides[nodeId]?.[col]}
                onChange={() => toggle(nodeId, col)} disabled={disabled}
                style={disabled ? { opacity: 0.2 } : undefined} />
            </TableCell>
          );
        })}
      </TableRow>
      {hasChildren && isExpanded && node.children.map(child => (
        <MenuTreeRow key={child.id || child.menu_id} node={child} depth={depth + 1} overrides={overrides}
          toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
      ))}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION: Reports
// ════════════════════════════════════════════════════════════════════
function ReportsSection({ ctId, roleName, showSnack }) {
  const [reports, setReports] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getReportAccess(ctId, roleName);
      const { access = [], reports: reportTree = [] } = res.data || {};
      setReports(reportTree);
      const map = {};
      access.forEach(r => { map[r.report_id] = { can_view: r.can_view ?? 0, can_export: r.can_export ?? 0 }; });
      setOverrides(map);
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
      const exp = {};
      reportTree.forEach(n => { exp[n.id || n.report_id || n.category_id] = true; });
      setExpanded(exp);
    } catch { showSnack('Failed to load report access', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (id, col) => {
    setOverrides(prev => ({
      ...prev, [id]: { ...prev[id], [col]: prev[id]?.[col] ? 0 : 1 }
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([report_id, v]) => ({ report_id: parseInt(report_id), ...v }));
      await RoleManagerService.setReportAccess(ctId, roleName, items);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Report access saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);
  const filteredReports = useMemo(() => filterTree(reports, search.toLowerCase()), [reports, search]);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <TextField size="small" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.disabled' }} /> } }}
          sx={{ width: 220, '& .MuiInputBase-root': { fontSize: 12, height: 32 } }} />
        <Button size="small" startIcon={<UnfoldMore />} onClick={() => {
          const exp = {};
          const walk = (nodes) => nodes.forEach(n => { if (n.children?.length) { exp[n.id || n.report_id || n.category_id] = true; walk(n.children); } });
          walk(reports); setExpanded(exp);
        }} sx={{ fontSize: 11, textTransform: 'none' }}>Expand All</Button>
        <Button size="small" startIcon={<UnfoldLess />} onClick={() => setExpanded({})} sx={{ fontSize: 11, textTransform: 'none' }}>Collapse All</Button>
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 300 }}>Report</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 80 }}>View</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 80 }}>Export</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map(node => (
              <ReportTreeRow key={node.id || node.report_id || node.category_id} node={node} depth={0}
                overrides={overrides} toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
            ))}
            {filteredReports.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center" sx={cellSx}>
                {search ? 'No reports matching search' : 'No reports configured'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasChanges && <SaveBar saving={saving} changedCount={0} onSave={save}
        onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} label="report changes" />}
    </Box>
  );
}

function ReportTreeRow({ node, depth, overrides, toggle, expanded, setExpanded }) {
  const nodeId = node.id || node.report_id || node.category_id;
  const hasChildren = node.children?.length > 0;
  const isExpanded = expanded[nodeId] ?? false;
  const isCategory = hasChildren || node.is_category;

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ ...cellSx, pl: 1.5 + depth * 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }))} sx={{ p: 0.25 }}>
                {isExpanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
              </IconButton>
            ) : <Box sx={{ width: 22 }} />}
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: isCategory ? 700 : 400 }}>
              {node.report_name || node.category_name || node.message_id || node.menu_name || node.menu_key}
            </Typography>
            {isCategory && <Chip label="category" size="small" variant="outlined" sx={{ height: 16, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }} />}
          </Box>
        </TableCell>
        <TableCell align="center" sx={cellSx}>
          <Checkbox size="small" sx={{ p: 0 }} checked={!!overrides[nodeId]?.can_view} onChange={() => toggle(nodeId, 'can_view')} />
        </TableCell>
        <TableCell align="center" sx={cellSx}>
          <Checkbox size="small" sx={{ p: 0 }} checked={!!overrides[nodeId]?.can_export} onChange={() => toggle(nodeId, 'can_export')} />
        </TableCell>
      </TableRow>
      {hasChildren && isExpanded && node.children.map(child => (
        <ReportTreeRow key={child.id || child.report_id || child.category_id} node={child} depth={depth + 1}
          overrides={overrides} toggle={toggle} expanded={expanded} setExpanded={setExpanded} />
      ))}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION: Dashboard Widgets (Drag & Drop)
// ════════════════════════════════════════════════════════════════════
function DashboardSection({ ctId, roleName, showSnack }) {
  const [widgets, setWidgets] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getDashboardAccess(ctId, roleName);
      const { access = [], widgets: widgetList = [] } = res.data || {};
      setWidgets(widgetList);
      const map = {};
      access.forEach(w => { map[w.widget_key] = { is_visible: w.is_visible ?? 1, sort_order: w.sort_order ?? 0 }; });
      // Ensure all widgets have entries
      widgetList.forEach(w => {
        if (!map[w.widget_key]) map[w.widget_key] = { is_visible: 1, sort_order: 0 };
      });
      setOverrides(map);
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
    } catch { showSnack('Failed to load dashboard config', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const grouped = useMemo(() => {
    const groups = {};
    widgets.forEach(w => {
      const g = w.widget_group || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(w);
    });
    // Sort within groups by sort_order
    Object.values(groups).forEach(list => {
      list.sort((a, b) => (overrides[a.widget_key]?.sort_order ?? 0) - (overrides[b.widget_key]?.sort_order ?? 0));
    });
    return groups;
  }, [widgets, overrides]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const groupName = result.source.droppableId;
    const items = [...(grouped[groupName] || [])];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    // Recalculate sort orders
    setOverrides(prev => {
      const next = { ...prev };
      items.forEach((w, i) => {
        next[w.widget_key] = { ...next[w.widget_key], sort_order: i };
      });
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([widget_key, v]) => ({ widget_key, ...v }));
      await RoleManagerService.setDashboardAccess(ctId, roleName, items);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Dashboard config saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {Object.keys(grouped).length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4, fontSize: 13 }}>
            No widgets configured for this company type
          </Typography>
        )}
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.entries(grouped).map(([groupName, groupWidgets]) => (
            <Box key={groupName} sx={{ mb: 2 }}>
              <Box onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 1, px: 1 }}>
                {collapsedGroups[groupName] ? <ExpandMore sx={{ fontSize: 18 }} /> : <ExpandLess sx={{ fontSize: 18 }} />}
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                  {groupName}
                </Typography>
                <Chip label={groupWidgets.length} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Box>
              {!collapsedGroups[groupName] && (
                <Droppable droppableId={groupName}>
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                      {groupWidgets.map((w, index) => (
                        <Draggable key={w.widget_key} draggableId={w.widget_key} index={index}>
                          {(provided, snapshot) => (
                            <Paper ref={provided.innerRef} {...provided.draggableProps}
                              variant="outlined" sx={{
                                mb: 0.5, display: 'flex', alignItems: 'center', px: 1.5, py: 0.75,
                                bgcolor: snapshot.isDragging ? 'primary.50' : 'background.paper',
                                transition: 'background-color 0.15s',
                                '&:hover': { bgcolor: 'grey.50' },
                              }}>
                              <Box {...provided.dragHandleProps} sx={{ mr: 1, display: 'flex', color: 'text.disabled', cursor: 'grab' }}>
                                <DragIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Typography sx={{ flex: 1, fontSize: 13 }}>
                                {w.widget_name || w.widget_key}
                              </Typography>
                              <Switch size="small" checked={!!overrides[w.widget_key]?.is_visible}
                                onChange={() => setOverrides(prev => ({
                                  ...prev, [w.widget_key]: { ...prev[w.widget_key], is_visible: prev[w.widget_key]?.is_visible ? 0 : 1 }
                                }))} />
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              )}
            </Box>
          ))}
        </DragDropContext>
      </Box>
      {hasChanges && <SaveBar saving={saving} onSave={save}
        onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} label="dashboard changes" />}
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION: Notifications
// ════════════════════════════════════════════════════════════════════
function NotificationSection({ ctId, roleName, showSnack }) {
  const [items, setItems] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
    } catch { showSnack('Failed to load notifications', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (key, ch) => {
    setOverrides(prev => ({
      ...prev, [key]: { ...prev[key], [ch]: prev[key]?.[ch] ? 0 : 1 }
    }));
  };

  const toggleAllRow = (key) => {
    const allOn = CHANNELS.every(ch => overrides[key]?.[ch]);
    setOverrides(prev => {
      const next = { ...prev, [key]: { ...prev[key] } };
      CHANNELS.forEach(ch => { next[key][ch] = allOn ? 0 : 1; });
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const list = Object.entries(overrides).map(([notification_key, v]) => ({ notification_key, ...v }));
      await RoleManagerService.setNotificationConfig(ctId, roleName, list);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Notification config saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);

  // Group by notification_group
  const grouped = useMemo(() => {
    const groups = {};
    items.forEach(n => {
      const g = n.notification_group || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });
    return groups;
  }, [items]);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 250 }}>Notification</TableCell>
              {CHANNELS.map(ch => (
                <TableCell key={ch} align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 80 }}>
                  <Box sx={{ color: CHANNEL_COLORS[ch], fontWeight: 700 }}>{CHANNEL_LABELS[ch]}</Box>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 60 }}>All</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(grouped).map(([groupName, groupItems]) => (
              <React.Fragment key={groupName}>
                <TableRow>
                  <TableCell colSpan={7} sx={{ ...cellSx, bgcolor: 'grey.50', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.75 }}>
                    {groupName}
                  </TableCell>
                </TableRow>
                {groupItems.map(n => {
                  const allOn = CHANNELS.every(ch => overrides[n.notification_key]?.[ch]);
                  const someOn = CHANNELS.some(ch => overrides[n.notification_key]?.[ch]);
                  return (
                    <TableRow key={n.notification_key} hover>
                      <TableCell sx={cellSx}>{n.notification_name || n.notification_key}</TableCell>
                      {CHANNELS.map(ch => (
                        <TableCell key={ch} align="center" sx={cellSx}>
                          <Switch size="small"
                            checked={!!overrides[n.notification_key]?.[ch]}
                            onChange={() => toggle(n.notification_key, ch)}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: CHANNEL_COLORS[ch] },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: CHANNEL_COLORS[ch] } }} />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={cellSx}>
                        <Checkbox size="small" sx={{ p: 0 }} checked={allOn} indeterminate={someOn && !allOn}
                          onChange={() => toggleAllRow(n.notification_key)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={cellSx}>No notification types configured</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasChanges && <SaveBar saving={saving} onSave={save}
        onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} label="notification changes" />}
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION: Data Scope
// ════════════════════════════════════════════════════════════════════
function DataScopeSection({ ctId, roleName, showSnack }) {
  const [menus, setMenus] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkScope, setBulkScope] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getDataScope(ctId, roleName);
      const { scopes = [], menus: menuList = [] } = res.data || {};
      setMenus(menuList);
      const map = {};
      scopes.forEach(d => { map[d.menu_id] = d.data_scope || 'all'; });
      setOverrides(map);
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
      const exp = {};
      menuList.forEach(n => { exp[n.id || n.menu_id] = true; });
      setExpanded(exp);
    } catch { showSnack('Failed to load data scope', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const setAllScopes = (scope) => {
    const allIds = collectNodeIds(menus);
    setOverrides(prev => {
      const next = { ...prev };
      allIds.forEach(id => { next[id] = scope; });
      return next;
    });
    setBulkScope('');
  };

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([menu_id, data_scope]) => ({ menu_id: parseInt(menu_id), data_scope }));
      await RoleManagerService.setDataScope(ctId, roleName, items);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Data scope saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>Set All to:</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={bulkScope} displayEmpty onChange={e => { if (e.target.value) setAllScopes(e.target.value); }}
            sx={{ fontSize: 12, height: 32 }}>
            <MenuItem value="" disabled sx={{ fontSize: 12 }}>Choose scope...</MenuItem>
            {SCOPE_OPTIONS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 300 }}>Menu Item</TableCell>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, width: 180 }}>Data Scope</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menus.map(node => (
              <DataScopeTreeRow key={node.id || node.menu_id} node={node} depth={0}
                overrides={overrides} setOverrides={setOverrides} expanded={expanded} setExpanded={setExpanded} />
            ))}
            {menus.length === 0 && (
              <TableRow><TableCell colSpan={2} align="center" sx={cellSx}>No menu items with data scope configured</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasChanges && <SaveBar saving={saving} onSave={save}
        onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} label="scope changes" />}
    </Box>
  );
}

function DataScopeTreeRow({ node, depth, overrides, setOverrides, expanded, setExpanded }) {
  const nodeId = node.id || node.menu_id;
  const hasChildren = node.children?.length > 0;
  const isExpanded = expanded[nodeId] ?? false;
  const scope = overrides[nodeId] || 'all';

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ ...cellSx, pl: 1.5 + depth * 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => setExpanded(prev => ({ ...prev, [nodeId]: !isExpanded }))} sx={{ p: 0.25 }}>
                {isExpanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
              </IconButton>
            ) : <Box sx={{ width: 22 }} />}
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: depth === 0 ? 700 : 400 }}>
              {node.message_id || node.menu_name || node.menu_key}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={cellSx}>
          <Chip label={scope.charAt(0).toUpperCase() + scope.slice(1)} size="small" color={SCOPE_COLORS[scope] || 'default'}
            variant={scope === 'all' ? 'filled' : 'outlined'}
            onClick={() => {
              const idx = SCOPE_OPTIONS.indexOf(scope);
              const next = SCOPE_OPTIONS[(idx + 1) % SCOPE_OPTIONS.length];
              setOverrides(prev => ({ ...prev, [nodeId]: next }));
            }}
            sx={{ cursor: 'pointer', fontSize: 11, height: 22, minWidth: 70 }} />
        </TableCell>
      </TableRow>
      {hasChildren && isExpanded && node.children.map(child => (
        <DataScopeTreeRow key={child.id || child.menu_id} node={child} depth={depth + 1}
          overrides={overrides} setOverrides={setOverrides} expanded={expanded} setExpanded={setExpanded} />
      ))}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// SECTION: Field Visibility
// ════════════════════════════════════════════════════════════════════
function FieldVisibilitySection({ ctId, roleName, showSnack }) {
  const [fields, setFields] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [originalOverrides, setOriginalOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RoleManagerService.getFieldVisibility(ctId, roleName);
      const { visibility = [], fields: fieldList = [] } = res.data || {};
      setFields(fieldList);
      const map = {};
      visibility.forEach(f => { map[f.field_id] = { is_visible: f.is_visible ?? 1, is_editable: f.is_editable ?? 1 }; });
      setOverrides(map);
      setOriginalOverrides(JSON.parse(JSON.stringify(map)));
    } catch { showSnack('Failed to load field visibility', 'error'); }
    setLoading(false);
  }, [ctId, roleName]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async () => {
    setSaving(true);
    try {
      const items = Object.entries(overrides).map(([field_id, v]) => ({ field_id: parseInt(field_id), ...v }));
      await RoleManagerService.setFieldVisibility(ctId, roleName, items);
      setOriginalOverrides(JSON.parse(JSON.stringify(overrides)));
      showSnack('Field visibility saved');
    } catch { showSnack('Failed to save', 'error'); }
    setSaving(false);
  };

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(originalOverrides);
  const searchLower = search.toLowerCase();

  // Group by menu_key
  const grouped = useMemo(() => {
    const groups = {};
    fields.forEach(f => {
      const g = f.menu_key || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  }, [fields]);

  // Filter
  const filteredGrouped = useMemo(() => {
    if (!searchLower) return grouped;
    const result = {};
    Object.entries(grouped).forEach(([g, list]) => {
      const filtered = list.filter(f => (f.field_name || f.field_key || '').toLowerCase().includes(searchLower));
      if (filtered.length) result[g] = filtered;
    });
    return result;
  }, [grouped, searchLower]);

  if (loading) return <SectionSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <TextField size="small" placeholder="Search fields..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.disabled' }} /> } }}
          sx={{ width: 220, '& .MuiInputBase-root': { fontSize: 12, height: 32 } }} />
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, ...stickyHeaderSx, minWidth: 250 }}>Field</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 80 }}>Visible</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, ...stickyHeaderSx, width: 80 }}>Editable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(filteredGrouped).map(([groupName, groupFields]) => {
              const collapsed = collapsedGroups[groupName];
              return (
                <React.Fragment key={groupName}>
                  <TableRow sx={{ cursor: 'pointer' }} onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))}>
                    <TableCell colSpan={3} sx={{ ...cellSx, bgcolor: 'grey.50', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {collapsed ? <ExpandMore sx={{ fontSize: 14 }} /> : <ExpandLess sx={{ fontSize: 14 }} />}
                        {groupName}
                        <Chip label={groupFields.length} size="small" sx={{ height: 16, fontSize: 9, ml: 0.5 }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                  {!collapsed && groupFields.map(f => (
                    <TableRow key={f.field_id} hover>
                      <TableCell sx={cellSx}>{f.field_name || f.field_key}</TableCell>
                      <TableCell align="center" sx={cellSx}>
                        <Switch size="small" checked={!!overrides[f.field_id]?.is_visible}
                          onChange={() => {
                            setOverrides(prev => {
                              const vis = prev[f.field_id]?.is_visible ? 0 : 1;
                              return { ...prev, [f.field_id]: { ...prev[f.field_id], is_visible: vis, is_editable: vis ? (prev[f.field_id]?.is_editable ?? 1) : 0 } };
                            });
                          }} />
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        <Switch size="small" checked={!!overrides[f.field_id]?.is_editable}
                          disabled={!overrides[f.field_id]?.is_visible}
                          onChange={() => setOverrides(prev => ({
                            ...prev, [f.field_id]: { ...prev[f.field_id], is_editable: prev[f.field_id]?.is_editable ? 0 : 1 }
                          }))} />
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
            {Object.keys(filteredGrouped).length === 0 && (
              <TableRow><TableCell colSpan={3} align="center" sx={cellSx}>
                {search ? 'No fields matching search' : 'No field definitions configured'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {hasChanges && <SaveBar saving={saving} onSave={save}
        onDiscard={() => setOverrides(JSON.parse(JSON.stringify(originalOverrides)))} label="field changes" />}
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════════
// Compare Roles Dialog
// ════════════════════════════════════════════════════════════════════
function CompareRolesDialog({ open, onClose, ctId, roles, currentRole }) {
  const [roleA, setRoleA] = useState('');
  const [roleB, setRoleB] = useState('');
  const [compareTab, setCompareTab] = useState(0);
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && currentRole) {
      setRoleA(currentRole);
      setRoleB(roles.find(r => r.role_name !== currentRole)?.role_name || '');
    }
  }, [open, currentRole, roles]);

  const loadComparison = async () => {
    if (!roleA || !roleB) return;
    setLoading(true);
    try {
      const [menuA, menuB] = await Promise.all([
        RoleManagerService.getMenuAccess(ctId, roleA),
        RoleManagerService.getMenuAccess(ctId, roleB),
      ]);
      setDataA(menuA.data);
      setDataB(menuB.data);
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => { if (open && roleA && roleB) loadComparison(); }, [roleA, roleB, open]);

  const diffs = useMemo(() => {
    if (!dataA || !dataB) return [];
    const accessA = {};
    (dataA.access || []).forEach(m => { accessA[m.menu_id] = m; });
    const accessB = {};
    (dataB.access || []).forEach(m => { accessB[m.menu_id] = m; });

    const allIds = new Set([...Object.keys(accessA), ...Object.keys(accessB)]);
    const results = [];
    allIds.forEach(id => {
      const a = accessA[id] || {};
      const b = accessB[id] || {};
      const colDiffs = ACTION_COLS.filter(col => (a[col] ?? 0) !== (b[col] ?? 0));
      if (colDiffs.length) {
        results.push({ menu_id: id, menu_key: a.menu_key || b.menu_key || id, diffs: colDiffs, a, b });
      }
    });
    return results;
  }, [dataA, dataB]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CompareIcon /> Compare Roles
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ fontSize: 12 }}>Role A</InputLabel>
            <Select value={roleA} label="Role A" onChange={e => setRoleA(e.target.value)} sx={{ fontSize: 13 }}>
              {roles.map(r => <MenuItem key={r.role_name} value={r.role_name} sx={{ fontSize: 13 }}>{r.role_name}</MenuItem>)}
            </Select>
          </FormControl>
          <CompareIcon sx={{ alignSelf: 'center', color: 'text.disabled' }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ fontSize: 12 }}>Role B</InputLabel>
            <Select value={roleB} label="Role B" onChange={e => setRoleB(e.target.value)} sx={{ fontSize: 13 }}>
              {roles.map(r => <MenuItem key={r.role_name} value={r.role_name} sx={{ fontSize: 13 }}>{r.role_name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {diffs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <CheckCircle sx={{ fontSize: 40, mb: 1, color: 'success.main', opacity: 0.5 }} />
                <Typography variant="body2">
                  {roleA && roleB ? 'No differences found in menu access' : 'Select two roles to compare'}
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={headerCellSx}>Menu</TableCell>
                    <TableCell sx={headerCellSx}>Permission</TableCell>
                    <TableCell align="center" sx={{ ...headerCellSx, color: 'primary.main' }}>{roleA}</TableCell>
                    <TableCell align="center" sx={{ ...headerCellSx, color: 'secondary.main' }}>{roleB}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diffs.map(d => d.diffs.map(col => (
                    <TableRow key={`${d.menu_id}-${col}`} hover>
                      <TableCell sx={cellSx}>{d.menu_key}</TableCell>
                      <TableCell sx={cellSx}>{ACTION_LABELS[col]}</TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {d.a[col] ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : <Cancel sx={{ fontSize: 16, color: 'error.main', opacity: 0.4 }} />}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {d.b[col] ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : <Cancel sx={{ fontSize: 16, color: 'error.main', opacity: 0.4 }} />}
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, pl: 2 }}>
          {diffs.length > 0 && `${diffs.reduce((s, d) => s + d.diffs.length, 0)} difference(s) found`}
        </Typography>
        <Button onClick={onClose} size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ════════════════════════════════════════════════════════════════════
// Shared Components
// ════════════════════════════════════════════════════════════════════
function SaveBar({ saving, changedCount, onSave, onDiscard, label = 'unsaved changes' }) {
  return (
    <Box sx={{
      px: 2, py: 1, borderTop: '1px solid', borderColor: 'warning.light', bgcolor: 'warning.50',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmber sx={{ fontSize: 16, color: 'warning.main' }} />
        <Typography variant="body2" sx={{ fontSize: 12, color: 'warning.dark' }}>
          {changedCount ? `${changedCount} ${label}` : `Unsaved ${label}`}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" onClick={onDiscard} sx={{ fontSize: 11, textTransform: 'none' }}>Discard</Button>
        <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
          onClick={onSave} disabled={saving} sx={{ fontSize: 11, textTransform: 'none' }}>
          Save
        </Button>
      </Box>
    </Box>
  );
}

function SectionSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={36} sx={{ mb: 0.5 }} />
      ))}
    </Box>
  );
}
