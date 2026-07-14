import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';

export default function TdsSelector({ tdsConfig, onTdsChange, manualTdsAmount, onManualTdsChange, tdsRates = [] }) {
  return (
    <Box>
      <Autocomplete
        size="small"
        options={tdsRates}
        getOptionLabel={(opt) => {
          if (!opt || !opt.category) return '';
          return `${opt.category} [${opt.tds_rate}%] [${opt.section || ''}]`;
        }}
        value={tdsConfig || null}
        onChange={(e, val) => onTdsChange(val)}
        isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
        renderInput={(params) => (
          <TextField {...params} variant="standard" placeholder="TDS (optional)" sx={{ fontSize: 12 }} />
        )}
        renderOption={(props, option, { index }) => (
          <li {...props} key={`tds-${option.id}-${index}`}>
            <Typography sx={{ fontSize: 12 }}>
              {option.category} [{option.tds_rate}%] [{option.section || ''}]
            </Typography>
          </li>
        )}
      />
      {tdsConfig?.category === 'Others' && (
        <TextField
          size="small"
          variant="standard"
          type="number"
          inputMode="decimal"
          placeholder="Enter TDS amount"
          value={manualTdsAmount || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || !isNaN(val)) onManualTdsChange(val);
          }}
          sx={{ mt: 1, width: '100%' }}
          inputProps={{ style: { textAlign: 'right' }, min: 0 }}
        />
      )}
    </Box>
  );
}
