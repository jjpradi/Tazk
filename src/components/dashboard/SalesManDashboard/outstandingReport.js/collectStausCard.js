import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import { getCollectionStatus, getOutstandingReportAction } from 'redux/actions/salesMan_action';
import Cards from '../../../dynamicCards/index';
import statusIcon from '../../../../assets/dashboardIcons/payment-check.svg';
import apiCalls from 'utils/apiCalls';
import useCommonRef from '../../../../pages/common/home/useCommonRef'
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

function CollectStatusCard(props) {
    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId
    } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    // const {
    //     salesManReducer: { outstandingReport,collectionStatus },
    // } = useSelector((state) => state);
    const tempinitsform = useRef(null);
    const [pollTimer, setPollTimer] = useState(null)

    const [status, setStatus] = useState('');

    // const initsform = () => {
    //     apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(
    //             getCollectionStatus(
    //                 commoncookie,
    //                 headerLocationId,
    //                 setModalTypeHandler,
    //                 setLoaderStatusHandler,
    //             ),
    //         )
    //     );
    // };

    // tempinitsform.current = initsform;

    useEffect(() => {
        var totalAmount = props?.data[0]?.total || 0;
        var receivedAmount = props?.data[0]?.received_amount || 0;

        let collection = 0;
        if (totalAmount > 0) {
            collection = (receivedAmount / totalAmount) * 100;
        }

        if (collection > '100') {
            setStatus('Excellent');
        } else if (collection >= '100') {
            setStatus('Good');
        } else if (collection >= '80') {
            setStatus('Attention Required');
        } else if (collection < '80') {
            setStatus('Alarming');
        }

        // if (props.inView && props.isEnabled) {
        //     tempinitsform.current();
        // }
    }, [props.inView , props.isEnabled, props?.data[0]?.total, props?.data[0]?.received_amount]);

//     useEffect(() => {
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
//             getCollectionStatus(
//                 commoncookie,
//                 headerLocationId,
//                 setModalTypeHandler,
//                 setLoaderStatusHandler,
//             ),
//         )
//     );
//   }

    return (
        <>
            <div 
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
              }}
            style={{width: '100%'}}>
                <DashboardTile
              {...props}
              title='Collection Status'
              icon={statusIcon}
              value= {status || '-'}
              currencyIcon={false}
            />
                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} width='100%'>
                        <Grid
                        container
                        direction='row'
                        > */}
                         {/* <Grid size={{ lg: 12 }}>
                            <h2
                            style={{
                                textAlign: 'left',
                                fontWeight: '700',
                                fontSize: 16,
                                textTransform: 'uppercase',
                                paddingLeft: '10px',
                                color: 'black'
                            }}
                            >
                            OUTSTANDING REPORT DASHBOARD
                            </h2>
                        </Grid> */}

                        {/* </Grid>

                    <Card style={{ display: 'flex', alignItems: 'center',width: '100%' }}>
                        <CardContent style={{  display: "contents", justifyContent: "center", flexDirection: "column" }}>
                            <Grid container display='flex' flexDirection='row' marginLeft='10px'>
                                <Grid size={{ lg: 2 }}>
                                <img src={statusIcon} height={60} width={40} />
                                </Grid>
                                <Grid size={{ lg: 8 }} padding='5px 0px 0px 10px'>
                                    <Typography className='dashboard-chart-content' 
                                    style={{ fontSize: font14_500.fontSize, fontWeight: font14_500.fontWeight }}
                                    color={
                                        (status === 'Alarming' && 'red') ||
                                        (status === 'Attention Required' && 'orangered') ||
                                        (status === 'Good' && 'grey') ||
                                        (status === 'Excellent' && 'green')
                                    }
                                    >
                                        <span >
                                        {status === '' ? "-" : status}
                                        </span>
                                    </Typography>
                                    <Typography className='dashboard-chart-content' style={{ paddingLeft: '10px' }}> <span >Collection status</span></Typography>
                                </Grid>
                                <Grid size={{ lg: 2 }}>
                                    {
                                        props.mode === 'edit' ?
                                        <IconButton
                                            aria-label='view code'
                                            onClick={() => props.setCardClose()}
                                            size='large'
                                            >
                                            {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
                                        </IconButton>
                                        :
                                        ''
                                    }
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    </Grid> */}
            </div>
        </>
    );
}
export default useCommonRef(CollectStatusCard)
