import { Box, Card, CardContent, Grid, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import Cards from 'components/dynamicCards';
import employeIcon from '../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import vacationIcon from '../../assets/dashboardIcons/vacation.svg'
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';

export default function PayrollCards(props) {
  const dispatch = useDispatch();
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
  const {
    PayrolldashboardReducers: { employeeCount },
  } = useSelector((state) => state);

  useEffect(() => {
    if (props.inView) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(employeeCountAction(setLoaderStatusHandler, setModalTypeHandler))
      );
    }
  }, [props.inView]);
  return (
    <>
      <Grid
       container
       direction='row'
       spacing={3}
         style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
         }}
       >
         <Grid
           size={{
             lg: 3,
             md: 3,
             sm: 6,
             xs: 12
           }}>
           <Card >
             <CardContent>
             <Grid container display='flex' flexDirection='row' >
             <Grid size={{
               lg: 2
             }}>
               <img src={employeIcon} height={60} width={50} />
             </Grid>
             <Grid paddingLeft={5}>            
                 <Typography variant='h6'>{employeeCount.empCount}</Typography>
                 <Typography  variant='h9'  color='textSecondary'>{'Employee'}</Typography>
               </Grid>
               </Grid>
             </CardContent>
           </Card>
         </Grid>

         <Grid
           size={{
             lg: 3,
             md: 3,
             sm: 6,
             xs: 12
           }}>
           <Card >
             <CardContent>
               <Grid container display='flex' flexDirection='row' >
                 <Grid size={{
                   lg: 2
                 }}>
                 <img src={lateIcon} height={60} width={50} />
                 </Grid>
                 <Grid paddingLeft={5}>
                 <Typography variant='h6'>{employeeCount.lateCheckIn}</Typography>
                 <Typography variant='h9'  color='textSecondary'>Late Check-in</Typography>
                 </Grid>
               </Grid>
             </CardContent>
           </Card>
         </Grid>

         <Grid
           size={{
             lg: 3,
             md: 3,
             sm: 6,
             xs: 12
           }}>
           <Card  >
             <CardContent>
               <Grid container display='flex' flexDirection='row'>
               <Grid size={{
                 lg: 2
               }}>
               <img src={checkoutIcon} height={60} width={50} />
               </Grid>
               <Grid paddingLeft={5}>
               <Typography variant='h6'  >{employeeCount.earlyCheckOut}</Typography>
                 <Typography variant='h9'  color='textSecondary'>Early Checkout</Typography>
               </Grid>
               </Grid>
             </CardContent>
           </Card>
         </Grid>
         <Grid
           size={{
             lg: 3,
             md: 3,
             sm: 6,
             xs: 12
           }}>
           <Card >
             <CardContent>
               <Grid container display='flex' flexDirection='row'>
                 <Grid size={{
                   lg: 2
                 }}>
                 <img src={vacationIcon} height={50} width={40} />
                 </Grid>
                 <Grid paddingLeft={5}>
                 <Typography variant='h6' >{employeeCount.TotalHolidays}</Typography>
                 <Typography variant='h9' color='textSecondary'>Holidays</Typography>
                 </Grid>
               </Grid>
             </CardContent>
           </Card>
         </Grid>
       </Grid>
      {/* <Grid container>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Grid container direction='row' spacing={1} >
            <Cards
            >
              <Grid container display='flex' >
                <Grid paddingLeft={3}>
                  <img src={employeIcon} height={70} width={50} />
                </Grid>
                <Grid  padding='15px 0px 0px 15px' >
                  <Typography style={{fontSize:"18px",fontWeight:500}}>{employeeCount.empCount}</Typography>
                  <Typography color='textSecondary'>{'Employee'}</Typography>
                </Grid>
              </Grid>
            </Cards>
            <Cards

            >
              <Grid container display='flex' >
                <Grid paddingLeft={3}>
                  <img src={lateIcon} height={70} width={50} />
                </Grid>
                <Grid   padding='15px 0px 0px 15px'>
                  <Typography style={{fontSize:"18px",fontWeight:500}}>{employeeCount.lastCheckIn}</Typography>
                  <Typography color='textSecondary'>Late Check-in</Typography>
                </Grid>
              </Grid>
            </Cards>
            <Cards

            >
              <Grid container display='flex' >
                <Grid paddingLeft={3}>
                  <img src={checkoutIcon} height={70} width={50} />
                </Grid>
                <Grid   padding='15px 0px 0px 15px'>
                  <Typography style={{fontSize:"18px",fontWeight:500}}>{employeeCount.earlyCheckout}</Typography>
                  <Typography color='textSecondary'>Early Checkout</Typography>
                </Grid>
              </Grid>
            </Cards>
            <Cards
              sx={{ borderRadius: 1, backgroundColor: '#F7A00F', color: 'white' }}
            >
              <Grid container display='flex' >
                <Grid paddingLeft={3}>
                  <img src={vacationIcon} height={70} width={50} />
                </Grid>
                <Grid  padding='15px 0px 0px 15px' >
                  <Typography style={{fontSize:"18px",fontWeight:500}}>{employeeCount.holidays}</Typography>
                  <Typography color='textSecondary'>Holidays</Typography>
                </Grid>
              </Grid>
            </Cards>
          </Grid>
        </Grid>
      </Grid> */}
    </>
  );
}
