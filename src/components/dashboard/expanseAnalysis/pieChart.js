import React, { Component, useEffect, useContext, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { listTopExpensesAction } from '../../../redux/actions/profitloss_actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import {Grid, Button, Typography, ButtonGroup, Card, IconButton} from '@mui/material';
import context from '../../../context/CreateNewButtonContext';
import {useDispatch, useSelector} from 'react-redux';
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import {cellStyle, chartcellStyle} from 'utils/pageSize';
class PieChart extends React.Component {
  // static contextType = context;
  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     pollTimer: null,
  //     headerLocation: "null"
  //   };
  // }
  // // componentDidMount() {
  // //   if(this.props.inView){
  // //     this.props.listTopExpensesAction();
  // //   }
  // // }

  
  // componentDidUpdate(preProps, preState) {
  //   const context = this.context;

  //   if (this.state.headerLocation !== context.headerLocationId) {
  //     this.setState({headerLocation: context.headerLocationId})
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listTopExpensesAction(context.headerLocationId)
  //     );
  //   }
    
  //   if (preProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listTopExpensesAction(context.headerLocationId)
  //     );
  //   }

  //   if (preProps.inView !== this.props.inView && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listTopExpensesAction(context.headerLocationId)
  //     );
  //   }

  //   if((preProps.inViewport !== this.props.inViewport)){
  //     if(this.props.inViewport === true){
         
  //         setTimeout(() => {
  //             const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING)
  //             if(this.props.inViewport === false){
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
  //         this.props.listTopExpensesAction(context.headerLocationId),
  //       )
  //   }

  render() {

    return (
      <>
        <Grid 
            container 
            ref={(el) => {
                this.props.ref1(el); 
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
            {/* <Grid container>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <Typography
                    variant='h6'
                    style={{
                      textAlign: 'left',
                      fontWeight: '700',
                      // fontSize: 16,
                      textTransform: 'uppercase',
                      // paddingLeft:'10px'
                    }}
                  >
                    Expenses Breakdown
                </Typography>
            </Grid>
            </Grid> */}

            <Card style={{ width: '100%', height: '100%',  }}>
              <Grid container>
                <Grid container 
                  style={{
                    display:'flex', 
                    justifyContent:'space-between',  
                    alignItems:'center', 
                    padding:'18px', 
                    paddingTop : this.props.mode === 'edit' ? '3px' : '13px'
                  }}
                >
                    <Typography
                        className='dashboard-card-title'
                        variant='h6'
                        style={{
                          textAlign: 'left',
                          // fontSize: 16,
                          textTransform: 'uppercase',
                          // paddingLeft:'10px'
                        }}
                      >
                        Expenses Breakdown
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
                  {this.props.data.length > 0 && this.props.data[0].data.length > 0 ? (
                    <ReactApexChart
                    options={{
                      chart: {
                        type: 'pie',
                      },
                      legend: {
                        formatter: (val, opts) => {
                          return `${val} : ${this.props.data[0].data[opts.seriesIndex]?.Total_Amount}`
                        },
                        style: {
                          fontSize: chartcellStyle.fontSize,
                          fontWeight: chartcellStyle.fontWeight,
                          fontFamily: 'Poppins,sans-serif',
                        },
                      },
                      labels: _.map(this.props.data[0].data, 'name'),
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
                            },
                          },
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
                            },
                          },
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
                              style: {
                                fontSize: cellStyle.fontSize,
                                fontWeight: cellStyle.fontWeight,
                                fontFamily: 'Poppins,sans-serif',
                              },
                            },
                          },
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
                            },
                          },
                        },
                      ],
                    }}
                    series= {_.map(this.props.data[0].data, 'Total_Amount')} 
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
    top_expenses: state.profitlossReducer.top_expenses || [],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    listTopExpensesAction: (location_id) => {
      return dispatch(listTopExpensesAction(location_id));
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
  }
  };
};

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(PieChart));
