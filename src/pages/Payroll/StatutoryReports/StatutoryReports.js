import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Fade, FormControl, Grid,
  IconButton, InputLabel, MenuItem, Select, Tooltip, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import statutoryService from 'services/statutory_services';
import { useSelector } from 'react-redux';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
const monthNames = [
  { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
  { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
  { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
  { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' },
];

const REPORT_META = {
  summary: {
    pageTitle: 'Statutory Summary',
    breadcrumb: 'Statutory Summary',
  },
  pf: {
    pageTitle: 'PF ECR Report',
    breadcrumb: 'PF ECR Report',
    filename: 'PF_ECR',
  },
  esi: {
    pageTitle: 'ESI Report',
    breadcrumb: 'ESI Report',
    filename: 'ESI_Return',
  },
  pt: {
    pageTitle: 'PT Statement',
    breadcrumb: 'PT Statement',
    filename: 'PT_Statement',
  },
};

function getYearOptions() {
  const max = new Date().getFullYear();
  const years = [];
  for (let i = max; i >= max - 5; i--) years.push(i);
  return years;
}

function downloadCsv(headers, rows, filename) {
  let csv = 'data:text/csv;charset=utf-8,';
  csv += headers.join(',') + '\n';
  csv += rows.map((r) => r.map((v) => {
    const s = String(v ?? '');
    return s.includes(',') ? `"${s}"` : s;
  }).join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const tileThemes = {
  'PF Summary': { icon: <AccountBalanceIcon />, gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', iconBg: '#1976d2', accentColor: '#1565c0' },
  'ESI Summary': { icon: <HealthAndSafetyIcon />, gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', iconBg: '#1976d2', accentColor: '#1565c0' },
  'PT Summary': { icon: <ReceiptLongIcon />, gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', iconBg: '#1976d2', accentColor: '#1565c0' },
};

function SummaryTile({ title, items }) {
  const theme = tileThemes[title] || { icon: <SummarizeIcon />, gradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', iconBg: '#7b1fa2', accentColor: '#6a1b9a' };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '14px',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
        overflow: 'hidden',
      }}
    >
      {/* Colored header strip */}
      <Box sx={{ background: theme.gradient, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: theme.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: `0 3px 8px ${theme.iconBg}40`,
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        >
          {theme.icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem' }}>
          {title}
        </Typography>
      </Box>

      {/* Items */}
      <CardContent sx={{ py: 1.5, px: 2 }}>
        {items.map((item, i) => {
          const isTotal = item.label.toLowerCase().startsWith('total');
          return (
            <Box
              key={i}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                py: 0.6,
                ...(isTotal ? {
                  borderTop: '1px dashed #ddd',
                  mt: 0.75,
                  pt: 1,
                } : {}),
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.78rem', color: isTotal ? '#333' : '#777', fontWeight: isTotal ? 600 : 400 }}>
                {item.label}
              </Typography>
              <Chip
                size="small"
                label={`₹ ${Number(item.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: isTotal ? 700 : 500,
                  bgcolor: isTotal ? `${theme.accentColor}12` : '#f8f9fa',
                  color: isTotal ? theme.accentColor : '#444',
                  border: isTotal ? `1px solid ${theme.accentColor}30` : 'none',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

const pfColumns = [
  { field: 'employee_name', headerName: 'Employee', width: 170 },
  { field: 'uan', headerName: 'UAN', width: 150 },
  { field: 'pf_member_id', headerName: 'PF Member ID', width: 140 },
  { field: 'pf_wages', headerName: 'PF Wages', width: 120 },
  { field: 'pf_base', headerName: 'PF Base', width: 120 },
  { field: 'ee_epf', headerName: 'EE EPF', width: 100 },
  { field: 'ee_vpf', headerName: 'EE VPF', width: 100 },
  { field: 'er_epf', headerName: 'ER EPF', width: 100 },
  { field: 'er_eps', headerName: 'ER EPS', width: 100 },
  { field: 'er_edli', headerName: 'ER EDLI', width: 100 },
  { field: 'ncp_days', headerName: 'NCP Days', width: 100 },
];

const esiColumns = [
  { field: 'employee_name', headerName: 'Employee', width: 200 },
  { field: 'ip_number', headerName: 'IP Number', width: 180 },
  { field: 'contribution_wages', headerName: 'Contribution Wages', width: 200 },
  { field: 'ee_esi', headerName: 'EE ESI', width: 150 },
  { field: 'er_esi', headerName: 'ER ESI', width: 150 },
];

const ptColumns = [
  { field: 'employee_name', headerName: 'Employee', width: 180 },
  { field: 'locale', headerName: 'Locale', width: 140 },
  { field: 'monthly_gross', headerName: 'Monthly Gross', width: 160 },
  { field: 'half_income', headerName: 'Half Income', width: 150 },
  { field: 'half_year_pt', headerName: 'Half-Year PT', width: 140 },
  { field: 'deducted_this_month', headerName: 'Deducted This Month', width: 180 },
];

const getSummaryItems = (summary, reportType) => {
  if (!summary) return [];

  if (reportType === 'pf') {
    return [{
      title: 'PF Summary',
      items: [
        { label: 'EE EPF', value: summary.total_ee_epf },
        { label: 'EE VPF', value: summary.total_ee_vpf },
        { label: 'ER EPF', value: summary.total_er_epf },
        { label: 'ER EPS', value: summary.total_er_eps },
        { label: 'ER EDLI', value: summary.total_er_edli },
        { label: 'Total PF', value: (Number(summary.total_ee_epf || 0) + Number(summary.total_ee_vpf || 0) + Number(summary.total_er_epf || 0) + Number(summary.total_er_eps || 0) + Number(summary.total_er_edli || 0)) },
      ],
    }];
  }

  if (reportType === 'esi') {
    return [{
      title: 'ESI Summary',
      items: [
        { label: 'EE ESI', value: summary.total_ee_esi },
        { label: 'ER ESI', value: summary.total_er_esi },
        { label: 'Total ESI', value: (Number(summary.total_ee_esi || 0) + Number(summary.total_er_esi || 0)) },
      ],
    }];
  }

  if (reportType === 'pt') {
    return [{
      title: 'PT Summary',
      items: [
        { label: 'Total PT Deducted', value: summary.total_pt },
      ],
    }];
  }

  return [
    {
      title: 'PF Summary',
      items: [
        { label: 'EE EPF', value: summary.total_ee_epf },
        { label: 'EE VPF', value: summary.total_ee_vpf },
        { label: 'ER EPF', value: summary.total_er_epf },
        { label: 'ER EPS', value: summary.total_er_eps },
        { label: 'ER EDLI', value: summary.total_er_edli },
        { label: 'Total PF', value: (Number(summary.total_ee_epf || 0) + Number(summary.total_ee_vpf || 0) + Number(summary.total_er_epf || 0) + Number(summary.total_er_eps || 0) + Number(summary.total_er_edli || 0)) },
      ],
    },
    {
      title: 'ESI Summary',
      items: [
        { label: 'EE ESI', value: summary.total_ee_esi },
        { label: 'ER ESI', value: summary.total_er_esi },
        { label: 'Total ESI', value: (Number(summary.total_ee_esi || 0) + Number(summary.total_er_esi || 0)) },
      ],
    },
    {
      title: 'PT Summary',
      items: [
        { label: 'Total PT Deducted', value: summary.total_pt },
      ],
    },
  ];
};

const StatutoryReports = ({ reportType = 'summary' }) => {
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const {
    rbacReducer: { menuAccess = [] },
  } = useSelector((state) => state);

  const reportKeyMap = {
    summary: 'reports__statutory__statutory_summary',
    pf: 'reports__statutory__pf_ecr_report',
    esi: 'reports__statutory__esi_report',
    pt: 'reports__statutory__pt_statement',
  };
  const reportKey = reportKeyMap[reportType];
  const reportExport = storage?.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], reportKey, 'can_export') : true;

  const date = new Date();
  const prevMonth = date.getMonth() === 0 ? 12 : date.getMonth();
  const prevYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();

  const [month, setMonth] = useState(prevMonth);
  const [year, setYear] = useState(prevYear);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [pfData, setPfData] = useState([]);
  const [esiData, setEsiData] = useState([]);
  const [ptData, setPtData] = useState([]);

  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const payload = { salary_month: month, salary_year: year };
  const meta = REPORT_META[reportType] || REPORT_META.summary;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoaderStatusHandler(true);

      try {
        if (reportType === 'summary') {
          const summaryRes = await statutoryService.getStatutorySummary(payload);
          setSummary(summaryRes.data);
          setPfData([]);
          setEsiData([]);
          setPtData([]);
        } else if (reportType === 'pf') {
          const [summaryRes, pfRes] = await Promise.all([
            statutoryService.getStatutorySummary(payload),
            statutoryService.getPfEcrExport(payload),
          ]);
          setSummary(summaryRes.data);
          setPfData(pfRes.data?.data || []);
          setEsiData([]);
          setPtData([]);
        } else if (reportType === 'esi') {
          const [summaryRes, esiRes] = await Promise.all([
            statutoryService.getStatutorySummary(payload),
            statutoryService.getEsiExport(payload),
          ]);
          setSummary(summaryRes.data);
          setEsiData(esiRes.data?.data || []);
          setPfData([]);
          setPtData([]);
        } else if (reportType === 'pt') {
          const [summaryRes, ptRes] = await Promise.all([
            statutoryService.getStatutorySummary(payload),
            statutoryService.getPtStatement(payload),
          ]);
          setSummary(summaryRes.data);
          setPtData(ptRes.data?.data || []);
          setPfData([]);
          setEsiData([]);
        }
      } catch (err) {
        console.error('Statutory report fetch error:', err);
      } finally {
        setLoading(false);
        setLoaderStatusHandler(false);
      }
    };

    fetchData();
  }, [month, year, reportType]);

  const exportData = () => {
    if (!reportExport) return;
    let columns = [];
    let rows = [];

    if (reportType === 'pf') {
      columns = pfColumns;
      rows = pfData;
    } else if (reportType === 'esi') {
      columns = esiColumns;
      rows = esiData;
    } else if (reportType === 'pt') {
      columns = ptColumns;
      rows = ptData;
    }

    const headers = columns.map((c) => c.headerName).concat(['Month', 'Year']);
    const dataRows = rows.map((r) => columns.map((c) => r[c.field]).concat([r.month, r.year]));
    downloadCsv(headers, dataRows, `${meta.filename}_${month}_${year}.csv`);
  };

  const summaryCards = getSummaryItems(summary, reportType);
  const currentRows = reportType === 'pf' ? pfData : reportType === 'esi' ? esiData : ptData;
  const currentColumns = reportType === 'pf' ? pfColumns : reportType === 'esi' ? esiColumns : ptColumns;
  const dataWithId = currentRows?.length ? currentRows.map((row, index) => ({ ...row, id: index })) : [];

  return (
    <>
      <Helmet><title>{meta.pageTitle} | {titleURL}</title></Helmet>

      <Card
        sx={{
          width: '100%',
          height: 'calc(100vh - 75px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid #eee',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            {meta.pageTitle}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Month / Year selectors */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Month</InputLabel>
              <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)} sx={{ height: 34 }}>
                {monthNames.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)} sx={{ height: 34 }}>
                {getYearOptions().map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>

            <Chip
              label={`${monthNames.find((m) => m.id === month)?.name} ${year}`}
              size="small"
              color="primary"
              sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26 }}
            />

            {reportType !== 'summary' && reportExport && (
              <Tooltip title='Export CSV' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={exportData} disabled={loading || !currentRows.length}>
                  <FileDownloadIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title='Close'>
              <IconButton size='small' onClick={() => navigate('/report')}>
                <CloseIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Cards */}
        {summary && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <Grid container spacing={2}>
              {summaryCards.map((card) => (
                <Grid item xs={12} sm={4} key={card.title}>
                  <SummaryTile title={card.title} items={card.items} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Table */}
        {reportType !== 'summary' && (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {!loading ? (
              <DataGrid
                rows={dataWithId}
                columns={currentColumns}
                pageSizeOptions={[20, 50, 100]}
                density='compact'
                disableRowSelectionOnClick
                disableExtendRowFullWidth
                initialState={{
                  pagination: { paginationModel: { pageSize: 20 } },
                }}
                sx={{
                  height: '100%',
                  border: 0,
                  '& .MuiDataGrid-main': { overflow: 'hidden' },
                  '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#F4F7FE',
                    fontSize: 12,
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f5faf8',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #eee',
                  },
                }}
              />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant='body2' color='text.secondary'>Loading...</Typography>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </>
  );
};

export default StatutoryReports;
