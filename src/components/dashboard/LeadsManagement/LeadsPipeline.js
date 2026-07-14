import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Grid, IconButton, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { getleadsPipelineAction } from 'redux/actions/leadManagement_actions';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

function LeadsPipeline(props) {
  const dispatch = useDispatch();
  
  const [pollTimer, setPollTimer] = useState(null)
  
  const { leadManagementReducers: { getleadsPipeline } } = useSelector((state) => state);
  
  // useEffect(() => {
  //   dispatch(getleadsPipelineAction());
  // }, []);

  const uniqueStatuses = Array.from(
    new Set(props.data[0]?.chartData.flatMap(item => item.leadStatus.map(status => status.name)))
  );

  const seriesData = uniqueStatuses.map(statusName => {
    return {
      name: statusName,
      data: props.data[0]?.chartData.map(owner => {
        const status = owner.leadStatus.find(s => s.name === statusName);
        return status ? status.totalValue : 0; 
      })
    };
  });

  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const colors = generateColors(uniqueStatuses.length);

  // Chart options for configuration
  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
      }
    },
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.data[0]?.chartData.map(item => item.name) || [],  // Owner names as categories
      title: { text: 'Sum of Amount' }
    },
    yaxis: {
      title: { text: 'Lead Stage' }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`
      }
    }
  };

  // const pollData = () => {
  //   dispatch(getleadsPipelineAction())
  // }

  // useEffect(() => {
  //   if(props.inViewport === true) {
  //     const timer = setInterval(pollData, props.DASHBOARD_API_POLL_TIMING)
  //     setPollTimer(timer)
  //     return () => clearInterval(timer)
  //   }
  // }, [props.inViewport, props.DASHBOARD_API_POLL_TIMING])

  return (
    <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Grid
        container
        display = 'flex'
        justifyContent = 'space-between'
        alignItems = 'center'
        style = {{
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '2px' : '13px'
        }}
      >
        <Grid>
          <Typography variant="h6">
            Pipeline by Leads Rep
          </Typography>
        </Grid>

        <Grid>
          {
            props.mode === 'edit' ?
            <IconButton
              aria-label = 'view code'
              onClick = {() => props.setCardClose()}
              size = 'large'
            >
              {props.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
            : ''
          }
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <ReactApexChart
            options={options}
            series={seriesData}
            type='bar'
            height={350}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

export default LeadsPipeline;
