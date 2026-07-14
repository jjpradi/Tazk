import React from 'react';
import Speedometer from './speedometer';
import { Grid } from '@mui/material';
import { connect } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { listdebitor, consolidatedReceivings } from '../../../redux/actions/sales_actions';
import { consolidatedPayables } from '../../../redux/actions/purchase_actions'

import './styles.css';
import apiCalls from 'utils/apiCalls';

let incoming = {
  date: 1597107474849,
  data: {
    pitch: '0',
    roll: '0',
    yaw: '0',
    vgx: 50,
    vgy: 0,
    vgz: '-8',
    templ: '66',
    temph: '69',
    tof: '30',
    h: '20',
    bat: '90',
    baro: '172.62',
    time: '0',
    agx: '-12.00',
    agy: '-8.00',
    agz: '-980.00',
    location: '32.942690,-96.994845',
  },
  type: 'toy',
  drone_id: 'drone1',
};

class Speed extends React.Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      agx: incoming.data.vgx,
      agy: incoming.data.vgy,
    };
  }

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      context.headerLocationId,
      this.props.listdebitor(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler),
      this.props.consolidatedReceivings(context.setModalTypeHandler, context.setLoaderStatusHandler),
      this.props.consolidatedPayables(context.headerLocationId,context.setModalTypeHandler, context.setLoaderStatusHandler),
	  );
  }

  creditedDays = () => {
    let result = []
    this.props.consolidated_data.map((a, i) => {
      let p = a.avgCredit_days
      return result.push(p)
    })
    return result
  }

  debitedDays = () => {
    let result1 = []
    this.props.consolidated_bata.map((b, i) => {
      let e = b.avgCredit_days
      return result1.push(e)
    })
    return result1
  }

  getDifferenceInDays = () => {
    let result = [];

    this.props.sales.map((d) => {
      let invoice = d.invoice_date;
      let Fist = new Date(invoice);
      let second = new Date();
      const diffInMs = Math.abs(Fist - second);
      const diff = diffInMs / (1000 * 60 * 60 * 24);
      d.differenceDays = Math.round(diff);
      d.different = Math.max(d.differenceDays);
      return result.push(d.different);
      //return d.differenceDays 
    });
    return Math.max(...result);
  };
  render() {
    // const array1 = [1,3,5]
    return (
      <div className='App'>
        <div className='dials'>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              Average Creditor Days
              {/* ////////{this.props.consolidated_data.map((q, i) => { */}
              <Speedometer
                id='dial5'
                value={this.state.agx}
                title={this.creditedDays()}
                Totalvalue={this.creditedDays()}
              />
              {/*    */}
            </Grid>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              Average Debitor Days
              <Speedometer
                id='dial6'
                value={this.state.agy}
                title={this.debitedDays()}
                Totalvalue={this.debitedDays()}
              />
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    sales: state.salesReducer.list_debitor || [],
    consolidated_data: state.salesReducer.consolidated_data || [],
    consolidated_bata: state.purchasesReducer.consolidated_data || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listdebitor: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listdebitor(setModalTypeHandler, setLoaderStatusHandler));
    },
    consolidatedReceivings: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(consolidatedReceivings(setModalTypeHandler, setLoaderStatusHandler))
    },
    consolidatedPayables: (id,setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(consolidatedPayables(id,setModalTypeHandler, setLoaderStatusHandler))
    }

  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Speed);
