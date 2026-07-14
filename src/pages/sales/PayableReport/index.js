import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _, {concat, filter} from 'lodash';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
  Autocomplete,
  TextField,
  Grid,
  Typography,
  InputAdornment,
} from '@mui/material';
import InvoiceDialog from '../sales/InvoiceDialog';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import {getDateTime} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import {baseURL, titleURL} from '../../../http-common';
import FilterPayableReport from './FilterPayableReport';
import {ThirtyFpsSharp} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {getPurchaseReportAction, exportDatareportAction,setSearchPayableReportAction,getSearchPayableReportAction, PayableReportFinalAction} from '../../../redux/actions/purchase_actions'
import apiCalls from 'utils/apiCalls';
import { pageSize } from 'utils/pageSize';
import DataGridTemp from 'components/dataGridTemp';
import {Helmet} from "react-helmet-async";


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
//     fontSize: 15,
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
//   fontSize: '25px',
//   backgroundColor: '#d7d1d1'
// }

class PayableReport extends Component {
  static contextType = CreateNewButtonContext;
  Ledger;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    // var firstDay = moment(date, 'year', 'month', 'day').format(
    //   'yyyy-MM-DD',
    // );
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let headerupdate = '';
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      filterData: [],
      brand: '',
      category: '',
      Dopen: false,
      page: 0,
      pageSize: 100,
      invoice_date: firstDay,
      invoice_from_date: firstDay,
      invoice_to_date: lastDay,
      to: lastDay,
      filtedValue: {
        invoice_amount: 'null',
        due_amount: 'null',
        due_days: 'null',
      },
      count: 0,
      errormsg: {
        from: '',
        to: '',
      },
      appConfigData: {},
      stocklistaddress: {},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      title: 'Payable Report',
      columnData: [
        {
          headerName: 'Vendor Name',
          field: 'vendorName',
          width: 400
        },
        {
          headerName: 'Invoice Number',
          field: 'invoice_number',
          width: 200
        },
        {headerName: ' Invoice Date', field: 'invoice_date', width: 200},
        {
          headerName: 'Invoice Amount',
          field: 'invoice_amount',
          align: 'right',
          width: 200
        },
        {
          headerName: 'Due Amount',
          field: 'due_amount',
          align: 'right',
          width: 200
        },
        {
          headerName: 'Due Days',
          field: 'due_days',
          width: 200
        },
      ],
      isApiFinished: false
    };
  }

  // async testing() {
  //   const context = this.context;
  //  await this.props.listStockLedgerAction( context.setModalTypeHandler, context.setLoaderStatusHandler)
  //   await this.setState({ open: false })
  // }


  async componentDidMount() {
    this.props.setSearchPayableReportAction({data:[], numRows:0});
    const context = this.context;
    // await this.props.listProductAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );
    let data = {user_id:context.commoncookie, 
      location_id:context.headerLocationId,
      invoice_date: moment(this.state.invoice_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_amount:'null',
      due_amount:'null',
      due_days:'null',
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: '',
     }
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.PayableReportFinalAction(data)
    ).finally(() => this.setState({isApiFinished: true}));
   
  }

  async componentDidUpdate() {

    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;

      const {invoice_amount, due_amount, location_id, due_days} =
        this.state.filtedValue;

        // let data = {user_id:context.commoncookie, 
        //   location_id:context.headerLocationId,
        //   invoice_date: moment(this.state.invoice_date, 'year', 'month','day').format('yyyy-MM-DD',),
        //   invoice_amount:'null',
        //   due_amount:'null',
        //   due_days:'null',
        //   pageCount: 0,
        //   numPerPage:  pageSize,
        //   searchString: '',
        //  }
        
        // apiCalls(
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
        //   this.props.PayableReportFinalAction(data)
        // );
    }
  }


  getAppConfigData = async (data) => {
    const {app_config_data} = this.props;
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    // const fullAddress = app_config_data.filter(f=>f.key_name =='address.fulladdress')
    const fullAddress = data?.address === null ? '' : data?.address || '';
    const city = data?.city || '';
    const emailData = data?.email || '';
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = data?.phone_number || '';
    // const state =   app_config_data.filter(f=>f.key_name =='address.state')
    const state =
      data?.state.concat(',', data?.zip === null ? '' : data?.zip) || '';
    const web = app_config_data.filter((f) => f.key_name == 'web.base.url');

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
      },
    });
  };

  // async componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.pos_sale_list !== this.props.pos_sale_list) {
  //     this.setState({filterData: this.props.pos_sale_list});
  //   }

  //   if (
  //     prevProps.app_config_data !== this.props.app_config_data &&
  //     this.props.app_config_data.length > 0
  //   ) {
  //     this.getAppConfigData();
  //   }

  //   const context = this.context;
  //   let headerLocationId = context.headerLocationId;
  //   if (headerLocationId !== this.headerupdate) {
  //     this.headerupdate = headerLocationId;
  //     if (context.headerLocationId !== 'null') {
  //       this.setState({
  //         filtedValue: {
  //           ...this.state.filtedValue,
  //           location_id: context.headerLocationId,
  //         },
  //       });
  //     }

  //     const {brand, category, location_id, payment_type} =
  //       this.state.filtedValue;

  //     const data = {
  //       from: moment(this.state.from, 'year', 'month', 'day').format(
  //         'yyyy-MM-DD',
  //       ),
  //       to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
  //       brand: this.commonFilterMapping(brand, 'brand'),
  //       category: this.commonFilterMapping(category, 'category'),
  //       employee_id: context.commoncookie,
  //       headerLocationId: this.commonFilterMapping(location_id, 'location_id'),
  //       payment_type:
  //         payment_type === 'null'
  //           ? payment_type
  //           : payment_type.map((p) => `${p.payment_type} (INR)`),
  //       pageCount: 0,
  //       numPerPage:  pageSize,
  //     };

  //   //   await this.props.GetPosSaleDateFilterAction(
  //   //     context.setModalTypeHandler,
  //   //     context.setLoaderStatusHandler,
  //   //     data,
  //   //   );
  //   }
  // }

  setFilter = (data) => this.setState({filter: data});

  handleFilter = (data) => this.setState({filterOpen: data});

  handleEdit = async (id) => {
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
        )
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
        )
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
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size, page: 0});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({pageSize: size,page:0}, async () => {
      const context = this.context;

        const {invoice_amount, due_amount, due_days} =
        this.state.filtedValue;

        let data = {user_id:context.commoncookie, 
          location_id:context.headerLocationId,
          invoice_date: moment(this.state.invoice_date, 'year', 'month','day').format('yyyy-MM-DD',),
          invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month','day').format('yyyy-MM-DD',),
          invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month','day').format('yyyy-MM-DD',),
          invoice_amount:invoice_amount,
          due_amount:due_amount,
          due_days:due_days ,
          pageCount: this.state.page || 0,
          numPerPage: size,
          searchString: this.state.searchVal,
        }
        
        
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.PayableReportFinalAction(data)
        );
    });
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

    this.setState({page: page});
    const context = this.context;
    const {brand, category, location_id, payment_type} = this.state.filtedValue;

    const {invoice_amount, due_amount, due_days} =
    this.state.filtedValue;

    let data = {user_id:context.commoncookie, 
      location_id:context.headerLocationId,
      invoice_date: moment(this.state.invoice_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month','day').format('yyyy-MM-DD',),
      invoice_amount:invoice_amount,
      due_amount:due_amount,
      due_days:due_days ,
      pageCount: page || 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
    }
    
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.PayableReportFinalAction(data)
        );
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
      sales_payments: this.state.sales_payments,
      soDate: this.state.soDate,
      sale_id: this.state.sale_id,
    };

    this.props.sendMail(data, context.setLoaderStatusHandler);

    this.setState({Dopen: false});
    // handleSubmit()
  };

  invoiceFunction = async (data) => {
    // await this.props.listCustomerAction()

    const custData = await this.props.customer.filter(
      (d) => data.customer_id === d.customer_id,
    );
    const sales_items = await data.sales_items.map((d) => {
      const taxes =
        this.props.product.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
        [];
      d.taxes = taxes;
      return d;
    });
    this.getAppConfigData(data);
    this.setState({
      invoice: data.invoice_number,
      custData: custData[0],
      soDate: data.sale_time,
      sales_items: sales_items,
      Dopen: true,
      customer_id: data.customer_id,
      sale_id: data.sale_id,
      note: data.note,
      sales_payments: data.sales_payments,
      // soDate: data.sale_time,
      invoicefile: data.invoice_file,
    });
  };

  handleChange = async (data) => {
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

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

  clearButton = () => {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.setState({
     invoice_date: firstDay,
     invoice_from_date: firstDay,
     invoice_to_date: lastDay,
      filtedValue: {
        invoice_amount: 'null',
        due_amount: 'null',
        due_days: 'null',
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
  };

  ApplyButton = async (formValue) => {
    await this.setState({filtedValue: formValue});
    //   if(moment(this.state.from ,'year') <= moment(this.state.to,'year') ){

    //     if(moment(this.state.from ,'month') <= moment(this.state.to,'month')){

    //         if(moment(this.state.from ,'day') <= moment(this.state.to,'day')){
    // if(this.state.from !== '' && this.state.to !== ''){

    // categoryName =category.category
    //  brandName = brand.brand
    const context = this.context;
    // // this.setState.badgeCount("")
    const {invoice_amount, due_amount, due_days} = this.state.filtedValue;

    const data = {
      invoice_date: moment(this.state.invoice_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_amount: invoice_amount === '' ? 'null' : invoice_amount,
      due_amount: due_amount === '' ? 'null' : due_amount,
      user_id: context.commoncookie,
      location_id: context.headerLocationId,
      due_days: due_days === '' ? 'null' : due_days,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: this.state.searchVal,
    };

    // this.setState({filter:{...this.state.filter,location_id,payment_type}})
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.PayableReportFinalAction(
        data
      )
    );

    //  const badgeCount = [this.state.filtedValue.brand,this.state.filtedValue.category,this.state.filtedValue.location_id,this.state.filtedValue.payment_type]

    // let count = 0
    // badgeCount.forEach(d=> {
    // if(d) count +=1
    // } )
    // this.setState({
    //   ...this.state,
    //   ['count']:count
    // })

    this.setState({filterOpen: false});

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

  exportvalue =() =>{
    const context = this.context;
    // // this.setState.badgeCount("")
    const {invoice_amount, due_amount, due_days} = this.state.filtedValue;

    const data = {
      invoice_date: moment(this.state.invoice_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_amount: invoice_amount === '' ? 'null' : invoice_amount,
      due_amount: due_amount === '' ? 'null' : due_amount,
      user_id: context.commoncookie,
      location_id: context.headerLocationId,
      due_days: due_days === '' ? 'null' : due_days,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
    };
    return data;

  }

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
    this.setState({searchVal: val});
    // if(val.trim() !== ''){
      this.props.setSearchPayableReportAction({data:[], numRows:0})
    // }
    const {invoice_amount, due_amount, due_days} = this.state.filtedValue;

    const data = {
      invoice_date: moment(this.state.invoice_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
     
      invoice_amount: invoice_amount === '' ? 'null' : invoice_amount,
      due_amount: due_amount === '' ? 'null' : due_amount,
      user_id: context.commoncookie,
      location_id: context.headerLocationId,
      due_days: due_days === '' ? 'null' : due_days,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: val,
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchPayableReportAction(
        data
      )
    );
  };
  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    this.props.setSearchPayableReportAction({data:[], numRows:0})
    const {invoice_amount, due_amount, due_days} = this.state.filtedValue;

    const data = {
      invoice_date: moment(this.state.invoice_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_from_date: moment(this.state.invoice_from_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      invoice_to_date: moment(this.state.invoice_to_date, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
     
      invoice_amount: invoice_amount === '' ? 'null' : invoice_amount,
      due_amount: due_amount === '' ? 'null' : due_amount,
      user_id: context.commoncookie,
      location_id: context.headerLocationId,
      due_days: due_days === '' ? 'null' : due_days,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: '',
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.PayableReportFinalAction(
        data
      )
    );
  };

  render() {

    // const error = this.state.errormsg.from !== "";
    // const err = this.state.errormsg.to !== "";
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Payable Report </title>
      </Helmet>
      <CreateNewButtonContext.Consumer>
        {({
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
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
              handleClose={() => this.setState({Dopen: false})}
              invoicepos={true}
              stockaddress={this.props.pos_sale_list}
              mail_configuration={() => {}}
            />
            {this.state.open === false && (
              <DataGridTemp
              pageSize={this.state.pageSize}
              page={this.state.page}
              pageType= 'task'
                title={this.state.title}
                data={
                  this.props.searchPayableReport
                }
                columns={this.state.columnData}
                filter={
                  <FilterPayableReport
                    fromTo={true}
                    catabrand={true}
                    invoice_date={this.state.invoice_date}
                    invoice_from_date={this.state.invoice_from_date}
                    invoice_to_date={this.state.invoice_to_date}

                    locat={true}
                    to={this.state.to}
                    count={this.state.count}
                    product={this.props.product}
                    category={this.state.category}
                    brand={this.state.brand}
                    list_payment_type={this.props.list_payment_type}
                    stocklocation={this.props.stocklocation}
                    filtedValue={this.state.filtedValue}
                    setFilter={this.setFilter}
                    brandSearch={this.brandSearch}
                    handleChange={this.handleChange}
                    handleClose={this.handleFilter}
                    open={this.state.filterOpen}
                    ApplyButton={this.ApplyButton}
                    clearButton={this.clearButton}
                  />
                }
                // searchBox={
                //   <TextField
                //     autoFocus={this.state.searchVal ? true : false}
                //     sx={{
                //       borderRadius: '8px',
                //       pr: '10px',
                //       '& .MuiOutlinedInput-root': {
                //         height: '42px',
                //       },
                //     }}
                //     InputProps={{
                //       startAdornment: (
                //         <InputAdornment position='start'>
                //           <SearchIcon />
                //         </InputAdornment>
                //       ),
                //       endAdornment: (
                //         <InputAdornment position='end'>
                //           <ClearIcon
                //             onClick={this.cancelSearch}
                //             sx={{cursor: 'pointer'}}
                //           />
                //         </InputAdornment>
                //       ),
                //     }}
                //     placeholder='Search'
                //     value={this.state.searchVal}
                //     onChange={(e) => this.requestSearch(e.target.value)}
                //   />
                // }
                onPageChange={(page) => this.handlePageChange(page)}
                onPageSizeChange={(size) => this.handlePageSizeChange(size)}
                rowCount={this.props.searchPayableReport.numRows}
                requestSearch={(e) => this.requestSearch(e.target.value)}
                cancelSearch={this.cancelSearch}
                searchVal={this.state.searchVal}
                  type='filter'
                  isApiFinished={this.state.isApiFinished}
              />
            )}

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
    purchase_report: state.purchasesReducer.purchase_report || [],
    purchase_report_count: state.purchasesReducer.purchase_report_count || [],
    searchPayableReport : state.purchasesReducer.searchPayableReport || [],
    searchPayableReportCount : state.searchPayableReportCount || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
   
    getPurchaseReportAction: (data,setModalTypeHandler,setLoaderStatusHandler) => {
      return dispatch(getPurchaseReportAction(data,setModalTypeHandler,setLoaderStatusHandler),
      );
    },
    exportDatareportAction: (data,setModalTypeHandler,setLoaderStatusHandler,exportCallBack) => {
      return dispatch(exportDatareportAction(data,setModalTypeHandler,setLoaderStatusHandler, exportCallBack),
      );
    },
    getSearchPayableReportAction: (
      val
    ) => {
      return dispatch(
        getSearchPayableReportAction(
          val
        ),
      );
    },
    setSearchPayableReportAction: (val) => {
      return dispatch(setSearchPayableReportAction(val));
    },
    PayableReportFinalAction: (val) => {
      return dispatch(PayableReportFinalAction(val));
    },
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(PayableReport);


{
  /*<MaterialTable
                totalCount={
                  this.state.searchVal
                    ? this.state.searchPageData.length
                    : this.props.purchase_report_count || 0
                }
                // icons={{ Filter: () => <div /> }}
                
                components={{
                  Toolbar: (props) => (
                    <>
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
                          <TextField
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
                            onChange={(e) => this.requestSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* <Grid container direction='row-reverse'>
                        <Grid
                          item
                          style={{
                            justifyContent: 'flex-end',
                            display: 'flex',
                            paddingRight: 4,
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            paddingRight={5}
                            align='left'
                            color='black'
                          >{`Grand Total : ${this.props.grandTotal}`}</Typography>
                        </Grid>
                      </Grid> 

                      <div>
                        <span style={{paddingLeft: '10px', color: 'red'}}>
                          {this.state.errormsg.from}
                        </span>
                      </div>
                    </>
                  ),
                }}
                actions={[
                  {
                    icon: () => (
                      <div style={{display: 'flex'}}>
                        <FilterPayableReport
                          fromTo={true}
                          catabrand={true}
                          invoice_date={this.state.invoice_date}
                          locat={true}
                          to={this.state.to}
                          count={this.state.count}
                          product={this.props.product}
                          category={this.state.category}
                          brand={this.state.brand}
                          list_payment_type={this.props.list_payment_type}
                          stocklocation={this.props.stocklocation}
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
                    ),
                    tooltip: 'Filter',
                    isFreeAction: true,
                  },
                ]}
                onPageChange={(page) => this.handlePageChange(page)}
                onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                options={{
                  headerStyle: {
                    fontSize: 15
                  },
                  search: false,
                  exportButton: true,
                  filtering: true,
                  actionsColumnIndex: -1,
                  maxBodyHeight: maxBodyHeight,
                   pageSize: pageSize,
                  pageSizeOptions: [20, 50, 100],
                  totalCount: this.props.purchase_report_count,
                  exportMenu: [
                    {
                      label: 'Export PDF',
                      exportFunc: (cols, datas) =>
                      { 
                        
                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          this.props.exportDatareportAction(
                            this.exportvalue(),
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                          
                          (exportData) => {
                            ExportPdf(
                              cols,
                              exportData,
                              'PayableReport',
                            );
                          },
                        )
                        );
                       }
                    },
                    {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) => {
                        {
                          
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.exportDatareportAction(
                              this.exportvalue(),
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                            
                            (exportData) => {
                              ExportCsv(
                                cols,
                                exportData,
                                'PayableReport',
                              );
                            },
                          )
                          );
                         }
                      },
                    },
                  ],
                }}
                page={this.state.page}
                columns={[
                  {
                    title: 'Vendor name',
                    field: 'vendorName',
                    filtering: false,
                    // hidden: true
                  },
                  {
                    title: 'invoice number',
                    field: 'invoice_number',
                    filtering: false,
                    // hidden: true
                  },
                  {title: ' invoice date', 
                  field: 'invoice_date',
                  filtering: false,
                    // hidden: true
                },
                  {
                    title: 'invoice amount',
                    field: 'invoice_amount',
                    // hidden: true,
                    // export: true,
                    filtering: false,
                    // hidden: true
                  },
                  {
                    title: 'due amount',
                    field: 'due_amount',
                    filtering: false,
                    // hidden: true
                    // render: rowData => <div>{rowData.sales_items.map(f => f.name).join()}</div>
                  },
                  {
                    title: 'due days',
                    field: 'due_days',
                    // hidden: true,
                    // export: true,
                    filtering: false,
                    // hidden: true
                  },
                  
                ]}
                data={
                  this.state.searchVal
                    ? this.state.searchData
                    : this.props.purchase_report
                    ? this.props.purchase_report
                    .map((r, i) => {
                      const {tableData, ...record} = r;
                      return {i, ...record};
                    })
                : []
                }
                title={
                  <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  Payable Report</Typography>}
                /> */
}
