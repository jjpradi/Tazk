import { Box, Card, CardContent, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction, empRankScoreListAction, lastCheckInCardAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
// import Card from 'components/dynamicCards';
import lateIcon from '../../../assets/dashboardIcons/log-out.svg';
// import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { worklogDetailsAction } from 'redux/actions/attendance_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useTheme } from '@emotion/react';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PercentIcon from '@mui/icons-material/Percent';
import Divider from '@mui/material/Divider';

function EmployeeRankScoreCard(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    // const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    // const {
    //     PayrolldashboardReducers:{rankScore_list}
    // } = useSelector((state) => state);
    const rankScore_list = props.data
    const [pollTimer, setPollTimer] = useState(null)

    const storage = getsessionStorage()

    const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

    // useEffect(() => {
    //     if (props.inView && props.isEnabled) {
    //             dispatch(empRankScoreListAction(storage.employee_id))
    //     }
    // }, [props.inView , props.isEnabled]);

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
let  work_hours_percentage = isNaN(0.30 * parseInt(rankScore_list[0]?.work_hours_percentage)) ? 0 : 0.30 * parseInt(rankScore_list[0]?.work_hours_percentage)
let  leave_percentage = isNaN(0.30 * parseInt(rankScore_list[0]?.leave_percentage)) ? 0 : 0.30 * parseInt(rankScore_list[0]?.leave_percentage)
let  late_login_percentage = isNaN(0.20 * parseInt(rankScore_list[0]?.late_login_percentage)) ? 0 : 0.20 * parseInt(rankScore_list[0]?.late_login_percentage)
let  early_out_percentage = isNaN(0.20 * parseInt(rankScore_list[0]?.early_out_percentage)) ? 0 : 0.20 * parseInt(rankScore_list[0]?.early_out_percentage)


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
                                  Rank Score-Calculation
                              </Typography>
                          {/* </Box> */}
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}> 
                          <Paper sx={{textAlign: 'center', bgcolor: primaryColor, boxShadow: 8, }}>
                              <MilitaryTechIcon sx={{pt:'2px'}}/>
                              <Typography>
                                  Rank : {rankScore_list[0]?.company_rank}
                              </Typography>
                          </Paper>
                      </Grid>
                      
                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Paper sx={{textAlign: 'center', bgcolor: primaryColor, boxShadow: 8, }}>
                          <PercentIcon sx={{pt:'2px'}}/>
                              <Typography>
                                  Score : {rankScore_list[0]?.overall_percentage}
                              </Typography>
                          </Paper>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '13px' }}>
                              Details
                          </Typography>
                          <Divider sx={{ borderBottomWidth: '3px' }} />
                      </Grid>
                      <Divider orientation="vertical" variant="middle" flexItem />
                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontWeight: '13px' }}>
                              Calculation
                          </Typography>
                          <Divider sx={{ borderBottomWidth: '3px' }}/>
                      </Grid>
                       
                       <Grid
                           size={{
                               lg: 5,
                               md: 5,
                               sm: 5,
                               xs: 6
                           }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                              Late Login
                          </Typography>
                          <Divider/>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                           {rankScore_list[0]?.late_login_percentage ? (20 * rankScore_list[0]?.late_login_percentage)/100 : 0}
                          </Typography>
                          <Divider/>
                      </Grid>
                       
                       <Grid
                           size={{
                               lg: 5,
                               md: 5,
                               sm: 5,
                               xs: 6
                           }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                              Early Out
                          </Typography>
                          <Divider/>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                          {rankScore_list[0]?.early_out_percentage ? (20 * rankScore_list[0]?.early_out_percentage)/100 : 0}
                          </Typography>
                          <Divider/>
                      </Grid>
                       <Grid
                           size={{
                               lg: 5,
                               md: 5,
                               sm: 5,
                               xs: 6
                           }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                              Leave Percentage
                          </Typography>
                          <Divider/>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                          {rankScore_list[0]?.leave_percentage ? (0.30 * rankScore_list[0]?.leave_percentage).toFixed(2)  : 0}
                          </Typography>
                          <Divider/>
                      </Grid>
                       <Grid
                           size={{
                               lg: 5,
                               md: 5,
                               sm: 5,
                               xs: 6
                           }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                              Avg WorkHours 
                          </Typography>
                          <Divider sx={{ borderBottomWidth: '3px' }}/>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                          {rankScore_list[0]?.work_hours_percentage ? (0.30 * parseInt(rankScore_list[0]?.work_hours_percentage)).toFixed(1) : 0}
                          </Typography>
                          <Divider sx={{ borderBottomWidth: '3px' }}/>
                      </Grid>
                       <Grid
                           size={{
                               lg: 5,
                               md: 5,
                               sm: 5,
                               xs: 6
                           }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center' }}>
                             Total
                          </Typography>
                      </Grid>

                      <Grid
                          size={{
                              lg: 5,
                              md: 5,
                              sm: 5,
                              xs: 6
                          }}>
                          <Typography style={{ marginTop: '10px', textAlign: 'center' }}>
                          {(work_hours_percentage + early_out_percentage + late_login_percentage + leave_percentage).toFixed(1)} out of 100
                          </Typography>
                      </Grid>

                      
                  </Grid>
              </Card>
          </div>
      );
}
export default useCommonRef(EmployeeRankScoreCard);
