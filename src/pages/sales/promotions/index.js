import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _, {concat, filter} from 'lodash';
import {
  GetPosSaleDateFilterAction,
  cancelPosSaleAction,
  get_searchPosSaleAction,
  set_searchPosSaleAction,
  posSalePaginationAction,
  getColumnAction,
  updateColumnAction,
  posSaleExportDataAction,
  posSalePromotionAction,
  set_searchPosPromotionAction,
  get_searchPosPromotionAction,
  updatePosSalePromotionAction,
} from '../../../redux/actions/pos_sale_actions';
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
  IconButton,
} from '@mui/material';
import {listPaymentTypeDetails} from '../../../redux/actions/payment_method_actions';
import {listProductAction} from '../../../redux/actions/product_actions';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import InvoiceDialog from '../sales/InvoiceDialog';
import {
  listCustomerAction,
  listcustomerinvoice,
} from '../../../redux/actions/customer_actions';
import {sendMail} from '../../../redux/actions/sales_actions';
import {
  listBalancesheetAction,
  listBalancesheetdateAction,
} from '../../../redux/actions/balancesheet_actions';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import {commonDateFormat, getDateTime} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import CancelPosSalePage from '../../../components/posSale_erpDesign/cancelPosSale';
import {baseURL, titleURL} from '../../../http-common';
import FilterPossale from './FilterPossale';
import {ThirtyFpsSharp} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PurchaseErpDesign from '../../../components/posSale_erpDesign/index';
import App from 'components/customer_erpDesign';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import {
  getByIdMailConfigurationAction,
  getByIdSmsConfigurationAction,
} from '../../../redux/actions/configuration_actions';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
  Width,
} from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {Helmet} from 'react-helmet-async';
import AppSearch from '@crema/core/AppSearchBar';
import CommonSearch from 'utils/commonSearch';
import DataGridTemp from 'components/dataGridTemp';
import {useCustomFetch} from 'utils/useCustomFetch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Data } from '@react-google-maps/api';
import API_URLS from '../../../utils/customFetchApiUrls';

class PosPromotions extends Component {
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
      dialog: {open: false, msg: '', severity: ''},
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
      filtedValue: {
        brand: 'null',
        category: 'null',
        location_id: 'null',
        payment_type: 'null',
      },
      cancelSale: false,
      indexValue: '',
      // rowPopup: {
      //   open: false,
      //   rowIndex: '',
      //   receivings_items: []
      // },
      count: 0,
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
      columPopup: {open: false, rowIndex: ''},
      rowPopup: {open: false, rowIndex: ''},
      Customerid: '',
      title: 'Pos Sal',
      columnData: [
        {
          field: 'invoice_number',
          headerName: 'Invoice Number',
          renderCell: (params) => (
            <div
            // style={{
            //   cursor: 'pointer',
            //   textDecoration: 'underline',
            // }}
            // onClick={(event) => {
            //   this.invoiceFunction(params.row);
            //   event.stopPropagation();
            //   this.handleSmsMailConfiguration();
            // }}
            >
              {params.value}
            </div>
          ),
          align: 'center',
          flex: 1,
          minWidth: Width('invoice number'),
        },
        {
          field: 'sale_time',
          headerName: 'Sale Date',
          flex: 1,
          minWidth: Width('date'),
        },
        {
          field: 'company_name',
          headerName: 'Customer Name',
          renderCell: (params) => (
            <div //Link
            // onClick={(event) => {
            //   this.setState({
            //     columPopup: {
            //       rowIndex: this.props.searchPosPromotionData.findIndex((i) =>
            //         params.row.customer_id
            //           ? i.customer_id === params.row.customer_id
            //           : i.supplier_id === params.row.supplier_id,
            //       ),
            //       open: true,
            //     },
            //     Customerid: params.row.customer_id,
            //   });
            //   setTimeout(() => {
            //     this.setState({rowPopup: {open: false}});
            //   }, 0);
            //   event.stopPropagation();
            // }}
            // style={{
            //   textDecoration: 'underline',
            //   cursor: 'pointer', // Add cursor style
            // }}
            >
              {params.value === null || params.value === ''
                ? params.row.customer_name
                : params.value}
            </div>
          ),
          flex: 1,
          minWidth: 200,
        },
        {
          field: 'product_name',
          headerName: 'Products',
          cellClassName: 'left-align-cell',
          flex: 1,
          minWidth: 200,
        },
        {
          field: 'promotion_status',
          headerName: 'Status',
          minWidth: 150,
          align: 'center',
          flex: 1,
          renderCell: (params) => (
            <CheckCircleIcon
              sx={{
                color: params.value === 0 ? '#FF5252' : 'green',
                fontSize: '20px',
              }}
            />
          ),
        },
        {
          field: 'promotion_sent_date',
          headerName: 'Promotion Date',
          align: 'center',
          flex: 1,
          minWidth: 150,
        },
        {
          field: '',
          headerName: 'Action',
          align: 'center',
          flex: 1,
          minWidth: 100,
          renderCell: (params) => (
            <Grid display='flex'>
              <IconButton onClick={() => this.handleWhatsappPromotion(params.row)}>
                <WhatsAppIcon sx={{color: '#0eb355', fontSize: '20px'}} />
              </IconButton>
              <IconButton onClick={() => this.handleSmsPromotion(params.row)}>
                <MessageIcon sx={{color: '#0c77c4', fontSize: '20px'}} />
              </IconButton>
            </Grid>
          ),
        },
      ],
      isApiFinished: false,
      columnHead: {},
      data: [],
      ex_data: [],
      filtered_column: {},
    };
    this.customFetch = useCustomFetch();
  }

  handleSmsPromotion = (rowData) => {
    if(rowData.promotion_status === 1){
      return 
    }
    const context = this.context;

    const temp = this.props.searchPosPromotionData.map(i => {
      if(i.promotion_id === rowData.promotion_id){
        return {
          ...i,
          promotion_status : 1,
          promotion_sent_date: moment().format('yyyy-MM-DD'),
        }
      }else{
        return i
      }
    })
    
    const arr_status_zero = temp.filter(i => i.promotion_status === 0).sort((a, b) => a.status - 1);
    const arr_status_one = temp.filter(i => i.promotion_status === 1).sort((a,b) => new Date(a.promotion_sent_date).getTime() - new Date(b.promotion_sent_date).getTime());
    const sortedTemp = [...arr_status_zero, ...arr_status_one];

    this.props.set_searchPosPromotionAction({data: sortedTemp, numRows: this.props.searchPosPromotionCount});

    rowData.promotion_status = 1;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.updatePosSalePromotionAction(rowData)
    )
  };

  handleWhatsappPromotion = (rowData) => {
    if(rowData.promotion_status === 1){
      return 
    }
    const context = this.context;

    const temp = this.props.searchPosPromotionData.map(i => {
      if(i.promotion_id === rowData.promotion_id){
        return {
          ...i,
          promotion_status : 1,
          promotion_sent_date: moment().format('yyyy-MM-DD'),
        }
      }else{
        return i
      }
    })
    
    const arr_status_zero = temp.filter(i => i.promotion_status === 0).sort((a, b) => a.status - 1);
    const arr_status_one = temp.filter(i => i.promotion_status === 1).sort((a,b) => new Date(a.promotion_sent_date).getTime() - new Date(b.promotion_sent_date).getTime());
    const sortedTemp = [...arr_status_zero, ...arr_status_one];

    this.props.set_searchPosPromotionAction({data: sortedTemp, numRows: this.props.searchPosPromotionCount});

    rowData.promotion_status = 1;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.updatePosSalePromotionAction(rowData)
    )

  };

  async componentDidMount() {
    this.prevHeaderupdate = this.context.headerLocationId;
    this.props.set_searchPosPromotionAction({data: [], numRows: 0});
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

    this.setState({data: filteredColumns, columnHead: isVisibleColumn});

    const {brand, category, location_id, payment_type} = this.state.filtedValue;
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
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      !this.props.product.length &&
        this.props.listProductAction(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      !this.props.app_config_data.length && this.props.getAppConfigDataAction(),
      // this.props.posSaleExportDataAction(data, context.commoncookie),
      this.props.posSalePromotionAction(data),
    );

    this.handleExport();

    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  getAppConfigData = async (data) => {
    const {app_config_data} = this.props;
    const companyName = app_config_data.filter(
      (f) => f.key_name == 'company.name',
    );
    // const fullAddress = app_config_data.filter(f=>f.key_name =='address.area');
    // const city = app_config_data.filter(f=>f.key_name =='address.city');
    // const emailData = app_config_data.filter(f=>f.key_name =='address.email');
    const fullAddress = data?.LocationAddress || '';
    const city = data?.LocationCity || '';
    const emailData = data?.LocationEmail || '';
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = data?.LocationPhonenumber || '';
    // const companyMobile = app_config_data.filter(f=>f.key_name =='company.mobile');
    const state = data?.LocationState || '';
    // const state = app_config_data.filter(f=>f.key_name =='address.state')
    // const state =
    //   data?.state.concat(',', data?.zip === null ? '' : data?.zip) || '';
    const web = app_config_data.filter((f) => f.key_name == 'web.base.url');
    const invoice_logo = app_config_data.filter(
      (f) => f.key_name == 'company.invoice.logo',
    );

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
        invoice_logo: invoice_logo.length > 0 ? invoice_logo[0].value : '',
      },
    });
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.pos_sale_list !== this.props.pos_sale_list) {
      this.setState({filterData: this.props.pos_sale_list});
    }

    if (
      prevProps.app_config_data !== this.props.app_config_data &&
      this.props.app_config_data.length > 0
    ) {
      this.getAppConfigData();
    }

    const context = this.context;

    if (prevState.pageSize !== this.state.pageSize) {
      const {brand, category, location_id, payment_type} =
        this.state.filtedValue;

      const data = {
        from: moment(this.state.from, 'year', 'month', 'day').format(
          'yyyy-MM-DD',
        ),
        to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        brand: this.commonFilterMapping(brand, 'brand'),
        category: this.commonFilterMapping(category, 'category'),
        employee_id: context.commoncookie,
        location_id: this.commonFilterMapping(location_id, 'location_id') || [
          location_id,
        ],
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
        this.props.posSalePromotionAction(data),
      ).finally((res) => this.setState({isApiFinished: true}));
    }

    if (prevState.page !== this.state.page) {
      const {brand, category, location_id, payment_type} =
        this.state.filtedValue;

      const data = {
        from: moment(this.state.from, 'year', 'month', 'day').format(
          'yyyy-MM-DD',
        ),
        to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        brand: this.commonFilterMapping(brand, 'brand'),
        category: this.commonFilterMapping(category, 'category'),
        employee_id: context.commoncookie,
        location_id: this.commonFilterMapping(location_id, 'location_id') || [
          location_id,
        ],
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
        this.props.posSalePromotionAction(data),
      );
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

      const {brand, category, location_id, payment_type} =
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
        this.props.posSalePromotionAction(data),
      );
    }
    this.prevHeaderupdate = context.headerLocationId;
    if (prevState.filterOpen !== this.state.filterOpen) {
      if (this.state.filterOpen === true) {
        apiCalls(
          context.setModalStatusHandler,
          context.setLoaderStatusHandler,
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
            ),
        );
      }
    }
  }

  cancelPosSale = () => this.setState({cancelSale: true});

  setFilter = (data) => this.setState({filter: data});

  handleFilter = (data) => this.setState({filterOpen: data});

  s = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.ledger_list
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  //   handleDelete = async (id) => {
  //     const context = this.context;
  //     await this.props.deleteCashBoxAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     this.setState({ delete: false })
  //   }
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleClose = (id) => {
    this.setState({open: false, dialog: false, delete: false});
  };
  addNote = (msg) => {
    this.setState({note: msg});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
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
        ),
      );
      await this.setState({open: false});
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
          {current_seq},
        ),
      );
      await this.setState({open: false});
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
    this.setState({pageSize: size});
  };
  handlePageChange = async (page) => {
    this.setState({page: page});
  };

  brandSearch = (event, key) => {
    let values = event ? event[key] : false;
    // setCategory('')
    // setSearch('')
    this.setState({[key]: event ? event[key] : ''});
    if (values) {
      const result = this.props.pos_sale_list.filter((data) => {
        return data.sales_items.some((t) => t[key]?.includes(values));
      });

      this.setState({filterData: result});
    } else {
      this.setState({filterData: this.props.pos_sale_list});
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

    this.setState({Dopen: false, rowPopup: {open: false}});
    // handleSubmit()
  };

  invoiceFunction = async (data) => {
    const productData = await this.customFetch(
  API_URLS.GET_CUSTOMER_BY_ID(data.customer_id),
  'GET',
  {}
);
    const sales_items = await data.sales_items.map((d) => {
      const taxes =
        this.props.product.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
        [];
      d.taxes = taxes;
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
      tax_id: data.GST,
    };

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
    });
    // }
    // })
  };

  handleChange = async (data) => {
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

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

  sample = (value) => {
    this.setState({
      open: value,
      rowPopup: {open: value},
      columPopup: {open: value},
      cancelSale: value,
    });
  };

  clearButton = () => {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.setState({
      from: firstDay,
      to: lastDay,
    });
  };

  ApplyButton = async (formValue) => {
    const context = this.context;
    const {brand, category, location_id, payment_type} = formValue;
    this.setState({filtedValue: formValue});

    const data = {
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      employee_id: context.commoncookie,
      location_id: this.commonFilterMapping(location_id, 'location_id') || [
        location_id,
      ],
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
      this.props.posSalePromotionAction(data),
      // this.props.posSaleExportDataAction(data, context.commoncookie),
    ).finally((res) => this.setState({isApiFinished: true}));

    this.setState({page: 0});

    this.setState({filterOpen: false});
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
    const {brand, category, location_id, payment_type} = this.state.filtedValue;
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
    this.setState({searchVal: val, page: 0});

    // if(val.trim() !== ''){
    this.props.set_searchPosPromotionAction({data: [], numRows: 0});
    // }

    const {brand, category, location_id, payment_type} = this.state.filtedValue;
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
    };

    this.props.get_searchPosPromotionAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    // apiCalls(this.props.posSaleExportDataAction(body, context.commoncookie));
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    // this.props.set_searchPosSaleAction({data:[], numRows:0})
    const {brand, category, location_id, payment_type} = this.state.filtedValue;
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
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.posSalePromotionAction(data),
      // this.props.posSaleExportDataAction(data, context.commoncookie),
    );
  };
  handleEdit = async (data, editIndex) => {
    this.setState({
      edit_id_data: data,
      open: true,
      status: 'edit',
      columPopup: {open: false, rowIndex: editIndex},
    });
  };
  handleEditfind = () => {
    this.setState({
      editfinds: false,
    });
  };
  columPopupClose = () => {
    this.setState({columPopup: {open: false, rowIndex: ''}});
  };
  rowPopupClose = () => {
    this.setState({rowPopup: {open: false}});
  };

  cancelPosSaleBackBtn = (data) => {
    this.setState({
      rowPopup: {open: true, rowIndex: data},
      columPopup: {open: false},
      cancelSale: false,
    });
  };
  customerid = () => {
    this.setState({Customerid: ''});
  };

  IndexData = (data) => {
    this.setState({indexValue: data});
  };

  handleCancelPosSale = async (data, sale_id) => {
    const context = this.context;
    if (sale_id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.cancelPosSaleAction(
          sale_id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          async (res) => {
            if (res) {
              const data = {
                from: moment(this.state.from, 'year', 'month', 'day').format(
                  'yyyy-MM-DD',
                ),
                to: moment(this.state.to, 'year', 'month', 'day').format(
                  'yyyy-MM-DD',
                ),
                brand: 'null',
                category: 'null',
                employee_id: context.commoncookie,
                location_id: context.headerLocationId,
                payment_type: 'null',
                pageCount: this.state.page || 0,
                numPerPage: this.state.pageSize,
                searchString: '',
              };

              apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.posSalePromotionAction(data),
                // this.props.posSaleExportDataAction(data, context.commoncookie),
              );

              this.setState({
                open: false,
                rowPopup: {open: false},
                columPopup: {open: false},
                cancelSale: false,
              });
            }
          },
        ),
      );
    }
    await this.setState({rowPopup: {open: false}});
  };

  handleSmsMailConfiguration = async () => {
    const context = this.context;
    const roleIdData = this.props.createUser.filter(
      (f) => f.employee_id === context.commoncookie,
    );
    if (roleIdData.length > 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdMailConfigurationAction(
          'Pos Sale',
          roleIdData[0]?.role_id,
        ),
        this.props.getByIdSmsConfigurationAction(
          'Pos Sale',
          roleIdData[0]?.role_id,
        ),
      );
    }
  };

  handleColumnHide = (column) => {
    // Find the index of the column being hidden
    const columnIndex = this.state.columnData.findIndex(
      (col) => col.field === column.field,
    );

    if (columnIndex !== -1) {
      // Create a copy of the columns array
      const updatedColumns = [...this.state.columnData];

      // Remove the column from the array
      updatedColumns.splice(columnIndex, 1);

      const updatedA = {...this.state.columnHead};
      updatedA[column.field] = !column.isVisible;
      this.setState({columnHead: updatedA});
    }
  };

  handleColumnSubmit = () => {
    const context = this.context;
    let data = {data: this.state.columnHead};
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.updateColumnAction(data),
    );
  };

  handleExport = async () => {
    // const context = this.context;
    // const { brand, category, location_id, payment_type } = this.state.filtedValue;
    // const data = {
    //   from: moment(this.state.from, 'year', 'month', 'day').format(
    //     'yyyy-MM-DD',
    //   ),
    //   to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //   brand: this.commonFilterMapping(brand, 'brand'),
    //   category: this.commonFilterMapping(category, 'category'),
    //   employee_id: context.commoncookie,
    //   payment_type:
    //     payment_type === 'null'
    //       ? payment_type
    //       : payment_type.map((p) => `${p.payment_type} (INR)`),
    //   pageCount: 0,
    //   numPerPage: this.state.pageSize,
    //   searchString: '',
    //   location_id: this.commonFilterMapping(location_id, 'location_id'),
    //   type: 'export'
    // }

    // const { data: ExportData } = await this.customFetch(`/posSale/searchPosSales`, 'POST', data)

    const emptyRow = (n) => {
      return Array(n || 1).fill([]);
    };

    const title = [['POS REPORT']];

    const headers = [
      [
        'Customer Name',
        'Sale Id',
        'Product Name',
        'Category',
        'Brand',
        'Invoice Number',
        'Invoice Date',
        'Quantity',
        'Location Name',
        'Sales Payments',
        'Payment Type',
        'Lot Number',
        'Total',
      ],
    ];

    const body = await this.props.posExportData?.map((f) => [
      f.customer_name,
      f.sale_id,
      f.product_name,
      f.product_category,
      f.product_brand,
      f.invoice_number,
      f.invoice_date,
      f.sale_quantity,
      f.location_name,
      f.sales_payments,
      f.payment_type,
      f.serial_number,
      f.total,
    ]);

    const grandTotal = [['Grand Total:', this.props.grandTotal]];

    const finalData = [...title, ...emptyRow(2), ...headers, ...body];

    return this.setState({ex_data: finalData});
  };

  render() {
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Promotions</title>
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
                soDate={this.state.soDate}
                sales_items={this.state.sales_items}
                open={this.state.Dopen}
                handleSubmit={this.handleSubmit}
                handleClose={() =>
                  this.setState({Dopen: false, rowPopup: {open: false}})
                }
                invoicepos={true}
                stockaddress={this.props.pos_sale_list}
                mail_configuration={this.props.mail_configuration}
              />
              {this.state.open === false &&
                this.state.rowPopup.open === false &&
                this.state.columPopup.open === false &&
                this.state.cancelSale === false && (
                  <DataGridTemp
                    pageSize={this.state.pageSize}
                    pageType='task'
                    page={this.state.page}
                    title={'Promotions'}
                    data={this.props.searchPosPromotionData.map(
                      (row, index) => ({
                        ...row,
                        id: index + 1,
                      }),
                    )}
                    columns={this.state.data}
                    filter={
                      <div style={{display: 'flex'}}>
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
                      </div>
                    }
                    onRowClick={(params) => {
                      // this.setState({
                      //   rowPopup: {
                      //     rowIndex: this.props.searchPosPromotionData.findIndex(
                      //       (i) =>
                      //         params.row.sale_id
                      //           ? i.sale_id === params.row.sale_id
                      //           : i.customer_id === params.row.customer_id,
                      //     ),
                      //     open: true,
                      //   },
                      // });
                    }}
                    // posSale='not-a-posSale'
                    onPageChange={(page) => this.handlePageChange(page)}
                    onPageSizeChange={(size) => this.handlePageSizeChange(size)}
                    rowCount={this.props.searchPosPromotionCount}
                    requestSearch={(e) => this.requestSearch(e.target.value)}
                    cancelSearch={this.cancelSearch}
                    searchVal={this.state.searchVal}
                    type='filter'
                    isApiFinished={this.state.isApiFinished}
                    handleColumnHide={this.handleColumnHide}
                    handleColumnSubmit={this.handleColumnSubmit}
                    handleExport={this.props.posExportData}
                    grandTotal={this.props.grandTotal}
                  />
                )}
              {this.state.rowPopup.open === true &&
                this.state.columPopup.open === false && (
                  <PurchaseErpDesign
                    // statementOfAccount={this.props.searchPosPromotionData}
                    rowIndex={this.state.rowPopup.rowIndex}
                    open={this.state.cancelSale}
                    IndexData={this.IndexData}
                    cancelPosSale={this.cancelPosSale}
                    handleEdit={this.handleEdit}
                    rowPopupClose={this.rowPopupClose}
                    handleDelete={this.handledialog}
                    type={'posSale'}
                    customerid={this.state.Customerid}
                    pos_sale_by_pagination={this.props.searchPosPromotionData}
                    handleCancelPosSale={this.handleCancelPosSale}
                    cancelPosSaleBackBtn={this.cancelPosSaleBackBtn}
                  />
                )}

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
                    posSaleData={this.props.searchPosPromotionData}
                    posSaleRowIndex={this.state.columPopup.rowIndex}
                    designType={'posSale'}
                    setEditfind={this.handleEditfind}
                  />
                )}
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
    searchPosPromotionData: state.posSaleReducer.searchPosPromotionData || [],
    searchPosPromotionCount: state.posSaleReducer.searchPosPromotionCount || 0,
    // column: state.posSaleReducer.column,
    posExportData: state.posSaleReducer.posExportData || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listProductAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listProductAction(setModalTypeHandler, setLoaderStatusHandler),
      );
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
    listcustomerinvoice: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      response,
    ) => {
      return dispatch(
        listcustomerinvoice(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          response,
        ),
      );
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
    get_searchPosPromotionAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        get_searchPosPromotionAction(
          val,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    set_searchPosPromotionAction: (val) => {
      return dispatch(set_searchPosPromotionAction(val));
    },
    posSalePromotionAction: (data) => {
      return dispatch(posSalePromotionAction(data));
    },
    cancelPosSaleAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      id,
      data,
      sample,
    ) => {
      return dispatch(
        cancelPosSaleAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          data,
          sample,
        ),
      );
    },
    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getByIdMailConfigurationAction: (mail_name, role_id) => {
      return dispatch(getByIdMailConfigurationAction(mail_name, role_id));
    },
    getByIdSmsConfigurationAction: (sms_role_name, role_id) => {
      return dispatch(getByIdSmsConfigurationAction(sms_role_name, role_id));
    },
    updateColumnAction: (data) => {
      return dispatch(updateColumnAction(data));
    },
    getColumnAction: () => {
      return dispatch(getColumnAction());
    },
    posSaleExportDataAction: (data, employee_id) => {
      return dispatch(posSaleExportDataAction(data, employee_id));
    },
    updatePosSalePromotionAction: (data) => {
      return dispatch(updatePosSalePromotionAction(data));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PosPromotions);

