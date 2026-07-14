import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Chip,
  Tooltip,
  IconButton,
  Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getExpenseSummaryStatsAction,
  getExpenseByCategoryAction,
  getExpenseByDepartmentAction,
  getExpenseByEmployeeAction,
} from 'redux/actions/expenseManagement.actions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

const formatINR = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

const today = new Date();
const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
const defaultTo = today.toISOString().substring(0, 10);

export default function ExpenseReportsTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { ExpenseManagementReducer: { summaryStats, byCategory, byDepartment, byEmployee } } = useSelector((s) => s);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  const loadReports = () => {
    dispatch(getExpenseSummaryStatsAction(fromDate, toDate, setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getExpenseByCategoryAction(fromDate, toDate, setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getExpenseByDepartmentAction(fromDate, toDate, setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getExpenseByEmployeeAction(fromDate, toDate, setModalTypeHandler, setLoaderStatusHandler));
  };

  const stats = summaryStats || {};
  const catData = byCategory || [];
  const deptData = byDepartment || [];
  const empData = byEmployee || [];

  const statCards = [
    { label: 'Total Claims', value: stats.total_claims || 0, color: '#1976d2' },
    { label: 'Total Amount', value: formatINR(stats.total_amount), color: '#7b1fa2' },
    { label: 'Avg Claim', value: formatINR(stats.avg_amount), color: '#0097a7' },
    { label: 'Approved', value: stats.approved_count || 0, color: '#2e7d32' },
    { label: 'Pending', value: stats.pending_count || 0, color: '#ed6c02' },
    { label: 'Violations', value: stats.violation_count || 0, color: '#d32f2f' },
  ];

const handleExport = () => {
    const dataToExport = detailedExpenses || [];

    if (dataToExport.length === 0) {
      alert("No detailed expense data available to export for this date range.");
      return;
    }
    const formattedData = dataToExport.map((item, index) => ({
      'Serial No': index + 1,
      'Department': item.department_name || '-',
      'Employee Name': item.employee_name || '-',
      'Claim Amount': item.claim_amount || 0,
      'Total Amount': item.total_amount || 0,
      'Reason': item.reason || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Data");
    const fileName = `Expense_Report_${fromDate}_to_${toDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Expense Reports</Typography>

      {/* Date Range Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
        display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <TextField label='From Date' size='small' type='date' value={fromDate}
          onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }} />
        <TextField label='To Date' size='small' type='date' value={toDate}
          onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }} />
        <Button variant='contained' size='small' startIcon={<SearchIcon />}
          onClick={loadReports} sx={{ textTransform: 'none', fontSize: 12 }}>
          Generate Report
        </Button>
        <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
          <IconButton onClick={handleExport}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Summary Stats */}
      {stats.total_claims !== undefined && (
        <>
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {statCards.map((card) => (
              <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, textAlign: 'center',
                  border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${card.color}`,
                }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: card.color }}>{card.value}</Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>{card.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* By Category */}
          {catData.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>By Category</Typography>
              <Grid container spacing={1.5}>
                {catData.map((cat, i) => {
                  const maxAmt = Math.max(...catData.map((c) => Number(c.total_amount) || 0), 1);
                  const pct = ((Number(cat.total_amount) || 0) / maxAmt) * 100;
                  return (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{cat.category_name || 'Uncategorized'}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1565c0' }}>{formatINR(cat.total_amount)}</Typography>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: '#1976d2', borderRadius: 3 }} />
                        </Box>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5 }}>
                          {cat.claim_count} claims | Avg: {formatINR(cat.avg_amount)}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* By Department */}
          {deptData.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>By Department</Typography>
              <Grid container spacing={1.5}>
                {deptData.map((dept, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{dept.department_name || 'No Dept'}</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#7b1fa2', mt: 0.5 }}>
                        {formatINR(dept.total_amount)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8, mt: 1 }}>
                        <Chip size='small' label={`${dept.claim_count} claims`} sx={{ fontSize: 9, height: 18 }} />
                        <Chip size='small' label={`${dept.employee_count} employees`} sx={{ fontSize: 9, height: 18 }} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* By Employee */}
          {empData.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>Top Spenders</Typography>
              <Grid container spacing={1.5}>
                {empData.slice(0, 12).map((emp, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{emp.employee_name}</Typography>
                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{emp.department_name || ''}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1565c0' }}>{formatINR(emp.total_amount)}</Typography>
                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{emp.claim_count} claims</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {stats.total_claims === undefined && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            Select a date range and click &quot;Generate Report&quot; to view expense analytics.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
