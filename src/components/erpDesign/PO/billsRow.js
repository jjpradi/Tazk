import React from 'react';
import {Grid, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import {Divider} from '@mui/material';
import { commonDateFormat } from 'utils/getTimeFormat';

function BillsRow({recevingData, pathnameType, billsData}) {
  const theme = useTheme();
  return (
    <>
      {recevingData &&
        <Grid container spacing={2}>
          <Grid display='flex' size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card
              variant='outlined'
              sx={{
                padding: '12px 10px', width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-evenly', borderRadius: '6px',
                bgcolor: `${theme.palette.primary.main}0A`, borderColor: `${theme.palette.primary.main}30`,
              }}
            >
              <Grid>
                <Box width='100%'>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                    PO Created by
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>
                    {billsData?.[0]?.username || recevingData?.timeLine_data?.[0]?.username || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Divider orientation='vertical' flexItem />
              <Grid>
                <Box width='100%'>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                    PO Created on
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>
                    {pathnameType === '/sales/bills' ? recevingData?.billed_on || '-' : commonDateFormat(recevingData?.receiving_time) || '-'}
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
                    {recevingData.invoice_date !== null ? commonDateFormat(recevingData?.invoice_date) : "Didn't yet billed"}
                  </Typography>
                </Box>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      }
    </>
  );
}

export default BillsRow;
