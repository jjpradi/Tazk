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
// import AlertDialog  from '../../common/Dialog';
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
import {CreateNotificationAction} from '../../../redux/actions/notification_actions'
import { getDateTimeFormat } from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import moment from 'moment';

class CashOutIn extends Component {
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
      !this.props.bank_creation_adjustment_list.length && context.headerLocationId !== 'null' && this.props.listBankCreationAdjustmentAction(
        this.storage?.employee_id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        context.headerLocationId,
      )
    );
    
    await this.setState({
      // CashOutIn_data: this.props.cashOutIn,
      headerupdate: context.headerLocationId
    });
  }

  async componentDidUpdate() {
    const context = this.context;
    if (context.headerLocationId !== this.state.headerupdate) {
      this.setState({headerupdate:context.headerLocationId})
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
          context.headerLocationId,
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

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidCashOutInAction(id)
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
      )
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
      // data.employee_id = this.storage?.employee_id;
      // const {location_name} = data
      // await this.props.updateCashOutInAction(data.id, data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
      //  await this.setState({ open: false })
      // } else {
      let CreateData = [...data].map((d) => {
        return {
          ...d,
          employee_id: this.storage?.employee_id,
          location_id: context.headerLocationId,
        };

       
      });
        // let data = {
        //   location_id: context.headerLocationId,
        //     specialNumber: '00',
        //        note: 'Pay(IN/OUT) Entry',
        //        voucherTypeId: 1,
        //      };
      
        const transData = {
          location_id: context.headerLocationId,
          specialNumber: '00',
          note: 'Pay(IN/OUT) Entry',
          voucherTypeId: 1,
        };
        const accountTransaction = [];
    
      let tempId = [];
        CreateData.forEach( i => {
          if(i.paymentModeLedgerId) tempId.push(i.paymentModeLedgerId)
          if(i.ledger_id) tempId.push(i.ledger_id)
        });
        const body = { 
          id:tempId,
          name: null
        }
      //  this.props.chartOfAccountsIdNameAction(body, (list) => { 
    
      //     list.forEach((d, i) => {
      //       const { id, creditSign, debitSign ,accountTypeName } = d;  
      //       const dd = { accountId: id, description: "" };
    
      //       if (
      //         CreateData.filter(f => f.ledger_id === id && f.cash_type === 'OUT').length
      //       ) {
      //        let total = 0
      //         let PayAmount = CreateData.filter(f => f.ledger_id === id && f.cash_type === 'OUT')   
      //         let sum =  PayAmount.map((d)=>d.amount)
      //         let numberArray = sum.map(Number)
      //         total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
      //       //  dd.amount = creditSign * total
      //        dd.amount = debitSign * total
      //        dd.description = PayAmount.map((d)=> d.reason).join(',')
      //         // Number(creditSign) === 1
      //         //   ? temp[d.name]?.amt
      //         //   : `-${temp[d.name]?.amt}`;
      //         accountTransaction.push(dd);
      //       }else if(CreateData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT').length){
      //         let total = 0
      //         let PayAmount = CreateData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT')
      //           let sum =  PayAmount.map((d)=>d.amount)
      //           let numberArray = sum.map(Number)
      //           total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
      //         dd.amount = creditSign * total
      //         dd.description = 'PayOut Entry'
      //         // Number(creditSign) === 1
      //         //   ? temp[d.name]?.amt
      //         //   : `-${temp[d.name]?.amt}`;
      //         accountTransaction.push(dd);
      //       } else if (CreateData.filter(f => f.ledger_id === id && f.cash_type === 'IN').length) {
      //         let total = 0
      //         let PayAmount = CreateData.filter(f => f.ledger_id === id && f.cash_type === 'IN')
      //         let sum =  PayAmount.map((d)=>d.amount)
      //         let numberArray = sum.map(Number)
      //         total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
      //         dd.amount = creditSign * total
      //         dd.description = PayAmount.map((d)=> d.reason).join(',')
      //         // Number(debitSign) === 1
      //         //   ? temp['Customer']?.amt
      //         //   : `-${temp['Customer']?.amt}`;
      //         accountTransaction.push(dd);
      //       }else if(CreateData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN').length){
      //         var total = 0;
      //         let PayAmount = CreateData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN')
      //         let sum =  PayAmount.map((d)=>d.amount)
      //         let numberArray = sum.map(Number)
      //         total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
      //         dd.amount = debitSign * total
      //         dd.description = 'PayIn Entry'
      //         // Number(creditSign) === 1
      //         //   ? temp[d.name]?.amt
      //         //   : `-${temp[d.name]?.amt}`;
      //         accountTransaction.push(dd);
    
      //       }
            
            
      //     });
         
          transData.accountTransaction = accountTransaction;
         
         const temp = { CreateData }

         temp.bank_id = this.props.bank_id

         if(this.props.type === 'CHEQUE_REPRESENT'){
          temp.chequeData = {
            cheque_id: this.props.paymentData.chequeData.id,
            presentedDate: this.props.paymentData.representDate ? this.props.paymentData.representDate : moment(data[0].date).format('YYYY-MM-DD'),
            presentedEmployee: this.props.paymentData.selectedEmployee,
            remarks: this.props.paymentData.remarks,
            chequeStatus: 5
          }
         }
         
         apiCalls(
           context.setModalTypeHandler,
           context.setLoaderStatusHandler,
           this.props.createCashOutInAction(
             temp,
             context.setModalTypeHandler,
             context.setLoaderStatusHandler,
             context.setModalStatusHandler,
             async (response) => {
               // const cookies = new Cookies();
              let storage = getsessionStorage()
               let emp_id = storage?.employee_id || '';
               if (response.status === 200) {
                 await this.props.getLoginRoleAction(
                   emp_id,
                   (role_name, token, content) => {
                     if (!roleType.includes(role_name)) {
                       let notify_type =
                         CreateData[0].cash_type === 'OUT'
                           ? notificationType('Payout')
                           : notificationType('Payin');
                       let notify_content = content?.filter(
                         (m) => m.notification_type === notify_type,
                       );
                       if (notify_content.length) {
                         let content_body = '';
                         CreateData.map((d, i) => {
                           let amount_value = d.amount || '';
                           let userData =
                             this.props.all_user_location.find(
                               (m) => m.employee_id === d.employee_id,
                             ) || {};
                           let ledgerData =
                             this.props.paymentReceipt.find(
                               (m) =>
                                 m.employee_id === d.employee_id &&
                                 m.ledger_id === d.ledger_id,
                             ) || {};
                           let ledgerName = ledgerData.ledger_name || '';
                           content_body = `${userData.username}  \n ₹ ${amount_value} \n${userData.location_name} \n${ledgerName} ,`;
                           this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
     
                           if (CreateData.length - 1 == i) {
                             return sendNtfy(
                               token,
                               notify_content[0]?.title,
                               content_body
                             );
                           }
                         });
                       }
                     }
                   },
                 );
   
                 // let data = {
                 //   location_id: context.headerLocationId,
                 //   specialNumber: '00',
                 //   note: 'Pay(IN/OUT) Entry',
                 //   voucherTypeId: 1,
                 // };
                 // const accountTransaction = [];
                 // data.accountTransaction = accountTransaction;
                 //   this.props.createTransactionAction(
                 //   data,
                 //   true,
                 //   this.context.setLoaderStatusHandler,
                 //   );
                 // await this.PayInledgerApi(CreateData)
                 if (this.props.type === 'BANKRECONCILIATION') {
                  this.props.handleClose()
                  this.props.handleReconciliate(response.data, CreateData)
                 }
                 else if(this.props.type === 'CHEQUE_REPRESENT'){
                  this.props.handleClose()
                 }
                 else if(this.props.type === 'MANUALMATCH') {
                  this.props.handleClose(response?.data?.accountTransaction_status[0]?.insertId)
                 }
                 else {
                 await this.props.history('/paymentreport');
                 }
                }
              },
              )
              );
            // })

      //  {this.state.open && <PaymentReceipt/>}
      //  await this.setState({ open: false })
    }else{
      // alert("Please Select One Location")
    }

  };

  contraSubmit = async (data) => {
    const context = this.context;
    if (data  && context.headerLocationId !== 'null') {
      // const {location_name} = data
      // await this.props.updateCashOutInAction(data.id, data,context.setModalTypeHandler,context.setLoaderStatusHandler,this.sample)
      //  await this.setState({ open: false })
      // } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createContraAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          context.setModalStatusHandler,
          (response, resData) => {
            // const cookies = new Cookies();
           let storage = getsessionStorage()
            let emp_id = storage?.employee_id || '';
            if (response === 200) {
              this.props.getLoginRoleAction(
                emp_id,
                (role_name, token, content) => {
                  if (!roleType.includes(role_name)) {
                    let notify_type = notificationType('Contra');
                    let notify_content = content?.filter(
                      (m) => m.notification_type === notify_type,
                    );
                    if (notify_content.length) {
                      data.map((d) => {
                        let amount_value = d.amount || '';
                        let ToledgerName = d.to_ledger_name || '';
                        let fromLedgerName = d.from_ledger_name || '';
                        const Locationdata =
                          this.props.all_user_location.find(
                            (d) => d.location_id === context.headerLocationId,
                          ) || {};
                        let content_body = `\n ₹ ${amount_value} \nFrom ${fromLedgerName} \nTo ${ToledgerName} \n${Locationdata.location_name}`;
                  
                        this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
  
                        return sendNtfy(
                          token,
                          notify_content[0]?.title,
                          content_body
                        );
                      });
                    }
                  }
                },
              );
              if (this.props.type === 'BANKRECONCILIATION') {
                  this.props.handleClose()
                  this.props.handleReconciliate(resData.data, data)
              } else {
              this.props.history('/paymentreport');
              }
            }
          },
        )
        
        );

      //  {this.state.open && <PaymentReceipt/>}
      //  await this.setState({ open: false })
    }else{
      this.setState({openAlert : true})
    }

  };
  PayInledgerApi = (PayInData) => {
    const context = this.context;
    const data = {
      location_id: context.headerLocationId,
      specialNumber: '00',
      note: 'Pay(IN/OUT) Entry',
      voucherTypeId: 1,
    };
    const accountTransaction = [];

    let tempId = [];
    PayInData.forEach( i => {
      if(i.paymentModeLedgerId) tempId.push(i.paymentModeLedgerId)
      if(i.ledger_id) tempId.push(i.ledger_id)
    });
    const body = { 
      id:tempId,
      name: null
    }
   this.props.chartOfAccountsIdNameAction(body, (list) => { 

      list.forEach((d, i) => {
        const { id, creditSign, debitSign ,accountTypeName } = d;  
        const dd = { accountId: id, description: "" };


        if (
          PayInData.filter(f => f.ledger_id === id && f.cash_type === 'OUT').length
        ) {
          
          let PayAmount = PayInData.filter(f => f.ledger_id === id && f.cash_type === 'OUT')[0]
          dd.amount = debitSign * PayAmount.amount
          dd.description = PayAmount.reason
          // Number(creditSign) === 1
          //   ? temp[d.name]?.amt
          //   : `-${temp[d.name]?.amt}`;
          accountTransaction.push(dd);
        }else if(PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT').length){
          let total = 0
          let PayAmount = PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT')
            let sum =  PayAmount.map((d)=>d.amount)
            let numberArray = sum.map(Number)
            total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
          dd.amount = creditSign * total
          dd.description = 'PayOut Entry'
          // Number(creditSign) === 1
          //   ? temp[d.name]?.amt
          //   : `-${temp[d.name]?.amt}`;
          accountTransaction.push(dd);
        } else if (PayInData.filter(f => f.ledger_id === id && f.cash_type === 'IN').length) {
          let PayAmount = PayInData.filter(f => f.ledger_id === id && f.cash_type === 'IN')[0]
          dd.amount = creditSign * PayAmount.amount
          dd.description = PayAmount.reason
          // Number(debitSign) === 1
          //   ? temp['Customer']?.amt
          //   : `-${temp['Customer']?.amt}`;
          accountTransaction.push(dd);
        }else if(PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN').length){
          var total = 0;
          let PayAmount = PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN')
          let sum =  PayAmount.map((d)=>d.amount)
          let numberArray = sum.map(Number)
          total = numberArray.reduce((partialSum, a) => Number(partialSum) + a, 0);
          dd.amount = debitSign * total
          dd.description = 'PayIn Entry'
          // Number(creditSign) === 1
          //   ? temp[d.name]?.amt
          //   : `-${temp[d.name]?.amt}`;
          accountTransaction.push(dd);

        }

        if (list.length - 1 === i) {
          data.accountTransaction = accountTransaction;
        }

        
      });
    })





    // this.props.chartOfAccounts.forEach((d) => {
    //   const { id, creditSign, debitSign ,accountTypeName } = d;
    //   const dd = { accountId: id, description: "" };


    //   if (
    //     PayInData.filter(f => f.ledger_id === id && f.cash_type === 'OUT').length
    //   ) {
    //     let PayAmount = PayInData.filter(f => f.ledger_id === id && f.cash_type === 'OUT')[0]
    //     dd.amount = debitSign * PayAmount.amount
    //     dd.description = PayAmount.reason
    //     // Number(creditSign) === 1
    //     //   ? temp[d.name]?.amt
    //     //   : `-${temp[d.name]?.amt}`;
    //     accountTransaction.push(dd);
    //   }else if(PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT').length){
    //     let PayAmount = PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'OUT')[0]
    //     dd.amount = creditSign * PayAmount.amount
    //     dd.description = PayAmount.reason
    //     // Number(creditSign) === 1
    //     //   ? temp[d.name]?.amt
    //     //   : `-${temp[d.name]?.amt}`;
    //     accountTransaction.push(dd);
    //   } else if (PayInData.filter(f => f.ledger_id === id && f.cash_type === 'IN').length) {
    //     let PayAmount = PayInData.filter(f => f.ledger_id === id && f.cash_type === 'IN')[0]
    //     dd.amount = creditSign * PayAmount.amount
    //     dd.description = PayAmount.reason
    //     // Number(debitSign) === 1
    //     //   ? temp['Customer']?.amt
    //     //   : `-${temp['Customer']?.amt}`;
    //     accountTransaction.push(dd);
    //   }else if(PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN').length){
    //     let PayAmount = PayInData.filter(f => f.paymentModeLedgerId === id && f.cash_type === 'IN')[0]
    //     dd.amount = debitSign * PayAmount.amount
    //     dd.description = PayAmount.reason
    //     // Number(creditSign) === 1
    //     //   ? temp[d.name]?.amt
    //     //   : `-${temp[d.name]?.amt}`;
    //     accountTransaction.push(dd);

    //   }
    // });
    


    // this.props.createTransactionAction(
    //   data,
    //   true,
    //   this.context.setLoaderStatusHandler,
    // );
   
    return data;
  };

  PayOutAmountValidation = (value) => {
    const context = this.context;
    let data = { employee_id: this.storage?.employee_id, location_id: context.headerLocationId, cashboxId: value.cashboxId ? value.cashboxId : 'null', payment_id: value.payment_id ? value.payment_id : 'null'}
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getPayInAmountAction(data)
    );
  }

  PaymentDenominationvalidation = (value) => {
    const context = this.context;
    if(value){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getDenominationValidationByIdAction(value)
      );
    }
  }

  render() {
    // const filteredCol = stockLocation_col.length ? stockLocation_col.map((d) => ({ title: d, field: d }))
    //   : this.props.stocklocation[0] ?
    //     Object.keys(this.props.stocklocation[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | PayIn/Out </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalTypeHandler, setModalStatusHandler}) => (
            <div
              // style={{
              //   width: this.context.drawerOpen
              //     ? 'calc(100vw - 342px)'
              //     : 'calc(100vw - 143px)',
              // }}
              setModalStatusHandler={setModalStatusHandler}
              setModalTypeHandler={setModalTypeHandler}
            >
              {/* <AlertDialog delete={this.state.delete} handleClose={this.handleClose} handleDelete={this.handleDelete} id={this.state.id} />
        {this.state.open === false && <MaterialTable
          actions={[
            {
              icon: 'edit',
              tooltip: 'edit',
              position: 'row',
              onClick: (event, rowData) => this.handleEdit(rowData.paymentId)
            },
            {
              icon: 'delete',
              tooltip: 'Delete',
              onClick: (event, rowData) => this.handledialog(rowData.paymentId)
            },
            {
              icon: 'add',
              tooltip: 'add',
              isFreeAction: true,
              onClick: (event, rowData) => this.setState({ edit_id_data: [], open: true,status:'create' })
            }
          ]}

          options={{
            // fixedColumns: {
            //   left: 2,
            //   right: 0
            // },
            exportButton: true,
            filtering: true,
            actionsColumnIndex: -1,
            maxBodyHeight: '68vh',
            pageSize:20,
            pageSizeOptions:[20, 50, 100],
          }}
          // columns={
          //   this.props.stocklocation ? this.props.stocklocation.map((t) => 
          //     Object.keys(t).map((o) => { return { title: o, field: o } 
          //   }))[0] : []
          // }
          // columns={filteredCol}
          columns = {[
            {
              field:'paymentName',
              title:'Payment Name',
            },
            {
              field:'paymentType',
              title:'Payment Type',
            },
            {
              field:'shortCode',
              title:'Short Code',
            },
            {
              field:'bankName',
              title:'Bank Name',
            },
            {
              field:'accountNumber',
              title:'Account Number',
            },
            {
              field:'accountType',
              title:'Account Type',
            },
          ]}
          // components={{
          //   Row: props => <MTableBodyRow id="1" {...props} />
          //  }}
          data={
            this.props.cashOutIn ? this.props.cashOutIn.map((r,i) => {
              const {tableData, ...record} = r;
              return { i, ...record}
            }) : []
          
          }
          title="PaymentMethod"
        />}
        {this.state.open &&  */}
              <NewCashOutIn
                status={this.state.status}
                edit_id_data={this.props.cashOutIn_id_data}
                handleClose={this.handleClose}
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
                PaymentDenominationvalidation={this.PaymentDenominationvalidation}
                cashOutIn_denomination={this.props.cashOutIn_denomination}
                type={this.props.type}
                requestMode={this.props.requestMode}
                reconciliateData={this.props.reconciliateData}
                paymentData={this.props.paymentData}
                {...this.props}
                bankId={this.props.bankId}
              />
              {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} >
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
        { <LocationAlert open = {this.state.openAlert} onClose = {()=> this.setState({openAlert : false})}/>}
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
      return dispatch(top3Action(location_id, setModalTypeHandler, setLoaderStatusHandler));
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
    CreateNotificationAction:(data) => {
      dispatch(CreateNotificationAction(data))
    },
    getPayInAmountAction:(data) => {
      return dispatch(getPayInAmountAction(data))
    },
    getDenominationValidationByIdAction:(id,data) => {
      return dispatch(getDenominationValidationByIdAction(id,data))
    },
    chartOfAccountsIdNameAction: (body, setData) => {
      dispatch(chartOfAccountsIdNameAction(body, setData));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(CashOutIn));

