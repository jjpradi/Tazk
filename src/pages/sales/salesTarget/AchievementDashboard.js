import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  Box, Card, Typography, Button, Collapse, CircularProgress,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';
import moment from 'moment';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { titleURL } from 'http-common';
import {
  getPeriodsAction,
  getAchievementSummaryAction,
  computeAchievementAction,
  getHistoricalTrendAction,
} from '../../../redux/actions/salesTarget_actions';
import PeriodSelector from './components/PeriodSelector';
import { AchievementReportPdf } from './components/TargetPdf';

const formatCurrency = (val) => {
  if (val == null || val === '' || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

function SummaryCard({ title, value, subtitle, color = '#2E3A59', bgcolor = '#F5F7FA' }) {
  return (
    <Card
      sx={{
        p: 2.5, textAlign: 'center', border: '1px solid #E8EDF5',
        bgcolor, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
      elevation={0}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#8C8C8C', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 11, color: '#999', mt: 0.5 }}>{subtitle}</Typography>
      )}
    </Card>
  );
}

export default function AchievementDashboard() {
  const dispatch = useDispatch();
  const context = useContext(CreateNewButtonContext);
  const headerLocationId = context.headerLocationId;
  const locFilter = headerLocationId && headerLocationId !== 'null' ? { location_id: headerLocationId } : {};
  const { periods, achievementSummary, historicalTrend, loading } = useSelector((s) => s.salesTargetReducer);

  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [recomputing, setRecomputing] = useState(false);

  useEffect(() => {
    dispatch(getPeriodsAction());
    dispatch(getHistoricalTrendAction({ limit: 12 }));
  }, [dispatch]);

  // Auto-select first period
  useEffect(() => {
    if (!selectedPeriod && Array.isArray(periods) && periods.length > 0) {
      setSelectedPeriod(periods[0].id || periods[0].period_id);
    }
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if (selectedPeriod) {
      dispatch(getAchievementSummaryAction(selectedPeriod, locFilter));
    }
  }, [dispatch, selectedPeriod, headerLocationId]);

  const handleRecompute = useCallback(() => {
    if (!selectedPeriod) return;
    setRecomputing(true);
    dispatch(computeAchievementAction(selectedPeriod, () => {
      dispatch(getAchievementSummaryAction(selectedPeriod, locFilter));
      setRecomputing(false);
    }));
    setTimeout(() => setRecomputing(false), 10000);
  }, [dispatch, selectedPeriod, headerLocationId]);

  // Compute summary KPIs
  const summaryData = useMemo(() => {
    const rows = Array.isArray(achievementSummary) ? achievementSummary : achievementSummary?.salesmen || [];
    const totalTarget = rows.reduce((s, r) => s + (Number(r.target_value) || 0), 0);
    const totalAchieved = rows.reduce((s, r) => s + (Number(r.achieved_value) || 0), 0);
    const totalCollection = rows.reduce((s, r) => s + (Number(r.collection_value) || 0), 0);
    const newCustomers = rows.reduce((s, r) => s + (Number(r.new_customers) || 0), 0);
    const achPct = totalTarget > 0 ? ((totalAchieved / totalTarget) * 100) : 0;
    return { totalTarget, totalAchieved, totalCollection, newCustomers, achPct, rows };
  }, [achievementSummary]);

  // Top 10 for bar chart simulation
  const top10 = useMemo(() => {
    return [...summaryData.rows]
      .sort((a, b) => (Number(b.achieved_value) || 0) - (Number(a.achieved_value) || 0))
      .slice(0, 10);
  }, [summaryData.rows]);

  const tableRows = summaryData.rows.map((r, idx) => ({
    ...r,
    id: r.salesman_id || r.id || idx,
    gap: (Number(r.target_value) || 0) - (Number(r.achieved_value) || 0),
    achievement_pct: r.target_value > 0 ? ((r.achieved_value / r.target_value) * 100) : 0,
    collection_pct: r.target_collection > 0 ? ((r.collection_value / r.target_collection) * 100) : 0,
    run_rate: (() => {
      const daysPassed = moment().date();
      const totalDays = moment().daysInMonth();
      const dailyRate = daysPassed > 0 ? (Number(r.achieved_value) || 0) / daysPassed : 0;
      return dailyRate * totalDays;
    })(),
  }));

  const columns = [
    { field: 'employee_name', headerName: 'Salesman', flex: 1.2, minWidth: 160,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            setExpandedRow(expandedRow === p.row.id ? null : p.row.id);
          }}>
            {expandedRow === p.row.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{p.value || '-'}</Typography>
        </Box>
      ),
    },
    { field: 'location_name', headerName: 'Location', flex: 0.7, minWidth: 100 },
    { field: 'target_value', headerName: 'Target', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.value) },
    { field: 'achieved_value', headerName: 'Achieved', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#4CAF50' }}>{formatCurrency(p.value)}</Typography> },
    { field: 'gap', headerName: 'Gap', flex: 0.6, minWidth: 100, align: 'right', headerAlign: 'right',
      renderCell: (p) => {
        const g = p.value || 0;
        return <Typography sx={{ fontSize: 13, color: g > 0 ? '#F44336' : '#4CAF50' }}>{formatCurrency(Math.abs(g))}</Typography>;
      },
    },
    { field: 'achievement_pct', headerName: 'Ach. %', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => {
        const pct = Number(p.value) || 0;
        const color = pct >= 100 ? '#4CAF50' : pct >= 75 ? '#FF9800' : '#F44336';
        return <Typography sx={{ fontSize: 13, fontWeight: 600, color }}>{pct.toFixed(1)}%</Typography>;
      },
    },
    { field: 'collection_pct', headerName: 'Coll. %', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => `${(Number(p.value) || 0).toFixed(1)}%` },
    { field: 'run_rate', headerName: 'Run Rate', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.value) },
  ];

  // Customer breakdown for expanded row
  const expandedCustomers = useMemo(() => {
    if (!expandedRow) return [];
    const row = summaryData.rows.find((r) => (r.salesman_id || r.id) === expandedRow);
    const customers = row?.customers || row?.customer_breakdown || [];
    return customers.map((c, idx) => ({ ...c, id: c.customer_id || c.id || idx }));
  }, [expandedRow, summaryData.rows]);

  const customerColumns = [
    { field: 'customer_name', headerName: 'Customer', flex: 1.2, minWidth: 160 },
    { field: 'target_value', headerName: 'Target', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.value) },
    { field: 'achieved_value', headerName: 'Achieved', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.value) },
    { field: 'achievement_pct', headerName: 'Ach. %', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => `${(Number(p.value) || 0).toFixed(1)}%` },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Achievement Dashboard</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        {/* Header */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ color: '#1976D2' }} />
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
                Achievement Dashboard
              </Typography>
              <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={recomputing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRecompute}
              disabled={recomputing || !selectedPeriod}
              sx={{ textTransform: 'none' }}
            >
              Recompute
            </Button>
            {summaryData.rows.length > 0 && (
              <AchievementReportPdf
                periodName={periods?.find(p => (p.id || p.period_id) === selectedPeriod)?.period_name}
                rows={summaryData.rows}
              />
            )}
          </Box>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="Total Target" value={formatCurrency(summaryData.totalTarget)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="Total Achieved" value={formatCurrency(summaryData.totalAchieved)} color="#4CAF50" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard
              title="Achievement %"
              value={`${Number(summaryData.achPct || 0).toFixed(1)}%`}
              color={Number(summaryData.achPct) >= 100 ? '#4CAF50' : Number(summaryData.achPct) >= 75 ? '#FF9800' : '#F44336'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="Total Collection" value={formatCurrency(summaryData.totalCollection)} color="#1976D2" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="New Customers" value={summaryData.newCustomers} color="#9C27B0" />
          </Grid>
        </Grid>

        {/* Historical Trend Chart */}
        {Array.isArray(historicalTrend) && historicalTrend.length > 1 && (
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 2 }}>
              Historical Trend (Target vs Achieved)
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={historicalTrend.map(t => ({
                name: t.period_name,
                Target: Number(t.total_target) || 0,
                Achieved: Number(t.total_achieved) || 0,
                'Ach %': t.total_target > 0 ? Math.round((t.total_achieved / t.total_target) * 100) : 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 'auto']} />
                <RechartsTooltip
                  formatter={(value, name) => name === 'Ach %' ? `${value}%` : `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="Target" fill="#E3F2FD" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="Achieved" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Ach %" stroke="#FF9800" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Bar Chart - Target vs Achieved (Top 10) */}
        <Card sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 2 }}>
            Target vs Achieved (Top 10)
          </Typography>
          {top10.length === 0 ? (
            <Typography sx={{ color: '#999', fontSize: 13, py: 2, textAlign: 'center' }}>
              No data available
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {top10.map((row, idx) => {
                const target = Number(row.target_value) || 1;
                const achieved = Number(row.achieved_value) || 0;
                const pct = Math.min((achieved / target) * 100, 100);
                return (
                  <Box key={row.salesman_id || idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#555' }}>
                        {row.employee_name || `Salesman ${idx + 1}`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#888' }}>
                        {formatCurrency(achieved)} / {formatCurrency(target)}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative', height: 20, borderRadius: 1, overflow: 'hidden', bgcolor: '#E3F2FD' }}>
                      <Box
                        sx={{
                          position: 'absolute', left: 0, top: 0, height: '100%',
                          width: `${pct}%`, borderRadius: 1,
                          bgcolor: pct >= 100 ? '#4CAF50' : pct >= 75 ? '#FF9800' : '#2196F3',
                          transition: 'width 0.5s ease',
                        }}
                      />
                      <Typography
                        sx={{
                          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                          fontSize: 10, fontWeight: 600, color: '#333',
                        }}
                      >
                        {Number(pct).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>

        {/* Full Table */}
        <Card sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1 }}>
            All Salesmen
          </Typography>
          <DataGrid
            rows={tableRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{
              flex: 1, border: 'none',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F5F7FA', borderBottom: '1px solid #E8EDF5' },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFC' },
              '& .MuiDataGrid-cell': { fontSize: 13 },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#999', fontSize: 14 }}>
                    {selectedPeriod ? 'No achievement data. Click "Recompute" to generate.' : 'Select a period to view achievements.'}
                  </Typography>
                </Box>
              ),
            }}
          />
          {/* Customer drill-down */}
          <Collapse in={!!expandedRow && expandedCustomers.length > 0}>
            <Card variant="outlined" sx={{ p: 1.5, mt: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: '#555' }}>
                Customer Breakdown
              </Typography>
              <DataGrid
                rows={expandedCustomers}
                columns={customerColumns}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#FAFBFC' },
                  '& .MuiDataGrid-cell': { fontSize: 12 },
                }}
              />
            </Card>
          </Collapse>
        </Card>
      </Box>
    </>
  );
}
