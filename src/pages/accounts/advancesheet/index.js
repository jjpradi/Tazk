import { Grid } from '@mui/material'
import React from 'react'
import Advancetable from './Advancetable'

export default function index() {
  return (
    <Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Advancetable />
      </Grid>
    </Grid>
  );
}
