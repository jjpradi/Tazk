import { Grid, Typography } from '@mui/material';
import React from 'react';
import CardContent from './cardContent';
import PosSummary from './posSummary';
import { useInView } from 'react-intersection-observer';


const PosUserDashboard = () => {

  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
  });


  return (
    <Grid container ref={ref}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Typography
        variant='h6'
          style={{
            textAlign: 'left',
            textTransform: 'uppercase',
            paddingLeft: '10px',
            color: 'black'
          }}
        >
          Pos User Dashboard
        </Typography>
      </Grid>
      <Grid
        style={{
          marginBottom: '20px'
        }}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <CardContent inView={inView} />
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <PosSummary inView={inView} />
      </Grid>
    </Grid>
  );
};

export default PosUserDashboard;
