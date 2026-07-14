import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
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
  ManualSalesPurchase
} from '../../../redux/actions/manualNotes_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {getbyidCustomerAction, listCustomerAction} from '../../../redux/actions/customer_actions';
import FilterManualNotes from './filterManualNotes';
import moment from 'moment';
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
  TablePagination,
  Tabs,
  Tab,
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
  listSalesAction,sendMail} from '../../../redux/actions/sales_actions'
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import CnDialog from '../sales/cn_invoice';
import {listProductAction} from '../../../redux/actions/product_actions';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import ClearIcon from '@mui/icons-material/Clear';
import { get_searchCreditdebitAction, set_searchCreditdebitAction } from 'redux/actions/paymentReceipt_actions';
import CommonSearch from 'utils/commonSearch';
import { getSupplierDetailsByIdAction, getbyidVendorAction, listVendorIdAndNameAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import IndexForStockReturn from 'pages/sales/sales/cn_invoice/indexStock';
import NewManualNotesForm from 'components/Sales/NewManualNotesForm';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import DebitNotesDetails from './DebitNotesDetails';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
  import {
    getStickyTableOptions,
    stickyTableComponents,
  } from 'utils/stickyTableLayout';
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
        range :  'This Month',
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
      detailsOpen: false,
      prevHeaderLocationId: this.context?.headerLocationId || null,
      setData : '',
      onrowclick : false,
      modeTab: 'manual',
      delete_id_data : []
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
      type:'D',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listManualNotesPaginationAction(data),
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
      this.props.getMenuAccessAction(selectedRole)
      // this.props.sequenceAction(() => { }, () => { })
    ).finally(() => this.setState({isApiFinished: true}))

    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  fetchManualNotes = () => {
    const context = this.context;

    const data = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from).format('YYYY-MM-DD'),
      to: moment(this.state.filteredValue.to).format('YYYY-MM-DD'),
      type: 'D',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listManualNotesPaginationAction(data)
    );
  };


  componentDidUpdate(prevProps, prevState) {

    console.log('updateeeeeeeeedsffds')
    const context = this.context;

    if (this.props.manualNotes !== prevProps.manualNotes) {
      this.setState({ computedData: this.props.manualNotes });
    }

    if (prevState.pageSize !== this.state.pageSize) {
      this.fetchManualNotes();
    }

    if (prevState.page !== this.state.page) {
      this.fetchManualNotes();
    }

    if (this.state.prevHeaderLocationId !== context.headerLocationId) {
      this.props.listStockLocationAction(context.commoncookie, context.headerLocationId);

      if (!this.state.open) {
        this.fetchManualNotes();
      }

      this.setState({ prevHeaderLocationId: context.headerLocationId });
    }
  }

  getAppConfigData = () => {
    const {app_config_data} = this.props;
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    const fullAddress = app_config_data.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = app_config_data.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = app_config_data.filter((f) => f.key_name == 'address.state');

    this.setState({
      appConfigData: {
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        companyEmail: emailData.length > 0 ? emailData[0].value : '',
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        state: state.length > 0 ? state[0].value : '',
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
      type:"D",
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
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        await this.props.listStockLocationAction(context.commoncookie, context.headerLocationId)
      );
      await this.setState({edit_id_data: getId, status: 'edit', open: true});
    }
  };
handleDelete = async (id) => {
  const context = this.context;
  let getId = await this.props.manualNotes
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
  const sequencenumber = getId?.[0]?.sequence_number
  const type = 'D';
  const payload = {
    timelinedata : `Debit Note ${sequencenumber} has been deleted`
  }

  try {
    const result = await this.props.deleteManualNoteAction(
      type,
      id,
      payload,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    );

    this.setState({ delete: false }, () => {
      this.fetchManualNotes();
    });

  } catch (error) {
    console.error('Error deleting manual note:', error);
  }
};
  handledialog = (id) => {
   
    this.setState({delete: true, id: id});
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
      // data.from = this.state.filteredValue.from === null ? null : moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD')
      // data.to = this.state.filteredValue.to === null ? null : moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD')
      data.from = null
      data.to = null

      const datas = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
        type:'D',
        noteType: this.state.filteredValue.type,
        minValue: this.state.filteredValue.minValue,
        maxValue: this.state.filteredValue.maxValue
      }

        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          await this.props.updateManualNotesAction(
            data,
            data.id,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
          this.props.listManualNotesPaginationAction(datas)
        );
      await this.setState({open: false, status : ''});
    } else if (data && data.location_id !== 'null') {
      // data.location_id = context.headerLocationId
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
      // data.from = this.state.filteredValue.from === null ? null : moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD')
      // data.to = this.state.filteredValue.to === null ? null : moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD')
      data.from = null
      data.to = null

      const datas = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
        type:'D',
        noteType: this.state.filteredValue.type,
        minValue: this.state.filteredValue.minValue,
        maxValue: this.state.filteredValue.maxValue
      }
       apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        await this.props.manualNotesCreationAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog,
        ),
       await this.props.listManualNotesPaginationAction(datas)
      );
      // const possequence1 ={
      //   possequenceid :data.sequence_id,
      //   current_seq : data.current_seq,
      //   manual : true
      // }
      // await this.props.posSequence(possequence1.possequenceid, possequence1, context.setLoaderStatusHandler );

      await this.setState({open: false, collapseOpen: -1, page:0});
    }else{
       console.log("Please Select Location!");
      // this.setState({openAlert: true})
    }
  };

  deleteIndividualNote = (id) => {
    const context = this.context;
    const type='D'
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
    this.setState({deleteDialogOpen: false});

    if (!this.props.manualNotes.length === 0) {
      this.setState({collapseOpen: -1});
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


  handleCustomerDetail = (rowData)=>{
    console.log('notworkinggggg')
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
      type:'D',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue || null,
      maxValue: this.state.filteredValue.maxValue || null
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
      type:'D',
      noteType: null,
      minValue: null,
      maxValue: null
    }
    this.props.listManualNotesPaginationAction(data),
    this.setState({filteredValue: {from: this.firstDay, to: this.lastDay}});
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
  
    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      type:'D',
      noteType: this.state.filteredValue.type,
      minValue: this.state.filteredValue.minValue,
      maxValue: this.state.filteredValue.maxValue
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listManualNotesPaginationAction(data),
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});
    console.log(moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'), moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),'fromtoooo')
    // if(val.trim() !== ''){
    this.props.set_searchCreditdebitAction({data:[], numRows:0})
    // }
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:val,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      type:'D',
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
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
    this.setState({ pageSize: Number(size), page: 0 })
  }

  handlePageChange = async (page) => {
    this.setState({ page: page });
  }

  handleDetailClick = (rowData) => {
   this.setState({ detailsOpen : true, rowData : rowData })
  }

  invoiceclick = async (rowdata) =>{
    //console.log('ddd');
    
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   await !this.props.customer.length && this.props.listCustomerAction(),
    //  // await !this.props.app_config_data.length && this.props.getAppConfigDataAction(),
    // )
 
    let data = {
      id : rowdata.sale_id === null ? rowdata.return_id : rowdata.sale_id,
      type: rowdata.type,
      status: rowdata.sale_status ,
      // returnFrom:rowdata.returnFrom,
      sequence:rowdata.sequence_number,
      mc_id: rowdata?.id
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
     rowdata.customer_id !== null ? this.props.getbyidCustomerAction(rowdata.customer_id) : this.props.getbyidVendorAction(rowdata.supplier_id),
      this.props.ManualSalesPurchase(data, (response)=>{
        if(response){
          // console.log('testinggg');
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
            invoice_date:rowdata.created_at
          }
          this.getAppConfigData()
          this.setState({ templateOpen: true, templateData  })
        }
      })
    )

  }
  handleModeTabChange = (event, newValue) => {
  this.setState({ modeTab: newValue }, () => {
    console.log('Selected Mode:', this.state.modeTab);
    // Call search / reload API here based on tab
  });
};

  render() {
    console.log(this.props.manualNotes,'ddfdsdddf');
    
    const {cnPopupData} = this.state;
     const supplierData = this.props.vendor.filter(d => d.supplier_id !== 'undefined'); 
    const supplierIndex = supplierData.findIndex(c => c.supplier_id ===this.state.setData?.supplier_id);

    const selectedRole = this.storage.role_name
    const debitNoteCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__debit_notes', 'can_create')
    const debitNoteEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__debit_notes', 'can_edit')
    const debitNoteDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__debit_notes', 'can_delete')
    const debitNoteExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'purchases__debit_notes', 'can_export')

    let openData = {
      rowIndex: supplierIndex,
      sales_customer_id: this.state.setData.supplier_id,
      routeFrom: "DEBITNOTE",
      payable: "payable",
      mail_configuration: this.props.mail_configuration,
      setOnbackClick: false,
      backToSales: this.rowPopupClose1,
      purchaseOrder: "purchaseOrder"
    };

    return (
      <React.Fragment>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Debit Notes </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            setModalStatusHandler,
            setModalTypeHandler,
            setLoaderStatusHandler,
            loaderStatus,
          }) => (
            <div>
 
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
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
              <CnDialog
                appConfigData={this.state.appConfigData}
                createMail={this.cninvoiceDialogSendMail}
                custType={cnPopupData.custType}
                custData={cnPopupData.custData}
                invoice={cnPopupData.invoice}
                soDate={cnPopupData.soDate}
                sales_items={cnPopupData.sales_items}
                open={this.state.templateOpen}
                handleClose={() =>this.setState({templateOpen:false})}
                note={cnPopupData.note}
              />
              {this.state.open === false   && this.state.detailsOpen === false &&  !this.state.onrowclick && (
                <>
                  <MaterialTable
                              style={{height: 'calc(100vh - 80px)'}}
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
                                                        
                      
    {/* Tabs removed — replaced by two + buttons in the Actions toolbar */}
                                </div>
                               ),
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
                                               count={this.props.manualNoteCount} 
                                               page={this.state.page}
                                                rowsPerPage={this.state.pageSize}
                                               onPageChange={(event, page) => this.handlePageChange(page)}
                                               onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                                               </div>),
                            }}

                    actions={[
                      debitNoteCreate ? {
                        icon: () => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #1976d2', borderRadius: 4, color: '#1976d2', fontSize: 13, fontWeight: 500, textTransform: 'none' }}>
                            <AddIcon fontSize="small" />
                            Manual
                          </div>
                        ),
                        tooltip: 'Add Manual Debit Note',
                        isFreeAction: true,
                        onClick: (event, rowData) =>
                          this.setState({ edit_id_data: [], open: true, modeTab: 'manual' }),
                      } : null,
                      debitNoteCreate ? {
                        icon: () => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #1976d2', borderRadius: 4, color: '#1976d2', fontSize: 13, fontWeight: 500, textTransform: 'none' }}>
                            <AddIcon fontSize="small" />
                            Return
                          </div>
                        ),
                        tooltip: 'Add Purchase Return',
                        isFreeAction: true,
                        onClick: (event, rowData) =>
                          this.setState({ edit_id_data: [], open: true, modeTab: 'return' }),
                      } : null,
                      {
                        icon: () => (
                          <div style={{display: 'flex'}}>
                            <FilterManualNotes
                              fromTo={true}
                              range ={this.state.filteredValue.range}
                              from={this.state.filteredValue.from}
                              to={this.state.filteredValue.to}
                              filteredValue={this.state.filteredValue}
                              setFilter={this.setFilter}
                              handleChange={this.handleChange}
                              handleClose={this.handleFilter}
                              open={this.state.filterOpen}
                              ApplyButton={this.ApplyButton}
                              clearButton={this.clearButton}
                              type={this.state.filteredValue.type}
                              location_id={this.state.filteredValue.location_id}
                              minValue={this.state.filteredValue.minValue}
                              maxValue={this.state.filteredValue.maxValue}
                              stocklocation={this.props.stocklocation}
                              for={"debit_note"}
                            />
                          </div>
                        ),
                        tooltip: 'Filter',
                        isFreeAction: true,
                      },
                      debitNoteEdit ? (rowData) => ({
                    
                        icon: 'edit',
                        tooltip: 'edit',
                        position: 'row',
                        hidden: this.props.IconHidden ? true : false,
                        onClick: (event, rowData) =>
                          this.handleEdit(rowData.id),
                        disabled: ( (rowData?.invoice_number === null || rowData?.invoice_number === "" && rowData?.description !== 'Purchase Converted') && rowData.adjusted_amount === 0  ) ? false : true
                        
                      }) : null,
                      debitNoteDelete ? (rowData) => ({
                        icon: 'delete',
                        tooltip: 'Delete',
                        position: 'row',
                        hidden: this.props.IconHidden ? true : false,
                        onClick: (event, rowData) =>
                        this.handledialog(rowData.id),
                        disabled: ( (rowData?.invoice_number === null || rowData?.invoice_number === "" && rowData?.description !== 'Purchase Converted') && rowData.adjusted_amount === 0 ) ? false : true
                        
                      }) : null
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
                    page={this.state.page}
                    onPageChange={(page) => this.handlePageChange(page)}
                    onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                    onRowClick={(event, rowData) => this.handleDetailClick(rowData)}
                    options={getStickyTableOptions({
                      headerStyle,
                      cellStyle,
                      bodyOffset: 200,
                      options:{
                        showEmptyDataSourceMessage: this.state.isApiFinished,
                      exportButton: debitNoteExport ? true : false,
                      filtering: false,
                      actionsColumnIndex: -1,
                      minBodyHeight: maxBodyHeight, 
                      maxBodyHeight: maxBodyHeight,
                      pageSize: this.state.pageSize,
                      pageSizeOptions: [20, 50, 100],
                      initialPage: this.state.currentPage,
                      search: false,
                      tableLayout: "auto",
                      toolbar: true,
                       exportMenu: debitNoteExport ? [
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
                                  ExportPdf(cols, exportData, 'Debit Notes');
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
                                  ExportCsv(cols, exportData, 'Debit Notes');
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
                        title: 'Vendor',
                        field: 'name',
                        render: (rowData) => (
                          <Link
                            onClick={(event) => {
                              // console.log('Link clicked for:', rowData.lead_id); 
                              event.stopPropagation();
                              this.handleCustomerDetail(rowData);
                            }}
                            style={{
                              textDecoration: 'none',
                              cursor: 'pointer',
                              color: '#03adfc',
                              display: 'inline-block',
                              padding: '5px',
                            }}
                          >
                            {rowData.name}
                          </Link>

                        )
                      },
                      {
                        title: 'DN#',
                        field: 'sequence_number',
                        render: (rowData) => (
                          <Link>
                            <ListItem>
                              <ListItemText
                                onClick={(event) => {
                                event.stopPropagation();
                                this.invoiceclick(rowData)
                                // console.log('2123');
                                
                                  // const templateData = {
                                  //   ...rowData,
                                  //   sequence_number: rowData.sequence_number,
                                  //   type: rowData.type,
                                  //   date: rowData.created_at,
                                  //   customer_id: rowData.customer_id,
                                  //   supplier_id: rowData.supplier_id,
                                  //   amount: rowData.amount
                                  // }
                                  // this.setState({ templateOpen: true, templateData })

                                  // this.setState({
                                  //   columPopup: {
                                  //     rowIndex:
                                  //       this.props.searchPosSaleData.findIndex(
                                  //         (i) =>
                                  //           rowData.customer_id
                                  //             ? i.customer_id ===
                                  //               rowData.customer_id
                                  //             : i.supplier_id ===
                                  //               rowData.supplier_id,
                                  //       ),
                                  //     open: true,
                                  //   },
                                  //   Customerid: rowData.customer_id,
                                  // });
                                  // setTimeout(() => {
                                  //   this.setState({rowPopup: {open: false}});
                                  // }, 0);
                                  // event.stopPropagation();
                                }}
                                style={{
                                  textDecoration: 'underline',
                                  cursor : 'pointer'
                                }}
                              >
                                {rowData.sequence_number}
                              </ListItemText>
                            </ListItem>
                          </Link>
                        ),
                      },
                      {title: 'Description', field: 'description'},
                      {title: 'Reference', field: 'Reference'},
                      {
                        title: 'Type',
                        field: 'type',
                        render : rowData => (rowData.returnFrom === 'Purchase' || rowData.returnFrom === 'Inventory' ) ? 'Purchase Return' :  rowData.type === 'D' ? 'Manual Debit Note' : 'Manual Credit Note' 
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
                    title='Debit Notes'
                  />
                </>
              )}
              {/* {this.state.templateOpen && (
                 <IndexForStockReturn
                 appConfigData={this.state.appConfigData}
                 createMail={this.createMail}
                 custType={this.state.templateData.type === 'C'? 'CUSTOMER': 'VENDOR'}
                 custData={ this.state.templateData.type === 'C'? this.props.customer_id_data : this.props.vendor_id_data }
                 invoice={this.state.templateData?.sequence_number}
                 debitSequence={this.state.templateData?.sequence_number}
                 soDate={this.state.templateData?.date}
                 sales_items={this.props.manualsalespurchase}
                 open={this.state.templateOpen}
                 handleClose={() => this.setState({ templateOpen: false })}
                 note={'hii'}
                 manualnote = {this.state.templateData}
               />
              // <CreditDebitNoteTemplate
              //   open={this.state.templateOpen}
              //   handleClose={() => this.setState({ templateOpen: false })}
              //   templateData={this.state.templateData}
              // />
              )} */}
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
                  from={'D'}
                  openType={this.state.modeTab}
                  cnInvoiceFunction = {() => {
                    this.setState({ templateOpen: true })
                    const data = {
                      pageCount: 0,
                      numPerPage: this.state.pageSize,
                      searchString: '',
                      employee_id: this.context.commoncookie,
                      headerLocationId: this.context.headerLocationId,
                      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
                      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
                      type:'D',
                      noteType: this.state.filteredValue.type,
                      minValue: this.state.filteredValue.minValue,
                      maxValue: this.state.filteredValue.maxValue
                    }
                    this.props.listManualNotesPaginationAction(data)
                  }}
                  onRefreshList = {() => {
                    const data = {
                      pageCount: 0,
                      numPerPage: this.state.pageSize,
                      searchString: '',
                      employee_id: this.context.commoncookie,
                      headerLocationId: this.context.headerLocationId,
                      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
                      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
                      type:'D',
                      noteType: this.state.filteredValue.type,
                      minValue: this.state.filteredValue.minValue,
                      maxValue: this.state.filteredValue.maxValue
                    }
                    this.props.listManualNotesPaginationAction(data)
                  }}
                />
              )}

              {
                this.state.detailsOpen &&
                <DebitNotesDetails
                  data = {this.state.rowData}
                  handleClose = {this.handleClose}
                  handleSubmit={this.handleSubmit}
                  handleDelete={this.handleDelete}
                />
              }

              {
                this.state.onrowclick && (
                   OpenCustomerLandingPage(openData)
                )
              }
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
    // product: state.productReducer.product || [],
    // purchases: state.purchasesReducer.purchases,
    searchCreditdebitData: state.paymentReceiptReducer.searchCreditdebitData,
    searchCreditdebitCount : state.paymentReceiptReducer.searchCreditdebitCount,
    manualsalespurchase : state.manualNoteReducer.manualsalespurchase || [],
    vendor_id_data: state.vendorReducer.vendor_id_data || [],
    stocklocation: state.UserCreationReducer.all_user_location,
    vendor: state.vendorReducer.vendorIdAndName,
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
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack,
      isExport,
    ) => {
      return dispatch(
        listManualNotesPaginationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack,
          isExport,
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
    getMenuAccessAction:(selectedRole) => {
      return dispatch(getMenuAccessAction(selectedRole))
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
     listVendorIdAndNameAction: (setModalTypeHandler, setLoaderStatusHandler) => {
          return dispatch(listVendorIdAndNameAction(setModalTypeHandler, setLoaderStatusHandler));
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
    setInvoiceTempAction:(data)=>{return dispatch(setInvoiceTempAction(data))},
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManualNotes);

