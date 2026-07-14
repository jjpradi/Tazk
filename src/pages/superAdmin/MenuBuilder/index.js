import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Grid, IconButton,
  List, ListItem, ListItemIcon, ListItemText, MenuItem, Switch, TextField,
  Tooltip, Typography, Checkbox, FormGroup, Select, InputLabel, FormControl,
  Alert, Tab, Tabs, Paper, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandLess, ExpandMore, Folder, InsertDriveFile,
  DragIndicator as DragIcon, Settings as SettingsIcon, Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon, Search as SearchIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MenuAdminService from '../../../services/menuAdmin_services';
import * as RouteIcons from '../../routesIcons';

// Extract all icon names from routesIcons
const ALL_ICON_ENTRIES = Object.entries(RouteIcons)
  .filter(([key]) => key !== 'default')
  .map(([name, component]) => ({ name, component, isSvg: typeof component === 'string' }));

const MENU_TYPES = ['item', 'collapse', 'group', 'report_category', 'report', 'panel-item', 'sidebar-item', 'tab-item'];

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

const COMPANY_TYPE_MAP = Object.fromEntries(COMPANY_TYPES.map(c => [c.id, c.name]));

// Roles per company type (from sa_company_type_roles table)
const COMPANY_TYPE_ROLES = {
  2:  ['Administrator', 'Manager', 'Employee', 'POS User'],
  3:  ['Administrator', 'Manager', 'Employee', 'Salesman', 'Team Lead', 'Sales Manager', 'Delivery Person', 'Back Office', 'Accountant'],
  4:  ['Administrator', 'Manager', 'Employee', 'Engineer'],
  5:  ['Administrator', 'Manager', 'Employee', 'HR Manager', 'Front Desk'],
  7:  ['Administrator', 'Manager', 'Employee'],
  8:  ['Administrator'],
  9:  ['Administrator', 'Manager', 'Employee'],
  10: ['Administrator', 'Manager', 'Employee', 'Salesman'],
  11: ['Administrator', 'Manager', 'Employee'],
  12: ['Administrator', 'Manager', 'Employee', 'Front Desk', 'Client'],
  6:  ['Administrator'],
};

const ALL_ROLE_NAMES = [...new Set(Object.values(COMPANY_TYPE_ROLES).flat())];

// Subscription-based company types and their tier names
const SUBSCRIPTION_COMPANY_TYPES = [
  { id: 2, name: 'Point of Sale', tiers: { 1: 'Starter', 2: 'Retail', 3: 'Retail Chain', 4: 'Retail Chain+' } },
  { id: 3, name: 'Sales', tiers: { 1: 'Starter', 2: 'Standard', 3: 'Premium', 4: 'Premium+' } },
  { id: 4, name: 'Service', tiers: { 1: 'Service' } },
  { id: 5, name: 'Payroll', tiers: { 1: 'Starter', 2: 'Essential', 3: 'Essential+', 4: 'Comprehensive' } },
  { id: 9, name: 'Asset Mgmt', tiers: { 1: 'Starter', 2: 'Basic', 3: 'Pro', 4: 'Enterprise' } },
  { id: 10, name: 'Lead Mgmt', tiers: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' } },
  { id: 11, name: 'Projects', tiers: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' } },
  { id: 12, name: 'Stact', tiers: { 1: 'Basic', 2: 'Standard', 3: 'Premium', 4: 'Ultimate' } },
];

const flattenTree = (nodes) => {
  const result = [];
  const walk = (items) => {
    for (const item of items) {
      const { children, ...rest } = item;
      result.push(rest);
      if (children && children.length > 0) walk(children);
    }
  };
  walk(nodes);
  return result;
};

const normalizeExcludedRoleAccess = (entries = [], companyTypes = []) => {
  const visibleRoleMap = {};
  const hiddenRoleMap = {};

  for (const entry of entries) {
    const ctId = entry.company_type_id || '_global';

    if (entry.is_visible === 1) {
      if (!visibleRoleMap[ctId]) visibleRoleMap[ctId] = [];
      visibleRoleMap[ctId].push(entry.role_name);
    } else if (entry.is_visible === 0) {
      if (!hiddenRoleMap[ctId]) hiddenRoleMap[ctId] = [];
      hiddenRoleMap[ctId].push(entry.role_name);
    }
  }

  if (Object.keys(visibleRoleMap).length > 0) {
    const normalized = {};
    for (const ctId of companyTypes) {
      const roles = COMPANY_TYPE_ROLES[ctId] || [];
      const visibleRoles = visibleRoleMap[ctId] || [];
      normalized[ctId] = roles.filter(role => !visibleRoles.includes(role));
    }
    return normalized;
  }

  return hiddenRoleMap;
};

const buildVisibleRolesPayload = (excludedRoleAccess = {}, companyTypes = []) => {
  const payload = [];

  for (const ctId of companyTypes) {
    const roles = COMPANY_TYPE_ROLES[ctId] || [];
    const excludedRoles = excludedRoleAccess[ctId] || [];

    for (const roleName of roles) {
      if (!excludedRoles.includes(roleName)) {
        payload.push({
          company_type_id: Number(ctId),
          role_name: roleName,
          is_visible: 1,
        });
      }
    }
  }

  return payload;
};

export default function MenuBuilder() {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [companyTypeMenuMap, setCompanyTypeMenuMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [mode, setMode] = useState('list'); // 'list' or 'edit'
  const [editItem, setEditItem] = useState(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [companyTypeDialog, setCompanyTypeDialog] = useState({ open: false, menuId: null, selected: [] });
  const [subscriptionDialog, setSubscriptionDialog] = useState({ open: false, menuId: null, menuName: '', tierMap: {} });
  const [roleDialog, setRoleDialog] = useState({ open: false, menuId: null, excluded: [] });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, confirmText: '', countdown: 0 });
  const [expanded, setExpanded] = useState({});


  const goToEdit = (item, isNew = false) => {
    const companyTypes = item.company_types || [];
    setEditItem({
      ...item,
      _companyTypes: companyTypes,
    });
    setIsNewItem(isNew);
    setIconSearch('');
    setMode('edit');
  };

  const goToList = () => {
    setMode('list');
    setEditItem(null);
    setIsNewItem(false);
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICON_ENTRIES;
    const q = iconSearch.toLowerCase();
    return ALL_ICON_ENTRIES.filter(ic => ic.name.toLowerCase().includes(q));
  }, [iconSearch]);

  const selectedCompanyType = COMPANY_TYPES[activeTab]?.id;

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await MenuAdminService.getAllMenuItems();
      const data = res.data || [];
      const flat = Array.isArray(data) && data.length > 0 && Array.isArray(data[0].children)
        ? flattenTree(data) : data;
      setAllMenuItems(flat);

      // Build company_type -> menu_id set mapping
      const ctMap = {};
      for (const item of flat) {
        if (item.company_types) {
          for (const ctId of item.company_types) {
            if (!ctMap[ctId]) ctMap[ctId] = new Set();
            ctMap[ctId].add(item.id);
          }
        }
      }
      setCompanyTypeMenuMap(ctMap);
    } catch (err) {
      setError('Failed to load menu items');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenuItems(); }, [fetchMenuItems]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const buildTree = (items) => {
    const map = {};
    const roots = [];
    items.forEach(item => { map[item.id] = { ...item, children: [] }; });
    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    const getSortOrder = (node) => {
      if (selectedCompanyType && node.ct_sort_orders?.[selectedCompanyType] !== undefined) {
        return node.ct_sort_orders[selectedCompanyType];
      }
      return node.sort_order || 0;
    };
    const sortChildren = (nodes) => {
      nodes.sort((a, b) => getSortOrder(a) - getSortOrder(b));
      nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);
    return roots;
  };

  const isUnassignedTab = activeTab === COMPANY_TYPES.length;

  // Get menus not assigned to any company type
  const getUnassignedItems = () => {
    const allAssignedIds = new Set();
    for (const ctId of Object.keys(companyTypeMenuMap)) {
      const menuIds = companyTypeMenuMap[ctId];
      if (menuIds) menuIds.forEach(id => allAssignedIds.add(id));
    }
    return allMenuItems.filter(item => !allAssignedIds.has(item.id));
  };

  // Filter items for the selected company type
  const getFilteredItems = () => {
    if (isUnassignedTab) return getUnassignedItems();
    if (!selectedCompanyType) return allMenuItems;
    const ctMenuIds = companyTypeMenuMap[selectedCompanyType];
    if (!ctMenuIds || ctMenuIds.size === 0) {
      // Fallback: show all items (company_types info may not be available)
      return allMenuItems;
    }
    // Include items in this company type AND their parents
    const includedIds = new Set(ctMenuIds);
    const addParents = (items) => {
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of items) {
          if (includedIds.has(item.id) && item.parent_id && !includedIds.has(item.parent_id)) {
            includedIds.add(item.parent_id);
            changed = true;
          }
        }
      }
    };
    addParents(allMenuItems);
    return allMenuItems.filter(item => includedIds.has(item.id));
  };

  const filteredItems = getFilteredItems();
  const tree = buildTree(filteredItems);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const exp = {};
    filteredItems.forEach(item => {
      if (item.menu_type === 'collapse' || item.menu_type === 'group') exp[item.id] = true;
    });
    setExpanded(exp);
  };

  const collapseAll = () => setExpanded({});

  // --- CRUD Handlers ---
  const [saving, setSaving] = useState(false);

  const handleSaveMenuItem = async () => {
    if (!editItem.message_id || !editItem.menu_key) {
      setError('Display Name and Key are required');
      return;
    }
    setSaving(true);
    try {
      let menuId = editItem.id;
      if (isNewItem) {
        const res = await MenuAdminService.createMenuItem(editItem);
        menuId = res.data?.id || res.data?.insertId;
      } else {
        await MenuAdminService.updateMenuItem(editItem.id, editItem);
      }

      if (menuId) {
        const promises = [];

        // Save company types
        if (editItem._companyTypes?.length > 0) {
          const ctPayload = editItem._companyTypes.map(ctId => ({ company_type_id: ctId, is_active: 1 }));
          promises.push(MenuAdminService.setMenuCompanyTypes(menuId, ctPayload));
        }

        // For new items: auto-add to top-tier subscription plans + set admin-only RBAC
        if (isNewItem && editItem._companyTypes?.length > 0) {
          promises.push(MenuAdminService.addToTopTierPlans(menuId, editItem._companyTypes));
          promises.push(MenuAdminService.setDefaultRbac(menuId, editItem._companyTypes));
        }

        // Subscriptions and Role Access for existing items are managed via
        // Subscription Manager and Role Access Manager pages.

        await Promise.all(promises);
      }

      showSuccess(isNewItem ? 'Menu item created' : 'Menu item updated');
      goToList();
      fetchMenuItems();
    } catch (err) {
      setError('Failed to save menu item');
    }
    setSaving(false);
  };

  const deleteMatched = deleteDialog.open && deleteDialog.item && deleteDialog.confirmText === deleteDialog.item.message_id;

  // Start countdown when confirm text matches
  useEffect(() => {
    if (!deleteDialog.open || !deleteDialog.item) return;
    if (deleteMatched) {
      setDeleteDialog(prev => ({ ...prev, countdown: 10 }));
    } else {
      setDeleteDialog(prev => ({ ...prev, countdown: 0 }));
    }
  }, [deleteMatched]);

  useEffect(() => {
    if (deleteDialog.countdown <= 0) return;
    const timer = setTimeout(() => {
      setDeleteDialog(prev => ({ ...prev, countdown: prev.countdown - 1 }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [deleteDialog.countdown]);

  const handleDeleteMenuItem = async () => {
    try {
      if (selectedCompanyType) {
        const res = await MenuAdminService.getMenuCompanyTypes(deleteDialog.item.id);
        const remaining = (res.data || [])
          .filter(ct => ct.company_type_id !== selectedCompanyType)
          .map(ct => ({ company_type_id: ct.company_type_id, is_active: 1 }));
        await MenuAdminService.setMenuCompanyTypes(deleteDialog.item.id, remaining);
        showSuccess(`Removed from ${COMPANY_TYPES.find(c => c.id === selectedCompanyType)?.name || 'company type'}`);
      } else {
        await MenuAdminService.deleteMenuItem(deleteDialog.item.id);
        showSuccess('Menu item deleted');
      }
      setDeleteDialog({ open: false, item: null, confirmText: '', countdown: 0 });
      fetchMenuItems();
    } catch (err) {
      setError('Failed to remove menu item');
    }
  };

  const handleDragEnd = async (result) => {
    console.log('[DragEnd]', { result, selectedCompanyType });
    if (!result.destination || !selectedCompanyType) {
      console.log('[DragEnd] Skipped — no destination or no company type');
      return;
    }
    const { source, destination } = result;
    const droppableId = source.droppableId;
    if (source.index === destination.index && source.droppableId === destination.droppableId) {
      console.log('[DragEnd] Skipped — same position');
      return;
    }

    // Find the children list for the droppable
    let siblings;
    if (droppableId === 'menu-tree'){
      siblings = [...tree];
    } else {
      // droppableId = "children-{parentId}"
      const parentId = Number(droppableId.replace('children-', ''));
      const findNode = (nodes) => {
        for (const n of nodes) {
          if (n.id === parentId) return n;
          if (n.children?.length) { const found = findNode(n.children); if (found) return found; }
        }
        return null;
      };
      const parent = findNode(tree);
      if (!parent?.children) return;
      siblings = [...parent.children];
    }

    const [moved] = siblings.splice(source.index, 1);
    siblings.splice(destination.index, 0, moved);

    const items = siblings.map((item, idx) => ({ id: item.id, sort_order: idx }));

    // Optimistically update local state so UI reorders immediately
    const sortMap = {};
    items.forEach(({ id, sort_order }) => { sortMap[id] = sort_order; });
    setAllMenuItems(prev => prev.map(item => {
      if (sortMap[item.id] !== undefined) {
        return {
          ...item,
          ct_sort_orders: { ...item.ct_sort_orders, [selectedCompanyType]: sortMap[item.id] },
          sort_order: sortMap[item.id],
        };
      }
      return item;
    }));

    console.log('[DragEnd] Saving:', { droppableId, selectedCompanyType, itemCount: items.length, items: items.slice(0, 5) });
    try {
      await MenuAdminService.reorderByCompanyType(selectedCompanyType, items);
      console.log('[DragEnd] Save success, refreshing...');
      fetchMenuItems();
    } catch (err) {
      console.error('[DragEnd] Save failed:', err);
      setError('Failed to reorder');
      fetchMenuItems();
    }
  };

  const handleOpenCompanyTypes = async (menuId) => {
    try {
      const res = await MenuAdminService.getMenuCompanyTypes(menuId);
      const selected = (res.data || []).map(ct => ct.company_type_id);
      setCompanyTypeDialog({ open: true, menuId, selected });
    } catch (err) {
      setError('Failed to load company types');
    }
  };

  const handleSaveCompanyTypes = async () => {
    try {
      const payload = companyTypeDialog.selected.map(ctId => ({ company_type_id: ctId, is_active: 1 }));
      await MenuAdminService.setMenuCompanyTypes(companyTypeDialog.menuId, payload);
      showSuccess('Company types updated');
      setCompanyTypeDialog({ open: false, menuId: null, selected: [] });
      fetchMenuItems();
    } catch (err) {
      setError('Failed to save company types');
    }
  };

  const handleOpenSubscriptions = async (menuId) => {
    try {
      const res = await MenuAdminService.getMenuSubscriptions(menuId);
      const rawData = res.data || [];

      // Store ALL existing entries (for merge on save)
      const allExistingEntries = rawData.map(e => ({
        company_type_id: e.company_type_id, subscription_tier: e.subscription_tier, is_active: 1
      }));

      // Build tierMap for dialog display (min tier per company type)
      const tierMap = {};
      for (const entry of rawData) {
        const ct = entry.company_type_id;
        if (!tierMap[ct] || entry.subscription_tier < tierMap[ct]) {
          tierMap[ct] = entry.subscription_tier;
        }
      }
      const menuItem = allMenuItems.find(m => m.id === menuId);
      setSubscriptionDialog({ open: true, menuId, menuName: menuItem?.message_id || '', tierMap, filterCompanyType: selectedCompanyType || null, allExistingEntries });
    } catch (err) {
      setError('Failed to load subscriptions');
    }
  };

  const handleSaveSubscriptions = async () => {
    try {
      // Keep entries from company types NOT shown in this dialog
      const dialogCompanyType = subscriptionDialog.filterCompanyType;
      const preserved = dialogCompanyType
        ? (subscriptionDialog.allExistingEntries || []).filter(e => e.company_type_id !== dialogCompanyType)
        : [];

      // Add entries from the dialog (only the filtered company type)
      const dialogSubs = [];
      for (const [ctId, minTier] of Object.entries(subscriptionDialog.tierMap)) {
        if (minTier > 0 && (!dialogCompanyType || Number(ctId) === dialogCompanyType)) {
          dialogSubs.push({ company_type_id: Number(ctId), subscription_tier: minTier, is_active: 1 });
        }
      }

      // Merge: preserved (other company types) + dialog (current company type)
      const merged = [...preserved, ...dialogSubs];
      await MenuAdminService.setMenuSubscriptions(subscriptionDialog.menuId, merged);
      showSuccess('Subscriptions updated');
      setSubscriptionDialog({ open: false, menuId: null, menuName: '', tierMap: {}, allExistingEntries: [] });
    } catch (err) {
      setError('Failed to save subscriptions');
    }
  };

  const handleOpenRoles = async (menuId) => {
    try {
      const [roleRes, ctRes] = await Promise.all([
        MenuAdminService.getMenuRoleAccess(menuId),
        MenuAdminService.getMenuCompanyTypes(menuId),
      ]);
      const allCompanyTypes = (ctRes.data || []).map(ct => ct.company_type_id);
      const companyTypes = selectedCompanyType
        ? allCompanyTypes.filter(ct => ct === selectedCompanyType)
        : allCompanyTypes;

      // Store ALL existing is_visible=0 entries (for merge on save)
      const allExistingExcluded = (roleRes.data || [])
        .filter(e => e.is_visible === 0)
        .map(e => ({ company_type_id: e.company_type_id, role_name: e.role_name, is_visible: 0 }));

      // Build roleAccess map for dialog display (only filtered company types)
      const roleAccess = {};
      for (const entry of allExistingExcluded) {
        if (companyTypes.includes(entry.company_type_id)) {
          const ct = entry.company_type_id;
          if (!roleAccess[ct]) roleAccess[ct] = [];
          roleAccess[ct].push(entry.role_name);
        }
      }

      const menuItem = allMenuItems.find(m => m.id === menuId);
      setRoleDialog({ open: true, menuId, menuName: menuItem?.message_id || '', companyTypes, roleAccess, allExistingExcluded });
    } catch (err) {
      setError('Failed to load role access');
    }
  };

  const handleSaveRoles = async () => {
    try {
      // Keep entries from company types NOT shown in this dialog
      const dialogCompanyTypes = new Set(roleDialog.companyTypes);
      const preserved = (roleDialog.allExistingExcluded || [])
        .filter(r => !dialogCompanyTypes.has(r.company_type_id));

      // Add entries from the dialog (only the filtered company type)
      const dialogRoles = [];
      for (const [ctId, excludedRoles] of Object.entries(roleDialog.roleAccess || {})) {
        for (const roleName of excludedRoles) {
          dialogRoles.push({ company_type_id: ctId === '_global' ? null : Number(ctId), role_name: roleName, is_visible: 0 });
        }
      }

      // Merge: preserved (other company types) + dialog (current company type)
      const merged = [...preserved, ...dialogRoles];
      await MenuAdminService.setMenuRoleAccess(roleDialog.menuId, merged);
      showSuccess('Role access updated');
      setRoleDialog({ open: false, menuId: null, menuName: '', companyTypes: [], roleAccess: {}, allExistingExcluded: [] });
    } catch (err) {
      setError('Failed to save role access');
    }
  };

  const PARENT_TYPES = ['collapse', 'group', 'report_category', 'panel-item', 'sidebar-item'];
  const getParentOptions = () => {
    return filteredItems
      .filter(m => PARENT_TYPES.includes(m.menu_type))
      .map(m => ({ id: m.id, message_id: m.message_id, menu_key: m.menu_key }));
  };

  const renderTreeItem = (node, level = 0, dragHandleProps = null) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const isCollapse = PARENT_TYPES.includes(node.menu_type);

    return (
      <Box key={node.id}>
        <ListItem
          sx={{
            pl: level * 4 + 1,
            py: 0.5,
            borderBottom: '1px solid #f0f0f0',
            '&:hover': { bgcolor: '#f8f9fa' },
          }}
          secondaryAction={
            <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
              <Tooltip title="Company Types"><IconButton size="small" onClick={() => handleOpenCompanyTypes(node.id)}><SettingsIcon sx={{ fontSize: 16 }} color="primary" /></IconButton></Tooltip>
              <Tooltip title="Edit"><IconButton size="small" onClick={() => goToEdit(node, false)}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, item: node })}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            </Box>
          }
        >
          {dragHandleProps && (
            <Box {...dragHandleProps} sx={{ display: 'flex', alignItems: 'center', mr: 0.5, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
              <DragIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Box>
          )}
          <ListItemIcon sx={{ minWidth: 28 }}>
            {(hasChildren || isCollapse) ? (
              <IconButton size="small" onClick={() => toggleExpand(node.id)} sx={{ p: 0.25 }}>
                {isExpanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
              </IconButton>
            ) : <InsertDriveFile sx={{ fontSize: 16 }} color="disabled" />}
          </ListItemIcon>
          <ListItemIcon sx={{ minWidth: 24 }}>
            {isCollapse ? <Folder sx={{ fontSize: 18 }} color="primary" /> : <InsertDriveFile sx={{ fontSize: 16 }} color="action" />}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={isCollapse ? 600 : 400} sx={{ fontSize: 13, minWidth: 180, flex: '0 0 auto' }}>
                  {node.message_id}
                  {!node.is_active && <Chip label="Inactive" size="small" color="error" sx={{ height: 16, fontSize: 8, ml: 0.5 }} />}
                </Typography>
                <Chip label={node.menu_type === 'report_category' ? 'category' : node.menu_type} size="small" variant="outlined"
                  color={node.menu_type === 'group' ? 'primary' : ['collapse','report_category','panel-item'].includes(node.menu_type) ? 'secondary' : 'default'}
                  sx={{ height: 18, fontSize: 9, minWidth: 50, mx: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, minWidth: 200, flex: '0 0 auto' }} noWrap>
                  {node.url || '-'}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ fontSize: 10, minWidth: 120, flex: '0 0 auto', opacity: 0.7 }} noWrap>
                  {node.icon_name || '-'}
                </Typography>
              </Box>
            }
          />
        </ListItem>
        {(hasChildren || isCollapse) && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Droppable droppableId={`children-${node.id}`} type="child">
              {(provided) => (
                <List disablePadding ref={provided.innerRef} {...provided.droppableProps}>
                  {node.children.map((child, idx) => (
                    <Draggable key={child.id} draggableId={String(child.id)} index={idx}>
                      {(provided, snapshot) => (
                        <Box ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                          sx={{ bgcolor: snapshot.isDragging ? '#e3f2fd' : 'transparent', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                          {renderTreeItem(child, level + 1, null)}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {isCollapse && (
                    <ListItem sx={{ pl: (level + 1) * 4 + 1, py: 0.25 }}>
                      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 11 }}
                        onClick={() => goToEdit({ message_id: '', menu_key: '', menu_type: 'item', url: '', icon_name: '', parent_id: node.id, sort_order: (node.children?.length || 0) + 1, is_active: 1 }, true)}
                      >Add child</Button>
                    </ListItem>
                  )}
                </List>
              )}
            </Droppable>
          </Collapse>
        )}
      </Box>
    );
  };

  const menuCount = filteredItems.length;
  const collapseCount = filteredItems.filter(i => i.menu_type === 'collapse').length;
  const itemCount = filteredItems.filter(i => i.menu_type === 'item').length;

  // Subscription-based company types that are currently selected
  // ==================== EDIT MODE ====================
  if (mode === 'edit' && editItem) {
    const selectedIconEntry = ALL_ICON_ENTRIES.find(ic => ic.name === editItem.icon_name);
    return (
      <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, flexShrink: 0 }}>
          <IconButton onClick={goToList} size="small" sx={{ mr: 1 }}><BackIcon /></IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            {isNewItem ? 'Add Menu Item' : `Edit: ${editItem.message_id}`}
          </Typography>
          {!isNewItem && <Chip label={`ID: ${editItem.id}`} size="small" variant="outlined" sx={{ mr: 2, height: 22, fontSize: 11 }} />}
          <Button variant="outlined" size="small" onClick={goToList} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" size="small" startIcon={<SaveIcon sx={{ fontSize: 16 }} />} onClick={handleSaveMenuItem} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1, py: 0 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Three-column body */}
        <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>

          {/* Column 1: Menu Details + Company Types */}
          <Paper variant="outlined" sx={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5', flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>Menu Details</Typography>
            </Box>
            <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField fullWidth label="Display Name" size="small"
                  value={editItem.message_id || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditItem(prev => ({
                      ...prev,
                      message_id: val,
                      menu_key: isNewItem ? val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : prev.menu_key
                    }));
                  }}
                />
                <TextField fullWidth label="Key (unique)" size="small"
                  value={editItem.menu_key || ''}
                  onChange={(e) => setEditItem(prev => ({ ...prev, menu_key: e.target.value }))}
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={editItem.menu_type || 'item'} label="Type"
                      onChange={(e) => setEditItem(prev => ({ ...prev, menu_type: e.target.value }))}
                    >
                      {MENU_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Sort" size="small" type="number" sx={{ flex: '0 0 80px' }}
                    value={editItem.sort_order || 0}
                    onChange={(e) => setEditItem(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                  />
                </Box>
                <TextField fullWidth label="URL" size="small"
                  value={editItem.url || ''}
                  onChange={(e) => setEditItem(prev => ({ ...prev, url: e.target.value }))}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Parent</InputLabel>
                  <Select value={editItem.parent_id || ''} label="Parent"
                    onChange={(e) => setEditItem(prev => ({ ...prev, parent_id: e.target.value || null }))}
                  >
                    <MenuItem value="">None (Root level)</MenuItem>
                    {getParentOptions().filter(p => p.id !== editItem.id)
                      .map(p => <MenuItem key={p.id} value={p.id}>{p.message_id}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Icon Name" size="small"
                  value={editItem.icon_name || ''}
                  onChange={(e) => setEditItem(prev => ({ ...prev, icon_name: e.target.value }))}
                  InputProps={{
                    startAdornment: selectedIconEntry ? (
                      <InputAdornment position="start">
                        {selectedIconEntry.isSvg
                          ? <Box component="img" src={selectedIconEntry.component} sx={{ width: 20, height: 20 }} />
                          : React.createElement(selectedIconEntry.component, { sx: { fontSize: 20 } })}
                      </InputAdornment>
                    ) : null,
                  }}
                />
                <FormControlLabel
                  control={<Switch size="small" checked={!!editItem.is_active}
                    onChange={(e) => setEditItem(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))} />}
                  label={<Typography variant="body2" sx={{ fontSize: 12 }}>Active</Typography>}
                />

                {/* Company Types */}
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>
                    Company Types
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <FormGroup>
                      {COMPANY_TYPES.map(ct => (
                        <FormControlLabel key={ct.id}
                          control={<Checkbox size="small"
                            checked={(editItem._companyTypes || []).includes(ct.id)}
                            onChange={(e) => {
                              setEditItem(prev => {
                                const newTypes = e.target.checked
                                  ? [...(prev._companyTypes || []), ct.id]
                                  : (prev._companyTypes || []).filter(id => id !== ct.id);
                                return { ...prev, _companyTypes: newTypes };
                              });
                            }}
                          />}
                          label={<Typography variant="body2" sx={{ fontSize: 12 }}>{ct.name}</Typography>}
                          sx={{ height: 26, ml: 0 }}
                        />
                      ))}
                    </FormGroup>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, borderTop: '1px solid #f0f0f0', pt: 0.5 }}>
                      <Button size="small" sx={{ fontSize: 10, minWidth: 0, px: 1 }}
                        onClick={() => setEditItem(prev => ({
                          ...prev,
                          _companyTypes: COMPANY_TYPES.map(c => c.id),
                        }))}
                      >Select All</Button>
                      <Button size="small" sx={{ fontSize: 10, minWidth: 0, px: 1 }}
                        onClick={() => setEditItem(prev => ({ ...prev, _companyTypes: [] }))}
                      >Clear</Button>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Subscription Tiers and Role Access are managed via dedicated pages:
              - Subscription Manager (/superadmin/subscriptionManager)
              - Role Access Manager (/superadmin/roleAccessManager)
              Or via the S and shield icon buttons on each menu item in the list view. */}

          {/* Column 3: Icon Picker */}
          <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
                  Select Icon
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredIcons.length} icons {editItem.icon_name && `| Selected: ${editItem.icon_name}`}
                </Typography>
              </Box>
              <TextField
                fullWidth size="small" placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
              />
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 1 }}>
                {filteredIcons.map(({ name, component, isSvg }) => {
                  const isSelected = editItem.icon_name === name;
                  return (
                    <Box
                      key={name}
                      onClick={() => setEditItem(prev => ({ ...prev, icon_name: name }))}
                      sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 0.5, p: 1, borderRadius: '8px', cursor: 'pointer',
                        border: '1px solid', borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.50' : 'transparent',
                        position: 'relative',
                        '&:hover': { bgcolor: isSelected ? 'primary.50' : 'grey.50', borderColor: isSelected ? 'primary.main' : 'grey.400' },
                        transition: 'all 0.15s',
                      }}
                    >
                      {isSelected && <CheckCircleIcon sx={{ position: 'absolute', top: 2, right: 2, fontSize: 14, color: 'primary.main' }} />}
                      {isSvg
                        ? <Box component="img" src={component} sx={{ width: 24, height: 24, objectFit: 'contain' }} />
                        : React.createElement(component, { sx: { fontSize: 24, color: isSelected ? 'primary.main' : 'text.secondary' } })}
                      <Typography sx={{
                        fontSize: 9, color: 'text.secondary', textAlign: 'center',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        width: '100%', lineHeight: 1.2,
                      }}>
                        {name.replace(/Icon$/, '')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {filteredIcons.length === 0 && (
                <Typography sx={{ p: 3, textAlign: 'center', fontSize: 13 }} color="text.secondary">
                  No icons match "{iconSearch}"
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  // ==================== LIST MODE ====================
  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
        <Typography variant="h6">Menu Builder</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {menuCount} items ({collapseCount} menus, {itemCount} items)
          </Typography>
          <Button size="small" onClick={expandAll}>Expand All</Button>
          <Button size="small" onClick={collapseAll}>Collapse All</Button>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={fetchMenuItems}>Refresh</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => goToEdit({ message_id: '', menu_key: '', menu_type: 'item', url: '', icon_name: '', parent_id: null, sort_order: filteredItems.length + 1, is_active: 1 }, true)}
          >Add Menu</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1, py: 0 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Company Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setExpanded({}); }}
          variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { minHeight: 40, py: 0.5, textTransform: 'none', fontSize: 13 } }}
        >
          {COMPANY_TYPES.map((ct, idx) => (
            <Tab key={ct.id} label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {ct.name}
                <Chip label={companyTypeMenuMap[ct.id]?.size || 0} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Box>
            } />
          ))}
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Unassigned
              <Chip label={getUnassignedItems().length} size="small" color={getUnassignedItems().length > 0 ? 'error' : 'default'} sx={{ height: 18, fontSize: 10 }} />
            </Box>
          } />
        </Tabs>
      </Box>

      {/* Scrollable Menu Tree */}
      <Card sx={{ flex: 1, mt: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ p: 0, flex: 1, overflow: 'auto', '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Typography sx={{ p: 3 }}>Loading...</Typography>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-tree" type="parent">
                {(provided) => (
                  <List disablePadding ref={provided.innerRef} {...provided.droppableProps}>
                    {tree.map((node, index) => (
                      <Draggable key={node.id} draggableId={String(node.id)} index={index}>
                        {(provided, snapshot) => (
                          <Box ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            sx={{ bgcolor: snapshot.isDragging ? '#e3f2fd' : 'transparent', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                            {renderTreeItem(node, 0, null)}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {!loading && tree.length === 0 && (
            <Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">
              {isUnassignedTab
                ? 'All menu items are assigned to at least one company type.'
                : `No menu items for ${COMPANY_TYPES[activeTab]?.name || 'this company type'}.`}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null, confirmText: '', countdown: 0 })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.50', color: 'error.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Remove Menu Item
          <IconButton size="small" onClick={() => setDeleteDialog({ open: false, item: null, confirmText: '', countdown: 0 })}>
            <Box sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}>&times;</Box>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              You are about to remove "<strong>{deleteDialog.item?.message_id}</strong>" from <strong>{COMPANY_TYPES.find(c => c.id === selectedCompanyType)?.name || 'this company type'}</strong>.
            </Typography>
            <Typography variant="body2" gutterBottom>This action will:</Typography>
            <Typography component="ul" variant="body2" sx={{ pl: 2, mb: 0 }}>
              <li>Unassign this menu from the selected company type</li>
              <li>Remove all L1 role access defaults (sa_role_menu_access) for this company type</li>
              <li>Remove all L2 company-level overrides (pos_company_role_menu_access) for companies of this type</li>
              <li>Remove all L3 user-level overrides (pos_user_menu_access) for companies of this type</li>
              <li>Remove subscription tier entries for this company type</li>
              <li>Remove from all subscription plans of this company type</li>
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mb: 1 }}>
            The menu item itself is NOT deleted — it moves to the "Unassigned" tab and can be reassigned later with fresh configuration.
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            To confirm, type the menu name exactly (case-sensitive):
          </Typography>
          <TextField
            fullWidth size="small"
            placeholder={deleteDialog.item?.message_id}
            value={deleteDialog.confirmText || ''}
            onChange={(e) => setDeleteDialog(prev => ({ ...prev, confirmText: e.target.value }))}
            disabled={deleteDialog.countdown > 0}
            sx={{ mb: 1 }}
          />
          {deleteMatched && deleteDialog.countdown > 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Remove button will be enabled in {deleteDialog.countdown} seconds...
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained" color="error"
            onClick={handleDeleteMenuItem}
            disabled={!deleteMatched || deleteDialog.countdown > 0}
          >
            {!deleteMatched
              ? 'Type menu name to confirm'
              : deleteDialog.countdown > 0
                ? `Wait ${deleteDialog.countdown}s...`
                : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Company Types Dialog */}
      <Dialog open={companyTypeDialog.open} onClose={() => setCompanyTypeDialog({ open: false, menuId: null, selected: [] })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1.5 }}>Company Type Visibility</DialogTitle>
        <DialogContent>
          <FormGroup>
            {COMPANY_TYPES.map(ct => (
              <FormControlLabel key={ct.id}
                control={<Checkbox size="small"
                  checked={companyTypeDialog.selected.includes(ct.id)}
                  onChange={(e) => {
                    setCompanyTypeDialog(prev => ({
                      ...prev,
                      selected: e.target.checked ? [...prev.selected, ct.id] : prev.selected.filter(id => id !== ct.id)
                    }));
                  }}
                />}
                label={<Typography variant="body2">{ct.name} ({ct.id})</Typography>}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyTypeDialog({ open: false, menuId: null, selected: [] })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCompanyTypes}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Subscriptions Dialog */}
      <Dialog open={subscriptionDialog.open} onClose={() => setSubscriptionDialog({ open: false, menuId: null, menuName: '', tierMap: {} })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ py: 1.5 }}>
          Subscription Tiers {subscriptionDialog.menuName && <Typography component="span" color="primary" fontWeight={600}> — {subscriptionDialog.menuName}</Typography>}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set the minimum subscription tier required to see this menu. Users with that tier or higher will have access.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {SUBSCRIPTION_COMPANY_TYPES
              .filter(ct => !subscriptionDialog.filterCompanyType || ct.id === subscriptionDialog.filterCompanyType)
              .map(ct => {
              const currentTier = subscriptionDialog.tierMap?.[ct.id] || 0;
              const tierEntries = Object.entries(ct.tiers);
              return (
                <Box key={ct.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>{ct.name}</Typography>
                  <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
                    <Select
                      value={currentTier}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSubscriptionDialog(prev => ({
                          ...prev,
                          tierMap: { ...prev.tierMap, [ct.id]: val }
                        }));
                      }}
                      displayEmpty
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value={0}>
                        <Typography variant="body2" color="text.secondary">Not available</Typography>
                      </MenuItem>
                      {tierEntries.map(([tier, tierName]) => (
                        <MenuItem key={tier} value={Number(tier)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={`T${tier}`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10, minWidth: 30 }} />
                            <Typography variant="body2">{tierName}</Typography>
                            <Typography variant="caption" color="text.secondary">& above</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {currentTier > 0 && (
                    <Chip
                      label={`Tier ${currentTier}+`}
                      size="small"
                      color="success"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button size="small" variant="text" sx={{ fontSize: 11 }}
              onClick={() => {
                const allTier1 = {};
                SUBSCRIPTION_COMPANY_TYPES.forEach(ct => { allTier1[ct.id] = 1; });
                setSubscriptionDialog(prev => ({ ...prev, tierMap: allTier1 }));
              }}
            >All Tier 1</Button>
            <Button size="small" variant="text" sx={{ fontSize: 11 }}
              onClick={() => setSubscriptionDialog(prev => ({ ...prev, tierMap: {} }))}
            >Clear All</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialog({ open: false, menuId: null, menuName: '', tierMap: {} })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSubscriptions} startIcon={<SaveIcon />}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Role Access Dialog */}
      <Dialog open={roleDialog.open} onClose={() => setRoleDialog({ open: false, menuId: null, menuName: '', companyTypes: [], roleAccess: {} })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ py: 1.5 }}>
          Role Access {roleDialog.menuName && <Typography component="span" color="primary" fontWeight={600}> — {roleDialog.menuName}</Typography>}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Checked roles can see this menu. Unchecked roles are hidden.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button size="small" variant="outlined" sx={{ fontSize: 11 }}
              onClick={() => {
                const newAccess = {};
                for (const ctId of (roleDialog.companyTypes || [])) {
                  newAccess[ctId] = [];
                }
                setRoleDialog(prev => ({ ...prev, roleAccess: newAccess }));
              }}
            >All Visible</Button>
            <Button size="small" variant="outlined" sx={{ fontSize: 11 }}
              onClick={() => {
                const newAccess = {};
                for (const ctId of (roleDialog.companyTypes || [])) {
                  const roles = COMPANY_TYPE_ROLES[ctId] || [];
                  newAccess[ctId] = roles.filter(r => r !== 'Administrator');
                }
                setRoleDialog(prev => ({ ...prev, roleAccess: newAccess }));
              }}
            >Admin Only (All)</Button>
          </Box>
          {(roleDialog.companyTypes || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No company types assigned to this menu.
            </Typography>
          ) : (
            (roleDialog.companyTypes || []).map(ctId => {
              const ctName = COMPANY_TYPE_MAP[ctId] || `Type ${ctId}`;
              const roles = COMPANY_TYPE_ROLES[ctId] || [];
              const excluded = (roleDialog.roleAccess || {})[ctId] || [];
              const visibleCount = roles.length - excluded.length;
              if (roles.length === 0) return null;
              return (
                <Box key={ctId} sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{ctName}</Typography>
                    <Chip label={`${visibleCount}/${roles.length}`} size="small"
                      color={excluded.length > 0 ? 'warning' : 'success'} variant="outlined"
                      sx={{ height: 20, fontSize: 10 }} />
                  </Box>
                  <FormGroup row>
                    {roles.map(role => {
                      const isVisible = !excluded.includes(role);
                      return (
                        <FormControlLabel key={role}
                          control={<Checkbox size="small"
                            checked={isVisible}
                            onChange={(e) => {
                              setRoleDialog(prev => {
                                const prevExcluded = (prev.roleAccess || {})[ctId] || [];
                                const newExcluded = e.target.checked
                                  ? prevExcluded.filter(r => r !== role)
                                  : [...prevExcluded, role];
                                return { ...prev, roleAccess: { ...(prev.roleAccess || {}), [ctId]: newExcluded } };
                              });
                            }}
                          />}
                          label={<Typography variant="body2" sx={{ fontWeight: role === 'Administrator' ? 600 : 400 }}>{role}</Typography>}
                        />
                      );
                    })}
                  </FormGroup>
                </Box>
              );
            })
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog({ open: false, menuId: null, menuName: '', companyTypes: [], roleAccess: {} })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoles} startIcon={<SaveIcon />}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
