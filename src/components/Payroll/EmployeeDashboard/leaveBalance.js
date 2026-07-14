import { Box, Card, CardContent, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction, empRankScoreListAction, lastCheckInCardAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
// import Card from 'components/dynamicCards';
import calendarIcon from '../../../assets/dashboardIcons/calendar.png';
// import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { getPaidLeaveBalanceAction, lastSixMonthLeaveAction, worklogDetailsAction } from 'redux/actions/attendance_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useTheme } from '@emotion/react';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PercentIcon from '@mui/icons-material/Percent';
import Divider from '@mui/material/Divider';
import ReactApexChart from 'react-apexcharts';

// import { BarChart } from '@mui/x-charts/BarChart';
// import { axisClasses } from '@mui/x-charts/ChartsAxis';

function LeaveBalanceCard(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    // const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    // const {
    //     attendanceReducer:{lastSixMonthLeaveCount}
    // } = useSelector((state) => state);
    const leaveBalanceEmp = props.data
    const lastSixMonthLeaveCount = props.data.length > 0 ? props.data[0].workLog : []
    const [pollTimer, setPollTimer] = useState(null)

    const storage = getsessionStorage()

    const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

    // useEffect(() => {
    //     if (props.inView && props.isEnabled) {
    //         // if(storage.role_name === "Employee"){
    //             dispatch(getPaidLeaveBalanceAction())
    //             dispatch(lastSixMonthLeaveAction(storage.employee_id))
    //         // }else{
    //         // apiCalls(
    //         //     setModalTypeHandler,
    //         //     setLoaderStatusHandler,
    //         //     dispatch(lastCheckInCardAction(setLoaderStatusHandler, setModalTypeHandler))
    //         // )
    //     // }
    //     }
    // }, [props.inView , props.isEnabled]);

    // useEffect(() => {
    //             dispatch(empRankScoreListAction(storage.employee_id))
         
    // }, []);

    // useEffect(() => {
    //     if (props.inViewport === true) {
    //       setTimeout(() => {
    //         const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
    //         if (props.inViewport === false) {
    //           clearTimeout(timer);
    //         }
    //         dispatch(setDashboardPollingTimerIdsAction(timer));
    //         setPollTimer(timer );
    //       }, props.DASHBOARD_API_POLL_TIMING);
    
    //     } else {
    //       clearTimeout(pollTimer);
    //     }
    
    //     return () => clearTimeout(pollTimer);
        
    //   }, [props.inViewport]);
    
    //   const pollData = () => {
    //     props.pollServer(
    //         dispatch(empRankScoreListAction(setLoaderStatusHandler, setModalTypeHandler))
    //     );
    //   }

      const months = lastSixMonthLeaveCount.map((d) => d.month)
      const no_of_leave = lastSixMonthLeaveCount.map((d) => d.leaveCount)

      console.log("vbvvbbb",leaveBalanceEmp,lastSixMonthLeaveCount);
      
      const options = {
        chart: {
          type: 'bar'
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: months,
        },
      };
    
      const series = [
        {
          data: no_of_leave,
        },
      ];

      return (
          <div
              ref={(el) => {
                  props.ref1(el);
                  props.isVisibleRef.current = el;
              }}
              style={{width: '100%' }}
          >
              {/* <Card sx={{ height: '500px' }}> */}
              <Card sx={{height: '100%', p: 6, margin: 'auto'}}>
                  
                  <Grid container justifyContent='space-between'>
                      <Grid
                          direction='row'
                          justifyContent='center'
                          alignItems='left'
                          style={{ display: 'flex', alignItems: 'center',paddingBottom: '5px' }}
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          {/* <Box> */}
                              <Typography variant='h4' >
                                  Leave Balance
                              </Typography>
                          {/* </Box> */}
                      </Grid>

                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
      <Paper sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', padding: '8px', bgcolor: primaryColor, boxShadow: 8 }}>
          <img src={calendarIcon} height={40} width={40} style={{ marginRight: '10px' }} />
          <Box width='100%'>
              <Typography style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'Poppins', color:'white' }}>
                  Monthly Leave
              </Typography>
                  <Typography color='rgba(0, 0, 0, 0.7)' fontSize='13px' fontFamily='Poppins' fontWeight='500' style={{color:'white' }}>
                      {/* {parseInt(leaveBalanceEmp[0]?.balanceLeave - leaveBalanceEmp[0]?.totalLeave) ? leaveBalanceEmp[0]?.balanceLeave - leaveBalanceEmp[0]?.totalLeave : 0} left of {leaveBalanceEmp[0]?.balanceLeave} */}
                      {storage.role_name === "Employee" ?`${leaveBalanceEmp[0]?.maxPlPerMonth - leaveBalanceEmp[0]?.currentMonthPl} left of ${leaveBalanceEmp[0]?.maxPlPerMonth}` : ''}
                  </Typography>
          </Box>
      </Paper>
  </Grid>

                      
                  </Grid>

                  <Box width={'100%'} height={'100%'} padding={'0px 0px 20px 0px'} >
            <ReactApexChart
              options={options}
              series={series}
              type='bar'
              height='100%'
            />
          </Box>

              </Card>
          </div>
      );
}
export default useCommonRef(LeaveBalanceCard);
