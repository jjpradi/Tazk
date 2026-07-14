import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import crmConfigServices from 'services/crm_config_services';
import leadManagementServices from 'services/leadManagement_services';
import dealsServices from 'services/deals_services';
import IntegrationsTab from './integrations/IntegrationsTab';

function TabPanel({value, index, children}) {
  if (value !== index) return null;
  return <Box sx={{pt: 2}}>{children}</Box>;
}

function normalizeOptions(input) {
  return (input || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CrmSettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isIntegrationsRoute = location.pathname === '/crm/settings/integrations';
  const [tab, setTab] = useState(isIntegrationsRoute ? 2 : 0);
  const [entityType, setEntityType] = useState('lead');

  const [fields, setFields] = useState([]);
  const [rules, setRules] = useState([]);

  const [stages, setStages] = useState([]); // [{key,label}]
  const [selectedStageKey, setSelectedStageKey] = useState('');

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldActive, setFieldActive] = useState(true);

  const mandatoryFieldIdSet = useMemo(() => {
    const set = new Set();
    rules
      .filter(
        (r) =>
          r.entity_type === entityType &&
          String(r.stage_key) === String(selectedStageKey) &&
          r.is_mandatory,
      )
      .forEach((r) => set.add(String(r.field_id)));
    return set;
  }, [rules, entityType, selectedStageKey]);

  const [selectedMandatory, setSelectedMandatory] = useState({});

  useEffect(() => {
    const next = {};
    fields.forEach((f) => {
      next[String(f.field_id)] = mandatoryFieldIdSet.has(String(f.field_id));
    });
    setSelectedMandatory(next);
  }, [fields, mandatoryFieldIdSet]);

  const loadFields = async () => {
    const res = await crmConfigServices.listCustomFields(entityType);
    setFields(res?.data?.items || []);
  };

  const loadRules = async () => {
    const res = await crmConfigServices.listStageFieldRules(entityType);
    setRules(res?.data?.items || []);
  };

  const loadStages = async () => {
    if (entityType === 'lead') {
      const res = await leadManagementServices.getStatus();
      const list = Array.isArray(res?.data) ? res.data : [];
      const items = list.map((s) => ({
        key: s.status_name,
        label: s.status_name,
      }));
      setStages(items);
      setSelectedStageKey(items[0]?.key || '');
      return;
    }

    const res = await dealsServices.getPipelines();
    const pipelines = res?.data || [];
    const first = pipelines?.[0];
    const st = (first?.stages || []).map((s) => ({
      key: String(s.stage_id),
      label: s.name,
    }));
    setStages(st);
    setSelectedStageKey(st[0]?.key || '');
  };

  useEffect(() => {
    loadFields();
    loadRules();
    loadStages();
  }, [entityType]);

  useEffect(() => {
    if (isIntegrationsRoute) setTab(2);
  }, [isIntegrationsRoute]);

  const openCreateField = () => {
    setEditingField(null);
    setFieldLabel('');
    setFieldType('text');
    setFieldOptions('');
    setFieldActive(true);
    setFieldDialogOpen(true);
  };

  const openEditField = (f) => {
    setEditingField(f);
    setFieldLabel(f.label || '');
    setFieldType(f.field_type || 'text');
    setFieldOptions(Array.isArray(f.options) ? f.options.join(', ') : '');
    setFieldActive(!!f.is_active);
    setFieldDialogOpen(true);
  };

  const saveField = async () => {
    const payload = {
      entity_type: entityType,
      label: fieldLabel,
      field_type: fieldType,
      options: fieldType === 'select' ? normalizeOptions(fieldOptions) : undefined,
      is_active: fieldActive,
    };

    if (editingField?.field_id) {
      await crmConfigServices.updateCustomField(editingField.field_id, payload);
    } else {
      await crmConfigServices.createCustomField(payload);
    }

    setFieldDialogOpen(false);
    await loadFields();
  };

  const deleteField = async (f) => {
    if (!f?.field_id) return;
    if (!window.confirm(`Delete custom field "${f.label}"?`)) return;
    await crmConfigServices.deleteCustomField(f.field_id);
    await loadFields();
    await loadRules();
  };

  const saveStageRules = async () => {
    if (!selectedStageKey) return;
    const mandatoryFieldIds = Object.entries(selectedMandatory)
      .filter(([, v]) => !!v)
      .map(([k]) => Number(k))
      .filter((n) => Number.isFinite(n) && n > 0);

    await crmConfigServices.setStageFieldRules({
      entityType,
      stageKey: String(selectedStageKey),
      mandatoryFieldIds,
    });

    await loadRules();
  };

  return (
    <Box sx={{p: 2}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
        <Typography sx={{fontWeight: 700}}>CRM Settings</Typography>
        <FormControl size="small" sx={{minWidth: 200}}>
          <InputLabel>Entity</InputLabel>
          <Select
            label="Entity"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <MenuItem value="lead">Leads</MenuItem>
            <MenuItem value="deal">Deals</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          navigate(v === 2 ? '/crm/settings/integrations' : '/crm/settings');
        }}
        sx={{mt: 1}}
      >
        <Tab label="Custom Fields" />
        <Tab label="Mandatory by Stage" />
        <Tab label="Integrations" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
          <Typography color="text.secondary">
            Add fields that appear in {entityType === 'lead' ? 'Lead' : 'Deal'} forms.
          </Typography>
          <Button variant="contained" onClick={openCreateField}>
            Add Field
          </Button>
        </Box>

        <Box sx={{mt: 2}}>
          {fields.map((f) => (
            <Box
              key={f.field_id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
                mb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography sx={{fontWeight: 600}}>{f.label}</Typography>
                <Typography color="text.secondary" sx={{fontSize: 12}}>
                  {f.field_type} · {f.is_active ? 'active' : 'inactive'}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', gap: 1}}>
                <Button size="small" onClick={() => openEditField(f)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => deleteField(f)}>
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
          {!fields.length && (
            <Typography color="text.secondary" sx={{mt: 2}}>
              No custom fields yet.
            </Typography>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'}}>
          <FormControl size="small" sx={{minWidth: 260}}>
            <InputLabel>Stage</InputLabel>
            <Select
              label="Stage"
              value={selectedStageKey}
              onChange={(e) => setSelectedStageKey(e.target.value)}
            >
              {stages.map((s) => (
                <MenuItem key={s.key} value={s.key}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={saveStageRules} disabled={!selectedStageKey}>
            Save Rules
          </Button>
        </Box>

        <Box sx={{mt: 2}}>
          {fields.map((f) => (
            <Box
              key={f.field_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography sx={{fontWeight: 600}}>{f.label}</Typography>
                <Typography color="text.secondary" sx={{fontSize: 12}}>
                  {f.field_type}
                </Typography>
              </Box>
              <Checkbox
                checked={!!selectedMandatory[String(f.field_id)]}
                onChange={(e) =>
                  setSelectedMandatory((p) => ({
                    ...p,
                    [String(f.field_id)]: e.target.checked,
                  }))
                }
              />
            </Box>
          ))}
          {!fields.length && (
            <Typography color="text.secondary" sx={{mt: 2}}>
              Add custom fields first.
            </Typography>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <IntegrationsTab />
      </TabPanel>

      <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingField ? 'Edit Field' : 'Add Field'}</DialogTitle>
        <DialogContent>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
            <TextField
              size="small"
              label="Label"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="select">Select</MenuItem>
              </Select>
            </FormControl>

            {fieldType === 'select' && (
              <TextField
                size="small"
                label="Options (comma-separated)"
                value={fieldOptions}
                onChange={(e) => setFieldOptions(e.target.value)}
                fullWidth
              />
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                label="Active"
                value={fieldActive ? 'true' : 'false'}
                onChange={(e) => setFieldActive(e.target.value === 'true')}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={saveField} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
