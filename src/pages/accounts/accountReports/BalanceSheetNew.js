import React, { useState, useEffect } from 'react';
import {
  Box, Card, IconButton, Tooltip, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Helmet } from 'react-helmet-async';
import { ExportCsv } from '@material-table/exporters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import FilterCreditNotes from '../../sales/returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 90 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

const fmt = (v) => {
  if (v == null) return '';
  const num = Number(v);
  if (num === 0) return '-';
  const prefix = num < 0 ? '-' : '';
  return prefix + '\u20B9' + Math.abs(Math.round(num)).toLocaleString('en-IN');
};
const amtColor = (v) => Number(v) < 0 ? '#C62828' : '#2E3A59';

const PERIOD_CHIPS = [
  { key: 'fy', label: 'Current FY' },
  { key: 'lastfy', label: 'Last FY' },
  { key: 'q1', label: 'Q1' },
  { key: 'q2', label: 'Q2' },
  { key: 'q3', label: 'Q3' },
  { key: 'q4', label: 'Q4' },
  { key: 'month', label: 'This Month' },
];

function getAsOnDate(key) {
  const now = moment();
  const fyStart = now.month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
  switch (key) {
    case 'fy': return now.format('YYYY-MM-DD');
    case 'lastfy': return fyStart.clone().subtract(1, 'day').format('YYYY-MM-DD');
    case 'q1': return fyStart.clone().add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD');
    case 'q2': return fyStart.clone().add(6, 'months').subtract(1, 'day').format('YYYY-MM-DD');
    case 'q3': return fyStart.clone().add(9, 'months').subtract(1, 'day').format('YYYY-MM-DD');
    case 'q4': return fyStart.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD');
    case 'month': return now.endOf('month').format('YYYY-MM-DD');
    default: return now.format('YYYY-MM-DD');
  }
}

const cx = { py: 0.25, px: 1.5, fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', lineHeight: 1.3 };
const hdrSx = { ...cx, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.3, bgcolor: '#F4F7FE', py: 0.4 };

// Recursive tree row — renders a node at any depth and recurses into its children.
// Each nesting level adds 3 units of left padding. Nodes without children render as a leaf
// (no chevron, no click handler).
const TreeRow = ({ row, allAccounts, hasPrevious, prevAccounts, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const directChildren = (allAccounts || []).filter(a => a.parentId === row.accountId);
  const hasChildren = directChildren.length > 0;
  const prevRow = (prevAccounts || []).find(a => a.accountId === row.accountId);
  const basePad = 5 + depth * 3;

  return (
    <>
      <TableRow hover onClick={() => hasChildren && setOpen(!open)}
        sx={{ cursor: hasChildren ? 'pointer' : 'default', '&:hover': { bgcolor: '#FAFBFF' } }}>
        <TableCell sx={{ ...cx, pl: basePad, fontSize: depth === 0 ? '0.78rem' : '0.73rem', fontWeight: hasChildren ? 500 : 400, color: depth === 0 ? 'inherit' : '#555' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {hasChildren && (open ? <KeyboardArrowDownIcon sx={{ fontSize: 15, mr: 0.3, color: '#888' }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 15, mr: 0.3, color: '#888' }} />)}
            {row.accountName}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: depth === 0 ? '0.78rem' : '0.73rem', fontWeight: hasChildren ? 500 : 400, color: amtColor(row.amount) }}>{fmt(row.amount)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: depth === 0 ? '0.78rem' : '0.73rem', fontWeight: hasChildren ? 500 : 400, color: prevRow ? amtColor(prevRow.amount) : '#999' }}>{prevRow ? fmt(prevRow.amount) : '-'}</TableCell>}
      </TableRow>
      {hasChildren && open && directChildren.map(child => (
        <TreeRow key={child.accountId} row={child} allAccounts={allAccounts} hasPrevious={hasPrevious} prevAccounts={prevAccounts} depth={depth + 1} />
      ))}
    </>
  );
};

const BSSection = ({ section, hasPrevious, previousSections }) => {
  const [open, setOpen] = useState(true);
  const accounts = section.accounts || [];
  const isComputed = section.computed === true;
  const prevSection = (previousSections || []).find(s => s.key === section.key);
  const prevAccounts = prevSection?.accounts || [];

  // Top-level rows only — TreeRow handles children recursively.
  const topLevel = accounts.filter(a => a.level === 0);
  const hasContent = !isComputed && topLevel.length > 0;

  return (
    <>
      <TableRow sx={{ bgcolor: '#FAFBFC', cursor: hasContent ? 'pointer' : 'default' }}
        onClick={() => hasContent && setOpen(!open)} hover>
        <TableCell sx={{ ...cx, fontWeight: 600, pl: 2.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {hasContent && (open ? <KeyboardArrowDownIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} />)}
            {section.label}
            {isComputed && <Typography component="span" sx={{ ml: 0.75, fontSize: '0.6rem', color: 'text.disabled', fontStyle: 'italic' }}>(computed)</Typography>}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cx, fontWeight: 600, fontFamily: 'monospace', color: amtColor(section.total) }}>{fmt(section.total)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 600, fontFamily: 'monospace', color: prevSection ? amtColor(prevSection.total) : '#999' }}>{prevSection ? fmt(prevSection.total) : '-'}</TableCell>}
      </TableRow>
      {open && !isComputed && topLevel.map(row => (
        <TreeRow key={row.accountId} row={row} allAccounts={accounts} hasPrevious={hasPrevious} prevAccounts={prevAccounts} depth={0} />
      ))}
    </>
  );
};

const BSSide = ({ title, sections, total, hasPrevious, previousSections, previousTotal, currentLabel, previousLabel, scheduleIII }) => (
  <Box sx={{ border: '1px solid #E8EDF5', borderRadius: 1, mb: 1.5 }}>
    <Box sx={{ bgcolor: '#F4F7FE', px: 1.5, py: 0.5, borderBottom: '1px solid #E8EDF5' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{title}</Typography>
    </Box>
    <TableContainer>
      <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.25 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...hdrSx, width: hasPrevious ? '50%' : '60%' }}>Particulars</TableCell>
            <TableCell align="right" sx={hdrSx}>{currentLabel || 'Current'}</TableCell>
            {hasPrevious && <TableCell align="right" sx={hdrSx}>{previousLabel || 'Previous'}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {sections.map(sec => (
            scheduleIII && sec.subSections
              ? <ScheduleIIISection key={sec.key} section={sec} hasPrevious={hasPrevious} previousSections={previousSections} />
              : <BSSection key={sec.key} section={sec} hasPrevious={hasPrevious} previousSections={previousSections} />
          ))}
          {sections.length === 0 && !total && (
            <TableRow><TableCell colSpan={hasPrevious ? 3 : 2} sx={{ ...cx, textAlign: 'center', py: 2, color: 'text.secondary' }}>No data</TableCell></TableRow>
          )}
          <TableRow sx={{ bgcolor: '#F4F7FE' }}>
            <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', borderTop: '2px solid #E8EDF5' }}>TOTAL {title.toUpperCase()}</TableCell>
            <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', borderTop: '2px solid #E8EDF5', color: amtColor(total) }}>{fmt(total)}</TableCell>
            {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', borderTop: '2px solid #E8EDF5', color: amtColor(previousTotal) }}>{fmt(previousTotal)}</TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

// Schedule III section has subSections (e.g. Non-Current Assets → Property Plant & Equipment, Long-term Loans)
const ScheduleIIISection = ({ section, hasPrevious, previousSections }) => {
  const [open, setOpen] = useState(true);
  const subs = section.subSections || [];
  const prevSection = (previousSections || []).find(s => s.key === section.key);
  const prevSubs = prevSection?.subSections || [];

  return (
    <>
      <TableRow sx={{ bgcolor: '#EEF1F8', cursor: subs.length ? 'pointer' : 'default' }}
        onClick={() => subs.length && setOpen(!open)} hover>
        <TableCell sx={{ ...cx, fontWeight: 700, pl: 1.5, fontSize: '0.8rem' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {subs.length > 0 && (open ? <KeyboardArrowDownIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} />)}
            {section.label}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: amtColor(section.total) }}>{fmt(section.total)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: prevSection ? amtColor(prevSection.total) : '#999' }}>{prevSection ? fmt(prevSection.total) : '-'}</TableCell>}
      </TableRow>
      {open && subs.map(sub => {
        const prevSub = prevSubs.find(ps => ps.key === sub.key);
        return <BSSection key={sub.key} section={sub} hasPrevious={hasPrevious}
          previousSections={prevSubs} />;
      })}
    </>
  );
};

export default function BalanceSheetNew() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('fy');
  const [asOnDate, setAsOnDate] = useState(getAsOnDate('fy'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('standard');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = viewMode === 'scheduleIII'
        ? await ReportsService.getBalanceSheetScheduleIII({ asOnDate })
        : await ReportsService.getBalanceSheet({ asOnDate });
      setData(res.data?.data || null);
    } catch (err) { setData(null); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [asOnDate, viewMode]);

  const handleChip = (key) => { setActiveChip(key); setAsOnDate(getAsOnDate(key)); };
  const handleFilterApply = ({ to }) => { if (to) { setAsOnDate(to); setActiveChip(null); } };
  const handleFilterClear = () => { setActiveChip('fy'); setAsOnDate(getAsOnDate('fy')); };

  const currentFY = data?.currentFY || {};
  const previousFY = data?.previousFY || {};
  const tiles = data?.tiles || {};
  const meta = data?.meta || {};
  const difference = data?.difference || 0;
  const isBalanced = tiles.isBalanced ?? true;
  const hasPrevious = !!data?.previousFY;

  const handleExport = () => {
    const csvRows = [];
    const addSide = (label, secs, total) => {
      csvRows.push({ particular: `── ${label} ──`, current: '', previous: '' });
      (secs || []).forEach(sec => {
        csvRows.push({ particular: sec.label, current: sec.total || 0, previous: '' });
        (sec.accounts || []).filter(a => a.isParent !== 1).forEach(a => {
          csvRows.push({ particular: `  ${a.accountName}`, current: a.amount || 0, previous: '' });
        });
      });
      csvRows.push({ particular: `TOTAL ${label.toUpperCase()}`, current: total || 0, previous: '' });
    };
    addSide('Assets', currentFY.assets?.sections, currentFY.assets?.totalAssets);
    addSide('Equity & Liabilities', currentFY.equityAndLiabilities?.sections, currentFY.equityAndLiabilities?.totalEquityAndLiabilities);
    addSide('Profit & Loss', currentFY.profitAndLoss?.sections, currentFY.profitAndLoss?.totalPnL);
    csvRows.push({ particular: 'Closing Stock', current: currentFY.closingStockHead?.total || 0, previous: '' });
    csvRows.push({ particular: 'TOTAL PROFIT AND LOSS', current: (currentFY.profitAndLoss?.totalPnL || 0) + (currentFY.closingStockHead?.total || 0), previous: '' });
    ExportCsv([{ title: 'Particular', field: 'particular' }, { title: meta.fyLabel || 'Current', field: 'current' }], csvRows, `Balance_Sheet_${asOnDate}`);
  };

  const handlePdf = () => {
    if (!data) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightX = pageWidth - margin;
    let y = 15;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Balance Sheet', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`As on ${moment(meta.asOnDate || asOnDate).format('DD MMM YYYY')}`, margin, y + 5);
    doc.text(meta.fyLabel || '', rightX, y, { align: 'right' });
    doc.text(`Generated: ${moment().format('DD MMM YYYY hh:mm A')}`, rightX, y + 5, { align: 'right' });
    y += 14;

    // KPI summary line
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Assets: ${fmt(tiles.totalAssets)}    Total Liabilities: ${fmt(tiles.totalLiabilities)}    Difference: ${fmt(difference)}    P&L: ${fmt(tiles.plCurrentYear)}`, margin, y);
    y += 6;

    const colWidths = hasPrevious ? [95, 45, 45] : [130, 55];
    const headers = hasPrevious ? ['Particulars', meta.fyLabel || 'Current', meta.prevFyLabel || 'Previous'] : ['Particulars', meta.fyLabel || 'Current'];

    const buildRows = (sections, prevSections) => {
      const rows = [];
      (sections || []).forEach(sec => {
        const prevSec = (prevSections || []).find(s => s.key === sec.key);
        // If Schedule III with subSections
        if (sec.subSections) {
          rows.push([{ content: sec.label, styles: { fontStyle: 'bold', fillColor: [230, 235, 245] } }, { content: fmt(sec.total), styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 235, 245] } }, ...(hasPrevious ? [{ content: prevSec ? fmt(prevSec.total) : '-', styles: { halign: 'right', fillColor: [230, 235, 245] } }] : [])]);
          sec.subSections.forEach(sub => {
            const prevSub = (prevSec?.subSections || []).find(ps => ps.key === sub.key);
            rows.push([{ content: '  ' + sub.label, styles: { fontStyle: 'bold' } }, { content: fmt(sub.total), styles: { fontStyle: 'bold', halign: 'right' } }, ...(hasPrevious ? [{ content: prevSub ? fmt(prevSub.total) : '-', styles: { halign: 'right' } }] : [])]);
            (sub.accounts || []).filter(a => a.isParent === 1).forEach(a => {
              const prevA = (prevSub?.accounts || []).find(pa => pa.accountId === a.accountId);
              rows.push(['    ' + a.accountName, { content: fmt(a.amount), styles: { halign: 'right' } }, ...(hasPrevious ? [{ content: prevA ? fmt(prevA.amount) : '-', styles: { halign: 'right' } }] : [])]);
            });
          });
        } else {
          rows.push([{ content: sec.label, styles: { fontStyle: 'bold', fillColor: [245, 247, 250] } }, { content: fmt(sec.total), styles: { fontStyle: 'bold', halign: 'right', fillColor: [245, 247, 250] } }, ...(hasPrevious ? [{ content: prevSec ? fmt(prevSec.total) : '-', styles: { fontStyle: 'bold', halign: 'right', fillColor: [245, 247, 250] } }] : [])]);
          (sec.accounts || []).filter(a => a.isParent === 1).forEach(a => {
            const prevA = (prevSec?.accounts || []).find(pa => pa.accountId === a.accountId);
            rows.push(['  ' + a.accountName, { content: fmt(a.amount), styles: { halign: 'right' } }, ...(hasPrevious ? [{ content: prevA ? fmt(prevA.amount) : '-', styles: { halign: 'right' } }] : [])]);
          });
          (sec.accounts || []).filter(a => a.isParent !== 1 && a.level === 0).forEach(a => {
            const prevA = (prevSec?.accounts || []).find(pa => pa.accountId === a.accountId);
            rows.push(['  ' + a.accountName, { content: fmt(a.amount), styles: { halign: 'right' } }, ...(hasPrevious ? [{ content: prevA ? fmt(prevA.amount) : '-', styles: { halign: 'right' } }] : [])]);
          });
        }
      });
      return rows;
    };

    const addSection = (title, sections, prevSections, total, prevTotal) => {
      // Section header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setFillColor(230, 235, 250);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.text(title, margin + 2, y);
      y += 5;

      const rows = buildRows(sections, prevSections);
      // Total row
      rows.push([{ content: `TOTAL ${title.toUpperCase()}`, styles: { fontStyle: 'bold', fillColor: [220, 228, 245] } }, { content: fmt(total), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 228, 245] } }, ...(hasPrevious ? [{ content: fmt(prevTotal), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 228, 245] } }] : [])]);

      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
        headStyles: { fillColor: [55, 80, 130], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: hasPrevious
          ? { 0: { cellWidth: colWidths[0] }, 1: { cellWidth: colWidths[1], halign: 'right' }, 2: { cellWidth: colWidths[2], halign: 'right' } }
          : { 0: { cellWidth: colWidths[0] }, 1: { cellWidth: colWidths[1], halign: 'right' } },
        theme: 'grid',
      });
      y = doc.lastAutoTable.finalY + 4;
    };

    addSection('Assets', currentFY.assets?.sections, previousFY.assets?.sections, currentFY.assets?.totalAssets, previousFY.assets?.totalAssets);
    addSection('Equity & Liabilities', currentFY.equityAndLiabilities?.sections, previousFY.equityAndLiabilities?.sections, currentFY.equityAndLiabilities?.totalEquityAndLiabilities, previousFY.equityAndLiabilities?.totalEquityAndLiabilities);

    // P&L + Closing Stock section
    if (viewMode === 'standard') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setFillColor(230, 235, 250);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.text('Profit and Loss', margin + 2, y);
      y += 5;

      const plRows = [
        ['Profit / Loss (Net)', { content: fmt(currentFY.profitAndLoss?.totalPnL), styles: { halign: 'right' } }, ...(hasPrevious ? [{ content: fmt(previousFY.profitAndLoss?.totalPnL), styles: { halign: 'right' } }] : [])],
        ['Closing Stock', { content: fmt(currentFY.closingStockHead?.total), styles: { halign: 'right' } }, ...(hasPrevious ? [{ content: fmt(previousFY.closingStockHead?.total), styles: { halign: 'right' } }] : [])],
        [{ content: 'TOTAL PROFIT AND LOSS', styles: { fontStyle: 'bold', fillColor: [220, 228, 245] } }, { content: fmt((currentFY.profitAndLoss?.totalPnL || 0) + (currentFY.closingStockHead?.total || 0)), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 228, 245] } }, ...(hasPrevious ? [{ content: fmt((previousFY.profitAndLoss?.totalPnL || 0) + (previousFY.closingStockHead?.total || 0)), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 228, 245] } }] : [])],
      ];
      autoTable(doc, {
        startY: y, head: [headers], body: plRows, margin: { left: margin, right: margin },
        styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
        headStyles: { fillColor: [55, 80, 130], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        columnStyles: hasPrevious
          ? { 0: { cellWidth: colWidths[0] }, 1: { cellWidth: colWidths[1], halign: 'right' }, 2: { cellWidth: colWidths[2], halign: 'right' } }
          : { 0: { cellWidth: colWidths[0] }, 1: { cellWidth: colWidths[1], halign: 'right' } },
        theme: 'grid',
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }

    doc.save(`Balance_Sheet_${viewMode === 'scheduleIII' ? 'Schedule_III_' : ''}${asOnDate}.pdf`);
  };

  return (
    <>
      <Helmet><title>{titleURL} | Balance Sheet</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Balance Sheet</Typography>
          <Chip label="Standard" size="small" variant={viewMode === 'standard' ? 'filled' : 'outlined'} color={viewMode === 'standard' ? 'primary' : 'default'} onClick={() => setViewMode('standard')} sx={{ fontSize: 10, height: 22 }} />
          <Chip label="Schedule III" size="small" variant={viewMode === 'scheduleIII' ? 'filled' : 'outlined'} color={viewMode === 'scheduleIII' ? 'primary' : 'default'} onClick={() => setViewMode('scheduleIII')} sx={{ fontSize: 10, height: 22 }} />
          <Box sx={{ width: '1px', height: 16, bgcolor: '#ddd', mx: 0.5 }} />
          {PERIOD_CHIPS.map(c => (
            <Chip key={c.key} label={c.label} size="small"
              variant={activeChip === c.key ? 'filled' : 'outlined'}
              color={activeChip === c.key ? 'primary' : 'default'}
              onClick={() => handleChip(c.key)} sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Typography sx={{ fontSize: 10, color: '#8C8C8C', ml: 1, whiteSpace: 'nowrap' }}>
            As on {moment(asOnDate).format('DD MMM YYYY')}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total Assets" value={fmt(tiles.totalAssets)} color="#1565C0" />
          <KpiCard label="Total Liabilities" value={fmt(tiles.totalLiabilities)} color="#1565C0" />
          <KpiCard label="Difference" value={fmt(difference)} color={isBalanced ? '#2E7D32' : '#C62828'} />
          <KpiCard label="P&L Current Year" value={fmt(tiles.plCurrentYear)} color={Number(tiles.plCurrentYear) >= 0 ? '#2E7D32' : '#C62828'} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={asOnDate} to={asOnDate} locationFilter={[]} onApply={handleFilterApply} onClear={handleFilterClear} count={0} />
          <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Download PDF"><IconButton onClick={handlePdf}><PictureAsPdfIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>

        {/* Diff warning */}
        {data && !isBalanced && (
          <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
            Balance Sheet does not balance — difference of {fmt(difference)}. Check for excluded statuses, rounding, or missing accounts.
          </Alert>
        )}

        {/* Body */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>Loading...</Typography>
          ) : !data ? (
            <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>No data available</Typography>
          ) : (
            <>
              <BSSide
                title="Assets"
                sections={currentFY.assets?.sections || []}
                total={currentFY.assets?.totalAssets}
                hasPrevious={hasPrevious}
                previousSections={previousFY.assets?.sections || []}
                previousTotal={previousFY.assets?.totalAssets}
                currentLabel={meta.fyLabel}
                scheduleIII={viewMode === 'scheduleIII'}
                previousLabel={meta.prevFyLabel}
              />
              <BSSide
                title="Equity & Liabilities"
                sections={currentFY.equityAndLiabilities?.sections || []}
                total={currentFY.equityAndLiabilities?.totalEquityAndLiabilities}
                hasPrevious={hasPrevious}
                previousSections={previousFY.equityAndLiabilities?.sections || []}
                previousTotal={previousFY.equityAndLiabilities?.totalEquityAndLiabilities}
                currentLabel={meta.fyLabel}
                previousLabel={meta.prevFyLabel}
                scheduleIII={viewMode === 'scheduleIII'}
              />
              {/* Merged P&L + Closing Stock (only in standard view) */}
              {viewMode === 'standard' && <Box sx={{ border: '1px solid #E8EDF5', borderRadius: 1, mb: 1.5 }}>
                <Box sx={{ bgcolor: '#F4F7FE', px: 1.5, py: 0.5, borderBottom: '1px solid #E8EDF5' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Profit and Loss</Typography>
                </Box>
                <TableContainer>
                  <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.25 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...hdrSx, width: hasPrevious ? '50%' : '60%' }}>Particulars</TableCell>
                        <TableCell align="right" sx={hdrSx}>{meta.fyLabel || 'Current'}</TableCell>
                        {hasPrevious && <TableCell align="right" sx={hdrSx}>{meta.prevFyLabel || 'Previous'}</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ ...cx, fontWeight: 500, pl: 2.5 }}>Profit / Loss (Net)</TableCell>
                        <TableCell align="right" sx={{ ...cx, fontWeight: 500, fontFamily: 'monospace', color: amtColor(currentFY.profitAndLoss?.totalPnL) }}>{fmt(currentFY.profitAndLoss?.totalPnL)}</TableCell>
                        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 500, fontFamily: 'monospace', color: amtColor(previousFY.profitAndLoss?.totalPnL) }}>{fmt(previousFY.profitAndLoss?.totalPnL)}</TableCell>}
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ ...cx, fontWeight: 500, pl: 2.5 }}>Closing Stock</TableCell>
                        <TableCell align="right" sx={{ ...cx, fontWeight: 500, fontFamily: 'monospace', color: amtColor(currentFY.closingStockHead?.total) }}>{fmt(currentFY.closingStockHead?.total)}</TableCell>
                        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 500, fontFamily: 'monospace', color: amtColor(previousFY.closingStockHead?.total) }}>{fmt(previousFY.closingStockHead?.total)}</TableCell>}
                      </TableRow>
                      <TableRow sx={{ bgcolor: '#F4F7FE' }}>
                        <TableCell sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', borderTop: '2px solid #E8EDF5' }}>TOTAL PROFIT AND LOSS</TableCell>
                        <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', borderTop: '2px solid #E8EDF5', color: amtColor((currentFY.profitAndLoss?.totalPnL || 0) + (currentFY.closingStockHead?.total || 0)) }}>
                          {fmt((currentFY.profitAndLoss?.totalPnL || 0) + (currentFY.closingStockHead?.total || 0))}
                        </TableCell>
                        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace', borderTop: '2px solid #E8EDF5', color: amtColor((previousFY.profitAndLoss?.totalPnL || 0) + (previousFY.closingStockHead?.total || 0)) }}>
                          {fmt((previousFY.profitAndLoss?.totalPnL || 0) + (previousFY.closingStockHead?.total || 0))}
                        </TableCell>}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>}
            </>
          )}
        </Box>
      </Card>
    </>
  );
}
