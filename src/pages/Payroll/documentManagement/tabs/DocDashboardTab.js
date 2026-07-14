import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Avatar, Chip, LinearProgress, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function DocDashboardTab() {
  const { DocumentManagementReducer: { dashboard, pendingVerifications, expiringDocuments } } = useSelector((s) => s);
  const data = dashboard || [];

  const totals = data.reduce((acc, emp) => ({
    total: acc.total + (emp.total_documents || 0),
    pending: acc.pending + (emp.pending_count || 0),
    verified: acc.verified + (emp.verified_count || 0),
    rejected: acc.rejected + (emp.rejected_count || 0),
    expired: acc.expired + (emp.expired_count || 0),
    expiringSoon: acc.expiringSoon + (emp.expiring_soon_count || 0),
  }), { total: 0, pending: 0, verified: 0, rejected: 0, expired: 0, expiringSoon: 0 });

  const summaryCards = [
    { label: 'Total Documents', value: totals.total, color: '#1976d2', bg: '#e3f2fd', icon: <CheckCircleIcon /> },
    { label: 'Pending Verification', value: totals.pending, color: '#ed6c02', bg: '#fff3e0', icon: <PendingIcon /> },
    { label: 'Verified', value: totals.verified, color: '#2e7d32', bg: '#e8f5e9', icon: <CheckCircleIcon /> },
    { label: 'Rejected', value: totals.rejected, color: '#d32f2f', bg: '#ffebee', icon: <CancelIcon /> },
    { label: 'Expired', value: totals.expired, color: '#c62828', bg: '#ffcdd2', icon: <WarningAmberIcon /> },
    { label: 'Expiring Soon', value: totals.expiringSoon, color: '#f57c00', bg: '#ffe0b2', icon: <WarningAmberIcon /> },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Document Dashboard</Typography>

      {/* Summary Cards */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                textAlign: 'center', borderTop: `3px solid ${card.color}`,
              }}
            >
              {React.cloneElement(card.icon, { sx: { fontSize: 24, color: card.color, mb: 0.5 } })}
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Per-Employee Breakdown */}
      <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>Employee Document Summary</Typography>
      {data.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No document data available.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {data.map((emp) => {
            const total = emp.total_documents || 1;
            const verifiedPct = ((emp.verified_count || 0) / total) * 100;
            return (
              <Grid key={emp.employee_id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <Avatar src={emp.image || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                      {(emp.employee_name || '?')[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                        {emp.employee_name} ({emp.employee_code})
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                        {emp.designation}{emp.department_name ? ` - ${emp.department_name}` : ''}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Verification Progress</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{Math.round(verifiedPct)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate' value={verifiedPct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: verifiedPct === 100 ? '#2e7d32' : verifiedPct > 50 ? '#1976d2' : '#ed6c02',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    <Chip size='small' label={`${emp.total_documents} total`} sx={{ fontSize: 9, height: 20 }} />
                    {emp.pending_count > 0 && (
                      <Chip size='small' label={`${emp.pending_count} pending`}
                        sx={{ fontSize: 9, height: 20, bgcolor: '#fff3e0', color: '#ed6c02' }} />
                    )}
                    {emp.verified_count > 0 && (
                      <Chip size='small' label={`${emp.verified_count} verified`}
                        sx={{ fontSize: 9, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                    )}
                    {emp.expired_count > 0 && (
                      <Chip size='small' label={`${emp.expired_count} expired`}
                        sx={{ fontSize: 9, height: 20, bgcolor: '#ffebee', color: '#d32f2f' }} />
                    )}
                    {emp.expiring_soon_count > 0 && (
                      <Chip size='small' label={`${emp.expiring_soon_count} expiring`}
                        sx={{ fontSize: 9, height: 20, bgcolor: '#ffe0b2', color: '#f57c00' }} />
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
