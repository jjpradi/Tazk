import React, { useState, useEffect, useContext } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { topSaleByBrandAction } from 'redux/actions/pos_sale_actions';
import ReactApexChart from 'react-apexcharts';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import { cellStyle, headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import {clientwebsocket } from '../../../http-common'


const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const BrandSales = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [limit, setLimit] = useState(10);
  const [monthList, setMonthList] = useState([]);
  const [pollTimer, setPollTimer] = useState(null)
  const [data, setdata] = useState([])
  const {
    posSaleReducer: { topSaleByBrand },
  } = useSelector((state) => state);

  const handleChange = (val) => {
    let tempMonth =
      val === 'null' ? 'null' : _.find(monthList, ['month', val]).month;
    let tempYear =
      val === 'null'
        ? new Date().getFullYear()
        : _.find(monthList, ['month', val]).year;

    setMonth(tempMonth);
    setYear(tempYear);

    const data = {
      month: tempMonth,
      year: tempYear,
      limit: limit
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(topSaleByBrandAction(data, setModalTypeHandler, setLoaderStatusHandler, response => {
        console.log(response,"responsetreter");
        
        if(response.status === 200){
          setdata(response.data)
        }
      }))
    );
  };

  const handleLimitChange = (limit) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(topSaleByBrandAction({ month, year, limit }, setModalTypeHandler, setLoaderStatusHandler, response => {
        if(response.status === 200){
          setdata(response.data)
        }
      }))
    );
  };

  useEffect(() => {
    // if (props.inView && props.isEnabled) {
    //   apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(topSaleByBrandAction({ month, year, limit }, setModalTypeHandler, setLoaderStatusHandler))
    //   );
      generateLastTwelveMonth();

    // }
    setdata(props.data.length > 0 ? props.data[0].data : [])
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'sales') {
    //     apiCalls(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       dispatch(topSaleByBrandAction({ month, year, limit }, setModalTypeHandler))
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
  //     dispatch(topSaleByBrandAction({ month, year, limit }, setModalTypeHandler, setLoaderStatusHandler))
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
console.log(data,"datasfd");

  return (
    <Card 
    variant='outlined' 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{width: '100%',height:'100%'}}>
      {/* top container */}
      {/* Brand sales  */}
      <Grid container
        style={{
          display: 'flex',
          justifyContent : 'space-between',
          alignItems: 'center',
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '2px' : '10px'
        }}
      >
        <Grid>
        <Typography className='dashboard-card-title' variant='h6'>
             Top Sales by Brand
          </Typography>
        </Grid>

        <Grid>
        <Grid container spacing={2} display='flex' justifyContent='flex-end'>
          <Grid
            style={{ minWidth : '150px', paddingTop : props.mode === 'edit' ? '15px' : '' }}>
          <FormControl
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
            {/* <InputLabel sx={{ fontSize: headerStyle.fontSize }}>Month</InputLabel> */}
            <Select
              size='small'
              label='Month'
              fullWidth={true}
              value={month}
              onChange={(e) => {
                handleChange(e.target.value);
              }}
            >
              <MenuItem value={'null'}>Current Year</MenuItem>
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
          {/* </Grid> */}
        </Grid>
        {/* <Grid style={{
          marginLeft : 'auto',
          minWidth : '100px'
        }}> */}
        <Grid
          style={{ minWidth : '100px', paddingTop : props.mode === 'edit' ? '15px' : '' }}>
          <FormControl
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
            {/* <InputLabel sx={{ fontSize: cellStyle.fontSize }} value={10}>

            </InputLabel> */}
            <Select
              size='small'
              value={limit}
              fullWidth={true}
              onChange={(e) => {
                setLimit(e.target.value);
                handleLimitChange(e.target.value);
              }}
            >
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
            </Select>
          </FormControl>
        </Grid>
       
        
            {
              props.mode === 'edit' &&
              <Grid
                sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <IconButton
                  aria-label='view code'
                  onClick={() => props.setCardClose()}
                  size='large'
                >
                  {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
                </IconButton>
              </Grid>
            }
        </Grid>
        </Grid>
        </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <div id='chart'>
          {data.length > 0 ? (
            <ReactApexChart
              options={{
                chart: {
                  toolbar: {
                    show: false,
                  },
                  type: 'bar',
                  height: 300,
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
                  },
                  offsetY: 0,
                  background: {
                    enabled: false,
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
                  categories: _.map(data, 'brand').map(i => _.capitalize(i)),
                  // labels: {
                  //   formatter: function (val) {
                  //     return val + "K"
                  //   }
                  // }
                },
                yaxis: {
                  min: 0,
                  max: Math.max(...data.map(d => d.total)) * 1.2,
                },
                tooltip: {
                  y: {
                    formatter: function (val) {
                      return 'Rs.' + val;
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
                  name: 'Top sale by brand',
                  data: _.map(data, 'total'),
                },
              ]}
              type='bar'
              height={330}
            />
          ) : (
            <ReactApexChart
              options={{
                chart: {
                  toolbar: {
                    show: false,
                  },
                  type: 'bar',
                  height: 300,
                  stacked: true,
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
                  categories: [],
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
                      return 'Rs.' + val;
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
                  name: 'Top sale by brand',
                  data: [],
                },
              ]}
              type='bar'
              height={330}
            />
          )}
        </div>
      </Grid>
    </Card>
  );
};

export default useCommonRef(BrandSales);
