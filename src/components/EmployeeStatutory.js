import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Box, Button, Chip, FormControlLabel, FormHelperText,
  Grid, MenuItem, Switch, TextField, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import statutoryService from '../services/statutory_services';

const gridItem = { lg: 3, md: 4, sm: 4, xs: 12 };

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Employee Statutory Profiles — PF / ESI / PT
 * Renders inside the NewUser.js employee form as a tab panel.
 *
 * @param {object} props
 * @param {number} props.employeeId  - employee_id from pos_employees
 * @param {string} props.uanNumber   - UAN from pos_people (read-only display)
 * @param {string} props.esiNumber   - ESI number from pos_people (read-only display)
 */
export default function EmployeeStatutory({ employeeId, uanNumber, esiNumber }) {
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [expanded, setExpanded] = useState('pf');

  // Company-level statutory settings (authoritative source for PF/ESI/PT enabled)
  const [pfEnabled, setPfEnabled] = useState(false);
  const [esiEnabled, setEsiEnabled] = useState(false);
  const [ptEnabled, setPtEnabled] = useState(false);

  // Existing profile data from API
  const [existingPF, setExistingPF] = useState(null);
  const [existingESI, setExistingESI] = useState(null);
  const [existingPT, setExistingPT] = useState(null);

  // Edit forms
  const [pfForm, setPfForm] = useState({});
  const [esiForm, setEsiForm] = useState({});
  const [ptForm, setPtForm] = useState({});
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());

  // PT locale data
  const [ptStates, setPtStates] = useState([]);
  const [ptLocales, setPtLocales] = useState([]);

  // ── Fetch company statutory settings ───────────────────────────────────────
  const fetchCompanySettings = useCallback(async () => {
    try {
      const month = effectiveMonth || currentMonth();
      const res = await statutoryService.getCompanySettings(month);
      const d = res.data || {};
      setPfEnabled(!!d.pf?.pf_enabled);
      setEsiEnabled(!!d.esi?.esi_enabled);
      setPtEnabled(!!d.pt?.pt_enabled);
    } catch (err) {
      console.error('Error fetching company statutory settings:', err);
    }
  }, [effectiveMonth]);

  // ── Fetch existing profiles ──────────────────────────────────────────────
  const fetchProfiles = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await statutoryService.getEmployeeProfiles(employeeId, effectiveMonth || currentMonth());
      setExistingPF(res.data?.pf || null);
      setExistingESI(res.data?.esi || null);
      setExistingPT(res.data?.pt || null);
      initForms(res.data?.pf, res.data?.esi, res.data?.pt);
    } catch (err) {
      console.error('Error fetching employee statutory profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, effectiveMonth]);

  const initForms = async (pf, esi, pt) => {
    setPfForm({
      pf_status: pf?.pf_status || 'active',
      existing_member: pf?.existing_member ?? 1,
      uan: pf?.uan || uanNumber || '',
      pf_member_id: pf?.pf_member_id || '',
      vpf_enabled: pf?.vpf_enabled ?? 0,
      vpf_mode: pf?.vpf_mode || 'percent',
      vpf_value: pf?.vpf_value ?? 0,
      cap_policy_override: pf?.cap_policy_override || 'default',
      eps_override: pf?.eps_override || 'auto',
      eps_override_reason: pf?.eps_override_reason || '',
    });
    setEsiForm({
      esi_status: esi?.esi_status || 'active',
      esi_number: esi?.esi_number || esiNumber || '',
      covered_this_period: esi?.covered_this_period ?? 0,
      wage_days_override: esi?.wage_days_override ?? '',
      is_pwd: esi?.is_pwd ?? 0,
      pwd_start_date: esi?.pwd_start_date ? String(esi.pwd_start_date).slice(0, 10) : '',
    });

    // Restore PT form with _state_code from the joined locale data
    const stateCode = pt?.locale_state_code || '';
    setPtForm({
      pt_applicable: pt?.pt_applicable ?? 1,
      exemption_reason: pt?.exemption_reason || '',
      locale_override_id: pt?.locale_override_id || '',
      _state_code: stateCode,
      manual_override_enabled: pt?.manual_override_enabled ?? 0,
      manual_override_half_tax: pt?.manual_override_half_tax ?? 0,
    });

    // If there's a saved locale override, fetch the locales for its state to populate the dropdown
    if (stateCode) {
      try {
        const res = await statutoryService.getPTLocales(stateCode);
        setPtLocales(res.data || []);
      } catch (err) {
        console.error('Error restoring PT locales:', err);
      }
    }
  };

  useEffect(() => {
    fetchCompanySettings();
    fetchProfiles();
  }, [fetchCompanySettings, fetchProfiles]);

  useEffect(() => {
    statutoryService.getPTStates().then((res) => setPtStates(res.data || [])).catch(() => {});
  }, []);

  const handlePtStateChange = async (stateCode) => {
    setPtLocales([]);
    if (!stateCode) return;
    try {
      const res = await statutoryService.getPTLocales(stateCode);
      setPtLocales(res.data || []);
    } catch (err) {
      console.error('Error fetching PT locales:', err);
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // if (!effectiveMonth) {
    //   setSaveMsg({ severity: 'warning', text: 'Effective Month is required' });
    //   return;
    // }
    if (!employeeId) {
      setSaveMsg({ severity: 'warning', text: 'Employee must be saved first before adding statutory profiles' });
      return;
    }

    try {
      setLoading(true);
      const payload = { month: effectiveMonth };

      if (pfEnabled) payload.pf = pfForm;
      if (esiEnabled) payload.esi = esiForm;
      if (ptEnabled) {
        const { _state_code, ...ptPayload } = ptForm;
        payload.pt = ptPayload;
      }

      await statutoryService.upsertEmployeeProfiles(employeeId, payload);
      setSaveMsg({ severity: 'success', text: 'Employee statutory profiles saved' });
      await fetchProfiles();
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ severity: 'error', text: err?.response?.data?.message || 'Save failed' });
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const hasOverride = (type) => {
    if (type === 'pf') {
      return existingPF && (
        existingPF.cap_policy_override !== 'default' ||
        existingPF.eps_override !== 'auto' ||
        existingPF.vpf_enabled
      );
    }
    if (type === 'esi') {
      return existingESI && existingESI.is_pwd;
    }
    if (type === 'pt') {
      return existingPT && (
        existingPT.pt_applicable === 0 ||
        existingPT.manual_override_enabled
      );
    }
    return false;
  };

  if (!employeeId) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Save the employee first to configure statutory profiles.</Alert>
      </Box>
    );
  }

  if (!loading && !pfEnabled && !esiEnabled && !ptEnabled) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          No statutory components (PF, ESI, PT) are enabled in company settings for the current month.
          Configure them in Payroll &gt; Configuration &gt; Statutory Settings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {saveMsg && (
        <Alert severity={saveMsg.severity} sx={{ mb: 2 }} onClose={() => setSaveMsg(null)}>
          {saveMsg.text}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
        Changes apply from <strong>{effectiveMonth}</strong> onward. A new effective-dated version will be created.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={gridItem}>
          <TextField
            label="Effective From Month"
            type="month"
            value={effectiveMonth}
            onChange={(e) => setEffectiveMonth(e.target.value)}
            fullWidth variant="outlined" size="small"
          />
        </Grid>
      </Grid>

      {/* ── PF Panel ──────────────────────────────────────────────────── */}
      {pfEnabled && (
        <Accordion
          expanded={expanded === 'pf'}
          onChange={() => setExpanded(expanded === 'pf' ? '' : 'pf')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
              PF Profile
              {hasOverride('pf') && (
                <Chip label="Override" size="small" color="warning" sx={{ ml: 1 }} />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={gridItem}>
                <TextField
                  label="PF Status"
                  select
                  value={pfForm.pf_status || 'active'}
                  onChange={(e) => setPfForm({ ...pfForm, pf_status: e.target.value })}
                  fullWidth size="small" variant="outlined"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="excluded">Excluded</MenuItem>
                </TextField>
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="Existing Member"
                  select
                  value={pfForm.existing_member ?? 1}
                  onChange={(e) => setPfForm({ ...pfForm, existing_member: Number(e.target.value) })}
                  fullWidth size="small" variant="outlined"
                  helperText="Has prior EPF/EPS membership before joining"
                >
                  <MenuItem value={1}>Yes</MenuItem>
                  <MenuItem value={0}>No</MenuItem>
                </TextField>
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="UAN Number"
                  value={uanNumber || pfForm.uan || ''}
                  onChange={(e) => setPfForm({ ...pfForm, uan: e.target.value })}
                  fullWidth size="small" variant="outlined"
                  // slotProps={{ input: { readOnly: true } }}
                  helperText="Managed in employee master (pos_people)"
                />
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="PF Member ID"
                  value={pfForm.pf_member_id || ''}
                  onChange={(e) => setPfForm({ ...pfForm, pf_member_id: e.target.value })}
                  fullWidth size="small" variant="outlined"
                />
              </Grid>
              <Grid size={gridItem}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!pfForm.vpf_enabled}
                      onChange={(e) => setPfForm({ ...pfForm, vpf_enabled: e.target.checked ? 1 : 0 })}
                    />
                  }
                  label="VPF Enabled"
                />
              </Grid>
              {!!pfForm.vpf_enabled && (
                <>
                  <Grid size={gridItem}>
                    <TextField
                      label="VPF Mode"
                      select
                      value={pfForm.vpf_mode || 'percent'}
                      onChange={(e) => setPfForm({ ...pfForm, vpf_mode: e.target.value })}
                      fullWidth size="small" variant="outlined"
                    >
                      <MenuItem value="percent">Percent</MenuItem>
                      <MenuItem value="amount">Fixed Amount</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={gridItem}>
                    <TextField
                      label={pfForm.vpf_mode === 'percent' ? 'VPF Percent (%)' : 'VPF Amount'}
                      type="number"
                      value={pfForm.vpf_value ?? 0}
                      onChange={(e) => setPfForm({ ...pfForm, vpf_value: parseFloat(e.target.value) || 0 })}
                      fullWidth size="small" variant="outlined"
                    />
                  </Grid>
                </>
              )}
              <Grid size={gridItem}>
                <TextField
                  label="Cap Policy Override"
                  select
                  value={pfForm.cap_policy_override || 'default'}
                  onChange={(e) => setPfForm({ ...pfForm, cap_policy_override: e.target.value })}
                  fullWidth size="small" variant="outlined"
                  helperText="Override company default cap policy"
                >
                  <MenuItem value="default">Default (use company setting)</MenuItem>
                  <MenuItem value="ceiling">Ceiling (cap at wage ceiling)</MenuItem>
                  <MenuItem value="actual">Actual (full PF wages)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="EPS Override"
                  select
                  value={pfForm.eps_override || 'auto'}
                  onChange={(e) => setPfForm({ ...pfForm, eps_override: e.target.value })}
                  fullWidth size="small" variant="outlined"
                  helperText="auto = age/join-date rules; force = admin override"
                >
                  <MenuItem value="auto">Auto</MenuItem>
                  <MenuItem value="force_yes">Force Yes</MenuItem>
                  <MenuItem value="force_no">Force No</MenuItem>
                </TextField>
              </Grid>
              {pfForm.eps_override === 'force_no' && (
                <Grid size={gridItem}>
                  <TextField
                    label="EPS Override Reason"
                    value={pfForm.eps_override_reason || ''}
                    onChange={(e) => setPfForm({ ...pfForm, eps_override_reason: e.target.value })}
                    fullWidth size="small" variant="outlined"
                  />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* ── ESI Panel ─────────────────────────────────────────────────── */}
      {esiEnabled && (
        <Accordion
          expanded={expanded === 'esi'}
          onChange={() => setExpanded(expanded === 'esi' ? '' : 'esi')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
              ESI Profile
              {hasOverride('esi') && (
                <Chip label="Override" size="small" color="warning" sx={{ ml: 1 }} />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={gridItem}>
                <TextField
                  label="ESI Status"
                  select
                  value={esiForm.esi_status || 'active'}
                  onChange={(e) => setEsiForm({ ...esiForm, esi_status: e.target.value })}
                  fullWidth size="small" variant="outlined"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="not_covered">Not Covered</MenuItem>
                </TextField>
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="IP Number"
                  value={esiForm.esi_number || ''}
                  onChange={(e) => setEsiForm({ ...esiForm, esi_number: e.target.value })}
                  fullWidth size="small" variant="outlined"
                  helperText={esiNumber ? `From pos_people: ${esiNumber}` : 'Enter IP Number'}
                />
              </Grid>
              <Grid size={gridItem}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!esiForm.covered_this_period}
                      onChange={(e) => setEsiForm({ ...esiForm, covered_this_period: e.target.checked ? 1 : 0 })}
                    />
                  }
                  label="Covered This Period"
                />
                <FormHelperText>ESI coverage for the current 6-month period</FormHelperText>
              </Grid>
              <Grid size={gridItem}>
                <TextField
                  label="Wage Days Override"
                  type="number"
                  value={esiForm.wage_days_override ?? ''}
                  onChange={(e) => setEsiForm({ ...esiForm, wage_days_override: e.target.value === '' ? null : Number(e.target.value) })}
                  fullWidth size="small" variant="outlined"
                  helperText="Leave blank to use company default"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 12, mt: 1, color: 'text.secondary' }}>
                  PWD (Persons with Disability)
                </Typography>
              </Grid>
              <Grid size={gridItem}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!esiForm.is_pwd}
                      onChange={(e) => setEsiForm({ ...esiForm, is_pwd: e.target.checked ? 1 : 0 })}
                    />
                  }
                  label="Is PWD"
                />
              </Grid>
              {!!esiForm.is_pwd && (
                <Grid size={gridItem}>
                  <TextField
                    label="PWD Start Date"
                    type="date"
                    value={esiForm.pwd_start_date || ''}
                    onChange={(e) => setEsiForm({ ...esiForm, pwd_start_date: e.target.value })}
                    fullWidth size="small" variant="outlined"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* ── PT Panel ──────────────────────────────────────────────────── */}
      {ptEnabled && (
      <Accordion
        expanded={expanded === 'pt'}
        onChange={() => setExpanded(expanded === 'pt' ? '' : 'pt')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
            Professional Tax Profile
            {hasOverride('pt') && (
              <Chip label="Override" size="small" color="warning" sx={{ ml: 1 }} />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid size={gridItem}>
              <TextField
                label="PT Applicable"
                select
                value={ptForm.pt_applicable ?? 1}
                onChange={(e) => setPtForm({ ...ptForm, pt_applicable: Number(e.target.value) })}
                fullWidth size="small" variant="outlined"
              >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No (Exempt)</MenuItem>
              </TextField>
            </Grid>
            {ptForm.pt_applicable === 0 && (
              <Grid size={gridItem}>
                <TextField
                  label="Exemption Reason"
                  value={ptForm.exemption_reason || ''}
                  onChange={(e) => setPtForm({ ...ptForm, exemption_reason: e.target.value })}
                  fullWidth size="small" variant="outlined"
                />
              </Grid>
            )}
            <Grid size={gridItem}>
              <TextField
                label="Locale Override (State)"
                select
                value={ptForm._state_code || ''}
                onChange={(e) => {
                  setPtForm({ ...ptForm, _state_code: e.target.value, locale_override_id: '' });
                  handlePtStateChange(e.target.value);
                }}
                fullWidth size="small" variant="outlined"
                helperText="Override company default locale"
              >
                <MenuItem value="">-- Use Company Default --</MenuItem>
                {ptStates.map((s) => (
                  <MenuItem key={s.state_code} value={s.state_code}>
                    {s.state_name} ({s.state_code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {ptLocales.length > 0 && (
              <Grid size={gridItem}>
                <TextField
                  label="Locale Override"
                  select
                  value={ptForm.locale_override_id || ''}
                  onChange={(e) => setPtForm({ ...ptForm, locale_override_id: e.target.value || null })}
                  fullWidth size="small" variant="outlined"
                >
                  <MenuItem value="">-- Use Company Default --</MenuItem>
                  {ptLocales.map((l) => (
                    <MenuItem key={l.id} value={l.id}>{l.locale_name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid size={gridItem}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!ptForm.manual_override_enabled}
                    onChange={(e) => setPtForm({ ...ptForm, manual_override_enabled: e.target.checked ? 1 : 0 })}
                  />
                }
                label="Manual Override"
              />
              <FormHelperText>Skip slab lookup, use fixed half-year tax</FormHelperText>
            </Grid>
            {!!ptForm.manual_override_enabled && (
              <Grid size={gridItem}>
                <TextField
                  label="Manual Half-Year Tax"
                  type="number"
                  value={ptForm.manual_override_half_tax ?? 0}
                  onChange={(e) => setPtForm({ ...ptForm, manual_override_half_tax: parseFloat(e.target.value) || 0 })}
                  fullWidth size="small" variant="outlined"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      )}

      {/* ── Save Button ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          size="small"
        >
          {loading ? 'Saving...' : 'Save Statutory Profiles'}
        </Button>
      </Box>
    </Box>
  );
}
