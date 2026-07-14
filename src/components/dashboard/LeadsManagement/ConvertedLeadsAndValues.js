import React, { useEffect, useRef, useState } from "react";
import useCommonRef from "pages/common/home/useCommonRef";
import { Box, Card, FormControl, Grid, IconButton, MenuItem, Select, Typography } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { convertedLeadsAndValuesAction } from "redux/actions/leadManagement_actions";
import moment from "moment";
import NoRecordFound from "components/Layout/NoRecordFound";

function ConvertedLeadsAndValuesChart(props) {

    const optionsRef = useRef(null)
    const dispatch = useDispatch()
    const [pollTimer, setPollTimer] = useState(null)
    const [chartOptions, setChartOptions] = useState({})
    const [selectType, setSelectType] = useState('Converted Leads Count')

    const {
        leadManagementReducers : { convertedLeadsAndValuesChart }
    } = useSelector((state) => state)

    // useEffect(() => {
    //     dispatch(convertedLeadsAndValuesAction())
    // }, [])

    useEffect(() => {
        if(!props?.data) return

        const lastFourMonths = Array.from({ length : 4 }, (_, i) => {
            const date = moment().subtract(i, 'months')
            return { month : date.month() + 1, year : date.year() }
        }).reverse()

        let customerDataMap = lastFourMonths.reduce((acc, { month, year }) => {
            acc[`${month}-${year}`] = 0
            return acc
        }, {})

        props?.data.forEach((entry) => {
            const key = `${entry.month}-${entry.year}`
            if (customerDataMap.hasOwnProperty(key)) {
                customerDataMap[key] = selectType === 'Converted Leads Count' ? entry.leadCount : entry.totalValue
            }
        })

        const categories = lastFourMonths.map(({ month, year }) => moment(`${year}-${month}-01`).format('MMM YYYY'))
        const seriesData = lastFourMonths.map(({ month, year }) => customerDataMap[`${month}-${year}`])

        const series = [
            {
                name: selectType,
                data: seriesData
            }
        ]

        const options = {
            series,
            chart : {
                type : 'bar',
                height : 350,
                stacked : true,
                toolbar : {
                    show : false
                },
                zoom : {
                    enabled : false
                }
            },
            selectedEvents : '',
            responsive : [
                {
                    breakpoint : 480,
                    options : {
                        legend : {
                            position : 'bottom',
                            offsetX : -10,
                            offsetY : 0
                        }
                    }
                }
            ],
            plotOptions : {
                bar : {
                    horizontal : false,
                    borderRadius : 5,
                    dataLabels : {
                        total : {
                            enabled : true,
                            style : {
                                fontSize : '12px',
                                fontWeight : 'normal'
                            }
                        }
                    }
                }
            },
            xaxis : { categories },
            legend : {
                position : 'right',
                offsetY : 40
            }
        }
        setChartOptions(options)
        optionsRef.current = options
    }, [props?.data, selectType])

    const handleChange = (event) => {
        setSelectType(event.target.value)
    }

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
                display='flex' 
                justifyContent='space-between' 
                alignItems='center' 
                sx = {{ 
                    padding : '18px', 
                    paddingTop : props.mode === 'edit' ? '0px' : '10px' 
                }}
            >
                <Grid>
                    <Typography
                        className = 'dashboard-card-title'
                        align = 'left'
                        variant = 'h6'
                    >
                        {selectType}
                        
                    </Typography>
                </Grid>

                <Grid style={{ marginLeft : 'auto', minWidth : '150px' }}>
                    <FormControl 
                        fullWidth
                        size = 'small'
                        sx = {{
                            '& .MuiOutlinedInput-root' : {
                              borderRadius : '10px !important',
                              backgroundColor : '#f7f7f7 !important',
                              color : '#808080',
                              height : '25px'
                            },
                            '& .MuiOutlinedInput-notchedOutline' : {
                              border : "none !important"
                            },
                            '& .MuiMenuItem-root' : {
                              color : 'none !important'
                            }
                        }}
                    >
                        <Select
                            value = {selectType}
                            onChange = {handleChange}
                        >
                            <MenuItem value = 'Converted Leads Count'>Converted Leads Count</MenuItem>
                            <MenuItem value = 'Converted Leads Values'>Converted Leads Values</MenuItem>
                        </Select>
                    </FormControl>
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
                {
                    props.data?.length ? (
                        <ReactApexChart 
                            options = {chartOptions || {}}
                            series = {chartOptions?.series ? chartOptions?.series : []}
                            type = 'bar'
                            height = {330}
                        />
                    ) : (<NoRecordFound />)
                }
            </Grid>
        </Card>
    );
}

export default useCommonRef(ConvertedLeadsAndValuesChart)