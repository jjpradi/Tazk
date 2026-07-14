import { useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction, lastCheckInCardAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import employeIcon from '../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import vacationIcon from '../../assets/dashboardIcons/vacation.svg'
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { worklogDetailsAction } from 'redux/actions/attendance_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import DashboardTile from 'components/DashboardTile';

function LateCheckCards(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const {
        PayrolldashboardReducers: { lastCheckInCard },
        attendanceReducer: {workDetailsList}
    } = useSelector((state) => state);
    const [pollTimer, setPollTimer] = useState(null)

    const storage = getsessionStorage()

    useEffect(() => {
        if (props.inView && props.isEnabled) {
            if(storage.role_name === "Employee"){
                dispatch(worklogDetailsAction(storage.employee_id))
            }
            // else{
            // apiCalls(
            //     setModalTypeHandler,
            //     setLoaderStatusHandler,
            //     dispatch(lastCheckInCardAction(setLoaderStatusHandler, setModalTypeHandler))
            // )}
        }
    }, [props.inView , props.isEnabled]);

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
            ref = {(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style = {{ width: '100%' }}
        >
            <DashboardTile 
                {...props}
                title = 'Late Check-in'
                icon = {lateIcon}
                value = {storage.role_name === "Employee" ? workDetailsList?.lateLogin || 0 : props?.data[0]?.lastCheckIn || 0}
                currencyIcon = {false}
            />
        </div>
    );
}
export default useCommonRef(LateCheckCards);
