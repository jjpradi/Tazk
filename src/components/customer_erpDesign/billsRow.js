import React from 'react';
import {Grid, Typography} from '@mui/material';
import CardTemplate from './cardTemplate';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import useStyles from './cardStyles';

function BillsRow(props) {
  const c = useStyles();
  return (
    <>
      {props.customertype !== 0 ?
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              lg: 3,
              md: 3,
              sm: 3
            }}>
            <Box>
              <Card
                className={c.blue}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
                  Total Bills
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.invoice_count || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 3,
              md: 3,
              sm: 3
            }}>
            <Box>
              <Card
                className={c.ash}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
                  Unpaid Bills
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.unpaid_invoice || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 3,
              md: 3,
              sm: 3
            }}>
            <Box>
              <Card
                className={c.black}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
                  Average Credit Days
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.avgCreditDays || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 3,
              md: 3,
              sm: 3
            }}>
            <Box>
              <Card
                className={c.lav}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
                  Average Billing Cycle
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.avgBilling_cycle || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid> :
        <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            lg: 6,
            md: 6,
            sm: 6
          }}>
          <Box>
            <Card
              className={c.blue}
              variant='outlined'
              sx={{padding: '10px', width: '100%', borderRadius: 2}}
            >
              <Typography variant='body1' component='div' align='center'>
                Total Bills
              </Typography>

              <Typography variant='h6' align='center'>
                {props.customer_erp_details[0]?.invoice_count || 0}
              </Typography>
            </Card>
          </Box>
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 6,
            md: 6,
            sm: 6
          }}>
            <Box>
              <Card
                className={c.lav}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center'>
                  UnUsed Credits
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.unUsed_credits  || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>

      </Grid>
      }
    </>
  );
}

export default BillsRow;
