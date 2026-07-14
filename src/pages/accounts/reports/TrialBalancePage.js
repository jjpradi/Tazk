import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import TreeTable from './components/TreeTable';
import DrilldownDrawer from './components/DrilldownDrawer';
import VoucherModal from './components/VoucherModal';
import { getCurrentFY, fmtINR, fmtCrDr, exportCSV, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';

const TrialBalancePage = () => {
  const navigate = useNavigate();
  const fy = getCurrentFY();
  const [fromDate, setFromDate] = useState(fy.fromDate);
  const [toDate, setToDate] = useState(fy.toDate);
  const [search, setSearch] = useState('');
  const [includeZero, setIncludeZero] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Drilldown state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.trialBalance({
        from: fromDate,
        to: toDate,
        search: search || undefined,
        includeZero: includeZero ? 1 : undefined,
      });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('TB fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, search, includeZero]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => fetchData();

  // Row click → open DrilldownDrawer
  const handleRowClick = (row) => {
    const accId = row.drilldownAccountId || row.accountId;
    if (!accId) return;
    setSelectedAccount({ id: accId, name: row.accountName });
    setDrawerOpen(true);
  };

  // Name link click → navigate to LedgerPage
  const handleNameClick = (row) => {
    const accId = row.drilldownAccountId || row.accountId;
    if (!accId) return;
    navigate(`/reports/ledger/${accId}?from=${fromDate}&to=${toDate}`);
  };

  // Voucher number click inside drawer → open VoucherModal
  const handleVoucherClick = (txnId) => {
    setSelectedTxnId(txnId);
    setVoucherModalOpen(true);
  };

  // Navigate-to-ledger button inside drawer
  const handleNavigateToLedger = (accountId) => {
    setDrawerOpen(false);
    navigate(`/reports/ledger/${accountId}?from=${fromDate}&to=${toDate}`);
  };

  const rows = data?.rows || [];
  const totals = data?.totals || {};
  const meta = data?.meta || {};

  // ── 5 Tiles ──
  const tileCards = [
    { label: 'Total Debit', value: totals.periodDebit || 0, description: 'Sum of all debit balances' },
    { label: 'Total Credit', value: totals.periodCredit || 0, description: 'Sum of all credit balances' },
    {
      label: 'Difference',
      value: totals.difference || 0,
      color: totals.isBalanced ? reportTheme.positiveColor : reportTheme.negativeColor,
      description: totals.isBalanced ? 'Trial balance is balanced' : 'Debit-credit mismatch',
    },
    { label: 'Ledgers', value: totals.ledgerCount || 0, format: 'count', description: 'Active ledger accounts' },
    { label: 'Vouchers', value: totals.voucherCount || 0, format: 'count', description: 'Total transactions in period' },
  ];

  // ── Columns ──
  const columns = [
    { key: 'accountName', label: 'Particulars', align: 'left', width: '36%' },
    { key: 'netOpening', label: 'Opening (Dr/Cr)', align: 'right', render: (r) => fmtCrDr(r.netOpening) },
    { key: 'periodDebit', label: 'Debit', align: 'right', render: (r) => (Number(r.periodDebit) ? fmtINR(r.periodDebit) : '') },
    { key: 'periodCredit', label: 'Credit', align: 'right', render: (r) => (Number(r.periodCredit) ? fmtINR(r.periodCredit) : '') },
    { key: 'netClosing', label: 'Closing (Dr/Cr)', align: 'right', render: (r) => fmtCrDr(r.netClosing) },
  ];

  // ── CSV export columns (flat, no render) ──
  const csvColumns = [
    { key: 'accountName', label: 'Particulars' },
    { key: 'accountCode', label: 'Account Code' },
    { key: 'netOpening', label: 'Opening' },
    { key: 'periodDebit', label: 'Debit' },
    { key: 'periodCredit', label: 'Credit' },
    { key: 'netClosing', label: 'Closing' },
  ];

  const handleExport = () => {
    exportCSV(rows, csvColumns, `trial-balance-${fromDate}-to-${toDate}.csv`);
  };

  // ── Footer totals row ──
  const footerRow = rows.length
    ? {
        accountName: 'TOTAL',
        netOpening: totals.netOpening,
        periodDebit: totals.periodDebit,
        periodCredit: totals.periodCredit,
        netClosing: totals.netClosing,
      }
    : undefined;

  // ── Header meta ──
  // Note: backend returns meta.companyId (not companyName).
  // companyName is left undefined — ReportShell gracefully hides it.
  const headerMeta = data
    ? {
        fy: fy.label,
        fromDate: meta.fromDate || fromDate,
        toDate: meta.toDate || toDate,
        currency: meta.currency || 'INR',
        generatedAt: meta.generatedAt,
      }
    : undefined;

  return (
    <ReportShell
      title="Trial Balance"
      breadcrumbs={['Reports', 'Accounts', 'Trial Balance']}
      homePath="/reports"
      headerMeta={headerMeta}
      loading={loading}
      toolbar={
        <ReportToolbar
          fromDate={fromDate}
          toDate={toDate}
          onDateChange={(f, t) => { setFromDate(f); setToDate(t); }}
          search={search}
          onSearchChange={setSearch}
          showSearch
          includeZero={includeZero}
          onIncludeZeroChange={setIncludeZero}
          showIncludeZero
          onApply={handleApply}
          onPrint={() => window.print()}
          onExport={handleExport}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      <TreeTable
        columns={columns}
        rows={rows}
        nameKey="accountName"
        onRowClick={handleRowClick}
        onNameClick={handleNameClick}
        footerRow={footerRow}
        maxHeight="calc(100vh - 380px)"
      />

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

export default TrialBalancePage;
