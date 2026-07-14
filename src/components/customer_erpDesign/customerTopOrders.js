import React from 'react';
import CardTemplate from './cardTemplate';
import {Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';

export default function CustomerTopCards(props) {
  const c = useStyles();
  return (
    <>
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
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
                  {props.customerType === 2 ? 'Payable' : 'Receivable'}
            </Typography>

            <Typography variant='h6' align='center'>
              {props.customer_erp_details[0]?.outStanding_count || 0}
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
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
              UnUsed Credits
            </Typography>

            <Typography variant='h6' align='center'>
              {props.customer_erp_details[0]?.unUsed_credits  || 0}
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
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography variant='body1' component='div' align='center' fontSize='12px' fontWeight='bold'>
              CreditDays / CreditLimit
            </Typography>

            <Typography variant='h6' align='center'>
              {`${props.customer_erp_details[0]?.credit_days || 0} / ${
                props.customer_erp_details[0]?.credit_value || 0
              }`}
            </Typography>
          </Card>
        </Box>
      </Grid>
    </Grid>
      {/* {props.customertype !== 0 ?
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.green}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center'>
                  OutStanding Received
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.outStanding_count || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.yellow}
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

          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.red}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='body1' component='div' align='center'>
                  CreditDays / CreditLimit
                </Typography>

                <Typography variant='h6' align='center'>
                  {`${props.customer_erp_details[0]?.credit_days || 0} / ${
                    props.customer_erp_details[0]?.credit_value || 0
                  }`}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid> :
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.green}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography style={{fontSize:14 , fontWeight:'500px' }} component='div' align='center'>
                  Rank
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.outStanding_count || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.yellow}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='h9' component='div' align='center'>
                  Points
                </Typography>

                <Typography variant='h6' align='center'>
                  {props.customer_erp_details[0]?.unUsed_credits  || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
            <Box>
              <Card
                className={c.red}
                variant='outlined'
                sx={{padding: '10px', width: '100%', borderRadius: 2}}
              >
                <Typography variant='h9' component='div' align='center'>
                Last Visit Date & time
                </Typography>

                <Typography variant='h6' align='center'>
                  {`${props.customer_erp_details[0]?.credit_days || 0} / ${
                    props.customer_erp_details[0]?.credit_value || 0
                  }`}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      } */}
    </>
  );
}
