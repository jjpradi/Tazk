import React from 'react';
import { Card, Grid, Typography, Box } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';

const TasksPriorityChart = () => {
  const getLevel = (priority) => {
    switch (priority) {
      case 1:
        return { icon: <KeyboardArrowDownIcon sx={{ color: 'primary.main', fontSize: 'small' }} />, name: 'Low' };
      case 2:
        return { icon: <DragHandleIcon sx={{ color: '#1976d2', fontSize: 'small' }} />, name: 'Medium' };
      case 3:
        return { icon: <KeyboardArrowUpIcon sx={{ color: 'error.main', fontSize: 'small' }} />, name: 'High' };
      case 4:
        return { icon: <KeyboardDoubleArrowUpIcon sx={{ color: 'error.main', fontSize: 'small' }} />, name: 'Highest' };
      default:
        return { icon: null, name: 'Invalid' };
    }
  };

  const getTaskPriority = useSelector((state) =>
    state.PayrolldashboardReducers?.getTaskPriority || []
  );

  const chartData = getTaskPriority.map((task) => getLevel(task.priority));
  const categories = chartData.map((item) => item.name);
  const seriesData = getTaskPriority.map((task) => task.priority_count);

  const chartOptions = {
    chart: { toolbar: { show: false }, type: 'bar', height: 300, stacked: true },
    dataLabels: { enabled: true, style: { fontSize: '11px', colors: ['#000000'] } },
    plotOptions: { bar: { horizontal: false } },
    xaxis: { categories },
    yaxis: { title: { text: undefined } },
    tooltip: { y: { formatter: (val) => ` ${val}` } },
    legend: { show: false }, // Hide the default legend
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid size={12}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            PRIORITY BREAKDOWN
          </Typography>
        </Grid>
        <Grid container spacing={1} size={12}>
          {chartData.map((item, index) => (
            <Grid key={index} sx={{ display: 'flex', alignItems: 'center' }} size={3}>
              <Box sx={{ marginRight: 1 }}>{item?.icon}</Box>
              <Typography variant="body2">{item.name}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid size={12}>
          <ReactApexChart
            options={chartOptions}
            series={[{ name: 'Tasks Priority', data: seriesData }]}
            type="bar"
            height={300}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default TasksPriorityChart;
