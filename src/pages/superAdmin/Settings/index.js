import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Tabs, Tab, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, IconButton, Chip, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Divider, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import superAdminService from 'services/superAdmin_services';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box
  className="hide-scrollbar"
  sx={{
    p: 2,
    height: "90vh",
    overflowY: "auto",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  }}
>
  <style>
    {`
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `}
  </style>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Access Control Settings</Typography>
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Roles & Permissions" />
        <Tab label="Menu Access" />
        <Tab label="Users" />
        <Tab label="Alerts" />
      </Tabs>
      {tabValue === 0 && <RolesPermissions />}
      {tabValue === 1 && <MenuAccess />}
      {tabValue === 2 && <UsersTab />}
      {tabValue === 3 && <AlertsTab />}
    </Box>
  );
};

// ─── Tab 1: Roles & Permissions ───────────────────────────────

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rights, setRights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');

  const loadRoles = useCallback(async () => {
    try {
      const res = await superAdminService.getRoles();
      setRoles(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const loadRoleRights = async (roleName) => {
    setLoading(true);
    try {
      const res = await superAdminService.getRoleRights(roleName);
      setRights(res.data);
      setSelectedRole(roleName);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggleRight = (rightId) => {
    setRights(prev => prev.map(r =>
      r.right_id === rightId ? { ...r, granted: r.granted ? 0 : 1 } : r
    ));
  };

  const handleSaveRights = async () => {
    setSaving(true);
    try {
      await superAdminService.updateRoleRights(selectedRole, {
        rights: rights.map(r => ({ right_id: r.right_id, granted: r.granted }))
      });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await superAdminService.createRole({ role_name: newRoleName.trim() });
      setNewRoleName('');
      setShowAddDialog(false);
      loadRoles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameRole = async () => {
    if (!editRoleName.trim() || !editRole) return;
    try {
      await superAdminService.renameRole(editRole.role_id, { role_name: editRoleName.trim() });
      setEditRole(null);
      setEditRoleName('');
      loadRoles();
      if (selectedRole === editRole.role_name) setSelectedRole(editRoleName.trim());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Delete role "${roleName}"? This cannot be undone.`)) return;
    try {
      await superAdminService.deleteRole(roleId);
      loadRoles();
      if (selectedRole === roleName) { setSelectedRole(null); setRights([]); }
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to delete role');
    }
  };

  // Group rights by right_group
  const grouped = rights.reduce((acc, r) => {
    if (!acc[r.right_group]) acc[r.right_group] = [];
    acc[r.right_group].push(r);
    return acc;
  }, {});

  return (
    <Grid container spacing={2}>
      {/* Roles List */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Roles</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setShowAddDialog(true)}>Add</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Users</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map(role => (
                    <TableRow
                      key={role.role_id}
                      hover
                      selected={selectedRole === role.role_name}
                      onClick={() => loadRoleRights(role.role_name)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{role.role_name}</TableCell>
                      <TableCell align="center">
                        <Chip label={role.user_count} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        {role.role_name !== 'SuperAdmin' && (
                          <>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditRole(role); setEditRoleName(role.role_name); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.role_id, role.role_name); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Permissions Panel */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            {!selectedRole ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Select a role to view and edit permissions
              </Typography>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Permissions: {selectedRole}</Typography>
                  {selectedRole !== 'SuperAdmin' && (
                    <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSaveRights} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </Box>
                {selectedRole === 'SuperAdmin' && (
                  <Alert severity="info" sx={{ mb: 2 }}>SuperAdmin has all permissions by default and cannot be modified.</Alert>
                )}
                {Object.entries(grouped).map(([group, groupRights]) => (
                  <Box key={group} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                      {group}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          {groupRights.map(r => (
                            <TableRow key={r.right_id}>
                              <TableCell>{r.right_label}</TableCell>
                              <TableCell align="right" sx={{ width: 80 }}>
                                <Switch
                                  checked={!!r.granted}
                                  onChange={() => handleToggleRight(r.right_id)}
                                  disabled={selectedRole === 'SuperAdmin'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Add Role Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin="dense" label="Role Name"
            value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRole}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Role Dialog */}
      <Dialog open={!!editRole} onClose={() => setEditRole(null)}>
        <DialogTitle>Rename Role</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin="dense" label="Role Name"
            value={editRoleName} onChange={(e) => setEditRoleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameRole()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRole(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleRenameRole}>Save</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

// ─── Tab 2: Menu Access ───────────────────────────────────────

const MenuAccess = () => {
  const [roles, setRoles] = useState([]);
  const [menuData, setMenuData] = useState({}); // { roleName: [{ menu_id, is_visible, ... }] }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allMenus, setAllMenus] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rolesRes = await superAdminService.getRoles();
      const roleList = rolesRes.data;
      setRoles(roleList);

      const data = {};
      for (const role of roleList) {
        const menusRes = await superAdminService.getRoleMenus(role.role_name);
        data[role.role_name] = menusRes.data;
      }
      setMenuData(data);

      // Use SuperAdmin's menus as the complete list
      if (data['SuperAdmin']) setAllMenus(data['SuperAdmin']);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggle = (roleName, menuId) => {
    setMenuData(prev => ({
      ...prev,
      [roleName]: prev[roleName].map(m =>
        m.menu_id === menuId ? { ...m, is_visible: m.is_visible ? 0 : 1 } : m
      )
    }));
  };

  const handleSave = async (roleName) => {
    setSaving(true);
    try {
      await superAdminService.updateRoleMenus(roleName, {
        menus: menuData[roleName].map(m => ({ menu_id: m.menu_id, is_visible: m.is_visible }))
      });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const editableRoles = roles.filter(r => r.role_name !== 'SuperAdmin');

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Menu Visibility by Role</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Menu</TableCell>
                {editableRoles.map(r => (
                  <TableCell key={r.role_name} align="center" sx={{ fontWeight: 600 }}>
                    {r.role_name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {allMenus.map(menu => (
                <TableRow key={menu.menu_id}>
                  <TableCell>{menu.message_id}</TableCell>
                  {editableRoles.map(role => {
                    const roleMenu = menuData[role.role_name]?.find(m => m.menu_id === menu.menu_id);
                    return (
                      <TableCell key={role.role_name} align="center">
                        <Switch
                          checked={roleMenu ? !!roleMenu.is_visible : true}
                          onChange={() => handleToggle(role.role_name, menu.menu_id)}
                          size="small"
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {editableRoles.map(r => (
            <Button
              key={r.role_name} variant="contained" size="small"
              startIcon={<SaveIcon />} onClick={() => handleSave(r.role_name)} disabled={saving}
            >
              Save {r.role_name}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Tab 3: Users ─────────────────────────────────────────────

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', phone_number: '', email: '', username: '', password: '', role_id: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        superAdminService.getSAUsers(),
        superAdminService.getRoles()
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRoleChange = async (employeeId, roleId) => {
    try {
      await superAdminService.updateUserRole(employeeId, { role_id: roleId });
      setUsers(prev => prev.map(u =>
        u.employee_id === employeeId
          ? { ...u, role_id: roleId, role_name: roles.find(r => r.role_id === roleId)?.role_name || u.role_name }
          : u
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async () => {
    setError('');
    if (!newUser.first_name.trim()) { setError('First name is required'); return; }
    if (!newUser.username.trim()) { setError('Username is required'); return; }
    if (!newUser.password.trim()) { setError('Password is required'); return; }
    if (!newUser.role_id) { setError('Role is required'); return; }
    setCreating(true);
    try {
      await superAdminService.createSAUser(newUser);
      setShowAddDialog(false);
      setNewUser({ first_name: '', last_name: '', phone_number: '', email: '', username: '', password: '', role_id: '' });
      loadData();
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create user');
    }
    setCreating(false);
  };

  const handleFieldChange = (field) => (e) => {
    setNewUser(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Super Admin Users</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setShowAddDialog(true)}>
            Add User
          </Button>
        </Box>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.employee_id}>
                  <TableCell>{user.employee_id}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={user.role_id || ''}
                        onChange={(e) => handleRoleChange(user.employee_id, e.target.value)}
                      >
                        {roles.map(r => (
                          <MenuItem key={r.role_id} value={r.role_id}>{r.role_name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={!user.deleted ? 'Active' : 'Inactive'}
                      color={!user.deleted ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onClose={() => { setShowAddDialog(false); setError(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="First Name" value={newUser.first_name} onChange={handleFieldChange('first_name')} required />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Last Name" value={newUser.last_name} onChange={handleFieldChange('last_name')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Phone Number" value={newUser.phone_number} onChange={handleFieldChange('phone_number')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Email" value={newUser.email} onChange={handleFieldChange('email')} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Username" value={newUser.username} onChange={handleFieldChange('username')} required />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Password" type="password" value={newUser.password} onChange={handleFieldChange('password')} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select value={newUser.role_id} onChange={handleFieldChange('role_id')} label="Role">
                  {roles.map(r => (
                    <MenuItem key={r.role_id} value={r.role_id}>{r.role_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowAddDialog(false); setError(''); }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={creating}>
            {creating ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// ─── Tab 4: Alerts ───────────────────────────────────────────

const AlertsTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getAlertRules();
      setRules(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  const handleToggle = async (rule, field) => {
    const updated = { ...rule, [field]: rule[field] ? 0 : 1 };
    setSaving(rule.id);
    try {
      await superAdminService.updateAlertRule(rule.id, updated);
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Alert Rules</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure which events generate notifications for super admin users.
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Alert</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Active</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">In-App</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Email</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Last Run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{rule.rule_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{rule.description}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={!!rule.is_active}
                      onChange={() => handleToggle(rule, 'is_active')}
                      disabled={saving === rule.id}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={!!rule.notify_in_app}
                      onChange={() => handleToggle(rule, 'notify_in_app')}
                      disabled={saving === rule.id || !rule.is_active}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={!!rule.notify_email}
                      onChange={() => handleToggle(rule, 'notify_email')}
                      disabled={saving === rule.id || !rule.is_active}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" color="text.secondary">
                      {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString('en-GB') : 'Never'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Settings;
