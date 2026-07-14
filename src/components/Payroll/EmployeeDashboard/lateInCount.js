import { Box, Card, CardContent, Grid, IconButton, Typography, useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction, lastCheckInCardAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import Cards from 'components/dynamicCards';
import lateIcon from '../../../assets/dashboardIcons/log-out.svg';
// import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { worklogDetailsAction } from 'redux/actions/attendance_actions';
import { getsessionStorage } from 'pages/common/login/cookies';

function EmployeeLateCheckCards(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const {
        attendanceReducer: {workDetailsList}
    } = useSelector((state) => state);
    const [pollTimer, setPollTimer] = useState(null)

    const storage = getsessionStorage()

    // useEffect(() => {
    //     if (props.inView && props.isEnabled) {
    //         // if(storage.role_name === "Employee"){
    //             dispatch(worklogDetailsAction(storage.employee_id))
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
    //         dispatch(lastCheckInCardAction(setLoaderStatusHandler, setModalTypeHandler))
    //     );
    //   }

    return (
        <div 
        ref={(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
          }}
        style={{width: '100%'}}>
            <Cards sx={{ height: '100%' }}>
                <Box display='flex' height='100%' p='10px' alignItems='center' >
                    <img src={lateIcon} height={40} width={40} />
                    <Box width='100%' pl='15px'>
                        <Typography style={{ fontSize: "13px", fontWeight: 500 , fontFamily:"Poppins"  }}>
                            {props?.data[0]?.late_login_count || 0}
                        </Typography>
                        <Box display='flex' mt='4px' alignItems='center'>
                            <Typography color='rgba(0, 0, 0, 0.7)' fontSize='13px' fontFamily="Poppins" fontWeight="500">Late Check-in</Typography>
                        </Box>
                    </Box>
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
                </Box>
            </Cards>
        </div>
    );
}
export default useCommonRef(EmployeeLateCheckCards);
