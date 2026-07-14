import {
  Card,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { totalSaleByLocationAction } from 'redux/actions/pos_sale_actions';
import _ from 'lodash';
import ReactApexChart from 'react-apexcharts';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import {clientwebsocket } from '../../../http-common'


const AreaWiseSale = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const [pollTimer, setPollTimer] = useState(null)
  const [data, setData] = useState([])
  const {
    posSaleReducer: { totalSaleByLocation },
  } = useSelector((state) => state);

  useEffect(() => {
    // if (props.inView && props.isEnabled) {
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   dispatch(totalSaleByLocationAction(month, year, setModalTypeHandler, setLoaderStatusHandler))
      // );
      setData(props.data.length > 0 ? props.data?.[0].data : [])
      generateLastTwelveMonth();

    // }
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'sales') {
    //     apiCalls(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       dispatch(totalSaleByLocationAction(month, year, setModalTypeHandler))
    //     );
    //     generateLastTwelveMonth();
    //   }
    // }
  }, []);

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
  //     dispatch(totalSaleByLocationAction(month, year, setModalTypeHandler, setLoaderStatusHandler))
  //   );
  //   generateLastTwelveMonth();
  // }

  const generateLastTwelveMonth = () => {
    let tempArr = [];
    let monthName = new Array(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    );
    let d = new Date();
    d.setDate(1);
    for (let i = 0; i <= 11; i++) {
      let tempObj = {};
      tempObj.name = monthName[d.getMonth()] + ' ' + d.getFullYear();
      tempObj.month = d.getMonth() + 1;
      tempObj.year = d.getFullYear();
      tempArr.push(tempObj);
      d.setMonth(d.getMonth() - 1);
    }
    setMonthList(tempArr);
  };

  const handleChange = (val) => {
    const tempMonth = _.find(monthList, ['month', val]).month;
    const tempYear = _.find(monthList, ['month', val]).year;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(totalSaleByLocationAction(tempMonth, tempYear, setModalTypeHandler, setLoaderStatusHandler, (response) => {
        if(response.status === 200) {          
          setData(response.data)
        }
      }))
    );
  };

  return (
    <div 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    style={{ width: '100%',height: '100%' }}>
      <Card variant='outlined' style={{ width: '100%',height: '100%' }}>
        {/* top container */}
        {/* Brand sales  */}
        <Grid container
          style={{
            display: 'flex',
            alignItems: "center",
            padding : '18px',
            paddingTop : props.mode === 'edit' ? '0px' : '10px'
          }}
        >
          <Grid>
          <Typography variant='h6'>
              Top Sale by Location
            </Typography>
          </Grid>
          <Grid
            style={{
              marginLeft : 'auto',
              minWidth : '150px'
            }}>
            <FormControl fullWidth
              sx = {{
                '& .MuiOutlinedInput-root': {
                  borderRadius : '10px !important',
                  backgroundColor : '#f7f7f7 !important',
                  color : '#808080',
                  height : '25px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: "none !important"
                },
                '& .MuiMenuItem-root' : {
                  color : 'none !important'
                }
              }}
            >
              <Select
                size='small'
                fullWidth={true}
                value={month}
                label='SelectMonth'
                onChange={(e) => {
                  setMonth(e.target.value);
                  handleChange(e.target.value);
                }}
              >
                {monthList.length > 0 ? (
                  monthList.map((item) => {
                    return (
                      <MenuItem key={item.name} value={item.month}>
                        {item.name}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem value={new Date().getMonth() + 1}></MenuItem>
                )}
              </Select>
            </FormControl>
            </Grid>

            <Grid
              sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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

          <Grid
            style={{
              // display: 'flex',
              // alignItems: 'center',
              // marginTop: '17%',
              // justifyContent: "center"
            }}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {data.length > 0 ? (
              <ReactApexChart
                options={{
                  chart: {
                    // width:'100%',
                    type: 'pie',
                  },
                  height: 300,
                  labels: _.map(data, 'location_name'),
                  responsive: [
                    {
                      breakpoint: 1400,
                      options: {
                        chart: {
                          width: '100%',
                          height: 325
                        },
                        legend: {
                          position: 'bottom',
                          // align: 'left'
                        },
                      },
                    },
                    {
                      breakpoint: 2100,
                      options: {
                        chart: {
                          width: '100%',
                          height: 330
                        },
                        legend: {
                          position: 'bottom',
                          // align: 'left'
                        },
                      },
                    },
                    {
                      breakpoint: 7000,
                      options: {
                        chart: {
                          width: '100%',
                          height: 290
                        },
                        legend: {
                          position: 'right',
                          // align: 'left'
                        },
                      },
                    },
                    {
                      breakpoint: 10000,
                      options: {
                        chart: {
                          width: '100%',
                          height: 290
                        },
                        legend: {
                          position: 'right',
                          // align: 'left'
                        },
                      },
                    },
                  ],
                }}
                series={_.map(data, 'total')}
                type='pie'
              // width={'400px'}
              />
            ) : (
              <Grid
                container
                display='flex'
                justifyContent='center'
                alignItems='center'
                height={300}
              >
                <Grid>
                  <NoRecordFound />
                </Grid>
              </Grid>
            )}
          </Grid>
    </Card>
    </div >
  );
};

export default useCommonRef(AreaWiseSale);
