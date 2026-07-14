import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, LinearProgress, MenuItem, TextField,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getRatingDistributionAction } from 'redux/actions/performance.actions';

const ratingColors = {
  Outstanding: '#2e7d32',
  'Exceeds Expectations': '#1976d2',
  'Meets Expectations': '#ed6c02',
  'Below Expectations': '#f44336',
  'Needs Improvement': '#c62828',
};

export default function PerfDashboardTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { dashboard, ratingDistribution } } = useSelector((s) => s);

  const [selectedCycleId, setSelectedCycleId] = useState('');
  const data = dashboard || [];
  const distribution = ratingDistribution || [];

  const handleSelectCycle = (id) => {
    setSelectedCycleId(id);
    if (id) dispatch(getRatingDistributionAction(id, setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AssessmentIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Performance Dashboard</Typography>
      </Box>

      {data.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No appraisal cycle data available.</Typography>
        </Paper>
      ) : (
        <>
          {/* Cycle-wise Summary */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {data.map((c) => {
              const total = c.total_appraisals || 1;
              const completedPct = ((c.completed || 0) / total) * 100;
              return (
                <Grid key={c.cycle_id} size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.cycle_name}</Typography>
                        <Chip size='small' label={c.cycle_status?.replace(/_/g, ' ')}
                          sx={{ fontSize: 9, height: 18, textTransform: 'capitalize', mt: 0.3 }} />
                      </Box>
                      {c.avg_rating && (
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#e65100' }}>{c.avg_rating}</Typography>
                          <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>Avg Rating</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Progress bar */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Completion</Typography>
                        <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{Math.round(completedPct)}%</Typography>
                      </Box>
                      <LinearProgress variant='determinate' value={completedPct}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: completedPct === 100 ? '#2e7d32' : completedPct > 50 ? '#1976d2' : '#ed6c02',
                          },
                        }} />
                    </Box>

                    {/* Status breakdown */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      <Chip size='small' label={`${c.total_appraisals} total`} sx={{ fontSize: 9, height: 20 }} />
                      {c.not_started > 0 && (
                        <Chip size='small' label={`${c.not_started} not started`}
                          sx={{ fontSize: 9, height: 20, bgcolor: '#f5f5f5', color: '#757575' }} />
                      )}
                      {c.self_review > 0 && (
                        <Chip size='small' label={`${c.self_review} self review`}
                          sx={{ fontSize: 9, height: 20, bgcolor: '#fff3e0', color: '#ed6c02' }} />
                      )}
                      {c.manager_review > 0 && (
                        <Chip size='small' label={`${c.manager_review} mgr review`}
                          sx={{ fontSize: 9, height: 20, bgcolor: '#f3e5f5', color: '#9c27b0' }} />
                      )}
                      {c.hr_review > 0 && (
                        <Chip size='small' label={`${c.hr_review} HR review`}
                          sx={{ fontSize: 9, height: 20, bgcolor: '#e0f7fa', color: '#0097a7' }} />
                      )}
                      {c.completed > 0 && (
                        <Chip size='small' label={`${c.completed} completed`}
                          sx={{ fontSize: 9, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Rating Distribution */}
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>Rating Distribution</Typography>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <TextField label='Select Cycle' size='small' fullWidth select
              value={selectedCycleId} onChange={(e) => handleSelectCycle(e.target.value)}
              sx={{ mb: 2 }}>
              <MenuItem value=''>-- Select --</MenuItem>
              {data.filter((c) => c.completed > 0).map((c) => (
                <MenuItem key={c.cycle_id} value={c.cycle_id}>{c.cycle_name}</MenuItem>
              ))}
            </TextField>

            {distribution.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 2 }}>
                {selectedCycleId ? 'No completed appraisals with ratings yet.' : 'Select a cycle to see rating distribution.'}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {distribution.map((d) => {
                  const totalDist = distribution.reduce((sum, x) => sum + x.count, 0);
                  const pct = totalDist > 0 ? (d.count / totalDist) * 100 : 0;
                  const barColor = ratingColors[d.rating_label] || '#757575';
                  return (
                    <Box key={d.rating_label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{d.rating_label}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{d.count} ({Math.round(pct)}%)</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: barColor, borderRadius: 4,
                          transition: 'width 0.3s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
