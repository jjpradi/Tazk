import React, { useContext, useEffect, useRef, useState } from 'react'
import { Grid, IconButton, Tooltip, Card, Button, Typography, Box } from '@mui/material'
import { List_Aging_payable, List_Aging_receivables } from '../../../redux/actions/totAcc_actions';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ReactApexChart from 'react-apexcharts'
import { connect, useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import TotalReceivables from './totalReceivables';
import {clientwebsocket } from '../../../http-common'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import apiCalls from 'utils/apiCalls';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';



const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

function Receivables(props) {
  const dispatch = useDispatch();
  const [chartData] = useState({
    current: [],
    series: [{
      name: 'Accounts Payables',
      data: []
    }, {
      name: 'Accounts Receivables',
      data: []
    },
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%', 
          endingShape: 'rounded',
          distributed: true,
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        },
      },
      colors: ['#1E90FF', '#FF7F50'],
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '7px',
          colors: ["black"],
          fontWeight: "normal"
        },
        formatter: function (val) {
          return Math.floor(val);
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Current', '1-30', '31-60', '61-90', '91+'],
      },
      yaxis: {
        categories: ['M', '1M', '2M', '3M', '4M']
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "₹ " + Math.floor(val)
          }
        
        }
      }
    },
  })

  const ref1 = useRef(null)
  const [pollTimer, setPollTimer] = useState(null)

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId
  } = useContext(CreateNewButtonContext);

  // const { TotAccReducer: { payable_receivable, aging_receivable, aging_payable } } = useSelector(state => state)
const {payableAging, receivableAging} = props.data?.[0] || {}

  // const func1 = () => {
  //   if (props.inView && props.isEnabled) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(List_Aging_receivables(headerLocationId)),
  //       dispatch(List_Aging_payable(headerLocationId))
  //     )
  //   }

  // }

  // useEffect(() => {
  //   if (props.isEnabled && aging_receivable.length === 0 && aging_payable.length === 0) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(List_Aging_receivables(headerLocationId)),
  //       dispatch(List_Aging_payable(headerLocationId))
  //     )
  //   }
  // }, [props.isEnabled])
  

  // ref1.current = func1
  // useEffect(() => {
  //   ref1.current();
  //   // clientwebsocket.socket.onmessage = async (message) => {
  //   //   let { event } = JSON.parse(message.data)
  //   //   if (event === 'purchases') {
  //   //     dispatch(List_Aging_payable(setModalTypeHandler))
  //   //   }
  //   //   if (event === 'sales') {
  //   //     dispatch(List_Aging_receivables(setModalTypeHandler))
  //   //   }
  //   // }
  // }, [props.inView, headerLocationId])

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
  //     dispatch(List_Aging_receivables(headerLocationId)),
  //     dispatch(List_Aging_payable(headerLocationId))
  //   );
  // }

  return (
    <div 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    style={{width:'100%',height:'100%'}}>
      <Grid
        width='100%'
        height='100%'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        {/* <Grid container>
          <Grid size={{ lg: 12 }}>
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
              Total Account Payable and Receivable Dashboard
            </h2>
          </Grid>
        </Grid> */}
        <Card variant="outlined" style={{ width: '100%', height: '100%', backgroundColor: 'white' }} >
          <Grid container spacing={2} style={{ padding : '15px', paddingTop : '11px'}}>
            <Grid
              backgroundColor='white'
              size={{
                xs: 10,
                md: 11,
                lg: 11.3,
                sm: 11
              }}>

            <List sx={style} component="nav" aria-label="mailbox folders">
              <Typography className='dashboard-card-title' variant='h6'>
                  Total Accounts Receivables vs Payables Aging
                </Typography>
              </List>
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
                    {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
                </IconButton>
                :
                ''
              }
            </Grid>

            <Divider />

            <Grid
              size={{
                xs: 12,
                md: 12,
                lg: 12,
                sm: 12
              }}>
              <div id="chart" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <ReactApexChart 
                    options={{
                      ...chartData.options,
                      colors: ['#1E90FF', '#FF7F50'], 
                      plotOptions: {
                        ...chartData.options.plotOptions,
                        bar: {
                          ...chartData.options.plotOptions.bar,
                          distributed: false 
                        }
                      }
                    }}
                
                series={[{
                  name: 'Accounts Payables',
                  data: payableAging ? [...payableAging] : [0,0,0,0,0]
                }, {
                  name: 'Accounts Receivables',
                  data: receivableAging ? [...receivableAging] : [0,0,0,0,0]
                },
                ]} type="bar" height={330} />
              </div>
            </Grid>
          </Grid>
        </Card >
      </Grid>
    </div>
  );
}
export default useCommonRef(Receivables);



