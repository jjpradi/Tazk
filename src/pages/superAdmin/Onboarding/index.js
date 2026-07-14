import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Chip, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Tabs, Tab, Tooltip
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import superAdminService from '../../../services/superAdmin_services';

const STATUS_COLORS = {
  not_started: { bg: '#ffebee', color: '#c62828', label: 'Not Started' },
  in_progress: { bg: '#fff3e0', color: '#e65100', label: 'In Progress' },
  completed: { bg: '#e8f5e9', color: '#2e7d32', label: 'Completed' },
};

function ScoreBar({ score }) {
  const color = score >= 80 ? '#4caf50' : score >= 50 ? '#ff9800' : score >= 25 ? '#ffc107' : '#f44336';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, minWidth: 60 }}>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
        />
      </Box>
      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 36, color }}>{score}%</Typography>
    </Box>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${color}` }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </Paper>
  );
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [page, statusFilter]);

  const loadOverview = async () => {
    try {
      const res = await superAdminService.getOnboardingOverview();
      if (res.status === 200) setOverview(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getOnboardingCompanies(page, 30, statusFilter);
      if (res.status === 200) {
        setCompanies(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await superAdminService.triggerOnboardingScan();
      loadOverview();
      loadCompanies();
    } catch (err) { console.error(err); }
    finally { setScanning(false); }
  };

  const summary = overview?.summary || {};
  const stuck = overview?.stuck || [];

  return (
    <Box sx={{ p: 2.5, height: '89vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography variant="h6" fontWeight={600}>
          <RocketLaunchIcon sx={{ mr: 1, verticalAlign: 'text-bottom', color: '#2196f3' }} />
          Onboarding Tracker
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleScan}
          disabled={scanning}
          sx={{ textTransform: 'none' }}
        >
          {scanning ? 'Scanning...' : 'Rescan All'}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<RocketLaunchIcon />} title="Total Onboarding" value={summary.total_onboarding || 0} color="#2196f3" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<HourglassEmptyIcon />} title="In Progress" value={summary.in_progress || 0} color="#ff9800" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<CheckCircleIcon />} title="Completed" value={summary.completed || 0} color="#4caf50" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<WarningAmberIcon />} title="Avg Score" value={`${summary.avg_score || 0}%`} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Stuck companies alert */}
      {stuck.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderLeft: '4px solid #f44336', bgcolor: '#fff8f7' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#c62828' }}>
            <WarningAmberIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Stuck Companies ({stuck.length}) — No progress in 7+ days
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {stuck.map(s => (
              <Chip
                key={s.company_id}
                label={`#${s.company_id} (${s.onboarding_score}%)`}
                size="small"
                onClick={() => navigate(`/superadmin/companies/${s.company_id}`)}
                sx={{ cursor: 'pointer', bgcolor: '#ffebee', color: '#c62828' }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Status Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={statusFilter} onChange={(e, v) => { setStatusFilter(v); setPage(0); }} sx={{ minHeight: 40 }}>
          <Tab value="all" label="All" sx={{ textTransform: 'none', minHeight: 40 }} />
          <Tab value="not_started" label="Not Started" sx={{ textTransform: 'none', minHeight: 40 }} />
          <Tab value="in_progress" label="In Progress" sx={{ textTransform: 'none', minHeight: 40 }} />
          <Tab value="completed" label="Completed" sx={{ textTransform: 'none', minHeight: 40 }} />
        </Tabs>
      </Box>

      {/* Company Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Signup</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }} align="center">Days</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 150 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Milestones</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No companies found</Typography>
                  </TableCell>
                </TableRow>
              ) : companies.map(c => {
                const st = STATUS_COLORS[c.onboarding_status] || STATUS_COLORS.not_started;
                return (
                  <TableRow
                    key={c.company_id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/superadmin/companies/${c.company_id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {c.company_name || `#${c.company_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{c.company_type_name || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{formatDate(c.signup_date)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={c.days_since_signup}
                        size="small"
                        sx={{ fontSize: '0.75rem', height: 22, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <ScoreBar score={c.onboarding_score} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {c.achieved_milestones}/{c.total_milestones}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={st.label}
                        size="small"
                        sx={{ bgcolor: st.bg, color: st.color, fontSize: '0.7rem', height: 22, fontWeight: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {companies.length > 0 && companies.length < total && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button size="small" variant="outlined" onClick={() => setPage(p => p + 1)}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
}
