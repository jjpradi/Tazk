import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
// import { withLocation } from './withLocation';
import { DataGrid } from '@mui/x-data-grid';
import {
  listInventoryAction,
  listInventoryByIdAction,
  updateInventoryAction,
  getbyidInventoryAction,
  deleteInventoryAction,
  createInventoryAction,
  searchinventoryAction,
  set_searchinventoryAction,
  inventoryExportAction,
  paginationinventoryAction,
  supplierInvoiceListAction,
  scrabExportAction
} from '../../../redux/actions/inventory_actions';
import { stockUploadAction } from '../../../redux/actions/purchase_actions';
import { listStockLocationAction, listStockLocationSequenceAction } from '../../../redux/actions/stock_Location_actions';
import IndexForStockReturn from '../sales/cn_invoice/indexStock';
import {
  bulkProductAction,
  listProductAction,
  getLotNumberByIdAction
} from '../../../redux/actions/product_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Slide, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, TablePagination } from '@mui/material';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import MissingProduct from '../purchases/MissingProduct';
import { read, utils } from 'xlsx-js-style';
import FilterInventory from './FilterInventory';
import LotList from './LotListDialog';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import { Helmet } from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Inventoryservice from '../../../services/inventory_services';
// KPI values shown as inline chips in the header bar
import InventoryGridView from './InventoryGridView';
import ProductDetailDrawer from './ProductDetailDrawer';
import Box from '@mui/material/Box';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { Fonts } from 'shared/constants/AppEnums';
import Popup from 'pages/sales/purchases/Popup';
import { returnActions } from 'redux/actions/purchase_actions';
import { approvalUserRightsAction, creditDebitNoteSeq, creditDebitNoteSeqUpdate, getBillingcompany, sendMail } from 'redux/actions/sales_actions';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { listVendorIdAndNameAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';

import inventorybulk from './inventorybulkupload.xlsx';
import * as XLSX from "xlsx-js-style";

import AttachmentField from 'pages/common/Timesheet/Attachment';
import addInventory from '../../../assets/dashboardIcons/add-inventory.png';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareIcon from '@mui/icons-material/Share';


import { w3cwebsocket as W3CWebSocket } from "websocket";
import { web_socket_url } from '../../../http-common';
import Link from '@mui/material/Link';
import excelicon from 'assets/icon/excelicon.svg'
import { useLocation } from 'react-router-dom';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import moment from 'moment';
import HomeIcon from '@mui/icons-material/Home';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import socketManager from "../../../utils/socketManager"
import withRouter from '../../../utils/custWithRouter';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from 'utils/customFetchApiUrls';
import InvoiceDialog from 'pages/sales/sales/InvoiceDialog';

 const socket = new WebSocket(web_socket_url);
 const clientwebsocket = new W3CWebSocket(web_socket_url);
// socket.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   if (data.event === "UploadInventoryProgress") {
//   } else{
//   }
// };

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === "UploadProgress") {
  } else{
  }
};
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function withLocation(Component) {
  return function WrappedComponent(props) {
    const location = useLocation();
    return <Component {...props} location={location} />;
  };
}


function AlertDialogSlide({
  setValidationToDefault,
  lotAlreadyExists,
  setOpenAlert,
  duplicateLotNumber,
  filteredUploadData,
  uploadUnitPrice,
  uploadCostPrice,
  uploadLotnumber,
  uploadBrand,
  uploadCategory,
  uploadHsnCode,
  uploadTaxcategory,
}) {

  const [open, setOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(null)

  const handleClose = () => {
    setOpen(false);
    setOpenAlert(false)
    setValidationToDefault()
  };

  const errors = [
    { key: 'duplicateLot', label: 'Duplicate Lot in File', data: filteredUploadData, color: '#C62828' },
    { key: 'lotExists', label: 'Lot Already Exists', data: lotAlreadyExists, color: '#E65100' },
    { key: 'dupLotDb', label: 'Duplicate Lot in DB', data: duplicateLotNumber, color: '#E65100' },
    { key: 'unitPrice', label: 'Invalid Unit Price', data: uploadUnitPrice, color: '#C62828' },
    { key: 'costPrice', label: 'Invalid Cost Price', data: uploadCostPrice, color: '#C62828' },
    { key: 'lotNumber', label: 'Missing Lot Number', data: uploadLotnumber, color: '#E65100' },
    { key: 'brand', label: 'Missing Brand', data: uploadBrand, color: '#7B1FA2' },
    { key: 'category', label: 'Missing Category', data: uploadCategory, color: '#7B1FA2' },
    { key: 'hsnCode', label: 'Invalid HSN Code', data: uploadHsnCode, color: '#1565C0' },
    { key: 'taxCategory', label: 'Invalid Tax %', data: uploadTaxcategory, color: '#1565C0' },
  ].filter(e => e.data?.length > 0);

  const totalErrors = errors.reduce((sum, e) => sum + (e.data?.[1]?.length || 0), 0);
  const active = activeTab || (errors.length > 0 ? errors[0].key : null);
  const activeError = errors.find(e => e.key === active);

  return (
    <div>
      <Dialog open={open} fullWidth maxWidth="md" onClose={handleClose}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #E8EDF5' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#C62828', flex: 1 }}>
            Upload Errors — {totalErrors} issues found in {errors.length} categories
          </Typography>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1.5, flexWrap: 'wrap', borderBottom: '1px solid #F0F0F0' }}>
          {errors.map(e => (
            <Chip key={e.key} label={`${e.label} (${e.data?.[1]?.length || 0})`} size="small"
              variant={active === e.key ? 'filled' : 'outlined'}
              onClick={() => setActiveTab(e.key)}
              sx={{ fontSize: 11, height: 26, bgcolor: active === e.key ? e.color + '15' : undefined, color: active === e.key ? e.color : '#555', fontWeight: active === e.key ? 600 : 400, borderColor: e.color + '40' }} />
          ))}
        </Box>
        <DialogContent sx={{ p: 0, minHeight: 300 }}>
          {activeError && <Tables data={activeError.data[1]} tableName={activeError.key === 'duplicateLot' ? 'filteredUploadData' : activeError.key === 'lotExists' ? 'lotAlreadyExists' : activeError.key === 'dupLotDb' ? 'duplicateLotInDb' : activeError.key === 'unitPrice' ? 'uploadUnitPrice' : activeError.key === 'costPrice' ? 'uploadCostPrice' : activeError.key === 'lotNumber' ? 'uploadLotnumber' : activeError.key === 'brand' ? 'uploadBrand' : activeError.key === 'category' ? 'uploadCategory' : activeError.key === 'hsnCode' ? 'uploadHsnCode' : 'uploadTaxcategory'} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function AlertDialogBox({
  setOpenAlert,
  setValidationToDefault,
  dataLengthExcel,
  stockUpload,
  openprogreesclose,
  progreesapi
}) {

  const [openUpload, setOpenUpload] = useState(true)

  const handleClose = () => {
    setOpenUpload(false);
    setOpenAlert(false)
    setValidationToDefault()
  };

  return (
    <div>
      <Dialog
        open={openUpload}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby='alert-dialog-slide-description'
      >
        <LinearWithValueLabel stockUpload={stockUpload} dataLengthExcel={dataLengthExcel} onClose = {openprogreesclose} progreesapi = {progreesapi}/>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


class Inventory extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      headerupdate : null,
      open: false,
      update: true,
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      brand: '',
      category: '',
      supplier_name: '',
      count: 0,
      location: '',
      subcompanyId: 'All',
      filtedValue: {
        product_name: '',
        supplier_name: '',
        brand: '',
        category: '',
        location_id: 'null',
        max_price: '',
        min_price: '',
      },
      id: '',
      page: 0,
      pageSize: 20,
      searchData: [],
      searchVal: '',
      searchPageData: [],
      dataApi: [],
      lotList: { open: false, lots: [], name: '' },
      isApiFinished: false,
      dataLoading: false,
      allViewTotals: { grandTotal: 0, totalAvailableQty: 0, count: 0 },
      lotAlreadyExistInDb: [],
      openAlert: false,
      openProgress: false,
      progreesapi : false,
      lotAlreadyExists: [],
      duplicateLotNumber: [],
      filteredUploadData : [],
      uploadTaxcategory: [],
      uploadHsnCode: [],
      uploadCategory: [],
      uploadBrand: [],
      uploadLotnumber: [],
      uploadCostPrice: [],
      uploadUnitPrice: [],
      dataLengthExcel: '',
      alertOpen: false,
      selectAll: false,
      selectedProducts: [],
      openDialog: false,
      productDetails: [],
      selectedChip: 'All',
      columns: [],
      purchaseReturnFromInventory: false,
      editData: {},
      appConfigData: {},
      filePreviews: [],
      viewMode: 'list',
      detailDrawer: { open: false, product: null },
      invoiceOpen: false,
      columnVisibilityModel: {
        sku: false,
        hsn_code: false,
        tax_category: false,
        description: false,
        trans_is_serialized: false,
        trans_stock_type: false,
        lots: false,
      },
      sortConfig: { key: "total", order: "desc" },
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

        template: false,
        inventory_type: '',
        uploadDone: false,
        confirmation: false,
        serviceDueFiles: [],
        debitSequence:null
      },
      pageType: '',
      scheduleOpen : false,
      shareOpen : false,
      Schedulecolumns  : [
        { name: "Vendor Name", key: "supplier_name" },
        { name: "Product Name", key: "product_name" },
        { name: "Category", key: "category" },
        { name: "Brand", key: "brand" },
        { name: "Location", key: "location" },
        { name: "Price", key: "trans_items_cost_price" },
        { name: "Lot Number", key: "lot_number" },
        { name: "Total", key: "total" }
      ],
    };
    this.getColumns = this.getColumns.bind(this);
    this.customFetch = useCustomFetch()
  }

  handleScheduleClose = () => this.setState({scheduleOpen: false});
  handleShareClose = () => this.setState({shareOpen: false});

  filterHandler = (name, value) => {
    this.setState({ filtedValue: { ...this.state.filtedValue, [name]: value } });
  };

  storage = getsessionStorage()

  async componentDidMount() {
    // clientwebsocket.onmessage = async (message) => {
    //   let {event, content} = JSON.parse(message.data);
    //   if (event === 'stockUpload') {
    //   }
    // };
     const { headerLocationId } = this.context;
     this.setState({
      headerupdate: headerLocationId
    })
    const selectedRole = this.storage?.role_name;
    const { pathname } = this.props.location;
    this.setState({pageType: pathname})
    if (pathname === '/sales/inventory' && this.props.location?.state?.openUploadPopup) {
      this.setState({ template: true });
    }

    if (pathname === "/sales/lotItemWiseReport") {
      this.setState({ selectedChip: "stockByLotWise" });
    }
  
    const context = this.context;
    this.setState({
      columns: this.getColumns(this.state.selectedChip)
    });
    
   
    this.props.set_searchinventoryAction({ data: [], numRows: 0 });
    //this.fetchData(this.state.selectedChip);
    // await this.props.getAppConfigDataAction();
   
    const payload1 = {
      type : 'Margin'
      }
      this.props.approvalUserRightsAction(payload1)
      this.props.getUserRightsByRoleIdAction()

      const subcompany = this.storage.subcompany
      if(subcompany > 0) {
        this.props.getBillingcompany()
      }

       this.props.getMenuAccessAction(selectedRole)
  }


  getAppConfigData = async() => {

    // await this.props.getAppConfigDataAction();
    const { app_config_data } = this.props;
    //const locationData = this.props.stocklocation.filter(f => f.location_id === data.location_id)
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


  async componentDidUpdate(preProps, preState) {


    const { pathname } = this.props.location;
    
    // Capture All-view totals for KPI cards (update when chip is All and data changes)
    if (this.state.selectedChip === 'All' && this.props.grandTotal >= 0 &&
        (this.state.allViewTotals.grandTotal !== this.props.grandTotal || this.state.allViewTotals.count !== this.props.Count)) {
      this.setState({ allViewTotals: { grandTotal: this.props.grandTotal, totalAvailableQty: this.props.totalAvailableQty, count: this.props.Count } });
    }

    if (pathname !== this.state.pageType) {
      window.location.reload();
      const typePage = pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise"
      this.setState({pageType: pathname, selectedChip: typePage})
    }
    // if (
    //   preProps.app_config_data !== this.props.app_config_data &&
    //   this.props.app_config_data.length > 0
    // ) {
    //   this.getAppConfigData();

    if ((preState.template === undefined || preState.template.template === false) && this.state.template === true) {
    if (this.props.app_config_data.length > 0) {
       const data = this.props.app_config_data.find((e) => e.key_name === 'inventory.upload');
       return this.setState({inventory_type:data?.value})
    }
  }
      
      // if(this.props.app_config_data.length > 0){
      //   const data = this.props.app_config_data.find((e) => e.key_name === 'inventory.upload');
      //   return this.setState({inventory_type:data?.value})
        
      // }
    // }
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (preState.pageSize !== this.state.pageSize || this.state.progreesapi ) {
      const { name, brand, category, supplier_name, max_price, min_price, location_id } =
        this.state.filtedValue;
        let sortKey = this.state.sortConfig?.key || "total"; 
        let sortOrder = this.state.sortConfig?.order || "asc"; 
      const data = {
        product_name:
          name !== undefined ? this.commonMapping(name, 'name') : '',
        supplier_name: supplier_name !== undefined
          ? Array.isArray(supplier_name) && supplier_name.length > 0
            ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
            : this.commonMapping(supplier_name, 'supplier_name')
          : '',
        brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
        category:
          category !== undefined
            ? this.commonMapping(category, 'category')
            : '',
        location_id:
          location_id !== undefined
            ? this.commonMapping(location_id, 'location_id') || [location_id]
            : context.headerLocationId,
        user_id: context.commoncookie,
        max_price: max_price !== undefined ? max_price : '',
        min_price: min_price !== undefined ? min_price : '',
        // gb value for mobile application
        gb: '',
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
        sortKey: sortKey, 
        sortOrder: sortOrder,
        pageType: this.state.pageType,
        sub_company_id : this.state.subcompanyId
      };
      // const data={product_name,brand,category,max_price,min_price,location_id :location_id,user_id:context.commoncookie,pageCount: this.state.page || 0,
      // numPerPage: size}

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paginationinventoryAction(
          context.commoncookie,
          context.headerLocationId,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      ).finally((res) => this.setState({ isApiFinished: true }));
       this.setState({ progreesapi: false });
    }

    if (preState.page !== this.state.page) {
      const { name, brand, category, supplier_name, max_price, min_price, location_id } =
        this.state.filtedValue;
        let sortKey = this.state.sortConfig?.key || "total"; 
        let sortOrder = this.state.sortConfig?.order || "asc"; 

      const data = {
        product_name:
          name !== undefined ? this.commonMapping(name, 'name') : '',
        supplier_name: supplier_name !== undefined
          ? Array.isArray(supplier_name) && supplier_name.length > 0
            ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
            : this.commonMapping(supplier_name, 'supplier_name')
          : '',
        brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
        category:
          category !== undefined
            ? this.commonMapping(category, 'category')
            : '',
        location_id:
          location_id !== undefined
            ? this.commonMapping(location_id, 'location_id') || [location_id]
            : context.headerLocationId,
        user_id: context.commoncookie,
        max_price: max_price !== undefined ? max_price : '',
        min_price: min_price !== undefined ? min_price : '',
        // gb value for mobile application
        gb: '',
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
        sortKey: sortKey, 
        sortOrder: sortOrder,
        pageType: this.state.pageType,
        sub_company_id : this.state.subcompanyId
      };

      // const data={product_name,brand,category,max_price,min_price,location_id,user_id:context.commoncookie, pageCount: page || 0,
      // numPerPage:  pageSize}
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paginationinventoryAction(
          context.commoncookie,
          context.headerLocationId,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      );
    }

    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;
      // Reset cached KPI totals so they refresh with new location
      this.setState({ allViewTotals: { grandTotal: 0, totalAvailableQty: 0, count: 0 } });
      const { name, brand, category, supplier_name, max_price, min_price, location_id } =
        this.state.filtedValue;
        let sortKey = this.state.sortConfig?.key || "total"; 
        let sortOrder = this.state.sortConfig?.order || "asc"; 
      const data = {
        product_name:
          name !== undefined ? this.commonMapping(name, 'name') : '',
        supplier_name: supplier_name !== undefined
          ? Array.isArray(supplier_name) && supplier_name.length > 0
            ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
            : this.commonMapping(supplier_name, 'supplier_name')
          : '',
        brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
        category:
          category !== undefined
            ? this.commonMapping(category, 'category')
            : '',
        location_id: context.headerLocationId,
        user_id: context.commoncookie,
        max_price: max_price !== undefined ? max_price : '',
        min_price: min_price !== undefined ? min_price : '',
        // gb value for mobile application
        gb: '',
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
        sortKey: sortKey, 
        sortOrder: sortOrder,
        pageType: this.state.pageType,
        sub_company_id : this.state.subcompanyId
      };
      this.setState({
        filtedValue: { ...this.state.filtedValue, location_id: headerLocationId },
      });
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paginationinventoryAction(
          context.commoncookie,
          headerLocationId,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      ).finally(() => this.setState({ isApiFinished: true }));
    }
  }

  handleSort = (columnKey) => {
    this.setState((prevState) => ({
      sortConfig: {
        key: columnKey,
        order: prevState.sortConfig.key === columnKey && prevState.sortConfig.order === "asc"
          ? "desc"
          : "asc",
      },
    }), () => {
      this.fetchData(this.state.selectedChip);
    });
  };
  

  createMail = async() => {

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


  fetchData(type) {
    const context = this.context;
   
    const { name, brand, supplier_name, category, max_price, min_price, location_id } = this.state.filtedValue;
    const { pathname } = this.props.location;


    let { key, order } = this.state.sortConfig;

    const data = {
      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      supplier_name: supplier_name !== undefined
        ? Array.isArray(supplier_name) && supplier_name.length > 0
          ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
          : this.commonMapping(supplier_name, 'supplier_name')
        : '',
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
      category: category !== undefined ? this.commonMapping(category, 'category') : '',
      location_id:  location_id !== undefined && location_id !== null ? this.commonMapping(location_id, 'location_id') : context.headerLocationId,
      user_id: context.commoncookie,
      max_price: max_price !== undefined ? max_price : '',
      min_price: min_price !== undefined ? min_price : '',
      gb: '',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sortKey: key, 
      sortOrder: order,
      pageType: pathname,
      sub_company_id : this.state.subcompanyId
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paginationinventoryAction(
        context.commoncookie,
        context.headerLocationId,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    ).finally((res) => this.setState({ isApiFinished: true }));
  }




  // creditSequenceUpdate = () => {
  //   const { sequence_id, current_seq } = this.props.credit_debit_seq;
  //   this.props.creditDebitNoteSeqUpdate('debit', { current_seq, sequence_id });
  //   this.setState({ headerupdate: 'null' })
  // };

  oldSequenceGet = (old_sequence) => {
   
    this.setState({ debitSequence: old_sequence })
  };


  cnInvoiceFunction = async (data) => {
    const custData =
      (await this.props.vendor.find(
        (d) => data.supplier_id === d.supplier_id,
      )) || this.state.customer_data;
    this.setState({
      cnPopupData: {
        ...data,
        po_number: this.props.credit_debit_seq.debit_note,
        custData,
        vendLedgerId: custData.ledger_id,
        Dopen: true,

      },
    });
    // this.ledgerReturnApi();

    // For NewData AfterPurchaseReturnedReload
    this.setState({ headerupdate: '' })
  };

  handleChipSelection = (chip) => {
    // Clear data immediately to prevent stale/encrypted values flashing
    this.props.set_searchinventoryAction({ data: [], numRows: -1, grandTotal: -1, totalAvailableQty: -1 });
    this.setState({ selectedChip: chip, searchVal: '', isApiFinished: false, page: 0 }, () => {
      const columns = this.getColumns(this.state.selectedChip);
      this.setState({ columns });
      this.fetchData(chip);
    });
  };


  handleSelectAll = (type, rowdata) => {
    if (type === 'stockByVendor') {
      const filteredData = rowdata.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.supplier_id === value.supplier_id)
      );

      const sup_id = filteredData[0]?.supplier_id;
      const sub_company_id = filteredData[0]?.sub_company_id;
      const matchingValues = rowdata.filter(
        (v) => v.supplier_id === sup_id && v.sub_company_id === sub_company_id
      );
      const allSelected = matchingValues.length === rowdata.length;


      if (allSelected) {
        if (this.state.selectedProducts?.length === 0) {
          const currentDate = new Date();
          const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          let receivings_items = [];
          matchingValues.forEach((item) => {
            item.invoice.forEach((invoice) => {
              const receivings_item = {
                ...invoice,
                taxes: item.taxes,
                lots: item.lots
              };
              receivings_items.push(receivings_item);
            });
          });

          const editData = {
            supplier_id: sup_id,
            sub_company_id : sub_company_id,
            return_time: formatDate(currentDate),
            receivings_items: receivings_items
          };

          this.setState({
            selectedProducts: matchingValues,
            selectAll: true,
            editData: editData
          });
        } else {
          this.setState({
            selectedProducts: [],
            selectAll: false
          });
        }
      } else if (matchingValues.length > 0) {
        alert('Partially selecting items from the same vendor.');
        this.setState({
          selectedProducts: matchingValues,
          selectAll: false
        });
      } else {
        alert('You can only select products from the same vendor!');
        return;
      }
    }

    else {
      alert('You can only select products from the same vendor!');
      return;
    }

  }

  handleSelectProduct = (rowData, type) => {
    const { selectedProducts } = this.state;
    let updatedSelectedProducts = [...selectedProducts];


    if (type === 'stockByCategory') {

      if (rowData.supplierCount > 1) {
        alert('You can only select products from the same vendor!');
        return;
      }
      const productIndex = updatedSelectedProducts.findIndex(product => product.category === rowData.category);

      if (productIndex !== -1) {
        updatedSelectedProducts.splice(productIndex, 1);
      } else {
        updatedSelectedProducts.push(rowData);
      }

      const productLevelSubs = updatedSelectedProducts.map(p => p.sub_company_id);
      // Collect sub_company_id from all invoices
      const invoiceLevelSubs = [];
      updatedSelectedProducts.forEach(item => {
        item.invoice.forEach(inv => {
          invoiceLevelSubs.push(inv.sub_company_id);
        });
      });

      // Combine both levels
      const allSubCompanies = [...productLevelSubs, ...invoiceLevelSubs];

      // Unique values
      const uniqueSubCompanies = new Set(allSubCompanies);

      // Validate mismatch
      if (uniqueSubCompanies.size > 1) {
        alert("You can only select products from the same Sub-Company!");
        return;
      }
      let editData = {}
      let receivings_items = []
      if (updatedSelectedProducts.length > 0) {
        editData.supplier_id = updatedSelectedProducts[0].supplier_id
        const currentDate = new Date();


        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };


        editData.return_time = formatDate(currentDate);
        updatedSelectedProducts.map((item) => {
          item.invoice.map((invoice) => {
            editData.receiving_id = invoice.receiving_id
            editData.sub_company_id = invoice.sub_company_id
            let receivings_item = { ...invoice, taxes: item.taxes, lots: item.lots, is_serialized : item.is_serialized }
            receivings_items.push(receivings_item)
          })


        })
        editData.receivings_items = receivings_items
      }
      const allRowsSelected = updatedSelectedProducts.length === this.props.search_value.length;

      this.setState({
        selectedProducts: updatedSelectedProducts,
        selectAll: allRowsSelected,
        editData: editData
      });



    } else if (type === 'stockByBrand') {

      if (rowData.supplierCount > 1) {
        alert('You can only select products from the same vendor!');
        return;
      }

      const productIndex = updatedSelectedProducts.findIndex(product => product.brand === rowData.brand);

      if (productIndex !== -1) {
        updatedSelectedProducts.splice(productIndex, 1);
      } else {
        updatedSelectedProducts.push(rowData);
      }

      const productLevelSubs = updatedSelectedProducts.map(p => p.sub_company_id);
      // Collect sub_company_id from all invoices
      const invoiceLevelSubs = [];
      updatedSelectedProducts.forEach(item => {
        item.invoice.forEach(inv => {
          invoiceLevelSubs.push(inv.sub_company_id);
        });
      });

      // Combine both levels
      const allSubCompanies = [...productLevelSubs, ...invoiceLevelSubs];

      // Unique values
      const uniqueSubCompanies = new Set(allSubCompanies);

      // Validate mismatch
      if (uniqueSubCompanies.size > 1) {
        alert("You can only select products from the same Sub-Company!");
        return;
      }

      let editData = {}
      let receivings_items = []
      if (updatedSelectedProducts.length > 0) {
        editData.supplier_id = updatedSelectedProducts[0].supplier_id
        const currentDate = new Date();


        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        editData.return_time = formatDate(currentDate);
        updatedSelectedProducts.map((item) => {
          item.invoice.map((invoice) => {
            editData.receiving_id = invoice.receiving_id
             editData.sub_company_id = invoice.sub_company_id
            let receivings_item = { ...invoice, taxes: item.taxes, lots: item.lots, is_serialized : item.is_serialized }
            receivings_items.push(receivings_item)
          })


        })
        editData.receivings_items = receivings_items
      }
      const allRowsSelected = updatedSelectedProducts.length === this.props.search_value.length;

      this.setState({
        selectedProducts: updatedSelectedProducts,
        selectAll: allRowsSelected,
        editData: editData
      });
    } else if (type === 'stockByVendor') {




      const productIndex = updatedSelectedProducts.findIndex(product =>
        product.trans_items === rowData.trans_items &&
        product.supplier_id === rowData.supplier_id &&
        product.trans_location === rowData.trans_location && 
        product.sub_company_id === rowData.sub_company_id
      );

      if (productIndex !== -1) {
        updatedSelectedProducts.splice(productIndex, 1);
      } else {
        updatedSelectedProducts.push(rowData);
      }

      // Collect sub_company_id from product level
      const productLevelSubs = updatedSelectedProducts.map(p => p.sub_company_id);

      // Collect sub_company_id from all invoices
      const invoiceLevelSubs = [];
      updatedSelectedProducts.forEach(item => {
        item.invoice.forEach(inv => {
          invoiceLevelSubs.push(inv.sub_company_id);
        });
      });

      // Combine both levels
      const allSubCompanies = [...productLevelSubs, ...invoiceLevelSubs];

      // Unique values
      const uniqueSubCompanies = new Set(allSubCompanies);

      // Validate mismatch
      if (uniqueSubCompanies.size > 1) {
        alert("You can only select products from the same Sub-Company!");
        return;
      }


      let editData = {}
      let receivings_items = []
      if (updatedSelectedProducts.length > 1) {

        const uniqueSuppliers = new Set(updatedSelectedProducts.map(product => product.supplier_id));
        if (uniqueSuppliers.size > 1) {
          alert('You can only select products from the same vendor!');
          return;
        }

      }

      if (updatedSelectedProducts.length > 0) {
        editData.supplier_id = updatedSelectedProducts[0].supplier_id
        const currentDate = new Date();


        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };


        editData.return_time = formatDate(currentDate);
        updatedSelectedProducts.map((item) => {
          item.invoice.map((invoice) => {
            editData.receiving_id = invoice.receiving_id
            editData.sub_company_id = invoice.sub_company_id
            let receivings_item = { ...invoice, taxes: item.taxes, lots: item.lots }
            receivings_items.push(receivings_item)
          })


        })
        editData.receivings_items = receivings_items
      }

      const allRowsSelected = updatedSelectedProducts.length === this.props.search_value.length;


      this.setState({
        selectedProducts: updatedSelectedProducts,
        selectAll: allRowsSelected,
        editData: editData
      });


    }
    else if(type === 'stockByLotWise') {
      if(rowData.supplierCount > 1) {
        alert('You can only select products from the same vendor!')
        return
      }

      if (updatedSelectedProducts.length > 0) {
        const existingLotNumber = updatedSelectedProducts[0].lot_number;
        if (rowData.lot_number !== existingLotNumber) {
          alert('You can only select products from the same lot number!');
          return;
        }
      }

      const productIndex = updatedSelectedProducts.findIndex(product => product.lot_number === rowData.lot_number)

      if(productIndex !== -1) {
        updatedSelectedProducts.splice(productIndex, 1)
      }
      else {
        updatedSelectedProducts.push(rowData)
      }
      const allSubCompanies = [];
      updatedSelectedProducts.forEach(item => {
        item.invoice.forEach(inv => {
          allSubCompanies.push(inv.sub_company_id);
        });
      });

      const uniqueSubCompanies = new Set(allSubCompanies);

      if (uniqueSubCompanies.size > 1) {
        alert("You can only select products from the same Company!");
        return;
      }

      let editData = {}
      let receivings_items = []

      if(updatedSelectedProducts.length > 0) {
        editData.supplier_id = updatedSelectedProducts[0].supplier_id
        const currentDate = new Date()

        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        }

        editData.return_time = formatDate(currentDate)
        updatedSelectedProducts.map((item) => {
          item.invoice.map((invoice) => {
            editData.receiving_id = invoice.receiving_id
            editData.sub_company_id = invoice?.sub_company_id
            let receivings_item = {...invoice, taxes : item.taxes, lot_number : item.lot_number, is_serialized : item.is_serialized}
            receivings_items.push(receivings_item)
          })
        })
        editData.receivings_items = receivings_items
      }
      const allRowsSelected = updatedSelectedProducts.length === this.props.search_value.length

      this.setState({
        selectedProducts : updatedSelectedProducts,
        selectAll : allRowsSelected,
        editData : editData
      })
    }

  };




  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  };

  handlePurchaseReturn = () => {
    this.setState({ purchaseReturnFromInventory: true });
  };

  handleCloseForPurchaseReturn = () => {

    this.setState({ purchaseReturnFromInventory: false, selectedProducts: [], headerupdate: 'null', selectAll: false });
    this.fetchData(this.state.selectedChip);
  };


  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidInventoryAction(id),
    );
    this.setState({ open: true, status: 'edit' });
  };

  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteInventoryAction(id),
    );
    this.setState({ delete: false });
  };

  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };

  responseDialog = (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };

  handleClose = () => {
    this.setState({ open: false, dialog: false, delete: false });
  };

  handleSubmit = async (data) => {
    const context = this.context;
    const values = data;
    for (let val in values) {
      if (values[val] === true) {
        values[val] = 'Y';
      }
      if (values[val] === false) {
        values[val] = 'N';
      }
    }
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateInventoryAction(data.id, values),
      );
      await this.setState({ open: false });
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createInventoryAction(values),
      );
      await this.setState({ open: false });
    }
  };

  handleDeactive = async (data, status) => {
    const context = this.context;
    const active = { is_active: status };
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateInventoryAction(data.id, active),
      );
      await this.setState({ open: false });
    }
  };

  singleTax = (prc = 0, qty = 1, data) => {
    const val = prc * qty + ((prc * qty) / 100) * this.getIgst(data);
    return val;
  };

  getIgst = (data) => {
    let tax = '';

    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

  setInventoryUploadPreviews = (newPreviews) => {
    this.setState((prevState) => ({
      filePreviews:
        typeof newPreviews === 'function'
          ? newPreviews(prevState.filePreviews)
          : newPreviews,
    }));
  };

  resetUploadValidation = () => {
    this.apiCalled = false;
    this.setState({
      lotAlreadyExists: [],
      duplicateLotNumber: [],
      filteredUploadData: [],
      uploadTaxcategory: [],
      uploadHsnCode: [],
      uploadCategory: [],
      uploadBrand: [],
      uploadLotnumber: [],
      uploadCostPrice: [],
      uploadUnitPrice: [],
    });
  };

  handlefileupload = async () => {
    const selectedFile = Array.isArray(this.state.filePreviews)
      ? this.state.filePreviews[0]
      : '';

    if (!selectedFile) {
      this.setState({ confirmation: false, template: true });
      return;
    }

    this.resetUploadValidation();
    this.setState({ uploadDone: true, confirmation: false, template: false });

    try {
      await this.encodeBase64ExcelFile(selectedFile);
      this.setState({ filePreviews: [] })
    } catch (err) {
      console.error('Inventory upload failed:', err);
      this.setState({ uploadDone: false, template: true });
    }
  }

  // encodeImageFileAsURL = (e) => {

  //   const location_id = this.context.headerLocationId;

  //   // const reader = new FileReader();
  //   // const rABS = !!reader.readAsBinaryString;
  //   const file = this.state.filePreviews;

  //   // reader.onload = (e) => {
  //   //   const bstr = e.target.result;
  //   //   const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
  //   //   const wsname = wb.SheetNames[0];
  //   //   const ws = wb.Sheets[wsname];
  //   //   const temp1 = utils.sheet_to_json(ws);

  //   //   const temp_1_xl_data = temp1.filter((i) => i.name).map(i => ({ ...i, name: i.name.toString() }));

  //   //   const data = temp_1_xl_data.map((i) => removeUnnecessaryChar(i));

  //   //   function removeUnnecessaryChar(data) {

  //   //     let tempObj = {};

  //   //     for (let key in data) {
  //   //       let val = data[key];
  //   //       let modifiedVal;
  //   //       if (val !== undefined && typeof val === 'string') {
  //   //         modifiedVal = val.replace(/(\r\n|\n|\r)/gm, '').trim();
  //   //       }
  //   //       if (['lot_number'].includes(key)) {
  //   //         tempObj[key] = modifiedVal || val;
  //   //       } else {
  //   //         tempObj[key] = modifiedVal || val;
  //   //       }
  //   //     }

  //   //     return tempObj;
  //   //   }

  //   //   const withItemId = [];
  //   //   const wOutItemId = [];


  //   //   let flag = false;

  //   //   let filteredData = data.filter((e) => e.is_serialized === 1);


  //   //   let tempDuplicateLot = filteredData
  //   //     .map((e) => e['lot_number'])
  //   //     .map((e, i, final) => final.indexOf(e) !== i && i)
  //   //     .filter((obj) => filteredData[obj])
  //   //     .map((e) => ({ name: filteredData[e]['name'], lot: filteredData[e]['lot_number'] }));




  //   //   let lotAlreadyExists = [];
  //   //   const LotsFilter = async (data) => {
  //   //     for (const product of this.props.product) {
  //   //       const { lots, is_serialized } = product;
  //   //       if (is_serialized === 1) {
  //   //         for (const lot of lots) {
  //   //           if (lot.lot_number === data.lot_number) {
  //   //             lotAlreadyExists.push(data);
  //   //             // lotAlreadyExists.push(lot.lot_number);
  //   //           }
  //   //         }
  //   //       }
  //   //     }
  //   //   };

  //   //   data.forEach((x) => LotsFilter(x));



  //   //   if (tempDuplicateLot.length > 0 || lotAlreadyExists.length > 0) {
  //   //     flag = false;


  //   //     if (tempDuplicateLot.length > 0) {
  //   //       this.setState({
  //   //         duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot],
  //   //       });
  //   //     }

  //   //     if (lotAlreadyExists.length > 0) {
  //   //       let temp = lotAlreadyExists.map((item) => ({
  //   //         ['name']: item.name,
  //   //         ['lot']: item.lot_number,
  //   //       }));
  //   //       this.setState({
  //   //         lotAlreadyExists: ['Lot Already Exits in Database', temp],
  //   //       });
  //   //     }
  //   //   }

  //   //   else {
  //   //     flag = true;
  //   //   }




  //   //   // const matchingProduct = this.props.product.filter(f=> data.some(d=> f.name === d.name))

  //   //   // matchingProduct.forEach((t, index) => {
  //   //   //   const {
  //   //   //     cost_price: item_cost_price,
  //   //   //     unit_price: item_unit_price,
  //   //   //     taxes,
  //   //   //   } = t;
  //   //   //   let gst;
  //   //   //   let tax_category;
  //   //   //   taxes.forEach((s) => {
  //   //   //     if (s.tax_group === 'IGST') {
  //   //   //       gst = s.tax_rate;
  //   //   //       tax_category = s.tax_category;
  //   //   //     }
  //   //   //   });

  //   //   //   let lots = [];
  //   //   //         if (+t.is_serialized === 0 && +t.receiving_quantity) {
  //   //   //           for (let i = 0; i < +t.receiving_quantity; i++) {
  //   //   //             lots.push({ lot_number: '' });
  //   //   //           }
  //   //   //         } else if (t.lot_number) {
  //   //   //           lots.push({ lot_number: t.lot_number });
  //   //   //         }
  //   //   //     withItemId.push({
  //   //   //       ...t,
  //   //   //       gst,
  //   //   //       tax_category,
  //   //   //       item_cost_price: data.cost_price,
  //   //   //       item_unit_price: data.unit_price,
  //   //   //       quantity: data.receiving_quantity,
  //   //   //       prod_val: true,
  //   //   //       sub_total: this.singleTax(item_cost_price, data.receiving_quantity, {
  //   //   //         taxes,
  //   //   //       }).toFixed(2),
  //   //   //       received_quantity: data.receiving_quantity,
  //   //   //       ordered_quantity: data.receiving_quantity,
  //   //   //       receiving_quantity: data.receiving_quantity,
  //   //   //       lots: lots,
  //   //   //     });





  //   //   // });

  //   //   // let MisMatchProduct = data.filter(d => !this.props.product.some(f => f.name === d.name))
  //   //   //     MisMatchProduct.forEach((misMatch,index)=>{

  //   //   //       wOutItemId.push(misMatch);
  //   //   //     })






  //   //   // data
  //   //   data.forEach((d) => {

  //   //     const isItem = this.props.product.some((t) => {
  //   //       const {
  //   //         cost_price: item_cost_price,
  //   //         unit_price: item_unit_price,
  //   //         taxes,
  //   //       } = t;
  //   //       let gst;
  //   //       let tax_category;
  //   //       taxes.forEach((s) => {
  //   //         if (s.tax_group === 'IGST') {
  //   //           gst = s.tax_rate;
  //   //           tax_category = s.tax_category;
  //   //         }
  //   //       });

  //   //       if (t.name === d.name.toString()) {
  //   //         let lots = [];
  //   //         if (+d.is_serialized === 0 && +d.receiving_quantity) {
  //   //           for (let i = 0; i < +d.receiving_quantity; i++) {
  //   //             lots.push({ lot_number: '' });
  //   //           }
  //   //         } else if (d.lot_number) {
  //   //           lots.push({ lot_number: d.lot_number });
  //   //         }



  //   //         withItemId.push({
  //   //           ...t,
  //   //           gst,
  //   //           tax_category,
  //   //           item_cost_price: d.cost_price,
  //   //           item_unit_price: d.unit_price,
  //   //           quantity: d.receiving_quantity,
  //   //           prod_val: true,
  //   //           sub_total: this.singleTax(item_cost_price, d.receiving_quantity, {
  //   //             taxes,
  //   //           }).toFixed(2),
  //   //           received_quantity: d.receiving_quantity,
  //   //           ordered_quantity: d.receiving_quantity,
  //   //           receiving_quantity: d.receiving_quantity,
  //   //           lots,
  //   //         });
  //   //         return true;
  //   //       }
  //   //       return false;
  //   //     });


  //   //     if (!isItem) {
  //   //       if (d.name) wOutItemId.push(d);
  //   //     }

  //   //     // let MisMatchProduct = data.filter(d => !this.props.product.some(f => f.name === d.name))
  //   //     // MisMatchProduct.forEach((misMatch,index)=>{

  //   //     //   wOutItemId.push(misMatch);
  //   //     // })
  //   //   });

  //   //   if (wOutItemId.length) {
  //   //     const dataApi = wOutItemId.map((d) => {
  //   //       const newD = {
  //   //         ...d,
  //   //         supplier_name: d.supplier_name ? d.supplier_name : null,
  //   //         brand: d.brand ? d.brand : null,
  //   //         category: d.category ? d.category : null,
  //   //         model: d.model ? d.model : null,
  //   //         cost_price: d.cost_price ? d.cost_price : null,
  //   //         unit_price: d.unit_price ? d.unit_price : null,
  //   //         max_price: 0,
  //   //       };
  //   //       delete newD.lot_number;

  //   //       return {
  //   //         ...newD,
  //   //         stock_type: 1,
  //   //         unit_price: +d.unit_price || d.cost_price,
  //   //       };
  //   //     });

  //   //     if (flag) {
  //   //       this.setState({ mp_open: true, dataApi, withItemId, xl_data: data });
  //   //     } else {
  //   //       this.setState({ openAlert: true });
  //   //     }
  //   //   } else {
  //   //     const dataLengthExcel = data.length;

  //   //     if (flag) {
  //   //       this.setState({ openProgress: true });
  //   //       const employee_id = this.context.commoncookie;
  //   //       apiCalls(
  //   //         this.context.setModalTypeHandler,
  //   //         this.context.setLoaderStatusHandler,
  //   //         this.props.stockUploadAction(
  //   //           { data_items: withItemId, employee_id, location_id },
  //   //           this.context.setLoaderStatusHandler,
  //   //         ),
  //   //       );
  //   //       this.setState({ dataLengthExcel });
  //   //     } else {
  //   //       this.setState({ openAlert: true });
  //   //     }
  //   //   }

  //   // };

  //   // if (rABS) {
  //   //   reader.readAsBinaryString(file);
  //   // } else {
  //   //   reader.readAsArrayBuffer(file);
  //   // }
  // };

  encodeBase64ExcelFile = async(base64String) => {


    this.props.listTaxCategoryAction()
    this.props.listProductAction(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
    );
    const location_id = this.context.headerLocationId;
    // Decode Base64 string to binary
    const binaryString = atob(base64String.split(",")[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // Read Excel data
    const wb = read(bytes, { type: "array", bookVBA: true });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const temp1 = utils.sheet_to_json(ws, { raw: false, defval: '' });

    const temp_1_xl_data = temp1.filter((i) => i.name).map(i => ({
      ...i,
      name: i.name.toString(),
      lot_number: i.lot_number != null ? String(i.lot_number).trim() : '',
      SKU: i.SKU != null ? String(i.SKU).trim() : '',
      model: i.model != null ? String(i.model).trim() : '',
      hsn_code: i.hsn_code != null ? String(i.hsn_code).replace(/\s/g, '') : '',
      cost_price: i.cost_price != null ? Number(String(i.cost_price).replace(/,/g, '')) : 0,
      unit_price: i.unit_price != null ? Number(String(i.unit_price).replace(/,/g, '')) : 0,
      max_price: i.max_price != null ? Number(String(i.max_price).replace(/,/g, '')) : 0,
      receiving_quantity: i.receiving_quantity != null ? Number(i.receiving_quantity) : 0,
      tax_percentage: i.tax_percentage != null ? Number(i.tax_percentage) : 0,
      qty_per_pack: i.qty_per_pack != null ? Number(i.qty_per_pack) : 1,
    }));
    const datas = temp_1_xl_data.map((i) => removeUnnecessaryChar(i));
    const updatedTempData = datas.map(item => ({
      ...item,
      is_serialized: ['no', '0', 'non serial', 'non serialized', 'false'].includes(String(item.is_serialized || '').toLowerCase().trim()) ? 0 : 1
  }));
    let data = updatedTempData
   
    function removeUnnecessaryChar(data) {
        let tempObj = {};
        for (let key in data) {
            let val = data[key];
            let modifiedVal;
            if (val !== undefined && typeof val === 'string') {
                modifiedVal = val.replace(/(\r\n|\n|\r)/gm, '').trim();
            }
            tempObj[key] = modifiedVal !== undefined ? modifiedVal : val;
        }
        return tempObj;
    }

    const withItemId = [];
    const wOutItemId = [];


    let flag = false;
    let filteredData = data.filter((e) => e.is_serialized === 1);
   let filteredUploadData = data.filter((e) => {
      return (
        (e.is_serialized === 1 && e.receiving_quantity !== 1) ||
        (e.is_serialized === 0 && e.receiving_quantity < 0)
      );
    });
    
    let taxCategory = data.filter(
    (e) => typeof e.tax_percentage !== "number" || Number.isNaN(e.tax_percentage) || e.tax_percentage < 0 || !this.props.taxcategory.some(
      (tax) => tax.tax_group_sequence == e.tax_percentage
    )
    );
    if(!this.props.taxcategory?.length){
       taxCategory = []
    }
   
     let cost_price = data.filter(
    (e) => typeof e.cost_price !== "number" || Number.isNaN(e.cost_price) || e.cost_price <= 0
    );
     let unit_price = data.filter(
    (e) => typeof e.unit_price !== "number" || Number.isNaN(e.unit_price) || e.unit_price < 0
    );
    let hsn_code = data.filter(
    (e) => ![4, 6, 8].includes(String(e.hsn_code || '').length)
    );
    let lot_number = data.filter((e) => (e.is_serialized === 1 && e.lot_number === '') || (e.is_serialized === 0 && e.lot_number === ''));
    let category = data.filter(
      (e) => !e.category || e.category?.trim() === ''
    );

    let brand = data.filter(
      (e) => !e.brand || e.brand?.trim() === ''
    );

    

    let tempDuplicateLot = filteredData
        .map((e) => e['lot_number'])
        .map((e, i, final) => final.indexOf(e) !== i && i)
        .filter((obj) => filteredData[obj])
        .map((e) => ({ name: filteredData[e]['name'], lot: filteredData[e]['lot_number'] }));

    let lotAlreadyExists = [];

    // const LotsFilter = async (data) => {
    //   for (const product of this.props.product) {
    //       const { lots, is_serialized } = product;
    //         if (is_serialized === 1) {
    //           for (const lot of lots) {
    //             if ((String(lot.lot_number).trim() === String(data.lot_number).trim())) {
    //                     lotAlreadyExists.push(data);
    //                 }
    //             }
    //         }
    //     }
    // };

    // data.forEach((x) => LotsFilter(x));

    // Build existing lot set once
    const existingLots = new Set();

    this.props.product.forEach(p => {
      if (Number(p.is_serialized) === 1) {
        p.lots?.forEach(l => {
          if (l?.lot_number) {
            existingLots.add(String(l.lot_number).trim());
          }
        });
      }
    });

    // Find excel lots already in DB
    lotAlreadyExists = data.filter(d =>
      d.lot_number && existingLots.has(String(d.lot_number).trim())
    );


    if (tempDuplicateLot.length > 0 || lotAlreadyExists.length > 0 || filteredUploadData.length > 0 || taxCategory.length > 0 || cost_price.length > 0 || unit_price.length > 0 || hsn_code.length > 0 || lot_number.length > 0 || category.length > 0 || brand.length > 0) {
        flag = false;
        if (tempDuplicateLot.length > 0) {
            this.setState({
                duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot],
            });
        }
        if (lotAlreadyExists.length > 0) {
            let temp = lotAlreadyExists.map((item) => ({
                name: item.name,
                lot: item.lot_number,
            }));
            this.setState({
                lotAlreadyExists: ['Lot Already Exists in Database', temp],
            });
        }
        if(filteredUploadData.length > 0){
           let temp = filteredUploadData.map((item) => ({
                name: item.name,
                lot: item.lot_number,
                receiving_quantity : item.receiving_quantity
            }));
            this.setState({
                filteredUploadData: [' Cant be more than 1 receiving quantity', temp],
            });
        }
        
        if(taxCategory.length > 0){
           let temp = taxCategory.map((item) => ({
                name: item.name,
                tax_percentage : item.tax_percentage
            }));
            this.setState({
                uploadTaxcategory: [' check the tax category',temp],
            });
        }
        if(cost_price.length > 0){
           let temp = cost_price.map((item) => ({
                name: item.name,
                cost_price : item.cost_price
            }));
            this.setState({
                uploadCostPrice: [' check the Cost price',temp],
            });
        }
        if(cost_price.length > 0){
           let temp = cost_price.map((item) => ({
                name: item.name,
                cost_price : item.cost_price
            }));
            this.setState({
                uploadCostPrice: [' check the Cost price',temp],
            });
        }
        if(unit_price.length > 0){
           let temp = unit_price.map((item) => ({
                name: item.name,
                unit_price : item.unit_price
            }));
            this.setState({
                uploadUnitPrice: [' check the Unit price',temp],
            });
        }
        if(hsn_code.length > 0){
           let temp = hsn_code.map((item) => ({
                name: item.name,
                hsn_code : item.hsn_code
            }));
            this.setState({
                uploadHsnCode: [' check the HSN code',temp],
            });
        }
        if(lot_number.length > 0){
           let temp = lot_number.map((item) => ({
                name: item.name,
                lot_number : item.lot_number
            }));
            this.setState({
                uploadLotnumber: [' check the Lot Number',temp],
            });
        }
        if(brand.length > 0){
           let temp = brand.map((item) => ({
                name: item.name,
                brand : item.brand
            }));
            this.setState({
                uploadBrand: [' check the Brand',temp],
            });
        }
        if(category.length > 0){
           let temp = category.map((item) => ({
                name: item.name,
                category : item.category
            }));
            this.setState({
                uploadCategory: [' check the Category',temp],
            });
        }
    } else {
        flag = true;
    }

    // data.forEach((d) => {
    //     const isItem = this.props.product.some((t) => {
    //         const { cost_price: item_cost_price, unit_price: item_unit_price, taxes } = t;
            
    //         let gst, tax_category;
    //         taxes.forEach((s) => {
    //             if (s.tax_group === 'IGST') {
    //                 gst = s.tax_rate;
    //                 tax_category = s.tax_category;
    //             }
    //         });

    //         if (t.name === d.name.toString()) {
    //             let lots = [];
    //             if (+d.is_serialized === 0 && +d.receiving_quantity) {
    //                 for (let i = 0; i < +d.receiving_quantity; i++) {
    //                     lots.push({ lot_number: '' });
    //                 }
    //             } else if (d.lot_number) {
    //                 lots.push({ lot_number: d.lot_number });
    //             }
               
    //             withItemId.push({
    //                 ...t,
    //                 gst,
    //                 tax_category,
    //                 item_cost_price: d.cost_price,
    //                 item_unit_price: d.unit_price,
    //                 quantity: d.receiving_quantity,
    //                 prod_val: true,
    //                 sub_total: this.singleTax(item_cost_price, d.receiving_quantity, { taxes }).toFixed(2),
    //                 received_quantity: d.receiving_quantity,
    //                 ordered_quantity: d.receiving_quantity,
    //                 receiving_quantity: d.receiving_quantity,
    //                 lots,
    //                 tax_percentage:d.tax_percentage,
    //                 gst_preference:t.gst_preference
    //             });
    //             return true;
    //         }
    //         return false;
    //     });

    //     if (!isItem) {
    //         if (d.name) wOutItemId.push(d);
    //     }
    // });
    data.forEach((d) => {
    const isItem = this.props.product.some((t) => {
        const { cost_price: item_cost_price, unit_price: item_unit_price, taxes } = t;
        
        let gst, tax_category;
        taxes.forEach((s) => {
            if (s.tax_group === 'IGST') {
                gst = s.tax_rate;
                tax_category = s.tax_category;
            }
        });

        if (t.name === d.name.toString()) {
            let lots = [];
            if (+d.is_serialized === 0 && +d.receiving_quantity) {
                for (let i = 0; i < +d.receiving_quantity; i++) {
                    lots.push({ lot_number: '' });
                }
            } else if (d.lot_number) {
                lots.push({ lot_number: d.lot_number });
            }
           
            withItemId.push({
                ...t,
                gst,
                tax_category,
                item_cost_price: d.cost_price,
                item_unit_price: d.unit_price,
                quantity: d.receiving_quantity,
                prod_val: true,
                sub_total: this.singleTax(item_cost_price, d.receiving_quantity, { taxes }).toFixed(2),
                received_quantity: d.receiving_quantity,
                ordered_quantity: d.receiving_quantity,
                receiving_quantity: d.receiving_quantity,
                lots,
                tax_percentage:d.tax_percentage,
                gst_preference:t.gst_preference
            });
            return true;
        }
        return false;
    });

    if (!isItem) {
        if (d.name) wOutItemId.push(d);
    }
});



    if (wOutItemId.length) {
      // dispatch(listTaxCategoryAction());
        // const dataApi = wOutItemId.map((d) => {
        //     const newD = {
        //         ...d,
        //         supplier_name: d.supplier_name || null,
        //         brand: d.brand || null,
        //         category: d.category || null,
        //         model: d.model || null,
        //         cost_price: d.cost_price || null,
        //         unit_price: d.unit_price || null,
        //         max_price: d.max_price || null,
        //         lot_number: d.lot_number || null,
        //         gst_preference: d.gst_preference || 'Taxable'
        //     };
        //     // delete newD.lot_number;

        //     return { ...newD, stock_type: 1, unit_price: +d.unit_price || d.cost_price };
        // });
      const map = new Map();


      wOutItemId.forEach((d) => {

        const key = `${d.name}|${d.brand}|${d.category}`.toLowerCase();

        if (map.has(key)) return;



        const taxCat = this.props.taxcategory?.find(
          t => Number(t.tax_group_sequence) === Number(d.tax_percentage)
        );

        map.set(key, {
          name: d.name,
          SKU: d.SKU || null,
          supplier_name: d.supplier_name || null,
          brand: d.brand || null,
          category: d.category || null,
          model: d.model || null,

          cost_price: d.cost_price != null ? Number(d.cost_price) : null,
          unit_price: d.unit_price != null ? Number(d.unit_price) : (d.cost_price != null ? Number(d.cost_price) : null),
          max_price: d.max_price != null ? Number(d.max_price) : null,

          is_serialized: Number(d.is_serialized) || 0,
          qty_per_pack: Number(d.qty_per_pack) || 1,
          hsn_code: d.hsn_code || null,

          gst_preference: d.gst_preference || "Taxable",

          // GST mapping
          tax_category_id: taxCat?.tax_category_id || null,
          tax_percentage: d.tax_percentage != null ? Number(d.tax_percentage) : null,

          stock_type: 1
        });
      });

      const dataApi = [...map.values()];


    

        if (flag) {
            this.setState({ mp_open: true, dataApi, withItemId, xl_data: data });
        } else {
            this.setState({ openAlert: true });
        }
    } else {
        const dataLengthExcel = data.length;
       
       
        if (flag && !this.apiCalled) {  // Ensure API is called only once
          this.apiCalled = true; // Set the flag to prevent multiple calls
         
          this.setState({ openProgress: true }, () => {
              const employee_id = this.context.commoncookie;
              apiCalls(
                  this.context.setModalTypeHandler,
                  this.context.setLoaderStatusHandler,
                  this.props.stockUploadAction(
                      { data_items: withItemId, employee_id, location_id },
                      this.context.setLoaderStatusHandler,(status =>{
                      
                        // if(status == 200){
                          //this.setState({ openProgress: false });
                      //  }
                      })
                  )
              );
      
              this.setState({ dataLengthExcel });
          });
      } else {
            this.setState({ openAlert: true });
        }
    }
};

  productClose = () => {
    this.setState({ mp_open: false });
    this.setState({filePreviews : []})
  };

  setDataApi = (data) => {
    this.setState({ dataApi: data });
  };


  bulkApiCreate = (dataPro) => {
  //   const dataApi = dataPro.map((d) => {
  //     const { tableData, tax_percentage,lot_number,supplier_name, ...record } = d; // Destructure tax_percentage to remove it
  //     return record; // Return the updated object without tax_percentage
  // });

  const dataApi = dataPro.map((d) => {
    const { tableData, lot_number, supplier_name, ...record } = d; // remove unwanted keys

    return {
        ...record,
        tax_percentage: d.tax_percentage ?? null,  // include tax_percentage or null
        tax_category_id: d.tax_category_id ?? null // include tax_category_id or null
    };
});


    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.bulkProductAction(
        dataApi,
        this.context.setLoaderStatusHandler,
        (isRes, data) => {
          if (isRes) {

            const getExcel = this.state.xl_data
            const data_1 = data ? [...data] : [];
            const addItemIdtoXLData = getExcel.map(i => {
              const matchingData = data_1.find(j => j.name === i.name);
              const isItem = this.props.product.find((t) => t.name === i.name)

              // const matchingCostPrice = data_1.find(j => j.cost_price === i.cost_price)
              // const matchingProduct = this.props.product.find((product) => product.name === this.state.xl_data.name);

              return {
                ...i,
                item_id: matchingData ? matchingData.item_id : (isItem ? isItem.item_id : null),
                taxes: matchingData ? matchingData.taxes : (isItem ? isItem.taxes || [] : []),
              };
            });



            const getResData = addItemIdtoXLData.map((d) => {
              const newData = { ...d };
              const tax_category_id = this.props.taxcategory.find(
      (tax) => tax.tax_group_sequence == d.tax_percentage)

                newData.tax_category_id = tax_category_id.tax_category_id
              d.taxes.forEach((t) => {
                if (t.tax_group === 'IGST') {
                  newData.gst = t.tax_rate;
                  newData.tax_category =(t.tax_category == null || t.tax_category === undefined ) ?  d.tax_percentage : t.tax_category
                }
              });


              const taxed =
                d.cost_price + (d.cost_price / 100) * (newData.gst || 0);

              newData.item_cost_price = d.cost_price;
              newData.item_unit_price = d.unit_price;
              newData.prod_val = true;

              let lots = [];
              // let quantity = 0;
              // addItemIdtoXLData?.forEach((t) => {
              // if (t.name.toString() === d.name) {
              if (+d.is_serialized === 0 && +d.receiving_quantity) {
                for (let i = 0; i < +d.receiving_quantity; i++) {
                  lots.push({ lot_number: '' });
                }
              } else if (d.lot_number) {
                lots.push({ lot_number: d.lot_number });
              }
              // quantity += t.receiving_quantity;
              // }
              // });
              newData.received_quantity = d.receiving_quantity;
              newData.ordered_quantity = d.receiving_quantity;
              newData.sub_total = (taxed * d.receiving_quantity).toFixed(2);
              newData.quantity = d.receiving_quantity
              newData.lots = lots;

              return newData;
            });

            const mergeData = [...getResData];
            const dataLengthExcel = mergeData.length;
            // this.props.setitemsData(mergeData);
            const employee_id = this.context.commoncookie;
            const location_id = this.context.headerLocationId;
            this.setState({ openProgress: true });

            this.props.stockUploadAction(
              { data_items: mergeData, employee_id, location_id },
              this.context.setLoaderStatusHandler,(status =>{
                // if(status == 200){
                //   this.setState({ openProgress: false });
                  // apiCalls(
                  //   this.context.setModalTypeHandler,
                  //   this.context.setLoaderStatusHandler,
                  //   this.props.paginationinventoryAction(
                  //     this.context.commoncookie,
                  //     this.context.headerLocationId,
                  //     data,
                  //     this.context.setModalTypeHandler,
                  //     this.context.setLoaderStatusHandler,
                  //   ),
                  // ).finally((res) => this.setState({ isApiFinished: true }));
               // }
              })
            );
            this.setState({ mp_open: false, dataLengthExcel });
          }
        },
        true,
      ),
    );
  };


  // bulkApiCreate = (dataPro) => {
  //   const dataApi = dataPro.map((d) => {
  //     const {tableData, ...record} = d;
  //     return record;
  //   });

  //   apiCalls(
  //     this.context.setModalTypeHandler,
  //     this.context.setLoaderStatusHandler,
  //     this.props.bulkProductAction(
  //       dataApi,
  //       this.context.setLoaderStatusHandler,
  //       (isRes, data) => {
  //         if (isRes) {
  //           const data_1 = data ? [...data] : [];
  //           const addItemIdtoXLData = dataApi.map(i => {
  //             const matchingData = data_1.find(j => j.name === i.name);
  //             // const matchingProduct = this.props.product.find((product) => product.name === this.state.xl_data.name);

  //             return {
  //               ...i,
  //               item_id: matchingData ? matchingData.item_id : i.item_id,
  //               taxes: matchingData ? matchingData.taxes : i.taxes,
  //             };
  //           });



  //           const getResData = addItemIdtoXLData.map((d) => {
  //             const newData = {...d};

  //             d.taxes.forEach((t) => {
  //               if (t.tax_group === 'IGST') {
  //                 newData.gst = t.tax_rate;
  //                 newData.tax_category = t.tax_category;
  //               }
  //             });

  //             const taxed =
  //               d.cost_price + (d.cost_price / 100) * (newData.gst || 1);

  //             newData.item_cost_price = d.cost_price;
  //             newData.item_unit_price = d.unit_price;
  //             newData.prod_val = true;

  //             let lots = [];
  //             // let quantity = 0;
  //             if (+d.is_serialized === 0 && +d.receiving_quantity) {
  //               for (let i = 0; i < +d.receiving_quantity; i++) {
  //                 lots.push({ lot_number: '' });
  //               }
  //             } else if (d.lot_number) {
  //               lots.push({ lot_number: d.lot_number });
  //             }
  //             // this.state.xl_data.forEach((t) => {
  //             //   if (t.name.toString() === d.name) {
  //             //     if (+t.is_serialized === 0 && +t.receiving_quantity) {
  //             //       for (let i = 0; i < +t.receiving_quantity; i++) {
  //             //         lots.push({lot_number: ''});
  //             //       }
  //             //     } else if (t.lot_number) {
  //             //       lots.push({lot_number: t.lot_number});
  //             //     }
  //             //     quantity += t.receiving_quantity;
  //             //   }
  //             // });
  //             newData.received_quantity = d.receiving_quantity;
  //             newData.ordered_quantity = d.receiving_quantity;
  //             newData.receiving_quantity =d.receiving_quantity;
  //             // lots,
  //             // newData.sub_total = (taxed * quantity).toFixed(2);
  //             // newData.quantity = quantity;
  //             newData.lots = lots;

  //             return newData;
  //           });

  //           const mergeData = [...this.state.withItemId, ...getResData];
  //           const dataLengthExcel = mergeData.length;
  //           // this.props.setitemsData(mergeData);
  //           const employee_id = this.context.commoncookie;
  //           const location_id = this.context.headerLocationId;
  //           this.setState({openProgress: true});

  //           this.props.stockUploadAction(
  //             {data_items: mergeData, employee_id, location_id},
  //             this.context.setLoaderStatusHandler,
  //           );
  //           this.setState({mp_open: false, dataLengthExcel});
  //         }
  //       },
  //       true,
  //     ),
  //   );
  // };

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }
    this.setState({ pageSize: size });
    this.setState({ page: 0 });

    //  this.setState({pageSize: size}
    //   , async () => {

    //   const context = this.context;
    //         const {name, brand, category, max_price, min_price, location_id} =
    //     this.state.filtedValue;
    //   const data = {
    //     product_name:
    //       name !== undefined ? this.commonMapping(name, 'name') : '',
    //     brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
    //     category:
    //       category !== undefined
    //         ? this.commonMapping(category, 'category')
    //         : '',
    //     location_id:
    //       location_id !== undefined
    //         ? this.commonMapping(location_id, 'location_id')
    //         : context.headerLocationId,
    //     user_id: context.commoncookie,
    //     max_price: max_price !== undefined ? max_price : '',
    //     min_price: min_price !== undefined ? min_price : '',
    //     // gb value for mobile application
    //     gb:'',
    //     pageCount: this.state.page,
    //     numPerPage: size,
    //     searchString:this.state.searchVal,
    //   };
    //   // const data={product_name,brand,category,max_price,min_price,location_id :location_id,user_id:context.commoncookie,pageCount: this.state.page || 0,
    //   // numPerPage: size}
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //    this.props.paginationinventoryAction(

    //       context.commoncookie,
    //       context.headerLocationId,
    //       data,
    //       context.setModalTypeHandler,
    //       context.setLoaderStatusHandler,
    //      ),
    //      )
    // });
  };

  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 +  pageSize) * page,
    //      pageSize * (page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({ page: page });
    // const context = this.context;
    // const {name, brand, category, max_price, min_price, location_id} =
    //   this.state.filtedValue;

    // const data = {
    //   product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
    //   brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
    //   category:
    //     category !== undefined ? this.commonMapping(category, 'category') : '',
    //   location_id:
    //     location_id !== undefined
    //       ? this.commonMapping(location_id, 'location_id')
    //       : context.headerLocationId,
    //   user_id: context.commoncookie,
    //   max_price: max_price !== undefined ? max_price : '',
    //   min_price: min_price !== undefined ? min_price : '',
    //   // gb value for mobile application
    //   gb:'',
    //   pageCount: page,
    //   numPerPage: this.state.pageSize,
    //   searchString:this.state.searchVal || '',
    // };

    // // const data={product_name,brand,category,max_price,min_price,location_id,user_id:context.commoncookie, pageCount: page || 0,
    // // numPerPage:  pageSize}

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //  this.props.paginationinventoryAction(

    //     context.commoncookie,
    //     context.headerLocationId,
    //     data,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //    ),
    //    )
    // await this.props.listInventoryByIdAction(
    //   data,
    //   context.commoncookie,
    //   context.headerLocationId,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );
  };

  handleFilter = (data) => this.setState({ filterOpen: data });

  commonMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);

      return Data;
    } else if (typeof array === 'string') {
      return array;
    }
    else {
      return array;
    }
  };

  ApplyButton = (formData) => {
    // if(this.state.checkClear === true){

    //   const clearData={product_name:'', brand:'',category:'',location_id: context.headerLocationId,user_id:context.commoncookie,max_price: '',min_price:'',pageCount:0,numPerPage:  pageSize}
    //   this.props.listInventoryByIdAction(clearData,context.commoncookie,context.headerLocationId,context.setModalTypeHandler,context.setLoaderStatusHandler)

    //   this.setState({filterOpen:false})

    // }
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    const { name, brand, supplier_name, category, location_id, max_price, min_price } = formData;

    const context = this.context;
    const { pathname } = this.props.location;

    this.setState({ filtedValue: formData, page: 0, selectedChip: this.state.selectedChip, });
    // if(res) {
    // if(brand !== '' && category !== '' && location_id !== "null" && max_price !== '' && min_price !== '' ) {
    //   this.setState({count: this.state.count+4})
    //  }
    //  else if (category !== '' && brand !== '' ) {
    //   this.setState({count :this.state.count +2})
    //  }
    //  else if (location_id !== "null" && max_price !== '' && min_price !== '' ) {
    //   this.setState({count :this.state.count +3})
    //  }
    //  else if (category !== '' || brand !== '') {
    //   this.setState({count :this.state.count +1})
    //  }
    //  else if ( location_id !== "null" || max_price !== '' && min_price !== '') {
    //   this.setState({count :this.state.count +1})
    //  }
    // //  else if (category === '' || brand === '' || location === '' || max_price === '' || min_price === '') {
    // //   this.setState({count :this.state.count +0})
    // //  }
    //  else (this.setState({count : 0}))
    // }
    let sortKey = this.state.sortConfig?.key || "total"; 
    let sortOrder = this.state.sortConfig?.order || "asc"; 

    const data = {
      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      supplier_name: supplier_name !== undefined
        ? Array.isArray(supplier_name) && supplier_name.length > 0
          ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
          : this.commonMapping(supplier_name, 'supplier_name')
        : '',
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
      category:
        category !== undefined ? this.commonMapping(category, 'category') : '',
      location_id:
        location_id !== undefined
          ? this.commonMapping(location_id, 'location_id') || [location_id]
          : context.headerLocationId,
      user_id: context.commoncookie,
      max_price: max_price !== undefined ? max_price : '',
      min_price: min_price !== undefined ? min_price : '',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      // gb value for mobile application
      gb: '',
      type: this.state.selectedChip,
      sortKey: sortKey, 
      sortOrder: sortOrder,
      pageType: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sub_company_id : this.state.subcompanyId
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paginationinventoryAction(
        context.commoncookie,
        context.headerLocationId,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    //     ,(res)=> {

    //       const badgeCount = [this.state.filtedValue.brand,this.state.filtedValue.category,this.state.filtedValue.location_id,this.state.filtedValue.min_price,this.state.max_price]

    // let count = 0
    // badgeCount.forEach(d=> {
    // if(d) count +=1
    // } )
    // this.setState({
    //   ...this.state,
    //   ['count']:count
    // })

    this.setState({ filterOpen: false });
  };


  clearButton = () => {

    const context = this.context;
    const { pathname } = this.props.location;
    this.setState({
      filtedValue: {
        product_name: '',
        supplier_name: '',
        brand: '',
        category: '',
        location_id: 'null',
        max_price: '',
        min_price: '',
        searchString: '',
        gb: '',
        type: this.state.selectedChip,
        sortKey: "total", 
        sortOrder: "desc"
      },
      page: 0,
      selectedChip: this.state.selectedChip,
      filterOpen: false,
      subcompanyId: 'All'
    });

    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    let sortKey = this.state.sortConfig?.key || "total"; 
        let sortOrder = this.state.sortConfig?.order || "asc"; 
    const data = {
      product_name: '',
      supplier_name: '',
      brand: '',
      category: '',
      max_price: '',
      min_price: '',
      location_id: context.headerLocationId,
      user_id: context.commoncookie,
      // gb value for mobile application
      gb: '',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      type: this.state.selectedChip,
      sortKey: sortKey, 
      sortOrder: sortOrder,
      pageType: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sub_company_id : 'All'
    };


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paginationinventoryAction(
        context.commoncookie,
        context.headerLocationId,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
  }


  listDialogHandler = async (data, page = 0, pageSize = 200) => {
    if (data.available_qty > 0) {
      try {
        const item_id_for_fetch = data.trans_items || data.item_id;
        const res = await Inventoryservice.getLotsForItem(item_id_for_fetch, this.context.headerLocationId, page, pageSize);
        const payload = res.data || {};
        const lots = Array.isArray(payload) ? payload : (payload.rows || []);
        const total = Array.isArray(payload) ? lots.length : (payload.total || 0);
        this.setState({
          lotList: {
            lots,
            open: true,
            name: data.product_name,
            item_id: data.item_id,
            trans_items: data.trans_items,
            available_qty: data.available_qty,
            page,
            pageSize,
            total,
          },
        });
      } catch (err) {
        this.setState({
          lotList: { lots: [], open: true, name: data.product_name, item_id: data.item_id, page: 0, pageSize, total: 0 },
        });
      }
    }
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  // requestSearch = (e) => {
  //   let val = e;
  //   this.setState({searchVal: val});
  //   const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
  //   const filterqty = this.props.inventory.filter(
  //     (qty) => qty.available_qty > 0,
  //   );
  //   const filteredRows = filterqty.filter((row) => {
  //     return Object.keys(row).some((field) => {
  //       if(field === 'lots'){
  //         let lot = row[field];
  //         let l3A = lot.filter(l3 => {
  //           return l3.lot_number !== null ? l3.lot_number.toString().toLowerCase().includes(val) : false;
  //         })
  //         if(l3A.length > 0){
  //           return true
  //         }
  //       }
  //       return searchRegex.test(row[field]);
  //     });
  //   });
  //   this.setState({searchData: filteredRows, searchPageData: filteredRows});
  //   this.setState({page: 0});
  // };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val });

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0){
      this.props.set_searchinventoryAction({ data: [], numRows: 0 });
    }
    // }

    const { name, brand, category, supplier_name, location_id, max_price, min_price } =
      this.state.filtedValue;
      let sortKey = this.state.sortConfig?.key || "total"; 
      let sortOrder = this.state.sortConfig?.order || "asc"; 
      const { pathname } = this.props.location
    const data = {
      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      supplier_name: supplier_name !== undefined
        ? Array.isArray(supplier_name) && supplier_name.length > 0
          ? supplier_name.map(supplier => this.commonMapping(supplier.company_name, 'supplier_name'))
          : this.commonMapping(supplier_name, 'supplier_name')
        : '',
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',
      category:
        category !== undefined ? this.commonMapping(category, 'category') : '',
      location_id:
        location_id !== undefined
          ? this.commonMapping(location_id, 'location_id') || [location_id]
          : context.headerLocationId,
      user_id: context.commoncookie,
      max_price: max_price !== undefined ? max_price : '',
      min_price: min_price !== undefined ? min_price : '',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val,
      // gb value for mobile application
      gb: '',
      type:  pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sortKey: sortKey, 
      sortOrder: sortOrder,
      pageType : this.state.pageType,
      sub_company_id : this.state.subcompanyId
    };
    this.props.searchinventoryAction(
      data,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    //  this.setState({page: 0});
  };

  cancelSearch = (e) => {
    // this.props.set_searchinventoryAction({data:[], numRows:0})
    const context = this.context;
    const { pathname } = this.props.location;
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    let sortKey = this.state.sortConfig?.key || "total"; 
    let sortOrder = this.state.sortConfig?.order || "asc"; 
    const data = {
      product_name: '',
      supplier_name: '',
      brand: '',
      category: '',
      max_price: '',
      min_price: '',
      location_id: context.headerLocationId,
      user_id: context.commoncookie,
      // gb value for mobile application
      gb: '',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      type:  pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sortKey: sortKey, 
      sortOrder: sortOrder,
      pageType: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
      sub_company_id : this.state.subcompanyId
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paginationinventoryAction(
        context.commoncookie,
        context.headerLocationId,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
  };

  // isMarginRights = this.props.storage?.company_type === 3 ? getRoleAuthorization(this.props.user_rights, 'Margin') : true;

  handleInvoiceOpen = async (dc_id) => {
    const context = this.context
    const invoiceType = 'deliveryChallan'
    const poptype = 'invoice'
    const { data } = await this.customFetch(API_URLS.GET_SALES_INVOICE_DETAILS(dc_id, invoiceType, poptype), 'POST')
    await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.setInvoiceTempAction(data)
    )
    this.setState({ invoiceOpen: true })
  }

  getColumns(selectedChip) {
    const { selectedProducts } = this.state;
    let baseColumns = [];

    // Common renderCell for Available Qty with serialized click handler
    const availableQtyCell = (params) => {
      const row = params.row;
      if (row.trans_is_serialized === 'Serialized' && this.state.pageType === "/sales/inventory") {
        return (
          <div style={{ cursor: 'pointer', textDecoration: 'underline', color: '#0A8FDC' }}
            onClick={(e) => { e.stopPropagation(); this.listDialogHandler(row); }}>
            {row.available_qty}
          </div>
        );
      }
      return <div>{row.available_qty}</div>;
    };

    // Common columns used across multiple views
    const priceCol = { field: 'trans_item_gst_unit_price', headerName: 'Price', flex: 0.6, minWidth: 90, align: 'right', headerAlign: 'right',
      renderCell: (params) => params.row?.trans_item_gst_unit_price?.toFixed(2) || '0.00' };
    const qtyCol = { field: 'available_qty', headerName: 'Available Qty', flex: 0.6, minWidth: 100, align: 'right', headerAlign: 'right', renderCell: availableQtyCell };
    const totalCol = { field: 'total', headerName: 'Total', flex: 0.6, minWidth: 90, align: 'right', headerAlign: 'right',
      renderCell: (params) => params.row?.total?.toFixed(2) || '0.00' };
    const lotsHiddenCol = { field: 'lots', headerName: 'Lots', flex: 0.5, minWidth: 80 };
    const locationCol = { field: 'location', headerName: 'Location', flex: 0.7, minWidth: 100, sortable: false };
    const agingCol = { field: 'stock_age', headerName: 'Age', flex: 0.4, minWidth: 70, sortable: false,
      renderCell: (params) => {
        const days = params.row?.stock_age_days;
        if (!days && days !== 0) return '-';
        if (days < 31) return `${days}d`;
        if (days < 365) return `${Math.floor(days/30)}m ${days%30}d`;
        return `${Math.floor(days/365)}y ${Math.floor((days%365)/30)}m`;
      }
    };

    if (selectedChip === 'All') {
      baseColumns = [
        { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
        { field: 'category', headerName: 'Category', flex: 0.7, minWidth: 100, sortable: false },
        { field: 'brand', headerName: 'Brand', flex: 0.7, minWidth: 100 },
        { field: 'sku', headerName: 'SKU', flex: 0.5, minWidth: 80 },
        { field: 'hsn_code', headerName: 'HSN Code', flex: 0.5, minWidth: 80 },
        { field: 'tax_category', headerName: 'Tax Category', flex: 0.5, minWidth: 80 },
        { field: 'description', headerName: 'Description', flex: 0.5, minWidth: 80 },
        locationCol,
        { field: 'tax_rate', headerName: 'Tax %', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right', sortable: false,
          renderCell: (params) => params.row?.tax_rate != null ? `${parseFloat(params.row.tax_rate)}%` : '-' },
        qtyCol,
        { field: 'trans_item_gst_unit_price', headerName: 'Price', flex: 0.6, minWidth: 90, align: 'right', headerAlign: 'right',
          renderCell: (params) => params.row?.trans_item_gst_unit_price?.toFixed(2) || '0.00' },
        { field: 'price_with_tax', headerName: 'Price with Tax', flex: 0.6, minWidth: 110, align: 'right', headerAlign: 'right',
          renderCell: (params) => Number(params.row?.price_with_tax || 0).toFixed(2) },
        this.state.pageType === "/sales/lotItemWiseReport" ? { field: 'lot_number', headerName: 'Lot Number', flex: 0.6, minWidth: 100, sortable: false } : null,
        totalCol,
        { field: 'total_with_tax', headerName: 'Total with Tax', flex: 0.6, minWidth: 110, align: 'right', headerAlign: 'right',
          renderCell: (params) => Number(params.row?.total_with_tax || 0).toFixed(2) },
        { field: 'trans_is_serialized', headerName: 'Product Type', flex: 0.5, minWidth: 80 },
        { field: 'trans_stock_type', headerName: 'Stock Type', flex: 0.5, minWidth: 80 },
        lotsHiddenCol,
      ].filter(Boolean);
    }
    else if (selectedChip === 'stockByVendor') {
      baseColumns = [
        { field: 'supplier_name', headerName: 'Supplier Name', flex: 1, minWidth: 180 },
        qtyCol,
        totalCol,
      ];
    }
    else if (selectedChip === 'stockByCategory') {
      baseColumns = [
        { field: 'category', headerName: 'Category', flex: 1, minWidth: 140, sortable: false },
        qtyCol,
        totalCol,
      ];
    }
    else if (selectedChip === 'stockByBrand') {
      baseColumns = [
        { field: 'brand', headerName: 'Brand', flex: 1, minWidth: 140 },
        qtyCol,
        totalCol,
      ];
    }
    else if (selectedChip === 'stockByModel') {
      baseColumns = [
        { field: 'model', headerName: 'Model', flex: 1, minWidth: 140 },
        qtyCol,
        totalCol,
      ];
    }
    else if (selectedChip === 'openingStock') {
      baseColumns = [
        { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
        { field: 'category', headerName: 'Category', flex: 0.6, minWidth: 90, sortable: false },
        { field: 'brand', headerName: 'Brand', flex: 0.6, minWidth: 90 },
        locationCol,
        { field: 'lot_number', headerName: 'Lot #', flex: 0.5, minWidth: 90, sortable: false },
        { field: 'stock_type', headerName: 'Source', flex: 0.5, minWidth: 90, sortable: false },
        qtyCol,
        priceCol,
        totalCol,
        agingCol,
      ];
    }
    else if (selectedChip === 'dcStock') {
      baseColumns = [
        { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
        { field: 'model', headerName: 'Model', flex: 0.5, minWidth: 80 },
        locationCol,
        qtyCol,
        priceCol,
        totalCol,
        { field: 'dc_number', headerName: 'DC #', flex: 0.5, minWidth: 100,
          renderCell: (params) => (
            <div style={{ color: '#0A8FDC', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={(e) => { e.stopPropagation(); this.handleInvoiceOpen(params.row.dc_id); }}>
              {params.row.dc_number}
            </div>
          )
        },
        { field: 'dc_date', headerName: 'DC Date', flex: 0.5, minWidth: 90, sortable: false,
          renderCell: (params) => params.row?.dc_date ? new Date(params.row.dc_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-' },
        agingCol,
      ];
    }
    else if (selectedChip === 'stockByLotWise') {
      baseColumns = [
        { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
        { field: 'category', headerName: 'Category', flex: 0.7, minWidth: 100, sortable: false },
        { field: 'brand', headerName: 'Brand', flex: 0.7, minWidth: 100 },
        { field: 'sku', headerName: 'SKU', flex: 0.5, minWidth: 80 },
        { field: 'hsn_code', headerName: 'HSN Code', flex: 0.5, minWidth: 80 },
        { field: 'tax_category', headerName: 'Tax Category', flex: 0.5, minWidth: 80 },
        { field: 'description', headerName: 'Description', flex: 0.5, minWidth: 80 },
        locationCol,
        { field: 'lot_number', headerName: 'Lot Number', flex: 0.6, minWidth: 100, sortable: false },
        qtyCol,
        priceCol,
        { field: 'total', headerName: 'Total', flex: 0.6, minWidth: 90, align: 'right', headerAlign: 'right',
          renderCell: (params) => this.state.pageType === "/sales/inventory" ? params.row?.total?.toFixed(2) : params.row?.trans_item_gst_added_price },
        agingCol,
        { field: 'trans_is_serialized', headerName: 'Product Type', flex: 0.5, minWidth: 80 },
        { field: 'trans_stock_type', headerName: 'Stock Type', flex: 0.5, minWidth: 80 },
      ].filter(Boolean);
    }
    else {
      baseColumns = [];
    }

    return baseColumns;
  }

  // handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = import.meta.env.BASE_URL + 'inventorybulkupload.xlsx'; // Public folder path
  //   link.setAttribute('download', 'inventorybulkupload.xlsx');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  handleExportPdf = (cols, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => {
    const { pathname } = this.props.location;
    const context = this.context;
    const { name, brand, supplier_name, category, max_price, min_price, location_id } = this.state.filtedValue;
    let sortKey = this.state.sortConfig?.key || "total";
    let sortOrder = this.state.sortConfig?.order || "asc";

    if (this.state.pageType === "/sales/stockreceive") {
      const exportColumns = cols.filter(col => col.field && col.field !== 'check_all').map(col => ({ ...col, title: col.headerName }));
      apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        this.props.scrabExportAction({ headerLocationId }, (exportData) => {
          const formattedData = exportData.map((m) => ({
            ...m, lots: m.is_serialized === 1 ? (m.lots || []).map((d) => d.lot_number).join(', ') : '',
            margin_percentage: m.unit_price && m.trans_items_cost_price ? (((m.unit_price - m.trans_items_cost_price) / m.trans_items_cost_price) * 100).toFixed(2) : '0.00',
          }));
          ExportPdf(exportColumns, formattedData, 'Scrap Data');
        })
      );
    } else {
      const exportColumns = cols.filter(col => col.field && col.field !== 'check_all').map(col => ({ ...col, title: col.headerName }));
      const data = {
        product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
        supplier_name: supplier_name !== undefined ? (Array.isArray(supplier_name) && supplier_name.length > 0 ? supplier_name.map(s => this.commonMapping(s.company_name, 'supplier_name')) : this.commonMapping(supplier_name, 'supplier_name')) : '',
        brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '', category: category !== undefined ? this.commonMapping(category, 'category') : '',
        max_price: max_price !== undefined ? max_price : '', min_price: min_price !== undefined ? min_price : '',
        location_id: location_id !== undefined ? this.commonMapping(location_id, 'location_id') : context.headerLocationId,
        user_id: context.commoncookie, gb: '', pageCount: 0, numPerPage: this.props.Count,
        searchString: this.state.searchVal, type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
        sortKey, sortOrder, pageType: this.state.pageType, sub_company_id: this.state.subcompanyId,
      };
      apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        this.props.paginationinventoryAction(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
          const fileHeader = this.state.pageType === "/sales/lotItemWiseReport" ? "Lot Item Wise Report" : this.state.pageType === "/sales/stockreceive" ? 'Scrap Data' : "Inventory Data";
          ExportPdf(exportColumns, exportData.map((m) => {
            let filteredLots = [];
            if (m.available_qty > 0) {
              if (this.state.selectedChip === 'All' || this.state.selectedChip === 'stockByVendor') filteredLots = m.lots?.filter((i) => i.trans_items_cost_price === m.trans_items_cost_price);
              else if (this.state.selectedChip === 'stockByCategory') filteredLots = m.lots?.filter((i) => i.category === m.category);
              else if (this.state.selectedChip === 'stockByBrand') filteredLots = m.lots?.filter((i) => i.brand === m.brand);
            }
            return { ...m, lots: m.is_serialized === 1 ? (filteredLots || []).map((d) => d.lot_number).join(', ') : '' };
          }), fileHeader);
        })
      );
    }
  };

  handleExportCsv = (cols, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => {
    const context = this.context;
    const { name, brand, supplier_name, category, max_price, min_price, location_id } = this.state.filtedValue;
    const { pathname } = this.props.location;
    let sortKey = this.state.sortConfig?.key || "total";
    let sortOrder = this.state.sortConfig?.order || "asc";
    const exportColumns = cols.filter(col => col.field && col.field !== 'check_all').map(col => ({ ...col, title: col.headerName }));
    const data = {
      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      supplier_name: supplier_name !== undefined ? (Array.isArray(supplier_name) && supplier_name.length > 0 ? supplier_name.map(s => this.commonMapping(s.company_name, 'supplier_name')) : this.commonMapping(supplier_name, 'supplier_name')) : '',
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '', category: category !== undefined ? this.commonMapping(category, 'category') : '',
      location_id: location_id !== undefined ? this.commonMapping(location_id, 'location_id') : context.headerLocationId,
      user_id: context.commoncookie, max_price: max_price !== undefined ? max_price : '', min_price: min_price !== undefined ? min_price : '',
      gb: '', pageCount: 0, numPerPage: this.props.Count, searchString: this.state.searchVal,
      type: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise", sortKey, sortOrder,
      pageType: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
    };
    apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      this.props.paginationinventoryAction(commoncookie, headerLocationId, data, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
        const formattedData = exportData.map((m) => {
          let filteredLots = [];
          if (m.available_qty > 0) {
            if (this.state.selectedChip === "All" || this.state.selectedChip === "stockByVendor") filteredLots = m.lots?.filter((i) => i.trans_items_cost_price === m.trans_items_cost_price);
            else if (this.state.selectedChip === "stockByCategory") filteredLots = m.lots?.filter((i) => i.category === m.category);
            else if (this.state.selectedChip === "stockByBrand") filteredLots = m.lots?.filter((i) => i.brand === m.brand);
          }
          return { ...m, lots: m.is_serialized === 1 ? (filteredLots || []).map((d) => d.lot_number).join(", ") : "" };
        });
        const fileHeader = this.state.pageType === "/sales/lotItemWiseReport" ? "Lot Item Wise Report" : this.state.pageType === "/sales/stockreceive" ? 'Scrap Data' : "Inventory Data";
        ExportCsv(exportColumns, formattedData, fileHeader);
      })
    );
  };

  handleChange = async (data) => {
    if(data.target.name === 'subcompanyId'){
      this.setState({subcompanyId: data.target.value.sub_company_id})
    }
  }

  render() {
    
    // let storage = getsessionStorage()
    const columns = this.getColumns(this.state.selectedChip);
    const { selectAll, selectedProducts, purchaseReturnFromInventory, cnPopupData,debitSequence } = this.state;

     const context = this.context;
    const isProductSelected = selectedProducts.length > 0 || selectAll;
    // const isUploadRights = storage?.company_type === 3 ? getRoleAuthorization(this.props.user_rights, 'Upload') : true;
    // const isExportRights = storage?.company_type === 3 ? getRoleAuthorization(this.props.user_rights, 'Export') : true;
    // // const location = useLocation();
    // const currentPath = location.pathname;
      const { menuAccess = {} } = this.props;
        const selectedRole = this.storage?.role_name;
    
      const isUploadRights =
        UserRightsAuthorization(menuAccess[selectedRole], 'inventory__stocks', 'can_create')
         
    
      const isExportRights =
       UserRightsAuthorization(menuAccess[selectedRole], 'inventory__stocks', 'can_export')
          

    const { pathname } = this.props.location;
    
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Stocks </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          }) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              ></AlertDialog>


              <MissingProduct
                open={this.state.mp_open}
                handleClose={this.productClose}
                wOutItemId={this.state.dataApi}
                setDataApi={this.setDataApi}
                bulkApiCreate={this.bulkApiCreate}
              />
              {this.state.lotList.open && (
                <LotList
                  open={this.state.lotList.open}
                  page={this.state.lotList.page || 0}
                  pageSize={this.state.lotList.pageSize || 200}
                  total={this.state.lotList.total || 0}
                  onPageChange={(nextPage) => {
                    this.listDialogHandler(
                      {
                        trans_items: this.state.lotList.trans_items,
                        item_id: this.state.lotList.item_id,
                        product_name: this.state.lotList.name,
                        available_qty: this.state.lotList.available_qty,
                      },
                      nextPage,
                      this.state.lotList.pageSize || 200,
                    );
                  }}
                  handleClose={() => {
                    this.setState({
                      lotList: { lots: [], open: false, name: '', item_id: '' },
                    });
                  }}
                  data={this.state.lotList.lots}
                  name={this.state.lotList.name}
                  updateTableData={(d) => {


                    const context = this.context;
                    let sortKey = this.state.sortConfig?.key || "total"; 
                    let sortOrder = this.state.sortConfig?.order || "asc"; 

                    const data = {
                      product_name: '',
                      supplier_name: '',
                      brand: '',
                      category: '',
                      max_price: '',
                      min_price: '',
                      location_id: context.headerLocationId,
                      user_id: context.commoncookie,
                      // gb value for mobile application
                      gb: '',
                      pageCount: 0,
                      numPerPage: this.state.pageSize,
                      searchString: '',
                      type: this.state.selectedChip,
                      sortKey: sortKey, 
                      sortOrder: sortOrder,
                      pageType: pathname === "/sales/inventory" ? this.state.selectedChip : "stockByLotWise",
                      sub_company_id : this.state.subcompanyId
                    };

                    apiCalls(
                      context.setModalTypeHandler,
                      context.setLoaderStatusHandler,
                      this.props.paginationinventoryAction(
                        context.commoncookie,
                        context.headerLocationId,
                        data,
                        context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                      ),
                    );

                    // this.props.listProductAction(
                    //   this.context.setModalTypeHandler,
                    //   this.context.setLoaderStatusHandler,
                    // );
                    // this.setState({
                    //   lotList: {lots: d},
                    // });
                  }}
                />
              )}

              <IndexForStockReturn
                appConfigData={this.state.appConfigData}
                createMail={this.createMail}
                custType={'VENDOR'}
                custData={cnPopupData.custData}
                invoice={cnPopupData.invoice}
                soDate={cnPopupData.soDate}
                sales_items={cnPopupData.sales_items === undefined ? cnPopupData.itemsData : cnPopupData.sales_items}
                open={cnPopupData.Dopen}
                handleClose={() => {
                  this.handleCloseForPurchaseReturn();
                  this.setState({
                    cnPopupData: { ...cnPopupData, Dopen: false },
                    open: false,
                  })
                }
                }
                note={cnPopupData.note}
                returnFrom={'Inventory'}
                debitSequence={debitSequence}
              />

              {this.state.open === false && this.state.purchaseReturnFromInventory === false && (
                <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                  {/* Header Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
                    {/* Left: Chips */}
                    {!isProductSelected && this.state.pageType !== "/sales/lotItemWiseReport" && this.state.pageType !== "/sales/stockreceive" && (
                      <Stack direction="row" spacing={0.5}>
                        {[
                          { key: 'All', label: 'All' },
                          { key: 'stockByLotWise', label: 'Lot' },
                          { key: 'stockByModel', label: 'Model' },
                          { key: 'stockByCategory', label: 'Category' },
                          { key: 'stockByBrand', label: 'Brand' },
                          { key: 'stockByVendor', label: 'Vendor' },
                          { key: 'openingStock', label: 'Opening Stock' },
                          { key: 'dcStock', label: 'DC Stock' },
                        ].map((chip) => (
                          <Chip
                            key={chip.key}
                            label={chip.label}
                            clickable
                            size="small"
                            color={this.state.selectedChip === chip.key ? 'primary' : 'default'}
                            variant={this.state.selectedChip === chip.key ? 'filled' : 'outlined'}
                            onClick={() => this.handleChipSelection(chip.key)}
                            sx={{ borderRadius: '6px', fontWeight: this.state.selectedChip === chip.key ? 600 : 400, fontSize: 12, height: 28 }}
                          />
                        ))}
                      </Stack>
                    )}
                    {this.state.pageType === "/sales/lotItemWiseReport" && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: 12, '&:hover': { textDecoration: 'underline' } }} onClick={() => this.props.history('/report')}>Home</Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>/ Lot Item Wise Report</Typography>
                      </Box>
                    )}

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Right: KPI cards + Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* KPI mini cards - DC Stock shows its own totals, all others show All-view totals */}
                      {(() => {
                        const chip = this.state.selectedChip;
                        const isSpecial = chip === 'dcStock' || chip === 'openingStock';
                        const gt = isSpecial ? this.props.grandTotal : (this.state.allViewTotals.grandTotal || this.props.grandTotal);
                        const qa = isSpecial ? this.props.totalAvailableQty : (this.state.allViewTotals.totalAvailableQty || this.props.totalAvailableQty);
                        const ct = isSpecial ? this.props.Count : (this.state.allViewTotals.count || this.props.Count);
                        const prefix = chip === 'dcStock' ? 'DC ' : chip === 'openingStock' ? 'Opening ' : '';
                        return [
                          { title: `${prefix}Total`, value: `\u20B9${Number(gt).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#2E3A59' },
                          { title: `${prefix}Qty`, value: Number(qa).toLocaleString('en-IN'), color: '#11C15B' },
                          { title: `${prefix}Count`, value: ct, color: '#0A8FDC' },
                        ];
                      })().map((kpi) => (
                        <Box key={kpi.title} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
                          <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{kpi.title}</Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: kpi.color, lineHeight: 1.3 }}>{kpi.value}</Typography>
                        </Box>
                      ))}

                      {/* Search */}
                      {!isProductSelected && (
                        <CommonSearch searchVal={this.state.searchVal} cancelSearch={this.cancelSearch} requestSearch={this.requestSearch} />
                      )}
                      {isProductSelected && (
                        <Chip label="Purchase Return" clickable color="primary" size="small" onClick={this.handlePurchaseReturn} />
                      )}
                      {/* Filter */}
                      {!isProductSelected && (
                        <FilterInventory count={this.state.count} filter={this.state.filter} setFilter={this.setFilter} handleChange={this.handleChange}
                          handleClose={this.handleFilter} open={this.state.filterOpen} ApplyButton={this.ApplyButton} clearButton={this.clearButton}
                          filterHandler={this.filterHandler} filtedValue={this.state.filtedValue} pageType={this.state.pageType} subcompanyId={this.state.subcompanyId} />
                      )}
                      {/* Upload */}
                      {!isProductSelected && this.state.pageType === "/sales/inventory" && isUploadRights && (
                        <Tooltip title="Upload"><IconButton onClick={() => {
                          this.context.headerLocationId === 'null' ? this.setState({ alertOpen: true }) : this.setState({ template: true });
                        }}><UploadFileIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
                      )}
                      {/* Export */}
                      {!isProductSelected && isExportRights && (
                        <>
                          {this.state.pageType !== "/sales/lotItemWiseReport" && (
                            <Tooltip title="Export PDF"><IconButton onClick={() => this.handleExportPdf(columns, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler)}>
                              <PictureAsPdfIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
                          )}
                          <Tooltip title="Export CSV"><IconButton onClick={() => this.handleExportCsv(columns, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler)}>
                            <FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
                        </>
                      )}
                      {/* View Toggle */}
                      {!isProductSelected && this.state.pageType === "/sales/inventory" && (
                        <Box sx={{ display: 'flex', border: '1px solid #E0E0E0', borderRadius: 1.5 }}>
                          <IconButton onClick={() => this.setState({ viewMode: 'list', pageSize: 20 })}
                            sx={{ p: 0.75, borderRadius: '6px 0 0 6px', bgcolor: this.state.viewMode === 'list' ? '#E3F2FD' : 'transparent' }}>
                            <ViewListIcon sx={{ fontSize: 22, color: this.state.viewMode === 'list' ? '#0A8FDC' : '#8C8C8C' }} />
                          </IconButton>
                          <IconButton onClick={() => {
                            this.setState({ viewMode: 'grid', pageSize: 100 });
                            if (!this.props.product?.length) this.props.listProductAction(this.context.setModalTypeHandler, this.context.setLoaderStatusHandler);
                          }} sx={{ p: 0.75, borderRadius: '0 6px 6px 0', bgcolor: this.state.viewMode === 'grid' ? '#E3F2FD' : 'transparent' }}>
                            <ViewModuleIcon sx={{ fontSize: 22, color: this.state.viewMode === 'grid' ? '#0A8FDC' : '#8C8C8C' }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Data View: Grid or List */}
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {this.state.viewMode === 'grid' && this.state.pageType === "/sales/inventory" ? (
                      <InventoryGridView
                        data={this.props.search_value}
                        products={this.props.product}
                        chipType={this.state.selectedChip}
                        onCardClick={(row) => this.setState({ detailDrawer: { open: true, product: row } })}
                        isApiFinished={this.state.isApiFinished}
                        page={this.state.page}
                        pageSize={this.state.pageSize}
                        totalCount={this.props.Count}
                        onPageChange={(page) => this.handlePageChange(page)}
                        onPageSizeChange={(size) => this.handlePageSizeChange(size)}
                      />
                    ) : (
                      <DataGrid
                        rows={this.props.search_value || []}
                        columns={columns}
                        rowCount={this.props.Count}
                        getRowId={(row) => {
                          const chip = this.state.selectedChip;
                          if (chip === 'stockByVendor') return `vendor_${row.supplier_id}`;
                          if (chip === 'stockByBrand') return `brand_${row.brand}`;
                          if (chip === 'stockByCategory') return `cat_${row.category}`;
                          if (chip === 'stockByModel') return `model_${row.model}`;
                          if (chip === 'openingStock') return `open_${row.item_id}_${row.lot_number}_${row.location}`;
                          if (chip === 'dcStock') return `dc_${row.dc_item_id}`;
                          if (chip === 'stockByLotWise') return `lot_${row.lot_number}_${row.trans_location}_${row.trans_items_cost_price}`;
                          return `all_${row.trans_items}_${row.trans_location}_${row.trans_items_cost_price}_${row.supplier_id || ''}`;
                        }}

                        paginationMode="server"
                        paginationModel={{ page: this.state.page, pageSize: this.state.pageSize }}
                        onPaginationModelChange={(model) => {
                          if (model.page !== this.state.page) this.handlePageChange(model.page);
                          if (model.pageSize !== this.state.pageSize) this.handlePageSizeChange(model.pageSize);
                        }}
                        pageSizeOptions={[20, 50, 100]}

                        sortingMode="server"
                        sortModel={this.state.sortConfig.key ? [{ field: this.state.sortConfig.key, sort: this.state.sortConfig.order }] : []}
                        onSortModelChange={(model) => {
                          if (model.length > 0) {
                            this.setState({ sortConfig: { key: model[0].field, order: model[0].sort } }, () => {
                              this.fetchData(this.state.selectedChip);
                            });
                          }
                        }}

                        columnVisibilityModel={this.state.columnVisibilityModel}
                        onColumnVisibilityModelChange={(model) => this.setState({ columnVisibilityModel: model })}

                        density="compact"
                        disableRowSelectionOnClick
                        loading={false}
                        onRowClick={this.state.selectedChip === 'stockByLotWise' ? (params) => {
                          this.setState({ detailDrawer: { open: true, product: params.row } });
                          if (!this.props.product?.length) {
                            this.props.listProductAction(this.context.setModalTypeHandler, this.context.setLoaderStatusHandler);
                          }
                        } : undefined}

                        sx={{
                          border: 'none',
                          height: '100%',
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#F4F7FE',
                            fontSize: 12,
                            fontWeight: 700,
                          },
                          '& .MuiDataGrid-cell': {
                            fontSize: 12,
                            fontWeight: 400,
                            cursor: 'pointer',
                          },
                          '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#F8FAFF',
                          },
                          '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #E8EDF5',
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* Product Detail Drawer */}
                  <ProductDetailDrawer
                    open={this.state.detailDrawer.open}
                    product={this.state.detailDrawer.product}
                    onClose={() => this.setState({ detailDrawer: { open: false, product: null } })}
                    products={this.props.product}
                  />
                </Card>
              )}


              {this.state.purchaseReturnFromInventory && (
                <Popup
                  handleClose={this.handleCloseForPurchaseReturn}
                  // creditSequenceUpdate={this.creditSequenceUpdate}
                  oldSequenceGet={this.oldSequenceGet}
                  type={'returnFromInventory'}
                  edit_data={this.state.editData}
                  cnInvoiceFunction={this.cnInvoiceFunction}
                  {...this.props}
                  status={'edit'}
                  returnState={true}
                />
              )}

              {this.state.openAlert && (
                <AlertDialogSlide
                  setOpenAlert={(data) => this.setState({ openAlert: data })}
                  lotAlreadyExists={this.state.lotAlreadyExists}
                  uploadTaxcategory={this.state.uploadTaxcategory}
                  uploadHsnCode={this.state.uploadHsnCode}
                  uploadCategory={this.state.uploadCategory}
                  uploadBrand={this.state.uploadBrand}
                  uploadLotnumber={this.state.uploadLotnumber}
                  uploadCostPrice={this.state.uploadCostPrice}
                  uploadUnitPrice={this.state.uploadUnitPrice}
                  duplicateLotNumber={this.state.duplicateLotNumber}
                  filteredUploadData={this.state.filteredUploadData}
                  setValidationToDefault={() => {
                    this.setState({
                      lotAlreadyExists: [],
                      openAlert: false,
                      duplicateLotNumber: [],
                      filteredUploadData: [],
                      filePreviews: []
                    });
                  }}
                />
              )}

              {this.state.openProgress && (
                <AlertDialogBox
                  setOpenAlert={(data) => this.setState({ openAlert: data })}
                  dataLengthExcel={this.state.dataLengthExcel}
                  stockUpload={this.props.stockUpload}
                  openprogreesclose =  {() =>this.setState({ openProgress: false })}
                  progreesapi = {() =>this.setState({ progreesapi: true })}
                  setValidationToDefault={() => {
                    this.setState({
                      dataLengthExcel: '',
                      //  lotAlreadyExists: [],
                      openProgress: false,
                    });
                  }}
                />
              )}


              {<LocationAlert open={this.state.alertOpen} onClose={() => this.setState({ alertOpen: false })} />}


              {<Dialog
                open={this.state.template}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                  style: { padding: '0', borderRadius: '12px' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #E8EDF5' }}>
                  <UploadFileIcon sx={{ fontSize: 20, color: '#1976d2', mr: 1 }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', flex: 1 }}>Stock Upload</Typography>
                  <IconButton size="small" onClick={() => this.setState({ template: false, filePreviews: [] })}><CloseIcon fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ p: 3 }}>
                  <AttachmentField
                    type={'excel'}
                    previews={this.state.filePreviews}
                    setPreviews={this.setInventoryUploadPreviews}
                    style={{ width: '100%' }}
                    contactUpload={false}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pb: 2 }}>
                  <Link
                    href={`${import.meta.env.BASE_URL}inventorybulkupload.xlsx`}
                    download="inventorybulkupload.xlsx"
                    underline="hover"
                    sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "primary.main", flex: 1, fontSize: 13 }}
                  >
                    <img src={excelicon} alt="Excel" style={{ height: 24, width: 20, marginRight: 6 }} />
                    Download Template
                  </Link>
                  <Button variant='contained' color='primary' size="small" disabled={!this.state.filePreviews.length}
                    onClick={() => this.setState({ confirmation: true, template: false })}>
                    Upload
                  </Button>
                </Box>


                  {/* <Grid>
                    <Grid container justifyContent="space-around">
                      <Grid>
                        <Button
                          onClick={() => this.setState({ template: false, filePreviews: [] })}
                          variant='contained'
                          color='error'
                        >
                          Cancel
                        </Button> <Button
                          variant='contained'
                          color='primary'
                          disabled = {this.state.filePreviews.length > 0 ? false : true}
                          // onClick={()=> this.setState({uploadDone : true})}
                          onClick={() => this.setState({ confirmation: true, template: false })}
                        >
                      </Grid>
                      <Grid>
                       
                          Upload
                        </Button>
                      </Grid>
  
                    </Grid>
                  </Grid> */}

              </Dialog>}

              {
                <Dialog
                  open={this.state.confirmation}
                  fullWidth
                  PaperProps={{
                    style: { minWidth: '700px',maxWidth:'auto', padding: '30px' }
                  }}
                >
                  <Grid container>
                    <Grid>
                    <Grid container justifyContent={'center'} alignItems={'center'}>
                        <IconButton >
                        <img src={addInventory} width={50} />
                        </IconButton>
                      </Grid>
                      {this.state.inventory_type == 'Append' ? (<Typography>Are you sure you want to proceed? New items will be added, and existing ones will remain unchanged. </Typography>) : this.state.inventory_type == 'Overwrite' ?(<Typography>Are you sure you want to proceed? This will Overwrite the existing inventory data and cannot be undone.</Typography>) : (<Typography>There is an technical issue please try again later </Typography>)}
                    </Grid>
                    <Grid container justifyContent="flex-end" spacing={3}>
                      <Grid>
                        <Button variant="contained" color="error" onClick={() => this.setState({ confirmation: false, template: true })}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid>
                        <Button variant="contained" color="primary" onClick={()=> this.handlefileupload()}>
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Dialog>
              }
              {/* {this.state.open === true &&
                 <ProductForm edit_id_data={this.props.product_id_data} status={this.state.status} type='inventory' handleClose={this.handleClose} handleSubmit={this.handleSubmit} handleDeactive={this.handleDeactive} {...this.props} />
                 } */}


              {/* {this.state.openDialog && (
                <Dialog
                  open={this.state.openDialog}
                  onClose={this.handleCloseDialog}
                  fullWidth
                  maxWidth="md"
                >
                  <DialogTitle>Product Details Conflict</DialogTitle>
                  <DialogContent>
                    {this.state.productDetails.length > 0 ? (
                      this.state.productDetails.map((conflictGroup, index) => (
                        <div key={index}>

                          {conflictGroup.suppliers.length > 1 && (
                            <>
                              <Typography variant="subtitle1">Multiple Suppliers:</Typography>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>Supplier Name</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {conflictGroup.suppliers.map((supplier, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{supplier.name}</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>{supplier.supplier_name}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          )}


                          {conflictGroup.invoices.length > 1 && (
                            <>
                              <Typography variant="subtitle1" style={{ marginTop: '20px' }}>
                                Multiple Invoices:
                              </Typography>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Product Name</TableCell>

                                    <TableCell>Invoice Number</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {conflictGroup.invoices.map((invoice, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{invoice.name}</TableCell>

                                      <TableCell>{invoice.invoice_number}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          )}

                       
                        </div>
                      ))
                    ) : (
                      <Typography>No conflicts detected.</Typography>
                    )}
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={this.handleCloseDialog} color="primary">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              )} */}

                <Dialog open={this.state.scheduleOpen}>
                  <CommonSchedule
                  report_name  = {'Lot Item Wise Report'}
                  handleClose = {this.handleScheduleClose}
                  open={this.state.scheduleOpen}
                  columns = {this.state.Schedulecolumns}
                  // data = {this.props.searchSalesReportData}
                />
                </Dialog>


                <Dialog open={this.state.shareOpen}>
                  <ShareReport
                    report_name  = {'Lot Item Wise Report'}
                    handleClose = {this.handleShareClose}
                    open={this.state.shareOpen}
                    columns = {this.state.Schedulecolumns}
                    data = {this.props.search_value}
                    fromDate = {''}
                    toDate = {''}
                  />
                </Dialog>

                {
                  this.state.invoiceOpen === true &&
                  <InvoiceDialog
                    open={this.state.invoiceOpen}
                    handleClose={() => {this.setState({ invoiceOpen: false })}}
                    custType='CUSTOMERDC'
                  />
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
    inventory: state.inventoryReducer.inventory,
    taxcategory: state.taxCategoryReducer.taxcategory,
    inventory_all_data: state.inventoryReducer.inventory_all_data,
    inventory_id_data: state.inventoryReducer.inventory_id_data,
    inventory_count: state.inventoryReducer.inventory_count,
    productcategory: state.productCategoryReducer.productcategory,
    product: state.productReducer.product,
    stockUpload: state.purchasesReducer.stockUploadList,
    // stocklocation: state.stockLocationReducer.stocklocation || [],
    grandTotal: state.inventoryReducer.grandTotal || 0,
    totalAvailableQty: state.inventoryReducer.totalAvailableQty || 0,
    Count: state.inventoryReducer.Count || 0,
    search_value: state.inventoryReducer.search_value || [],
    supplierInvoiceList: state.supplierInvoiceList || [],
    credit_debit_seq: state.salesReducer.credit_debit_seq,
    vendor: state.vendorReducer.vendorIdAndName,
    app_config_data: state.appConfigReducer.app_config_data,
    getApprovalRights: state.salesReducer.getApprovalRights || [],
    // user_rights : state.roleReducer.user_rights || [],
    getbillingcompanydetails: state.salesReducer.getbillingcompanydetails,
    menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listInventoryByIdAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listInventoryByIdAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },


    paginationinventoryAction: (employee_id,
      headerLocationId, data, setModalTypeHandler,
      setLoaderStatusHandler, result) => {
      return dispatch(paginationinventoryAction(employee_id,
        headerLocationId, data, setModalTypeHandler,
        setLoaderStatusHandler, result))
    },
    listInventoryAction: (
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      result,
    ) => {
      return dispatch(
        listInventoryAction(
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          result,
        ),
      );
    },
     scrabExportAction: (data,result) => {
      return dispatch(scrabExportAction(data,result));
    },
    createInventoryAction: (data) => {
      return dispatch(createInventoryAction(data));
    },
    supplierInvoiceListAction: (data, response) => {
      return dispatch(supplierInvoiceListAction(data, response));
    },
    listProductAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    getBillingcompany: () => {
      dispatch(getBillingcompany());
    },
    getbyidInventoryAction: (id) => {
      return dispatch(getbyidInventoryAction(id));
    },
    updateInventoryAction: (id, data) => {
      return dispatch(updateInventoryAction(id, data));
    },
    deleteInventoryAction: (id) => {
      return dispatch(deleteInventoryAction(id));
    },
    stockUploadAction: (data, setLoaderStatusHandler, status) => {
      return dispatch(stockUploadAction(data, setLoaderStatusHandler, status));
    },
    bulkProductAction: (data, setLoaderStatusHandler, result, pro) => {
      return dispatch(bulkProductAction(data, setLoaderStatusHandler, result, pro));
    },
    searchinventoryAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(searchinventoryAction(
        val,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ))
    },
    set_searchinventoryAction: (val) => {
      return dispatch(set_searchinventoryAction(val));
    },
    inventoryExportAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      result,
    ) => {
      return dispatch(
        inventoryExportAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          result,
        ),
      );
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
    getAppConfigDataAction: () => {
      dispatch(getAppConfigDataAction());
    },
    listVendorIdAndNameAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listVendorIdAndNameAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    approvalUserRightsAction: (data)=>{
      dispatch(approvalUserRightsAction(data))
    },
    listTaxCategoryAction : ()=>{
      return dispatch(listTaxCategoryAction())
    },
    getUserRightsByRoleIdAction: () => {
      return dispatch(getUserRightsByRoleIdAction());
    },
    getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
    setInvoiceTempAction: (data) => {
      return dispatch(setInvoiceTempAction(data))
    },
  };
};

// export default connect(mapStateToProps, mapDispatchToProps)(Inventory);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Inventory));


function Tables({ data, tableName }) {


  const tableNameList = {
    lotAlreadyExists: 'Lot number already exist in Database',
    duplicateLot: 'Duplicate Lot number',
    duplicateLotInDb: 'Product has duplicate Lot Number in Uploaded file',
    uploadUnitPrice: 'check the Unit price',
    uploadCostPrice: 'check the Cost price',
    uploadLotnumber: 'check the Lot Number',
    uploadBrand: 'check the Brand',
    uploadCategory: 'check the category',
    uploadHsnCode: 'check the HSN code',
    uploadTaxcategory: 'check the Tax Category',
    filteredUploadData: 'check the Receiving Quantity',
  }



  return (
    <Grid
      style={{
        margin: '10px',
        width: '65vh'
      }}
    >
      <Typography variant='h6' pb={1}>
        {tableNameList[tableName]}
      </Typography>
      <table
        style={{
          border: '1px solid',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px'

        }}
      >
        <tr>
          <th style={{ border: '1px solid', width: '60%' }}>Product Name</th>
          {(tableName === 'lotAlreadyExists' || tableName === 'duplicateLotInDb') && <th style={{ border: '1px solid', width: '40%' }}>Lot Number / Qty</th>}
          { tableName === 'filteredUploadData' && <th style={{ border: '1px solid', width: '40%' }}>Receiving Quantity</th>}
          { tableName === 'uploadUnitPrice' && <th style={{ border: '1px solid', width: '40%' }}>Unit Price</th>}
          { tableName === 'uploadCostPrice' && <th style={{ border: '1px solid', width: '40%' }}>Cost Price</th>}
          { tableName === 'uploadLotnumber' && <th style={{ border: '1px solid', width: '40%' }}>Lot Number</th>}
          { tableName === 'uploadBrand' && <th style={{ border: '1px solid', width: '40%' }}>Brand</th>}
          { tableName === 'uploadCategory' && <th style={{ border: '1px solid', width: '40%' }}>Category</th>}
          { tableName === 'uploadHsnCode' && <th style={{ border: '1px solid', width: '40%' }}>HSN Code</th>}
          { tableName === 'uploadTaxcategory' && <th style={{ border: '1px solid', width: '40%' }}>Tax Percentage</th>}
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.name}
            </td>

           { (tableName === 'lotAlreadyExists' || tableName === 'duplicateLotInDb') &&  <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.lot || d.lot_number}
            </td>}
            {
              tableName === 'filteredUploadData' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.receiving_quantity}
            </td>
                        
              }
            {
              tableName === 'uploadCostPrice' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.cost_price}
            </td>
                        
              }
            {
              tableName === 'uploadUnitPrice' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.unit_price}
            </td>
                        
              }
            {
              tableName === 'uploadBrand' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.brand}
            </td>
                        
              }
            {
              tableName === 'uploadCategory' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.category}
            </td>
                        
              }
            {
              tableName === 'uploadHsnCode' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.hsn_code}
            </td>
                        
              }
            {
              tableName === 'uploadTaxcategory' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.tax_percentage }
            </td>
                        
              }
            {
              tableName === 'uploadLotnumber' &&
            <td style={{ border: '1px solid', padding: '0px 5px' }}>
              {d.lot_number}
            </td>
                        
              }

          </tr>
        ))}
      </table>
    </Grid>
  );
}



function LinearProgressWithLabel(props) {



  return (
    <Grid container
      sx={{ display: 'flex', flexDirection: 'column' }}>
      <Grid
        sx={12}
        size={{
          lg: 12,
          md: 12,
          sm: 12
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: '30px',
            mb: '30px',

          }}
        >
        <Box sx={{ width: '70%', mr: 1 }}>
            <LinearProgress variant='determinate'
              sx={{
                backgroundColor: '#eeeeee',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                  // height: '40px',
                },
              }} {...props} />
          </Box>
          <Box >
           <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
              {typeof props.value === 'number' && !isNaN(props.value)
                ? `${Math.round(props.value)}%`
                : props.value || ''}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>{props.stockUpload.affectedRows === 0 ? 'No Stock Uploaded': `Stock Uploaded `  }</Typography>
      </Grid>
    </Grid>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};


function LinearWithValueLabel({ stockUpload, dataLengthExcel, onClose, progreesapi }) {
  // let dataLength = stockUpload.affectedRows
  // const percentage = 100;

  // const [progress, setProgress] = React.useState(0);


  // React.useEffect(() => {
  //   let currentProgress = 0;
  //   const timer = setInterval(() => {
  //     if (currentProgress >= percentage) {
  //       clearInterval(timer);
  //     } else {
  //       currentProgress += 2;
  //       setProgress(currentProgress);
  //     }
  //   }, 50);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [percentage]);

  const [progress, setProgress] = useState(0);
  

React.useEffect(()=>{
  clientwebsocket.onmessage = async (message) => {
      let {event, content} = JSON.parse(message.data);

      if (event === 'UploadProgress') {
        setProgress(content);
      }
    };
},[]);

  React.useEffect(() => {
    const rootSocket = socketManager.getSocket("/");

    if (!rootSocket) {
      return;
    }

    const handleUploadProgress = (data) => {
      if(data?.progress){
           setProgress(data?.progress);
      }
    };
    rootSocket.on("UploadProgress", handleUploadProgress);

    return () => {
      rootSocket.off("UploadProgress", handleUploadProgress);
    };
  }, []);

// React.useEffect(() => {
//   if (progress >= 100) {
//     setTimeout(() => {
//       onClose(); // Call onClose function
//     }, 500); // Delay for smooth transition
//   }
// }, [progress]);

React.useEffect(() => {
  // If progress is NOT a number â†’ it's an error message
  if (progress && isNaN(progress)) {
    alert(progress);     // shows "Lot Number Already Exists"
   onClose();           // close progress modal
    return;
  }

 // Success case
  if (Number(progress) >= 100) {
    setTimeout(() => {
    onClose();
    progreesapi();
    
    }, 500);
  }

}, [progress]);

  return (
    <Box sx={{ width: '500px'}}>
      <LinearProgressWithLabel value={progress} stockUpload={stockUpload} dataLengthExcel={dataLengthExcel} />
    </Box>
  );
}

