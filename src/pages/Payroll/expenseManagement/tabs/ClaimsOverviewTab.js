import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, Avatar, Tooltip,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const formatINR = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

const statusConfig = {
  Pending: { color: '#ed6c02', bg: '#fff3e0', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
  Approved: { color: '#2e7d32', bg: '#e8f5e9', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  Rejected: { color: '#d32f2f', bg: '#ffebee', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
  Cancelled: { color: '#757575', bg: '#f5f5f5', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
};

export default function ClaimsOverviewTab() {
  const { ExpenseManagementReducer: { claims } } = useSelector((s) => s);
  const claimList = claims || [];

  const summary = claimList.reduce((acc, c) => {
    acc.total += 1;
    acc.amount += Number(c.claim_amount) || 0;
    if (c.status === 'Pending') acc.pending += 1;
    if (c.status === 'Approved') acc.approved += 1;
    if (c.violation_flag) acc.violations += 1;
    return acc;
  }, { total: 0, amount: 0, pending: 0, approved: 0, violations: 0 });

  const summaryCards = [
    { label: 'Total Claims', value: summary.total, color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Total Amount', value: formatINR(summary.amount), color: '#7b1fa2', bg: '#f3e5f5' },
    { label: 'Pending', value: summary.pending, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'Approved', value: summary.approved, color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Violations', value: summary.violations, color: '#d32f2f', bg: '#ffebee' },
  ];

  return (
      <Box sx={{maxHeight:'calc(100vh - 80px)',overflowY:'auto'}}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Claims with Policy Info</Typography>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: 2, textAlign: 'center',
              border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${card.color}`,
            }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {claimList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No claims data available.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {claimList.map((claim) => {
            const sc = statusConfig[claim.status] || statusConfig.Pending;
            return (
              <Grid key={claim.claim_id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: claim.violation_flag ? '4px solid #d32f2f' : '4px solid transparent',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                          {claim.claim_number || `CLM-${claim.claim_id}`}
                        </Typography>
                        <Chip size='small' icon={sc.icon}
                          label={claim.status}
                          sx={{ fontSize: 9, height: 20, bgcolor: sc.bg, color: sc.color, fontWeight: 600,
                            '& .MuiChip-icon': { color: sc.color },
                          }} />
                      </Box>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }} noWrap>
                        {claim.employee_name || 'Employee'} {claim.category_name ? `- ${claim.category_name}` : ''}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1565c0' }}>
                      {formatINR(claim.claim_amount)}
                    </Typography>
                  </Box>

                  {claim.policy_name && (
                    <Chip size='small' label={`Policy: ${claim.policy_name}`}
                      sx={{ fontSize: 9, height: 18, bgcolor: '#e8eaf6', color: '#283593', mb: 0.5 }} />
                  )}

                  {claim.violation_flag ? (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 0.5,
                      p: 0.8, borderRadius: 1, bgcolor: '#ffebee',
                    }}>
                      <WarningAmberIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                      <Typography sx={{ fontSize: 10, color: '#d32f2f', fontWeight: 500 }}>
                        {claim.violation_reason || 'Policy violation detected'}
                      </Typography>
                    </Box>
                  ) : null}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                      Bill: {claim.bill_no || '-'} | {claim.expense_date ? claim.expense_date.substring(0, 10) : claim.createdAt?.substring(0, 10) || '-'}
                    </Typography>
                    {claim.max_amount && (
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                        Limit: {formatINR(claim.max_amount)}
                      </Typography>
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
