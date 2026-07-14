import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { epicProgressAction } from 'redux/actions/payrollDashboard_actions';

function EpicProgressChart(props) {
  const dispatch = useDispatch();

  const {
    PayrolldashboardReducers: { getEpicProgress = [] },
  } = useSelector((state) => state);

  useEffect(() => {
    if (props.projectId) {
      dispatch(epicProgressAction({ projectId: props.projectId }));
    }
  }, [props.projectId, dispatch]);

  
  const data = useMemo(() => {
    if (!Array.isArray(getEpicProgress) || getEpicProgress.length === 0) return [];

    return getEpicProgress.map((row) => {
      const epic_name = row.epic_name || row.epicName || row.name || 'Unnamed';
      const numericEntries = Object.entries(row).filter(
        ([k, v]) => k !== 'epic_name' && k !== 'epicName' && k !== 'name' && typeof v === 'number',
      );
      const total = numericEntries.reduce((sum, [, v]) => sum + v, 0) || 1;

      const pct = numericEntries.reduce((acc, [k, v]) => {
        acc[k] = `${Math.round((v / total) * 100)}%`;
        return acc;
      }, {});

      return { epic_name, ...pct };
    });
  }, [getEpicProgress]);

  const statuses = data.length
    ? Object.keys(data[0]).filter((key) => key !== 'epic_name')
    : [];

  const seriesData = statuses.map((status) => ({
    name: status,
    data: data.map((item) => parseFloat(String(item[status]).replace('%', '')) || 0),
  }));

  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const options = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '70%' } },
    colors: generateColors(statuses.length),
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((item) => item.epic_name),
      title: { text: 'Progress of your Epic' },
    },
    yaxis: { title: { text: '' } },
    legend: { position: 'top', horizontalAlign: 'center' },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return (
    <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box p={2} flex="1">
        <Typography variant="h6">Epic Progress</Typography>
        {data.length > 0 ? (
          <ReactApexChart options={options} series={seriesData} type="bar" height={350} />
        ) : (
          <Typography variant="body1">No data available</Typography>
        )}
      </Box>
    </Card>
  );
}

export default EpicProgressChart;
