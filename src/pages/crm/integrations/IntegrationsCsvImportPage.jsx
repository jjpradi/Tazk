import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { OpenalertActions } from 'redux/actions/alert_actions';
import integrationsApi from './integrationsApi';

const STEPS = ['Upload / Paste CSV', 'Preview & Map', 'Start Import', 'Results'];

const MAPPING_FIELDS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'message', label: 'Message' },
  { key: 'external_event_id', label: 'External Event ID' },
];

const IDENTITY_FIELD_KEYS = ['full_name', 'email', 'phone'];

const HEADER_HINTS = {
  full_name: ['full_name', 'fullname', 'name', 'leadname', 'contactname'],
  email: ['email', 'emailaddress', 'workemail', 'mail'],
  phone: ['phone', 'mobile', 'phonenumber', 'mobilenumber', 'contactnumber', 'telephone'],
  company: ['company', 'companyname', 'organization', 'organisation', 'account'],
  message: ['message', 'notes', 'comment', 'description', 'remarks'],
  external_event_id: ['external_event_id', 'externalid', 'leadid', 'eventid', 'submissionid', 'uniqueid'],
};

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  );
};

const getArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  return [];
};

const normalizeTextKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const getDefaultMapping = () => {
  return MAPPING_FIELDS.reduce((acc, item) => {
    acc[item.key] = '';
    return acc;
  }, {});
};

const getDetectedFieldCandidate = (detectedMapping, key) => {
  if (!detectedMapping || typeof detectedMapping !== 'object') return '';
  const value = detectedMapping[key];

  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value.column || value.header || value.field || value.name || '';
  }

  return '';
};

const findHeaderByHints = (headers, key) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeTextKey(header),
  }));
  const hints = HEADER_HINTS[key] || [];

  for (let i = 0; i < hints.length; i += 1) {
    const normalizedHint = normalizeTextKey(hints[i]);
    const exactMatch = normalizedHeaders.find((item) => item.normalized === normalizedHint);
    if (exactMatch) return exactMatch.original;
  }

  for (let i = 0; i < hints.length; i += 1) {
    const normalizedHint = normalizeTextKey(hints[i]);
    const looseMatch = normalizedHeaders.find((item) => item.normalized.includes(normalizedHint));
    if (looseMatch) return looseMatch.original;
  }

  return '';
};

const buildSuggestedMapping = (headers, detectedFields) => {
  const nextMapping = getDefaultMapping();
  const headerSet = new Set(headers);

  MAPPING_FIELDS.forEach((field) => {
    const detected = getDetectedFieldCandidate(detectedFields, field.key);
    if (detected && headerSet.has(detected)) {
      nextMapping[field.key] = detected;
      return;
    }

    const hinted = findHeaderByHints(headers, field.key);
    if (hinted) {
      nextMapping[field.key] = hinted;
    }
  });

  return nextMapping;
};

const normalizeSampleRows = (rows, headers) => {
  const sampleRows = getArray(rows);

  return sampleRows.map((row, index) => {
    if (Array.isArray(row)) {
      return headers.reduce((acc, header, headerIndex) => {
        acc[header] = row[headerIndex] ?? '';
        return acc;
      }, {});
    }

    if (row && typeof row === 'object') {
      return row;
    }

    return { value: String(row ?? ''), __index: index + 1 };
  });
};

const normalizePreviewResponse = (payload) => {
  const root = payload?.data || payload || {};

  const headers =
    root?.headers ||
    root?.columns ||
    root?.data?.headers ||
    root?.preview?.headers ||
    root?.preview_headers ||
    [];

  const normalizedHeaders = Array.isArray(headers) ? headers.map((item) => String(item)) : [];

  const sampleRowsSource =
    root?.sample_rows ||
    root?.sampleRows ||
    root?.rows ||
    root?.preview_rows ||
    root?.data?.sample_rows ||
    root?.preview?.rows ||
    [];

  const sampleRows = normalizeSampleRows(sampleRowsSource, normalizedHeaders);

  const detectedFields =
    root?.detected_fields ||
    root?.detected_mapping ||
    root?.suggested_mapping ||
    root?.mapping_suggestions ||
    root?.data?.detected_fields ||
    {};

  const totalRows = Number(
    root?.total_rows ||
      root?.totalRows ||
      root?.row_count ||
      root?.count ||
      root?.data?.total_rows ||
      sampleRows.length,
  );

  return {
    headers: normalizedHeaders,
    sampleRows,
    detectedFields: detectedFields && typeof detectedFields === 'object' ? detectedFields : {},
    totalRows,
  };
};

const resolveImportJobId = (payload) => {
  const root = payload?.data || payload || {};

  return (
    root?.import_job_id ||
    root?.importJobId ||
    root?.job_id ||
    root?.id ||
    root?.job?.import_job_id ||
    root?.data?.import_job_id ||
    ''
  );
};

const normalizeJobStatus = (statusValue) => {
  const status = String(statusValue || '').toLowerCase();
  if (!status) return 'unknown';
  return status;
};

const formatStatusLabel = (statusValue) => {
  const value = normalizeJobStatus(statusValue);
  if (!value || value === 'unknown') return 'Unknown';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeImportJob = (payload) => {
  const root = payload?.data || payload || {};
  const job = root?.job || root?.data?.job || root;

  return {
    import_job_id:
      job?.import_job_id ||
      root?.import_job_id ||
      root?.job_id ||
      root?.id ||
      '',
    status: normalizeJobStatus(job?.status || root?.status),
    total_rows: Number(job?.total_rows ?? job?.totalRows ?? root?.total_rows ?? 0),
    success_rows: Number(job?.success_rows ?? job?.successRows ?? root?.success_rows ?? 0),
    failed_rows: Number(job?.failed_rows ?? job?.failedRows ?? root?.failed_rows ?? 0),
    skipped_rows: Number(job?.skipped_rows ?? job?.skippedRows ?? root?.skipped_rows ?? 0),
    createdAt: job?.createdAt || job?.created_at || root?.createdAt || root?.created_at || null,
    started_at: job?.started_at || job?.startedAt || root?.started_at || null,
    finished_at: job?.finished_at || job?.finishedAt || root?.finished_at || null,
  };
};

const normalizeImportRowsResponse = (payload) => {
  const root = payload?.data || payload || {};
  const rowCandidates = [
    getArray(root),
    getArray(root?.rows),
    getArray(root?.data?.rows),
    getArray(root?.result),
  ];

  const rowItems =
    rowCandidates.find((rows) => Array.isArray(rows) && rows.length > 0) ||
    rowCandidates.find((rows) => Array.isArray(rows)) ||
    [];

  const normalizedRows = rowItems.map((row, index) => ({
    id: row?.import_row_result_id || row?.id || `${index + 1}`,
    row_number: row?.row_number ?? row?.rowNumber ?? row?.row ?? '-',
    status: row?.status || '-',
    lead_id: row?.lead_id || row?.leadId || '',
    error_message: row?.error_message || row?.error || row?.message || '',
    raw_row_json: row?.raw_row_json ?? row?.rawRow ?? row?.raw ?? row?.payload_json ?? '',
  }));

  const total = Number(
    root?.total ||
      root?.total_count ||
      root?.count ||
      root?.rows_total ||
      root?.pagination?.total ||
      root?.meta?.total ||
      normalizedRows.length,
  );

  return {
    rows: normalizedRows,
    total,
  };
};

const stringifyRawRow = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const escapeCsvCell = (value) => {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const downloadCsvFile = (filename, headerColumns, rows) => {
  const csvLines = [
    headerColumns.map((column) => escapeCsvCell(column)).join(','),
    ...rows.map((row) => headerColumns.map((column) => escapeCsvCell(row[column])).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function IntegrationsCsvImportPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeStep, setActiveStep] = useState(0);

  const [csvText, setCsvText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [inputError, setInputError] = useState('');

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewTotalRows, setPreviewTotalRows] = useState(0);
  const [mapping, setMapping] = useState(getDefaultMapping());
  const [mappingError, setMappingError] = useState('');

  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState('');

  const [importJobId, setImportJobId] = useState('');
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobData, setJobData] = useState(null);

  const [failedRowsLoading, setFailedRowsLoading] = useState(false);
  const [failedRowsError, setFailedRowsError] = useState('');
  const [failedRows, setFailedRows] = useState([]);
  const [failedRowsTotal, setFailedRowsTotal] = useState(0);
  const [failedRowsPage, setFailedRowsPage] = useState(0);
  const [failedRowsPageSize, setFailedRowsPageSize] = useState(20);
  const [downloadingFailedRows, setDownloadingFailedRows] = useState(false);

  const importJobIdFromQuery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return String(searchParams.get('import_job_id') || '').trim();
  }, [location.search]);

  const hasIdentityMapping = useMemo(() => {
    return IDENTITY_FIELD_KEYS.some((fieldKey) => String(mapping[fieldKey] || '').trim());
  }, [mapping]);

  const effectiveFailedRowsTotal = useMemo(() => {
    const fromState = Number(failedRowsTotal || 0);
    const fromJob = Number(jobData?.failed_rows || 0);
    const fromCurrentRows = Number(failedRows.length || 0);
    return Math.max(fromState, fromJob, fromCurrentRows);
  }, [failedRowsTotal, jobData?.failed_rows, failedRows.length]);

  const updateImportJobQueryParam = useCallback(
    (nextImportJobId) => {
      const searchParams = new URLSearchParams(location.search);
      if (nextImportJobId) {
        searchParams.set('import_job_id', String(nextImportJobId));
      } else {
        searchParams.delete('import_job_id');
      }
      navigate(
        {
          pathname: '/crm/integrations/imports/leads-csv',
          search: searchParams.toString(),
        },
        { replace: true },
      );
    },
    [location.search, navigate],
  );

  const loadImportJob = useCallback(
    async (targetImportJobId, showLoading = true) => {
      if (!targetImportJobId) return;

      if (showLoading) setJobLoading(true);
      setJobError('');

      try {
        const response = await integrationsApi.getImportJob(targetImportJobId);
        const normalizedJob = normalizeImportJob(response?.data || response);
        setJobData(normalizedJob);
      } catch (error) {
        setJobError(getErrorMessage(error, 'Unable to load import job'));
      } finally {
        if (showLoading) setJobLoading(false);
      }
    },
    [],
  );

  const loadFailedRows = useCallback(
    async (targetImportJobId, page, pageSize, showLoading = true) => {
      if (!targetImportJobId) return;

      if (showLoading) setFailedRowsLoading(true);
      setFailedRowsError('');

      try {
        const response = await integrationsApi.listImportJobRows(targetImportJobId, {
          status: 'failed',
          page: page + 1,
          page_size: pageSize,
          per_page: pageSize,
          limit: pageSize,
        });
        const normalized = normalizeImportRowsResponse(response?.data || response);
        setFailedRows(normalized.rows);
        setFailedRowsTotal(normalized.total);
      } catch (error) {
        setFailedRows([]);
        setFailedRowsError(getErrorMessage(error, 'Unable to load failed rows'));
      } finally {
        if (showLoading) setFailedRowsLoading(false);
      }
    },
    [],
  );

  const fetchAllFailedRows = useCallback(
    async (targetImportJobId) => {
      const collectedRows = [];
      const pageSize = 200;
      let currentPage = 1;
      let maxIterations = 300;
      let expectedTotal = 0;

      while (maxIterations > 0) {
        maxIterations -= 1;
        const response = await integrationsApi.listImportJobRows(targetImportJobId, {
          status: 'failed',
          page: currentPage,
          page_size: pageSize,
          per_page: pageSize,
          limit: pageSize,
        });
        const normalized = normalizeImportRowsResponse(response?.data || response);
        const rows = normalized.rows || [];

        if (!expectedTotal) {
          expectedTotal = Number(normalized.total || 0);
        }

        if (!rows.length) break;

        collectedRows.push(...rows);

        if (expectedTotal > 0 && collectedRows.length >= expectedTotal) break;
        if (rows.length < pageSize) break;

        currentPage += 1;
      }

      return collectedRows;
    },
    [],
  );

  const resetWizard = useCallback(() => {
    setActiveStep(0);
    setCsvText('');
    setSelectedFileName('');
    setInputError('');
    setPreviewError('');
    setPreviewHeaders([]);
    setPreviewRows([]);
    setPreviewTotalRows(0);
    setMapping(getDefaultMapping());
    setMappingError('');
    setStartError('');
    setImportJobId('');
    setJobData(null);
    setJobError('');
    setFailedRows([]);
    setFailedRowsError('');
    setFailedRowsPage(0);
    setFailedRowsTotal(0);
    updateImportJobQueryParam('');
  }, [updateImportJobQueryParam]);

  useEffect(() => {
    if (!importJobIdFromQuery) return;
    setImportJobId(importJobIdFromQuery);
    setActiveStep(3);
  }, [importJobIdFromQuery]);

  useEffect(() => {
    if (!importJobId) return;
    setFailedRowsPage(0);
    loadImportJob(importJobId, true);
  }, [importJobId, loadImportJob]);

  useEffect(() => {
    if (!importJobId) return;
    loadFailedRows(importJobId, failedRowsPage, failedRowsPageSize, true);
  }, [importJobId, failedRowsPage, failedRowsPageSize, loadFailedRows]);

  useEffect(() => {
    const status = normalizeJobStatus(jobData?.status);
    const shouldPoll = importJobId && (status === 'draft' || status === 'running');
    if (!shouldPoll) return undefined;

    const intervalId = setInterval(() => {
      loadImportJob(importJobId, false);
      loadFailedRows(importJobId, failedRowsPage, failedRowsPageSize, false);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [failedRowsPage, failedRowsPageSize, importJobId, jobData?.status, loadFailedRows, loadImportJob]);

  const handleChooseCsvFile = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setSelectedFileName(file.name);
      setCsvText(text);
      setInputError('');
      dispatch(
        OpenalertActions({
          msg: `${file.name} loaded`,
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to read CSV file'),
          severity: 'error',
        }),
      );
    } finally {
      event.target.value = '';
    }
  };

  const handlePreview = async () => {
    if (!String(csvText || '').trim()) {
      setInputError('Paste CSV text or choose a CSV file before preview.');
      return;
    }

    setPreviewLoading(true);
    setInputError('');
    setPreviewError('');

    try {
      const response = await integrationsApi.previewLeadsCsvImport({
        csv_text: csvText,
        original_filename: selectedFileName || undefined,
      });
      const normalized = normalizePreviewResponse(response?.data || response);

      if (!normalized.headers.length) {
        setPreviewError('Preview succeeded but no headers were detected.');
        return;
      }

      setPreviewHeaders(normalized.headers);
      setPreviewRows(normalized.sampleRows.slice(0, 20));
      setPreviewTotalRows(normalized.totalRows);
      setMapping(buildSuggestedMapping(normalized.headers, normalized.detectedFields));
      setMappingError('');
      setActiveStep(1);
      setStartError('');
    } catch (error) {
      setPreviewError(getErrorMessage(error, 'Unable to preview CSV'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleContinueFromMapping = () => {
    if (!hasIdentityMapping) {
      setMappingError('Map at least one identity field: Full Name, Email, or Phone.');
      return;
    }

    setMappingError('');
    setActiveStep(2);
  };

  const handleStartImport = async () => {
    if (!hasIdentityMapping) {
      setMappingError('Map at least one identity field: Full Name, Email, or Phone.');
      setActiveStep(1);
      return;
    }

    setStartLoading(true);
    setStartError('');

    try {
      const sanitizedMapping = Object.entries(mapping).reduce((acc, [key, value]) => {
        const normalizedValue = String(value || '').trim();
        if (normalizedValue) {
          acc[key] = normalizedValue;
        }
        return acc;
      }, {});

      const response = await integrationsApi.startLeadsCsvImport({
        csv_text: csvText,
        mapping: sanitizedMapping,
        source_system: 'csv_import',
        original_filename: selectedFileName || undefined,
      });

      const nextImportJobId = resolveImportJobId(response?.data || response);
      if (!nextImportJobId) {
        throw new Error('Import started but import_job_id was not returned');
      }

      const normalizedImportJobId = String(nextImportJobId);
      setImportJobId(normalizedImportJobId);
      setActiveStep(3);
      updateImportJobQueryParam(normalizedImportJobId);

      dispatch(
        OpenalertActions({
          msg: 'Import started',
          severity: 'success',
        }),
      );
    } catch (error) {
      setStartError(getErrorMessage(error, 'Unable to start import'));
    } finally {
      setStartLoading(false);
    }
  };

  const handleDownloadFailedRows = async () => {
    if (!importJobId) return;

    setDownloadingFailedRows(true);

    try {
      const allFailedRows = await fetchAllFailedRows(importJobId);

      if (!allFailedRows.length) {
        dispatch(
          OpenalertActions({
            msg: 'No failed rows available to download',
            severity: 'info',
          }),
        );
        return;
      }

      const csvRows = allFailedRows.map((row) => ({
        row_number: row.row_number,
        error_message: row.error_message,
        lead_id: row.lead_id || '',
        raw_row_json: stringifyRawRow(row.raw_row_json),
      }));

      downloadCsvFile(
        `import_${importJobId}_failed_rows.csv`,
        ['row_number', 'error_message', 'lead_id', 'raw_row_json'],
        csvRows,
      );

      dispatch(
        OpenalertActions({
          msg: 'Failed rows CSV downloaded',
          severity: 'success',
        }),
      );
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to download failed rows'),
          severity: 'error',
        }),
      );
    } finally {
      setDownloadingFailedRows(false);
    }
  };

  const renderStep1 = () => {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
          Step 1: Upload or Paste CSV
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Choose a CSV file or paste CSV text below, then run preview.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
          <Button variant='outlined' startIcon={<UploadFileIcon />} component='label'>
            Choose CSV File
            <input hidden accept='.csv,text/csv' type='file' onChange={handleChooseCsvFile} />
          </Button>

          {selectedFileName ? (
            <Typography variant='body2' color='text.secondary'>
              Selected: <b>{selectedFileName}</b>
            </Typography>
          ) : null}
        </Box>

        <TextField
          label='CSV Text'
          multiline
          minRows={12}
          fullWidth
          value={csvText}
          onChange={(event) => {
            setCsvText(event.target.value);
            setInputError('');
          }}
          placeholder='Paste CSV content here'
        />

        {inputError ? (
          <Typography color='error' sx={{ mt: 1 }}>
            {inputError}
          </Typography>
        ) : null}

        {previewError ? (
          <Typography color='error' sx={{ mt: 1 }}>
            {previewError}
          </Typography>
        ) : null}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant='contained'
            startIcon={previewLoading ? <CircularProgress color='inherit' size={18} /> : <RefreshIcon />}
            onClick={handlePreview}
            disabled={previewLoading}
          >
            {previewLoading ? 'Previewing...' : 'Preview'}
          </Button>
        </Box>
      </Card>
    );
  };

  const renderStep2 = () => {
    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
            Step 2: Preview & Map Columns
          </Typography>
          <Typography color='text.secondary'>
            Detected headers: <b>{previewHeaders.length}</b> | Preview rows: <b>{previewRows.length}</b> | Total rows:{' '}
            <b>{previewTotalRows || previewRows.length}</b>
          </Typography>
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Column Mapping</Typography>
          <Grid container spacing={2}>
            {MAPPING_FIELDS.map((field) => (
              <Grid
                key={field.key}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
                <TextField
                  select
                  fullWidth
                  label={field.label}
                  value={mapping[field.key] || ''}
                  onChange={(event) => {
                    setMapping((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }));
                    setMappingError('');
                  }}
                >
                  <MenuItem value=''>Not mapped</MenuItem>
                  {previewHeaders.map((header) => (
                    <MenuItem key={`${field.key}_${header}`} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>

          {mappingError ? (
            <Typography color='error' sx={{ mt: 1 }}>
              {mappingError}
            </Typography>
          ) : null}
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Sample Rows (first {previewRows.length})</Typography>

          <TableContainer sx={{ maxHeight: 340 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  {previewHeaders.map((header) => (
                    <TableCell key={`header_${header}`}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={`row_${rowIndex + 1}`}>
                    {previewHeaders.map((header) => (
                      <TableCell key={`cell_${rowIndex + 1}_${header}`}>
                        {String(row?.[header] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' onClick={() => setActiveStep(0)}>
            Back
          </Button>
          <Button variant='contained' onClick={handleContinueFromMapping}>
            Continue
          </Button>
        </Box>
      </Box>
    );
  };

  const renderStep3 = () => {
    const mappedFields = MAPPING_FIELDS.filter((field) => String(mapping[field.key] || '').trim());

    return (
      <Card sx={{ p: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
          Step 3: Start Import
        </Typography>

        <Typography color='text.secondary' sx={{ mb: 1 }}>
          Total rows to process: <b>{previewTotalRows || previewRows.length}</b>
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 1 }}>
          Mapped fields: <b>{mappedFields.length}</b>
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {mappedFields.map((field) => (
          <Typography key={`mapped_${field.key}`} sx={{ mb: 0.5 }}>
            <b>{field.label}:</b> {mapping[field.key]}
          </Typography>
        ))}

        {startError ? (
          <Typography color='error' sx={{ mt: 1.5 }}>
            {startError}
          </Typography>
        ) : null}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant='outlined' onClick={() => setActiveStep(1)} disabled={startLoading}>
            Back
          </Button>
          <Button
            variant='contained'
            startIcon={startLoading ? <CircularProgress color='inherit' size={18} /> : <PlayArrowIcon />}
            onClick={handleStartImport}
            disabled={startLoading}
          >
            {startLoading ? 'Starting...' : 'Start Import'}
          </Button>
        </Box>
      </Card>
    );
  };

  const renderStep4 = () => {
    const statusLabel = formatStatusLabel(jobData?.status);
    const statusLower = normalizeJobStatus(jobData?.status);
    const isRunning = statusLower === 'running' || statusLower === 'draft';

    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Card sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems='center' justifyContent='space-between'>
            <Grid>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                Step 4: Import Results
              </Typography>
              <Typography color='text.secondary'>
                Import Job ID: <b>{importJobId || '-'}</b>
              </Typography>
              {isRunning ? (
                <Typography color='text.secondary'>Import is running. Auto-refresh every 2.5 seconds.</Typography>
              ) : null}
            </Grid>
            <Grid>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant='outlined'
                  startIcon={jobLoading ? <CircularProgress color='inherit' size={18} /> : <RefreshIcon />}
                  onClick={() => {
                    loadImportJob(importJobId, true);
                    loadFailedRows(importJobId, failedRowsPage, failedRowsPageSize, true);
                  }}
                  disabled={jobLoading || failedRowsLoading}
                >
                  Refresh
                </Button>
                <Button variant='contained' onClick={resetWizard}>
                  New Import
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ p: 2 }}>
              <Typography color='text.secondary'>Status</Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {statusLabel}
              </Typography>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <Card sx={{ p: 2 }}>
              <Typography color='text.secondary'>Total</Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {Number(jobData?.total_rows || 0)}
              </Typography>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 2
            }}>
            <Card sx={{ p: 2 }}>
              <Typography color='text.secondary'>Success</Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {Number(jobData?.success_rows || 0)}
              </Typography>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 2
            }}>
            <Card sx={{ p: 2 }}>
              <Typography color='text.secondary'>Failed</Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {Number(jobData?.failed_rows || 0)}
              </Typography>
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 2
            }}>
            <Card sx={{ p: 2 }}>
              <Typography color='text.secondary'>Skipped</Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {Number(jobData?.skipped_rows || 0)}
              </Typography>
            </Card>
          </Grid>
        </Grid>
        <Card sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Timing</Typography>
          <Typography color='text.secondary'>
            Created: {jobData?.createdAt ? moment(jobData.createdAt).format('DD/MM/YYYY HH:mm:ss') : '-'}
          </Typography>
          <Typography color='text.secondary'>
            Started: {jobData?.started_at ? moment(jobData.started_at).format('DD/MM/YYYY HH:mm:ss') : '-'}
          </Typography>
          <Typography color='text.secondary'>
            Finished: {jobData?.finished_at ? moment(jobData.finished_at).format('DD/MM/YYYY HH:mm:ss') : '-'}
          </Typography>
          {jobError ? (
            <Typography color='error' sx={{ mt: 1 }}>
              {jobError}
            </Typography>
          ) : null}
        </Card>
        <Card sx={{ p: 2 }}>
          <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
            <Grid>
              <Typography sx={{ fontWeight: 700 }}>Failed Rows</Typography>
              <Typography color='text.secondary'>
                Showing row-level failures with pagination.
              </Typography>
            </Grid>
            <Grid>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant='outlined'
                  startIcon={downloadingFailedRows ? <CircularProgress size={16} color='inherit' /> : <DownloadIcon />}
                  onClick={handleDownloadFailedRows}
                  disabled={downloadingFailedRows || effectiveFailedRowsTotal === 0}
                >
                  Download Failed Rows CSV
                </Button>
                <Tooltip title='Retry flow can be added in a later slice'>
                  <span>
                    <Button variant='outlined' disabled>
                      Retry Failed Rows
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {failedRowsError ? (
            <Typography color='error' sx={{ mt: 1 }}>
              {failedRowsError}
            </Typography>
          ) : null}

          {failedRowsLoading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={26} />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 420, mt: 1 }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell width={110}>Row #</TableCell>
                      <TableCell width={140}>Status</TableCell>
                      <TableCell>Error</TableCell>
                      <TableCell>Raw Row</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failedRows.length ? (
                      failedRows.map((row) => (
                        <TableRow key={`failed_row_${row.id}`}>
                          <TableCell>{row.row_number}</TableCell>
                          <TableCell>{row.status}</TableCell>
                          <TableCell>{row.error_message || '-'}</TableCell>
                          <TableCell sx={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stringifyRawRow(row.raw_row_json) || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography color='text.secondary'>No failed rows found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component='div'
                count={effectiveFailedRowsTotal}
                page={failedRowsPage}
                onPageChange={(_event, nextPage) => setFailedRowsPage(nextPage)}
                rowsPerPage={failedRowsPageSize}
                onRowsPerPageChange={(event) => {
                  setFailedRowsPage(0);
                  setFailedRowsPageSize(Number(event.target.value));
                }}
                rowsPerPageOptions={[20, 50, 100]}
              />
            </>
          )}
        </Card>
      </Box>
    );
  };

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant='h5' sx={{ fontWeight: 700 }}>
          CSV Import Wizard
        </Typography>
        <Typography color='text.secondary'>
          Preview CSV, map columns, run import, and monitor row-level results.
        </Typography>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {activeStep === 0 ? renderStep1() : null}
      {activeStep === 1 ? renderStep2() : null}
      {activeStep === 2 ? renderStep3() : null}
      {activeStep === 3 ? renderStep4() : null}

      <Card sx={{ p: 2, mt: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Manual Test Checklist</Typography>
        <Typography color='text.secondary'>1. Paste/upload CSV and click Preview.</Typography>
        <Typography color='text.secondary'>2. Verify headers/sample rows and adjust field mapping.</Typography>
        <Typography color='text.secondary'>3. Start import and confirm an import_job_id is generated.</Typography>
        <Typography color='text.secondary'>4. Verify counters update and failed rows are paginated.</Typography>
        <Typography color='text.secondary'>5. Download failed rows CSV from results.</Typography>
      </Card>
    </Box>
  );
}
