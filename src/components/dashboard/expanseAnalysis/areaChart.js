import React, {useContext, useEffect, useState} from 'react';
import ReactApexChart from 'react-apexcharts';
import {useDispatch, useSelector} from 'react-redux';
import {
  Grid,
  TextField,
  Autocomplete,
  Card,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import {listExpenseAreaChart} from 'redux/actions/profitloss_actions';
import useCommonRef from '../../../pages/common/home/useCommonRef';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import _ from 'lodash';
import {cellStyle, chartcellStyle} from 'utils/pageSize';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

function AreaChart(props) {
  const dispatch = useDispatch();
  const date = new Date();
  const [pollTimer, setPollTimer] = useState(null)
  const [data, setdata] = useState([])

  const {ref1, VisibilityOffIcon, isEnabled, mode, setCardClose, inView} =
    props;

  const {setModalTypeHandler, setLoaderStatusHandler, headerLocationId, commoncookie} = useContext(
    CreateNewButtonContext,
  );

  const {
    profitlossReducer: {expense_area_chart},
  } = useSelector((s) => s);

  const months = [
    {name: 'January', value: '01'},
    {name: 'February', value: '02'},
    {name: 'March', value: '03'},
    {name: 'April', value: '04'},
    {name: 'May', value: '05'},
    {name: 'June', value: '06'},
    {name: 'July', value: '07'},
    {name: 'August', value: '08'},
    {name: 'September', value: '09'},
    {name: 'October', value: '10'},
    {name: 'November', value: '11'},
    {name: 'December', value: '12'},
  ];
  
  const [state, setState] = useState({
    monthVal: String(date.getMonth() + 1).padStart(2, '0'),
    selectedMonth: months[date.getMonth()].name,
  });

  useEffect(() => {
    let curMonth = date.getMonth() + 1;
    setdata(props.data.length > 0 ? props.data[0].data : [])
  }, [inView, headerLocationId]);

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
  //   let curMonth = date.getMonth() + 1;
  //   props.pollServer(
  //     dispatch(listExpenseAreaChart(curMonth, headerLocationId))
  //   );
  // }

  const monthFilter = (month) => {
    if (month !== state.monthVal) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listExpenseAreaChart(month, headerLocationId, response =>{
          if(response.status === 200){
             setdata(response.data)
          }
        })),
      );
    }
  };

  // useEffect(() => {

  //   let curMonth = date.getMonth() + 1;
  //   // if (inView && isEnabled) {
  //   //   apiCalls(
  //   //     setModalTypeHandler,
  //   //     setLoaderStatusHandler,
  //   //     dispatch(listExpenseAreaChart(curMonth, headerLocationId)),
  //   //   );
  //   // }
    
  // },[isEnabled])
// console.log(props.data[0].data.length,props.data[0].data.length !== 0,props.data[0].data.length > 0,"props.data[0]");
// console.log(data,"fdsfdsf");

  return (
    <Grid 
    container  
    ref={(el) => {
      ref1(el)
      props.isVisibleRef.current = el
    }}
   width='100%' 
   height='100%'
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
        <Card style={{width: '100%', height: '100%'}}>
          <Grid
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px',
              paddingTop: mode === 'edit' ? '0px' : '10px',
            }}
            container
          >
            <Grid>
              <Typography
                className='dashboard-card-title'
                variant='h6'
                style={{
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Month Wise Expenses
              </Typography>
            </Grid>
            <Grid style={{marginLeft: 'auto', minWidth: '150px'}}>
              <FormControl  fullWidth size='small'
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
                {/* <InputLabel>Select Month</InputLabel> */}
                <Select
                  value={state.monthVal}
                  onChange={(e) => {
                    const selectedMonth = months.find((month) => month.value === e.target.value);
                    const isCurrentMonth = selectedMonth.value === String(date.getMonth() + 1).padStart(2, '0')
                    setState({ 
                      selectedMonth : isCurrentMonth ? 'This Month' : selectedMonth.name, 
                      monthVal : selectedMonth.value });
                    monthFilter(selectedMonth.value);
                  }}
                  label='Select Month'
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}
                    >
                      {month.value === String(date.getMonth() + 1).padStart(2, '0') ? 'This Month' : month.name}
                    </MenuItem>
                  ))}
                </Select>

              </FormControl>
            </Grid>
            <Grid sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              {mode === 'edit' ? (
                <IconButton
                  aria-label='view code'
                  onClick={() => setCardClose()}
                  size='large'
                >
                  {isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Grid
            sx={12}
            size={{
              lg: 12,
              md: 12,
              sm: 12
            }}>
            {data.length !== 0 ? (
              <div id='chart'>
                <ReactApexChart
                  options={{
                    chart: {
                      type: 'area',
                      animations: {
                        enabled: false,
                      },
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
                    stroke: {
                      curve: 'straight',
                    },
                    fill: {
                      opacity: 0.8,
                      type: 'gradient',
                      pattern: {
                        style: ['verticalLines', 'horizontalLines'],
                        width: 5,
                        height: 6,
                      },
                    },
                    markers: {
                      size: 5,
                      hover: {
                        size: 9,
                      },
                    },
                    tooltip: {
                      intersect: true,
                      shared: false,
                    },
                    theme: {
                      palette: 'palette1',
                    },
                    categories:
                    data.length > 0
                        ? _.map(data, 'creationDate')
                        : [],
                    yaxis: {
                      title: {
                        text: 'Amount',
                        style: {
                          fontSize: chartcellStyle.fontSize,
                          fontWeight: chartcellStyle.fontWeight,
                          fontFamily: 'Poppins,sans-serif',
                        },
                      },
                    },
                  }}
                  series={[
                    {
                      name: 'Expense',
                      data:
                      data.length > 0
                        ? _.map(data, (item) => Math.abs(item.amount))
                          : [],
                    },
                  ]}
                  type='area'
                  height={330}
                />
              </div>
            ) : (
              <Grid
                container
                display='flex'
                justifyContent='center'
                alignItems='center'
                height={298}
              >
                <Grid>
                  <NoRecordFound />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

export default useCommonRef(AreaChart);
