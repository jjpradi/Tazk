import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Card, Chip, Tab, Tabs, Typography, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Button, Checkbox, Collapse,
  TextField, MenuItem, Grid, Paper, FormControl, InputLabel, Select,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon,
  ArrowBack as BackIcon, Save as SaveIcon,
  ExpandMore, ExpandLess, Folder, FolderOpen,
  WarningAmberRounded as WarningIcon,
} from '@mui/icons-material';
import SubscriptionPlanService from '../../../services/subscriptionPlan_services';
import RoleManagerService from '../../../services/roleManager_services';

const EMPTY_FEATURE = { offer: '', field_type: 'boolean', value: 'Yes', options: '', planId: '' };
const TYPE_API_LABEL = { text: 'Text', number: 'Number', select: 'Select', boolean: 'Yes / No' };

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

const FORM_TABS = ['Features', 'Menus', 'Dashboard', 'Notification', 'Field Definition'];

function AccessTreePanel({ title, items, selectedIds, setSelectedIds, expanded, setExpanded, emptyMessage, labelKey = 'message_id' }) {
  const buildTree = (list) => {
    const map = {};
    const roots = [];
    list.forEach(item => { map[item.id] = { ...item, children: [] }; });
    list.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    const sort = (nodes) => {
      nodes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      nodes.forEach(n => sort(n.children));
    };
    sort(roots);
    return roots;
  };

  const getDescendantIds = (node) => {
    const ids = [];
    const walk = (n) => { for (const child of n.children) { ids.push(child.id); walk(child); } };
    walk(node);
    return ids;
  };

  const getAllIds = (node) => [node.id, ...getDescendantIds(node)];

  const getCheckState = (node) => {
    const isChecked = selectedIds.has(node.id);
    if (!node.children || node.children.length === 0) return isChecked ? 'checked' : 'unchecked';
    const descendantIds = getDescendantIds(node);
    const checkedCount = descendantIds.filter(id => selectedIds.has(id)).length;
    if (isChecked && checkedCount === descendantIds.length) return 'checked';
    if (isChecked || checkedCount > 0) return 'indeterminate';
    return 'unchecked';
  };

  const toggleNode = (node) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const ids = getAllIds(node);
      const state = getCheckState(node);
      if (state === 'checked') {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
        let parentId = node.parent_id;
        while (parentId) {
          next.add(parentId);
          const parent = items.find(m => m.id === parentId);
          parentId = parent ? parent.parent_id : null;
        }
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(items.map(m => m.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const tree = buildTree(items);
  const hasHierarchy = items.some(it => it.parent_id);

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expanded[node.id];
    const checkState = getCheckState(node);
    const isChecked = checkState === 'checked';
    const isIndeterminate = checkState === 'indeterminate';

    let selDesc = 0, totalDesc = 0;
    if (hasChildren) {
      const descIds = getDescendantIds(node);
      totalDesc = descIds.length;
      selDesc = descIds.filter(id => selectedIds.has(id)).length;
    }

    const rowBg = level === 0 && hasChildren ? '#fafbfc' : 'transparent';

    return (
      <React.Fragment key={node.id}>
        <Box sx={{
          display: 'flex', alignItems: 'center',
          py: 0.6, pl: level * 2.5 + 0.5, pr: 1,
          bgcolor: rowBg,
          borderBottom: level === 0 ? '1px solid #eef0f4' : '1px dashed #f0f0f5',
          '&:hover': { bgcolor: '#f5f7fa' },
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
          onClick={(e) => {
            if (e.target.closest('.tree-toggle-btn')) return;
            toggleNode(node);
          }}
        >
          {hasChildren ? (
            <IconButton className="tree-toggle-btn" size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(prev => ({ ...prev, [node.id]: !prev[node.id] }));
              }}
              sx={{ p: 0.25, mr: 0.25 }}>
              {isExpanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
            </IconButton>
          ) : <Box sx={{ width: 28 }} />}
          <Checkbox
            size="small"
            checked={isChecked}
            indeterminate={isIndeterminate}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggleNode(node)}
            sx={{ p: 0.25, mr: 0.5 }}
          />
          {hasChildren && (isExpanded
            ? <FolderOpen sx={{ fontSize: 17, color: 'primary.main', mr: 0.75 }} />
            : <Folder sx={{ fontSize: 17, color: 'primary.main', mr: 0.75 }} />)}
          <Typography
            variant="body2"
            sx={{
              fontSize: hasChildren ? 13 : 12.5,
              fontWeight: hasChildren ? 600 : 400,
              color: 'text.primary',
              flex: 1,
            }}
          >
            {node[labelKey] || node.name || node.label || node.widget_name || node.notification_name || node.field_name || node.title || `#${node.id}`}
          </Typography>
          {hasChildren && (
            <Chip
              label={`${selDesc}/${totalDesc}`}
              size="small"
              color={selDesc === totalDesc && totalDesc > 0 ? 'primary' : selDesc > 0 ? 'warning' : 'default'}
              variant={selDesc === 0 ? 'outlined' : 'filled'}
              sx={{ height: 20, fontSize: 10, fontWeight: 600, ml: 0.5, minWidth: 44 }}
            />
          )}
        </Box>
        {hasChildren && (
          <Collapse in={isExpanded} timeout={200}>
            {node.children.map(child => renderNode(child, level + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{
        px: 2, py: 1.5,
        bgcolor: '#f5f8ff',
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, fontSize: 14 }}>
            {title}
          </Typography>
          <Chip
            label={`${selectedIds.size} / ${items.length} selected`}
            size="small"
            color={selectedIds.size > 0 ? 'primary' : 'default'}
            variant={selectedIds.size > 0 ? 'filled' : 'outlined'}
            sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" variant="outlined" onClick={selectAll} disabled={items.length === 0}
            sx={{ fontSize: 11, minWidth: 0, px: 1.5, height: 28 }}>Select All</Button>
          <Button size="small" variant="outlined" onClick={deselectAll} disabled={selectedIds.size === 0}
            sx={{ fontSize: 11, minWidth: 0, px: 1.5, height: 28 }}>Clear</Button>
          {hasHierarchy && (
            <>
              <Button size="small" variant="outlined" disabled={items.length === 0}
                sx={{ fontSize: 11, minWidth: 0, px: 1.5, height: 28 }}
                onClick={() => {
                  const exp = {};
                  items.forEach(m => { if (m.children || m.menu_type === 'collapse') exp[m.id] = true; });
                  setExpanded(exp);
                }}>Expand All</Button>
              <Button size="small" variant="outlined" onClick={() => setExpanded({})}
                sx={{ fontSize: 11, minWidth: 0, px: 1.5, height: 28 }}>Collapse All</Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ p: 0.5, flex: 1, overflow: 'auto', bgcolor: '#fff' }}>
        {items.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Folder sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {emptyMessage || 'No items'}
            </Typography>
          </Box>
        ) : (
          tree.map(node => renderNode(node, 0))
        )}
      </Box>
    </Paper>
  );
}

export default function FeaturesMapping() {
  const [activeTab, setActiveTab] = useState(0);
  const [activePlanTab, setActivePlanTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form mode state
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [formTab, setFormTab] = useState(0);
  const [newFeature, setNewFeature] = useState({ ...EMPTY_FEATURE });
  const [featureError, setFeatureError] = useState('');
  const [editingFeature, setEditingFeature] = useState(null);

  // Menus state (for Menus tab inside the form)
  const [allMenus, setAllMenus] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState(new Set());
  const [menuExpanded, setMenuExpanded] = useState({});

  // Dashboard / Notification / Field Definition trees (placeholder — data source TBD)
  const [allDashboards, setAllDashboards] = useState([]);
  const [selectedDashboardIds, setSelectedDashboardIds] = useState(new Set());
  const [dashboardExpanded, setDashboardExpanded] = useState({});

  const [allNotifications, setAllNotifications] = useState([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState(new Set());
  const [notificationExpanded, setNotificationExpanded] = useState({});

  const [allFieldDefs, setAllFieldDefs] = useState([]);
  const [selectedFieldDefIds, setSelectedFieldDefIds] = useState(new Set());
  const [fieldDefExpanded, setFieldDefExpanded] = useState({});

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, feature: null, busy: false });

  const selectedType = COMPANY_TYPES[activeTab];
  const selectedPlan = plans[activePlanTab];

  const fetchPlans = useCallback(async () => {
    if (!selectedType) return;
    setLoading(true);
    setError('');
    try {
      const res = await SubscriptionPlanService.getPlansByCompanyType(selectedType.id);
      setPlans(res.data || []);
      setActivePlanTab(0);
      setFeatures([]);
    } catch {
      setError('Failed to load plans');
    }
    setLoading(false);
  }, [selectedType]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const fetchFeatures = useCallback(async () => {
    if (!selectedType || !selectedPlan) { setFeatures([]); return; }
    setLoading(true);
    try {
      const res = await SubscriptionPlanService.getFeaturesByPlanType(selectedType.id, selectedPlan.id);
      setFeatures(res.data || []);
    } catch {
      setError('Failed to load features');
    }
    setLoading(false);
  }, [selectedType, selectedPlan]);

  useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

  const planNameById = useMemo(() => {
    const map = {};
    plans.forEach(p => { map[p.id] = p.plan_name; });
    return map;
  }, [plans]);

  const fetchMenusForType = async (companyTypeId) => {
    try {
      const res = await SubscriptionPlanService.getMenusByCompanyType(companyTypeId);
      setAllMenus(res.data || []);
    } catch {
      setAllMenus([]);
    }
  };

  const fetchWidgetsForType = async (companyTypeId) => {
    try {
      const res = await RoleManagerService.getWidgets(companyTypeId);
      setAllDashboards(res.data || []);
    } catch {
      setAllDashboards([]);
    }
  };

  const fetchNotificationsForType = async (companyTypeId) => {
    try {
      const res = await RoleManagerService.getNotificationTypes(companyTypeId);
      setAllNotifications(res.data || []);
    } catch {
      setAllNotifications([]);
    }
  };

  const fetchFieldsForType = async (companyTypeId) => {
    try {
      const res = await RoleManagerService.getFields(companyTypeId);
      setAllFieldDefs(res.data || []);
    } catch {
      setAllFieldDefs([]);
    }
  };

  const apiTypeToInternal = (t) => {
    if (!t) return 'text';
    const s = String(t).toLowerCase().trim();
    if (s === 'number') return 'number';
    if (s === 'select') return 'select';
    if (s === 'yes / no' || s === 'yes/no' || s === 'boolean') return 'boolean';
    return 'text';
  };

  const toIdArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => Number(v)).filter(v => !Number.isNaN(v));
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.map(v => Number(v)).filter(v => !Number.isNaN(v)) : [];
      } catch { return []; }
    }
    return [];
  };

  const expandAncestors = (items, selectedIds) => {
    const map = {};
    items.forEach(it => { map[it.id] = it; });
    const exp = {};
    selectedIds.forEach(id => {
      let parentId = map[id]?.parent_id;
      while (parentId) {
        exp[parentId] = true;
        parentId = map[parentId]?.parent_id;
      }
    });
    return exp;
  };

  const goToForm = async (feature = null) => {
    if (feature) {
      setEditingFeature(feature);
      setNewFeature({
        offer: feature.feature_message || '',
        field_type: apiTypeToInternal(feature.type),
        value: feature.value ?? '',
        options: Array.isArray(feature.options)
          ? feature.options.join(', ')
          : (feature.options || ''),
        planId: feature.planId || '',
      });
    } else {
      setEditingFeature(null);
      setNewFeature({ ...EMPTY_FEATURE, planId: selectedPlan?.id || '' });
    }
    setFeatureError('');
    setFormTab(0);

    const preMenuIds = feature ? toIdArray(feature.menus) : [];
    const preDashboardIds = feature ? toIdArray(feature.dashboard) : [];
    const preNotificationIds = feature ? toIdArray(feature.notification) : [];
    const preFieldIds = feature ? toIdArray(feature.field) : [];

    setSelectedMenuIds(new Set(preMenuIds));
    setMenuExpanded({});
    setAllMenus([]);
    setSelectedDashboardIds(new Set(preDashboardIds));
    setDashboardExpanded({});
    setAllDashboards([]);
    setSelectedNotificationIds(new Set(preNotificationIds));
    setNotificationExpanded({});
    setAllNotifications([]);
    setSelectedFieldDefIds(new Set(preFieldIds));
    setFieldDefExpanded({});
    setAllFieldDefs([]);
    setMode('form');
    if (selectedType) {
      const [menusRes, widgetsRes, notifRes, fieldsRes] = await Promise.all([
        SubscriptionPlanService.getMenusByCompanyType(selectedType.id).catch(() => ({ data: [] })),
        RoleManagerService.getWidgets(selectedType.id).catch(() => ({ data: [] })),
        RoleManagerService.getNotificationTypes(selectedType.id).catch(() => ({ data: [] })),
        RoleManagerService.getFields(selectedType.id).catch(() => ({ data: [] })),
      ]);
      const menus = menusRes.data || [];
      const widgets = widgetsRes.data || [];
      const notifs = notifRes.data || [];
      const fields = fieldsRes.data || [];
      setAllMenus(menus);
      setAllDashboards(widgets);
      setAllNotifications(notifs);
      setAllFieldDefs(fields);

      if (feature) {
        setMenuExpanded(expandAncestors(menus, preMenuIds));
        setDashboardExpanded(expandAncestors(widgets, preDashboardIds));
        setNotificationExpanded(expandAncestors(notifs, preNotificationIds));
        setFieldDefExpanded(expandAncestors(fields, preFieldIds));
      }
    }
  };

  const goToList = () => {
    setMode('list');
    setFeatureError('');
    setEditingFeature(null);
  };

  const saveNewFeature = async () => {
    const planId = newFeature.planId || selectedPlan?.id;
    if (!planId) { setFeatureError('Plan is required (select a plan tab first)'); setFormTab(0); return; }
    if (!newFeature.offer.trim()) { setFeatureError('Feature message is required'); setFormTab(0); return; }
    const valueStr = String(newFeature.value ?? '').trim();
    if (!valueStr) { setFeatureError('Value is required'); setFormTab(0); return; }
    if (newFeature.field_type === 'select') {
      const opts = newFeature.options.split(',').map(o => o.trim()).filter(Boolean);
      if (opts.length === 0) { setFeatureError('At least one option is required'); setFormTab(0); return; }
    }
    const payload = {
      planId,
      company_type_id: selectedType?.id,
      feature_message: newFeature.offer.trim(),
      type: TYPE_API_LABEL[newFeature.field_type] || 'Text',
      value: newFeature.value,
      options: newFeature.field_type === 'select'
        ? newFeature.options.split(',').map(o => o.trim()).filter(Boolean)
        : null,
      menus: Array.from(selectedMenuIds),
      dashboard: Array.from(selectedDashboardIds),
      notification: Array.from(selectedNotificationIds),
      field: Array.from(selectedFieldDefIds),
    };
    try {
      if (editingFeature) {
        await SubscriptionPlanService.updateFeatureMapping(editingFeature.id, payload);
      } else {
        await SubscriptionPlanService.createFeatureMapping(payload);
      }
      goToList();
      await fetchFeatures();
    } catch {
      setFeatureError(editingFeature ? 'Failed to update feature' : 'Failed to save feature');
    }
  };

  const handleEditFeature = (feature) => {
    goToForm(feature);
  };

  const handleDeleteFeature = (feature) => {
    if (!feature?.id) return;
    setDeleteDialog({ open: true, feature, busy: false });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(d => d.busy ? d : { open: false, feature: null, busy: false });
  };

  const confirmDeleteFeature = async () => {
    const feature = deleteDialog.feature;
    if (!feature?.id) return;
    setDeleteDialog(d => ({ ...d, busy: true }));
    setError('');
    try {
      await SubscriptionPlanService.deleteFeatureMapping(feature.id);
      setDeleteDialog({ open: false, feature: null, busy: false });
      await fetchFeatures();
    } catch {
      setError('Failed to delete feature');
      setDeleteDialog({ open: false, feature: null, busy: false });
    }
  };

  const valueChip = (f) => {
    if (f.type === 'Yes / No') {
      const isYes = String(f.value).toLowerCase() === 'yes';
      return <Chip label={f.value} size="small" color={isYes ? 'success' : 'default'}
        variant={isYes ? 'filled' : 'outlined'} sx={{ height: 20, fontSize: 11 }} />;
    }
    return <Typography variant="body2" sx={{ fontSize: 12 }}>{f.value ?? '-'}</Typography>;
  };


  // ===================== FORM VIEW =====================
  if (mode === 'form') {
    return (
      <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Form Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={goToList} size="small"><BackIcon /></IconButton>
            <Typography variant="h6" sx={{ fontSize: 18 }}>
              {editingFeature ? 'Edit Feature' : 'Add Feature'}
            </Typography>
            {selectedType && (
              <Chip label={selectedType.name} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
            )}
            {editingFeature?.feature_key && (
              <Chip label={editingFeature.feature_key} size="small" variant="outlined"
                sx={{ height: 22, fontSize: 11, fontFamily: 'monospace' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={goToList}>Cancel</Button>
            {formTab > 0 && (
              <Button variant="outlined" size="small"
                onClick={() => setFormTab(t => Math.max(t - 1, 0))}>
                Previous
              </Button>
            )}
            {formTab < FORM_TABS.length - 1 ? (
              <Button variant="contained" size="small"
                onClick={() => setFormTab(t => Math.min(t + 1, FORM_TABS.length - 1))}>
                Next
              </Button>
            ) : (
              <Button variant="contained" size="small" onClick={saveNewFeature}
                startIcon={<SaveIcon sx={{ fontSize: 16 }} />}>
                {editingFeature ? 'Update Feature' : 'Save Feature'}
              </Button>
            )}
          </Box>
        </Box>

        {featureError && (
          <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setFeatureError('')}>
            {featureError}
          </Alert>
        )}

        {/* Form Card — tabs + body wrapped together */}
        <Card sx={{ flex: 1, mt: 0.5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
            <Tabs
              value={formTab}
              onChange={(_, v) => setFormTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { minHeight: 38, py: 0.5, textTransform: 'none', fontSize: 13 } }}
            >
              {FORM_TABS.map((t) => <Tab key={t} label={t} />)}
            </Tabs>
          </Box>

          {/* Form Body */}
          <Box sx={{ flex: 1, overflow: 'hidden', p: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Features Tab */}
          {formTab === 0 && (
            <Paper variant="outlined" sx={{ p: 3, width: '100%', height: '100%', overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                Feature Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth size="small" label="Feature Message" autoFocus
                    error={!!featureError && featureError.toLowerCase().includes('message')}
                    value={newFeature.offer}
                    onChange={(e) => {
                      setNewFeature(p => ({ ...p, offer: e.target.value }));
                      if (featureError) setFeatureError('');
                    }} />
                </Grid>
                <Grid size={{ xs: 6 }} />
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth size="small" label="Type"
                    value={newFeature.field_type}
                    onChange={(e) => setNewFeature(p => ({
                      ...p,
                      field_type: e.target.value,
                      value: e.target.value === 'boolean' ? 'Yes' : '',
                    }))}>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="select">Select</MenuItem>
                    <MenuItem value="boolean">Yes / No</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }} />
                {newFeature.field_type === 'select' && (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" label="Options (comma separated)"
                        placeholder="e.g. Small, Medium, Large"
                        error={!!featureError && featureError.toLowerCase().includes('option')}
                        value={newFeature.options}
                        onChange={(e) => {
                          setNewFeature(p => ({ ...p, options: e.target.value }));
                          if (featureError) setFeatureError('');
                        }} />
                    </Grid>
                    <Grid size={{ xs: 6 }} />
                  </>
                )}
                <Grid size={{ xs: 6 }}>
                  {newFeature.field_type === 'text' && (
                    <TextField fullWidth size="small" label="Value"
                      error={!!featureError && !String(newFeature.value ?? '').trim()}
                      value={newFeature.value}
                      onChange={(e) => {
                        setNewFeature(p => ({ ...p, value: e.target.value }));
                        if (featureError) setFeatureError('');
                      }} />
                  )}
                  {newFeature.field_type === 'number' && (
                    <TextField fullWidth size="small" label="Value" type="number"
                      error={!!featureError && !String(newFeature.value ?? '').trim()}
                      value={newFeature.value}
                      onChange={(e) => {
                        setNewFeature(p => ({ ...p, value: e.target.value }));
                        if (featureError) setFeatureError('');
                      }} />
                  )}
                  {newFeature.field_type === 'select' && (
                    <TextField select fullWidth size="small" label="Value"
                      error={!!featureError && !String(newFeature.value ?? '').trim()}
                      value={newFeature.value}
                      onChange={(e) => {
                        setNewFeature(p => ({ ...p, value: e.target.value }));
                        if (featureError) setFeatureError('');
                      }}>
                      {newFeature.options.split(',').map(o => o.trim()).filter(Boolean).map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  )}
                  {newFeature.field_type === 'boolean' && (
                    <TextField select fullWidth size="small" label="Value"
                      value={newFeature.value || 'Yes'}
                      onChange={(e) => setNewFeature(p => ({ ...p, value: e.target.value }))}>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  )}
                </Grid>
                <Grid size={{ xs: 6 }} />
              </Grid>
            </Paper>
          )}

          {/* Menus Tab */}
          {formTab === 1 && (
            <AccessTreePanel
              title="Menu Access"
              items={allMenus}
              selectedIds={selectedMenuIds}
              setSelectedIds={setSelectedMenuIds}
              expanded={menuExpanded}
              setExpanded={setMenuExpanded}
              emptyMessage="No menus for this company type"
            />
          )}

          {/* Dashboard Tab */}
          {formTab === 2 && (
            <AccessTreePanel
              title="Dashboard Access"
              items={allDashboards}
              selectedIds={selectedDashboardIds}
              setSelectedIds={setSelectedDashboardIds}
              expanded={dashboardExpanded}
              setExpanded={setDashboardExpanded}
              emptyMessage="No dashboards available"
            />
          )}

          {/* Notification Tab */}
          {formTab === 3 && (
            <AccessTreePanel
              title="Notification Access"
              items={allNotifications}
              selectedIds={selectedNotificationIds}
              setSelectedIds={setSelectedNotificationIds}
              expanded={notificationExpanded}
              setExpanded={setNotificationExpanded}
              emptyMessage="No notifications available"
            />
          )}

          {/* Field Definition Tab */}
          {formTab === 4 && (
            <AccessTreePanel
              title="Field Definition"
              items={allFieldDefs}
              selectedIds={selectedFieldDefIds}
              setSelectedIds={setSelectedFieldDefIds}
              expanded={fieldDefExpanded}
              setExpanded={setFieldDefExpanded}
              emptyMessage="No field definitions available"
            />
          )}
          </Box>
        </Card>
      </Box>
    );
  }

  // ===================== LIST VIEW =====================
  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexShrink: 0 }}>
        <Box>
          <Typography variant="h6">Features Mapping</Typography>
          <Typography variant="caption" color="text.secondary">
            Manage subscription plans, pricing, menus, and features per company type
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => goToForm()}
          disabled={plans.length === 0}
        >
          Add Feature
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Company Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { minHeight: 40, py: 0.5, textTransform: 'none', fontSize: 13 } }}
        >
          {COMPANY_TYPES.map((ct, idx) => (
            <Tab
              key={ct.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {ct.name}
                  {activeTab === idx && plans.length > 0 && (
                    <Chip label={plans.length} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Plan Tabs */}
      {plans.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0, bgcolor: '#f7f9ff' }}>
          <Tabs
            value={activePlanTab}
            onChange={(_, v) => setActivePlanTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { minHeight: 36, py: 0.25, textTransform: 'none', fontSize: 12 } }}
          >
            {plans.map((p) => (
              <Tab key={p.id} label={p.plan_name} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Body */}
      <Card sx={{ flex: 1, mt: 0.5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading...</Typography>
        ) : plans.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
            No plans for {selectedType?.name}.
          </Typography>
        ) : features.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
            No features for plan "{selectedPlan?.plan_name}".
          </Typography>
        ) : (
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#fafafa', width: 100 }}>Key</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#fafafa' }}>Feature</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#fafafa', width: 120 }}>Value</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#fafafa', width: 90 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map(f => (
                  <TableRow key={f.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip label={f.feature_key} size="small" variant="outlined"
                        sx={{ height: 18, fontSize: 10, fontFamily: 'monospace' }} />
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: 12 }}>{f.feature_message}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{valueChip(f)}</TableCell>
                    <TableCell sx={{ py: 0.25 }}>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditFeature(f)}>
                            <EditIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteFeature(f)}>
                            <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 380 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: 'error.lighter', color: 'error.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid', borderColor: 'error.light',
          }}>
            <WarningIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
            Delete Feature
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ fontSize: 14, color: 'text.primary' }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'error.main' }}>
              "{deleteDialog.feature?.feature_message || deleteDialog.feature?.feature_key || 'this feature'}"
            </Box>
            ?
          </DialogContentText>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" size="small" disabled={deleteDialog.busy}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteFeature}
            variant="contained"
            color="error"
            size="small"
            disabled={deleteDialog.busy}
            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
          >
            {deleteDialog.busy ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
