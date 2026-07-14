import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {Grid, Typography} from '@mui/material';

const checkIsValid = (val) => {
  if (typeof val === 'undefined') return '';
  if (val === null || val === 'null') return '';
  return val;
};

const ProductBrand = (data) => {
  return (
    <Box>
      <Card variant='outlined' sx={{padding: '10px', minHeight: '250px'}}>
        {/* <CardContent> */}
        <Grid container>
          <Grid
            size={{
              xs: 6,
              lg: 12
            }}>
            <Typography variant='body1'>
              Brand :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(data?.brand)}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              Category :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(data?.category)}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              Cost Price :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(data?.cost_price)}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              Unit Price :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(data?.unit_price)}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              MRP :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(data?.max_price)}
              </span>
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default ProductBrand;
