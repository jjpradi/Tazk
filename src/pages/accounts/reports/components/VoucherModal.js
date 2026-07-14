import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import { amountCellSx, fmtINR, fmtDate, reportTheme } from '../reportUtils';
import reportsApi from '../reportsApi';

/**
 * VoucherModal — Full voucher detail in a dialog.
 *
 * Backend shape (getVoucherDetail) — FLAT structure:
 *   data.transactionId, data.date, data.voucherCode, data.voucherTypeDisplay,
 *   data.narration, data.specialNumber, data.entity, data.transactionStatus,
 *   data.lines[], data.totalDebit, data.totalCredit, data.isBalanced
 *   lines[]: { entryId, accountId, accountName, accountCode, debit, credit, entryDescription, ... }
 */
const VoucherModal = ({ open, onClose, transactionId }) => {
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState(null);

  useEffect(() => {
    if (!open || !transactionId) return;
    setLoading(true);
    reportsApi
      .voucherDetail(transactionId)
      .then((res) => setVoucher(res.data?.data || null))
      .catch((err) => console.error('VoucherModal fetch error', err))
      .finally(() => setLoading(false));
  }, [open, transactionId]);

  const lines = voucher?.lines || [];

  const cellSx = {
    py: 0.5,
    px: 1,
    fontSize: '0.8rem',
    borderBottom: `1px solid ${reportTheme.borderColor}`,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, fontSize: '1rem', fontWeight: 600 }}>
        Voucher Detail
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !voucher ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            No data found
          </Typography>
        ) : (
          <>
            {/* Header details — fields are at top level of voucher object */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Field label="Date" value={fmtDate(voucher.date)} />
              <Field label="Voucher No." value={voucher.voucherCode || '-'} />
              <Field label="Type">
                <Chip label={voucher.voucherTypeDisplay || 'Other'} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
              </Field>
              {voucher.specialNumber && <Field label="Ref / Special #" value={voucher.specialNumber} />}
              {voucher.entity && <Field label="Entity" value={voucher.entity} />}
              {voucher.transactionStatus && <Field label="Status" value={voucher.transactionStatus} />}
            </Box>

            {/* Narration */}
            {voucher.narration && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500, letterSpacing: 0.3, mb: 0.25 }}>
                  Narration
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
                  {voucher.narration}
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Line items */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>#</TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Account</TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Description</TableCell>
                    <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Debit</TableCell>
                    <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Credit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, i) => (
                    <TableRow key={l.entryId || i}>
                      <TableCell sx={cellSx}>{i + 1}</TableCell>
                      <TableCell sx={cellSx}>
                        <Box sx={{ fontSize: '0.8rem' }}>{l.accountName}</Box>
                        {l.accountCode && <Box sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{l.accountCode}</Box>}
                      </TableCell>
                      <TableCell sx={{ ...cellSx, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.entryDescription || '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                        {Number(l.debit) ? fmtINR(l.debit) : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                        {Number(l.credit) ? fmtINR(l.credit) : ''}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals row */}
                  <TableRow sx={{ bgcolor: reportTheme.sectionBg }}>
                    <TableCell colSpan={3} sx={{ ...cellSx, fontWeight: 700 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 700 }}>
                      {fmtINR(voucher.totalDebit)}
                    </TableCell>
                    <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 700 }}>
                      {fmtINR(voucher.totalCredit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Balanced indicator */}
            {voucher.isBalanced != null && (
              <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                <Chip
                  label={voucher.isBalanced ? 'Balanced' : `Unbalanced (${fmtINR(Math.abs((voucher.totalDebit || 0) - (voucher.totalCredit || 0)))})`}
                  size="small"
                  color={voucher.isBalanced ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** Small label/value pair for the voucher header. */
const Field = ({ label, value, children }) => (
  <Box>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.3 }}>
      {label}
    </Typography>
    {children || (
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
        {value}
      </Typography>
    )}
  </Box>
);

export default VoucherModal;
