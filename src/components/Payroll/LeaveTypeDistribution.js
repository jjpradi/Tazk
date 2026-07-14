import React, { Component } from "react";
import { connect } from "react-redux";
import {leaveTypePercentageAction, setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import { Card, Grid, IconButton, Typography } from "@mui/material";
import _ from 'lodash';
import apiCalls from "utils/apiCalls";
import useCommonRef from "pages/common/home/useCommonRef";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import ReactApexChart from "react-apexcharts";
import NoRecordFound from "components/Layout/NoRecordFound";

class LeaveTypeDistribution extends Component {
    static contextType = CreateNewButtonContext;

    constructor(props) {
        super(props);
        this.state = {
            pollTimer: null,
            headerLocation: "null"
        };
    }

    render() {
        // const { leaveTypeDistribution } = this.props;

        const leaveTypeLabels = this.props.data?.leaveTypePercentage?.length && this.props.data?.leaveTypePercentage?.map((item) => item.leave_type || "Unknown") || [];
        const leaveTypeCounts = this.props.data?.leaveTypePercentage?.length && this.props.data?.leaveTypePercentage?.map((item) => item.leave_percentage || 0) || [];

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
                                    alignItems =' center' 
                                    sx = {{ 
                                        padding : '18px', 
                                        paddingTop : this.props.mode === 'edit' ? '3px' : '13px' 
                                    }}
                                >
                                    <Grid>
                                        <Typography variant='h6'>LeaveType Distribution</Typography>
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
                                        leaveTypeCounts.length > 0 ? (
                                            <>
                                                <ReactApexChart
                                                    options={{
                                                        chart: {
                                                            type: 'donut',
                                                        },
                                                        legend: {
                                                            markers: {
                                                                fillColors: ['#36BA98', '#FFC700', '#F44336',"#008FFB","#ff99cc","#339900","#e67300","#e6e600","#b30059","#99ffff", "#A569BD", '#5DADE2'],
                                                            }
                                                        },
                                                        labels: leaveTypeLabels,
                                                        fill: {
                                                            colors: ['#36BA98', '#FFC700', '#F44336',"#008FFB","#ff99cc","#339900","#e67300","#e6e600","#b30059","#99ffff", "#A569BD", '#5DADE2']
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
                                                                  position: 'bottom'
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
                                                    series={leaveTypeCounts}
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
        leaveTypeDistribution: state.DashboardRoleReducer.leaveTypeDistribution || [],
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        leaveTypePercentageAction: () => {
            return dispatch(leaveTypePercentageAction());
        },  
        setDashboardPollingTimerIdsAction: (id) => {
            return dispatch(setDashboardPollingTimerIdsAction(id));
        },
    };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(LeaveTypeDistribution));
