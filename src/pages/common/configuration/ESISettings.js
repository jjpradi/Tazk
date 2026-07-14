import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, Drawer, FormControl, FormControlLabel, FormHelperText,
  Grid, IconButton, InputAdornment, MenuItem, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { alpha, styled } from '@mui/material/styles';
import CommonToolTip from '../../../components/ToolTip';
import statutoryService from '../../../services/statutory_services';
import salaryService from '../../../services/salary_services';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const ADMIN_ROLES = ['Administrator', 'HR Manager'];
const CORE_CODES = ['BASIC', 'DA'];

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

export default function ESISettings() {
  const dispatch = useDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [companyESI, setCompanyESI] = useState(null);
  const [companyESIstatus, setCompanyESIStatus] = useState(null);
  const [esiForm, setEsiForm] = useState({});
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());

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
      setCompanyESI(res.data?.esi || null);
      setCompanyESIStatus(res.data?.esi?.esi_enabled ?? 0); 
    } catch (err) {
      console.error('Error fetching ESI settings:', err);
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
      setHistoryData(all.filter(r => r.entity_type?.startsWith('ESI_')));
    } catch (err) {
      console.error('Error fetching ESI audit history:', err);
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
    setEsiForm({
      esi_enabled: companyESI?.esi_enabled ?? 0,
      establishment_name: companyESI?.establishment_name || '',
      esic_code: companyESI?.esic_code || '',
      coverage_date: companyESI?.coverage_date
        ? String(companyESI.coverage_date).slice(0, 10) : '',
      wage_ceiling: companyESI?.wage_ceiling ?? 21000,
      continue_till_period_end: companyESI?.continue_till_period_end ?? 1,
      employer_rate: companyESI?.employer_rate ?? 3.25,
      employee_rate: companyESI?.employee_rate ?? 0.75,
      daily_exemption_enabled: companyESI?.daily_exemption_enabled ?? 0,
      daily_exemption_threshold: companyESI?.daily_exemption_threshold ?? 176,
      wage_days_source: companyESI?.wage_days_source || 'net_payable',
      lop_proration_enabled: companyESI?.lop_proration_enabled ?? 1,
      pwd_ceiling_enabled: companyESI?.pwd_ceiling_enabled ?? 0,
      pwd_wage_ceiling: companyESI?.pwd_wage_ceiling ?? 25000,
      pwd_no_ceiling: companyESI?.pwd_no_ceiling ?? 0,
      pwd_er_exemption_enabled: companyESI?.pwd_er_exemption_enabled ?? 0,
      pwd_er_exemption_months: companyESI?.pwd_er_exemption_months ?? 36,
      rounding_mode: companyESI?.rounding_mode || 'ceil',
    });
    setEffectiveMonth(currentMonth());
    setSaveMsg(null);
    setEditOpen(true);
    fetchWageData();
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
    if (esiForm.esi_enabled && !esiForm.esic_code) {
      setSaveMsg({ severity: 'warning', text: 'ESIC Code is required when ESI is enabled' });
      return;
    }

    try {
      setLoading(true);
      // Clean form: convert empty strings to null for date fields
      const cleanEsi = {
        ...esiForm,
        coverage_date: esiForm.coverage_date || null,
      };
      await statutoryService.upsertCompanySettings({
        month: effectiveMonth,
        esi: cleanEsi,
      });
      for (const row of wageRows) {
        await statutoryService.updateWageBuilder(row.id, {
          isPF: row.isPF,
          isESI: row.isESI,
          isESIThreshold: row.isESIThreshold,
          isESIContribution: row.isESIContribution,
        });
      }
      setSaveMsg({ severity: 'success', text: 'ESI settings saved successfully' });
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
  const canEdit = storage?.company_type === 5
    ? UserRightsAuthorization(menuAccess[selectedRole], 'config__esi', 'can_edit')
    : true;
  if (loading && companyESIstatus === null) {
  return (
    <Grid sx={{ padding: '20px' }}>
      <Typography>Loading ESI Settings...</Typography>
    </Grid>
  );
}
  // ====================================================================
  // VIEW MODE
  // ====================================================================
  if (!editOpen) {
    return (
      <Grid sx={{ padding: '20px' }}>
        <Grid display="flex" justifyContent="space-between"
          size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <Typography className="page-title">ESI Settings</Typography>
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
                label="ESI Status"
                defaultValue={companyESIstatus === 1 ? 'Enabled' : 'Disabled'}
                variant="filled"
                fullWidth
              />
            </Grid>
            {companyESI?.esi_enabled ? (
              <>
                {companyESI?.establishment_name && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="Establishment Name"
                      defaultValue={companyESI.establishment_name}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                {companyESI?.esic_code && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="ESIC Code"
                      defaultValue={companyESI.esic_code}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Wage Ceiling"
                    defaultValue={`₹${(companyESI?.wage_ceiling || 21000).toLocaleString('en-IN')}`}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Employer Rate"
                    defaultValue={`${companyESI?.employer_rate || 3.25}%`}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Employee Rate"
                    defaultValue={`${companyESI?.employee_rate || 0.75}%`}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Daily Exemption"
                    defaultValue={companyESI?.daily_exemption_enabled ? `₹${companyESI?.daily_exemption_threshold || 176}/day` : 'Disabled'}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Rounding"
                    defaultValue={companyESI?.rounding_mode === 'ceil' ? 'Ceil' : companyESI?.rounding_mode === 'floor' ? 'Floor' : 'Nearest'}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Grid>

        {/* Policy Summary (view mode) */}
        {companyESI?.esi_enabled ? (
          <Paper variant="outlined" sx={{ mt: 2, p: 2.5 }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 13, mb: 0.5 }}>Policy Summary</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '11px' }}>
              Current ESI rate breakdown based on saved configuration.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>COVERAGE CEILING</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>₹{(companyESI?.wage_ceiling || 21000).toLocaleString('en-IN')}</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Monthly wage ceiling for ESI coverage.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>ER / EE RATES</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{companyESI?.employer_rate || 3.25}% / {companyESI?.employee_rate || 0.75}%</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Employer / Employee contribution rates.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>DAILY AVG EXEMPTION</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                    {companyESI?.daily_exemption_enabled ? `₹${companyESI?.daily_exemption_threshold || 176}/day` : 'Disabled'}
                  </Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    If applicable, EE share becomes 0.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        ) : null}

        {/* Wage Components read-only */}
        {companyESI?.esi_enabled && wageRows.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography className="page-title" sx={{ mb: 1 }}>ESI Wage Components</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Component</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Coverage Threshold</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Contribution Wages</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wageRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {row.allowance_name} ({row.allowance_code})
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.isESIThreshold ? 'Yes' : 'No'} size="small"
                          color={row.isESIThreshold ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.isESIContribution ? 'Yes' : 'No'} size="small"
                          color={row.isESIContribution ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ESI Audit History Drawer */}
        <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>ESI Change History</Typography>
              <IconButton onClick={() => setHistoryOpen(false)} size="small"><CloseIcon /></IconButton>
            </Box>
            {historyData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No ESI changes recorded yet.
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
        Update ESI Settings
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

      {/* Effective Month */}
      <Grid container spacing={7} direction="row" sx={{ mb: 2 }}>
        <Grid size={gridItem}>
          <TextField
            label="Effective From Month"
            type="month"
            value={effectiveMonth}
            onChange={(e) => setEffectiveMonth(e.target.value)}
            fullWidth required variant="filled" size="small"
            helperText="New settings version starts from this month"
          />
        </Grid>
      </Grid>

      {/* ── ESI Company Settings ── */}
      <Typography className="page-title" style={{ paddingBottom: '10px' }}>
        ESI (Employees' State Insurance) — Company Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
        Configure ESI once per company. These rules drive coverage decisions and ESI contribution calculations.
      </Typography>

      <Grid container spacing={2}>
        {/* Left Card: Registration & Compliance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              1) Registration & Compliance
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!esiForm.esi_enabled}
                      onChange={(e) => setEsiForm({ ...esiForm, esi_enabled: e.target.checked ? 1 : 0 })}
                      size="medium" color="primary"
                    />
                  }
                  label="ESI Enabled"
                />
              </FormControl>
              <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px' }}>
                Turn ON to compute ESI (Employer + Employee). When OFF, ESI contributions become 0 for all employees.
              </FormHelperText>
            </Box>

            <TextField
              label="Company / Establishment Name"
              value={esiForm.establishment_name || ''}
              onChange={(e) => setEsiForm({ ...esiForm, establishment_name: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="Used in statutory screens, export labels and compliance registers."
              sx={{ mb: 2 }}
            />

            <TextField
              label="ESIC Employer Code Number"
              value={esiForm.esic_code || ''}
              onChange={(e) => setEsiForm({ ...esiForm, esic_code: e.target.value })}
              fullWidth variant="filled" size="small"
              required={!!esiForm.esi_enabled}
              helperText="Your ESIC registration number (used for challans / online filings)."
              sx={{ mb: 2 }}
            />

            <TextField
              label="Coverage / Applicability Start Date"
              type="date"
              value={esiForm.coverage_date || ''}
              onChange={(e) => setEsiForm({ ...esiForm, coverage_date: e.target.value })}
              fullWidth variant="filled" size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="From when your establishment started ESI coverage."
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>
                Monthly payment due date (reference)
              </Typography>
              <Chip label="Within 15 days of the following month" size="small" variant="outlined" sx={{ mt: 0.5 }} />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>
                Contribution period concept
              </Typography>
              <Chip label="Apr-Sep & Oct-Mar" size="small" variant="outlined" sx={{ mt: 0.5 }} />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'poppins', fontSize: 10 }}>
              Coverage continues till end of contribution period if wages cross the ceiling after the period begins.
            </Typography>
          </Paper>
        </Grid>

        {/* Right Card: Coverage & Rates */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              2) Coverage & Rates
            </Typography>

            {/* Wage Ceiling */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Wage ceiling (Monthly) for ESI coverage
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <TextField
                type="number"
                value={esiForm.wage_ceiling ?? 21000}
                onChange={(e) => setEsiForm({ ...esiForm, wage_ceiling: Number(e.target.value) })}
                variant="filled" size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!esiForm.continue_till_period_end}
                    onChange={(e) => setEsiForm({ ...esiForm, continue_till_period_end: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>Continue coverage till end of contribution period (if crossed later)</Typography>}
              />
            </Box>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              Default wage ceiling is ₹21,000 per month (effective from 01.01.2017 as per ESIC coverage info).
            </FormHelperText>

            {/* PWD Wage Limit */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Persons with Disability (PWD) wage limit (optional)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <TextField
                type="number"
                value={esiForm.pwd_wage_ceiling ?? 25000}
                onChange={(e) => setEsiForm({ ...esiForm, pwd_wage_ceiling: Number(e.target.value) })}
                variant="filled" size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!esiForm.pwd_no_ceiling}
                    onChange={(e) => setEsiForm({ ...esiForm, pwd_no_ceiling: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>Apply "No wage ceiling for PWD" mode</Typography>}
              />
            </Box>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              ESIC notes a higher wage limit for PWD in coverage pages. Keep this field configurable.
            </FormHelperText>

            {/* Rates */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Rates (effective 01.07.2019)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 0.5 }}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Employer rate (%)"
                  type="number"
                  value={esiForm.employer_rate ?? 3.25}
                  onChange={(e) => setEsiForm({ ...esiForm, employer_rate: parseFloat(e.target.value) })}
                  fullWidth variant="filled" size="small"
                  slotProps={{ input: { inputProps: { step: 0.01 } } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Employee rate (%)"
                  type="number"
                  value={esiForm.employee_rate ?? 0.75}
                  onChange={(e) => setEsiForm({ ...esiForm, employee_rate: parseFloat(e.target.value) })}
                  fullWidth variant="filled" size="small"
                  slotProps={{ input: { inputProps: { step: 0.01 } } }}
                />
              </Grid>
            </Grid>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              Total contribution is {((Number(esiForm.employer_rate) || 3.25) + (Number(esiForm.employee_rate) || 0.75)).toFixed(2)}% of wages ({Number(esiForm.employer_rate) || 3.25}% ER + {Number(esiForm.employee_rate) || 0.75}% EE) per ESIC employer guidance.
            </FormHelperText>

            {/* Daily Exemption */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>
              Employee-share exemption threshold (daily average wage)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <TextField
                type="number"
                value={esiForm.daily_exemption_threshold ?? 176}
                onChange={(e) => setEsiForm({ ...esiForm, daily_exemption_threshold: Number(e.target.value) })}
                variant="filled" size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={!!esiForm.daily_exemption_enabled}
                    onChange={(e) => setEsiForm({ ...esiForm, daily_exemption_enabled: e.target.checked ? 1 : 0 })}
                  />
                }
                label={<Typography sx={{ fontFamily: 'poppins', fontSize: 10 }}>Apply EE exemption (EE share = 0 if daily avg ≤ threshold)</Typography>}
              />
            </Box>
            <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px', mb: 2 }}>
              If daily average wage is up to the threshold, employee's share is not deducted; employer still pays employer share.
            </FormHelperText>

            {/* Rounding */}
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11, mb: 0.5 }}>Rounding</Typography>
            <TextField
              select
              value={esiForm.rounding_mode || 'ceil'}
              onChange={(e) => setEsiForm({ ...esiForm, rounding_mode: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="ESI references for rounding differ across documents/years."
            >
              <MenuItem value="nearest">Nearest rupee (nearest)</MenuItem>
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
          These values are used by the engine in Payroll Preview.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>COVERAGE CEILING (STANDARD)</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>₹{(esiForm.wage_ceiling || 21000).toLocaleString('en-IN')}</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                If wages cross after contribution period begins, coverage can continue till period end.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>ER / EE RATES</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>{esiForm.employer_rate || 3.25}% / {esiForm.employee_rate || 0.75}%</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Rates are configurable for future notifications.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>DAILY AVG EXEMPTION</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>₹{esiForm.daily_exemption_threshold || 176}/day</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                If applicable, EE share becomes 0.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ── ESI Wage Builder ── */}
      <Box sx={{ mt: 3 }}>
        <Typography className="page-title" style={{ paddingBottom: '5px' }}>
          ESI Wage Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
          Decide which earnings count for: (1) <strong>coverage threshold</strong> (wage ceiling check) and (2) <strong>contribution wages</strong> (base used to compute ESI %).
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 12, mb: 0.5 }}>
            Earning Components
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '10px' }}>
            ESIC FAQ notes overtime is excluded for ceiling/coverage decision but included for contribution wages. This UI supports separate toggles.
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Component</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Type</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Include for Coverage Threshold?</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Include for Contribution Wages?</TableCell>
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
                          checked={!!row.isESIThreshold}
                          onChange={() => toggleWageFlag(idx, 'isESIThreshold')}
                          color="success"
                        />
                        <Typography sx={{ fontFamily: 'poppins', fontSize: 11 }}>{row.isESIThreshold ? 'Yes' : 'No'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Checkbox size="small"
                          checked={!!row.isESIContribution}
                          onChange={() => toggleWageFlag(idx, 'isESIContribution')}
                          color="success"
                        />
                        <Typography sx={{ fontFamily: 'poppins', fontSize: 11 }}>{row.isESIContribution ? 'Yes' : 'No'}</Typography>
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
                        sx={{ fontFamily: 'poppins', fontSize: 11 }}
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
                    <TableCell align="center" colSpan={3}>
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
