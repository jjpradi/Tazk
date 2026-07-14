import React, { Component } from "react";
import { connect } from "react-redux";
import { genderPercentageAction, setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import { Card, Grid, IconButton, Typography } from "@mui/material";
import _ from 'lodash';
import apiCalls from "utils/apiCalls";
import useCommonRef from "pages/common/home/useCommonRef";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import ReactApexChart from "react-apexcharts";
import NoRecordFound from "components/Layout/NoRecordFound";

class GenderRatio extends Component {
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
    //         await this.props.genderPercentageAction(context.headerLocation)
    //     }
    // }

    // async componentDidUpdate(preProps, preState){
    //     const context = this.context
    //     let res = {}
    //     if(preProps.genderPercentage !== this.props.genderPercentage){
    //         this.setState({
    //             chartData: {
    //                 data: this.props.genderPercentage || []
    //             }
    //         })
    //     }
    //     if(preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.genderPercentageAction(context.headerLoactionId)
    //         )
    //     }
    //     if(preProps.inView !== this.props.inView && this.props.isEnabled){
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.genderPercentageAction(context.headerLoactionId)
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
    //         this.props.genderPercentageAction(context.headerLocationId)
    //     )
    // }

    render() {

        const { genderPercentage } = this.props;

        // Map gender values to labels
        const genderLabels = this.props.data?.genderRatio?.map((item) => {
          if (item.gender === null) return "Unknown";
          if (item.gender === 0) return "Other";
          if (item.gender === 1) return "Male";
          if (item.gender === 2) return "Female";
          return "Other";
        }) || [];
    
        // Extract series (counts)
        const genderCounts = this.props?.data?.genderRatio?.map((item) => item.gender_count) || [];

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
                                        paddingTop : this.props.mode === 'edit' ? '3px' : '13px'
                                    }}
                                >
                                    <Grid>
                                        <Typography variant='h6'>Gender Ratio</Typography>
                                    </Grid>

                                    <Grid>
                                        {
                                            this.props.mode === 'edit' ?
                                            <IconButton
                                                aria-label='view code'
                                                onClick={() => this.props.setCardClose()}
                                                size='large'
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
                                        genderCounts.length > 0 ? (
                                            <>
                                                <ReactApexChart
                                                    options={{
                                                        chart: {
                                                            type: 'donut',
                                                        },
                                                        legend: {
                                                            // formatter: (val, opts) => {
                                                            //     return `${val}: ${genderCounts[opts.seriesIndex]}`
                                                            // },
                                                            markers: {
                                                                fillColors: ['#36BA98', '#FFC700', '#F44336',"#008FFB"],
                                                            }
                                                        },
                                                        labels: genderLabels,
                                                        fill: {
                                                            colors: ['#36BA98', '#FFC700', '#F44336',"#008FFB"]
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
                                                                  position: 'bottom'
                                                                }
                                                              }
                                                            },
                                                            {
                                                              breakpoint: 7000,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 330
                                                                },
                                                                legend: {
                                                                  position: 'bottom'
                                                                }
                                                              }
                                                            },
                                                            {
                                                              breakpoint: 10000,
                                                              options: {
                                                                chart: {
                                                                  width: '100%',
                                                                  height: 330
                                                                },
                                                                legend: {
                                                                  position: 'bottom'
                                                                }
                                                              }
                                                            },
                                                        ],
                                                    }}
                                                    series={genderCounts}
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
        genderPercentage: state.DashboardRoleReducer.genderPercentage || [],
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        genderPercentageAction: () => {
            return dispatch(genderPercentageAction());
        },
        setDashboardPollingTimerIdsAction: (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id));
        },
    };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(GenderRatio));
