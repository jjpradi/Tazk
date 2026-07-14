import React from 'react';
import {Grid, Typography, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

function StatusCard({recevingData}) {
  const theme = useTheme();
  return (
    <>
      {recevingData &&
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Box>
              <Card
                variant='outlined'
                sx={{
                  padding: '10px', width: '100%', borderRadius: '6px',
                  bgcolor: `${theme.palette.info.main}10`, borderColor: `${theme.palette.info.main}40`,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>
                  Status
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.palette.info.main }} align='center'>
                  {recevingData?.status || ''}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      }
    </>
  );
}

export default StatusCard;
