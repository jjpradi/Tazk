import React, {useEffect, useState, useContext,useRef} from 'react';
import {
  Grid,
  Card,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import context from "context/CreateNewButtonContext";
import apiCalls from 'utils/apiCalls';
import useCommonRef from 'pages/common/home/useCommonRef';
import { overallAttPercentageAction, setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

const OverallAttendance = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(context);
  const dispatch = useDispatch();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [pollTimer, setPollTimer] = useState(null)


  const {
    DashboardRoleReducer: {overallAttPercentage}
  } = useSelector((state) => state);

  // console.log(overallAttPercentage,"overallAttPercentage")

  // useEffect(() => {
  //   if(props.inView && props.isEnabled){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(overallAttPercentageAction({month, year}, setModalTypeHandler, setLoaderStatusHandler))
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
  //     dispatch(overallAttPercentageAction({month, year}, setModalTypeHandler, setLoaderStatusHandler))
  //   );
  // }

   const chartRef = useRef(null)
    useEffect(() => {
      const observer = new MutationObserver(() => {
        const toolbar = chartRef.current?.querySelector('.apexcharts-toolbar')
        if (toolbar) {
          toolbar.style.position = 'absolute'
          toolbar.style.right = '10px'
          toolbar.style.top = '-95px'
          toolbar.style.transform = 'none'
        }
      })
    
      if (chartRef.current) {
        observer.observe(chartRef.current, { childList: true, subtree: true })
      }
    
      return () => observer.disconnect()
    }, [])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const attendanceArray = Object.values(props.data[0]?.data || [])
  .sort((a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1))
  .slice(-6);

  const categories = attendanceArray.map((data) => `${months[data.month - 1]} ${data.year}`);
  const seriesData = attendanceArray.map((data) => parseFloat(data.overall_attendance_for_month) || 0);


  return (
    <Card
    sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    ref={(el) => {
      props.ref1(el);
      props.isVisibleRef.current = el;
    }}
  >
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
          <Typography variant='h6'>
            Overall Attendance
          </Typography>
        </Grid>

        <Grid>
          {
            props.mode === 'edit' ? (
              <IconButton
                aria-label="view code"
                onClick={() => props.setCardClose()}
                size="large"
              >
                {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
              </IconButton>
            ) : (
              ''
            )
          }
        </Grid>
      </Grid>
      <ReactApexChart
          options={{
            chart: {
              toolbar: {
                show: false,
              },
              height: 300,
              type: 'bar',
              zoom: {
                enabled: false,
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              categories: categories || [],
            },
            yaxis: {
              min: 0,
              max: 100,
              tickAmount: 10,
              labels: {
                formatter: (val) => `${val}%`,
              },
            },
            tooltip: {
              y: {
                formatter: (val, { dataPointIndex }) => {
                  const data = attendanceArray[dataPointIndex];
                  return `Percentage: ${val}%<br>Days Present: ${data?.total_present_days || 0}`;
                },
              },
            },
            grid: {
              borderColor: "#f1f1f1",
            },
          }}
          series={[
            {
              name: "Attendance Percentage",
              data: seriesData || [],
            }
          ]}
          type='bar'
          height={330}
        />
    </Card>
  );
};

export default useCommonRef(OverallAttendance);
