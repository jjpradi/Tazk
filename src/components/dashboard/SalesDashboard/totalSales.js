import React, {useState, useEffect, useContext} from 'react';
import {
  Grid,
  Card,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  IconButton,
} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReactApexChart from 'react-apexcharts';
import {useDispatch, useSelector} from 'react-redux';
import {getTotalSaleLocationBarAction, totalSaleByMonthAction} from 'redux/actions/pos_sale_actions';
import _ from 'lodash';
import {clientwebsocket } from '../../../http-common'
import { listInventoryByIdAction } from '../../../redux/actions/inventory_actions';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};



const TotalSales = (props) => {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const [pollTimer, setPollTimer] = useState(null)
  const [datas, setDatas] = useState([])

  const {
    posSaleReducer: {totalSaleByMonth,totalSaleLocationBar},
  } = useSelector((state) => state);

  const data = {
    product_name: '',
    brand: '',
    category: '',
    max_price: '',
    gb:'',
    min_price: '',
    location_id: headerLocationId,
    user_id: commoncookie,
    pageCount: 0,
    numPerPage:10,
  };
  useEffect(() => {
    // if(props.inView &&  props.isEnabled){
    //   let storage = getsessionStorage()
    //  const employeeId = storage?.employee_id || null
    //   apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(getTotalSaleLocationBarAction(month, year, setModalTypeHandler, setLoaderStatusHandler)),
    //   );
      setDatas(props.data.length > 0 ? props.data[0].data : [])
      generateLastTwelveMonth();
    // }
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'sales') {
    //     generateLastTwelveMonth();
    //     let storage = getsessionStorage()
    //     const employeeId = storage?.employee_id || null
    //     apiCalls(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       dispatch(getTotalSaleLocationBarAction(month, year, setModalTypeHandler)),
    //       dispatch(listInventoryByIdAction(data,employeeId,
    //         headerLocationId,
    //         setModalStatusHandler,
    //         setModalTypeHandler,))
    //     );
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
  //     dispatch(getTotalSaleLocationBarAction(month, year, setModalTypeHandler, setLoaderStatusHandler)),
  //   );
  //   generateLastTwelveMonth();

  // }

  const handleChange = (val) => {
    const tempMonth = _.find(monthList, ['month', val]).month;
    const tempYear = _.find(monthList, ['month', val]).year;
    let storage = getsessionStorage()
    const employeeId = storage?.employee_id || null
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getTotalSaleLocationBarAction(tempMonth, tempYear, setModalTypeHandler, setLoaderStatusHandler, (response) => {
        if(response.status === 200) {
          setDatas(response.data)
        }
      })),
    );
  };

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

  const totalSum = calculateTotalSum(datas);
  function calculateTotalSum(datas) {
    let totalSum = 0;
    for (let i = 0; i < datas.length; i++) {
      totalSum += datas[i].total;
    }
    return totalSum;
  }

  return (
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    variant='outlined' 
    sx={{width: '100%',height:'100%'}}>
      <Grid container 
        style={{
          display: 'flex', 
          alignItems: 'center', 
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '2px' : '12px'
        }}
      >
        <Grid>
              <Typography variant='h6'>
                Total Sales
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
            {/* <InputLabel style={{fontSize:headerStyle.fontSize}}>Month</InputLabel> */}
            <Select
              size='small'
              label='Month'
              fullWidth={true}
              value={month}
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
      <Grid style={{ marginLeft : '18px' }}>
        <Typography align='left' variant='h6'>
            {`Rs.${(totalSum.toFixed(2)).toLocaleString()}`}
        </Typography>
      </Grid>
      <Grid
        style={{ paddingLeft : '10px' }}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <div id='chart'>
          <ReactApexChart
            options={{
              chart: {
                toolbar: {
                  show: false,
                },
                type: 'bar',
                height: 280,
                stacked: true,
              },
              dataLabels: {
                enabled: true,
                enabledOnSeries: undefined,
                formatter: function (val, opts) {
                  return val;
                },
                style: {
                  fontSize: "11px",
                  // fontWeight: "bold",
                  colors: ["#000000"],
                }
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: '15%',
                  endingShape: 'rounded',
                  distributed: true,
                  dataLabels: {
                    position: 'top',
                  },
                },
              },
              stroke: {
                width: 1,
                colors: ['#fere'],
              },
              // title: {
              //   text: 'Fiction Books Sales'
              // },
              xaxis: {
                categories: _.map(datas, 'location_name'),

                // labels: {
                //   formatter: function (val) {
                //     return val + "K"
                //   }
                // }
              },
              yaxis: {
                title: {
                  text: undefined,
                },
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return 'Rs.'+val;
                  },
                },
              },
              fill: {
                opacity: 1,
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40,
              },
            }}
            series={[
              {
                name: 'Total Sales',
                data: _.map(datas, 'total'),
              },
            ]}
            type='bar'
            height={310}
          />
        </div>
      </Grid>
    </Card>
  );
};

export default useCommonRef(TotalSales);
