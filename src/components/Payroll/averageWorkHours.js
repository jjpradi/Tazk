import React, { useEffect, useState } from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { Card, Divider, Grid, IconButton, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { averageWorkHourAction } from 'redux/actions/payrollDashboard_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
import { useTheme } from '@mui/material/styles';

function AverageWorkHours(props) {
  const [averageNetworkHours, setAverageNetworkHours] = useState('00:00:00');
  const dispatch = useDispatch();
  const theme = useTheme()
  const {
    PayrolldashboardReducers: { averageWorkHour },
  } = useSelector((state) => state);

  useEffect(() => {
    // dispatch(averageWorkHourAction(null));
    setAverageNetworkHours(props?.data?.[0]?.average_network_hours === 0  || props?.data?.[0]?.average_network_hours === undefined ? '00:00:00' : props?.data?.[0]?.average_network_hours);
  }, [dispatch, props?.data[0]?.average_network_hours]);
   
  const adjustedTotalSeconds =
    averageNetworkHours.split(':').reduce((acc, value, index) => acc + parseInt(value, 10) * Math.pow(60, 2 - index), 0);
  const totalSeconds = Math.max(adjustedTotalSeconds, 0);
  const averageHours = Math.floor(totalSeconds / 3600);
  const averageMinutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedAverageNetworkHours = String(averageHours).padStart(2, '0');
  const formattedAverageNetworkMinutes = String(averageMinutes).padStart(2, '0');
  const splitIntervals = [0, 2, 4, 6, 9];
  const validSplitIntervals = splitIntervals.filter(interval => interval <= averageHours);

//console.log(formattedAverageNetworkHours,'averageNetworkHours');

let hoursText =  formattedAverageNetworkHours.toString();
let minutesText =  formattedAverageNetworkMinutes.toString();



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
            style={{paddingTop: '10px', paddingBottom: '10px'}}
          >Average Work Hours
          
          </Typography>
        </Grid>
        <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ReactSpeedometer
          valueTextFontSize='11px'
              labelFontSize='11px'
              valueTextFontWeight='400'
            width={260}
            ringWidth={45}
            maxValue={9} 
            minValue={0}
            value={averageHours}
            maxSegmentLabels={8}
            segments={6}
            needleHeightRatio={0.8}
            // customSegmentStops={splitIntervals}
            needleColor={theme.palette.primary.main}
            startColor="#fe434c"
            endColor="#8aba00"
            textColor="black"
            currentValueText={`${hoursText}h : ${minutesText}m`}
          />
        </Grid>
      </Grid>
      </Card>
    </div>
  );
}

export default useCommonRef(AverageWorkHours);
