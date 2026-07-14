import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, CircularProgress,
  Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  MenuItem, Select, Snackbar, Alert, Switch, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Tooltip,
  Typography, Autocomplete,
} from '@mui/material';
import {
  ArrowBack, Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon,
  Schedule as ScheduleIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ArrowDropDownIcon, ArrowRightIcon } from '@mui/x-date-pickers';
import RbacService from '../../../services/rbac_services';

const ACTION_COLS = ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_export', 'can_approve'];
const ACTION_LABELS = { can_view: 'V', can_create: 'C', can_edit: 'E', can_delete: 'D', can_export: 'X', can_approve: 'A' };

export default function UserPermissions() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0=Menu Overrides, 1=Dashboard, 2=Notifications
  const [effectiveMenus, setEffectiveMenus] = useState([]);
  const [l3Overrides, setL3Overrides] = useState([]);
  const [l3Dashboard, setL3Dashboard] = useState([]);
  const [l3Notifications, setL3Notifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [grantDialog, setGrantDialog] = useState({ open: false });
  const [employeeInfo, setEmployeeInfo] = useState(null);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });
  // Fetch all L3 data
  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [effRes, l3Res, dashRes, notifRes] = await Promise.all([
        RbacService.getUserEffectiveMenuAccess(employeeId),
        RbacService.getL3MenuOverrides(employeeId),
        RbacService.getL3DashboardAccess(employeeId),
        RbacService.getL3NotificationConfig(employeeId),
      ]);
      setEffectiveMenus(toArray(effRes?.data));
      setL3Overrides(toArray(l3Res?.data));
      setL3Dashboard(toArray(dashRes?.data));
      setL3Notifications(toArray(notifRes?.data));
    } catch (e) {
      showSnack('Failed to load user permissions', 'error');
    }
    setLoading(false);
  }, [employeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build menu tree from effective menus
  const menuTree = useMemo(() => buildMenuTree(effectiveMenus), [effectiveMenus]);

  // Set of menu_ids that have L3 overrides
  const l3MenuIds = useMemo(() => new Set(l3Overrides.map(o => o.menu_id)), [l3Overrides]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5">User Permissions</Typography>
        <Chip label={`Employee #${employeeId}`} color="primary" variant="outlined" />
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>Refresh</Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Menu Access" />
        <Tab label="Dashboard" />
        <Tab label="Notifications" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          {tab === 0 && (
            <MenuOverridesTab
              effectiveMenus={effectiveMenus}
              menuTree={menuTree}
              l3Overrides={l3Overrides}
              l3MenuIds={l3MenuIds}
              employeeId={employeeId}
              onRefresh={fetchData}
              showSnack={showSnack}
            />
          )}
          {tab === 1 && (
            <DashboardTab
              items={l3Dashboard}
              employeeId={employeeId}
              onRefresh={fetchData}
              showSnack={showSnack}
            />
          )}
          {tab === 2 && (
            <NotificationsTab
              items={l3Notifications}
              employeeId={employeeId}
              onRefresh={fetchData}
              showSnack={showSnack}
            />
          )}
        </>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

// ---- Menu Overrides Tab ----
function MenuOverridesTab({ effectiveMenus, menuTree, l3Overrides, l3MenuIds, employeeId, onRefresh, showSnack }) {
  const [grantDialog, setGrantDialog] = useState({ open: false });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const handleGrant = async (data) => {
    setSaving(true);
    try {
      await RbacService.grantL3MenuAccess(employeeId, data);
      showSnack('Permission granted');
      setGrantDialog({ open: false });
      onRefresh();
    } catch (e) {
      showSnack(e.response?.data?.message || 'Grant failed', 'error');
    }
    setSaving(false);
  };

  const handleRevoke = async (menuId) => {
    if (!window.confirm('Revoke this user-level override?')) return;
    try {
      await RbacService.revokeL3MenuAccess(employeeId, menuId);
      showSnack('Override revoked');
      onRefresh();
    } catch (e) {
      showSnack('Revoke failed', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Effective permissions shown below. <Chip label="L3" size="small" color="warning" sx={{ mx: 0.5 }} /> = user-level override.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGrantDialog({ open: true })}>
          Grant Access
        </Button>
      </Box>

      {/* Effective menu tree table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 250 }}>Menu</TableCell>
              {ACTION_COLS.map(c => (
                <TableCell key={c} align="center" sx={{ fontWeight: 'bold', width: 40 }}>{ACTION_LABELS[c]}</TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', width: 60 }}>Source</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', width: 50 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuTree.map(node => (
              <EffectiveMenuRow key={node.menu_id} node={node} depth={0}
                l3MenuIds={l3MenuIds} expanded={expanded} setExpanded={setExpanded}
                onRevoke={handleRevoke} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* L3 Overrides summary */}
      {l3Overrides.length > 0 && (
        <Card sx={{ mt: 2 }} variant="outlined">
          <CardHeader title="Active User Overrides (L3)" titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent sx={{ p: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#fff8e1' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Menu</TableCell>
                  {ACTION_COLS.map(c => <TableCell key={c} align="center" sx={{ fontWeight: 'bold' }}>{ACTION_LABELS[c]}</TableCell>)}
                  <TableCell sx={{ fontWeight: 'bold' }}>Valid Until</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {l3Overrides.map(o => (
                  <TableRow key={o.menu_id} hover>
                    <TableCell>{o.menu_name || o.menu_key || `Menu #${o.menu_id}`}</TableCell>
                    {ACTION_COLS.map(c => (
                      <TableCell key={c} align="center">
                        {o[c] !== null && o[c] !== undefined ? (
                          <Chip label={o[c] ? 'Y' : 'N'} size="small" color={o[c] ? 'success' : 'error'} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                        ) : '-'}
                      </TableCell>
                    ))}
                    <TableCell>
                      {o.valid_until ? (
                        <Chip icon={<ScheduleIcon />} label={new Date(o.valid_until).toLocaleDateString()} size="small" color={new Date(o.valid_until) < new Date() ? 'error' : 'info'} variant="outlined" />
                      ) : 'Permanent'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{o.reason || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleRevoke(o.menu_id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Grant Dialog */}
      <GrantAccessDialog
        open={grantDialog.open}
        onClose={() => setGrantDialog({ open: false })}
        onGrant={handleGrant}
        saving={saving}
        effectiveMenus={effectiveMenus}
      />
    </Box>
  );
}

// ---- Effective Menu Row (recursive) ----
function EffectiveMenuRow({ node, depth, l3MenuIds, expanded, setExpanded, onRevoke }) {
  const hasChildren = node.children?.length > 0;
  const isOpen = expanded[node.menu_id] !== false;
  const isL3 = l3MenuIds.has(node.menu_id);
  const isGroup = node.menu_type === 'group' || node.menu_type === 'collapse';

  return (
    <>
      <TableRow hover sx={{ bgcolor: isL3 ? '#fff8e1' : 'transparent' }}>
        <TableCell sx={{ pl: 2 + depth * 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasChildren && (
              <IconButton size="small" onClick={() => setExpanded(p => ({ ...p, [node.menu_id]: !isOpen }))}>
                {isOpen ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
              </IconButton>
            )}
            <Typography variant="body2" fontWeight={hasChildren ? 'bold' : 'normal'}>
              {node.message_id || node.menu_name || node.menu_key}
            </Typography>
          </Box>
        </TableCell>
        {!isGroup ? ACTION_COLS.map(c => (
          <TableCell key={c} align="center">
            {node[c] === 1 ? (
              <Checkbox size="small" checked disabled sx={{ p: 0, '& .MuiSvgIcon-root': { color: '#4caf50' } }} />
            ) : (
              <Checkbox size="small" checked={false} disabled sx={{ p: 0 }} />
            )}
          </TableCell>
        )) : ACTION_COLS.map(c => <TableCell key={c} />)}
        <TableCell align="center">
          {!isGroup && node.source && (
            <Chip label={node.source} size="small" variant="outlined"
              color={node.source === 'L3' ? 'warning' : node.source === 'L2' ? 'info' : 'default'}
              sx={{ height: 20, fontSize: 10 }} />
          )}
        </TableCell>
        <TableCell align="center">
          {isL3 && (
            <Tooltip title="Revoke L3 override">
              <IconButton size="small" onClick={() => onRevoke(node.menu_id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>
      {hasChildren && isOpen && node.children.map(child => (
        <EffectiveMenuRow key={child.menu_id} node={child} depth={depth + 1}
          l3MenuIds={l3MenuIds} expanded={expanded} setExpanded={setExpanded}
          onRevoke={onRevoke} />
      ))}
    </>
  );
}

// ---- Grant Access Dialog ----
function GrantAccessDialog({ open, onClose, onGrant, saving, effectiveMenus }) {
  const [menuId, setMenuId] = useState('');
  const [actions, setActions] = useState({ can_view: 1, can_create: 0, can_edit: 0, can_delete: 0, can_export: 0, can_approve: 0 });
  const [validUntil, setValidUntil] = useState('');
  const [reason, setReason] = useState('');

  const menuItems = effectiveMenus.filter(m => m.menu_type === 'item');

  const handleSubmit = () => {
    if (!menuId) return;
    const data = {
      menu_id: parseInt(menuId),
      ...actions,
      valid_until: validUntil || null,
      reason: reason || null,
    };
    onGrant(data);
  };

  // Reset form on open
  useEffect(() => {
    if (open) {
      setMenuId('');
      setActions({ can_view: 1, can_create: 0, can_edit: 0, can_delete: 0, can_export: 0, can_approve: 0 });
      setValidUntil('');
      setReason('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Grant Temporary Access</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            options={menuItems}
            getOptionLabel={(o) => o.message_id || o.menu_name || o.menu_key || ''}
            value={menuItems.find(m => m.menu_id === parseInt(menuId)) || null}
            onChange={(_, v) => setMenuId(v ? String(v.menu_id) : '')}
            renderInput={(params) => <TextField {...params} label="Menu Item" size="small" />}
          />

          <Typography variant="subtitle2">Permissions</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {ACTION_COLS.map(c => (
              <Chip
                key={c}
                label={ACTION_LABELS[c]}
                size="small"
                color={actions[c] ? 'success' : 'default'}
                variant={actions[c] ? 'filled' : 'outlined'}
                onClick={() => setActions(prev => ({ ...prev, [c]: prev[c] ? 0 : 1 }))}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <TextField
            label="Valid Until (leave empty for permanent)"
            type="datetime-local"
            size="small"
            value={validUntil}
            onChange={e => setValidUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Reason"
            size="small"
            multiline
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Why is this access being granted?"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !menuId}>
          {saving ? <CircularProgress size={20} /> : 'Grant Access'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Dashboard Tab ----
function DashboardTab({ items, employeeId, onRefresh, showSnack }) {
  const [local, setLocal] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(items); }, [items]);

  const toggle = (widgetKey) => {
    setLocal(prev => prev.map(w =>
      w.widget_key === widgetKey ? { ...w, is_visible: w.is_visible ? 0 : 1 } : w
    ));
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = { items: local.map(w => ({ widget_key: w.widget_key, is_visible: w.is_visible, sort_order: w.sort_order })) };
      await RbacService.setL3DashboardAccess(employeeId, data);
      showSnack('Dashboard preferences saved');
      onRefresh();
    } catch (e) { showSnack('Save failed', 'error'); }
    setSaving(false);
  };

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
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Visible</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {local.map(w => (
              <TableRow key={w.widget_key} hover>
                <TableCell>{w.widget_name || w.widget_key}</TableCell>
                <TableCell align="center">
                  <Switch size="small" checked={!!w.is_visible} onChange={() => toggle(w.widget_key)} />
                </TableCell>
              </TableRow>
            ))}
            {local.length === 0 && <TableRow><TableCell colSpan={2} align="center">No dashboard widgets</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ---- Notifications Tab ----
function NotificationsTab({ items, employeeId, onRefresh, showSnack }) {
  const [local, setLocal] = useState([]);
  const [saving, setSaving] = useState(false);

  const CHANNELS = ['notify_in_app', 'notify_push', 'notify_email', 'notify_sms', 'notify_whatsapp'];
  const CH_LABELS = { notify_in_app: 'In-App', notify_push: 'Push', notify_email: 'Email', notify_sms: 'SMS', notify_whatsapp: 'WhatsApp' };

  useEffect(() => { setLocal(items); }, [items]);

  const toggle = (key, ch) => {
    setLocal(prev => prev.map(n =>
      n.notification_key === key ? { ...n, [ch]: n[ch] ? 0 : 1 } : n
    ));
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = { items: local.map(n => {
        const item = { notification_key: n.notification_key };
        CHANNELS.forEach(ch => { item[ch] = n[ch]; });
        return item;
      })};
      await RbacService.setL3NotificationConfig(employeeId, data);
      showSnack('Notification preferences saved');
      onRefresh();
    } catch (e) { showSnack('Save failed', 'error'); }
    setSaving(false);
  };

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
              {CHANNELS.map(ch => <TableCell key={ch} align="center" sx={{ fontWeight: 'bold' }}>{CH_LABELS[ch]}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {local.map(n => (
              <TableRow key={n.notification_key} hover>
                <TableCell>{n.notification_name || n.notification_key}</TableCell>
                {CHANNELS.map(ch => (
                  <TableCell key={ch} align="center">
                    <Checkbox size="small" checked={!!n[ch]} onChange={() => toggle(n.notification_key, ch)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {local.length === 0 && <TableRow><TableCell colSpan={6} align="center">No notification config</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.rows)) return v.rows;
  if (Array.isArray(v?.items)) return v.items;
  return [];
}
// ---- Helpers ----
function buildMenuTree(flatMenus) {
  const list = toArray(flatMenus);
  const map = {};
  const roots = [];
  list.forEach(m => { map[m.menu_id] = { ...m, children: [] }; });
  list.forEach(m => {
    if (m.parent_id && map[m.parent_id]) {
      map[m.parent_id].children.push(map[m.menu_id]);
    } else {
      roots.push(map[m.menu_id]);
    }
  });
  return roots;
}
