import MaterialTable from 'utils/SafeMaterialTable';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { FailLoad, ListLoad } from 'redux/actions/load';
import integrationsApi from '../integrationsApi';

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  );
};

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const maskSecretPreview = (value) => {
  if (!value) return 'â€”';

  const text = String(value).trim();
  if (!text) return 'â€”';
  if (text.includes('*')) return text;

  if (text.length <= 4) return '****';
  return `****${text.slice(-4)}`;
};

const normalizeStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'disabled') return 'Disabled';
  return value || '-';
};

const resolveOneTimeSecret = (payload) => {
  return (
    payload?.secret_once ||
    payload?.webhook_secret_once ||
    payload?.secret ||
    payload?.data?.secret_once ||
    payload?.data?.secret ||
    ''
  );
};

const resolveCallbackBaseHint = (payload) => {
  return (
    payload?.callback_base_hint ||
    payload?.callbackBaseHint ||
    payload?.callback_base_url ||
    payload?.data?.callback_base_hint ||
    payload?.data?.callback_base_url ||
    ''
  );
};

const resolveWebhookId = (payload) => {
  return (
    payload?.webhook_id ||
    payload?.webhookId ||
    payload?.id ||
    payload?.data?.webhook_id ||
    payload?.data?.id ||
    ''
  );
};

const resolveDocsUrl = (payload) => {
  return (
    payload?.docs_url ||
    payload?.documentation_url ||
    payload?.data?.docs_url ||
    payload?.data?.documentation_url ||
    '/crm/settings/integrations'
  );
};

const resolveSecretPreviewSource = (item) => {
  return (
    item?.secret_preview ||
    item?.masked_secret ||
    item?.webhook_secret_preview ||
    item?.secret ||
    item?.webhook_secret ||
    ''
  );
};

const buildCallbackUrl = (callbackBaseHint, webhookId) => {
  const idText = String(webhookId || '').trim();
  if (!idText) return callbackBaseHint || '';

  const baseHint = String(callbackBaseHint || '').trim();
  if (!baseHint) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/leadsservice/api/webhooks/${encodeURIComponent(idText)}`;
  }

  if (baseHint.includes(':webhook_id')) {
    return baseHint.replace(':webhook_id', encodeURIComponent(idText));
  }

  if (baseHint.includes('{webhook_id}')) {
    return baseHint.replace('{webhook_id}', encodeURIComponent(idText));
  }

  if (baseHint.endsWith('/')) {
    return `${baseHint}${encodeURIComponent(idText)}`;
  }

  return `${baseHint}/${encodeURIComponent(idText)}`;
};

const copyText = async (value) => {
  if (!value) return;

  if (navigator?.clipboard?.writeText && window?.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const tempInput = document.createElement('textarea');
  tempInput.value = value;
  tempInput.style.position = 'fixed';
  tempInput.style.opacity = '0';
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
};

export default function IntegrationsWebhooksAdminPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [oneTimeSecretDialogOpen, setOneTimeSecretDialogOpen] = useState(false);
  const [oneTimeSecretValue, setOneTimeSecretValue] = useState('');
  const [oneTimeWebhookId, setOneTimeWebhookId] = useState('');
  const [oneTimeCallbackBaseHint, setOneTimeCallbackBaseHint] = useState('');
  const [oneTimeDocsUrl, setOneTimeDocsUrl] = useState('/crm/settings/integrations');
  const [copiedAcknowledge, setCopiedAcknowledge] = useState(false);

  const [disableDialog, setDisableDialog] = useState({
    open: false,
    row: null,
    loading: false,
    error: '',
  });

  const [curlDrawerOpen, setCurlDrawerOpen] = useState(false);

  const tableRows = useMemo(() => {
    return (rows || []).map((item, index) => ({
      ...item,
      __rowId:
        item?.webhook_id ||
        item?.webhookId ||
        item?.id ||
        item?.webhook_endpoint_id ||
        `webhook_${index + 1}`,
      __name: item?.name || item?.webhook_name || `Webhook ${index + 1}`,
      __webhookId: item?.webhook_id || item?.webhookId || item?.id || '-',
      __status: normalizeStatus(item?.status),
      __createdAt: item?.createdAt || item?.created_at || null,
      __maskedSecret: maskSecretPreview(resolveSecretPreviewSource(item)),
    }));
  }, [rows]);

  const callbackUrlForCurl = useMemo(() => {
    return buildCallbackUrl(oneTimeCallbackBaseHint, oneTimeWebhookId || '<webhook_id>');
  }, [oneTimeCallbackBaseHint, oneTimeWebhookId]);

  const sampleCurl = useMemo(() => {
    const payload = JSON.stringify(
      {
        event_type: 'lead.create',
        source_system: 'website_form',
        external_event_id: 'evt_12345',
        person: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+15551234567',
        },
      },
      null,
      2,
    );

    return [
      `curl -X POST '${callbackUrlForCurl}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -H 'X-Signature: <HMAC_SHA256(secret, raw_body)>' \\`,
      `  -d '${payload.replace(/\n/g, '\\n')}'`,
    ].join('\n');
  }, [callbackUrlForCurl]);

  const loadWebhooks = async () => {
    setLoading(true);
    setErrorMessage('');
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    try {
      const response = await integrationsApi.listWebhooks();
      setRows(getItems(response?.data || response));
    } catch (error) {
      setRows([]);
      setErrorMessage(getErrorMessage(error, 'Unable to load webhooks'));
    } finally {
      setLoading(false);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const openCreateDialog = () => {
    setCreateName('');
    setCreateError('');
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateDialogOpen(false);
    setCreateError('');
    setCreateName('');
  };

  const handleCreateWebhook = async () => {
    const trimmedName = String(createName || '').trim();
    if (!trimmedName) {
      setCreateError('Name is required');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await integrationsApi.createWebhook({ name: trimmedName });
      const responseData = response?.data || response;

      const secretOnce = resolveOneTimeSecret(responseData);
      const webhookId = resolveWebhookId(responseData);
      const callbackBaseHint = resolveCallbackBaseHint(responseData);

      dispatch(
        OpenalertActions({
          msg: 'Webhook created',
          severity: 'success',
        }),
      );

      setCreateDialogOpen(false);
      setCreateName('');
      setCreateError('');

      setOneTimeSecretValue(String(secretOnce || ''));
      setOneTimeWebhookId(String(webhookId || ''));
      setOneTimeCallbackBaseHint(String(callbackBaseHint || ''));
      setOneTimeDocsUrl(resolveDocsUrl(responseData));
      setCopiedAcknowledge(false);
      setOneTimeSecretDialogOpen(true);

      await loadWebhooks();
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create webhook'));
    } finally {
      setCreating(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await copyText(oneTimeSecretValue);
      dispatch(
        OpenalertActions({
          msg: 'Secret copied to clipboard',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy secret'),
          severity: 'error',
        }),
      );
    }
  };

  const closeOneTimeSecretDialog = () => {
    if (!copiedAcknowledge) return;
    setOneTimeSecretDialogOpen(false);
    setOneTimeSecretValue('');
    setOneTimeWebhookId('');
    setOneTimeCallbackBaseHint('');
    setCopiedAcknowledge(false);
  };

  const openDisableDialog = (row) => {
    setDisableDialog({
      open: true,
      row,
      loading: false,
      error: '',
    });
  };

  const closeDisableDialog = () => {
    if (disableDialog.loading) return;
    setDisableDialog({
      open: false,
      row: null,
      loading: false,
      error: '',
    });
  };

  const handleDisableWebhook = async () => {
    const webhookId = disableDialog?.row?.webhook_id || disableDialog?.row?.webhookId || disableDialog?.row?.id;
    if (!webhookId) return;

    setDisableDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      await integrationsApi.disableWebhook(webhookId);

      dispatch(
        OpenalertActions({
          msg: 'Webhook disabled',
          severity: 'success',
        }),
      );

      closeDisableDialog();
      await loadWebhooks();
    } catch (error) {
      setDisableDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to disable webhook'),
      }));
    }
  };

  const handleCopyCurl = async () => {
    try {
      await copyText(sampleCurl);
      dispatch(
        OpenalertActions({
          msg: 'Sample curl copied to clipboard',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy sample curl'),
          severity: 'error',
        }),
      );
    }
  };

  const columns = [
    {
      title: 'Name',
      field: '__name',
      render: (rowData) => rowData?.__name || '-',
    },
    {
      title: 'Webhook ID',
      field: '__webhookId',
      render: (rowData) => String(rowData?.__webhookId || '-'),
    },
    {
      title: 'Secret Preview',
      field: '__maskedSecret',
      render: (rowData) => rowData?.__maskedSecret || 'â€”',
    },
    {
      title: 'Status',
      field: '__status',
      render: (rowData) => rowData?.__status || '-',
    },
    {
      title: 'Created At',
      field: '__createdAt',
      render: (rowData) => {
        if (!rowData?.__createdAt) return '-';
        const parsed = moment(rowData.__createdAt);
        return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : rowData.__createdAt;
      },
    },
    {
      title: 'Actions',
      field: 'actions',
      sorting: false,
      render: (rowData) => {
        const isDisabled = String(rowData?.status || rowData?.__status || '').toLowerCase() === 'disabled';

        return (
          <Button
            size='small'
            color='error'
            variant='outlined'
            startIcon={<BlockIcon />}
            disabled={isDisabled}
            onClick={() => openDisableDialog(rowData)}
          >
            Disable
          </Button>
        );
      },
    },
  ];

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems='center' justifyContent='space-between'>
          <Grid>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              Webhooks
            </Typography>
            <Typography color='text.secondary'>
              Manage inbound webhook endpoints and rotate secrets securely.
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' startIcon={<TerminalIcon />} onClick={() => setCurlDrawerOpen(true)}>
                Sample curl
              </Button>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadWebhooks} disabled={loading}>
                Refresh
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                Create Webhook
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      {errorMessage ? (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Typography color='error' sx={{ mb: 1 }}>
              {errorMessage}
            </Typography>
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadWebhooks}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MaterialTable
          title=''
          columns={columns}
          data={tableRows}
          isLoading={loading}
          options={{
            search: false,
            paging: true,
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            minBodyHeight: '28vh',
            headerStyle: {
              position: 'sticky',
              top: 0,
              zIndex: 1,
            },
          }}
          localization={{
            body: {
              emptyDataSourceMessage: 'No webhooks configured yet.',
            },
          }}
        />
      )}
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Create Webhook</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            fullWidth
            label='Webhook name'
            variant='filled'
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            autoFocus
            disabled={creating}
          />
          {createError ? (
            <Typography color='error' sx={{ mt: 1 }}>
              {createError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} disabled={creating}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleCreateWebhook} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={oneTimeSecretDialogOpen}
        fullWidth
        maxWidth='md'
        disableEscapeKeyDown
        onClose={(_event, reason) => {
          if (reason === 'backdropClick') return;
          closeOneTimeSecretDialog();
        }}
      >
        <DialogTitle>Copy Webhook Secret</DialogTitle>
        <DialogContent>
          <Typography color='warning.main' sx={{ mb: 1, fontWeight: 600 }}>
            This secret will not be shown again.
          </Typography>

          <Typography sx={{ mb: 0.5 }}>
            <b>Webhook ID:</b> {oneTimeWebhookId || '-'}
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
            <b>Callback Base URL hint:</b> {oneTimeCallbackBaseHint || window.location.origin}
          </Typography>

          <Card variant='outlined' sx={{ p: 2, backgroundColor: '#f7f7f7' }}>
            <Typography
              component='pre'
              sx={{
                mb: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
              }}
            >
              {oneTimeSecretValue || 'No secret returned by backend.'}
            </Typography>
          </Card>

          <Typography sx={{ mt: 1.5, fontFamily: 'monospace', fontSize: '0.9rem' }}>
            Signature: HMAC SHA256 of raw body using webhook secret.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<ContentCopyIcon />}
              onClick={handleCopySecret}
              disabled={!oneTimeSecretValue}
            >
              Copy secret
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={copiedAcknowledge}
                  onChange={(event) => setCopiedAcknowledge(event.target.checked)}
                />
              }
              label='I copied it'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={closeOneTimeSecretDialog} disabled={!copiedAcknowledge}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={disableDialog.open} onClose={closeDisableDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Disable Webhook</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to disable <b>{disableDialog?.row?.__name || 'this webhook'}</b>?
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 1 }}>
            Disabled webhooks will stop accepting inbound events.
          </Typography>
          {disableDialog.error ? <Typography color='error'>{disableDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDisableDialog} disabled={disableDialog.loading}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleDisableWebhook} disabled={disableDialog.loading}>
            {disableDialog.loading ? 'Disabling...' : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer anchor='right' open={curlDrawerOpen} onClose={() => setCurlDrawerOpen(false)}>
        <Box sx={{ width: 460, p: 2.5 }}>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
            Sample curl
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 1.5 }}>
            Use this as a starting point for webhook testing.
          </Typography>

          <Card variant='outlined' sx={{ p: 1.5, backgroundColor: '#f7f7f7' }}>
            <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
              {sampleCurl}
            </Typography>
          </Card>

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyCurl}>
              Copy curl
            </Button>
            <Button variant='outlined' component='a' href={oneTimeDocsUrl} target='_blank' rel='noopener noreferrer'>
              Payload docs
            </Button>
          </Box>

          <Typography sx={{ mt: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
            Header format: X-Signature = HMAC_SHA256(secret, raw_body)
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
}

