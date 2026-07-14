import { Grid, Typography } from '@mui/material';
import React from 'react';
import { headerStyle } from 'utils/pageSize';
import OutstandingCard from './OutstandingCard';
import TopOutstandingTable from './table';

export default function OutstandingReportDashboard(props) {
  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <h2
          style={{
            textAlign: 'left',
            fontWeight:headerStyle.fontWeight,
            fontSize:headerStyle.fontSize,
            textTransform: 'uppercase',
            paddingLeft: '10px',
            color: 'black'
          }}
        >
          Outstanding Report Dashboard
        </h2>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <OutstandingCard inView={props.inView} salesmanId={props.salesmanId}/>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <TopOutstandingTable inView={props.inView} />
      </Grid>
    </Grid>
  );
}
