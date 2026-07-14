import React, { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Link,
} from '@mui/material';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import VoucherModal from './components/VoucherModal';
import { getCurrentFY, fmtINR, fmtDate, exportCSV, amountCellSx, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';
import { useSelector } from 'react-redux';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
/**
 * VouchersPage — Paginated list of all vouchers in the period.
 *
 * Backend shape (getVoucherList):
 *   data.rows[], data.pagination, data.totals, data.meta
 *   rows[]: { transactionId, date, voucherCode, voucherTypeDisplay, narration,
 *             totalDebit, totalCredit, ... }
 */
const VouchersPage = () => {
  const fy = getCurrentFY();
  const storage = getsessionStorage();
  const { menuAccess = {} } = useSelector((state) => state.rbacReducer);
  const [fromDate, setFromDate] = useState(fy.fromDate);
  const [toDate, setToDate] = useState(fy.toDate);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchData = useCallback(async (pg) => {
    setLoading(true);
    try {
      const res = await reportsApi.voucherList({
        from: fromDate,
        to: toDate,
        page: pg + 1,
        pageSize,
      });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Vouchers fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, pageSize]);

  useEffect(() => { fetchData(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    setPage(0);
    fetchData(0);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchData(newPage);
  };

  const handleVoucherClick = (txnId) => {
    setSelectedTxnId(txnId);
    setVoucherModalOpen(true);
  };

  const rows = data?.rows || [];
  const pagination = data?.pagination || {};
  const totals = data?.totals || {};
  const meta = data?.meta || {};

  const tileCards = [
    { label: 'Total Debit', value: totals.totalDebit || 0, description: 'Sum of all debit entries' },
    { label: 'Total Credit', value: totals.totalCredit || 0, description: 'Sum of all credit entries' },
    { label: 'Vouchers', value: pagination.totalRows || 0, format: 'count', description: 'Total vouchers in period' },
  ];

  const headerMeta = data
    ? {
        fy: fy.label,
        fromDate: meta.fromDate || fromDate,
        toDate: meta.toDate || toDate,
        currency: meta.currency || 'INR',
        generatedAt: meta.generatedAt,
      }
    : undefined;

  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__accounts__voucherspage','can_export');
  const handleExport = () => {
    if (!reportExport) return;
    const csvRows = rows.map((r) => ({
      date: fmtDate(r.date),
      voucherCode: r.voucherCode || '',
      type: r.voucherTypeDisplay || '',
      narration: r.narration || '',
      debit: r.totalDebit || 0,
      credit: r.totalCredit || 0,
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
      ],
      `vouchers-${fromDate}-to-${toDate}.csv`,
    );
  };

  const cellSx = {
    py: 0.5,
    px: 1,
    fontSize: '0.8125rem',
    borderBottom: `1px solid ${reportTheme.borderColor}`,
  };

  const hdrSx = {
    ...cellSx,
    fontWeight: 700,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    bgcolor: reportTheme.headerBg,
  };

  return (
    <ReportShell
      title="Vouchers"
      breadcrumbs={['Reports', 'Accounts', 'Vouchers']}
      headerMeta={headerMeta}
      loading={loading}
      toolbar={
        <ReportToolbar
          fromDate={fromDate}
          toDate={toDate}
          onDateChange={(f, t) => { setFromDate(f); setToDate(t); }}
          onApply={handleApply}
          onPrint={() => window.print()}
          onExport={reportExport && rows.length > 0 ? handleExport : undefined}
          exportEnabled={reportExport}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={hdrSx}>Date</TableCell>
              <TableCell sx={hdrSx}>Voucher No.</TableCell>
              <TableCell sx={hdrSx}>Type</TableCell>
              <TableCell sx={{ ...hdrSx, width: '30%' }}>Narration</TableCell>
              <TableCell align="right" sx={hdrSx}>Debit</TableCell>
              <TableCell align="right" sx={hdrSx}>Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.transactionId}
                hover
                onClick={() => handleVoucherClick(r.transactionId)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: reportTheme.hoverBg } }}
              >
                <TableCell sx={cellSx}>{fmtDate(r.date)}</TableCell>
                <TableCell sx={cellSx}>
                  <Link
                    component="button"
                    underline="hover"
                    sx={{ fontSize: 'inherit', color: reportTheme.accentColor, fontWeight: 500 }}
                    onClick={(e) => { e.stopPropagation(); handleVoucherClick(r.transactionId); }}
                  >
                    {r.voucherCode || '-'}
                  </Link>
                </TableCell>
                <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>
                  {r.voucherTypeDisplay || 'Other'}
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.narration || '-'}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                  {Number(r.totalDebit) ? fmtINR(r.totalDebit) : ''}
                </TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                  {Number(r.totalCredit) ? fmtINR(r.totalCredit) : ''}
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} sx={{ ...cellSx, textAlign: 'center', py: 4, color: 'text.secondary' }}>
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

export default VouchersPage;
