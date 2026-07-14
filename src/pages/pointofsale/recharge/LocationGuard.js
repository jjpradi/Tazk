import React from 'react';
import {Alert, AlertTitle, Box, Typography} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

// POS convention: CreateNewButtonContext.headerLocationId === 'null' when the
// top-bar shows "All Locations" or a branch hasn't been picked yet.
export const hasLocation = (v) =>
  v !== undefined && v !== null && v !== 'null' && Number(v) > 0;

export default function LocationGuard({headerLocationId, children}) {
  if (hasLocation(headerLocationId)) return children;
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', p: 4}}>
      <Alert
        severity='info'
        icon={<StorefrontOutlinedIcon fontSize='large' />}
        sx={{maxWidth: 560, width: '100%'}}
      >
        <AlertTitle sx={{fontWeight: 700}}>Select a branch to continue</AlertTitle>
        <Typography variant='body2' sx={{mt: 0.5}}>
          Mobile recharge is a per-branch operation — wallet balances, transactions
          and cashbox postings are all scoped to a single branch. Pick a branch from
          the top-bar location selector to view or manage recharge data.
        </Typography>
      </Alert>
    </Box>
  );
}
