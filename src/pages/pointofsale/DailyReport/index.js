import React, { Component } from 'react';
//import NewCustomer from '../../components/Customer';
import { connect } from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import {
  listPosSaleReportAction,
  listPosSaleActionlistPosSaleReportAction,
} from '../../../redux/actions/pos_sale_actions';
import {
  getAllReportCashOutInAction,
  getAllReportCashOutInContraAction,
  getAllPaymentReportAction,
} from '../../../redux/actions/cashOutIn_actions';
import { balanceenquiryOpeningclosing } from '../../../redux/actions/cash_box_actions';
import { transferreceiverDailyreport } from '../../../redux/actions/inventory_actions';
import { getCompanyAdminId, salesDailyReport, sendDailyReportMail } from '../../../redux/actions/sales_actions';
import { DailyreportpurchaseAction } from 'redux/actions/purchase_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import DailyReport from '../../../components/NewDailyReport';
import Cookies from 'universal-cookie';
import http, { titleURL } from '../../../http-common';
import { getDateTimeFormat, getDateFormat, commonDateFormat } from '../../../utils/getTimeFormat';
import { locationcashboxdenomination, listCashBoxAdjustmentAction, cashboxOpeningClosing, cashboxPaymentEntry, cashboxReceiptEntry } from '../../../redux/actions/cash_box_actions';
import notificationType from '../../../firebase/notify_type';
import { sendNtfy } from '../../../firebase/firebase.service';
import {
  getLoginRoleAction
} from '../../../redux/actions/userRole_actions';
import { CreateNotificationAction } from '../../../redux/actions/notification_actions';
import { createdailyReportStatusAction, listdailyReportStatusAction, cashbox_statusAction, cashbox_adjustmentReportAction } from '../../../redux/actions/reports_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { roleType } from 'utils/roleType';
import moment from 'moment';

class CashBoxCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      delete: false,
      id: '',
      cashDenomination: [],
      date: getDateFormat(new Date()),
      from: getDateFormat(new Date()),
      cash_box_id: null,
      cash_box_name:null,
      cash_box_ledger_id:null,
      locations_header: [],
      countcashboxlocation:[],
      openAlert: false
    };
    this.cookies = new Cookies();
  }
  storage = getsessionStorage()

  async componentDidMount() {
    const context = this.context;
    
    // await this.props.listCashBoxAdjustmentAction(
    //   context.commoncookie,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   context.headerLocationId,
    // );
    const data = {
      "date": this.state.date, "employee_id": this.storage?.employee_id, "location_id": context.headerLocationId, "type": "IN"
    };
    let cashbox_paymententry = {
      date: this.state.from,
      location:context.headerLocationId
    }

    apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPosSaleReportAction(
          this.storage?.employee_id,
          this.state.date,
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.locationcashboxdenomination(context.headerLocationId, this.state.date),
        this.props.cashboxOpeningClosing(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler ),
        this.props.getAllReportCashOutInAction(
          this.storage?.employee_id,
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.getAllReportCashOutInContraAction(
          this.storage?.employee_id,
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.salesDailyReport(
          this.storage?.employee_id,
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.DailyreportpurchaseAction(
          this.storage?.employee_id,
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),  
        this.props.transferreceiverDailyreport(
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),  
        this.props.cashbox_adjustmentReportAction(
          context.headerLocationId,
          this.state.date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),  
        // this.props.balanceenquiryOpeningclosing(
        //   this.state.date,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
        // this.props.getAllPaymentReportAction(
        //   data,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
       
        this.props.cashboxPaymentEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
        this.props.cashboxReceiptEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
        this.props.cashbox_statusAction(context.headerLocationId),
        // this.props.getCompanyAdminId(context.setModalStatusHandler, context.setLoaderStatusHandler)
       
    );

    let ApiCall = http
      .get(
        `/cashBox/dailyReport/cashDenimination/${this.storage?.employee_id
        }/${this.state.date}/${context.headerLocationId}`,
      )
      .then((res) => this.setState({ cashDenomination: res.data }));
    let ApiCalllocation = http
      .get(
        `/cashOutIn/location_filter/location_name/${context.headerLocationId}`,
      )
      .then((res) => this.setState({ locations_header: res.data }));

    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  test = () => {
    this.setState({ data: {} });
  };

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.discount_type_list
        .map((m) => {
          return m.discount_id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({ edit_id_data: getId, open: true });
    }
  };
  //   handleDelete = async (id) => {
  //     const context = this.context;
  //     await this.props.deleteCashBoxAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     this.setState({ delete: false })
  //   }
  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };

  ApplyButton = async (date, cash_box_id, cashboxname, ledger_id) => {
    const context = this.context;
    this.setState({ cash_box_id: cash_box_id, cash_box_name:cashboxname, cash_box_ledger_id: ledger_id, from:date })

    

    let statusdata = {
      date: date,
      location_id: context.headerLocationId,
      cashbox_id: this.props.cash_box_status[0]?.cashBox,

    }
   
    const data = {
      date: date,
      employee_id: this.storage?.employee_id,
      location_id: context.headerLocationId,
      type: 'IN',
    };
   
    // let datascash = {
    //   date:date,
    //   ledger_id:ledger_id
    // }
    let cashbox_paymententry = {
      date: date,
      location:context.headerLocationId
    }
    { this.props.cash_box_status.length > 0 &&
      apiCalls(
      this.props.listdailyReportStatusAction(statusdata, context.setModalStatusHandler, context.setLoaderStatusHandler))
    }

    apiCalls(
        context.setModalStatusHandler, 
        context.setLoaderStatusHandler,
        this.props.locationcashboxdenomination(context.headerLocationId, date),
        this.props.cashboxPaymentEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
        this.props.cashboxReceiptEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
       this.props.cashboxOpeningClosing(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler ),
      // this.props.listdailyReportStatusAction(statusdata, context.setModalStatusHandler, context.setLoaderStatusHandler),
        this.props.listPosSaleReportAction(
          this.storage?.employee_id,
          date,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.getAllReportCashOutInAction(
          this.storage?.employee_id,
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.getAllReportCashOutInContraAction(
          this.storage?.employee_id,
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.salesDailyReport(
          this.storage?.employee_id,
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.DailyreportpurchaseAction(
          this.storage?.employee_id,
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.transferreceiverDailyreport(
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ), 
        this.props.cashbox_adjustmentReportAction(
          context.headerLocationId,
          date,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),   
        
        // this.props.balanceenquiryOpeningclosing(
        //   date,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
        // this.props.getAllPaymentReportAction(
        //   data,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
       
    );
    let ApiCall = http
      .get(
        `/cashBox/dailyReport/cashDenimination/${this.storage?.employee_id
        }/${date}/${context.headerLocationId}`,
      )
      .then((res) => this.setState({ cashDenomination: res.data }));
 
    this.setState({ open: false });
  };

  handleClose = (cash_box_id, cashboxname, ledger_id) => {
    const currentDate = moment().format('YYYY-MM-DD')
    const context = this.context;
    this.setState({ cash_box_id: cash_box_id, cash_box_name:cashboxname, cash_box_ledger_id: ledger_id, from:currentDate })

    let statusdata = {
      date: currentDate,
      location_id: context.headerLocationId,
      cashbox_id: this.props.cash_box_status[0]?.cashBox,
    }
   
    const data = {
      date: currentDate,
      employee_id: this.storage?.employee_id,
      location_id: context.headerLocationId,
      type: 'IN',
    };
   
    let cashbox_paymententry = {
      date: currentDate,
      location:context.headerLocationId
    }
    { this.props.cash_box_status.length > 0 &&
      apiCalls(
      this.props.listdailyReportStatusAction(statusdata, context.setModalStatusHandler, context.setLoaderStatusHandler))
    }

    apiCalls(
        context.setModalStatusHandler, 
        context.setLoaderStatusHandler,
        this.props.locationcashboxdenomination(context.headerLocationId, currentDate),
        this.props.cashboxPaymentEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
        this.props.cashboxReceiptEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
       this.props.cashboxOpeningClosing(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler ),
        this.props.listPosSaleReportAction(
          this.storage?.employee_id,
          currentDate,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.getAllReportCashOutInAction(
          this.storage?.employee_id,
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.getAllReportCashOutInContraAction(
          this.storage?.employee_id,
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.salesDailyReport(
          this.storage?.employee_id,
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.DailyreportpurchaseAction(
          this.storage?.employee_id,
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.transferreceiverDailyreport(
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ), 
        this.props.cashbox_adjustmentReportAction(
          context.headerLocationId,
          currentDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),   
    );
    let ApiCall = http
      .get(
        `/cashBox/dailyReport/cashDenimination/${this.storage?.employee_id
        }/${currentDate}/${context.headerLocationId}`,
      )
      .then((res) => this.setState({ cashDenomination: res.data }));
 
    this.setState({ open: false });
  };


  Notificationsend = async (emp_id) => {
    const context = this.context;

    if ( this.props.cash_box_status.length>0  ) {
      if( this.props.cash_box_status.length !== this.state.countcashboxlocation[0].count){
         alert(`${this.state.locations_header[0].location_name} - Cash Box Not Closed`)
      }
      else{    
      let notdata = {
        creation_date: getDateFormat(new Date()),
        reason: 'Requested for Approval',
        requested_by: emp_id,
        cashbox_id: this.props.cash_box_status[0].cashBox,
        location_id: context.headerLocationId,   
        is_approvestatus: 'Pending'

      }
      let statusdata = {
        date: this.state.date,
        // cash_box_id: this.state.cash_box_id
        location_id:context.headerLocationId,
        cashbox_id: this.props.cash_box_status[0].cashBox,
      }
      await this.props.getLoginRoleAction(emp_id, async(role_name, token, content) => {
        if (!roleType.includes(role_name)) {
          let notify_type = notificationType('Daily Report');
          let notify_content = content?.filter(
            (m) => m.notification_type === notify_type,
          );
          if (notify_content.length) {

            let content_body = `Daily reports closing balance: ${ this.props.cashboxopeningclosing[0]?.closingbalance?.toFixed(2)  } for ${this.state.locations_header[0].location_name} `;
            sendNtfy(token, notify_content[0]?.title, content_body);

          await this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" })

          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.createdailyReportStatusAction(notdata, context.setModalStatusHandler, context.setLoaderStatusHandler),
            this.props.listdailyReportStatusAction(statusdata, context.setModalStatusHandler, context.setLoaderStatusHandler),
            this.props.cashbox_statusAction(context.headerLocationId),
            );

            let data = {
              message: `Daily reports closing balance: ${this.props.cashboxopeningclosing[0]?.closingbalance?.toFixed(2)} for ${this.state.locations_header[0].location_name}`,
              creation_date: getDateFormat(new Date()),
              reason: 'Approved',
              approved_by: this.props.getAdminId[0].employee_id,
              // cash_box_id: this.state.cash_box_id,
              location_id: context.headerLocationId,
              is_approvestatus: 'Approved',
              cashbox_id: this.props.cash_box_status[0].cashBox,
            };

            apiCalls(
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              this.props.sendDailyReportMail(data, context.setModalStatusHandler, context.setLoaderStatusHandler),
            );
          }
        }
      });
      }
    }
    else {
       alert(`${this.state.locations_header[0].location_name} - Cash Box Not Closed`)

    }
  }

  AdminApproval = async () => {
    const context = this.context;
    if (context.headerLocationId !== 'null') {
      // this.setState({statusdaily:'Approved'})

      let admindata = {
        creation_date: getDateFormat(new Date()),
        reason: 'Approved',
        approved_by: context.commoncookie,
        // cash_box_id: this.state.cash_box_id,
        location_id: context.headerLocationId,
        is_approvestatus: 'Approved',
        cashbox_id: this.props.cash_box_status[0].cashBox,
      }
      let statusdata = {
        date: this.state.date,
        location_id: context.headerLocationId,
        cashbox_id: this.props.cash_box_status[0].cashBox,
      }

      apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.createdailyReportStatusAction(admindata, context.setModalStatusHandler, context.setLoaderStatusHandler),
            this.props.cashbox_statusAction(context.headerLocationId),
            this.props.listdailyReportStatusAction(statusdata, context.setModalStatusHandler, context.setLoaderStatusHandler),
          );
    
    }
    else {
      this.setState({openAlert:true})
    }
  }

  headerupdate = 'null';
  async componentDidUpdate() {
    const context = this.context;
    let date = this.state.from;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) { 

      
      this.headerupdate = headerLocationId;
      const data = {
        date: date,
        employee_id: this.storage?.employee_id,
        location_id: context.headerLocationId,
        type: 'IN',
      };
      let cashbox_paymententry = {
        date: this.state.from,
        location:context.headerLocationId
      };
     
      apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listCashBoxAdjustmentAction(
            context.commoncookie,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            context.headerLocationId,
          ),
          this.props.locationcashboxdenomination(context.headerLocationId, date),
          this.props.cashboxOpeningClosing(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler ),
          this.props.cashboxPaymentEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
          this.props.cashboxReceiptEntry(cashbox_paymententry, context.setModalStatusHandler, context.setLoaderStatusHandler),
          this.props.listPosSaleReportAction(
            this.storage?.employee_id,
            date,
            context.headerLocationId,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
          // this.props.getAllReportCashOutInAction(
          //   this.storage?.employee_id,
          //   context.headerLocationId,
          //   date,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // ),
          // this.props.getAllReportCashOutInContraAction(
          //   this.storage?.employee_id,
          //   context.headerLocationId,
          //   date,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // ),
          this.props.salesDailyReport(
            this.storage?.employee_id,
            context.headerLocationId,
            date,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
          this.props.DailyreportpurchaseAction(
            this.storage?.employee_id,
            context.headerLocationId,
            date,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),  
          this.props.transferreceiverDailyreport(
            context.headerLocationId,
            date,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),  
          this.props.cashbox_adjustmentReportAction(
            context.headerLocationId,
            date,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),  

          // this.props.balanceenquiryOpeningclosing(
          //   date,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // ),
          // this.props.getAllPaymentReportAction(
          //   data,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // ),
          this.props.cashbox_statusAction(context.headerLocationId),
      
      );
      let ApiCall = http
        .get(
          `/cashBox/dailyReport/cashDenimination/${this.storage?.employee_id
          }/${date}/${context.headerLocationId}`,
        )
        .then((res) => this.setState({ cashDenomination: res.data }));
      let ApiCalllocation = http
        .get(
          `/cashOutIn/location_filter/location_name/${context.headerLocationId}`,
        )
        .then((res) => this.setState({ locations_header: res.data }));

        let ApiCallcashboxcountlocation= http
        .get(
          `/reports/Locationmappedcashboxcount/${context.headerLocationId}`,
        )
        .then((res) => this.setState({ countcashboxlocation: res.data }));

      // if(this.props.setModalStatusHandler)
    }
  }


  //   handleClose = (id) => {
  //     if (this.props.setModalStatusHandler) {
  //       this.props.setModalStatusHandler(false)
  //       this.props.setselectData('cash_box_list', false)
  //     }
  //     this.setState({ open: false, dialog: false, delete: false })

  //   }
  //   responseDialog = async (res) => {
  //     if (res === true) {
  //       if (this.props.setModalStatusHandler) {
  //         this.props.setModalStatusHandler(false)
  //         this.props.setselectData('cash_box_list', true)
  //       }
  //     }
  //     // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  //   }
  //   handleSubmit = async (data,emptyState) => {
  //     const context = this.context;

  //       await this.props.createCashBoxAdjustmentAction(data, context.setModalTypeHandler, context.setLoaderStatusHandler,this.responseDialog)

  //       await this.setState({ open: true })
  //       emptyState(true)
  //   }
  render() {

    return (
      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | DailyReport </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({ setModalStatusHandler, setModalTypeHandler }) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              

              <DailyReport
                open={this.state.open}
                setClose={() => this.setState({ open: false })}
                setOpen={() => this.setState({ open: true })}
                date={this.state.date}
                cash_box_id={this.state.cash_box_id}
                cash_box_name = {this.state.cash_box_name}
                cash_box_ledger_id = {this.state.cash_box_ledger_id}
                from={this.state.from}
                cashDenomination={this.state.cashDenomination}
                ApplyButton={this.ApplyButton}
                {...this.props}
                setModalStatusHandler={setModalStatusHandler}
                setModalTypeHandler={setModalTypeHandler}
                location_name={this.state.locations_header}
                Notificationsend={this.Notificationsend}
                AdminApproval={this.AdminApproval}
                handleClose = {this.handleClose}
              />
              <LocationAlert open={this.state.openAlert} onClose={ ()=> this.setState({openAlert:false})}/>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pos_sales_report: state.posSaleReducer.pos_sales_report || [],
    pos_sale_list: state.posSaleReducer.pos_sale_list || [],
    cashOutIn_daily_report: state.CashOutInReducer.cashOutIn_daily_report || [],
    sales_daily_report: state.salesReducer.sales_daily_report || [],
    purchase_daily_report: state.purchasesReducer.purchase_daily_report || [],
    transferreceiver_dailyreport: state.inventoryReducer.transferreceiver_dailyreport || [],
    cashOutIn_payment_type: state.CashOutInReducer.cashOutIn_payment_type || [],
    cashoutincontra_all: state.CashOutInReducer.cashoutincontra_all || [],
    bankopeningclosing: state.cashBoxReducer.bankopeningclosing || [],
    cash_box_summary: state.cashBoxReducer.locationcashbox || [],
    cash_box_adjustment_list:
    state.cashBoxReducer.cash_box_adjustment_list || [],
    get_daily_report_status: state.reportsReducer.get_status || [],
    cash_box_status:state.reportsReducer.cash_box_status || [],
    cashboxopeningclosing: state.cashBoxReducer.cashboxopeningclosing || [],
    cashbox_adjustment: state.reportsReducer.cashbox_adjustment || [],
    getAdminId: state.salesReducer.getAdminId || [],


  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listPosSaleReportAction: (
      employee_id,
      date,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listPosSaleReportAction(
          employee_id,
          date,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getAllReportCashOutInAction: (
      employee_id,
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getAllReportCashOutInAction(
          employee_id,
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getAllPaymentReportAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getAllPaymentReportAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    salesDailyReport: (
      employee_id,
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        salesDailyReport(
          employee_id,
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    DailyreportpurchaseAction: (
      employee_id,
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        DailyreportpurchaseAction(
          employee_id,
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    transferreceiverDailyreport: (
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        transferreceiverDailyreport(
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    cashbox_adjustmentReportAction: (
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        cashbox_adjustmentReportAction(
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getAllReportCashOutInContraAction: (
      employee_id,
      location_id,
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getAllReportCashOutInContraAction(
          employee_id,
          location_id,
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    balanceenquiryOpeningclosing: (
      date,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        balanceenquiryOpeningclosing(
          date,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
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
    locationcashboxdenomination: (id, date) => {
      return dispatch(
        locationcashboxdenomination(
          id, date
        ),
      );
    },
    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },
    CreateNotificationAction: (data) => {
      dispatch(CreateNotificationAction(data))
    },
    createdailyReportStatusAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(createdailyReportStatusAction(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    listdailyReportStatusAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listdailyReportStatusAction(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    cashboxOpeningClosing :(data, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(cashboxOpeningClosing(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    cashbox_statusAction: (id) => {
      return dispatch(cashbox_statusAction(id))
    },
    cashboxPaymentEntry :(data, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(cashboxPaymentEntry(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    cashboxReceiptEntry :(data, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(cashboxReceiptEntry(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    sendDailyReportMail :(data, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(sendDailyReportMail(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    getCompanyAdminId :( setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(getCompanyAdminId(setModalTypeHandler, setLoaderStatusHandler))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CashBoxCreation);

