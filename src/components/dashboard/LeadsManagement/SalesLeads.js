import React, { useEffect, useRef, useState } from "react";
import useCommonRef from "pages/common/home/useCommonRef";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, Grid, IconButton, Typography } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import {  getSalesLeadsAction } from "redux/actions/leadManagement_actions";

function SalesLeadsChart (props) {

    const optionsRef = useRef(null)
    const dispatch = useDispatch()
    const [pollTimer, setPollTimer] = useState(null)
    const [chartOptions, setChartOptions] = useState({})

    const {
        leadManagementReducers : { getSalesLeads }
    } = useSelector((state) => state)

    // useEffect(() => {
    //     dispatch(getSalesLeadsAction())
    // }, [])

    useEffect(() => {
        if (!props.data) return;
        const categories = props.data.map((d) => d.lead_owner || '' )
    
        const seriesData = [
            { name: "New Business", data : props.data.map((e) => e.totalValue) },
        ]
    
        const options = {
            series: seriesData,
            chart: {
                type: 'bar',
                height: 400,
                stacked: true,
                toolbar: { show: false },
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
            colors: ['#4a90e2', '#1f3c88'],
            xaxis: {
                categories: categories,
                title: {
                    text: "Sum of Amount"
                }
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center'
            }
        }
        
        setChartOptions(options)
        optionsRef.current = options
    }, [props.data])

    // const pollData = () => {
    //     dispatch(getSalesLeadsAction())
    // }

    // useEffect(() => {
    //     if(props.inViewport === true) {
    //         const timer = setInterval(pollData, props.DASHBOARD_API_POLL_TIMING)
    //         setPollTimer(timer)
    //         return () => clearInterval(timer)
    //     }
    // }, [props.inViewport, props.DASHBOARD_API_POLL_TIMING])
    

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
            <Grid 
                container 
                display = 'flex' 
                justifyContent = 'space-between' 
                alignItems = 'center'
                style = {{
                    padding : '18px',
                    paddingTop : props.mode === 'edit' ? '2px' : '13px'
                }}
            >
                <Grid>
                    <Typography
                        className = 'dashboard-card-title'
                        align = 'left'
                        variant = 'h6'
                    >
                        Sales Leaderboard
                    </Typography>
                </Grid>

                <Grid>
                    {
                        props.mode === 'edit' ?
                        <IconButton
                            aria-label = 'view code'
                            onClick = {() => props.setCardClose()}
                            size = 'large'
                        >
                            {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                        </IconButton>
                        : ''
                    }
                </Grid>
            </Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <ReactApexChart 
                    options = {chartOptions || {}}
                    series = {chartOptions?.series ? chartOptions?.series : []}
                    type = 'bar'
                    height = {330}
                />
            </Grid>
        </Card>
    );
}

export default useCommonRef(SalesLeadsChart)