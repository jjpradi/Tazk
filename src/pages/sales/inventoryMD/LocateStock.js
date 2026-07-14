import React from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  listPaymentReceiptdataAllAction
} from "../../../redux/actions/paymentReceipt_actions";
import { listlocateproductAction, listInvManageAction } from '../../../redux/actions/inventory_actions';
import { connect } from 'react-redux';
import { Grid, TextField, Autocomplete, Card, Typography, IconButton, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Select, MenuItem } from '@mui/material'
import NoRecordFound from '../../../components/Layout/NoRecordFound'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import './index.css'
class LocateStock extends React.Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.date = new Date();
    this.state = {

      series: [{
        name: 'Product',
        data: []
      },
      ],
      options: {
        chart: {
          type: 'bar',
          stacked: true,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        stroke: {
          width: 1,
          colors: ['#fere']
        },
        // title: {
        //   text: 'Fiction Books Sales'
        // },
        xaxis: {
          categories: [],
          // labels: {
          //   formatter: function (val) {
          //     return val + "K"
          //   }
          // }
        },
        yaxis: {
          title: {
            text: undefined
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "K"
            }
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          offsetX: 40
        }
      },

      dashBoardData: [],
      sortOrder: 'asc',
      pollTimer : null

    };
  }

  async componentDidMount() {
    // if(this.props.inView && this.props.isEnabled ){
      const context = this.context;
      // await this.props.listlocateproductAction(context.commoncookie, context.headerLocationId)
      // await this.props.listInvManageAction(context.commoncookie,context.headerLocationId)
      const sortedData = this.props.data.length > 0 ? this.props.data[0].data.sort((a, b) => a.totalAmount - b.totalAmount) : [];
      this.setState({
        series: [{
          name: 'Available Stock',
          data: sortedData.map((d) => d.totalAmount)
        }],
        options: {
          ...this.state.options,
          xaxis: {
            categories: sortedData.map((d) => d.location)
          }
        }
      });
      // this.setState( {series: [{
      //   data: data1
      // }
      // ]})
    // }

  }

  // componentDidUpdate(prevProps, prevState) {
  //   const context = this.context;
    
  //   if (prevProps.inView !== this.props.inView && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listlocateproductAction(context.commoncookie, context.headerLocationId)
  //     );
  //   }
  
  //   if (prevProps.isEnabled !== this.props.isEnabled && this.props.isEnabled) {
  //     apiCalls(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       this.props.listlocateproductAction(context.commoncookie, context.headerLocationId)
  //     );
  //   }
  
  //   if (prevProps.inViewport !== this.props.inViewport) {
  //     if (this.props.inViewport === true) {
  //       setTimeout(() => {
  //         const timer = setInterval(() => this.pollData(), this.props.DASHBOARD_API_POLL_TIMING);
  //         if (this.props.inViewport === false) {
  //           clearTimeout(timer);
  //         }
  //         this.props.setDashboardPollingTimerIdsAction(timer);
  //         this.setState({ pollTimer: timer });
  //       }, this.props.DASHBOARD_API_POLL_TIMING);
  //     } else {
  //       clearTimeout(this.state.pollTimer);
  //     }
  //   }
  
  //   if (prevProps.getlocateproduct !== this.props.getlocateproduct) {
  //     const sortedData = this.props.getlocateproduct.sort((a, b) => {
  //       if (this.state.sortOrder === 'asc') {
  //         return a.totalAmount - b.totalAmount;
  //       } else {
  //         return b.totalAmount - a.totalAmount;
  //       }
  //     });
  //     this.setState({
  //       series: [{
  //         name: 'Available Stock',
  //         data: sortedData.map((d) => d.totalAmount)
  //       }],
  //       options: {
  //         ...this.state.options,
  //         xaxis: {
  //           categories: sortedData.map((d) => d.location)
  //         }
  //       }
  //     });
  //   }
  // }
  

  // componentWillUnmount(){
  //     clearTimeout(this.state.pollTimer)
  // }


  // pollData = () => {
  //   const context = this.context;

  //     this.props.pollServer(
  //       this.props.listlocateproductAction(context.commoncookie, context.headerLocationId)
  //     )
  // }



  render() {
    return (
      // </div>
      <Card 
        ref={(el) => {
          this.props.ref1(el); 
          this.props.isVisibleRef.current = el
        }} 
        sx={{ width: '100%',height:'100%' }}>
        <Grid container display='flex' alignItems='center' 
          style={{ 
            padding : '18px', 
            paddingTop : this.props.mode === 'edit' ? '0px' : '10px' 
          }}
        >
          <Grid>
            <Typography variant='h6'>{`Available Stocks by Location`}</Typography>
          </Grid>
          <Grid style={{ marginLeft : 'auto', width : '100px' }}>
          <FormControl fullWidth size='small'
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius : '10px !important',
                backgroundColor : '#f7f7f7 !important',
                color : '#808080',
                height : '25px'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: "none !important"
              },
              '& .MuiMenuItem-root' : {
                color : 'none !important'
              }
            }}
          >
              <Select
                value={this.state.sortOrder}
                onChange={(e) => {
                  const sortOrder = e.target.value;
                  const sortedData = this.props.data?.[0].data.sort((a, b) => {
                    if (sortOrder === 'asc') {
                      return a.totalAmount - b.totalAmount;
                    } else {
                      return b.totalAmount - a.totalAmount;
                    }
                  }) || [];
                  this.setState({
                    sortOrder,
                    series: [{
                      name: 'Available Stock',
                      data: sortedData.map((d) => d.totalAmount)
                    }],
                    options: {
                      ...this.state.options,
                      xaxis: {
                        categories: sortedData.map((d) => d.location)
                      }
                    }
                  });
                }}
              >
                <MenuItem value="asc">Asc</MenuItem>
                <MenuItem value="desc">Desc</MenuItem>
              </Select>
    </FormControl>
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
              ''
            }
          </Grid>
          </Grid>
        <Grid container display='flex' flexDirection='row' alignItems='center' style={{ marginBottom : '20px' }}>
        {this.props.data.length > 0 && this.props.data?.[0].data.length ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <div 
              style = {{ 
                maxHeight: '350px', 
                overflowY: 'hidden',
                overflowX: 'hidden',
                position : 'relative'
              }}
              onMouseEnter = {(e) => {
                e.currentTarget.style.overflowY = 'auto'
                e.currentTarget.style.overflowX = 'hidden'
              }}
              onMouseLeave = {(e) => e.currentTarget.style.overflowY = 'hidden'}
            >
            <style>
              {`
                ::-webkit-scrollbar-button {
                  display: none
                }
                ::-webkit-scrollbar {
                  width: 6px
                }
                ::-webkit-scrollbar-thumb {
                  background-color: #888;
                  border-radius: 10px
                }
                ::-webkit-scrollbar-thumb:hover {
                  background-color: #555
                }
              `}
          </style>
          <ReactApexChart
            options={{
              chart: {
                toolbar: {
                  show: false,
                },
                type: 'bar',
                height: 280,
                stacked: true,
              },
              dataLabels: {
                enabled: true,
                enabledOnSeries: undefined,
                formatter: function (val, opts) {
                  return val;
                },
                style: {
                  fontSize: "11px",
                  colors: ["#000000"],
                }
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  columnWidth: '40px'
                },
              },
              stroke: {
                width: 1,
                colors: ['#fere'],
              },
              xaxis: {
                categories: this.props.data?.[0].data.map((d) => d.location) || [],
              },
              yaxis: {
                title: {
                  text: undefined,
                },
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return 'Rs.' + val;
                  },
                },
              },
              fill: {
                opacity: 1,
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40,
              },
              displayCount: 10,
            }}
            series={[
              {
                name: 'Available Stock',
                data: this.props.data?.[0].data.map((d) => d.totalAmount) || [],
              },
            ]}
            type='bar'
            height={370}
          />
          </div>


        </Grid>
        ) : (
          <Grid
            display='flex'
            justifyContent='center'
            pt='100px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography
              sx={{
                fontSize: '16px',
                padding: '20px',
                color: 'gray',
              }}
            >
              {"No Record Found"}
            </Typography>
          </Grid>
        )}
      </Grid>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    getlocateproduct: state.inventoryReducer.getlocateproduct,
    NonmoveCategory: state.inventoryReducer.NonmoveCategory,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    listlocateproductAction: (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, result) => {
      return dispatch(listlocateproductAction(employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, result))
    },
    listInvManageAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listInvManageAction(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
    }
  }
}

export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(LocateStock));