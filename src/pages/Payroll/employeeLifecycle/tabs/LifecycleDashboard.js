import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid } from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TimerIcon from '@mui/icons-material/Timer';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
      display: 'flex', alignItems: 'center', gap: 2,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    }}
  >
    <Box
      sx={{
        width: 48, height: 48, borderRadius: 2, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: bgColor || 'primary.50',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24, color: color || 'primary.main' } })}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: color || 'text.primary' }}>
        {value ?? '-'}
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

export default function LifecycleDashboard() {
  const { EmployeeLifecycleReducer: { dashboardStats } } = useSelector((s) => s);
  const stats = dashboardStats || {};

  const cards = [
    {
      icon: <PlaylistAddCheckIcon />, label: 'Pending Onboardings',
      value: stats.pending_onboardings, color: '#1976d2', bgColor: '#e3f2fd',
    },
    {
      icon: <TimerIcon />, label: 'Probation Due Soon',
      value: stats.probation_due_soon, color: '#ed6c02', bgColor: '#fff3e0',
    },
    {
      icon: <ExitToAppIcon />, label: 'Active Separations',
      value: stats.active_separations, color: '#d32f2f', bgColor: '#ffebee',
    },
    {
      icon: <AccountBalanceWalletIcon />, label: 'Pending FnF',
      value: stats.pending_fnf, color: '#9c27b0', bgColor: '#f3e5f5',
    },
    {
      icon: <CheckCircleIcon />, label: 'Confirmations This Month',
      value: stats.confirmations_this_month, color: '#2e7d32', bgColor: '#e8f5e9',
    },
    {
      icon: <SwapHorizIcon />, label: 'Movements This Month',
      value: stats.movements_this_month, color: '#0288d1', bgColor: '#e1f5fe',
    },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
        Lifecycle Overview
      </Typography>
      <Grid container spacing={2}>
        {cards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          Use the tabs above to manage onboarding checklists, track probations,
          record lifecycle events (promotions, transfers, increments),
          and process separations with Full & Final settlements.
        </Typography>
      </Box>
    </Box>
  );
}
