import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Link,
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import VoucherModal from './components/VoucherModal';
import { getCurrentFY, fmtINR, fmtCrDr, fmtDate, exportCSV, amountCellSx, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';

/**
 * LedgerPage — Full ledger view for a single account.
 *
 * Backend shapes:
 *   ledgerSummary: { ledger, openingBalance.net, closingBalance.net, quickStats, months[], meta }
 *   ledgerVouchers: { ledger, openingBalance.net, entries[], closingBalance.net, pagination, meta }
 *   entries[]: { transactionId, date, voucherCode, voucherTypeDisplay, narration,
 *               debit, credit, runningBalance, ... }
 */
const LedgerPage = () => {
  const { accountId: routeAccountId } = useParams();
  const [searchParams] = useSearchParams();
  const [accountId] = useState(routeAccountId ? Number(routeAccountId) : null);

  const fy = getCurrentFY();
  const [fromDate, setFromDate] = useState(searchParams.get('from') || fy.fromDate);
  const [toDate, setToDate] = useState(searchParams.get('to') || fy.toDate);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [vouchersData, setVouchersData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!accountId) return;
    try {
      const res = await reportsApi.ledgerSummary(accountId, { from: fromDate, to: toDate });
      setSummary(res.data?.data || null);
    } catch (err) {
      console.error('Ledger summary error', err);
    }
  }, [accountId, fromDate, toDate]);

  const fetchVouchers = useCallback(async (pg) => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await reportsApi.ledgerVouchers(accountId, {
        from: fromDate,
        to: toDate,
        page: pg + 1,
        pageSize,
      });
      setVouchersData(res.data?.data || null);
    } catch (err) {
      console.error('Ledger vouchers error', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, fromDate, toDate, pageSize]);

  useEffect(() => {
    if (accountId) {
      fetchSummary();
      fetchVouchers(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    setPage(0);
    fetchSummary();
    fetchVouchers(0);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchVouchers(newPage);
  };

  const entries = vouchersData?.entries || [];
  const pagination = vouchersData?.pagination || {};
  const openingNet = vouchersData?.openingBalance?.net;
  const ledger = summary?.ledger || {};
  const quickStats = summary?.quickStats || {};

  const tileCards = accountId
    ? [
        { label: 'Opening', value: summary?.openingBalance?.net || 0, description: 'Balance at period start' },
        { label: 'Debit', value: quickStats.debitTotal || 0, description: 'Total debit in period' },
        { label: 'Credit', value: quickStats.creditTotal || 0, description: 'Total credit in period' },
        { label: 'Closing', value: summary?.closingBalance?.net || 0, description: 'Balance at period end' },
      ]
    : [];

  // ── CSV export ──
  const handleExport = () => {
    const csvRows = entries.map((e) => ({
      date: fmtDate(e.date),
      voucherCode: e.voucherCode || '',
      type: e.voucherTypeDisplay || '',
      narration: e.narration || '',
      debit: e.debit || 0,
      credit: e.credit || 0,
      balance: e.runningBalance || 0,
    }));
    exportCSV(
      csvRows,
      [
        { key: 'date', label: 'Date' },
        { key: 'voucherCode', label: 'Voucher No.' },
        { key: 'type', label: 'Type' },
        { key: 'narration', label: 'Narration' },
        { key: 'debit', label: 'Debit' },
        { key: 'credit', label: 'Credit' },
        { key: 'balance', label: 'Balance' },
      ],
      `ledger-${accountId}-${fromDate}-to-${toDate}.csv`,
    );
  };

  const cellSx = {
    py: 0.5,
    px: 1,
    fontSize: '0.8125rem',
    borderBottom: `1px solid ${reportTheme.borderColor}`,
  };

  if (!accountId) {
    return (
      <ReportShell title="Ledger" breadcrumbs={['Reports', 'Accounts', 'Ledger']}>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Select an account from Trial Balance, P&L, or Balance Sheet to view ledger details.
          </Typography>
        </Box>
      </ReportShell>
    );
  }

  return (
    <ReportShell
      title={ledger.accountName || `Ledger #${accountId}`}
      subtitle={ledger.accountTypeName ? `${ledger.accountTypeName} | ${ledger.accountGroupName || ''}` : ''}
      breadcrumbs={['Reports', 'Accounts', 'Ledger', ledger.accountName || `#${accountId}`]}
      loading={loading}
      toolbar={
        <ReportToolbar
          fromDate={fromDate}
          toDate={toDate}
          onDateChange={(f, t) => { setFromDate(f); setToDate(t); }}
          onApply={handleApply}
          onPrint={() => window.print()}
          onExport={entries.length > 0 ? handleExport : undefined}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      {/* Quick stats */}
      {quickStats.voucherCount > 0 && (
        <Box sx={{ mb: 1.5, display: 'flex', gap: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          <span>Vouchers: <strong>{quickStats.voucherCount}</strong></span>
          {quickStats.lastTransactionDate && (
            <span>Last txn: <strong>{fmtDate(quickStats.lastTransactionDate)}</strong></span>
          )}
        </Box>
      )}

      {/* Opening balance bar */}
      {openingNet != null && (
        <Box sx={{ mb: 1, px: 1, py: 0.5, bgcolor: reportTheme.sectionBg, borderRadius: 1, fontSize: '0.8rem', fontWeight: 600 }}>
          Opening Balance: {fmtCrDr(openingNet)}
        </Box>
      )}

      {/* Voucher entries table */}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Date</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Voucher</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Type</TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Narration</TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Debit</TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Credit</TableCell>
              <TableCell align="right" sx={{ ...cellSx, fontWeight: 700, fontSize: '0.7rem', bgcolor: reportTheme.headerBg }}>Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((e) => (
              <TableRow
                key={e.transactionId}
                hover
                onClick={() => { setSelectedTxnId(e.transactionId); setVoucherModalOpen(true); }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: reportTheme.hoverBg } }}
              >
                <TableCell sx={cellSx}>{fmtDate(e.date)}</TableCell>
                <TableCell sx={cellSx}>
                  <Link
                    component="button"
                    underline="hover"
                    sx={{ fontSize: 'inherit', color: reportTheme.accentColor, fontWeight: 500 }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelectedTxnId(e.transactionId);
                      setVoucherModalOpen(true);
                    }}
                  >
                    {e.voucherCode || '-'}
                  </Link>
                </TableCell>
                <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>
                  {e.voucherTypeDisplay || 'Other'}
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

            {/* Closing balance row */}
            {vouchersData?.closingBalance?.net != null && entries.length > 0 && (
              <TableRow sx={{ bgcolor: reportTheme.sectionBg }}>
                <TableCell colSpan={6} sx={{ ...cellSx, fontWeight: 700 }}>
                  Closing Balance
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 700 }}>
                  {fmtCrDr(vouchersData.closingBalance.net)}
                </TableCell>
              </TableRow>
            )}

            {entries.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} sx={{ ...cellSx, textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No vouchers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.totalRows > 0 && (
        <TablePagination
          component="div"
          count={pagination.totalRows}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[25]}
        />
      )}

      <VoucherModal
        open={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        transactionId={selectedTxnId}
      />
    </ReportShell>
  );
};

export default LedgerPage;
