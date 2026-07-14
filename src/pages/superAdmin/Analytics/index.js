import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Paper, CircularProgress, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip as MuiTooltip,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import superAdminService from '../../../services/superAdmin_services';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b', '#3f51b5', '#795548'];

function formatCurrency(val) {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val?.toFixed?.(0) || '0';
}

function BigStatCard({ icon, title, value, subtitle, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
      </Box>
      <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Paper>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [ltvData, setLtvData] = useState(null);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const res = await superAdminService.getAnalyticsData();
      if (res.status === 200) setData(res.data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    if (revenueData) return;
    try {
      const res = await superAdminService.getRevenueOverview();
      if (res.status === 200) setRevenueData(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCohorts = async () => {
    if (cohortData) return;
    try {
      const res = await superAdminService.getCohortData();
      if (res.status === 200) setCohortData(res.data);
    } catch (err) { console.error(err); }
  };

  const loadLTV = async () => {
    if (ltvData) return;
    try {
      const res = await superAdminService.getLTVData();
      if (res.status === 200) setLtvData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleTabChange = (e, v) => {
    setTab(v);
    if (v === 1) loadRevenue();
    if (v === 2) loadCohorts();
    if (v === 3) loadLTV();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }
  if (!data) {
    return <Typography sx={{ p: 3 }}>Failed to load analytics data.</Typography>;
  }

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', overflow: 'auto' }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="MRR & Revenue" />
        <Tab label="Retention" />
        <Tab label="LTV & Plans" />
      </Tabs>

      {tab === 0 && <OverviewTab data={data} />}
      {tab === 1 && <RevenueTab data={revenueData} />}
      {tab === 2 && <CohortTab data={cohortData} />}
      {tab === 3 && <LTVTab data={ltvData} />}
    </Box>
  );
}

// ─── Tab 0: Overview (existing) ───────────────────────────────

function OverviewTab({ data }) {
  const { totalRevenue, totalSubscribers, revenueByType, revenueByPlan, churnTrend, growthTrend, avgDuration, employeeDistribution } = data;
  const totalChurned = churnTrend.reduce((s, c) => s + c.churned, 0);
  const growthChurnData = growthTrend.map(g => {
    const churn = churnTrend.find(c => c.month === g.month);
    return { month: g.month, new_companies: g.new_companies, churned: churn ? churn.churned : 0 };
  });

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <BigStatCard icon={<CurrencyRupeeIcon />} title="Total Active Revenue" value={`Rs. ${formatCurrency(totalRevenue)}`} subtitle="From all active subscriptions" color="#2196f3" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <BigStatCard icon={<GroupsIcon />} title="Active Subscribers" value={totalSubscribers} subtitle="Across all plans" color="#4caf50" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <BigStatCard icon={<TrendingDownIcon />} title="Churned (12 months)" value={totalChurned} subtitle="Expired subscriptions" color="#f44336" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Revenue by Company Type</Typography>
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={revenueByType.filter(r => r.total_revenue > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={100} dataKey="total_revenue" nameKey="type_name" label={({ type_name, total_revenue }) => `${type_name}: Rs.${formatCurrency(total_revenue)}`} labelLine fontSize={11}>
                  {revenueByType.filter(r => r.total_revenue > 0).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Revenue by Plan</Typography>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={revenueByPlan.filter(r => r.revenue > 0)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${formatCurrency(v)}`} />
                <YAxis type="category" dataKey="plan_name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#2196f3" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Growth vs Churn (12 months)</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={growthChurnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="new_companies" name="New Companies" stroke="#4caf50" fill="#4caf5030" strokeWidth={2} />
                <Area type="monotone" dataKey="churned" name="Churned" stroke="#f44336" fill="#f4433630" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Employees by Company Type</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={employeeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type_name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="employee_count" name="Employees" fill="#9c27b0" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Plan Revenue Breakdown</Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }} align="center">Subscribers</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }} align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueByPlan.map((p, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{p.plan_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{p.type_name || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{p.Price ? `Rs. ${parseFloat(p.Price).toLocaleString()}` : '-'}</TableCell>
                      <TableCell align="center"><Chip label={p.subscribers} size="small" sx={{ height: 22, fontSize: '0.75rem' }} /></TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600, color: p.revenue > 0 ? '#2e7d32' : '#999' }}>Rs. {parseFloat(p.revenue).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Total</TableCell>
                    <TableCell align="center"><Chip label={revenueByPlan.reduce((s, p) => s + (p.subscribers || 0), 0)} size="small" color="primary" sx={{ height: 22, fontSize: '0.75rem' }} /></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1565c0' }}>Rs. {revenueByPlan.reduce((s, p) => s + parseFloat(p.revenue || 0), 0).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Average Subscription Duration</Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }}>Company Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }} align="center">Avg Duration (days)</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', fontSize: '0.75rem' }} align="center">Avg Trial (days)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.avgDuration || []).map((d, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{d.type_name || '-'}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}><Chip label={d.avg_duration || 0} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} /></TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}><Chip label={d.avg_trial || 0} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

// ─── Tab 1: MRR & Revenue ─────────────────────────────────────

function RevenueTab({ data }) {
  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const { mrr, trend, churn } = data;

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <BigStatCard icon={<CurrencyRupeeIcon />} title="Monthly Recurring Revenue" value={`Rs. ${formatCurrency(mrr.mrr)}`} subtitle="Normalized to 30-day" color="#2196f3" />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <BigStatCard icon={<TrendingUpIcon />} title="Annual Recurring Revenue" value={`Rs. ${formatCurrency(mrr.arr)}`} subtitle="MRR x 12" color="#4caf50" />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <BigStatCard icon={<GroupsIcon />} title="Active Subscriptions" value={mrr.active_subscriptions} subtitle="Non-expired" color="#9c27b0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <BigStatCard icon={<TrendingDownIcon />} title="Churn Rate" value={`${churn.churn_rate}%`} subtitle={`${churn.churned_this_month} churned this month`} color="#f44336" />
        </Grid>
      </Grid>

      {/* MRR by Type */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>MRR by Company Type</Typography>
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={(mrr.by_type || []).filter(r => parseFloat(r.mrr) > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={100} dataKey="mrr" nameKey="type_name" label={({ type_name, mrr: v }) => `${type_name}: Rs.${formatCurrency(v)}`} labelLine fontSize={11}>
                  {(mrr.by_type || []).filter(r => parseFloat(r.mrr) > 0).map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => `Rs. ${parseFloat(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>MRR Trend (Snapshots)</Typography>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="snapshot_month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${formatCurrency(v)}`} />
                  <Tooltip formatter={(v) => `Rs. ${parseFloat(v).toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="mrr_estimate" name="MRR" stroke="#2196f3" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 290 }}>
                <Typography variant="body2" color="text.secondary">Snapshot data will accumulate over time. Check back after a few days.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* MRR by Type Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>MRR Breakdown by Type</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Company Type</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">MRR</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">ARR</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Subscribers</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Avg MRR/Sub</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(mrr.by_type || []).map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>{r.type_name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#1565c0' }}>Rs. {parseFloat(r.mrr).toLocaleString()}</TableCell>
                  <TableCell align="right">Rs. {(parseFloat(r.mrr) * 12).toLocaleString()}</TableCell>
                  <TableCell align="center"><Chip label={r.sub_count} size="small" sx={{ height: 22 }} /></TableCell>
                  <TableCell align="right">Rs. {r.sub_count > 0 ? Math.round(parseFloat(r.mrr) / r.sub_count).toLocaleString() : '0'}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1565c0' }}>Rs. {mrr.mrr.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Rs. {mrr.arr.toLocaleString()}</TableCell>
                <TableCell align="center"><Chip label={mrr.active_subscriptions} size="small" color="primary" sx={{ height: 22 }} /></TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Rs. {mrr.active_subscriptions > 0 ? Math.round(mrr.mrr / mrr.active_subscriptions).toLocaleString() : '0'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

// ─── Tab 2: Cohort Retention ──────────────────────────────────

const HEAT_COLORS = [
  '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', // 0-30%
  '#fff3e0', '#ffe0b2', '#ffcc80',             // 30-50%
  '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', // 50-100%
];

function heatColor(rate) {
  if (rate === null || rate === undefined) return '#fafafa';
  if (rate >= 90) return '#2e7d32';
  if (rate >= 75) return '#43a047';
  if (rate >= 60) return '#66bb6a';
  if (rate >= 50) return '#a5d6a7';
  if (rate >= 40) return '#ffcc80';
  if (rate >= 30) return '#ffb74d';
  if (rate >= 20) return '#ef9a9a';
  if (rate >= 10) return '#e57373';
  return '#ef5350';
}

function heatTextColor(rate) {
  if (rate === null || rate === undefined) return '#ccc';
  return rate >= 50 ? '#fff' : '#333';
}

function CohortTab({ data }) {
  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const { signupMonths, matrix } = data;
  if (signupMonths.length === 0) {
    return <Typography sx={{ py: 4, textAlign: 'center' }} color="text.secondary">No cohort data yet. Cohorts are built weekly.</Typography>;
  }

  // Find max months_since_signup
  const maxMonths = Math.max(...Object.values(matrix).flatMap(m => Object.keys(m).filter(k => k !== 'cohort_size').map(Number)));
  const monthCols = Array.from({ length: maxMonths + 1 }, (_, i) => i);

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Cohort Retention Heatmap</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each row is a signup month. Cells show the % of that cohort still active N months later.
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', position: 'sticky', left: 0, zIndex: 2, minWidth: 100 }}>Cohort</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 50 }} align="center">Size</TableCell>
              {monthCols.map(m => (
                <TableCell key={m} sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 55 }} align="center">M+{m}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {signupMonths.map(sm => {
              const row = matrix[sm] || {};
              return (
                <TableRow key={sm}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', position: 'sticky', left: 0, bgcolor: '#fff', zIndex: 1 }}>{sm}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{row.cohort_size || 0}</TableCell>
                  {monthCols.map(m => {
                    const rate = row[m];
                    return (
                      <MuiTooltip key={m} title={rate !== undefined ? `${rate}% retained` : 'No data'} arrow>
                        <TableCell align="center" sx={{
                          bgcolor: heatColor(rate),
                          color: heatTextColor(rate),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          cursor: 'default',
                          transition: 'all 0.2s',
                        }}>
                          {rate !== undefined ? `${rate}%` : '-'}
                        </TableCell>
                      </MuiTooltip>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// ─── Tab 3: LTV & Plan Performance ───────────────────────────

function LTVTab({ data }) {
  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const { ltv, plans } = data;

  return (
    <>
      {/* LTV by Company Type */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Estimated LTV by Company Type</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Company Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Companies</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Avg Lifespan</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Avg Monthly Rev</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Est. LTV</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ltv.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{r.type_name}</TableCell>
                    <TableCell align="center"><Chip label={r.total_companies} size="small" sx={{ height: 22 }} /></TableCell>
                    <TableCell align="right">{r.avg_lifespan_months} months</TableCell>
                    <TableCell align="right">Rs. {parseFloat(r.avg_monthly_revenue || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#1565c0' }}>Rs. {parseFloat(r.estimated_ltv || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>LTV by Type</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ltv.filter(r => parseFloat(r.estimated_ltv) > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type_name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${formatCurrency(v)}`} />
                <Tooltip formatter={(v) => `Rs. ${parseFloat(v).toLocaleString()}`} />
                <Bar dataKey="estimated_ltv" name="Est. LTV" fill="#2196f3" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Plan Performance */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Plan Performance</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Plan</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Active Subs</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Total Revenue</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="right">Monthly Rev</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Renewals</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((p, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontWeight: 500 }}>{p.plan_name}</TableCell>
                <TableCell>{p.type_name || '-'}</TableCell>
                <TableCell align="right">Rs. {parseFloat(p.Price || 0).toLocaleString()}</TableCell>
                <TableCell align="right">{p.duration_days} days</TableCell>
                <TableCell align="center"><Chip label={p.active_subscribers} size="small" color="primary" sx={{ height: 22 }} /></TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#2e7d32' }}>Rs. {parseFloat(p.total_revenue).toLocaleString()}</TableCell>
                <TableCell align="right">Rs. {parseFloat(p.monthly_revenue || 0).toLocaleString()}</TableCell>
                <TableCell align="center"><Chip label={p.total_renewals} size="small" variant="outlined" sx={{ height: 22 }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
