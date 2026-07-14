import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Grid, IconButton, Typography } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { experienceDetailsAction } from 'redux/actions/payrollDashboard_actions';
import useCommonRef from 'pages/common/home/useCommonRef';


function experienceCard(props) {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(experienceDetailsAction());
  // }, []);

  const {
    PayrolldashboardReducers: { experienceDetails, empexperienceDetails },
  } = useSelector((state) => state);

  // console.log(experienceDetails,empexperienceDetails, 'experienceDetails');

  const categories = props?.data.map((item) => item.age_category);
  const data = props?.data.map((item) => item.employee_count);

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
        horizontal: false,
        columnWidth: data.length === 1 ? '30%' : '70%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
    },
  };

  const series = [
    {
      data: data,
    },
  ];

  return (
    <Card
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{ width: '100%', height: '100%' }}>
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
            className='dashboard-card-title'
            variant='h6'
            align='left'
          >
            Employees by Experience
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

            options={options}
            series={series}
            type='bar'
            height = '350'
          />
        </Grid>
      </Grid>
    </Card>
  );
}

export default useCommonRef(experienceCard);
