import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
// import NewCashOutIn from '../../components/NewCashOutIn';
import CashOutIn from 'pages/accounts/cashOutIn';
import {
  getLoginRoleAction,
  
} from '../../../redux/actions/userRole_actions';
import {
  listPaymentReceiptAction,
  listPaymentReceiptdateAction,
  updatePaymentReceiptStatusAction,
  updatePaymentReceiptAction,
  getbyidPaymentReceiptAction,
  deletePaymentReceiptAction,
  createPaymentReceiptAction,
  set_searchPaymentreportAction,
  get_searchPaymentreportAction,
  getPayinPayoutByIdAction,
} from '../../../redux/actions/paymentReceipt_actions'; //, updatePaymentReceiptAction
import AlertDialog from '../../common/Dialog';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {TextField, Link, Button, InputAdornment, Tooltip, TablePagination} from '@mui/material';
import moment from 'moment';
import {listPaymentMethodAction, listPaymentTypeDetails} from '../../../redux/actions/payment_method_actions';
import {listChartOfAccountsdataAction} from '../../../redux/actions/chartOfAccounts';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {createCashOutInAction, createContraAction, getPayInAmountAction, getDenominationValidationByIdAction, updateCashInOutAction, updateContraAction, deleteCashOutInAction} from '../../../redux/actions/cashOutIn_actions';
import PopupState, {bindToggle, bindPopper} from 'material-ui-popup-state';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import dialogBox from './dialogBox';
import {Grid, IconButton} from '@mui/material';
import {commonDateFormat} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import LedgerVoucher from '../../accounts/GeneralLedger/ledgerVoucher';
import {listAllLedgerVouchersAction} from '../../../redux/actions/ledger_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import NewCashOutIn from 'components/NewCashOutIn';
import VoucherPdfDialog from 'pages/sales/Receipt/VoucherPdfDialog';
import docTemplateService from 'services/docTemplate_services';
import PaymentReceiptservice from 'services/paymentReceipt_services';
import {
  top3Action,
} from '../../../redux/actions/paymentReceipt_actions';
import {
  listBankCreationAdjustmentAction,  
} from '../../../redux/actions/bankCreation_actions';
import  "../../../index.css";
import {
  listCashBoxAction,
  listCashBoxAdjustmentAction,
} from '../../../redux/actions/cash_box_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {CreateNotificationAction} from '../../../redux/actions/notification_actions'
import notificationType from '../../../firebase/notify_type';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import {sendNtfy} from '../../../firebase/firebase.service';
import { roleType } from 'utils/roleType';
import EditIcon from '@mui/icons-material/Edit';
import { FilterAlt } from '@mui/icons-material';
import ReceiptPaymentFilter from 'pages/sales/Receipt/ReceiptPaymentFilter';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import PayinPayoutDetails from './PayinPayoutDetails'
import { deleteReceipts } from '../../../redux/actions/sales_actions';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTheme } from '@mui/material/styles';
import { render } from 'bwip-js';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


class PaymentReceipt extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date();
    this.state = {
      indexopen :false,
      paymentReceipt_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      mode: '',
      edit_data: [],
      delete: false,
      id: '',
      from: firstDay,
      to: lastDay,
      paymentMode: null,
      location_id: null,
      minValue: null,
      maxValue: null,
      count: 0,
      errormsg: {
        from: '',
        to: '',
      },
      pgSize: '',
      openData: [],
      total:'',
      currentPage:0,
      voucherOpen : false,
      ledgerName : '',
      ledgerId : '',
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: 20,
      isApiFinished : false,
      monthYear : {
        empName: [''],
        location: [''],
        from: moment(firstDay),
        to: moment(lastDay),
      },
      detailsOpen : false,
      rowData : {},
      deleteDialogOpen: false,
      deletedata: {},
      rowDataIndex: null,
      payInOutDetailOpenForSmallerScreen: false,
      isLargeScreen: window.matchMedia(`(min-width:1200px)`).matches,
      landingOpen: false,
      click: false,
      voucherPdfOpen: false,
      voucherPdfBase64: '',
      voucherPdfNumber: '',
    };
  }
  storage = getsessionStorage()

  async componentDidMount() {
    const { theme } = this.props;
    this.mediaQuery = window.matchMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
    this.mediaQuery.addEventListener("change", this.handleResize);  

    this.props.set_searchPaymentreportAction({data:[], numRows:0});
    const context = this.context;
    console.log(context.headerLocationId, this.state.click, "headerLocationIdjhkkkhk")
     const selectedRole = this.storage?.role_name;
    if (
    this.props.showPayInOutModal) {
    this.setState({ indexopen: true });
    }
    let payLoad = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to).format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: null,
      location_id: context.headerLocationId,
      minValue: null,
      maxValue: null,
      searchString: '',
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
    
        this.props.listPaymentReceiptdateAction(
          payLoad,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          ()=>{},
        ),
        this.props.listPaymentMethodAction(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.top3Action(
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        this.props.listCashBoxAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          context.headerLocationId,
        ),
        this.props.listPaymentTypeDetails(),
        this.props.listStockLocationAction(context.commoncookie, context.headerLocationId),
        !this.props.bank_creation_adjustment_list.length && context.headerLocationId !== 'null' && this.props.listBankCreationAdjustmentAction(
          this.storage?.employee_id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          context.headerLocationId,
        ),
         this.props.getMenuAccessAction(selectedRole)
      ).finally(() => this.setState({isApiFinished: true}));
      await this.setState({
        // CashOutIn_data: this.props.cashOutIn,
        headerupdate: context.headerLocationId,
        edit_id_data: this.props.paymentReceipt
      });
      // this.setState({edit_id_data: this.props.paymentReceipt});
    
  }

  componentWillUnmount() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.handleResize);
    }
  }

  async componentDidUpdate(preProps, preState) {

    console.log('dismountttexecutingggg')
    const context = this.context;


    if (preState.pageSize !== this.state.pageSize) {
      const data = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: this.state.headerupdate,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: this.state.searchVal,
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPaymentReceiptdateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
        )
      );
    }

    if (preState.page !== this.state.page) {
      const data = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: this.state.headerupdate,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: this.state.searchVal,
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPaymentReceiptdateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
        )
      );
    }

    if (context.headerLocationId !== this.state.headerupdate) {
      this.setState({headerupdate:context.headerLocationId})

        const data = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: context.headerLocationId,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: this.state.searchVal,
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPaymentReceiptdateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
        )
      );

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
       
      );
        
    }
    // if(preProps.paymentReceipt !== this.props.paymentReceipt && this.props.paymentReceipt.length > 0) {
    //   this.handleDetailClick(this.props.paymentReceipt[0], !this.state.isLargeScreen, true)
    // }

    if(preState.rowDataIndex !== this.state.rowDataIndex){
      const indexedRowData = this.props.paymentReceipt[this.state.rowDataIndex]
      this.handleDetailClick(indexedRowData, true)
    }

  }

  handleResize = (e) => {
    this.setState({ isLargeScreen: e.matches });
  };

  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 +  this.state.pageSize) * page,
    //     this.state.pageSize * (page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   const context = this.context

    //   const data = {pageCount: page || 0, numPerPage: this.state.pageSize, fromDate : moment(this.state.from, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    //   toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    //   employee_id : context.commoncookie,searchString: this.state.searchVal};

    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.listPaymentReceiptdateAction(
    //       data,
    //       context.commoncookie,
    //       context.headerLocationId,
    //     )
    //   );
    // }

    this.setState({page: page});
    // const context = this.context

    // const data = {pageCount: page, numPerPage: this.state.pageSize, fromDate : moment(this.state.from, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    // toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    // employee_id : context.commoncookie,searchString: this.state.searchVal};

    // if(typeof data.location_id !== 'object' ){
    //   data.location_id = context.headerLocationId
    // }

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listPaymentReceiptdateAction(
    //     data,
    //     context.commoncookie,
    //     context.headerLocationId,
    //   )
	  // );
  }

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }
    this.setState({pageSize: size});
    this.setState({page:0})

    // const context = this.context;

    // const data = {pageCount: this.state.page , numPerPage: size, fromDate : moment(this.state.from, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    // toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD') || '',
    // employee_id : context.commoncookie,searchString: this.state.searchVal};

    // if(typeof data.location_id !== 'object' ){
    //   data.location_id = context.headerLocationId
    // }

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listPaymentReceiptdateAction(
    //     data,
    //     context.commoncookie,
    //     context.headerLocationId,
    //   )
    // );
  };

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidPaymentReceiptAction(id)
	  );
    // await this.props.updatePaymentReceiptStatusAction(id,context.setModalTypeHandler,context.setLoaderStatusHandler)
    // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
    this.setState({open: true, status: 'edit'});
  };

  handleEditOpen = async (id) => {
    const context = this.context;
    this.setState({ indexopen: true, mode: 'edit', edit_data: this.state.rowData,landingOpen:false });
  };

  handleDeleteSubmit = async (id) => {
    console.log("asdadad",id)
    const context = this.context;
    let payLoad = {
      fromDate: moment(this.state.from).format('YYYY-MM-DD'),
      toDate: moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id: this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: this.state.location_id,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: '',
      pageCount: this.state.page || 0,
      numPerPage: this.state.pageSize,
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,

      await this.props.deleteCashOutInAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      


      this.props.listPaymentReceiptdateAction(
        payLoad,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        () => { }
      ),
      
      
    );
     this.setState({ delete: false, payInOutDetailOpenForSmallerScreen: false, landingOpen: false });
  };
  

  handledialog = async (id) => {
    const context = this.context;
    this.setState({delete: true, id: id});
    // await this.props.listPaymentReceiptAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"),context.setModalTypeHandler,context.setLoaderStatusHandler)
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
    console.log('handlesubmittttttttt', data)
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
           date: d.date
            ? moment(d.date).format("YYYY-MM-DD HH:mm:ss")
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          employee_id: this.storage?.employee_id,
          location_id: context.headerLocationId,
        };

       
      });
      
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
     
         
          transData.accountTransaction = accountTransaction;
         
         const temp = { CreateData }

         temp.bank_id = this.props.bank_id
         
         
      const action = this.state.mode === 'edit'
        ? this.props.updateCashInOutAction
        : this.props.createCashOutInAction;

      try {
        const response = await apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          action(
            temp,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            () => {}
          )
        );

        const settled = Array.isArray(response) ? response[0] : null;
        const isSuccess = settled?.status === 'fulfilled' && settled?.value === 'API_FINISHED_SUCCESS';
        if (!isSuccess) {
          context.setLoaderStatusHandler(false);
          return;
        }

        // const cookies = new Cookies();
        let storage = getsessionStorage()
        let emp_id = storage?.employee_id || '';

        await this.props.getLoginRoleAction(
          emp_id,
          (role_name, token, content) => {
            if (!roleType.includes(role_name)) {
              let notify_type =
                CreateData[0].cash_type === 'OUT'
                  ? notificationType('Payout')
                  : notificationType('Payin');
              let notify_content = content?.filter(
                (m) => m.notification_type === notify_type
              );
              if (notify_content.length) {
                let content_body = '';
                CreateData.forEach((d, i) => {
                  let amount_value = d.amount || '';
                  let userData =
                    this.props.all_user_location.find(
                      (m) => m.employee_id === d.employee_id
                    ) || {};
                  let ledgerData =
                    this.props.paymentReceipt.find(
                      (m) =>
                        m.employee_id === d.employee_id &&
                        m.ledger_id === d.ledger_id
                    ) || {};
                  let ledgerName = ledgerData.ledger_name || '';

                  content_body = `${userData.username}  \n ₹ ${amount_value} \n${userData.location_name} \n${ledgerName} ,`;
                  this.props.CreateNotificationAction({
                    content_body: content_body,
                    title: notify_content[0]?.title,
                    time: getDateTimeFormat(new Date()),
                    active: "1",
                  });

                  if (CreateData.length - 1 === i) {
                    sendNtfy(token, notify_content[0]?.title, content_body);
                  }
                });
              }
            }
          }
        );

        this.setState({ indexopen: false, mode: '', open: false,payInOutDetailOpenForSmallerScreen:false });

        let payLoad = {
          fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
          toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
          employee_id : this.context.commoncookie,
          paymentMode: this.state.payment_type,
          location_id: this.state.location_id,
          minValue: this.state.min_price,
          maxValue: this.state.max_price,
          searchString: '',
          pageCount: this.state.page || 0, 
          numPerPage: this.state.pageSize,
        };

        await apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPaymentReceiptdateAction(
            payLoad,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            () => { }
          )
        );


      } catch (error) {
      }
    } else {
      // alert("Please Select One Location")
    }
  };

  contraSubmit = async (data) => {
    const context = this.context;
    if (data && context.headerLocationId !== 'null') {
      let CreateData = [...data].map((d) => {
        return {
          ...d,
          date: d.date
            ? moment(d.date).format("YYYY-MM-DD HH:mm:ss")
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          employee_id: this.storage?.employee_id,
          location_id: context.headerLocationId,
        };
      });

      const action = this.state.mode === 'edit'
        ? this.props.updateContraAction
        : this.props.createContraAction;

      try {
        const response = await apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          action(
            CreateData,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            context.setModalStatusHandler
          )
        );

        let storage = getsessionStorage();
        let emp_id = storage?.employee_id || '';

        if (response === 200) {
          await this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
            if (!roleType.includes(role_name)) {
              let notify_type = notificationType('Contra');
              let notify_content = content?.filter(m => m.notification_type === notify_type);

              if (notify_content.length) {
                CreateData.forEach(d => {
                  let amount_value = d.amount || '';
                  let ToledgerName = d.to_ledger_name || '';
                  let fromLedgerName = d.from_ledger_name || '';
                  const Locationdata = this.props.all_user_location.find(
                    (m) => m.location_id === context.headerLocationId
                  ) || {};

                  let content_body = `\n ₹ ${amount_value} \nFrom ${fromLedgerName} \nTo ${ToledgerName} \n${Locationdata.location_name}`;

                  this.props.CreateNotificationAction({
                    content_body: content_body,
                    title: notify_content[0]?.title,
                    time: getDateTimeFormat(new Date()),
                    active: "1"
                  });

                  sendNtfy(token, notify_content[0]?.title, content_body);
                });
              }
            }
          });
        }
        // console.log("this.state.payInOutDetailOpenForSmallerScreen",this.state.payInOutDetailOpenForSmallerScreen)

        this.setState({ indexopen: false, mode: '', open: false,voucherOpen:false ,payInOutDetailOpenForSmallerScreen :false});

        let payLoad = {
          fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
          toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
          employee_id : this.context.commoncookie,
          paymentMode: this.state.payment_type,
          location_id: this.state.location_id,
          minValue: this.state.min_price,
          maxValue: this.state.max_price,
          searchString: '',
          pageCount: this.state.page || 0, 
          numPerPage: this.state.pageSize,
        }

        await apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPaymentReceiptdateAction(
            payLoad,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            () => { }
          )
        );
      } catch (error) {
        console.error("Error in contraSubmit:", error);
      }
    } else {
      this.setState({ openAlert: true });
    }
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

  NewClose = (value) =>{
    console.log('closeeeeeeee')
     this.setState({indexopen : false, mode: '',payInOutDetailOpenForSmallerScreen:false})
  }

  handleFilter = (data) => this.setState({filterOpen: data});

  handleChange = async (data) => {
    //  const date = new Date()
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          //this.state.from.toString().split(' ')[2] <= this.state.to.toString().split(' ')[2]

          // await this.props.listPaymentReceiptdateAction(
          //   moment(this.state.from, "year", "month", "day").format(
          //     "yyyy-MM-DD"
          //   ),
          //   moment(this.state.to, "year", "month", "day").format("yyyy-MM-DD")
          // );

          this.setState({errormsg: {from: '', to: ''}}); //profitloss_data: filterData,
        } else {
          this.setState({
            errormsg: {
              ...this.state.errormsg,
              [data.target.name]: 'Invalid Date',
            },
          });
        }
      } else {
        this.setState({
          errormsg: {
            ...this.state.errormsg,
            [data.target.name]: 'Invalid Date',
          },
        });
      }
    } else {
      this.setState({
        errormsg: {
          ...this.state.errormsg,
          [data.target.name]: 'Invalid Date',
        },
      });
    }
  };

  ApplyButton = async (filter) => {
    // this.setState({searchVal: ''});
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date()
    this.setState({
      from : filter.from ? moment(filter.from).format('YYYY-MM-DD') : moment(firstDay).format('YYYY-MM-DD') ,
      to : filter.to ? moment(filter.to).format('YYYY-MM-DD') : moment(lastDay).format('YYYY-MM-DD'),
      paymentMode: filter.payment_type,
      location_id: filter.location_id,
      minValue: filter.min_price,
      maxValue: filter.max_price,
    })
    let payLoad = {
      fromDate : filter.from ? moment(filter.from).format('YYYY-MM-DD') : moment(firstDay).format('YYYY-MM-DD') ,
      toDate : filter.to ? moment(filter.to).format('YYYY-MM-DD') : moment(lastDay).format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: filter.payment_type,
      location_id: filter.location_id,
      minValue: filter.min_price,
      maxValue: filter.max_price,
      searchString: '',
      pageCount: 0, 
      numPerPage: this.state.pageSize,
    }
    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.listPaymentReceiptdateAction(
        payLoad,
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        ()=>{},
      )
	  );

    const badgeCount = [this.state.from, this.state.to];

    let count = 0;
    badgeCount.forEach((d) => {
      if (d) count += 1;
    });
    this.setState({
      ...this.state,
      ['count']: count,
    });
    this.setState({filterOpen: false, searchVal: ''});
  };

  // hello = () => {
  //   // if(data){

  //   this.setState({ open: "expense" });
  //   // }
  // };

  childTable = async (id) => {
    const openData = await this.props.paymentReceipt.filter((f) => f.id === id);

    if (openData.length > 0) {
      this.setState({open: 'ledger', openData: openData[0].ledger_data, total:openData[0]?.amount});
    }
  };

  payment = async (id) => {
    const openData = await this.props.paymentReceipt.filter((f) => f.id === id);

    if (openData.length > 0) {
      if(openData[0].paymentType !== null){
        this.setState({ open: "bank", openData:openData[0]?.payment_data, total:openData[0]?.amount});
      } else{
        this.setState({ open: "cash", openData:openData[0]?.payment_data, total:openData[0]?.amount});
      }

    }
    // this.setState({ open: "cash" });
  };

  testData1 = [
    // this.state.open  && [
      {
        field: "creationDate",
        title: "Entry Date",
        render: (rowData) => commonDateFormat(rowData?.creationDate),
      },
      {
        field: 'receipt_number',
        title: 'Voucher #',
        render: (rowData) => (
          rowData.purpose === 'contra' ? (
            <div style={{ display: 'inline-block' }}>
              {rowData.receipt_number}
            </div>
          ) : (
            <div
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: '#03adfc',
                display: 'inline-block',
              }}
              onClick={(event) => {
                event.stopPropagation()
                this.handleVoucherPdfClick(rowData)
              }}
            >
              {rowData.receipt_number}
            </div>
          )
        )
      },
      {
        field: 'date',
        title: 'Transaction Date',
        sorting: false
      },
    {
      field: 'paymentId',
      title: 'Payment Mode',
      render: (rowData) => (
        // <Link
        //   style={{cursor: 'pointer', textDecoration: 'underline'}}
        //   onClick={() => this.payment(rowData.id)}
        // >
        //   {rowData.paymentType ? rowData.paymentType : 'Cash'}
        // </Link>
      (<div>
        {rowData.paymentType ? rowData.paymentType : 'Cash'}
      </div>)
      ),
      sorting: false
    },
    {
      field: 'ledger_name',
      title: 'Ledger',
      render: (rowData) => (
        <Link
          style={{cursor: 'pointer', textDecoration: 'underline'}}
          onClick={(e) =>{e.stopPropagation(); this.handleVoucherOpen(rowData)}}
        >
          {rowData.ledger_name}
        </Link>
      ),
      sorting: false
      // render: rowData =>  <dialogBox />,
    },
    {
      field: "location_name",
      title: "Location",
      // render: (rowData) => (
      //   <Link
      //     style={{ cursor: "pointer", textDecoration: "underline" }}
      //     onClick={() => this.hello()}
      //   >
      //     {rowData.expense}
      //   </Link>
      // ),
      sorting: false
    },
    {
      field: 'reason',
      title: 'Note',
      sorting: false
    },
    {
      field: 'amount',
      title: 'Amount',
      //  align: 'right', 
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.amount.toFixed(2)}
        </div>
      ),
      sorting: false
    },
    {
      field: 'cash_type',
      title: 'Type',
      
       render: (rowData) => rowData.cash_type === "IN" ? "Pay-IN" : "Pay-OUT",
       sorting: false
    }
    // {
    //   field: "edit",
    //   title: "Edit",
    //   render: (rowData) => (
    //     <IconButton onClick={() => this.handleEditOpen(rowData)}>
    //       <EditIcon />
    //     </IconButton>
    //   ),
    // },
    // ]
  ];

  ledger = [
    // this.state.open  && [
    {
      field: 'creationDate',
      title: 'Date',
    },
    {
      field: "name",
      title: "Ledger Name",
    },
    // {
    //   field: 'name',
    //   title: 'Ledger',
    // },

    {
      field: 'description',
      title: 'Description',
    },

    {
      field: 'Note',
      title: 'reason',
    },
    // ]
  ];

  cash = [
    // this.state.open  && [
      {
        field: "creationDate",
        title: "Date",
      },
    {
      field: "name",
      title: "Name",
    },

    {
      field: "amount",
      title: "Amount",
      render: (rowData) => rowData.amount.toFixed(2),
    },
   
    {
      field: "reason",
      title: "Note",
    },
    // ]
  ];


  expense = [
    // this.state.open  && [
    {
      field: 'expense',
      title: 'expense',
      render: (rowData) => (
        <div onClick={() => this.childTable(rowData)}> Kia </div>
      ),
      // render: rowData =>  <dialogBox />,
    },

    {
      field: 'amount',
      title: 'Amount',
      render: (rowData) => <div style={{textAlign:'right',paddingRight:'100px'}}>{rowData.amount.toFixed(2)}</div>
    },
    {
      field: 'payin_out',
      title: 'payIn & payOut',
    },
    // ]
  ];

  bank  = [
    {
      field: 'bankName',
      title: 'Bank Name',
    },

    {
      field: 'paymentName',
      title: 'Payment Type',
    },
    {
      field: 'accountNumber',
      title: 'Account Number',
    },
    {
      field: 'accountType',
      title: 'Account Type',
    },
    // ]
  ];

  numberToWords = (num) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ]
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const numToWords = (n) => {
      if (n < 20) return a[n]
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '')
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
    }
    if (!num || isNaN(num)) return ''
    return numToWords(Math.floor(Number(num))) + ' Only'
  }

  getConfigValue = (key) => {
    const item = this.props.app_config_data?.find(f => f.key_name === key)
    return item?.value || ''
  }

  handleVoucherPdfClick = async (rowData) => {
    try {
      this.setState({ voucherPdfNumber: rowData.receipt_number || '' })

      const res = await PaymentReceiptservice.getPayinPayoutById(rowData.id, 'PayinPayout')
      const data = res.data?.data || res.data

      const val = data?.val?.[0] || {}
      const amount = Number(val.amount || rowData.amount || 0)
      const isPayIn = (val.cash_type || rowData.cash_type) === 'IN'

      const payload = {
        company: {
          name: this.getConfigValue('company.name'),
          address: this.getConfigValue('address.fulladdress'),
          city: this.getConfigValue('address.city'),
          state: this.getConfigValue('address.state'),
          zip: this.getConfigValue('address.pincode'),
          gstin: this.getConfigValue('company.gstin/uin'),
          phone: this.getConfigValue('company.mobile'),
          email: this.getConfigValue('company.email'),
          logo: this.props.company_logo?.[0]?.image || '',
        },
        document: {
          title: isPayIn ? 'RECEIPT VOUCHER' : 'PAYMENT VOUCHER',
          number: val.receipt_number || rowData.receipt_number || '',
          date: val.date || rowData.date || '',
          party_label: isPayIn ? 'Received From' : 'Paid To',
        },
        party: {
          name: (val.name || rowData.ledger_name || '').toUpperCase(),
          address: '',
          city: '',
          state: '',
          zip: '',
          gstin: '',
          phone: '',
        },
        payment: {
          mode: val.payment_type || rowData.paymentType || 'Cash',
          reference: val.reference || '',
          amount_in_words: this.numberToWords(amount),
          note: val.reason || rowData.reason || '',
          entry_date: val.date || rowData.date || '',
          currency: '₹',
          total_amount: amount.toFixed(2),
        },
        items: [{
          index: 1,
          doc_number: val.receipt_number || rowData.receipt_number || '',
          doc_date: val.date || rowData.date || '',
          doc_amount: amount.toFixed(2),
          due_amount: '',
          paid_amount: amount.toFixed(2),
        }],
      }

      const context = this.context
      const renderRes = await docTemplateService.renderPreview({
        document_type: isPayIn ? 'receipt_voucher' : 'payment_voucher',
        paper_size: 'A4_portrait',
        output_type: 'print',
        location_id: rowData.location_id || context.headerLocationId,
        company_id: this.storage.company_id,
        payload,
      })

      if (renderRes.data?.pdfBase64) {
        this.setState({
          voucherPdfBase64: renderRes.data.pdfBase64,
          voucherPdfOpen: true,
        })
      }
    } catch (err) {
      console.error('Voucher PDF error:', err)
    }
  }

  backBtn = () => {
    this.setState({open: false});
  };
  ledgerVoucherbackBtn = () => {
    this.setState({voucherOpen: false});
  };
  handleVoucherOpen = async (data) => {
    const context = this.context;
    if (data) {     
      let payload = {
        ledger_id :data.ledger_id ,
        monthStart :  moment(this.state.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
        monthEnd : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD')
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listAllLedgerVouchersAction(
          payload,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
      this.setState({ledgerName:data.ledger_name,voucherOpen: true, ledgerId: data.ledger_id});
    }
    
  };
  clearButton = () =>{
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date();


    const context = this.context;
    let payLoad = {
      fromDate : moment(firstDay).format('YYYY-MM-DD') ,
      toDate : moment(lastDay, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: null,
      location_id: null,
      minValue: null,
      maxValue: null,
      searchString: '',
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }

    this.props.listPaymentReceiptdateAction(
      payLoad,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      ()=>{},
    )
    this.setState({from:firstDay,to:lastDay})
    this.setState({filterOpen: false, searchVal: ''});
  }

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    // this.props.set_searchPaymentreportAction({data:[], numRows:0})
    const body = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: this.state.location_id,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: '',
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }
    this.props.listPaymentReceiptdateAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };
  
  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page: 0});

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchPaymentreportAction({data:[], numRows:0})
    }
    // }
    const body = {
      fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
      toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employee_id : this.context.commoncookie,
      paymentMode: this.state.payment_type,
      location_id: this.state.location_id,
      minValue: this.state.min_price,
      maxValue: this.state.max_price,
      searchString: val,
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
    }
    this.props.get_searchPaymentreportAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
    // this.props.listPaymentReceiptdateAction(
    //   body,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    // )
  };

  handleDetailClick = async (rowData, internalCall, initialCall) => {
    this.setState({rowData: rowData})
    this.setState({ payInOutDetailOpenForSmallerScreen: true })
    if(this.state.click){
    this.setState({ landingOpen: true })
    }
    // if(this.state.isLargeScreen || internalCall){
      const id = rowData.id
      console.log('htgfb1', rowData)
      await apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.getPayinPayoutByIdAction(id, 'PayinPayout')
      )
      if(!internalCall){
        this.setState({ detailsOpen : true })
      }
      else if(!initialCall){
        this.setState({ payInOutDetailOpenForSmallerScreen: true })
      }
    // }
    // else{
      const index = this.props.paymentReceipt.findIndex(item => item.id === rowData.id)
      this.setState({ rowDataIndex: index })
    // }
  }

   handleDelete = () => {
    console.log('haniijde;letg',this.state.delete)
    const context = this.context;
    this.setState({delete: true, deletedata: this.state.rowData, id: this.state.rowData.id})
    console.log('haniijde;letg1',this.state.delete)
  }
  
  render() {
    const propdate = {
      firstDate: this.state.from ? moment(this.state.from).format('YYYY-MM-DD') : '',
      lastDate: this.state.to ? moment(this.state.to).format('YYYY-MM-DD') : ''
    };
    console.log('this.state.indexopen ', this.state.payInOutDetailOpenForSmallerScreen )
    const error = this.state.errormsg.from !== '';
    const err = this.state.errormsg.to !== '';
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
    // const { user_rights } = this.props;
    const AddRights = UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_create')
    const EditRights = UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_edit')
    const DeleteRights =  UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_delete')
    const exportRights =  UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_export')
    const exportRightsLedgerVocher =  UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_export')

    // const filteredCol = stockLocation_col.length ? stockLocation_col.map((d) => ({ title: d, field: d }))
    //   : this.props.stocklocation[0] ?
    //     Object.keys(this.props.stocklocation[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Payment Receipt </title>
       </Helmet>
        <CreateNewButtonContext.Consumer>
            {({setModalTypeHandler, setModalStatusHandler}) => (
              <div
                setModalStatusHandler={setModalStatusHandler}
                setModalTypeHandler={setModalTypeHandler}
              >
            <AlertDialog
              delete={this.state.delete}
              handleClose={this.handleClose}
              handleDelete={this.handleDeleteSubmit}
              id={this.state.id}
            />
            {/* {this.state.open === false && ( */}
            {
              !this.state.payInOutDetailOpenForSmallerScreen &&
              <Grid container spacing={1}>
                <Grid size={12}>
                  {this.state.voucherOpen === false &&  this.state.indexopen == false && 
                  <>
                  <style>
                            {`
                              ::-webkit-scrollbar {
                                width: 6px !important;
                                height: 6px !important;
                              }

                              ::-webkit-scrollbar-thumb {
                                background-color: rgba(100, 100, 100, 0.7) !important;
                                border-radius: 6px !important;
                              }

                              ::-webkit-scrollbar-track {
                                background: transparent !important;
                              }
                            `}
                    </style>
                  <MaterialTable
                    // totalCount={this.state.searchVal ? this.props.searchPaymentreportCount : this.props.paymentReceiptCount}
                    totalCount={this.props.paymentReceiptCount}
                    // style={{height:'87vh',overflow:'hidden'}}
                     style={{height: 'calc(100vh - 80px)', }}
                            onRowClick={(event, rowData) => {
                              this.setState({ click: true }, () => {
                                this.handleDetailClick(rowData);
                              });
                            }}
                    actions={[
                      AddRights ? {
                        icon: 'add',
                        tooltip: 'add',
                        isFreeAction: true,
                        onClick: (event, rowData) =>
                          
                          this.setState({
                            // edit_id_data: [],
                            indexopen: true,
                            // status: 'create',
                            // returnState: false,
                          }),
                      } : null,
                      {
                        icon: () => (
                          <div style={{display: 'flex'}}>
                              {/* <CommonFilter
                                PaymentReport={true}
                                from={this.state.from}
                                to={this.state.to}
                                count={this.state.count}
                                handleChange={this.handleChange}
                                handleClose={this.handleFilter}
                                open={this.state.filterOpen}
                                clearButton = {this.clearButton}
                                ApplyButton={this.ApplyButton}
                                monthYear={this.state.monthYear}
                                shouldFetchData={false}
                              /> */}
                            {/* <FilterAlt /> */}
                            <Tooltip title='Filter' placement='top'>
                              <IconButton>
                                <FilterAlt sx={{ color: '#757575' }}/>
                              </IconButton>
                            </Tooltip>
                          </div>
                        ),
                        tooltip: 'Filter',
                        isFreeAction: true,
                        onClick: () => this.setState({filterOpen: true})
                      },
                      //   {
                      //     icon: 'edit',
                      //     tooltip: 'edit',
                      //     position: 'row',
                      //     onClick: (event, rowData) => this.handleEdit(rowData.id)
                      //   },
                      //   {
                      //     icon: 'delete',
                      //     tooltip: 'Delete',
                      //     onClick: (event, rowData) => this.handledialog(rowData.id)
                      //   },
                      // {
                      //   icon: 'add',
                      //   tooltip: 'add',
                      //   isFreeAction: true,
                      //   onClick: (event, rowData) => this.setState({ edit_id_data: [], open: true,status:'create' })
                      // }
                    ]}
                    components={{
                      ...stickyTableComponents,
                      Toolbar: (props) => (
                        <div>
                          {/* <span style={{ paddingLeft: "100px" }}> */}
                          <div
                              style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                            <Box sx={{ width: '100%', '& button[aria-label="Export"]': { mt: '10px' } }}>
                              <MTableToolbar {...props} />
                            </Box>
                            <div>
                              <CommonSearch
                                searchVal={this.state.searchVal}
                                cancelSearch={this.cancelSearch}
                                requestSearch={this.requestSearch}
                              />
                                {/* <TextField
                                  autoFocus={this.state.searchVal ? true : false}
                                  sx={{
                                    borderRadius: '8px',
                                    pr: '10px',
                                    '& .MuiOutlinedInput-root': {
                                      height: '42px',
                                    },
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position='start'>
                                        <SearchIcon />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position='end'>
                                        <ClearIcon
                                          onClick={this.cancelSearch}
                                          sx={{cursor: 'pointer'}}
                                        />
                                      </InputAdornment>
                                    ),
                                  }}
                                  placeholder='Search'
                                  value={this.state.searchVal}
                                  onChange={this.requestSearch}
                                /> */}
                              </div>
                            </div>

                          {!this.state.open === true && 
                          <Grid container direction='row-reverse'>
                            <Grid
                              style={{
                                justifyContent: 'flex-end',
                                display: 'flex',
                                paddingRight: 4,
                              }}>
                              <Typography
                              variant='h6'
                                paddingRight={5}
                                align='left'
                                color='black'
                              >{` PayIN : ${
                                (this.props.paymentReceiptINTotal || 0).toFixed(2)
                              } `}</Typography>
                              <Typography
                              variant='h6'
                                paddingRight={5}
                                align='left'
                                color='black'
                              >{` PayOUT:  ${
                                (this.props.paymentReceiptOUTTotal || 0).toFixed(2)
                              } `}</Typography>
                              {/* <CommonFilter  fromTo={true} catabrand={true} from={this.state.from}  to={this.state.to} product={this.props.product} category={this.state.category} brand={this.state.brand} filter={this.state.filter} setFilter={this.setFilter} brandSearch={this.brandSearch} handleChange={this.handleChange}  handleClose={this.handleFilter} open={this.state.filterOpen} ApplyButton={this.ApplyButton} />  */}
                            </Grid>
                          </Grid>
                          }
                          {!this.state.open === false && 
                          <Grid container direction='row-reverse'>
                            <Grid
                              style={{
                                justifyContent: 'flex-end',
                                display: 'flex',
                                paddingRight: 4,
                              }}>
                              <Typography
                                fontWeight={600}
                                paddingRight={5}
                                align='left'
                                color='black'
                              >{` Total : ${
                                this.state.total || 0
                              } `}</Typography>
                            
                              {/* <CommonFilter  fromTo={true} catabrand={true} from={this.state.from}  to={this.state.to} product={this.props.product} category={this.state.category} brand={this.state.brand} filter={this.state.filter} setFilter={this.setFilter} brandSearch={this.brandSearch} handleChange={this.handleChange}  handleClose={this.handleFilter} open={this.state.filterOpen} ApplyButton={this.ApplyButton} />  */}
                            </Grid>
                          </Grid>
                          }
                          <Grid container spacing={3} style={{paddingLeft: '20px'}}>
                            {/* <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                            </Grid> */}
                            {/* </span> */}
                            {/* <div style={{paddingLeft : "200px",color:"red"}}>{this.state.errormsgfrom}</div> */}

                            <div>
                              {/* <span style={{ paddingLeft: "200px", color: "red" }}>
                              {this.state.errormsg.from}
                            </span>
                            <span
                              style={{
                                paddingLeft:
                                  this.state.errormsg.from === "" ? "310px" : "240px",
                                color: "red",
                              }}
                            >
                              {this.state.errormsg.to}
                            </span> */}
                            </div>
                            {!this.state.open === false && (
                              <Grid
                                size={{
                                  lg: 4,
                                  md: 4,
                                  sm: 12,
                                  xs: 12
                                }}>
                                {/* <span style={{ paddingLeft: "100px" }}> */}
                                <Button
                                  variant='contained'
                                  color='error'
                                  onClick={() => this.backBtn()}
                                  // disabled ={this.state.open === false}
                                >
                                  Back
                                </Button>
                                {/* </span> */}
                              </Grid>
                            )}
                          </Grid>
                          <br />
                        </div>
                      ),
                      Pagination: (props) => (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            borderTop: 'none',
                            boxShadow: 'none',
                            padding: '8px 16px',
                            borderBottom: 'none',
                          }}
                        >
                          <TablePagination
                            {...props}
                            component="div"
                            count={this.props.paymentReceiptCount ?? 0}                              
                            rowsPerPageOptions={[20, 50, 100]}
                            labelRowsPerPage="Rows per Page:"
                            rowsPerPage={this.state.pageSize || 20}
                            page={this.state.page || 0} 
                            onPageChange={(event, page) =>
                              this.handlePageChange(page)
                            }
                            onRowsPerPageChange={(event) =>
                              this.handlePageSizeChange(
                                parseInt(event.target.value, 10)
                              )
                            }
                            style={{
                              borderTop: 'none',
                              borderBottom: 'none',
                              boxShadow: 'none',
                              width: 'auto',
                            }}
                          />
                        </div>
                      ),
                    }}
                    // onPageChange={(page) => {
                    //   this.setState({currentPage:page})
                    // }}
                    options={getStickyTableOptions({
                      headerStyle,
                       bodyOffset: 240,
                      cellStyle,
                      options:{
                         showEmptyDataSourceMessage: this.state.isApiFinished,
                      exportButton: true,
                      filtering: false,
                      actionsColumnIndex: -1,
                      // maxBodyHeight,
                      // minBodyHeight: 'calc(100vh - 230px)',
                      pageSize: this.state.pageSize || 20,
                      tableLayout: "auto",
                      toolbar: true,
                      pageSizeOptions: [20, 50, 100],
                      initialPage:this.state.currentPage,
                      search:false,
                      rowStyle: (row) => ({
                        backgroundColor: this.state.rowData.id === row.tableData.id ? '#D5DEF9' : '#FFFFFF'
                      }),
                      exportMenu: exportRights ? [
                        {
                          label: 'Export PDF',
                          exportFunc: (cols, datas) =>
                            {
                              apiCalls(
                                this.context.setModalTypeHandler,
                                this.context.setLoaderStatusHandler,
                                this.props.listPaymentReceiptdateAction(
                                  {
                                    fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
                                    toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
                                    employee_id : this.context.commoncookie,
                                    paymentMode: this.state.payment_type,
                                    location_id: this.state.location_id,
                                    minValue: this.state.min_price,
                                    maxValue: this.state.max_price,
                                    searchString: '',
                                    pageCount: this.state.page || 0, 
                                    numPerPage: 10000,
                                  },
                                  this.context.setModalTypeHandler,
                                  this.context.setLoaderStatusHandler,
                    
                                (exportData) => {
                                  const formattedData = exportData.data.map(item => ({
                                    ...item,
                                    creationDate: item.creationDate
                                      ? moment(item.creationDate).format('DD/MM/YYYY')
                                      : ''
                                  }));
                                  console.log('sjssmsmd',exportData.data);
                                  ExportPdf(
                                    cols,
                                    formattedData,
                                    'PaymentReceipt',
                                  );
                                },
                              )
                              );
                            }
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, datas) =>
                          {
                            apiCalls(
                              this.context.setModalTypeHandler,
                              this.context.setLoaderStatusHandler,
                              this.props.listPaymentReceiptdateAction(
                                {
                                  fromDate : moment(this.state.from).format('YYYY-MM-DD') ,
                                  toDate : moment(this.state.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
                                  employee_id : this.context.commoncookie,
                                  paymentMode: this.state.payment_type,
                                  location_id: this.state.location_id,
                                  minValue: this.state.min_price,
                                  maxValue: this.state.max_price,
                                  searchString: '',
                                  pageCount: this.state.page || 0, 
                                  numPerPage: 10000,
                                },
                                this.context.setModalTypeHandler,
                                this.context.setLoaderStatusHandler,
                  
                                (exportData) => {
                                  const formattedData = exportData.data.map(item => ({
                                    ...item,
                                    creationDate: item.creationDate
                                      ? moment(item.creationDate).format('DD/MM/YYYY')
                                      : ''
                                  }));
                                  ExportCsv(
                                    cols,
                                    formattedData,
                                    'PaymentReceipt',
                                  );
                              },
                            )
                            );
                          }
                        },
                      ] : [],
                      }
                    })
                      // fixedColumns: {
                      //   left: 2,
                      //   right: 0
                      // },
                     
                    }
                    // columns={
                    //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
                    //     Object.keys(t).map((o) => { return { title: o, field: o }
                    //   }))[0] : []
                    // }
                    // columns={filteredCol}
                    // {this.state.open  && (

                    // page={this.state.page}
                    // onPageChange={(page) => this.handlePageChange(page)}
                    // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                    columns={
                      this.state.open === false
                        ? this.testData1
                        : this.state.open === 'ledger'
                        ? this.ledger
                        : this.state.open === "cash"
                        ? this.cash : this.bank

                    }

                    // data={
                    //   this.props.searchPaymentreportData.length > 0  || this.state.searchVal.length > 0 ? this.props.searchPaymentreportData :
                    //   this.props.paymentReceipt && this.state.open === false
                    //     ? this.props.paymentReceipt :
                    //     this.state.open === "ledger" ? this.state.openData : 
                    //    this.state.open === "cash" ? this.state.openData : 
                    //    this.state.open === "bank" ? this.state.openData : []

        
                    // }

                    data={
                      
                      this.state.open === false ? this.props.paymentReceipt : 
                      this.state.open === "ledger" ? this.state.openData : 
                      this.state.open === "cash" ? this.state.openData : 
                      this.state.open === "bank" ? this.state.openData : []
        
                    }

                    title={<Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    {
                      this.state.open === false
                        ? 'Pay In/Out'
                        : this.state.open === 'ledger'
                        ? 'Ledger'
                        : this.state.open === "cash"
                        ?"Cash" : "Bank"

                    }</Typography>}
                    // )
                  />
                  <ReceiptPaymentFilter
                    open={this.state.filterOpen}
                    handleApply={this.ApplyButton}
                    handleClose={() => this.setState({filterOpen: false})}
                    stockLocation={this.props.stocklocation}
                    listPaymentType={this.props.list_payment_type}
                  />
                  </>}
                </Grid>

                {/* {
                  this.state.voucherOpen === false &&  this.state.indexopen == false && this.props.paymentReceipt && this.props.paymentReceipt.length > 0 && this.state.isLargeScreen &&
                  <Grid size={5}>
                    <PayinPayoutDetails 
                      handleEdit={this.handleEditOpen}
                      handleDelete={this.handleDelete}
                    />
                  </Grid>
                } */}
              </Grid>
            }

            { this.state.landingOpen &&
              <PayinPayoutDetails
                handleEdit={this.handleEditOpen}
                handleDelete={this.handleDelete}
                EditRights={EditRights}
                DeleteRights={DeleteRights}
                onClose={() => this.setState({ payInOutDetailOpenForSmallerScreen: false, landingOpen: false })}
                onPrev={() => this.setState({ rowDataIndex: this.state.rowDataIndex - 1 })}
                onNext={() => this.setState({ rowDataIndex: this.state.rowDataIndex + 1 })}
                prevDisabled={this.state.rowDataIndex === 0}
                nextDisabled={this.state.rowDataIndex === this.props.paymentReceipt.length - 1}
              />
            }

            {/* )} */}

             {this.state.indexopen && (
               <NewCashOutIn
               mode={this.state.mode}
               editData={this.state.edit_data}
               status={this.state.status}
               edit_id_data={this.props.cashOutIn_id_data}
               handleClose={this.NewClose}
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
               {...this.props}
             />
            )} 
            {/* <NewCashOutIn status={this.state.status} edit_id_data={this.props.paymentReceipt_id_data} handleClose={this.handleClose} handleSubmit={this.handleSubmit} chartOfAccounts = {this.props.chartOfAccounts} paymentMethod = {this.props.paymentMethod} /> */}
            {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} >
          <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
            {this.state.dialog.msg}
          </Alert>
         </Snackbar> */}
          </div>
            )}
          </CreateNewButtonContext.Consumer>
        {this.state.voucherOpen === true && (
        <LedgerVoucher backBtn={this.ledgerVoucherbackBtn} props={{...this.props,ledgerName:this.state.ledgerName, ledger_id: this.state.ledgerId}} date={propdate} exportRights ={exportRightsLedgerVocher}/>
        )}

        <VoucherPdfDialog
          open={this.state.voucherPdfOpen}
          onClose={() => { this.setState({ voucherPdfOpen: false, voucherPdfBase64: '', voucherPdfNumber: '' }) }}
          pdfBase64={this.state.voucherPdfBase64}
          voucherNumber={this.state.voucherPdfNumber}
          title={this.state.voucherPdfNumber}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {

    createContra: state.CashOutInReducer.createContra || [],
    cashOutIn_id_data: state.CashOutInReducer.cashOutIn_id_data || [],
    paymentMethod: state.paymentMethodReducer.paymentMethod,
    top3: state.paymentReceiptReducer.top3,
    cash_box_adjustment_list: state.cashBoxReducer.cash_box_adjustment_list || [],
    bank_creation_adjustment_list: state.bankCreationReducer.bank_creation_adjustment_list || [],
    all_user_location: state.UserCreationReducer.all_user_location,
    paymentReceipt: state.paymentReceiptReducer.paymentReceipt,
    payInAmount: state.CashOutInReducer.payInAmount || [],
    cashOutIn_denomination: state.CashOutInReducer.cashOutIn_denomination || [],
    cash_box_denomination: state.cashBoxReducer.cash_box_denomination || [],
    bank_id: state.bankCreationReducer.bank_id,
    stocklocation: state.stockLocationReducer.stocklocation,
    list_payment_type: state.paymentMethodReducer.list_payment_type,
    paymentReceiptCount: state.paymentReceiptReducer.paymentReceiptCount,
    paymentReceipt_id_data:
      state.paymentReceiptReducer.paymentReceipt_id_data || [],
    chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    all_ledger_vouchers : state.ledgerReducer.all_ledger_vouchers || [],
    searchPaymentreportData: state.paymentReceiptReducer.searchPaymentreportData,
    searchPaymentreportCount : state.paymentReceiptReducer.searchPaymentreportCount,
    paymentReceiptINTotal: state.paymentReceiptReducer.paymentReceiptINTotal || 0,
    paymentReceiptOUTTotal: state.paymentReceiptReducer.paymentReceiptOUTTotal || 0,
    showPayInOutModal: state.paymentReceiptReducer.showPayInOutModal,
    menuAccess: state.rbacReducer.menuAccess || [],
    app_config_data: state.appConfigReducer.app_config_data || [],
    company_logo: state.CompanyReducers.company_logo || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getDenominationValidationByIdAction:(id,data) => {
      return dispatch(getDenominationValidationByIdAction(id,data))
    },
    getPayInAmountAction:(data) => {
      return dispatch(getPayInAmountAction(data))
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
    CreateNotificationAction:(data) => {
      dispatch(CreateNotificationAction(data))
    },
    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },
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
    top3Action: (location_id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(top3Action(location_id, setModalTypeHandler, setLoaderStatusHandler));
    },
    listPaymentReceiptAction: (
      from,
      to,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      dispatch(
        listPaymentReceiptAction(
          from,
          to,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listPaymentReceiptdateAction: (data, setModalTypeHandler,setLoaderStatusHandler, exportDataCallBack) => {
      return dispatch(listPaymentReceiptdateAction(data, setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));
    },
    createPaymentReceiptAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        createPaymentReceiptAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidPaymentReceiptAction: (id) => {
      return dispatch(getbyidPaymentReceiptAction(id));
    },
    updatePaymentReceiptAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        updatePaymentReceiptAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    updatePaymentReceiptStatusAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updatePaymentReceiptStatusAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deletePaymentReceiptAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deletePaymentReceiptAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },

     deleteCashOutInAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteCashOutInAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listChartOfAccountsdataAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listChartOfAccountsdataAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listPaymentMethodAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentMethodAction(setModalTypeHandler, setLoaderStatusHandler),
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
    updateCashInOutAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      setModalStatusHandler,
      response,
    ) => {
      return dispatch(
        updateCashInOutAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
          response,
        ),
      );
    },
    updateContraAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      setModalStatusHandler,
      response,
    ) => {
      return dispatch(
        updateContraAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
          response,
        ),
      );
    },
    set_searchPaymentreportAction: (val ) => { return dispatch(set_searchPaymentreportAction(val))
    },
    get_searchPaymentreportAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchPaymentreportAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    listAllLedgerVouchersAction : (data,setModalTypeHandler,setLoaderStatusHandler) =>{
      return dispatch (listAllLedgerVouchersAction(data,setModalTypeHandler,setLoaderStatusHandler))
    },
    listPaymentTypeDetails: () => {
      return dispatch(listPaymentTypeDetails())
    },
    listStockLocationAction: (commoncookie, headerLocationId) =>{
      return dispatch(listStockLocationAction(commoncookie, headerLocationId))
    },
    getPayinPayoutByIdAction: (id, type) =>{
      return dispatch(getPayinPayoutByIdAction(id, type))
    },
    deleteReceipts: (data,type,response) =>{
      return dispatch(deleteReceipts(data,type,response))
    },
     getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
  };
};

function PaymentReceiptWithTheme(props) {
  const theme = useTheme();
  return <PaymentReceipt {...props} theme={theme} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentReceiptWithTheme);

