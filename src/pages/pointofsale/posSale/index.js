import React, { Component } from 'react';
//import NewCustomer from '../../../components/Customer';
import { connect } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import _, { concat, filter } from 'lodash';
import {
  GetPosSaleDateFilterAction,
  cancelPosSaleAction,
  get_searchPosSaleAction,
  set_searchPosSaleAction,
  posSalePaginationAction,
  getColumnAction,
  updateColumnAction,
  posSaleExportDataAction
} from '../../../redux/actions/pos_sale_actions';
import { OpenalertActions } from '../../../redux/actions/alert_actions';
// import { listStockLedgerAction, createStockLedgerAction, getbyidStockLedgerAction } from '../../redux/actions/stock_Ledger_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  Link,
  Box,
  Card,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
// import HomeIcon from '@mui/icons-material/Home';
// import { styled, useTheme } from '@mui/material/styles';
// import MomentUtils from "@date-io/moment";
// import CloseIcon from '@mui/icons-material/Close';
import { listPaymentTypeDetails } from '../../../redux/actions/payment_method_actions';
import { listProductAction } from '../../../redux/actions/product_actions';
import { listStockLocationAction } from '../../../redux/actions/stock_Location_actions';
import InvoiceDialog from '../../sales/sales/InvoiceDialog';
import PdfInvoiceDialog from '../../common/PdfInvoiceDialog';
import { listCustomerAction, listcustomerinvoice } from '../../../redux/actions/customer_actions';
import { sendMail } from '../../../redux/actions/sales_actions';
import {
  listBalancesheetAction,
  listBalancesheetdateAction,
} from '../../../redux/actions/balancesheet_actions';
import { getAppConfigDataAction } from '../../../redux/actions/app_config_actions';
import { commonDateFormat, getDateTime } from '../../../utils/getTimeFormat';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import CancelPosSalePage from '../../../components/posSale_erpDesign/cancelPosSale';
import { baseURL, titleURL } from '../../../http-common';
import FilterPossale from './FilterPossale';
import { ThirtyFpsSharp } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PurchaseErpDesign from '../../../components/posSale_erpDesign/index';
import App from 'components/customer_erpDesign';
import { listUserCreationAction } from '../../../redux/actions/userCreation_actions';
import { getByIdMailConfigurationAction, getByIdSmsConfigurationAction } from '../../../redux/actions/configuration_actions';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500, Width } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import AppSearch from '@crema/core/AppSearchBar';
import CommonSearch from 'utils/commonSearch';
import DataGridTemp from 'components/dataGridTemp';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SaveIcon from '@mui/icons-material/Save';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../../utils/customFetchApiUrls';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   title: {
//     flexGrow: 1,
//     display: 'none',
//     [theme.breakpoints.up('sm')]: {
//       display: 'block',
//     },
//   },
//   search: {
//     position: 'relative',
//     marginTop: '-7px',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: 'white',
//     marginLeft: 0,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       marginLeft: theme.spacing(1),
//       width: 'auto',
//     },
//   },
//   searchIcon: {
//     padding: theme.spacing(0, 2),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: '3px'
//   },
//   inputRoot: {
//     color: 'inherit',
//   },
//   // appBar: {
//   //   // zIndex: theme.zIndex.drawer + 1,
//   //   marginTop: headerHeight,
//   //   height: `calc(100% - ${headerHeight}px)`,
//   //   // transition: theme.transitions.create(['width', 'margin'], {
//   //   //   easing: theme.transitions.easing.sharp,
//   //   //   duration: theme.transitions.duration.leavingScreen,
//   //   // }),
//   // },
//   inputInput: {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
//     transition: theme.transitions.create('width'),
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       width: '12ch',
//       '&:focus': {
//         width: '20ch',
//       },
//     },
//   },
// }));

// const classes = useStyles();
// const style = {
//   // marginTop: '0px',
//   // marginBottom: '0px',
//   // marginTop:'2px',
//   backgroundColor: '#d7d1d1'
// }

class PosSaleCreation extends Component {
  static contextType = CreateNewButtonContext;
  Ledger;
  prevHeaderupdate;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      open: false,
      type: 0,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      delete: false,
      id: '',
      filterData: [],
      brand: '',
      category: '',
      Dopen: false,
      page: 0,
      pageSize: 20,
      from: firstDay,
      to: lastDay,
      noSms: '',
      button: '4',
      filtedValue: {
        brand: 'null',
        category: 'null',
        location_id: 'null',
        payment_type: 'null',
        page: 0
      },
      cancelSale: false,
      indexValue: '',
      // rowPopup: {
      //   open: false,
      //   rowIndex: '',
      //   receivings_items: []
      // },
      count: 0,
      previousDate: {
        from: '',
        to: '',
      },
      errormsg: {
        from: '',
        to: '',
      },
      editfinds: false,
      appConfigData: {},
      stocklistaddress: {},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      columPopup: { open: false, rowIndex: '' },
      rowPopup: { open: false, rowIndex: '' },
      Customerid: '',
      pdfDialog: { open: false, saleId: null, invoiceNumber: '', locationId: null, companyId: null },
      title: 'Pos Sal',
      columnData: [
        {
          field: 'invoice_number',
          headerName: 'Invoice Number',
          renderCell: (params) => (
            <div
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: '#1976d2',
              }}
              onClick={(event) => {
                event.stopPropagation();
                this.setState({
                  pdfDialog: {
                    open: true,
                    saleId: params.row.sale_id,
                    invoiceNumber: params.row.invoice_number,
                    locationId: params.row.location_id,
                    companyId: params.row.company_id,
                  }
                });
              }}
            >
              {params.value}
            </div>
          ),
          align : 'center',
          flex: 1,
          minWidth:Width('invoice number'),
        },
        {
          field: 'payment_type',
          headerName: 'Payment Mode',
          renderCell: (params) => (
            <div>
              {this.removeDuplicateCharacters(params.value)}
            </div>
          ),
          align : 'center',
          flex: 1,
          minWidth: Width('payment mode'),
        },
        {
          field: 'sale_time',
         
          headerName: 'Date',
          flex: 1,
          minWidth: Width('date'),
        },
        {
          field: 'company_name',
          headerName: 'Customer Name',
          renderCell: (params) => (
            <Link
              onClick={(event) => {
                this.setState({
                  columPopup: {
                    rowIndex: this.props.searchPosSaleData.findIndex(
                      (i) =>
                        params.row.customer_id
                          ? i.customer_id === params.row.customer_id
                          : i.supplier_id === params.row.supplier_id
                    ),
                    open: true,
                  },
                  Customerid: params.row.customer_id,
                  customer_type : parseInt(params.row.customer_type)
                });
                setTimeout(() => {
                  this.setState({ rowPopup: { open: false } });
                }, 0);
                event.stopPropagation();
              }}
              style={{
                textDecoration: 'underline',
                cursor: 'pointer', // Add cursor style
              }}
            >
              {params.value === null || params.value === ''
                ? params.row.customer_name
                : params.value}
            </Link>
          ),
          flex: 1,
          minWidth: 200,
        },

        {
          field: 'GST',
          headerName: 'Customer GST Number',
          flex: 1,
          minWidth: Width('gst number'),
        },
        {
          field: 'product_name',
          headerName: 'Products',
          cellClassName: 'left-align-cell',
          flex: 1,
          minWidth: 200,
        },
        {
          field: 'location_name',
          headerName: 'Location Name',
          align : 'left',
          flex: 1,
          minWidth: Width('location name'),
        },
        {
          headerName: 'Product Brand',
          field: 'product_brand',
          flex: 1,
          minWidth: Width('product brand'),
        },
        {
          headerName: 'Sale Quantity',
          field: 'sale_quantity',
          align: 'center',
          flex: 1,
          minWidth: Width('sale quantity'),
        },
        {
          headerName: 'Product Category',
          field: 'product_category',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Sale Tax Amount',
          field: 'sale_tax_amount',
          align: 'center',
          flex: 1,
          minWidth: 130,
         
        },
        {
          headerName: 'Sale Total Amount',
          field: 'sale_total_amount',
          align: 'center',
          flex: 1,
          minWidth: 140,
        },
        {
          headerName: 'Tax Category',
          field: 'tax_category',
          align: 'center',
          flex: 1,
          minWidth: Width('tax category'),
        },

        {
          headerName: 'Total',
          field: 'total',
          align: "right",
          flex: 1,
          minWidth: 130,
        },
        {
          headerName: 'Serial Number',
          field: 'serial_number',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Remarks',
          field: 'comment',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Product Info',
          field: 'productInfo',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Reference',
          field: 'reference',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Type',
          field: 'type',
          flex: 1,
          minWidth: 200,
        },
        {
          headerName: 'Note',
          field: 'note',
          flex: 1,
          minWidth: 200,
        },
      ],
      isApiFinished: false,
      columnHead: {},
      data: [],
      ex_data: [],
      filtered_column: {}
    };
    this.customFetch = useCustomFetch();
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  // async testing() {
  //   const context = this.context;
  //  await this.props.listStockLedgerAction( context.setModalTypeHandler, context.setLoaderStatusHandler)
  //   await this.setState({ open: false })
  // }

  async componentDidMount() {
    this.prevHeaderupdate = this.context.headerLocationId
    this.props.set_searchPosSaleAction({ data: [], numRows: 0 });
    const context = this.context;

    const { data: isVisibleColumn } = await this.customFetch(
      API_URLS.GET_POS_COLUMN_SELECTION,
      'GET',
      {}
    );
        
    const updatedColumnData = [...this.state.columnData];
    
    const filteredColumns = updatedColumnData.map((column) => {
      if (isVisibleColumn[column.field]) {
        return {
          ...column,
          hide: true,
        };
      } else {
        return column;
      }
    });

    this.setState({ data: filteredColumns, columnHead: isVisibleColumn })

    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    const data = {
      from: moment(this.state.from).format('YYYY-MM-DD'),
      to: moment(this.state.to).format('YYYY-MM-DD'),
      // to: moment(this.state.to,'month').format('YYYY-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      location_id: this.commonFilterMapping(location_id, 'location_id'),
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      !this.props.product.length && this.props.listProductAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      !this.props.app_config_data.length && this.props.getAppConfigDataAction(),
      this.props.posSalePaginationAction(data)

    )


    // if (this.props.setModalStatusHandler) this.setState({ open: true });
  }



  getAppConfigData = async (data) => {
    const { app_config_data } = this.props;
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    // const fullAddress = app_config_data.filter(f=>f.key_name =='address.area');
    // const city = app_config_data.filter(f=>f.key_name =='address.city');
    // const emailData = app_config_data.filter(f=>f.key_name =='address.email');
    const fullAddress = data?.LocationAddress || '';
    const city = data?.LocationCity || '';
    const emailData = data?.LocationEmail || '';
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    // const companyMobile = data?.LocationPhonenumber || '';
    const companyMobile = app_config_data.filter(f=>f.key_name =='company.mobile');
    const state = data?.LocationState || '';
    // const state = app_config_data.filter(f=>f.key_name =='address.state')
    // const state =
    //   data?.state.concat(',', data?.zip === null ? '' : data?.zip) || '';
    const web = app_config_data.filter((f) => f.key_name == 'web.base.url');
    const invoice_logo = app_config_data.filter((f) => f.key_name == 'company.invoice.logo');

    await this.setState({
      appConfigData: {
        companyName:
          companyName.length > 0 && typeof companyName === 'object'
            ? companyName[0].value
            : companyName,
        companyAddress:
          fullAddress.length > 0 && typeof fullAddress === 'object'
            ? fullAddress[0].value
            : fullAddress,
        companyEmail:
          emailData.length > 0 && typeof emailData === 'object'
            ? emailData[0].value
            : emailData,
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile:
          companyMobile.length > 0 && typeof companyMobile === 'object'
            ? companyMobile[0].value
            : companyMobile,
        city:
          city.length > 0 && typeof city === 'object' ? city[0].value : city,
        state:
          state.length > 0 && typeof state === 'object'
            ? state[0].value
            : state,
        web: web.length > 0 ? web[0].value : '',
        invoice_logo: invoice_logo.length > 0 ? invoice_logo[0].value : ''
      },
    });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.pos_sale_list !== this.props.pos_sale_list) {
      this.setState({ filterData: this.props.pos_sale_list });
    }

    if (prevProps.app_config_data !== this.props.app_config_data && this.props.app_config_data.length > 0) {
      this.getAppConfigData();
    }

    const context = this.context;

    if (prevState.pageSize !== this.state.pageSize) {

      const { brand, category, location_id, payment_type } =
        this.state.filtedValue;

      const data = {
        from: moment(this.state.from).format('YYYY-MM-DD'),
        to: moment(this.state.to).format('YYYY-MM-DD'),
        // to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        brand: this.commonFilterMapping(brand, 'brand'),
        category: this.commonFilterMapping(category, 'category'),
        employee_id: context.commoncookie,
        location_id: this.commonFilterMapping(location_id, 'location_id') || [location_id],
        payment_type:
          payment_type === 'null'
            ? payment_type
            : payment_type.map((p) => `${p.payment_type} (INR)`),

        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
      };

      apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.posSalePaginationAction(
            data,
          )
        ).finally((res) => this.setState({ isApiFinished: true }));
    }

    if (prevState.page !== this.state.page) {
      const { brand, category, location_id, payment_type } =
        this.state.filtedValue;

      const data = {
        from: moment(this.state.from, 'year', 'month', 'day').format(
          'yyyy-MM-DD',
        ),
        to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        brand: this.commonFilterMapping(brand, 'brand'),
        category: this.commonFilterMapping(category, 'category'),
        employee_id: context.commoncookie,
        location_id: this.commonFilterMapping(location_id, 'location_id') || [location_id],
        payment_type:
          payment_type === 'null'
            ? payment_type
            : payment_type.map((p) => `${p.payment_type} (INR)`),

        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
      };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.posSalePaginationAction(
          data,
        )
      )
    }


    if (this.prevHeaderupdate !== context.headerLocationId) {
      
      if (context.headerLocationId !== 'null') {
        this.setState({
          filtedValue: {
            ...this.state.filtedValue,
            location_id: context.headerLocationId,
          },
        });
      }

      const { brand, category, location_id, payment_type } =
        this.state.filtedValue;

      const data = {
        from: moment(this.state.from, 'year', 'month', 'day').format(
          'yyyy-MM-DD',
        ),
        to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        brand: this.commonFilterMapping(brand, 'brand'),
        category: this.commonFilterMapping(category, 'category'),
        employee_id: context.commoncookie,
        location_id: context.headerLocationId,
        payment_type:
          payment_type === 'null'
            ? payment_type
            : payment_type.map((p) => `${p.payment_type} (INR)`),
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
      };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.posSalePaginationAction(data)
        )

    }
    this.prevHeaderupdate = context.headerLocationId
    if (prevState.filterOpen !== this.state.filterOpen) {
      if (this.state.filterOpen === true) {
        apiCalls(
          context.setModalStatusHandler, context.setLoaderStatusHandler,
          this.props.listStockLocationAction(
            context.commoncookie,
            context.headerLocationId,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
          this.props.listPaymentTypeDetails(),
          !this.props.product.length &&
          this.props.listProductAction(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          )
        )
      }
    }
  }

  cancelPosSale = () => this.setState({ cancelSale: true });

  setFilter = (data) => this.setState({ filter: data });

  handleFilter = (data) => this.setState({ filterOpen: data });

  s = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.ledger_list
        .map((m) => {
          return m.id === id ? m : null;
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

  handleClose = (id) => {
    this.setState({ open: false, dialog: false, delete: false });
  };
  addNote = (msg) => {
    this.setState({ note: msg });
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };
  handleSubmit = async (data) => {
    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateLedgerAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
      await this.setState({ open: false });
    } else {
      const id = this.props.stock_ledger_list[0]?.sequence_id;
      const current_seq = this.props.stock_ledger_list[0]?.current_seq;

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createLedgerAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          id,
          { current_seq },
        )
      );
      await this.setState({ open: false });
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

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({ pageSize: size })
    // const context = this.context;

    // const {brand, category, location_id, payment_type} =
    //   this.state.filtedValue;

    // const data = {
    //   from: moment(this.state.from, 'year', 'month', 'day').format(
    //     'yyyy-MM-DD',
    //   ),
    //   to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //   brand: this.commonFilterMapping(brand, 'brand'),
    //   category: this.commonFilterMapping(category, 'category'),
    //   employee_id: context.commoncookie,
    //   location_id: this.commonFilterMapping(location_id, 'location_id'),
    //   payment_type:
    //     payment_type === 'null'
    //       ? payment_type
    //       : payment_type.map((p) => `${p.payment_type} (INR)`),
    //       pageCount: this.state.page,
    //       numPerPage: size,
    //       searchString:this.state.searchVal,
    // };

    // apiCalls(
    //   this.props.posSalePaginationAction(
    //     data,
    //   )
    // );

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
    // const {brand, category, location_id, payment_type} = this.state.filtedValue;

    // const data = {
    //   from: moment(this.state.from, 'year', 'month', 'day').format(
    //     'yyyy-MM-DD',
    //   ),
    //   to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //   brand: this.commonFilterMapping(brand, 'brand'),
    //   category: this.commonFilterMapping(category, 'category'),
    //   employee_id: context.commoncookie,
    //   location_id: this.commonFilterMapping(location_id, 'location_id'),
    //   payment_type:
    //     payment_type === 'null'
    //       ? payment_type
    //       : payment_type.map((p) => `${p.payment_type} (INR)`),
    //       pageCount: page,
    //       numPerPage:  pageSize,
    //       searchString:this.state.searchVal,
    // };

    // apiCalls(
    //   this.props.posSalePaginationAction(
    //     data,
    //   )
    // );
  };

  brandSearch = (event, key) => {
    let values = event ? event[key] : false;
    // setCategory('')
    // setSearch('')
    this.setState({ [key]: event ? event[key] : '' });
    if (values) {
      const result = this.props.pos_sale_list.filter((data) => {
        return data.sales_items.some((t) => t[key]?.includes(values));
      });

      this.setState({ filterData: result });
    } else {
      this.setState({ filterData: this.props.pos_sale_list });
    }
  };

  createMail = () => {
    const context = this.context;
    const custData = this.props.customer.find(
      (d) => this.state.customer_id === d.customer_id,
    );
    const data = {
      custData,
      invoice_number: this.state.invoice,
      sales_items: this.state.sales_items,
      email: custData.email,
      appConfigData: this.state.appConfigData,
      posSale: true,
      no_sms: this.props.sms_configuration[0]?.isActive === 1 ? false : true,
      sales_payments: this.state.sales_payments,
      soDate: this.state.soDate,
      sale_id: this.state.sale_id,
    };

    this.props.sendMail(data, context.setLoaderStatusHandler);

    this.setState({ Dopen: false, rowPopup: { open: false } });
    // handleSubmit()
  };

  invoiceFunction = async (data) => {
    // await this.props.listCustomerAction()
    // const context = this.context;
    // apiCalls(
    //   context.setModalStatusHandler, context.setLoaderStatusHandler,
    //   !this.props.product.length &&
    //     this.props.listProductAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
    // )
    //   !this.props.customer.length && await this.props.listcustomerinvoice(data.customer_id,context.setModalTypeHandler, context.setLoaderStatusHandler, async(response)=>{
    //  if(response === 200){
    // const custData = await this.props.customer.filter(
    //   (d) => data.customer_id === d.customer_id,
    // ) || {company_name : data.company_name};

    // const productData = await this.customFetch(
    //   API_URLS.GET_CUSTOMER_BY_ID(data.customer_id),
    //   'GET'
    // );
    const sales_items = await data.sales_items.map((d) => {
      // const taxes = this.props.product.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
      // d.taxes = taxes;
      return d;
    });

    const custData = {
      company_name: data.company_name,
      first_name: data.customer_name,
      city: data.city,
      email: data.email,
      state: data.state,
      area: data.area,
      phone_number: data.phone_number,
      tax_id: data.GST
    }

    this.getAppConfigData(data);
    this.setState({
      invoice: data.invoice_number,
      custData: custData,
      soDate: data.sale_time,
      sales_items: sales_items,
      Dopen: true,
      customer_id: data.customer_id,
      sale_id: data.sale_id,
      note: data.note,
      sales_payments: data.sales_payments,
      invoicefile: data.invoice_file,
      Einvoice : data.Einvoice
    });
    // }
    // })
  };

  handleChange = async (data) => {
    var date_val = data.target.value._d;
    await this.setState({ [data.target.name]: date_val });

    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          // await this.props.GetPosSaleDateFilterAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"))

          // var filterData = [];

          // if(this.state.start_date && this.state.end_date) {
          //     await this.props.balancesheet.map((d,i)=>{
          //    if(d.transactionDate !== null) {
          //             if(this.state.from.getTime() <= new Date(d.transactionDate).getTime() && this.state.to.getTime() >= new Date(d.transactionDate).getTime())
          //                 filterData.push(d);
          //         }
          //     })

          this.setState({ errormsg: { from: '', to: '' } }); // balancesheet_data: filterData ,
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

  sample = (value) => {
    this.setState({ open: value, rowPopup: { open: value }, columPopup: { open: value }, cancelSale: value });
  };

  handleApplyButton = (val) => {
    this.setState({ button: val });
  };

  clearButton = () => {
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    this.setState({ button: '4' });
    const context = this.context;
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const { brand, category, location_id, payment_type } = this.state.filtedValue;

    const data = {
      from: moment(this.state.from).format('YYYY-MM-DD'),
      to: moment(this.state.to).format('YYYY-MM-DD'),
      brand: 'null',
      category: 'null',
      location_id: 'null',
      payment_type: 'null',
      employee_id: context.commoncookie,
     
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
     
    }

    apiCalls(

      this.props.posSalePaginationAction(data)

    )

    this.setState({
      from: firstDay,
      to: lastDay,
      brand: 'null',
      category: 'null',
      location_id: 'null',
      payment_type: 'null',
      page: 0
    });
    this.setState({ filterOpen: false });


  };

  ApplyButton = async (formValue) => {

    this.setState({ button: '' });
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    //   if(moment(this.state.from ,'year') <= moment(this.state.to,'year') ){

    //     if(moment(this.state.from ,'month') <= moment(this.state.to,'month')){

    //         if(moment(this.state.from ,'day') <= moment(this.state.to,'day')){
    // if(this.state.from !== '' && this.state.to !== ''){

    // categoryName =category.category
    //  brandName = brand.brand
    const context = this.context;
    // // this.setState.badgeCount("")
    const { brand, category, location_id, payment_type } = formValue
    this.setState({ filtedValue: formValue });

    const data = {
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      location_id: this.commonFilterMapping(location_id, 'location_id') || [location_id],
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
    };


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.posSalePaginationAction(
        data,
      ),
    ).finally((res) => this.setState({ isApiFinished: true }));
    // this.setState({filter:{...this.state.filter,location_id,payment_type}})

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.GetPosSaleDateFilterAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     data,
    //   ),

    //  const badgeCount = [this.state.filtedValue.brand,this.state.filtedValue.category,this.state.filtedValue.location_id,this.state.filtedValue.payment_type]

    // let count = 0
    // badgeCount.forEach(d=> {
    // if(d) count +=1
    // } )
    // this.setState({
    //   ...this.state,
    //   ['count']:count
    // })

    this.setState({page: 0});

    this.setState({ filterOpen: false });

    // // var filterData = [];

    // // if(this.state.start_date && this.state.end_date) {
    // //     await this.props.balancesheet.map((d,i)=>{
    // //    if(d.transactionDate !== null) {
    // //             if(this.state.from.getTime() <= new Date(d.transactionDate).getTime() && this.state.to.getTime() >= new Date(d.transactionDate).getTime())
    // //                 filterData.push(d);
    // //         }
    // //     })

    // this.setState({errormsg : {from: "",to:""}}); // balancesheet_data: filterData ,
    // }
    //         }
    //         else{
    //             this.setState({errormsg : {...this.state.errormsg,[data.target.name] : "Invalid Date 1"}})
    //         }
    //     }
    //     else{
    //         this.setState({errormsg : {...this.state.errormsg,[data.target.name] : "Invalid Date 2"}})
    //     }
    // }
    // else{
    //   this.setState({errormsg : {...this.state.errormsg,[data.target.name] : "Invalid Date 3"}})
    // }
  };

  grandTotal = () => {
    let GTotal = this.state.filterData.reduce(
      (previous, present) =>
        previous +
        +present.sales_items.reduce(
          (acc, cur) =>
            acc +
            +(
              cur.item_unit_price +
              (cur.item_unit_price / 100) *
              (cur.tax_rate !== null ? cur.tax_rate : 18)
            ),
          0,
        ),
      0,
    );
    return GTotal.toFixed(2);
  };

  removeDuplicateCharacters(string) {
    if (!string) return '';

    const getFilter = string?.split(',').filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    });
    const removeInr = _.uniqBy(
      getFilter.map((d, i) => {
        const getType = d.trim().split(' ')[0];
        return getType;
      }),
    ).join(', ');

    return removeInr;
  }
  exportDataPayload = () => {
    const context = this.context;
    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    return {
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      headerLocationId: this.commonFilterMapping(location_id, 'location_id'),
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
    };
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e;
    this.setState({ searchVal: val, page: 0 });


    // if(val.trim() !== ''){
    this.props.set_searchPosSaleAction({ data: [], numRows: 0 })
    // }

    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    const body = {
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val,
      location_id: this.commonFilterMapping(location_id, 'location_id'),
    }

    this.props.get_searchPosSaleAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
    // const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
    // const filteredRows = this.props.pos_sale_by_pagination.filter((row) => {
    //   return Object.keys(row).some((field) => {
    //     return searchRegex.test(row[field]);
    //   });
    // });
    // this.setState({searchData: filteredRows, searchPageData: filteredRows});
    // this.setState({page: 0});
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
    // this.props.set_searchPosSaleAction({data:[], numRows:0})
    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    const data = {
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      location_id: this.commonFilterMapping(location_id, 'location_id'),
    }




    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.posSalePaginationAction(
        data,
      ),
    )


  };
  handleEdit = async (data, editIndex) => {
    this.setState({
      edit_id_data: data,
      open: true,
      status: 'edit',
      columPopup: { open: false, rowIndex: editIndex },
    });
  };
  handleEditfind = ()=>{
    this.setState({
      editfinds: false
    });
  }
  columPopupClose = () => {
    this.setState({ columPopup: { open: false, rowIndex: '' } });
  };
  rowPopupClose = () => {
    this.setState({ rowPopup: { open: false } });
  };

  cancelPosSaleBackBtn = (data) => {
    this.setState({ rowPopup: { open: true, rowIndex: data }, columPopup: { open: false }, cancelSale: false });
  }
  customerid = () => {
    this.setState({ Customerid: '' })
  }

  IndexData = (data) => {
    this.setState({ indexValue: data })
  }

  handleCancelPosSale = async (data, sale_id) => {
    const context = this.context;
    if (sale_id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.cancelPosSaleAction(sale_id, data, context.setModalTypeHandler, context.setLoaderStatusHandler, async (res) => {
          if (res) {

            const data = {
              from: moment(this.state.from, 'year', 'month', 'day').format(
                'yyyy-MM-DD',
              ),
              to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
              brand: 'null',
              category: 'null',
              employee_id: context.commoncookie,
              location_id: context.headerLocationId,
              payment_type: 'null',
              pageCount: this.state.page || 0,
              numPerPage: this.state.pageSize,
              searchString: ''
            };


            apiCalls(
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              this.props.posSalePaginationAction(data),
            )


            this.setState({ open: false, rowPopup: { open: false }, columPopup: { open: false }, cancelSale: false });
          }
        })

      );
    }
    await this.setState({ rowPopup: { open: false } })
  }

  handleSmsMailConfiguration = async () => {
    const context = this.context;
    const roleIdData = this.props.createUser.filter(f => f.employee_id === context.commoncookie)
    if (roleIdData.length > 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdMailConfigurationAction('Pos Sale', roleIdData[0]?.role_id),
        this.props.getByIdSmsConfigurationAction('Pos Sale', roleIdData[0]?.role_id)

      );
    }
  }

  handleColumnHide = (column) => {
    // Find the index of the column being hidden
    const columnIndex = this.state.columnData.findIndex((col) => col.field === column.field);
    if (columnIndex !== -1) {
      // Create a copy of the columns array
      const updatedColumns = [...this.state.columnData];
      // Remove the column from the array
      updatedColumns.splice(columnIndex, 1);
      const updatedA = { ...this.state.columnHead };
      updatedA[column.field] = !column.isVisible;
      this.setState({columnHead: updatedA});
    }
  };

  handleColumnSubmit = () => {
    const context = this.context;
    let data = { data: this.state.columnHead }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.updateColumnAction(data)
    )
  }

  handleExport = async () => {
    const context = this.context;
    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    const data = {
      from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      payment_type: payment_type === 'null' ? payment_type : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal || '',
      location_id: this.commonFilterMapping(location_id, 'location_id'),
    };

    // Restrict export to max 90 days
    const fromDate = moment(data.from);
    const toDate = moment(data.to);
    const diffDays = toDate.diff(fromDate, 'days');
    if (diffDays > 90) {
      this.props.showAlert('Export is limited to 90 days. Please reduce the date range.', 'warning');
      return;
    }

    // Fetch export data on-demand only when user clicks export
    const exportData = await this.props.posSaleExportDataAction(data, context.commoncookie);

    const escCsv = (val) => {
      if (val == null) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n') ? '"' + str.replace(/"/g, '""') + '"' : str;
    };

    const dataRows = (exportData || []).slice(3);
    const csvContent = dataRows.map((row) =>
      Array.isArray(row) ? row.map(escCsv).join(',') : ''
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'posReport.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

    getPreviousMonths = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    const previousMonths = [];

    for (let i = 1; i <= 4; i++) {
        const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
        let prevMonthYear = currentYear;
        if (prevMonthIndex > currentMonthIndex) {
            prevMonthYear--;
        }
        const prevMonthString = `${months[prevMonthIndex]} ${prevMonthYear}`;
        previousMonths.push(prevMonthString);
    }

    return previousMonths;
};

    getStartAndEndDate = (monthName, year) => {
    const monthMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const monthNumber = monthMap[monthName.toLowerCase()];
    const startDate = new Date(year, monthNumber, 1);
    const endDate = new Date(year, monthNumber + 1, 0);

    return { startDate, endDate };
};

handlePreviousMonthClick = (data,btn) => {
  console.log("data",data)
  const context = this.context;
  const month = data.split(' ')[0];
  const year = data.split(' ')[1];
  const { startDate, endDate } = this.getStartAndEndDate(month, year)
  console.log(startDate, 'startdateee');
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  this.setState({ button: btn });
  this.setState({ isApiFinished: true })
  this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
  this.setState({from:startDateObj,to:endDateObj})
    const payload = {
      from: moment(startDate, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(endDateObj, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: "null",
      category: "null",
      employee_id: context.commoncookie,
      location_id: context.headerLocationId,
      payment_type: "null",
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: "",
    };
    

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.posSalePaginationAction(
        payload,
      ),
    ).finally((res) => this.setState({ isApiFinished: false }));
    this.setState({page: 0});

    this.setState({ filterOpen: false });
  };

  filterColumns = () => {
    const columnData = this.customFetch(
      API_URLS.GET_POS_COLUMN_SELECTION,
      'GET',
      {}
    );
    this.setState({columnHead: columnData})
    const updatedColumnData = [...this.state.columnData];
    const filteredColumns = updatedColumnData.map((column) => {
      if (columnData[column.field]) {
        return {
          ...column,
          hide: true,
        };
      } else {
        return column;
      }
    });
    return filteredColumns;
  };

  render() {
    const { button } = this.state;
    console.log('Einvoiceeee', this.state.Einvoice)
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | PosReport</title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
            setModalStatusHandler,
          }) => (
            <React.Fragment>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              <PdfInvoiceDialog
                open={this.state.pdfDialog.open}
                onClose={() => this.setState({ pdfDialog: { open: false, saleId: null, invoiceNumber: '', locationId: null, companyId: null } })}
                saleId={this.state.pdfDialog.saleId}
                invoiceNumber={this.state.pdfDialog.invoiceNumber}
                documentType="pos_receipt"
                locationId={this.state.pdfDialog.locationId}
                companyId={this.state.pdfDialog.companyId}
              />
              <InvoiceDialog
                sales_payments={this.state.sales_payments}
                appConfigData={this.state.appConfigData}
                note={this.state.note}
                addNote={this.addNote}
                createMail={this.createMail}
                custType={'CUSTOMER'}
                posSale={true}
                custData={this.state.custData}
                invoice={this.state.invoice}
                sale_id={this.state.sale_id}
                soDate={this.state.soDate}
                sales_items={this.state.sales_items}
                open={this.state.Dopen}
                handleSubmit={this.handleSubmit}
                handleClose={() =>
                  this.setState({ Dopen: false, rowPopup: { open: false } })
                }
                invoicepos={true}
                stockaddress={this.props.pos_sale_list}
                mail_configuration={this.props.mail_configuration}
                Einvoice = {this.state.Einvoice}
              />
              <div
                style={{
                  maxHeight: 'calc(100vh - 80px)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {this.state.open === false &&
                  this.state.rowPopup.open === false &&
                  this.state.columPopup.open === false &&
                  this.state.cancelSale === false && (
                    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>Pos Report</Typography>
                        <Box sx={{ flex: 1 }} />
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
                          <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>Grand Total</Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2E7D32', lineHeight: 1.3 }}>{`\u20B9${Number(this.props.grandTotal || 0).toLocaleString('en-IN')}`}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
                          {(() => {
                            const currentDate = new Date();
                            const currentYear = currentDate.getFullYear();
                            const currentMonthIndex = currentDate.getMonth();
                            const monthChips = [];
                            for (let i = 3; i >= 0; i--) {
                              const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
                              let prevMonthYear = currentYear;
                              if (prevMonthIndex > currentMonthIndex) prevMonthYear--;
                              const label = `${this.months[prevMonthIndex]} ${prevMonthYear}`;
                              const btnId = String(4 - i);
                              monthChips.push(
                                <Chip
                                  key={btnId}
                                  label={label}
                                  size="small"
                                  clickable
                                  onClick={() => {
                                    this.handlePreviousMonthClick(label, btnId);
                                    this.handleApplyButton(btnId);
                                  }}
                                  sx={{
                                    fontWeight: button === btnId ? 600 : 400,
                                    fontSize: '0.75rem',
                                    height: 26,
                                    bgcolor: button === btnId ? 'primary.main' : 'transparent',
                                    color: button === btnId ? '#fff' : 'text.secondary',
                                    '&:hover': {
                                      bgcolor: button === btnId ? 'primary.dark' : '#e0e0e0',
                                    },
                                  }}
                                />
                              );
                            }
                            return monthChips;
                          })()}
                        </Box>
                        {/* Search */}
                        <CommonSearch
                          searchVal={this.state.searchVal}
                          cancelSearch={this.cancelSearch}
                          requestSearch={(e) => this.requestSearch(e.target.value)}
                        />
                        {/* Filter */}
                        <FilterPossale
                          fromTo={true}
                          catabrand={true}
                          from={this.state.from}
                          locat={true}
                          to={this.state.to}
                          count={this.state.count}
                          filtedValue={this.state.filtedValue}
                          setFilter={this.setFilter}
                          brandSearch={this.brandSearch}
                          handleChange={this.handleChange}
                          handleClose={this.handleFilter}
                          open={this.state.filterOpen}
                          ApplyButton={this.ApplyButton}
                          clearButton={this.clearButton}
                        />
                        {/* Export */}
                        <Tooltip title="Export CSV">
                          <IconButton onClick={this.handleExport}>
                            <FileDownloadIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        {/* Save Columns */}
                        <Tooltip title="Save Columns">
                          <IconButton onClick={this.handleColumnSubmit}>
                            <SaveIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {/* DataGrid */}
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <DataGrid
                          rows={this.props.searchPosSaleData.map((row, index) => ({
                            ...row,
                            id: index + 1,
                          }))}
                          columns={this.state.data.filter((c) => !c.hide)}
                          rowCount={this.props.searchPosSaleCount}
                          getRowId={(row) => row.id}
                          paginationMode="server"
                          paginationModel={{ page: this.state.page, pageSize: this.state.pageSize }}
                          onPaginationModelChange={(m) => {
                            if (m.page !== this.state.page) this.handlePageChange(m.page);
                            if (m.pageSize !== this.state.pageSize) this.handlePageSizeChange(m.pageSize);
                          }}
                          pageSizeOptions={[20, 50, 100]}
                          density="compact"
                          disableRowSelectionOnClick
                          onRowClick={(params) => {
                            this.setState({
                              rowPopup: {
                                rowIndex: this.props.searchPosSaleData.findIndex(
                                  (i) =>
                                    params.row.sale_id
                                      ? i.sale_id === params.row.sale_id
                                      : i.customer_id === params.row.customer_id
                                ),
                                open: true,
                              },
                            });
                          }}
                          slotProps={{ pagination: { showFirstButton: true, showLastButton: true } }}
                          sx={{
                            border: 'none',
                            height: '100%',
                            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
                            '& .MuiDataGrid-cell': { fontSize: 12 },
                            '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
                            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' },
                          }}
                        />
                      </Box>
                    </Card>
                  )}
                {this.state.rowPopup.open === true &&
                  this.state.columPopup.open === false && (
                    <PurchaseErpDesign
                      // statementOfAccount={this.props.searchPosSaleData}
                      rowIndex={this.state.rowPopup.rowIndex}
                      open={this.state.cancelSale}
                      IndexData={this.IndexData}
                      cancelPosSale={this.cancelPosSale}
                      handleEdit={this.handleEdit}
                      rowPopupClose={this.rowPopupClose}
                      handleDelete={this.handledialog}
                      type={'posSale'}
                      customerid={this.state.Customerid}
                      pos_sale_by_pagination={this.props.searchPosSaleData}
                      handleCancelPosSale={this.handleCancelPosSale}
                      cancelPosSaleBackBtn={this.cancelPosSaleBackBtn}
                    />
                  )}
              {/* {this.state.rowPopup.open === false && this.state.cancelSale === true && <CancelPosSalePage 

            rowIndex={this.state.rowPopup.rowIndex}
            pos_sale_by_pagination={this.props.pos_sale_by_pagination} 
            cancelPosSaleBackBtn={this.cancelPosSaleBackBtn}
            indexValue={this.state.indexValue} 
            handleCancelPosSale={this.handleCancelPosSale} 
            rowPopupClose={this.rowPopupClose}
            setModalStatusHandler={setModalStatusHandler}
            setModalTypeHandler={setModalTypeHandler}
            />} */}

              {this.state.columPopup.open &&
                this.state.rowPopup.open === false && (
                  <App
                    statementOfAccount={this.props.Get_customer_statement}
                    rowIndex={''}
                    handleEdit={this.handleEdit}
                    rowPopupClose={this.columPopupClose}
                    handleDelete={this.handledialog}
                    type={'customer'}
                    customerid={this.state.Customerid}
                    posSaleData={this.props.searchPosSaleData}
                    posSaleRowIndex={this.state.columPopup.rowIndex}
                    designType={'posSale'}
                    setEditfind = {this.handleEditfind}
                    customertype = {this.state.customer_type}
                  />
                )}
              </div>
              {/* {this.state.open && <Ledger edit_id_data={ths.state.edit_id_data} handleClose={this.handleClose} handleSubmit={this.handleSubmit} {...this.props} />} */}
            </React.Fragment>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    pos_sale_list: state.posSaleReducer.pos_sale_list || [],
    product: state.productReducer.product,
    customer: state.customerReducer.customer_invoice || [],
    possale_count: state.posSaleReducer.possale_count,
    balancesheet_id_data: state.balancesheetReducer.balancesheet_id_data || [], //vendorReducer
    app_config_data: state.appConfigReducer.app_config_data,
    grandTotal: state.posSaleReducer.grandTotal || 0,
    cancelPosSale: state.posSaleReducer.cancelPosSale || [],
    mail_configuration: state.ConfigurationReducer.mail_configuration || [],
    sms_configuration: state.ConfigurationReducer.sms_configuration || [],
    createUser: state.UserCreationReducer.createUser || [],
    searchPosSaleData: state.posSaleReducer.searchPosSaleData || [],
    searchPosSaleCount: state.posSaleReducer.searchPosSaleCount || 0,
    // column: state.posSaleReducer.column,
    posExportData: state.posSaleReducer.posExportData || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listProductAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    listStockLocationAction: (
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listStockLocationAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listCustomerAction: () => {
      return dispatch(listCustomerAction());
    },
    listcustomerinvoice: (id, setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(listcustomerinvoice(id, setModalTypeHandler, setLoaderStatusHandler, response));
    },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    listBalancesheetdateAction: (from, to) => {
      dispatch(listBalancesheetdateAction(from, to));
    },
    getAppConfigDataAction: () => {
      return dispatch(getAppConfigDataAction());
    },
    listPaymentTypeDetails: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    GetPosSaleDateFilterAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
    ) => {
      return dispatch(
        GetPosSaleDateFilterAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
        ),
      );
    },
    get_searchPosSaleAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        get_searchPosSaleAction(
          val,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    set_searchPosSaleAction: (val) => { return dispatch(set_searchPosSaleAction(val)); },
    posSalePaginationAction: (data) => {
      return dispatch(posSalePaginationAction(data));
    },
    cancelPosSaleAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      id,
      data,
      sample
    ) => {
      return dispatch(
        cancelPosSaleAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          data,
          sample
        ),
      );
    },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getByIdMailConfigurationAction: (mail_name, role_id) => {
      return dispatch(getByIdMailConfigurationAction(mail_name, role_id))
    },
    getByIdSmsConfigurationAction: (sms_role_name, role_id) => {
      return dispatch(getByIdSmsConfigurationAction(sms_role_name, role_id))
    },
    updateColumnAction: (data) => {
      return dispatch(updateColumnAction(data))
    },
    getColumnAction: () => {
      return dispatch(getColumnAction())
    },
    posSaleExportDataAction: (data, employee_id) => {
      return dispatch(posSaleExportDataAction(data, employee_id));
    },
    showAlert: (msg, severity) => {
      return dispatch(OpenalertActions({ msg, severity }));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PosSaleCreation);

