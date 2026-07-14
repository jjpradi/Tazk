import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper,
  Divider,
  Link,
} from '@mui/material';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import DrilldownDrawer from './components/DrilldownDrawer';
import VoucherModal from './components/VoucherModal';
import { getCurrentFY, fmtINR, exportCSV, amountCellSx, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';

/**
 * GstTdsPage — GST & TDS summary with ledger balances.
 *
 * Backend shape (getGstTds):
 *   data.summary: { taxableTurnover, outputGST{cgst,sgst,igst,total}, inputGST{...}, netGSTPayable, tdsPayable, tdsReceivable }
 *   data.ledgerBalances[]: { section, ledger, nature, balance, accountId }
 *   data.tiles, data.meta
 */
const GstTdsPage = () => {
  const navigate = useNavigate();
  const fy = getCurrentFY();
  const [fromDate, setFromDate] = useState(fy.fromDate);
  const [toDate, setToDate] = useState(fy.toDate);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.gstTds({ from: fromDate, to: toDate });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('GST/TDS fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (row) => {
    if (!row.accountId) return;
    setSelectedAccount({ id: row.accountId, name: row.ledger });
    setDrawerOpen(true);
  };

  const handleNameClick = (row) => {
    if (!row.accountId) return;
    navigate(`/reports/ledger/${row.accountId}?from=${fromDate}&to=${toDate}`);
  };

  const handleVoucherClick = (txnId) => {
    setSelectedTxnId(txnId);
    setVoucherModalOpen(true);
  };

  const handleNavigateToLedger = (accountId) => {
    setDrawerOpen(false);
    navigate(`/reports/ledger/${accountId}?from=${fromDate}&to=${toDate}`);
  };

  const summary = data?.summary || {};
  const ledgerBalances = data?.ledgerBalances || [];
  const tiles = data?.tiles || {};
  const meta = data?.meta || {};

  const outputGST = summary.outputGST || {};
  const inputGST = summary.inputGST || {};

  const tileCards = [
    { label: 'Taxable Turnover', value: summary.taxableTurnover || 0, description: 'Total taxable revenue' },
    { label: 'Output GST', value: outputGST.total || 0, description: 'GST collected on sales' },
    { label: 'Input GST', value: inputGST.total || 0, description: 'GST paid on purchases' },
    {
      label: 'Net GST Payable',
      value: summary.netGSTPayable || 0,
      color: (summary.netGSTPayable || 0) >= 0 ? reportTheme.negativeColor : reportTheme.positiveColor,
      description: 'Output GST minus input GST credit',
    },
  ];

  // Filter out TDS rows — only show GST ledgers
  const gstLedgerBalances = ledgerBalances.filter((row) => row.section !== 'TDS');

  const headerMeta = data
    ? {
        fy: fy.label,
        fromDate: meta.fromDate || fromDate,
        toDate: meta.toDate || toDate,
        currency: meta.currency || 'INR',
        generatedAt: meta.generatedAt,
      }
    : undefined;

  const handleExport = () => {
    const csvRows = gstLedgerBalances.map((r) => ({
      section: r.section,
      ledger: r.ledger,
      nature: r.nature,
      balance: r.balance || 0,
    }));
    exportCSV(
      csvRows,
      [
        { key: 'section', label: 'Section' },
        { key: 'ledger', label: 'Ledger' },
        { key: 'nature', label: 'Nature' },
        { key: 'balance', label: 'Balance' },
      ],
      `gst-summary-${fromDate}-to-${toDate}.csv`,
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
      title="GST Summary"
      breadcrumbs={['Reports', 'Accounts', 'GST Summary']}
      headerMeta={headerMeta}
      loading={loading}
      toolbar={
        <ReportToolbar
          fromDate={fromDate}
          toDate={toDate}
          onDateChange={(f, t) => { setFromDate(f); setToDate(t); }}
          onApply={fetchData}
          onPrint={() => window.print()}
          onExport={gstLedgerBalances.length > 0 ? handleExport : undefined}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      {/* ── GST Summary Cards ── */}
      {data && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Output GST</Typography>
              <SummaryLine label="CGST" value={outputGST.cgst} />
              <SummaryLine label="SGST" value={outputGST.sgst} />
              <SummaryLine label="IGST" value={outputGST.igst} />
              <Divider sx={{ my: 1 }} />
              <SummaryLine label="Total" value={outputGST.total} bold />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Input GST</Typography>
              <SummaryLine label="CGST" value={inputGST.cgst} />
              <SummaryLine label="SGST" value={inputGST.sgst} />
              <SummaryLine label="IGST" value={inputGST.igst} />
              <Divider sx={{ my: 1 }} />
              <SummaryLine label="Total" value={inputGST.total} bold />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>Net GST</Typography>
              <SummaryLine label="Output GST" value={outputGST.total} />
              <SummaryLine label="Input GST (Credit)" value={inputGST.total} />
              <Divider sx={{ my: 1 }} />
              <SummaryLine label="Net GST Payable" value={summary.netGSTPayable} bold />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ── Ledger Balances Table ── */}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 480px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={hdrSx}>Section</TableCell>
              <TableCell sx={hdrSx}>Ledger</TableCell>
              <TableCell sx={hdrSx}>Nature</TableCell>
              <TableCell align="right" sx={hdrSx}>Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gstLedgerBalances.map((row, idx) => (
              <TableRow
                key={row.accountId || idx}
                hover
                onClick={() => handleRowClick(row)}
                sx={{ cursor: row.accountId ? 'pointer' : 'default', '&:hover': { bgcolor: reportTheme.hoverBg } }}
              >
                <TableCell sx={cellSx}>{row.section}</TableCell>
                <TableCell sx={cellSx}>
                  {row.accountId ? (
                    <Link
                      component="button"
                      underline="hover"
                      sx={{ fontSize: 'inherit', color: reportTheme.accentColor, fontWeight: 500, textAlign: 'left' }}
                      onClick={(e) => { e.stopPropagation(); handleNameClick(row); }}
                    >
                      {row.ledger}
                    </Link>
                  ) : (
                    row.ledger
                  )}
                </TableCell>
                <TableCell sx={{ ...cellSx, color: 'text.secondary' }}>{row.nature}</TableCell>
                <TableCell align="right" sx={{ ...cellSx, ...amountCellSx }}>
                  {fmtINR(row.balance)}
                </TableCell>
              </TableRow>
            ))}

            {gstLedgerBalances.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} sx={{ ...cellSx, textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No GST data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DrilldownDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        accountId={selectedAccount?.id}
        accountName={selectedAccount?.name}
        fromDate={fromDate}
        toDate={toDate}
        onVoucherClick={handleVoucherClick}
        onNavigateToLedger={handleNavigateToLedger}
      />

      <VoucherModal
        open={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        transactionId={selectedTxnId}
      />
    </ReportShell>
  );
};

/** Summary line item inside GST/TDS cards. */
const SummaryLine = ({ label, value, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
    <Typography sx={{ fontSize: '0.8rem', fontWeight: bold ? 700 : 400 }}>{label}</Typography>
    <Typography sx={{ ...amountCellSx, fontSize: '0.8rem', fontWeight: bold ? 700 : 400 }}>
      {fmtINR(value)}
    </Typography>
  </Box>
);

export default GstTdsPage;
