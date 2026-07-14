import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTablePagination, MTableToolbar} from 'utils/SafeMaterialTable';
import {
  updatePurchasesAction,
  getbyidPurchasesAction,
  deletePurchasesAction,
  createPurchasesAction,
  paymentEntry,
  paymentview,
  getPayablesBySupplierIdAction,
  posSequence,
  receivingsPayments,
  potCodeAction,
  returnActions,
  payablesPaymentEntry,
  listPurchasesFilterAction,
  listPurchasesPaginateAction,
  get_searchPurchaseAction,
  set_searchPurchaseAction,
  searchPaginationAction,
  triggerBillsModel,
  triggerPOsModal
} from '../../../redux/actions/purchase_actions';
import AlertDialog from '../../common/Dialog';
// import { purchases_col } from '../../../utils/columns'
import Popup from './Popup';
import {listStockLocationSequenceAction} from '../../../redux/actions/stock_Location_actions';
import {listVendorIdAndNameAction, getSupplierDetailsByIdAction, getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction} from '../../../redux/actions/vendor_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ArticleIcon from '@mui/icons-material/Article';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import {getAppConfigDataAction, getAppConfigDataBasedOnTypeAction} from '../../../redux/actions/app_config_actions';
import TopOrder from '../../../components/erpDesign/PO';
import {getDateTime, getDateTimeFormat} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {listChartOfAccountsdataAction, chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {getIgst} from '../../../components/pos/checkout_products/commonTax';
import CnDialog from '../sales/cn_invoice';
import {sendNtfy} from '../../../firebase/firebase.service';
import PurchaseLabelDialog from './PurchaseLabelDialog'
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import {
  creditDebitNoteSeq,
  creditDebitNoteSeqUpdate,
  getBillingcompany,
  sendMail,
} from '../../../redux/actions/sales_actions';
import {listProductAction, InventoryProductAction, purchaseProductListAction} from '../../../redux/actions/product_actions';
import {
  Purchase,
  Inventory,
  SGST_Receivable,
  CGST_Receivable,
  IGST_Receivable,
  Debit_Notes,
} from '../../../utils/ledgers';
import FilterPurchases from './FilterPurchases';
import moment from 'moment';
import { Typography, Box, InputAdornment, TextField, Dialog, DialogContent, DialogActions, Button, Link, DialogTitle, DialogContentText, useMediaQuery, useTheme, TablePagination } from '@mui/material';
import {CreateNotificationAction} from '../../../redux/actions/notification_actions'
import {getByIdMailConfigurationAction} from '../../../redux/actions/configuration_actions';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import Invoice from '../sales/Invoice'
import MailIcon from '@mui/icons-material/Mail';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import CommonSearch from 'utils/commonSearch';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import IndexForStockReturn from '../sales/cn_invoice/indexStock';
import App from 'components/customer_erpDesign';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from 'utils/stickyTableLayout';
import { customerAsCompanyAction } from 'redux/actions/customer_actions';
import { useLocation, useNavigate } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { useCustomFetch } from 'utils/useCustomFetch';
import ContactPage from '../../../../src/@crema/services/db/Contact/index';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { debounce } from 'lodash';
import API_URLS from '../../../utils/customFetchApiUrls';
import { searchErrorMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';
import  "../../../index.css";
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const poStatus = {
  New: 'primary',
  Open: 'secondary',
  'Pending Payment': 'warning',
  'Pending Goods': 'warning',
  Completed: 'success',
};

export function withLocation(Component) {
  return function WrappedComponent(props) {
    const location = useLocation();
    const navigate = useNavigate();
    return <Component {...props} location={location} navigate={navigate} />;
  };
}

class Product extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var firstDay = null;
    var lastDay = null;
    this.state = {
      open: false,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      edit_data: {},
      paymentOpen: false,
      filterOpen: false,
      from: firstDay,
      to: lastDay,
      itemsData: [],
      Tdata: [],
      getVendor: {},
      paid_amount: 0,
      selectionModel: [],
      entryvalue: false,
      dateRange : null,
      filtedValue: {
        name: '',
        brand: '',
        category: '',
        location_id: 'null',
        supplier_id:'',
        statusfilter:'',
        max_price: '',
        min_price: '',
      },
      checkBox: false,
      appConfigData: {},
      rowPopup: {open: false, rowIndex: '', receivings_items: []},
      // cnPopupData: {custData: {}, receivings_items: [], Dopen: false},
      customer_data : {},
      cnPopupData: {
        invoice: '',
        custData: {},
        soDate: '',
        sales_items: [],
        receivings_items: [],
        Dopen: false,
        customer_id: '',
        sale_id: '',
        note: '',
        sales_payments: [],
      },
      getPay: [],
      headerupdate: 'null',
      currentPage:0,
      page: 0,
      pageSize: pageSize,
      searchVal: '',
      searchPageData: [],
      po_number: '',
      invoice_open: false,
      isApiFinished: false,
      manualNoteSchemes: [],
      cnclose:false,
      openAlert: false,
      debitSequence:null,
      setData : '',
      onrowclick : false,
      allPurchaseStatus : ['All', 'Pending Payment', 'Pending Goods', 'Completed'],
      selectedPurchaseStatus : 'All',
      pageType: '',
      template_url: "",
      selected: null,
      showDialog: false,
      dialogMessage: "",
      selectedRow: '',
      locationId: null,
      subcompanyId: 'All',
      showLabelDialog: false,
      labelData: [],
      labelLoading: false,
      initialPurchaseProduct: null,
      purchaseReturnPath: null,
    };
    this.cookies = new Cookies();
    this.storage = getsessionStorage();
    this.customFetch = useCustomFetch(),
     this.debouncedListPurchasePaginateAction = debounce(
      this.purchasePaginateActionHandler,
      1000
    );
  }

   purchasePaginateActionHandler = (data, context) => {
    if(data.searchString.length >= 3 || data.searchString.length === 0) {
      this.props.listPurchasesPaginateAction(
         data,
         context.commoncookie,
         context.headerLocationId,
         context.setModalTypeHandler,
       context.setLoaderStatusHandler,
       )
    }
    else {
      this.props.OpenalertActions({msg: searchErrorMessage, severity: 'warning'})
    }
  };
//direct invoice open

 //componentRef;

 getVendor = () =>
 this.props.vendor.filter((d) => this.state.edit_data?.supplier_id === d.supplier_id)[0];

  storage = getsessionStorage()

  filterHandler = (name, value) => {
    this.setState({filtedValue: {...this.state.filtedValue, [name]: value}});
  };

  isHeaderLocationReady = (headerLocationId) =>
    headerLocationId !== undefined &&
    headerLocationId !== null &&
    headerLocationId !== '' 
    // headerLocationId !== 'null';
 
  //  handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // });
  //  filterData = this.state.edit_data?.receivings_items.map((d) => {
  //   const newData = {...d};

  //   d.taxes.forEach((t) => {
  //     if (t.tax_group === 'IGST') {
  //       newData.gst = t.tax_rate;
  //       newData.tax_category = t.tax_category;
  //     }
  //   });
  //   const quantity = props.returnState ? 0 : +d.received_quantity || d.ordered_quantity;
  //   const taxed =
  //     d.item_cost_price + (d.item_cost_price / 100) * (newData.gst || 1);
  //   newData.sub_total = (taxed * quantity).toFixed(2);
  //   newData.quantity = quantity;
  //   newData.returnQuantity = d.received_quantity;
  //   if (props.returnState) {
  //     newData.soldLots = d.lots;
  //     newData.lots = [];
  //   }
  //   return newData;
  // })
  handlePageChange = async (page) => {
    this.setState({ page: page });  
  };

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size });
  };

  async componentDidMount() {
    const selectedRole = this.storage.role_name
    this.props.set_searchPurchaseAction({data:[], numRows:0})
    // this.props.getUserRightsByRoleIdAction()
    this.props.getMenuAccessAction(selectedRole)
    const { pathname } = this.props.location;
    this.setState({pageType: pathname})
    let pathType = 'All'
    // console.log(pathname === "/sales/purchasesOrders","bvbvdf");
    
    if(pathname === "/sales/purchasesOrders"){
      pathType= 'New'
    this.setState({selectedPurchaseStatus: pathType})
    }
   
    const context = this.context;
    const employee_id = this.storage?.employee_id;
    // console.log(pathType,"pathType");
    
    

    const data = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      supplier_id:'',
      statusfilter:'',
      max_price: '',
      min_price: '',
      product_name: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page, 
      numPerPage:  20,
      purchase_status : pathType,
      pageType: pathname,
      searchString:'',
      sub_company_id : 'All'
    };
    // console.log(data,"data11");
    


      
    if (this.isHeaderLocationReady(context.headerLocationId)) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // this.props.listPurchasesFilterAction(
        //   data,
        //   context.commoncookie,
        //   context.headerLocationId,
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        // ),
        this.props.listPurchasesPaginateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        // this.props.customerAsCompanyAction()
      //  this.props.listVendorIdAndNameAction(),
      ).finally(() => this.setState({ isApiFinished: true }));
    } else {
      this.setState({ isApiFinished: true });
    }

      // this.props.listVendorAction(context.setModalTypeHandler, context.setLoaderStatusHandler),
      // this.props.InventoryProductAction(),
       let type='purchase'
      this.props.getAppConfigDataBasedOnTypeAction(type);
      // this.props.listChartOfAccountsdataAction();
      // this.props.listUserCreationAction(()=>{}, ()=>{});
      // this.props.creditDebitNoteSeq('debit');
      this.props.listStockLocationSequenceAction(
        {sequence_type: 'PO'},
        null,
        context.commoncookie,
        context.headerLocationId,
      );
      this.handleMailConfiguration();
      // this.props.purchaseProductListAction();
      // this.props.listProductAction();

    const po = this.props.stocklocation.find(
      (d) => d.location_id === context.headerLocationId,
    ) || {};
    const po_number = po.sequence_pattern || '';
    this.setState({ po_number })

    const subcompany = this.storage.subcompany
    if(subcompany > 0) {
      this.props.getBillingcompany()
    }

    this.handleLocationPrefill(this.props.location);
  }

  handleLocationPrefill = (location) => {
    const { pathname, state } = location || {};
    if (
      pathname === '/sales/bills' &&
      state?.openCreatePurchase &&
      state?.initialPurchaseProduct
    ) {
      this.setState({
        open: true,
        status: 'create',
        returnState: false,
        edit_id_data: [],
        isNewSales: true,
        initialPurchaseProduct: state.initialPurchaseProduct,
        purchaseReturnPath: state.returnTo || null,
      });
    }
  }
  
  setAppconfigData = (data) =>{
    this.setState({appConfigData: {
      ...this.state.appConfigData, ...data
    }
    })
  }

  getAppConfigData = () => {
    const {app_config_data_based_on_type} = this.props;
    //const locationData = this.props.stocklocation.filter(f => f.location_id === data.location_id)
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
    const roundedOffEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyRoundOff')

    this.setState({
      appConfigData: {
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        companyEmail: emailData.length > 0 ? emailData[0].value : '',
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        state: state.length > 0 ? state[0].value : '',
        roundedOffEnabled: roundedOffEnabled.length ? roundedOffEnabled[0].value : 'false'
      },
    });
  };
  async componentDidUpdate(preProps, preState) {

    const { pathname } = this.props.location;

    if (pathname !== this.state.pageType) {
      const typePage = pathname === "/sales/bills" ? 'All' : "New"
      this.setState({ pageType: pathname, selectedPurchaseStatus: typePage, subcompanyId: 'All', rowPopup: {open: false} }, () => {
      });
    }
    
    if (
      preProps.app_config_data_based_on_type !== this.props.app_config_data_based_on_type &&
      this.props.app_config_data_based_on_type.length > 0
    ) {
      this.getAppConfigData();
    }
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.state.headerupdate) {
      if (!this.isHeaderLocationReady(headerLocationId)) {
        this.setState({headerupdate: headerLocationId});
        return;
      }
      if (
        this.state.selectedRow &&
        this.state.selectedRow.location_id &&
        this.state.selectedRow.location_id !== headerLocationId
      ) {
        alert("The selected row's location does not match the newly selected header location.");
        if (typeof context.setHeaderLocationIdHandeler === 'function') {
          context.setHeaderLocationIdHandeler(this.state.headerupdate);
        }
        return;
      }
      this.setState({headerupdate: headerLocationId});
      this.clearButton(false);
      // const data ={	brand: "",category: "",location_id: context.headerLocationId,max_price: "",min_price: "",product_name: "",from: (moment(this.state.from, 'year', 'month', 'day')).format("yyyy-MM-DD"), to: (moment(this.state.to, 'year', 'month', 'day')).format("yyyy-MM-DD"),user_id: context.commoncookie}
      const data = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage: this.state.pageSize, pageType: this.state.pathType}, location_id : context.headerLocationId,};
      if(this.state.rowPopup.open === false && this.state.open === false ){
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPurchasesPaginateAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
      context.setLoaderStatusHandler,
          ),
        );

      }
      this.setState({page: 0});
     

    }

    if (preProps.location.pathname !== this.props.location.pathname) {
    this.setState({ searchVal: '', onrowclick: false ,open:false });
    this.props.set_searchPurchaseAction({data:[], numRows:0})
  }

    if (preProps.location !== this.props.location) {
      this.handleLocationPrefill(this.props.location);
    }

    if (preState.pageSize !== this.state.pageSize) { 
       
        const data = { ...this.exportValue(), ...{ pageCount: this.state.page ? this.state.page : 0, numPerPage: this.state.pageSize}, };
        if (typeof data.location_id !== 'object') {
          data.location_id = context.headerLocationId;
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPurchasesPaginateAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
      context.setLoaderStatusHandler,
          )
        );
      
    }
    if (preState.page !== this.state.page) { 
       
        
        const data = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage:  this.state.pageSize}, };
        if(typeof data.location_id !== 'object' ){
          data.location_id = context.headerLocationId
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPurchasesPaginateAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
      context.setLoaderStatusHandler,
          )
        );
      
    }
    if(preState.selectedPurchaseStatus !== this.state.selectedPurchaseStatus) {
      
        const data = { ...this.exportValue(), ...{ pageCount: this.state.page ? this.state.page : 0, numPerPage: this.state.pageSize}}
        if (typeof data.location_id !== 'object') {
          data.location_id = context.headerLocationId;
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listPurchasesPaginateAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          )
        )
      
    }

     if (this.props.billsModel) {
      this.setState({
        open: true,
        status: 'create',
        returnState: false,
        edit_id_data: [],
        isNewSales: true,
      });
      this.props.setTriggerBillsModel(false);
    }

    if (this.props.poModel) {
      this.setState({
        open: true,
        status: 'create',
        returnState: false,
        edit_id_data: [],
        isNewSales: true,
      });
      this.props.setTriggerPOsModal(false);
    }

   
  }


  openLabelPreview = async (rowData) => {
  try {
    this.setState({ labelLoading: true });
     const customFetch = useCustomFetch();
     const { data } = await customFetch(
                      API_URLS.GET_LOTS_BASED_ON_RECEIVINGS(rowData.receiving_id),
                      'GET',
                  );
                  if(data.length > 0){
                      this.setState({
      labelData: data,
      showLabelDialog: true,
      labelLoading: false,
    });
                  }

   
  } catch (err) {
    console.error(err);
    this.setState({ labelLoading: false });
  }
};


  handleMailConfiguration = async () => {
    const context = this.context;
    // const roleIdData = this.props.createUser.filter(f => f.employee_id === context.commoncookie)
    const storage = getsessionStorage()
    let role_id = storage?.role_id;

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   // this.props.getByIdMailConfigurationAction('Purchase Order', role_id)
    // );
  }
  

  handleEdit = async (edit_data, returnState = false, editDataIndex, isNewPage) => {
    // console.log('hyandleEditttt')
    this.setState({
      open: true,
      status: 'edit',
      edit_data,
      isPrint: false,
      rowPopup: {open: false, rowIndex: editDataIndex},
      returnState,
      isNewPage: isNewPage
    });
  };

  handlePO = async (edit_data) => {
    const payloadBills = {
        receiving_id: edit_data?.id
    }

    const payloadPO = {
      po_id: edit_data?.id
    }

    const data = edit_data?.type === 'bills' ? payloadBills : payloadPO
    
    await apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        this.props.getSupplierDetailsByIdreceivings_itemsAction(edit_data.supplier_id, data)
    )
    this.getAppConfigData();
    this.setState({customer_data : {company_name: edit_data.company_name, email: edit_data.email, phone_number: edit_data.phone_number, 
    city: edit_data.city, state: edit_data.state, zip: edit_data.zip
    }})
    this.setState({rowPopup: {open: false, rowIndex: ''}});
    this.setState({invoice_open: true, status: 'edit', edit_data, isPrint: true});
  };

  handleNew = async (edit_data) => {
    this.setState({open: true, status: 'New', edit_data, initialPurchaseProduct: null, purchaseReturnPath: null});
  };

  handleInitialPurchaseProductConsumed = () => {
    if (this.state.initialPurchaseProduct !== null) {
      this.setState({ initialPurchaseProduct: null });
    }
  }
  handleEntry = (data) =>{
    this.setState({entryvalue:data});
  }

  handleDelete = async () => {
    const context = this.context;
    if(this.context.headerLocationId === 'null'){
      this.setState({openAlert:true})
      return
    }
    const {
      id,
      edit_data: {supplier_id, receivings_items, po_number},
    } = this.state;
    // const {email} =
    //   this.props.vendor.find((d) => supplier_id === d.supplier_id) || {};

    let email;
    await this.props.getSupplierDetailsByIdAction(this.state.edit_data.supplier_id, (supplierDetails) => {
      email = supplierDetails?.email || '';
    })

    await this.props.deletePurchasesAction(
      id,
      {email, receivings_items, po_number, checkBox: this.state.checkBox, pageType: this.state.pageType},
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      context.commoncookie,
      context.headerLocationId,
      (res) => {
        if (res) {
          // const data = {
          //   brand: '',
          //   category: '',
          //   location_id: context.headerLocationId,
          //   supplier_id:'',
          //   statusfilter:'',
          //   max_price: '',
          //   min_price: '',
          //   product_name: '',

          //   user_id: context.commoncookie,
          //   from:
          //     this.state.from === null
          //       ? null
          //       : moment(this.state.from, 'year', 'month', 'day').format(
          //           'yyyy-MM-DD',
          //         ),
          //   to:
          //     this.state.from === null
          //       ? null
          //       : moment(this.state.to, 'year', 'month', 'day').format(
          //           'yyyy-MM-DD',
          //         ),
          // };
          // this.props.listPurchasesFilterAction(
          //   data,
          //   context.commoncookie,
          //   context.headerLocationId,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          // );
          const data = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage:  this.state.pageSize}, };

          this.props.listPurchasesPaginateAction(
            data,
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
      context.setLoaderStatusHandler,
          );
        }
      },
    );
    this.setState({delete: false});
  };

  handledialog = async (edit_data) => {
    const data = {
      receiving_id: edit_data.receiving_id
    };
  
    try {
      if (edit_data.receive_goods === "pending") {
        const message = await this.customFetch(
          API_URLS.DELETE_PURCHASE_ORDER(edit_data.po_id),
          'GET',
          {}
        );
  
      if (message.data === "Delete") {
        this.setState({
          delete: true,
          id: edit_data.po_id,
          edit_data,
          selectedRow: '',
          rowPopup: { open: false, rowIndex: '' },
        });
      } else {
        this.setState({
          showDialog: true,
          dialogMessage: 'This purchase order is already converted to bill',
        });
      }
      }else{
        const message = await this.customFetch(
          API_URLS.CHECK_LOTS_SALES(edit_data.receiving_id),
          'GET',
          {}
        );
  
      if (message.data === "Delete") {
        this.setState({
          delete: true,
          id: edit_data.receiving_id,
          edit_data,
          rowPopup: { open: false, rowIndex: '' },
        });
      } else {
        this.setState({
          showDialog: true,
          dialogMessage: 'This item cannot be deleted because it is associated with sales.',
        });
      }
    }
    } catch (err) {
      this.setState({
        showDialog: true,
        dialogMessage: 'An error occurred while checking the item.',
      });
    }
  };

  handleDeleteClose = () => {
    this.setState({ showDialog: false, dialogMessage: "" });
  };
  

  responseDialog = (res, resSeverity) => {
    this.setState({dialog: {msg: res, severity: resSeverity, open: true}});
  };

  handleClose = () => {
    const context = this.context;
    if (this.state.status === 'create') {
      if (this.state.purchaseReturnPath) {
        this.setState({
          open: false,
          dialog: false,
          delete: false,
          rowPopup: {...this.state.rowPopup, open: false},
          status: '',
          initialPurchaseProduct: null,
          purchaseReturnPath: null,
        });
        this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
        this.props.navigate(this.state.purchaseReturnPath, { replace: true });
        return;
      }
      this.setState({
        open: false,
        dialog: false,
        delete: false,
        rowPopup: {...this.state.rowPopup, open: false},
        status: '',
        initialPurchaseProduct: null,
        purchaseReturnPath: null,
      });
      this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
    }
    if (this.state.status === 'edit') {
      this.setState({
        open: false,
        dialog: false,
        delete: false,
        rowPopup: {...this.state.rowPopup, open: this.state.isNewPage ? true: false, receivings_items: this.props.purchasesByPagination[0].receivings_items},
        status: '',
      });
      this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
    }
    if(this.state.status === ''){
      this.setState({
        open: false,
        dialog: false,
        delete: false,
        rowPopup: {...this.state.rowPopup, open: false},
        status: '',
      });
      this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
    }
  };

  handlecnClose = ()=>{
    const context = this.context;
    const data = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage: this.state.pageSize}, location_id : context.headerLocationId};
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listPurchasesPaginateAction(
        data,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
       context.setLoaderStatusHandler,
      ),
    );
  };

  sample = (value) => {
    this.setState({open: value});
  };

  setpaymentOpen = (data) => {
    this.setState({paymentOpen: data, Tdata: []});
    const context = this.context
    const payload = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage:  this.state.pageSize}, location_id : context.headerLocationId};
    this.props.listPurchasesPaginateAction(
      payload,
      context.commoncookie,
      context.headerLocationId,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
  };

  setTdata = (data) => {
    this.setState({Tdata: data});
  };

  setSalesItems = (data) => {
    this.setState({itemsData: data});
  };

  setSelectionModel = (data) => {
    this.setState({selectionModel: data});
  };

  pendingPayment = async(data) => {
    if(this.context.headerLocationId === 'null'){
      this.setState({openAlert:true})
      return
    }
    
    const {
      supplier_id,
      receivings_items: itemsData,
      paid_amount,
      receiving_id,
      status: oldStatus,
      receive_goods,
      total,
      
    } = data;

    // const getVendor = this.props.vendor.filter(
    //   (d) => supplier_id === d.supplier_id,
    // )[0];

    
    this.props.getSupplierDetailsByIdAction(supplier_id, (supplierDetails) => {
      
      
      this.props.getPayablesBySupplierIdAction(this.context.commoncookie, this.context.headerLocationId, supplier_id, (paybleData) => {
        
        this.props.getManualNoteSchemesByIdAction('supplier', supplier_id, (response) => {
          this.setState({
            itemsData,
            getVendor : supplierDetails,
            paymentOpen: true,
            paid_amount: +paid_amount,
            receiving_id,
            oldStatus,
            receive_goods,
            total: +total,
            status: 'edit',
            getPay : paybleData[0]?.childRow || [],
            manualNoteSchemes : response?.map(i => ({ ...i, selected: false })) || []
          });
        })

      })

    })

 


    // const getPay = this.props.purchase_outstanding.filter(
    //   (d) => d.supplier_id === supplier_id,
    // )[0]?.childRow;


    // this.setState({
    //   itemsData,
    //   getVendor,
    //   paymentOpen: true,
    //   paid_amount: +paid_amount,
    //   receiving_id,
    //   oldStatus,
    //   receive_goods,
    //   total: +total,
    //   status: 'edit',
    //   getPay,
    
    // });
  };

  isDelete = (status) => {
    // return status === 'Completed' || status?.startsWith('Pending')
    return (status === 'Completed' || status === 'Return' || status === 'Partial Return')
      ? true
      : false;
  };

  rowPopupClose = () => {
    const context = this.context
    const data = {...this.exportValue(), ...{pageCount: this.state.page ? this.state.page : 0, numPerPage: this.state.pageSize}, location_id : context.headerLocationId,};
    this.setState({rowPopup: {open: false},page: this.state.page ? this.state.page : 0, selectedRow: ''});
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listPurchasesPaginateAction(
        data,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      ),
    );
  };

  rowPopupOpen = () => {
    if (this.state.status === 'create') {
      this.setState({
        open: false,
        rowPopup: {...this.state.rowPopup, open: false},
      });
    } else {
      this.setState({
        open: false,
        rowPopup: {...this.state.rowPopup, open: true},
      });
    }
  };

  getCostPrice = () => {
    let total = 0;

    this.state.cnPopupData.itemsData.forEach((d) => {
      total += +d.quantity * +d.item_cost_price;
    });
    return total.toFixed(2);
  };

  taxes = () => {
    let total = 0;
    for (let data of this.state.cnPopupData.itemsData) {
      const prc = +data.item_cost_price;
      const qty = +data.quantity || 1;
      const tax = getIgst(data) || 1;
      total += ((prc * qty) / 100) * tax;
    }
    return total ? total.toFixed(2) : 0;
  };

  ledgerReturnApi = () => {
    const context = this.context;
    const data = {
      // "code": "00",
      // "entity": "00",
      location_id: context.headerLocationId,
      specialNumber: '00',
      note: 'Purchase Return',
      voucherTypeId: 1,
    };

    const temp = {
      [Purchase]: {
        desc: 'Total cost price',
        amt: +this.getCostPrice() + +this.taxes(),
      },
      [Inventory]: {desc: 'Total cost price', amt: this.getCostPrice()},
      [SGST_Receivable]: {
        desc: 'SGST% x Total unit price',
        amt: this.taxes() / 2,
      },
      [CGST_Receivable]: {
        desc: 'CGST% x Total unit price',
        amt: this.taxes() / 2,
      },
      [IGST_Receivable]: {desc: 'IGST% x Total unit price', amt: 0},
      Vendor: {
        desc: 'Total purchase amount',
        amt: +this.getCostPrice() + +this.taxes(),
      },
      [Debit_Notes]: {desc: '', amt: +this.getCostPrice() + +this.taxes()},
    };
    const accountTransaction = [];
    this.props.chartOfAccounts.forEach((d) => {
      const {id, creditSign, debitSign} = d;
      const dd = {accountId: id, description: temp[d.name]?.desc};

      if (
        [
          Inventory,
          SGST_Receivable,
          CGST_Receivable,
          IGST_Receivable,
          Debit_Notes,
        ].includes(d.name)
      ) {
        dd.amount =
          Number(debitSign) === 1 ? temp[d.name]?.amt : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if (Purchase === d.name) {
        dd.amount =
          Number(creditSign) === 1
            ? temp[d.name]?.amt
            : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if (this.state.cnPopupData.vendLedgerId === id) {
        dd.amount =
          Number(debitSign) === 1
            ? temp['Vendor']?.amt
            : `-${temp['Vendor']?.amt}`;
        dd.description = temp['Vendor']?.desc;
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

  ledgerPaymentApi = async (amount,payableAmount) => {
   const context = this.context;
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id: context.headerLocationId,
      specialNumber: '00',
      note: 'Purchase Payment',
      referenceNumber: payableAmount,
      voucherTypeId: 1,
    };
    const accountTransaction = [];
    let tempId = [];
    payableAmount.forEach( i => {
      if(i.paymentLedgerId) tempId.push(i.paymentLedgerId)
      if(i.cashboxLedgerId) tempId.push(i.cashboxLedgerId)
    });
    const body = { 
      id:tempId,
      name: null
    }
    await this.props.chartOfAccountsIdNameAction(body, (list) => {
      list.forEach((d) => {
        const {id, creditSign, debitSign} = d;
        const dd = {accountId: id, description: ''};
  
        if (payableAmount.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
          let payables = payableAmount.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}
  
          dd.amount = creditSign * amount || 0
          accountTransaction.push(dd);
        }else if(payableAmount.filter(f => f.ledger_id === id).length){
          dd.amount = debitSign * amount || 0
          accountTransaction.push(dd);
        }
      });
      data.accountTransaction = accountTransaction;
      this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)
    })

    // this.props.chartOfAccounts.forEach((d) => {
    //   const {id, creditSign, debitSign} = d;
    //   const dd = {accountId: id, description: ''};

    //   if (payableAmount.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //     let payables = payableAmount.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

    //     dd.amount = creditSign * amount || 0
    //     accountTransaction.push(dd);
    //   }else if(payableAmount.filter(f => f.ledger_id === id).length){
    //     dd.amount = debitSign * amount || 0
    //     accountTransaction.push(dd);
    //   }
    // });
    // data.accountTransaction = accountTransaction;
    // this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)
  };

  cnInvoiceFunction = async (data,credit_debit_seq,vendor) => {
    //  console.log("list",vendor)
    const custData =
      (await vendor.find(
        (d) => data.supplier_id === d.supplier_id,
      )) || this.state.customer_data;
    this.setState({
      cnPopupData: {
        ...data,
        po_number: credit_debit_seq.debit_note,
        custData,
        vendLedgerId: custData.ledger_id,
        Dopen: true,

      },
    });
    // this.ledgerReturnApi();

    // For NewData AfterPurchaseReturnedReload
     this.setState({headerupdate: ''})
  };

  cnhandleOpen = () => {
    this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: true}});
  };

  // creditSequenceUpdate = () => {
  //   const {sequence_id, current_seq} = this.props.credit_debit_seq;
  //   // console.log("sequence_id, current_seq",sequence_id, current_seq)
  //   this.props.creditDebitNoteSeqUpdate('debit', {current_seq,sequence_id});
  // };

  oldSequenceGet = (old_sequence) => {
   this.setState({ debitSequence: old_sequence })
  };


  handleFilterClose = (data) => {
    // this.setState({ filterOpen: data, open: false, rowPopup : {open:false}})
    this.setState({
      filterOpen: data,
      open: false,
      dialog: false,
      delete: false,
      rowPopup: {open: false, rowIndex: ''},
      status: '',
    });
    this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
  };

  createMail = () => {
    const context = this.context;
    let data = {
      custData: this.state.cnPopupData.custData,
      appConfigData: this.state.appConfigData,
      invoice_number: this.state.cnPopupData.po_number,
      sales_items: this.state.cnPopupData.itemsData,
      email: this.state.cnPopupData.custData.email,
      custType: 'VENDOR',
      soDate: this.state.cnPopupData.receiving_time,
    };

    this.props.sendMail(data, context.setLoaderStatusHandler);
    this.handleClose();
  };

  setCheckBox = (value) => {
    this.setState({checkBox: value});
  };

  commonMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else if (typeof array === 'string') {
      return array;
    }
  };

  handleChange = async (data) => {
    if(data.target.name === 'dateRange') {
      this.setState({
        from: data.target.value,
        to: data.target.value1,
        dateRange: data.target.value2
      })
    }
    else if(data.target.name === 'subcompanyId'){
      this.setState({subcompanyId: data.target.value.sub_company_id})
    }
    else {
      const date_val = data.target.value;
      this.setState({ [data.target.name]: date_val });
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

  clearButton = (shouldFetch = true) => {
    const context = this.context;
    let firstDay = null;
    let lastDay = null;

    const data = {
      brand: '',
      category: '',
      location_id: context.headerLocationId,
      supplier_id:'',
      statusfilter:'',
      max_price: '',
      min_price: '',
      product_name: '',
      from: null,
      to: null,
      user_id: context.commoncookie,
      pageCount: this.state.page ? this.state.page : 0, 
      numPerPage:  20,
      purchase_status : this.state.selectedPurchaseStatus,
      searchString:'',
      sub_company_id : 'All'
    };


    if (shouldFetch && this.isHeaderLocationReady(context.headerLocationId)) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPurchasesPaginateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      );
    }
    this.setState({
      from: firstDay,
      to: lastDay,
      dateRange : null,
      filtedValue: {
        name: '',
        brand: '',
        category: '',
        location_id: 'null',
        supplier_id:'',
        statusfilter:'',
        max_price: '',
        min_price: '',
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
    this.setState({filterOpen: false, subcompanyId: 'All'});
  };

  exportValue=()=>{
    const {name, brand, category, location_id,supplier_id,statusfilter, max_price, min_price} = this.state.filtedValue;
    const context = this.context;
   
     const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
      category:
        category !== undefined ? this.commonMapping(category, 'category') : '',
      location_id: context.headerLocationId,
      supplier_id: supplier_id !==undefined ? supplier_id : '' ,
      statusfilter: statusfilter ? statusfilter[0]?.status : '' ,
      max_price: max_price !== undefined ? max_price : '',
      min_price: min_price !== undefined ? min_price : '',
      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
       from:
         this.state.from
           ? moment(this.state.from).format('YYYY-MM-DD')
           : null,

       to:
         this.state.to
           ? moment(this.state.to).format('YYYY-MM-DD')
           : null,
      user_id: context.commoncookie,
      pageCount:this.state.page,
      numPerPage:this.props.paginationCount,
      purchase_status : this.state.selectedPurchaseStatus,
      searchString:this.state.searchVal,
      sub_company_id : this.state.subcompanyId
    };
    return data;
  }

  ApplyButton = async (formData) => {
    const {name, brand, category, location_id,supplier_id,statusfilter, max_price, min_price} = formData;
    const context = this.context;
    this.setState({filtedValue: formData,searchVal: ''});

    // const data={product_name: name !== undefined ? this.commonMapping(name,"name") : '', brand: brand !== undefined ? this.commonMapping(brand,"brand") : '',category: category !== undefined ? this.commonMapping(category,"category") : '',location_id: location_id !== undefined ? this.commonMapping(location_id,"location_id") : context.headerLocationId,user_id:context.commoncookie,max_price: max_price !== undefined ? max_price : '',min_price: min_price !== undefined ? min_price : '',pageCount:0,
    // numPerPage:  pageSize}
    // this.props.listInventoryByIdAction(data,context.commoncookie,context.headerLocationId,context.setModalTypeHandler,context.setLoaderStatusHandler)
    const data = {
  brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
  category: category !== undefined ? this.commonMapping(category, 'category') : '',
  location_id:
    location_id !== undefined
      ? this.commonMapping(location_id, 'location_id')
      : context.headerLocationId,
  supplier_id: supplier_id !== undefined ? supplier_id : '',
  statusfilter: statusfilter !== undefined ? this.commonMapping(statusfilter, 'status') : '',
  max_price: max_price !== undefined ? max_price : '',
  min_price: min_price !== undefined ? min_price : '',
  product_name: name !== undefined ? this.commonMapping(name, 'name') : '',

  from: this.state.from ? moment(this.state.from).format('YYYY-MM-DD') : null,
  to: this.state.to ? moment(this.state.to).format('YYYY-MM-DD') : null,

  user_id: context.commoncookie,
  pageCount: this.state.page ? this.state.page : 0,
  numPerPage: this.state.pageSize,
  purchase_status: this.state.selectedPurchaseStatus,
  searchString: this.state.searchVal,
  sub_company_id: this.state.subcompanyId
};

    this.setState({page: 0});

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listPurchasesFilterAction(
      //   data,
      //   context.commoncookie,
      //   context.headerLocationId,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // )
      this.props.listPurchasesPaginateAction(
        data,
        context.commoncookie,
        context.headerLocationId,
        context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      )
	  );

    this.setState({filterOpen: false});
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page:0, isApiFinished: false});

    if(val.length >= 3 || val.length === 0){
      this.props.set_searchPurchaseAction({data:[], numRows:0})
    }

    const data = {
      ...this.exportValue(), ...{
        pageCount: 0,
        numPerPage: this.state.pageSize, pageType: this.state.pathType,searchString:val
      },
      location_id: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.debouncedListPurchasePaginateAction(data, context)
).finally(() => this.setState({isApiFinished: true}))
  };

  cancelSearch = () => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: '', isApiFinished: false});
      this.props.set_searchPurchaseAction({data:[], numRows:0})
      const data = {
        brand: '',
        category: '',
        location_id: context.headerLocationId,
        supplier_id:'',
        statusfilter:'',
        max_price: '',
        min_price: '',
        product_name: '',
        from: null,
        to: null,
        user_id: context.commoncookie,
        pageCount: this.state.page ? this.state.page : 0, 
        numPerPage:  20,
        purchase_status : this.state.selectedPurchaseStatus,
        searchString:'',
        sub_company_id : this.state.subcompanyId
      };
  
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPurchasesPaginateAction(
          data,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        ),
    ).finally(() => this.setState({isApiFinished: true}))
    // console.log("fggs",this.searchVal);
  };

  // getSalesDataById = async (data) =>{
  //   const { sale_id, receiving_id, customer_id, supplier_id } = data

  //   if (receiving_id !== null && typeof receiving_id !== 'undefined' && supplier_id !== null) {
     
  //     let arr = this.props.searchPurchaseData?.length > 0 || this.state.searchVal.length > 0 ? this.props.searchPurchaseData : this.props.purchasesByPagination
  //     let getData = await arr.find(f => f.receiving_id === receiving_id)
  //     let custData = await this.props.vendor.find(f => f.supplier_id === supplier_id)
  //     if (Object.keys(getData).length && Object.keys(custData).length) {

  //       const salesItems = getData.receivings_items.map((s, i) => {
  //         const taxes = this.props.product.find((f) => f.item_id === s.item_id);
  //         return { ...s, quantity: s.return_quantity, taxes: taxes.taxes }
  //       })
  //       this.setState({
  //         cnPopupData: {
  //           invoice: data.sequence_number,
  //           custData: custData,
  //           custType: 'VENDOR',
  //           soDate: getData.invoice_date,
  //           sales_items: salesItems.filter(f => f.return_quantity && f.return_quantity > 0),
  //           customer_id: getData.supplier_id,
  //           sale_id: getData.receiving_id,
  //           note: data.description,
  //           sales_payments: [],
  //           invoice_date: data.created_at,
  //           total: data.amount,
  //           custLedgerId: custData.ledger_id,
  //           Dopen: true,
  //         }
  //       })
  //     }
  //   }
  //   else  {
  //     ''
  //   }
  // }

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
  reviveLayout = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(this.reviveLayout);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          return [key, this.reviveLayout(value)];
        })
      );
    }
    if (typeof obj === 'string' && obj.trim().startsWith('(') && obj.includes('=>')) {
      return eval(`(${obj})`);
    }
    return obj;
  }
   handlePrint = () =>{
    try {
      const base64 = this.props.po_temp.pdfBase64

      const byteChars = atob(base64)
      const byteNumbers = new Array(byteChars.length)

      for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const blobUrl = URL.createObjectURL(blob)

      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = blobUrl
      document.body.appendChild(iframe)

      iframe.onload = () => {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
      }
    } 
    catch (err) {
        console.error('Print error:', err)
    }
    // try{
    //   pdfMake.fonts = {
    //     Poppins: {
    //       normal:   'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    //       bold:     'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    //       italics:  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
    //       bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
    //     }
    //   }
    //   let data = this.reviveLayout(this.props.po_temp)
    //   pdfMake.createPdf(data).getBase64((base64Pdf) => {
    //     function base64ToBlob(base64, mimeType) {
    //      const byteChars = atob(base64);
    //      const byteNumbers = new Array(byteChars.length);
    //      for (let i = 0; i < byteChars.length; i++) {
    //        byteNumbers[i] = byteChars.charCodeAt(i);
    //      }
    //      const byteArray = new Uint8Array(byteNumbers);
    //      return new Blob([byteArray], { type: mimeType });
    //    }
       
    //    // 2. Generate Blob and object URL
    //    const pdfBlob = base64ToBlob(base64Pdf, 'application/pdf');
    //    const blobUrl = URL.createObjectURL(pdfBlob); 
       
    //    // 3. Create hidden iframe and print
    //    const iframe = document.createElement('iframe');
    //    iframe.style.display = 'none';
    //    iframe.src = blobUrl; // blob URL same origin
    //    document.body.appendChild(iframe);
       
    //    iframe.onload = () => {
    //      iframe.contentWindow.focus();
    //      iframe.contentWindow.print(); 
    //    };
    //    });
    // }catch(err){
    //  return err
    // }
  }
  handleDownload = () =>{
    try {
      const base64 = this.props.po_temp.pdfBase64

      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-')

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `PO-${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } 
    catch (err) {
        console.error('Download error:', err)
    }
  }
  

  render() {
    const { pathname } = this.props.location;

    const {cnPopupData,debitSequence} = this.state;
    const supplierData = this.props.vendor.filter(d => d.supplier_id !== 'undefined');
    const supplierIndex = supplierData.findIndex(c => c.supplier_id ===this.state.setData?.supplier_id);

    let openData = {
      rowIndex: supplierIndex,
      sales_customer_id: this.state.setData.supplier_id,
      routeFrom: "PAYABLES",
      payable: "payable",
      mail_configuration: this.props.mail_configuration,
      setOnbackClick: false,
      backToSales: this.rowPopupClose1,
      purchaseOrder: "purchaseOrder"
    };


      const selectedRole = this.storage.role_name
      const purchaseOrderCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__purchase_orders', 'can_create')
      const purchaseOrderEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__purchase_orders', 'can_edit')
      const purchaseOrderExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__purchase_orders', 'can_export')
      const purchaseOrderDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__purchase_orders', 'can_delete')
      const purchaseOrderConvertToBills = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__bills', 'can_create')
    
      const billsCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__bills', 'can_create')
      const billsExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__bills', 'can_export')
      const billsDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__bills', 'can_delete')

      const payableCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__payments', 'can_create')

      const createBtn = pathname.includes('/sales/purchasesOrders') ? purchaseOrderCreate : pathname.includes('/sales/bills') ? billsCreate : true
      const deleteBtn = pathname.includes('/sales/purchasesOrders') ? purchaseOrderDelete : pathname.includes('/sales/bills') ? billsDelete : true
      const exportBtn = pathname.includes('/sales/purchasesOrders') ? purchaseOrderExport : pathname.includes('/sales/bills') ? billsExport : true

    
        // let storage = getsessionStorage()
        // const { user_rights } = this.props;
        //     let AddRights = true;
        //     let DeleteRights = true;
        
        //     if (storage?.company_type === 3) {
        //       if (pathname.includes('/sales/purchasesOrders')) {
        //         AddRights = getRoleAuthorization(user_rights, 'POAdd');
        //         DeleteRights = getRoleAuthorization(user_rights, 'PODelete');
        //       } else if (pathname.includes('/sales/bills')) {
        //         AddRights = getRoleAuthorization(user_rights, 'BillsAdd');
        //         DeleteRights = getRoleAuthorization(user_rights, 'BillsDelete');
        //       }
        //     }
    return (
      <>
        <Helmet>
                  <meta charSet="utf-8" />
                  <title> {titleURL} |
                  {pathname === "/sales/bills" ? " Purchases" : " Purchases Orders"} </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
         {({setModalStatusHandler, setModalTypeHandler, drawerOpen, setLoaderStatusHandler, commoncookie, headerLocationId}) => (
         <div
         // style={
         //   this.state.status
         //     ? {}
         //     : {
         //         width: this.context.drawerOpen
         //           ? 'calc(100vw - 330px)'
         //           : 'calc(100vw - 143px)',
         //       }
         // }
         >

           {this.state.onrowclick === true ? (
                                 //  <App
                                 //    // statementOfAccount={Get_customer_statement}
                                 //    rowIndex={this.state.setData.supplier_id}
                                 //    handleEdit={false}
                                 //    backToSales={this.rowPopupClose1}
                                 //    handleDelete={false}
                                 //    type={'supplier'}
                                 //    mail_configuration={this.props.mail_configuration}
                                 //    customertype = {2}
                                 //    setEditfind={false}
                                 //    setOnbackClick={false}
                                 //    employeeSetState={false}
                                 //    purchaseOrder = {'purchaseOrder'}
                                 //    customerid={this.state.setData.supplier_id}
                                 //  />

                                 //  <ContactPage
                                 //     rowIndex={supplierIndex}
                                 //     sales_customer_id = {this.state.setData.supplier_id}
                                 //     routeFrom = {"PAYABLES"}
                                 //     payable = {'payables'}
                                 //     mail_configuration={this.props.mail_configuration}
                                 //     setOnbackClick={false}
                                 //     backToSales={this.rowPopupClose1}
                                 //     purchaseOrder = {'purchaseOrder'}
                                 //     />
                                 (OpenCustomerLandingPage(openData))
                                )
                                :
                                <>

           <AlertDialog
             delete={this.state.delete}
             handleClose={this.handleClose}
             handleDelete={this.handleDelete}
             id={this.state.id}
             checkBox={this.state.checkBox}
             setCheckBox={this.setCheckBox}
             type={'Purchase'}
           ></AlertDialog>
           {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
           <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
             {this.state.dialog.msg}
           </Alert>
         </Snackbar> */}

             <IndexForStockReturn
               appConfigData={this.state.appConfigData}
               createMail={this.createMail}
               custType={'VENDOR'}
               custData={cnPopupData.custData}
               invoice={cnPopupData.invoice}
               soDate={cnPopupData.soDate}
               sales_items={cnPopupData.sales_items === undefined ? cnPopupData.itemsData : cnPopupData.sales_items}
               open={cnPopupData.Dopen}
               handleClose={() =>{
                this.handlecnClose();
                this.setState({
                  cnPopupData: {...cnPopupData, Dopen: false},
                  open: false,
                })}
               }
               note={cnPopupData.note}
               debitSequence={debitSequence}
             />

           {this.state.open === false && this.state.rowPopup.open === false && (
             <MaterialTable
               // totalCount={
               //   this.state.searchVal
               //     ? this.state.searchPageData.length
               //     : this.props.paginationCount || 0
               // }
               totalCount={this.props.paginationCount}
               style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
               components={{
                ...stickyTableComponents,
                 Pagination: (props) => (
                  <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                     padding: "8px 16px",
                     }}>
                      <TablePagination
                      {...props}
                      count={this.props.paginationCount || 0} 
                      page={this.state.page || 0}
                      rowsPerPage={this.state.pageSize || 20}
                      onPageChange={(event, page) => this.handlePageChange(page)}
                      onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                      </div>),
                 Toolbar: (props) => (
                   <>
                     <div
                       style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                       }}
                     >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>

                       <div style={{ flexGrow: 1 }}>
                         <MTableToolbar {...props} />
                       </div>
                     
 {pathname === "/sales/bills" &&
                     <Box sx={{ display : 'flex', columnGap : '5px', overflow : 'auto', scrollbarWidth : 'none', marginX : '10px' }}>
                       {
                         this.state.allPurchaseStatus.map((status, index) => (
                           <Chip 
                             key = {index}
                             label = {status}
                             variant = {status === this.state.selectedPurchaseStatus ? 'filled' : 'outlined'}
                             onClick = {() => this.setState({ selectedPurchaseStatus : status })}
                             color = 'primary'
                           />
                         ))
                       }
                     </Box>
                     }
                       </div>

                       <div>
                           <CommonSearch
                             searchVal={this.state.searchVal}
                             cancelSearch={this.cancelSearch}
                             requestSearch={this.requestSearch}
                           />
                       </div>
                     </div>
                   </>
                 ),
                //  Pagination: (props) => (
                //    <div
                //      style={{
                //        display: 'flex',
                //        justifyContent: 'flex-end',
                //        borderTop: 'none',
                //        boxShadow: 'none',
                //        padding: '8px 16px',
                //        borderBottom: 'none',
                //      }}
                //    >
                //      <TablePagination
                //        {...props}
                //        style={{
                //          borderTop: 'none',
                //          borderBottom: 'none',
                //          boxShadow: 'none',
                //          width: 'auto',
                //        }}
                //      />
                //    </div>
                //  ),
               }}

               actions={[
                 // {
                 //   icon: 'edit',
                 //   tooltip: 'edit',
                 //   position: 'row',
                 //   onClick: (event, rowData) => this.handleEdit(rowData.receiving_id)
                 // },

                 {
                   icon: 'add',
                   tooltip: 'add',
                   isFreeAction: true,
                   hidden: !createBtn,
                   onClick: (event, rowData) =>{
                     this.setState({
                       open: true,
                       status: 'create',
                       isPrint: false,
                       returnState: false,
                       edit_data:{}
                     }),
                     this.handleMailConfiguration()

                   }
                 },

                 {
                   icon: () => (
                     <div style={{display: 'flex'}}>
                       <FilterPurchases
                         fromTo={true}
                         from={this.state.from}
                         to={this.state.to}
                         stocklocation={this.props.stocklocation}
                         // product={this.props.product}
                         // inventory_product={this.props.inventory_product}
                         // vendor={this.props.vendor}
                         statusfilter={this.props.searchPurchaseData?.length > 0 || this.state.searchVal.length > 0 ? this.props.searchPurchaseData : this.props.purchasesByPagination}
                         handleChange={this.handleChange}
                         handleFilterClose={this.handleFilterClose}
                         open={this.state.filterOpen}
                         ApplyButton={this.ApplyButton}
                         clearButton={this.clearButton}
                         filterHandler={this.filterHandler}
                         filtedValue={this.state.filtedValue}
                         setFiltedValue = {(data) => this.setState({filtedValue:data})}
                         dateRange = {this.state.dateRange}
                         subcompanyId = {this.state.subcompanyId}
                       />
                     </div>
                   ),
                   tooltip: 'Filter',
                   isFreeAction: true,
                 },

                 ...(purchaseOrderConvertToBills
                   ? [
                     (rowData) => {
                       if (window.location.pathname === '/sales/bills') return null;

                       return {
                         icon: () => (
                           <ArticleIcon
                             color={rowData.status === 'Billed' ? 'success' : 'error'}
                           />
                         ),
                         tooltip: 'Receive Goods',
                         onClick: (event, rowData) => {
                           this.handleEdit(rowData);

                           setTimeout(() => {
                             this.setState({
                               rowPopup: {
                                 ...this.state.rowPopup,
                                 open: false,
                               },
                             });
                           }, 0);
                         },
                         disabled: rowData.status === 'Billed',
                       };
                     },
                   ]
                   : []),

                 ...((pathname === "/sales/bills" && payableCreate)
                 ? [ (rowData) => ({
                   icon: () =>
                     +rowData.paid_amount >= +rowData.total ? (
                       <AccountBalanceWalletIcon color='success' />
                     ) : (
                       <AccountBalanceWalletIcon color='warning' />
                     ),
                   tooltip: 'Make Payment',
                   // onClick: (event, rowData) => rowData.invoice_number !== "" ? this.pendingPayment(rowData) : null,
                   // disabled:
                   //   +rowData.paid_amount >= Math.round(+rowData.total) ? true : false,
                   onClick: (event, rowData) => {
                     if(rowData.invoice_number === "") {
                       return null
                     }

                     const isFullyPaid = Math.round(+rowData.paid_amount) === Math.round(+rowData.total)
                     const partialReturn = rowData.status === 'Return'
                     const isAllReturned = rowData.receivings_items.every(item => item.received_quantity === item.return_quantity)
                     this.setState({selected: rowData.receiving_id})
                     if(!(isFullyPaid)) {
                       return this.pendingPayment(rowData)
                     }
                     return null
                   }
                 }),
               ]
               : []),

                 (rowData) => {
                   const isDisabled = !deleteBtn || this.isDelete(rowData.status) || (pathname === "/sales/bills" && rowData.updated_status === '"Partially Returned"');

                   return {
                     icon: 'delete',
                     tooltip: 'Delete',
                     // iconProps: {
                     //   style: {
                     //     cursor: isDisabled ? "default" : "pointer",
                     //     color:  "#757575",
                     //   },
                     // },
                     disabled: isDisabled,
                     onClick: (event, rowData) => {
                       if (isDisabled) return;
                       this.handledialog(rowData);
                     },
                   };
                 },
                 ...(pathname === "/sales/bills"
                   ? [(rowData) => ({
                     icon: 'visibility',
                     tooltip: 'Print Labels',
                     onClick: () => this.openLabelPreview(rowData),
                   }),
                   ]
                   : []),

               ]}
                   options={getStickyTableOptions({
                    headerStyle,
                    cellStyle,
                    bodyOffset: 200,
                    options:{
                      showEmptyDataSourceMessage: this.state.isApiFinished,
                       search: false,
                    exportButton: exportBtn ? true : false,
                 filtering: false,
                 pagination: true,
                 rowStyle: { height: '40px' },
                 pageSize: this.state.pageSize,
                 pageSizeOptions: [20, 50, 100],
                 totalCount: this.props.paginationCount,
                 actionsColumnIndex: -1,
                 tableLayout: "auto",
                 toolbar: true,
                 exportMenu:  exportBtn ?[
                   {
                     label: 'Export PDF',
                     exportFunc: (cols, datas) =>
                     {
                       apiCalls(
                         setModalTypeHandler,
                         setLoaderStatusHandler,
                         this.props.listPurchasesFilterAction(  
                           this.exportValue(),
                           commoncookie,
                           headerLocationId,
                           setModalTypeHandler,
                           setLoaderStatusHandler,               
                         (exportData) => {
                           ExportPdf(
                             cols,
                             exportData,
                             'PurchaseData',
                           );
                         },
                       )
                       )
                     }
                   },
                   {
                     label: 'Export CSV',
                     exportFunc: (cols, datas) =>
                     {
                       apiCalls(
                         setModalTypeHandler,
                         setLoaderStatusHandler,
                         this.props.listPurchasesFilterAction(  
                           this.exportValue(),
                           commoncookie,
                           headerLocationId,
                           setModalTypeHandler,
                           setLoaderStatusHandler,               
                         (exportData) => {
                           ExportCsv(
                             cols,
                             exportData,
                             'PurchaseData',
                           );
                         },
                       )
                       );
                     }
                   },
                  ] : [],
                    },
                   })
                 
                 
                
               }
               onRowClick={(evt, rowData) => {
                 const context = this.context;
                 const selectedLocationId = rowData.location_id;
                 // if (context.headerLocationId !== selectedLocationId) {
                 // this.setState({openAlert:true})
                 //   return;
                 // }
                 this.setState({customer_data : {company_name: rowData.company_name, email: rowData.email, phone_number: rowData.phone_number, 
                   city: rowData.city, state: rowData.state, zip: rowData.zip, tax_id: rowData.tax_id, address: rowData.address, area: rowData.area, locationId : selectedLocationId
                   }, selectedRow: rowData});
                   const initialLength = this.props.purchasesByPagination.length
                   const searchLength = this.props.searchPurchaseData.length
                   // console.log(this.props.searchPurchaseData.length,'asd4534534rwerwe',this.props.purchasesByPagination.length,initialLength < searchLength)
                   const checkLength = searchLength > 0 ? this.props.searchPurchaseData :  this.props.purchasesByPagination 
                   const index = pathname === "/sales/bills" ? checkLength.findIndex(item => item.receiving_id === rowData.receiving_id) : checkLength.findIndex(item => item.po_id === rowData.po_id);

                 this.setState({
                   rowPopup: {
                     open: true,
                     rowIndex: index,
                     receivings_items: rowData.receivings_items,
                   },
                 });
               }}
               page={this.state.page}
               onPageChange={(page) => this.handlePageChange(page)}
               onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
               columns={[
                 {
                   title: pathname === "/sales/bills" ? 'Bill#' : 'PO Number',
                   field: pathname === "/sales/bills" ? 'bill_number' : 'po_number',
                   render: (rowData) => (
                     <div
                       style={{
                       textDecoration: 'none',
                       cursor: 'pointer',
                       color: '#03adfc',
                       display: 'inline-block',
                       padding: '5px',
                       }}
                       
                       onClick={(event) => {
                         const context = this.context;
                         // if(context.headerLocationId !== 'null'){
                           event.stopPropagation();
                           this.handlePO(rowData);
                           setTimeout(() => {
                           this.setState({rowPopup: {open: false}});
                         }, 0);
                         // }
                       }
                       }
                     >
                       {pathname === "/sales/bills" ? rowData.bill_number : rowData.po_number}
                     </div>
                   ),
                 },
                 ...(this.state.selectedPurchaseStatus !== "New"
                   ? [{ title: 'Invoice#', field: 'invoice_number' }]
                   : []),
                 {
                   title: 'Date', 
                   field: 'po_date',
                   render: (rowData) => {
                     return pathname === "/sales/bills" ? rowData.billed_on : rowData.po_date
                   }
                 },
                 {
                   title: 'Vendor',
                   field: 'company_name',
                   render : (rowData) =>(
                      <Link
                        onClick={(event) => {
                          event.stopPropagation();
                          this.handleCustomerDetail(rowData);
                        }}
                        style={{
                          textDecoration: 'none',
                          cursor: 'pointer',
                          color: '#03adfc',
                          display: 'inline-block',
                        }}
                      >
                        {rowData.company_name}
                      </Link>
                   )
                   // render: (rowData) => (<>
                   //   {rowData.debit_type === "D" && rowData.debit_receiving_id !== null ?
                   //     <div
                   //       style={{
                   //         cursor: 'pointer',
                   //         textDecoration: 'underline',
                   //       }}
                   //       onClick={(event) => {
                   //         this.getSalesDataById(rowData);
                   //         event.stopPropagation();
                   //       }}
                   //     >
                   //           {rowData.company_name}
                   //     </div>
                   //     : <div>
                   //      {rowData.company_name}
                   //     </div>
                   //   }
                   // </>
                   // ),
                 },
                 {title: 'Qty', field: pathname === '/sales/bills' ? 'delivered_qty' : 'ordered_qty'},
                 // {title: 'Payment Term', field: 'payment_type'},
                 {
                   title: 'Amount', 
                   field: 'total',
                   // align: 'right', 
                   // cellStyle: { textAlign: 'right',  paddingRight:'10px' }, 
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
                       {parseFloat(rowData.total) || 0}
                     </div>
                   )
                 },
                 ...(this.state.selectedPurchaseStatus !== 'New' ? [
                   {
                     title: 'Due', 
                     field: 'due_amount', 
                     // align: 'right',
                     // cellStyle: { textAlign: 'right',paddingRight:'10px' },
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
                         {rowData.due_amount}
                       </div>
                     )
                   },
                 ] : []),
                 { title: 'Location', field: 'location_name' },
                 ...((pathname === "/sales/bills") ? [{
                   title: 'Status',
                   field: 'updated_status',
                   render: (rowData) => (
                     <div
                       style={{
                         color: rowData.updated_status_color || '#87CEFA',
                         fontWeight: cellStyle?.fontWeight,
                         fontSize: cellStyle?.fontSize,
                       }}
                     >
                       {rowData.updated_status}
                     </div>
                   ),
                 }
                 ] : [])
                 ,
                 ...(this.state.selectedPurchaseStatus === 'New' ? [ 
                   {
                     title: 'Status',
                     field: 'status',
                     render: (rowData) => {
                       const status = rowData.status 

                       let textColor = ''
                       if(status === 'PO Created') {
                         textColor = '#3b81b3'
                       }
                       else if (status === 'Billed') {
                         textColor = '#285c1c'
                       }
                       else {
                         textColor = '#dfc90f'
                       }
                       return (
                         <div
                           style={{
                             color: textColor,
                             ontWeight: cellStyle.fontWeight,
                             fontSize: cellStyle.fontSize,
                           }}
                         >
                           {status}
                         </div>
                       )
                     },
                   },

                 ] : []),
                 // {
                 //   title: '', 
                 //   field: 'product_name',
                 //   export:false,
                 //   width: "0%",
                 //   headerStyle:{width:"0px"},
                 //   render: (rowData) => {
                 //     return <Box  sx={{display: 'none'}}>{rowData.product_name}</Box>;
                 //   },
                 //   customFilterAndSearch: (value, rowData) => {
                 //     let tempString = rowData.product_name.toString().toLowerCase();
                 //     return tempString.indexOf(value.toLowerCase()) != -1
                 //   },
                 // },
                 // {
                 //   title: '', 
                 //   field: 'soldLots',
                 //   export:false,
                 //   width: "0%",
                 //   headerStyle:{width:"0px"},
                 //   render: (rowData) => {
                 //     return <Box  sx={{display: 'none'}}>{rowData.receivings_items?.map(item => item.lots[0]?.lot_number)}</Box>;
                     
                 //   },
                 //   customFilterAndSearch: (value, rowData) => {
                 //     let tempString = rowData.receivings_items?.map(item => item.lots[0]?.lot_number).toString().toLowerCase();
                 //     return tempString.indexOf(value.toLowerCase()) != -1
                 //   },
                 // },
                 // {
                 //   title: 'Receive Goods', field: 'receive_goods',
                 //   render: ,
                 //   cellStyle: {
                 //     textAlign:'center'
                 //   },
                 //   headerStyle:{
                 //     textAlign:'center'
                 //   }
                 // },
                 // {
                 //   title: 'Payment', field: 'payment',
                 //   render: ,
                 //   cellStyle: {
                 //     textAlign:'center'
                 //   },
                 //   headerStyle:{
                 //     textAlign:'center'
                 //   }
                 // }
               ]}
               data={this.props.purchasesByPagination}
               title={
                 <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                 {pathname === "/sales/bills" ? "Bills" : "Purchases Orders"}</Typography>}
             />
           )}
               {this.state.invoice_open === true && (
                 <Dialog
                   fullWidth
                   maxWidth='md'
                   open={this.state.invoice_open}
                   aria-labelledby='alert-dialog-title'
                   aria-describedby='alert-dialog-description'
                   
                 >
                   <DialogContent
                     ref={(el) => (this.componentRef = el)}
                     style={{
                       display: "block",
                       overflow:'hidden'
                     }}
                     // className='tab_screen2'
                   >
                     {/* <Invoice
                       appConfigData={this.state.appConfigData}//true
                       note={''}  //truee
                       custType={'VENDOR'} //truee
                       custData={this.state.customer_data} //true
                       invoice={this.state.edit_data?.po_number} //true
                       soDate={this.state.edit_data?.po_date}   ///truee
                       sales_items={this.state.edit_data?.receivings_items} //true
                       //  posSale={props.posSale}
                       status={this.state.edit_data?.status}
                       total={this.state.edit_data?.total}
                       due_amount={this.state.edit_data?.due_amount}
                       {...this.props}
                       tcs ={this.state.edit_data?.tcs}
                       tds ={this.state.edit_data?.tds}
                       tcspercent ={this.state.edit_data?.tcs_percent}
                       tdspercent ={this.state.edit_data?.tds_percent}
                     /> */}
                     <CommonInvoiceTemplate/>
                   </DialogContent>
                   <DialogActions sx={{ mr: '50px', ml: '35px' }}>
                     <Button
                       variant='outlined'
                       onClick={(e) => {
                         this.setState({ invoice_open: false })
                         this.props.setInvoiceTempAction([])
                       }}
                     >
                       Close
                     </Button>
                     <Button
                       variant='contained'
                       onClick={(e) => {
                         this.createMail();
                       }}
                     >
                       <MailIcon sx={{ mr: 1 }} fontSize='small' /> SEND PO
                     </Button>
                     {/* <ReactToPrint
                       trigger={() => (
                         
                       )}
                       content={() => this.componentRef}
                     /> */}
                     <Button variant='contained' onClick={this.handleDownload}>
                           Download
                         </Button>
                     <Button variant='contained' onClick={this.handlePrint}>
                           {/* <PrintIcon sx={{ mr: 1 }} fontSize='small' /> Print */}Print
                         </Button>
                   </DialogActions>
                 </Dialog>
               )}
               {
                 this.state.open === true && 
                   <Popup
                   // creditSequenceUpdate={this.creditSequenceUpdate}
                   oldSequenceGet={this.oldSequenceGet}
                   cnInvoiceFunction={this.cnInvoiceFunction}
                   returnState={this.state.returnState}
                   isPrint={this.state.isPrint}
                   handleClose={this.handleClose}
                   edit_data={this.state.edit_data}
                   status={this.state.status}
                   sample={this.sample}
                   {...this.props}
                   appConfigData={this.state.appConfigData}
                   from={this.state.from}
                   to={this.state.to}
                   filtedValue={this.state.filtedValue}
                   rowPopupOpen={this.rowPopupOpen}
                   mail_configuration={this.props.mail_configuration}
                   setAppconfigData={this.setAppconfigData}
                   page={this.state.page}
                   pageSize={pageSize}
                   exportValue={this.exportValue}
                   type={'returnFromPurchase'}
                   pageType={this.state.pageType}
                   initialPurchaseProduct={this.state.initialPurchaseProduct}
                   onInitialPurchaseProductConsumed={this.handleInitialPurchaseProductConsumed}
                 />
               }

               {
                 this.state.showLabelDialog === true && 
                     <PurchaseLabelDialog
                       open={this.state.showLabelDialog}
                       onClose={() => this.setState({ showLabelDialog: false })}
                       labelData={this.state.labelData}
                     />
               }

           {
           this.state.paymentOpen && <ReceiptPayments
             paymentOpen={this.state.paymentOpen}
             custType = 'VENDOR'
             handleClose={this.setpaymentOpen}
             editData={{}}
             responseType={'cashOut'}
             sales_items={this.state.itemsData}
             selectedInvoice={this.state.selected}
             selectedCustomer={this.state.getVendor}
           />
           }

           
 <Dialog
         open={this.state.showDialog}
         onClose={this.handleClose}
         // fullScreen={fullScreen}
         maxWidth="sm"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: 3,
             p: 2,
           },
         }}
       >
         <DialogTitle sx={{ fontWeight: 'bold' }}>Notice</DialogTitle>
         <DialogContent>
           <DialogContentText
             sx={{ fontSize: '1rem', color: 'text.secondary' }}
           >
             {this.state.dialogMessage}
           </DialogContentText>
         </DialogContent>
         <DialogActions sx={{ justifyContent: 'flex-end' }}>
           <Button
             onClick={this.handleDeleteClose}
             variant="contained"
             color="primary"
             sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
           >
             OK
           </Button>
         </DialogActions>
       </Dialog>


           {this.state.rowPopup.open && (
             <TopOrder
               cnhandleOpen={this.cnhandleOpen}
               ledgerReturnApi={this.ledgerReturnApi}
               rowIndex={this.state.rowPopup.rowIndex}
               handleEdit={this.handleEdit}
               handleDelete={this.handledialog}
               type={'purchase'}
               receivings_items={this.state.rowPopup.receivings_items}
               handleClose={this.handleClose}
               rowPopupClose={this.rowPopupClose}
               from={this.state.from}
               to={this.state.to}
               filtedValue={this.state.filtedValue}
               responseType={'cashOut'}
               page={this.state.page}
               pageSize={pageSize}
                   exportValue={this.exportValue}
                   searchVal={this.state.searchVal}
                   pathnameType={pathname}
             />
           )}
           <LocationAlert open={this.state.openAlert} onClose={ ()=> this.setState({openAlert:false})}/>
           </>
         }
         </div>
           )}
           </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    purchases: state.purchasesReducer.purchases,
    product: state.productReducer.product,
    pot_code_seq: state.purchasesReducer.pot_code_seq,
    stocklocation: state.stockLocationReducer.stocklocation,
    purchases_id_data: state.purchasesReducer.purchases_id_data,
    // vendor: state.vendorReducer.vendor,
    vendor: state.vendorReducer.vendorIdAndName,
    purchase_outstanding: state.purchasesReducer.purchase_outstanding,
    app_config_data: state.appConfigReducer.app_config_data,
    app_config_data_based_on_type: state.appConfigReducer.app_config_data_based_on_type,
    chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    loginToken: state.UserRoleReducer.loginToken,
    loginRole: state.UserRoleReducer.loginToken,
    // credit_debit_seq: state.salesReducer.credit_debit_seq,
    purchases_filter: state.purchasesReducer.purchases_filter,
    mail_configuration: state.ConfigurationReducer.mail_configuration,
    createUser: state.UserCreationReducer.createUser || [],
    purchasesByPagination:state.purchasesReducer.purchasesByPagination || [],
    paginationCount: state.purchasesReducer.purchasesByPaginationCount,
    searchPurchaseData: state.purchasesReducer.searchPurchaseData,
    searchPurchaseCount: state.purchasesReducer.searchPurchaseCount,
    inventory_product: state.productReducer.inventory_product,
    po_temp: state.vendorReducer.po_temp || [],
    billsModel: state.purchasesReducer.billsModel,
    poModel: state.purchasesReducer.poModel,
    // user_rights : state.roleReducer.user_rights || [],
    getbillingcompanydetails: state.salesReducer.getbillingcompanydetails,
    menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listPurchasesPaginateAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      editReceivingId
      
    ) => {
      return dispatch(
        listPurchasesPaginateAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          editReceivingId
        ),
      );
    },
    get_searchPurchaseAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchPurchaseAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    set_searchPurchaseAction: (val ) => { return dispatch(set_searchPurchaseAction(val));
    },
    listStockLocationSequenceAction: (
      data,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
    ) => {
      dispatch(
        listStockLocationSequenceAction(
          data,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
        ),
      );
    },
    createPurchasesAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      mailData,
      insertId,
      resStatus,
      commoncookie,
      headerLocationId,
      setDisable,
      bodyData,
    ) => {
      dispatch(
        createPurchasesAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          mailData,
          insertId,
          resStatus,
          commoncookie,
          headerLocationId,
          setDisable,
          bodyData,
        ),
      );
    },
    getbyidPurchasesAction: (id, setLoaderStatusHandler) => {
      dispatch(getbyidPurchasesAction(id, setLoaderStatusHandler));
    },
    getBillingcompany: () => {
      dispatch(getBillingcompany());
    },
    updatePurchasesAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      insertId,
      sample,
      mailData,
      employee_id,
      headerLocationId,
      bodyData,
    ) => {
      dispatch(
        updatePurchasesAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          insertId,
          sample,
          mailData,
          employee_id,
          headerLocationId,
          bodyData,
        ),
      );
    },
    deletePurchasesAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
      callBack,
    ) => {
      dispatch(
        deletePurchasesAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
          callBack,
        ),
      );
    },
    // listVendorAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(listVendorAction(setModalTypeHandler, setLoaderStatusHandler));
    // },
    listVendorIdAndNameAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listVendorIdAndNameAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    paymentEntry: (
      data,
      body,
      employee_id,
      headerLocationId,
      setLoaderStatusHandler,
      response,
    ) => {
      dispatch(
        paymentEntry(
          data,
          body,
          employee_id,
          headerLocationId,
          setLoaderStatusHandler,
          response,
        ),
      );
    },
    paymentview: (
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      dispatch(
        paymentview(
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    posSequence: (id, data, setLoaderStatusHandler) => {
      dispatch(posSequence(id, data, setLoaderStatusHandler));
    },
    getAppConfigDataBasedOnTypeAction: (type) => {
      dispatch(getAppConfigDataBasedOnTypeAction(type));
    },
    potCodeAction: (id) => {
      dispatch(potCodeAction(id));
    },
    receivingsPayments: (id, data, response, setLoaderStatusHandler) => {
      dispatch(receivingsPayments(id, data, response, setLoaderStatusHandler));
    },
    listChartOfAccountsdataAction: () => {
      dispatch(listChartOfAccountsdataAction());
    },
    chartOfAccountsIdNameAction: (body, setData) => {
      dispatch(chartOfAccountsIdNameAction(body, setData));
    },
    createTransactionAction: (data, dd, setLoaderStatusHandler) => {
      dispatch(createTransactionAction(data, dd, setLoaderStatusHandler));
    },
    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },
    returnActions: (
      data,
      setLoaderStatusHandler,
      employee_id,
      headerLocationId,
      callback
    ) => {
      dispatch(
        returnActions(
          data,
          setLoaderStatusHandler,
          employee_id,
          headerLocationId,
          callback
        ),
      );
    },
    creditDebitNoteSeq: (type) => {
      dispatch(creditDebitNoteSeq(type));
    },
    creditDebitNoteSeqUpdate: (type, data) => {
      dispatch(creditDebitNoteSeqUpdate(type, data));
    },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    listProductAction: () => {
      dispatch(listProductAction());
    },
    InventoryProductAction: () => {
      dispatch(InventoryProductAction());
    },
    purchaseProductListAction: () => {
      return dispatch(purchaseProductListAction());
    },
    CreateNotificationAction:(data) => {
      dispatch(CreateNotificationAction(data))
    },
    listPurchasesFilterAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
     return dispatch(
        listPurchasesFilterAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    getByIdMailConfigurationAction:(mail_name,role_id) => {
      return dispatch(getByIdMailConfigurationAction(mail_name,role_id))
    },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getPayablesBySupplierIdAction: (employee_id,headerLocationId,supplierId, setPaybleData) => {
      return dispatch(
        getPayablesBySupplierIdAction(employee_id,headerLocationId, supplierId, setPaybleData),
      );
    },
    getSupplierDetailsByIdAction: (supplier_id, setSupplierDetails) => {
      return dispatch(
        getSupplierDetailsByIdAction(supplier_id, setSupplierDetails),
      );
    },
    getSupplierDetailsByIdreceivings_itemsAction: (supplier_id,data) => {
      return dispatch(
        getSupplierDetailsByIdreceivings_itemsAction(supplier_id,data),
      );
    },
    searchPaginationAction: (data) => {
      return dispatch(
        searchPaginationAction(data),
      );
    },
    getManualNoteSchemesByIdAction: (type, id, response) => {
      return dispatch(
        getManualNoteSchemesByIdAction(type, id, response),
      );
    },
    customerAsCompanyAction: () => {
      dispatch(customerAsCompanyAction())
    },
     setTriggerBillsModel:(data)=>{
          dispatch(triggerBillsModel(data))
        },
    setTriggerPOsModal:(data)=>{
      dispatch(triggerPOsModal(data))
    },
    setInvoiceTempAction:(data)=>{
      dispatch(setInvoiceTempAction(data))
    },
    getUserRightsByRoleIdAction:()=>{
      dispatch(getUserRightsByRoleIdAction())
    },
    OpenalertActions:(data)=>{
      dispatch(OpenalertActions(data))
    },
      getMenuAccessAction:(selectedRole)=>{
          dispatch(getMenuAccessAction(selectedRole))
        },
  };
};

export default withLocation(connect(mapStateToProps, mapDispatchToProps)(Product));

