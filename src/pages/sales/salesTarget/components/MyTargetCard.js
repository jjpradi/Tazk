import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Typography, CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getMyTargetAction } from '../../../../redux/actions/salesTarget_actions';

const formatCurrency = (val) => {
  if (val == null || val === '' || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

function CircularGauge({ value, size = 100, thickness = 8 }) {
  const pct = Math.min(Math.max(value || 0, 0), 100);
  const color = pct >= 100 ? '#4CAF50' : pct >= 75 ? '#FF9800' : pct >= 50 ? '#2196F3' : '#F44336';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* Background circle */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: '#E8EDF5', position: 'absolute' }}
      />
      {/* Foreground circle */}
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={thickness}
        sx={{ color, transition: 'all 0.5s ease' }}
      />
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>
          {pct.toFixed(0)}%
        </Typography>
        <Typography sx={{ fontSize: 9, color: '#999', mt: 0.2 }}>achieved</Typography>
      </Box>
    </Box>
  );
}

function StatItem({ label, value, icon, color = '#2E3A59' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8 }}>
      {icon && (
        <Box sx={{
          width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}14`,
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 16, color } })}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 10, color: '#999', lineHeight: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1.3 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export default function MyTargetCard({ periodId }) {
  const dispatch = useDispatch();
  const { myTarget, loading } = useSelector((s) => s.salesTargetReducer);

  useEffect(() => {
    if (periodId) {
      dispatch(getMyTargetAction(periodId));
    }
  }, [dispatch, periodId]);

  if (loading && !myTarget) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={32} />
      </Card>
    );
  }

  if (!myTarget) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: '#999', fontSize: 13 }}>No target assigned for this period.</Typography>
      </Card>
    );
  }

  const target = Number(myTarget.target_value) || 0;
  const achieved = Number(myTarget.achieved_value) || 0;
  const remaining = Math.max(target - achieved, 0);
  const achPct = target > 0 ? ((achieved / target) * 100) : 0;

  const targetCollection = Number(myTarget.target_collection) || 0;
  const collectionValue = Number(myTarget.collection_value) || 0;
  const collPct = targetCollection > 0 ? ((collectionValue / targetCollection) * 100) : 0;

  const newCustTarget = Number(myTarget.new_customer_target) || 0;
  const newCustAchieved = Number(myTarget.new_customers) || 0;

  const nextSlab = myTarget.next_slab;

  return (
    <Card sx={{ p: 2, border: '1px solid #E8EDF5' }} elevation={0}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 2 }}>
        My Target
      </Typography>

      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        {/* Gauge */}
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularGauge value={achPct} size={110} thickness={6} />
        </Grid>

        {/* Stats */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <StatItem
              label="Target"
              value={formatCurrency(target)}
              color="#2E3A59"
            />
            <StatItem
              label="Achieved"
              value={formatCurrency(achieved)}
              color="#4CAF50"
            />
            <StatItem
              label="Remaining"
              value={formatCurrency(remaining)}
              color={remaining > 0 ? '#F44336' : '#4CAF50'}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Collection Progress */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #F0F0F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: '#666' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
            Collection
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#1976D2' }}>
            {collPct.toFixed(0)}% ({formatCurrency(collectionValue)} / {formatCurrency(targetCollection)})
          </Typography>
        </Box>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#E3F2FD', overflow: 'hidden' }}>
          <Box sx={{
            height: '100%', borderRadius: 3,
            width: `${Math.min(collPct, 100)}%`,
            bgcolor: collPct >= 100 ? '#4CAF50' : '#2196F3',
            transition: 'width 0.5s ease',
          }} />
        </Box>
      </Box>

      {/* New Customers */}
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon sx={{ fontSize: 16, color: '#9C27B0' }} />
        <Typography sx={{ fontSize: 12, color: '#666' }}>
          New Customers: <strong>{newCustAchieved}</strong> / {newCustTarget}
        </Typography>
      </Box>

      {/* Next Slab */}
      {nextSlab && (
        <Box sx={{
          mt: 1.5, p: 1.2, borderRadius: 1, bgcolor: '#FFF8E1', border: '1px solid #FFE082',
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#F57C00' }}>
            Next Slab: {nextSlab.name || nextSlab.label || 'Next Level'}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            {nextSlab.threshold ? `Reach ${formatCurrency(nextSlab.threshold)} to unlock` : ''}
            {nextSlab.incentive_pct ? ` - ${nextSlab.incentive_pct}% incentive` : ''}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
