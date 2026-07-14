import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Typography, Tab, Tabs, CircularProgress, Grid, IconButton } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { topEmpByAttendanceAction } from 'redux/actions/payrollDashboard_actions';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

function TopEmpByAttendance(props) {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState('overall_percentage');
  const [pollTimer, setPollTimer] = useState(null)
  const { PayrolldashboardReducers: { topEmpByAttendance } } = useSelector((state) => state);
const attendanceData = props.data
  // useEffect(() => {
  //   dispatch(topEmpByAttendanceAction('dashboard'));
  // }, [selectedOption, dispatch]);

  const handleOptionChange = (optionValue) => {
    setSelectedOption(optionValue);
  };

  // if (!attendanceData) {
  //   return <CircularProgress />; // Display a loading indicator while data is being fetched
  // }

  const data = attendanceData?.[selectedOption]?.map(item => ({
    name: item.employee_name,
    value: item[selectedOption]
  })) || [];

  const options = {
    chart: {
      type: 'bar',
      toolbar : {
        show : false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        if (Number.isInteger(val)) {
          return val;
        } else {
          return parseFloat(val).toFixed(2);
        }
      },
      offsetX: -10,
    },
    xaxis: {
      categories: data.map(item => item.name),
      style: {
        fontSize: '11px', 
        fontWeight: 400, 
        colors: 'rgba(0, 0, 0, 0.7)', 
      }
    },
  };

  const headerStyle = {
    fontFamily: "Poppins, sans-serif",
    fontSize: "12px",
    fontWeight: "600",
    color: 'rgba(0, 0, 0, 0.7)',
  };

  const pollData = () => {
    dispatch(topEmpByAttendanceAction)
  }

  useEffect(() => {
    if(props.inViewport === true) {
      const timer = setInterval(pollData, props.DASHBOARD_API_POLL_TIMING)
      setPollTimer(timer)
      return () => clearInterval(timer)
    }
  }, [props.inViewport, props.DASHBOARD_API_POLL_TIMING])

  return (
    <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
          <Typography
            className = 'dashboard-card-title'
            variant = 'h6'
            align = 'left'
          >
              Top 10 Employees
          </Typography>
        </Grid>

        <Grid>
          {
            props.mode === 'edit' ? (
              <IconButton
                aria-label = 'view code'
                onClick = {() => props.setCardClose()}
                size = 'large'
              >
                {props.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ) : (
              ''
            )
          }
        </Grid>
      </Grid>
      <Tabs
        value={selectedOption}
        onChange={(event, newValue) => handleOptionChange(newValue)}
        aria-label="options tabs"
        variant="fullWidth"
        sx={{ mb: 2, paddingLeft : '5px', paddingRight : '5px' }}
        TabIndicatorProps={{ style: { height: '2px' } }}
      >
        <Tab
          label="Overall Performance (%)"
          value="overall_percentage"
          sx={{...headerStyle, fontSize: '11px', fontWeight: 'bold', mb: 1, paddingTop: 5, paddingBottom: 0, color: '#191919' }}
        />
        <Tab
          label="Avg Work Hours"
          value="avg_wrk_hrs"
          sx={{ ...headerStyle,fontSize: '11px', fontWeight: 'bold', mb: 1, paddingTop: 5, paddingBottom: 0, color: '#191919' }}
        />
        <Tab
          label="Total Leaves"
          value="Total_leave"
          sx={{...headerStyle, fontSize: '11px', fontWeight: 'bold', mb: 1, paddingTop: 5, paddingBottom: 0, color: '#191919' }}
        />
      </Tabs>
      <ReactApexChart
        options={options}
        series={[{ name: 'Value', data: data.map(item => item.value) }]}
        type='bar'
        height='280'
        sx={{ fontSize: '12px', fontWeight: 'bold', color: '#191919' }}
      />
    </Card>
  );
}

export default TopEmpByAttendance;
