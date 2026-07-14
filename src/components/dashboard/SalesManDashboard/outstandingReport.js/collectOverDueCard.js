import React, { useEffect, useContext, useRef, useState } from 'react';
import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import {  getOverDueToBeCollected } from 'redux/actions/salesMan_action';
import Cards from '../../../dynamicCards/index';
import overdueIcon1 from '../../../../assets/dashboardIcons/overdue.svg';
import apiCalls from 'utils/apiCalls';
import useCommonRef from '../../../../pages/common/home/useCommonRef'
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { number } from 'prop-types';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

function CollectOverDueCard(props) {
    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        commoncookie,
    } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    // const {
    //     salesManReducer: { outstandingReport,overDueToBeCollected },
    // } = useSelector((state) => state);
    // const tempinitsform = useRef(null);
    // const [pollTimer, setPollTimer] = useState(null)
    // const initsform = () => {
    //     apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(
    //             getOverDueToBeCollected(
    //                 commoncookie,
    //                 headerLocationId,
    //                 setModalTypeHandler,
    //                 setLoaderStatusHandler,
    //             ),
    //         )
    //     );
    // };

    // tempinitsform.current = initsform;

    // useEffect(() => {
      

    //     // if (collection > '100') {
    //     //     setStatus('Excellent');
    //     // } else if (collection >= '100') {
    //     //     setStatus('Good');
    //     // } else if (collection >= '80') {
    //     //     setStatus('Attention Required');
    //     // } else if (collection < '80') {
    //     //     setStatus('Alarming');
    //     // }

    //     if (props.inView && props.isEnabled) {
    //         tempinitsform.current();
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
    //         dispatch(
    //             getOverDueToBeCollected(
    //                 commoncookie,
    //                 headerLocationId,
    //                 setModalTypeHandler,
    //                 setLoaderStatusHandler,
    //             ),
    //         )
    //     );
    //   }


    // const tobe_collected_overdue = typeof (overDueToBeCollected.totalOverdue) == number && typeof (overDueToBeCollected.tobe_collected_today) == number ?
    //     overDueToBeCollected.totalOverdue - overDueToBeCollected.tobe_collected_today : 0;
    
    
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
                title='Overdue To be Collected'
                icon={overdueIcon1}
                value={props?.data[0]?.tobe_collected_today || '0.00'}
                currencyIcon={true}
            />
        </div>
    );
}
export default useCommonRef(CollectOverDueCard)
