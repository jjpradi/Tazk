import React, { useEffect, useContext } from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {
  Grid,
  Box,
  Card,
  Button,
  Typography,
  Slider,
  TextField,
  Autocomplete,
  Stack,
  IconButton,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentDayAction,
  currentWeekAction,
  currentMonthAction,
  currentYearAction,
  getByDateAction,
} from 'redux/actions/profitLossDashboardAction';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { getConvertedDate } from 'components/common';
import CssTextField from '../../CssTextField';
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider } from '@mui/material/styles';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';


function Filters(props) {
  const { handleDate ,setActiveButton} = props;
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {
    ProfitLossDashboardReducer: {
      currentDay,
      currentWeek,
      currentMonth,
      currentYear,
      getByDate,
    },
  } = useSelector((state) => state);
  const [fromDate, setFromDate] = React.useState(getConvertedDate(new Date()));
  const [toDate, setToDate] = React.useState(getConvertedDate(new Date()));
  const [pollTimer, setPollTimer] = React.useState(null)



  // useEffect(() => {
  //   let data = {
  //     fromDate: fromDate,
  //     totDate: toDate,
  //   };
  //   if(props.inView){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         getByDateAction(
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //           fromDate,
  //           toDate,
  //           data,
  //         ),
  //       )
  //     );
  //   }
  // }, [fromDate, toDate]);


  useEffect(() => {
    if(props.inView && props.isEnabled){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(currentDayAction(headerLocationId)),
        dispatch(currentWeekAction(headerLocationId)),
        dispatch(currentMonthAction(headerLocationId)),
        dispatch(currentYearAction(headerLocationId))
      );

    }
  }, [props.inView , props.isEnabled, headerLocationId ]);

  function checkIsDataAvailable() {

    const day = currentDay
    const week = currentWeek
    const month = currentMonth
    const year = currentYear
    let result = Boolean(day.length && week.length && month.length && year.length)
    return result
  }


  // useEffect(() => {
  //   if(props.isEnabled ){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(currentDayAction(setModalTypeHandler, setLoaderStatusHandler)),
  //       dispatch(currentWeekAction(setModalTypeHandler, setLoaderStatusHandler)),
  //       dispatch(currentMonthAction(setModalTypeHandler, setLoaderStatusHandler)),
  //       dispatch(currentYearAction(setModalTypeHandler, setLoaderStatusHandler))
  //     );

  //   }
  // }, [props.isEnabled]);

  useEffect(() => {
    if (props.inViewport === true) {
      setTimeout(() => {
        const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
        if (props.inViewport === false) {
          clearTimeout(timer);
        }
        dispatch(setDashboardPollingTimerIdsAction(timer));
        setPollTimer(timer );
      }, props.DASHBOARD_API_POLL_TIMING);


    } else {
      clearTimeout(pollTimer);
    }

    return () => clearTimeout(pollTimer);

  }, [props.inViewport]);

  const pollData = () => {
    props.pollServer(
      dispatch(currentDayAction(headerLocationId)),
      dispatch(currentWeekAction(headerLocationId)),
      dispatch(currentMonthAction(headerLocationId)),
      dispatch(currentYearAction(headerLocationId))
    );
  }

  // const handleFromChange = async (e) => {
  //   let convertedDateFrom = await getConvertedDate(e);
  //   await setFromDate(convertedDateFrom);
  // };
  // const handleChange = async (e) => {
  //   let {name, value} = e.target;
  //   //setStateHandler(name, value);
  // };
  // const handleToChange = async (e) => {
  //   let convertedDateTo = await getConvertedDate(e);
  //   await setToDate(convertedDateTo);
  // };

  const months = [
    {
      id: '1',
      month: 'March',
    },
  ];

  return (
    <>
      <Grid 
      container 
      width='100%' 
      height='100%' 
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      >
        <Grid
          width='100%'
          height='100%'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container rowSpacing={1}>
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
                Profit & Loss Dashboard
              </h2>
            </Grid> */}
          </Grid>
          <Card sx={{ height: '100%', width: '100%' }}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container rowSpacing={1} style={{ paddingBottom: 20 }}>
                <Grid
                  style={{
                    textAlign: 'center',
                    fontWeight: headerStyle.fontWeight,
                    fontSize: headerStyle.fontSize,
                    color: '#4A4A4A',
                    backgroundColor: '#dddddd',
                    padding: '15px'
                  }}
                  size={{
                    lg: 10.5,
                    md: 10,
                    sm: 10,
                    xs: 10
                  }}>
                  Filter by date
                </Grid>
                <Grid
                  style={{ backgroundColor: '#dddddd' }}
                  size={{
                    lg: 1.5,
                    md: 2,
                    sm: 2,
                    xs: 2
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
                <Grid
                  m='20px'
                  padding='7px 0px'
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        value={toMomentOrNull(fromDate)}
                        label='From Date'
                        format='DD/MM/YYYY'
                        // inputFormat='dd/MM/yyyy'
                        name='FROMDATE'
                        onChange={(e) => setFromDate(moment(e?._d)?.format('YYYY-MM-DD'))}
                        slots={{ textField: CssTextField }}
                        slotProps={{
                          textField: {
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                height: '42px',
                              },
                              '& label': {
                                top: -2,
                              },
                            },
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        value={toMomentOrNull(toDate)}
                        format='DD/MM/YYYY'
                        label='To Date'
                        // inputFormat='dd/MM/yyyy'
                        name='TODATE'
                        onChange={(e) => setToDate(moment(e?._d)?.format('YYYY-MM-DD'))}
                        slots={{ textField: CssTextField }}
                        slotProps={{
                          textField: {
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                height: '42px',
                              },
                              '& label': {
                                top: -2,
                              },
                            },
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                  {/* <Slider
                        track="inverted"
                        aria-labelledby="track-inverted-range-slider"
                        //getAriaValueText={valuetext}
                        //defaultValue={[20, 37]}
                        marks={marks}
                        color='secondary'
                      /> */}
                </Grid>
                <Grid
                  display='flex'
                  justifyContent='center'
                  pb='3px'
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Button variant='contained' onClick={() => {
                    setActiveButton('date')
                    handleDate(fromDate,toDate)}
                    }>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {currentDay.map((d, i) => (
              <Grid
                key={i}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  container
                  style={{
                    textAlign: 'center',
                    paddingBottom: 20,
                  }}
                  rowSpacing={1}
                >
                  <Grid
                    style={{
                      textAlign: 'center',
                      fontWeight: headerStyle.fontWeight,
                      fontSize: headerStyle.fontSize,
                      color: '#4A4A4A',
                      backgroundColor: '#dddddd',
                      padding: '15px'
                    }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    Current Day
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Revenue</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {d.Revenue === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{d.Revenue.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Costs</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {d.Expenses === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{d.Expenses.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                       <Typography variant='h9'>Profit</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {d.GrossProfit === 0 || d.GrossProfit === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{d.GrossProfit.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Margin</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {d.Margin === null ? (
                          '-'
                        ) : (
                          <Typography> {d.Margin.toFixed(2)}%</Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {currentWeek.map((w, i) => (
              <Grid
                key={i}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  container
                  style={{ textAlign: 'center', paddingBottom: 20 }}
                  rowSpacing={1}
                >
                  <Grid
                    style={{
                      textAlign: 'center',
                      fontWeight: headerStyle.fontWeight,
                      fontSize: headerStyle.fontSize,
                      color: '#4A4A4A',
                      backgroundColor: '#dddddd',
                      padding: '15px'
                    }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    Current Week
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Revenue</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {w.Revenue === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{w.Revenue.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Costs</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {w.Expenses === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{w.Expenses.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Profit</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {w.GrossProfit === 0 || w.GrossProfit === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{w.GrossProfit.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Margin</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {w.Margin === null ? (
                          '-'
                        ) : (
                          <Typography> {w.Margin.toFixed(2)}% </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {currentMonth.map((m, i) => (
              <Grid
                key={i}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  container
                  style={{ textAlign: 'center', paddingBottom: 20 }}
                  rowSpacing={1}
                >
                  <Grid
                    style={{
                      textAlign: 'center',
                      fontWeight: headerStyle.fontWeight,
                      fontSize: headerStyle.fontSize,
                      color: '#4A4A4A',
                      backgroundColor: '#dddddd',
                      padding: '15px'
                    }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    Current Month
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Revenue</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {m.Revenue === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{m.Revenue.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                       <Typography variant='h9'>Costs</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {m.Expenses === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{m.Expenses.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                       <Typography variant='h9'>Profit</Typography> 
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {m.GrossProfit === 0 || m.GrossProfit === null ? (
                          '-'
                        ) : (
                          <Typography> ₹ {m.GrossProfit.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                       <Typography variant='h9'>Margin</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {m.Margin === null ? (
                          '-'
                        ) : (
                          <Typography> {m.Margin.toFixed(2)}% </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {currentYear.map((y, i) => (
              <Grid
                key={i}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  container
                  style={{ textAlign: 'center', paddingBottom: 20 }}
                  rowSpacing={1}
                >
                  <Grid
                    style={{
                      textAlign: 'center',
                      fontWeight: headerStyle.fontWeight,
                      fontSize: headerStyle.fontSize,
                      color: '#4A4A4A',
                      backgroundColor: '#dddddd',
                      padding: '15px'
                    }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    Current Financial Year
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Revenue</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {y.Revenue === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{y.Revenue.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column' p='15px'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                       <Typography variant='h9'>Costs</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {y.Expenses === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{y.Expenses.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Profit</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {y.GrossProfit === 0 || y.GrossProfit === null ? (
                          '-'
                        ) : (
                          <Typography> ₹{y.GrossProfit.toFixed(2)} </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <Grid container direction='column'>
                      <Grid
                        color='rgba(34, 51, 69, 0.6)'
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        <Typography variant='h9'>Margin</Typography>
                      </Grid>
                      <Grid
                        size={{
                          lg: 3,
                          md: 3,
                          sm: 3,
                          xs: 3
                        }}>
                        {y.Margin === null ? (
                          '-'
                        ) : (
                          <Typography> {y.Margin.toFixed(2)}% </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
export default useCommonRef(Filters)
