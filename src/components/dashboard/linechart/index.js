import React from 'react';
import Speedometer from './speedometer';
import {Grid} from '@mui/material';
import {connect} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {getAllCustomerAction} from '../../../redux/actions/customer_actions';

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
      this.props.getAllCustomerAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
  }

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
              <Speedometer
                id='dial5'
                value={this.state.agx}
                title='1334 Days'
              />
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
                title='Acceleration Y'
                Totalvalue={this.getDifferenceInDays()}
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
    get_all_customer: state.customerReducer.Get_all_customer || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getAllCustomerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        getAllCustomerAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Speed);
