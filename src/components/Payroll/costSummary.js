import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { Typography, Box, Card, IconButton, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { CostSummaryAction } from 'redux/actions/payrollDashboard_actions';
import useCommonRef from 'pages/common/home/useCommonRef';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

function CostSummary(props) {
    const optionsRef = useRef(null);
    const dispatch = useDispatch();
    const costSummary = props?.data[0]?.allowanceData
    const [pollTimer, setPollTimer] = useState(null);
    const [chartoptions, setchartoptions] = useState({});
    // useEffect(() => {
    //     dispatch(CostSummaryAction()).catch(error => {
    //         console.error('Error fetching cost summary:', error);
    //     });
    // }, [dispatch]);


    // Menu toolbar to the top-right corner
    const chartRef = useRef(null)
    useEffect(() => {
        const observer = new MutationObserver(() => {
          const toolbar = chartRef.current?.querySelector('.apexcharts-toolbar')
          if (toolbar) {
            toolbar.style.position = 'absolute'
            toolbar.style.right = '10px'
            toolbar.style.top = '-30px'
            toolbar.style.transform = 'none'
          }
        })
      
        if (chartRef.current) {
          observer.observe(chartRef.current, { childList: true, subtree: true })
        }
      
        return () => observer.disconnect()
      }, [])

    // const { costSummary } = useSelector(state => state.PayrolldashboardReducers);

    useEffect(() => {
        if (!costSummary) return;
    
        const calculateTotal = (value) =>
            value === null || value === undefined ? 0 : value;
    
        // 1. Get sorted unique months (as YYYY-MM)
        const months = Array.from(
            new Set(costSummary.map(item => `${item.year}-${item.month}`))
        ).sort((a, b) => new Date(`${a}-01`) - new Date(`${b}-01`));
    
        const categories = months.map(monthYear =>
            moment(new Date(`${monthYear}-01`)).format("MMM YYYY")
        );
    
        const uniqueAllowanceCodes = Array.from(
            new Set(costSummary.map(item => item.allowance_code))
        );
    
        // 2. Build original series
        const originalSeriesData = {};
        uniqueAllowanceCodes.forEach(code => {
            originalSeriesData[code] = Array(months.length).fill(0);
        });
    
        costSummary.forEach(item => {
            const { total, allowance_code, year, month } = item;
            const monthYear = `${year}-${month}`;
            const monthIndex = months.indexOf(monthYear);
            if (monthIndex !== -1) {
                originalSeriesData[allowance_code][monthIndex] = calculateTotal(total);
            }
        });
    
        // 3. Calculate total per bar (per month)
        const totalPerMonth = months.map((_, index) =>
            uniqueAllowanceCodes.reduce((sum, code) => sum + originalSeriesData[code][index], 0)
        );
    
        const maxStackHeight = Math.max(...totalPerMonth);
        const dynamicMinValue = maxStackHeight * 0.1; // 2% of max
    
        // 4. Adjust data to ensure visibility
        const adjustedSeriesData = {};
        uniqueAllowanceCodes.forEach(code => {
            adjustedSeriesData[code] = originalSeriesData[code].map(val =>
                val > 0 && val < dynamicMinValue ? dynamicMinValue : val
            );
        });
    
        // 5. Create final chart options
        const options = {
            series: uniqueAllowanceCodes.map(code => ({
                name: code,
                data: adjustedSeriesData[code]
            })),
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                toolbar: { show: false },
                zoom: { enabled: false }
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
                    borderRadius: 1,
                    //columnWidth: '80%',
                    dataLabels: {
                        total: {
                            enabled: true,
                            style: {
                                fontSize: '12px',
                                fontWeight: "bold"
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val, { seriesIndex, dataPointIndex }) => {
                    // const code = uniqueAllowanceCodes[seriesIndex];      
                    return val
                },
                style: {
                    fontSize: '10px',
                    colors: ['#fff'],
                    padding:'10px'
                }
            },
            tooltip: {
                y: {
                    formatter: (val, { seriesIndex, dataPointIndex }) => {
                        const code = uniqueAllowanceCodes[seriesIndex];
                        return originalSeriesData[code][dataPointIndex].toLocaleString();
                    }
                }
            },
            // yaxis: {
            //     labels: {
            //       formatter: function (val) {
            //         return val.toLocaleString(); // or use compact format if needed
            //       }
            //     }
            //   },
            xaxis: {
                categories
            },
            legend: {
                position: 'right',
                offsetY: 40
            }
        };
    
        setchartoptions(options);
        optionsRef.current = options;
    
    }, [costSummary]);
    
    
//     const pollData = () => {
//         dispatch(CostSummaryAction()).catch(error => {
//             console.error('Error polling cost summary:', error);
//         });
//     };

//     useEffect(() => {
//         if (props.inViewport === true) {
//             const timer = setInterval(pollData, props.DASHBOARD_API_POLL_TIMING);
//             setPollTimer(timer);
//             return () => clearInterval(timer);
//         }
//     }, [props.inViewport, props.DASHBOARD_API_POLL_TIMING]);
    return (
        <Card
            ref={(el) => {
                props.ref1(el);
                props.isVisibleRef.current = el;
            }}
            sx={{ width: '100%', height: '100%'}}
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
                        className = 'dashboard-card-title'
                        variant = 'h6'
                        align = 'left'
                    >
                        Cost Summary
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
                    <ReactApexChart options={chartoptions || {}} series={chartoptions?.series ? chartoptions?.series : []} type="bar" height={350} />
                </Grid>
            </Grid>
        </Card>
    );
}

export default useCommonRef(CostSummary);
