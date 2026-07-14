import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Typography, LinearProgress, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Helmet } from 'react-helmet-async';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import moment from 'moment';
import { titleURL } from 'http-common';
import { getPeriodsAction, getMyTargetAction } from '../../../redux/actions/salesTarget_actions';
import PeriodSelector from './components/PeriodSelector';
import MyTargetCard from './components/MyTargetCard';

const formatCurrency = (val) => {
  if (val == null || val === '' || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

function DailyProgressCard({ myTarget }) {
  const target = Number(myTarget?.target_value) || 0;
  const achieved = Number(myTarget?.achieved_value) || 0;
  const today = moment();
  const daysPassed = today.date();
  const totalDays = today.daysInMonth();
  const daysRemaining = totalDays - daysPassed;

  const dailyRate = daysPassed > 0 ? achieved / daysPassed : 0;
  const projectedMonth = dailyRate * totalDays;
  const requiredDaily = daysRemaining > 0 ? Math.max(0, target - achieved) / daysRemaining : 0;

  const onTrack = projectedMonth >= target;

  return (
    <Card sx={{ p: 2.5, border: '1px solid #E8EDF5' }} elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarTodayIcon sx={{ fontSize: 18, color: '#1976D2' }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59' }}>
          Daily Progress
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Day</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#2E3A59' }}>
            {daysPassed} <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>/ {totalDays}</span>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Daily Avg</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1976D2' }}>
            {formatCurrency(Math.round(dailyRate))}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Need/Day</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: requiredDaily > dailyRate ? '#F44336' : '#4CAF50' }}>
            {formatCurrency(Math.round(requiredDaily))}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Projected</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: onTrack ? '#4CAF50' : '#FF9800' }}>
            {formatCurrency(Math.round(projectedMonth))}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Month Progress</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
            {((daysPassed / totalDays) * 100).toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(daysPassed / totalDays) * 100}
          sx={{ height: 6, borderRadius: 3, bgcolor: '#E8EDF5',
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#90CAF9' } }}
        />
      </Box>

      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Achievement Progress</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: onTrack ? '#4CAF50' : '#FF9800' }}>
            {target > 0 ? ((achieved / target) * 100).toFixed(1) : 0}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(target > 0 ? (achieved / target) * 100 : 0, 100)}
          sx={{ height: 6, borderRadius: 3, bgcolor: '#E8EDF5',
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: onTrack ? '#4CAF50' : '#FF9800' } }}
        />
      </Box>

      {!onTrack && daysRemaining > 0 && (
        <Typography sx={{ mt: 1.5, fontSize: 11, color: '#F57C00', fontWeight: 500 }}>
          You need {formatCurrency(Math.round(requiredDaily))}/day for the remaining {daysRemaining} days to hit your target.
        </Typography>
      )}
      {onTrack && (
        <Typography sx={{ mt: 1.5, fontSize: 11, color: '#2E7D32', fontWeight: 500 }}>
          On track! Projected to achieve {target > 0 ? ((projectedMonth / target) * 100).toFixed(0) : 0}% of target.
        </Typography>
      )}
    </Card>
  );
}

export default function MyDashboard() {
  const dispatch = useDispatch();
  const { periods, myTarget } = useSelector((s) => s.salesTargetReducer);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    dispatch(getPeriodsAction());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPeriod && Array.isArray(periods) && periods.length > 0) {
      setSelectedPeriod(periods[0].id || periods[0].period_id);
    }
  }, [periods, selectedPeriod]);

  return (
    <>
      <Helmet><title>{titleURL} | My Target</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ color: '#1976D2' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>My Target</Typography>
            <PeriodSelector value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} />
          </Box>
        </Card>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <MyTargetCard periodId={selectedPeriod} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <DailyProgressCard myTarget={myTarget} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
