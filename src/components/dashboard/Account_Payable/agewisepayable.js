import React from 'react';
import {
  Grid,
  IconButton,
  Tooltip,
  Card,
  Button,
  Typography,
  Box,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ReactApexChart from 'react-apexcharts';
import { connect } from 'react-redux';
import moment from 'moment';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {getAgewiseAction} from '../../../redux/actions/purchase_actions'
import purchasesReducer from 'redux/reducers/purchases_reducers';
import {List_Aging_payable,getpayable_dueAction,getpayable_outstanding} from '../../../redux/actions/totAcc_actions'

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

class Agewise extends React.Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: 'OverDue',
          data: [],
          // data: this.props.consolidated_data.map((d)=> d.total_amount)
        },
        {
          name: 'Outstanding',
          data: [53, 32, 30, 45, 40],
        },
        //  {
        //   name: 'Tank Picture',
        //   data: [12, 17, 11, 9, 15, 11, 20]
        // }, {
        //   name: 'Bucket Slope',
        //   data: [9, 7, 5, 8, 6, 9, 4]
        // }, {
        //   name: 'Reborn Kid',
        //   data: [25, 12, 19, 32, 25, 24, 10]
        // }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        stroke: {
          width: 1,
          colors: ['#fff'],
        },
        // title: {
        //   text: 'Fiction Books Sales'
        // },
        xaxis: {
          categories: ['0-30', '31-60', '61-90', '91-120', '120+'],
          // labels: {
          //   formatter: function (val) {
          //     return val + "K"
          //   }
          // }
        },
        yaxis: {
          title: {
            text: undefined,
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + 'Days';
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
      },
    };
  }

  async componentDidMount() {
    const context = this.context;
  //  await this.props.getAgewiseAction(context.commoncookie,context.headerLocationId,context.setModalStatusHandler,context.setModalTypeHandler,context.setLoaderStatusHandler)
   await this.props.getpayable_dueAction(context.setLoaderStatusHandler)
   await this.props.getpayable_outstanding(context.setLoaderStatusHandler)
  }

  render() {
    return (
      <Card variant='outlined' style={{width: '100%'}} align='center'>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              sm: 12
            }}>
            <List sx={style} component='nav' aria-label='mailbox folders'>
              <Typography variant='body1'>Age wise Payables</Typography>
            </List>
            <Divider />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              sm: 12
            }}>
            <div id='chart'>
              <ReactApexChart
                options={this.state.options}
                series= {[
                  {
                    name: 'OverDue',
                    data: [...this.props.data],
                    // data: this.props.consolidated_data.map((d)=> d.total_amount)
                  },
                  {
                    name: 'Outstanding',
                    data: [53, 32, 30, 45, 40],
                  //  data:[...this.props.payable]
                  }
                 ]}
                type='bar'
                height={350}
              />
            </div>
          </Grid>
        </Grid>
      </Card>
    );
  }
}


const mapStateToProps = state => {
  return { 
    get_agewise :state.purchasesReducer.get_agewise || [],
    aging_payable:state.TotAccReducer.aging_payable || [],
    payable_due_days:state.TotAccReducer.payable_due_days || [],
    payable_Outstand:state.TotAccReducer.payable_Outstand || []
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAgewiseAction: (employee_id,headerLocationId,setModalTypeHandler,setLoaderStatusHandler) => {
    dispatch( getAgewiseAction(employee_id,headerLocationId,setModalTypeHandler,setLoaderStatusHandler))
  },
    List_Aging_payable: (setLoaderStatusHandler) => {
      dispatch( List_Aging_payable(setLoaderStatusHandler))
    },
    getpayable_dueAction: (setLoaderStatusHandler) => {
      dispatch( getpayable_dueAction(setLoaderStatusHandler))
    },
    getpayable_outstanding: (setLoaderStatusHandler) => {
      dispatch( getpayable_outstanding(setLoaderStatusHandler))
    },
  }
  
}
export default connect(mapStateToProps, mapDispatchToProps)(Agewise);;