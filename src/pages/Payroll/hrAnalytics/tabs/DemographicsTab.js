import React from 'react';
import { Box, Grid, Paper, Typography, Tooltip } from '@mui/material';

const GENDER_COLORS = {
  male: '#42a5f5',
  female: '#ec407a',
  other: '#78909c',
  not_specified: '#bdbdbd',
};

const EMPLOYMENT_COLORS = {
  permanent: '#66bb6a',
  contract: '#ffa726',
  intern: '#42a5f5',
  consultant: '#ab47bc',
  probation: '#ef5350',
};

const AGE_COLORS = [
  '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3',
  '#1e88e5', '#1976d2', '#1565c0', '#0d47a1',
];

const TENURE_COLORS = [
  '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50',
  '#43a047', '#388e3c', '#2e7d32', '#1b5e20',
];

const formatLabel = (str) =>
  (str || 'Unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getTotal = (data) =>
  (data || []).reduce((sum, d) => sum + (Number(d.count) || 0), 0);

const pct = (count, total) =>
  total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

const HorizontalBar = ({ label, count, total, color, maxCount }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          minWidth: 110,
          flexShrink: 0,
          color: 'text.primary',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Tooltip title={`${label}: ${count} (${pct(count, total)}%)`} arrow>
          <Box
            sx={{
              height: 24,
              bgcolor: '#f5f5f5',
              borderRadius: 1.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${barWidth}%`,
                bgcolor: color,
                borderRadius: 1.5,
                transition: 'width 0.4s ease',
                minWidth: count > 0 ? 4 : 0,
              }}
            />
          </Box>
        </Tooltip>
      </Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          minWidth: 36,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {count}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: 'text.secondary',
          minWidth: 48,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {pct(count, total)}%
      </Typography>
    </Box>
  );
};

const EmptyState = ({ message }) => (
  <Box sx={{ py: 3, textAlign: 'center' }}>
    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
      {message}
    </Typography>
  </Box>
);

const SectionHeader = ({ title, total }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
    {total > 0 && (
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        Total: {total}
      </Typography>
    )}
  </Box>
);

export default function DemographicsTab({
  genderDiversity = [],
  ageDistribution = [],
  tenureDistribution = [],
  employmentType = [],
}) {
  const genderTotal = getTotal(genderDiversity);
  const employmentTotal = getTotal(employmentType);
  const ageTotal = getTotal(ageDistribution);
  const tenureTotal = getTotal(tenureDistribution);

  const genderMax = Math.max(...genderDiversity.map((d) => Number(d.count) || 0), 0);
  const employmentMax = Math.max(...employmentType.map((d) => Number(d.count) || 0), 0);
  const ageMax = Math.max(...ageDistribution.map((d) => Number(d.count) || 0), 0);
  const tenureMax = Math.max(...tenureDistribution.map((d) => Number(d.count) || 0), 0);

  return (
    <Box>
      {/* Row 1: Gender + Employment Type side by side */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Gender Diversity */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <SectionHeader title='Gender Distribution' total={genderTotal} />
            {genderDiversity.length === 0 ? (
              <EmptyState message='No gender data available.' />
            ) : (
              genderDiversity.map((item) => {
                const key = (item.gender || 'not_specified').toLowerCase().replace(/\s+/g, '_');
                return (
                  <HorizontalBar
                    key={key}
                    label={formatLabel(item.gender)}
                    count={Number(item.count) || 0}
                    total={genderTotal}
                    maxCount={genderMax}
                    color={GENDER_COLORS[key] || '#bdbdbd'}
                  />
                );
              })
            )}
          </Paper>
        </Grid>

        {/* Employment Type */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <SectionHeader title='Employment Type' total={employmentTotal} />
            {employmentType.length === 0 ? (
              <EmptyState message='No employment type data available.' />
            ) : (
              employmentType.map((item) => {
                const key = (item.employment_type || '').toLowerCase().replace(/\s+/g, '_');
                return (
                  <HorizontalBar
                    key={key}
                    label={formatLabel(item.employment_type)}
                    count={Number(item.count) || 0}
                    total={employmentTotal}
                    maxCount={employmentMax}
                    color={EMPLOYMENT_COLORS[key] || '#90a4ae'}
                  />
                );
              })
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2: Age Distribution (full width) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SectionHeader title='Age Distribution' total={ageTotal} />
        {ageDistribution.length === 0 ? (
          <EmptyState message='No age distribution data available.' />
        ) : (
          ageDistribution.map((item, idx) => {
            const colorIdx = Math.min(
              Math.floor((idx / Math.max(ageDistribution.length - 1, 1)) * (AGE_COLORS.length - 1)),
              AGE_COLORS.length - 1,
            );
            return (
              <HorizontalBar
                key={item.age_band || idx}
                label={formatLabel(item.age_band)}
                count={Number(item.count) || 0}
                total={ageTotal}
                maxCount={ageMax}
                color={AGE_COLORS[colorIdx]}
              />
            );
          })
        )}
      </Paper>

      {/* Row 3: Tenure Distribution (full width) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SectionHeader title='Tenure Distribution' total={tenureTotal} />
        {tenureDistribution.length === 0 ? (
          <EmptyState message='No tenure distribution data available.' />
        ) : (
          tenureDistribution.map((item, idx) => {
            const colorIdx = Math.min(
              Math.floor((idx / Math.max(tenureDistribution.length - 1, 1)) * (TENURE_COLORS.length - 1)),
              TENURE_COLORS.length - 1,
            );
            return (
              <HorizontalBar
                key={item.tenure_band || idx}
                label={formatLabel(item.tenure_band)}
                count={Number(item.count) || 0}
                total={tenureTotal}
                maxCount={tenureMax}
                color={TENURE_COLORS[colorIdx]}
              />
            );
          })
        )}
      </Paper>
    </Box>
  );
}
