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
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
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

const maskKeyPreview = (value) => {
  if (!value) return 'â€”';

  const text = String(value).trim();
  if (!text) return 'â€”';
  if (text.includes('*')) return text;

  if (text.length <= 4) return '****';
  if (text.length <= 8) return `****${text.slice(-4)}`;

  const visiblePrefix = text.slice(0, Math.min(8, Math.max(4, text.length - 4)));
  return `${visiblePrefix}****${text.slice(-4)}`;
};

const normalizeStatus = (value) => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'active') return 'Active';
  if (raw === 'revoked') return 'Revoked';
  return value || '-';
};

const resolveKeyPreviewSource = (item) => {
  return (
    item?.key_preview ||
    item?.masked_key ||
    item?.api_key_preview ||
    item?.api_key ||
    item?.key ||
    item?.apiKey ||
    item?.token ||
    item?.api_key_hash ||
    ''
  );
};

const resolveOneTimePlaintextKey = (payload) => {
  return (
    payload?.api_key_plaintext_once ||
    payload?.apiKeyPlaintextOnce ||
    payload?.plainTextKey ||
    payload?.plaintext_key ||
    payload?.key ||
    payload?.api_key ||
    payload?.data?.api_key_plaintext_once ||
    payload?.data?.key ||
    ''
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

export default function IntegrationsApiKeysPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [oneTimeKeyDialogOpen, setOneTimeKeyDialogOpen] = useState(false);
  const [oneTimeKeyValue, setOneTimeKeyValue] = useState('');
  const [copiedAcknowledge, setCopiedAcknowledge] = useState(false);

  const [revokeDialog, setRevokeDialog] = useState({
    open: false,
    row: null,
    loading: false,
    error: '',
  });

  const tableRows = useMemo(() => {
    return (rows || []).map((item, index) => ({
      ...item,
      __rowId:
        item?.api_key_id ||
        item?.apiKeyId ||
        item?.id ||
        item?.key_id ||
        `api_key_${index + 1}`,
      __name: item?.name || item?.key_name || item?.label || `API Key ${index + 1}`,
      __status: normalizeStatus(item?.status),
      __createdAt: item?.createdAt || item?.created_at || item?.created_at_utc || null,
      __maskedPreview: maskKeyPreview(resolveKeyPreviewSource(item)),
    }));
  }, [rows]);

  const loadApiKeys = async () => {
    setLoading(true);
    setErrorMessage('');
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    try {
      const response = await integrationsApi.listApiKeys();
      setRows(getItems(response?.data || response));
    } catch (error) {
      setRows([]);
      setErrorMessage(getErrorMessage(error, 'Unable to load API keys'));
    } finally {
      setLoading(false);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  useEffect(() => {
    loadApiKeys();
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

  const handleCreateApiKey = async () => {
    const trimmedName = String(createName || '').trim();
    if (!trimmedName) {
      setCreateError('Name is required');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await integrationsApi.createApiKey({ name: trimmedName });
      const plaintextKey = resolveOneTimePlaintextKey(response?.data || response);

      dispatch(
        OpenalertActions({
          msg: 'API key created',
          severity: 'success',
        }),
      );

      setCreateDialogOpen(false);
      setCreateName('');
      setCreateError('');

      setOneTimeKeyValue(String(plaintextKey || ''));
      setCopiedAcknowledge(false);
      setOneTimeKeyDialogOpen(true);

      await loadApiKeys();
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create API key'));
    } finally {
      setCreating(false);
    }
  };

  const handleCopyOneTimeKey = async () => {
    try {
      await copyText(oneTimeKeyValue);
      dispatch(
        OpenalertActions({
          msg: 'API key copied to clipboard',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy key'),
          severity: 'error',
        }),
      );
    }
  };

  const closeOneTimeKeyDialog = () => {
    if (!copiedAcknowledge) return;
    setOneTimeKeyDialogOpen(false);
    setOneTimeKeyValue('');
    setCopiedAcknowledge(false);
  };

  const openRevokeDialog = (row) => {
    setRevokeDialog({
      open: true,
      row,
      loading: false,
      error: '',
    });
  };

  const closeRevokeDialog = () => {
    if (revokeDialog.loading) return;
    setRevokeDialog({
      open: false,
      row: null,
      loading: false,
      error: '',
    });
  };

  const handleRevokeKey = async () => {
    const keyId = revokeDialog?.row?.api_key_id || revokeDialog?.row?.apiKeyId || revokeDialog?.row?.id;
    if (!keyId) return;

    setRevokeDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      await integrationsApi.revokeApiKey(keyId);

      dispatch(
        OpenalertActions({
          msg: 'API key revoked',
          severity: 'success',
        }),
      );

      closeRevokeDialog();
      await loadApiKeys();
    } catch (error) {
      setRevokeDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to revoke API key'),
      }));
    }
  };

  const columns = [
    {
      title: 'Name',
      field: '__name',
      render: (rowData) => rowData?.__name || '-',
    },
    {
      title: 'Key Preview',
      field: '__maskedPreview',
      render: (rowData) => rowData?.__maskedPreview || 'â€”',
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
        const isRevoked = String(rowData?.status || rowData?.__status || '').toLowerCase() === 'revoked';

        return (
          <Button
            size='small'
            color='error'
            variant='outlined'
            startIcon={<BlockIcon />}
            disabled={isRevoked}
            onClick={() => openRevokeDialog(rowData)}
          >
            Revoke
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
              API Keys
            </Typography>
            <Typography color='text.secondary'>
              Create and manage API keys used by external systems to ingest CRM leads.
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadApiKeys} disabled={loading}>
                Refresh
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                Create API Key
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
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadApiKeys}>
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
              emptyDataSourceMessage: 'No API keys configured yet.',
            },
          }}
        />
      )}
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            fullWidth
            label='Key name'
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
          <Button variant='contained' onClick={handleCreateApiKey} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={oneTimeKeyDialogOpen}
        fullWidth
        maxWidth='md'
        disableEscapeKeyDown
        onClose={(_event, reason) => {
          if (reason === 'backdropClick') return;
          closeOneTimeKeyDialog();
        }}
      >
        <DialogTitle>Copy API Key</DialogTitle>
        <DialogContent>
          <Typography color='warning.main' sx={{ mb: 1, fontWeight: 600 }}>
            This key will not be shown again.
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
              {oneTimeKeyValue || 'No plaintext key returned by backend.'}
            </Typography>
          </Card>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyOneTimeKey}
              disabled={!oneTimeKeyValue}
            >
              Copy
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
          <Button variant='contained' onClick={closeOneTimeKeyDialog} disabled={!copiedAcknowledge}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={revokeDialog.open} onClose={closeRevokeDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Revoke API Key</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to revoke <b>{revokeDialog?.row?.__name || 'this API key'}</b>?
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 1 }}>
            Revoked keys can no longer authenticate external lead ingestion requests.
          </Typography>
          {revokeDialog.error ? <Typography color='error'>{revokeDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRevokeDialog} disabled={revokeDialog.loading}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleRevokeKey} disabled={revokeDialog.loading}>
            {revokeDialog.loading ? 'Revoking...' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

