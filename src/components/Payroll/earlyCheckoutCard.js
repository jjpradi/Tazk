import { useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { earlyCheckoutCardAction, employeeCountAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import employeIcon from '../../assets/dashboardIcons/employees.svg';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../assets/dashboardIcons/check-out.png';
import vacationIcon from '../../assets/dashboardIcons/vacation.svg'
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { worklogDetailsAction } from 'redux/actions/attendance_actions';
import DashboardTile from 'components/DashboardTile';

function EarlyCheckoutCards(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const [pollTimer, setPollTimer] = useState(null)

    const {
        PayrolldashboardReducers: { earlyCheckoutCard },
        attendanceReducer: {workDetailsList}
    } = useSelector((state) => state);

    const storage = getsessionStorage()

      useEffect(() => {
        if (props.inView && props.isEnabled) {
          if(storage.role_name === "Employee"){
            dispatch(worklogDetailsAction(storage.employee_id))
        }
        // else{
        //   apiCalls(
        //     setModalTypeHandler,
        //     setLoaderStatusHandler,
        //     dispatch(earlyCheckoutCardAction(setLoaderStatusHandler, setModalTypeHandler))
        //   )
        // }
        }
      }, [props.inView , props.isEnabled]);

      // useEffect(() => {
      //   if (props.inViewport === true) {
      //     setTimeout(() => {
      //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
      //       if (props.inViewport === false) {
      //         clearTimeout(timer);
      //       }
      //       dispatch(setDashboardPollingTimerIdsAction(timer));
      //       setPollTimer(timer );
      //     }, props.DASHBOARD_API_POLL_TIMING);
    
      //   } else {
      //     clearTimeout(pollTimer);
      //   }
    
      //   return () => clearTimeout(pollTimer);
        
      // }, [props.inViewport]);
    
      // const pollData = () => {
      //   props.pollServer(
      //       dispatch(earlyCheckoutCardAction(setLoaderStatusHandler, setModalTypeHandler))
      //   );
      // }

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
                title = 'Early Checkout'
                icon = {checkoutIcon}
                value = {storage.role_name === "Employee" ? workDetailsList?.earlyCheckout || 0 : props?.data[0]?.earlyCheckOut || 0}
                currencyIcon = {false}
            />
        </div>
    );
}
export default useCommonRef(EarlyCheckoutCards);
