import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { Typography, Box, Card, IconButton, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { CostSummaryAction } from 'redux/actions/payrollDashboard_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
import { attendanceStatisticsAction, setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

function AttendanceStatistics(props) {
    const optionsRef = useRef(null);
    const dispatch = useDispatch();
    const [pollTimer, setPollTimer] = useState(null);
    const [chartoptions, setchartoptions] = useState({});
    // useEffect(() => {
    //     dispatch(attendanceStatisticsAction()).catch(error => {
    //         console.error('Error fetching cost summary:', error);
    //     });
    // }, [dispatch]);


    const { attendanceStatistics } = useSelector(state => state.DashboardRoleReducer);

   useEffect(() => {
    if (!props.data?.data) return;

    // Extract the X-axis categories (dates)
    const categories = props.data?.data.map(item =>
        moment(item.date).format('D') // Adjust the format as required
    ) || [];

    // Set series data from attendanceStatistics
    
    const seriesData = [
        {
            name: 'Present',
            data: props.data?.data.map(item => (item.isWeekOff === 1 ? 0 : item.checkInCount))
        },
        {
            name: 'Early Clock In',
            data: props.data?.data.map(item => (item.isWeekOff === 1 ? 0 : item.earlyCheckInCount))
        },
        {
            name: 'Late Clock In',
            data: props.data?.data.map(item => (item.isWeekOff === 1 ? 0 : item.lateCheckInCount))
        },
        {
            name: 'Absent',
            data: props.data?.data.map(item =>(item.isWeekOff === 1 ? 0 : item.absentCount))
        },
        {
            name: 'Early Clock Out',
            data: props.data?.data.map(item =>(item.isWeekOff === 1 ? 0 : item.earlyCheckOutCount))
        },
        {
            name: 'Week Off',
            data: props.data?.data.map(item => (item.isWeekOff === 1 ? 1 : 0)) 
        }

    ];

    

    const options = {
        series: seriesData,
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false,
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0
                    }
                }
            }
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 5,
                dataLabels: {
                    total: {
                        enabled: false,
                        style: {
                            fontSize: '12px',
                            fontWeight: "normal"
                        }
                    }
                }
            }
        },
        xaxis: {
            categories, // X-axis categories (dates)
            labels: {
                rotate: -45 // Rotate labels if needed for better visibility
            }
        },
        yaxis: {
            labels: {
                formatter: (value) => (value % 2 === 0 ? value : ''), // Show only even numbers
            },
            tickAmount: 10, // Adjust based on your max value
        },
        legend: {
            position: 'right',
            offsetY: 40
        },
        colors: [
            '#1E90FF',  // Available (Blue)
            '#32CD32',  // Early Clock In (Green)
            '#FFD700',  // Late Clock In (Gold)
            '#FF6347',  // Absent (Tomato)
            '#800080',  // Early Clock Out (Purple)
            '#99182e',  // Week Off (Red)
        ],
        
    };

    setchartoptions(options);
    optionsRef.current = options;
}, [attendanceStatistics]);

    

    // const pollData = () => {
    //     dispatch(attendanceStatisticsAction()).catch(error => {
    //         console.error('Error polling cost summary:', error);
    //     });
    // };

    // useEffect(() => {
    //     if (props.inViewport === true) {
    //         const timer = setInterval(pollData, props.DASHBOARD_API_POLL_TIMING);
    //         setPollTimer(timer);
    //         return () => clearInterval(timer);
    //     }
    // }, [props.inViewport, props.DASHBOARD_API_POLL_TIMING]);
    return (
        <Card
            ref={(el) => {
                props.ref1(el);
                props.isVisibleRef.current = el;
            }}
            sx={{ width: '100%', height: '100%', overflow: 'hidden' }}
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
                    <Typography
                        className='dashboard-card-title'
                        variant='h6'
                        align='left'
                    >
                        Attendance Statistics
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

                <Grid width={'100%'} height={'100%'} padding={'0px 0px 20px 0px'} >
                    <ReactApexChart options={chartoptions || {}} series={chartoptions?.series ? chartoptions?.series : []} type="bar" height={340} />
                </Grid>
            </Grid>
        </Card>
    );
}

export default useCommonRef(AttendanceStatistics);
