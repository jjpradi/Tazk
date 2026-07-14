import React, { useContext, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Autocomplete, Card, FormControl, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  dayAction,
  monthAction,
  weekAction,
  yearAction,
} from 'redux/actions/profitLossDashboardAction';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import _ from 'lodash';
import NoRecordFound from 'components/Layout/NoRecordFound';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { cellStyle, chartcellStyle } from 'utils/pageSize';
import { useTheme } from '@mui/material/styles';

function RevenueAndCost(props) {

  const theme = useTheme()
  const [val, setVal] = useState({ Name: 'Day' });
  const [data, setData] = useState([]);

  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(CreateNewButtonContext);

  const options = [
    { Name: 'Day' },
    { Name: 'Week' },
    { Name: 'Month' },
    { Name: 'Year' },
  ];
  // const { ProfitLossDashboardReducer: { month, day, week, year } } = useSelector((state) => state);

  const { day, week, month, year } = props.data?.[0] || {}

  // Effect to update data based on the selected value
  useEffect(() => {
    if (val?.Name === 'Day') setData(day || []);
    else if (val?.Name === 'Week') {
      dispatch(weekAction(headerLocationId, response => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    }
    else if (val?.Name === 'Month') {
      dispatch(monthAction(headerLocationId, response => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    }
    else if (val?.Name === 'Year') {
      dispatch(yearAction(headerLocationId, response => {
        if(response.status === 200) {
          setData(response.data)
        }
      }))
    }
    else setData([]);
  }, [val, day]);

  // Effect to fetch data on component mount
  // useEffect(() => {
  //   setLoaderStatusHandler;
  //   dispatch(dayAction(headerLocationId));
  //   dispatch(weekAction(headerLocationId));
  //   dispatch(monthAction(headerLocationId));
  //   dispatch(yearAction(headerLocationId));
  //   setLoaderStatusHandler(false);
  // }, [dispatch]);

  // console.log("data",data)


  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Grid container
        sx={{
          display : 'flex',
          alignItems: "center",
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '0px' : '10px'
        }}>
        {/* <Grid size={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> */}
        <Grid>
          <Typography className='dashboard-card-title' variant='h6'>
            Revenue And Cost
          </Typography>
        </Grid>
        <Grid style={{ marginLeft : 'auto', minWidth : '100px' }}>
          <FormControl fullWidth size='small'
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
            <Select
              value = {val?.Name}
              onChange = {(event) => setVal({ Name : event.target.value })}
            >
              <MenuItem value = 'Day'>Day</MenuItem>
              <MenuItem value = 'Week'>Week</MenuItem>
              <MenuItem value = 'Month'>Month</MenuItem>
              <MenuItem value = 'Year'>Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          {props?.mode === 'edit' && (
            <IconButton aria-label='view code' onClick={props?.setCardClose} size='large'>
              {props?.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          )}
        </Grid>
        </Grid>
      <Grid container spacing={2} direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <Grid
        size={{
          xs: 12,
          md: 12,
          lg: 12,
          sm: 12
        }}>
        {data?.length > 0 ? (
          <ReactApexChart
            options={{
              chart: {
                height: 200,
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
              // title: {
              //   text: 'Revenue V Costs',
              //   align: 'left',
              // },
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
              markers: {
                size: 0,
                hover: {
                  sizeOffset: 6,
                },
              },
              xaxis: {
                // type: 'datetime',
                categories: data.map((v) => v.entryDate),
              },
              tooltip: {
                y: [
                  {
                    title: {
                      formatter: function (val) {
                        return val;
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
                name: 'Revenue',
                data: data.map((v) => v.Revenue ?? 0)
              },
              {
                name: 'Cost',
                data: data.map((v) => v.Expenses ?? 0)
              },
            ]}
            type='line'
            height={330}
          />

        ) : (
          <Grid
            container
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <Grid paddingTop='70px'>
              <NoRecordFound />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
    </Card>
  );



}

export default RevenueAndCost;