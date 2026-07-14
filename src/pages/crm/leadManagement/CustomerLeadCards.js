
// import CardTemplate from './cardTemplate';
import {Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { convertedLeadsCountAction, totalLeadsAction } from 'redux/actions/leadManagement_actions';

const CustomerLeadCards = (props) => {

  const {
    leadManagementReducers: {getTotalLeads,convertedLeadsCard}
} = useSelector(state => state)
  
  const dispatch = useDispatch()

  
  useEffect(()=>{ (async () => {

    if(props?.customer){
    const payload = {
      customer_id : props.customer?.employee_id
    }
    await dispatch(totalLeadsAction(payload))
    await dispatch(convertedLeadsCountAction(payload))
    }
  })();
},[props?.customer])

  return (
    <div>
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
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2,bgcolor:'rgb(0,128,0,0.8)',color:'white'}}
          >
            <Typography variant='body1' component='div' align='center'>
                  {'No of Leads'}
            </Typography>

            <Typography variant='h6' align='center'>
            {getTotalLeads ? getTotalLeads[0]?.totalLeadsCount : '0'}

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
            // className={c.yellow}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2,bgcolor:'rgb(255, 255, 0,0.8)',color:'black',}}
          >
            <Typography variant='body1' component='div' align='center'>
              {'Leads Value'}
            </Typography>

            <Typography variant='h6' align='center'>
              {getTotalLeads ? getTotalLeads[0]?.value : '0'}

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
            // className={c.green}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2,bgcolor:'	rgb(255, 0, 0,0.8)',color:'white'}}
          >
            <Typography variant='body1' component='div' align='center'>
                  {'Closed Leads'}
            </Typography>

            <Typography variant='h6' align='center'>
                      {convertedLeadsCard && convertedLeadsCard[0]?.closedConverted[0]?.closedConverted || '0'}

 
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
            // className={c.yellow}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2,bgcolor:'rgb(0, 128, 255)',color:'white'}}
          >
            <Typography variant='body1' component='div' align='center'>
              {'No of Converted Leads'}
            </Typography>

            <Typography variant='h6' align='center'>
              {/* {convertedLeadsCard ? convertedLeadsCard[0]?.convertedLeads : '0'} */}
              {convertedLeadsCard && convertedLeadsCard[0]?.convertedLeads[0]?.convertedLeads || '0'}

            </Typography>
          </Card>
        </Box>
      </Grid>

      {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
        <Box>
          <Card
            className={c.red}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography variant='body1' component='div' align='center'>
                {'Leads Value'}
            </Typography>

            <Typography variant='h6' align='center'>
              {'Converted Leads Value'}
            </Typography>
          </Card>
        </Box>
      </Grid> */}
    </Grid>
    </div>
  );
}

export default CustomerLeadCards
