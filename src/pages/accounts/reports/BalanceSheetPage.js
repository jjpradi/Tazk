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
  Collapse,
  IconButton,
  Link,
  Alert,
  Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ReportShell from './components/ReportShell';
import ReportToolbar from './components/ReportToolbar';
import ReportTiles from './components/ReportTiles';
import DrilldownDrawer from './components/DrilldownDrawer';
import VoucherModal from './components/VoucherModal';
import DiagnosticsAccordion from './components/DiagnosticsAccordion';
import { getCurrentFY, fmtINR, fmtDateLong, exportCSV, amountCellSx, reportTheme } from './reportUtils';
import reportsApi from './reportsApi';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useSelector } from 'react-redux';

const BalanceSheetPage = () => {
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const { menuAccess = {} } = useSelector((state) => state.rbacReducer);
  const fy = getCurrentFY();
  const [asOnDate, setAsOnDate] = useState(fy.toDate);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.balanceSheet({ asOn: asOnDate });
      setData(res.data?.data || null);
    } catch (err) {
      console.error('BS fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [asOnDate]);

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
    navigate(`/reports/ledger/${accId}?from=${fy.fromDate}&to=${asOnDate}`);
  };

  const handleVoucherClick = (txnId) => {
    setSelectedTxnId(txnId);
    setVoucherModalOpen(true);
  };

  const handleNavigateToLedger = (accountId) => {
    setDrawerOpen(false);
    navigate(`/reports/ledger/${accountId}?from=${fy.fromDate}&to=${asOnDate}`);
  };

  const currentFY = data?.currentFY || {};
  const assets = currentFY.assets || {};
  const eqLiab = currentFY.equityAndLiabilities || {};
  const tiles = data?.tiles || {};
  const meta = data?.meta || {};
  const difference = data?.difference || 0;
  const isBalanced = tiles.isBalanced ?? (Math.abs(difference) < 0.01);
  const hasPreviousFY = !!data?.previousFY;
  const previousFYLabel = data?.previousFY?.label || 'Previous FY';
  const comparativeAssetRows = data?.comparativeAssetRows || [];
  const comparativeEqLiabRows = data?.comparativeEqLiabRows || [];

  // Derive FY label from asOnDate
  const toolbarFY = (() => {
    if (!asOnDate) return '';
    const d = new Date(asOnDate);
    const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `FY ${y}-${y + 1}`;
  })();

  // ── 4 Tiles ──
  const tileCards = [
    { label: 'Total Assets', value: tiles.totalAssets || assets.totalAssets || 0, description: 'Current + non-current assets' },
    { label: 'Total Liabilities', value: tiles.totalLiabilities || eqLiab.totalEquityAndLiabilities || 0, description: 'Equity + current & non-current liabilities' },
    {
      label: 'Difference',
      value: difference,
      color: isBalanced ? reportTheme.positiveColor : reportTheme.negativeColor,
      description: isBalanced ? 'Balance sheet is balanced' : 'Assets-liabilities mismatch',
    },
    { label: 'Generated On', value: tiles.generatedAt ? new Date(tiles.generatedAt).toLocaleString('en-IN') : '-', format: 'text', description: 'Report generation timestamp' },
  ];

  const headerMeta = data
    ? {
        fy: toolbarFY,
        fromDate: meta.fromDate || fy.fromDate,
        toDate: meta.asOnDate || asOnDate,
        currency: meta.currency || 'INR',
        generatedAt: meta.generatedAt,
      }
    : undefined;

  const diagnosticsItems = data
    ? [
        { label: 'As On Date', value: fmtDateLong(asOnDate) },
        { label: 'Financial Year', value: toolbarFY },
        { label: 'Rounding', value: 'Whole numbers (rounded)' },
        { label: 'Currency', value: meta.currency || 'INR' },
        { label: 'Balanced', value: isBalanced ? 'Yes' : `No (difference: ${fmtINR(difference)})` },
      ]
    : [];

  const assetSections = assets.sections ? Object.values(assets.sections) : [];
  const eqLiabSections = eqLiab.sections ? Object.values(eqLiab.sections) : [];

  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__accounts__balance_sheet','can_export');
  const handleExport = () => {
    if (!reportExport) return;
    const csvRows = [];
    const addSide = (label, secs, total) => {
      csvRows.push({ particular: `── ${label} ──`, currentAmount: '', previousAmount: '' });
      secs.forEach((sec) => {
        csvRows.push({ particular: sec.label, currentAmount: sec.total || 0, previousAmount: '' });
        (sec.accounts || []).forEach((acc) => {
          if (acc.isParent !== 1) {
            csvRows.push({ particular: `  ${acc.accountName}`, currentAmount: acc.amount || 0, previousAmount: '' });
          }
        });
      });
      csvRows.push({ particular: `TOTAL ${label.toUpperCase()}`, currentAmount: total || 0, previousAmount: '' });
    };
    addSide('Assets', assetSections, assets.totalAssets);
    addSide('Equity & Liabilities', eqLiabSections, eqLiab.totalEquityAndLiabilities);
    const cols = [
      { key: 'particular', label: 'Particular' },
      { key: 'currentAmount', label: toolbarFY },
    ];
    if (hasPreviousFY) cols.push({ key: 'previousAmount', label: previousFYLabel });
    exportCSV(csvRows, cols, `balance-sheet-${asOnDate}.csv`);
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
      title="Balance Sheet"
      breadcrumbs={['Reports', 'Accounts', 'Balance Sheet']}
      homePath="/report"
      headerMeta={headerMeta}
      loading={loading}
      toolbar={
        <ReportToolbar
          asOnMode
          asOnDate={asOnDate}
          onAsOnChange={setAsOnDate}
          onDateChange={(f, t) => setAsOnDate(t)}
          onApply={fetchData}
          onPrint={() => window.print()}
          onExport={reportExport ? handleExport : undefined}
          exportEnabled={reportExport}
        />
      }
      tiles={<ReportTiles tiles={tileCards} />}
    >
      {/* Diff badge */}
      {data && !isBalanced && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Chip
            label={`Diff: ${fmtINR(difference)}`}
            size="small"
            color="error"
            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          />
        </Box>
      )}

      {data && !isBalanced && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8125rem' }}>
          Balance Sheet does not balance — difference of {fmtINR(difference)}. Check for excluded statuses, rounding, or missing accounts.
        </Alert>
      )}

      {/* ── Assets (top) ── */}
      <BSSide
        title="Assets"
        sections={assetSections}
        total={assets.totalAssets}
        comparativeRows={comparativeAssetRows}
        hasPreviousFY={hasPreviousFY}
        previousFYLabel={previousFYLabel}
        currentFYLabel={toolbarFY}
        onRowClick={handleRowClick}
        onNameClick={handleNameClick}
        cellSx={cellSx}
        hdrSx={hdrSx}
      />

      <Box sx={{ my: 2 }} />

      {/* ── Equity & Liabilities (bottom) ── */}
      <BSSide
        title="Equity & Liabilities"
        sections={eqLiabSections}
        total={eqLiab.totalEquityAndLiabilities}
        comparativeRows={comparativeEqLiabRows}
        hasPreviousFY={hasPreviousFY}
        previousFYLabel={previousFYLabel}
        currentFYLabel={toolbarFY}
        onRowClick={handleRowClick}
        onNameClick={handleNameClick}
        cellSx={cellSx}
        hdrSx={hdrSx}
      />

      {data && <DiagnosticsAccordion items={diagnosticsItems} />}

      <DrilldownDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        accountId={selectedAccount?.id}
        accountName={selectedAccount?.name}
        fromDate={fy.fromDate}
        toDate={asOnDate}
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

/** One side of the Balance Sheet — vertical table. */
const BSSide = ({ title, sections = [], total, comparativeRows, hasPreviousFY, previousFYLabel, currentFYLabel, onRowClick, onNameClick, cellSx, hdrSx }) => {
  const colSpan = hasPreviousFY ? 3 : 2;

  // Build a map from comparativeRows for quick lookup by section key
  const compMap = {};
  (comparativeRows || []).forEach((cr) => { compMap[cr.key] = cr; });

  return (
    <Box sx={{ border: `1px solid ${reportTheme.borderColor}`, borderRadius: 1 }}>
      <Box sx={{ bgcolor: reportTheme.sectionBg, px: 1.5, py: 0.75, borderBottom: `1px solid ${reportTheme.borderColor}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{title}</Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...hdrSx, width: hasPreviousFY ? '50%' : '60%' }}>Particulars</TableCell>
              <TableCell align="right" sx={hdrSx}>{currentFYLabel || 'Current FY'}</TableCell>
              {hasPreviousFY && <TableCell align="right" sx={hdrSx}>{previousFYLabel}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map((sec) => (
              <BSSection
                key={sec.key}
                section={sec}
                compRow={compMap[sec.key]}
                hasPreviousFY={hasPreviousFY}
                onRowClick={onRowClick}
                onNameClick={onNameClick}
                cellSx={cellSx}
              />
            ))}
            {sections.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ ...cellSx, textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Side total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, bgcolor: reportTheme.sectionBg, borderTop: `2px solid ${reportTheme.borderColor}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>TOTAL {title.toUpperCase()}</Typography>
        <Typography sx={{ ...amountCellSx, fontWeight: 700, fontSize: '0.85rem' }}>
          {fmtINR(total)}
        </Typography>
      </Box>
    </Box>
  );
};

/** Collapsible section within a BS side. */
const BSSection = ({ section, compRow, hasPreviousFY, onRowClick, onNameClick, cellSx }) => {
  const [open, setOpen] = useState(false);
  const accounts = section.accounts || [];
  const isComputed = section.computed === true;
  const colSpan = hasPreviousFY ? 3 : 2;

  return (
    <>
      <TableRow
        hover
        onClick={() => accounts.length > 0 && !isComputed && setOpen(!open)}
        sx={{ cursor: accounts.length > 0 && !isComputed ? 'pointer' : 'default', '&:hover': { bgcolor: reportTheme.hoverBg } }}
      >
        <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {accounts.length > 0 && !isComputed && (
              <IconButton size="small" sx={{ mr: 0.5, p: 0.25 }}>
                {open ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            )}
            {section.label}
            {isComputed && (
              <Typography component="span" sx={{ ml: 0.75, fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>
                (computed)
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600 }}>
          {fmtINR(section.total)}
        </TableCell>
        {hasPreviousFY && (
          <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontWeight: 600, color: 'text.secondary' }}>
            {compRow?.previousAmount != null ? fmtINR(compRow.previousAmount) : '-'}
          </TableCell>
        )}
      </TableRow>

      {!isComputed && (
        <TableRow>
          <TableCell colSpan={colSpan} sx={{ py: 0, px: 0, border: 'none' }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table size="small">
                <TableBody>
                  {accounts.map((acc, idx) => {
                    const indent = (acc.level || 0) * 2 + 3;
                    const isParent = acc.isParent === 1;
                    return (
                      <TableRow
                        key={acc.accountId || idx}
                        hover
                        onClick={() => !isParent && onRowClick(acc)}
                        sx={{
                          cursor: isParent ? 'default' : 'pointer',
                          bgcolor: isParent ? reportTheme.parentRowBg : 'transparent',
                          '&:hover': { bgcolor: reportTheme.hoverBg },
                        }}
                      >
                        <TableCell sx={{ ...cellSx, pl: indent, fontSize: '0.78rem', fontWeight: isParent ? 600 : 400 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!isParent && onNameClick ? (
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
                        <TableCell align="right" sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem', fontWeight: isParent ? 600 : 400 }}>
                          {fmtINR(acc.amount)}
                        </TableCell>
                        {hasPreviousFY && <TableCell sx={{ ...cellSx, ...amountCellSx, fontSize: '0.78rem' }} />}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default BalanceSheetPage;
