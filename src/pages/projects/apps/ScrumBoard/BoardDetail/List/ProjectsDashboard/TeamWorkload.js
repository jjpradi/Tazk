import React, { useEffect, useRef, useState } from "react";
import useCommonRef from "pages/common/home/useCommonRef";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, Grid, IconButton, Typography } from "@mui/material";
import ReactApexChart from "react-apexcharts";

function TeamWorkload (props) {

    const optionsRef = useRef(null)
    const dispatch = useDispatch()
    const [pollTimer, setPollTimer] = useState(null)
    const [chartOptions, setChartOptions] = useState({})

    const {
        PayrolldashboardReducers : { getTeamWorkLoad }
    } = useSelector((state) => state)


    // Menu toolbar to the top-right corner
    const chartRef = useRef(null)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const toolbar = chartRef.current?.querySelector('.apexcharts-toolbar')
            if (toolbar) {
            toolbar.style.position = 'absolute'
            toolbar.style.right = '10px'
            toolbar.style.top = '-20px'
            toolbar.style.transform = 'none'
            }
        });
        
        if (chartRef.current) {
            observer.observe(chartRef.current, { childList: true, subtree: true })
        }
        
        return () => observer.disconnect()
        }, [])

    useEffect(() => {
        if (!getTeamWorkLoad) return;
    
        const categories = getTeamWorkLoad.map((d) => d.name)
    
        const seriesData = [
            { name: "Distribution", data : getTeamWorkLoad.map((e) => e.percentage) },
        ]
    
        const options = {
            series: seriesData,
            chart: {
                type: 'bar',
                height: 400,
                stacked: true,
                toolbar: { show: true },
                zoom: { enabled: false }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 0,
                    dataLabels: {
                        total: {
                            enabled: true,
                            style: {
                                fontSize: '12px',
                                fontWeight: 'normal'
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val) => `${val}%`,
                style: {
                    fontSize: '12px',
                },
            },
            colors: ['#4a90e2', '#1f3c88'],
            xaxis: {
                categories: categories,
                title: {
                    text: "Total Work Distribution"
                }
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center'
            }
        }
        
        setChartOptions(options)
        optionsRef.current = options
    }, [getTeamWorkLoad])

    return (
        <Card
            ref = {(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            sx = {{
                width : '100%',
                height : '100%',
                overflow : 'hidden'
            }}
        >
            <Box height='100%' width='100%' p={3} px={4}>
                <Box width='100%'>
                    <Grid container display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography
                            className = 'dashboard-card-title'
                            align = 'left'
                        >
                            Team Workload
                        </Typography>

                    </Grid>
                </Box>

                <Box
                    width = '100%'
                    height = '100%'
                    padding = '0px 0px 20px 0px'
                    ref = {chartRef}
                >
                    <ReactApexChart 
                        options = {chartOptions || {}}
                        series = {chartOptions?.series ? chartOptions?.series : []}
                        type = 'bar'
                        height = {320}
                    />
                </Box>
            </Box>
        </Card>
    )
}

export default useCommonRef(TeamWorkload)