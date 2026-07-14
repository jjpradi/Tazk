import React, { useEffect, useState, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  InputAdornment,
  Link,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { amountCellSx, fmtINR, fmtCrDr, fmtDate, reportTheme } from '../reportUtils';
import reportsApi from '../reportsApi';

/**
 * DrilldownDrawer — Right-side drawer showing ledger vouchers.
 *
 * Backend shape (getLedgerVouchers):
 *   data.openingBalance.net, data.entries[], data.closingBalance.net, data.pagination
 *   entries[]: { transactionId, date, voucherCode, voucherTypeDisplay, narration,
 *               debit, credit, runningBalance, specialNumber, entity, ... }
 */
const DrilldownDrawer = ({
  open,
  onClose,
  accountId,
  accountName,
  fromDate,
  toDate,
  onVoucherClick,
  onNavigateToLedger,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState('');

  const fetchVouchers = useCallback(async (pg, searchTerm) => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await reportsApi.ledgerVouchers(accountId, {
        from: fromDate,
        to: toDate,
        page: pg + 1,
        pageSize,
        search: searchTerm || undefined,
      });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('DrilldownDrawer fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, fromDate, toDate, pageSize]);

  useEffect(() => {
    if (open && accountId) {
      setPage(0);
      setSearch('');
      fetchVouchers(0, '');
    }
  }, [open, accountId, fetchVouchers]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchVouchers(newPage, search);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchVouchers(0, search);
    }
  };

  const entries = data?.entries || [];
  const pagination = data?.pagination || {};
  const openingNet = data?.openingBalance?.net;

  const cellSx = {
    py: 0.5,
    px: 1,
    fontSize: '0.78rem',
    borderBottom: `1px solid ${reportTheme.borderColor}`,
  };

  const headerCellSx = {
    ...cellSx,
    fontWeight: 700,
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    bgcolor: reportTheme.headerBg,
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 680 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ── Header ── */}
        <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid ${reportTheme.borderColor}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {accountName || 'Ledger Vouchers'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {fmtDate(fromDate)} to {fmtDate(toDate)}
                {pagination.totalRows > 0 && ` | ${pagination.totalRows} entries`}
              </Typography>
            </Box>
            {onNavigateToLedger && accountId && (
              <Tooltip title="Open full ledger page">
                <IconButton
                  size="small"
                  sx={{ mr: 0.5 }}
                  onClick={() => onNavigateToLedger(accountId)}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Search within drawer */}
          <TextField
            size="small"
            fullWidth
            placeholder="Search voucher no., narration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 1 }}
          />

          {/* Opening balance */}
          {openingNet != null && (
            <Box sx={{ px: 1, py: 0.5, bgcolor: reportTheme.sectionBg, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Opening Balance: {fmtCrDr(openingNet)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Body ── */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: '100%' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Date</TableCell>
                    <TableCell sx={headerCellSx}>Voucher No.</TableCell>
                    <TableCell sx={headerCellSx}>Type</TableCell>
                    <TableCell sx={{ ...headerCellSx, maxWidth: 140 }}>Narration</TableCell>
                    <TableCell align="right" sx={headerCellSx}>Debit</TableCell>
                    <TableCell align="right" sx={headerCellSx}>Credit</TableCell>
                    <TableCell align="right" sx={headerCellSx}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow
                      key={e.transactionId}
                      hover
                      sx={{ '&:hover': { bgcolor: reportTheme.hoverBg } }}
                    >
                      <TableCell sx={cellSx}>{fmtDate(e.date)}</TableCell>
                      <TableCell sx={cellSx}>
                        {onVoucherClick ? (
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontSize: 'inherit', color: reportTheme.accentColor, fontWeight: 500 }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onVoucherClick(e.transactionId);
                            }}
                          >
                            {e.voucherCode || '-'}
                          </Link>
                        ) : (
                          e.voucherCode || '-'
                        )}
                      </TableCell>
                      <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>
                        {e.voucherTypeDisplay || 'Other'}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellSx,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'text.secondary',
                        }}
                        title={e.narration || ''}
                      >
                        {e.narration || '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                        {Number(e.debit) ? fmtINR(e.debit) : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                        {Number(e.credit) ? fmtINR(e.credit) : ''}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                        {fmtCrDr(e.runningBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ ...cellSx, textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No vouchers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* ── Footer pagination ── */}
        {pagination.totalRows > 0 && (
          <Box sx={{ borderTop: `1px solid ${reportTheme.borderColor}` }}>
            <TablePagination
              component="div"
              count={pagination.totalRows || 0}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[25]}
              sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 }, fontSize: '0.75rem' }}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DrilldownDrawer;
