import React, { useEffect, useState } from 'react';
import {
  Box, Chip, Grid, Typography, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import TodayIcon from '@mui/icons-material/Today';
import BugReportIcon from '@mui/icons-material/BugReport';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import WebIcon from '@mui/icons-material/Web';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import errorDashboardService from '../../../services/errorDashboard_services';

const COLORS = ['#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4', '#4caf50', '#ff5722', '#607d8b', '#3f51b5'];

function StatCard({ icon, title, value, color, subtitle }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2, display: 'flex', alignItems: 'center', gap: 2,
        borderLeft: `4px solid ${color}`, height: '100%',
      }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: 2, bgcolor: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} color={color}>{value ?? '-'}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Paper>
  );
}

function formatDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB') + ' ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function DeveloperDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await errorDashboardService.getDevDashboard();
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Developer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography sx={{ p: 3 }}>Failed to load dashboard data.</Typography>;
  }

  const { stats, trend, byCategory, byCompany, recent } = data;

  const todayDelta = (stats.today_errors || 0) - (stats.yesterday_errors || 0);
  const deltaText = todayDelta > 0 ? `+${todayDelta} vs yesterday` : todayDelta < 0 ? `${todayDelta} vs yesterday` : 'Same as yesterday';

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', overflow: 'auto' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Developer Dashboard</Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<ErrorIcon />} title="Total Errors" value={stats.total_errors?.toLocaleString()} color="#2196f3" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<TodayIcon />} title="Today" value={stats.today_errors} color="#f44336" subtitle={deltaText} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<BugReportIcon />} title="Uncaught Exceptions" value={stats.uncaught_exceptions} color="#ff9800" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<ReportProblemIcon />} title="Unhandled Rejections" value={stats.unhandled_rejections} color="#9c27b0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<WebIcon />} title="Frontend Errors" value={stats.frontend_errors} color="#00bcd4" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<SpeedIcon />} title="Slow APIs" value={stats.slow_apis} color="#ff5722" />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Error Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Error Trend (Last 30 Days)</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString('en-GB')} />
                <Line type="monotone" dataKey="count" stroke="#2196f3" strokeWidth={2} dot={{ r: 3 }} name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Errors by Category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Errors by Category</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={byCategory || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={90}
                  label={({ name, value }) => `${(name || '').substring(0, 15)}: ${value}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {(byCategory || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Top Companies */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Top Companies by Errors</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={byCompany || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="company_name"
                  tick={{ fontSize: 11 }}
                  width={100}
                  tickFormatter={(v) => v ? (v.length > 14 ? v.substring(0, 14) + '...' : v) : `ID:${''}`}
                />
                <Tooltip />
                <Bar dataKey="error_count" fill="#2196f3" name="Errors" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Errors */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Errors</Typography>
            <TableContainer sx={{ maxHeight: 350 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(recent || []).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{row.id}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.company_name || `ID:${row.company_id}`}
                      </TableCell>
                      <TableCell sx={{ py: 0.6 }}>
                        <Chip
                          label={row.meta}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.message}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6, whiteSpace: 'nowrap' }}>{formatDate(row.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                  {(!recent || recent.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No recent errors</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
