import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Card, Typography, Button, IconButton, TextField, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { titleURL } from 'http-common';
import SequencePattern from '../../services/sequencePattern_service';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import { OpenalertActions } from '../../redux/actions/alert_actions';
import { useDispatch, useSelector } from 'react-redux';
import { getsessionStorage } from 'pages/common/login/cookies';

const TOKEN_HELP = [
  { token: '{P}', desc: 'Prefix / Short Code (e.g., INV, REC, PAY)' },
  { token: '{FY}', desc: 'Financial Year (e.g., 26-27)' },
  { token: '{SEQ}', desc: 'Counter (no padding)' },
  { token: '{SEQ:3}', desc: 'Counter with min 3-digit padding (001, 012, 1234)' },
  { token: '{SEQ:4}', desc: 'Counter with min 4-digit padding (0001)' },
  { token: '{SEQ:5}', desc: 'Counter with min 5-digit padding (00001)' },
];

// Preview the pattern with sample values
function previewPattern(pattern, shortCode) {
  if (!pattern) return '';
  let result = pattern;
  const now = new Date();
  const fy = now.getMonth() >= 3
    ? `${String(now.getFullYear()).slice(-2)}-${String(now.getFullYear() + 1).slice(-2)}`
    : `${String(now.getFullYear() - 1).slice(-2)}-${String(now.getFullYear()).slice(-2)}`;
  result = result.replace(/\{P\}/g, shortCode || 'XXX');
  result = result.replace(/\{FY\}/g, fy);
  result = result.replace(/\{SEQ:(\d+)\}/g, (_, d) => '1'.padStart(Number(d), '0'));
  result = result.replace(/\{SEQ\}/g, '1');
  return result;
}

const VOUCHER_LABELS = {
  'SALESINV SEQUENCE': 'Sales Invoice',
  'SO SEQUENCE': 'Sales Order',
  'DC SEQUENCE': 'Delivery Challan',
  'PO SEQUENCE': 'Purchase Order',
  'PURCHASEINVOICE SEQUENCE': 'Purchase Invoice',
  'RECEIPTS SEQUENCE': 'Customer Receipt',
  'PAYMENTS SEQUENCE': 'Vendor Payment',
  'SALESRETURN SEQUENCE': 'Sales Return',
  'PURCHASERETURN SEQUENCE': 'Purchase Return',
  'DCRETURN SEQUENCE': 'DC Return',
  'CREDIT NOTE SEQUENCE': 'Credit Note',
  'DEBIT NOTE SEQUENCE': 'Debit Note',
  'QUOTATION SEQUENCE': 'Quotation',
  'POS SEQUENCE': 'POS Invoice',
  'POTCODE SEQUENCE': 'POS Code',
  'DEFECTS SEQUENCE': 'Defects',
  'SEND DEFECTS SEQUENCE': 'Send Defects',
  'CUSTOMER REPLACEMENT SEQUENCE': 'Customer Replacement',
  'VENDOR REPLACEMENT SEQUENCE': 'Vendor Replacement',
  'Journal Entry Sequence': 'Journal Entry',
  'QR SEQUENCE': 'QR Code'
};

export default function DocumentSequences() {
  const dispatch = useDispatch();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, seq: null });
  const [editForm, setEditForm] = useState({ short_code: '', pattern: '', fy_reset_enabled: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSequences(); }, []);

  // POS SEQUENCE only for POS company type (2), not Sales (3)
  const storage = getsessionStorage();
  const companyType = Number(storage?.company_type) || 3;
  const POS_ONLY_SEQUENCES = ['POS SEQUENCE', 'POTCODE SEQUENCE'];
  const HIDDEN_SEQUENCES = ['BARCODE SEQUENCE', 'LEDGER SEQUENCE', 'LOAN SEQUENCE'];

  const loadSequences = async () => {
    setLoading(true);
    try {
      const res = await SequencePattern.getAllSequences();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const filtered = data.filter(s => {
        if (!s.sequence_name) return false;
        if (HIDDEN_SEQUENCES.includes(s.sequence_name)) return false;
        // POS sequences only for POS company type
        if (POS_ONLY_SEQUENCES.includes(s.sequence_name) && companyType !== 2) return false;
        return true;
      });
      setSequences(filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEdit = (seq) => {
    setEditForm({ short_code: seq.short_code, pattern: seq.pattern || '{P}/{FY}/{SEQ:3}', fy_reset_enabled: seq.fy_reset_enabled !== 0 });
    setEditDialog({ open: true, seq });
  };

  const isQrSequence = editDialog.seq?.sequence_name === 'QR SEQUENCE';
  const qrPreview = previewPattern(editForm.pattern, editForm.short_code);
  const qrPrefixError = isQrSequence && editForm.short_code
    ? (!/^[A-Za-z]{2,4}$/.test(editForm.short_code) ? 'Must be 2-4 letters only (no numbers or symbols)' : null)
    : (isQrSequence ? 'Prefix is required (2-4 letters)' : null);
  const qrPatternTextOnly = isQrSequence
    ? editForm.pattern.replace(/\{P\}|\{FY\}|\{SEQ(:\d+)?\}/g, '').replace(/[^A-Za-z]/g, '')
    : '';
  const qrFreeTextError = isQrSequence && qrPatternTextOnly.length > 4
    ? `Only 2-4 letters allowed in pattern (found ${qrPatternTextOnly.length} letters)` : null;
  const qrSymbolError = isQrSequence && !qrFreeTextError && editForm.pattern.includes('{P}') && !/\{P\}[^{A-Za-z0-9]/.test(editForm.pattern)
    ? 'A separator symbol is required after prefix (e.g., -, /)' : null;
  const qrLengthError = isQrSequence && qrPreview.length > 15
    ? `Preview is ${qrPreview.length} chars — max 15 allowed` : null;
  const hasQrError = isQrSequence && (qrPrefixError || qrFreeTextError || qrSymbolError || qrLengthError);

  const handleSave = async () => {
    if (!editDialog.seq) return;
    if (hasQrError) {
      dispatch(OpenalertActions({ msg: qrPrefixError || qrFreeTextError || qrSymbolError || qrLengthError, severity: 'warning' }));
      return;
    }
    setSaving(true);
    try {
      await SequencePattern.update(editDialog.seq.sequence_id, {
        short_code: editForm.short_code,
        pattern: editForm.pattern,
        fy_reset_enabled: editForm.fy_reset_enabled ? 1 : 0,
      });
      dispatch(OpenalertActions({ msg: 'Sequence pattern updated', severity: 'success' }));
      setEditDialog({ open: false, seq: null });
      loadSequences();
    } catch (err) {
      dispatch(OpenalertActions({ msg: 'Failed to update', severity: 'error' }));
    }
    finally { setSaving(false); }
  };

  return (
    <>
      <Helmet><title>{titleURL} | Document Sequences</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 1.5 }}>

        {/* Header */}
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormatListNumberedIcon sx={{ color: '#1976d2' }} />
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>Document Sequences</Typography>
              <Typography sx={{ fontSize: 11, color: '#999' }}>Configure voucher numbering patterns for all document types</Typography>
            </Box>
          </Box>
          <Tooltip title="Pattern tokens: {P} = prefix, {FY} = financial year, {SEQ:N} = counter with N-digit padding" arrow>
            <IconButton size="small"><InfoOutlinedIcon /></IconButton>
          </Tooltip>
        </Card>

        {/* Token Reference */}
        <Card sx={{ px: 2, py: 1.5 }} elevation={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Available Tokens:</Typography>
            {TOKEN_HELP.map(t => (
              <Chip key={t.token} label={`${t.token} — ${t.desc}`} size="small" variant="outlined"
                sx={{ fontSize: 10, height: 24 }} />
            ))}
          </Box>
        </Card>

        {/* Table */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0}>
          {loading && <LinearProgress />}
          <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Document Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Sequence Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Prefix</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Pattern</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Preview</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Current #</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Last FY</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>FY Reset</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', width: 60 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sequences.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                      No sequences found
                    </TableCell>
                  </TableRow>
                ) : sequences.map((seq) => {
                  const label = VOUCHER_LABELS[seq.sequence_name] || seq.sequence_name;
                  const preview = previewPattern(seq.pattern, seq.short_code);
                  return (
                    <TableRow key={seq.sequence_id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{label}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: '#999' }}>{seq.sequence_name}</TableCell>
                      <TableCell>
                        <Chip label={seq.short_code} size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: '#1976d2' }}>{seq.pattern || '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2e7d32', bgcolor: '#F1F8E9', px: 1, py: 0.3, borderRadius: 1, display: 'inline-block' }}>
                          {preview || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{seq.current_seq}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: '#999' }}>{seq.last_reset_fy || '-'}</TableCell>
                      <TableCell>
                        <Chip label={seq.fy_reset_enabled !== 0 ? 'On' : 'Off'} size="small"
                          color={seq.fy_reset_enabled !== 0 ? 'success' : 'default'} variant="outlined" sx={{ fontSize: 10 }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEdit(seq)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, seq: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Sequence Pattern
          <IconButton size="small" onClick={() => setEditDialog({ open: false, seq: null })}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {VOUCHER_LABELS[editDialog.seq?.sequence_name] || editDialog.seq?.sequence_name}
            </Typography>

            <TextField fullWidth size="small" label="Prefix (Short Code)" value={editForm.short_code}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (isQrSequence && val.length > 4) return;
                setEditForm(prev => ({ ...prev, short_code: isQrSequence ? val.replace(/[^A-Za-z]/g, '') : val }));
              }}
              error={!!qrPrefixError}
              helperText={qrPrefixError || (isQrSequence ? 'QR prefix: 2-4 letters only (e.g., QR, QROP)' : 'The prefix that appears at the start of the number (e.g., INV, REC, PAY)')} />

            <TextField fullWidth size="small" label="Pattern" value={editForm.pattern}
              onChange={(e) => setEditForm(prev => ({ ...prev, pattern: e.target.value }))}
              error={!!(qrFreeTextError || qrSymbolError)}
              helperText={qrFreeTextError || qrSymbolError || (isQrSequence
                ? 'QR pattern needs a symbol separator (e.g., {P}-{SEQ:8})'
                : 'Use tokens: {P} = prefix, {FY} = financial year, {SEQ:3} = 3-digit padded counter')}
              sx={{ '& input': { fontFamily: 'monospace' } }} />

            <Box sx={{ p: 2, bgcolor: qrLengthError ? '#FFF3F3' : '#F5F7FA', borderRadius: 1, border: qrLengthError ? '1px solid #d32f2f' : 'none' }}>
              <Typography sx={{ fontSize: 11, color: '#666', mb: 0.5 }}>Preview (next number will look like):</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: qrLengthError ? '#d32f2f' : '#2e7d32', fontFamily: 'monospace' }}>
                {qrPreview}
              </Typography>
              {isQrSequence && (
                <Typography sx={{ fontSize: 11, mt: 0.5, color: qrLengthError ? '#d32f2f' : '#666', fontWeight: qrLengthError ? 600 : 400 }}>
                  {qrPreview.length}/15 characters{qrLengthError ? ' — exceeds max limit!' : ''}
                </Typography>
              )}
            </Box>

            <FormControlLabel
              control={<Switch checked={editForm.fy_reset_enabled}
                onChange={(e) => setEditForm(prev => ({ ...prev, fy_reset_enabled: e.target.checked }))} />}
              label={<Typography sx={{ fontSize: 13 }}>Reset counter at Financial Year start (April 1)</Typography>}
            />
            {!editForm.fy_reset_enabled && (
              <Typography sx={{ fontSize: 11, color: '#ed6c02', ml: 4, mt: -1 }}>
                Counter will continue across financial years without resetting.
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              <Typography sx={{ fontSize: 11, color: '#999', width: '100%', mb: 0.5 }}>Quick patterns:</Typography>
              {[
                { label: 'Standard', pattern: '{P}/{FY}/{SEQ:3}' },
                { label: 'No FY', pattern: '{P}-{SEQ:3}' },
                { label: '4-digit', pattern: '{P}/{FY}/{SEQ:4}' },
                ...(editDialog.seq?.sequence_name === 'QR SEQUENCE' ? [{ label: 'Plain', pattern: '{SEQ:8}' }] : [{ label: 'Plain', pattern: '{SEQ}' }]),
              ].map(q => (
                <Chip key={q.label} label={`${q.label}: ${q.pattern}`} size="small" variant="outlined"
                  onClick={() => setEditForm(prev => ({ ...prev, pattern: q.pattern }))}
                  sx={{ fontSize: 10, cursor: 'pointer' }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, seq: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !editForm.pattern || !!hasQrError}
            startIcon={<SaveIcon />}>
            {saving ? 'Saving...' : 'Update Pattern'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
