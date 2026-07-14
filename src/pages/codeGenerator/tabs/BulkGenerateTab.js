import React, { useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, IconButton, Snackbar,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, Tooltip, Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import codeGeneratorService from '../services/codeGeneratorService';
import {
  COLUMNS, buildSampleCsv, parseFile, validateAll, buildErrorCsv, downloadString,
} from '../shared/bulkParse';
import useCodePermissions from '../shared/usePermissions';

const PREVIEW_PAGE_SIZE = 50;

export default function BulkGenerateTab() {
  const { canCreate } = useCodePermissions();
  const [fileName, setFileName] = useState(null);
  const [rowsRaw, setRowsRaw] = useState([]);
  const [items, setItems] = useState([]); // [{rowIndex, raw, status, payload?, error?}]
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success: [], errors: [], total }
  const [page, setPage] = useState(0);
  const [snack, setSnack] = useState({ open: false, severity: 'info', msg: '' });
  const fileRef = useRef(null);

  const counts = useMemo(() => {
    const ready = items.filter((x) => x.status === 'ready').length;
    const errors = items.filter((x) => x.status === 'error').length;
    return { total: items.length, ready, errors };
  }, [items]);

  const reset = () => {
    setFileName(null); setRowsRaw([]); setItems([]); setResult(null); setPage(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!file) return;
    setParsing(true); setResult(null); setItems([]); setRowsRaw([]); setPage(0);
    setFileName(file.name);
    try {
      const rows = await parseFile(file);
      setRowsRaw(rows);
      const validated = validateAll(rows);
      setItems(validated);
      const counts2 = {
        ready: validated.filter((x) => x.status === 'ready').length,
        errors: validated.filter((x) => x.status === 'error').length,
      };
      setSnack({
        open: true,
        severity: counts2.errors > 0 ? 'warning' : 'success',
        msg: `Parsed ${rows.length} rows — ${counts2.ready} ready, ${counts2.errors} with errors`,
      });
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.message || 'Parse failed' });
    } finally {
      setParsing(false);
    }
  };

  const submit = async () => {
    const ready = items.filter((x) => x.status === 'ready');
    if (ready.length === 0) {
      setSnack({ open: true, severity: 'warning', msg: 'No ready rows to submit' });
      return;
    }
    setSubmitting(true); setResult(null);
    try {
      const res = await codeGeneratorService.bulkGenerate({
        rows: ready.map((x) => x.payload),
      });
      const data = res?.data?.data || { success: [], errors: [], total: ready.length };

      // Re-key server errors back to original parsed rowIndex (since server saw only the ready subset).
      const remappedErrors = (data.errors || []).map((e) => ({
        ...e,
        row_index: ready[e.row_index]?.rowIndex ?? e.row_index,
      }));
      const remappedSuccess = (data.success || []).map((s) => ({
        ...s,
        row_index: ready[s.row_index]?.rowIndex ?? s.row_index,
      }));

      setResult({
        total: ready.length,
        success: remappedSuccess,
        errors: remappedErrors,
      });

      // Mark items in the preview table.
      setItems((prev) => prev.map((it) => {
        if (it.status !== 'ready') return it;
        const ok = remappedSuccess.find((s) => s.row_index === it.rowIndex);
        if (ok) return { ...it, status: 'success', code_value: ok.code_value, code_id: ok.code_id };
        const err = remappedErrors.find((e) => e.row_index === it.rowIndex);
        if (err) return { ...it, status: 'failed', error: err.error };
        return it;
      }));
      setSnack({
        open: true,
        severity: remappedErrors.length > 0 ? 'warning' : 'success',
        msg: `${remappedSuccess.length} created, ${remappedErrors.length} failed`,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bulk generate failed';
      setSnack({ open: true, severity: 'error', msg });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => downloadString('codes_bulk_template.csv', buildSampleCsv());

  const downloadFailed = () => {
    const failed = items.filter((it) => it.status === 'failed' || it.status === 'error');
    if (failed.length === 0) return;
    const errorObjs = failed.map((it) => ({
      row_index: it.rowIndex,
      error: it.error || 'unknown error',
    }));
    const csv = buildErrorCsv(errorObjs, rowsRaw);
    downloadString('codes_bulk_failed.csv', csv);
  };

  const visibleItems = useMemo(
    () => items.slice(page * PREVIEW_PAGE_SIZE, (page + 1) * PREVIEW_PAGE_SIZE),
    [items, page],
  );

  return (
    <Box sx={{ p: 2 }}>
      {!canCreate ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have view-only access. Ask an Administrator to grant Bulk-upload rights.
        </Alert>
      ) : null}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained" startIcon={<UploadFileOutlinedIcon />}
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={!canCreate || parsing || submitting}
        >
          {fileName ? 'Replace file' : 'Upload CSV / Excel'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        />
        <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={downloadTemplate}>
          Download template
        </Button>
        {fileName ? (
          <Tooltip title="Reset and start over"><span>
            <IconButton onClick={reset} disabled={submitting}><RestartAltIcon /></IconButton>
          </span></Tooltip>
        ) : null}
        <Box sx={{ flex: 1 }} />
        {fileName ? <Typography variant="caption" color="text.secondary">{fileName}</Typography> : null}
      </Stack>

      {parsing ? (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : null}

      {!parsing && items.length === 0 ? (
        <Alert severity="info" icon={<CloudUploadOutlinedIcon />}>
          Upload a CSV or Excel file. Each row generates one code. Click{' '}
          <strong>Download template</strong> for a sample file with all{' '}
          <code>{COLUMNS.length}</code> columns and example rows for every code type.
          Per-type metadata (mrp / asset_tag / emp_id / phone / gstin / …) is read from
          the row's <code>code_type</code> — unrelated cells are silently ignored.
          Use the <code>metadata_json</code> column as an escape hatch for any field
          not covered by the standard columns.
        </Alert>
      ) : null}

      {items.length > 0 ? (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} alignItems="center">
            <Chip label={`Total ${counts.total}`} />
            <Chip color="success" label={`Ready ${counts.ready}`} />
            <Chip color={counts.errors > 0 ? 'warning' : 'default'} label={`Errors ${counts.errors}`} />
            <Box sx={{ flex: 1 }} />
            {(counts.errors > 0 || (result && result.errors.length > 0)) ? (
              <Button onClick={downloadFailed} startIcon={<DownloadOutlinedIcon />}>
                Download failed rows
              </Button>
            ) : null}
            <Button
              variant="contained"
              onClick={submit}
              disabled={!canCreate || submitting || counts.ready === 0}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
            >
              {submitting ? 'Generating…' : `Generate ${counts.ready} code${counts.ready === 1 ? '' : 's'}`}
            </Button>
          </Stack>

          {result ? (
            <Alert severity={result.errors.length > 0 ? 'warning' : 'success'} sx={{ mb: 1.5 }}>
              {result.success.length} created · {result.errors.length} failed (out of {result.total} ready rows)
            </Alert>
          ) : null}

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>#</TableCell>
                  <TableCell sx={{ width: 100 }}>Status</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Prefix</TableCell>
                  <TableCell>Code value</TableCell>
                  <TableCell>Display name</TableCell>
                  <TableCell>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleItems.map((it) => {
                  const r = it.raw || {};
                  let chip;
                  if (it.status === 'ready')   chip = <Chip size="small" label="Ready"   color="success" sx={{ height: 20 }} />;
                  if (it.status === 'success') chip = <Chip size="small" label="Created" color="success" sx={{ height: 20 }} />;
                  if (it.status === 'error')   chip = <Chip size="small" label="Invalid" color="warning" sx={{ height: 20 }} />;
                  if (it.status === 'failed')  chip = <Chip size="small" label="Failed"  color="error"   sx={{ height: 20 }} />;
                  const detail = it.status === 'success'
                    ? <code>{it.code_value}</code>
                    : (it.error ? <Typography variant="caption" color={it.status === 'failed' ? 'error.main' : 'warning.main'}>{it.error}</Typography> : '');
                  return (
                    <TableRow key={it.rowIndex} hover>
                      <TableCell>{it.rowIndex + 1}</TableCell>
                      <TableCell>{chip}</TableCell>
                      <TableCell>{r.mode}</TableCell>
                      <TableCell>{r.code_type}</TableCell>
                      <TableCell>{r.code_format}</TableCell>
                      <TableCell>{r.prefix}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.code_value || ''}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.display_name || ''}>{r.display_name || ''}</TableCell>
                      <TableCell sx={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={typeof detail === 'string' ? detail : ''}>{detail}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={items.length}
            page={page}
            rowsPerPage={PREVIEW_PAGE_SIZE}
            rowsPerPageOptions={[PREVIEW_PAGE_SIZE]}
            onPageChange={(_e, p) => setPage(p)}
            onRowsPerPageChange={() => {}}
            sx={{ '& .MuiToolbar-root': { minHeight: 40 } }}
          />
        </>
      ) : null}

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.disabled">
        Each row is processed in its own transaction; partial success is supported. Server-side max
        batch size is 5000 rows per upload.
      </Typography>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
