import React from 'react';
import {Grid} from '@mui/material';
import ProductTopCards from './productTopOrder';

export default function SOErpTemplate() {
  return (
    <Grid container>
      <Grid alignContent={'row_reverse'} style={{backgroundColor: 'red'}}>
        <p>hii</p>
      </Grid>
      <Grid
        sx={{backgroundColor: 'green'}}
        size={{
          lg: 12
        }}>
        <ProductTopCards
          product_erp_details={[
            {
              stock_in_hand: 0,
              item_to_be_received: 0,
              projected_qty: 1,
            },
          ]}
        />
      </Grid>
      <Grid
        style={{backgroundColor: 'yellow'}}
        size={{
          lg: 12
        }}>
        <p>hii</p>
      </Grid>
      <Grid
        style={{backgroundColor: 'blue'}}
        size={{
          lg: 12
        }}>
        <p>hii</p>
      </Grid>
      <Grid
        style={{backgroundColor: 'orange'}}
        size={{
          lg: 12
        }}>
        <p>hii</p>
      </Grid>
    </Grid>
  );
}
