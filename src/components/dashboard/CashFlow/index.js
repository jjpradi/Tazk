import React, {useState, useEffect, useContext} from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Grid,
  Box,
  Typography,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Button,
  DialogContent,
  DialogActions,
  DialogTitle,
  TextField,
  Dialog,
  OutlinedInput,
  Card,
  IconButton,
} from '@mui/material';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {
  cashInHandMonthAction,
  cashInHandFiscalYearAction,
} from '../../../redux/actions/cash_box_actions';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import toMomentOrNull from 'utils/DateFixer';

const CashFlow = (props) => {

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [lastMonth, setLastMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [timeline, setTimeline] = useState('currentMonth');
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [cashAsOn, setCashAsOn] = useState({
    timeline,
    cashFromDate: '',
    cashToDate: '',
  });
  const [pollTimer, setPollTimer] = useState(null)
  const [data, setData] = useState([])

  // const {ref, inView, entry} = useInView({
  //   threshold: 0,
  //   triggerOnce: true,
  // });

  // const {
  //   cashBoxReducer: {cashInHandMonth:{graphData,openingBalance,closingBalance,outgoing,incoming}},
  // } = useSelector((state) => state);
  // const {
  //   cashBoxReducer: {cashInHandMonth},
  // } = useSelector((state) => state);

  const handleChange = (value) => {
    if (value === 'currentMonth') {
      let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setCashAsOn({
      ...cashAsOn,
      cashFromDate: moment(firstDay).format('DD-MM-yyyy'),
      cashToDate: moment(date).format('DD-MM-yyyy'),
    });
    const data = {
      fromDate: moment(firstDay).format('YYYY-MM-DD'),
      toDate: moment(date).format('YYYY-MM-DD'),
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(cashInHandMonthAction(data, setModalTypeHandler, setLoaderStatusHandler, response => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    );
    }
    if (value === 'lastMonth') {
      let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth() - 1 , 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    setCashAsOn({
      ...cashAsOn,
      cashFromDate: moment(firstDay).format('DD-MM-yyyy'),
      cashToDate: moment(lastDay).format('DD-MM-yyyy'),
    });
    const data = {
      fromDate: moment(firstDay).format('YYYY-MM-DD'),
      toDate: moment(lastDay).format('YYYY-MM-DD'),
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(cashInHandMonthAction(data, setModalTypeHandler, setLoaderStatusHandler, response => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    );
      
    }
    if (value === 'financialYear') {
      let date = new Date();
      let firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear()-1, 3, 1) : new Date(date.getFullYear(), 3, 1);
      let lastDay = date.getMonth()  <= 2 ? new Date(date.getFullYear(), 3, 0) : new Date(date.getFullYear()+1, 3, 0);
      setCashAsOn({
        ...cashAsOn,
        cashFromDate: moment(firstDay).format('DD-MM-yyyy'),
        cashToDate: moment(lastDay).format('DD-MM-yyyy'),
      });
      const data = {
        fromDate: moment(firstDay).format('YYYY-MM-DD'),
      toDate: moment(lastDay).format('YYYY-MM-DD'),
      };
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(cashInHandFiscalYearAction(data,setModalTypeHandler,setLoaderStatusHandler, (response) => {          
          if(response.status === 200) {            
            setData(response.data)
          }
        }))
      );
    }
    if (value === 'customDate') {
      setOpenDateDialog(true);
    }
  };

  useEffect(() => {
    setData(props.data[0] || {})
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setCashAsOn({
      ...cashAsOn,
      cashFromDate: moment(firstDay).format('DD-MM-yyyy'),
      cashToDate: moment(date).format('DD-MM-yyyy'),
    });
    const data = {
      fromDate: moment(firstDay).format('YYYY-MM-DD'),
      toDate: moment(date).format('YYYY-MM-DD'),
    };
    // if(props.inView && props.isEnabled){
    //   apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(cashInHandMonthAction(data, setModalTypeHandler, setLoaderStatusHandler,))
    //   );
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
  //   let date = new Date();
  //   let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  //   let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  //   const data = {
  //     fromDate: moment(firstDay).format('YYYY-MM-DD'),
  //     toDate: moment(date).format('YYYY-MM-DD'),
  //   };
  //   props.pollServer(
  //     dispatch(cashInHandMonthAction(data, setModalTypeHandler, setLoaderStatusHandler,))

  //   );
  // }


  const handleSubmitCustomDate = () => {
    if(fromDate === null || toDate === null) return setOpenDateDialog(false)
    const data = {
      fromDate: moment(fromDate).format('YYYY-MM-DD'),
      toDate: moment(toDate).format('YYYY-MM-DD'),
    };
    setCashAsOn({
      ...cashAsOn,
      cashFromDate: moment(fromDate).format('DD-MM-yyyy'),
      cashToDate: moment(toDate).format('DD-MM-yyyy'),
    });
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(cashInHandFiscalYearAction(data,setModalTypeHandler,setLoaderStatusHandler, response => {
        if(response.status === 200){
          setData(response.data)
        }
      }))
      // dispatch(cashInHandMonthAction(data, setModalTypeHandler, setLoaderStatusHandler))
    );
    setOpenDateDialog(false);

      
  };

const {graphData,openingBalance,closingBalance,outgoing,incoming} = data

  return (
    // <Grid width={780} marginLeft={2} marginTop={10}>
    // <div ref={props.ref1} style={{width: '100%'}}>
    // </div>
    <Card 
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      style={{width: '100%',height:'100%'}}>
      <Grid
        style={{
          display: 'flex',
          padding: '17px',
          paddingTop : props.mode === 'edit' ? '0px' : '10px'
        }}
      >
        <Grid container>
          <Grid  display="flex" flexDirection="row" alignItems="center" width="100%" paddingBottom='10px'>
          <Typography className='dashboard-card-title' variant='h6'>
            Cash Flow
          </Typography>
            
            <Grid style={{marginLeft:'auto', minWidth:'150px'}}>
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
              {/* <InputLabel id='demo-select-small'>Month</InputLabel> */}
              <Select
                labelId='demo-select-small'
                id='demo-select-small'
                value={timeline}
                fullWidth={true}
                label='Month'
                size='small'
                onChange={(e) => {
                  setTimeline(e.target.value);
                  handleChange(e.target.value);
                }}
              >
                <MenuItem value={'currentMonth'}>This Month</MenuItem>
                <MenuItem value={'lastMonth'}>Last Month</MenuItem>
                <MenuItem value={'financialYear'}>Current Financial year</MenuItem>
                <MenuItem value={'customDate'}>Custom Date Range</MenuItem>
              </Select>
            </FormControl>
            </Grid>

            <Grid>
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
          
          
         

          {/* //////// */}
          <Dialog
            disableEscapeKeyDown
            open={openDateDialog}
            onClose={() => {
              setOpenDateDialog(false);
            }}
          >
            <DialogTitle variant='h3'>Choose Date</DialogTitle>
            <DialogContent>
              <Box
                component='form'
                sx={{display: 'flex', width: '300px', gap: '20px'}}
              >
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='From Date'
                    // inputFormat='DD/MM/yyyy'
                    value={toMomentOrNull(fromDate)}
                    format='DD/MM/YYYY'
                    inputVariant='contained'
                    onChange={(e, v) => {
                      setFromDate(e._d);
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='To Date'
                    // inputFormat='DD/MM/yyyy'
                    format='DD/MM/YYYY'
                    value={toMomentOrNull(toDate)}
                    inputVariant='contained'
                    onChange={(e, v) => {
                      setToDate(e._d);
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenDateDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCustomDate}>Ok</Button>
            </DialogActions>
          </Dialog>
        

          <Grid
            style={{}}
            size={{
              lg: 9,
              md: 9,
              sm: 8,
              xs: 12
            }}>
                <ReactApexChart
                  options={{
                    chart: {
                      // height: 200,
                      type: 'line',
                      zoom: {
                        enabled: false,
                      },
                      toolbar: {
                        show: false,
                      },
                    },
                    dataLabels: {
                      enabled: false,
                    },
                    // stroke: {
                    //   width: [5, 7, 5],
                    //   curve: 'straight',
                    //   dashArray: [0, 8, 5],
                    // },
                    title: {
                      // text: 'Cash Flow',
                      align: 'left',
                      style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#263238',
                      },
                    },
                    colors:[ '#41CB05', '#E13410','#9C27B0'],
                    legend: {
                      tooltipHoverFormatter: function (val, opts) {
                        return (
                          val +
                          ' - ' +
                          opts.w.globals.series[opts.seriesIndex][
                            opts.dataPointIndex
                          ] +
                          ''
                        );
                      },
                    },
                    // markers: {
                    //   size: 0,
                    //   hover: {
                    //     sizeOffset: 6,
                    //   },
                    // },
                    xaxis: {
                      categories: graphData?.length > 0 ? _.map(graphData, 'xAxis'):[],
                    },
                    tooltip: {
                      y: [
                        {
                          title: {
                            formatter: function (val) {
                              return val ;
                            },
                          },
                        },
                        {
                          title: {
                            formatter: function (val) {
                              return val ;
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
                      name: 'Incoming',
                      data: graphData?.length > 0 ?  _.map(graphData, data => data.amount || 0) : [],
                    },
                    {
                      name: 'Outgoing',
                      data: graphData?.length > 0 ?  _.map(graphData, data => data.outgoing || 0) : [],
                    },
                  ]}
                  
                  type='line'
                  height={330}
                />
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
        <Grid
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'space-between',
              gap: '20px',
            }}
          >
            {/*  */}
            <Grid
              style={{display: 'flex', flexDirection: 'column', gap: '7px'}}
            >
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right' style={{color: 'gray'}}>
                  {`Cash as on ${cashAsOn.cashFromDate}`}
                </Typography>
                <Grid width='20px'>&nbsp;&nbsp;&nbsp;</Grid>
              </Grid>
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right' >
                  {`Rs.${
                    openingBalance?.toFixed(2) || 0.00
                  }`}
                </Typography>
                <Grid width='20px'></Grid>
              </Grid>
            </Grid>

            {/*  */}

            <Grid
              style={{display: 'flex', flexDirection: 'column', gap: '7px'}}
            >
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right' style={{color: 'green'}}>
                  Incoming
                </Typography>
                <Typography variant='h2' width='20px'></Typography>
              </Grid>
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right'>
                    {`Rs.${incoming?.toFixed(2) || 0.00}`}
                </Typography>
                <Typography className='dashboard-chart-content' width='20px'>
                  {' '}
                  +{' '}
                </Typography>
              </Grid>
            </Grid>

            {/*  */}

            <Grid
              style={{display: 'flex', flexDirection: 'column', gap: '7px'}}
            >
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right' style={{color: 'red'}}>
                  Outgoing
                </Typography>
                <Grid width='20px'></Grid>
              </Grid>
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right'>
                  {`Rs.${outgoing?.toFixed(2) || 0.00}`}
                </Typography>
                <Typography className='dashboard-chart-content' width='20px'>
                  {' '}
                  -{' '}
                </Typography>
              </Grid>
            </Grid>

            {/*  */}

            <Grid
              style={{display: 'flex', flexDirection: 'column', gap: '7px'}}
            >
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right' style={{color: 'blue'}}>
                  {`Cash as on ${cashAsOn.cashToDate}`}
                </Typography>
                <Grid width='20px'></Grid>
              </Grid>
              <Grid
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '20px',
                }}
              >
                <Typography className='dashboard-chart-content' align='right'>
                  {`Rs.${closingBalance?.toFixed(2) || 0.00}`}
                </Typography>
                <Typography className='dashboard-chart-content' width='20px'>
                  {' '}
                  ={' '}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          </Grid>
        </Grid>
        
      </Grid>
    </Card>
  );
};

export default useCommonRef(CashFlow);
