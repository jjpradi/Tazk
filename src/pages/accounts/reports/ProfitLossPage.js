import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Link,
  Typography,
  Collapse,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import DrilldownDrawer from './components/DrilldownDrawer';
import VoucherModal from './components/VoucherModal';
import DiagnosticsAccordion from './components/DiagnosticsAccordion';
import { getCurrentFY, fmtINR, fmtPct, exportCSV, amountCellSx, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';
import { useSelector } from 'react-redux';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

const ProfitLossPage = () => {
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const { menuAccess = {} } = useSelector((state) => state.rbacReducer);
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
      const res = await reportsApi.profitLoss({ from: fromDate, to: toDate });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('P&L fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (acc) => {
    const accId = acc.drilldownAccountId || acc.accountId;
    if (!accId) return;
    setSelectedAccount({ id: accId, name: acc.accountName });
    setDrawerOpen(true);
  };

  const handleNameClick = (acc) => {
    const accId = acc.drilldownAccountId || acc.accountId;
    if (!accId) return;
    navigate(`/reports/ledger/${accId}?from=${fromDate}&to=${toDate}`);
  };

  const handleVoucherClick = (txnId) => {
    setSelectedTxnId(txnId);
    setVoucherModalOpen(true);
  };

  const handleNavigateToLedger = (accountId) => {
    setDrawerOpen(false);
    navigate(`/reports/ledger/${accountId}?from=${fromDate}&to=${toDate}`);
  };

  const currentFY = data?.currentFY || {};
  const sections = currentFY.sections || {};
  const comparativeRows = data?.comparativeRows || [];
  const margins = data?.margins || {};
  const workingCapital = data?.workingCapital || {};
  const tiles = data?.tiles || {};
  const meta = data?.meta || {};
  const hasPreviousFY = !!data?.previousFY;
  const previousFYLabel = data?.previousFY?.label || 'Previous FY';
  const currentFYLabel = currentFY.label || fy.label;

  const signedNetProfit = Number(data?.profitOrLoss?.signedAmount ?? tiles.netProfit ?? sections.netProfit ?? 0);
  const netResultLabel = data?.profitOrLoss?.label || (signedNetProfit >= 0 ? 'Net Profit' : 'Net Loss');
  const netResultSign = data?.profitOrLoss?.sign || (signedNetProfit >= 0 ? '+' : '-');
  const netResultDisplay = `${netResultSign}${fmtINR(Math.abs(signedNetProfit))}`;

  // ── 5 Tiles ──
  const tileCards = [
    { label: 'Total Income', value: tiles.totalIncome || sections.totalIncome || 0, description: 'Revenue + other income' },
    { label: 'Total Expense', value: tiles.totalExpense || sections.totalExpense || 0, description: 'All operating & non-operating costs' },
    {
      label: 'Gross Profit',
      value: tiles.grossProfit || sections.grossProfit || 0,
      color: (tiles.grossProfit || sections.grossProfit || 0) >= 0 ? reportTheme.positiveColor : reportTheme.negativeColor,
      description: 'Revenue minus cost of goods sold',
    },
    {
      label: netResultLabel,
      value: netResultDisplay,
      format: 'text',
      color: signedNetProfit >= 0 ? reportTheme.positiveColor : reportTheme.negativeColor,
      description: 'Bottom line after all expenses & taxes',
    },
    { label: 'Vouchers', value: tiles.voucherCount || sections.totalVoucherCount || 0, format: 'count', description: 'Total transactions in period' },
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

  const diagnosticsItems = data
    ? [
        { label: 'Period', value: `${fromDate} to ${toDate}` },
        { label: 'Rounding', value: 'Whole numbers (rounded)' },
        { label: 'Currency', value: meta.currency || 'INR' },
        { label: 'Basis', value: 'Accrual' },
      ]
    : [];

  // Use comparativeRows if available, else fall back to currentFY.statementRows
  const displayRows = comparativeRows.length > 0 ? comparativeRows : (currentFY.statementRows || []);
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__accounts__profit_loss','can_export');
  const handleExport = () => {
    if (!reportExport) return;
    const csvRows = [];
    displayRows.forEach((row) => {
      const r = { particular: row.label, amount: row.amount || 0 };
      if (hasPreviousFY) {
        r.currentAmount = row.currentAmount || 0;
        r.previousAmount = row.previousAmount || 0;
        r.yoy = row.yoy != null ? `${row.yoy.toFixed(1)}%` : '-';
      }
      csvRows.push(r);
      if (row.isSection && sections[row.key]) {
        (sections[row.key].accounts || []).forEach((acc) => {
          const ar = { particular: `  ${acc.accountName}`, amount: acc.amount || 0 };
          if (hasPreviousFY) { ar.currentAmount = ''; ar.previousAmount = ''; ar.yoy = ''; }
          csvRows.push(ar);
        });
      }
    });
    const cols = [{ key: 'particular', label: 'Particular' }];
    if (hasPreviousFY) {
      cols.push({ key: 'currentAmount', label: currentFYLabel });
      cols.push({ key: 'previousAmount', label: previousFYLabel });
      cols.push({ key: 'yoy', label: 'YOY %' });
    } else {
      cols.push({ key: 'amount', label: 'Amount' });
    }
    exportCSV(csvRows, cols, `profit-loss-${fromDate}-to-${toDate}.csv`);
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
      title="Profit & Loss Statement"
      breadcrumbs={['Reports', 'Accounts', 'Profit & Loss']}
      headerMeta={headerMeta}
      loading={loading}
      toolbar={
        <ReportToolbar
          fromDate={fromDate}
          toDate={toDate}
          onDateChange={(f, t) => { setFromDate(f); setToDate(t); }}
          onApply={fetchData}
          onPrint={() => window.print()}
          onExport={reportExport ? handleExport : undefined}
          exportEnabled={reportExport}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      <Grid container spacing={2}>
        {/* ── Left: Statement table ── */}
        <Grid size={{ xs: 12, md: margins.grossMargin ? 8 : 12 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...hdrSx, width: hasPreviousFY ? '36%' : '55%' }}>Particulars</TableCell>
                  {hasPreviousFY ? (
                    <>
                      <TableCell align="right" sx={hdrSx}>{currentFYLabel}</TableCell>
                      <TableCell align="right" sx={hdrSx}>{previousFYLabel}</TableCell>
                      <TableCell align="right" sx={hdrSx}>YOY %</TableCell>
                    </>
                  ) : (
                    <TableCell align="right" sx={hdrSx}>Amount</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRows.map((row, idx) => {
                  if (row.isComputed) {
                    return (
                      <ComputedRow
                        key={idx}
                        row={row}
                        hasPreviousFY={hasPreviousFY}
                        cellSx={cellSx}
                        netResultLabel={netResultLabel}
                      />
                    );
                  }
                  if (row.isSection) {
                    return (
                      <SectionBlock
                        key={idx}
                        row={row}
                        section={sections[row.key]}
                        hasPreviousFY={hasPreviousFY}
                        onRowClick={handleRowClick}
                        onNameClick={handleNameClick}
                        cellSx={cellSx}
                      />
                    );
                  }
                  return null;
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* ── Right: Key Margins & Working Capital ── */}
        {(margins.grossMargin || margins.ebitdaMargin || margins.netMargin) && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1.5 }}>Key Margins</Typography>
              <MarginCard label="Gross Margin" percent={margins.grossMargin?.percent} amount={margins.grossMargin?.amount} />
              <MarginCard label="EBITDA Margin" percent={margins.ebitdaMargin?.percent} amount={margins.ebitdaMargin?.amount} />
              <MarginCard label="Net Margin" percent={margins.netMargin?.percent} amount={margins.netMargin?.amount} />
            </Paper>

            {(workingCapital.debtorDays != null || workingCapital.creditorDays != null || workingCapital.inventoryDays != null) && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1.5 }}>Working Capital</Typography>
                <WCCard label="Debtor Days" value={workingCapital.debtorDays} />
                <WCCard label="Creditor Days" value={workingCapital.creditorDays} />
                <WCCard label="Inventory Days" value={workingCapital.inventoryDays} />
              </Paper>
            )}
          </Grid>
        )}
      </Grid>

      {data && <DiagnosticsAccordion items={diagnosticsItems} />}

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

/** Margin card inside the right panel. */
const MarginCard = ({ label, percent, amount }) => (
  <Box sx={{ mb: 1.5, pb: 1.5, borderBottom: `1px solid ${reportTheme.borderColor}`, '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' } }}>
    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: (percent || 0) >= 0 ? reportTheme.positiveColor : reportTheme.negativeColor }}>
        {fmtPct(percent)}
      </Typography>
      <Typography sx={{ ...amountCellSx, fontSize: '0.78rem', color: 'text.secondary' }}>
        {fmtINR(amount)}
      </Typography>
    </Box>
  </Box>
);

/** Working capital metric card. */
const WCCard = ({ label, value }) => (
  <Box sx={{ mb: 1.5, pb: 1.5, borderBottom: `1px solid ${reportTheme.borderColor}`, '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' } }}>
    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
      {value != null ? `${Math.round(value)} days` : '-'}
    </Typography>
  </Box>
);

/** Highlighted computed row (Gross Profit, EBITDA, PBT, Net Profit). */
const ComputedRow = ({ row, hasPreviousFY, cellSx, netResultLabel }) => {
  const isNet = row.key === 'netProfit' || row.label.toLowerCase().includes('net profit');
  const computedLabel = isNet ? (netResultLabel || 'Net Profit') : row.label;
  const baseSx = { ...cellSx, fontWeight: 700, borderTop: `1px solid ${reportTheme.borderColor}` };
  return (
    <TableRow sx={{ bgcolor: isNet ? '#E8F5E9' : reportTheme.sectionBg }}>
      <TableCell sx={baseSx}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {computedLabel}
          {row.sublabel && (
            <Typography component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 400 }}>
              ({row.sublabel})
            </Typography>
          )}
        </Box>
      </TableCell>
      {hasPreviousFY ? (
        <>
          <TableCell align="right" sx={{ ...baseSx, ...amountCellSx, fontSize: isNet ? '0.9rem' : '0.8125rem', color: (row.currentAmount || 0) < 0 ? reportTheme.negativeColor : 'text.primary' }}>
            {fmtINR(row.currentAmount)}
          </TableCell>
          <TableCell align="right" sx={{ ...baseSx, ...amountCellSx, color: 'text.secondary' }}>
            {row.previousAmount != null ? fmtINR(row.previousAmount) : '-'}
          </TableCell>
          <TableCell align="right" sx={{ ...baseSx, ...amountCellSx, color: (row.yoy || 0) < 0 ? reportTheme.negativeColor : reportTheme.positiveColor }}>
            {row.yoy != null ? fmtPct(row.yoy) : '-'}
          </TableCell>
        </>
      ) : (
        <TableCell align="right" sx={{ ...baseSx, ...amountCellSx, fontSize: isNet ? '0.9rem' : '0.8125rem', color: (row.amount || 0) < 0 ? reportTheme.negativeColor : 'text.primary' }}>
          {fmtINR(row.amount)}
        </TableCell>
      )}
    </TableRow>
  );
};

/** Collapsible section with account rows inside. */
const SectionBlock = ({ row, section, hasPreviousFY, onRowClick, onNameClick, cellSx }) => {
  const [open, setOpen] = useState(false);
  const accounts = section?.accounts || [];
  const colSpan = hasPreviousFY ? 4 : 2;

  return (
    <>
      <TableRow
        hover
        onClick={() => accounts.length > 0 && setOpen(!open)}
        sx={{ cursor: accounts.length > 0 ? 'pointer' : 'default', '&:hover': { bgcolor: reportTheme.hoverBg } }}
      >
        <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {accounts.length > 0 && (
              <IconButton size="small" sx={{ mr: 0.5, p: 0.25 }}>
                {open ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            )}
            <Box>
              {row.label}
              {row.sublabel && (
                <Typography component="span" sx={{ ml: 0.75, fontSize: '0.65rem', color: 'text.disabled' }}>
                  {row.sublabel}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
        {hasPreviousFY ? (
          <>
            <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600 }}>{fmtINR(row.currentAmount)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600, color: 'text.secondary' }}>
              {row.previousAmount != null ? fmtINR(row.previousAmount) : '-'}
            </TableCell>
            <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600, color: (row.yoy || 0) < 0 ? reportTheme.negativeColor : reportTheme.positiveColor }}>
              {row.yoy != null ? fmtPct(row.yoy) : '-'}
            </TableCell>
          </>
        ) : (
          <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600 }}>{fmtINR(row.amount)}</TableCell>
        )}
      </TableRow>

      <TableRow>
        <TableCell colSpan={colSpan} sx={{ py: 0, px: 0, border: 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow
                    key={acc.accountId}
                    hover
                    onClick={() => onRowClick(acc)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: reportTheme.hoverBg } }}
                  >
                    <TableCell sx={{ ...cellSx, pl: 5, fontSize: '0.78rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {onNameClick ? (
                          <Link
                            component="button"
                            underline="hover"
                            sx={{ fontSize: 'inherit', color: reportTheme.accentColor, fontWeight: 500, textAlign: 'left' }}
                            onClick={(e) => { e.stopPropagation(); onNameClick(acc); }}
                          >
                            {acc.accountName}
                          </Link>
                        ) : (
                          acc.accountName
                        )}
                        {acc.accountCode && (
                          <Typography component="span" sx={{ ml: 0.75, fontSize: '0.65rem', color: 'text.disabled' }}>
                            {acc.accountCode}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {hasPreviousFY ? (
                      <>
                        <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem' }}>{fmtINR(acc.amount)}</TableCell>
                        <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem', color: 'text.secondary' }} />
                        <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem' }} />
                      </>
                    ) : (
                      <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem' }}>{fmtINR(acc.amount)}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ProfitLossPage;











