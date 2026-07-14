import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import integrationsApi from './integrationsApi';

const WEBHOOK_EVENTS = [
  {key: 'lead.created', label: 'Lead Created'},
  {key: 'lead.status_changed', label: 'Lead Stage Changed'},
  {key: 'quotation.accepted', label: 'Quotation Accepted (future)'},
];

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function IntegrationsTab() {
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [createdApiKeyToken, setCreatedApiKeyToken] = useState('');

  const [webhooks, setWebhooks] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSelectedEvents, setWebhookSelectedEvents] = useState({});
  const [webhookIsActive, setWebhookIsActive] = useState(true);
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState('');

  const [calendarStatus, setCalendarStatus] = useState({google: false, microsoft: false});

  const webhookEventsPayload = useMemo(
    () =>
      WEBHOOK_EVENTS.filter((e) => webhookSelectedEvents[e.key]).map((e) => e.key),
    [webhookSelectedEvents],
  );

  const loadAll = async () => {
    try {
      const [keysRes, webhooksRes, calRes] = await Promise.all([
        integrationsApi.listApiKeys(),
        integrationsApi.listWebhooks(),
        integrationsApi.getCalendarStatus(),
      ]);
      setApiKeys(keysRes?.data?.items || []);
      setWebhooks(webhooksRes?.data?.items || []);
      setCalendarStatus(calRes?.data || {google: false, microsoft: false});
    } catch (err) {
      console.error(err);
      window.alert('Failed to load integrations settings.');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createApiKey = async () => {
    try {
      const res = await integrationsApi.createApiKey({name: apiKeyName});
      setCreatedApiKeyToken(res?.data?.token || '');
      setApiKeyDialogOpen(false);
      setApiKeyName('');
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to create API key.');
    }
  };

  const revokeApiKey = async (apiKeyId) => {
    if (!window.confirm('Revoke this API key?')) return;
    try {
      await integrationsApi.revokeApiKey(apiKeyId);
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to revoke API key.');
    }
  };

  const createWebhook = async () => {
    try {
      const res = await integrationsApi.createWebhook({
        url: webhookUrl,
        events: webhookEventsPayload,
        isActive: webhookIsActive,
      });
      setCreatedWebhookSecret(res?.data?.secret || '');
      setWebhookUrl('');
      setWebhookSelectedEvents({});
      setWebhookIsActive(true);
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to create webhook.');
    }
  };

  const toggleWebhookActive = async (w) => {
    try {
      await integrationsApi.updateWebhook(w.webhook_id, {isActive: !w.is_active});
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to update webhook.');
    }
  };

  const deleteWebhook = async (webhookId) => {
    if (!window.confirm('Delete this webhook?')) return;
    try {
      await integrationsApi.deleteWebhook(webhookId);
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to delete webhook.');
    }
  };

  const connectCalendar = async (provider) => {
    try {
      await integrationsApi.connectCalendar({provider, token: {connected: true}});
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to connect calendar (stub).');
    }
  };

  const disconnectCalendar = async (provider) => {
    try {
      await integrationsApi.disconnectCalendar(provider);
      await loadAll();
    } catch (err) {
      console.error(err);
      window.alert('Failed to disconnect calendar (stub).');
    }
  };

  const downloadInvoices = async () => {
    try {
      const res = await integrationsApi.downloadInvoicesCsv();
      downloadBlob(res.data, 'invoices.csv');
    } catch (err) {
      console.error(err);
      window.alert('Failed to download invoices CSV.');
    }
  };

  const downloadReceipts = async () => {
    try {
      const res = await integrationsApi.downloadReceiptsCsv();
      downloadBlob(res.data, 'receipts.csv');
    } catch (err) {
      console.error(err);
      window.alert('Failed to download receipts CSV.');
    }
  };

  return (
    <Box>
      <Typography sx={{fontWeight: 700}}>Integrations</Typography>

      <Box sx={{mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'}}>
          <Typography sx={{fontWeight: 600}}>API Keys</Typography>
          <Button variant="contained" onClick={() => setApiKeyDialogOpen(true)}>
            Create API Key
          </Button>
        </Box>

        <Box sx={{mt: 1}}>
          {(apiKeys || []).map((k) => (
            <Box
              key={k.api_key_id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                borderTop: '1px solid',
                borderColor: 'divider',
                pt: 1,
                mt: 1,
              }}
            >
              <Box>
                <Typography sx={{fontWeight: 600}}>{k.name || 'Untitled Key'}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Prefix: {k.key_prefix || '-'} | Status: {k.revoked_at ? 'revoked' : 'active'}
                </Typography>
              </Box>
              <Button
                color="error"
                variant="outlined"
                onClick={() => revokeApiKey(k.api_key_id)}
                disabled={!!k.revoked_at}
              >
                Revoke
              </Button>
            </Box>
          ))}
          {(!apiKeys || apiKeys.length === 0) && (
            <Typography color="text.secondary" sx={{mt: 1}}>
              No API keys yet.
            </Typography>
          )}
        </Box>
      </Box>

      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)} fullWidth>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="Name"
            value={apiKeyName}
            onChange={(e) => setApiKeyName(e.target.value)}
            sx={{mt: 1}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createApiKey} disabled={!apiKeyName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!createdApiKeyToken} onClose={() => setCreatedApiKeyToken('')} fullWidth>
        <DialogTitle>API Key Created</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2">
            Copy this key now. You won’t be able to see it again.
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={createdApiKeyToken}
            sx={{mt: 1}}
            InputProps={{readOnly: true}}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreatedApiKeyToken('')}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2}}>
        <Typography sx={{fontWeight: 600}}>Webhooks</Typography>

        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1}}>
          <TextField
            label="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            size="small"
            sx={{minWidth: 320, flex: 1}}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={webhookIsActive}
                onChange={(e) => setWebhookIsActive(e.target.checked)}
              />
            }
            label="Active"
          />
          <Button
            variant="contained"
            onClick={createWebhook}
            disabled={!webhookUrl.trim() || webhookEventsPayload.length === 0}
          >
            Add Webhook
          </Button>
        </Box>

        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1}}>
          {WEBHOOK_EVENTS.map((evt) => (
            <FormControlLabel
              key={evt.key}
              control={
                <Checkbox
                  checked={!!webhookSelectedEvents[evt.key]}
                  onChange={(e) =>
                    setWebhookSelectedEvents((prev) => ({
                      ...prev,
                      [evt.key]: e.target.checked,
                    }))
                  }
                />
              }
              label={evt.label}
            />
          ))}
        </Box>

        <Box sx={{mt: 1}}>
          {(webhooks || []).map((w) => (
            <Box
              key={w.webhook_id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                borderTop: '1px solid',
                borderColor: 'divider',
                pt: 1,
                mt: 1,
              }}
            >
              <Box>
                <Typography sx={{fontWeight: 600}}>{w.url}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Events: {(w.events || []).join(', ') || '-'} | Status:{' '}
                  {w.is_active ? 'active' : 'inactive'}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', gap: 1}}>
                <Button variant="outlined" onClick={() => toggleWebhookActive(w)}>
                  {w.is_active ? 'Disable' : 'Enable'}
                </Button>
                <Button color="error" variant="outlined" onClick={() => deleteWebhook(w.webhook_id)}>
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
          {(!webhooks || webhooks.length === 0) && (
            <Typography color="text.secondary" sx={{mt: 1}}>
              No webhooks yet.
            </Typography>
          )}
        </Box>
      </Box>

      <Dialog open={!!createdWebhookSecret} onClose={() => setCreatedWebhookSecret('')} fullWidth>
        <DialogTitle>Webhook Created</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2">
            Save this webhook secret now (used to verify signatures).
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={createdWebhookSecret}
            sx={{mt: 1}}
            InputProps={{readOnly: true}}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setCreatedWebhookSecret('')}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2}}>
        <Typography sx={{fontWeight: 600}}>Calendar (stub)</Typography>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1}}>
          <Button
            variant="outlined"
            onClick={() =>
              calendarStatus.google ? disconnectCalendar('google') : connectCalendar('google')
            }
          >
            {calendarStatus.google ? 'Disconnect Google' : 'Connect Google'}
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              calendarStatus.microsoft
                ? disconnectCalendar('microsoft')
                : connectCalendar('microsoft')
            }
          >
            {calendarStatus.microsoft ? 'Disconnect Microsoft' : 'Connect Microsoft'}
          </Button>
        </Box>
      </Box>

      <Box sx={{mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2}}>
        <Typography sx={{fontWeight: 600}}>Accounting CSV Export</Typography>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1}}>
          <Button variant="outlined" onClick={downloadInvoices}>
            Download invoices.csv
          </Button>
          <Button variant="outlined" onClick={downloadReceipts}>
            Download receipts.csv
          </Button>
        </Box>
        <Typography color="text.secondary" variant="body2" sx={{mt: 1}}>
          CSV shape is designed for a lightweight accounting bridge (no provider sync yet).
        </Typography>
      </Box>
    </Box>
  );
}
