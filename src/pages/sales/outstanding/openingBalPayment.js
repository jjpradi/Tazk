import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
// import MaterialTable from 'utils/SafeMaterialTable';
import NewCashOutIn from '../../../components/NewCashOutIn';
import {
  listCashOutInAction,
  updateCashOutInAction,
  getbyidCashOutInAction,
  deleteCashOutInAction,
  createCashOutInAction,
  createContraAction,
  getPayInAmountAction,
  getDenominationValidationByIdAction,
} from '../../../redux/actions/cashOutIn_actions';
// import AlertDialog  from '../common/Dialog';
import {listPaymentMethodAction} from '../../../redux/actions/payment_method_actions';
import {
  listexpenseAction,
  top3Action,
} from '../../../redux/actions/paymentReceipt_actions';
import {
  chartOfAccountsIdNameAction,
  listChartOfAccountsdataAction,
  listPayIndataAction,
  listPayOutdataAction,
} from '../../../redux/actions/chartOfAccounts';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
// import { withRouter } from 'react-router-dom';
import withRouter from '../../../utils/custWithRouter';
import {listCashBoxDenominationAction} from '../../../redux/actions/cash_box_actions';
import {
  BankwithledgerAction,
  listBankCreationAdjustmentAction,
} from '../../../redux/actions/bankCreation_actions';
import {
  listCashBoxAction,
  listCashBoxAdjustmentAction,
} from '../../../redux/actions/cash_box_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import {listPaymentReceiptdateAction} from '../../../redux/actions/paymentReceipt_actions';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {CreateNotificationAction} from '../../../redux/actions/notification_actions';
import {getDateTimeFormat} from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import {Helmet} from 'react-helmet-async';
import {getsessionStorage} from 'pages/common/login/cookies';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import {titleURL} from 'http-common';
import {roleType} from 'utils/roleType';
import {Dialog} from '@mui/material';
import OpeningBalNewCashOutIn from './openBalNewCashOutIn';
import { openingBalPaymentAction } from '../../../redux/actions/ledger_actions';

class OpeningBalPayment extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      CashOutIn_data: [],
      open: true,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      openAlert: false,
    };
    this.cookies = new Cookies();
  }

  storage = getsessionStorage();

  async componentDidMount() {
    const context = this.context;
    if(this.props.open){
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listCashOutInAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.listChartOfAccountsdataAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.props.listPaymentMethodAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      // this.props.listexpenseAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.listPayIndataAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.listPayOutdataAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.props.top3Action(
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      // !this.props.cash_box_denomination.length && this.props.listCashBoxDenominationAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.BankwithledgerAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.listCashBoxAction(
      //   context.headerLocationId,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.props.listCashBoxAdjustmentAction(
        this.storage?.employee_id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        context.headerLocationId,
      ),
      !this.props.bank_creation_adjustment_list.length &&
        this.props.listBankCreationAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          'null',
        ),
    );
    }


    await this.setState({
      // CashOutIn_data: this.props.cashOutIn,
      headerupdate: context.headerLocationId,
    });
  }

  async componentDidUpdate() {
    const context = this.context;
    if(this.props.open){
      if (context.headerLocationId !== this.state.headerupdate) {
      this.setState({headerupdate: context.headerLocationId});
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listCashBoxAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          context.headerLocationId,
        ),
        this.props.listBankCreationAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          'null',
        ),
        this.props.top3Action(
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        // this.props.BankwithledgerAction(
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
      );
    }
      }

   
  }

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidCashOutInAction(id),
    );
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteCashOutInAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    if (data && context.headerLocationId !== 'null') {

      let CreateData = [...data].map((d) => {
        return {
          ...d,
          employee_id: this.storage?.employee_id,
          location_id: context.headerLocationId,
          ledger_id: this.props.openingBalData.ledger_id
        };
      });

      const body = {
        CreateData,
        openingBalData:this.props.openingBalData
      };

      console.log("ffdfdf", body);
      // return

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.openingBalPaymentAction(
          body,
          () => {
            this.props.handleClose();
          },
        ),
      );
    }
  };



  PayOutAmountValidation = (value) => {
    const context = this.context;
    let data = {
      employee_id: this.storage?.employee_id,
      location_id: context.headerLocationId,
      cashboxId: value.cashboxId ? value.cashboxId : 'null',
      payment_id: value.payment_id ? value.payment_id : 'null',
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getPayInAmountAction(data),
    );
  };

  PaymentDenominationvalidation = (value) => {
    const context = this.context;
    if (value) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getDenominationValidationByIdAction(value),
      );
    }
  };

  render() {
    // const filteredCol = stockLocation_col.length ? stockLocation_col.map((d) => ({ title: d, field: d }))
    //   : this.props.stocklocation[0] ?
    //     Object.keys(this.props.stocklocation[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
        <CreateNewButtonContext.Consumer>
          {({setModalTypeHandler, setModalStatusHandler}) => (
            <div
              setModalStatusHandler={setModalStatusHandler}
              setModalTypeHandler={setModalTypeHandler}
            >
              <Dialog
                open={this.props.open}
                // onClose={handleClose}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
                // maxWidth='sm'
                sx={{
                  '& .MuiDialog-container': {
                    '& .MuiPaper-root': {
                      width: '100%',
                      maxWidth: '1700px',
                      padding:'50px',
                    },
                  },
                }}
              >
                <OpeningBalNewCashOutIn
                  status={this.state.status}
                  edit_id_data={this.props.cashOutIn_id_data}
                  handleClose={this.props.handleClose}
                  notifyFunction={this.notifyFunction}
                  handleSubmit={this.handleSubmit}
                  contraSubmit={this.contraSubmit}
                  // chartOfAccounts={this.props.chartOfAccounts}
                  // payIndata={this.props.payIn_data}
                  payInAmount={this.props.payInAmount}
                  // payOutdata={this.props.payOut_data}
                  paymentMethod={this.props.paymentMethod}
                  // expense={this.props.expense}
                  top3={this.props.top3}
                  bankcreation={this.props.bank_creation_list}
                  cashbox={this.props.cash_box_list}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  PayOutAmountValidation={this.PayOutAmountValidation}
                  PaymentDenominationvalidation={
                    this.PaymentDenominationvalidation
                  }
                  cashOutIn_denomination={this.props.cashOutIn_denomination}
                  type={this.props.type}
                  {...this.props}
                />
              </Dialog>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
        {
          <LocationAlert
            open={this.state.openAlert}
            onClose={() => this.setState({openAlert: false})}
          />
        }
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    // cashOutIn: state.CashOutInReducer.cashOutIn || [],
    createContra: state.CashOutInReducer.createContra || [],
    cashOutIn_id_data: state.CashOutInReducer.cashOutIn_id_data || [],
    // chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    // payIn_data: state.ChartOfAccountsReducer.chartOfAccounts_payIn_data,
    // payOut_data: state.ChartOfAccountsReducer.chartOfAccounts_payOut_data,
    paymentMethod: state.paymentMethodReducer.paymentMethod,
    // expense: state.paymentReceiptReducer.expense,
    top3: state.paymentReceiptReducer.top3,
    // bank_creation_list: state.bankCreationReducer.bank_with_ledger || [],
    // cash_box_list: state.cashBoxReducer.cash_box_list || [],
    cash_box_adjustment_list:
      state.cashBoxReducer.cash_box_adjustment_list || [],
    bank_creation_adjustment_list:
      state.bankCreationReducer.bank_creation_adjustment_list || [],
    all_user_location: state.UserCreationReducer.all_user_location,
    paymentReceipt: state.paymentReceiptReducer.paymentReceipt,
    payInAmount: state.CashOutInReducer.payInAmount || [],
    cashOutIn_denomination: state.CashOutInReducer.cashOutIn_denomination || [],
    cash_box_denomination: state.cashBoxReducer.cash_box_denomination || [],
    bank_id: state.bankCreationReducer.bank_id,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    // listCashOutInAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     listCashOutInAction(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    listBankCreationAdjustmentAction: (
      employee_id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      headerLocationId,
    ) => {
      return dispatch(
        listBankCreationAdjustmentAction(
          employee_id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          headerLocationId,
        ),
      );
    },
    createCashOutInAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      setModalStatusHandler,
      response,
    ) => {
      return dispatch(
        createCashOutInAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
          response,
        ),
      );
    },
    createContraAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      setModalStatusHandler,
      response,
    ) => {
      return dispatch(
        createContraAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
          response,
        ),
      );
    },
    getbyidCashOutInAction: (id) => {
      return dispatch(getbyidCashOutInAction(id));
    },
    updateCashOutInAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        updateCashOutInAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteCashOutInAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteCashOutInAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    // listChartOfAccountsdataAction: (
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    // ) => {
    //   return dispatch(
    //     listChartOfAccountsdataAction(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //     ),
    //   );
    // },
    // listPayIndataAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     listPayIndataAction(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    // listPayOutdataAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     listPayOutdataAction(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    listPaymentMethodAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentMethodAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    // listexpenseAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(listexpenseAction(setModalTypeHandler, setLoaderStatusHandler));
    // },
    top3Action: (location_id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        top3Action(location_id, setModalTypeHandler, setLoaderStatusHandler),
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
    // BankwithledgerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     BankwithledgerAction(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    // listCashBoxAction: (headerLocationId,setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(listCashBoxAction(headerLocationId,setModalTypeHandler, setLoaderStatusHandler));
    // },
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
    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },
    createTransactionAction: (data, dd, setLoaderStatusHandler) => {
      dispatch(createTransactionAction(data, dd, setLoaderStatusHandler));
    },
    CreateNotificationAction: (data) => {
      dispatch(CreateNotificationAction(data));
    },
    getPayInAmountAction: (data) => {
      return dispatch(getPayInAmountAction(data));
    },
    getDenominationValidationByIdAction: (id, data) => {
      return dispatch(getDenominationValidationByIdAction(id, data));
    },
    chartOfAccountsIdNameAction: (body, setData) => {
      dispatch(chartOfAccountsIdNameAction(body, setData));
    },
    openingBalPaymentAction: (body, callback) => {
      dispatch(openingBalPaymentAction(body, callback));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(OpeningBalPayment));

