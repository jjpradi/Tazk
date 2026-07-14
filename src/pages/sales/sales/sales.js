import React, {Component} from 'react';
//import NewSales from '../../../components/Sales';
import {connect} from 'react-redux';
import NewSales from '../../../components/NewSales';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _, { debounce } from 'lodash';
import {
  listSalesAction,
  updateSalesAction,
  getbyidSalesAction,
  deleteSalesAction,
  createSalesAction,
  set_sales_table_data,
  receiptEntry,
  listSalesOutstandingAction,
  sendMail,
  creditDebitNoteSeq,
  creditDebitNoteSeqUpdate,
  returnActions,
  dcreturnActions,
  listAllFilterSalesAction,
  getSalesStatusListAction,
  listSalesPaginateAction,
  set_searchSalesAction,
  get_searchSalesAction,
  CancelinvoiceSalesAction,
  searchSalesPaginationAction,
  approvalUserRightsAction,
  listSalesDataAction,
  searchSaleOrderPaginationAction,
  listSaleOrderPaginateAction,
  set_searchSaleOrderAction,
  get_searchSaleOrderAction,
  triggerDcsModal,
  triggerSalesModal,
  updateSalesOrderAction,
  listDCPaginateAction,
  set_searchDcAction,
  get_searchDcAction,
  searchDcPaginationAction,
  getBillingcompany,
} from '../../../redux/actions/sales_actions';
import {listTaxAction} from '../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {listProductAction, listProductActionByType} from '../../../redux/actions/product_actions';
import {listStockLocationSequenceAction} from '../../../redux/actions/stock_Location_actions';
import {customerAsCompanyAction, get_searchContactsActionFinal, listCustomerAction, listcustomerinvoice} from '../../../redux/actions/customer_actions';
import AlertDialog from '../../common/Dialog';
// import {salesMainTable} from '../../../utils/columns';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
// import {Sale_Status} from './sale_status_list';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
 import PaymentDialog from '../paymentSalesPurchase/Dialog';
import {posSequence} from '../../../redux/actions/purchase_actions';
import {getAppConfigDataAction, getAppConfigDataBasedOnTypeAction} from '../../../redux/actions/app_config_actions';
import Cookies from 'universal-cookie';
import SOErpTemplate from '../../../components/erpDesign/soErpTemplate';
import InvoiceDialog from './InvoiceDialog';
// import { ContactlessOutlined } from '@mui/icons-material';
import TopOrder from '../../../components/erpDesign/SO';

import {getDateTime, getDateTimeFormat} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {listChartOfAccountsdataAction, chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import CnDialog from './cn_invoice';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from '../../../utils/stickyTableLayout';
import notificationType from '../../../firebase/notify_type';
import "../../../index.css";
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  Sales_ledger,
  SGST_Payable,
  CGST_Payable,
  IGST_Payable,
  Inventory,
  Cost_of_Goods_Sold,
  Credit_Notes,
  TCS_Payable,
} from '../../../utils/ledgers';
import FilterSalesOrder from './FilterSalesOrder';
import moment from 'moment';
import {listPaymentTypeDetails} from '../../../redux/actions/payment_method_actions';
import { Typography, Grid, Box, TextField, InputAdornment, Stack, Link, IconButton, TablePagination } from '@mui/material';
import SalesReturn from './SalesReturn';
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import {CreateNotificationAction} from '../../../redux/actions/notification_actions'
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import {getByIdMailConfigurationAction, getByIdSmsConfigurationAction} from '../../../redux/actions/configuration_actions';
import {getPriceListAction} from 'redux/actions/priceList_actions';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,
  cellStyle } from 'utils/pageSize';
import {Helmet} from "react-helmet-async";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Data } from '@react-google-maps/api';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { useCustomFetch } from 'utils/useCustomFetch';
import { Width } from 'utils/pageSize';
import CommonToolTip from 'components/ToolTip';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import { ListTermsAndConditionsAction } from 'redux/actions/termsConditions_actions';
import App from 'components/customer_erpDesign';
import { useLocation, useNavigate } from 'react-router-dom';
import ContactPage from '../../../../src/@crema/services/db/Contact/index';
import { clearInvoiceTempAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import EditIcon from '@mui/icons-material/Edit';
import FavouriteMenu from '@crema/core/FavouriteMenu';
import NewSalesForm from 'components/Sales/NewSalesForm';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectDefects from 'pages/sales/defects/collectDefects/collectDefects';
import API_URLS from '../../../utils/customFetchApiUrls';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { searchErrorMessage } from 'utils/content';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export function withLocation(Component) {
  return function WrappedComponent(props) {
    const location = useLocation();
    const navigate = useNavigate();
    return <Component {...props} location={location} navigate={navigate}/>;
  };
}

const styles = {
  disabledIcon: {
    opacity: 0.5, 
  },
};

class Sales extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    let headerupdate = '';
    var date = new Date();
    var firstDay = null;
    var lastDay = null;
    this.addAdvanceAmount = React.createRef(null);
    this.state = {
      sales_data: {},
      open: false,
      edit_id_data: [],
      update: true,
      dialog: {dialog_open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      sales_items_data: [],
      paymentOpen: false,
      sales_items: [],
      Tdata: [],
      disableSubmit: false,
      getCustomer: {},
      recData : [],
      received_amount: 0,
      getPay: [],
      entryvalue : false,
      selectionModel: [],
      appConfigData: {},
      sale_status: '',
      new_status: '',
      setData : '',
      setEditFind  :false,
      onrowclick : false,
      popupData: {
        invoice: '',
        custData: {},
        soDate: '',
        sales_items: [],
        Dopen: false,
        customer_id: '',
        sale_id: '',
        note: '',
        sales_payments: [],
        openAlert: false,
        isRoundedOffNegative: 0,
        rounded_off: 0,
        dc_number	: ''
      },
      cnPopupData: {
        invoice: '',
        custData: {},
        soDate: '',
        sales_items: [],
        Dopen: false,
        customer_id: '',
        sale_id: '',
        note: '',
        sales_payments: [],
        isRoundedOffNegative: 0,
        rounded_off: 0
      },
      rowPopup: {open: false, rowIndex: '', sales_items: []},
      sales_payment: [],
      // getCustomer : [],
      from: firstDay,
      to: lastDay,
      dateRange : null,
      filtedValue: {
        brand: '',
        category: '',
        status : '',
        payment_status : '',
        location_id: 'null',
        payment_type: '',
        max_price: '',
        min_price: '',
      },
      count: 0,
      errormsg: {
        from: '',
        to: '',
      },
      headerupdate: 'null',
      currentPage:0,
      page: 0,
      pageSize: 20,
      searchVal: '',
      searchPageData: [], 
      newSalesAfterCreating_Data: {
        sale_status: null,
        location_id: null,
        comment: '',
        reference: ''
      },
      isNewSales: false,
      isApiFinished: false,
      manualNoteSchemes: [],
      allSaleStatus: ['All', 'Ready To Ship', 'In Transit', 'Delivered', 'On Hold', 'Canceled'],
      selectedSaleStatus: 'All',
      invoiceNumberChangeDialog: false,
      clickedInvoice: null,
      pageType: '',
      showInvoiceModal: false,
      cancelStatus: false,
      soToInvoice:'',
      subcompanyId: 'All',
      salesReturnOpen: false,
      salesReturnPreload: null,
      savedRowPopup: null,
      cnPdfOpen: false
    };
    this.cookies = new Cookies();
    this.storage = getsessionStorage()
    this.filteredCol = [];
    this.customFetch = useCustomFetch()
    this.navigate = props.navigate
    this.debouncedListSalesPaginateAction = debounce(
      this.listSalesPaginateActionHandler,
      1000
    );
  }

   listSalesPaginateActionHandler = (body, context) => {
    if(body.searchString.length >= 3 || body.searchString.length === 0) {
      this.props.listSalesPaginateAction(
        body,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      );
    }
    else {
      this.props.OpenalertActions({msg: searchErrorMessage, severity: 'warning'})
    }
  };

  async componentDidMount() {
  const { location, navigate, searchSalesData, salesByPagination, showSalesModal, showDcsModal, setTriggerSalesModal,setTriggerDcsModal  } = this.props;
    const { searchVal } = this.state;
     const { pathname } = this.props.location;
     const selectedRole = this.storage.role_name
 

  if (location.state?.triggeredByTransaction && location.state.rowData) {
    const { sale_id } = location.state.rowData;
    const sourceData = this.props.salesData;

    const matchedRowData = sourceData.find(item => item.sale_id === sale_id);

    if (matchedRowData) {
      this.handleSalesRowClick(matchedRowData);
      this.setState({ transactionRowData: matchedRowData })
    }

    navigate(location.pathname, { replace: true });
  }

     if(this.storage?.company_type === 3){
      const payload1 = {
        type : 'SalesApproval'
       }
       this.props.approvalUserRightsAction(payload1)
     }
  
    this.setState({pageType: pathname})
    let pathType = 'All'
    // console.log(pathname === "/sales/purchasesOrders","bvbvdf");
    
    if(pathname === "/sales/salesOrders"){
      pathType= 'Sales Order'
      this.setState({selectedSaleStatus: pathType})
    }
      if(pathname === "/sales/deliveryChallan"){
      pathType= 'Delivery Challan'
      this.setState({selectedSaleStatus: pathType})
    }




    this.state.pageType === '/sales/salesOrders' ? this.props.set_searchSaleOrderAction({data:[], numRows:0}) :  this.state.pageType === '/sales/deliveryChallan'  ? this.props.set_searchDcAction({data:[], numRows:0})  :  this.props.set_searchSalesAction({data:[], numRows:0});
    const context = this.context;

    const body =  {
      "searchString": "",
      "type_details": "customer",
      "type": 1,
      "pageCount": 0,
      "numPerPage": 15
  }
  // this.props.get_searchContactsActionFinal(body, context.setModalTypeHandler,
  //  context.setLoaderStatusHandler)
  //  console.log("context.headerLocationId",context.headerLocationId)
    const data = {
      brand: '',
    category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
    };

    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : 'All'
    };

      const paginationData1 = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : 'All'
    };
    
    apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // !this.props.Sale_Status.length && await this.props.getSalesStatusListAction(),
        // this.props.listAllFilterSalesAction(
        //   data,
        //   context.commoncookie,
        //   context.headerLocationId,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
        //  this.props.getUserRightsByRoleIdAction(),
         this.props.getMenuAccessAction(selectedRole),
        this.props.listStockLocationSequenceAction(
          {sequence_type: ['SO', 'DC'] },
          null,
          context.commoncookie,
          // context.headerLocationId,
          'null'
        ),      
        // this.props.getPriceListAction(
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler
        // ),

         this.state.pageType === '/sales/salesOrders'  ? 
       (context.headerLocationId !== null &&  this.props.listSaleOrderPaginateAction(
          paginationData1,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          // {pageCount: 0, numPerPage:  pageSize},
        )) : 
         this.state.pageType === '/sales/deliveryChallan'  ?  
         (context.headerLocationId !== null &&  this.props.listDCPaginateAction(
          paginationData1,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          // {pageCount: 0, numPerPage:  pageSize},
        ))
         :       
        (
          context.headerLocationId !== null && pathname !== "/sales/deliveryChallan" && this.props.listSalesPaginateAction(
          paginationData,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          // {pageCount: 0, numPerPage:  pageSize},
        )
        ),
        context.headerLocationId !== null && location.state?.triggeredByTransaction && location.state.rowData ? this.props.listSalesDataAction(
          paginationData,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ) : null,
        // this.props.ListTermsAndConditionsAction(),
        // this.props.customerAsCompanyAction()
      //  this.props.listProductAction(
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //   )
      
    ).finally((res) => this.setState({isApiFinished: true}));


   
    // await this.props.listSalesAction(
    //   context.commoncookie,
    //   context.headerLocationId,
    //   () => {},
    //   () => {},
    //   () =>{},
    // )
    // !this.props.customer.length && await this.props.listCustomerAction()
    // await this.props.listCustomerAction()
    // await this.props.listSalesOutstandingAction()
      let type='sales'
    await this.props.getAppConfigDataBasedOnTypeAction(type)
    // !this.props.app_config_data.length && await this.props.getAppConfigDataAction()
    // await this.props.listPaymentTypeDetails(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // )
    // await this.props.listChartOfAccountsdataAction()
    // await this.props.creditDebitNoteSeq('credit')
    // await this.props.listUserCreationAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    //   )
    // await this.setState({sales_data:this.props.sales})
    // await this.nestedSearch(this.props.sales,this.props.customer)

    // if (showSalesModal ) {
    //   this.setState({
    //     open: true,
    //     status: 'create',
    //     returnState: false,
    //     edit_id_data: [],
    //     isNewSales: true,
    //   });
    //   setTriggerSalesModal(false);
    // }

    // if (showDcsModal ) {
    //   this.setState({
    //     open: true,
    //     status: 'create',
    //     returnState: false,
    //     edit_id_data: [],
    //     isNewSales: true,
    //   });
    //   setTriggerDcsModal(false);
    // }

    const subcompany = this.storage.subcompany
    if(subcompany > 0) {
      this.props.getBillingcompany()
    }
  }

  handleSalesRowClick = (rowData) => {
  // setTimeout(() => {
this.setState({
    rowPopup: {
      open: true,
      rowIndex: rowData.tableData?.id,
      sales_items: rowData.sales_items,
      sale_status: rowData.sale_status,
    },
  });
  // }, 1000)
};


    handlePageSizeChange = async (size) => {
      this.setState({pageSize: size,page:0}) 
    };
  
    handlePageChange = async (page) => {
      this.setState({page: page});
    };
  

  handleOpenInvoiceModal = () => {
    this.setState({
      open: true,
      status: "create",
      returnState: false,
      edit_id_data: [],
      isNewSales: true,
    });

    this.props.triggerSalesModal(false);
  };

  setFilterValues = (key, value) => {
    this.setState((prevState) => ({
      filtedValue: {
        ...prevState.filtedValue,
        [key]: value,
      },
    }));
  };

handleCloseInvoiceModal = () => {
  this.setState({ showInvoiceModal: true });
}

  getAppConfigData = () => {
    const {app_config_data_based_on_type} = this.props;
  
    const companyName = app_config_data_based_on_type.filter((f) => f.key_name == 'company.name');
    const fullAddress = app_config_data_based_on_type.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = app_config_data_based_on_type.filter((f) => f.key_name == 'company.email');
    const gstinData = app_config_data_based_on_type.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = app_config_data_based_on_type.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = app_config_data_based_on_type.filter((f) => f.key_name == 'address.state');
    let city = app_config_data_based_on_type.filter((f)=> f.key_name == 'address.city');
    let zip = app_config_data_based_on_type.filter((f)=> f.key_name == 'address.pincode');
    let email =  emailData[0]?.value
    const eInvoice = app_config_data_based_on_type.filter((f) => f.key_name === 'company.einvoice')
    const pinCode = app_config_data_based_on_type.filter((f) => f.key_name === 'address.pincode')
    const ewayBill = app_config_data_based_on_type.filter((f) => f.key_name === 'company.ewaybill')
    const roundedOffEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyRoundOff')
    const discountEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.saleDiscount')
    const shippingChargesEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyShippingCharges')
    const otherChargesEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyOtherCharges')
    this.setState({
      appConfigData: {
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        companyEmail: email,
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        state: state.length > 0 ? state[0].value : '',
        zip:zip,
        city:city,
        eInvoice: eInvoice.length > 0 ? eInvoice[0].value : '',
        pinCode: pinCode.length > 0 ? pinCode[0].value : '',
        ewayBill: ewayBill.length > 0 ? ewayBill[0].value : '',
        roundedOffEnabled: roundedOffEnabled.length ? roundedOffEnabled[0].value : 'false',
        discountEnabled: discountEnabled.length > 0 ? discountEnabled[0].value : 'No Discount',
        shippingChargesEnabled: shippingChargesEnabled.length > 0 ? shippingChargesEnabled[0].value : 'false',
        otherChargesEnabled: otherChargesEnabled.length > 0 ? otherChargesEnabled[0].value : 'false'
      },
    });
  };
  async componentDidUpdate(preProps, preState) {
      const { location, navigate, searchSalesData, salesByPagination, showSalesModal, showDcsModal, setTriggerSalesModal, setTriggerDcsModal } = this.props;

    const context = this.context;

    const { pathname } = this.props.location;
    if (preProps.location.pathname !== this.props.location.pathname) {
    this.setState({ searchVal: '', onrowclick: false });
    this.state.pageType === '/sales/salesOrders'  ?  this.props.set_searchSaleOrderAction({data:[], numRows:0}) : this.state.pageType === '/sales/deliveryChallan'  ? this.props.set_searchDcAction({data:[], numRows:0})  :  this.props.set_searchSalesAction({data:[], numRows:0})
  }
    // if (pathname === '/sales/invoices') {
    //    triggerDcsModal(false);
    //    triggerSalesModal(true);
    // }

    // if ( pathname === '/sales/deliveryChallan') {
    //   triggerSalesModal(true);
    //   triggerDcsModal(false);
    // }
    

     

   

    if (pathname !== this.state.pageType) {
       this.handleClose();
      const typePage = pathname === "/sales/invoices" ? "All" : pathname === "/sales/salesOrders" ? "Sales Order" : "Delivery Challan"
      this.setState({ pageType: pathname, selectedSaleStatus: typePage, page: 0, 
      from: null,
      to: null,
      dateRange : null,
      status : null,
      payment_status : null,
      subcompanyId: 'All',
      filtedValue: {
        brand: '',
        category: '',
        location_id: 'null',
        payment_type: '',
        max_price: '',
        min_price: '',
      }, }, () => {
        // this.triggerSalesAPI();
      });
    }

    if(preState.open !== this.state.open && this.state.open){
      let type='sales'
      await this.props.getAppConfigDataBasedOnTypeAction(type)
    }

    if (preProps.app_config_data_based_on_type !== this.props.app_config_data_based_on_type) {
      this.getAppConfigData();
    }
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.state.headerupdate) {
      this.setState({ headerupdate: headerLocationId });
      // await this.props.listSalesAction(context.commoncookie,context.headerLocationId,context.setModalTypeHandler,context.setLoaderStatusHandler)
      // const data ={	brand: "",category: "",location_id: context.headerLocationId,max_price: "",min_price: "",payment_type: "",from: (moment(this.state.from, 'year', 'month', 'day')).format("yyyy-MM-DD"), to: (moment(this.state.to, 'year', 'month', 'day')).format("yyyy-MM-DD"),user_id: context.commoncookie}

      const paginationData = {
        brand: '',
        category: '',
        location_id: context.headerLocationId,
        max_price: '',
        min_price: '',
        payment_type: '',
        from: null,
        to: null,
        user_id: context.commoncookie,
        pageCount: 0, 
        numPerPage:  this.state.pageSize,
        searchString : this.state.searchVal,
        sale_status: this.state.selectedSaleStatus,
        sub_company_id : this.state.subcompanyId
      };
        const paginationData1 = {
        brand: '',
        category: '',
        location_id: context.headerLocationId,
        max_price: '',
        min_price: '',
        from: null,
        to: null,
        user_id: context.commoncookie,
        pageCount: 0, 
        numPerPage:  this.state.pageSize,
        searchString : this.state.searchVal,
        sub_company_id : this.state.subcompanyId
      };

      if (this.state.rowPopup.open === false && this.state.open === false) {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          // this.props.listAllFilterSalesAction(
          //   data,
          //   context.commoncookie,
          //   context.headerLocationId,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // ),
          this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              paginationData1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
              : (
                this.props.listSalesPaginateAction(
                  paginationData,
                  context.commoncookie,
                  context.headerLocationId,
                  context.setModalTypeHandler,
                  context.setLoaderStatusHandler,
                  // {pageCount: 0, numPerPage:  pageSize},
                )
              ),
          location.state?.triggeredByTransaction && location.state.rowData && this.props.listSalesDataAction(
            paginationData,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
        );
        
      }

    }
    if(preState.page !== this.state.page){
      let page = this.state.page;
      let pageSize = this.state.pageSize
      if (this.state.searchVal) {
      const context = this.context;
      const body = {
        brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
      }
      const body1={
        searchString:this.state.searchVal,
        employeeId:context.commoncookie,
        headerLocationId:context.headerLocationId,
        pageCount:page,
        numPerPage:pageSize,
      }
        if (this.state.pageType === '/sales/salesOrders') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchSaleOrderPaginationAction(body1)
          )
        } else if(this.state.pageType === '/sales/deliveryChallan') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchDcPaginationAction(body1)
          )
        }
          else {
          apiCalls(
            this.props.listSalesPaginateAction(
                  body,
                  context.commoncookie,
                  context.headerLocationId,
                  context.setModalTypeHandler,
                  context.setLoaderStatusHandler,
                )
          )
        }
      
    }
  else{
   
    const context = this.context;
    const data = {...this.exportValue(), ...{pageCount: page , numPerPage: pageSize , searchString : this.state.searchVal}, };
    const data1 = {...this.exportValueSaleOrder(), ...{pageCount: page , numPerPage: pageSize , searchString : this.state.searchVal}, };
    if(typeof data.location_id !== 'object' ){
      data.location_id = context.headerLocationId
    }
     if(typeof data1.location_id !== 'object' ){
      data1.location_id = context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
        this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              data1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                data1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
              :  (
              this.props.listSalesPaginateAction(
                data,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ),
      location.state?.triggeredByTransaction && location.state.rowData && this.props.listSalesDataAction(
        data,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // {pageCount: page || 0, numPerPage:  pageSize},
      )
	  );
    }
    }
    if(preState.pageSize !== this.state.pageSize){
    
      let page = this.state.page;
      let pageSize = this.state.pageSize
      if (this.state.searchVal) {
      const context = this.context;
      const body = {
        brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
      }
        const body1 = {
        searchString:this.state.searchVal,
        employeeId:context.commoncookie,
        headerLocationId:context.headerLocationId,
        pageCount:page,
        numPerPage:pageSize,
      }
      if (this.state.pageType === '/sales/salesOrders') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchSaleOrderPaginationAction(body1)
          )
        } else if(this.state.pageType === '/sales/deliveryChallan') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchDcPaginationAction(body1)
          )
        }else {
          apiCalls(
           this.props.listSalesPaginateAction(
                  body,
                  context.commoncookie,
                  context.headerLocationId,
                  context.setModalTypeHandler,
                  context.setLoaderStatusHandler,
                )
          )
        }
    }
  else{
    const context = this.context;
    const data = {...this.exportValue(), ...{pageCount: page , numPerPage: pageSize , searchString : this.state.searchVal}, };
    const data1 = {...this.exportValueSaleOrder(), ...{pageCount: page , numPerPage: pageSize , searchString : this.state.searchVal}, };
    if(typeof data.location_id !== 'object' ){
      data.location_id = context.headerLocationId
    }
      if(typeof data1.location_id !== 'object' ){
      data1.location_id = context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
     this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              data1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                data1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
              :  (
              this.props.listSalesPaginateAction(
                data,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ),
      location.state?.triggeredByTransaction && location.state.rowData && this.props.listSalesDataAction(
        data,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // {pageCount: page || 0, numPerPage:  pageSize},
      )
	  );
    }
    }

    if(preState.selectedSaleStatus !== this.state.selectedSaleStatus){
      if (this.state.searchVal) {
        const context = this.context;
        const body = {
          brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
        }
        const body1 = {
          searchString:this.state.searchVal,
          employeeId:context.commoncookie,
          headerLocationId:context.headerLocationId,
          pageCount:this.state.page,
          numPerPage:this.state.pageSize,
        }
        if (this.state.pageType === '/sales/salesOrders') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchSaleOrderPaginationAction(body1)
          )
        } else if(this.state.pageType === '/sales/deliveryChallan') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchDcPaginationAction(body1)
          )
        } else {
          apiCalls(
            this.props.listSalesPaginateAction(
                  body,
                  context.commoncookie,
                  context.headerLocationId,
                  context.setModalTypeHandler,
                  context.setLoaderStatusHandler,
                )
          )
        }
      }
      else{  
        const context = this.context;
        const data = {...this.exportValue(), ...{pageCount: this.state.page , numPerPage: this.state.pageSize , searchString : this.state.searchVal}, };
        const data1 = {...this.exportValueSaleOrder(), ...{pageCount: this.state.page , numPerPage: this.state.pageSize , searchString : this.state.searchVal}, };
        if(typeof data.location_id !== 'object' ){
          data.location_id = context.headerLocationId
        }
          if(typeof data1.location_id !== 'object' ){
          data1.location_id = context.headerLocationId
         }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
         this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              data1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                data1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                data,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ),
          location.state?.triggeredByTransaction && location.state.rowData && this.props.listSalesDataAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
        );
      }
    }

    if (showSalesModal) {
      this.setState({
        open: true,
        status: 'create',
        returnState: false,
        edit_id_data: [],
        isNewSales: true,
      });
      setTriggerSalesModal(false);
    }

    if (showDcsModal) {
      this.setState({
        open: true,
        status: 'create',
        returnState: false,
        edit_id_data: [],
        isNewSales: true,
      });
      setTriggerDcsModal(false);
    }

  }

//   triggerSalesAPI = () => {
//   const context = this.context;
//   const data = {
//     ...this.exportValue(),
//     pageCount: this.state.page,
//     numPerPage: this.state.pageSize,
//     searchString: this.state.searchVal,
//     sale_status: this.state.selectedSaleStatus,
//   };

//   if (typeof data.location_id !== 'object') {
//     data.location_id = context.headerLocationId;
//   }

//   apiCalls(
//     context.setModalTypeHandler,
//     context.setLoaderStatusHandler,
//     this.props.listSalesPaginateAction(
//       data,
//       context.commoncookie,
//       context.headerLocationId,
//       context.setModalTypeHandler,
//       context.setLoaderStatusHandler
//     )
//   );
// }


  
  pendingPayment = async (data) => {
    const context = this.context;
    this.setState({ rowPopup: {open: false, rowIndex: ''}})
    if(context.headerLocationId === 'null'){
      this.setState({openAlert : true});
      return
    }

    const {customer_id, sales_items, received_amount, sale_id} = data;
   
 
    const { data: customerPendingPaymentData } = await this.customFetch(
      API_URLS.GET_CUSTOMER_PENDING_PAYMENT(data.customer_id, context.headerLocationId),
      'GET',
      {}
    );

    const { data: customerData } = await this.customFetch(
      API_URLS.GET_CUSTOMER_BY_ID(customer_id),
      'GET',
      {}
    );

    const { data: mData } = await this.customFetch(
      API_URLS.GET_MANUAL_SCHEMES_BY_CUSTOMER(customer_id),
      'POST',
      {}
    );

    // let payData = [];
    // payData.push({
    //   id: data.sale_id,
    //   po_number: data.invoice_number,
    //   paid_amount: data.received_amount,
    //   total: data.total,
    //   location_id: context.headerLocationId === 'null' ? data.location_id : context.headerLocationId,
    //   ledger_id : data.ledger_id
    // });
    const targetSaleId = data.sale_id;
    const updatedChildRow = customerPendingPaymentData[0]?.childRow?.map(row => ({
      ...row,
      id: row.sale_id,
      po_number: row.invoice_number, 
      paid_amount: row.received_amount 
    }))?.sort((a, b) => (a.sale_id === targetSaleId ? -1 : b.sale_id === targetSaleId ? 1 : 0));
      customerPendingPaymentData[0].childRow = updatedChildRow;
    
     this.setState({
      getPay: customerPendingPaymentData[0].childRow,
      received_amount: received_amount,
      getCustomer: customerData,
      sales_items: sales_items,
      paymentOpen: true,
      manualNoteSchemes : mData,
      clickedInvoice: data.sale_id
    });
    

  };

  handleSOEdit = async(id) => {
     const type ='salesOrders'
     const response = await this.customFetch(
        API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
        'POST',
        {}
      );
  
    const getData = response.data || []

    if(_.isEmpty(id)){
      await this.setState({
        edit_id_data: getData,
        open: true,
        status: 'editSO',
        new_status: 1,
        rowPopup: { open: false, rowIndex: '' },
        returnState: false
      })
    }
  }

//   handleEdit = async (id, value, returnState = false) => {
//   console.log(value, 'valuevalue');
//   let searchdata = this.state.searchVal
//   let type = this.state.pageType === '/sales/salesOrders' ? 'salesOrders' : this.state.pageType === '/sales/deliveryChallan' ? 'deliveryChallan' :'sales'
// const response = await this.customFetch(`/sales/getSales/childPageDetails/${id}/${type}`, 'POST', {})
//   // let getId;
//   // const response = []
//   console.log('snapshot', JSON.parse(JSON.stringify(response.data)));
//   console.log('responseeeeee',response,  response.data[0].sales_items)
//   //const snapshot = {...response};
// //console.log('snapshot', snapshot);
//    const getData1 = JSON.parse(JSON.stringify(response)) || [];
//   console.log('getdaataaaa', getData1)
//    const getData = getData1
//   const resData = getData.length > 0 ? getData : [];
//   console.log('resDataresData', resData)
//     if (_.isEmpty(id)) {
//       // searchdata.length > 0 ? 
//       //  getId = await  this.props.searchSalesData
//       //   .map((m) => {
//       //     return m.sale_id === id ? m : null;
//       //   })
//       //     .filter((f) => f !== null)
//       //   :
//       //   getId = await this.props.salesByPagination
//       //   .map((m) => {
//       //     return m.sale_id === id ? m : null;
//       //   })
//       //   .filter((f) => f !== null);

//       if (value === 6) {
//         let data = resData
//         let finalData = await data.map((k) => {
//           k.sales_items = k.sales_items.filter(item => item.return_quantity === 0)
//           return { ...k, sale_status: value }
//         });
//         console.log('finalDataaa', finalData)
//         await this.setState({
//           edit_id_data: finalData,
//           open: true,
//           status: 'edit',
//           new_status: value,
//           rowPopup: { open: false, rowIndex: '' },
//           returnState,
//         });
//       } else {
//         let data = resData
//         let finalData = await data.map((k) => {
//           k.sales_items = k.sales_items.filter(item => item.return_quantity === 0)
//           return { ...k, sale_status: value }
//         });
//         console.log('finalDataaaaaaaaaaaa', resData)
//         await this.setState({
//           edit_id_data: data,
//           open: true,
//           status: 'edit',
//           new_status: value,
//           rowPopup: {open: false, rowIndex: ''},
//           returnState,
//         });
//       }

//     }
//   };


handleEdit = async (id, value, returnState = false) => {

  // Multi-invoice Sales Return: open new SalesReturn form with pre-loaded data
  if (returnState === true) {
    let type = 'sales';
    const response = await this.customFetch(
      API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
      'POST',
      {}
    );
    const getData = response.data || [];
    const saleData = getData.length > 0 ? getData[0] : {};
    this.setState({
      salesReturnOpen: true,
      salesReturnPreload: {
        customer_id: saleData.customer_id,
        customer_name: saleData.company_name,
        location_id: saleData.location_id,
        sale_id: id,
        invoice_number: saleData.invoice_number,
      },
      savedRowPopup: { ...this.state.rowPopup },
      rowPopup: { open: false, rowIndex: '' },
    });
    return;
  }

  let searchdata = this.state.searchVal
  let type = this.state.pageType === '/sales/salesOrders' ? 'salesOrders' : this.state.pageType === '/sales/deliveryChallan' ? 'deliveryChallan' :'sales'
  const response = await this.customFetch(
        API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
        'POST',
        {}
      );
  // let getId;
  // console.log(JSON.stringify(response.data[0]), 'response')
   const getData = response.data || [];
  const resData = getData.length > 0 ? JSON.stringify(getData) : [];
  
    if (_.isEmpty(id)) {
      // searchdata.length > 0 ?
      //  getId = await  this.props.searchSalesData
      //   .map((m) => {
      //     return m.sale_id === id ? m : null;
      //   })
      //     .filter((f) => f !== null)
      //   :
      //   getId = await this.props.salesByPagination
      //   .map((m) => {
      //     return m.sale_id === id ? m : null;
      //   })
      //   .filter((f) => f !== null);
 
      if (value === 6) {
        let data = JSON.parse(resData)
        let finalData = await data.map((k) => {
          k.sales_items = k.sales_items.filter(item => item.return_quantity === 0)
          return { ...k, sale_status: value }
        });
        await this.setState({
          edit_id_data: finalData,
          open: true,
          status: 'edit',
          new_status: value,
          rowPopup: { open: false, rowIndex: '' },
          returnState,
        });
      } else {
        let data = JSON.parse(resData)
        let finalData = await data.map((k) => {
          k.sales_items = k.sales_items.filter(item => item.return_quantity === 0)
          return { ...k, sale_status: value }
        });
        await this.setState({
          edit_id_data: JSON.parse(resData),
          open: true,
          status: 'edit',
          new_status: value,
          rowPopup: {open: false, rowIndex: ''},
          returnState,
        });
      }
 
    }
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteSalesAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        context.commoncookie,
        context.headerLocationId,
        (response)=>{
          if(response === 200){
            const paginationData = {
              brand: '',
              category: '',
              location_id: context.headerLocationId,
              max_price: '',
              min_price: '',
              payment_type: '',
              from: null,
              to: null,
              user_id: context.commoncookie,
              pageCount: 0, 
              numPerPage:  this.state.pageSize,
              searchString : this.state.searchVal,
              sub_company_id : this.state.subcompanyId
            };
             const paginationData1 = {
              brand: '',
              category: '',
              location_id: context.headerLocationId,
              max_price: '',
              min_price: '',
              from: null,
              to: null,
              user_id: context.commoncookie,
              pageCount: 0, 
              numPerPage:  this.state.pageSize,
              searchString : this.state.searchVal,
              sub_company_id : this.state.subcompanyId
            };
            apiCalls(
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
                this.state.pageType === '/sales/salesOrders' ?
               (this.props.listSaleOrderPaginateAction(
              paginationData1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
              )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ),
            );

          }
        }
      )
	  );
    this.setState({delete: false, rowPopup: {open: false, rowIndex: ''}});
  };

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  responseDialog = async (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, dialog_open: true},
    });
  };


  closeDc = async (dc_id,return_id) => {
    const context = this.context;

    const goal = 'deliveryChallan'
    let id = dc_id
    let data = {
      return_id: return_id
    }
    const poptype = 'dcreturn'
    const api_data = await this.customFetch(
      API_URLS.GET_SALES_INVOICE_DETAILS(id, goal, poptype),
      'POST', data
    );	
    const getData = api_data?.data || [];
    this.props.setInvoiceTempAction(getData)
    const type = 'newSales';
    this.setState({open: false, delete: false});
    this.setState({...this.state.dialog, dialog: {dialog_open: false}});
    this.setState({
      popupData: {
        Dopen: true,
      }
    })
    getData?.length && context.setLoaderStatusHandler(false);

  }

  handleClose = () => {
    const context = this.context;
    this.setState({ open: false, delete: false, isNewSales: false});
    this.setState({...this.state.dialog, dialog: {dialog_open: false}});
    this.setState({
      popupData: {...this.state.popupData, Dopen: false},
      rowPopup: {open: false, rowIndex: ''},
    });
    this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
    context.setSoDialogOpenHandler(false);
    // this.props.listStockLocationSequenceAction(
    //   {sequence_type: ['SO', 'DC'] },
    //   null,
    //   context.commoncookie,
    //   // context.headerLocationId,
    //   'null'
    // )
  };

  handleNewopensales = async() => {
    // console.log("handleNewopen")
    const context = this.context;
   await  this.setState({open: false, delete: false});
   await  this.setState({...this.state.dialog, dialog: {dialog_open: false}});
   await  this.setState({
      popupData: {...this.state.popupData, Dopen: false},
      rowPopup: {open: false, rowIndex: ''},
    });
   await  this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
   await context.setSoDialogOpenHandler(false);
  await this.setState({open : true, isNewSales: true, status: 'create', edit_id_data: []})
  };

  sample = (value, errBarcode) => {
    const context = this.context;

    if (value === 'barCodeError') {
      context.setModalTypeHandler('barCodeError');
      context.setModalStatusHandler(true);
      context.setselectData('barCodeError', errBarcode);
    }

    if (value === false) {
      if (
        this.state.sale_status === 1 ||
        this.state.sale_status === 2 ||
        this.state.sale_status === 6
      ) {
        context.setSoDialogOpenHandler(true);
      } else {
        this.handleClose();
      }

      if (this.state.sales_payment.length) {
        this.ledgerPaymentApi();
        // const cookies = new Cookies();
        const storage = getsessionStorage()
        let emp_id = storage?.employee_id || '';
        // this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
        //   if (!roleType.includes(role_name)) {
        //     let notify_type = notificationType('sales payment');
        //     let notify_content = content?.filter(
        //       (m) => m.notification_type === notify_type,
        //     );
        //     if (notify_content.length) {
        //       const salesData = {...this.state.sales_data};
        //       let paymentRefid = salesData.customer_id || '';
        //       let customerName = salesData.custData.company_name || '';
        //       let amount_value = salesData.total || '';
        //       let locationName =
        //         this.props.stocklocation.find(
        //           (m) => m.location_id === salesData.location_id,
        //         ) || {};
        //       let content_body = `${customerName} \n${amount_value} \n${locationName.location_name} \n${paymentRefid}`;
        //       sendNtfy(token, notify_content[0]?.title, content_body);
        //       this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
        //     }
        //   }
        // });
      }

      // if (this.state.sale_status === 2) {
      //   this.ledgerApi();
      // }
      if (this.state.sale_status === 1 || this.state.sale_status === 2) {
        // const cookies = new Cookies();
        const storage = getsessionStorage()
        let emp_id = storage?.employee_id || '';
        // this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
        //   if (!roleType.includes(role_name) && this.state.sale_status === 2) {
        //     let notify_type = notificationType('sales invoice');
        //     let notify_content = content?.filter(
        //       (m) => m.notification_type === notify_type,
        //     );
        //     if (notify_content.length) {
        //       const salesData = {...this.state.sales_data};
        //       let customerName = salesData.custData.company_name || '';
        //       let invoiceNumber = salesData.invoice_number || '';
        //       let amount_value = salesData.total || '';
        //       let locationName =
        //         this.props.stocklocation.find(
        //           (m) => m.location_id === salesData.location_id,
        //         ) || {};
        //       let content_body = `${customerName} \n${invoiceNumber} \n${amount_value} \n${locationName.location_name}`;
        //       sendNtfy(token, notify_content[0]?.title, content_body);
        //       this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
        //     }
        //   }
        //   if (!roleType.includes(role_name) && this.state.sale_status === 1) {
        //     let notify_type = notificationType('sales order');
        //     let notify_content = content?.filter(
        //       (m) => m.notification_type === notify_type,
        //     );
        //     if (notify_content.length) {
        //       const salesData = {...this.state.sales_data};
        //       let customerName = salesData.custData.company_name || '';
        //       let amount_value = salesData.total || '';
        //       let locationName =
        //         this.props.stocklocation.find(
        //           (m) => m.location_id === salesData.location_id,
        //         ) || {};
        //       let content_body = `${customerName} \nâ‚¹${amount_value} \n${locationName.location_name}`;
        //       sendNtfy(token, notify_content[0]?.title, content_body);
        //       this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
        //     }
        //   }
        // });
      }
    }
    // this.ApplyButton(this.state.filtedValue);
    this.previousPageApi();
  };

  previousPageApi = () => {
    const context = this.context;
    let page = this.state.page;
    let pageSize = this.state.pageSize
    if (this.state.searchVal) {
      const body = {
        brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
      }  
       const body1 = {
        searchString:this.state.searchVal,
        employeeId:context.commoncookie,
        headerLocationId:context.headerLocationId,
        pageCount:page,
        numPerPage:pageSize
      } 

       if (this.state.pageType === '/sales/salesOrders') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchSaleOrderPaginationAction(body1)
          )
        } else if(this.state.pageType === '/sales/deliveryChallan') {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchDcPaginationAction(body1)
          )
        } else {
          apiCalls(
            this.props.listSalesPaginateAction(
                  body,
                  context.commoncookie,
                  context.headerLocationId,
                  context.setModalTypeHandler,
                  context.setLoaderStatusHandler,
                )
          )
        }
    }else {
      const data = {
        ...this.exportValue(),
        pageCount: page,
        numPerPage: pageSize,
        location_id: context.headerLocationId,
        searchString : this.state.searchVal,
      };
         const data1 = {
        ...this.exportValueSaleOrder(),
        pageCount: page,
        numPerPage: pageSize,
        location_id: context.headerLocationId,
        searchString : this.state.searchVal,
      };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              data1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
            )) :  this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                data1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                data,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
              )
            ),
      );
    }
  }

  ledgerApi = () => {
    const context = this.context;
    const data = {
      // "code": "00",
      // "entity": "00",
      location_id: this.state.sales_data.location_id,
      specialNumber: '00',
      note: 'Sale Order',
      // referenceNumber: this.state.Tdata,
      voucherTypeId: 1,
    };
    const temp = {
      // [Cost_of_Goods_Sold]: {
      //   desc: 'Total cost price',
      //   amt: this.state.total_cost_price,
      // },
      // [Inventory]: {desc: 'Total cost price', amt: this.state.total_cost_price},
      [Sales_ledger]: {
        desc: 'Total unit price',
        amt: this.state.total_unit_price,
      },
      [SGST_Payable]: {
        desc: 'SGST% x Total unit price',
        amt: this.state.gst_inter,
      },
      [CGST_Payable]: {
        desc: 'CGST% x Total unit price',
        amt: this.state.gst_inter,
      },
      [TCS_Payable]: {
        desc: 'TCS% x Total unit price',
        amt: this.state.tcs_inter,
      },
      [IGST_Payable]: {desc: 'IGST% x Total unit price', amt: 0},
      Customer: {desc: 'Total sales amount', amt: this.state.total_with_gst},
    };
    const accountTransaction = [];
    this.props.chartOfAccounts.forEach((d) => {
      const {id, creditSign, debitSign} = d;
      const dd = {accountId: id, description: temp[d.name]?.desc};

      if (
        [
          Sales_ledger,
          // Inventory,
          SGST_Payable,
          CGST_Payable,
          IGST_Payable,
          TCS_Payable
        ].includes(d.name)
      ) {
        dd.amount = creditSign * temp[d.name]?.amt
          // Number(creditSign) === 1
          //   ? temp[d.name]?.amt
          //   : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if (this.state.custLedgerId === id) {
        dd.amount = debitSign * temp['Customer']?.amt
          // Number(debitSign) === 1
          //   ? temp['Customer']?.amt
          //   : `-${temp['Customer']?.amt}`;
        dd.description = temp['Customer']?.desc;
        accountTransaction.push(dd);
      }
    });
    data.accountTransaction = accountTransaction;
    this.props.createTransactionAction(
      data,
      true,
      this.context.setLoaderStatusHandler,
    );
  };

  getPrice = (type) => {
    let total = 0;
    this.state.cnPopupData.sales_items.forEach((d) => {
      total += +acc.quantity * +acc[type];
    });
    return total;
  };

  taxes = () => {
    let total = 0;
    for (let data of this.state.cnPopupData.sales_items) {
      const prc = data.item_unit_price;
      const qty = data.quantity || 1;

      let tax = 0;

      this.props.productByType.some((p) => {
        if (p.item_id === data.item_id) {
          p.taxes.forEach((t) => {
            if (t.tax_group === 'IGST') {
              tax = t.tax_rate;
            }
            return null;
          });
          return true;
        }
        return false;
      });
      total += ((prc * qty) / 100) * tax;
    }
    return total ? total : 0;
  };

  // ledgerReturnApi = (returnData) => {
  //   const context = this.context;
  //   const data = {
  //     // "code": "00",
  //     // "entity": "00",
  //     location_id: returnData.location_id,
  //     specialNumber: '00',
  //     note: 'Sales Return',
  //     // referenceNumber: this.state.Tdata,
  //     voucherTypeId: 1,
  //   };
  //   const temp = {
  //     [Sales_ledger]: {
  //       desc: 'Total unit price',
  //       amt: this.getPrice('item_unit_price'),
  //     },
  //     [SGST_Payable]: {
  //       desc: 'SGST% x Total unit price',
  //       amt: (this.taxes() / 2).toFixed(2),
  //     },
  //     [CGST_Payable]: {
  //       desc: 'CGST% x Total unit price',
  //       amt: (this.taxes() / 2).toFixed(2),
  //     },
  //     [IGST_Payable]: {desc: 'IGST% x Total unit price', amt: 0},
  //     [Credit_Notes]: {
  //       desc: 'Total sales amount',
  //       amt: (this.getPrice('item_unit_price') + this.taxes()).toFixed(2),
  //     },
  //   };
  //   const body = { 
  //     id: null,
  //     name:  [
  //       Sales_ledger,
  //       SGST_Payable,
  //       CGST_Payable,
  //       IGST_Payable,
  //       Credit_Notes
  //     ]
  //   }
  //   const accountTransaction = [];
  //   this.props.chartOfAccountsIdNameAction(body, (list)=>{
  //       list.forEach((d) => {
  //     const {id, creditSign, debitSign} = d;
  //     const dd = {accountId: id, description: temp[d.name]?.desc};

  //     if (
  //       [
  //         Sales_ledger,
  //         SGST_Payable,
  //         CGST_Payable,
  //         IGST_Payable,
  //         Credit_Notes
  //       ].includes(d.name)
  //     ) {
  //       dd.amount = debitSign * temp[d.name]?.amt
  //       accountTransaction.push(dd);
  //     } else if (this.state.cnPopupData.custLedgerId === id ) {
  //       dd.amount = creditSign * returnData.total
  //       dd.description = this.props.credit_debit_seq.credit_note
  //       accountTransaction.push(dd);
  //     }
  //      })});
  //   data.accountTransaction = accountTransaction;
  //   this.props.createTransactionAction(
  //     data,
  //     true,
  //     this.context.setLoaderStatusHandler,
  //   );
  // };

  ledgerPaymentApi = () => {
    const context = this.context;
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id: context.headerLocationId,
      specialNumber: '324',
      note: 'POS',
      referenceNumber: this.state.Tdata,
      voucherTypeId: 1,
    };
    const temp = {
      Customer: {desc: 'Total sales amount', amt: this.state.total_with_gst},
      'Bank/Cash': {
        desc: 'Amount settled from Bank',
        amt: this.state.total_with_gst,
      },
    };
    const body = {
      id: null,
      name:  [
        'Bank/Cash'
      ]
    }
    const accountTransaction = [];
    this.props.chartOfAccountsIdNameAction(body, (list)=>{list.forEach((d) => {
      const {id, creditSign, debitSign} = d;
      const dd = {accountId: id, description: temp[d.name]?.desc};

      if ('Bank/Cash' === d.name) {
        dd.amount =
          Number(debitSign) === 1 ? temp[d.name]?.amt : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if (this.state.custLedgerId === id) {
        dd.amount =
          Number(creditSign) === 1
            ? temp['Customer']?.amt
            : `-${temp['Customer']?.amt}`;
        dd.description = temp['Customer']?.desc;
        accountTransaction.push(dd);
      }
    })});
    data.accountTransaction = accountTransaction;
    // this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)
  };

  getCustLedger = (data) => {
    this.setState({custLedgerId: data});
  };

  handleSubmit = async (
    data,
    posSeq,
    total_cost_price,
    total_unit_price,
    gst_inter,
    tcs_inter,
    setDisable,
    dcchallan
  ) => {
    const context = this.context;
    const nameDeleting = data;
    const updateData = data
    this.setState({ sales_data: data, invoiceNumberChangeDialog: false });
    updateData.sales_items = data.sales_items.map((item) => {
      if (item.is_serialized === 0) {
        return {
          ...item,
          NSlots: [],
          lots: [],
        };
      }
      return item;
    });
    nameDeleting.sales_items = data.sales_items.map((item) => {
      if (item.is_serialized === 0) {
        return {
          ...item,
          NSlots: [],
          lots: [],
        };
      }
      return item;
    });
    this.setState({
      sale_status: data.sale_status,
      total_cost_price,
      total_unit_price,
      total_with_gst: (data.total),
      gst_inter,
      tcs_inter,
      sales_payment: data.sales_payment,   
    });
    
    let transactionEntryData = {
      total_cost_price,
      total_unit_price,
      total_with_gst: parseFloat(data.total).toFixed(2),
      gst_inter,
      tcs_inter,
      tds_inter : data.tds,
      rounded_off: data.rounded_off,
      isRoundedOffNegative: data.isRoundedOffNegative,
      discount: data.discount_amount ? data.discount_amount : data.sales_items.reduce((sum, list) => sum + Number(list.discount), 0),
      shipping_charges: data.shipping_charges,
      other_charges: data.other_charges
    }
    if(data.sale_status === 7){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler, 
        this.props.CancelinvoiceSalesAction(
            data.sale_id,
            data,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            () => {},
            (response)=>{
              if (response === 200) {

                this.setState({
                  popupData: {
                    Dopen: true,
                    isNewSales : false, 
                    status: 'create', 
                    edit_id_data: []
                  }
                })
                this.handle_newSalesAfterCreating_Data({
                  sale_status : data.sale_status,
                  location_id : data.location_id,
                  comment : data.comment,
                  reference : data.reference
                })
              

                const paginationData = {
                  brand: '',
                  category: '',
                  location_id: context.headerLocationId,
                  max_price: '',
                  min_price: '',
                  payment_type: '',
                  from: null,
                  to: null,
                  user_id: context.commoncookie,
                  pageCount: this.state.page, 
                  numPerPage:  this.state.pageSize,
                  searchString : this.state.searchVal,
                  sale_status: this.state.selectedSaleStatus,
                  sub_company_id : this.state.subcompanyId
                };
                 const paginationData1 = {
                  brand: '',
                  category: '',
                  location_id: context.headerLocationId,
                  max_price: '',
                  min_price: '',
                  from: null,
                  to: null,
                  user_id: context.commoncookie,
                  pageCount: this.state.page, 
                  numPerPage:  this.state.pageSize,
                  searchString : this.state.searchVal,
                  sub_company_id : this.state.subcompanyId
                };
                this.setState({ open: false})
               this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              paginationData1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            )   
              }
            }
          ),
      );
      }
    //  else if (data.sale_id && data.dc_number === null) {
    if (data.sale_id && dcchallan === 'edit' ) {
      const {sequence_id, current_seq} = posSeq;

      // console.log('updateeeeeee', data)
      // if (this.state.sale_status === 2) {
      //   const {headerLocationId, commoncookie} = context;
      //   apiCalls(
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //     this.props.posSequence(
      //       sequence_id,
      //       {current_seq, sequence_type: 'SO', headerLocationId, commoncookie},
      //       context.setLoaderStatusHandler,
      //     )
      //   );
      // }
      delete data.Einvoice;
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateSalesAction(
          data.sale_id,
          {...updateData,status_change: 'true', updated_by: context.commoncookie,transactionEntryData},
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          context.commoncookie,
          context.headerLocationId,
          (response)=>{
            if(response === 200){
              // this.props.listStockLocationSequenceAction(
              //   {sequence_type: ['SO', 'DC'] },
              //   null,
              //   context.commoncookie,
              //   context.headerLocationId,
              // )
            }

          }
        )
      );
      // await this.setState({ open: false})
      // await this.props.listSalesAction(context.commoncookie,context.headerLocationId,context.setModalTypeHandler,context.setLoaderStatusHandler)
    } 
    else if(data.order_id && dcchallan === 'editSO'){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateSalesOrderAction(
          data.order_id,
          updateData,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          context.commoncookie,
          context.headerLocationId,
          async (response) => {
            if(response.status === 200) {
              const poptype='invoice'
              const type='saleOrder'
              const res = await this.customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(data.order_id, type, poptype),
                'POST'
              );
              this.props.setInvoiceTempAction(res.data)
              this.setState({
                popupData: {
                  Dopen: true,
                  isNewSales : false, 
                  status: 'create', 
                  edit_id_data: []
                }
              })
              this.handle_newSalesAfterCreating_Data({
                sale_status : data.sale_status,
                location_id : data.location_id,
                comment : data.comment,
                reference : data.reference
              })
            }
          }
        ),
      )
    }
    else {
      const {sequence_id, current_seq, dcsequence_id, dccurrent_seq} = posSeq;
      const {headerLocationId, commoncookie} = context;
       nameDeleting.type =data.dc_number !== null ?'type2' : 'type1'
      // nameDeleting.type =dcchallan === 'edit' ?'type2' : 'type1'
       
      if(data.dc_number !== null && data.sale_status !== 8){
        // delete nameDeleting.sale_id;
        delete nameDeleting.location_name;
        delete nameDeleting.updated_by;
        delete nameDeleting.created_by;
        delete nameDeleting.sale_time;
        delete nameDeleting.invoice_date;
         delete nameDeleting.quote_number;
          delete nameDeleting.reference;
           delete nameDeleting.company_name;
            delete nameDeleting.customer_type;
             delete nameDeleting.ledger_id;
              delete nameDeleting.payment_type;
               delete nameDeleting.ordered_qty;
                delete nameDeleting.delivery_qty;
                 delete nameDeleting.shipping_address;
                 delete nameDeleting.billed_on;
                 delete nameDeleting.due_amount;
                 delete nameDeleting.timeLine_data;
                 delete nameDeleting.due_days;
                 delete nameDeleting.amount;
                 delete nameDeleting.hsn_code;
                 delete nameDeleting.changed_on;
                 delete nameDeleting.dc_number;
                 //soldLots remove
      }
      
      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
        // this.props.posSequence(
        //  data.sale_status === 8 ? 50 : sequence_id,
        //   {current_seq: data.sale_status === 8 ? dccurrent_seq : current_seq, sequence_type: data.sale_status === 8 ? 'DC' :'SO', headerLocationId, commoncookie},
        //   context.setLoaderStatusHandler,
        // ),
        context.setLoaderStatusHandler(true)

        this.props.createSalesAction(

          {...nameDeleting, pre_order: {},transactionEntryData, sequence_id : data.sale_status === 8 ? dcsequence_id : sequence_id},
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          setDisable,
          ()=>{},
          async (response)=>{
            if(response?.status ==='INVOICE_EXIST'){
              // this.props.listStockLocationSequenceAction(
              //   {sequence_type: ['SO', 'DC'] },
              //   null,
              //   context.commoncookie,
              //   'null',
              // )
              // this.setState({ invoiceNumberChangeDialog: true })
            }
            else if(response?.status === 200){
              // this.props.listStockLocationSequenceAction(
              //   {sequence_type: ['SO', 'DC'] },
              //   null,
              //   context.commoncookie,
              //   context.headerLocationId,
              // )
              const goal =  response?.data?.data?.[0]?.sale_status == 4 ? 'sales' : response?.data?.OrderInsert?.id ?'saleOrder'  : 'deliveryChallan'
              let id = response?.data?.data?.[0]?.sale_status == 4 ? response?.data?.data?.[0].sale_id :  response?.data?.OrderInsert ? response?.data?.OrderInsert?.id : response?.data?.dcInsert?.id
              this.props.clearInvoiceTempAction()
              const poptype='invoice'
              const api_data = await this.customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, goal, poptype),
                'POST',{}
              );
              const getData = api_data?.data || [];
              this.props.setInvoiceTempAction(getData)
              const type = 'newSales';
              this.setState({
                popupData: {
                  Dopen: true,
                  isNewSales : false, 
                  status: 'create', 
                  edit_id_data: []
                }
              })
              this.handle_newSalesAfterCreating_Data({
                sale_status : data.sale_status,
                location_id : data.location_id,
                comment : data.comment,
                reference : data.reference
              })
              context.setLoaderStatusHandler(false);
              // this.handleClose()
              
              // this.invoiceFunction(response.data.data[0], type);
            }
          }
        )
      //);
   //   await this.setState({ open: false})
    }

  };

  setAppConfigData = (data) =>{
    this.setState({appConfigData:{...this.state.appConfigData,...data}})
  }

  invoiceFunction = async (data, type = '') => {
    
    if (type === 'newSales') {
      const context = this.context;
      const custData = {
        company_name: data.company_name,
        first_name: data.first_name,
        city: data.city,
        email: data.email,
        state: data.state,
        area: data.area,
        phone_number: data.phone_number,
        tax_id: data.tax_id,
        zip: data.zip

      }
      await this.props.ListTermsAndConditionsAction(),
        await this.getAppConfigData();
      const locationData = this.props.stocklocation.filter(f => f.location_id === data.location_id)
      const temp_sales_items = this.props.searchSalesData?.length > 0 || this.state.searchVal ? (this.state.pageType === '/sales/salesOrders' ? this.props.searchSaleOrderData :  this.state.pageType === '/sales/deliveryChallan' ? this.props.searchDcData : this.props.searchSalesData) :
      (this.state.pageType === '/sales/salesOrders' ? this.props.saleOrderByPagination : this.state.pageType === '/sales/deliveryChallan'  ? this.props.dcByPagination : this.props.salesByPagination)
      

      const sales_items = temp_sales_items
        .filter((f) => f.sale_id === data.sale_id)[0]
        ?.sales_items.map((d) => {

          const taxes =
            this.props.productByType.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
            [];
          // d.taxes = taxes;
          d.status = data.sale_status;
          return d;
        });
      if (locationData.length) {
        let data = {
          companyAddress: locationData.length > 0 ? locationData[0].address : '',
          companyEmail: locationData.length > 0 ? locationData[0].email == null ? '' : locationData[0].email : '',
          companyMobile: locationData.length > 0 ? locationData[0].phone_number : '',
          state: locationData.length > 0 ? locationData[0].state : '',
        }
        this.setAppConfigData(data)
      }
      const termsAndConditions = this.props.termsAndConditionsList?.filter(e => e.invoice_types === 'Sales')
      await this.setState({
        popupData: {
          invoice: data.invoice_number,
          note: data.note,
          custData: custData,
          soDate: data.so_date,
          sales_items: data.sales_items,
          Dopen: true,
          customer_id: data.customer_id,
          sale_id: data.sale_id,
          sales_payments: data.sales_payments,
          invoice_date: data.invoice_date_converted,
          E_invoice: data.Einvoice,
          so_number: data.so_number,
          termsAndConditions: termsAndConditions.length > 0 ? termsAndConditions[0].terms_conditions : [],
          tcs: data?.tcs,
          tds: data?.tds,
          tcspercent: data?.tcs_percent,
          tdspercent: data?.tds_percent,
          shipping_details: data?.shipping_details,
          isRoundedOffNegative: data?.isRoundedOffNegative,
          rounded_off: data?.rounded_off,
          dc_number: data?.dc_number
        },
        sale_status: 6,
      });
    }

    else {
      const id = data.sale_id ? data.sale_id  : data.dc_id ? data.dc_id  : data.order_id
      const context = this.context; 
      const type = data.sale_id  ? 'sales' : data.dc_id ? 'deliveryChallan' :'saleOrder'
      let poptype = data.dc_id && data.return_id!==null ? 'dcreturn' : 'invoice'
      const postBody = data.return_id ? { return_id: data.return_id } : {};
      // const response = await this.customFetch(`/sales/getSales/salesInvoiceDetailsById/${id}/${type}/${poptype}`, 'POST', postBody);
      const response = await this.customFetch(
        API_URLS.GET_SALES_INVOICE_DETAILS(id, type, poptype),
        'POST',
        postBody
      );

      const getData = response.data || [];
      const finalData = getData.length > 0 ? getData[0] : {};
      this.props.setInvoiceTempAction(getData)
      const updatedSalesItems = (finalData.sales_items || []).map(item => ({
        ...item,
        status: finalData.sale_status,
      }));

      // console.log("finalData", finalData.sales_items)
      const custData = {
        company_name: finalData.company_name,
        first_name: finalData.first_name,
        city: finalData.city,
        email: finalData.email,
        state: finalData.state,
        area: finalData.area,
        phone_number: finalData.phone_number,
        tax_id: finalData.tax_id,
        zip: finalData.zip

      }
      await this.props.ListTermsAndConditionsAction(),
        await this.getAppConfigData();
      const locationData = this.props.stocklocation.filter(f => f.location_id === finalData.location_id)


      if (locationData.length) {
        let data = {
          companyAddress: locationData.length > 0 ? locationData[0].address : '',
          companyEmail: locationData.length > 0 ? locationData[0].email == null ? '' : locationData[0].email : '',
          companyMobile: locationData.length > 0 ? locationData[0].phone_number : '',
          state: locationData.length > 0 ? locationData[0].state : '',
        }
        this.setAppConfigData(data)
      }
      const termsAndConditions = this.props.termsAndConditionsList?.filter(e => e.invoice_types === 'Sales')
      await this.setState({
        popupData: {
          invoice: finalData.invoice_number,
          note: finalData.note,
          custData: custData,
          soDate: finalData.so_date,
          sales_items: updatedSalesItems,
          Dopen: true,
          customer_id: finalData.customer_id,
          sale_id: finalData.sale_id,
          sales_payments: data.sales_payments,
          invoice_date: finalData.invoice_date_converted,
          E_invoice: finalData.Einvoice,
          so_number: finalData.so_number,
          termsAndConditions: termsAndConditions.length > 0 ? termsAndConditions[0].terms_conditions : [],
          tcs: finalData?.tcs,
          tds: finalData?.tds,
          tcspercent: finalData?.tcs_percent,
          tdspercent: finalData?.tds_percent,
          shipping_details: finalData?.shipping_details,
          isRoundedOffNegative: finalData?.isRoundedOffNegative,
          rounded_off: finalData?.rounded_off,
          dc_number: finalData?.dc_number,
          Template: getData
        },
        sale_status: 6,
      });
    }


  };

  cnInvoiceFunction = async (data,customer,credit_debit_seq) => {
  //  console.log("ooooooo",data)
    const custData =
      (await customer.find(
        (d) => data.customer_id === d.customer_id,
      )) || {};
    const sales_items = await data.sales_items.map((d) => {
      const taxes =
        this.props.productByType.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
        [];
      d.taxes = taxes;
      return d;
    });
    await this.setState({
      cnPopupData: {
        invoice: credit_debit_seq.credit_note,
        custData: custData,
        soDate: data.so_date,
        sales_items: sales_items,
        customer_id: data.customer_id,
        sale_id: data.sale_id,
        note: data.note,
        sales_payments: data.sales_payments,
        invoice_date: data.invoice_date_converted,
        total: data.total,
        custLedgerId: custData.ledger_id,
        isRoundedOffNegative: data?.isRoundedOffNegative,
        rounded_off: data?.rounded_off,
        Dopen: true,
      },
    });
    // await this.ledgerReturnApi(data); this process is changed to Backend

    // For NewData AfterSelesReturnedReload
    this.setState({headerupdate: ''})
  };

  cnhandleOpen = () => {
    this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: true}});
  };

  invoiceDialogSendMail = () => {
    this.createMail(
      this.state.popupData.custData,
      this.state.popupData.invoice,
      this.state.popupData.sales_items,
      this.state.popupData.custData.email,
      this.state.popupData.invoice_date,
    );
  };
  cninvoiceDialogSendMail = () => {
    this.createMail(
      this.state.cnPopupData.custData,
      this.state.cnPopupData.invoice,
      this.state.cnPopupData.sales_items,
      this.state.cnPopupData.custData.email,
      this.state.cnPopupData.invoice_date,
    );
  };
  createMail = (custData, invoice_number, sales_items, email, soDate) => {
    const context = this.context;
    // const data = {
    //   custData,
    //   invoice_number,
    //   sales_items,
    //   email,
    //   appConfigData:this.state.appConfigData,
    //   soDate
    // }
    const data = {
      appConfigData: this.state.appConfigData,
      custData,
      invoice_number: invoice_number,
      sales_items: sales_items,
      email: custData.email,
      no_sms: true,
      posSale: true,
      sales_payments: this.state.sales_payments,
      soDate: soDate,
      sale_id: this.state.sale_id,
    };
    if (this.state.sale_status === 6) {
      data.posSale = true;
    }
    this.props.sendMail(data, context.setLoaderStatusHandler);
    this.handleClose();
  };

  setpaymentOpen = (data) => {
    const context  = this.context
    this.setState({paymentOpen: data, Tdata: []});
    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    }
    this.props.listSalesPaginateAction(
        paginationData,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // {pageCount: 0, numPerPage:  pageSize},
      )
  };

  setTdata = (data) => {
    this.setState({Tdata: data});
  };

  setHandleEntry = (data) =>{
    this.setState({entryvalue : data})
  }

  setSalesItems = (data) => {
    this.setState({sales_items: data});
  };
  setReceData = (data) =>{
    this.setState({recData : data})
  }

   paymentValidate = (type, receiptDate) => {
    this.setState({disableSubmit: true})
     const context  = this.context;
    let receivedAmount =
      this.state.Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);
    // }, this.state.getCustomer.creditNote_balance) + this.state.received_amount;
      const hasExcessPayment =  this.state.Tdata.some((item) => item.payment_amount > item.due);

    receivedAmount = this.state.manualNoteSchemes.filter(i => i.selected).reduce((a,c) => a + +c.new_adjusted_amount, receivedAmount)

    const creditNotePayables = this.state.selectionModel
      ?.filter(item => ['Credit Note', 'Unused Credit'].includes(item.type) && item.payable)
      .reduce((sum, note) => sum + parseFloat(note.payable || 0), 0);

    let indiviTotal = receivedAmount;
    const invoiceSelections = this.state.selectionModel.filter(item => !['Credit Note', 'Unused Credit'].includes(item.type));
    const receivables = invoiceSelections.map((acc,d) => {
      const newObj = {};
      const sub = indiviTotal - (+acc.originalRow.total - +acc.originalRow.paid_amount);
      const totalPaymentAmount = this.state.Tdata.reduce((sum, item) => sum + item.payment_amount, 0);

// console.log(this.state.selectionModel,d.total,d.paid_amount,totalPaymentAmount,this.state.Tdata,"selectionModel");

      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        // newObj.received_amount = +acc.paid_amount + indiviTotal;
        // console.log(+acc.paid_amount + indiviTotal,"yrtgffnnnm");
        
        newObj.received_amount =  +acc?.originalRow?.paid_amount + totalPaymentAmount + creditNotePayables;
        newObj.ledger_id = this.state.getCustomer.ledger_id
        newObj.receivable_amount = acc?.originalRow?.due_amount;
        newObj.paymentAmount = acc?.paymentAmount;
        newObj.saleType = acc?.originalRow?.saleType;

        newObj.sales_payment = [
          {
            ...this.state.Tdata[0],
            payment_amount: Number(d?.paymentAmount ?? 0),
            ledger_id: this.state.getCustomer.ledger_id,
            ...(!this.state.Tdata.length && {
              employee_id: context.commoncookie,
              payment_type: 'Credit Note',
              reference_code: '',
              cash_refund:0
            }),
            ...(this.addAdvanceAmount.current && {
              change: [],
              cash_adjustment: 0
            })
          },
        ];
        indiviTotal = sub;
      } else {
        newObj.received_amount = +acc?.originalRow?.paid_amount + indiviTotal + creditNotePayables;
        // newObj.received_amount = totalPaymentAmount;
        newObj.receivable_amount = acc?.originalRow?.due_amount;
        newObj.paymentAmount = acc?.paymentAmount;
        newObj.saleType = acc?.originalRow?.saleType;

        newObj.sales_payment = [
          {
            ...this.state.Tdata[0],
            payment_amount: Number(d?.paymentAmount ?? 0),
            ...(!this.state.Tdata.length && {
              employee_id: context.commoncookie,
              payment_type: 'Credit Note',
              reference_code: '',
              cash_refund:0
            }),
            ...(this.addAdvanceAmount.current && {
              change: [],
              cash_adjustment: 0
            })
          },
        ];
        indiviTotal = 0;
      }
      newObj.sale_id = acc.id;
      newObj.location_id = context.headerLocationId !== 'null' ? context.headerLocationId : acc.location_id;
      return newObj;
    });
    let calculatedAdvanceAmount = 0;
    const totalDue = this.state.selectionModel.reduce((sum, row) => {
      return sum + Number(row?.originalRow?.due_amount ?? 0);
    }, 0);
    const total_paid_amount = this.state.Tdata.reduce((sum, row) => {
      return sum + Number(row?.payment_amount ?? 0);
    }, 0);
    const updatedTdata = this.state.Tdata.map((item) => {
      if (item.payment_amount > item.due) {
        calculatedAdvanceAmount += item.payment_amount - item.due;
        return { ...item };
      }
      return item;
    });

    calculatedAdvanceAmount = total_paid_amount - totalDue

    //  const saleUpdate = receivables.map((r) => ({
    //    ...r,
    //    received_amount:
    //      hasExcessPayment && type === 'advance'
    //        ? +r.received_amount - calculatedAdvanceAmount
    //        : +r.received_amount,
    //  }));

    //  let remainingPaidAmount = total_paid_amount;

    // const sortedReceivables = [...receivables].sort(
    //   (a, b) => Number(a.receivable_amount ?? 0) - Number(b.receivable_amount ?? 0)
    // );
    let remainingPaidAmount = total_paid_amount;

    const sortedReceivables = [...receivables].sort(
      (a, b) => Number(a.receivable_amount ?? 0) - Number(b.receivable_amount ?? 0)
    );
const saleUpdate = sortedReceivables.map((r) => {
  const receivable = Number(r.receivable_amount ?? 0);
  const paymentAmount = Number(r.paymentAmount ?? 0);
  let receivedAmount = 0;

  // if (total_paid_amount >= totalDue) {

  //   receivedAmount = paymentAmount;
  // } else if (remainingPaidAmount > 0) {
  //   if (remainingPaidAmount >= paymentAmount) {
  //     receivedAmount = paymentAmount;
  //     remainingPaidAmount -= paymentAmount;
  //   } else {
  //     receivedAmount = remainingPaidAmount;
  //     remainingPaidAmount = 0;
  //   }
  // }

  if(total_paid_amount <= paymentAmount){
    receivedAmount = paymentAmount
  }
  else{
    if(remainingPaidAmount > 0 && remainingPaidAmount >= paymentAmount){
      receivedAmount = paymentAmount
      remainingPaidAmount -=  paymentAmount
    }
    else{
      receivedAmount = remainingPaidAmount
      remainingPaidAmount = 0
    }
  }

  return {
    ...r,
    received_amount: receivedAmount,
    sales_payment: [{
      ...r.sales_payment[0],
      due: r.receivable_amount,
      payment_amount: receivedAmount
    }]
  };
});

    const data = {
      saleUpdate,
      updateCreditNote: {
        manualNoteSchemes : this.state.manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger : this.state.manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        customer_id: this.state.getCustomer.customer_id,
        customer_ledger_id: this.state.getCustomer.ledger_id,
        company_name : this.state.getCustomer.company_name || `${this.state.getCustomer.first_name} ${this.state.getCustomer.last_name}`
      },
      userConfig: { user_id: context.commoncookie, location_id: context.headerLocationId },
      receiptDataEntry: {
        sale_id: receivables[0].sale_id,
        customer_id: this.state.getCustomer.customer_id,
         payment_amount:
    this.state.Tdata?.length > 0
      ? hasExcessPayment && type === 'advance'
        ? +this.state.Tdata.reduce((sum, item) => sum + item.payment_amount, 0) - calculatedAdvanceAmount
        : +this.state.Tdata.reduce((sum, item) => sum + item.payment_amount, 0)
      : saleUpdate.reduce((sum, item) => sum + (item.received_amount || 0), 0),
      receiptDate: receiptDate
      },
      location_id: context.headerLocationId,
      specialNumber: receivables.map((d)=> d.sale_id).join(','),
      note: 'Sales Payment',
        referenceNumber: this.addAdvanceAmount.current
        ? updatedTdata
          .filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i)
          .map((i) => ({
            ...i,
            change: [],
            cash_adjustment: 0,
            due: +i?.due,
            payment_amount: +i?.payment_amount,
          }))
        : updatedTdata
          .filter((i) => 'paymentLedgerId' in i && 'ledger_id' in i)
          .map((i) => ({ ...i, due: +i?.due, payment_amount: +i?.payment_amount })),
      voucherTypeId: 1,
      addAdvanceAmount : this.addAdvanceAmount.current ? {...this.addAdvanceAmount.current, location_id: context.headerLocationId} : null,
      advanceAmount: calculatedAdvanceAmount > 0 ? calculatedAdvanceAmount : 0,
    };
    // const accountTransaction = [];
    // receivables.map(sD => {
    //   const { received_amount, sales_payment } = sD
    //   this.props.chartOfAccounts.forEach((d) => {
    //     const { id, creditSign, debitSign } = d;
    //     const dd = { accountId: id, description: "salesPayment Entry" };
    //     if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //       let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

    //       dd.amount = debitSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     }else if(sales_payment.filter(f => f.ledger_id === id).length){
    //       let Recevable = sales_payment.filter(f =>  f.ledger_id === id)?.[0] || {}
    //       dd.amount = creditSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     }
    //   });
    // })
    // data.accountTransaction = accountTransaction;
    const initialdata = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
    };
    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    };
    this.setReceData(receivables);
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      
        this.props.receiptEntry(
          data,
          () => {},
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (response, resdata) => {
            // const cookies = new Cookies();
            // let emp_id = cookies.get('login')?.employee_id || '';
            if (response === 200) {
              this.setState({disableSubmit: false})
              this.setpaymentOpen(false);
              this.setTdata([]);
              // this.notifyFunction(resdata.data);
              this.addAdvanceAmount.current = null
              // this.props.listAllFilterSalesAction(
              //   initialdata,
              //   context.commoncookie,
              //   context.headerLocationId,
              //   context.setModalTypeHandler,
              //   context.setLoaderStatusHandler,
              // );
              this.props.listSalesPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              );
              //this.ledgerApipayment(data.saleUpdate)
              this.setSelectionModel([]);
            }
          },
        ),
      )
      
    // );
  //  this.setSelectionModel([]);
    // this.setState({paymentOpen: false, Tdata: []})
  };

   notifyFunction = (resData) => {
    // const cookies = new Cookies();
    const storage = getsessionStorage()
    let emp_id = storage?.employee_id || '';
    
     this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {

        if (!roleType.includes(role_name)) {
          let notify_type = notificationType('sales payment');
          let notify_content = content?.filter(
            (m) => m.notification_type === notify_type,
          );
          let paymentData =
          resData.data.find((m) => m.sale_id === this.state.recData[0].sale_id) || {};

          if (notify_content.length && paymentData.length) {
            let paymentRefid = paymentData.customer_id || '';
            let customerName = paymentData.companyName || '';
            let amount_value = paymentData.received_amount || '';
            let locationName = paymentData.location_name || '';
            let content_body = `${customerName} \n ₹${amount_value} \n${locationName} \n${paymentRefid}`;
            sendNtfy(token, notify_content[0]?.title, content_body);
           this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
          }
        }
      })
  }
   ledgerApipayment = (salesData) => {
    const  context = this.context 
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id: context.headerLocationId,
      specialNumber: '324',
      note: 'POS',
      referenceNumber:  salesData[0]?.sales_payment,
      voucherTypeId: 1,
    };
    const accountTransaction = [];
    salesData.map(sD => {
      const { received_amount, sales_payment } = sD
      this.props.chartOfAccounts.forEach((d) => {
        const { id, creditSign, debitSign } = d;
        const dd = { accountId: id, description: "salesPayment Entry" };
        if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
          let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

          dd.amount = debitSign * Recevable?.payment_amount || 0
          accountTransaction.push(dd);
        }else if(sales_payment.filter(f => f.ledger_id === id).length){
          let Recevable = sales_payment.filter(f =>  f.ledger_id === id)?.[0] || {}
          dd.amount = creditSign * Recevable?.payment_amount || 0
          accountTransaction.push(dd);
        }
      });
    })
    data.accountTransaction = accountTransaction;
    this.props.createTransactionAction(data, true, context.setLoaderStatusHandler)
  };

  // paymentValidate = () => {
  //   const context = this.context;
 
  //   const received_amount =
  //     this.state.Tdata.reduce(function (acc, obj) {
  //       return acc + +obj.payment_amount;
  //     }, 0) + this.state.received_amount;
  //   const data = {
  //     received_amount,
  //     sales_payment: this.state.Tdata,
  //     userConfig: {
  //       user_id: context.commoncookie,
  //       location_id: context.headerLocationId,
  //     },
  //   };

  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.receiptEntry(
  //       data,
  //       () => {},
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //       (response) => {
  //         const cookies = new Cookies();
  //         let emp_id = cookies.get('login')?.employee_id || '';
  //         if (response === 200) {
  //           this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
  //             if (!roleType.includes(role_name)) {
  //               let notify_type = notificationType('sales payment');
  //               let notify_content = content?.filter(
  //                 (m) => m.notification_type === notify_type,
  //               );
  //               if (notify_content.length) {
  //                 const salesData = {...this.state.sales_data} || '';
  //                 let customerName = salesData.custData.company_name || '';
  //                 let amount_value = salesData.total || '';
  //                 let locationName =
  //                   this.props.stocklocation.find(
  //                     (m) => m.location_id === salesData.location_id,
  //                   ) || {};
  //                 let content_body = `${customerName} \n${amount_value} \n${locationName.location_name}`;
  //                 sendNtfy(token, notify_content[0]?.title, content_body);
  //                 this.props.CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"})
  //               }
  //             }
  //           });
  //         }
  //       },
  //     )
	//   );
  //  // this.setState({paymentOpen: false, Tdata: []});
  // };

  // pendingPayment = (data) => {
  //   const {
  //     customer_id,
  //     sales_items: old_sales,
  //     received_amount,
  //     sale_id,
  //   } = data;
  //   const getCustomer = this.props.customer.filter(
  //     (d) => customer_id === d.customer_id,
  //   )[0];
  //   const sales_items = old_sales.map((d) => {
  //     const taxes =
  //       this.props.product.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
  //       [];
  //     d.taxes = taxes;
  //     return d;
  //   });
  //   this.setState({
  //     sales_items,
  //     getCustomer,
  //     paymentOpen: true,
  //     received_amount: +received_amount,
  //     sale_id,
  //   });
  // };

  // setTdata = (data) => {
  //   this.setState({Tdata: data});
  // };

  saleStatusUpdateOnTable = (value) => {
    let getOption = this.props.Sale_Status.filter((f) => f.status_id === value);
    return getOption.length > 0 ? getOption[0].status : value;
  };
  setSelectionModel = (data) => {
    this.setState({selectionModel: data});
  };

  rowPopupClose = () => {
    const context = this.context;
     const {payment_status} =
    this.state.filtedValue;
    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_status : payment_status?.payment_status || null, 
      payment_type: '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.to === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    };
      const paginationData1 = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sub_company_id : this.state.subcompanyId
    };

apiCalls(
  context.setModalTypeHandler,
  context.setLoaderStatusHandler,
  this.state.pageType === '/sales/salesOrders' ?
    (this.props.listSaleOrderPaginateAction(
      paginationData1,
      context.commoncookie,
      context.headerLocationId,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    )) : this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
      this.props.listSalesPaginateAction(
        paginationData,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    ),
  location.state?.triggeredByTransaction && location.state.rowData && this.props.listSalesDataAction(
    paginationData,
    context.commoncookie,
    context.headerLocationId,
    context.setModalTypeHandler,
    context.setLoaderStatusHandler,
  ),
);
// }
    this.setState({rowPopup: {open: false, rowIndex: ''}});
  };

  // creditSequenceUpdate = () => {
  //   const {sequence_id, current_seq} = this.props.credit_debit_seq;
  //   this.props.creditDebitNoteSeqUpdate('credit', {current_seq,sequence_id});
  // };
  // allFunctionsReturn = () => {
  //   this.ledgerReturnApi();
  //   this.creditSequenceUpdate();
  //   this.cnhandleOpen();
  // };

  setFilter = (data) => this.setState({filter: data});

  handleFilter = (data) => this.setState({filterOpen: data});

  brandSearch = (event, key) => {
    let values = event ? event[key] : false;
    // setCategory('')
    // setSearch('')
    this.setState({[key]: event ? event[key] : ''});
    if (values) {
      const result = this.props.sales_filter_all_data.filter((data) => {
        return data.sales_items.some((t) => t[key]?.includes(values));
      });
      this.setState({filterData: result});
    } else {
      this.setState({filterData: this.props.sales_filter_all_data});
    }
  };

  handleChange = async (data) => {
     if (data.target.name === 'dateRange') {
    this.setState({
      from: data.target.value,
      to: data.target.value1,
      dateRange: data.target.value2,
    });
  }
  else if(data.target.name === 'subcompanyId'){
    this.setState({subcompanyId: data.target.value.sub_company_id})
  }
    else{
      var date_val = data.target.value._d;
      await this.setState({[data.target.name]: date_val});
    }
    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          this.setState({errormsg: {from: '', to: ''}}); // balancesheet_data: filterData ,
        } else {
          this.setState({
            errormsg: {
              ...this.state.errormsg,
              [data.target.name]: 'Invalid Date 1',
            },
          });
        }
      } else {
        this.setState({
          errormsg: {
            ...this.state.errormsg,
            [data.target.name]: 'Invalid Date 2',
          },
        });
      }
    } else {
      this.setState({
        errormsg: {
          ...this.state.errormsg,
          [data.target.name]: 'Invalid Date 3',
        },
      });
    }
  };

  commonFilterMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else {
      return array;
    }
  };

  clearButton = () => {
    // var date = new Date();
    // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let firstDay = null;
    let lastDay = null;
    const context = this.context;

    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : 'All'
    };

    
    const paginationData1 = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString : this.state.searchVal,
      sub_company_id : 'All'
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,


       this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              paginationData1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) :  this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) :(
              this.props.listSalesPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ))
    this.setState({
      from: firstDay,
      to: lastDay,
      dateRange : null,
      status : null,
      payment_status : null,
      filtedValue: {
        brand: '',
        category: '',
        location_id: 'null',
        payment_type: '',
        max_price: '',
        min_price: '',
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
    this.setState({ filterOpen: false, subcompanyId: 'All' });
  };

  exportValue =()=>{
    let context = this.context
    const {brand, category, location_id, payment_type, max_price, min_price, status,payment_status} =
    this.state.filtedValue;
  const data = {
    from:
      this.state.from === null
        ? null
        : moment(this.state.from, 'year', 'month', 'day').format(
            'yyyy-MM-DD',
          ),
    to:
      this.state.to === null
        ? null
        : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    brand: this.commonFilterMapping(brand, 'brand'),
    status: status?.status || '',
    payment_status: payment_status?.payment_status || '',
    category: this.commonFilterMapping(category, 'category'),
    user_id: context.commoncookie,
    location_id: this.commonFilterMapping(location_id, 'location_id'),
    payment_type:
      payment_type === ''
        ? payment_type
        : payment_type.map((p) => `${p.payment_type} (INR)`),
    pageCount: 0,
    max_price: this.commonFilterMapping(max_price, 'max_price'),
    min_price: this.commonFilterMapping(min_price, 'min_price'),
    sale_status: this.state.selectedSaleStatus,
    numPerPage: this.state.pageSize,
    searchString : this.state.searchVal,
    sub_company_id : this.state.subcompanyId
  }
  return data;
  }

   exportValueSaleOrder =()=>{
    let context = this.context
    const {brand, category, location_id, payment_type, max_price, min_price} =
    this.state.filtedValue;
  const data = {
    from:
      this.state.from === null
        ? null
        : moment(this.state.from, 'year', 'month', 'day').format(
            'yyyy-MM-DD',
          ),
    to:
      this.state.to === null
        ? null
        : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    brand: this.commonFilterMapping(brand, 'brand'),
    category: this.commonFilterMapping(category, 'category'),
    user_id: context.commoncookie,
    location_id: this.commonFilterMapping(location_id, 'location_id'),
    pageCount: 0,
    max_price: this.commonFilterMapping(max_price, 'max_price'),
    min_price: this.commonFilterMapping(min_price, 'min_price'),
    sub_company_id : this.state.subcompanyId
  }
  return data;
  }

  ApplyButton = async (formValue) => {
    await this.setState({filtedValue: formValue,searchVal : ''});
    const context = this.context;
    const {brand, category, location_id, payment_type, max_price, min_price,status,payment_status} =
      this.state.filtedValue;
    const data = {
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.to === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      status : status?.status || '',
      payment_status : payment_status?.payment_status || '',
      user_id: context.commoncookie,
      location_id: this.commonFilterMapping(location_id, 'location_id'),
      payment_type:
        payment_type === ''
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      max_price: this.commonFilterMapping(max_price, 'max_price'),
      min_price: this.commonFilterMapping(min_price, 'min_price'),
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    };

    const data1 = {
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.to === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      user_id: context.commoncookie,
      location_id: this.commonFilterMapping(location_id, 'location_id'),

      pageCount: 0,
      max_price: this.commonFilterMapping(max_price, 'max_price'),
      min_price: this.commonFilterMapping(min_price, 'min_price'),
      numPerPage:  this.state.pageSize,
      searchString : this.state.searchVal,
      sub_company_id : this.state.subcompanyId
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listAllFilterSalesAction(
      //   data,
      //   context.commoncookie,
      //   context.headerLocationId,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              data1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              // {pageCount: 0, numPerPage:  pageSize},
            )) :  this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                data1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                data,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              )
            ),
    );

    this.setState({filterOpen: false});
  };

  handleSmsMailConfiguration = async () => {
    const context = this.context;
    const roleIdData = this.props.createUser.filter(f => f.employee_id === context.commoncookie)
    if(roleIdData.length > 0){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdMailConfigurationAction('Sale Order', roleIdData[0]?.role_id),
        this.props.getByIdSmsConfigurationAction('Sale Order', roleIdData[0]?.role_id)
      );
    }
  }

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, pageCount: 0});

    if(val.length >= 3 || val.length === 0){
      this.state.pageType === '/sales/salesOrders'  ?  this.props.set_searchSaleOrderAction({data:[], numRows:0}) : this.state.pageType === '/sales/deliveryChallan'  ? this.props.set_searchDcAction({data:[], numRows:0})  :  this.props.set_searchSalesAction({data:[], numRows:0})
    }
    const body = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : val,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    }
      const body1 = {
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      sub_company_id : this.state.subcompanyId
    }

     this.state.pageType === '/sales/salesOrders'  ?  
      this.props.get_searchSaleOrderAction(
        body1,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
     :  this.state.pageType === '/sales/deliveryChallan'  ?  this.props.get_searchDcAction(
        body1,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )  : 
      this.debouncedListSalesPaginateAction(body, context);
  };


  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
     this.state.pageType === '/sales/salesOrders'  ?  this.props.set_searchSaleOrderAction({data:[], numRows:0}) : this.state.pageType === '/sales/deliveryChallan'  ? this.props.set_searchDcAction({data:[], numRows:0})  :  this.props.set_searchSalesAction({data:[], numRows:0})

    const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : '',
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    };

      const paginationData1 = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : '',
      sub_company_id : this.state.subcompanyId
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
        this.state.pageType === '/sales/salesOrders' ?
            (this.props.listSaleOrderPaginateAction(
              paginationData1,
              context.commoncookie,
              context.headerLocationId,
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
            )) :  this.state.pageType === '/sales/deliveryChallan' ?
              this.props.listDCPaginateAction(
                paginationData1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                // {pageCount: 0, numPerPage:  pageSize},
              ) : (
              this.props.listSalesPaginateAction(
                paginationData,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
              )
            ),
    );
  };

  cancelInvoiceUpdate=()=>{
    const context = this.context;
    const paginationData1 = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.pageSize,
      searchString : '',
      sub_company_id : this.state.subcompanyId
    };
          this.props.listDCPaginateAction(
                paginationData1,
                context.commoncookie,
                context.headerLocationId,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
              )
            }

  getSalesDataById = async (data) =>{

    const { data: customer } = await this.customFetch(
      API_URLS.ALL_CUSTOMERS,
      'GET',
      {}
    );

    // console.log("3333")
    const { sale_id, receiving_id, customer_id, supplier_id } = data
    if (sale_id !== null && typeof sale_id !== 'undefined' && customer_id !== null) {
      let getData = (await this.props.sales?.length) && this.props.sales?.find(f => f.sale_id === sale_id)
      let custData = (await customer?.length) && customer?.find(f => f.customer_id === customer_id)
      if (Object.keys(getData)?.length && Object.keys(custData)?.length) {

        const salesItems = getData.sales_items.map((s, i) => {
          const taxes = this.props.productByType.find((f) => f.item_id === s.item_id);
          return { ...s, quantity: s.return_quantity, taxes: taxes.taxes }
        })
        this.setState({
          cnPopupData: {
            invoice: data.sequence_number,
            custData: custData,
            custType: 'CUSTOMER',
            soDate: getData.so_date,
            sales_items: salesItems.filter(f => f.return_quantity && f.return_quantity > 0),
            customer_id: getData.customer_id,
            sale_id: getData.sale_id,
            note: data.description,
            sales_payments: getData.sales_payments || [],
            invoice_date: data.created_at,
            total: data.amount,
            custLedgerId: custData.ledger_id,
            Dopen: true,
          }
        })
      }
    } else if (receiving_id !== null && typeof receiving_id !== 'undefined' && supplier_id !== null) {
      let getData = await this.props.purchases.find(f => f.receiving_id === receiving_id)
      let custData = (await customer?.length) && customer.find(f => f.supplier_id === supplier_id)
      if (Object.keys(getData).length && Object.keys(custData).length) {

        const salesItems = getData.receivings_items.map((s, i) => {
          const taxes = this.props.productByType.find((f) => f.item_id === s.item_id);
          return { ...s, quantity: s.return_quantity, taxes: taxes.taxes }
        })
        this.setState({
          cnPopupData: {
            invoice: data.sequence_number,
            custData: custData,
            custType: 'VENDOR',
            soDate: getData.invoice_date,
            sales_items: salesItems.filter(f => f.return_quantity && f.return_quantity > 0),
            customer_id: getData.supplier_id,
            sale_id: getData.receiving_id,
            note: data.description,
            sales_payments: [],
            invoice_date: data.created_at,
            total: data.amount,
            custLedgerId: custData.ledger_id,
            Dopen: true,
          }
        })
      }
    }
    }

  handle_newSalesAfterCreating_Data = (data) => {
    const { sale_status, location_id, comment, reference } = data;
    this.setState({
      newSalesAfterCreating_Data: {
        sale_status,
        location_id,
        comment,
        reference
    }})
  }

  handleCustomerDetail = (rowData)=>{
    this.setState({
      setData : rowData,
      onrowclick :true
    });
  }

  rowPopupClose1 = ()=>{
    this.setState({
      onrowclick :false
    })
  }

// pathname = this.props.location;

//     hasAddRight = () => {
//     const { user_rights } = this.props;
//     const companyType = JSON.parse(sessionStorage.getItem('company_type'));

//     let rightKey = '';

//     if (this.pathname.includes('/sales/salesOrders')) {
//       rightKey = 'SOAdd';
//     } else if (this.pathname.includes('/sales/invoices')) {
//       rightKey = 'InvoiceAdd';
//     }

//     if (companyType === 3) {
//       return getRoleAuthorization(user_rights, rightKey);
//     }

//     return false;
//   };

  

  render() {

    const selectedRole = this.storage.role_name
    const salesOrderCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__sales_orders', 'can_create')
    const salesOrderEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__sales_orders', 'can_edit')
    const salesOrderExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__sales_orders', 'can_export')

    const invoiceCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__invoices', 'can_create')
    const invoiceExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__invoices', 'can_export')

    const dcCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__delivery_challans', 'can_create')
    const dcExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__delivery_challans', 'can_export')

    const receiptCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__receipts', 'can_create')

    const createBtn = this.state.pageType === '/sales/salesOrders' ? salesOrderCreate : this.state.pageType === '/sales/invoices' ? invoiceCreate : this.state.pageType === '/sales/deliveryChallan' ? dcCreate : true
    const editBtn = this.state.pageType === '/sales/salesOrders' ? salesOrderEdit : true
    const exportBtn = this.state.pageType === '/sales/salesOrders' ? salesOrderExport : this.state.pageType === '/sales/invoices' ? invoiceExport : this.state.pageType === '/sales/deliveryChallan' ? dcExport : (this.props.reportExport ?? true);

     const context = this.context;
     const paginationData = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.to === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:   this.props.paginationCount,
      searchString : this.state.searchVal,
      sale_status: this.state.selectedSaleStatus,
      sub_company_id : this.state.subcompanyId
    };

      const paginationDataSaleOrder = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:   this.state.searchVal.length > 0 ? this.props.searchSaleOrderCount  : this.props.saleOrderByPaginationCount ,
      searchString : this.state.searchVal,
      sub_company_id : this.state.subcompanyId
    };

     const paginationDatDc = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      max_price: '',
      min_price: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: 0, 
      numPerPage:  this.state.searchVal.length > 0 ? this.props.searchDcCount : this.props.dcByPaginationCount ,
      searchString : this.state.searchVal,
    };

    const getExportAction = () => {
      if (this.state.pageType === '/sales/salesOrders') {
        return {
          action: this.props.listSaleOrderPaginateAction,
          payload: paginationDataSaleOrder
        };
      } else if (this.state.pageType === '/sales/deliveryChallan') {

  const context = this.context;
  const payload = {
    ...this.exportValueSaleOrder(),
    pageCount: this.state.page,
    type: 'export',
    numPerPage: this.state.pageSize,
    searchString: this.state.searchVal,
  };

  // return the Promise so caller can handle it
        return this.customFetch(
          API_URLS.DELIVERY_CHALLAN_PAGINATION(context.commoncookie, context.headerLocationId),
          'POST',
          payload
        ).then(records => {
    // flatten and return!
    return records.data.data.flatMap(dc =>
      dc.sales_items.map(item => ({
        ...dc,
        sales_items: item.actual_quantity > 0 ? 1 : 0,
        lot_number: item.lot_number,
        name: item.name,
        dc_time: dc.dc_date,
      }))
    );
  })
  .catch(err => {
    console.error('Error fetching delivery challan:', err);
    return []; // fallback empty array
  });


      } else {
        return {
          action: this.props.listSalesPaginateAction,
          payload: paginationData
        };
      }
    };

    const formatExportData = (data, pageType) => {
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }
      // console.log("pageType",data)
      if (pageType === '/sales/invoices') {
        return data.map(m => ({
          ...m,
          sales_items: m.sales_items?.reduce((sum, item) => sum + (item.actual_quantity || 0), 0) || 0,
          invoice_date:moment(m.invoice_date).format('DD/MM/YYYY')
        }));
      }
      // if (pageType === '/sales/deliveryChallan') {
      //   return data.map(m => ({
      //     ...m,
      //     sales_items: m.sales_items?.reduce((sum, item) => sum + (item.actual_quantity || 0), 0) || 0,
      //     dc_time: m.dc_date,
      //   }));
      
     if (pageType === '/sales/deliveryChallan') {
  const context = this.context;
  const payload = {
    ...this.exportValueSaleOrder(),
    pageCount: this.state.page,
    type: 'export',
    numPerPage: this.state.pageSize,
    searchString: this.state.searchVal,
  };

  // return the Promise so caller can handle it
   return this.customFetch(
          API_URLS.DELIVERY_CHALLAN_PAGINATION(context.commoncookie, context.headerLocationId),
          'POST',
          payload
        )
  .then(records => {
    // flatten and return!
    return records.data.data.flatMap(dc =>
      dc.sales_items.map(item => ({
        ...dc,
        sales_items: item.actual_quantity > 0 ? 1 : 0,
        lot_number: item.lot_number,
        name: item.name,
        dc_time: dc.dc_date,
      }))
    );
  })
  .catch(err => {
    console.error('Error fetching delivery challan:', err);
    return []; // fallback empty array
  });
}


      if (pageType === '/sales/salesOrders') {
        return data.map(m => {
          let displayText = m.sale_status_name;

          const creditReturn = m?.creditReturn || 0;
          const converted = m?.updated_status === 15;
          const statusName = m?.sale_status_name;
          const approvalStatus = m?.status;

          if (converted) {
            displayText = 'Invoiced';
          } else if (creditReturn > 0) {
            displayText = statusName;
          } else if (statusName === 'Send SO') {
            displayText =
              approvalStatus === 'Waiting Approval' ? 'Waiting Approval'
                : approvalStatus === 'Approved' ? 'Approved'
                  : approvalStatus === 'Rejected' ? 'Rejected'
                    : 'SO Created';
          } else if (statusName === 'Direct Challan') {
            displayText = 'Delivery Challan';
          } else {
            displayText = statusName;
          }

          return {
            ...m,
            sales_items: m.sales_items?.reduce((sum, item) => sum + (item.actual_quantity || 0), 0) || 0,
            sale_status: displayText
          };
        });
      }
      return [];
    };

    const getExportFileName = (pageType) => {
      switch (pageType) {
        case '/sales/salesOrders':
          return 'SaleOrders';
        case '/sales/deliveryChallan':
          return 'DeliveryChallan';
        case '/sales/invoices':
          return 'SalesInvoices';
        default:
          return 'ExportData';
      }
    };

    


    const { pathname } = this.props.location;
    const {popupData, cnPopupData, newSalesAfterCreating_Data} = this.state;

    const customerIndex = this.props.customerAsCompany.findIndex(c => c.customer_id === this.state.setData.customer_id);

    let openData = {
      rowIndex: customerIndex,
      sales_customer_id: this.state.setData.customer_id,
      routeFrom: "SALES",
      salesOrder: "salesOrder",
      mail_configuration: this.props.mail_configuration,
      setOnbackClick: false,
      backToSales: this.rowPopupClose1,
    };

    let storage = getsessionStorage()
    const { user_rights } = this.props;
    let AddRights = true;
    let EditRights = true;
    let DeleteRights = true;

    if (storage?.company_type === 3) {
      if (pathname.includes('/sales/salesOrders')) {
        AddRights = getRoleAuthorization(user_rights, 'SOAdd');
        EditRights = getRoleAuthorization(user_rights, 'SOEdit');
      } else if (pathname.includes('/sales/deliveryChallan')) {
        AddRights = getRoleAuthorization(user_rights, 'DCAdd');
        EditRights = getRoleAuthorization(user_rights, 'DCEdit');
      } else if (pathname.includes('/sales/invoices')) {
        AddRights = getRoleAuthorization(user_rights, 'InvoiceAdd');
        EditRights = getRoleAuthorization(user_rights, 'InvoiceEdit');
      }
    }
    return (
      <div>
        <Helmet>
               <meta charSet="utf-8" />
               <title> {titleURL} |  {pathname === "/sales/invoices" ? "Invoices" : pathname === "/sales/deliveryChallan" ?  'Delivery Challan' : "Sales Orders" }  </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            setModalStatusHandler,
            setModalTypeHandler,
            setcreatNewDataHandler,
            setEditProductDataHandler,
            setEditCustomerHandler,
            modalStatus,
            creatNewData,
            drawerOpen,
            selectData,
            setselectData,
            commoncookie,
            headerLocationId,
            setLoaderStatusHandler
          }) => (
            <div
            
            style={{
              overflow: 'hidden',
             height: '100vh',
             width: "100%", 
             
            }}
            > 
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              ></AlertDialog>
              {/* <Snackbar open={this.state.dialog.dialog_open} autoHideDuration={3000} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}

          {   //ERP Design Module
                   // type === 3 ? '':
                     this.state.onrowclick === true ? (
                      //  <App
                      //    // statementOfAccount={Get_customer_statement}
                      //    rowIndex={this.state.setData.customer_id}
                      //    handleEdit={false}
                      //    backToSales={this.rowPopupClose1}
                      //    handleDelete={false}
                      //    type={'customer'}
                      //    mail_configuration={this.props.mail_configuration}
                      //    customertype = {1}
                      //    setEditfind={false}
                      //    setOnbackClick={false}
                      //    employeeSetState={false}
                      //    salesOrder = {'salesOrder'}
                      //    sale_status = {this.state.sale_status}
                      //    transactionRowData={this.state.transactionRowData}
                      //  />
                      // <ContactPage
                      // rowIndex={customerIndex}
                      // sales_customer_id = {this.state.setData.customer_id}
                      // routeFrom = {"SALES"}
                      // salesOrder = {'salesOrder'}
                      // mail_configuration={this.props.mail_configuration}
                      // setOnbackClick={false}
                      // backToSales={this.rowPopupClose1}
                      // />
                      (OpenCustomerLandingPage(openData))
                     )
                   
                     :

                     <>
       
              <InvoiceDialog
                appConfigData={this.state.appConfigData}
                createMail={this.invoiceDialogSendMail}
                custType={'CUSTOMER'}
                custData={popupData.custData}
                invoice={popupData.invoice}
                soDate={popupData.soDate}
                shipTo={popupData.shipping_details}
                shipping_details={popupData.shipping_details}
                soNumber={popupData.so_number}
                sales_items={popupData.sales_items || []}
                open={popupData.Dopen}
                handleClose={() =>this.handleClose()}
                posSale={true}
                note={popupData.note}
                mail_configuration={this.props.mail_configuration}
                sms_configuration={this.props.sms_configuration}
                handle_newCreate = {(bool) => this.setState({isNewSales : bool, status: 'create', edit_id_data: []})}
                handleNewopen={this.handleNewopensales}
                handle_Einvoice ={popupData.E_invoice}
                termsAndConditionsList={popupData.termsAndConditions}
                tcs ={popupData?.tcs}
                tds ={popupData?.tds}
                tcspercent ={popupData?.tcspercent}
                tdspercent ={popupData?.tdspercent}
                sale_status = {this.state.selectedSaleStatus}
                isRoundedOffNegative={popupData?.isRoundedOffNegative || 0}
                rounded_off={popupData?.rounded_off || 0}
                dc_number = {popupData?.dc_number}
                popupData = {popupData}
                cancelStatus = {this.state.cancelStatus}
              />

              <CnDialog
                appConfigData={this.state.appConfigData}
                createMail={this.cninvoiceDialogSendMail}
                custType={'CUSTOMER'}
                custData={cnPopupData.custData}
                invoice={cnPopupData.invoice}
                soDate={cnPopupData.soDate}
                sales_items={cnPopupData.sales_items}
                open={cnPopupData.Dopen}
                handleClose={() =>
                  this.setState({
                    cnPopupData: {...cnPopupData, Dopen: false},
                    open: false,
                  })
                }
                note={cnPopupData.note}
              />
              {this.state.salesReturnOpen && (
                <SalesReturn
                  handleClose={(response) => {
                    // Close SalesReturn form and restore invoice landing page
                    const restoredPopup = this.state.savedRowPopup || { open: false, rowIndex: '' };
                    this.setState({
                      salesReturnOpen: false,
                      salesReturnPreload: null,
                      rowPopup: restoredPopup,
                    });

                    // If response exists (successful return), open CN PDF.
                    // Success toast is fired by CreateAlert inside SalesReturn.
                    if (response) {
                      const creditNoteId = response?.manualCredit?.creditnoteid;
                      const returnId = response?.createreturn?.insertId;
                      if (creditNoteId) {
                        this.props.ManualSalesPurchase(
                          { id: returnId, type: 'C', mn_id: creditNoteId },
                          (pdfData) => {
                            if (pdfData) {
                              this.props.setInvoiceTempAction(pdfData);
                              this.setState({ cnPdfOpen: true });
                            }
                          }
                        );
                      }
                    }
                  }}
                  cnInvoiceFunction={() => {
                    this.setState({ salesReturnOpen: false, salesReturnPreload: null });
                    this.cancelInvoiceUpdate();
                  }}
                  preloadData={this.state.salesReturnPreload}
                />
              )}

              {/* CN PDF popup after sales return - shown on top of invoice landing page */}
              <ReceiptTempDialog
                open={this.state.cnPdfOpen || false}
                handleClose={() => {
                  this.setState({ cnPdfOpen: false });
                  this.cancelInvoiceUpdate();
                }}
              />
              {this.state.open === false && this.state.rowPopup.open === false && !this.state.salesReturnOpen && (
                <MaterialTable
                  style={{height: 'calc(100vh - 80px)'}}
                  totalCount={this.state.searchVal.length > 0 ? (this.state.pageType === '/sales/salesOrders' ? this.props.searchSaleOrderCount : this.state.pageType === '/sales/deliveryChallan' ? this.props.searchDcCount :  this.props.paginationCount) : this.state.pageType === '/sales/salesOrders' ?  this.props.saleOrderByPaginationCount : this.state.pageType === '/sales/deliveryChallan' ? this.props.dcByPaginationCount :  this.props.paginationCount}
                        actions={[
                          ...((pathname === '/sales/salesOrders' && editBtn) ? [
                            (rowData) => {
                              const isDisabled = (() => {
                                if (rowData?.convertedInvoiceOrderId){
                                  return true;
                                }
                                else if (rowData.status === 'Waiting Approval'){
                                  return true;
                                }
                                else if (rowData.status === 'Rejected'){
                                  return true;
                                }
                                else if (rowData.sale_status === 7){
                                  return true;
                                }
                                else if (rowData?.creditReturn > 0){
                                  return true;
                                }
                                else if (rowData?.dc_invoice != null){
                                  return true;
                                }
                                else if (rowData.sale_status === 6){
                                  return rowData.dc_number === null;
                                }
                                else{
                                  return false;
                                }
                              })();
                              return {
                                icon: () => (
                                  <IconButton sx={{ padding: 0 }} disabled={!EditRights || isDisabled}>
                                    <EditIcon />
                                  </IconButton>
                                ),
                                tooltip: 'Edit',
                                position: 'row',
                                hidden: this.props.IconHidden ? true : false,
                                disabled: !EditRights || isDisabled,
                                onClick: (event, rowData) => {
                                  if (EditRights) this.handleSOEdit(rowData.order_id);
                                },
                              };
                              },
                          ] : []),
                           ...((pathname !== '/sales/invoices' && invoiceCreate) ? [
                              (rowData) => {
                                const isDisabled = (() => {
                                  // console.log("rowData", rowData.convertedInvoiceOrderId);
                                  if (rowData?.updated_status === 15){
                                    return true;
                                  }
                                  else if (rowData.status === 'Waiting Approval'){
                                    return true;
                                  }
                                  else if (rowData.status === 'Rejected'){
                                    return true;
                                  }
                                  else if (rowData.sale_status === 7){
                                    return true;
                                  }
                                  else if (rowData?.creditReturn > 0){
                                    return true;
                                  }
                                  else if (rowData?.dc_invoice != null){
                                    return true;
                                  }
                                  else if (rowData.sale_status === 6){
                                    return rowData.dc_number === null;
                                  }
                                  else if (rowData.sale_status === 8) {
                                    if (rowData?.status === 10) return true;
                                    

                                    if (
                                      Array.isArray(rowData.sales_items) &&
                                      rowData.sales_items.length > 0 &&
                                      rowData.sales_items.every(
                                        item => item.return_quantity >= item.actual_quantity
                                      )
                                    ) {
                                      return true;
                                    }

                                    if (
                                      Array.isArray(rowData.sales_items) &&
                                      rowData.sales_items.length > 0 &&
                                      rowData.sales_items.every(
                                        item => item.invoice_quantity >= item.qty
                                      )
                                    ) {
                                      return true;
                                    }
                                  }
                                  else{
                                    return false;
                                  }
                                })();
                              

                                return {
                                  icon: () => (
                                    <IconButton sx={{ padding: 0 }} disabled={isDisabled}>
                                      {
                                       (pathname === '/sales/salesOrders' || pathname === '/sales/deliveryChallan')  ? <DescriptionOutlinedIcon /> : <EditIcon />
                                      }
                                    </IconButton>
                                  ),
                                  tooltip: (pathname === '/sales/salesOrders' || pathname === '/sales/deliveryChallan') ? 'Convert Invoice' : 'edit',
                                  position: 'row',
                                  hidden: this.props.IconHidden ? true : false,
                                  disabled: isDisabled, 
                                  onClick: (event, rowData) => {
                                    // console.log("isDisabled",isDisabled)
                                    if (!isDisabled) {
                                      this.handleEdit(rowData.sale_id ? rowData.sale_id : rowData.dc_id ? rowData.dc_id :rowData.order_id);
                                    }
                                  },
                                };
                              },
                                ] : []),
                          
                              // (rowData) => ({
                          //   icon: () =>
                          //     rowData.invoice_number != null ? (
                          //       <AssignmentTurnedInIcon color='success' />
                          //     ) : (
                          //       <AssignmentLateIcon color='warning' />
                          //     ),
                          //   tooltip: 'Make Payment',
                          //   onClick: (event, rowData) => alert('dispatch'),
                          //   disabled: rowData.sale_status === 6 ? false : true
                          //     // rowData.invoice_number === null ? true : false,
                          // }),

                          // (rowData) => ({

                          //   icon: () =>
                          //     // Math.round(+rowData.paid_amount) === Math.round(+rowData.total) ? (
                          //       <AssignmentTurnedInIcon color= { Math.round(+rowData.paid_amount) === Math.round(+rowData.total)? 'success' : 'warning'} />,
                          //     // ) : (
                          //     //   <AssignmentLateIcon color='warning' />
                          //     // ),
                          //   tooltip: 'Make Payment',
                          //   isFreeAction: true,
                          //   onClick: (event, rowData) => this.pendingPayment(rowData),
                          //  disabled:rowData.sale_status === 7 ? true :
                          //  ( Math.round(+rowData.paid_amount) === Math.round(+rowData.total) || rowData?.creditReturn > 0  || rowData.dc_invoice !==null )? true : false,
                          // }),
             
                          ...((pathname === "/sales/invoices") && receiptCreate
                            ? [(rowData) => ({
                              icon: () => (
                                <CommonToolTip
                                  title={
                                    rowData.payment_status === 17 || rowData.due_amount === 0
                                      ? 'Payment Done'
                                      : rowData.sale_status === 7 || rowData.invoice_number === null
                                        ? ' '
                                        : 'Make payment'
                                  }
                                >
                                  <IconButton sx={{ padding: 0 }}>
                                    <AccountBalanceWalletIcon
                                      sx={{ padding: 0 }}
                                      color={
                                        rowData.payment_status === 17 || rowData.due_amount === 0
                                          ? 'success'
                                          : rowData.sale_status === 7 || rowData.invoice_number === null
                                            ? 'disabled'
                                            : 'warning'
                                      }
                                    />
                                  </IconButton>
                                </CommonToolTip>
                              ),

                              iconProps: {
                                style: {
                                  color:
                                    rowData.sale_status === 7 || rowData.invoice_number === null
                                      ? '#a6ada8'
                                      : Math.round(+rowData.paid_amount) === Math.round(+rowData.total) ||
                                        rowData?.creditReturn > 0 ||
                                        rowData.dc_invoice !== null
                                        ? '#a6ada8'
                                        : '#419c59',
                                },
                              },

                              onClick: (event, rowData) => {
                                if (rowData.sale_status === 7 || rowData.invoice_number === null) {
                                  return null;
                                }

                                const isFullyPaid = rowData.payment_status === 17;
                                const hasDCInvoice = rowData.dc_invoice !== null;
                                const partialReturn = rowData.sale_status_name === 'Return';
                                const isAllReturned = rowData.sales_items.every(
                                  (item) => item.actual_quantity === item.return_quantity
                                );

                                if (!(isFullyPaid || hasDCInvoice)) {
                                  return this.pendingPayment(rowData);
                                }

                                return null;
                              },
                            }

                            )] : []),
                          // (rowData) => ({
                          //   icon: () => (<AssignmentLateIcon color='warning' />),
                          //   tooltip: 'payment',
                          //   position: 'row',
                          //   hidden: this.props.IconHidden ? true : false,
                          //   onClick: (event, rowData) =>
                          //   this.pendingPayment(rowData),
                          //  disabled: rowData.sale_status === 6 ? false : true,
                          // }),
                          // {
                          //   icon: 'delete',
                          //   tooltip: 'Delete',
                          //   hidden: this.props.IconHidden  ? true : false,
                          //   onClick: (event, rowData) => this.handleDelete(rowData.sale_id)
                          // },                      
                              createBtn && {
                            icon: 'add',
                            tooltip: 'add',
                            // hidden: this.props.IconHidden ? true : !AddRights,
                            isFreeAction: true,
                            onClick: (event, rowData) =>
                              this.setState({
                                edit_id_data: [],
                                open: true,
                                status: 'create',
                                returnState: false,
                              }),
                          },
                          {
                            icon: () => (
                              <div style={{ display: 'flex' }}>
                                <FilterSalesOrder
                                  fromTo={true}
                                  catabrand={true}
                                  from={this.state.from}
                                  locat={true}
                                  to={this.state.to}
                                  count={this.state.count}
                                  product={this.props.productByType}
                                  category={this.state.category}
                                  brand={this.state.brand}
                                  list_payment_type={this.props.list_payment_type}
                                  stocklocation={this.props.stocklocation}
                                  filtedValue={this.state.filtedValue}
                                  setFilter={this.setFilter}
                                  brandSearch={this.brandSearch}
                                  handleChange={this.handleChange}
                                  dateRange = {this.state.dateRange}
                                  handleClose={this.handleFilter}
                                  open={this.state.filterOpen}
                                  ApplyButton={this.ApplyButton}
                                  clearButton={this.clearButton}
                                  pageType={this.state.pageType}
                                  setFilterValues={this.setFilterValues}
                                  subcompanyId = {this.state.subcompanyId}
                                />
                              </div>
                            ),
                            tooltip: 'Filter',
                            isFreeAction: true,
                          },
                        ]}

                        components={{
                          ...stickyTableComponents,
                          Toolbar: (props) => (
                            <>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  // padding: '10px 20px',

                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>

                                  <div style={{ flexGrow: 1 }}>
                                    <MTableToolbar {...props} />
                                       {/* {this.hasAddRight() && (
                                      <IconButton onClick={this.handleAddClick}>
                                        <AddIcon />
                                      </IconButton>
                                    )} */}
                                  </div>

                                  {pathname === "/sales/invoices" &&
                                    <Box sx={{ display: 'flex', columnGap: '5px', overflow: 'auto', scrollbarWidth: 'none', marginX: '10px' }}>
                                      {
                                        this.state.allSaleStatus.map((status, index) => (
                                          <Chip
                                            key={index}
                                            label={status === 'Canceled' ? 'Cancelled' : status}
                                            variant={status === this.state.selectedSaleStatus ? 'filled' : 'outlined'}
                                            onClick={() => this.setState({ selectedSaleStatus: status,page : 0 })}
                                            color='primary'
                                          />
                                        ))
                                      }
                                    </Box>
                                  }

                                </div>

                                <div style={{ display: 'flex' }}>

                                  <CommonSearch
                                    searchVal={this.state.searchVal}
                                    cancelSearch={this.cancelSearch}
                                    requestSearch={this.requestSearch}
                                  />
                                </div>
                              </div>

                            </>
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
                                count={
                                  this.state.searchVal?.length > 0
                                    ? (
                                        this.state.pageType === '/sales/salesOrders'
                                          ? (this.props.searchSaleOrderCount ?? 0)
                                          : this.state.pageType === '/sales/deliveryChallan'
                                          ? (this.props.searchDcCount ?? 0)
                                          : (this.props.paginationCount ?? 0)
                                      )
                                    : (
                                        this.state.pageType === '/sales/salesOrders'
                                          ? (this.props.saleOrderByPaginationCount ?? 0)
                                          : this.state.pageType === '/sales/deliveryChallan'
                                          ? (this.props.dcByPaginationCount ?? 0)
                                          : (this.props.paginationCount ?? 0)
                                      )
                                }                                
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
                     bodyOffset: 200,
                     headerStyle: {
                      backgroundColor: '#f5f5f5',
                      color: '#000',
                    },
                    options:{
                      toolbar: true,
                      exportButton: exportBtn ? true : false,
                      filtering: false,
                      search: false,
                      pageSize: this.state.pageSize || 20,
                      // page : this.state.page || 0,
                       tableLayout: "auto",
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.state.searchVal.length > 0 ? 
                    (this.state.pageType === '/sales/salesOrders' ? this.props.searchSaleOrderCount : this.state.pageType === '/sales/deliveryChallan' ? this.props.searchDcCount :  this.props.paginationCount) : this.state.pageType === '/sales/salesOrders' ?  this.props.saleOrderByPaginationCount : this.state.pageType === '/sales/deliveryChallan' ? this.props.dcByPaginationCount :  this.props.paginationCount,
                    actionsColumnIndex: -1,
                      cellStyle: {
                      ...cellStyle,
                      height: 40, 
                      // paddingTop: 2,
                      // paddingBottom: 2,
                    },
                      exportMenu: exportBtn ? [
                      {
                        label: 'Export PDF',
                        exportFunc:async (cols, datas) => {
                          const { action, payload } = getExportAction();
                          
                             if (this.state.pageType === '/sales/deliveryChallan') {
                                  const context = this.context;
                                  const payload = {
                                    ...this.exportValueSaleOrder(),
                                    pageCount: this.state.page,
                                    type: 'export',
                                    numPerPage: this.state.pageSize,
                                    searchString: this.state.searchVal
                                  };

                                    const exportCols = [
                                                        ...cols,
                                                        { title: 'Lot Numbers', field: 'lot_number' },
                                                        { title: 'Model', field: 'name' }
                                                      ];

                               const { data } = await this.customFetch(
                                 API_URLS.DELIVERY_CHALLAN_PAGINATION(context.commoncookie, context.headerLocationId),
                                 'POST',
                                 payload
                               );

                                    const records =   data.data.flatMap(dc =>
                                        dc.sales_items.map(item => ({
                                          ...dc,
                                          sales_items: item.actual_quantity > 0 ? 1 : 0,
                                          lot_number: item.lot_number,
                                          name: item.name,
                                          dc_time: dc.dc_date
                                        }))
                                      )

                                      ExportPdf(exportCols, records,  getExportFileName(this.state.pageType))
                                    
                          }
                          else{
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            action(
                              payload,
                              commoncookie,
                              headerLocationId,
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              (exportData) => {

                                  const exportCols = [
                                    ...cols,
                                  ];

                                ExportPdf(exportCols, formatExportData(exportData,this.state.pageType),  getExportFileName(this.state.pageType));
                              }
                            )
                          );

                          }
                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc:async (cols, datas) => {
                          // const { action, payload } = getExportAction();
                          if (this.state.pageType === '/sales/deliveryChallan') {
                                  const context = this.context;
                                  const payload = {
                                    ...this.exportValueSaleOrder(),
                                    pageCount: this.state.page,
                                    type: 'export',
                                    numPerPage: this.state.pageSize,
                                    searchString: this.state.searchVal
                                  };

                                    const exportCols = [
                                                        ...cols,
                                                        { title: 'Lot Numbers', field: 'lot_number' },
                                                        { title: 'Model', field: 'name' }
                                                      ];

                            const { data } = await this.customFetch(
                              API_URLS.DELIVERY_CHALLAN_PAGINATION(context.commoncookie, context.headerLocationId),
                              'POST',
                              payload
                            );

                                    const records =   data.data.flatMap(dc =>
                                        dc.sales_items.map(item => ({
                                          ...dc,
                                          sales_items: item.actual_quantity > 0 ? 1 : 0,
                                          lot_number: item.lot_number,
                                          name: item.name,
                                          dc_time: dc.dc_date
                                        }))
                                      )

                                      ExportCsv(exportCols, records,  getExportFileName(this.state.pageType))
                                    
                          }
                          else {
                            const { action, payload } = getExportAction();

                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              action(
                                payload,
                                commoncookie,
                                headerLocationId,
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                                (exportData) => {

                                  const exportCols = [
                                    ...cols,
                                  ];

                                  ExportCsv(
                                    exportCols,
                                    formatExportData(exportData, this.state.pageType),
                                    getExportFileName(this.state.pageType)
                                  );
                                }
                              ))

                          }
                        }
                      }
                    ] : [],
                    },
                  })}
                  // columns={
                  //   this.props.customer ? this.props.customer.map((t) =>
                  //     Object.keys(t).map((o) => { return { title: o, field: o }
                  //   }))[0] : []
                  // }
                  // {
                  onRowClick={(evt, rowData) => {
                    this.setState({
                      rowPopup: {
                        open: true,
                        rowIndex: rowData.tableData.id,
                        sales_items: rowData.sales_items,
                      },
                        soToInvoice:rowData.convertedInvoiceOrderId

                    });
                  }}
                
                  columns={[
                    // { title: 'Reference', field: 'reference' },
                    ...((pathname !== "/sales/invoices" && pathname !=='/sales/deliveryChallan') ? [{
                      title: 'SO#', 
                      field: 'so_number',
                      // width : '12%',
                    render: (rowData) => (<>
                     
                      <div
                      
                        style={{
                           textDecoration: 'none',
                            cursor: 'pointer',
                            color: '#03adfc',
                            display: 'inline-block',
                        }}
                        onClick={(event) => {
                          this.invoiceFunction(rowData);
                          this.handleSmsMailConfiguration();
                          setTimeout(() => {
                            this.setState({
                              rowPopup: {...this.state.rowPopup, open: false,sale_status:rowData?.sale_status},
                            });
                          }, 0);
                          event.stopPropagation();
                        
                        }}
                      >{ rowData.so_number }
                        {/* <Typography variant='h5' sx={{fontWeight: 'bold', fontSize: '11px'}}> { rowData.so_number } </Typography> */}
                      </div> 
                      
                      </>
                    ),
                  }] : []),
                    // {title: 'DC Number', field: 'dc_number'},
                    ...(pathname !== "/sales/salesOrders" ? [{
                      title: this.state.selectedSaleStatus === 'Delivery Challan' ? 'DC#' : 'Invoice#',
                      field: this.state.selectedSaleStatus === 'Delivery Challan' ? 'dc_number' : 'invoice_number',
                      // width : '12%',
                      render: (rowData) => (<>
                        {rowData.invoice_number !== null ?
                        <div
                          style={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            color: '#03adfc',
                            display: 'inline-block',
                          }}
                          onClick={(event) => {
                          this.setState({ cancelStatus: rowData.sale_status === 7 });
                            this.invoiceFunction(rowData);
                            this.handleSmsMailConfiguration();
                            setTimeout(() => {
                              this.setState({
                                rowPopup: {...this.state.rowPopup, open: false},
                              });
                            }, 0);
                            event.stopPropagation();
                          
                          }}
                        >  { this.state.selectedSaleStatus === 'Delivery Challan' ? rowData.dc_number : rowData.invoice_number }
                          {/* <Typography variant='h5' sx={{fontWeight: 'bold',fontSize:'11px'}}> { rowData.invoice_number } </Typography> */}
                        </div> : 
                        <div
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                        onClick={(event) => {
                         this.setState({ cancelStatus: rowData.sale_status === 7 });
                          this.invoiceFunction(rowData);
                          this.handleSmsMailConfiguration();
                          setTimeout(() => {
                            this.setState({
                              rowPopup: {...this.state.rowPopup, open: false},
                            });
                          }, 0);
                          event.stopPropagation();
                        
                        }}
                        > 
                          {rowData.dc_number}
                          {/* <Typography variant='h5' sx={{fontWeight: 'bold',fontSize:'11px'}}> {rowData.dc_number} </Typography>  */}
                        </div>
                        }
                        </>
                      ),
                    }] : []),
                    ...((pathname !== "/sales/invoices" && pathname !=='/sales/deliveryChallan') ? [{
                      title: 'Date',
                      field: 'so_date',
                      // width :'10%',
                      render: (r) => (
                        r.so_date?.slice(0,11)
                      )
                    }] : []),
                    ...(pathname !== "/sales/salesOrders" ? [{
                      title: this.state.selectedSaleStatus === 'Delivery Challan' ? 'Date' : 'Date',
                      field: this.state.selectedSaleStatus === 'Delivery Challan' ?  'dc_date'  : 'invoice_date',
                      // width :'10%',
                    render: (r) => {
                      if (
                        (r.invoice_date === null || moment(r.invoice_date, "YYYY-MM-DD").format("DD/MM/YYYY") === "Invalid date") &&
                        (r.dc_date === null || moment(r.dc_date, "DD/MM/YYYY").format("DD/MM/YYYY") === "Invalid date")
                      ) {
                        return '';
                      } else {
                        return this.state.selectedSaleStatus === 'Delivery Challan'
                          ? moment(r.dc_date, "DD/MM/YYYY").format("DD/MM/YYYY")
                          : moment(r.invoice_date, "YYYY-MM-DD").format("DD/MM/YYYY");
                      }
                    }

                    }] : []),
                    {
                      title: 'Customer',
                      field: 'company_name',
                      // width :'15%',
                      render: (rowData) => (<>
                        {
                        // rowData?.creditReturn > 0 ?
                        //   <div
                        //     style={{
                        //       cursor: 'pointer',
                        //       textDecoration: 'underline',
                        //     }}
                        //     onClick={(event) => {
                        //       this.getSalesDataById(rowData);
                        //       event.stopPropagation();
                        //     }}
                        //   >
                        //     <List component='nav' aria-label='main mailbox folders'>
                        //       <ListItem>
                        //         <ListItemIcon>
                        //           {rowData.customer_type === '0' ? (
                        //             <PersonIcon />
                        //           ) : (
                        //             <BusinessIcon />
                        //           )}
                        //         </ListItemIcon>
                        //         <ListItemText primary={<span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }} >{rowData.company_name}</span>} />
                        //       </ListItem>
                        //     </List>
                        //   </div>
                        //   :
                          <div>
                            <List
                              component='nav'
                              aria-label='main mailbox folders'
                              disablePadding
                              sx={{ padding: 0, margin: 0 }}
                            >
                              <ListItem
                                disableGutters
                                sx={{
                                  paddingTop: 0,
                                  paddingBottom: 0,
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                  margin: 0,
                                  alignItems: 'center'
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  {rowData.customer_type === '0' ? (
                                    <PersonIcon />
                                  ) : (
                                    <BusinessIcon />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <span
                                      style={{
                                        fontSize: cellStyle?.fontSize || '14px',
                                        fontWeight: cellStyle?.fontWeight || 500
                                      }}
                                    >
                                      <Link
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          this.handleCustomerDetail(rowData);
                                        }}
                                        style={{
                                          textDecoration: 'none',
                                          cursor: 'pointer',
                                          color: '#03adfc',
                                          display: 'inline-block'
                                        }}
                                      >
                                        {rowData.company_name}
                                      </Link>
                                    </span>
                                  }
                                  sx={{ margin: 0 }}
                                />
                              </ListItem>
                            </List>
                          </div>

                        }
                      </>
                      ),
                    },
                    {
                      title: this.state.selectedSaleStatus === 'Delivery Challan' ? 'Qty' : 'Qty',
                      field: 'sales_items',
                      align : 'left',
                      cellStyle: { textAlign: 'left'},
                      render: rowData =>
                        rowData.sales_items?.reduce((sum, item) => sum + (item.actual_quantity || 0), 0) || 0,
                    },
                   ...(pathname !== "/sales/invoices" ? [{
                      title: 'Amount',
                      field: 'total',
                    //   headerStyle: {
                    //   textAlign: 'center',
                    //   display: 'flex',
                    //   justifyContent: 'center',
                    //   paddingLeft: 0,
                    //   paddingRight: 0
                    // },
                      // cellStyle: { textAlign: 'center', paddingRight: '25px'},
                      // width :'15%',
                      //  cellStyle:{textAlign: 'right',paddingRight:'70px'},
                      render: (rowData) => (
                        <div
                          style={{
                            textAlign: 'right',
                            width: 80,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {' '}
                           {parseFloat(rowData.total || 0).toFixed(2)}
                        </div>
                      ),
                    }]:[]),
                        ...((pathname !== "/sales/salesOrders" && pathname !=='/sales/deliveryChallan') ? [{
                      title: 'Amount',
                      field: 'billed_amount',
                      // align: 'right', 
                      // width :'15%',
                      //  cellStyle:{textAlign: 'right',paddingRight: '15px'},
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
                          {' '}
                          {parseFloat(rowData.billed_amount || 0).toFixed(2)}
                        </div>
                      ),
                    }]:[]),
                        ...((pathname !== "/sales/salesOrders" && pathname !=='/sales/deliveryChallan') ? [{
                      title: 'Due',
                      field: 'due_amount',
                      // align: 'right', 
                      // width :'15%',
                      //  cellStyle:{textAlign: 'right',paddingRight: '15px'},
                      render: (rowData) => (
                        <div
                          style={{
                              textAlign: 'right',
                              minWidth: '60px',
                              maxWidth: '60px',
                              width: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                          }}
                        >
                          {' '}
                           {parseFloat(rowData.due_amount || 0).toFixed(2)}
                        </div>
                      ),
                    }] : []),

                    ...((pathname !== '/sales/deliveryChallan' && pathname !== '/sales/invoices') ? [{
                      title: 'Status',
                      field: 'sale_status',
                      render: (rowData) => {
                        const status = rowData.sale_status;
                        const creditReturn = rowData?.creditReturn || 0;
                        const converted = rowData?.updated_status === 15;
                        const partiallyConverted = rowData?.updated_status === 9
                        const statusName = rowData?.sale_status_name;
                        const approvalStatus = rowData?.status;

                        // Determine display text
                        let displayText = '';
                        if (converted) {
                          displayText = 'Invoiced';
                        } else if(partiallyConverted){
                          displayText = 'Partially Invoiced'
                        } else if (creditReturn > 0) {
                          displayText = statusName;
                        } else if (statusName === 'Send SO') {
                          displayText = approvalStatus === 'Waiting Approval' ? 'Waiting Approval'
                            : approvalStatus === 'Approved' ? 'Approved'
                            : approvalStatus === 'Rejected' ? 'Rejected'
                              : 'SO Created';
                        } else if (statusName === 'Direct Challan') {
                          displayText = 'Delivery Challan';
                        } else {
                          displayText = statusName;
                        }

                        // Determine color
                        let textColor = '';
                        if (converted || partiallyConverted) {
                          textColor = '#285c1c';
                        }
                        else if (status === 7) {
                          textColor = 'grey';
                        } 
                        else if (status === 8) {
                          textColor = '#87CEFA';
                        } else if (creditReturn > 0) {
                          textColor = '#d6c60f';
                        } else if (status === 1) {
                          textColor = approvalStatus === 'Waiting Approval' ? '#fb1213'
                            : approvalStatus === 'Approved' ? '#285c1c'
                            : approvalStatus === 'Rejected' ? '#fb1213'
                              : '#3b81b3';
                        } else if (status === 5) {
                          textColor = '#378c89';
                        } else {
                          textColor = '#285c1c';
                        }

                        return (
                          <div
                            style={{
                              color: textColor,
                              fontWeight: cellStyle.fontWeight,
                              fontSize: cellStyle.fontSize,
                            }}
                          >
                            {displayText}
                          </div>
                        );
                      },
                    }] : []),


                    ...((pathname === '/sales/invoices') ? [{
                      title: 'Status',
                      field: 'updated_label',
                      render: (rowData) => (
                        <div
                          style={{
                            color: rowData.updated_color || '#87CEFA',
                            fontWeight: cellStyle?.fontWeight,
                            fontSize: cellStyle?.fontSize,
                          }}
                        >
                          {rowData.updated_label}
                        </div>
                      ),
                    }
                    ] : [])
                    ,


                    ...((pathname === '/sales/deliveryChallan') ? [{
                      title: 'Status',
                      field: 'status_text',
                      render: (rowData) => (
                        <div
                          style={{
                            color: rowData.status_color || '#87CEFA',
                            fontWeight: cellStyle?.fontWeight,
                            fontSize: cellStyle?.fontSize,
                          }}
                        >
                          {rowData.status_text}
                        </div>
                      ),
                    }] : []),

                    ...((pathname === '/sales/deliveryChallan' || pathname === '/sales/invoices') ? [{
                      title: 'Delivery',
                      field: 'delivery_label',
                      render: (rowData) => (
                        <div
                          style={{
                            color: rowData.delivery_color || '#87CEFA',
                            fontWeight: cellStyle?.fontWeight,
                            fontSize: cellStyle?.fontSize,
                          }}
                        >
                          {rowData.delivery_label}
                        </div>
                      ),
                    }] : []),



                    ...((pathname !== "/sales/salesOrders" && pathname !== '/sales/deliveryChallan') ? [{
                      title: 'Payment',
                      field: 'payment_label',
                      render: (rowData) => (
                        <div
                          style={{
                            color: rowData.payment_color || '#87CEFA',
                            fontWeight: cellStyle?.fontWeight,
                            fontSize: cellStyle?.fontSize,
                          }}
                        >
                          {rowData.payment_label}
                        </div>
                      ),
                    }] : []),

                    // {title: 'Goods Issue', field: 'goods_issue'},
                    {
                      title: '', 
                      field: 'sales_items',
                      hidden:true,
                      export:false,
                     
                      render: (rowData) => {
                              
                        return <Box  sx={{display: 'none'}}>{rowData.sales_items.map(item => item.name)}</Box>;
                      },
                      customFilterAndSearch: (value, rowData) => {
                        let tempString = rowData.sales_items.map(item => item.name).toString().toLowerCase();
                        return tempString.indexOf(value.toLowerCase()) != -1
                      },
                    },
                    {
                      title: '', 
                      field: 'soldLots',
                      export:false,
                      hidden:true,
                     
                      render: (rowData) => {
                              
                        return <Box  sx={{display: 'none'}}>{rowData.sales_items.map(item => item.soldLots[0]?.lot_number)}</Box>;
                      },
                      customFilterAndSearch: (value, rowData) => {
                        let tempString = rowData.sales_items.map(item => item.soldLots[0]?.lot_number).toString().toLowerCase();
                        return tempString.indexOf(value.toLowerCase()) != -1
                      },
                    },

                  ]}
                  // data={
                  //   this.state.sales_items_data ? this.state.sales_items_data.map((r,i) => {
                  //     const { tableData, ...record } = r;
                  //     const oldVal = record['Customer Name']
                  // const newVal = <List component="nav" key={r.sale_id} aria-label="main mailbox folders">
                  // <ListItem

                  // >     <ListItemIcon>
                  //        {record['Customer Type'] ==='0' ? <PersonIcon/> :<BusinessIcon/>}
                  //     </ListItemIcon>
                  //     <ListItemText primary= {oldVal} />
                  // </ListItem>
                  // </List>
                  //    record['Customer Name'] = newVal
                  //     return { i, ...record}
                  //   }) : []
                  // }

                  // data={
                  //   this.props.sales_filter_all_data
                    // this.props.sales.map(s=>{return {...s,sale_time: getDateTime(s.sale_time)}})
                  // }
                  // data = {this.props.searchSalesData?.length > 0 || this.state.searchVal ? this.props.searchSalesData : this.props.sales_filter_all_data}
                  data = {this.props.searchSalesData?.length > 0 || this.state.searchVal.length > 0  ? (this.state.pageType === '/sales/salesOrders' ? this.props.searchSaleOrderData :  this.state.pageType === '/sales/deliveryChallan' ? this.props.searchDcData : this.props.salesByPagination) :
                   (this.state.pageType === '/sales/salesOrders' ? this.props.saleOrderByPagination : this.state.pageType === '/sales/deliveryChallan'  ? this.props.dcByPagination : this.props.salesByPagination)}
                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                     {pathname === "/sales/invoices" ? "Invoices" : pathname === "/sales/deliveryChallan" ?  'Delivery Challan' : "Sales Orders" } </Typography>}
                />
              )}
             {/* <FavouriteMenu openInvoiceModal={this.handleOpenInvoiceModal} /> */}
              {this.state.open === true && (
                <React.Fragment>
                  
                  <NewSalesForm
                    modalStatus={modalStatus}
                    appConfigData={this.state.appConfigData}
                    edit_id_data={this.state.edit_id_data}
                    new_status={this.state.new_status}
                    returnState={this.state.returnState}
                    status={this.state.status}
                    type='customer'
                    handleClose={this.handleClose}
                    handleSubmit={this.handleSubmit}
                    setModalStatusHandler={setModalStatusHandler}
                    setEditProductDataHandler={setEditProductDataHandler}
                    setEditCustomerHandler={setEditCustomerHandler}
                    setModalTypeHandler={setModalTypeHandler}
                    setcreatNewDataHandler={setcreatNewDataHandler}
                    responseDialog={this.responseDialog}
                    creatNewData={creatNewData}
                    createMail={this.createMail}
                    selectData={selectData}
                    setselectData={setselectData}
                    getCustLedger={this.getCustLedger}
                    // ledgerReturnApi={this.ledgerReturnApi}
                    cnInvoiceFunction={this.cnInvoiceFunction}
                    // creditSequenceUpdate={this.creditSequenceUpdate}
                    mail_configuration={this.props.mail_configuration}
                    setAppConfigData = {this.setAppConfigData}
                    closeDc = {this.closeDc}
                    {...this.props}
                    handleNewopen={this.handleNewopensales}
                    newSalesAfterCreating_Data = {this.state.newSalesAfterCreating_Data}
                    handle_newSalesAfterCreating_Data={this.handle_newSalesAfterCreating_Data}
                    isNewSales={this.state.isNewSales}
                    handle_newCreate = {(bool) => this.setState({isNewSales : bool, status: 'create', edit_id_data: []})}
                    searchSalesData = { this.props.searchSalesData?.length > 0 || this.state.searchVal.length > 0 ? 'search' : 'list' } 
                    price_list={this.props.price_list}
                    shipping_details={this.state.sales_data.shippingData}
                    invoiceNumberChangeDialog={this.state.invoiceNumberChangeDialog}
                    setInvoiceNumberChangeDialog={(data) => this.setState({ invoiceNumberChangeDialog: data })}
                    pageType={this.state.pageType}
                    subcompanyId={this.state.subcompanyId}
                    // customer={this.props.customer}
                  />
                        
                </React.Fragment>
              )}
              {this.state.rowPopup.open && (
                <TopOrder
                  invoiceFunction={this.cnInvoiceFunction}
                  // allFunctionsReturn={this.allFunctionsReturn}
                  rowIndex={this.state.rowPopup.rowIndex}
                  handleEdit={this.handleEdit}
                  handleSOEdit={this.handleSOEdit}
                  handleDelete={this.handledialog}
                  sales_items={this.state.rowPopup.sales_items}
                  type={'sales'}
                  handleClose={this.handleClose}
                  rowPopupClose={this.rowPopupClose}
                  responseType={'cashIn'}
                  salesByPagination={this.state.pageType === '/sales/salesOrders' ? this.props.saleOrderByPagination : this.state.pageType === '/sales/deliveryChallan'  ? this.props.dcByPagination : this.props.salesByPagination}
                  rowPopup = {this.state.rowPopup}
                  sale_status={this.state.sale_status}
                  cancelInvoiceUpdate={this.cancelInvoiceUpdate}
                  searchVal= {this.state.searchVal}
                  searchSalesData= {this.state.pageType === '/sales/salesOrders' ? this.props.searchSaleOrderData : this.state.pageType === '/sales/deliveryChallan' ? this.props.searchDcData : this.props.searchSalesData}
                  transactionRowData={this.state.transactionRowData}
                  selectedSaleStatus ={this.state.selectedSaleStatus}
                  pageType={this.state.pageType}
                  soToInvoiceId={this.state.soToInvoice}
                />
              )}
               {/* <PaymentDialog
        getPay={this.state.getPay}
        setPayData={(data) => this.setState({getPay:data})}
        status={'edit'}
        activeINV={'INV'}
        selectionModel={this.state.selectionModel}
        setSelectionModel={this.setSelectionModel}
        entryvalue = {this.state.entryvalue}
        handleEntry = {this.setHandleEntry}
        received_amount={this.state.received_amount}
        setReceived_amount={(data) => this.setState({received_amount:data}) }
        handleSubmit={this.paymentValidate}
        custType={'CUSTOMER'}
        Tdata={this.state.Tdata}
        setTdata={this.setTdata}
        custData={this.state.getCustomer}
        sales_items={this.state.sales_items}
        paymentOpen={this.state.paymentOpen}
        setpaymentOpen={this.setpaymentOpen}
        responseType={'cashIn'}
        manualNoteSchemes={this.state.manualNoteSchemes}
        // setManualNoteSchemes={(data) => this.setState({manualNoteSchemes:data}) }
        setManualNoteSchemes={(updaterFn) => 
          this.setState((prevState) => ({
            manualNoteSchemes: 
              typeof updaterFn === 'function'
                ? updaterFn(prevState.manualNoteSchemes)
                : updaterFn
          }))
        }
        addAdvanceAmount={this.addAdvanceAmount}
        pageType={"SALES"}
        type={0}
        clickedInvoice={this.state.clickedInvoice}
        disableSubmit={this.state.disableSubmit}
      /> */}
      {
        this.state.paymentOpen &&
        <ReceiptPayments
          paymentOpen={this.state.paymentOpen}
          custType = 'CUSTOMER'
          handleClose={this.setpaymentOpen}
          editData={this.state.edit_id_data}
          responseType={'cashIn'}
          sales_items={this.state.sales_items}
          selectedCustomer={this.state.getCustomer}
          selectedInvoice={this.state.clickedInvoice}
        />
      }
      <LocationAlert open={this.state.openAlert} onClose={()=> this.setState({openAlert:false})}/>

      </>
  }
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sales: state.salesReducer.sales || [],
    // credit_debit_seq: state.salesReducer.credit_debit_seq,
    customer: state.customerReducer.customer || [],
    customer_invoice: state.customerReducer.customer_invoice || [],
    product: state.productReducer.product || [],
    productByType: state.productReducer.productByType || [],
    stocklocation: state.stockLocationReducer.stocklocation || [],
    sales_id_data: state.salesReducer.sales_id_data || [],
    alertResponce: state.alertboxReducer,
    // sale_outstanding:state.salesReducer.sale_outstanding,
    app_config_data: state.appConfigReducer.app_config_data,
    app_config_data_based_on_type: state.appConfigReducer.app_config_data_based_on_type,
    chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    loginToken: state.UserRoleReducer.loginToken,
    loginRole: state.UserRoleReducer.loginToken,
    list_payment_type: state.paymentMethodReducer.list_payment_type || [],
    sales_filter_all_data: state.salesReducer.sales_filter_all_data || [],
    ntfydata:state.NotificationReducer.ntfydata || [],
    mail_configuration: state.ConfigurationReducer.mail_configuration || [],
    sms_configuration: state.ConfigurationReducer.sms_configuration || [],
    createUser: state.UserCreationReducer.createUser || [],
    price_list: state.PriceListReducer.price_list || [],
    Sale_Status: state.salesReducer.Sale_Status || [],
    // paginated
    salesByPagination:state.salesReducer.salesByPagination || [],
    salesData:state.salesReducer.salesData || [],
    paginationCount: state.salesReducer.salesByPaginationCount,
    // search
    searchSalesData : state.salesReducer.searchSalesData,
    searchSalesCount : state.salesReducer.searchSalesCount,
    termsAndConditionsList : state.TermsConditionsReducers.termsAndConditionsList,
    saleOrderByPaginationCount:state.salesReducer.saleOrderByPaginationCount,
    saleOrderByPagination:state.salesReducer.saleOrderByPagination,
    searchSaleOrderData : state.salesReducer.searchSaleOrderData,
    searchSaleOrderCount: state.salesReducer.searchSaleOrderCount,
    showSalesModal: state.salesReducer.showSalesModal,
    showDcsModal: state.salesReducer.showDcsModal,
    customerAsCompany: state.customerReducer.customerAsCompany || [],
    user_rights : state.roleReducer.user_rights || [],
    dcByPaginationCount:state.salesReducer.dcByPaginationCount,
    dcByPagination:state.salesReducer.dcByPagination,
    searchDcData : state.salesReducer.searchDcData,
    searchDcCount: state.salesReducer.searchDcCount,
    getbillingcompanydetails: state.salesReducer.getbillingcompanydetails,
    menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listSalesAction: (
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportDataCallBack,
 
    ) => {
      return dispatch(
        listSalesAction(
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportDataCallBack
        ),
      );
    },
    createSalesAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      setDisable,
      exportDataCallBack,
      response
    ) => {
      return dispatch(
        createSalesAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          setDisable,
          ()=>{},
          response
        ),
      );
    },
    getbyidSalesAction: (id) => {
      dispatch(getbyidSalesAction(id));
    },
    updateSalesOrderAction: (id, data, setModalTypeHandler, setLoaderStatusHandler, sample, employee_id, headerLocationId, response) => {
      return dispatch(updateSalesOrderAction(id, data, setModalTypeHandler, setLoaderStatusHandler, sample, employee_id, headerLocationId, response))
    },
    updateSalesAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      employee_id,
      headerLocationId,
      response
    ) => {
      return dispatch(
        updateSalesAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          employee_id,
          headerLocationId,
          response
        ),
      );
    },
    deleteSalesAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
      response
    ) => {
      return dispatch(
        deleteSalesAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
          response
        ),
      );
    },
    listTaxAction: () => {
      dispatch(listTaxAction());
    },
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    getBillingcompany: () => {
      dispatch(getBillingcompany());
    },
    listProductActionByType: (type,setModalStatusHandler, setLoaderStatusHandler, exportCallBack, response) => {
      return dispatch(listProductActionByType(type,setModalStatusHandler, setLoaderStatusHandler, exportCallBack, response));
    },
    listStockLocationSequenceAction: (
      data,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
    ) => {
      return dispatch(
        listStockLocationSequenceAction(
          data,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
        ),
      );
    },
    listCustomerAction: (setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler, response));
    },
    listcustomerinvoice: (id,setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(listcustomerinvoice(id,setModalTypeHandler, setLoaderStatusHandler, response));
    },
    chartOfAccountsIdNameAction:(body, list) =>{
      dispatch(chartOfAccountsIdNameAction(body,list))
    },
    set_sales_table_data: (data) => {
      dispatch(set_sales_table_data(data));
    },
    receiptEntry: (id, data, setLoaderStatusHandler, c1, c2, response) => {
      return dispatch(
        receiptEntry(id, data, setLoaderStatusHandler, c1, c2, response),
      );
    },
    posSequence: (id, data, setLoaderStatusHandler) => {
      return dispatch(posSequence(id, data, setLoaderStatusHandler));
    },
    getAppConfigDataAction: () => {
      return dispatch(getAppConfigDataAction());
    },
    // listSalesOutstandingAction:()=>{
    //   dispatch(listSalesOutstandingAction())
    // },
    getAppConfigDataBasedOnTypeAction: (type) => {
        dispatch(getAppConfigDataBasedOnTypeAction(type));
      },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    createTransactionAction: (data, dd, setLoaderStatusHandler) => {
      dispatch(createTransactionAction(data, dd, setLoaderStatusHandler));
    },
    listChartOfAccountsdataAction: () => {
      return dispatch(listChartOfAccountsdataAction());
    },
    creditDebitNoteSeq: (type) => {
      return dispatch(creditDebitNoteSeq(type));
    },
    creditDebitNoteSeqUpdate: (type, data) => {
      dispatch(creditDebitNoteSeqUpdate(type, data));
    },
    returnActions: (
      data,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
      response
    ) => {
      dispatch(
        returnActions(
          data,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
          response
        ),
      );
    },
    dcreturnActions: (
      data,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,response
    ) => {
      dispatch(
        dcreturnActions(
          data,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,response
        ),
      );
    },
    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },
    // listPaymentTypeDetails: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    CreateNotificationAction:(data) => {
      dispatch(CreateNotificationAction(data))
    },
    // listAllFilterSalesAction: (
    //   data,
    //   employee_id,
    //   headerLocationId,
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   exportCallBack
    // ) => {
    //   return dispatch(
    //     listAllFilterSalesAction(
    //       data,
    //       employee_id,
    //       headerLocationId,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       exportCallBack
    //     ),
    //   );
    // },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getByIdMailConfigurationAction:(mail_name,role_id) => {
      return dispatch(getByIdMailConfigurationAction(mail_name,role_id))
    },
    getByIdSmsConfigurationAction:(sms_role_name,role_id) => {
      return dispatch(getByIdSmsConfigurationAction(sms_role_name,role_id))
    },
    // getPriceListAction:(setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(getPriceListAction(setModalTypeHandler, setLoaderStatusHandler))
    // },
    getSalesStatusListAction: () => {
      return dispatch(getSalesStatusListAction());
    },
    set_searchSalesAction: (val ) => { 
      return dispatch(set_searchSalesAction(val));
    },
    get_searchSalesAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchSalesAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    set_searchSaleOrderAction: (val ) => { 
      return dispatch(set_searchSaleOrderAction(val));
    },
    get_searchDcAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchDcAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },

    set_searchDcAction: (val ) => { 
      return dispatch(set_searchDcAction(val));
    },
    get_searchSaleOrderAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchSaleOrderAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    approvalUserRightsAction : (payload)=>{
      return dispatch(approvalUserRightsAction(payload))
    },
    get_searchContactsActionFinal : (payload,setModalTypeHandler,setLoaderStatusHandler)=>{
      return dispatch(get_searchContactsActionFinal(payload,setModalTypeHandler,setLoaderStatusHandler))
    },
    CancelinvoiceSalesAction :(
      sale_id,
      salesData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      response
    ) =>{ return dispatch(CancelinvoiceSalesAction( sale_id,
      salesData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      response))},
    listSalesPaginateAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listSalesPaginateAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    listSaleOrderPaginateAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listSaleOrderPaginateAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },

       listDCPaginateAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listDCPaginateAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    listSalesDataAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listSalesDataAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    
    searchSalesPaginationAction: (val) => { 
      return dispatch(searchSalesPaginationAction(val));
    },
    searchSaleOrderPaginationAction: (val) => { 
      return dispatch(searchSaleOrderPaginationAction(val));
    },
       searchDcPaginationAction: (val) => { 
      return dispatch(searchDcPaginationAction(val));
    },
    ListTermsAndConditionsAction: () => {
      dispatch(ListTermsAndConditionsAction({ searchString : '' }))
    },
    customerAsCompanyAction: () => {
      dispatch(customerAsCompanyAction())
    },
    setInvoiceTempAction:(data)=>{
      dispatch(setInvoiceTempAction(data))
    },
    ManualSalesPurchase:(data, callback)=>{
      dispatch(ManualSalesPurchase(data, callback))
    },
    setTriggerSalesModal:(data)=>{
      dispatch(triggerSalesModal(data))
    },
    setTriggerDcsModal:(data)=>{
      dispatch(triggerDcsModal(data))
    },
    // getUserRightsByRoleIdAction:()=>{
    //   dispatch(getUserRightsByRoleIdAction())
    // },
    getMenuAccessAction:(selectedRole)=>{
      dispatch(getMenuAccessAction(selectedRole))
    },
    clearInvoiceTempAction:()=>{
      dispatch(clearInvoiceTempAction())
    },
    OpenalertActions:(data)=>{
      dispatch(OpenalertActions(data))
    },


    
  };
};

export default withLocation(connect(mapStateToProps, mapDispatchToProps)(Sales));
