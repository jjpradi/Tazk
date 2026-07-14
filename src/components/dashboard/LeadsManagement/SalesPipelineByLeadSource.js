import { Card, Grid, IconButton, Typography } from "@mui/material";
import NoRecordFound from "components/Layout/NoRecordFound";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import useCommonRef from "pages/common/home/useCommonRef";
import { Component } from "react";
import ReactApexChart from "react-apexcharts";
import { connect } from "react-redux";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import { approxValueBasedOnLeadSourceAction } from "redux/actions/leadManagement_actions";
import apiCalls from "utils/apiCalls";

class SalesPipelineByLeadSource extends Component{
    static contextType = CreateNewButtonContext

    constructor(props) {
        super(props)
        this.state = {
            pollTimer: null,
            headerLocation: "null"
        }
    }

    // async componentDidMount() {
    //     const context = this.context
    //     if(this.props.inView && this.props.isEnabled) {
    //         await this.props.approxValueBasedOnLeadSourceAction(context.headerLocation)
    //     }
    // }

    // async componentDidUpdate(preProps, preState) {
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
    //             this.props.approxValueBasedOnLeadSourceAction(context.headerLocation)
    //         )
    //     }

    //     if(preProps.inView !== this.props.inView && this.props.isEnabled) {
    //         apiCalls(
    //             context.setModalTypeHandler,
    //             context.setLoaderStatusHandler,
    //             this.props.approxValueBasedOnLeadSourceAction(context.headerLocation)
    //         )
    //     }

    //     if(preProps.inViewport !== this.props.inViewport) {
    //         if(this.props.inViewport === true) {
    //             setTimeout(() => {
    //                 const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
    //                 if(this.props.inViewport === true) {
    //                     clearTimeout(timer)
    //                 }
    //                 this.props.setDashboardPollingTimerIdsAction(timer)
    //                 this.setState({pollTimer: timer})
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
    //         this.props.approxValueBasedOnLeadSourceAction(context.headerLocation)
    //     )
    // }


    render() {
        const finalData = this.props.data.sort((a, b) => b.totalValue - a.totalValue)
        const data = []
        finalData
  .filter((val) => val.totalValue !== 0) // Filters out items with totalValue === 0
  .map((val) => data.push(val.totalValue));
        return (
            <Grid container
                    ref={(el) => {
                        this.props.ref1(el)
                        this.props.isVisibleRef.current = el
                    }}
                    width='100%'
                    height='100%'
            >
                <Grid
                    sx={12}
                    width='100%'
                    height='100%'
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12
                    }}>
                    <Card style={{width: '100%', height: '100%'}}>
                        <Grid container>
                            <Grid 
                                container 
                                display = 'flex' 
                                justifyContent = 'space-between' 
                                alignItems = 'center' 
                                sx = {{ 
                                    padding : '18px', 
                                    paddingTop : this.props.mode === 'edit' ? '2px' : '13px' 
                                }}
                            >
                                <Typography variant='h6'>SALES PIPELINE</Typography>

                                <Grid>
                                    {
                                        this.props.mode === 'edit' ?
                                            <IconButton
                                                aria-label='view code'
                                                onClick={() => this.props.setCardClose()}
                                                size='large'
                                            >
                                                {this.props.isEnabled ? <this.props.VisibilityOffIcon /> : <this.props.VisibilityIcon/>}
                                            </IconButton>
                                        : <></>
                                    }
                                </Grid>
                            </Grid>

                            <Grid
                                sx={{px: 5}}
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                {
                                    finalData.length > 0 ? (
                                        <ReactApexChart
                                            series={[
                                                {
                                                    name: 'Total Value',
                                                    data: data,
                                                },
                                              ]
                                            }
                                            options={{
                                                chart: {
                                                    type: 'bar',
                                                    height: 350,
                                                    toolbar:{
                                                        show: false
                                                    }
                                                },
                                                plotOptions: {
                                                    bar: {
                                                        borderRadius: 0,
                                                        horizontal: true,
                                                        barHeight: '80%',
                                                        isFunnel: true,
                                                    },
                                                },
                                                dataLabels: {
                                                    enabled: true,
                                                    formatter: function (val, opt) {
                                                        return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
                                                    },
                                                    style: {
                                                        colors: ['black'],
                                                        fontSize: '12px',
                                                      },
                                                },
                                                xaxis: {
                                                    categories: finalData.map((val) => val.name),
                                                    offsetX: 10, 
                                                },
                                                legend: {
                                                    show: false,
                                                },
                                            }}
                                            type="bar" 
                                            height={350}
                                        />
                                    )
                                    : (
                                        <Grid container display='flex' justifyContent='center' alignItems='center' height={290}>
                                            <Grid paddingTop='93px'>
                                                <NoRecordFound />
                                            </Grid>
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        approxValueBasedOnLeadSource: state.leadManagementReducers.approxValueBasedOnLeadSource
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        approxValueBasedOnLeadSourceAction: () => {
            return  dispatch(approxValueBasedOnLeadSourceAction())
        },
        setDashboardPollingTimerIdsAction: (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id))
        }
    }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(SalesPipelineByLeadSource));