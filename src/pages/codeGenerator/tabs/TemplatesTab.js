import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, IconButton, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import codeGeneratorService from '../services/codeGeneratorService';
import TemplateEditor from '../components/TemplateEditor';
import useCodePermissions from '../shared/usePermissions';
import { getStarterTemplatesPayload, STARTER_TEMPLATE_SUMMARIES } from '../shared/starterTemplates';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

export default function TemplatesTab() {
  const { canCreate, canEdit, canDelete } = useCodePermissions();
  const [rows, setRows] = useState([]);
  const [installing, setInstalling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });

  const fetchRows = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await codeGeneratorService.listTemplates({});
      setRows(res?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load templates');
      setRows([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const onSave = async (payload, id) => {
    try {
      if (id) await codeGeneratorService.updateTemplate(id, payload);
      else    await codeGeneratorService.createTemplate(payload);
      setSnack({ open: true, severity: 'success', msg: id ? 'Template updated' : 'Template created' });
      await fetchRows();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Save failed';
      setSnack({ open: true, severity: 'error', msg });
      throw err;
    }
  };

  const onSetDefault = async (row) => {
    try {
      await codeGeneratorService.setTemplateDefault(row.template_id);
      setSnack({ open: true, severity: 'success', msg: 'Set as default' });
      await fetchRows();
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.response?.data?.error || err?.message || 'Failed' });
    }
  };

  const onInstallStarters = async () => {
    const summary = STARTER_TEMPLATE_SUMMARIES
      .map((t) => `  • ${t.name} (${t.format}, ${t.size})`).join('\n');
    if (!window.confirm(`Install ${STARTER_TEMPLATE_SUMMARIES.length} starter templates for Indian electronics retail?\n\n${summary}\n\nThey will be created alongside your existing templates (no overwrite). You can edit, set defaults, or delete them afterwards.`)) {
      return;
    }
    setInstalling(true);
    let created = 0;
    let failed = 0;
    /* eslint-disable no-await-in-loop */
    for (const tpl of getStarterTemplatesPayload()) {
      try {
        await codeGeneratorService.createTemplate(tpl);
        created += 1;
      } catch (_err) {
        failed += 1;
      }
    }
    /* eslint-enable no-await-in-loop */
    setInstalling(false);
    setSnack({
      open: true,
      severity: failed > 0 ? 'warning' : 'success',
      msg: `Installed ${created} template${created === 1 ? '' : 's'}${failed > 0 ? `, ${failed} failed` : ''}`,
    });
    await fetchRows();
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete template "${row.name}"?`)) return;
    try {
      await codeGeneratorService.deleteTemplate(row.template_id);
      setSnack({ open: true, severity: 'success', msg: 'Template deleted' });
      await fetchRows();
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.response?.data?.error || err?.message || 'Delete failed' });
    }
  };

  // Inline full-page editor mode — replaces the list while open. Mirrors the
  // pattern used in src/pages/common/docTemplates/index.js.
  if (editorOpen) {
    return (
      <TemplateEditor
        template={editing}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        onSaved={onSave}
      />
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">{rows.length} template{rows.length === 1 ? '' : 's'}</Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeOutlinedIcon />}
          onClick={onInstallStarters}
          disabled={!canCreate || installing}
        >
          {installing ? 'Installing…' : 'Install starter templates'}
        </Button>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setEditing(null); setEditorOpen(true); }}
          disabled={!canCreate}>
          New template
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert> : null}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Applies to</TableCell>
              <TableCell>Paper</TableCell>
              <TableCell align="right">W × H (mm)</TableCell>
              <TableCell align="right">Sheet (R × C)</TableCell>
              <TableCell>Orientation</TableCell>
              <TableCell>Default</TableCell>
              <TableCell align="right" sx={{ width: 140 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                No templates yet — click “New template” to create the first one.
              </TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.template_id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.code_type ? <Chip size="small" sx={{ height: 20 }} label={r.code_type} /> : <Typography variant="caption" color="text.disabled">Any</Typography>}</TableCell>
                <TableCell>{r.paper_size || '—'}</TableCell>
                <TableCell align="right">{Number(r.width_mm)} × {Number(r.height_mm)}</TableCell>
                <TableCell align="right">{r.rows_per_sheet} × {r.cols_per_sheet}</TableCell>
                <TableCell>{r.orientation}</TableCell>
                <TableCell>
                  {r.is_default ? <Chip size="small" color="success" sx={{ height: 20 }} label="Default" /> : null}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={r.is_default ? 'Already default' : (canEdit ? 'Set as default for this type' : 'Requires edit permission')}>
                    <span>
                      <IconButton size="small" onClick={() => onSetDefault(r)} disabled={!canEdit || !!r.is_default}>
                        {r.is_default ? <StarIcon fontSize="small" color="success" /> : <StarOutlineIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={canEdit ? 'Edit' : 'Requires edit permission'}>
                    <span><IconButton size="small" onClick={() => { setEditing(r); setEditorOpen(true); }} disabled={!canEdit}><EditOutlinedIcon fontSize="small" /></IconButton></span>
                  </Tooltip>
                  <Tooltip title={canDelete ? 'Delete' : 'Requires delete permission'}>
                    <span><IconButton size="small" onClick={() => onDelete(r)} disabled={!canDelete}><DeleteOutlineIcon fontSize="small" /></IconButton></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
