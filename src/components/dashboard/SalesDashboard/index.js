import {Grid} from '@mui/material';
import React from 'react';
import AreaWiseSale from './areaWiseSale';
import BrandSales from './brandSales';
import SalesComparison from './salesComparison';
import TodaySales from './todaySales&salesTillDate';
import TotalSales from './totalSales';
import {useInView} from 'react-intersection-observer';

const SalesDashboard = () => {

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <Grid container display='flex' flexDirection='row' spacing={3} ref={ref}>
      {/* <Grid
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '15px',
          marginBottom: '20px',
        }}
      > */}
      {/* <Grid style={{display:'flex' , flexDirection:'row'}}> */}
      <Grid
        style={{ }}
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
      <TotalSales inView={inView}/>
      </Grid>
      <Grid
        style={{ }}
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
      <BrandSales inView={inView}/>
      </Grid>
      {/* </Grid> */}
      {/* </Grid> */}
      <Grid
        style={{ }}
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
        <SalesComparison inView={inView}/>
        </Grid>
      <Grid
        style={{ }}
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
      <AreaWiseSale inView={inView}/>
    </Grid>
      {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}  item>
        <TodaySales inView={inView}/>
      </Grid> */}
    </Grid>
  );
};

export default SalesDashboard;
