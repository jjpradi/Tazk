import React, { useEffect, useState, useRef, useContext } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector, useDispatch  } from 'react-redux';
import { getCreatedAndResolvedAction } from 'redux/actions/payrollDashboard_actions';
import { Card, Typography ,Grid,IconButton, Box} from '@mui/material';
import useCommonRef from 'pages/common/home/useCommonRef';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import apiCalls from 'utils/apiCalls';
import context from 'context/CreateNewButtonContext';

function CreatedAndResolved(props) {
  const dispatch = useDispatch()

  const {
    PayrolldashboardReducers: { createAndResolved},
  } = useSelector((state) => state);

  // const [pollTimer, setPollTimer] = useState(null);

  // console.log(props.data,"ertyui")
  
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  

  // useEffect(() => {
  //   if (props.inView && props.isEnabled) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(getCreatedAndResolvedAction(setModalTypeHandler, setLoaderStatusHandler))
  //     );

  //   }
  // }, [props.inView , props.isEnabled]);

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
  //     dispatch(getCreatedAndResolvedAction(setModalTypeHandler, setLoaderStatusHandler))
  //   );
  // }

  // useEffect(()=>{
  // dispatch (getCreatedAndResolvedAction({},()=>{}))
  // },[])

  // Menu toolbar to the top-right corner
  const chartRef = useRef(null)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const toolbar = chartRef.current?.querySelector('.apexcharts-toolbar')
      if (toolbar) {
        toolbar.style.position = 'absolute'
        toolbar.style.right = '40px'
        toolbar.style.top = '-22px'
        toolbar.style.transform = 'none'
      }
    })
  
    if (chartRef.current) {
      observer.observe(chartRef.current, { childList: true, subtree: true })
    }
  
    return () => observer.disconnect()
  }, [])

  const createTaskData = props.data[0]?.createTask || [];
  const resolvedTaskData = props.data[0]?.resolvedTask || [];

  const formatDate = (dateStr) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateStr));
  };

  // const formatDate = (dateStr) => {
  //   const date = new Date(dateStr);
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const year = date.getFullYear();
  //   return `${day}-${month}-${year}`;
  // };

  const categories = createTaskData.map(task => formatDate(task.start_date));
//  console.log(categories,"categories")
  const createdIssuesData = createTaskData.map(task => task.count);

  const resolvedIssuesData = resolvedTaskData.map(task => task.count);

  // let createdIssuesData = [10,20]

  // let resolvedIssuesData =[15,30]

  const arr = [...createdIssuesData, ...resolvedIssuesData];
  let max = arr?.length > 0 ? Math.max(...arr) : 0;
  max = max + 10;

  let graphData = {
          
    series: [
      {
        name: 'Created Issues',
        data: createdIssuesData,
      },
      {
        name: 'Resolved Issues',
        data: resolvedIssuesData,
      }
    ],

    options: {
      chart: {
        height: 350,
        maxBodyHeight: '210px',
        minBodyHeight: '260px',
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar : {
          show : false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], 
          opacity: 0.5
        },
      },
      xaxis: {
        categories: categories,
        tickAmount: 5,
        labels: {
          rotate: 0
        },
      },
      yaxis: {
        min: 0, // Start at 0
        max: max, // End at 250 (or adjust based on your data)
        tickAmount: 5, // Number of ticks on the Y-axis
        // labels: {
        //   formatter: (value) => {
        //     // Custom formatter to ensure exact increments
        //     return Math.round(value / 50) * 50;
        //   }
        // }
      },
    
      
    },
  
  
  };
//  console.log(graphData,"dfghj")

  return (
    <Card
    variant='outlined'
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{width: '100%',height:'100%' }}>
      <Grid 
        container 
        display = 'flex' 
        justifyContent = 'space-between'
        alignItems = 'center'
        style = {{
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '3px' : '13px'
        }}
      >
        <Grid>
          <Typography className='dashboard-card-title' variant='h6'>
            Created And Resolved
          </Typography>
        </Grid>
        <Grid>
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
        <Grid width={'100%'} height={'100%'}>
          <ReactApexChart
            options={graphData.options} series={graphData.series} type="line" height={350}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

export default useCommonRef(CreatedAndResolved)