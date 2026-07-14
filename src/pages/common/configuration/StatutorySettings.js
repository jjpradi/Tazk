import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, Drawer, FormControl, FormControlLabel, FormHelperText,
  Grid, IconButton, InputAdornment, MenuItem, Radio, RadioGroup, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { alpha, styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import CommonToolTip from '../../../components/ToolTip';
import statutoryService from '../../../services/statutory_services';
import salaryService from '../../../services/salary_services';
import { getsessionStorage } from 'pages/common/login/cookies';
import { ErrorAlert } from '../../../redux/actions/load';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const ADMIN_ROLES = ['Administrator', 'HR Manager'];

const RedditTextField = styled((props) => (
  <TextField slotProps={{ input: { disableUnderline: true, readOnly: true } }} {...props} />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    border: '1px solid #e2e2e1',
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
    '&:hover': { backgroundColor: 'transparent' },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const gridItem = { lg: 3, md: 4, sm: 6, xs: 12 };

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function StatutorySettings() {
  const dispatch = useDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [companyPF, setCompanyPF] = useState(null);
  const [companyPFstatus, setCompanyPFStatus] = useState(null);
  const [pfForm, setPfForm] = useState({});
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());

  // Wage builder
  const [wageRows, setWageRows] = useState([]);
  const [addingComp, setAddingComp] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', code: '' });

  // Audit history
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;
  const {
    rbacReducer: { menuAccess },
  } = useSelector((state) => state);
  const isAdmin = ADMIN_ROLES.includes(storage?.role_name);

const fetchSettings = useCallback(async (month) => {
  try {
    setLoading(true);
    const res = await statutoryService.getCompanySettings(month || currentMonth());
    const pfData = res.data?.pf;
    setCompanyPF(pfData || null);
    setCompanyPFStatus(pfData?.pf_enabled ?? 0);  
    console.log('PF Status Set:', pfData?.pf_enabled);
  } catch (err) {
    console.error('Error fetching EPF settings:', err);
  } finally {
    setLoading(false);
  }
}, []);

  const fetchWageData = useCallback(async () => {
    try {
      const res = await statutoryService.getWageBuilder();
      setWageRows((res.data || []).map((r) => ({ ...r })));
    } catch (err) {
      console.error('Error fetching wage builder:', err);
    }
  }, []);

  const fetchAuditHistory = useCallback(async () => {
    try {
      const res = await statutoryService.getAuditLog();
      const all = res.data || [];
      setHistoryData(all.filter(r => r.entity_type?.startsWith('PF_')));
    } catch (err) {
      console.error('Error fetching PF audit history:', err);
      setHistoryData([]);
    }
  }, []);

  const openHistory = () => {
    setHistoryOpen(true);
    fetchAuditHistory();
  };

  useEffect(() => {
    fetchSettings();
    fetchWageData();
  }, [fetchSettings, fetchWageData]);

  const handleEditOpen = () => {
    setPfForm({
      pf_enabled: companyPF?.pf_enabled ?? 0,
      establishment_name: companyPF?.establishment_name || '',
      pf_code: companyPF?.pf_code || '',
      coverage_date: companyPF?.coverage_date
        ? String(companyPF.coverage_date).slice(0, 10) : '',
      rate_category: companyPF?.rate_category ?? 12,
      wage_ceiling: companyPF?.wage_ceiling ?? 15000,
      international_worker_ignore_ceiling: companyPF?.international_worker_ignore_ceiling ?? 0,
      default_cap_policy: companyPF?.default_cap_policy || 'ceiling',
      allow_employee_override: companyPF?.allow_employee_override ?? 1,
      pf_scheme_exempted: companyPF?.pf_scheme_exempted ?? 0,
      edli_scheme_exempted: companyPF?.edli_scheme_exempted ?? 0,
      rounding_mode: companyPF?.rounding_mode || 'nearest',
      lop_proration_enabled: companyPF?.lop_proration_enabled ?? 1,
    });
    setEffectiveMonth(currentMonth());
    setSaveMsg(null);
    fetchWageData();
    setEditOpen(true);
  };

  const handleCancel = () => {
    setEditOpen(false);
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (!effectiveMonth) {
      setSaveMsg({ severity: 'warning', text: 'Effective Month is required' });
      return;
    }
    if (pfForm.pf_enabled && !pfForm.pf_code) {
      ErrorAlert(dispatch, {
        message: 'EPFO Establishment ID / PF Code is required when PF is enabled',
      });
      return;
    }
    try {
      setLoading(true);
      await statutoryService.upsertCompanySettings({
        month: effectiveMonth,
        pf: { ...pfForm, coverage_date: pfForm.coverage_date || null },
      });
      // Save wage builder flags
      for (const row of wageRows) {
        await statutoryService.updateWageBuilder(row.id, {
          isPF: row.isPF,
          isESI: row.isESI,
          isESIThreshold: row.isESIThreshold,
          isESIContribution: row.isESIContribution,
        });
      }
      setSaveMsg({ severity: 'success', text: 'EPF settings saved successfully' });
      await fetchSettings(effectiveMonth);
      setTimeout(() => {
        setEditOpen(false);
        setSaveMsg(null);
      }, 1200);
    } catch (err) {
      setSaveMsg({ severity: 'error', text: err?.response?.data?.message || 'Save failed' });
    } finally {
      setLoading(false);
    }
  };

  const toggleWageFlag = (idx, flag) => {
    setWageRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [flag]: r[flag] ? 0 : 1 } : r))
    );
  };

  const handleAddComponent = async () => {
    if (!newComp.name.trim() || !newComp.code.trim()) {
      setSaveMsg({ severity: 'warning', text: 'Component name and code are required' });
      return;
    }
    try {
      await salaryService.createAllowanceDeductionTypes({
        open: 'allowance', name: newComp.name.trim(), code: newComp.code.trim().toUpperCase(),
      });
      setNewComp({ name: '', code: '' });
      setAddingComp(false);
      setSaveMsg({ severity: 'success', text: 'Component added successfully' });
      fetchWageData();
    } catch (err) {
      setSaveMsg({ severity: 'error', text: err?.response?.data?.message || 'Failed to add component' });
    }
  };

  const handleDeleteComponent = async (row) => {
    try {
      const checkRes = await salaryService.checkDeleteAllowanceDeductionTypes({ type: 'allowance', id: row.id });
      if (checkRes.data?.inUse) {
        setSaveMsg({ severity: 'warning', text: `"${row.allowance_name}" is used in salary structures and cannot be deleted` });
        return;
      }
      await salaryService.deleteAllowanceDeductionTypes({ type: 'allowance', id: row.id });
      setSaveMsg({ severity: 'success', text: `"${row.allowance_name}" deleted` });
      fetchWageData();
    } catch (err) {
      setSaveMsg({ severity: 'error', text: err?.response?.data?.message || 'Failed to delete component' });
    }
  };
       useEffect(() => {
          if (!editOpen) {
             fetchSettings();
          }
       }, [editOpen, fetchSettings,companyPFstatus]);

  const CORE_CODES = ['BASIC', 'DA'];

  // Rate breakdown based on rate_category
  const epsRate = 8.33;
  const edliRate = 0.50;
  const employeeEpfRate = useMemo(() => pfForm.rate_category ?? companyPF?.rate_category ?? 12, [pfForm, companyPF]);

  // ====================================================================
  // VIEW MODE
  // ====================================================================
  console.log(companyPFstatus,'companyPFstatus');
  const canEdit = storage?.company_type === 5
      ? UserRightsAuthorization(menuAccess[selectedRole], 'config__epf', 'can_edit')
      : true;
  if (loading && companyPFstatus === null) {
  return (
    <Grid sx={{ padding: '20px' }}>
      <Typography>Loading EPF Settings...</Typography>
    </Grid>
  );
}
  if (!editOpen) {
    return (
      <Grid sx={{ padding: '20px' }}>
        <Grid display="flex" justifyContent="space-between"
          size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <Typography className="page-title">EPF Settings</Typography>
          <Box display="flex" gap={0.5}>
            {isAdmin && (
              <CommonToolTip title="View Change History">
                <IconButton sx={{ height: '100%' }} onClick={openHistory}>
                  <HistoryIcon />
                </IconButton>
              </CommonToolTip>
            )}
            {/* {isAdmin && ( */}
            {canEdit && (
              <CommonToolTip title="Edit">
                <IconButton sx={{ height: '100%' }} onClick={handleEditOpen}>
                  <EditIcon />
                </IconButton>
              </CommonToolTip>
              )}
            {/* )} */}
          </Box>
        </Grid>

        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <Grid container style={{ paddingTop: '10px' }} spacing={7} direction="row">
            <Grid size={gridItem}>
                <RedditTextField
                 label="PF Status"
                 defaultValue={companyPFstatus === 1 ? 'Enabled' : 'Disabled'}
                 variant="filled"
                 fullWidth
             />
            </Grid>
            {companyPF?.pf_enabled ? (
              <>
                {companyPF?.establishment_name && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="Establishment Name"
                      defaultValue={companyPF.establishment_name}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                {companyPF?.pf_code && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="EPFO Establishment ID / PF Code"
                      defaultValue={companyPF.pf_code}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Rate Category"
                    defaultValue={`${companyPF?.rate_category || 12}% (${companyPF?.rate_category === 10 ? 'reduced' : 'standard'})`}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Wage Ceiling"
                    defaultValue={`₹${(companyPF?.wage_ceiling || 15000).toLocaleString('en-IN')}`}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Contribution Basis"
                    defaultValue={companyPF?.default_cap_policy === 'actual' ? 'Actual PF wages' : 'Ceiling only'}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Rounding"
                    defaultValue={companyPF?.rounding_mode === 'ceil' ? 'Ceil' : companyPF?.rounding_mode === 'floor' ? 'Floor' : 'Nearest rupee'}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Grid>

        {/* Live Policy Preview (view mode) */}
        {companyPF?.pf_enabled ? (
          <Paper variant="outlined" sx={{ mt: 2, p: 2.5 }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 13, mb: 0.5 }}>Policy Summary</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '11px' }}>
              Current statutory rate breakdown based on saved configuration.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYEE EPF RATE</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{companyPF?.rate_category || 12}%</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Employee contribution (EPF A/c 1). Employee can also pay higher (VPF) optionally.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYER EPS RATE</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>8.33%</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Paid out of employer share; not recovered from employee.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYER EDLI RATE</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>0.5%</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Employer pays EDLI; no employee deduction.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        ) : null}

        {/* PF Wage Components read-only */}
        {companyPF?.pf_enabled && wageRows.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography className="page-title" sx={{ mb: 1 }}>PF Wage Components</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Component</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Include in PF wages?</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wageRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {row.allowance_name} ({row.allowance_code})
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.isPF ? 'Included' : 'Excluded'} size="small"
                          color={row.isPF ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* EPF Audit History Drawer */}
        <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>EPF Change History</Typography>
              <IconButton onClick={() => setHistoryOpen(false)} size="small"><CloseIcon /></IconButton>
            </Box>
            {historyData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No EPF changes recorded yet.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                {historyData.map((row, i) => {
                  const summarizeDiff = (oldJson, newJson) => {
                    const oldObj = oldJson ? (typeof oldJson === 'string' ? JSON.parse(oldJson) : oldJson) : {};
                    const newObj = newJson ? (typeof newJson === 'string' ? JSON.parse(newJson) : newJson) : {};
                    const changes = [];
                    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
                    for (const key of allKeys) {
                      if (['id', 'company_id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'].includes(key)) continue;
                      const ov = oldObj[key], nv = newObj[key];
                      if (String(ov ?? '') !== String(nv ?? '')) {
                        changes.push(`${key}: ${ov ?? '(none)'} → ${nv ?? '(none)'}`);
                      }
                    }
                    return changes.length ? changes : ['No field changes detected'];
                  };
                  const formatDateTime = (d) => {
                    if (!d) return '-';
                    const dt = new Date(d);
                    return dt.toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    });
                  };
                  return (
                    <Paper key={row.id || i} variant="outlined" sx={{ mb: 1.5, p: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Chip
                          label={row.action}
                          size="small"
                          color={row.action === 'INSERT' ? 'success' : row.action === 'DELETE' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(row.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '11px', mb: 0.3 }}>
                        <strong>Entity:</strong> {row.entity_type} #{row.entity_id}
                        {row.user_id ? ` | User #${row.user_id}` : ''}
                      </Typography>
                      {row.effective_from && (
                        <Typography variant="body2" sx={{ fontSize: '11px', mb: 0.5 }}>
                          <strong>Effective:</strong> {new Date(row.effective_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                      )}
                      <Box sx={{ mt: 0.5, pl: 1, borderLeft: '2px solid #e0e0e0' }}>
                        {summarizeDiff(row.old_json, row.new_json).map((line, j) => (
                          <Typography key={j} variant="body2" sx={{ fontSize: '10.5px', color: 'text.secondary', lineHeight: 1.6 }}>
                            {line}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Drawer>
      </Grid>
    );
  }

  // ====================================================================
  // EDIT MODE
  // ====================================================================
  return (
    <Grid sx={{ padding: '20px' }}>
      <Typography className="page-title" style={{ paddingBottom: '10px' }}>
        Update EPF Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
        Configure statutory policies once per company. These settings drive the payroll engine.
      </Typography>

      {saveMsg && (
        <Alert severity={saveMsg.severity} sx={{ mb: 2 }} onClose={() => setSaveMsg(null)}>
          {saveMsg.text}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        This change applies from <strong>{effectiveMonth || '...'}</strong> onward.
        A new effective-dated version will be created.
      </Alert>

      <Grid container spacing={2}>
        {/* ── Left Card: EPFO Registration ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              1) EPFO Registration
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!pfForm.pf_enabled}
                      onChange={(e) => setPfForm({ ...pfForm, pf_enabled: e.target.checked ? 1 : 0 })}
                      size="medium" color="primary"
                    />
                  }
                  label="PF Enabled"
                />
              </FormControl>
              <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px' }}>
                Turn ON to apply EPF/EPS/EDLI calculations. When OFF, payroll shows zero statutory for all employees.
              </FormHelperText>
            </Box>

            <TextField
              label="Establishment Name"
              value={pfForm.establishment_name || ''}
              onChange={(e) => setPfForm({ ...pfForm, establishment_name: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="Display name used in statutory screens, registers and exports."
              sx={{ mb: 2 }}
            />

            <TextField
              label="EPFO Establishment ID / PF Code"
              value={pfForm.pf_code || ''}
              onChange={(e) => setPfForm({ ...pfForm, pf_code: e.target.value })}
              fullWidth variant="filled" size="small"
              required={!!pfForm.pf_enabled}
              helperText="PF Code as per EPFO Unified Portal (used for ECR/Challan)."
              sx={{ mb: 2 }}
            />

            <TextField
              label="Coverage / Applicability Start Date"
              type="date"
              value={pfForm.coverage_date || ''}
              onChange={(e) => setPfForm({ ...pfForm, coverage_date: e.target.value })}
              fullWidth variant="filled" size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Date from which your establishment is covered under the EPF & MP Act / Scheme(s). Used for retro logic and audits."
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>
                ECR Filing Due Date (Reference)
              </Typography>
              <Chip label="On or before 15th of every month" size="small" variant="outlined" sx={{ mt: 0.5 }} />
              <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px' }}>
                Reference: EPFO employer booklet indicates monthly contribution via ECR on/before 15th.
              </FormHelperText>
            </Box>
          </Paper>
        </Grid>

        {/* ── Right Card: Statutory Rates & Policies ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              2) Statutory Rates & Policies
            </Typography>

            {/* Rate Category */}
            <TextField
              label="Statutory Rate Category"
              select
              value={pfForm.rate_category ?? 12}
              onChange={(e) => setPfForm({ ...pfForm, rate_category: Number(e.target.value) })}
              fullWidth variant="filled" size="small"
              helperText="EPFO lists cases where 10% applies (e.g., less than 20 employees; certain industries; sick industrial company, etc.). Keep this explicit to prevent wrong contributions."
              sx={{ mb: 2 }}
            >
              <MenuItem value={12}>12% (standard)</MenuItem>
              <MenuItem value={10}>10% (reduced)</MenuItem>
            </TextField>

            {/* Wage Ceiling */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Wage Ceiling (Monthly)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <TextField
                type="number"
                value={pfForm.wage_ceiling ?? 15000}
                onChange={(e) => setPfForm({ ...pfForm, wage_ceiling: Number(e.target.value) })}
                variant="filled" size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!pfForm.international_worker_ignore_ceiling}
                    onChange={(e) => setPfForm({ ...pfForm, international_worker_ignore_ceiling: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>International Worker: ignore ceiling</Typography>}
              />
            </Box>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              EPFO "Present Rates of Contribution" mentions contributions payable up to wage ceiling ₹15,000 and that wage ceiling is not applicable for International Workers.
            </FormHelperText>

            {/* Contribution Basis */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Contribution Basis
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 0.5 }}>
              <RadioGroup
                value={pfForm.default_cap_policy || 'ceiling'}
                onChange={(e) => setPfForm({ ...pfForm, default_cap_policy: e.target.value })}
              >
                <FormControlLabel
                  value="ceiling"
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontFamily: 'poppins', fontSize: 11 }}>Contribute on ceiling only (cap PF wage base at ceiling)</Typography>}
                />
                <FormControlLabel
                  value="actual"
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontFamily: 'poppins', fontSize: 11 }}>Contribute on actual PF wages (higher wages)</Typography>}
                />
              </RadioGroup>
            </FormControl>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              EPFO notes that contributing on higher wages requires joint request (employee+employer) and admin charges apply on higher wages.
            </FormHelperText>

            {/* Establishment Exemption Status */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Establishment Exemption Status (advanced)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!pfForm.pf_scheme_exempted}
                    onChange={(e) => setPfForm({ ...pfForm, pf_scheme_exempted: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>Exempted under PF Scheme (use PF Inspection Charges instead of EPF admin charges)</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!pfForm.edli_scheme_exempted}
                    onChange={(e) => setPfForm({ ...pfForm, edli_scheme_exempted: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>Exempted under EDLI Scheme (use EDLI Inspection Charges)</Typography>}
              />
            </Box>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              EPFO states: if exempted under PF Scheme → Inspection @0.18% (min ₹5) replaces admin charges; if exempted under EDLI → Inspection @0.005% (min ₹1).
            </FormHelperText>

            {/* Rounding */}
            <TextField
              label="Rounding"
              select
              value={pfForm.rounding_mode || 'nearest'}
              onChange={(e) => setPfForm({ ...pfForm, rounding_mode: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="EPFO contribution rate sheet indicates rounding to nearest rupee for employee share, pension contribution and EDLI contribution."
            >
              <MenuItem value="nearest">Nearest rupee (recommended)</MenuItem>
              <MenuItem value="floor">Previous rupee (floor)</MenuItem>
              <MenuItem value="ceil">Next higher rupee (ceil)</MenuItem>
            </TextField>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Live Policy Preview ── */}
      <Paper variant="outlined" sx={{ mt: 2, p: 2.5 }}>
        <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 13, mb: 0.5 }}>Live Policy Preview</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '11px' }}>
          Change any setting above and see how the engine rules change. The preview below is generated by the same functions used in Payroll Preview.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYEE EPF RATE</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{employeeEpfRate}%</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Employee contribution (EPF A/c 1). Employee can also pay higher (VPF) optionally.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYER EPS RATE</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{epsRate}%</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Paid out of employer share; not recovered from employee.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>EMPLOYER EDLI RATE</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{edliRate}%</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Employer pays EDLI; no employee deduction.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ── PF Wage Builder ── */}
      <Box sx={{ mt: 3 }}>
        <Typography className="page-title" style={{ paddingBottom: '5px' }}>
          PF Wage Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
          Decide which earning components count as "PF wages" for calculation.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 12, mb: 0.5 }}>
            Earning Components
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '10px' }}>
            Default mapping includes Basic + DA in PF wages (common setup). Toggle components to include/exclude from PF wage base.
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Component</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Type</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Include in PF wages?</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {wageRows.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: 11 }}>
                      <strong>{row.allowance_name}</strong>
                      <br />
                      <Typography variant="caption" color="text.secondary">{row.allowance_code}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: 11 }}>Earning</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Checkbox size="small"
                          checked={!!row.isPF}
                          onChange={() => toggleWageFlag(idx, 'isPF')}
                          color="success"
                        />
                        <Typography sx={{ fontFamily: 'poppins', fontSize: 11 }}>{row.isPF ? 'Included' : 'Excluded'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {!CORE_CODES.includes(row.allowance_code?.toUpperCase()) && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteComponent(row)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {addingComp && (
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: 11 }}>
                      <TextField
                        placeholder="Component Name"
                        value={newComp.name}
                        onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                        variant="standard" size="small"
                        sx={{ fontFamily: 'poppins', fontSize: 11, mr: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: 11 }}>
                      <TextField
                        placeholder="Code"
                        value={newComp.code}
                        onChange={(e) => setNewComp({ ...newComp, code: e.target.value.toUpperCase() })}
                        variant="standard" size="small"
                        sx={{ fontFamily: 'poppins', fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell align="center" colSpan={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button size="small" variant="contained" onClick={handleAddComponent}>Save</Button>
                        <Button size="small" variant="outlined" onClick={() => { setAddingComp(false); setNewComp({ name: '', code: '' }); }}>Cancel</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!addingComp && (
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddingComp(true)}>
                Add Component
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Save / Cancel ── */}
      <Grid container spacing={7} direction="row" display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Grid>
          <Button
            onClick={handleCancel}
            variant="contained" color="secondary" size="medium"
          >
            Cancel
          </Button>
        </Grid>
        <Grid>
          <Button
            onClick={handleSave}
            variant="contained" color="primary" size="medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
