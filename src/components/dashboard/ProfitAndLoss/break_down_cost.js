import React, { useContext, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, Grid, Typography, Autocomplete, TextField, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import NoRecordFound from 'components/Layout/NoRecordFound';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { breakdowndayAction, breakdownmonthAction, breakdownweekAction, breakdownyearAction } from 'redux/actions/profitLossDashboardAction';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useTheme } from '@mui/material/styles';

function BreakDownCost(props) {
  // console.log("props", props)

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

  const { ProfitLossDashboardReducer: { 
    breakdownweek,
    breakdownmonth,
    breakdownyear, } } = useSelector((state) => state);

  useEffect(() => {
    if (val?.Name === 'Day') setData(props.data);
    else if (val?.Name === 'Week') setData(breakdownweek);
    else if (val?.Name === 'Month') setData(breakdownmonth);
    else if (val?.Name === 'Year') setData(breakdownyear);
    else setData([]);
  }, [val, breakdownweek, breakdownmonth, breakdownyear]);


  useEffect(() => {
    setLoaderStatusHandler(true);
  
    // if (val?.Name === 'Day') dispatch(breakdowndayAction(headerLocationId));
    
     if (val?.Name === 'Week') dispatch(breakdownweekAction(headerLocationId));
    else if (val?.Name === 'Month') dispatch(breakdownmonthAction(headerLocationId));
    else if (val?.Name === 'Year') dispatch(breakdownyearAction(headerLocationId));
  
    setLoaderStatusHandler(false);
  }, [val, dispatch, headerLocationId]);
  

console.log(data,"daewfgreg");


  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Grid container
        sx={{
          display : 'flex',
          alignItems: "center",
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '0px' : '10px'
        }}>
        <Grid>
          <Typography className='dashboard-card-title' variant='h6'>
            Breakdown Cost
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
          {props.mode === 'edit' && (
            <IconButton aria-label='view code' onClick={props.setCardClose} size='large'>
              {props.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          )}
        </Grid>
        </Grid>
      <Grid container spacing={2} direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <Grid padding='0px 0px 10px 0px' size={12}>
        {data.length > 0 ? (
          <ReactApexChart
            options={{
              chart: {
                type: 'bar',
                height: 200,
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: '55%',
                  endingShape: 'rounded',
                  dataLabels: {
                    position: 'top',
                  },
                },
              },
              dataLabels: {
                enabled: false,
                style: {
                  fontSize: '11px',
                  colors: ['#000000'],
                },
              },
              xaxis: {
                categories: data.map((v) => v.directentryDate),
              },
            }}
            series={[{ name: 'Breakdown Cost', data: data.map((v) => v.directexpenses) }]}
            type='bar'
            height={330}
          />
        ) : (
          <Grid container display='flex' justifyContent='center' alignItems='center'>
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

export default BreakDownCost;
