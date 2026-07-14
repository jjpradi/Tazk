import React, {useEffect, useState, useContext} from 'react';
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
import ReactApexChart from 'react-apexcharts';
import {useDispatch, useSelector} from 'react-redux';
import {saleComparisonAction} from '../../../redux/actions/pos_sale_actions';
import {allListStockLocation} from '../../../redux/actions/stock_Location_actions';
import _ from 'lodash';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const SalesComparison = (props) => {

  const {
    headerLocationId: locationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(context);
  const dispatch = useDispatch();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [location_id, setLocation_id] = useState(locationId);
  const [pollTimer, setPollTimer] = useState(null)
  const [data, setData] = useState([])

  const {
    posSaleReducer: {saleComparison},
    stockLocationReducer: {allliststocklocation},
  } = useSelector((state) => state);

  useEffect(() => {
    setData(props.data.length > 0 ? props.data[0].data : [])
    // if(props.inView && props.isEnabled){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        // dispatch(saleComparisonAction({month, year, location_id}, setModalTypeHandler, setLoaderStatusHandler)),
        !allliststocklocation.length && dispatch(allListStockLocation(setModalTypeHandler, setLoaderStatusHandler))
      );

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
  //     dispatch(saleComparisonAction({month, year, location_id}, setModalTypeHandler, setLoaderStatusHandler)),
  //     !allliststocklocation.length && dispatch(allListStockLocation(setModalTypeHandler, setLoaderStatusHandler))
  //   );
  // }

  const handleChange = (value) => {
    setLocation_id(value);
    const data = {
      month,
      year,
      location_id:value
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(saleComparisonAction(data, setModalTypeHandler, setLoaderStatusHandler, (response) => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    );
  };

  const currentMonth = data.currentMonth?.length === 0 ? [{cumulativeTotal : 0}] : data.currentMonth

  return (
    // <div ref={props.ref1} style={{width: '100%'}}>
    // </div>
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    variant='outlined' 
    sx={{ width: '100%',height:'100%'}}>
      {/* top container */}
      {/* Brand sales  */}
      <Grid container
        style={{
          display: 'flex',
          alignItems: 'center',
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '0px' : '10px'
        }}
      >
        <Grid>
        <Typography className='dashboard-card-title' variant='h6'>
          Sale Comparison
        </Typography>
        </Grid>
        <Grid
          style={{
            marginLeft:'auto',
            minWidth:'150px'
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
              '& .MuiButtonBase-root' : {
                color : 'black !important'
              }
            }}
          >
            {/* <InputLabel style={{fontSize:headerStyle.fontSize}}>Choose Location</InputLabel> */}
            <Select
              size='small'
              value={location_id}
              fullWidth={true}
              label='Choose Location'
              onChange={(e) => {
                handleChange(e.target.value);
              }}
            >
              <MenuItem value={'null'}>All Location</MenuItem>
              {allliststocklocation.length > 0 ? (
                allliststocklocation.map((item) => {
                  return (
                    <MenuItem key={item.location_id} value={item.location_id}>
                      {item.location_name}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem value={'null'}></MenuItem>
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
      <Grid style={{ paddingLeft : '5px' }}>
        <div id='chart'>
          
            <ReactApexChart
              options={{
                chart: {
                  toolbar: {
                    show: false,
                  },
                  height: 300,
                  type: 'line',
                  zoom: {
                    enabled: false,
                  },
                },
                dataLabels: {
                  enabled: false,
                },
                stroke: {
                  width: [5, 7, 5],
                  curve: 'straight',
                  dashArray: [0, 8, 5],
                },
                title: {
                  //   text: 'Revenue V Costs',
                  align: 'left',
                },
                legend: {
                  tooltipHoverFormatter: function (val, opts) {
                   const dataPoint = opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex];        
                    return `${val} - ${dataPoint !== undefined ? dataPoint : '0'}`;
                  },
                },
                markers: {
                  size: 0,
                  hover: {
                    sizeOffset: 6,
                  },
                },
                xaxis: {
                  categories: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
                },
                tooltip: {
                  y: [
                    {
                      title: {
                        formatter: function (val) {
                          return 'Rs.' + val;
                        },
                      },
                    },
                    {
                      title: {
                        formatter: function (val) {
                          return 'Rs.' + val;
                        },
                      },
                    },
                    {
                      title: {
                        formatter: function (val) {
                          return val;
                        },
                      },
                    },
                  ],
                },
                grid: {
                  borderColor: '#f1f1f1',
                },
              }}
              series={[
                {
                  name: 'Current Month',
                  data:  _.map(currentMonth, "cumulativeTotal")
                },
                {
                  name: 'Last Month',
                  data: _.map(data.lastMonth, "cumulativeTotal"),
                },
              ]}
              type='line'
              height={330}
            />
        </div>
      </Grid>
    </Card>
  );
};

export default useCommonRef(SalesComparison);
