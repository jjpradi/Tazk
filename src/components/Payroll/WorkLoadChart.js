import React, { Component, useEffect, useContext, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { connect } from 'react-redux';
import _ from 'lodash';
import NoRecordFound from 'components/Layout/NoRecordFound';
import {Grid, Button, Typography, ButtonGroup, Card, IconButton} from '@mui/material';
import context from 'context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { getWorkLoadAction } from 'redux/actions/payrollDashboard_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

class PieChart extends React.Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);

    this.state = {
      pollTimer: null,
      headerLocation: "null"
    };
  }


  
  componentDidUpdate(preProps, preState) {
    const context = this.context;
    // if (!_.isEqual(preProps.data, this.props.data[0].data)) {
    //   this.forceUpdate(); // Ensures the chart re-renders when data changes
    // }
    // if (this.state.headerLocation !== context.headerLocationId) {
    //   this.setState({headerLocation: context.headerLocationId})
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getWorkLoadAction()
    //   );
    // }
    
    // if (preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getWorkLoadAction()
    //   );
    // }

    // if (preProps.inView !== this.props.inView && this.props.isEnabled) {
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getWorkLoadAction()
    //   );
    // }

  //   if((preProps.inViewport !== this.props.inViewport)){
  //     if(this.props.inViewport === true){
         
  //         setTimeout(() => {
  //             const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
  //             if(this.props.inViewport === true){
  //                 clearTimeout(timer)
  //             }
  //             this.props.setDashboardPollingTimerIdsAction(timer)
  //             this.setState({pollTimer : timer})
  //         },this.props.DASHBOARD_API_POLL_TIMING)
          

  //     }else{
  //         clearTimeout(this.state.pollTimer)
  //     }

  // }
  }

    // componentWillUnmount(){
    //   clearTimeout(this.state.pollTimer)
    // }


  // pollData = () => {
  //   const context = this.context;
  //       this.props.pollServer(
  //         this.props.getWorkLoadAction(context.headerLocationId),
  //       )
  //   }

  //   async componentDidMount(){
  //     const context = this.context
  //     if(this.props.inView && this.props.isEnabled){
  //         await this.props.getWorkLoadAction(context.headerLocation)
  //     }
  // }
convertHours(value) {
    const hoursInDay = 8;
    const hoursInWeek = hoursInDay * 5;
    const hoursInYear = hoursInWeek * 52;

    let remainingHours = value;

    const years = Math.floor(remainingHours / hoursInYear);
    remainingHours %= hoursInYear;

    const weeks = Math.floor(remainingHours / hoursInWeek);
    remainingHours %= hoursInWeek;

    const days = Math.floor(remainingHours / hoursInDay);
    remainingHours %= hoursInDay;

    const hours = Math.floor(remainingHours);
    remainingHours %= 1;

    const minutes = Math.round(remainingHours * 60);

    let result = '';
    if (years > 0) result += `${years}y `;
    if (weeks > 0) result += `${weeks}w `;
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim();
}

  render() {
    // console.log(this.props.data[0].data,"this.props");

    return (
      <>
        <Grid
          container
          ref={(el) => {
            this.props.ref1(el);
            this.props.isVisibleRef.current = el;
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
              <Grid container 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px',
                    paddingTop: this.props.mode === 'edit' ? '3px' : '13px',
                  }}
                >
                  <Grid>
                    <Typography
                      className='dashboard-card-title'
                      variant='h6'
                      align='left'
                    >
                      WorkLoad
                    </Typography>
                  </Grid>

                  <Grid>
                  {
                        this.props.mode === 'edit' ? 
                        <IconButton
                            aria-label='view code'
                            onClick={() => this.props.setCardClose()}
                            size='large'
                            >
                            {this.props.isEnabled ?  <this.props.VisibilityOffIcon /> : <this.props.VisibilityIcon />} 
                        </IconButton>
                        :
                        <></>
                      }
                  </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  {this.props.data?.[0]?.data?.length > 0 ? (
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'pie',
                        },
                        legend: {
                          formatter: (val, opts) => {
                            return `${val} : ${this.convertHours(
                              this.props.data[0].data[opts.seriesIndex]
                                ?.total_work_hours,
                            )}`;
                          },
                        },
                        tooltip: {
                          y: {
                            formatter: (val, opts) => {
                              return `${this.convertHours(
                                this.props.data[0].data[opts.seriesIndex]
                                  ?.total_work_hours,
                              )}`;
                            },
                          },
                        },
                        labels: _.map(this.props.data[0].data, 'empname'),
                        dataLabels: {
                          enabled: false,
                        },
                        responsive: [
                          {
                            breakpoint: 1400,
                            options: {
                              chart: {
                                width: '100%',
                                height: 330,
                              },
                              legend: {
                                position: 'bottom',
                                // align: 'left'
                              },
                              dataLabels: {
                                enabled: false,
                              },
                            },
                          },
                          {
                            breakpoint: 2100,
                            options: {
                              chart: {
                                width: '100%',
                                height: 330,
                              },
                              legend: {
                                position: 'right',
                                // align: 'left'
                              },
                              dataLabels: {
                                enabled: false,
                              },
                            },
                          },
                          {
                            breakpoint: 7000,
                            options: {
                              chart: {
                                width: '100%',
                                height: 330,
                              },
                              legend: {
                                position: 'right',
                                // align: 'left'
                              },
                              dataLabels: {
                                enabled: false,
                              },
                            },
                          },
                          {
                            breakpoint: 10000,
                            options: {
                              chart: {
                                width: '100%',
                                height: 330,
                              },
                              legend: {
                                position: 'right',
                                // align: 'left'
                              },
                              dataLabels: {
                                enabled: false,
                              },
                            },
                          },
                        ],
                      }}
                      series={_.map(
                        this.props.data[0].data,
                        'total_work_hours',
                      )}
                      // {[0,10,20,50]}
                      type='pie'
                      // height= {500}
                    />
                  ) : (
                    <Grid
                      container
                      display='flex'
                      justifyContent='center'
                      alignItems='center'
                      height={290}
                    >
                      <Grid paddingTop='93px'>
                        <NoRecordFound />
                      </Grid>
                    </Grid>
                  )}
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
    workLoadChart: state.PayrolldashboardReducers.workLoadChart || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getWorkLoadAction: () => {
      return dispatch(getWorkLoadAction());
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
  }
  };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(PieChart));
