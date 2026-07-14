import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Typography, TextField, Slider, Divider, MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Helmet } from 'react-helmet-async';
import CalculateIcon from '@mui/icons-material/Calculate';
import { titleURL } from 'http-common';
import { getPlansAction } from '../../../../redux/actions/salesTarget_actions';

const formatCurrency = (val) => {
  if (val == null || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

function findSlab(slabs, pct) {
  if (!slabs || slabs.length === 0) return null;
  for (const s of slabs) {
    if (pct >= Number(s.from_pct || s.slab_from) && pct <= Number(s.to_pct || s.slab_to)) return s;
  }
  const sorted = [...slabs].sort((a, b) => Number(b.slab_to || b.to_pct) - Number(a.slab_to || a.to_pct));
  if (pct > Number(sorted[0].slab_to || sorted[0].to_pct)) return sorted[0];
  return null;
}

function calcSlabIncentive(slab, targetValue, achievedValue) {
  if (!slab) return 0;
  const type = slab.incentive_type;
  const val = Number(slab.incentive_value || slab.value) || 0;

  if (type === 'fixed') return val;
  if (type === 'percentage') {
    const of = slab.percentage_of;
    const base = of === 'target_value' ? targetValue
      : of === 'incremental_value' ? Math.max(0, achievedValue - targetValue)
      : achievedValue;
    return Math.round((base * val / 100) * 100) / 100;
  }
  return 0;
}

export default function WhatIfCalculator() {
  const dispatch = useDispatch();
  const { plans } = useSelector((s) => s.salesTargetReducer);
  const planList = Array.isArray(plans?.rows || plans) ? (plans?.rows || plans) : [];
  const basePlans = planList.filter(p => p.plan_type === 'base' && p.is_active);

  const [targetValue, setTargetValue] = useState(100000);
  const [achievementPct, setAchievementPct] = useState(85);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => { dispatch(getPlansAction()); }, [dispatch]);
  useEffect(() => {
    if (!selectedPlanId && basePlans.length > 0) setSelectedPlanId(basePlans[0].id);
  }, [basePlans, selectedPlanId]);

  const selectedPlan = basePlans.find(p => p.id === selectedPlanId);
  const slabs = selectedPlan?.slabs || [];
  const achievedValue = Math.round(targetValue * achievementPct / 100);
  const matchingSlab = findSlab(slabs, achievementPct);
  const incentiveAmount = calcSlabIncentive(matchingSlab, targetValue, achievedValue);

  // Gate check
  const gateConditions = selectedPlan?.gate_conditions || {};
  const gateMinAch = Number(gateConditions.min_achievement_pct) || 0;
  const gatePassed = achievementPct >= gateMinAch;
  const finalIncentive = gatePassed ? incentiveAmount : 0;

  return (
    <>
      <Helmet><title>{titleURL} | What-If Calculator</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalculateIcon sx={{ color: '#1976D2' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
              What-If Incentive Calculator
            </Typography>
          </Box>
        </Card>

        <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Input Panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, height: '100%' }} elevation={0}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2, color: '#2E3A59' }}>
                Simulate Your Achievement
              </Typography>

              {basePlans.length > 0 && (
                <TextField select fullWidth size="small" label="Incentive Plan" value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)} sx={{ mb: 3 }}>
                  {basePlans.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.plan_name}</MenuItem>
                  ))}
                </TextField>
              )}

              <Typography sx={{ fontSize: 12, color: '#666', mb: 0.5 }}>Target Value (₹)</Typography>
              <TextField fullWidth size="small" type="number" value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value) || 0)}
                sx={{ mb: 3, '& input': { fontSize: 14, textAlign: 'right' } }} />

              <Typography sx={{ fontSize: 12, color: '#666', mb: 1 }}>
                Achievement: <strong>{achievementPct}%</strong> ({formatCurrency(achievedValue)})
              </Typography>
              <Slider value={achievementPct} onChange={(e, v) => setAchievementPct(v)}
                min={0} max={200} step={1}
                sx={{ color: achievementPct >= 100 ? '#4CAF50' : achievementPct >= 75 ? '#FF9800' : '#F44336' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
                <Typography sx={{ fontSize: 10, color: '#999' }}>0%</Typography>
                <Typography sx={{ fontSize: 10, color: '#999' }}>100%</Typography>
                <Typography sx={{ fontSize: 10, color: '#999' }}>200%</Typography>
              </Box>
            </Card>
          </Grid>

          {/* Result Panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ p: 3, height: '100%' }} elevation={0}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2, color: '#2E3A59' }}>
                Projected Incentive
              </Typography>

              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 36, fontWeight: 800, color: gatePassed ? '#4CAF50' : '#F44336' }}>
                  {formatCurrency(finalIncentive)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#999', mt: 0.5 }}>
                  {gatePassed ? 'Estimated incentive payout' : `Gate not passed (min ${gateMinAch}% required)`}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Slab breakdown */}
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 1 }}>Slab Breakdown</Typography>
              {slabs.length === 0 ? (
                <Typography sx={{ fontSize: 12, color: '#999' }}>No slabs configured for this plan.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {slabs.map((s, i) => {
                    const from = Number(s.from_pct || s.slab_from);
                    const to = Number(s.to_pct || s.slab_to);
                    const isActive = achievementPct >= from && achievementPct <= to;
                    const typeLabel = s.incentive_type === 'fixed' ? `₹${s.incentive_value || s.value}`
                      : s.incentive_type === 'percentage' ? `${s.incentive_value || s.value}% of ${s.percentage_of || 'achieved'}`
                      : `₹${s.incentive_value || s.value}/unit`;

                    return (
                      <Box key={i} sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        px: 1.5, py: 0.8, borderRadius: 1,
                        bgcolor: isActive ? '#E8F5E9' : '#FAFAFA',
                        border: isActive ? '1px solid #4CAF50' : '1px solid #f0f0f0',
                      }}>
                        <Typography sx={{ fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                          {s.slab_label || s.label || `Slab ${i + 1}`}: {from}% – {to}%
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: isActive ? '#2E7D32' : '#999' }}>
                          {typeLabel}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {gateMinAch > 0 && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: gatePassed ? '#E8F5E9' : '#FFEBEE' }}>
                  <Typography sx={{ fontSize: 11, color: gatePassed ? '#2E7D32' : '#C62828' }}>
                    Gate Condition: Min {gateMinAch}% achievement required — {gatePassed ? 'PASSED' : 'NOT MET'}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
