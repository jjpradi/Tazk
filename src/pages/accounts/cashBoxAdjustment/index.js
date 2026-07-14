import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import {
  listCashBoxAdjustmentAction,
  createCashBoxAdjustmentAction,
} from '../../../redux/actions/cash_box_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import CashBoxAdjustment from '../../../components/NewCashBoxAdjustment';
import {listCashBoxDenominationAction} from '../../../redux/actions/cash_box_actions';
import Cookies from 'universal-cookie';
import {listCashBoxSummary} from '../../../redux/actions/cash_box_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';

class CashBoxCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      openAlert: false
    };
    this.cookies = new Cookies();
  }

 storage = getsessionStorage()

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCashBoxDenominationAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      this.props.listCashBoxAdjustmentAction(
        this.storage?.employee_id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        context.headerLocationId,
      )
      
	  );

    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  async componentDidUpdate() {
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listCashBoxAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          context.headerLocationId,
        )
      );
    }
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.discount_type_list
        .map((m) => {
          return m.discount_id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  //   handleDelete = async (id) => {
  //     const context = this.context;
  //     await this.props.deleteCashBoxAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     this.setState({ delete: false })
  //   }
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('cash_box_list', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res) => {
    if (res === true) {
      if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('cash_box_list', true);
      }
    }
    // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  };
  handleSubmit = async (data, emptyState) => {
    const context = this.context;

    if(context.headerLocationId === 'null'){
      this.setState({openAlert: true})
      return
    }
    const {ledger_id} = this.props.cash_box_adjustment_list.find( f => f.id === data.cash_box_id)

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.createCashBoxAdjustmentAction(
        {...data,ledger_id,location_id:context.headerLocationId},
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.responseDialog,
      ),
      this.props.listCashBoxSummary(data.cash_box_id)
	    );

    await this.setState({open: true});
    emptyState(true);
  };
  render() {

    return (
      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | CashBox Adjustment </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />

              <CashBoxAdjustment
                edit_id_data={this.state.edit_id_data}
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleSubmit={this.handleSubmit}
                {...this.props}
                setModalStatusHandler={setModalStatusHandler}
                type='NewCashBoxAdjustment'
                setModalTypeHandler={setModalTypeHandler}
              />
              <LocationAlert open={this.state.openAlert} onClose={ ()=> this.setState({openAlert: false})}/>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cash_box_adjustment_list:
      state.cashBoxReducer.cash_box_adjustment_list || [],
    cash_box_denomination: state.cashBoxReducer.cash_box_denomination || [],
    cash_box_summary: state.cashBoxReducer.cash_box_summary || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCashBoxAdjustmentAction: (
      employee_id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      headerLocationId,
    ) => {
      return dispatch(
        listCashBoxAdjustmentAction(
          employee_id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          headerLocationId,
        ),
      );
    },
    createCashBoxAdjustmentAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        createCashBoxAdjustmentAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    listCashBoxDenominationAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listCashBoxDenominationAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listCashBoxSummary:(id)=>{
      return dispatch(
        listCashBoxSummary(
          id
        ),
      );
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CashBoxCreation);

