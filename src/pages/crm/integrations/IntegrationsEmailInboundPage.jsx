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
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { FailLoad, ListLoad } from 'redux/actions/load';
import integrationsApi from './integrationsApi';

const PROVIDER_OPTIONS = [
  { value: 'generic', label: 'Generic' },
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'ses', label: 'SES' },
  { value: 'gmail_forward', label: 'Gmail Forward' },
];

const PROVIDER_LABEL_BY_VALUE = PROVIDER_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

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

const normalizeStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'disabled') return 'Disabled';
  return value || '-';
};

const resolveEmailInboundId = (item) => {
  return item?.email_inbound_id || item?.emailInboundId || item?.id || '';
};

const resolveProvider = (item) => {
  return (
    item?.provider ||
    item?.provider_name ||
    item?.providerName ||
    'generic'
  );
};

const resolveAllowedAddressesRaw = (item) => {
  return (
    item?.allowed_to_addresses ||
    item?.allowedToAddresses ||
    item?.allowed_to ||
    item?.allowedAddresses ||
    ''
  );
};

const parseAddresses = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatAllowedAddresses = (item) => {
  const addresses = parseAddresses(resolveAllowedAddressesRaw(item));
  if (!addresses.length) return '-';
  return addresses.join(', ');
};

const resolveSecretOnce = (payload) => {
  return (
    payload?.secret_once ||
    payload?.webhook_secret_once ||
    payload?.secret ||
    payload?.data?.secret_once ||
    payload?.data?.secret ||
    ''
  );
};

const resolveCallbackUrl = (payload) => {
  return (
    payload?.callback_url ||
    payload?.post_url ||
    payload?.callbackUrl ||
    payload?.data?.callback_url ||
    payload?.data?.post_url ||
    payload?.data?.callbackUrl ||
    ''
  );
};

const resolveHeadersHint = (payload) => {
  const headers = payload?.recommended_headers || payload?.data?.recommended_headers;
  if (Array.isArray(headers) && headers.length) {
    return headers.join(', ');
  }

  return 'Use either X-Signature or X-Api-Key header.';
};

const resolveWebhookId = (payload) => {
  return (
    payload?.webhook_id ||
    payload?.webhookId ||
    payload?.webhook_endpoint_id ||
    payload?.data?.webhook_id ||
    payload?.data?.webhook_endpoint_id ||
    ''
  );
};

const resolveCallbackPath = (payload) => {
  return (
    payload?.callback_path ||
    payload?.data?.callback_path ||
    ''
  );
};

const buildFallbackCallbackUrl = (item) => {
  const directUrl = resolveCallbackUrl(item);
  if (directUrl) return String(directUrl);

  const callbackPath = resolveCallbackPath(item);
  if (!callbackPath) return '';

  if (/^https?:\/\//i.test(callbackPath)) return callbackPath;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!callbackPath.startsWith('/')) {
    return `${origin}/${callbackPath}`;
  }
  if (callbackPath.startsWith('/leadsservice/')) {
    return `${origin}${callbackPath}`;
  }
  return `${origin}/leadsservice/api${callbackPath}`;
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

const buildCurlSample = (callbackUrl) => {
  const safeCallbackUrl = callbackUrl || '<callback_url>';

  const payload = `{
  "message_id":"<abc123@example.com>",
  "from": {"email":"alice@example.com","name":"Alice"},
  "to": [{"email":"sales@yourco.com"}],
  "subject":"Need product pricing",
  "text":"Hi team, please share pricing.",
  "html":"<p>Hi team, please share pricing.</p>",
  "received_at":"2026-02-21T10:25:00Z"
}`;

  return [
    `curl -X POST '${safeCallbackUrl}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -H 'X-Signature: <HMAC_SHA256(secret, raw_body)>' \\`,
    `  -d '${payload.replace(/\n/g, '\\n')}'`,
  ].join('\n');
};

export default function IntegrationsEmailInboundPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createValues, setCreateValues] = useState({
    provider: 'generic',
    allowed_to_addresses: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [oneTimeSecretDialogOpen, setOneTimeSecretDialogOpen] = useState(false);
  const [oneTimeSecret, setOneTimeSecret] = useState('');
  const [oneTimeCallbackUrl, setOneTimeCallbackUrl] = useState('');
  const [oneTimeProvider, setOneTimeProvider] = useState('');
  const [oneTimeHeadersHint, setOneTimeHeadersHint] = useState('');
  const [copiedAcknowledge, setCopiedAcknowledge] = useState(false);

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    row: null,
    targetStatus: 'disabled',
    loading: false,
    error: '',
  });

  const [rotateDialog, setRotateDialog] = useState({
    open: false,
    row: null,
    loading: false,
    error: '',
  });

  const tableRows = useMemo(() => {
    return (rows || []).map((item, index) => {
      const providerValue = String(resolveProvider(item) || 'generic').toLowerCase();
      const allowedAddresses = formatAllowedAddresses(item);
      return {
        ...item,
        __rowId: resolveEmailInboundId(item) || `email_inbound_${index + 1}`,
        __providerValue: providerValue,
        __provider: PROVIDER_LABEL_BY_VALUE[providerValue] || providerValue || '-',
        __status: normalizeStatus(item?.status),
        __allowedAddresses: allowedAddresses,
        __createdAt: item?.createdAt || item?.created_at || null,
        __callbackUrl: buildFallbackCallbackUrl(item),
      };
    });
  }, [rows]);

  const callbackUrlForInstructions = useMemo(() => {
    return oneTimeCallbackUrl || tableRows[0]?.__callbackUrl || '';
  }, [oneTimeCallbackUrl, tableRows]);

  const curlSample = useMemo(() => {
    return buildCurlSample(callbackUrlForInstructions);
  }, [callbackUrlForInstructions]);

  const loadEmailInbound = async () => {
    setLoading(true);
    setErrorMessage('');
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    try {
      const response = await integrationsApi.listEmailInbound();
      setRows(getItems(response?.data || response));
    } catch (error) {
      setRows([]);
      setErrorMessage(getErrorMessage(error, 'Unable to load email inbound integrations'));
    } finally {
      setLoading(false);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  useEffect(() => {
    loadEmailInbound();
  }, []);

  const openCreateDialog = () => {
    setCreateValues({
      provider: 'generic',
      allowed_to_addresses: '',
    });
    setCreateError('');
    setCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateDialogOpen(false);
    setCreateError('');
  };

  const handleCreate = async () => {
    const provider = String(createValues.provider || '').trim().toLowerCase();
    if (!provider) {
      setCreateError('Provider is required');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const addresses = parseAddresses(createValues.allowed_to_addresses);
      const payload = {
        provider,
        allowed_to_addresses: addresses.join(','),
      };

      const response = await integrationsApi.createEmailInbound(payload);
      const responseData = response?.data || response;

      const callbackUrl = String(resolveCallbackUrl(responseData) || '');
      const secretOnce = String(resolveSecretOnce(responseData) || '');
      const headersHint = resolveHeadersHint(responseData);
      const webhookId = resolveWebhookId(responseData);
      const callbackPath = resolveCallbackPath(responseData);

      const fallbackUrl = callbackUrl
        ? callbackUrl
        : buildFallbackCallbackUrl({
            callback_path: callbackPath,
            webhook_id: webhookId,
          });

      setOneTimeProvider(provider);
      setOneTimeCallbackUrl(fallbackUrl);
      setOneTimeSecret(secretOnce);
      setOneTimeHeadersHint(headersHint);
      setCopiedAcknowledge(false);
      setOneTimeSecretDialogOpen(true);

      dispatch(
        OpenalertActions({
          msg: 'Email inbound integration created',
          severity: 'success',
        }),
      );

      closeCreateDialog();
      await loadEmailInbound();
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create email inbound integration'));
    } finally {
      setCreating(false);
    }
  };

  const closeOneTimeSecretDialog = () => {
    if (!copiedAcknowledge) return;
    setOneTimeSecretDialogOpen(false);
    setOneTimeSecret('');
    setOneTimeCallbackUrl('');
    setOneTimeProvider('');
    setOneTimeHeadersHint('');
    setCopiedAcknowledge(false);
  };

  const handleCopySecret = async () => {
    try {
      await copyText(oneTimeSecret);
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

  const openStatusDialog = (row) => {
    const currentStatus = String(row?.status || row?.__status || '').toLowerCase();
    const targetStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    setStatusDialog({
      open: true,
      row,
      targetStatus,
      loading: false,
      error: '',
    });
  };

  const closeStatusDialog = () => {
    if (statusDialog.loading) return;
    setStatusDialog({
      open: false,
      row: null,
      targetStatus: 'disabled',
      loading: false,
      error: '',
    });
  };

  const handleUpdateStatus = async () => {
    const emailInboundId = resolveEmailInboundId(statusDialog.row);
    if (!emailInboundId) return;

    setStatusDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      await integrationsApi.updateEmailInbound(emailInboundId, {
        status: statusDialog.targetStatus,
      });

      dispatch(
        OpenalertActions({
          msg: statusDialog.targetStatus === 'active' ? 'Integration enabled' : 'Integration disabled',
          severity: 'success',
        }),
      );

      closeStatusDialog();
      await loadEmailInbound();
    } catch (error) {
      setStatusDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to update integration status'),
      }));
    }
  };

  const openRotateDialog = (row) => {
    setRotateDialog({
      open: true,
      row,
      loading: false,
      error: '',
    });
  };

  const closeRotateDialog = () => {
    if (rotateDialog.loading) return;
    setRotateDialog({
      open: false,
      row: null,
      loading: false,
      error: '',
    });
  };

  const handleRotateSecret = async () => {
    const emailInboundId = resolveEmailInboundId(rotateDialog.row);
    if (!emailInboundId) return;

    setRotateDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      const response = await integrationsApi.updateEmailInbound(emailInboundId, {
        rotate_secret: 1,
      });
      const responseData = response?.data || response;

      const callbackUrl = String(resolveCallbackUrl(responseData) || rotateDialog.row?.__callbackUrl || '');
      const secretOnce = String(resolveSecretOnce(responseData) || '');
      const headersHint = resolveHeadersHint(responseData);

      setOneTimeProvider(String(rotateDialog.row?.__providerValue || 'generic'));
      setOneTimeCallbackUrl(callbackUrl);
      setOneTimeSecret(secretOnce);
      setOneTimeHeadersHint(headersHint);
      setCopiedAcknowledge(false);
      setOneTimeSecretDialogOpen(true);

      dispatch(
        OpenalertActions({
          msg: 'Secret rotated',
          severity: 'success',
        }),
      );

      closeRotateDialog();
      await loadEmailInbound();
    } catch (error) {
      setRotateDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to rotate secret'),
      }));
    }
  };

  const handleCopyCurl = async () => {
    try {
      await copyText(curlSample);
      dispatch(
        OpenalertActions({
          msg: 'cURL sample copied',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy cURL sample'),
          severity: 'error',
        }),
      );
    }
  };

  const columns = [
    {
      title: 'Provider',
      field: '__provider',
      render: (rowData) => rowData?.__provider || '-',
    },
    {
      title: 'Status',
      field: '__status',
      render: (rowData) => rowData?.__status || '-',
    },
    {
      title: 'Allowed To Addresses',
      field: '__allowedAddresses',
      render: (rowData) => (
        <Typography
          variant='body2'
          sx={{
            maxWidth: 420,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={rowData?.__allowedAddresses || ''}
        >
          {rowData?.__allowedAddresses || '-'}
        </Typography>
      ),
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
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size='small'
              variant='outlined'
              color={isDisabled ? 'success' : 'error'}
              startIcon={isDisabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
              onClick={() => openStatusDialog(rowData)}
            >
              {isDisabled ? 'Enable' : 'Disable'}
            </Button>

            <Button
              size='small'
              variant='outlined'
              startIcon={<VpnKeyIcon />}
              onClick={() => openRotateDialog(rowData)}
            >
              Rotate Secret
            </Button>
          </Box>
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
              Email Inbound
            </Typography>
            <Typography color='text.secondary'>
              Configure inbound email webhooks and provider payload handling.
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadEmailInbound} disabled={loading}>
                Refresh
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                Create Email Inbound
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      {errorMessage ? (
        <Card sx={{ p: 2, mb: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Typography color='error' sx={{ mb: 1 }}>
              {errorMessage}
            </Typography>
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadEmailInbound}>
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
              emptyDataSourceMessage: 'No email inbound integrations configured yet.',
            },
          }}
        />
      )}
      <Card sx={{ p: 2, mt: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
          Provider Setup Instructions
        </Typography>

        <Typography color='text.secondary'>1. Configure your provider to send webhook POST requests.</Typography>
        <Typography color='text.secondary'>2. Use the callback URL from this page.</Typography>
        <Typography color='text.secondary'>3. Send normalized JSON payload and include signature/api key headers.</Typography>
        <Typography color='text.secondary' sx={{ mb: 1.5 }}>
          4. Test using cURL before enabling production traffic.
        </Typography>

        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Headers</Typography>
        <Card variant='outlined' sx={{ p: 1.5, mb: 1.5, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.84rem', whiteSpace: 'pre-wrap' }}>
{`Option A: X-Signature: <HMAC_SHA256(secret, raw_body)>
Option B: X-Api-Key: <api_key_plaintext>`}
          </Typography>
        </Card>

        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Normalized JSON Payload Example</Typography>
        <Card variant='outlined' sx={{ p: 1.5, mb: 1.5, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
{`{
  "message_id":"<abc123@example.com>",
  "from": {"email":"alice@example.com","name":"Alice"},
  "to": [{"email":"sales@yourco.com"}],
  "subject":"Need product pricing",
  "text":"Hi team, please share pricing.",
  "html":"<p>Hi team, please share pricing.</p>",
  "received_at":"2026-02-21T10:25:00Z"
}`}
          </Typography>
        </Card>

        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>cURL Example</Typography>
        <Card variant='outlined' sx={{ p: 1.5, mb: 1, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {curlSample}
          </Typography>
        </Card>

        <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyCurl}>
          Copy cURL
        </Button>
      </Card>
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Create Email Inbound</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            fullWidth
            select
            label='Provider'
            value={createValues.provider}
            onChange={(event) =>
              setCreateValues((prev) => ({
                ...prev,
                provider: event.target.value,
              }))
            }
            disabled={creating}
          >
            {PROVIDER_OPTIONS.map((provider) => (
              <MenuItem key={provider.value} value={provider.value}>
                {provider.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin='dense'
            fullWidth
            multiline
            minRows={3}
            label='Allowed To Addresses (comma-separated)'
            value={createValues.allowed_to_addresses}
            onChange={(event) =>
              setCreateValues((prev) => ({
                ...prev,
                allowed_to_addresses: event.target.value,
              }))
            }
            placeholder='sales@company.com, support@company.com'
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
          <Button variant='contained' onClick={handleCreate} disabled={creating}>
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
        <DialogTitle>Email Inbound Secret</DialogTitle>
        <DialogContent>
          <Typography color='warning.main' sx={{ mb: 1, fontWeight: 600 }}>
            Secret is shown once. Copy and store it securely.
          </Typography>

          <Typography sx={{ mb: 0.5 }}>
            <b>Provider:</b> {PROVIDER_LABEL_BY_VALUE[oneTimeProvider] || oneTimeProvider || '-'}
          </Typography>
          <Typography sx={{ mb: 0.5 }}>
            <b>Callback URL:</b> {oneTimeCallbackUrl || '-'}
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
            <b>Headers:</b> {oneTimeHeadersHint || 'X-Signature OR X-Api-Key'}
          </Typography>

          <Card variant='outlined' sx={{ p: 2, backgroundColor: '#f7f7f7', mb: 1.5 }}>
            <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.95rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {oneTimeSecret || 'No secret returned by backend.'}
            </Typography>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant='outlined'
              startIcon={<ContentCopyIcon />}
              onClick={handleCopySecret}
              disabled={!oneTimeSecret}
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
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{statusDialog.targetStatus === 'active' ? 'Enable Integration' : 'Disable Integration'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to {statusDialog.targetStatus === 'active' ? 'enable' : 'disable'}{' '}
            <b>{statusDialog?.row?.__provider || 'this email inbound integration'}</b>?
          </Typography>
          {statusDialog.error ? <Typography color='error'>{statusDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} disabled={statusDialog.loading}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color={statusDialog.targetStatus === 'active' ? 'success' : 'error'}
            onClick={handleUpdateStatus}
            disabled={statusDialog.loading}
          >
            {statusDialog.loading
              ? statusDialog.targetStatus === 'active'
                ? 'Enabling...'
                : 'Disabling...'
              : statusDialog.targetStatus === 'active'
                ? 'Enable'
                : 'Disable'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={rotateDialog.open} onClose={closeRotateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Rotate Secret</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Rotate secret for <b>{rotateDialog?.row?.__provider || 'this integration'}</b>?
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 1 }}>
            Existing provider webhook signatures will fail until the new secret is updated on provider side.
          </Typography>
          {rotateDialog.error ? <Typography color='error'>{rotateDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRotateDialog} disabled={rotateDialog.loading}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleRotateSecret}
            disabled={rotateDialog.loading}
            startIcon={<VpnKeyIcon />}
          >
            {rotateDialog.loading ? 'Rotating...' : 'Rotate Secret'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

