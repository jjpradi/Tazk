import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography, Box, Checkbox, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Chip, Tooltip, Snackbar, Alert, CircularProgress, List,
  ListItemButton, ListItemText, Tab, Tabs, Divider,
} from '@mui/material';
import { ArrowDropDownIcon, ArrowRightIcon } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

import {
  listRbacRolesAction,
  getMenuAccessAction,
  getDashboardAccessAction,
  getNotificationConfigAction,
  getDataScopeAction,
  getFieldVisibilityAction,
  updateMenuAccessAction,
  updateDashboardAccessAction,
  updateNotificationConfigAction,
  updateDataScopeAction,
  updateFieldVisibilityAction,
  createRbacRoleAction,
  cloneRbacRoleAction,
  deleteRbacRoleAction,
  resetMenuAccessAction,
} from '../../../redux/actions/rbac_actions';

const ACTION_COLUMNS = ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export', 'can_approve'];
const ACTION_LABELS = { can_view: 'View', can_create: 'Create', can_edit: 'Edit', can_delete: 'Delete', can_export: 'Export', can_approve: 'Approve' };
const SECTION_TABS = ['Menu Access', 'Dashboard', 'Notifications', 'Data Scope', 'Field Visibility'];
const SCOPE_OPTIONS = ['all', 'location', 'team', 'self'];

const toFlag = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const n = Number(value);
  return Number.isNaN(n) ? defaultValue : n ? 1 : 0;
};

const normalizeNotificationRows = (rows = []) =>
  rows.map((row) => ({
    ...row,
    // Product requirement: default both In-App and Push to enabled.
    notify_in_app: toFlag(row.notify_in_app, 1),
    notify_push: toFlag(row.notify_push, 1),
    notify_email: toFlag(row.notify_email, 0),
    notify_sms: toFlag(row.notify_sms, 0),
    notify_whatsapp: toFlag(row.notify_whatsapp, 0),
  }));

const PosRole = () => {
  const dispatch = useDispatch();
  const storage = useMemo(() => getsessionStorage(), []);
  const currentUserRole = storage?.role_name;

  const { roles, menuAccess, dashboardAccess, notificationConfig, dataScope, fieldVisibility, loading, saving } = useSelector(s => s.rbacReducer);

  // Selected role + active tab
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Local editable state
  const [localMenuAccess, setLocalMenuAccess] = useState({});
  const [localDashboard, setLocalDashboard] = useState({});
  const [localNotifications, setLocalNotifications] = useState({});
  const [localDataScope, setLocalDataScope] = useState({});
  const [localFieldVisibility, setLocalFieldVisibility] = useState({});
  const [dirtyRoles, setDirtyRoles] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
  const [changedNotifications, setChangedNotifications] = useState({});

  // Dialogs
  const [createDialog, setCreateDialog] = useState({ open: false, mode: 'create', sourceRole: '' });
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleInherits, setNewRoleInherits] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, roleName: '' });

  // Expanded menu nodes
  const [expandedMenus, setExpandedMenus] = useState({});

  // Load roles on mount
  useEffect(() => {
    dispatch(listRbacRolesAction());
  }, [dispatch]);

  // Auto-select first role
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].role_name);
    }
  }, [roles, selectedRole]);

  // Fetch data for selected role
  useEffect(() => {
    if (!selectedRole) return;
    if (!menuAccess[selectedRole]) dispatch(getMenuAccessAction(selectedRole));
    if (!dashboardAccess[selectedRole]) dispatch(getDashboardAccessAction(selectedRole));
    if (!notificationConfig[selectedRole]) dispatch(getNotificationConfigAction(selectedRole));
    if (!dataScope[selectedRole]) dispatch(getDataScopeAction(selectedRole));
    if (!fieldVisibility[selectedRole]) dispatch(getFieldVisibilityAction(selectedRole));
  }, [selectedRole, dispatch]);

  // Sync Redux → local
  useEffect(() => {
    const updated = {};
    for (const [roleName, data] of Object.entries(menuAccess)) {
      if (!localMenuAccess[roleName] || !dirtyRoles[roleName]?.menus) updated[roleName] = data;
    }
    if (Object.keys(updated).length > 0) setLocalMenuAccess(prev => ({ ...prev, ...updated }));
  }, [menuAccess]);

  useEffect(() => {
    const updated = {};
    for (const [roleName, data] of Object.entries(dashboardAccess)) {
      if (!localDashboard[roleName] || !dirtyRoles[roleName]?.dashboard) updated[roleName] = data;
    }
    if (Object.keys(updated).length > 0) setLocalDashboard(prev => ({ ...prev, ...updated }));
  }, [dashboardAccess]);

  useEffect(() => {
    const updated = {};
    for (const [roleName, data] of Object.entries(notificationConfig)) {
      if (!localNotifications[roleName] || !dirtyRoles[roleName]?.notifications) {
        updated[roleName] = normalizeNotificationRows(data);
      }
    }
    if (Object.keys(updated).length > 0) setLocalNotifications(prev => ({ ...prev, ...updated }));
  }, [notificationConfig]);

  useEffect(() => {
    const updated = {};
    for (const [roleName, data] of Object.entries(dataScope || {})) {
      if (!localDataScope[roleName] || !dirtyRoles[roleName]?.dataScope) updated[roleName] = data;
    }
    if (Object.keys(updated).length > 0) setLocalDataScope(prev => ({ ...prev, ...updated }));
  }, [dataScope]);

  useEffect(() => {
    const updated = {};
    for (const [roleName, data] of Object.entries(fieldVisibility || {})) {
      if (!localFieldVisibility[roleName] || !dirtyRoles[roleName]?.fieldVisibility) updated[roleName] = data;
    }
    if (Object.keys(updated).length > 0) setLocalFieldVisibility(prev => ({ ...prev, ...updated }));
  }, [fieldVisibility]);

  const markDirty = useCallback((roleName, section) => {
    setDirtyRoles(prev => ({
      ...prev,
      [roleName]: { ...(prev[roleName] || {}), [section]: true },
    }));
  }, []);

  // Toggle handlers
  const handleMenuActionToggle = useCallback((menuKey, actionCol) => {
    setLocalMenuAccess(prev => {
      const rows = [...(prev[selectedRole] || [])];
      const idx = rows.findIndex(r => r.menu_key === menuKey);
      if (idx === -1) return prev;
      rows[idx] = { ...rows[idx], [actionCol]: rows[idx][actionCol] === 1 ? 0 : 1 };
      return { ...prev, [selectedRole]: rows };
    });
    markDirty(selectedRole, 'menus');
  }, [selectedRole, markDirty]);

  const handleDashboardToggle = useCallback((widgetKey) => {
    setLocalDashboard(prev => {
      const rows = [...(prev[selectedRole] || [])];
      const idx = rows.findIndex(r => r.widget_key === widgetKey);
      if (idx === -1) return prev;
      rows[idx] = { ...rows[idx], is_visible: rows[idx].is_visible ? 0 : 1 };
      return { ...prev, [selectedRole]: rows };
    });
    markDirty(selectedRole, 'dashboard');
  }, [selectedRole, markDirty]);

  const handleNotificationToggle = useCallback((notifKey, channel) => {
    setLocalNotifications(prev => {
      const rows = [...(prev[selectedRole] || [])];
      const idx = rows.findIndex(r => r.notification_key === notifKey);
      if (idx === -1) return prev;
      rows[idx] = { ...rows[idx], [channel]: rows[idx][channel] ? 0 : 1 };
      
      setChangedNotifications(prevChanges => ({
        ...prevChanges,
        [selectedRole]: {
          ...(prevChanges[selectedRole] || {}),
          [notifKey]: {
            ...(prevChanges[selectedRole]?.[notifKey] || {}),
            [channel]: newValue
          }
        }
      }));
      return { ...prev, [selectedRole]: rows };
    });
    markDirty(selectedRole, 'notifications');
  }, [selectedRole, markDirty]);

  const handleDataScopeChange = useCallback((menuId, newScope) => {
    setLocalDataScope(prev => {
      const rows = [...(prev[selectedRole] || [])];
      const idx = rows.findIndex(r => r.menu_id === menuId);
      if (idx === -1) return prev;
      rows[idx] = { ...rows[idx], data_scope: newScope };
      return { ...prev, [selectedRole]: rows };
    });
    markDirty(selectedRole, 'dataScope');
  }, [selectedRole, markDirty]);

  const handleFieldVisibilityToggle = useCallback((fieldId, field) => {
    setLocalFieldVisibility(prev => {
      const rows = [...(prev[selectedRole] || [])];
      const idx = rows.findIndex(r => r.field_id === fieldId);
      if (idx === -1) return prev;
      rows[idx] = { ...rows[idx], [field]: rows[idx][field] ? 0 : 1 };
      return { ...prev, [selectedRole]: rows };
    });
    markDirty(selectedRole, 'fieldVisibility');
  }, [selectedRole, markDirty]);

  // Save handlers
  const clearDirty = (section) => {
    setDirtyRoles(prev => {
      const r = { ...(prev[selectedRole] || {}) };
      delete r[section];
      return { ...prev, [selectedRole]: r };
    });
  };

  const handleSaveMenuAccess = useCallback(() => {
    const overrides = (localMenuAccess[selectedRole] || []).map(row => ({
      menu_id: row.menu_id, can_view: row.can_view, can_create: row.can_create,
      can_edit: row.can_edit, can_delete: row.can_delete, can_export: row.can_export, can_approve: row.can_approve,
    }));
    dispatch(updateMenuAccessAction(selectedRole, { items: overrides },
      () => { setSnackbar({ open: true, msg: `${selectedRole} menu access saved`, severity: 'success' }); clearDirty('menus'); dispatch(getMenuAccessAction(selectedRole)); },
      (err) => setSnackbar({ open: true, msg: err?.message || 'Save failed', severity: 'error' }),
    ));
  }, [dispatch, localMenuAccess, selectedRole]);

  const handleSaveDashboard = useCallback(() => {
    const overrides = (localDashboard[selectedRole] || []).map(row => ({
      widget_key: row.widget_key, is_visible: row.is_visible, data_scope: row.data_scope, sort_order: row.sort_order,
    }));
    dispatch(updateDashboardAccessAction(selectedRole, { items: overrides },
      () => { setSnackbar({ open: true, msg: `${selectedRole} dashboard saved`, severity: 'success' }); clearDirty('dashboard'); dispatch(getDashboardAccessAction(selectedRole)); },
      (err) => setSnackbar({ open: true, msg: err?.message || 'Save failed', severity: 'error' }),
    ));
  }, [dispatch, localDashboard, selectedRole]);

  const handleSaveNotifications = useCallback(() => {
    const overrides = (localNotifications[selectedRole] || []).map(row => ({
      notification_key: row.notification_key, notify_in_app: row.notify_in_app,
      notify_push: row.notify_push, notify_email: row.notify_email,
      notify_sms: row.notify_sms, notify_whatsapp: row.notify_whatsapp,
    }));
    // If nothing changed, avoid API call
    if (items.length === 0) {
      setSnackbar({
        open: true,
        msg: 'No changes to save',
        severity: 'info'
      });
      return;
    }

    dispatch(updateNotificationConfigAction(
      selectedRole,
      { items },
      () => {
        setSnackbar({
          open: true,
          msg: `${selectedRole} notifications saved`,
          severity: 'success'
        });

        clearDirty('notifications');

        // Clear tracked changes after save
        setChangedNotifications(prev => ({
          ...prev,
          [selectedRole]: {}
        }));

        dispatch(getNotificationConfigAction(selectedRole));
      },
      (err) => setSnackbar({
        open: true,
        msg: err?.message || 'Save failed',
        severity: 'error'
      })
    ));
  }, [dispatch, selectedRole, changedNotifications]);

  const handleSaveDataScope = useCallback(() => {
    const items = (localDataScope[selectedRole] || []).map(row => ({ menu_id: row.menu_id, data_scope: row.data_scope }));
    dispatch(updateDataScopeAction(selectedRole, { items },
      () => { setSnackbar({ open: true, msg: `${selectedRole} data scope saved`, severity: 'success' }); clearDirty('dataScope'); dispatch(getDataScopeAction(selectedRole)); },
      (err) => setSnackbar({ open: true, msg: err?.message || 'Save failed', severity: 'error' }),
    ));
  }, [dispatch, localDataScope, selectedRole]);

  const handleSaveFieldVisibility = useCallback(() => {
    const items = (localFieldVisibility[selectedRole] || []).map(row => ({ field_id: row.field_id, is_visible: row.is_visible, is_editable: row.is_editable }));
    dispatch(updateFieldVisibilityAction(selectedRole, { items },
      () => { setSnackbar({ open: true, msg: `${selectedRole} field visibility saved`, severity: 'success' }); clearDirty('fieldVisibility'); dispatch(getFieldVisibilityAction(selectedRole)); },
      (err) => setSnackbar({ open: true, msg: err?.message || 'Save failed', severity: 'error' }),
    ));
  }, [dispatch, localFieldVisibility, selectedRole]);

  const handleResetMenuAccess = useCallback(() => {
    dispatch(resetMenuAccessAction(selectedRole,
      () => setSnackbar({ open: true, msg: `${selectedRole} menu access reset to defaults`, severity: 'success' }),
      (err) => setSnackbar({ open: true, msg: err?.message || 'Reset failed', severity: 'error' }),
    ));
  }, [dispatch, selectedRole]);

  // Create/Clone/Delete
  const handleCreateRole = useCallback(() => {
    const data = { role_name: newRoleName.trim(), role_description: newRoleDescription.trim(), inherits_from: newRoleInherits || null };
    const onSuccess = () => {
      setSnackbar({ open: true, msg: `Role "${newRoleName}" ${createDialog.mode === 'clone' ? 'cloned' : 'created'}`, severity: 'success' });
      setCreateDialog({ open: false, mode: 'create', sourceRole: '' });
      setNewRoleName(''); setNewRoleDescription(''); setNewRoleInherits('');
    };
    const onError = (err) => setSnackbar({ open: true, msg: err?.message || 'Failed', severity: 'error' });
    if (createDialog.mode === 'clone') {
      dispatch(cloneRbacRoleAction(createDialog.sourceRole, { new_role_name: data.role_name, role_description: data.role_description }, onSuccess, onError));
    } else {
      dispatch(createRbacRoleAction(data, onSuccess, onError));
    }
  }, [dispatch, newRoleName, newRoleDescription, newRoleInherits, createDialog]);

  const handleDeleteRole = useCallback(() => {
    dispatch(deleteRbacRoleAction(deleteDialog.roleName,
      () => { setSnackbar({ open: true, msg: `Role "${deleteDialog.roleName}" deleted`, severity: 'success' }); setDeleteDialog({ open: false, roleName: '' }); if (selectedRole === deleteDialog.roleName) setSelectedRole(''); },
      (err) => setSnackbar({ open: true, msg: err?.message || 'Delete failed', severity: 'error' }),
    ));
  }, [dispatch, deleteDialog, selectedRole]);

  const systemRoles = useMemo(() => roles.filter(r => r.is_system).map(r => r.role_name), [roles]);
  const inheritableRoles = useMemo(() => roles.filter(r => !r.is_custom && r.is_active), [roles]);
  const isSystem = systemRoles.includes(selectedRole);
  const currentRole = roles.find(r => r.role_name === selectedRole);

  const buildMenuTree = useCallback((flatRows) => {
    if (!flatRows?.length) return [];
    const map = {};
    const roots = [];
    for (const row of flatRows) map[row.menu_id] = { ...row, children: [] };
    for (const row of flatRows) {
      const node = map[row.menu_id];
      if (row.parent_id && map[row.parent_id]) map[row.parent_id].children.push(node);
      else roots.push(node);
    }
    return roots;
  }, []);

  const menuTree = useMemo(() => buildMenuTree(localMenuAccess[selectedRole] || []), [localMenuAccess, selectedRole, buildMenuTree]);
  const toggleMenu = useCallback((menuId) => { setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] })); }, []);

  const getSaveHandler = () => {
    switch (activeTab) {
      case 0: return handleSaveMenuAccess;
      case 1: return handleSaveDashboard;
      case 2: return handleSaveNotifications;
      case 3: return handleSaveDataScope;
      case 4: return handleSaveFieldVisibility;
      default: return null;
    }
  };

  const getSaveLabel = () => {
    return ['Save Menu Access', 'Save Dashboard', 'Save Notifications', 'Save Data Scope', 'Save Fields'][activeTab] || 'Save';
  };
const allowedCompanyTypes = [2, 3, 9];

const canCreateRole = allowedCompanyTypes.includes(storage?.company_type) ? UserRightsAuthorization(menuAccess?.[currentUserRole],'settings__user_roles', 'can_create') : true;  
return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>

        {loading && !roles.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
            {/* Left: Role list sidebar */}
            <Box sx={{
              width: 200, minWidth: 200, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column',
              bgcolor: '#fafafa',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>User Roles</Typography>
                {canCreateRole && (
                <Tooltip title="Create Custom Role">
                  <IconButton size="small" onClick={() => setCreateDialog({ open: true, mode: 'create', sourceRole: '' })}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                )}
              </Box>
              <Divider />
              <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                {roles.map(role => (
                  <ListItemButton
                    key={role.role_name}
                    selected={selectedRole === role.role_name}
                    onClick={() => { setSelectedRole(role.role_name); setExpandedMenus({}); }}
                    sx={{
                      py: 1, px: 1.5,
                      '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } },
                    }}
                  >
                    <ListItemText
                      primary={role.role_name}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selectedRole === role.role_name ? 600 : 400 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            {/* Right: Content area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {selectedRole ? (
                <>
                  {/* Role header + save button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedRole}</Typography>
                    {currentRole?.is_custom === 1 && <Chip label="Custom" size="small" color="primary" variant="outlined" />}
                    {currentRole?.inherits_from && <Chip label={`Inherits: ${currentRole.inherits_from}`} size="small" variant="outlined" />}
                    <Box sx={{ flex: 1 }} />
                    {activeTab === 0 && !isSystem && (
                      <Tooltip title="Reset to L1 defaults">
                        <IconButton size="small" onClick={handleResetMenuAccess}><RestartAltIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                    <Button variant="contained" size="small" startIcon={<SaveIcon />}
                      onClick={getSaveHandler()} disabled={saving}>
                      {saving ? <CircularProgress size={16} /> : getSaveLabel()}
                    </Button>
                  </Box>

                  {/* Tabs */}
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
                    sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 40, px: 1 }}
                    TabIndicatorProps={{ sx: { height: 2 } }}>
                    {SECTION_TABS.map(label => (
                      <Tab key={label} label={label} sx={{ textTransform: 'none', minHeight: 40, fontSize: '0.85rem', py: 0 }} />
                    ))}
                  </Tabs>

                  {/* Tab content */}
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {/* Menu Access Tab */}
                    {activeTab === 0 && (
                      <MenuAccessTable
                        menuTree={menuTree}
                        menuRows={localMenuAccess[selectedRole] || []}
                        expandedMenus={expandedMenus}
                        toggleMenu={toggleMenu}
                        onActionToggle={handleMenuActionToggle}
                        selectedRole={selectedRole}
                      />
                    )}

                    {/* Dashboard Tab */}
                    {activeTab === 1 && (
                      <DashboardTable rows={localDashboard[selectedRole] || []} onToggle={handleDashboardToggle} />
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 2 && (
                      <NotificationsTable rows={localNotifications[selectedRole] || []} onToggle={handleNotificationToggle} />
                    )}

                    {/* Data Scope Tab */}
                    {activeTab === 3 && (
                      <DataScopeTable rows={localDataScope[selectedRole] || []} onChange={handleDataScopeChange} />
                    )}

                    {/* Field Visibility Tab */}
                    {activeTab === 4 && (
                      <FieldVisibilityTable rows={localFieldVisibility[selectedRole] || []} onToggle={handleFieldVisibilityToggle} />
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Typography color="text.secondary">Select a role from the list</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Create/Clone Dialog */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, mode: 'create', sourceRole: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>{createDialog.mode === 'clone' ? `Clone from "${createDialog.sourceRole}"` : 'Create Custom Role'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Role Name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} fullWidth autoFocus sx={{ mt: 1 }} />
          <TextField label="Description" value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} fullWidth multiline rows={2} />
          <FormControl fullWidth>
            <InputLabel>Inherits From</InputLabel>
            <Select value={newRoleInherits} label="Inherits From" onChange={e => setNewRoleInherits(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {inheritableRoles.map(r => (<MenuItem key={r.role_name} value={r.role_name}>{r.role_name}</MenuItem>))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, mode: 'create', sourceRole: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRole} disabled={!newRoleName.trim() || saving}>
            {saving ? <CircularProgress size={20} /> : createDialog.mode === 'clone' ? 'Clone' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, roleName: '' })}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete role "{deleteDialog.roleName}"? This will remove all L2 overrides for this role.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, roleName: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRole} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.msg}</Alert>
      </Snackbar>
    </>
  );
};

// ---- Table header row styling ----
const headerSx = {
  display: 'flex', alignItems: 'center', px: 2, py: 1,
  bgcolor: '#f5f7fa', borderBottom: '1px solid #e0e0e0',
  position: 'sticky', top: 0, zIndex: 1,
};

// ---- Menu Access Table ----
const MenuAccessTable = React.memo(({ menuTree, menuRows, expandedMenus, toggleMenu, onActionToggle, selectedRole }) => (
  <Box>
    {/* Header */}
    <Box sx={headerSx}>
      <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>Menu Item</Typography>
      {ACTION_COLUMNS.map(col => (
        <Typography key={col} sx={{ width: 80, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
          {ACTION_LABELS[col]}
        </Typography>
      ))}
    </Box>
    {menuTree.map(node => (
      <MenuTreeNode key={node.menu_id} node={node} depth={0}
        expandedMenus={expandedMenus} toggleMenu={toggleMenu} onActionToggle={onActionToggle} selectedRole={selectedRole} />
    ))}
    {menuRows.length === 0 && (
      <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No menu data loaded</Typography>
    )}
  </Box>
));

// ---- MenuTreeNode ----
const MenuTreeNode = React.memo(({ node, depth, expandedMenus, toggleMenu, onActionToggle, selectedRole }) => {
  const { roles } = useSelector(s => s.rbacReducer);
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedMenus[node.menu_id];
  const isGroup = node.menu_type === 'group' || node.menu_type === 'collapse';
  const isAdmin = roles?.length > 0 && selectedRole === "Administrator"
  
  const hasDisabledChild = (node) => {
    if(node.menu_key === 'settings__user_roles' && isAdmin) return true
    if (!node.children || node.children.length === 0) return false

    return node.children.some(
      (child) =>
        child.menu_key === "settings__user_roles" ||
        hasDisabledChild(child)
    )
  }

  const getChildStatus = (node, col) => {
    if (!node.children || node.children.length === 0) {
      return {
        checked: node[col] === 1,
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
      <Box sx={{
        display: 'flex', alignItems: 'center',
        pl: 2 + depth * 2.5, pr: 2, py: 0.5,
        borderBottom: '1px solid #f0f0f0',
        bgcolor: isGroup ? '#f8f9fb' : 'transparent',
        '&:hover': { bgcolor: '#eef3ff' },
        minHeight: 40,
      }}>
        <Box sx={{ width: 28, cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
          onClick={() => hasChildren && toggleMenu(node.menu_id)}>
          {hasChildren && (isExpanded ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />)}
        </Box>
        <Typography sx={{ flex: 1, fontSize: '0.875rem', fontWeight: isGroup ? 600 : 400, cursor: hasChildren ? 'pointer' : 'default' }}
          onClick={() => hasChildren && toggleMenu(node.menu_id)}>
          {node.message_id || node.menu_key}
          {isGroup && <Chip label={node.menu_type} size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />}
        </Typography>

        {ACTION_COLUMNS.map(col => {
          const { checked, indeterminate } = getChildStatus(node, col)
          return (
            <Box key={col} sx={{ width: 80, display: 'flex', justifyContent: 'center' }}>
              <Checkbox size="small" checked={checked} indeterminate={indeterminate}
                onChange={() => onActionToggle(node.menu_key, col)} sx={{ p: 0.5 }} disabled={hasChildren || (isAdmin && hasDisabledChild(node))} />
            </Box>
          )}
        )}
      </Box>
      {hasChildren && isExpanded && node.children.map(child => (
        <MenuTreeNode key={child.menu_id} node={child} depth={depth + 1}
          expandedMenus={expandedMenus} toggleMenu={toggleMenu} onActionToggle={onActionToggle} selectedRole={selectedRole} />
      ))}
    </>
  );
});

// ---- Dashboard Table ----
const DashboardTable = React.memo(({ rows, onToggle }) => (
  <Box>
    <Box sx={headerSx}>
      <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>Widget</Typography>
      <Typography sx={{ width: 100, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Visible</Typography>
    </Box>
    {rows.map(row => (
      <Box key={row.widget_key} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.75, borderBottom: '1px solid #f0f0f0', minHeight: 40, '&:hover': { bgcolor: '#eef3ff' } }}>
        <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>{row.widget_name || row.widget_key}</Typography>
        <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
          <Checkbox size="small" checked={!!row.is_visible} onChange={() => onToggle(row.widget_key)} />
        </Box>
      </Box>
    ))}
    {rows.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No dashboard widgets configured</Typography>}
  </Box>
));

// ---- Notifications Table ----
const NOTIF_CHANNELS = ['notify_in_app', 'notify_push', 'notify_email', 'notify_sms', 'notify_whatsapp'];
const NOTIF_LABELS = { notify_in_app: 'In-App', notify_push: 'Push', notify_email: 'Email', notify_sms: 'SMS', notify_whatsapp: 'WhatsApp' };

const NotificationsTable = React.memo(({ rows, onToggle }) => (
  <Box>
    <Box sx={headerSx}>
      <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>Notification</Typography>
      {NOTIF_CHANNELS.map(ch => (
        <Typography key={ch} sx={{ width: 100, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{NOTIF_LABELS[ch]}</Typography>
      ))}
    </Box>
    {rows.map(row => (
      <Box key={row.notification_key} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, borderBottom: '1px solid #f0f0f0', minHeight: 40, '&:hover': { bgcolor: '#eef3ff' } }}>
        <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>{row.notification_name || row.notification_key}</Typography>
        {NOTIF_CHANNELS.map(ch => (
          <Box key={ch} sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
            <Checkbox size="small" checked={!!row[ch]} onChange={() => onToggle(row.notification_key, ch)} />
          </Box>
        ))}
      </Box>
    ))}
    {rows.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No notification config</Typography>}
  </Box>
));

// ---- Data Scope Table ----
const DataScopeTable = React.memo(({ rows, onChange }) => (
  <Box>
    <Box sx={headerSx}>
      <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>Menu</Typography>
      <Typography sx={{ width: 160, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Scope</Typography>
    </Box>
    {rows.map(row => (
      <Box key={row.menu_id} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.75, borderBottom: '1px solid #f0f0f0', minHeight: 40, '&:hover': { bgcolor: '#eef3ff' } }}>
        <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>{row.menu_name || row.menu_key}</Typography>
        <Box sx={{ width: 160, display: 'flex', justifyContent: 'center' }}>
          <Select size="small" value={row.data_scope || 'all'} onChange={(e) => onChange(row.menu_id, e.target.value)} sx={{ minWidth: 130, fontSize: '0.85rem' }}>
            {SCOPE_OPTIONS.map(s => (<MenuItem key={s} value={s} sx={{ fontSize: '0.85rem' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>))}
          </Select>
        </Box>
      </Box>
    ))}
    {rows.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No data scope config</Typography>}
  </Box>
));

// ---- Field Visibility Table ----
const FieldVisibilityTable = React.memo(({ rows, onToggle }) => (
  <Box>
    <Box sx={headerSx}>
      <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>Field</Typography>
      <Typography sx={{ width: 100, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Visible</Typography>
      <Typography sx={{ width: 100, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>Editable</Typography>
    </Box>
    {rows.map(row => (
      <Box key={row.field_id} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, borderBottom: '1px solid #f0f0f0', minHeight: 40, '&:hover': { bgcolor: '#eef3ff' } }}>
        <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>{row.field_name || row.field_key}</Typography>
        <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
          <Checkbox size="small" checked={!!row.is_visible} onChange={() => onToggle(row.field_id, 'is_visible')} />
        </Box>
        <Box sx={{ width: 100, display: 'flex', justifyContent: 'center' }}>
          <Checkbox size="small" checked={!!row.is_editable} disabled={!row.is_visible} onChange={() => onToggle(row.field_id, 'is_editable')} />
        </Box>
      </Box>
    ))}
    {rows.length === 0 && <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>No field definitions configured</Typography>}
  </Box>
));

export default PosRole;
