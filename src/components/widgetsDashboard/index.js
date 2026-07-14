import {Grid, Typography} from '@mui/material';
import TotalReceivables from 'components/dashboard/payable_receivable/totalReceivables';
import TodaySales from 'components/dashboard/SalesDashboard/todaySales&salesTillDate';
import AvailStock from 'pages/sales/inventoryMD/AvailStock';
import React from 'react';
import {useInView} from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import Top3Sales from './top3Sales';
import TotalPayables from 'components/dashboard/payable_receivable/totalPayable';

import WidgetDetails from './WidgetsDetails';

const WidgetsDashboard = () => {
  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });
  const { TotAccReducer: { payable_receivable, aging_receivable, aging_payable } } = useSelector(state => state)

  return (
    <Grid container spacing={2} ref={ref}>
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
            color: 'black',
            // paddingBottom: 15,
            // display: 'flex',
            // justifyContent: 'space-between',
          }}
        >
          Widgets
        </Typography>
    
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <WidgetDetails inView={inView}/>
      </Grid>
      <Grid
        sx={{pt:'10px'}}
        size={{
          lg: 6,
          md: 6,
          sm: 6,
          xs: 12
        }}>
          <TotalReceivables data={payable_receivable}/>
            </Grid>
      <Grid
        sx={{pt:'10px'}}
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
        <TotalPayables data={payable_receivable} />
       </Grid>
      <Grid
        sx={{pt:'10px'}}
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
       <TodaySales inView={inView}/>
     </Grid>
      <Grid
        sx={{pt:'5px'}}
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
       <Top3Sales inView={inView}/>
     </Grid>
      <Grid
        sx={{pt:'10px'}}
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
        <AvailStock inView={inView} />
      </Grid>
    </Grid>
  );
};

export default WidgetsDashboard;
