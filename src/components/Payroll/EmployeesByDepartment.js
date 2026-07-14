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
import { departmentBasedEmpAction, setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
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


  
  // componentDidUpdate(preProps, preState) {
  //   const context = this.context;

  //   if (this.state.headerLocation !== context.headerLocationId) {
  //     this.setState({headerLocation: context.headerLocationId})
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.departmentBasedEmpAction()
  //     );
  //   }
    
  //   if (preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.departmentBasedEmpAction()
  //     );
  //   }

  //   if (preProps.inView !== this.props.inView && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.departmentBasedEmpAction()
  //     );
  //   }

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
  // }

    // componentWillUnmount(){
    //   clearTimeout(this.state.pollTimer)
    // }


  // pollData = () => {
  //   const context = this.context;
  //       this.props.pollServer(
  //         this.props.departmentBasedEmpAction(context.headerLocationId),
  //       )
  //   }

  //   async componentDidMount(){
  //     const context = this.context
  //     if(this.props.inView && this.props.isEnabled){
  //         await this.props.departmentBasedEmpAction(context.headerLocation)
  //     }
  // }

  render() {
    // console.log(this.props.deptBasedEmployee,"deptBasedEmployee")
    const chartData = this.props.data?.map((item) => ({
      label: item.department_name || "Unknown Department",
      value: item.department_count || 0
    })) || [];

    const labels = chartData.map((data) => data.label);
    const series = chartData.map((data) => data.value);

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
              <Grid container spacing={2}>
                <Grid
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px',
                    paddingTop: '13px',
                  }}
                  size={12}>
                  <Typography
                    className='dashboard-card-title'
                    variant='h6'
                    align='left'
                    style={{paddingTop: '10px', paddingBottom: '10px', paddingLeft : '10px'}}
                  >
                    Employees by Department 
                  </Typography>
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
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  {series.length > 0 ? (
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'pie',
                        },
                        legend: {
                          formatter: (val, opts) => {
                            return `${val}: ${series[opts.seriesIndex]}`;
                          }
                        },
                        // tooltip: {
                        //   y: {
                        //     formatter: (val, opts) => {
                        //       return `${this.convertHours(
                        //         this.props.deptBasedEmployee[opts.seriesIndex]
                        //           ?.total_work_hours,
                        //       )}`;
                        //     },
                        //   },
                        // },
                        labels:labels,
                        dataLabels: {
                          enabled: false,
                        },
                        responsive: [
                          {
                            breakpoint: 1400,
                            options: {
                              chart: {
                                width: '100%',
                                height: 310,
                              },
                              legend: {
                                position: 'bottom'
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
                                height: 310,
                              },
                              legend: {
                                position: 'bottom'
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
                                height: 310,
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
                            breakpoint: 10000,
                            options: {
                              chart: {
                                width: '100%',
                                height: 310,
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
                        ],
                      }}
                      series={series}
                      type='pie'
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
    deptBasedEmployee: state.DashboardRoleReducer.deptBasedEmployee || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    departmentBasedEmpAction: () => {
      return dispatch(departmentBasedEmpAction());
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
  }
  };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(PieChart));
