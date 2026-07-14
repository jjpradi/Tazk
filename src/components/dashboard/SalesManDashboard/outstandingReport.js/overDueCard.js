import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import {  getTotalOverDueReport } from 'redux/actions/salesMan_action';
import Cards from '../../../dynamicCards/index';
import overdueIcon from '../../../../assets/dashboardIcons/overdues.svg';
import apiCalls from 'utils/apiCalls';
import useCommonRef from '../../../../pages/common/home/useCommonRef'
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

function OverDueCard(props) {
    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId
    } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
//     const {
//         salesManReducer: { outstandingReport,totalOverdue },
//     } = useSelector((state) => state);
//     const tempinitsform = useRef(null);
//     const [pollTimer, setPollTimer] = useState(null)


//     const initsform = () => {
//         apiCalls(
//             setModalTypeHandler,
//             setLoaderStatusHandler,
//             dispatch(
//                 getTotalOverDueReport(
//                     commoncookie,
//                     headerLocationId,
//                     setModalTypeHandler,
//                     setLoaderStatusHandler,
//                 ),
//             )
//         );
//     };

//     tempinitsform.current = initsform;

//     useEffect(() => {
//         var totalAmount = outstandingReport.totalAmount;
//         var receivedAmount = outstandingReport.receivedAmount;

//         var collection = (receivedAmount / totalAmount) * 100;

//         // if (collection > '100') {
//         //     setStatus('Excellent');
//         // } else if (collection >= '100') {
//         //     setStatus('Good');
//         // } else if (collection >= '80') {
//         //     setStatus('Attention Required');
//         // } else if (collection < '80') {
//         //     setStatus('Alarming');
//         // }

//         if (props.inView && props.isEnabled) {
//             tempinitsform.current();
//         }
//     }, [props.inView , props.isEnabled]);


//     useEffect(() => {
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
//             dispatch(
//                 getTotalOverDueReport(
//                     commoncookie,
//                     headerLocationId,
//                     setModalTypeHandler,
//                     setLoaderStatusHandler,
//                 ),
//             )
//         );
//       }
// console.log(props.data[0],"props.data[0]");

    return (
        <div 
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
              }}
            style={{width: '100%'}}
        >
            <DashboardTile
                {...props}
                title='Total Overdue'
                icon={overdueIcon}
                value={props?.data[0]?.total_outstanding || '0.00'}
                currencyIcon={true}
            />
        </div>
    );
}
export default useCommonRef(OverDueCard)
