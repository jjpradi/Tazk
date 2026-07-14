import React, { useState, useEffect } from 'react';
import {
  Box, Card, IconButton, Tooltip, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { ErrorAlert } from 'redux/actions/load';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import { Helmet } from 'react-helmet-async';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const DAY_CHIPS = [
  { key: 'fy', label: 'Current FY' },
  { key: 'lastfy', label: 'Last FY' },
  { key: 'q1', label: 'Q1' },
  { key: 'q2', label: 'Q2' },
  { key: 'q3', label: 'Q3' },
  { key: 'q4', label: 'Q4' },
  { key: 'month', label: 'This Month' },
];

function getFYDates(key) {
  const now = moment();
  const fyStart = now.month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
  switch (key) {
    case 'fy': return { from: fyStart.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') };
    case 'lastfy': { const s = fyStart.clone().subtract(1, 'year'); return { from: s.format('YYYY-MM-DD'), to: s.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') }; }
    case 'q1': return { from: fyStart.format('YYYY-MM-DD'), to: fyStart.clone().add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q2': return { from: fyStart.clone().add(3, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(6, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q3': return { from: fyStart.clone().add(6, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(9, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q4': return { from: fyStart.clone().add(9, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'month': return { from: now.startOf('month').format('YYYY-MM-DD'), to: now.endOf('month').format('YYYY-MM-DD') };
    default: return { from: fyStart.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') };
  }
}

const cx = { py: 0.25, px: 1.5, fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', lineHeight: 1.3 };
const hdrSx = { ...cx, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.3, bgcolor: '#F4F7FE', py: 0.4 };

const PLSection = ({ section, hasPrevious, prevRows }) => {
  const [open, setOpen] = useState(true);
  const accounts = section.accounts || [];
  const parents = accounts.filter(a => a.isParent === 1);
  const orphans = accounts.filter(a => a.isParent !== 1 && a.level === 0);
  const children = accounts.filter(a => a.isParent !== 1 && a.level === 1);
  const hasContent = parents.length > 0 || orphans.length > 0;

  const prevSection = (prevRows || []).find(r => r.key === section.key);
  const prevAccounts = prevSection?.accounts || [];

  if (section.isComputed) {
    const isProfit = section.key === 'gross_profit' || section.key === 'ebitda' || section.key === 'pbt' || section.key === 'net_profit' || section.key === 'total_revenue';
    return (
      <TableRow sx={{ bgcolor: '#EEF1F8' }}>
        <TableCell sx={{ ...cx, fontWeight: 700, pl: 1.5, fontSize: '0.8rem' }}>{section.label}</TableCell>
        <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: section.total < 0 ? '#C62828' : '#2E7D32' }}>{fmt(section.total)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>{prevSection ? fmt(prevSection.total) : '-'}</TableCell>}
      </TableRow>
    );
  }

  return (
    <>
      <TableRow sx={{ bgcolor: '#FAFBFC', cursor: hasContent ? 'pointer' : 'default' }}
        onClick={() => hasContent && setOpen(!open)} hover>
        <TableCell sx={{ ...cx, fontWeight: 600, pl: 2.5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {hasContent && (open ? <KeyboardArrowDownIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16, mr: 0.3, color: '#888' }} />)}
            {section.label}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cx, fontWeight: 600, fontFamily: 'monospace' }}>{fmt(section.total)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontWeight: 600, fontFamily: 'monospace', color: 'text.secondary' }}>{prevSection ? fmt(prevSection.total) : '-'}</TableCell>}
      </TableRow>
      {open && parents.map(p => (
        <ParentRow
          key={p.accountId}
          parent={p}
          children={children.filter(c => c.parentId === p.accountId)}
          hasPrevious={hasPrevious}
          prevAccounts={prevAccounts}
        />
      ))}
      {open && orphans.map((o, i) => (
        (() => {
          const prevOrphan = prevAccounts.find(a => a.accountId === o.accountId && a.isParent !== 1);
          return (
        <TableRow key={o.accountId || i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
          <TableCell sx={{ ...cx, pl: 5, fontSize: '0.75rem' }}>{o.accountName}</TableCell>
          <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: '0.75rem' }}>{fmt(o.amount)}</TableCell>
          {hasPrevious && <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{prevOrphan ? fmt(prevOrphan.amount) : '-'}</TableCell>}
        </TableRow>
          );
        })()
      ))}
    </>
  );
};

const ParentRow = ({ parent, children, hasPrevious, prevAccounts }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = children.length > 0;
  const prevParent = (prevAccounts || []).find(a => a.accountId === parent.accountId && a.isParent === 1);
  return (
    <>
      <TableRow hover onClick={() => hasChildren && setOpen(!open)}
        sx={{ cursor: hasChildren ? 'pointer' : 'default', '&:hover': { bgcolor: '#FAFBFF' } }}>
        <TableCell sx={{ ...cx, pl: 5, fontWeight: 500 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {hasChildren && (open ? <KeyboardArrowDownIcon sx={{ fontSize: 15, mr: 0.3, color: '#888' }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 15, mr: 0.3, color: '#888' }} />)}
            {parent.accountName}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontWeight: 500 }}>{fmt(parent.amount)}</TableCell>
        {hasPrevious && <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>{prevParent ? fmt(prevParent.amount) : '-'}</TableCell>}
      </TableRow>
      {hasChildren && open && children.map((c, i) => (
        (() => {
          const prevChild = (prevAccounts || []).find(a => a.accountId === c.accountId && a.isParent !== 1);
          return (
            <TableRow key={c.accountId || i} sx={{ '&:hover': { bgcolor: '#FAFBFF' } }}>
              <TableCell sx={{ ...cx, pl: 8, fontSize: '0.73rem', color: '#555' }}>{c.accountName}</TableCell>
              <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: '0.73rem', color: '#555' }}>{fmt(c.amount)}</TableCell>
              {hasPrevious && <TableCell align="right" sx={{ ...cx, fontFamily: 'monospace', fontSize: '0.73rem', color: 'text.secondary' }}>{prevChild ? fmt(prevChild.amount) : '-'}</TableCell>}
            </TableRow>
          );
        })()
      ))}
    </>
  );
};

export default function ProfitLossNew() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('fy');
  const [fromDate, setFromDate] = useState(getFYDates('fy').from);
  const [toDate, setToDate] = useState(getFYDates('fy').to);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ReportsService.getProfitLoss({ fromDate, toDate });
      setData(res.data?.data || null);
    } catch (err) {
      setData(null);
      ErrorAlert(dispatch, err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [fromDate, toDate]);

  const handleChip = (key) => { setActiveChip(key); const d = getFYDates(key); setFromDate(d.from); setToDate(d.to); };
  const handleFilterApply = ({ from, to }) => { if (from) setFromDate(from); if (to) setToDate(to); setActiveChip(null); };
  const handleFilterClear = () => { setActiveChip('fy'); const d = getFYDates('fy'); setFromDate(d.from); setToDate(d.to); };

  const currentFY = data?.currentFY || {};
  const previousFY = data?.previousFY || {};
  const tiles = data?.tiles || {};
  const meta = data?.meta || {};
  const hasPrevious = !!data?.previousFY;
  const rows = currentFY.statementRows || [];
  const prevRows = previousFY.statementRows || [];

  const handleExport = () => {
    const csvRows = rows.map(r => ({
      particular: r.isComputed ? `** ${r.label} **` : r.label,
      current: r.total || 0,
    }));
    ExportCsv([{ title: 'Particular', field: 'particular' }, { title: meta.fyLabel || 'Current', field: 'current' }], csvRows, `Profit_Loss_${fromDate}_${toDate}`);
  };

  const handlePdf = () => {
    if (!data) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightX = pageWidth - margin;
    let y = 15;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('Profit & Loss Statement', margin, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(`${moment(fromDate).format('DD MMM YYYY')} to ${moment(toDate).format('DD MMM YYYY')}`, margin, y + 5);
    doc.text(`Generated: ${moment().format('DD MMM YYYY hh:mm A')}`, rightX, y + 5, { align: 'right' });
    y += 14;

    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`Revenue: ${fmt(tiles.totalRevenue)}   Expenses: ${fmt(tiles.totalExpense)}   Gross Profit: ${fmt(tiles.grossProfit)}   Net Profit: ${fmt(tiles.netProfit)}`, margin, y);
    y += 8;

    const headers = hasPrevious ? ['Particulars', meta.fyLabel || 'Current', meta.prevFyLabel || 'Previous'] : ['Particulars', meta.fyLabel || 'Current'];
    const pdfRows = rows.map(r => {
      const prevR = prevRows.find(p => p.key === r.key);
      const row = [r.isComputed ? r.label : '  ' + r.label, { content: fmt(r.total), styles: { halign: 'right', fontStyle: r.isComputed ? 'bold' : 'normal' } }];
      if (hasPrevious) row.push({ content: prevR ? fmt(prevR.total) : '-', styles: { halign: 'right' } });
      if (r.isComputed) { row[0] = { content: r.label, styles: { fontStyle: 'bold', fillColor: [230, 235, 245] } }; row[1].styles.fillColor = [230, 235, 245]; if (hasPrevious) row[2].styles = { ...row[2].styles, fillColor: [230, 235, 245] }; }
      return row;
    });

    autoTable(doc, {
      startY: y, head: [headers], body: pdfRows, margin: { left: margin, right: margin },
      styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
      headStyles: { fillColor: [55, 80, 130], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      theme: 'grid',
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) { doc.setPage(i); doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(150); doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' }); }
    doc.save(`Profit_Loss_${fromDate}_${toDate}.pdf`);
  };

  const margins = currentFY.margins || {};

  return (
    <>
      <Helmet><title>{titleURL} | Profit & Loss</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, flexWrap: 'nowrap' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Profit & Loss</Typography>
          {DAY_CHIPS.map(c => (
            <Chip key={c.key} label={c.label} size="small"
              variant={activeChip === c.key ? 'filled' : 'outlined'}
              color={activeChip === c.key ? 'primary' : 'default'}
              onClick={() => handleChip(c.key)} sx={{ fontSize: 10, height: 22 }} />
          ))}
          <Typography sx={{ fontSize: 10, color: '#8C8C8C', ml: 1, whiteSpace: 'nowrap' }}>
            {moment(fromDate).format('DD MMM YY')} - {moment(toDate).format('DD MMM YY')}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Revenue" value={fmt(tiles.totalRevenue)} color="#1565C0" />
          <KpiCard label="Gross Profit" value={fmt(tiles.grossProfit)} color={Number(tiles.grossProfit) >= 0 ? '#2E7D32' : '#C62828'} />
          <KpiCard label="EBITDA" value={fmt(tiles.ebitda)} color={Number(tiles.ebitda) >= 0 ? '#2E7D32' : '#C62828'} />
          <KpiCard label="Net Profit" value={fmt(tiles.netProfit)} color={Number(tiles.netProfit) >= 0 ? '#2E7D32' : '#C62828'} />
          <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={[]} onApply={handleFilterApply} onClear={handleFilterClear} count={0} />
          <Tooltip title="Export CSV"><IconButton onClick={handleExport}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Download PDF"><IconButton onClick={handlePdf}><PictureAsPdfIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>

        {/* Margins */}
        {data && (
          <Box sx={{ display: 'flex', gap: 2, pb: 1, px: 0.5 }}>
            <Typography sx={{ fontSize: 10, color: '#666' }}>Gross Margin: <b>{margins.grossMargin || 0}%</b></Typography>
            <Typography sx={{ fontSize: 10, color: '#666' }}>EBITDA Margin: <b>{margins.ebitdaMargin || 0}%</b></Typography>
            <Typography sx={{ fontSize: 10, color: '#666' }}>Net Margin: <b>{margins.netMargin || 0}%</b></Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>Loading...</Typography>
          ) : !data ? (
            <Typography sx={{ textAlign: 'center', py: 6, color: '#999' }}>No data available</Typography>
          ) : (
            <Box sx={{ border: '1px solid #E8EDF5', borderRadius: 1 }}>
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
                    {rows.map((row, idx) => (
                      <PLSection key={row.key || idx} section={row} hasPrevious={hasPrevious} prevRows={prevRows} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
}
