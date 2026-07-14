import React from 'react';
import { Chip, Stack } from '@mui/material';

export default function ViewToggleChips({ options, selectedKey, onSelect }) {
  return (
    <Stack direction="row" spacing={1}>
      {options.map((opt) => {
        const selected = selectedKey === opt.key;
        return (
          <Chip
            key={opt.key}
            label={opt.label}
            onClick={() => onSelect(opt.key)}
            color={selected ? 'primary' : 'default'}
            sx={{
              cursor: 'pointer',
              fontWeight: selected ? 'bold' : 'normal',
              minWidth: '120px',
              height: '28px',
              backgroundColor: selected ? 'primary' : 'rgba(255, 255, 255, 0.8)',
              color: '#000',
              border: '1px solid #ddd',
              padding: '4px 8px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
        );
      })}
    </Stack>
  );
}
