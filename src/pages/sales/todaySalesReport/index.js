import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import React, { Component } from 'react'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { listSalesAction, salesReportDataInPagination, salesReportDataGet, getSalesStatusListAction, searchSalesReportState, searchSalesReportAction, SalesReportfinalDataAction, getBillingcompany } from '../../../redux/actions/sales_actions';
import { TextField, InputAdornment, List, ListItem, ListItemText, Chip, Typography, Link, IconButton, Dialog, Box, Tabs, Tab } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from '@mui/icons-material/Clear';
import { connect } from 'react-redux';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import ListItemIcon from '@mui/material/ListItemIcon';
import { GetPosSaleDateFilterAction } from '../../../redux/actions/pos_sale_actions';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import moment from 'moment';
import {listPaymentTypeDetails} from '../../../redux/actions/payment_method_actions';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import {InventoryProductAction, listProductAction} from '../../../redux/actions/product_actions';
import apiCalls from 'utils/apiCalls';
import DataGridTemp from 'components/dataGridTemp';
// import { Sale_Status } from './../sales/sale_status_list';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500,} from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat } from 'utils/getTimeFormat';
import { Width } from 'utils/pageSize';
import { titleURL } from 'http-common';
import { useNavigate } from 'react-router-dom';
import { getsessionStorage } from 'pages/common/login/cookies';
import FilterTodaySalesreport from './FilterTodaySalesReport';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import ShareIcon from '@mui/icons-material/Share';
import withRouter from '../../../utils/custWithRouter';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class index extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    const today = new Date();

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formattedToday = formatDate(today);

  this.firstDay = formattedToday;
    this.lastDay = formattedToday;
    console.log(formattedToday, "formattedToday")
    let headerupdate = '';
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      erp_id: '',
      count: 0,
      page: 0,
      pageSize: pageSize,
      from: this.firstDay,
      to: this.lastDay,
      dateRange: null,
      edit_id_data: [],
      rowPopup: {open: false, rowIndex: '', item_id: ''},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      subcompanyId: 'All',
      filtedValue: {
        brand: 'null',
        category: 'null',
        location_id: 'null',
        payment_type: 'null',
      },
      exportfilter:false,
      title: 'Daily Sales Report',
      isApiFinished: false,
      scheduleOpen : false,
       Schedulecolumns  :  [
        { name: "Customer Name", key: "company_name" },
        { name: "Invoice Number", key: "invoice_number" },
        { name: "Date", key: "invoice_date_converted" },
        { name: "Product", key: "product_name" },
        { name: "Serail Number", key: "lot_number" },
        { name: "Serialized", key: "is_serialized" },
        { name: "Quantity", key: "ordered_qty" },
        { name: "Total", key: "total" },
        { name: "Status", key: "status_name" }
      ],
      tabValue: 'lotWise'
    };
  }

  storage = getsessionStorage();

  async componentDidMount() {
    this.props.searchSalesReportState({data:[], numRows:0});
    const selectedRole = this.storage?.role_name;
    const context = this.context;
    const data = {
      from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      brand: this.state.filtedValue.brand,
      category: this.state.filtedValue.category,
      location_id: context.headerLocationId,
      payment_type: this.state.filtedValue.payment_type,
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      reportType: "TodaySales",
      company_id : this.storage.company_id,
      sub_company_id : 'All',
      pageType: this.state.tabValue
    };
  const subcompany = this.storage.subcompany
    apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        !this.props.Sale_Status.length && this.props.getSalesStatusListAction(),
        this.props.SalesReportfinalDataAction(data),
    ).then(() => {
      if (subcompany > 0) {
        this.props.getBillingcompany()
      }
    }).finally(() => this.setState({isApiFinished: true}));

  }

  async componentDidUpdate(prevProps, prevState) {
    // if (prevProps.sales_report_data !== this.props.sales_report_data) {
    //   this.setState({ filterData: this.props.sales_report_data });
    // }
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if(prevState.filterOpen !== this.state.filterOpen && this.state.filterOpen === true){
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // this.props.salesReportDataGet(data),
        !this.props.list_payment_type.length && this.props.listPaymentTypeDetails(),
        !this.props.stocklocation.length &&   this.props.listStockLocationAction(
          context.commoncookie,
          context.headerLocationId),
        // !this.props.product.length && this.props.InventoryProductAction(),
        !this.props.product.length && this.props.listProductAction(context.setModalTypeHandler, context.setLoaderStatusHandler)
      )
      // this.setState({
      //   filtedValue: {
      //     ...this.state.filtedValue,
      //     brand: this.props.inventory_product,
      //     category : 
      //   },
      // });
      
    }
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;
      if (context.headerLocationId !== 'null') {
        this.setState({
          filtedValue: {
            ...this.state.filtedValue,
            location_id: context.headerLocationId,
          },
        });
      }
    }
      const { brand, category, location_id, payment_type } =
        this.state.filtedValue;

      if (prevState.pageSize !== this.state.pageSize) {
        const data = {
          from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          brand: this.commonFilterMapping(brand, 'brand'),
          category: this.commonFilterMapping(category, 'category'),
          location_id: this.commonFilterMapping(location_id, 'location_id'),
          payment_type:
            payment_type === 'null'
              ? payment_type
              : payment_type.map((p) => `${p.payment_type} (INR)`),
          pageCount: 0,
          numPerPage: this.state.pageSize,
          searchString: this.state.searchVal,
          reportType: "TodaySales",
          company_id : this.storage.company_id,
          sub_company_id : this.state.subcompanyId,
          pageType: this.state.tabValue
        };


        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.SalesReportfinalDataAction(
            data
          )
        )
      }
      if (prevState.page !== this.state.page) {

        const data = {
          from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          brand: this.commonFilterMapping(brand, 'brand'),
          category: this.commonFilterMapping(category, 'category'),
          location_id: this.commonFilterMapping(location_id, 'location_id'),
          payment_type:
            payment_type === 'null'
              ? payment_type
              : payment_type.map((p) => `${p.payment_type} (INR)`),
          pageCount: this.state.page,
          numPerPage: this.state.pageSize,
          searchString: this.state.searchVal,
          reportType: "TodaySales",
          company_id : this.storage.company_id,
          sub_company_id : this.state.subcompanyId,
          pageType: this.state.tabValue
        };


        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.SalesReportfinalDataAction(
            data
          ))
      }
      if (prevState.tabValue !== this.state.tabValue) {

        const data = {
          from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          brand: this.commonFilterMapping(brand, 'brand'),
          category: this.commonFilterMapping(category, 'category'),
          location_id: this.commonFilterMapping(location_id, 'location_id'),
          payment_type:
            payment_type === 'null'
              ? payment_type
              : payment_type.map((p) => `${p.payment_type} (INR)`),
          pageCount: this.state.page,
          numPerPage: this.state.pageSize,
          searchString: this.state.searchVal,
          reportType: "TodaySales",
          company_id : this.storage.company_id,
          sub_company_id : this.state.subcompanyId,
          pageType: this.state.tabValue
        };


        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.SalesReportfinalDataAction(
            data
          ))
      }
  }


  handlePageSizeChange = async (size) => {
    this.setState({pageSize:size, page : 0})
    // if (this.state.searchVal) {
    //   this.setState({ pageSize: size });
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({ searchData: pageChangeData });
    // }

    // this.setState({ pageSize: size }, async () => {
    //   const context = this.context;

    //   const { brand, category, location_id, payment_type } =
    //     this.state.filtedValue;

    //   const data = {
    //     from: moment(this.state.from, 'year', 'month', 'day').format(
    //       'yyyy-MM-DD',
    //     ),
    //     to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //     brand: this.commonFilterMapping(brand, 'brand'),
    //     category: this.commonFilterMapping(category, 'category'),
    //     location_id: this.commonFilterMapping(location_id, 'location_id'),
    //     payment_type:
    //       payment_type === 'null'
    //         ? payment_type
    //         : payment_type.map((p) => `${p.payment_type} (INR)`),
    //         pageCount: this.state.page,
    //         numPerPage: size,
    //         searchString: this.state.searchVal,
    //   };


    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.SalesReportfinalDataAction(
    //       data
    //     )
    //   )
    // });
  };
  handlePageChange = async (page) => {
    this.setState({ page: page })

    // // if (this.state.searchVal) {
    // //   this.setState({ page: page });
    // //   let pageChangeData = this.state.searchPageData?.slice(
    // //     (0 + pageSize) * page,
    // //     pageSize * (page + 1),
    // //   );
    // //   return this.setState({ searchData: pageChangeData });
    // // }

    // this.setState({ page: page });
    // const context = this.context;
    // const { brand, category, location_id, payment_type } = this.state.filtedValue;

    // const data = {
    //   from: moment(this.state.from, 'year', 'month', 'day').format(
    //     'yyyy-MM-DD',
    //   ),
    //   to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
    //   brand: this.commonFilterMapping(brand, 'brand'),
    //   category: this.commonFilterMapping(category, 'category'),
    //   location_id: this.commonFilterMapping(location_id, 'location_id'),
    //   payment_type:
    //     payment_type === 'null'
    //       ? payment_type
    //       : payment_type.map((p) => `${p.payment_type} (INR)`),
    //       pageCount: page,
    //       numPerPage:  pageSize,
    //   searchString: this.state.searchVal,
    // };


    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.SalesReportfinalDataAction(
    //     data
    //   )
    // )
  };

   handleClick = () => {
    console.log('navigateeeeeee')
    alert('hjjjjjj')
    // const navigate = useNavigate();
    //  navigate(`/report`)
   };



  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page: 0 });

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.searchSalesReportState({ data: [], numRows: 0 })
    }
    // }
    const { brand, category, location_id, payment_type } = this.state.filtedValue;
    const body = {
      from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      location_id: this.commonFilterMapping(location_id, 'location_id'),
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val,
      reportType: "TodaySales",
      company_id : this.storage.company_id,
      sub_company_id : this.state.subcompanyId,
      pageType: this.state.tabValue
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.searchSalesReportAction(
        body,
      )
    )
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' })
    this.props.searchSalesReportState({ data: [], numRows: 0 })
    const { brand, category, location_id, payment_type } = this.state.filtedValue;

    const data = {
      from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      brand: this.commonFilterMapping(brand, 'brand'),
      category: this.commonFilterMapping(category, 'category'),
      location_id: this.commonFilterMapping(location_id, 'location_id'),
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      reportType: "TodaySales",
      company_id : this.storage.company_id,
      sub_company_id : this.state.subcompanyId,
      pageType: this.state.tabValue
    };


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.SalesReportfinalDataAction(
        data,
      )
    )
  }

  brandSearch = (event, key) => {
    let values = event ? event[key] : false;
    // setCategory('')
    // setSearch('')
    this.setState({[key]: event ? event[key] : ''});
    if (values) {
      const result = this.props.sales_report_data.filter((data) => {
        return data.sales_items.some((t) => t[key]?.includes(values));
      });

      this.setState({filterData: result});
    } else {
      this.setState({filterData: this.props.sales_report_data});
    }
  };

  
  handleChange = async (data) => {

     if(data.target.name === 'dateRange'){
      var date_val = data.target.value;
      var date_val1 = data.target.value1;
      var date_val2 = data.target.value2;
      console.log(date_val,'date_val1',date_val1)
      await this.setState({['from']: date_val});
      await this.setState({['to']: date_val1});
      await this.setState({['dateRange']: date_val2});

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


  cancelPosSale = () => this.setState({cancelSale: true});

  setFilter = (data) => this.setState({filter: data});

  handleFilter = async(data) => await this.setState({filterOpen: data});

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  // saleStatusUpdateOnTable = (value) => {
  //   const sale_status = this.props.sales_report_data.filter((sale) => sale.sale_status);
  //   let getOption = sale_status.filter((f => f.value === value))
  //   return getOption.length > 0 ? getOption[0].option : value
  // }

  saleStatusUpdateOnTable = (value) => {
    let getOption = this.props.Sale_Status.filter((f) => f.status_id === value);
    return getOption.length > 0 ? getOption[0].status : value;
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
    this.setState({ exportfilter: false });
  
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' });
  
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
    const context = this.context;
    const data = {
      from: formattedToday,
      to: formattedToday,
      brand: 'null',
      category: 'null',
      location_id: 'null',
      payment_type: 'null',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      reportType: "TodaySales",
      company_id : this.storage.company_id,
      sub_company_id : 'All',
      pageType: this.state.tabValue
    };
  
    this.props.SalesReportfinalDataAction(data);
  
    this.setState({
      from: formattedToday,
      to: formattedToday,
      dateRange: null,
      filtedValue: {
        brand: 'null',
        category: 'null',
        location_id: 'null',
        payment_type: 'null',
      },
      filterOpen: false,
      subcompanyId: 'All',
    });
  };
  

  ApplyButton = async (formValue) => {
    console.log("formValue",formValue)
    this.setState({ searchData: [], searchPageData: [], page: 0, searchVal: '' })
    await this.setState({filtedValue: formValue});
    this.setState({exportfilter:true})
    //   if(moment(this.state.from ,'year') <= moment(this.state.to,'year') ){

    //     if(moment(this.state.from ,'month') <= moment(this.state.to,'month')){

    //         if(moment(this.state.from ,'day') <= moment(this.state.to,'day')){
    // if(this.state.from !== '' && this.state.to !== ''){

    // categoryName =category.category
    //  brandName = brand.brand
    const context = this.context;
    // // this.setState.badgeCount("")
    const {brand, category, location_id, payment_type} = this.state.filtedValue;

    const data = {
      from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      brand: brand !== undefined ? this.commonFilterMapping(brand, 'brand') : '',
      category:
        category !== undefined ? this.commonFilterMapping(category, 'category') : '',
      location_id: this.commonFilterMapping(location_id, 'location_id'),
      payment_type:
        payment_type === 'null'
          ? payment_type
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: pageSize,
      searchString: this.state.searchVal,
      reportType: "TodaySales",
      company_id : this.storage.company_id,
      sub_company_id : this.state.subcompanyId,
      pageType: this.state.tabValue
    };

    // this.setState({filter:{...this.state.filter,location_id,payment_type}})
    
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.SalesReportfinalDataAction(
          data,
        )
      )


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

  handleClose = () => this.setState({scheduleOpen: false});
  
  handleShareClose = () => this.setState({shareOpen: false});

  handleOpen = () => this.setState({scheduleOpen: true});


  render() {
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
    const dailyReportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__transactions__today_sales','can_export');
    console.log("filtedValue",this.state.filtedValue)
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Daily Sales Report </title>
      </Helmet>
      <CreateNewButtonContext.Consumer>
        {({
          commoncookie,
          headerLocationId,
          setModalStatusHandler,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setcreatNewDataHandler,
          creatNewData,
          drawerOpen,
        }) => (
          <div
          //style={{ width: drawerOpen ? 'calc(100vw - 330px)' : 'calc(100vw - 143px)' }}
          >
             <Tabs value={this.state.tabValue} onChange={(event, newValue) => this.setState({tabValue: newValue})} sx={{mt:-4}}>
              <Tab value='lotWise' label='Lot Wise' sx={{fontSize:"13px"}}/>
              <Tab value='saleWise' label='Sale Wise' sx={{fontSize:"13px"}}/>
            </Tabs>
            <MaterialTable
              style={{height: 'calc(100vh - 100px)', overflow:"hidden"}}
              totalCount={this.props.searchSalesReportCount || 0}
              components={{
                Toolbar: (props) => (
                  <>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', '& button[aria-label="Export"]': { mt: '9px' } }}>
                        <MTableToolbar {...props} />
                       </Box>
                    
                      <div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                        {/* <TextField
                          autoFocus
                          sx={{
                            borderRadius: "8px",
                            pr: '10px',
                            '& .MuiOutlinedInput-root': {
                              height: '42px'
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <ClearIcon onClick={this.cancelSearch} sx={{ cursor: 'pointer' }} />
                              </InputAdornment>
                            ),
                          }}
                          placeholder='Search'
                          value={this.state.searchVal}
                          onChange={(e) => this.requestSearch(e.target.value)}
                        /> */}
                      </div>
                    </div>
                  </>
                ),
              }}

              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <FilterTodaySalesreport
                        fromTo={true}
                        catabrand={true}
                        from={this.state.from}
                        locat={true}
                        to={this.state.to}
                        dateRange = {this.state.dateRange}
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
                        subcompanyId={this.state.subcompanyId}
                      /> 
                    </div>
                  ),
                  tooltip: 'Filter',
                  isFreeAction: true,
                },
                {
                  icon : ()=> (
                    <div style={{display:'flex'}}>
                      <IconButton 
                        onClick={()=> this.setState({shareOpen:true})}
                      >
                        <ShareIcon/>
                      </IconButton>
                      <Dialog open={this.state.shareOpen}>
                        <ShareReport
                        report_name  = {'Daily Sales Report'}
                        handleClose = {this.handleShareClose}
                        open={this.state.shareOpen}
                        columns = {this.state.Schedulecolumns}
                        data = {this.props.searchSalesReportData}
                        fromDate = {this.state.from}
                        toDate = {this.state.to}
                      />
                      </Dialog>
                    </div>
                  ),
                  tooltip: 'Share',
                  isFreeAction: true,

                }
              ]}

              onPageChange={(page) => this.handlePageChange(page)}
              onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                options={{
                showEmptyDataSourceMessage: this.state.isApiFinished,
                headerStyle,
                cellStyle,
                search: false,
                exportButton: dailyReportExport,
                filtering: false,
                pagination: true,
                maxBodyHeight: maxBodyHeight,
                minBodyHeight: maxBodyHeight,
                pageSize: this.state.pageSize,
                pageSizeOptions: [20, 50, 100],
                totalCount: this.props.searchSalesReportCount || 0,
                actionsColumnIndex: -1,
                // maxBodyHeight:maxBodyHeight,
                // minBodyHeight:maxBodyHeight,
                exportMenu: dailyReportExport ? [
                  // {
                  //   label: 'Export PDF',
                  //   exportFunc: async (cols, datas) => {
                  //     const {brand, category, location_id, payment_type} = this.state.filtedValue;
                  //     const data = {
                  //       from: moment(this.state.from, 'YYYY-MM-DD').format('YYYY-MM-DD'),
                  //       to: moment(this.state.to, 'YYYY-MM-DD').format('YYYY-MM-DD'),
                  //       brand: brand !== undefined ? this.commonFilterMapping(brand, 'brand') : '',
                  //       category:
                  //         category !== undefined ? this.commonFilterMapping(category, 'category') : '',
                  //       location_id: this.commonFilterMapping(location_id, 'location_id'),
                  //       payment_type:
                  //         payment_type === 'null'
                  //           ? payment_type
                  //           : payment_type.map((p) => `${p.payment_type} (INR)`),
                  //       pageCount: 0,
                  //       numPerPage: pageSize,
                  //       searchString: this.state.searchVal,
                  //       reportType: "TodaySales",
                  //       company_id : this.storage.company_id
                  //     };
                  
                  //     this.props.searchSalesReportAction(
                  //       data,
                  //       setModalTypeHandler,
                  //       setLoaderStatusHandler,
                  //       (exportData) => {
                  //         ExportPdf(
                  //           cols,
                  //           exportData.map((m) => {
                  //             return {
                  //               ...m,
                  //             };
                  //           }),
                  //           'SalesReportData',
                  //         );
                  //       },
                  //     );
                  //   },
                  // },
                  {
                    label: 'Export CSV',
                     exportFunc: async (cols, datas) => {
                    const { searchSalesReportShare } = this.props;

                    if (!searchSalesReportShare || !searchSalesReportShare.length) {
                      return;
                    }

                    ExportCsv(
                      cols,
                      searchSalesReportShare.map((m) => ({
                        ...m,
                      })),
                      'SalesReportData'
                    );
                  }
                  }]: [],
                //  tableLayout:'auto'
              }}

              page={this.state.page}

            //   IF(
            //     sl.company_name = '',
            //     sl.first_name,
            //     sl.company_name
            // )
            // ) AS company_name,
              //  onRowClick = {(evt,rowData) => {this.setState({rowPopup:{open:true,rowIndex:rowData.tableData.id, sales_items: rowData.sales_items} })}}
              columns={[
                {
                  title: 'Customer Name',field: 'company_name',
                  cellStyle: {
                    // width: '600px', // Increase the column width
                    padding: '0px', // Set the padding
                    textAlign: 'left',
                    fontSize:cellStyle.fontSize
                  },              
                     render: rowData =>

                    <List  >
                      <ListItem >
                        <ListItemIcon >
                          {rowData.customer_type === '0' ? <PersonIcon /> : <BusinessIcon />}
                        </ListItemIcon>
                        <ListItemText primary={<Typography sx={{width: '150px',fontSize:cellStyle.fontSize}}>{rowData.company_name || rowData.first_name}</Typography> } />

                      </ListItem>
                    </List>
                },

                {
                  title: 'Invoice Number',
                  field: 'invoice_number',
                  render: rowData => rowData.invoice_number || rowData.dc_number
                },

                {
                  title: 'Date',
                  width: Width('date'),
                  field: 'invoice_date',
                  render: (rowData) => (
                    commonDateFormat(rowData.invoice_date)
                  )
                },
                ...(this.state.tabValue === 'lotWise' ? [
                  { title: 'Product', field: 'product_name' },
                  { title: 'Serial Number', field: 'lot_number' },
                  { title: 'Serialized', field: 'is_serialized' }
                ] : []),
                
                { title: 'Quantity', width: Width('quantity'), field: 'ordered_qty', },
                { 
                  title: 'Total', 
                  field: 'total', 
                  // align: 'right', 
                  // cellStyle: { textAlign: 'right', paddingRight: '10px', fontSize:cellStyle.fontSize },
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
                      {rowData.total}
                    </div>
                  )
                },
                { title: 'Status', field: 'status_name' },
                
                // { title: 'Location Name', field: 'location_name',width: Width('location name')},
                // {
                //   title: 'Order Date',
                //   width: Width('date'),
                //   field: 'sale_time',
                //   render: (rowData) => (
                //     commonDateFormat(rowData.sale_time)
                //   )
                // },
                
                // ...(this.storage.company_type !== 2
                //   ? [{ title: 'Order Number', field: 'so_number' }]
                //   : []),
                // { title: 'Category', field: 'product_category' },
                // { title: 'Brand', field: 'product_brand',width: Width('brand')},
              //   { title: 'Purchase Price', field: 'cost_price',cellStyle: {align: 'center',fontSize:'12px',width : 50
              // }, },
                // {
                //   title: 'Sale Price', field: 'unit_price',cellStyle:{align: 'center',fontSize:cellStyle.fontSize},
                //   render: rowData => rowData.unit_price !== null ? rowData.unit_price.toFixed(2) : ''
                // },
                // { title: 'Margin', field: 'Margin', cellStyle: {align: 'center'} },
               
              //   { title: 'Discount', field: 'discount', cellStyle: {align: 'center'} },
              //   { title: 'Tax', field: 'sale_tax_amount', cellStyle: {align: 'center'} },
               
              //   { title: 'Tax category', field: 'tax_category', cellStyle: {align: 'center'} },

              //   { title: 'Gst Number', field: 'GST',width :Width('gst number')},
                // {
                //   title: 'Amount', field: 'unit_price',
                //   render: rowData => <div style={{textAlign:'center',fontSize:'12px',width : 80}}> {rowData.unit_price.toFixed(2)} </div>
                // },
                // { title: 'Status', field: 'sale_status',
                // render: rowData => <Chip color='success' label={this.saleStatusUpdateOnTable(rowData.sale_status)} />
                //  },
                // {
                //   title: 'Status',
                //   field: 'sale_status',
                //   render: (rowData) => (
                //     <Chip
                //       // color='success'
                //       color='primary' 
                //       style={{backgroundColor:`${rowData.sale_status === 7 ? 'grey': '#11C15B'}`,fontSize:cellStyle.fontSize}}
                //       label={this.saleStatusUpdateOnTable(
                //         rowData.sale_status,
                //       )}
                //     />
                //   ),
                // },
                // {
                //   title: 'Payment Status', field: 'payment_status',cellStyle:{align: 'center'},
                //   render: rowData => +rowData.received_amount >= +rowData.total ? <Chip sx={{ fontSize:cellStyle.fontSize }} color='success' label="Paid" /> : <Chip sx={{ width: 88.43 , fontSize:cellStyle.fontSize }} label="Pending" color='warning' />,
                // },
                // {
                //   title: 'Tax ID 1', field: 'tax_group'
                // },
                // {
                //   title: 'Tax ID 2', field: 'tax_group'
                // },
                // {
                //   title: 'Cash Payment',width : 90, field: 'payment_type', align : 'center',
                //   render: rowData => {
                //     if (!rowData.payment_type) return '-';
                //     return rowData.payment_type === 'Cash (INR)' ? 'Yes' : ' ';
                //   }
                // },
                // {
                //   title: 'Other Payment',width : 90, field: 'payment_type',
                //   render: rowData => {
                //     if (!rowData.payment_type) return '-';
                //     return rowData.payment_type !== 'Cash (INR)' ? 'Yes' : ' ';
                //   }
                // },


              ]}


              title={
                <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  {/* <Link href='/report' underline="hover">Home</Link> / Daily Sales Report</Typography>} */}
                  <Box style={{ display: 'flex' }}>
                    <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => this.props.history('/report')}>Home</Box>
                    &nbsp;/&nbsp;Daily Sales Report
                  </Box>
                </Typography>}
                  data={this.props.searchSalesReportData}
                  // data={this.props.searchSalesReportDataNormal}
            />

            {/* <DataGridTemp
              title={this.state.title}
              data={
                this.state.searchVal
                  ? this.state.searchData
                  : this.props.sales_report_data
              }
              columns={this.state.columnData}
              filter={
                <FilterSalesreport
                  fromTo={true}
                  catabrand={true}
                  from={this.state.from}
                  locat={true}
                  to={this.state.to}
                  count={this.state.count}
                  product={this.props.sales_getall_data}
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
              requestSearch={(e) => this.requestSearch(e.target.value)}
              cancelSearch={this.cancelSearch}
              searchVal={this.state.searchVal}
              type='filter'
            /> */}
          </div>
        )}
      </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    sales: state.salesReducer.sales || [],
    sales_report_data: state.salesReducer.sales_report_data || [],
    sales_getall_data: state.salesReducer.sales_getall_data || [],
    sales_report_count: state.salesReducer.sales_report_count || 0,
    pos_sale_by_pagination: state.posSaleReducer.pos_sale_by_pagination || [],
    list_payment_type: state.paymentMethodReducer.list_payment_type || [],
    stocklocation: state.stockLocationReducer.stocklocation || [],
    Sale_Status: state.salesReducer.Sale_Status || [],
    searchSalesReportData: state.salesReducer.searchSalesReportData || [],
    searchSalesReportCount: state.salesReducer.searchSalesReportCount || 0,
    // product : state.productReducer.inventory_product || []
    product: state.productReducer.product || [],
    searchSalesReportDataNormal: state.salesReducer.searchSalesReportDataNormal || [],
    searchSalesReportCountNormal: state.salesReducer.searchSalesReportCountNormal || 0,
    searchSalesReportShare: state.salesReducer.searchSalesReportShare || 0,
    getbillingcompanydetails: state.salesReducer.getbillingcompanydetails,
    menuAccess: state.rbacReducer.menuAccess || []
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    listSalesAction: (employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(listSalesAction(employee_id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    },
    getBillingcompany: () => {
      dispatch(getBillingcompany());
    },
    GetPosSaleDateFilterAction: (setModalTypeHandler, setLoaderStatusHandler, data) => {
      dispatch(GetPosSaleDateFilterAction(setModalTypeHandler, setLoaderStatusHandler, data))
    },
    salesReportDataInPagination: (setModalTypeHandler, setLoaderStatusHandler, data) => {
      return dispatch(salesReportDataInPagination(setModalTypeHandler, setLoaderStatusHandler, data))
    },
    salesReportDataGet: (datasvalue, setModalTypeHandler, setLoaderStatusHandler, result, data) => {
      return dispatch(salesReportDataGet(datasvalue, setModalTypeHandler, setLoaderStatusHandler, result, data))
    },
    listPaymentTypeDetails: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler),
      )
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
  listProductAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    return dispatch(
      listProductAction(setModalTypeHandler, setLoaderStatusHandler),
    )
},
  getSalesStatusListAction: () => {
    return dispatch(getSalesStatusListAction());
  },
  InventoryProductAction: () => {
    return dispatch(InventoryProductAction());
  },
  searchSalesReportAction: (
    val
    ) => { 
    return dispatch(
      searchSalesReportAction(
        val,
        )
      );
  },
  searchSalesReportState: (val ) => { return dispatch(searchSalesReportState(val));
  },
  SalesReportfinalDataAction: (data) => { 
    return dispatch(SalesReportfinalDataAction(data));
  },
}}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(index));



