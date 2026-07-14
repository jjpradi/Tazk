import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';

export default function AgingChips({ buckets, selectedKey, onSelect }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-start"
      sx={{ p: 1, flexWrap: 'wrap', overflowX: 'hidden' }}
    >
      {buckets.map((bucket, _i, arr) => {
        const selected = selectedKey === bucket.key;
        const widthPct = `calc(${100 / arr.length}% - 8px)`;
        const isEmpty = Number(bucket.displayValue) === 0;
        const accent = isEmpty && !selected ? '#bdbdbd' : bucket.color;
        const labelColor = selected ? '#fff' : isEmpty ? '#9e9e9e' : 'rgba(0,0,0,0.87)';
        const valueColor = selected ? '#fff' : isEmpty ? '#bdbdbd' : bucket.color;
        return (
          <Chip
            key={bucket.key}
            onClick={() => onSelect(bucket.key)}
            sx={{
              cursor: 'pointer',
              fontWeight: selected ? 'bold' : 'normal',
              flex: widthPct,
              height: '46px',
              backgroundColor: selected ? bucket.color : '#fff',
              border: '1px solid #e0e0e0',
              borderLeft: `4px solid ${accent}`,
              padding: '4px 8px',
              boxShadow: 'none',
              transform: 'none',
              borderRadius: '6px',
              transition: 'background-color 150ms ease, box-shadow 150ms ease',
              '&:hover': {
                backgroundColor: selected ? bucket.color : 'rgba(0,0,0,0.02)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              },
            }}
            label={
              <Stack spacing={0} alignItems="center">
                <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 'bold', color: labelColor }}>
                  {bucket.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '11px',
                    lineHeight: '10px',
                    fontWeight: 700,
                    marginTop: '6px',
                    color: valueColor,
                  }}
                >
                  ₹{bucket.displayValue}
                </Typography>
              </Stack>
            }
          />
        );
      })}
    </Stack>
  );
}
