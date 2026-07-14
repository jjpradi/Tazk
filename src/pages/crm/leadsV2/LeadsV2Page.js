import React from 'react';
import {Box, Typography} from '@mui/material';
import LeadManagement from '../leadManagement';

export default function LeadsV2Page() {
  return (
    <Box sx={{px: 2, py: 2}}>
      <Typography variant='h6' sx={{mb: 2}}>
        Leads (V2)
      </Typography>
      <LeadManagement />
    </Box>
  );
}

