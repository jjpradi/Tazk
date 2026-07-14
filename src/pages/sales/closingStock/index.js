import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  listInventoryAction,
  listClosingStockDateAction,
  listclosingstocklimitdata,
  setSearchClosingStockAction,
  getSearchClosingStockAction,
  ClosingStockFinalAction,
} from '../../../redux/actions/inventory_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {TextField, Typography, InputAdornment, Link, IconButton, Dialog, Box} from '@mui/material';
import moment from 'moment';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import apiCalls from 'utils/apiCalls';
import DataGridTemp from 'components/dataGridTemp';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import {Helmet} from "react-helmet-async";
import { pageSize } from 'utils/pageSize';
import { titleURL } from 'http-common';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareIcon from '@mui/icons-material/Share';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import withRouter from '../../../utils/custWithRouter';
class closingStock extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.date = moment().subtract(1, 'days').toDate();
    // var day = ("0" + this.date.getDate()).slice(-2);
    // var month = ("0" + (this.date.getMonth() + 1)).slice(-2);
    // var today = this.date.getFullYear() + "-" + (month) + "-" + (day);
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      count: 0,
      page: 0,
      pageSize: 20,
      value: this.date,
      searchVal:'',
      inventory_data: [],
      title: 'Closing Stock',
      columnData: [
        // {
        //   field: 'trans_id',
        //   headerName: 'Id',
        //   flex: 1,
        // },
        {
          field: 'product_name',
          headerName: 'Product Name',
          flex: 1,
        },
        {
          field: 'location',
          headerName: 'Location',
          flex: 1,
        },
        {
          field: 'available_qty',
          headerName: 'Available Oty',
          flex: 1,
          align: 'right',
          cellStyle: { textAlign: 'right', paddingRight: '10px' },
          headerAlign: 'center',
        },
        {
          field: 'cost',
          headerName: 'Cost',
          flex: 1,
          align: 'right',
          cellStyle: { textAlign: 'right', paddingRight: '10px' },
          headerAlign: 'center',
        },
      ],
      isApiFinished: false,
      scheduleOpen  : false,
      shareOpen  : false,
      Schedulecolumns  :  [
        { name: "Id", key: "trans_id" },
        { name: "Product Name", key: "product_name" },
        { name: "Location", key: "location" },
        { name: "Available Oty", key: "available_qty" },
        { name: "Cost", key: "cost" }
      ]
    };
  }

  async componentDidMount() {
    this.props.setSearchClosingStockAction({data:[], numRows:0});
    const context = this.context;
    // this.props.listclosingstocklimitdata(
    //   context.commoncookie,
    //   context.headerLocationId,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );

    const data = {
        date : moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD'),
        pageCount: this.state.page || 0,
        numPerPage: this.state.pageSize || 0,
        searchString: '',
        headerLocationId: context.headerLocationId,
    };


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.ClosingStockFinalAction(
      data,   
      ),
    );
    this.handleDateChange(this.state.value);
  }

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleFilter = (data) => this.setState({filterOpen: data});

  handleDateChange = async (date) => {
    const dateVal = date;
    this.setState({value: dateVal});
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // this.props.listClosingStockDateAction(convertedDate)
    // this.DateFiltering(convertedDate);
  };

  DateFiltering = async (date) => {
    const data = [...this.props.inventory];
    if (date !== '' && typeof date !== 'undefined') {
      const Filtering = data.filter((f) => f.trans_date.slice(0, 10) === date);
      this.setState({inventory_data: Filtering});
    }
  };

  clearButton = () => {
    const previousDate = moment().subtract(1, 'days').toDate();
    this.setState({value: previousDate});
    this.setState({filterOpen: false});

  };

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({ pageSize: size });
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({ searchData: pageChangeData });
    // }

    this.setState({ pageSize: size }, async () => {
      const context = this.context;
      const dateVal = this.state.value;
      let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      );

      const data = {
        date: convertedDate,
        pageCount: this.state.page || 0,
        numPerPage: size,
        searchString: this.state.searchVal,
        headerLocationId: context.headerLocationId,
      };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.ClosingStockFinalAction(
          data,
        ),
      );
    });
  };


  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({ page: page });
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + pageSize) * page,
    //     pageSize * (page + 1),
    //   );
    //   return this.setState({ searchData: pageChangeData });
    // }

    this.setState({ page: page });
    const context = this.context;
    const dateVal = this.state.value;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );

    const data = {
      date: convertedDate,
      pageCount: page || 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      headerLocationId: context.headerLocationId,
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.ClosingStockFinalAction(
        data,
      ),
    );

  };

  ApplyButton = async () => {
    const context = this.context;
    const dateVal = this.state.value;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );

    const data = {
      date : convertedDate,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString:this.state.searchVal,
      headerLocationId: context.headerLocationId,
  };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.ClosingStockFinalAction(
        data,
      ),
    );

    const badgeCount = [convertedDate];

    let count = 0;
    badgeCount.forEach((d) => {
      if (d) count += 1;
    });
    this.setState({
      ...this.state,
      ['count']: count,
    });
    this.setState({page: 0});
    this.setState({filterOpen: false});
  };
  headerupdate = '';
  async componentDidUpdate() {
    const dateVal = this.state.value;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;

      const data = {
        date : convertedDate,
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        headerLocationId: context.headerLocationId,
    };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.ClosingStockFinalAction(
          data,
        ),
      ).finally(() => this.setState({isApiFinished: true}));
    }
  }

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  requestSearch = (e) => {
    //------front end search ----->
    // let val = e;
    // this.setState({searchVal: val});
    // const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
    // const filteredRows = this.props.filtered_data.filter((row) => {
    //   return Object.keys(row).some((field) => {
    //     return searchRegex.test(row[field]);
    //   });
    // });
    // this.setState({searchData: filteredRows, searchPageData: filteredRows});
    // this.setState({page: 0});
    //--------backend search----------->>>>
    const context = this.context;
    let val = e;
    this.setState({searchVal: val});
    const dateVal = this.state.value;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.setSearchClosingStockAction({data:[], numRows:0})
    }
    // }
    const data = {
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId,
      pageCount:  0,
      numPerPage: this.state.pageSize,
      date: convertedDate
    }
    if (val && val.trim() !== "") {
    this.props.getSearchClosingStockAction(data);
  } else {
    this.props.ClosingStockFinalAction(data);
  }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({data:[] ,searchVal:'',page:0});
    this.props.setSearchClosingStockAction({data:[], numRows:0})
    const dateVal = this.state.value;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );

    const data = {
      searchString:"",
      employeeId:context.commoncookie,
      pageCount:  0,
      numPerPage: this.state.pageSize,
      date: convertedDate,
      headerLocationId: context.headerLocationId,
    }
    this.props.ClosingStockFinalAction(data)
  };
 handleScheduleClose = () => this.setState({scheduleOpen: false});
 handleShareClose = () => this.setState({shareOpen: false});

  // cancelSearch = (e) => {
  //   this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
  // };

  render() {
    // const { inventory_data } = this.state

    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Closing Stock </title>
       </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          }) => (
            <>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              ></AlertDialog>

              {this.state.open === false && (

                // <MaterialTable
                //   actions={[
                //     {
                //       icon: () => (
                //         <div style={{display: 'flex'}}>
                //           <CommonFilter
                //             Datefilter={true}
                //             value={this.state.value}
                //             count={this.state.count}
                //             handleDateChange={this.handleDateChange}
                //             handleClose={this.handleFilter}
                //             open={this.state.filterOpen}
                //             ApplyButton={this.ApplyButton}
                //             clearButton={this.clearButton}
                //           />
                //         </div>
                //       ),
                //       tooltip: 'Filter',
                //       isFreeAction: true,
                //     },
                //   ]}
                //   components={{
                //     Toolbar: (props) => (
                //       <div>
                //         <MTableToolbar {...props} />
                //         <span
                //           style={{paddingLeft: '30px', paddingBottom: '20px'}}
                //         ></span>
                //       </div>
                //     ),
                //   }}
                //   options={{
                //     headerStyle: {
                //       fontSize: 15
                //     },
                //     exportButton: true,
                //     filtering: false,
                //     maxBodyHeight: maxBodyHeight,
                //     pageSize: 20,
                //     pageSizeOptions: [20, 50, 100],
                //     actionsColumnIndex: -1,
                //     exportMenu: [
                //       {
                //         label: 'Export PDF',
                //         exportFunc: (cols, datas) =>
                //          {

                //           apiCalls(
                //             setModalTypeHandler,
                //             setLoaderStatusHandler,
                //             this.props.listClosingStockDateAction(
                //               moment(this.state.value, 'year', 'month', 'day').format(
                //                 'yyyy-MM-DD',
                //               ),
                //               commoncookie,
                //               headerLocationId,
                //               setModalTypeHandler,
                //               setLoaderStatusHandler,

                //             (exportData) => {

                //               ExportPdf(
                //                 cols,
                //                 exportData,
                //                 'ClosingStockData',
                //               );
                //             },
                //           )
                //           )
                //          }
                //       },
                //       {
                //         label: 'Export CSV',
                //         exportFunc: (cols, datas) =>
                //         {
                //         apiCalls(
                //           setModalTypeHandler,
                //           setLoaderStatusHandler,
                //           this.props.listClosingStockDateAction(
                //             moment(this.state.value, 'year', 'month', 'day').format(
                //               'yyyy-MM-DD',
                //             ),
                //             commoncookie,
                //             headerLocationId,
                //             setModalTypeHandler,
                //             setLoaderStatusHandler,

                //           (exportData) => {

                //             ExportCsv(
                //               cols,
                //               exportData,
                //               'ClosingStockData',
                //             );
                //           },
                //         )
                //         );
                //          }
                //       },
                //     ],
                //   }}
                //   columns={[
                //     {
                //       field: 'product_name',
                //       title: 'Product Name',
                //     },
                //     {
                //       field: 'location',
                //       title: 'Location',
                //     },
                //     {
                //       field: 'available_qty',
                //       title: 'Available Oty',
                //     },
                //     {
                //       field: 'cost',
                //       title: 'Cost',
                //     },
                //   ]}
                //   data={
                //     this.props.filtered_data
                //       ? this.props.filtered_data
                //           .slice(0, this.props.pageSize)
                //           .map((r, i) => {
                //             const {tableData, ...record} = r;
                //             return {i, ...record};
                //           })
                //       : []
                //   }
                //   title={
                //     <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                //     Closing Stock
                //     </Typography>}
                //     />

                (<>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 1.5, pb: 0.5 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', flex: 1 }}>Closing Stock</Typography>
                  {[
                    { label: 'Total Items', value: this.props.closingStockDataCount || this.props.closingStockData?.length || 0, color: '#2E3A59' },
                    { label: 'Total Qty', value: Number(this.props.closingStockData?.reduce((s, r) => s + (r.available_qty || r.quantity || 0), 0) || 0).toLocaleString('en-IN'), color: '#11C15B' },
                    { label: 'Total Value', value: `\u20B9${Number(this.props.closingStockData?.reduce((s, r) => s + (parseFloat(r.total) || 0), 0) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#0A8FDC' },
                  ].map(k => (
                    <Box key={k.label} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
                      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{k.label}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: k.color, lineHeight: 1.3 }}>{k.value}</Typography>
                    </Box>
                  ))}
                  <IconButton onClick={() => this.props.history('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton>
                </Box>
                <DataGridTemp
                  pageSize={this.state.pageSize}
                  page={this.state.page}
                  pageType= 'task'
                  searchtype= 'closingstock'
                  title={''}
                  // data={ this.props.filtered_data}
                  data={this.props.closingStockData}
                  columns={this.state.columnData}
                  filter={
                    <CommonFilter
                      Datefilter={true}
                      value={this.state.value}
                      count={this.state.count}
                      handleDateChange={this.handleDateChange}
                      handleClose={this.handleFilter}
                      open={this.state.filterOpen}
                      ApplyButton={this.ApplyButton}
                      clearButton={this.clearButton}
                      shouldFetchData={false}
                    />
                  }
                  scheduleReport = {
                                  <div style={{display:'flex'}}>
                                     <IconButton 
                                        onClick={()=> this.setState({scheduleOpen:true})}
                                      >
                                        <ScheduleIcon/>
                                      </IconButton>
                                      <Dialog open={this.state.scheduleOpen}>
                                        <CommonSchedule
                                        report_name  = {'Closing Stock Report'}
                                        handleClose = {this.handleScheduleClose}
                                        open={this.state.scheduleOpen}
                                        columns = {this.state.Schedulecolumns}
                                        // data = {this.props.searchSalesReportData}
                                      />
                                      </Dialog>
                                      </div>
                                }

                   shareReport = {
                                  <div style={{display:'flex'}}>
                                     <IconButton 
                                        onClick={()=> this.setState({shareOpen:true})}
                                      >
                                        <ShareIcon/>
                                      </IconButton>
                                      <Dialog open={this.state.shareOpen}>
                                       <ShareReport
                                          report_name  = {'Stock Ageing Report'}
                                          handleClose = {this.handleShareClose}
                                          open={this.state.shareOpen}
                                          columns = {this.state.Schedulecolumns}
                                          data = {this.props.closingStockData}
                                          fromDate = {moment(this.state.value, 'year', 'month', 'day').format('yyyy-MM-DD')}
                                          toDate = {moment(this.state.value, 'year', 'month', 'day').format('yyyy-MM-DD')}
                                        />
                                      </Dialog>
                                      </div>
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
                  rowCount={this.props.closingStockDataCount}
                  requestSearch={(e)=>this.requestSearch(e.target.value)}
                  cancelSearch={this.cancelSearch}
                  searchVal={this.state.searchVal}
                    type='filter'
                    isApiFinished={this.state.isApiFinished}
                />
                </>)
              )}
            </>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    inventory: state.inventoryReducer.inventory,
    inventory_id_data: state.inventoryReducer.inventory_id_data,
    filtered_data: state.inventoryReducer.filtered_inventory,
    closingStockData: state.inventoryReducer.closingStockData,
    closingStockDataCount: state.inventoryReducer.closingStockDataCount,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listInventoryAction: (
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listInventoryAction(
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listClosingStockDateAction: (
      date,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listClosingStockDateAction(
          date,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    setSearchClosingStockAction: (val ) => { 
      return dispatch(setSearchClosingStockAction(val));
    },
    getSearchClosingStockAction: (val) => { 
      return dispatch(getSearchClosingStockAction(val));
    },
    ClosingStockFinalAction: (val ) => { 
      return dispatch(ClosingStockFinalAction(val));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(closingStock));

