import { Box, Card, Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import { LinearProgress } from '@mui/material';
import ProgressBar from "./progressBar"
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useCommonRef from 'pages/common/home/useCommonRef';
import { getTotAccDetails, List_Aging_payable, List_Aging_receivables, totalPayableAction } from 'redux/actions/totAcc_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { clientwebsocket } from '../../../http-common'
import { List } from 'react-content-loader';


function TotalPayables(props) {
  // const [color, setColor] = useState({ green: "#ff937d", orange: "#8df2a9" })
  // const [pollTimer, setPollTimer] = useState(null)

  // const ref2 = useRef(null)

  // const {
  //   setModalTypeHandler,
  //   setLoaderStatusHandler,
  //   headerLocationId
  // } = useContext(CreateNewButtonContext);

  // const dispatch = useDispatch();

  // const { TotAccReducer: { payable_receivable, totalPayable, aging_receivable, aging_payable } } = useSelector(state => state)
  // // const {data} = props
  // const func1 = () => {
  //   if (props.inView && props.isEnabled) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       // dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
  //       dispatch(totalPayableAction(headerLocationId)),
  //       dispatch(List_Aging_receivables(headerLocationId)),
  //       dispatch(List_Aging_payable(headerLocationId))
  //     )
  //     // dispatch(List_Aging_receivables(setModalTypeHandler, setLoaderStatusHandler))
  //     // dispatch(List_Aging_payable(setModalTypeHandler, setLoaderStatusHandler))
  //   }

  // }

  // // useEffect(() => {
  // //   if(props.inView && total_payables.length === 0){
  // //     apiCalls(
  // //       setModalTypeHandler,
  // //       setLoaderStatusHandler,
  // //       // dispatch(getTotAccDetails(setModalTypeHandler, setLoaderStatusHandler)),
  // //       dispatch(totalPayableAction())
  // //     )
  // //     // dispatch(List_Aging_receivables(setModalTypeHandler, setLoaderStatusHandler))
  // //     // dispatch(List_Aging_payable(setModalTypeHandler, setLoaderStatusHandler))
  // //   }
  // // },[props.isEnabled])


  // ref2.current = func1
  // useEffect(() => {
  //   ref2.current();
  //   // clientwebsocket.socket.onmessage = async (message) => {
  //   //   let { event } = JSON.parse(message.data)
  //   //   if (event === 'purchases') {
  //   //     // dispatch(getTotAccDetails(setModalTypeHandler))
  //   //     dispatch(totalPayableAction())
  //   //     // dispatch(List_Aging_payable(setModalTypeHandler))
  //   //   }
  //   //   if (event === 'sales') {
  //   //     // dispatch(getTotAccDetails(setModalTypeHandler))
  //   //     dispatch(totalPayableAction())
  //   //     // dispatch(List_Aging_receivables(setModalTypeHandler))
  //   //   }
  //   // }
  // }, [props.inView, props.isEnabled, headerLocationId])

  // let total_payables = totalPayable?.overAllPayable ? totalPayable.overAllPayable[0]?.payablesTotal : ''
  // let total_payables_due = totalPayable?.totalPayable ? totalPayable.totalPayable[0]?.payablesDueRecord : ''
  // let payablesOverDue = totalPayable?.payablesOverdue ? totalPayable.payablesOverdue[0]?.OverDueAmount : ''

  // let total = total_payables_due + payablesOverDue
  // let percentageCurrent = (total_payables_due / total) * 100
  // let percentageOverDue = (payablesOverDue / total) * 100


  // const testData = [
  //   { bgcolor: color.orange, completed: percentageCurrent.toFixed(1) },//


  // ];
  // useEffect(() => {
  //   if (props.inViewport === true) {
  //     setTimeout(() => {
  //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
  //       if (props.inViewport === false) {
  //         clearTimeout(timer);
  //       }
  //       dispatch(setDashboardPollingTimerIdsAction(timer));
  //       setPollTimer(timer);
  //     }, props.DASHBOARD_API_POLL_TIMING);

  //   } else {
  //     clearTimeout(pollTimer);
  //   }

  //   return () => clearTimeout(pollTimer);

  // }, [props.inViewport]);

  // const pollData = () => {
  //   props.pollServer(
  //     dispatch(totalPayableAction(headerLocationId))
  //   );
  // }
  // const style = {
  //   width: '100%',
  //   maxWidth: 360,
  //   bgcolor: 'background.paper',
  // };
  return (
    // <div ref={props.ref1} style={{width: '100%'}}>
    // </div>
    <Card
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{ width: '100%', height: '100%' }}>
      <Grid
        width='100%'
        height='100%'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Card variant="outlined" style={{ width: '100%', height: '100%', backgroundColor: 'white' }} >
          <Grid container style={{ padding : '18px', paddingTop : '12px' }}>
            <Grid
              backgroundColor='white'
              size={{
                xs: 10,
                md: 11,
                lg: 11.3,
                sm: 11
              }}>
              {/* <List sx={style} component="nav" aria-label="mailbox folders"> */}
              <Typography className='dashboard-card-title' variant='h6'>
                Total Payables
              </Typography>
              {/* </List> */}
            </Grid>
            <Grid
              sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
              size={{
                xs: 2,
                md: 1,
                sm: 1,
                lg: 0.7
              }}>
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
            </Grid>
            </Grid>
            {/* <Divider /> */}
            <Grid
              size={{
                xs: 10,
                md: 11,
                lg: 11,
                sm: 11
              }}>
              <div style={{ display: 'flex', alignItems: 'start', marginLeft : '18px', paddingBottom : '5px' }}>
                <Typography className='dashboard-card-title' variant='h6'>
                  Total Payable: {props?.data[0]?.receivableAging[0] || 0 + props?.data[0]?.receivableAging[1] || 0 + props?.data[0]?.receivableAging[2] || 0 + props?.data[0]?.receivableAging[3] || 0 + props?.data[0]?.receivableAging[4] || 0}
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding : '20px' }}>
                {props?.data[0]?.receivableAging.map((value, index) => {
                  const totalPayable = props?.data[0]?.receivableAging.reduce((acc, val) => acc + val, 0);
                  const percentage = totalPayable === 0 ? 0 : (value / totalPayable) * 100;
                  const colors = ['lightgreen', 'orange', 'darkorange', 'brown', 'darkred'];
                  const barWidth= percentage > 0 && percentage < 15 ? 15 : percentage;
                  console.log(percentage, 'percentage');
                  return (


                    <div
                      key={index}
                      style={{
                        width: `${barWidth}%`,
                        height: 10,
                        backgroundColor: colors[index] || 'gray',
                        position: 'relative',

                      }}
                    >
                      {/* Labels over the bars */}
                      <div
                        style={{
                          position: 'absolute',
                          // top: '15px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textAlign: 'center',
                          //color: 'black',

                        }}
                      >
                        {index === 0 && props?.data[0]?.receivableAging[0] > 0 &&
                          <div>
                            <p className='dashboard-card-title'>Current</p>
                            <p className='dashboard-card-title'>{props?.data[0]?.receivableAging[0]}</p>
                          </div>
                        }
                        {index === 1 && props?.data[0]?.receivableAging[1] > 0 && <div>
                          <p className='dashboard-card-title'>Overdue</p>
                          <p className='dashboard-card-title'>{props?.data[0]?.receivableAging[1]}</p>
                          <p className='dashboard-card-title'>1-15 days</p>
                        </div>}
                        {index === 2 && props?.data[0]?.receivableAging[2] > 0 &&
                          <div>
                            <p className='dashboard-card-title'>{props?.data[0]?.receivableAging[2]}</p>
                            <p className='dashboard-card-title'>16-30 days</p>
                          </div>}
                        {index === 3 && props?.data[0]?.receivableAging[3] > 0 && <div>
                          <p className='dashboard-card-title'>{props?.data[0]?.receivableAging[3]}</p>
                          <p className='dashboard-card-title'>31-45 days</p>
                        </div>}
                        {index === 4 && props?.data[0]?.receivableAging[4] > 0 && <div>
                          <p className='dashboard-card-title'>{props?.data[0]?.receivableAging[4]}</p>
                          <p className='dashboard-card-title'>Above 45 days</p>
                        </div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Grid>

          
        </Card >
      </Grid >
    </Card >
  );
}

export default useCommonRef(TotalPayables);
