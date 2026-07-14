import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Drawer, FormControl, FormControlLabel, FormHelperText,
  Grid, IconButton, MenuItem, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha, styled } from '@mui/material/styles';
import CommonToolTip from '../../../components/ToolTip';
import statutoryService from '../../../services/statutory_services';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
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

export default function PTSettings() {
  const dispatch = useDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [companyPT, setCompanyPT] = useState(null);
  const [companyPTStatus, setCompanyPTStatus] = useState(null);
  const [ptForm, setPtForm] = useState({});
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());

  // PT masters
  const [ptStates, setPtStates] = useState([]);
  const [ptLocales, setPtLocales] = useState([]);
  const [ptSlabs, setPtSlabs] = useState([]);

  // PT Slab builder (inline)
  const [slabRows, setSlabRows] = useState([]);

  // Audit history
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;
  const {
    rbacReducer: { menuAccess },
  } = useSelector((state) => state);
  const isAdmin = ADMIN_ROLES.includes(storage?.role_name);

  // ── Data fetch ───────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async (month) => {
    try {
      setLoading(true);
      const res = await statutoryService.getCompanySettings(month || currentMonth());
      setCompanyPT(res.data?.pt || null);
      setCompanyPTStatus(res.data?.pt?.pt_enabled ?? 0);
    } catch (err) {
      console.error('Error fetching PT settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPTStates = useCallback(async () => {
    try {
      const res = await statutoryService.getPTStates();
      setPtStates(res.data || []);
    } catch (err) {
      console.error('Error fetching PT states:', err);
    }
  }, []);

  const fetchPTLocales = useCallback(async (stateCode) => {
    if (!stateCode) return;
    try {
      const res = await statutoryService.getPTLocales(stateCode);
      setPtLocales(res.data || []);
    } catch (err) {
      console.error('Error fetching PT locales:', err);
    }
  }, []);

  const fetchPTSlabs = useCallback(async (localeId, month) => {
    if (!localeId) return;
    try {
      const res = await statutoryService.getPTSlabs(localeId, month);
      const slabs = res.data || [];
      setPtSlabs(slabs);
      setSlabRows(slabs.map((s) => ({ ...s })));
    } catch (err) {
      console.error('Error fetching PT slabs:', err);
    }
  }, []);

  const fetchAuditHistory = useCallback(async () => {
    try {
      const res = await statutoryService.getAuditLog();
      const all = res.data || [];
      setHistoryData(all.filter(r => r.entity_type?.startsWith('PT_')));
    } catch (err) {
      console.error('Error fetching PT audit history:', err);
      setHistoryData([]);
    }
  }, []);

  const openHistory = () => {
    setHistoryOpen(true);
    fetchAuditHistory();
  };

  useEffect(() => {
    fetchSettings();
    fetchPTStates();
  }, [fetchSettings, fetchPTStates]);

  // Load locales when companyPT is fetched
  useEffect(() => {
    if (companyPT?.default_state_code) {
      fetchPTLocales(companyPT.default_state_code);
    }
    if (companyPT?.default_locale_id) {
      fetchPTSlabs(companyPT.default_locale_id, currentMonth());
    }
  }, [companyPT, fetchPTLocales, fetchPTSlabs]);

  // ── Edit handlers ──────────────────────────────────────────────────────
 const handleEditOpen = () => {
  setPtForm({
    pt_enabled: companyPT?.pt_enabled ?? 0,
    default_state_code: companyPT?.default_state_code || '',
    default_locale_id: companyPT?.default_locale_id || '',
    pt_registration_number: companyPT?.pt_registration_number || '',
    schedule: companyPT?.schedule || 'last_month',
    rounding_mode: companyPT?.rounding_mode || 'nearest',
    income_basis: companyPT?.income_basis || 'gross_x6',
  });

  setEffectiveMonth(
    companyPT?.effective_from
      ? String(companyPT.effective_from).slice(0, 7)
      : currentMonth()
  );

  setSaveMsg(null);

  if (companyPT?.default_state_code) {
    fetchPTLocales(companyPT.default_state_code);
  }
  if (companyPT?.default_locale_id) {
    fetchPTSlabs(
      companyPT.default_locale_id,
      companyPT?.effective_from
        ? String(companyPT.effective_from).slice(0, 7)
        : currentMonth()
    );
  }

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

  const saveMonth = String(effectiveMonth).slice(0, 7);
  const payload = {
    month: saveMonth,
    effective_from: `${saveMonth}-01`,
    pt: {
      ...ptForm,
    },
  };

  try {
    setLoading(true);

    console.log('Saving PT settings payload:', payload);

    await statutoryService.upsertCompanySettings(payload);

    if (ptForm.default_locale_id && slabRows.length > 0) {
      await statutoryService.upsertPTSlabs({
        locale_id: ptForm.default_locale_id,
        effective_from: `${saveMonth}-01`,
        slabs: slabRows.map((r) => ({
          income_from: parseFloat(r.income_from) || 0,
          income_to: parseFloat(r.income_to) || 0,
          tax_half_year: parseFloat(r.tax_half_year) || 0,
          notes: r.notes || '',
        })),
      });
    }

    setSaveMsg({ severity: 'success', text: 'PT settings saved successfully' });
    await fetchSettings(saveMonth);

    if (ptForm.default_locale_id) {
      fetchPTSlabs(ptForm.default_locale_id, saveMonth);
    }

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


  // ── PT State / Locale changes ──────────────────────────────────────────
  const handlePtStateChange = (stateCode) => {
    setPtForm((prev) => ({ ...prev, default_state_code: stateCode, default_locale_id: '' }));
    setPtLocales([]);
    setPtSlabs([]);
    setSlabRows([]);
    if (stateCode) fetchPTLocales(stateCode);
  };

  const handlePtLocaleChange = (localeId) => {
    setPtForm((prev) => ({ ...prev, default_locale_id: localeId }));
    if (localeId) fetchPTSlabs(localeId, effectiveMonth);
  };

  // ── Slab row helpers ───────────────────────────────────────────────────
  const addSlabRow = () => {
    setSlabRows((prev) => [...prev, { income_from: '', income_to: '', tax_half_year: '', notes: '' }]);
  };

  const removeSlabRow = (idx) => {
    setSlabRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSlabRow = (idx, field, value) => {
    setSlabRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const localeName = useMemo(() => {
    if (!companyPT?.default_locale_id) return '';
    const loc = ptLocales.find(l => String(l.id) === String(companyPT.default_locale_id));
    return loc?.locale_name || companyPT.locale_name || '';
  }, [companyPT, ptLocales]);

  const scheduleLabel = (val) => {
    switch (val) {
      case 'first_month': return 'Apr & Oct';
      case 'last_month': return 'Sep & Mar';
      case 'monthly_equal': return 'Monthly (PT/6)';
      default: return val || '-';
    }
  };

  const incomeLabel = (val) => {
    switch (val) {
      case 'gross_x6': return 'Average Half-yearly income (monthly gross × 6)';
      case 'gross': return 'Monthly gross';
      default: return val || '-';
    }
  };
  const canEdit = storage?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__pt', 'can_edit') : true;
  if (loading && companyPTStatus === null) {
  return (
    <Grid sx={{ padding: '20px' }}>
      <Typography>Loading PT Settings...</Typography>
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
          <Typography className="page-title">PT Settings</Typography>
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
                label="PT Status"
                defaultValue={companyPT?.pt_enabled ? 'Enabled' : 'Disabled'}
                variant="filled"
                fullWidth
              />
            </Grid>
            {companyPT?.pt_enabled ? (
              <>
                {companyPT?.default_state_code && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="State"
                      defaultValue={ptStates.find(s => s.state_code === companyPT.default_state_code)?.state_name || companyPT.default_state_code}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                {localeName && (
                  <Grid size={gridItem}>
                    <RedditTextField
                      label="Local Body / Jurisdiction"
                      defaultValue={localeName}
                      variant="filled"
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Deduction Schedule"
                    defaultValue={scheduleLabel(companyPT?.schedule)}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Income Basis"
                    defaultValue={incomeLabel(companyPT?.income_basis)}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
                <Grid size={gridItem}>
                  <RedditTextField
                    label="Rounding"
                    defaultValue={companyPT?.rounding_mode === 'ceil' ? 'Ceil' : companyPT?.rounding_mode === 'floor' ? 'Floor' : 'Nearest'}
                    variant="filled"
                    fullWidth
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        </Grid>

        {/* Policy Summary (view mode) */}
        {companyPT?.pt_enabled ? (
          <Paper variant="outlined" sx={{ mt: 2, p: 2.5 }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 13, mb: 0.5 }}>Policy Summary</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '11px' }}>
              Current PT configuration based on saved settings.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>LOCALE</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                    {localeName || '-'}
                  </Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Slabs are based on the selected locale.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>DEDUCTION SCHEDULE</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                    {scheduleLabel(companyPT?.schedule)}
                  </Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    When PT is deducted each half-year.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>INCOME BASIS</Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                    {companyPT?.income_basis === 'gross_x6' ? 'Gross × 6' : 'Monthly Gross'}
                  </Typography>
                  <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                    Used to match against PT slabs.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        ) : null}

        {/* PT Slabs read-only */}
        {companyPT?.pt_enabled && ptSlabs.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography className="page-title" sx={{ mb: 1 }}>PT Slabs</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>From (₹)</TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>To (₹)</TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>PT (Half-Year) ₹</TableCell>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: 600 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ptSlabs.map((row, idx) => (
                    <TableRow key={row.id || idx}>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {Number(row.income_from).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {Number(row.income_to).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {Number(row.tax_half_year).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'poppins', fontSize: '11px' }}>
                        {row.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* PT Audit History Drawer */}
        <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>PT Change History</Typography>
              <IconButton onClick={() => setHistoryOpen(false)} size="small"><CloseIcon /></IconButton>
            </Box>
            {historyData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No PT changes recorded yet.
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
        Update PT Settings
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

      {/* ── PT Company Settings ── */}
      <Typography className="page-title" style={{ paddingBottom: '10px' }}>
        Professional Tax — Company Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
        Professional Tax (PT) varies by State / Local Body. Configure your company's PT registration and deduction rules.
      </Typography>

      <Grid container spacing={2}>
        {/* Left Card: Registration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              1) Registration
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!ptForm.pt_enabled}
                      onChange={(e) => setPtForm({ ...ptForm, pt_enabled: e.target.checked ? 1 : 0 })}
                      size="medium" color="primary"
                    />
                  }
                  label="Professional Tax Enabled"
                />
              </FormControl>
              <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px' }}>
                Turn ON to compute PT. When OFF, PT becomes 0 for all employees.
              </FormHelperText>
            </Box>

            <TextField
              label="State"
              select
              value={ptForm.default_state_code || ''}
              onChange={(e) => handlePtStateChange(e.target.value)}
              fullWidth variant="filled" size="small"
              helperText="PT rules depend on State/Local Body."
              sx={{ mb: 2 }}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {ptStates.map((s) => (
                <MenuItem key={s.state_code} value={s.state_code}>
                  {s.state_name} ({s.state_code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Local Body / Jurisdiction"
              select
              value={ptForm.default_locale_id || ''}
              onChange={(e) => handlePtLocaleChange(e.target.value)}
              fullWidth variant="filled" size="small"
              disabled={!ptForm.default_state_code}
              helperText={ptForm.default_state_code ? `PT is levied by local bodies (corporations/municipalities/panchayats).` : 'Select a state first'}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {ptLocales.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.locale_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="PT Registration Number"
              value={ptForm.pt_registration_number || ''}
              onChange={(e) => setPtForm({ ...ptForm, pt_registration_number: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="PT account/registration number issued by the local body."
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>
                Half-year definition (reference)
              </Typography>
              <Chip label="Apr-Sep & Oct-Mar" size="small" variant="outlined" sx={{ mt: 0.5 }} />
              <FormHelperText sx={{ fontFamily: 'poppins', fontSize: '10px' }}>
                Used in slab computation and deduction schedule.
              </FormHelperText>
            </Box>
          </Paper>
        </Grid>

        {/* Right Card: Deduction & Payroll Behavior */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 13, mb: 2 }}>
              2) Deduction & Payroll Behavior
            </Typography>

            {/* Effective Month */}
            <TextField
              label="Payroll month"
              type="month"
              value={effectiveMonth}
              onChange={(e) => setEffectiveMonth(e.target.value)}
              fullWidth required variant="filled" size="small"
              helperText="PT deduction shown for the selected month based on your schedule below."
              sx={{ mb: 2 }}
            />

            <TextField
              label="Income basis used to choose slab"
              select
              value={ptForm.income_basis || 'gross_x6'}
              onChange={(e) => setPtForm({ ...ptForm, income_basis: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText={ptForm.income_basis === 'gross_x6'
                ? 'Uses "Average Half-Yearly Income" slabs, approximated as monthly gross × 6.'
                : 'Uses monthly gross for slab matching.'}
              sx={{ mb: 2 }}
            >
              <MenuItem value="gross_x6">Average Half-yearly income (monthly gross × 6)</MenuItem>
            </TextField>

            <TextField
              label="Deduction schedule"
              select
              value={ptForm.schedule || 'last_month'}
              onChange={(e) => setPtForm({ ...ptForm, schedule: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="Employers often follow a schedule. Keep configurable."
              sx={{ mb: 2 }}
            >
              <MenuItem value="first_month">Deduct in first month of each half-year (Apr & Oct)</MenuItem>
              <MenuItem value="last_month">Deduct in last month of each half-year (Sep & Mar)</MenuItem>
              <MenuItem value="monthly_equal">Monthly Equal (PT/6)</MenuItem>
            </TextField>

            <TextField
              label="Rounding"
              select
              value={ptForm.rounding_mode || 'nearest'}
              onChange={(e) => setPtForm({ ...ptForm, rounding_mode: e.target.value })}
              fullWidth variant="filled" size="small"
              helperText="PT values are slab amounts (already rupees) but rounding helps for monthly-equal spreading."
            >
              <MenuItem value="nearest">Nearest rupee</MenuItem>
              <MenuItem value="floor">Previous rupee (floor)</MenuItem>
              <MenuItem value="ceil">Next higher rupee (ceil)</MenuItem>
            </TextField>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Live PT Policy Preview ── */}
      <Paper variant="outlined" sx={{ mt: 2, p: 2.5 }}>
        <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 13, mb: 0.5 }}>Live PT Policy Preview</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontFamily: 'poppins', fontSize: '11px' }}>
          These values are used by the engine in Payroll Preview.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>LOCALE</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                {ptLocales.find(l => String(l.id) === String(ptForm.default_locale_id))?.locale_name || '-'}
              </Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Slabs are prefilled for the selected locale.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>DEDUCTION SCHEDULE</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                {scheduleLabel(ptForm.schedule)}
              </Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                Change schedule to see monthly deduction change.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="overline" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>PAYROLL MONTH</Typography>
              <Typography sx={{ fontFamily: 'poppins', fontWeight: 700, fontSize: 16 }}>
                {effectiveMonth || '-'}
              </Typography>
              <Typography sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
                PT computed for selected month.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ── PT Slab Builder ── */}
      <Box sx={{ mt: 3 }}>
        <Typography className="page-title" style={{ paddingBottom: '5px' }}>
          PT Slab Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'poppins', fontSize: '11px' }}>
          Configure PT slabs (income ranges → tax amount). Edit slabs below or add new rows.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addSlabRow}>
                Add slab
              </Button>
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'poppins', fontSize: 10, color: 'text.secondary' }}>
              Income is <strong>{ptForm.income_basis === 'gross_x6' ? 'Average Half-yearly (₹)' : 'Monthly Gross (₹)'}</strong>.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>#</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>From (₹)</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>To (₹)</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>PT (Half-Year) ₹</TableCell>
                  <TableCell sx={{ fontFamily: 'poppins', fontWeight: 600, fontSize: 11 }}>Notes</TableCell>
                  <TableCell width={70}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slabRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontFamily: 'poppins', fontSize: 11 }}>{idx + 1}</TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="filled"
                        value={row.income_from}
                        onChange={(e) => updateSlabRow(idx, 'income_from', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="filled"
                        value={row.income_to}
                        onChange={(e) => updateSlabRow(idx, 'income_to', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number" size="small" variant="filled"
                        value={row.tax_half_year}
                        onChange={(e) => updateSlabRow(idx, 'tax_half_year', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" variant="filled"
                        value={row.notes || ''}
                        onChange={(e) => updateSlabRow(idx, 'notes', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" size="small" color="error"
                        onClick={() => removeSlabRow(idx)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
