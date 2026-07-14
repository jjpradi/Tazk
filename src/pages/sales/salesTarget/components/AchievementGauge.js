import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const sizeMap = {
  sm: { size: 48, fontSize: 11, thickness: 3.5 },
  md: { size: 72, fontSize: 14, thickness: 4 },
  lg: { size: 100, fontSize: 18, thickness: 4.5 },
};

const getColor = (pct) => {
  if (pct >= 100) return '#1B5E20';
  if (pct >= 90) return '#2E7D32';
  if (pct >= 70) return '#ED6C02';
  return '#D32F2F';
};

export default function AchievementGauge({ percentage = 0, size = 'md', color, label }) {
  const cfg = sizeMap[size] || sizeMap.md;
  const displayColor = color || getColor(percentage);
  const clampedValue = Math.min(percentage, 100);

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background track */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={cfg.size}
          thickness={cfg.thickness}
          sx={{ color: '#E8EDF5', position: 'absolute' }}
        />
        {/* Foreground progress */}
        <CircularProgress
          variant="determinate"
          value={clampedValue}
          size={cfg.size}
          thickness={cfg.thickness}
          sx={{ color: displayColor }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: cfg.fontSize,
              fontWeight: 700,
              color: displayColor,
              lineHeight: 1,
            }}
          >
            {Math.round(percentage)}%
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography
          sx={{
            fontSize: cfg.fontSize - 3,
            color: '#637381',
            fontWeight: 500,
            mt: 0.5,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
