import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, Avatar,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';

const formatINR = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

export default function ViolationsTab() {
  const { ExpenseManagementReducer: { violationClaims } } = useSelector((s) => s);
  const violations = violationClaims || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WarningAmberIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Policy Violations ({violations.length})
        </Typography>
      </Box>

      {violations.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No policy violations found. All claims are within policy limits.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {violations.map((v) => (
            <Grid key={v.claim_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#ffcdd2',
                borderLeft: '4px solid #d32f2f', bgcolor: '#fffbfb',
              }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#ffebee', color: '#d32f2f' }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                      {v.claim_number || `CLM-${v.claim_id}`}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                      {v.employee_name || 'Employee'} {v.category_name ? `| ${v.category_name}` : ''}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#d32f2f' }}>
                    {formatINR(v.claim_amount)}
                  </Typography>
                </Box>

                <Box sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: '#ffebee' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 0.3 }}>
                    <WarningAmberIcon sx={{ fontSize: 13, color: '#c62828' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#c62828' }}>Violation Reason</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#b71c1c' }}>
                    {v.violation_reason || 'Exceeded policy limit'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5 }}>
                  {v.policy_name && (
                    <Chip size='small' label={`Policy: ${v.policy_name}`}
                      sx={{ fontSize: 9, height: 18, bgcolor: '#e8eaf6', color: '#283593' }} />
                  )}
                  {v.max_amount && (
                    <Chip size='small' label={`Limit: ${formatINR(v.max_amount)}`}
                      sx={{ fontSize: 9, height: 18, bgcolor: '#fff3e0', color: '#e65100' }} />
                  )}
                  <Chip size='small' label={v.status || 'Pending'}
                    sx={{ fontSize: 9, height: 18, fontWeight: 600 }} />
                </Box>

                <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                  {v.expense_date ? v.expense_date.substring(0, 10) : v.createdAt?.substring(0, 10) || '-'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
