import React from 'react';
import {Grid, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import {Divider} from '@mui/material';
import moment from 'moment';

function BillsRow({salesData}) {
  const theme = useTheme();
  return (
    <>
      <Grid container spacing={2}>
        <Grid display='flex' size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Card
            variant='outlined'
            sx={{
              padding: '12px 10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              borderRadius: '6px',
              bgcolor: `${theme.palette.primary.main}0A`,
              borderColor: `${theme.palette.primary.main}30`,
            }}
          >
            <Grid>
              <Box width='100%'>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                  Created By
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>
                  {salesData?.created_by || '-'}
                </Typography>
              </Box>
            </Grid>
            <Divider orientation='vertical' flexItem />
            <Grid>
              <Box width='100%'>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                  Created On
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>
                  {salesData?.sale_time
                    ? moment(salesData.sale_time, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY hh:mm A")
                    : "-"}
                </Typography>
              </Box>
            </Grid>
            <Divider orientation='vertical' flexItem />
            <Grid>
              <Box width='100%'>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                  Billed on
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>
                  {salesData?.billed_on === "didn't yet invoiced"
                    ? "Didn't yet invoiced"
                    : salesData?.billed_on
                      ? moment(salesData.billed_on, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY hh:mm A")
                      : "-"}
                </Typography>
              </Box>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default BillsRow;
