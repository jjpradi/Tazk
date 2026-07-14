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
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
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

const resolveFormId = (item) => {
  return item?.website_form_id || item?.websiteFormId || item?.id || item?.form_id || '';
};

const resolveFormName = (item, index) => {
  return item?.form_name || item?.name || item?.label || `Website Form ${index + 1}`;
};

const resolveAllowedOrigin = (item) => {
  return item?.allowed_origin || item?.allowedOrigin || item?.origin || '-';
};

const resolveRateLimit = (item) => {
  return (
    item?.rate_limit_per_min ||
    item?.rateLimitPerMin ||
    item?.rate_limit ||
    ''
  );
};

const resolvePostUrl = (payload, fallbackFormId = '') => {
  const direct =
    payload?.post_url ||
    payload?.postUrl ||
    payload?.callback_url ||
    payload?.callbackUrl ||
    payload?.data?.post_url ||
    payload?.data?.postUrl ||
    payload?.data?.callback_url ||
    payload?.data?.callbackUrl;

  if (direct) return String(direct);

  const formId = String(resolveFormId(payload) || fallbackFormId || '').trim();
  if (!formId) return '';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/leadsservice/api/webforms/${encodeURIComponent(formId)}/lead`;
};

const resolveOneTimeFormKey = (payload) => {
  return (
    payload?.form_key_once ||
    payload?.formKeyOnce ||
    payload?.form_key_plaintext_once ||
    payload?.formKeyPlaintextOnce ||
    payload?.key ||
    payload?.form_key ||
    payload?.data?.form_key_once ||
    payload?.data?.form_key_plaintext_once ||
    payload?.data?.key ||
    ''
  );
};

const resolveHoneypotField = (item) => {
  return (
    item?.spam_honeypot_field ||
    item?.honeypot_field ||
    item?.honeypotField ||
    'company_website'
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

const buildEmbedSnippet = ({ postUrl, honeypotField }) => {
  const safePostUrl = postUrl || '<POST_URL_FROM_CREATE_RESPONSE>';
  const safeHoneypot = honeypotField || 'company_website';

  return `<!-- CRM Website Lead Form -->
<form id="crmLeadForm">
  <input type="text" name="full_name" placeholder="Full name" required />
  <input type="email" name="email" placeholder="Email" />
  <input type="tel" name="phone" placeholder="Phone" />
  <input type="text" name="company" placeholder="Company" />
  <textarea name="message" placeholder="Message"></textarea>

  <!-- Honeypot: keep hidden -->
  <input type="text" name="${safeHoneypot}" style="display:none" tabindex="-1" autocomplete="off" />

  <button type="submit">Submit</button>
</form>

<script>
(() => {
  const postUrl = '${safePostUrl}';
  const formKey = '<FORM_KEY_ONCE>';
  const form = document.getElementById('crmLeadForm');

  const getUtm = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
    };
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    Object.assign(payload, getUtm(), {
      page_url: window.location.href,
      referrer_url: document.referrer || '',
    });

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Form-Key': formKey,
      },
      body: JSON.stringify(payload),
    });

    console.log('Lead capture response', await response.json());
  });
})();
</script>`;
};

const buildCurlSnippet = ({ postUrl, honeypotField }) => {
  const safePostUrl = postUrl || '<POST_URL_FROM_CREATE_RESPONSE>';
  const safeHoneypot = honeypotField || 'company_website';

  return `curl -X POST '${safePostUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Form-Key: <FORM_KEY_ONCE>' \\
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "company": "Acme Inc",
    "message": "Need a callback",
    "${safeHoneypot}": "",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer_sale",
    "page_url": "https://example.com/landing",
    "referrer_url": "https://google.com"
  }'`;
};

export default function IntegrationsWebsiteFormsAdminPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createValues, setCreateValues] = useState({
    form_name: '',
    allowed_origin: '',
    rate_limit_per_min: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [oneTimeKeyDialogOpen, setOneTimeKeyDialogOpen] = useState(false);
  const [oneTimeFormKey, setOneTimeFormKey] = useState('');
  const [oneTimeFormId, setOneTimeFormId] = useState('');
  const [oneTimePostUrl, setOneTimePostUrl] = useState('');
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

  const [selectedFormIdForSnippet, setSelectedFormIdForSnippet] = useState('');

  const tableRows = useMemo(() => {
    return (rows || []).map((item, index) => ({
      ...item,
      __rowId: resolveFormId(item) || `website_form_${index + 1}`,
      __formName: resolveFormName(item, index),
      __formId: resolveFormId(item) || '-',
      __allowedOrigin: resolveAllowedOrigin(item),
      __status: normalizeStatus(item?.status),
      __createdAt: item?.createdAt || item?.created_at || null,
      __rateLimit: resolveRateLimit(item),
      __honeypotField: resolveHoneypotField(item),
      __postUrl: resolvePostUrl(item, resolveFormId(item)),
    }));
  }, [rows]);

  useEffect(() => {
    if (!selectedFormIdForSnippet && tableRows.length > 0) {
      setSelectedFormIdForSnippet(String(tableRows[0]?.__formId || ''));
    }
  }, [tableRows, selectedFormIdForSnippet]);

  const selectedSnippetForm = useMemo(() => {
    return tableRows.find((row) => String(row.__formId) === String(selectedFormIdForSnippet)) || tableRows[0] || null;
  }, [tableRows, selectedFormIdForSnippet]);

  const embedSnippet = useMemo(
    () =>
      buildEmbedSnippet({
        postUrl: oneTimePostUrl || selectedSnippetForm?.__postUrl || '',
        honeypotField: selectedSnippetForm?.__honeypotField || 'company_website',
      }),
    [oneTimePostUrl, selectedSnippetForm],
  );

  const curlSnippet = useMemo(
    () =>
      buildCurlSnippet({
        postUrl: oneTimePostUrl || selectedSnippetForm?.__postUrl || '',
        honeypotField: selectedSnippetForm?.__honeypotField || 'company_website',
      }),
    [oneTimePostUrl, selectedSnippetForm],
  );

  const loadWebsiteForms = async () => {
    setLoading(true);
    setErrorMessage('');
    ListLoad(setModalTypeHandler, setLoaderStatusHandler);

    try {
      const response = await integrationsApi.listWebsiteForms();
      setRows(getItems(response?.data || response));
    } catch (error) {
      setRows([]);
      setErrorMessage(getErrorMessage(error, 'Unable to load website forms'));
    } finally {
      setLoading(false);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  useEffect(() => {
    loadWebsiteForms();
  }, []);

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
    setCreateError('');
    setCreateValues({
      form_name: '',
      allowed_origin: '',
      rate_limit_per_min: '',
    });
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateDialogOpen(false);
    setCreateError('');
  };

  const handleCreateForm = async () => {
    const formName = String(createValues.form_name || '').trim();
    if (!formName) {
      setCreateError('Form name is required');
      return;
    }

    const payload = {
      form_name: formName,
    };

    const allowedOrigin = String(createValues.allowed_origin || '').trim();
    if (allowedOrigin) payload.allowed_origin = allowedOrigin;

    const rateLimitText = String(createValues.rate_limit_per_min || '').trim();
    if (rateLimitText) {
      const parsedRateLimit = Number(rateLimitText);
      if (Number.isNaN(parsedRateLimit) || parsedRateLimit <= 0) {
        setCreateError('Rate limit must be a positive number');
        return;
      }
      payload.rate_limit_per_min = parsedRateLimit;
    }

    setCreating(true);
    setCreateError('');

    try {
      const response = await integrationsApi.createWebsiteForm(payload);
      const responseData = response?.data || response;

      const formId = String(resolveFormId(responseData) || '');
      const oneTimeFormKey = String(resolveOneTimeFormKey(responseData) || '');
      const postUrl = String(resolvePostUrl(responseData, formId) || '');

      dispatch(
        OpenalertActions({
          msg: 'Website form created',
          severity: 'success',
        }),
      );

      setCreateDialogOpen(false);
      setOneTimeFormId(formId);
      setOneTimeFormKey(oneTimeFormKey);
      setOneTimePostUrl(postUrl);
      setCopiedAcknowledge(false);
      setOneTimeKeyDialogOpen(true);

      await loadWebsiteForms();
      if (formId) setSelectedFormIdForSnippet(formId);
    } catch (error) {
      setCreateError(getErrorMessage(error, 'Unable to create website form'));
    } finally {
      setCreating(false);
    }
  };

  const closeOneTimeKeyDialog = () => {
    if (!copiedAcknowledge) return;

    setOneTimeKeyDialogOpen(false);
    setOneTimeFormId('');
    setOneTimeFormKey('');
    setOneTimePostUrl('');
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
    const formId = resolveFormId(statusDialog?.row);
    if (!formId) return;

    setStatusDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      await integrationsApi.updateWebsiteForm(formId, { status: statusDialog.targetStatus });

      dispatch(
        OpenalertActions({
          msg: statusDialog.targetStatus === 'active' ? 'Website form enabled' : 'Website form disabled',
          severity: 'success',
        }),
      );

      closeStatusDialog();
      await loadWebsiteForms();
    } catch (error) {
      setStatusDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to update website form status'),
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

  const handleRotateKey = async () => {
    const formId = resolveFormId(rotateDialog?.row);
    if (!formId) return;

    setRotateDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }));

    try {
      const response = await integrationsApi.updateWebsiteForm(formId, {
        rotate_key: true,
        rotateKey: true,
      });
      const responseData = response?.data || response;
      const rotatedKey = String(resolveOneTimeFormKey(responseData) || '');

      dispatch(
        OpenalertActions({
          msg: 'Form key rotated',
          severity: 'success',
        }),
      );

      closeRotateDialog();

      if (rotatedKey) {
        setOneTimeFormId(String(formId));
        setOneTimeFormKey(rotatedKey);
        setOneTimePostUrl(String(resolvePostUrl(responseData, formId) || resolvePostUrl(rotateDialog?.row, formId)));
        setCopiedAcknowledge(false);
        setOneTimeKeyDialogOpen(true);
      }

      await loadWebsiteForms();
    } catch (error) {
      setRotateDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to rotate form key'),
      }));
    }
  };

  const columns = [
    {
      title: 'Form Name',
      field: '__formName',
      render: (rowData) => rowData?.__formName || '-',
    },
    {
      title: 'Website Form ID',
      field: '__formId',
      render: (rowData) => String(rowData?.__formId || '-'),
    },
    {
      title: 'Allowed Origin',
      field: '__allowedOrigin',
      render: (rowData) => rowData?.__allowedOrigin || '-',
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
              onClick={() => openRotateDialog(rowData)}
            >
              Rotate key
            </Button>
          </Box>
        );
      },
    },
  ];

  const handleCopyOneTimeKey = async () => {
    try {
      await copyText(oneTimeFormKey);
      dispatch(
        OpenalertActions({
          msg: 'Form key copied to clipboard',
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

  const handleCopyEmbedSnippet = async () => {
    try {
      await copyText(embedSnippet);
      dispatch(
        OpenalertActions({
          msg: 'Embed snippet copied',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy embed snippet'),
          severity: 'error',
        }),
      );
    }
  };

  const handleCopyCurlSnippet = async () => {
    try {
      await copyText(curlSnippet);
      dispatch(
        OpenalertActions({
          msg: 'curl example copied',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to copy curl example'),
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
              Website Forms
            </Typography>
            <Typography color='text.secondary'>
              Configure secure web form ingestion keys and website-origin restrictions.
            </Typography>
          </Grid>
          <Grid>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadWebsiteForms} disabled={loading}>
                Refresh
              </Button>
              <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
                Create Website Form
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
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadWebsiteForms}>
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
              emptyDataSourceMessage: 'No website forms configured yet.',
            },
          }}
        />
      )}
      <Card sx={{ p: 2, mt: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
          Embed Snippet
        </Typography>

        <Typography color='text.secondary' sx={{ mb: 0.5 }}>
          Keep the honeypot field hidden in your form. Bots filling it will be ignored.
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 0.5 }}>
          Allowed origin should match your website domain exactly (for example, https://www.example.com).
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 1.5 }}>
          Do not expose form keys in public repos or browser bundles.
        </Typography>

        <Grid container spacing={2} alignItems='center' sx={{ mb: 1 }}>
          <Grid
            size={{
              xs: 12,
              md: 5
            }}>
            <TextField
              select
              fullWidth
              label='Use form config'
              variant='filled'
              value={selectedFormIdForSnippet}
              onChange={(event) => setSelectedFormIdForSnippet(event.target.value)}
            >
              {tableRows.length === 0 ? (
                <MenuItem value=''>No configured forms</MenuItem>
              ) : (
                tableRows.map((row) => (
                  <MenuItem key={row.__rowId} value={String(row.__formId)}>
                    {row.__formName} ({row.__formId})
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 7
            }}>
            <Typography color='text.secondary'>
              Post URL: {oneTimePostUrl || selectedSnippetForm?.__postUrl || '<POST_URL_FROM_CREATE_RESPONSE>'}
            </Typography>
          </Grid>
        </Grid>

        <Card variant='outlined' sx={{ p: 1.5, mb: 1.5, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
            {embedSnippet}
          </Typography>
        </Card>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyEmbedSnippet}>
            Copy HTML + JS snippet
          </Button>
        </Box>

        <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
          curl example
        </Typography>

        <Card variant='outlined' sx={{ p: 1.5, mb: 1.5, backgroundColor: '#f7f7f7' }}>
          <Typography component='pre' sx={{ mb: 0, fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
            {curlSnippet}
          </Typography>
        </Card>

        <Button variant='outlined' startIcon={<ContentCopyIcon />} onClick={handleCopyCurlSnippet}>
          Copy curl example
        </Button>
      </Card>
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Create Website Form</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            fullWidth
            label='Form name'
            variant='filled'
            value={createValues.form_name}
            onChange={(event) => setCreateValues((prev) => ({ ...prev, form_name: event.target.value }))}
            autoFocus
            disabled={creating}
            required
          />

          <TextField
            margin='dense'
            fullWidth
            label='Allowed origin (optional)'
            variant='filled'
            placeholder='https://www.example.com'
            value={createValues.allowed_origin}
            onChange={(event) => setCreateValues((prev) => ({ ...prev, allowed_origin: event.target.value }))}
            disabled={creating}
          />

          <TextField
            margin='dense'
            fullWidth
            label='Rate limit per min (optional)'
            variant='filled'
            value={createValues.rate_limit_per_min}
            onChange={(event) => setCreateValues((prev) => ({ ...prev, rate_limit_per_min: event.target.value }))}
            disabled={creating}
            type='number'
            inputProps={{ min: 1 }}
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
          <Button variant='contained' onClick={handleCreateForm} disabled={creating}>
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
        <DialogTitle>Copy Form Key</DialogTitle>
        <DialogContent>
          <Typography color='warning.main' sx={{ mb: 1, fontWeight: 600 }}>
            This form key will not be shown again.
          </Typography>

          <Typography sx={{ mb: 0.5 }}>
            <b>Website form ID:</b> {oneTimeFormId || '-'}
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
            <b>Post URL:</b> {oneTimePostUrl || resolvePostUrl({}, oneTimeFormId) || '-'}
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
              {oneTimeFormKey || 'No form key returned by backend.'}
            </Typography>
          </Card>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<VpnKeyIcon />}
              onClick={handleCopyOneTimeKey}
              disabled={!oneTimeFormKey}
            >
              Copy form key
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
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{statusDialog.targetStatus === 'active' ? 'Enable Website Form' : 'Disable Website Form'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to {statusDialog.targetStatus === 'active' ? 'enable' : 'disable'}{' '}
            <b>{statusDialog?.row?.__formName || 'this website form'}</b>?
          </Typography>
          {statusDialog.error ? <Typography color='error'>{statusDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog} disabled={statusDialog.loading}>
            Cancel
          </Button>
          <Button variant='contained' color={statusDialog.targetStatus === 'active' ? 'success' : 'error'} onClick={handleUpdateStatus} disabled={statusDialog.loading}>
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
        <DialogTitle>Rotate Form Key</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Rotate key for <b>{rotateDialog?.row?.__formName || 'this website form'}</b>?
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 1 }}>
            Existing integrations must be updated with the newly generated key.
          </Typography>
          {rotateDialog.error ? <Typography color='error'>{rotateDialog.error}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRotateDialog} disabled={rotateDialog.loading}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleRotateKey} disabled={rotateDialog.loading}>
            {rotateDialog.loading ? 'Rotating...' : 'Rotate key'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

