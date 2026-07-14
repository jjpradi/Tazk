import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Grid, Typography, Chip, Paper, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Popper, ClickAwayListener, List, ListItem, ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AlarmIcon from '@mui/icons-material/Alarm';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LinearProgress from '@mui/material/LinearProgress';
import superAdminService from '../../../services/superAdmin_services';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b', '#3f51b5', '#795548'];

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
        <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Paper>
  );
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [onboardingSummary, setOnboardingSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);
  const searchAnchorRef = React.useRef(null);

  useEffect(() => {
    loadDashboard();
    loadAuditLogs();
    loadTodayFollowUps();
    loadOnboardingSummary();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await superAdminService.getDashboardData();
      if (res.status === 200) setData(res.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await superAdminService.getAuditLogs();
      if (res.status === 200) setAuditLogs(res.data?.slice(0, 10) || []);
    } catch (err) { /* audit logs are optional */ }
  };

  const loadTodayFollowUps = async () => {
    try {
      const res = await superAdminService.getTodayFollowUps();
      if (res.status === 200) setTodayFollowUps(res.data || []);
    } catch (err) { /* follow-ups are optional */ }
  };

  const loadOnboardingSummary = async () => {
    try {
      const res = await superAdminService.getOnboardingOverview();
      if (res.status === 200) setOnboardingSummary(res.data?.summary || null);
    } catch (err) { /* optional */ }
  };

  const handleCompleteFollowUp = async (id) => {
    try {
      await superAdminService.updateFollowUp(id, { action: 'complete' });
      loadTodayFollowUps();
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimer) clearTimeout(searchTimer);
    if (val.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return; }
    setSearchTimer(setTimeout(async () => {
      try {
        const res = await superAdminService.globalSearch(val);
        if (res.status === 200) {
          setSearchResults(res.data || []);
          setSearchOpen(true);
        }
      } catch (err) { console.error(err); }
    }, 400));
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

  const { stats, distribution, registrationTrend, expiryTimeline, recentCompanies, expiringCompanies, planPopularity } = data;

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', overflow: 'auto' }}>
      {/* Global Search */}
      <Box sx={{ mb: 2, position: 'relative' }}>
        <TextField
          ref={searchAnchorRef}
          size="small"
          fullWidth
          placeholder="Search companies by name, phone, email, or ID..."
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
          sx={{ maxWidth: 500 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            },
          }}
        />
        <Popper open={searchOpen} anchorEl={searchAnchorRef.current} placement="bottom-start" sx={{ zIndex: 1300, width: 500 }}>
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Paper elevation={8} sx={{ maxHeight: 350, overflow: 'auto', mt: 0.5 }}>
              {searchResults.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No results found</Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {searchResults.map((r) => (
                    <ListItem
                      key={r.company_id}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(`/superadmin/companies/${r.company_id}`); }}
                      sx={{ borderBottom: '1px solid #f0f0f0', '&:hover': { bgcolor: '#f5f8ff' }, cursor: 'pointer' }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{r.company_name || `#${r.company_id}`}</Typography>
                            <Chip label={r.company_type_name || ''} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                            <Chip
                              label={r.sIsExpired ? 'Expired' : 'Active'}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 18, bgcolor: r.sIsExpired ? '#ffebee' : '#e8f5e9', color: r.sIsExpired ? '#c62828' : '#2e7d32' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            ID: {r.company_id}
                            {r.phone ? ` | ${r.phone}` : ''}
                            {r.email ? ` | ${r.email}` : ''}
                            {r.plan_name ? ` | ${r.plan_name}` : ''}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<BusinessIcon />} title="Total Companies" value={stats.total_companies} color="#2196f3" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<CheckCircleIcon />} title="Active Subscriptions" value={stats.active_subscriptions} color="#4caf50" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<WarningIcon />} title="Expiring (30 days)" value={stats.expiring_soon} color="#ff9800" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<ErrorIcon />} title="Expired" value={stats.expired} color="#f44336" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<PeopleIcon />} title="Total Employees" value={stats.total_employees} color="#9c27b0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatCard icon={<HourglassEmptyIcon />} title="Pending Approvals" value={stats.pending_approvals} color="#607d8b" />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Company Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Company Distribution</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Registration Trend */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>New Registrations (12 months)</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2196f3" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expiry Timeline */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Expiring Subscriptions (6 months)</Typography>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={expiryTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tables Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Recent Companies */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Registrations</Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCompanies.map((c) => (
                    <TableRow
                      key={c.company_id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/superadmin/companies/${c.company_id}`)}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{c.company_name || `#${c.company_id}`}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{c.company_type_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{formatDate(c.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Expiring Soon */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Expiring in 7 Days
              {expiringCompanies.length > 0 && (
                <Chip label={expiringCompanies.length} size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
              )}
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }} align="center">Days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No companies expiring soon</Typography>
                      </TableCell>
                    </TableRow>
                  ) : expiringCompanies.map((c) => (
                    <TableRow
                      key={c.company_id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/superadmin/companies/${c.company_id}`)}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{c.company_name || `#${c.company_id}`}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{c.company_type_name || '-'}</TableCell>
                      <TableCell align="center" sx={{ py: 0.6 }}>
                        <Chip
                          label={Math.max(0, c.sRemainingDays)}
                          size="small"
                          sx={{
                            bgcolor: c.sRemainingDays <= 1 ? '#ffebee' : '#fff3e0',
                            color: c.sRemainingDays <= 1 ? '#c62828' : '#e65100',
                            fontSize: '0.75rem', height: 22, fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Plan Popularity */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Plan Popularity</Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }} align="center">Subscribers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planPopularity.map((p) => (
                    <TableRow key={p.plan_id} hover>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{p.plan_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{p.company_type_name || '-'}</TableCell>
                      <TableCell align="center" sx={{ py: 0.6 }}>
                        <Chip label={p.subscriber_count} size="small" color="primary" sx={{ height: 22, fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Today's Follow-ups */}
      {todayFollowUps.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <AlarmIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: '#ff9800' }} />
            Today's Follow-ups
            <Chip label={todayFollowUps.length} size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
          </Typography>
          <TableContainer sx={{ maxHeight: 250 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayFollowUps.map((fu) => (
                  <TableRow
                    key={fu.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/superadmin/companies/${fu.company_id}`)}
                  >
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{fu.title}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>#{fu.company_id}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{fu.reminder_time?.substring(0, 5)}</TableCell>
                    <TableCell align="center" sx={{ py: 0.6 }}>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => { e.stopPropagation(); handleCompleteFollowUp(fu.id); }}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Onboarding Summary */}
      {onboardingSummary && onboardingSummary.total_onboarding > 0 && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, cursor: 'pointer' }}
          onClick={() => navigate('/superadmin/onboarding')}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            <RocketLaunchIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: '#2196f3' }} />
            Onboarding
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#2196f3">{onboardingSummary.total_onboarding}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#ff9800">{onboardingSummary.in_progress || 0}</Typography>
              <Typography variant="caption" color="text.secondary">In Progress</Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#4caf50">{onboardingSummary.completed || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#9c27b0">{onboardingSummary.avg_score || 0}%</Typography>
              <Typography variant="caption" color="text.secondary">Avg Score</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={onboardingSummary.total_onboarding > 0 ? ((onboardingSummary.completed || 0) / onboardingSummary.total_onboarding) * 100 : 0}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#4caf50', borderRadius: 3 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {onboardingSummary.not_started || 0} not started | {onboardingSummary.in_progress || 0} in progress | {onboardingSummary.completed || 0} completed
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Recent Admin Actions */}
      {auditLogs.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Recent Admin Actions</Typography>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>By</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', py: 0.8 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{ cursor: log.target_company_id ? 'pointer' : 'default' }}
                    onClick={() => log.target_company_id && navigate(`/superadmin/companies/${log.target_company_id}`)}
                  >
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>
                      <Chip
                        label={log.action_type?.replace(/_/g, ' ')}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>
                      {log.target_company_id ? `#${log.target_company_id}` : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{log.admin_name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 0.6 }}>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
