import React from 'react';
import { Box, Divider, Typography } from '@mui/material';

export default function ReturnSummary({ untaxed, tax, total }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pr: 2 }}>
      <Box sx={{ minWidth: 250 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Untaxed Amount</Typography>
          <Typography variant="body2">&#8377; {untaxed.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Tax (GST)</Typography>
          <Typography variant="body2">&#8377; {tax.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>&#8377; {total.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
