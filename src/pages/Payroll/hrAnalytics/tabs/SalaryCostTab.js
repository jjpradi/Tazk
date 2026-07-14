import React, { useState, useContext, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, Chip, LinearProgress,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getSalaryCostByDeptAction,
  getSalaryCostTrendAction,
  getSalaryCostByGradeAction,
} from 'redux/actions/hrAnalytics.actions';

const formatINR = (val) => {
  if (val == null || isNaN(val)) return '\u20B90';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const summaryCardConfig = [
  { key: 'totalGross', label: 'Total Gross', icon: AttachMoneyIcon, color: '#1565c0', bg: '#e3f2fd' },
  { key: 'totalNet', label: 'Total Net', icon: AccountBalanceIcon, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'totalStatutory', label: 'Total Statutory', icon: TrendingUpIcon, color: '#e65100', bg: '#fff3e0' },
  { key: 'avgGross', label: 'Avg Gross / Employee', icon: PeopleIcon, color: '#6a1b9a', bg: '#f3e5f5' },
];

export default function SalaryCostTab({ salaryCostByDept, salaryCostTrend, salaryCostByGrade }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler: s, setLoaderStatusHandler: l } = useContext(CreateNewButtonContext);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  // Department table sort
  const [deptOrder, setDeptOrder] = useState('desc');
  const [deptOrderBy, setDeptOrderBy] = useState('total_gross');

  // Grade table sort
  const [gradeOrder, setGradeOrder] = useState('desc');
  const [gradeOrderBy, setGradeOrderBy] = useState('total_gross');

  const deptData = useMemo(() => (Array.isArray(salaryCostByDept) ? salaryCostByDept : []), [salaryCostByDept]);
  const trendData = useMemo(() => (Array.isArray(salaryCostTrend) ? salaryCostTrend : []), [salaryCostTrend]);
  const gradeData = useMemo(() => (Array.isArray(salaryCostByGrade) ? salaryCostByGrade : []), [salaryCostByGrade]);

  // Summary calculations from department data
  const summary = useMemo(() => {
    const totalGross = deptData.reduce((acc, r) => acc + (Number(r.total_gross) || 0), 0);
    const totalNet = deptData.reduce((acc, r) => acc + (Number(r.total_net) || 0), 0);
    const totalStatutory = deptData.reduce((acc, r) => acc + (Number(r.total_employer_statutory) || 0), 0);
    const totalEmployees = deptData.reduce((acc, r) => acc + (Number(r.employee_count) || 0), 0);
    const avgGross = totalEmployees > 0 ? Math.round(totalGross / totalEmployees) : 0;
    return { totalGross, totalNet, totalStatutory, avgGross };
  }, [deptData]);

  // Load data
  const handleLoad = useCallback(() => {
    setLoading(true);
    dispatch(getSalaryCostByDeptAction(month, year, s, l));
    dispatch(getSalaryCostByGradeAction(month, year, s, l));
    dispatch(getSalaryCostTrendAction(month, year, s, l));
    setTimeout(() => setLoading(false), 600);
  }, [dispatch, month, year, s, l]);

  // Sorted department data
  const sortedDeptData = useMemo(() => {
    const sorted = [...deptData];
    sorted.sort((a, b) => {
      const aVal = Number(a[deptOrderBy]) || 0;
      const bVal = Number(b[deptOrderBy]) || 0;
      return deptOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [deptData, deptOrder, deptOrderBy]);

  // Sorted grade data
  const sortedGradeData = useMemo(() => {
    const sorted = [...gradeData];
    sorted.sort((a, b) => {
      const aVal = Number(a[gradeOrderBy]) || 0;
      const bVal = Number(b[gradeOrderBy]) || 0;
      return gradeOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [gradeData, gradeOrder, gradeOrderBy]);

  // Trend chart max for bar scaling
  const trendMax = useMemo(
    () => Math.max(...trendData.map((r) => Number(r.total_gross) || 0), 1),
    [trendData],
  );

  const handleDeptSort = (column) => {
    const isAsc = deptOrderBy === column && deptOrder === 'asc';
    setDeptOrder(isAsc ? 'desc' : 'asc');
    setDeptOrderBy(column);
  };

  const handleGradeSort = (column) => {
    const isAsc = gradeOrderBy === column && gradeOrder === 'asc';
    setGradeOrder(isAsc ? 'desc' : 'asc');
    setGradeOrderBy(column);
  };

  return (
    <Box>
      {/* Month / Year Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={handleLoad}
              sx={{ minWidth: 120 }}
            >
              Load
            </LoadingButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderLeft: `4px solid ${card.color}`,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ color: card.color, fontSize: 26 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {card.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} noWrap>
                    {formatINR(summary[card.key])}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Cost by Department */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Cost by Department
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={deptOrderBy === 'employee_count'}
                    direction={deptOrderBy === 'employee_count' ? deptOrder : 'asc'}
                    onClick={() => handleDeptSort('employee_count')}
                  >
                    Employees
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={deptOrderBy === 'total_gross'}
                    direction={deptOrderBy === 'total_gross' ? deptOrder : 'asc'}
                    onClick={() => handleDeptSort('total_gross')}
                  >
                    Gross (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={deptOrderBy === 'total_net'}
                    direction={deptOrderBy === 'total_net' ? deptOrder : 'asc'}
                    onClick={() => handleDeptSort('total_net')}
                  >
                    Net (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={deptOrderBy === 'avg_gross'}
                    direction={deptOrderBy === 'avg_gross' ? deptOrder : 'asc'}
                    onClick={() => handleDeptSort('avg_gross')}
                  >
                    Avg Gross (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={deptOrderBy === 'total_employer_statutory'}
                    direction={deptOrderBy === 'total_employer_statutory' ? deptOrder : 'asc'}
                    onClick={() => handleDeptSort('total_employer_statutory')}
                  >
                    Employer Statutory (INR)
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDeptData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No department data available. Select month/year and click Load.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedDeptData.map((row, idx) => (
                  <TableRow key={row.department_name || idx} hover>
                    <TableCell>{row.department_name || '-'}</TableCell>
                    <TableCell align="right">{row.employee_count ?? 0}</TableCell>
                    <TableCell align="right">{formatINR(row.total_gross)}</TableCell>
                    <TableCell align="right">{formatINR(row.total_net)}</TableCell>
                    <TableCell align="right">{formatINR(row.avg_gross)}</TableCell>
                    <TableCell align="right">{formatINR(row.total_employer_statutory)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Cost by Grade */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Cost by Grade
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={gradeOrderBy === 'employee_count'}
                    direction={gradeOrderBy === 'employee_count' ? gradeOrder : 'asc'}
                    onClick={() => handleGradeSort('employee_count')}
                  >
                    Employees
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={gradeOrderBy === 'total_gross'}
                    direction={gradeOrderBy === 'total_gross' ? gradeOrder : 'asc'}
                    onClick={() => handleGradeSort('total_gross')}
                  >
                    Total Gross (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={gradeOrderBy === 'avg_gross'}
                    direction={gradeOrderBy === 'avg_gross' ? gradeOrder : 'asc'}
                    onClick={() => handleGradeSort('avg_gross')}
                  >
                    Avg Gross (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={gradeOrderBy === 'min_gross'}
                    direction={gradeOrderBy === 'min_gross' ? gradeOrder : 'asc'}
                    onClick={() => handleGradeSort('min_gross')}
                  >
                    Min Gross (INR)
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={gradeOrderBy === 'max_gross'}
                    direction={gradeOrderBy === 'max_gross' ? gradeOrder : 'asc'}
                    onClick={() => handleGradeSort('max_gross')}
                  >
                    Max Gross (INR)
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGradeData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No grade data available. Select month/year and click Load.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedGradeData.map((row, idx) => (
                  <TableRow key={row.grade_code || idx} hover>
                    <TableCell>
                      {row.grade_name || '-'}
                      {row.grade_code && (
                        <Chip label={row.grade_code} size="small" variant="outlined" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                    <TableCell align="right">{row.employee_count ?? 0}</TableCell>
                    <TableCell align="right">{formatINR(row.total_gross)}</TableCell>
                    <TableCell align="right">{formatINR(row.avg_gross)}</TableCell>
                    <TableCell align="right">{formatINR(row.min_gross)}</TableCell>
                    <TableCell align="right">{formatINR(row.max_gross)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Monthly Cost Trend */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Monthly Cost Trend (Last 12 Months)
        </Typography>
        {trendData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No trend data available. Select month/year and click Load.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {trendData.map((row, idx) => {
              const gross = Number(row.total_gross) || 0;
              const pct = (gross / trendMax) * 100;
              return (
                <Box key={row.period || idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>
                      {row.period || '-'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${row.headcount ?? 0} emp`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2" fontWeight={500} sx={{ minWidth: 110, textAlign: 'right' }}>
                        {formatINR(gross)}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 18,
                      borderRadius: 1,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
