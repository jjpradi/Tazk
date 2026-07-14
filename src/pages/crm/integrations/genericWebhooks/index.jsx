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
  Typography,
  Link,
  Switch,
  Divider,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import AutorenewIcon from '@mui/icons-material/Autorenew';
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

const normalizeStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'disabled') return 'Disabled';
  return value || '-';
};

const toBoolean = (value) => {
  if (value === true || value === false) return value;
  if (value === 1 || value === '1') return true;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === 'no') return false;
  }
  return false;
};

const resolveWebhookRecordId = (item) => {
  return item?.generic_webhook_id || item?.genericWebhookId || item?.id || '';
};

const resolveWebhookIdPreview = (item) => {
  return (
    item?.webhook_id ||
    item?.webhookId ||
    item?.webhook_endpoint_id ||
    item?.endpoint_id ||
    resolveWebhookRecordId(item) ||
    '-'
  );
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

const resolveCallbackUrl = (payload) => {
  return (
    payload?.callback_url ||
    payload?.callbackUrl ||
    payload?.post_url ||
    payload?.data?.callback_url ||
    payload?.data?.callbackUrl ||
    payload?.data?.post_url ||
    ''
  );
};

const resolveHeadersHint = (payload) => {
  const headers = payload?.recommended_headers || payload?.data?.recommended_headers;
  if (Array.isArray(headers) && headers.length > 0) {
    return headers.join(', ');
  }
  return 'Use either X-Signature or X-Api-Key header.';
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

const FLAT_PAYLOAD_EXAMPLE = {
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+15551234567',
  company: 'Acme Inc',
  message: 'Need a callback',
  external_event_id: 'evt_1001',
  source_system: 'zapier',
};

const NESTED_PAYLOAD_EXAMPLE = {
  source: {
    source_system: 'make',
    source_name: 'Make Scenario',
  },
  event: {
    external_event_id: 'evt_1001',
  },
  person: {
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: {
      e164: '+15551234567',
    },
  },
  organization: {
    name: 'Acme Inc',
  },
  lead: {
    subject: 'Pricing request',
    message: 'Need details for enterprise plan',
  },
};

export default function IntegrationsGenericWebhooksAdminPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [oneTimeDialogOpen, setOneTimeDialogOpen] = useState(false);
  const [oneTimeSecret, setOneTimeSecret] = useState('');
  const [oneTimeCallbackUrl, setOneTimeCallbackUrl] = useState('');
  const [oneTimeHeadersHint, setOneTimeHeadersHint] = useState('');
  const [oneTimeDocsUrl, setOneTimeDocsUrl] = useState('/crm/settings/integrations');
  const [copiedAcknowledge, setCopiedAcknowledge] = useState(false);

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    row: null,
    targetStatus: 'disabled',
    loading: false,
    error: '',
  });

  const [togglingRequireId, setTogglingRequireId] = useState('');

  const tableRows = useMemo(() => {
    return (rows || []).map((item, index) => {
      const recordId = resolveWebhookRecordId(item) || `generic_webhook_${index + 1}`;

      return {
        ...item,
        __recordId: recordId,
        __name: item?.name || item?.webhook_name || `Generic Webhook ${index + 1}`,
        __webhookId: resolveWebhookIdPreview(item),
        __status: normalizeStatus(item?.status),
        __createdAt: item?.createdAt || item?.created_at || null,
        __requireExternalEventId: toBoolean(item?.require_external_event_id ?? item?.requireExternalEventId),
      };
    });
  }, [rows]);

  const flatPayloadString = useMemo(() => JSON.stringify(FLAT_PAYLOAD_EXAMPLE, null, 2), []);
  const nestedPayloadString = useMemo(() => JSON.stringify(NESTED_PAYLOAD_EXAMPLE, null, 2), []);

  const loadGenericWebhooks = async () => {
    setLoading(true);
    setErrorMessage('');
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    try {
      const response = await integrationsApi.listGenericWebhooks();
      setRows(getItems(response?.data || response));
    } catch (error) {
      setRows([]);
      setErrorMessage(getErrorMessage(error, 'Unable to load generic webhooks'));
    } finally {
      setLoading(false);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  useEffect(() => {
    loadGenericWebhooks();
  }, []);

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
    setCreateName('');
    setCreateError('');
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateDialogOpen(false);
    setCreateName('');
    setCreateError('');
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
      const response = await integrationsApi.createGenericWebhook({ name: trimmedName });
      const responseData = response?.data || response;

      setOneTimeSecret(String(resolveOneTimeSecret(responseData) || ''));
      setOneTimeCallbackUrl(String(resolveCallbackUrl(responseData) || ''));
      setOneTimeHeadersHint(resolveHeadersHint(responseData));
      setOneTimeDocsUrl(resolveDocsUrl(responseData));
      setCopiedAcknowledge(false);
      setOneTimeDialogOpen(true);

      dispatch(
        OpenalertActions({
          msg: 'Generic webhook created',
          severity: 'success',
        }),
      );

      closeCreateDialog();
      await loadGenericWebhooks();
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create generic webhook'));
    } finally {
      setCreating(false);
    }
  };

  const closeOneTimeDialog = () => {
    if (!copiedAcknowledge) return;
    setOneTimeDialogOpen(false);
    setOneTimeSecret('');
    setOneTimeCallbackUrl('');
    setOneTimeHeadersHint('');
    setCopiedAcknowledge(false);
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
    const recordId = resolveWebhookRecordId(statusDialog?.row);
    if (!recordId) return;

    setStatusDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      await integrationsApi.updateGenericWebhook(recordId, { status: statusDialog.targetStatus });

      dispatch(
        OpenalertActions({
          msg: statusDialog.targetStatus === 'active' ? 'Webhook enabled' : 'Webhook disabled',
          severity: 'success',
        }),
      );

      closeStatusDialog();
      await loadGenericWebhooks();
    } catch (error) {
      setStatusDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to update webhook status'),
      }));
    }
  };

  const handleToggleRequireExternalId = async (rowData) => {
    const recordId = resolveWebhookRecordId(rowData);
    if (!recordId) return;

    const currentValue = toBoolean(rowData?.require_external_event_id ?? rowData?.__requireExternalEventId);
    const nextValue = !currentValue;

    setTogglingRequireId(String(recordId));

    try {
      await integrationsApi.updateGenericWebhook(recordId, {
        require_external_event_id: nextValue ? 1 : 0,
      });

      dispatch(
        OpenalertActions({
          msg: nextValue ? 'External event id requirement enabled' : 'External event id requirement disabled',
          severity: 'success',
        }),
      );

      await loadGenericWebhooks();
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to update require_external_event_id flag'),
          severity: 'error',
        }),
      );
    } finally {
      setTogglingRequireId('');
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
      title: 'Status',
      field: '__status',
      render: (rowData) => rowData?.__status || '-',
    },
    {
      title: 'Require external_event_id',
      field: '__requireExternalEventId',
      render: (rowData) => {
        const checked = !!rowData?.__requireExternalEventId;
        const rowId = String(resolveWebhookRecordId(rowData) || '');

        return (
          <Switch
            checked={checked}
            onChange={() => handleToggleRequireExternalId(rowData)}
            color='primary'
            disabled={togglingRequireId === rowId}
          />
        );
      },
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
              startIcon={<AutorenewIcon />}
              onClick={() => handleToggleRequireExternalId(rowData)}
              disabled={togglingRequireId === String(resolveWebhookRecordId(rowData) || '')}
            >
              Toggle require id
            </Button>
          </Box>
        );
      },
    },
  ];

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

  const handleCopyFlatPayload = async () => {
    try {
      await copyText(flatPayloadString);
      dispatch(
        OpenalertActions({
          msg: 'Flat payload copied',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy payload'),
          severity: 'error',
        }),
      );
    }
  };

  const handleCopyNestedPayload = async () => {
    try {
      await copyText(nestedPayloadString);
      dispatch(
        OpenalertActions({
          msg: 'Nested payload copied',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy payload'),
          severity: 'error',
        }),
      );
    }
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems='center' justifyContent='space-between'>
          <Grid>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              Generic Webhooks (Zapier / Make)
            </Typography>
            <Typography color='text.secondary'>
              Configure webhook endpoints for automation tools and enforce idempotency behavior.
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadGenericWebhooks} disabled={loading}>
                Refresh
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                Create Generic Webhook
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
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadGenericWebhooks}>
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
              emptyDataSourceMessage: 'No generic webhooks configured yet.',
            },
          }}
        />
      )}
      <Card sx={{ p: 2, mt: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
          Setup Instructions
        </Typography>

        <Typography sx={{ fontWeight: 600 }}>Zapier</Typography>
        <Typography color='text.secondary' sx={{ mb: 1 }}>
          Use <b>Webhooks by Zapier</b> with method <b>POST</b> and JSON payload.
        </Typography>

        <Typography sx={{ fontWeight: 600 }}>Make</Typography>
        <Typography color='text.secondary' sx={{ mb: 1.5 }}>
          Use <b>Custom webhook</b> or HTTP module with method <b>POST</b> and JSON body.
        </Typography>

        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Required headers</Typography>
        <Card variant='outlined' sx={{ p: 1.5, mb: 1.5, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.84rem', whiteSpace: 'pre-wrap' }}>
{`Option A: X-Signature: <HMAC_SHA256(secret, raw_body)>
Option B: X-Api-Key: <api_key_plaintext>`}
          </Typography>
        </Card>

        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Flat JSON payload</Typography>
            <Card variant='outlined' sx={{ p: 1.5, mb: 1, backgroundColor: '#f7f7f7' }}>
              <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {flatPayloadString}
              </Typography>
            </Card>
            <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyFlatPayload}>
              Copy flat payload
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Nested JSON payload</Typography>
            <Card variant='outlined' sx={{ p: 1.5, mb: 1, backgroundColor: '#f7f7f7' }}>
              <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {nestedPayloadString}
              </Typography>
            </Card>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyNestedPayload}>
                Copy nested payload
              </Button>
              <Button
                variant='outlined'
                component='a'
                href={oneTimeDocsUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                Nested payload docs
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Create Generic Webhook</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            fullWidth
            label='Name'
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
        open={oneTimeDialogOpen}
        fullWidth
        maxWidth='md'
        disableEscapeKeyDown
        onClose={(_event, reason) => {
          if (reason === 'backdropClick') return;
          closeOneTimeDialog();
        }}
      >
        <DialogTitle>Generic Webhook Created</DialogTitle>
        <DialogContent>
          <Typography color='warning.main' sx={{ mb: 1, fontWeight: 600 }}>
            Secret is shown once. Copy and store it securely.
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

          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Flat payload example</Typography>
          <Card variant='outlined' sx={{ p: 1.5, backgroundColor: '#f7f7f7' }}>
            <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {flatPayloadString}
            </Typography>
          </Card>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                startIcon={<ContentCopyIcon />}
                onClick={handleCopySecret}
                disabled={!oneTimeSecret}
              >
                Copy secret
              </Button>
              <Button
                variant='outlined'
                component='a'
                href={oneTimeDocsUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                Nested payload link
              </Button>
            </Box>

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
          <Button variant='contained' onClick={closeOneTimeDialog} disabled={!copiedAcknowledge}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{statusDialog.targetStatus === 'active' ? 'Enable Generic Webhook' : 'Disable Generic Webhook'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to {statusDialog.targetStatus === 'active' ? 'enable' : 'disable'}{' '}
            <b>{statusDialog?.row?.__name || 'this generic webhook'}</b>?
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
    </Box>
  );
}

