import React, { Component } from "react";
import { connect } from "react-redux";
import { assetStatusCountAction } from "redux/actions/asset_actions";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import { Card, Grid, IconButton, Typography } from "@mui/material";
import _ from 'lodash';
import apiCalls from "utils/apiCalls";
import useCommonRef from "pages/common/home/useCommonRef";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import ReactApexChart from "react-apexcharts";
import NoRecordFound from "components/Layout/NoRecordFound";

class AssetStatusChart extends Component {
    static contextType = CreateNewButtonContext;

    constructor(props) {
        super(props);
        this.state = {
            pollTimer: null,
            headerLocation: "null"
        };
    }

    // async componentDidMount(){
    //     const context = this.context
    //     if(this.props.inView && this.props.isEnabled){
    //         await this.props.assetStatusCountAction(context.headerLocation)
    //     }
    // }

    // async componentDidUpdate(preProps, preState){
    //     const context = this.context
    //     let res = {}
    //     if(preProps.data !== this.props.data){
    //         this.setState({
    //             chartData: {
    //                 data: this.props.data || []
    //             }
    //         })
    //     }
    //     if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetStatusCountAction(context.headerLoactionId)
    //         )
    //     }
    //     if(preProps.inView !== this.props.inView && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.assetStatusCountAction(context.headerLoactionId)
    //         )
    //     }
    //     if(preProps.inViewport !== this.props.inViewport){
    //         if(this.props.inViewport === true){
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === true){
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer: timer})
    //             }, this.props.DASHBOARD_API_POLL_TIMING)
    //         } else{
    //             clearTimeout(this.state.pollTimer)
    //         }
    //     }
    // }

    // componentWillUnmount(){
    //     clearTimeout(this.state.pollTimer)
    // }

    // pollData = () => {
    //     const context = this.context
    //     this.props.pollServer(
    //         this.props.assetStatusCountAction(context.headerLocationId)
    //     )
    // }

    render() {
        return (
            <>
                <Grid 
                    container
                    ref={(el) => {
                        this.props.ref1(el)
                        this.props.isVisibleRef.current = el
                    }}
                    width='100%'
                    height='100%'
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
                        <Card style={{width: '100%', height: '100%'}}>
                            <Grid container>
                                <Grid 
                                    container 
                                    display = 'flex' 
                                    justifyContent = 'space-between' 
                                    alignItems = 'center' 
                                    style = {{ 
                                        padding : '18px', 
                                        paddingTop : '13px' 
                                    }}
                                >
                                    <Typography variant='h6'>ASSET STATUS</Typography>

                                    <Grid>
                                        {
                                            this.props.mode === 'edit' ?
                                            <IconButton
                                                aria-label='view code'
                                                onClick={() => this.props.setCardClose()}
                                                size='large'
                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                {this.props.isEnabled ? <this.props.VisibilityOffIcon/> : <this.props.VisibilityIcon/>}
                                            </IconButton>
                                            : <></>
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
                                        this.props?.data?.length > 0 ? (
                                            <>
                                                <ReactApexChart
                                                    options={{
                                                        chart: {
                                                            type: 'donut',
                                                        },
                                                        legend: {
                                                            formatter: (val, opts) => {
                                                                return `${val}: ${this.props?.data[opts.seriesIndex]?.value}`
                                                            },
                                                            markers: {
                                                                fillColors: ['#36BA98', '#FFC700', '#F44336'],
                                                            }
                                                        },
                                                        labels: _.map(this.props?.data, 'name'),
                                                        fill: {
                                                            colors: ['#36BA98', '#FFC700', '#F44336']
                                                        },
                                                        responsive: [
                                                            {
                                                              breakpoint: 1400,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 330
                                                                },
                                                                legend: {
                                                                  position: 'bottom',
                                                                  // align: 'left'
                                                                }
                                                              }
                                                            },
                                                            {
                                                              breakpoint: 2100,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 330
                                                                },
                                                                legend: {
                                                                  position: 'bottom',
                                                                  // align: 'left'
                                                                }
                                                              }
                                                            },
                                                            {
                                                              breakpoint: 7000,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 290
                                                                },
                                                                legend: {
                                                                  position: 'right',
                                                                  // align: 'left'
                                                                }
                                                              }
                                                            },
                                                            {
                                                              breakpoint: 10000,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 290
                                                                },
                                                                legend: {
                                                                  position: 'right',
                                                                  // align: 'left'
                                                                }
                                                              }
                                                            },
                                                        ],
                                                    }}
                                                    series={_.map(this.props?.data, 'value')}
                                                    type='donut'
                                                />
                                            </>
                                        )
                                        : (
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
                            </Grid>
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        assetStatusCount: state.AssetReducers.assetStatusCount || [],
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        assetStatusCountAction: () => {
            return dispatch(assetStatusCountAction());
        },
        setDashboardPollingTimerIdsAction: (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id));
        },
    };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(AssetStatusChart));
