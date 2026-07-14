import React, {Component} from 'react';
import {connect} from 'react-redux';
// import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {listProductAction} from '../../../redux/actions/product_actions';
import {
  getAllBySalesStatusfilter,
  getAllemployeeincludingAdminAction,
  getBySalesStatusOnHoldAction,
  getBySalesStatusReadyToShipAction,
  getInvoiceDateFilterAction,
  getBySalesStatusOnHoldActionByPagination,
} from '../../../redux/actions/soTracking_actions';
import {getAppConfigDataAction, getAppConfigDataBasedOnTypeAction} from '../../../redux/actions/app_config_actions';
import {listStockLocationSequenceAction} from '../../../redux/actions/stock_Location_actions';
import {customerAsCompanyAction, listCustomerAction} from '../../../redux/actions/customer_actions';
import {
  listSalesAction,
  updateSalesAction,
  createSalesAction,
  sendMail,
  listAllFilterSalesAction,
} from '../../../redux/actions/sales_actions';
import OnHoldOrders from './onHoldOrders';
import BilledOrders from './billedOrders';
import {posSequence} from '../../../redux/actions/purchase_actions';
import apiCalls from 'utils/apiCalls';
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import {Helmet} from 'react-helmet-async';
import {titleURL} from 'http-common';
import {Fonts} from 'shared/constants/AppEnums';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {FilterAlt} from '@mui/icons-material';
import {useCustomFetch} from 'utils/useCustomFetch';
import { date } from 'yup';
import { maxBodyHeight } from 'utils/pageSize';
import { setInvoiceTempAction } from 'redux/actions/vendor_actions';
import ReceiptTempDialog from "pages/sales/Receipt/ReceiptTemp";
import API_URLS from '../../../utils/customFetchApiUrls';
import toMomentOrNull from '../../../utils/DateFixer';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
class SOTracking extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.state = {
      open: false,
      edit_id_data: [],
      update: true,
      dialog: {dialog_open: false, msg: '', severity: ''},
      billedOpen: true,
      sale_status: '',
      appConfigData: {},
      date: {from: firstDay, to: lastDay},
      formValues: {
        amount: '',
        customer_id: ''
      },
      filterDialogOpen: false,
      invoicelayout:false,
      cust_id: '',
      page : 0,
      rowsPerPage : 20,
      page1 : 0,
      rowsPerPage1 : 20,
      popupData: {
        Dopen: false
      }
    };
    this.customFetch = useCustomFetch();
    this.storage = getsessionStorage()
  }


  
  // customfetch = useCustomFetch()
  async componentDidMount() {
    let type='sales'
    const context = this.context;
    const selectedRole = this.storage.role_name
    const { date } = this.state
    const formattedFrom = moment(date.from).format('YYYY-MM-DD');
    const formattedTo = moment(date.to).format('YYYY-MM-DD');
    const data = {
      page: this.state.page1,
      rowsPerPage: this.state.rowsPerPage1,
      from : formattedFrom,
      to : formattedTo,
      
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getBySalesStatusOnHoldActionByPagination(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    // await this.props.getBySalesStatusReadyToShipAction(context.setModalTypeHandler,context.setLoaderStatusHandler)
    // this.props.listProductAction(
    //   () => {},
    //   () => {},
    // ),
    // this.props.listCustomerAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   () => {},
    // )
    // this.props.getAppConfigDataBasedOnTypeAction(type)
    this.props.listStockLocationSequenceAction(
      {sequence_type: 'SO'},
      context.setLoaderStatusHandler,
      context.commoncookie,
      context.headerLocationId,
    );
    this.props.getAllemployeeincludingAdminAction();
    this.props.customerAsCompanyAction()
    this.props.getMenuAccessAction(selectedRole)
    // const data = await response.json();
    // console.log('Custom fetch result:', data);
    // this.props.listSalesAction(
    //   context.commoncookie,
    //   context.headerLocationId,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // ),
    // this.props.getAppConfigDataAction();\
    //this.props.getAppConfigData()
  }
  setAppConfigData = (data) => {
    this.setState({appConfigData: {...this.state.appConfigData, ...data}});
  };

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.onHoldOrders?.data?.map((m) => {
        let i = [];
        let resArray = [];
        if (m.order_id === id) {
          i = m;
        } else {
          i = null;
        }
        // let filtered = i.forEach(elements => {
        //   if (elements !== null) {
        //    resArray.push(elements);
        //   }
        //  });
        return i;
      });

      let filtered = getId.filter((f) => f);

      // .filter((f) => f !== null);
      // let rem = getId.map((m) => {
      //   return
      // }).filter( (f) =>  )
      await this.setState({
        edit_id_data: filtered,
        open: true,
        status: 'edit',
        billedOpen: false,
      });
    }
  };

  setInvoiceLayout = (value) => {
    this.setState({ invoicelayout: value });
  };
  
  
  handleClose = () => {
    const context = this.context;
    this.setState({open: false, delete: false, billedOpen: true});
    this.setState({...this.state.dialog, dialog: {dialog_open: false}});
    this.setState({
      popupData: {...this.state.popupData, Dopen: false},
    });
    context.setSoDialogOpenHandler(false);
  };
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
        ewayBill: ewayBill.length > 0 ? ewayBill[0].value : ''

      },
    });
  };

  fetchOnHoldSales = () => {
    const { date, formValues } = this.state
    const formattedFrom = moment(date.from).format('YYYY-MM-DD');
    const formattedTo = moment(date.to).format('YYYY-MM-DD');
    const cust_id = formValues?.customer_id != null && formValues.customer_id !== ''
      ? String(formValues.customer_id).trim()
      : null;
      const data = {page : this.state.page,rowsPerPage : this.state.rowsPerPage, location_id : this.context.headerLocationId || null};  
       apiCalls(
      this.props.setModalTypeHandler,
      this.props.setLoaderStatusHandler,
     this.props.getInvoiceDateFilterAction(
        formattedFrom,
        formattedTo,
        cust_id,
        data
      ),
    );
};
componentDidUpdate(prevProps, prevState) {
  // Check if app_config_data_based_on_type has changed and has data
  if (
    prevProps.app_config_data_based_on_type !== this.props.app_config_data_based_on_type &&
    Array.isArray(this.props.app_config_data_based_on_type) &&
    this.props.app_config_data_based_on_type.length > 0
  ) {
    console.log('app_config_data_based_on_type changed â†’ Updating config data');
    this.getAppConfigData();
  }
  if (
    prevState.page1 !== this.state.page1 ||
    prevState.rowsPerPage1 !== this.state.rowsPerPage1
  ) {
    const { date } = this.state
    const formattedFrom = moment(date.from).format('YYYY-MM-DD');
    const formattedTo = moment(date.to).format('YYYY-MM-DD');
    const data = {
      page: this.state.page1,
      rowsPerPage: this.state.rowsPerPage1,
      from : formattedFrom,
      to : formattedTo
    };
    apiCalls(
      this.props.setModalTypeHandler,
      this.props.setLoaderStatusHandler,
      this.props.getBySalesStatusOnHoldActionByPagination(data)
    );
  }

   if (
    prevState.page !== this.state.page ||
    prevState.rowsPerPage !== this.state.rowsPerPage
  ) {
     this.fetchOnHoldSales()
  }
}

  initsform = () => {
    const { date, formValues } = this.state;
  
    // Check if dates are selected
    if (!date.from || !date.to) return;
  
    const formattedFrom = moment(date.from).format('YYYY-MM-DD');
    const formattedTo = moment(date.to).format('YYYY-MM-DD');
    const cust_id = formValues?.customer_id != null && formValues.customer_id !== ''
      ? String(formValues.customer_id).trim()
      : null;
    this.setState({cust_id: cust_id, from:formattedFrom, to:formattedTo});
  
    const data = {
      from: formattedFrom,
      to: formattedTo,
      cust_id,
    };
  const data1 = {page : this.state.page,rowsPerPage : this.state.rowsPerPage, location_id : this.context.headerLocationId || null}
    // Call the API actions
    apiCalls(
      this.props.setModalTypeHandler,
      this.props.setLoaderStatusHandler,
      // First Action: getInvoiceDateFilterAction
      this.props.getInvoiceDateFilterAction(
        formattedFrom,
        formattedTo,
        cust_id,
        data1
      ),
      // Second Action: getAllBySalesStatusfilter
      this.props.getAllBySalesStatusfilter(data)
    );
  };
  
  handleApply = () =>{
    this.initsform();
  }
  sample = (value, errBarcode) => {
    // console.log("asdasd", value)
    const context = this.context;
    const { date } = this.state
    const formattedFrom = moment(date.from).format('YYYY-MM-DD');
    const formattedTo = moment(date.to).format('YYYY-MM-DD');
    const data = {
      page: this.state.page,
      rowsPerPage: this.state.rowsPerPage,
      from : formattedFrom,
      to : formattedTo,
    };
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

        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.getBySalesStatusOnHoldActionByPagination(
            data,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
          this.props.getBySalesStatusReadyToShipAction(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
          ),
        );
      }

      else {

        this.handleClose();
      }
    }







  };
  createMail = (custData, invoice_number, sales_items, email) => {
    const context = this.context;
    const data = {
      custData,
      invoice_number,
      sales_items,
      email,
      appConfigData: this.props.app_config_data,
    };
    this.props.sendMail(data, context.setLoaderStatusHandler);
    this.handleClose();
  };

  getCostPrice = (sales_items) => {
    let total = 0;
    sales_items
      .filter((d) => d.stock_type === 1)
      .forEach((d) => {
        total += d.quantity * +d.item_cost_price;
      });
    return total;
  };

  tcsuntaxed = (sales_items, tcstaxvisible, taxes) => {
    if (tcstaxvisible === false) {
      return 0;
    } else {
      let mappingColumn = ['quantity', 'item_unit_price', 'item_id'];
      let total = 0;
      sales_items?.map((s) => {
        let arr = [];
        mappingColumn.map((c) => {
          if (_.includes(Object.keys(s), c)) {
            arr.push(s[c]);
          }
          return null;
        });
        if (taxes) {
          this.props.product.map((p) => {
            if (p.item_id === arr[2]) {
              p.taxes.map((t) => {
                if (t.tax_group === 'TCS') {
                  total += ((arr[0] * arr[1]) / 100) * t.tax_rate;
                }
                return null;
              });
            }
            return null;
          });
          return null;
        } else {
          total += arr[0] * arr[1];
        }
        return total;
      });
      return total;
    }
  };

  untaxed = (sales_items, taxes) => {
    let mappingColumn = ['quantity', 'item_unit_price', 'item_id'];
    let total = 0;
    sales_items?.map((s) => {
      let arr = [];
      mappingColumn.map((c) => {
        if (_.includes(Object.keys(s), c)) {
          arr.push(s[c]);
        }
        return null;
      });
      if (taxes) {
        this.props.product.map((p) => {
          if (p.item_id === arr[2]) {
            p.taxes.map((t) => {
              if (t.tax_group === 'IGST') {
                total += ((arr[0] * arr[1]) / 100) * t.tax_rate;
              }
              return null;
            });
          }
          return null;
        });
        return null;
      } else {
        total += arr[0] * arr[1];
      }
      return total;
    });
    return total;
  };

  handleSubmit = async (data, posSeq) => {
    // console.log("data",data)
    const updateData = data
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
    const context = this.context;
    this.setState({sale_status: data.sale_status});
    const list = data.sales_items;
    let tcs_inter = this.tcsuntaxed(data.sales_items, false, 'taxes').toFixed(
      2,
    );
    let transactionEntryData = {
      total_cost_price: this.getCostPrice(data.sales_items),
      total_unit_price: this.untaxed(data.sales_items),
      total_with_gst: parseFloat(data.total) + parseFloat(tcs_inter),
      gst_inter: (this.untaxed(data.sales_items, 'taxes') / 2).toFixed(2),
      tcs_inter,
      tds_inter: data.tds,
    };
    let setDisable=false

    data.transactionEntryData = transactionEntryData;
    delete data.salesman_name;

    if (data.order_id) {
      const {sequence_id, current_seq} = posSeq;
      data.type = 'sotracking'; 
      if (data.sale_status === 2) {
          delete data.updatedBy;
          delete data.updatedAt;
          delete data.is_deleted;
          delete data.location_name;
          delete data.date;
        const {commoncookie, headerLocationId} = context;
        // apiCalls(
        //   context.setModalTypeHandler,
        //   context.setLoaderStatusHandler,
             this.props.createSalesAction(
          
                    {...updateData, pre_order: {},transactionEntryData},
                    context.commoncookie,
                    context.headerLocationId,
                    context.setModalTypeHandler,
                    context.setLoaderStatusHandler,
                    this.sample,
                    setDisable,
                    ()=>{},
                    async (response)=>{
                      if(response?.status === 200) {
                         const saleId = response?.data?.insertId
                        const type = 'sales'
                        const poptype = 'invoice'
                        const api_data = await this.customFetch(
                          API_URLS.GET_SALES_INVOICE_DETAILS(saleId, type, poptype),
                          'POST', {}
                        );
                        const getData = api_data?.data || []
                        this.props.setInvoiceTempAction(getData)
                        this.setState({
                          popupData: {
                            Dopen: true
                          }
                        })
                      }
                     }
                  )
          // this.props.posSequence(
          //   sequence_id,
          //   {current_seq, sequence_type: 'SO', commoncookie, headerLocationId},
          //   context.setLoaderStatusHandler,
          // ),
          // this.props.updateSalesAction(
          //   data.sale_id,
          //   updateData,
          //   context.setModalTypeHandler,
          //   context.setLoaderStatusHandler,
          //   this.sample,
          //   context.commoncookie,
          //   context.headerLocationId,
          // ),
        // );
      } 
      // else {
      //   apiCalls(
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //     this.props.updateSalesAction(
      //       data.sale_id,
      //       updateData,
      //       context.setModalTypeHandler,
      //       context.setLoaderStatusHandler,
      //       this.sample,
      //       context.commoncookie,
      //       context.headerLocationId,
      //     ),
      //   );
      // }
    }
  };
  responseDialog = async (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, dialog_open: true},
    });
  };
  handleChange = (event) => {
    const {name, value} = event.target;
    console.log('sss', name, value);

    this.setState((prevState) => ({
      date: {
        ...prevState.date,
        [name]: value,
      },
    }));
  };

  handleChangeRowsPerPage = (event) => {
    const val = parseInt(event.target.value, 10);

    this.setState({
      rowsPerPage: val,
      page: 0,
    });
  };


  handleChangeRowsPerPageForSO = ( event ) => {

     const newRowsPerPage = parseInt(event.target.value, 10);
    this.setState({ rowsPerPage1: newRowsPerPage });
    this.setState({ page1: 0 });
  };

   handleChangePage = (event, newPage) => {
   this.setState({page : newPage});
  };

   handleChangePageForSO = (event, newPage) => {
    this.setState({page1 : newPage});
  };

  render() {
      console.log("this.state.open",this.state.appConfigData)
    const {onHoldOrders, billedOrdersFilter} = this.props;
    const { popupData } = this.state
    const selectedRole = this.storage.role_name
    const invoiceCreateBtn = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'sales__invoices', 'can_create')
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title>
            {titleURL ? `${titleURL} | So Tracking` : 'So Tracking'}
          </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            setModalStatusHandler,
            setModalTypeHandler,
            setcreatNewDataHandler,
            setLoaderStatusHandler,
            creatNewData,
            selectData,
            setselectData,
          }) => (
            // <Card
            //   sx={{
            //     height: 'calc(90vh + 10px)',
            //     backgroundColor: 'background.paper',
            //     borderRadius: 2,
            //     border: '1px solid rgba(224, 224, 224, 0.2)',
            //     boxShadow: 'none',
            //     overflow:'hidden'
            //   }}
            // >
              (<Box
                sx={{
                  display: 'flex',
                  width: '100%', 
                  height: 'calc(90vh + 10px) ',
                  gap: 2,
                }}
              >
                <Card sx={{ display: 'flex', flexDirection: 'column',height: 'calc(100vh - 80px)', width: this.state.open === true ? '100%' : '50%',}}>
                   {/* Header */}
                   {!this.state.open &&<Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1} padding={3}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                       Sale Orders
                     </Typography>
                     {!this.state.open && (
                       <Grid>
                         <FilterAlt
                           onClick={() => this.setState({ filterDialogOpen: true })}
                           sx={{ cursor: 'pointer' }}
                         />
                       </Grid>
                     )}
                   </Box>}

               <Dialog
                 open={this.state.filterDialogOpen}
                 onClose={() => this.setState({filterDialogOpen: false})}
                 //fullWidth
                 //maxWidth='40px'
               >
                 <DialogTitle>Filter Orders</DialogTitle>
                 <DialogContent dividers>
                   <Grid container spacing={3}>
                     <Grid
                       size={{
                         lg: 12,
                         xs: 12,
                         sm: 6,
                         md: 4
                       }}>
                       <LocalizationProvider dateAdapter={DateAdapter}>
                         <DatePicker
                           name='from'
                           label='From Date'
                           format='DD/MM/YYYY'
                           value={toMomentOrNull(this.state.date.from)}
                           onChange={(date) =>
                             this.handleChange({
                               target: {value: date, name: 'from'},
                             })
                           }
                           views={['year', 'month', 'day']}
                           slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                         />
                       </LocalizationProvider>
                     </Grid>

                     <Grid
                       size={{
                         lg: 12,
                         xs: 12,
                         sm: 6,
                         md: 4
                       }}>
                       <LocalizationProvider dateAdapter={DateAdapter}>
                         <DatePicker
                           name='to'
                           label='To Date'
                           format='DD/MM/YYYY'
                           value={toMomentOrNull(this.state.date.to)}
                           onChange={(date) =>
                             this.handleChange({
                               target: {value: date, name: 'to'},
                             })
                           }
                           views={['year', 'month', 'day']}
                           slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                         />
                       </LocalizationProvider>
                     </Grid>

                     <Grid
                       size={{
                         lg: 12,
                         xs: 12,
                         sm: 12,
                         md: 4
                       }}>
                       <Autocomplete
                         value={
                           this.props.customerAsCompany?.find(
                             (f) =>
                               f.customer_id ===
                               this.state?.formValues.customer_id,
                           ) || null
                         }
                         id='customer-autocomplete'
                         options={_.uniqBy(
                           this.props.customerAsCompany.filter((c) => c.customer_id),
                           'customer_id'
                         )}
                         
                         fullWidth
                         getOptionLabel={(option) => option.company_name || ''}
                         isOptionEqualToValue={(option, value) =>
                           option.customer_id === value.customer_id
                         }
                         onChange={(e, selectedOption) => {
                           if (selectedOption) {
                             this.setState({
                               customerFilter: selectedOption.customer_id,
                             });
                             this.setState((prevState) => ({
                               formValues: {
                                 ...prevState.formValues,
                                 customer_id: selectedOption.customer_id,
                               },
                             }));
                           } else {
                             this.setState({customerFilter: ''});
                             this.setState((prevState) => ({
                               formValues: {
                                 ...prevState.formValues,
                                 customer_id: '',
                               },
                             }));
                           }
                           //this.props.setPage(0);
                         }}
                         renderOption={(props, option) => (
                           <li {...props} key={option.customer_id}>
                             {option.company_name}
                           </li>
                         )}
                             ListboxProps={{
                               style: {
                                 maxHeight: "170px",
                               },
                             }}
                         renderInput={(params) => (
                           <TextField
                             {...params}
                             fullWidth
                             variant='outlined'
                             label='Select Customer'
                             placeholder='Select Customer'
                           />
                         )}
                       />
                     </Grid>
                   </Grid>
                 </DialogContent>
                 <DialogActions>
                   <Button
                     variant='outlined'
                     onClick={() => {
                       const today = new Date();
                       const firstDay = new Date(
                         today.getFullYear(),
                         today.getMonth(),
                         1,
                       );
                       const lastDay = new Date(
                         today.getFullYear(),
                         today.getMonth() + 1,
                         0,
                       );

                       this.setState((prevState) => ({
                         ...prevState,
                         formValues: {
                           ...prevState.formValues,
                           customer_id: '',
                         },
                         date: {
                           ...prevState.date,
                           from: firstDay,
                           to: lastDay,
                         },
                         filterDialogOpen: false,
                       }),
                       () => {
                          this.initsform();
                       }
                     );

                     }}
                   >
                     Clear
                   </Button>
                   <Button
                     variant='contained'
                     onClick={() => {
                       // Apply filter logic or submit here
                       this.handleApply();
                       this.setState({filterDialogOpen: false});
                     }}
                   >
                     Apply
                   </Button>
                 </DialogActions>
               </Dialog>
               {/* <div
                 style={{
                   display: 'flex',
                   flexDirection: 'column',
                   height: '100vh', 
                 }}
               > */}
                 <Box sx={{ overflowY: 'auto' }}>
                   <OnHoldOrders
                     setModalTypeHandler={setModalTypeHandler}
                     setModalStatusHandler={setModalStatusHandler}
                     setcreatNewDataHandler={setcreatNewDataHandler}
                     creatNewData={creatNewData}
                     handleClose={this.handleClose}
                     handleSubmit={this.handleSubmit}
                     responseDialog={this.responseDialog}
                     edit_id_data={this.state.edit_id_data}
                     open={this.state.open}
                     handleEdit={this.handleEdit}
                     appConfigData={this.state.appConfigData}
                     createMail={this.createMail}
                     selectData={selectData}
                     setselectData={setselectData}
                     {...this.props}
                     sale_status={this.state.sale_status}
                     setAppConfigData={this.setAppConfigData}
                     invoicelayout={this.state.invoicelayout}
                     setinvoicelayout={this.setInvoiceLayout}
                     page={this.state.page1}
                     rowsPerPage={this.state.rowsPerPage1}
                     handleChangePage={this.handleChangePageForSO}
                     handleChangeRowsPerPage={this.handleChangeRowsPerPageForSO}
                     invoiceCreateBtn={invoiceCreateBtn}
                   />
               </Box>
             </Card>
                {!this.state.invoicelayout && this.state.open === false && (
           <Card sx={{ height: 'calc(100vh - 80px)', width: '50%', display: 'flex', flexDirection: 'column' }}>
                      {this.state.billedOpen && (
                        <BilledOrders
                          billedOrders={this.props.billedOrdersFilter}
                          setModalTypeHandler={setModalTypeHandler}
                          setLoaderStatusHandler={setLoaderStatusHandler}
                          cust_id={this.state.cust_id}
                          from={this.state.date.from}
                          to={this.state.date.to}
                          page = {this.state.page}
                          rowsPerPage = {this.state.rowsPerPage}
                          handleChangePage = {this.handleChangePage}
                          handleChangeRowsPerPage = {this.handleChangeRowsPerPage}
                          billedOrdersFilterCount  ={this.props.billedOrdersFilterCount}
                          refreshFunc ={()=> this.fetchOnHoldSales()}
                        />
                      )}
                   </Card>
                )}
                <ReceiptTempDialog
                  open={popupData.Dopen}
                  handleClose={() => this.handleClose()}
                />
              </Box>)
            //</Card>
        )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    onHoldOrders: state.soTrackingReducer.onHoldOrders || [],
    billedOrdersFilter: state.soTrackingReducer.billedOrdersFilter || [],
    billedOrdersFilterCount: state.soTrackingReducer.billedOrdersFilterCount || [],
    product: state.productReducer.product || [],
    app_config_data: state.appConfigReducer.app_config_data,
    customerAsCompany: state.customerReducer.customerAsCompany || [],
    app_config_data_based_on_type: state.appConfigReducer.app_config_data_based_on_type || [],
    menuAccess: state.rbacReducer.menuAccess || [],
    // sales: state.salesReducer.sales || [],
    // customer: state.customerReducer.customer || [],
    // stocklocation: state.stockLocationReducer.stocklocation || [],
    // sales_filter_all_data: state.salesReducer.sales_filter_all_data || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    getBySalesStatusOnHoldAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getBySalesStatusOnHoldAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getBySalesStatusReadyToShipAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getBySalesStatusReadyToShipAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getBySalesStatusOnHoldActionByPagination: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getBySalesStatusOnHoldActionByPagination(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listProductAction: () => {
      return dispatch(listProductAction());
    },
    getInvoiceDateFilterAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      data1,
    ) => {
      return dispatch(
        getInvoiceDateFilterAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          data1
        ),
      );
    },
    getAppConfigDataAction: () => {
      return dispatch(getAppConfigDataAction());
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
    listCustomerAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      response,
    ) => {
      return dispatch(
        listCustomerAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          response,
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
      dispatch(
        createSalesAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          setDisable,
          () => {},
          response
        ),
      );
    },
    updateSalesAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      employee_id,
      headerLocationId,
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
        ),
      );
    },
    listSalesAction: (
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listSalesAction(
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listAllFilterSalesAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack,
    ) => {
      return dispatch(
        listAllFilterSalesAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack,
        ),
      );
    },
    posSequence: (id, data, setLoaderStatusHandler) => {
      return dispatch(posSequence(id, data, setLoaderStatusHandler));
    },
    sendMail: (data, setLoaderStatusHandler) => {
      dispatch(sendMail(data, setLoaderStatusHandler));
    },
    getAllemployeeincludingAdminAction: () => {
      return dispatch(getAllemployeeincludingAdminAction());
    },
    getAllBySalesStatusfilter: (data) => {
      return dispatch(getAllBySalesStatusfilter(data));
    },
    customerAsCompanyAction: () => {
      return dispatch(customerAsCompanyAction());
    },
    getAppConfigDataBasedOnTypeAction: (type) => {
            dispatch(getAppConfigDataBasedOnTypeAction(type));
          },
    setInvoiceTempAction: (data) => {
      dispatch(setInvoiceTempAction(data))
    },
    getMenuAccessAction: (selectedRole) => {
      dispatch(getMenuAccessAction(selectedRole))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SOTracking);

