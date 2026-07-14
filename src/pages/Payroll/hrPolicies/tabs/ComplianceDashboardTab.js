import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, LinearProgress, Avatar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import GroupIcon from '@mui/icons-material/Group';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getUnacknowledgedEmployeesAction } from 'redux/actions/hrPolicies.actions';

const urgencyConfig = {
  overdue: { color: '#d32f2f', bg: '#ffebee', icon: <ErrorIcon />, label: 'Overdue' },
  due_soon: { color: '#ed6c02', bg: '#fff3e0', icon: <WarningAmberIcon />, label: 'Due Soon' },
  on_track: { color: '#2e7d32', bg: '#e8f5e9', icon: <CheckCircleIcon />, label: 'On Track' },
};

export default function ComplianceDashboardTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { HrPoliciesReducer: { compliance, unacknowledged } } = useSelector((s) => s);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const data = compliance || [];

  const totals = data.reduce((acc, p) => ({
    total: acc.total + 1,
    overdue: acc.overdue + (p.urgency === 'overdue' ? 1 : 0),
    dueSoon: acc.dueSoon + (p.urgency === 'due_soon' ? 1 : 0),
    onTrack: acc.onTrack + (p.urgency === 'on_track' ? 1 : 0),
  }), { total: 0, overdue: 0, dueSoon: 0, onTrack: 0 });

  const summaryCards = [
    { label: 'Total Policies', value: totals.total, color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Overdue', value: totals.overdue, color: '#d32f2f', bg: '#ffebee' },
    { label: 'Due Soon', value: totals.dueSoon, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'On Track', value: totals.onTrack, color: '#2e7d32', bg: '#e8f5e9' },
  ];

  const viewUnacknowledged = (policy) => {
    setSelectedPolicy(policy);
    dispatch(getUnacknowledgedEmployeesAction(policy.id, setModalTypeHandler, setLoaderStatusHandler));
  };

  const unackList = unacknowledged || [];

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Compliance Dashboard</Typography>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: 2, textAlign: 'center',
              border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${card.color}`,
            }}>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {data.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No active policies requiring acknowledgment.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {data.map((p) => {
            const uc = urgencyConfig[p.urgency] || urgencyConfig.on_track;
            const totalEmp = (p.acknowledged_count || 0) + (p.pending_count || 0);
            const ackPct = totalEmp > 0 ? ((p.acknowledged_count || 0) / totalEmp) * 100 : 0;

            return (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${uc.color}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.policy_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                        <Chip size='small' icon={React.cloneElement(uc.icon, { sx: { fontSize: 12 } })}
                          label={uc.label}
                          sx={{ fontSize: 9, height: 18, bgcolor: uc.bg, color: uc.color, fontWeight: 600,
                            '& .MuiChip-icon': { color: uc.color },
                          }} />
                        <Chip size='small' label={p.policy_category?.replace(/_/g, ' ')}
                          sx={{ fontSize: 9, height: 18, textTransform: 'capitalize' }} />
                      </Box>
                    </Box>
                    <Tooltip title='View unacknowledged employees'>
                      <IconButton size='small' onClick={() => viewUnacknowledged(p)}>
                        <GroupIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        Acknowledgment Progress
                      </Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{Math.round(ackPct)}%</Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate' value={ackPct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: ackPct === 100 ? '#2e7d32' : ackPct > 60 ? '#1976d2' : uc.color,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                    <Chip size='small' label={`${p.acknowledged_count || 0} acknowledged`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                    <Chip size='small' label={`${p.pending_count || 0} pending`}
                      sx={{ fontSize: 9, height: 20, bgcolor: '#fff3e0', color: '#ed6c02' }} />
                  </Box>

                  {p.acknowledgment_deadline && (
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                      Deadline: {p.acknowledgment_deadline.substring(0, 10)}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Unacknowledged Employees Dialog */}
      <Dialog open={!!selectedPolicy} onClose={() => setSelectedPolicy(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          Unacknowledged Employees — {selectedPolicy?.policy_name}
        </DialogTitle>
        <DialogContent>
          {unackList.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                All employees have acknowledged this policy.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {unackList.map((emp) => (
                <Paper key={emp.employee_id} elevation={0} sx={{
                  p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
                  display: 'flex', gap: 1.5, alignItems: 'center',
                }}>
                  <Avatar src={emp.image || undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 13 }}>
                    {(emp.employee_name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{emp.employee_name}</Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                      {emp.employee_code} {emp.designation ? `| ${emp.designation}` : ''} {emp.department_name ? `| ${emp.department_name}` : ''}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPolicy(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
