import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import automationServices from 'services/automation_services';
import templatesApi from '../templates/templatesApi';

const RULE_TEMPLATES = [
  {
    id: 'stage_to_task',
    label: 'Stage change → Create task',
  },
  {
    id: 'nofollowup_notify',
    label: 'No follow-up in N hours → Notify',
  },
  {
    id: 'drip_sequence',
    label: 'Stage change → Drip sequence (2 steps)',
  },
];

function asNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function AutomationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [templateId, setTemplateId] = useState(RULE_TEMPLATES[0].id);

  const [ruleName, setRuleName] = useState('');
  const [toStatusName, setToStatusName] = useState('Qualified');
  const [taskSubject, setTaskSubject] = useState('Follow up');
  const [taskDueHours, setTaskDueHours] = useState(24);

  const [noFollowupHours, setNoFollowupHours] = useState(24);
  const [notifyMessage, setNotifyMessage] = useState('No follow-up in 24h');

  const [templates, setTemplates] = useState([]);
  const [step1AfterHours, setStep1AfterHours] = useState(0);
  const [step1Channel, setStep1Channel] = useState('whatsapp');
  const [step1TemplateId, setStep1TemplateId] = useState('');
  const [step2AfterHours, setStep2AfterHours] = useState(24);
  const [step2Channel, setStep2Channel] = useState('email');
  const [step2TemplateId, setStep2TemplateId] = useState('');

  const templateOptionsByChannel = useMemo(() => {
    const groups = {whatsapp: [], email: []};
    (templates || []).forEach((t) => {
      if (t?.channel === 'whatsapp') groups.whatsapp.push(t);
      if (t?.channel === 'email') groups.email.push(t);
    });
    return groups;
  }, [templates]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await automationServices.listRules();
      setItems(res?.data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await templatesApi.list({page: 1, limit: 200, isActive: true});
      setTemplates(res?.data?.items || []);
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadRules();
    loadTemplates();
  }, []);

  const toggleRule = async (rule) => {
    if (!rule?.rule_id) return;
    if (rule.enabled) await automationServices.disableRule(rule.rule_id);
    else await automationServices.enableRule(rule.rule_id);
    await loadRules();
  };

  const openCreate = () => {
    setRuleName('');
    setTemplateId(RULE_TEMPLATES[0].id);
    setCreateOpen(true);
  };

  const buildPayload = () => {
    if (templateId === 'stage_to_task') {
      return {
        name: ruleName || 'Stage → Task',
        trigger_type: 'lead.status_changed',
        trigger_config: {toStatusName},
        actions: [
          {
            type: 'create_task',
            subject: taskSubject,
            dueInHours: asNumber(taskDueHours, 24),
          },
        ],
        enabled: true,
      };
    }

    if (templateId === 'nofollowup_notify') {
      return {
        name: ruleName || 'No follow-up → Notify',
        trigger_type: 'lead.no_followup_hours',
        trigger_config: {hours: asNumber(noFollowupHours, 24)},
        actions: [{type: 'notify_manager', message: notifyMessage}],
        enabled: true,
      };
    }

    if (templateId === 'drip_sequence') {
      const steps = [
        {
          afterHours: asNumber(step1AfterHours, 0),
          actionType: step1Channel === 'email' ? 'send_email' : 'send_whatsapp',
          payload: {templateId: step1TemplateId},
        },
        {
          afterHours: asNumber(step2AfterHours, 24),
          actionType: step2Channel === 'email' ? 'send_email' : 'send_whatsapp',
          payload: {templateId: step2TemplateId},
        },
      ].filter((s) => s.payload?.templateId);

      return {
        name: ruleName || 'Drip sequence',
        trigger_type: 'lead.status_changed',
        trigger_config: {toStatusName},
        actions: [{type: 'sequence', steps}],
        enabled: true,
      };
    }

    return null;
  };

  const createRule = async () => {
    const payload = buildPayload();
    if (!payload) return;
    await automationServices.createRule(payload);
    setCreateOpen(false);
    await loadRules();
  };

  const runNow = async () => {
    await automationServices.runNow();
    await loadRules();
  };

  return (
    <Box sx={{p: 2}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{fontWeight: 700}}>Automation</Typography>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Button variant="outlined" onClick={runNow} disabled={loading}>
            Run Now
          </Button>
          <Button variant="contained" onClick={openCreate}>
            New Rule
          </Button>
        </Box>
      </Box>

      <Box sx={{mt: 2, overflowX: 'auto'}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.rule_id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.trigger_type}</TableCell>
                <TableCell>
                  <Switch checked={!!r.enabled} onChange={() => toggleRule(r)} />
                </TableCell>
                <TableCell sx={{maxWidth: 520}}>
                  <Typography sx={{fontFamily: 'monospace', fontSize: 12}}>
                    {JSON.stringify(r.actions || [])}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">No rules yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Automation Rule</DialogTitle>
        <DialogContent>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
            <FormControl fullWidth size="small">
              <InputLabel>Template</InputLabel>
              <Select
                label="Template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {RULE_TEMPLATES.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Rule name"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              fullWidth
            />

            {(templateId === 'stage_to_task' || templateId === 'drip_sequence') && (
              <TextField
                size="small"
                label="When status changes to (name)"
                value={toStatusName}
                onChange={(e) => setToStatusName(e.target.value)}
                fullWidth
              />
            )}

            {templateId === 'stage_to_task' && (
              <>
                <TextField
                  size="small"
                  label="Task subject"
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Due in hours"
                  value={taskDueHours}
                  onChange={(e) => setTaskDueHours(e.target.value)}
                  fullWidth
                />
              </>
            )}

            {templateId === 'nofollowup_notify' && (
              <>
                <TextField
                  size="small"
                  type="number"
                  label="No follow-up for (hours)"
                  value={noFollowupHours}
                  onChange={(e) => setNoFollowupHours(e.target.value)}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Notification message"
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  fullWidth
                />
              </>
            )}

            {templateId === 'drip_sequence' && (
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2}}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                  <Typography sx={{fontWeight: 600}}>Step 1</Typography>
                  <TextField
                    size="small"
                    type="number"
                    label="After hours"
                    value={step1AfterHours}
                    onChange={(e) => setStep1AfterHours(e.target.value)}
                  />
                  <FormControl size="small">
                    <InputLabel>Channel</InputLabel>
                    <Select
                      label="Channel"
                      value={step1Channel}
                      onChange={(e) => setStep1Channel(e.target.value)}
                    >
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Template</InputLabel>
                    <Select
                      label="Template"
                      value={step1TemplateId}
                      onChange={(e) => setStep1TemplateId(e.target.value)}
                    >
                      {(templateOptionsByChannel[step1Channel] || []).map((t) => (
                        <MenuItem key={t.template_id} value={t.template_id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                  <Typography sx={{fontWeight: 600}}>Step 2</Typography>
                  <TextField
                    size="small"
                    type="number"
                    label="After hours"
                    value={step2AfterHours}
                    onChange={(e) => setStep2AfterHours(e.target.value)}
                  />
                  <FormControl size="small">
                    <InputLabel>Channel</InputLabel>
                    <Select
                      label="Channel"
                      value={step2Channel}
                      onChange={(e) => setStep2Channel(e.target.value)}
                    >
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Template</InputLabel>
                    <Select
                      label="Template"
                      value={step2TemplateId}
                      onChange={(e) => setStep2TemplateId(e.target.value)}
                    >
                      {(templateOptionsByChannel[step2Channel] || []).map((t) => (
                        <MenuItem key={t.template_id} value={t.template_id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={createRule} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

