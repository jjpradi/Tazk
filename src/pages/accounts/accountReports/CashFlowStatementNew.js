import React, { useState, useEffect, useContext } from 'react';
import { Box, Card, IconButton, Tooltip, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import FilterCreditNotes from '../../sales/returnCreditNotesReport/FilterCreditNotes';
import { ErrorAlert } from 'redux/actions/load';

function KpiCard({ label, value, color }) {
  return (<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
    <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
  </Box>);
}

const fmt = (v) => {
  if (v == null) return '';
  const num = Number(v);
  if (num === 0) return '-';
  const prefix = num < 0 ? '-' : '';
  return prefix + '\u20B9' + Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const DAY_CHIPS = [
  { key: 'fy', label: 'Current FY' },
  { key: 'lastfy', label: 'Last FY' },
  { key: 'q1', label: 'Q1' },
  { key: 'q2', label: 'Q2' },
  { key: 'q3', label: 'Q3' },
  { key: 'q4', label: 'Q4' },
];

function getFYDates(key) {
  const now = moment();
  const fyStart = now.month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
  const fyEnd = fyStart.clone().add(1, 'year').subtract(1, 'day');
  switch (key) {
    case 'fy': return { from: fyStart.format('YYYY-MM-DD'), to: moment().format('YYYY-MM-DD') };
    case 'lastfy': { const s = fyStart.clone().subtract(1, 'year'); return { from: s.format('YYYY-MM-DD'), to: s.clone().add(1, 'year').subtract(1, 'day').format('YYYY-MM-DD') }; }
    case 'q1': return { from: fyStart.format('YYYY-MM-DD'), to: fyStart.clone().add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q2': return { from: fyStart.clone().add(3, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(6, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q3': return { from: fyStart.clone().add(6, 'months').format('YYYY-MM-DD'), to: fyStart.clone().add(9, 'months').subtract(1, 'day').format('YYYY-MM-DD') };
    case 'q4': return { from: fyStart.clone().add(9, 'months').format('YYYY-MM-DD'), to: fyEnd.format('YYYY-MM-DD') };
    default: return { from: fyStart.format('YYYY-MM-DD'), to: moment().format('YYYY-MM-DD') };
  }
}

export default function CashFlowStatementNew() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [activeChip, setActiveChip] = useState('fy');
  const [fromDate, setFromDate] = useState(getFYDates('fy').from);
  const [toDate, setToDate] = useState(getFYDates('fy').to);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ReportsService.getCashFlowStatement({ fromDate, toDate });
      setData(res.data?.data || []);
      setKpis(res.data || {});
    } catch (err) {
      setData([]);
      setKpis({});
      ErrorAlert(dispatch, err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [fromDate, toDate]);

  const handleChip = (key) => {
    setActiveChip(key);
    const d = getFYDates(key);
    setFromDate(d.from);
    setToDate(d.to);
  };

  const handleFilterApply = ({ from, to }) => { if (from) setFromDate(from); if (to) setToDate(to); setActiveChip(null); };
  const handleFilterClear = () => { setActiveChip('fy'); const d = getFYDates('fy'); setFromDate(d.from); setToDate(d.to); };

  const sectionColors = { operating: '#E3F2FD', investing: '#FFF3E0', financing: '#F3E5F5', total: '#E8F5E9', header: '#F5F5F5' };

  return (<><Helmet><title>{titleURL} | Cash Flow Statement</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Cash Flow Statement</Typography>
        {DAY_CHIPS.map(c => (
          <Chip key={c.key} label={c.label} size="small"
            variant={activeChip === c.key ? 'filled' : 'outlined'}
            color={activeChip === c.key ? 'primary' : 'default'}
            onClick={() => handleChip(c.key)}
            sx={{ fontSize: 10, height: 22 }} />
        ))}
        <Typography sx={{ fontSize: 10, color: '#8C8C8C', ml: 1 }}>
          {moment(fromDate).format('DD MMM YY')} - {moment(toDate).format('DD MMM YY')}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <KpiCard label="Net Profit" value={fmt(kpis.netProfit)} color={Number(kpis.netProfit) >= 0 ? '#2E7D32' : '#C62828'} />
        <KpiCard label="Operating" value={fmt(kpis.netOperating)} color={Number(kpis.netOperating) >= 0 ? '#2E7D32' : '#C62828'} />
        <KpiCard label="Investing" value={fmt(kpis.netInvesting)} color={Number(kpis.netInvesting) >= 0 ? '#2E7D32' : '#C62828'} />
        <KpiCard label="Financing" value={fmt(kpis.netFinancing)} color={Number(kpis.netFinancing) >= 0 ? '#2E7D32' : '#C62828'} />
        <KpiCard label="Opening Cash" value={fmt(kpis.openingCash)} color="#1565C0" />
        <KpiCard label="Closing Cash" value={fmt(kpis.closingCash)} color="#1565C0" />
        <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={[]} onApply={handleFilterApply} onClear={handleFilterClear} count={0} />
        <Tooltip title="Export CSV"><IconButton onClick={() => {
          ExportCsv([{ title: 'Particulars', field: 'particular' }, { title: 'Amount (INR)', field: 'amount' }], data, 'Cash_Flow_Statement');
        }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.8, px: 2 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F4F7FE' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 13, width: '70%' }}>Particulars</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13, width: '30%' }}>Amount (INR)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => {
                const isSection = row.bold && row.amount == null;
                const isSubTotal = row.bold && row.amount != null;
                const bgColor = isSection ? sectionColors[row.section] || '#fff' : isSubTotal ? (sectionColors[row.section] || '#fff') : '#fff';
                const amtColor = row.amount > 0 ? '#2E7D32' : row.amount < 0 ? '#C62828' : '#555';

                return (
                  <TableRow key={i} sx={{ bgcolor: bgColor, '&:hover': { bgcolor: '#FAFAFA' } }}>
                    <TableCell sx={{ fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 700 : 400, color: '#2E3A59', borderBottom: isSubTotal ? '2px solid #ddd' : '1px solid #f0f0f0' }}>
                      {row.particular}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: row.bold ? 13 : 12, fontWeight: row.bold ? 700 : 400, color: amtColor, borderBottom: isSubTotal ? '2px solid #ddd' : '1px solid #f0f0f0' }}>
                      {row.amount != null ? fmt(row.amount) : ''}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card></>);
}
