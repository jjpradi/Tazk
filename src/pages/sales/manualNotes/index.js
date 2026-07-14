import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewManualNotes from '../../../components/NewManualNotes';
import CreditDebitNoteTemplate from './creditDebitNoteTemplate'
import {
  manualNotesCreationAction,
  listManualNotesAction,
  deleteManualNoteAction,
  deleteAllManualNotesAction,
  updateManualNotesAction,
  sequenceAction,
  listManualNotesPaginationAction,
  ManualSalesPurchase,
  cancelManualIrnAction
} from '../../../redux/actions/manualNotes_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {customerAsCompanyAction, getbyidCustomerAction, listCustomerAction} from '../../../redux/actions/customer_actions';
import FilterManualNotes from './filterManualNotes';
import moment from 'moment';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import {
  TableContainer,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Table,
  IconButton,
  Typography,
  Box,
  Collapse,
  Grid,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Link,
  ListItem,
  ListItemText,
  List,
  Tabs,
  Tab,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Input from '@mui/material/Input';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import {posSequence} from '../../../redux/actions/purchase_actions';
import {
  dcreturnActions,
  listSalesAction,returnActions,sendMail} from '../../../redux/actions/sales_actions'
  import {
    getStickyTableOptions,
    stickyTableComponents,
  } from 'utils/stickyTableLayout';
import {getAppConfigDataAction, getAppConfigDataBasedOnTypeAction} from '../../../redux/actions/app_config_actions';
import CnDialog from '../sales/cn_invoice';
import {listProductAction} from '../../../redux/actions/product_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import ClearIcon from '@mui/icons-material/Clear';
import { get_searchCreditdebitAction, set_searchCreditdebitAction } from 'redux/actions/paymentReceipt_actions';
import CommonSearch from 'utils/commonSearch';
import { getSupplierDetailsByIdAction, getbyidVendorAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import CreditNotesDetails from './CreditNotesDetails';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate';
import NewManualNotesForm from 'components/Sales/NewManualNotesForm';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import ListItemIcon from '@mui/material/ListItemIcon';
import NewSalesForm from 'components/Sales/NewSalesForm';
import SalesReturn from 'pages/sales/sales/SalesReturn';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
class ManualNotes extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    this.state = {
      open: false,
      returnOpen: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      deleteDialogOpen: false,
      deleteAllDialogOpen: false,
      deleteNoteId: '',
      deleteAllId: '',
      deleteAllType: '',
      filteredValue: {
        from: this.firstDay,
        to: this.lastDay,
        range : null,
        type: null,
        location_id: null,
        minValue: null,
        maxValue: null
      },
      filterOpen: false,
      status: '',
      collapseOpen: -1,
      computedData: [],
      isEditMode: '',
      inLineEditData: {
        description: '',
        amount: '',
      },
      searchText: '',
      currentPage:0,
      cnPopupData:{
          invoice: '',
          custData: {},
          soDate: '',
          sales_items: [],
          customer_id: '',
          sale_id: '',
          note: '',
          sales_payments: '',
          invoice_date: '',
          total: '',
          custLedgerId: '',
          Dopen: false,
      },
      appConfigData : {},
      searchVal: '',
      searchPageData: [],
      pageSize: 20,
      page: 0,
      templateOpen: false,
      templateData: {},
      isApiFinished: false,
      openAlert: false,
      rowData: [],
      detailsOpen: false,
      prevHeaderLocationId: this.context?.headerLocationId || null,
      setData : '',
       onrowclick : false,
        modeTab: 'manual',
      cancelIrnDialogOpen: false,
      cancelIrnRowData: null
    };
    this.storage = getsessionStorage()
  }


  async componentDidMount() {
    this.props.set_searchCreditdebitAction({data:[], numRows:0})
    const context = this.context;
    const selectedRole = this.storage.role_name
   
    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      type:'C',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listManualNotesPaginationAction(data),
      // this.props.getUserRightsByRoleIdAction(),
      this.props.getMenuAccessAction(selectedRole),
      this.props.listStockLocationAction(context.commoncookie, context.headerLocationId),
      // this.props.listManualNotesAction(
      //   () => { },
      //   () => { },
      //   {
      //     from: moment(
      //       this.state.filteredValue.from,
      //       'year',
      //       'month',
      //       'day',
      //     ).format('yyyy-MM-DD'),
      //     to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format(
      //       'yyyy-MM-DD',
      //     ),
      //   },
      // ),
      // !this.props.sales.length && this.props.listSalesAction(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, this.props.setModalStatusHandler, () => { }),
      // !this.props.product.length && this.props.listProductAction(context.setModalTypeHandler,context.setLoaderStatusHandler),
      // !this.props.customer.length && this.props.listCustomerAction(),
      !this.props.app_config_data.length && this.props.getAppConfigDataAction(),
      // this.props.sequenceAction(() => { }, () => { })
    ).finally(() => this.setState({isApiFinished: true}))

    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  fetchNotes = (includeStockLocation = false) => {
    const context = this.context;

    const data = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from).format('YYYY-MM-DD'),
      to: moment(this.state.filteredValue.to).format('YYYY-MM-DD'),
      type: 'C',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    };

    const actions = [
      this.props.listManualNotesPaginationAction(data)
    ];

    if (includeStockLocation) {
      actions.push(
        this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
      );
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      ...actions
    );
  };


  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;

    if (this.props.manualNotes !== prevProps.manualNotes) {
      this.setState({ computedData: this.props.manualNotes });
    }

    if (prevState.pageSize !== this.state.pageSize) {
      this.fetchNotes();
    }

    if (prevState.page !== this.state.page) {
      this.fetchNotes();
    }

    if(prevState.returnOpen !== this.state.returnOpen && this.state.returnOpen){
      let type = 'sales'
      await this.props.getAppConfigDataBasedOnTypeAction(type)
    }

    if (prevProps.app_config_data_based_on_type !== this.props.app_config_data_based_on_type) {
      this.getAppConfigData();
    }

    if (this.state.prevHeaderLocationId !== context.headerLocationId) {
      this.props.listStockLocationAction(context.commoncookie, context.headerLocationId);

      if (!this.state.open) {
        this.fetchNotes();
      }

      this.setState({ prevHeaderLocationId: context.headerLocationId });
    }
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
    const roundedOffEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyRoundOff')
    const discountEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.saleDiscount')
    const shippingChargesEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyShippingCharges')
    const otherChargesEnabled = app_config_data_based_on_type.filter((f) => f.key_name === 'company.applyOtherCharges')

    this.setState({
      appConfigData: {
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        companyEmail: emailData.length > 0 ? emailData[0].value : '',
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        state: state.length > 0 ? state[0].value : '',
        roundedOffEnabled: roundedOffEnabled.length ? roundedOffEnabled[0].value : 'false',
        discountEnabled: discountEnabled.length > 0 ? discountEnabled[0].value : 'No Discount',
        shippingChargesEnabled: shippingChargesEnabled.length > 0 ? shippingChargesEnabled[0].value : 'false',
        otherChargesEnabled: otherChargesEnabled.length > 0 ? otherChargesEnabled[0].value : 'false'
      },
    });
  };

  exportValue =()=>{
    const context = this.context;
    const data = {
      from: moment(
        this.state.filteredValue.from,
        'year',
        'month',
        'day',
      ).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      type:"C",
       headerLocationId: context.headerLocationId,

    }
    return data;
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      const context = this.context;
      let getId = await this.props.manualNotes
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      console.log(getId,'getId555')
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        await this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
      );
      await this.setState({ edit_id_data: getId, status: 'edit', open: true });
    }
  };
    handleDelete = async (id) => {
      const context = this.context;
      const type='C'
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
       await this.props.deleteManualNoteAction( type,
          id, context.setModalTypeHandler, context.setLoaderStatusHandler)
      );
      this.setState({ delete: false })

      const data = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
        type:'C',
        noteType: this.state.filteredValue.type,
        minValue: this.state.filteredValue.minValue,
        maxValue: this.state.filteredValue.maxValue
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
       await this.props.listManualNotesPaginationAction(data),
      );
    }
  handledialog = (id) => {
   
    this.setState({delete: true, id: id});
  };

  hasIrisManualLink = (rowData) => {
    return Boolean(
      rowData?.has_iris_manual ||
      rowData?.iris_manual_id ||
      rowData?.manual_id
    );
  };

  canEditManualNote = (rowData) => {
    const editableByBusinessRule =
      ((rowData?.invoice_number === null || rowData?.invoice_number === "") &&
        rowData.adjusted_amount === 0);
    return editableByBusinessRule && !this.hasIrisManualLink(rowData);
  };

  canCancelManualIrn = (rowData) => this.hasIrisManualLink(rowData);

  openCancelIrnDialog = (rowData) => {
    this.setState({
      cancelIrnDialogOpen: true,
      cancelIrnRowData: rowData
    });
  };

  closeCancelIrnDialog = () => {
    this.setState({
      cancelIrnDialogOpen: false,
      cancelIrnRowData: null
    });
  };

  handleCancelManualIrn = async () => {
    const context = this.context;
    const rowData = this.state.cancelIrnRowData;
    if (!rowData?.id) return;

    const payload = {
      manual_id: rowData?.id,
      sequence_number: rowData?.sequence_number,
      invoice_number: rowData?.invoice_number || null,
      reason: 'Cancelled from manual notes'
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.cancelManualIrnAction(payload)
    ).then(() => {
      this.closeCancelIrnDialog();
      this.fetchNotes();
    }).catch(() => {
      this.closeCancelIrnDialog();
    });
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
console.log(sales_items,'sales_items');

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
      templateOpen: true
    });
    // await this.ledgerReturnApi(data); this process is changed to Backend

    // For NewData AfterSelesReturnedReload
    this.setState({headerupdate: ''})
  };

  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('cash_box_list', false);
    }
    this.setState({
      open: false,
      status: '',
      dialog: false,
      deleteDialogOpen: false,
      deleteAllDialogOpen: false,
      delete: false,
      detailsOpen: false
    });
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
  handleSubmit = async (data) => {
    const context = this.context;
    if (data.id && data.location_id !== 'null') {
      // data.location_id = context.headerLocationId
      if(data.type === 'C'){
        let sequencename = 'CREDIT NOTE SEQUENCE'
        let sequence_num = this.props.sequence?.find((d)=>d.sequence_name === sequencename)
        let sequence_value = (sequence_num.current_seq)
        let sequence_id = sequence_num.sequence_id
         data.sequence_number = `${sequence_num.short_code}-${sequence_value}`;
         data.sequence_id = sequence_id;
        data.current_seq = sequence_value
        
      
       }
       else{
         let sequencename = 'DEBIT NOTE SEQUENCE'
         let sequence_num = this.props.sequence?.find((d)=>d.sequence_name === sequencename)
         let sequence_value = (sequence_num.current_seq)
         let sequence_id = sequence_num.sequence_id
          data.sequence_number = `${sequence_num.short_code}-${sequence_value}`;
          data.sequence_id = sequence_id;
          data.current_seq = sequence_value
      }
      data.pageCount = this.state.page
      data.numPerPage = this.state.pageSize
      data.searchString = this.state.searchVal
      data.from = this.state.filteredValue.from === null ? null : moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD')
      data.to = this.state.filteredValue.to === null ? null : moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD')
      // data.from = null
      // data.to = null
      const datas = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
        type:'C',
        noteType: this.state.filteredValue.type,
        minValue: this.state.filteredValue.minValue,
        maxValue: this.state.filteredValue.maxValue
      }
      
      try {
        const resp = await this.props.updateManualNotesAction(
          data,
          data.id,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          resp,
          this.props.listManualNotesPaginationAction(datas)
        );
        await this.setState({open: false, status : ''});
      } catch (err) {
        // Keep the edit form open so user can correct; action already toasts.
        throw err;
      }
    } else if (data && data.location_id !== 'null') {
      data.location_id = data.location_id
      if(data.type === 'C'){
       let sequencename = 'CREDIT NOTE SEQUENCE'
       let sequence_num = this.props.sequence?.find((d)=>d.sequence_name === sequencename)
       let sequence_value = (sequence_num.current_seq+1)
       let sequence_id = sequence_num.sequence_id
        data.sequence_number = `${sequence_num.short_code}-${sequence_value}`;
        data.sequence_id = sequence_id;
        data.current_seq = sequence_value
     
      }
      else{
        let sequencename = 'DEBIT NOTE SEQUENCE'
        let sequence_num = this.props.sequence?.find((d)=>d.sequence_name === sequencename)
        let sequence_value = (sequence_num.current_seq+1)
        let sequence_id = sequence_num.sequence_id
         data.sequence_number = `${sequence_num.short_code}-${sequence_value}`;
         data.sequence_id = sequence_id;
         data.current_seq = sequence_value
      }
      data.pageCount = 0
      data.numPerPage = this.state.pageSize
      data.searchString = this.state.searchVal
      data.from = this.state.filteredValue.from === null ? null : moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD')
      data.to = this.state.filteredValue.to === null ? null : moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD')
      // data.from = null
      // data.to = null

      const datas = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
        type:'C',
        noteType: this.state.filteredValue.type,
        minValue: this.state.filteredValue.minValue,
        maxValue: this.state.filteredValue.maxValue
      }
      // Previously: await inlined inside argument list caused a rejection to
      // skip apiCalls + setState entirely, leaving the form open with zero
      // feedback. Now we try/catch so we can surface the error AND decide
      // whether to close the form.
      try {
        const resp = await this.props.manualNotesCreationAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog,
        )
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          resp,
          this.props.listManualNotesPaginationAction(datas)
        );
        await this.setState({open: false, collapseOpen: -1, page:0});
      } catch (err) {
        // Action already shows a toast via commontoast/ErrorAlert. Keep the
        // form open so the user can correct and resubmit — re-throw so the
        // form's own catch also fires for its local loading state.
        throw err;
      }
    }else{
      console.log("Please Select Location!");
      // this.setState({openAlert: true})
    }
  };

   handleCustomerDetail = (rowData)=>{
    // console.log('notworkinggggg')
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


 


  deleteIndividualNote = (id) => {
    const context = this.context;
    const type = 'C'
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteManualNoteAction(
        type,
        id,
        context.setModalTypeHandler,
        context.ExportPdfsetLoaderStatusHandler,
      )
    );
    this.setState({ deleteDialogOpen: false });

    if (!this.props.manualNotes.length === 0) {
      this.setState({ collapseOpen: -1 });
    }
  };


  deleteAllNoteCustomerOrSupplier = () => {
    const type = this.state.deleteAllType;
    const id = this.state.deleteAllId;
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteAllManualNotesAction(
        type,
        id,
        context.setModalTypeHandler,
        context.ExportPdfsetLoaderStatusHandler,
      )
	  );
    this.setState({deleteAllDialogOpen: false});

    if (!this.props.manualNotes.length === 0) {
      this.setState({collapseOpen: -1});
    }
  };

  // handleInlineEdit = (rowData) => {
  //   this.setState({isEditMode: true});
  // };

  handleInLineEditOnChange = (e) => {
    let {name, value} = e.target;
    this.setState({
      inLineEditData: {...this.state.inLineEditData, [name]: value},
    });
  };

  handleUpdateIndividualNote = (rowData) => {
    const context = this.context;
    let resultData = {
      ...rowData,
      description: this.state.inLineEditData.description,
      amount: this.state.inLineEditData.amount,
    };

    this.props.updateManualNotesAction(
      resultData,
      rowData.id,
      context.setModalTypeHandler,
      context.ExportPdfsetLoaderStatusHandler,
    );
    this.setState({isEditMode: -1});
  };

  handleSearchData = (text) => {
    this.setState({searchText: text});
    this.handleFilterData(text);
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
      email: email,
      no_sms: true,
      posSale: true,
      sales_payments: [],
      soDate: soDate,
      sale_id: this.state.cnPopupData.sale_id,
    };
    this.props.sendMail(data, context.setLoaderStatusHandler);
    this.setState({
      cnPopupData: {...this.state.cnPopupData, Dopen: false}
    })
  };


  // getSalesDataById = async (data) =>{
  //   const { sale_id, receiving_id, customer_id, supplier_id } = data
  //   if (sale_id !== null && typeof sale_id !== 'undefined' && customer_id !== null) {
  //     let getData = await this.props.sales.find(f => f.sale_id === sale_id)
  //     let custData = await this.props.customer.find(f => f.customer_id === customer_id)
  //     if (Object.keys(getData).length && Object.keys(custData).length) {

  //       const salesItems = getData.sales_items.map((s, i) => {
  //         const taxes = this.props.product.find((f) => f.item_id === s.item_id);
  //         return { ...s, quantity: s.return_quantity, taxes: taxes.taxes }
  //       })
  //       this.setState({
  //         cnPopupData: {
  //           invoice: data.sequence_number,
  //           custData: custData,
  //           custType: 'CUSTOMER',
  //           soDate: getData.so_date,
  //           sales_items: salesItems.filter(f => f.return_quantity && f.return_quantity > 0),
  //           customer_id: getData.customer_id,
  //           sale_id: getData.sale_id,
  //           note: data.description,
  //           sales_payments: getData.sales_payments || [],
  //           invoice_date: data.created_at,
  //           total: data.amount,
  //           custLedgerId: custData.ledger_id,
  //           Dopen: true,
  //         }
  //       })
  //     }
  //   } else if (receiving_id !== null && typeof receiving_id !== 'undefined' && supplier_id !== null) {
  //     let getData = await this.props.purchases.find(f => f.receiving_id === receiving_id)
  //     let custData = await this.props.customer.find(f => f.supplier_id === supplier_id)
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
  // }

  handleFilterData = (value) => {
    const lowerCaseValue = value.toLowerCase().trim();

    if (!lowerCaseValue) {
      this.setState({computedData: this.props.manualNotes});
    } else {
      const filteredData = this.props.manualNotes.filter((item) => {
        return Object.keys(item).some((key) => {
          if (item[key] !== undefined) {
            return item[key]?.toString().toLowerCase().includes(lowerCaseValue);
          } else {
            return false;
          }
        });
      });

      this.setState({computedData: filteredData});
    }
  };

  handleFilter = (data) => this.setState({filterOpen: data});

  handleChange = (e) => {
    const {value, name} = e.target;
   
    this.setState((prevState) => ({
      filteredValue: {
        ...prevState.filteredValue,
        [name]: value
      }
    }));
  // }
  };

  ApplyButton = () => {
    const context = this.context;

    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD',),
      type:'C',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listManualNotesAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   {
      //     from: moment(
      //       this.state.filteredValue.from,
      //       'year',
      //       'month',
      //       'day',
      //     ).format('yyyy-MM-DD'),
      //     to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format(
      //       'yyyy-MM-DD',
      //     ),
      //   },
      // ),
      this.props.listManualNotesPaginationAction(data),
	  );
    this.setState({filterOpen: false, page : 0, searchVal : ''});
  };
  clearButton = () => {

    const context = this.context;
    
    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: `${this.firstDay.getFullYear()}-${(this.firstDay.getMonth() + 1).toString().padStart(2, '0')}-${this.firstDay.getDate().toString().padStart(2, '0')}`, 
      to: `${this.lastDay.getFullYear()}-${(this.lastDay.getMonth() + 1).toString().padStart(2, '0')}-${this.lastDay.getDate().toString().padStart(2, '0')}`,       
      type:'C',
      noteType: null,
      minValue: null,
      maxValue: null
    }
    this.props.listManualNotesPaginationAction(data),
    this.setState({filteredValue: {from: this.firstDay, to: this.lastDay, type: null, minValue: null, maxValue: null }});
    this.setState({filterOpen: false, page : 0, searchVal : ''});
  };
  setFilter = (data) => this.setState({filteredValue: data});
  // ##########################

  // createCollapsableData = async () => {
  //   let tempManualNote = await this.props.manualNotes;
  //   let tempIndividualNote = await this.props.individualNotes;
  //   let result = tempManualNote.map((item) => {
  //     return {
  //       ...item,
  //       history: tempIndividualNote.filter((note) =>
  //         note.customer_id === null
  //           ? note.supplier_id === item.supplier_id
  //           : note.customer_id === item.customer_id,
  //       ),
  //     };
  //   });

  //   this.setState({computedData: result});
  // };

  // ############################

  // Row = (props) => {
  //   const {groupedNotes, index, customerOrSupplierId} = props;

  //   return (
  //     <React.Fragment>
  //       <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
  //         <TableCell>
  //           <IconButton
  //             aria-label='expand row'
  //             size='small'
  //             onClick={() =>
  //               this.setState({
  //                 collapseOpen: this.state.collapseOpen === index ? -1 : index,
  //               })
  //             }
  //           >
  //             {this.state.collapseOpen === index ? (
  //               <KeyboardArrowUpIcon />
  //             ) : (
  //               <KeyboardArrowDownIcon />
  //             )}
  //           </IconButton>
  //         </TableCell>
  //         {/* <TableCell component='th' scope='row' align='left'>
  //           {groupedNotes.created_at}
  //         </TableCell> */}
  //         <TableCell align='left'>{groupedNotes.name}</TableCell>
  //         {/* <TableCell>{groupedNotes.description}</TableCell> */}
  //         <TableCell align='left'>
  //           {groupedNotes.type === 'C' ? 'Credit Note' : 'Debit Note'}
  //         </TableCell>
  //         <TableCell align='right'>
  //           {parseInt(groupedNotes.grouped_amount).toFixed(2)}
  //         </TableCell>
  //         <TableCell align='center'>
  //           <Button
  //             variant='outlined'
  //             color='error'
  //             // sx={{
  //             //   padding: 1,
  //             //   borderRadius: 50,
  //             //   '&:hover': {
  //             //     backgroundColor: '#d9d9d9',
  //             //     cursor: 'pointer',
  //             //   },
  //             // }}
  //             fontSize='large'
  //             onClick={() => {
  //               this.setState({
  //                 deleteAllDialogOpen: true,
  //                 deleteAllId:
  //                   groupedNotes.customer_id === null
  //                     ? groupedNotes.supplier_id
  //                     : groupedNotes.customer_id,
  //                 deleteAllType: groupedNotes.type,
  //               });
  //             }}
  //           >
  //             Delete All
  //           </Button>
  //         </TableCell>
  //       </TableRow>
  //       <TableRow>
  //         <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
  //           <Collapse
  //             in={this.state.collapseOpen === index}
  //             timeout='auto'
  //             unmountOnExit
  //           >
  //             <Box sx={{margin: 1}}>
  //               <Typography variant='h3' gutterBottom component='div'>
  //                 History
  //               </Typography>
  //               <Table size='small' aria-label='purchases'>
  //                 <TableHead>
  //                   <TableRow
  //                     sx={{
  //                       '& th': {
  //                         fontWeight: 'bold',
  //                         fontSize: 12,
  //                       },
  //                     }}
  //                   >
  //                     <TableCell align='left'>Date</TableCell>
  //                     <TableCell align='left'>Customer</TableCell>
  //                     <TableCell align='left'>Description</TableCell>
  //                     <TableCell align='right'>Amount</TableCell>
  //                     <TableCell align='center'>Actions</TableCell>
  //                   </TableRow>
  //                 </TableHead>
  //                 <TableBody>
  //                   {this.props.individualNotes
  //                     .filter((note) =>
  //                       note.customer_id === null
  //                         ? note.supplier_id === customerOrSupplierId
  //                         : note.customer_id === customerOrSupplierId,
  //                     )
  //                     .map((row) => (
  //                       <TableRow key={row.id}>
  //                         <TableCell component='th' scope='row' align='left'>
  //                           {row.created_at}
  //                         </TableCell>
  //                         <TableCell align='left'>{row.NAME}</TableCell>
  //                         <TableCell align='left'>
  //                           {this.state.isEditMode === row.id ? (
  //                             <Input
  //                               type='text'
  //                               required
  //                               name='description'
  //                               // value={
  //                               //   this.state.inLineEditData.description === ''
  //                               //     ? row.description
  //                               //     : ''
  //                               // }
  //                               value={this.state.inLineEditData.description}
  //                               onChange={(e) => {
  //                                 this.handleInLineEditOnChange(e);
  //                               }}
  //                             />
  //                           ) : (
  //                             row.description
  //                           )}
  //                         </TableCell>
  //                         <TableCell align='right'>
  //                           {this.state.isEditMode === row.id ? (
  //                             <Input
  //                               type='number'
  //                               required
  //                               name='amount'
  //                               value={this.state.inLineEditData.amount}
  //                               onChange={(e) => {
  //                                 this.handleInLineEditOnChange(e);
  //                               }}
  //                             />
  //                           ) : (
  //                             parseInt(row.amount).toFixed(2)
  //                           )}
  //                         </TableCell>
  //                         <TableCell align='center'>
  //                           {this.state.isEditMode === row.id ? (
  //                             <DoneIcon
  //                               sx={{
  //                                 padding: 1,
  //                                 borderRadius: 50,
  //                                 '&:hover': {
  //                                   backgroundColor: '#d9d9d9',
  //                                   cursor: 'pointer',
  //                                 },
  //                               }}
  //                               onClick={() => {
  //                                 this.handleUpdateIndividualNote(row);
  //                               }}
  //                               fontSize='large'
  //                             />
  //                           ) : (
  //                             <DeleteOutlineIcon
  //                               sx={{
  //                                 padding: 1,
  //                                 borderRadius: 50,
  //                                 '&:hover': {
  //                                   backgroundColor: '#d9d9d9',
  //                                   cursor: 'pointer',
  //                                 },
  //                               }}
  //                               fontSize='large'
  //                               onClick={() => {
  //                                 this.setState({
  //                                   deleteDialogOpen: true,
  //                                   deleteNoteId: row.id,
  //                                 });
  //                               }}
  //                             />
  //                           )}

  //                           {this.state.isEditMode === row.id ? (
  //                             <CancelIcon
  //                               sx={{
  //                                 padding: 1,
  //                                 borderRadius: 50,
  //                                 '&:hover': {
  //                                   backgroundColor: '#d9d9d9',
  //                                   cursor: 'pointer',
  //                                 },
  //                               }}
  //                               fontSize='large'
  //                               onClick={() => {
  //                                 this.setState({isEditMode: -1});
  //                               }}
  //                             />
  //                           ) : (
  //                             <EditIcon
  //                               sx={{
  //                                 padding: 1,
  //                                 borderRadius: 50,
  //                                 '&:hover': {
  //                                   backgroundColor: '#d9d9d9',
  //                                   cursor: 'pointer',
  //                                 },
  //                               }}
  //                               fontSize='large'
  //                               onClick={() => {
  //                                 this.setState({
  //                                   isEditMode:
  //                                     this.state.isEditMode === row.id
  //                                       ? -1
  //                                       : row.id,
  //                                   inLineEditData: {
  //                                     description: row.description,
  //                                     amount: row.amount,
  //                                   },
  //                                 });
  //                               }}
  //                             />
  //                           )}
  //                         </TableCell>
  //                       </TableRow>
  //                     ))}
  //                 </TableBody>
  //               </Table>
  //             </Box>
  //           </Collapse>
  //         </TableCell>
  //       </TableRow>
  //     </React.Fragment>
  //   );
  // };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
  
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:"",
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      type:'C',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listManualNotesPaginationAction(body),
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});

    if(val.length >= 3 || val.length === 0){
      this.props.set_searchCreditdebitAction({data:[], numRows:0})
    }
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:val,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      type:'C',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }
    this.props.get_searchCreditdebitAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size,page:0}) 
  }

  handlePageChange = async (page) => {
    this.setState({ page: page });
  }

  handleDetailClick = (rowData) => {
    this.setState({ detailsOpen : true, rowData : rowData })
  }

  invoiceclick = async (rowdata) =>{
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   await !this.props.customer.length && this.props.listCustomerAction(),
    //  // await !this.props.app_config_data.length && this.props.getAppConfigDataAction(),
    // )
 
    let data = {
      id : rowdata.return_id === null ? rowdata.receiving_id : rowdata.return_id,
      type: rowdata.type,
      status: rowdata.sale_status,
      mn_id: rowdata?.id
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
     rowdata.customer_id !== null ? this.props.getbyidCustomerAction(rowdata.customer_id) : this.props.getbyidVendorAction(rowdata.supplier_id),
      this.props.ManualSalesPurchase(data, (response)=>{
        //console.log(response,'dlkhkgkjg');
        
        if(response){
          this.props.setInvoiceTempAction(response)
          const templateData = {
            ...rowdata,
            sequence_number: rowdata.sequence_number,
            type: rowdata.type,
            date: rowdata.dateColumn,
            customer_id: rowdata.customer_id,
            supplier_id: rowdata.supplier_id,
            amount: rowdata.amount,
            name:rowdata.description,
            invoice_date:rowdata.created_at,
          }
          // this.getAppConfigData()
          this.setState({ templateOpen: true, templateData, detailsOpen: false })
        }
      })
    )

  }
    handleModeTabChange = (event, newValue) => {
  this.setState({ modeTab: newValue }, () => {
    console.log('Selected Mode:', newValue,this.state.modeTab);
    // Call search / reload API here based on tab
    // newValue ==='return' &&  this.setState({returnOpen: true}) 
  });
};
returnClose=()=>{
  this.setState({returnOpen: false})
}
  setAppConfigData = (data) =>{
    this.setState({appConfigData:{...this.state.appConfigData,...data}})
  }
   dcreturnActions = (data,setLoaderStatusHandler,commoncookie,headerLocationId)=>{
    this.props.dcreturnActions(data,setLoaderStatusHandler,commoncookie,headerLocationId)
  }
  
  render() {
    const {cnPopupData} = this.state;
    const { user_rights } = this.props;
    const selectedRole = this.storage.role_name
    const creditNoteCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__credit_notes', 'can_create')
    const creditNoteEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__credit_notes', 'can_edit')
    const creditNoteDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__credit_notes', 'can_delete')
    const creditNoteExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__credit_notes', 'can_export')

    const customerIndex = this.props.customerAsCompany.findIndex(c => c.customer_id === this.state.setData.customer_id);
    // console.log("customerIndex",this.state.onrowclick)
    let openData = {
      rowIndex: customerIndex,
      sales_customer_id: this.state.setData.customer_id,
      routeFrom: "CREDITNOTE",
      salesOrder: "salesOrder",
      mail_configuration: this.props.mail_configuration,
      setOnbackClick: false,
      backToSales: this.rowPopupClose1,
    };

    return (
      <React.Fragment>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Credit Notes </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            setModalStatusHandler,
            setModalTypeHandler,
            setLoaderStatusHandler,
            loaderStatus,
            selectData
          }) => (
            <div>
 
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              <Dialog
                open={this.state.cancelIrnDialogOpen}
                onClose={this.closeCancelIrnDialog}
                aria-labelledby='cancel-irn-dialog-title'
                aria-describedby='cancel-irn-dialog-description'
              >
                <DialogTitle id='cancel-irn-dialog-title'>{'Cancel IRN ?'}</DialogTitle>
                <DialogContent style={{width: 500}}>
                  <DialogContentText
                    id='cancel-irn-dialog-description'
                    sx={{color: 'warning.main'}}
                  >
                    Are you sure you want to cancel IRN ?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.closeCancelIrnDialog} color='secondary'>
                    Cancel
                  </Button>
                  <Button onClick={this.handleCancelManualIrn} color='primary' autoFocus>
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
              {/* <AlertDialog
                delete={this.state.deleteDialogOpen}
                handleClose={this.handleClose}
                handleDelete={this.deleteIndividualNote}
                id={this.state.deleteNoteId}
              /> */}
              {/* <AlertDialog
                delete={this.state.deleteAllDialogOpen}
                handleClose={this.handleClose}
                // handleDelete={this.deleteAllNoteCustomerOrSupplier}
                id={this.state.deleteAllId}
              /> */}
              {/* <CnDialog
                appConfigData={this.state.appConfigData}
                createMail={this.cninvoiceDialogSendMail}
                custType={cnPopupData.custType}
                custData={cnPopupData.custData}
                invoice={cnPopupData.invoice}
                soDate={cnPopupData.soDate}
                sales_items={cnPopupData.sales_items}
                open={cnPopupData.Dopen}
                handleClose={() =>
                  this.setState({
                    cnPopupData: {...cnPopupData, Dopen: false},
                  })
                }
                note={cnPopupData.note}
              /> */}
              {this.state.returnOpen === false && this.state.open === false  && this.state.detailsOpen === false && !this.state.onrowclick &&  (
                <>
                  <MaterialTable
                              style={{height: 'calc(100vh - 85px)',overflow:'hidden'}}
                              totalCount={this.props.manualNoteCount}
                             components= {{
                              ...stickyTableComponents,
                              Toolbar: (props) => (
                                <div
                                  style={{
                                    display: 'flex',
                                    width: '100%',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div style={{width: '100%'}}>
                                    <MTableToolbar {...props} />
                                  </div>
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
                              ),
                              Pagination: (props) => (
                                <div>
                                  <TablePagination
                                  {...props}
                                  component="div"
                                  count={this.props.manualNoteCount ?? 0}
                                  rowsPerPageOptions={[20, 50, 100]}
                                  labelRowsPerPage="Rows per Page:"
                                  page={this.state.page || 0}
                                  rowsPerPage={this.state.pageSize || 20}
                                  onPageChange={(event, page) =>
                                    this.handlePageChange(page)
                                  }
                                  onRowsPerPageChange={(event) =>
                                    this.handlePageSizeChange(
                                      parseInt(event.target.value, 10)
                                    )
                                  }/>
                                </div>
                              )
                            }}

                    actions={[
                      {
                        icon: () => (
                          <div style={{display: 'flex'}}>
                            <FilterManualNotes
                              fromTo={true}
                              from={this.state.filteredValue.from}
                              to={this.state.filteredValue.to}
                              type={this.state.filteredValue.type}
                              location_id={this.state.filteredValue.location_id}
                              minValue={this.state.filteredValue.minValue}
                              maxValue={this.state.filteredValue.maxValue}
                              filteredValue={this.state.filteredValue}
                              range={this.state.filteredValue.range}
                              setFilter={this.setFilter}
                              handleChange={this.handleChange}
                              handleClose={this.handleFilter}
                              open={this.state.filterOpen}
                              ApplyButton={this.ApplyButton}
                              clearButton={this.clearButton}
                              stocklocation={this.props.stocklocation}
                              for={"credit_note"}
                            />
                          </div>
                        ),
                        tooltip: 'Filter',
                        isFreeAction: true,
                      },
                      creditNoteCreate ? {
                        icon: () => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #1976d2', borderRadius: 4, color: '#1976d2', fontSize: 13, fontWeight: 500, textTransform: 'none' }}>
                            <AddIcon fontSize="small" />
                            Manual
                          </div>
                        ),
                        tooltip: 'Add Manual Credit Note',
                        isFreeAction: true,
                        onClick: (event, rowData) =>
                          this.setState({ edit_id_data: [], open: true, modeTab: 'manual' }),
                      } : null,
                      creditNoteCreate ? {
                        icon: () => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #1976d2', borderRadius: 4, color: '#1976d2', fontSize: 13, fontWeight: 500, textTransform: 'none' }}>
                            <AddIcon fontSize="small" />
                            Return
                          </div>
                        ),
                        tooltip: 'Add Sales Return',
                        isFreeAction: true,
                        onClick: (event, rowData) =>
                          this.setState({ returnOpen: true, modeTab: 'return' }),
                      } : null,
                       
                      creditNoteEdit ? (rowData) => ({
                        icon: 'edit',
                        tooltip: 'edit',
                        position: 'row',
                        hidden: this.props.IconHidden ? true : false,
                        onClick: (event, rowData) =>
                          this.handleEdit(rowData.id),
                        disabled: !this.canEditManualNote(rowData)
                        
                      }) :null,
                      (rowData) => ({
                        icon: () => <CancelIcon color={this.canCancelManualIrn(rowData) ? 'error' : 'disabled'} />,
                        tooltip: 'Cancel IRN',
                        position: 'row',
                        hidden: this.props.IconHidden ? true : false,
                        onClick: (event, rowData) => this.openCancelIrnDialog(rowData),
                        disabled: !this.canCancelManualIrn(rowData)
                      }),

                      creditNoteDelete ? (rowData) => ({
                        icon: 'delete',
                        tooltip: 'Delete',
                        position: 'row',
                        hidden: this.props.IconHidden ? true : false,
                        onClick: (event, rowData) =>
                        this.handledialog(rowData.id),
                        disabled: this.hasIrisManualLink(rowData)
                          ? true
                          : !((rowData?.invoice_number === null || rowData?.invoice_number === "") && rowData.adjusted_amount === 0)
                        
                      }) : null,
                      // {
                      //   icon: 'edit',
                      //   tooltip: 'edit',
                      //   position: 'row',
                      //   onClick: (event, rowData) =>
                      //   console.log('rowdatata', rowData)
                      //     // this.handleEdit(rowData.id),
                      //     // disabled : rowData?.invoice_number === null ? false : true
                      // },
                      // {
                      //   icon: 'delete',
                      //   tooltip: 'Delete',
                      //   onClick: (event, rowData) =>
                      //     this.handledialog(rowData.id),
                      // },
                    ]}
                    // page={this.state.page}
                    // onPageChange={(page) => this.handlePageChange(page)}
                    // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                    onRowClick={(event, rowData) => this.handleDetailClick(rowData)}
                    options={getStickyTableOptions({
                      bodyOffset: 200,
                       headerStyle,
                      options:{
                        showEmptyDataSourceMessage: this.state.isApiFinished,
                      cellStyle,
                      tableLayout: "auto",
                      toolbar: true,
                      exportButton: creditNoteExport ? true : false,
                      rowStyle: { height: '40px' },
                      filtering: false,
                      actionsColumnIndex: -1,
                      pageSize: this.state.pageSize || 20,
                      pageSizeOptions: [20, 50, 100],
                      initialPage: this.state.currentPage,
                      search: false,
                      exportMenu: creditNoteExport ? [
                        {
                          label: 'Export PDF',
                          exportFunc: (cols, datas) => {
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              this.props.listManualNotesAction(
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                                this.exportValue(),

                                (exportData) => {
                                  ExportPdf(cols, exportData, 'Credit Notes');
                                },
                                true
                              ),
                            );
                          },
                        },
                        {
                          label: 'Export CSV',
                          exportFunc: (cols, datas) => {
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              this.props.listManualNotesAction(
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                                this.exportValue(),

                                (exportData) => {
                                  ExportCsv(cols, exportData, 'Credit Notes');
                                },
                                true
                              ),
                            );
                          },
                        },
                      ] : [],
                      }
                    })}
                    columns={[
                      {title: 'Date', field: 'dateColumn'},
                      {
                        title: 'Customer',
                        field: 'name',
                        render: (rowData) => (
                           <div>
                                                    <List component='nav' aria-label='main mailbox folders' disablePadding>
                                                      <ListItem sx={{ pl: 0, py: 0 }}>
                                                        <ListItemIcon  sx={{ minWidth: 30 }}>
                                                          {
                                                            <BusinessIcon />
                                                          }
                                                        </ListItemIcon>
                                                        <ListItemText primary={<span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }} >
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
                                                                      {rowData.name}
                                                                    </Link>
                                                                  
                        
                                                        </span>} />
                                                      </ListItem>
                                                    </List>
                                                  </div>
                        ),
                      },
                      {
                        title: 'CN#',
                        field: 'sequence_number',
                        render: (rowData) => (
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              this.invoiceclick(rowData);
                            }}
                            style={{
                              textDecoration: 'none',
                              cursor: 'pointer',
                              color: '#03adfc',
                              display: 'inline-block',
                            }}
                          >
                            {rowData.sequence_number}
                          </span>
                        )
                      },
                      {title: 'Description', field: 'description'},
                      {title: 'Reference', field: 'Reference'},
                      {
                        title: 'Type',
                        field: 'type',
                        render : rowData => rowData.returnFrom === 'Sales' ? 'Sales Return' : rowData.type === 'D' ? 'Manual Debit Note' : 'Manual Credit Note' 
                      },
                      {
                        title: 'Opening Amount',
                        field: 'amount',
                        align: 'right', 
                        cellStyle: {
                          textAlign: 'right',
                           paddingRight: '10px',
                          fontSize: cellStyle.fontSize
                        },
                        render: (rowData) => rowData.amount.toFixed(2),
                      },
                      {
                        title: 'Closing Amount',
                        field: 'balance_amount',
                        align: 'right', 
                        cellStyle: {
                          textAlign: 'right',
                           paddingRight: '10px',
                          fontSize: cellStyle.fontSize
                        },
                        render: (rowData) => rowData.balance_amount?.toFixed(2) || 0,
                      },
                      // {
                      //   title: 'Amount',
                      //   field: 'grouped_amount',
                      //   render: (rowData) => (
                      //     <div
                      //       style={{
                      //         display: 'flex',
                      //         justifyContent: 'flex-end',
                      //       }}
                      //     >
                      //       {' '}
                      //       {rowData.grouped_amount.toFixed(2)}{' '}
                      //     </div>
                      //   ),
                      // },
                    ]}
                    data={
                      this.props.manualNotes
                      // ? this.props.manualNotes
                      //     .slice(0, this.props.pageSize)
                      //     .map((r) => {
                      //       const {tableData, ...record} = r;
                      //       return record;
                      //     })
                      // : []
                    }
                    title='Credit Notes'
                  />
                </>
              )}
              {this.state.templateOpen && (
                 (<CnDialog
                 appConfigData={this.state.appConfigData}
                 createMail={this.createMail}
                 custType={this.state.templateData.type === 'C'? 'CUSTOMER': 'VENDOR'}
                 custData={ this.state.templateData.type === 'C'? this.props.customer_id_data : this.props.vendor_id_data }
                 invoice={this.state.templateData?.sequence_number}
                 soDate={this.state.templateData?.date}
                 sales_items={this.props.manualsalespurchase}
                 open={this.state.templateOpen}
                 handleClose={() => {
                  if(this.state.returnOpen){
                    this.fetchNotes()
                  }
                  this.setState({ templateOpen: false, returnOpen: false })
                }}
                 note={'hii'}
                 manualnote = {this.state.templateData}
               />)
              // <CreditDebitNoteTemplate
              //   open={this.state.templateOpen}
              //   handleClose={() => this.setState({ templateOpen: false })}
              //   templateData={this.state.templateData}
              // />
              )}
              {this.state.open && loaderStatus === false && (
                <NewManualNotesForm
                  status={this.state.status}
                  edit_id_data={this.state.edit_id_data}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  type='cashBoxCreation'
                  setLoaderStatusHandler={setLoaderStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  from={'C'}
                  openType={this.state.modeTab}
                />
              )}
              {this.state.modeTab == 'return' && this.state.returnOpen && (
             <SalesReturn
               handleClose={(response) => {
                 this.setState({ returnOpen: false });

                 if (response) {
                   // Show toast
                  //  this.props.OpenalertActions({ open: true, msg: 'Sales return created successfully', severity: 'success' });

                   // Fetch CN PDF and show popup
                   const creditNoteId = response?.manualCredit?.creditnoteid;
                   const returnId = response?.createreturn?.insertId;
                   const sequenceNumber = response?.manualCredit?.sequence_number;
                   if (creditNoteId) {
                     this.props.ManualSalesPurchase(
                       { id: returnId, type: 'C', mn_id: creditNoteId },
                       (pdfData) => {
                         if (pdfData) {
                           this.props.setInvoiceTempAction(pdfData);
                           this.setState({
                             templateOpen: true,
                             templateData: {
                               type: 'C',
                               sequence_number: sequenceNumber,
                               date: new Date().toISOString().split('T')[0],
                               customer_id: response?.manualCredit?.customer_id,
                               amount: response?.manualCredit?.amount,
                             }
                           });
                         }
                       }
                     );
                   }

                   // Refresh credit notes list
                   this.fetchNotes();
                 }
               }}
             />
            )}

              {
                this.state.detailsOpen &&
                <CreditNotesDetails
                  data = {this.state.rowData}
                  handleClose = {this.handleClose}
                  handleSubmit={this.handleSubmit}
                  handleDelete={this.handleDelete}
                />
              }
            {this.state.onrowclick && (
                                  OpenCustomerLandingPage(openData)
                                   )}
              {/* {this.state.filterOpen && (
                <FilterManualNotes
                  fromTo={true}
                  from={this.state.filteredValue.from}
                  to={this.state.filteredValue.to}
                  filteredValue={this.state.filteredValue}
                  setFilter={this.setFilter}
                  handleChange={this.handleChange}
                  handleClose={this.handleFilter}
                  open={this.state.filterOpen}
                  ApplyButton={this.ApplyButton}
                  clearButton={this.clearButton}
                />
              )} */}
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
    manualNotes: state.manualNoteReducer.manualNotes || [],
    manualNoteCount: state.manualNoteReducer.manualNoteCount || 0,
    individualNotes: state.manualNoteReducer.individualNotes || [],
    customer: state.customerReducer.customer || [],
    customer_id_data: state.customerReducer.customer_id_data || [],
    sequence: state.manualNoteReducer.sequence || [],
    // sales: state.salesReducer.sales || [],
    app_config_data: state.appConfigReducer.app_config_data,
    app_config_data_based_on_type: state.appConfigReducer.app_config_data_based_on_type,
    // product: state.productReducer.product || [],
    // purchases: state.purchasesReducer.purchases,
    searchCreditdebitData: state.paymentReceiptReducer.searchCreditdebitData,
    searchCreditdebitCount : state.paymentReceiptReducer.searchCreditdebitCount,
    manualsalespurchase : state.manualNoteReducer.manualsalespurchase || [],
    vendor_id_data: state.vendorReducer.vendor_id_data || [],
    stocklocation: state.UserCreationReducer.all_user_location,
    user_rights: state.roleReducer.user_rights || [],
    customerAsCompany: state.customerReducer.customerAsCompany || [],
    PriceList: state.PriceListReducer.price_list || [],
    productByType: state.productReducer.productByType || [],
    menuAccess: state.rbacReducer.menuAccess || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listManualNotesAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
      exportCallBack,
      isExport = false

    ) => {
      return dispatch(
        listManualNotesAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
          exportCallBack,
          isExport
        ),
      );
    },
    listManualNotesPaginationAction: (
      data,
    ) => {
      return dispatch(
        listManualNotesPaginationAction(
          data,
        ),
      );
    },

    manualNotesCreationAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        manualNotesCreationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },

    listCustomerAction: () => {
      return dispatch(listCustomerAction());
    },

    getbyidCustomerAction: (id) =>{
      return dispatch(getbyidCustomerAction(id))
    },
    getbyidVendorAction:(id)=>{
      return dispatch(getbyidVendorAction(id))
    },
    // getUserRightsByRoleIdAction:()=>{
    //   return dispatch(getUserRightsByRoleIdAction())
    // },
    getMenuAccessAction:(selectedRole) => {
      return dispatch(getMenuAccessAction(selectedRole))
    },
    getAppConfigDataBasedOnTypeAction: (type) => {
      return dispatch(getAppConfigDataBasedOnTypeAction(type));
    },

    deleteManualNoteAction: (
      type,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteManualNoteAction( type,
          id,setModalTypeHandler, setLoaderStatusHandler),
      );
    },

    deleteAllManualNotesAction: (
      type,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteAllManualNotesAction(
          type,
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },

    posSequence: (id, data, setLoaderStatusHandler) => {
      dispatch(posSequence(id, data, setLoaderStatusHandler));
    },
    sequenceAction:(setModalTypeHandler,
      setLoaderStatusHandler)=>{
      return dispatch(sequenceAction(setModalTypeHandler,
        setLoaderStatusHandler));
    },

    listStockLocationAction: (
      employee_id,
      headerLocationId,
    ) => {
      return dispatch(
        listStockLocationAction(
          employee_id,
          headerLocationId,
        ),
      );
    },
    updateManualNotesAction: (
      data,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateManualNotesAction(
          data,
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
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
    getAppConfigDataAction: () => {
      return dispatch(getAppConfigDataAction());
    },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    listProductAction: (setModalTypeHandler,
      setLoaderStatusHandler) => {
      return dispatch(listProductAction(setModalTypeHandler,
        setLoaderStatusHandler));
    },
    set_searchCreditdebitAction: (val ) => { return dispatch(set_searchCreditdebitAction(val))
    },
    get_searchCreditdebitAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchCreditdebitAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
       customerAsCompanyAction: () => {
          dispatch(customerAsCompanyAction())
        },
    ManualSalesPurchase: (
     data, response
      ) => { 
      return dispatch(
        ManualSalesPurchase(
          data, response
          )
        );
    },
    cancelManualIrnAction: (data) => {
      return dispatch(cancelManualIrnAction(data));
    },

    setInvoiceTempAction:(data)=>{return dispatch(setInvoiceTempAction(data))},
    OpenalertActions:(data)=>{return dispatch(OpenalertActions(data))},
    dcreturnActions:(data,setLoaderStatusHandler,commoncookie,headerLocationId)=>{return dispatch(dcreturnActions(data,setLoaderStatusHandler,commoncookie,headerLocationId))},
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
        }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManualNotes);

