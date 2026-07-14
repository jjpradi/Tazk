import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { getAvailableStockAction } from '../../../redux/actions/inventory_actions';
import { connect } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { Grid, TextField, Autocomplete, Card, Typography, IconButton } from '@mui/material'
import apiCalls from 'utils/apiCalls';
import useCommonRef from "../../../pages/common/home/useCommonRef";
import { headerStyle } from 'utils/pageSize';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import NoRecordFound from 'components/Layout/NoRecordFound';


class StockSummary extends React.Component {
  static contextType = context;
  constructor(props) {
    super(props);
    this.state = {
      pollTimer: null,
      headerLocation: 'null'
    };
  }

  render() {
    return (
      // <div style={{width: '100%'}}>
      // </div>
      <Card 
      ref={(el) => {
        this.props.ref1(el); 
        this.props.isVisibleRef.current = el
    }} 
      sx={{ width: '100%',height:'100%'}}>
        <Grid container 
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          alignItems='center'
          style={{ 
            padding : '18px', 
            paddingTop : this.props.mode === 'edit' ? '3px' : '13px'
          }}
        >
          <Grid>
          <Typography className='dashboard-card-title' variant='h6'>
          Available Stocks Amount by Category Summary
          </Typography>
          {/* <h3 style={{ fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight }}>{`Available Stocks Amount by Category Summary`}</h3> */}
          </Grid>
          <Grid
            sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          {
            this.props.data.length > 0 ? (

              <ReactApexChart options={{
                chart: {
                  type: 'bar',
                  stacked: true,
                  toolbar: {
                    show: false,
                  },
                },
                dataLabels: {
                  enabled: true,
                  enabledOnSeries: undefined,
                  formatter: function (val, opts) {
                    return val;
                  },
                  style: {
                    fontSize: "11px",
                    // fontWeight: "bold",
                    colors: ["#000000"],
                  }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '15%',
                    endingShape: 'rounded',
                    distributed: true,
                    dataLabels: {
                      position: 'top',
                    },
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
                  categories: this.props.data[0].data.map((a) => a.Category),
                  // labels: {
                  //   formatter: function (val) {
                  //     return val + "K"
                  //   }
                  // },
                  labels: {
                    formatter: function (val) {
                      return val
                    }
                  },
                  colors: ['#fff']
                },
                yaxis: {
                  labels: {
                    show: false
                  },
                },
                tooltip: {
                  y: {
                    formatter: function (val) {
                      return val
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
              }}
  
  
                series={[{
                  name: 'Product',
                  data: this.props.data[0].data.map((d) => d.total_price)
                }]} type="bar" height={330} />
            )
            : (
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
            )
          }
        </Grid>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    getavailablestock: state.inventoryReducer.getavailablestock,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAvailableStockAction: (headerLocationId, employee_id) => {
      return dispatch(getAvailableStockAction(headerLocationId, employee_id))
    },
    setDashboardPollingTimerIdsAction : (id) => {
      return dispatch(setDashboardPollingTimerIdsAction(id))
  }

  }
}
export default useCommonRef(connect(mapStateToProps, mapDispatchToProps)(StockSummary));