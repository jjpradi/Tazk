import { Grid, Typography } from '@mui/material';
import React from 'react';
import OutstandingReportDashboard from './outstandingReport.js/index.js';
import ChequeBounces from './chequeBounces';
import SalesDetails from './SalesDetails/index';
import { useInView } from 'react-intersection-observer';
import { headerStyle } from 'utils/pageSize.js';


const SalesManDashboard = (props) => {

  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <Grid container spacing={1} ref={ref}>
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
            paddingLeft: '7px',
            color: 'black'
          }}
        >
          Sales Man Dashboard
        </h2>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <SalesDetails inView={inView} rowIndex={props.rowIndex}/>
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        <OutstandingReportDashboard inView={inView} />
      </Grid> */}
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <ChequeBounces rowIndex={props.rowIndex} type = 'salesmanDetails' />
      </Grid>
    </Grid>
  );
};

export default SalesManDashboard;
