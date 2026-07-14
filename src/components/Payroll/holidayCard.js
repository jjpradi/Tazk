import { useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import { employeeCountAction, holidaysCardAction } from 'redux/actions/payrollDashboard_actions';
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
import DashboardTile from 'components/DashboardTile';

function HolidayCards(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const {
        PayrolldashboardReducers: { holidaysCard },
    } = useSelector((state) => state);
    const [pollTimer, setPollTimer] = useState(null)

      // useEffect(() => {
      //   if (props.inView && props.isEnabled) {
      //     apiCalls(
      //       setModalTypeHandler,
      //       setLoaderStatusHandler,
      //       dispatch(holidaysCardAction(setLoaderStatusHandler, setModalTypeHandler))
      //     )
      //   }
      // }, [props.inView , props.isEnabled]);

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
      //       dispatch(holidaysCardAction(setLoaderStatusHandler, setModalTypeHandler))
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
                title = 'Holidays'
                icon = {vacationIcon}
                value = {props?.data[0]?.holidayCount || 0}
                currencyIcon = {false}
            />        
        </div>
    );
}
export default useCommonRef(HolidayCards);
