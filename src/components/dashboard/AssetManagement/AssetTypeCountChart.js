import React, {Component} from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from "utils/apiCalls";
import { Card, CardContent, FormControl, Grid, IconButton, MenuItem, Select, Typography } from "@mui/material";
import { assetTypeCardChartAction } from "redux/actions/asset_actions";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import { connect } from "react-redux";
import ReactApexChart from "react-apexcharts";
import _ from 'lodash';
import NoRecordFound from "components/Layout/NoRecordFound";

class AssetTypeCountChart extends Component {
    static contextType = CreateNewButtonContext;

    constructor(props) {
        super(props)
        this.state = {
            chartData : {
                data : [],
                style : window.matchMedia("(min-width : 1024px)").matches
            },
            activeIndex : 0,
            pollTimer : null,
            headerLocation : "null",
            selectedMonth : 'current_month',
            data : [],
        }
    }

    // getCurrentMonth() {
    //     const date = new Date()
    //     return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`
    // }
    // getPreviousMonth() {
    //     const date = new Date()
    //     date.setMonth(date.getMonth() - 1)
    //     return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`
    // }

    async componentDidMount() {
        this.setState({ data : this.props?.data[0]?.current_month || [] })
    }

    // async componentDidUpdate(preProps, preState) {
    //     const context = this.context
    //     let res = {}
    //     if(preProps.data !== this.props.data) {
    //         this.setState({
    //             chartData : {
    //                 data : this.props.data || []
    //             }
    //         })
    //     }

    //     if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetTypeCardChartAction({selectedMonth: this.state.selectedMonth}, context.headerLocationId)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetTypeCardChartAction({selectedMonth: this.state.selectedMonth}, context.headerLocationId)
    //         )
    //     }

    //     if((preProps.inViewport !== this.props.inViewport)) {
    //         if(this.props.inViewport === true) {
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === true) {
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer : timer})
    //             }, this.props.DASHBOARD_API_POLL_TIMING)
    //         }
    //         else {
    //             clearTimeout(this.state.pollTimer)
    //         }
    //     }
    // }

    // componentWillUnmount() {
    //     clearTimeout(this.state.pollTimer)
    // }

    // pollData = () => {
    //     const context = this.context
    //     this.props.pollServer(
    //         this.props.assetTypeCardChartAction({selectedMonth: this.state.selectedMonth}, context.headerLocationId)
    //     )
    // }

    handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        // const date = selectedMonth === this.getCurrentMonth() ? this.getCurrentMonth() : this.getPreviousMonth()
        // this.setState({ selectedMonth: date }, () => {
        //     const context = this.context
        //     this.props.assetTypeCardChartAction({selectedMonth: this.state.selectedMonth}, context.headerLocationId)
        // })
        this.setState({ selectedMonth : selectedMonth, data : this.props?.data[0]?.[selectedMonth] })
    }

    render() {

        return (
            <>
                <Grid
                    container
                    ref = {(el) => {
                        this.props.ref1(el)
                        this.props.isVisibleRef.current = el
                    }}
                    width = '100%'
                    height = '100%'
                >
                    <Grid
                        width='100%'
                        height='100%'
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Card style={{ width : '100%', height : '100%' }}>
                                {/* <Grid container> */}
                                    <Grid 
                                        container 
                                        display = 'flex' 
                                        alignItems = 'center' 
                                        sx = {{ 
                                            padding : '18px', 
                                            paddingTop : this.props.mode === 'edit' ? '0px' : '10px' 
                                        }}
                                    >
                                        <Grid>
                                            <Typography variant="h6">CATEGORISED ASSETS</Typography>
                                        </Grid>

                                        <Grid style={{ marginLeft : 'auto', minWidth : '150px' }}>
                                            <FormControl 
                                                fullWidth 
                                                size='small'
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
                                                    value={this.state.selectedMonth}
                                                    onChange={this.handleMonthChange}
                                                >
                                                    <MenuItem value={'current_month'}>This month</MenuItem>
                                                    <MenuItem value={'last_month'}>Last month</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid>
                                            {
                                                this.props.mode === 'edit' ?
                                                <IconButton
                                                    aria-label="view code"
                                                    onClick={() => this.props.setCardClose()}
                                                    size='large'
                                                >
                                                    {this.props.isEnabled ? <this.props.VisibilityOffIcon /> : <this.props.VisibilityOffIcon />}
                                                </IconButton>
                                                :
                                                <></>
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
                                            this.state.data?.length > 0 ? (
                                                <>
                                                    <ReactApexChart 
                                                        options={{
                                                            plotOptions : {
                                                                pie : {
                                                                    donut : {
                                                                        size : '65%',
                                                                        background : 'transparent',
                                                                        labels : {
                                                                            show : true,
                                                                            name : {
                                                                                show : true,
                                                                                fontSize : '13px',
                                                                                fontFamily : 'Helvetica, Arial, Sans-serif',
                                                                                fontWeight : 400,
                                                                                color : undefined,
                                                                                offsetY : -10,
                                                                                formatter : (val) => {
                                                                                    return val
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            chart : {
                                                                type : 'donut',
                                                                // width : '100%',
                                                                // height : '100%'
                                                            },
                                                            legend : {
                                                                formatter : (val, opts) => {
                                                                    return `${val} : ${this.state?.data[opts.seriesIndex]?.count}`
                                                                }
                                                            },
                                                            labels : _.map(this.state?.data, 'assetType'),
                                                            responsive : [
                                                                {
                                                                    breakpoint : 1400,
                                                                    options : {
                                                                        chart : {
                                                                            width : '100%',
                                                                            height : 330
                                                                        },
                                                                        legend : {
                                                                            position : 'bottom'
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    breakpoint : 2100,
                                                                    options : {
                                                                        chart : {
                                                                            width : '100%',
                                                                            height : 330
                                                                        },
                                                                        legend : {
                                                                            position : 'bottom'
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    breakpoint : 7000,
                                                                    options : {
                                                                        chart : {
                                                                            width : '100%',
                                                                            height : 290
                                                                        },
                                                                        legend : {
                                                                            position : 'right'
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    breakpoint : 10000,
                                                                    options : {
                                                                        chart : {
                                                                            width : '100%',
                                                                            height : 290
                                                                        },
                                                                        legend : {
                                                                            position : 'right'
                                                                        }
                                                                    }
                                                                },
                                                            ]
                                                        }}
                                                        series={_.map(this.state?.data, 'count')}
                                                        type = 'donut'
                                                    />
                                                </>
                                            )
                                            :
                                            (
                                                <>
                                                    <Grid container display='flex' justifyContent='center' alignItems='center' height={290}>
                                                        <Grid paddingTop='93px'>
                                                            <NoRecordFound />
                                                        </Grid>
                                                    </Grid>
                                                </>
                                            )
                                        }
                                    </Grid>

                                {/* </Grid> */}
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        assetTypeCard : state.AssetReducers.assetTypeCard || []
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        assetTypeCardChartAction : ( selectedMonth) => {
            return dispatch(assetTypeCardChartAction(selectedMonth))
        },
        setDashboardPollingTimerIdsAction : (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(AssetTypeCountChart))