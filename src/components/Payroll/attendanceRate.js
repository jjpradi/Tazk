import MaterialTable from 'utils/SafeMaterialTable';
import { Card, Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { useDispatch, useSelector } from 'react-redux';
import { averageWorkHourAction } from 'redux/actions/payrollDashboard_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
import { useTheme } from '@mui/material/styles';

function Attendancerate(props) {
  const [averageWorkHoursPercentage, setAverageWorkHoursPercentage] = useState(0);
  const dispatch = useDispatch();
  const theme = useTheme()
  const {
    PayrolldashboardReducers: { averageWorkHour },
  } = useSelector((state) => state);

  // useEffect(() => {
  //   dispatch(averageWorkHourAction(null));
  // }, [dispatch]);

  useEffect(() => {
    if (props?.data && Object.keys(props?.data).length > 0) {
      const percentageString = props?.data[0].average_worked_days_perc_all;
      const percentage = parseFloat(percentageString) || 0;
      setAverageWorkHoursPercentage(percentage);
    }
  }, [props?.data]);
  

  // const totalSeconds =
  //   averageNetworkHours.split(':').reduce((acc, value, index) => acc + parseInt(value, 10) * Math.pow(60, 2 - index), 0);

  // const maxvalue = Math.floor(totalSeconds / 3600) + 1;

  // const averageHours = Math.floor(totalSeconds / 3600);
  // const averageMinutes = Math.floor((totalSeconds % 3600) / 60);
  // const averageSeconds = totalSeconds % 60;

  // const formattedAverageNetworkHours = String(averageHours).padStart(2, '0');
  // const formattedAverageNetworkMinutes = String(averageMinutes).padStart(2, '0');
  // const formattedAverageNetworkSecondsRemainder = String(averageSeconds).padStart(2, '0');
  // const currentDate = new Date();
  // const currentMonth = currentDate.getMonth() + 1;
  // const currentYear = currentDate.getFullYear();
  // const lastDayOfMonth = new Date(currentYear, currentMonth, 0);


  // const totalDaycount = Array.isArray(averageWorkHour) ? averageWorkHour.reduce((total, item) => total + item.Daycount, 0) : 0;
  // const totalworkedDays = averageWorkHour?.length > 0 ? (totalDaycount / averageWorkHour.length).toFixed(2) : '0';
  // const totalDaysInMonth = lastDayOfMonth.getDate();
  // currentDate.setDate(currentDate.getDate() - 1);  // Subtract 1 day from currentDate

  // const yesterday = currentDate.getDate();
  // const splitIntervals = [0,2, 4,6,8,10,12, 14,16,18, 20,22, 25,27,29,31];

  // const validSplitIntervals = splitIntervals.filter(interval => interval <= totalDaysInMonth);

  // if (validSplitIntervals.length === 0 || validSplitIntervals[0] !== 0) {
  //   validSplitIntervals.unshift(0);
  // }
  
  let days = parseFloat(averageWorkHour.totalworkedDays);
  
  const customSegmentStops = [0, 20, 40, 60, 80, 100]; 

  return (
    <div
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
  }}
    style={{ height: '100%' }}>
      <Card sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      {
                        props.mode === 'edit' ?
                            <IconButton
                                aria-label='view code'
                                onClick={() => props.setCardClose()}
                                size='large'
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left:5
                                }}
                            >
                                {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                            </IconButton>
                            :
                            ''
                    }  
        <Grid sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Grid style={{ padding: '10px' }}>
          <Typography
              className='dashboard-card-title'
              variant='h6'
              align='left'
              style={{paddingTop: '10px', paddingBottom: '10px'}} >
              Average Attendance Rate
                
            </Typography>
          </Grid>
          <div id="chart" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ReactSpeedometer
              valueTextFontSize='11px'
              labelFontSize='11px'
              valueTextFontWeight='400'
              value={averageWorkHoursPercentage}
              minValue={0}
              maxSegmentLabels={5}
              width={260}
              // height={150}
              ringWidth={45}
              segments={6}
              needleHeightRatio={0.8}
              maxValue={100}
              // maxValue={maxvalue}
              // customSegmentStops={customSegmentStops}
              needleColor={theme.palette.primary.main}   
              startColor="#fe434c"
              endColor="#8aba00"
              textColor="black"
              currentValueText={`${props?.data?.[0]?.average_worked_days_perc_all || 0}%`}
            />
          </div>
        </Grid>
      </Card>
      <div id="html-dist"></div>
    </div>
  );
}

export default useCommonRef(Attendancerate);

