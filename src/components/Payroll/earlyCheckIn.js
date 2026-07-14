import { Box, Card, CardContent, Grid, IconButton, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import {  earlyCheckoutCardAction, employeeCountAction,currentDayCardDetail } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import Cards from 'components/dynamicCards';
import employeIcon from '../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../assets/dashboardIcons/check-in.png';
import vacationIcon from '../../assets/dashboardIcons/vacation.svg'
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import DashboardTile from 'components/DashboardTile';

function earlyCheckIn(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const [pollTimer, setPollTimer] = useState(null)

    const {
        PayrolldashboardReducers: { earlyCheckoutCard ,currentDayCard},
    } = useSelector((state) => state);

//       useEffect(() => {
//         if (props.inView && props.isEnabled) {
//           apiCalls(
//             setModalTypeHandler,
//             setLoaderStatusHandler,
//             dispatch(earlyCheckoutCardAction(setLoaderStatusHandler, setModalTypeHandler)),
//             dispatch(currentDayCardDetail())
//           )
//         }
//       }, [props.inView , props.isEnabled]);
// console.log(currentDayCard,'currentDayCardDetail');
//       useEffect(() => {
//         if (props.inViewport === true) {
//           setTimeout(() => {
//             const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
//             if (props.inViewport === false) {
//               clearTimeout(timer);
//             }
//             dispatch(setDashboardPollingTimerIdsAction(timer));
//             setPollTimer(timer );
//           }, props.DASHBOARD_API_POLL_TIMING);
    
//         } else {
//           clearTimeout(pollTimer);
//         }
    
//         return () => clearTimeout(pollTimer);
        
//       }, [props.inViewport]);
    
//       const pollData = () => {
//         props.pollServer(
//             dispatch(earlyCheckoutCardAction(setLoaderStatusHandler, setModalTypeHandler))
//         );
//       }

    return (
        <div 
            ref = {(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style = {{ width: '100%' }}
        >
            <DashboardTile 
                {...props}
                title = 'Early CheckIn'
                icon = {checkoutIcon}
                value = {props?.data[0]?.earlyCheckIn || 0}
                currencyIcon = {false}
            />
        {/* <Cards sx={{ height: '100%' }}>
        <Grid container display='flex' flexDirection='row' marginLeft='10px'>
        <Grid size={{ lg: 3 }}>
            <img src={checkoutIcon} height={40} width={40} />
            </Grid>

            <Grid size={{ lg: 7 }} padding='0px 0px 0px 15px'>
              <Typography className='card-content'>
                {earlyCheckoutCard?.earlyCheckIn}
              </Typography>
                <Typography className='card-content' >Early CheckIn</Typography>
                </Grid>
                </Grid>

            {
              props.mode === 'edit' ?
                <IconButton
                  aria-label='view code'
                  onClick={() => props.setCardClose()}
                  size='large'
                >
                  {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                </IconButton>
                :
                ''
            }
        </Cards> */}
        </div>
    );
}
export default useCommonRef(earlyCheckIn);
