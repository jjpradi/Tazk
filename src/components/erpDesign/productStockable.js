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

const ProductStockable = (data) => {
  return (
    <Box>
      <Card variant='outlined' sx={{padding: '10px', minHeight: '130px'}}>
        {/* <CardContent> */}
        <Grid container>
          <Grid
            size={{
              xs: 6,
              lg: 12
            }}>
            <Typography variant='body1'>
              Stockable :{' '}
              <span style={{ fontWeight: '500' }}>
                {checkIsValid(
                  data?.stock_type == '1' ? 'Goods' : 'Service',
                )}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */} 
            <Typography variant='body1'>
              Serialized :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(
                  data?.is_serialized == '1' ? 'Serialized' : 'Non Serialized',
                )}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              Reorder Level :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(
                  data?.reorder_level == '1' ? 'Yes' : 'No'
                )}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            <Typography variant='body1'>
              Auto Reorder :{' '}
              <span style={{fontWeight: '500'}}>
                {checkIsValid(
                  data?.automatic_reorder_level == '1' ? 'Yes' : 'No'
                )}
              </span>
            </Typography>
            {/* </Grid>
                    <Grid size={{ xs: 6, lg: 12 }}> */}
            {/* <h4>MRP :</h4> */}
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default ProductStockable;
