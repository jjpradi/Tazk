import React, {useEffect, useState} from 'react';
import CardTemplate from '../customer_erpDesign/cardTemplate';
import {Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import useStyles from '../customer_erpDesign/cardStyles';

export default function ProductTopCards(props) {
  const c = useStyles();
  // console.log("props.product_erp_details", props.product_erp_details[0])
  const stock = props.product_erp_details[0]?.stock_in_hand?.[0];

  const displayStock = stock
    ? (stock.is_serialized === 1
      ? stock.serializedStock_in_hand
      : stock.quantity)
    : 0;
  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.green}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              Stock In Hand
            </Typography>

            <Typography variant='h6' align='center'>
              {displayStock || 0}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.yellow}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              To Be Received
            </Typography>

            <Typography variant='h6' align='center'>
              {props.product_erp_details[0]?.item_to_be_received || 0}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.red}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              Projected Qty
            </Typography>

            <Typography variant='h6' align='center'>
              {props.product_erp_details[0]?.projected_qty || 0}
            </Typography>
          </Card>
        </Box>
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} direction='row'> */}
      {/* </Grid> */}
    </Grid>
  );
}
