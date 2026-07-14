import { useMediaQuery } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import {  earlyCheckoutCardAction, employeeCountAction,currentDayCardDetail } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import lateIcon from '../../assets/dashboardIcons/due-dates.svg';
import checkoutIcon from '../../assets/dashboardIcons/log-out.svg';
import vacationIcon from '../../assets/dashboardIcons/vacation.svg'
import useCommonRef from 'pages/common/home/useCommonRef';
import employeIcon from '../../assets/dashboardIcons/absent.png';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import DashboardTile from 'components/DashboardTile';

function absentCard(props) {
    const dispatch = useDispatch();
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const screen = useMediaQuery((theme) => theme.breakpoints.up("2560"));
    const [pollTimer, setPollTimer] = useState(null)

    const {
        PayrolldashboardReducers: {  currentDayCard},
    } = useSelector((state) => state);

    //   useEffect(() => {
    //       apiCalls(
    //         dispatch(currentDayCardDetail(setLoaderStatusHandler, setModalTypeHandler))
    //       )
    //   }, []);
    
console.log(props,"gfdgfd");

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
                title = 'No of Absent'
                icon = {employeIcon}
                value = {props?.data[0]?.absent_count || 0}
                currencyIcon = {false}
            />
        </div>
    )
}
export default useCommonRef(absentCard);
