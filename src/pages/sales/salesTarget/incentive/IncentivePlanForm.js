import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Tooltip,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { titleURL } from 'http-common';
import UserCreation from '../../../../services/userCreation_services';
import {
  getPlanByIdAction,
  createPlanAction,
  updatePlanAction,
  getPeriodsAction,
} from '../../../../redux/actions/salesTarget_actions';
import PeriodSelector from '../components/PeriodSelector';
import SlabEditor from '../components/SlabEditor';

const PLAN_TYPES = [
  { value: 'base', label: 'Base Incentive' },
  { value: 'addon_new_customer', label: 'Add-on: New Customer' },
  { value: 'addon_focus_product', label: 'Add-on: Focus Product' },
  { value: 'addon_collection', label: 'Add-on: Collection' },
  { value: 'addon_quality', label: 'Add-on: Quality' },
];

// Context-aware config per plan type
const PLAN_TYPE_CONFIG = {
  base: {
    slabLabel: 'Sales Achievement %',
    slabHelp: 'Define incentive slabs based on sales achievement percentage (achieved value / target value).',
    fromTooltip: 'Min sales achievement % for this slab',
    toTooltip: 'Max sales achievement % for this slab',
    gates: ['min_achievement_pct', 'min_collection_pct', 'max_returns_pct', 'max_single_customer_concentration_pct'],
    gateHelp: 'All gate conditions apply. Salesman must pass every gate to earn the base incentive.',
  },
  addon_new_customer: {
    slabLabel: 'New Customer Achievement %',
    slabHelp: 'Define incentive slabs based on new customer count achievement (achieved new customers / target new customers).',
    fromTooltip: 'Min new customer achievement % for this slab',
    toTooltip: 'Max new customer achievement % for this slab',
    gates: ['min_achievement_pct'],
    gateHelp: 'Only minimum sales achievement gate applies. Salesman must meet the base sales target to earn new customer bonus.',
  },
  addon_focus_product: {
    slabLabel: 'Focus Product Achievement %',
    slabHelp: 'Define incentive slabs based on focus product/category sales achievement (achieved / target in focus categories).',
    fromTooltip: 'Min focus product achievement % for this slab',
    toTooltip: 'Max focus product achievement % for this slab',
    gates: ['min_achievement_pct'],
    gateHelp: 'Only minimum sales achievement gate applies.',
  },
  addon_collection: {
    slabLabel: 'Collection Achievement %',
    slabHelp: 'Define incentive slabs based on collection achievement (collected amount / target collection).',
    fromTooltip: 'Min collection achievement % for this slab',
    toTooltip: 'Max collection achievement % for this slab',
    gates: ['min_collection_pct'],
    gateHelp: 'Only minimum collection gate applies.',
  },
  addon_quality: {
    slabLabel: 'Quality Score %',
    slabHelp: 'Define incentive slabs based on quality score (100% minus return percentage). Lower returns = higher quality score.',
    fromTooltip: 'Min quality score % for this slab',
    toTooltip: 'Max quality score % for this slab',
    gates: ['max_returns_pct'],
    gateHelp: 'Only maximum returns gate applies. Returns must be below the threshold.',
  },
};

const GATE_FIELD_CONFIG = {
  min_achievement_pct: { label: 'Min Achievement %', helper: 'Must achieve at least this % of sales target' },
  min_collection_pct: { label: 'Min Collection %', helper: 'Must collect at least this % of collection target' },
  max_returns_pct: { label: 'Max Returns %', helper: 'Returns must not exceed this % of sales' },
  max_single_customer_concentration_pct: { label: 'Max Single Customer %', helper: 'No single customer can exceed this % of total sales' },
};

const INITIAL_FORM = {
  plan_name: '',
  plan_type: 'base',
  description: '',
  selected_period_id: '',
  effective_from: '',
  effective_to: '',
  is_active: true,
  slabs: [{ from_pct: '', to_pct: '', incentive_type: 'fixed', value: '', percentage_of: '', label: '' }],
  gate_conditions: {
    min_achievement_pct: '',
    min_collection_pct: '',
    max_returns_pct: '',
    max_single_customer_concentration_pct: '',
  },
  applicable_locations: [],
  applicable_roles: [],
  all_locations: true,
};

export default function IncentivePlanForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { planDetail, periods } = useSelector((state) => state.salesTargetReducer);
  const { roles } = useSelector((state) => state.rbacReducer || {});
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  useEffect(() => {
    // Fetch roles dynamically from the store (loaded by rbac system)
    if (roles && typeof roles === 'object') {
      const roleNames = Object.keys(roles);
      setRoleOptions(roleNames.filter(r => r !== 'Customer'));
    }
  }, [roles]);

  useEffect(() => {
    dispatch(getPeriodsAction());
    if (isEdit) {
      dispatch(getPlanByIdAction(id));
    }
    // Load locations
    UserCreation.getLocations('all').then(res => {
      const locs = res.data?.data || res.data || [];
      setLocationOptions(Array.isArray(locs) ? locs : []);
    }).catch(() => {});
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && planDetail) {
      setForm({
        plan_name: planDetail.plan_name || '',
        plan_type: planDetail.plan_type || 'base',
        description: planDetail.description || '',
        effective_from: planDetail.effective_from ? planDetail.effective_from.substring(0, 10) : '',
        effective_to: planDetail.effective_to ? planDetail.effective_to.substring(0, 10) : '',
        is_active: planDetail.is_active !== false,
        slabs: planDetail.slabs?.length
          ? planDetail.slabs
          : INITIAL_FORM.slabs,
        gate_conditions: {
          min_achievement_pct: planDetail.gate_conditions?.min_achievement_pct ?? '',
          min_collection_pct: planDetail.gate_conditions?.min_collection_pct ?? '',
          max_returns_pct: planDetail.gate_conditions?.max_returns_pct ?? '',
          max_single_customer_concentration_pct:
            planDetail.gate_conditions?.max_single_customer_concentration_pct ?? '',
        },
        applicable_locations: planDetail.applicable_locations || [],
        applicable_roles: planDetail.applicable_roles || [],
        all_locations: planDetail.all_locations !== false,
      });
    }
  }, [isEdit, planDetail]);

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      gate_conditions: { ...prev.gate_conditions, [field]: value },
    }));
  };

  const handleRoleToggle = (role) => {
    setForm((prev) => {
      const roles = prev.applicable_roles.includes(role)
        ? prev.applicable_roles.filter((r) => r !== role)
        : [...prev.applicable_roles, role];
      return { ...prev, applicable_roles: roles };
    });
  };

  const handleSave = () => {
    setSaving(true);
    const payload = { ...form };
    const cb = () => {
      setSaving(false);
      navigate('/sales/incentivePlans');
    };
    if (isEdit) {
      dispatch(updatePlanAction(id, payload, cb));
    } else {
      dispatch(createPlanAction(payload, cb));
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit' : 'Create'} Incentive Plan | {titleURL}</title>
      </Helmet>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        {/* Header */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Back">
                <IconButton size="small" onClick={() => navigate('/sales/incentivePlans')}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
                {isEdit ? 'Edit Incentive Plan' : 'Create Incentive Plan'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => navigate('/sales/incentivePlans')} size="small" sx={{ textTransform: 'none' }}>Cancel</Button>
              <Button variant="contained" size="small" onClick={handleSave} disabled={saving || !form.plan_name}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{ textTransform: 'none' }}>
                {isEdit ? 'Update Plan' : 'Create Plan'}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Scrollable Form */}
        <Card sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ p: 3 }}>

        {/* Basic Info */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Plan Details
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
              A "Base Incentive" plan defines the main slab-based payout. Add-on plans provide bonus incentives for specific metrics (new customers, focus products, collection, quality).
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Plan Name"
                  fullWidth
                  required
                  value={form.plan_name}
                  onChange={(e) => handleField('plan_name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Plan Type"
                  select
                  fullWidth
                  required
                  value={form.plan_type}
                  onChange={(e) => handleField('plan_type', e.target.value)}
                >
                  {PLAN_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.is_active}
                        onChange={(e) => handleField('is_active', e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                </Box>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  value={form.description}
                  onChange={(e) => handleField('description', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PeriodSelector
                  value={form.selected_period_id || ''}
                  onChange={(e) => {
                    const periodId = e.target.value;
                    handleField('selected_period_id', periodId);
                    // Auto-fill dates from selected period
                    const selectedPeriod = (periods || []).find(p => (p.id || p.period_id) === periodId);
                    if (selectedPeriod) {
                      handleField('effective_from', selectedPeriod.start_date ? selectedPeriod.start_date.split('T')[0] : '');
                      handleField('effective_to', selectedPeriod.end_date ? selectedPeriod.end_date.split('T')[0] : '');
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Effective From"
                  type="date"
                  fullWidth
                  size="small"
                  value={form.effective_from}
                  onChange={(e) => handleField('effective_from', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Effective To"
                  type="date"
                  fullWidth
                  size="small"
                  value={form.effective_to}
                  onChange={(e) => handleField('effective_to', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Slab Editor */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SlabEditor
              slabs={form.slabs}
              onChange={(slabs) => handleField('slabs', slabs)}
              planTypeConfig={PLAN_TYPE_CONFIG[form.plan_type]}
            />
          </CardContent>
        </Card>

        {/* Gate Conditions - context-aware */}
        {(() => {
          const cfg = PLAN_TYPE_CONFIG[form.plan_type] || PLAN_TYPE_CONFIG.base;
          const visibleGates = cfg.gates;
          return (
            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Gate Conditions
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
                  {cfg.gateHelp} Leave blank to skip.
                </Typography>
                <Grid container spacing={2.5}>
                  {visibleGates.map((gateKey) => {
                    const fieldCfg = GATE_FIELD_CONFIG[gateKey];
                    return (
                      <Grid key={gateKey} size={{ xs: 12, sm: 6, md: visibleGates.length <= 2 ? 6 : 3 }}>
                        <TextField
                          label={fieldCfg.label}
                          type="number"
                          fullWidth
                          value={form.gate_conditions[gateKey]}
                          onChange={(e) => handleGateField(gateKey, e.target.value)}
                          inputProps={{ min: 0, max: 100 }}
                          helperText={fieldCfg.helper}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          );
        })()}

        {/* Applicable To */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Applicable To
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
              Choose which branches and roles this plan applies to. By default, it applies to all locations and all roles.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Locations */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.all_locations}
                      onChange={(e) => {
                        handleField('all_locations', e.target.checked);
                        if (e.target.checked) handleField('applicable_locations', []);
                      }}
                    />
                  }
                  label="All Locations (Branches)"
                />
                {!form.all_locations && (
                  <FormControl fullWidth sx={{ mt: 1.5 }}>
                    <InputLabel>Select Branches</InputLabel>
                    <Select
                      multiple
                      value={form.applicable_locations || []}
                      onChange={(e) => handleField('applicable_locations', e.target.value)}
                      input={<OutlinedInput label="Select Branches" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((locId) => {
                            const loc = locationOptions.find(l => (l.location_id || l.id) === locId);
                            return (
                              <Chip key={locId} label={loc?.location_name || `Location ${locId}`}
                                size="small" color="primary" variant="outlined"
                                onDelete={() => handleField('applicable_locations', selected.filter(id => id !== locId))}
                                onMouseDown={(e) => e.stopPropagation()} />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {locationOptions.map((loc) => {
                        const locId = loc.location_id || loc.id;
                        return (
                          <MenuItem key={locId} value={locId}>
                            <Checkbox checked={(form.applicable_locations || []).includes(locId)} size="small" />
                            <ListItemText primary={loc.location_name} />
                          </MenuItem>
                        );
                      })}
                      {locationOptions.length === 0 && (
                        <MenuItem disabled><Typography sx={{ fontSize: 13, color: '#999' }}>No locations found</Typography></MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              {/* Roles */}
              <Grid size={12}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#637381' }}>
                  Applicable Roles
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#aaa', mb: 1 }}>
                  {roleOptions.length > 0 ? 'Select which roles can earn incentive under this plan. Leave unchecked to apply to all roles.' : 'No roles loaded. Roles are managed in the Role Access Manager.'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {roleOptions.map((role) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Checkbox
                          checked={form.applicable_roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          size="small"
                        />
                      }
                      label={role}
                      sx={{ mr: 2 }}
                    />
                  ))}
                </Box>
                {form.applicable_roles.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {form.applicable_roles.map((r) => (
                      <Chip
                        key={r}
                        label={r}
                        size="small"
                        onDelete={() => handleRoleToggle(r)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Actions */}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
