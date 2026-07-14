import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, Typography, Tab, Tabs, CircularProgress ,IconButton, Grid} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { topAssetsByValueAction } from 'redux/actions/asset_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
import { attBasedDepartmentAction } from 'redux/actions/dashboard_role_actions';

function AttendanceByDep(props) {
  const dispatch = useDispatch();
  const { DashboardRoleReducer :{attBasedDepartment} } = useSelector((state) => state);

  // console.log(attBasedDepartment,"attBasedDepartment")

  // useEffect(() => {
  //   await dispatch(attBasedDepartmentAction());
  // }, [ dispatch]);

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

  const categories = props.data?.attBasedOnDept?.map((item) => item.department_name) || [];
  const attendancePercentages = props.data?.attBasedOnDept?.map((item) => item.attendance_percentage) || [];

  const options = {
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -10,
      formatter: (val) => `${val}%`,
    },
    xaxis: {
      categories,
    },
  };

  const series = [
    {
      name: 'Attendance Percentage',
      data: attendancePercentages,
    },
  ];
// console.log(attendancePercentages,"attendancePercentages");

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
            Attendance By Department
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
        options={options}
        series={series}
        type="bar"
        height="330"
        sx={{ fontSize: '12px', fontWeight: 'bold', mb: 1, color: '#191919' }}
      />
    </Card>
  );
}

export default useCommonRef(AttendanceByDep);
