import React, { Component } from 'react';
import { connect } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
// import NewStockLocation from '../../../components/NewStockLocation';
import { listStockReconcilateAction, listReconcilateProductsAction, listCheckReconcilateProductsAction,MoveProducts, searchreconcilateAction, set_searchreconcilateAction, stockReconcilatePaginationAction, reconciliateDetailsAction } from '../../../redux/actions/stockReconcilate_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Button, Chip, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import FilterReconcilate from './filterreconcilate';
import ArticleIcon from '@mui/icons-material/Article';
import ProductDetails from './productdetails';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import LotDialog from './lotDialog';
import ListIcon from '@mui/icons-material/List';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { commonDateFormat } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import NewStockReconcilateForm from './newStockReconcilateForm';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';

class StockReconcilate extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      stock_reconcilate_data: [],
      open: false,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      product_details:{},
      product_view:false,
      lotOpen: false,
      lotData: {},
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: pageSize,
      searchData: [],
      reconciliate_status_btn: '',
      loanStatus : {
        "Initialized": 'primary',
        "Failed": 'warning',
        "Completed": 'success',
      },
      isApiFinished: false,
      detailsApi: false,
      numPerPage: 0,
      pageNum: 0,
      headerupdate :'null',
      openAlert: false

      // color={rowData.reconciliate_status === "Completed" ? "#11C15B" : (rowData.reconciliate_status === "Initialized" ? "primary" : "#D32F2F")}

    }
    this.cookies = new Cookies();
  }

  async componentDidMount() {
    this.props.set_searchreconcilateAction({data:[], numRows:0});
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      location_id: context.headerLocationId,
      category:''
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockReconcilatePaginationAction(body)
    ).finally((res) => this.setState({isApiFinished: true}))

    // await this.props.listReconcilateProductsAction()
    // await this.setState({ stock_reconcilate_data: this.props.stockReconcilate })
    if (this.props.setModalStatusHandler)
      this.setState({ open: true })
  }

  headerupdate = ''
  
  async componentDidUpdate(prevProps , prevState) {
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      location_id: context.headerLocationId,
      category:''
    }
    let headerLocationId = context.headerLocationId
    if (headerLocationId !== this.state.headerupdate && this.state.open === false) {
      this.setState({ headerupdate : headerLocationId })
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.searchreconcilateAction(body)
        );
    }

    if (prevState.page !== this.state.page) { 

      const body = {
        category:'',
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        location_id: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockReconcilatePaginationAction(body)
      )
    }

    if (prevState.pageSize !== this.state.pageSize) {
    const body = {
      category:'',
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      location_id: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockReconcilatePaginationAction(body)
    )
    }

  }

  handleEdit = async (id) => {
    const context = this.context;
    await this.props.getbyidStockLocationAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler)
    this.setState({ open: true, status: 'edit' })
  }

  handleDelete = async (id) => {
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteStockLocationAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler),
      this.props.listStockLocationAction(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, context.setLoaderStatusHandler),
	  );
    this.setState({ delete: false })
  }

  handledialog = (id) => {
    this.setState({ delete: true, id: id })

  }

  handleClose = (id) => {
      const context = this.context;
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false)
      this.props.setselectData('stockLocation', false)
    }
    this.setState({ open: false, dialog: false, delete: false })
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      location_id: context.headerLocationId,
      category:''
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockReconcilatePaginationAction(body)
    ).finally((res) => this.setState({isApiFinished: true}))


  }

  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false)
      this.props.setselectData('stockLocation', true)
    }
    await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  }

  sample = (value) => {
    this.setState({ open: value })
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false)
      this.props.setselectData('stocklocation', true)
    }
  }

  handleSubmit = async () => {
    const context = this.context;
    // const dat = this.props.stockReconcilate
    // const data = dat.map((d) => {
    //   delete d.location_name
    //   delete d.pname
    //   return d
    // })
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCheckReconcilateProductsAction( this.props.stockReconcilate,context.setModalTypeHandler,context.setLoaderStatusHandler)//this.props.stockReconcilate
	  );
  }
  
  handleChange = async(data) => {
    const context = this.context;
    
    let reconciliate_id = {
      "reconciliate_id": data.id,
      "type": data.reconciliate_status
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      await this.props.reconciliateDetailsAction(reconciliate_id),
    ).finally(() => this.setState({detailsApi: true}));
   
   this.setState({product_details: this.props.reconciliateDetails, reconciliate_status_btn: data.r_status})
   this.setState({product_view:true})
  
  }

  productChange = (data) => {
    const context = this.context;
    
    this.setState({ product_view: data, product_details: {}, detailsApi: false })

    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      location_id: context.headerLocationId,
      category:''
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.reconciliateDetailsAction(data),
      this.props.stockReconcilatePaginationAction(body)
	  );
  }

  // // missing
  // moveScrapLocation = async (data) => {
  //   const context = this.context;
  //   let move = {
  //     employee_id: context.commoncookie,
  //     type: 0, // move to scrap
  //     lotType: 'missing',
  //     table_data: data
  //   }
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.MoveProducts(move, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //   );
  //   // this.setState({ product_view: false })
  // }

  // //excess
  // moveToInventory = async (data) => {

  //   const context = this.context;
  //   let moveToInventory = {
  //     employee_id: context.commoncookie,
  //     type: 1, // move to inventory.
  //     lotType: 'excess',
  //     table_data: data
  //   }
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.MoveProducts(moveToInventory, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //   );
  //   // this.setState({ product_view: false })
  // }

  deleteproduct =async (data) =>{

    const context = this.context;
    let move = {
      employee_id:context.commoncookie,
      item_id:data.item_id,
      location_id:data.location_id,
      type:1,
      id:data.id,
      lotNumber:data.lotNumber
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.MoveProducts(move, context.setModalTypeHandler, context.setLoaderStatusHandler)
	  );
    this.setState({product_view:false})
    // let stockreconcilate ={
    //   location_id:context.headerLocationId,     
    // }
    // await this.props.listStockReconcilateAction(stockreconcilate, context.setModalTypeHandler, context.setLoaderStatusHandler)


  }

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size})
    const context = this.context;
  }

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })
  }


  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});
    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchreconcilateAction({data:[], numRows:0})
    }
    // }
    const body = {
      category:'',
      searchString: val.toLowerCase(),
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      employeeId: context.commoncookie,
      location_id: context.headerLocationId
    }
    this.props.searchreconcilateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  }

  cancelSearch = () =>{
    const context = this.context;
    this.setState({searchPageData: [], page: 0, searchVal: ''});
    const body = {
      category:'',
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId: context.commoncookie,
      location_id: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockReconcilatePaginationAction(body)
    )
  }

  handleLotOpen = (rowData) =>{
    this.setState({lotOpen: true, lotData: rowData})
  }

  handleLotClose = () =>{
    this.setState({lotOpen: false})
  }

  render() {
    
    return (
      <>
        <Helmet>
                  <meta charSet="utf-8" />
                  <title> {titleURL} | Stock Reconcilate </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>{
          ({ setModalStatusHandler, setModalTypeHandler, drawerOpen }) => (
            //style={{ width: drawerOpen ? 'calc(100vw - 325px)' : 'calc(100vw - 143px)' }}
            (<div >
              {this.state.lotOpen === true && <LotDialog open={this.state.lotOpen} handleLotClose={this.handleLotClose} rowData={this.state.lotData} />}
              {this.state.product_view === true && <>
                <ProductDetails
                 productContent={this.state.product_details}
                 reconciliate_status_btn={this.state.reconciliate_status_btn}
                 productChange = {this.productChange}
                //  moveScrapLocation = {this.moveScrapLocation}
                  deleteProduct={this.deleteproduct}
                  detailsApi={this.state.detailsApi}
                //  moveToInventory = {this.moveToInventory}
                 >
                </ProductDetails></>}
              <AlertDialog delete={this.state.delete} handleClose={this.handleClose} handleDelete={this.handleDelete} id={this.state.id} />
              {this.state.open === false && this.state.product_view === false && <>

                <MaterialTable
                  totalCount={this.props.searchReconcilate_count}  
                  style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
                  components={{
                    ...stickyTableComponents,
                    Toolbar: (props) => (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ width: '100%' }}>
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
                              fullWidth
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
                                      sx={{ cursor: 'pointer' }}
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
                          </>
                          ),
                    }}
                  actions={[
                    (rowData) => ({
                      icon: () => (
                        <DescriptionOutlinedIcon
                          fontSize='small'
                          color={rowData.reconciliate_status === "Completed" ? "success" : (rowData.reconciliate_status === "Initialized" ? "primary" : "warning")}
                        />
                      ),
                      tooltip: 'Open',
                      // onClick: (event, rowData) => { rowData.reconciliate_status !== "Completed" ? this.handleChange(rowData) : ''},
                      onClick: (event, rowData) => this.handleChange(rowData),
                      // disabled: !rowData.excess.length && !rowData.missing.length ? true : false,
                      //   setTimeout(() => {
                      //     this.setState({
                      //       rowPopup: {
                      //         ...this.state.rowPopup,open: false}})
                      //   }, 0);},
                    }),
                     {
                    icon: 'add',
                    tooltip: 'add',
                    isFreeAction: true,
                       onClick: (event, rowData) => {
                         const context = this.context;
                         if (context.headerLocationId === 'null' || !context.headerLocationId) {
                           this.setState({ openAlert: true });
                         } else {
                           this.setState({ open: true, status: 'create' });
                         }
                       } },
                    // (rowData) => ({
                    //   icon: () => (
                    //     <ListIcon
                    //       fontSize='small'
                    //       color={'primary'}
                    //     />
                    //   ),
                    //   tooltip: 'Lots',
                    //   onClick: (event, rowData) => { this.handleLotOpen(rowData) }
                    // }),
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                  page={this.state.page}
                  options={getStickyTableOptions({
                     headerStyle,
                     bodyOffset: 195,
                    cellStyle,
                    options:{
                      showEmptyDataSourceMessage: this.state.isApiFinished,
                   
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    tableLayout: "auto",
                    toolbar: true,
                    // maxBodyHeight: maxBodyHeight,
                    // minBodyHeight: maxBodyHeight,
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    totalCount:this.props.searchReconcilate_count,
                    search: false,
                    exportMenu: [{
                      label: 'Export PDF',
                      exportFunc: (cols, datas) => ExportPdf(cols, datas, 'PhysicalStockData')
                    }, {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) => ExportCsv(cols, datas, 'PhysicalStockData')
                    }]
                    },
                  })}
                  columns={[
                   
                    {
                      field: 'username',
                      title: 'Name',
                    },
                    {
                      field: 'location_name', //location_id
                      title: 'Location',
                    },
                    {
                      field: 'createDate',
                      title: 'Creation Date',
                    },
                    {
                      field: 'category',
                      title: 'Category',
                    },
                    {
                      field: 'brand',
                      title: 'Brand',
                    },
                    {
                      field: 'reconciliate_status',
                      title: 'Status',
                      render: (rowData) => (
                        (<Chip
                          variant='outlined'
                          size='small'
                          // label={rowData.reconciliate_status}
                          label={<Typography variant='h7'>{rowData?.reconciliate_status}</Typography> }
                          color={this.state.loanStatus[rowData?.reconciliate_status]}
                        />)
                        // <Typography color={rowData.reconciliate_status === "Completed" ? "#11C15B" : (rowData.reconciliate_status === "Initialized" ? "primary" : "#D32F2F")}>{rowData.reconciliate_status}</Typography>
                      )
                      
                    }
                    // {
                    //   title: <Typography align='center '>Actions</Typography>,
                    //   render: (rowData) => {
                    //     return (
                    //       <>
                    //         <IconButton
                    //           title='Open'
                    //           onClick={
                    //             () => { this.handleChange(rowData) }
                    //           }>
                    //           <ArticleIcon
                    //             color={
                    //               'success'
                    //             }
                    //           />
                    //         </IconButton>
                    //         <IconButton variant='outlined' onClick={() => this.handleLotOpen(rowData)}>
                    //           <ListIcon color='primary' />
                    //         </IconButton>
                    //       </>
                    //     );
                    //   }
                    // },
                  ]}
                  data={this.props.searchReconcilateValue}
                  title="Physical Stocks"
                /><br />

                {/* <Button
                  onClick={this.handleSubmit}
                  style={{}}
                  name='reconcilate'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  >
                  RECONCILATE
                </Button>
                <br /><br/>

                <MaterialTable

                  options={{
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    exportMenu: [{
                      label: 'Export PDF',
                      exportFunc: (cols, datas) => ExportPdf(cols, datas, 'ReconcilateProductData')
                    }, {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) => ExportCsv(cols, datas, 'ReconcilateProductData')
                    }]
                  }}
                  columns={[
                    {
                      field: 'lot_number',
                      title: 'Lot Number',
                    },
                    {
                      field: 'pname',//item_id
                      title: 'ProductName',
                    },
                    {
                      field: 'location_name', //location_id
                      title: 'Location',
                    },
                    {
                      field: 'name',
                      title: 'Name',
                    },
                    {
                      field: 'qty',
                      title: 'Quentity',
                    },
                    {
                      field: 'reason',
                      title: 'Reason',
                    },
                  ]}
                  data={
                    this.props.checkReconcilateProducts ? this.props.checkReconcilateProducts.slice(0, this.props.pageSize).map((r, i) => {
                      const { tableData, ...record } = r;
                      return { i, ...record }
                    }) : []

                  }
                  title="Reconcilate Products"
                /> */}
                </>}
              {this.state.open === true && (
           <NewStockReconcilateForm
             {...this.props}
              handleClose={this.handleClose}
           />
           
         )}
              <LocationAlert open={this.state.openAlert} onClose={ ()=> this.setState({openAlert:false})}/>
            </div>)
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    stockReconcilate: state.stockReconcilateReducer.stockReconcilate || [],
    reconcilateProducts: state.stockReconcilateReducer.reconcilateProducts || [],
    checkReconcilateProducts: state.stockReconcilateReducer.checkReconcilateProducts || [],
    searchReconcilateValue: state.stockReconcilateReducer.searchReconcilateValue || [],
    searchReconcilate_count: state.stockReconcilateReducer.searchReconcilate_count || 0,
    reconciliateDetails: state.stockReconcilateReducer.reconciliateDetails || {},
    
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    listStockReconcilateAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listStockReconcilateAction(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    listReconcilateProductsAction: () => {
        dispatch(listReconcilateProductsAction())
    },
    listCheckReconcilateProductsAction: (data, setModalTypeHandler, setLoaderStatusHandler) =>{
        return dispatch(listCheckReconcilateProductsAction(data, setModalTypeHandler, setLoaderStatusHandler))
    },
    MoveProducts: (data, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(MoveProducts(data, setModalTypeHandler, setLoaderStatusHandler))
  },
    // listStockReconcilateAction: () => {
    //     dispatch(listStockReconcilateAction())
    // }

    searchreconcilateAction: (val, setModalTypeHandler, setLoaderStatusHandler) =>{
      return dispatch(searchreconcilateAction(val, setModalTypeHandler, setLoaderStatusHandler))
  },

  set_searchreconcilateAction: (val ) => { 
       return dispatch(set_searchreconcilateAction(val));
  },
  stockReconcilatePaginationAction: (val ) => { 
       return dispatch(stockReconcilatePaginationAction(val));
  },
  reconciliateDetailsAction: (reconciliate_id) => { 
       return dispatch(reconciliateDetailsAction(reconciliate_id));
  }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StockReconcilate);

// import React, {useEffect, useContext, useRef, useState} from 'react';
// import Box from '@mui/material/Box';
// import Collapse from '@mui/material/Collapse';
// import IconButton from '@mui/material/IconButton';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';
// import Paper from '@mui/material/Paper';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import {useDispatch, useSelector} from 'react-redux';
// import {
//   listStockReconcilateAction,
//   listCheckReconcilateProductsAction,
//   listStockLotItemsAction,
// } from '../../redux/actions/stockReconcilate_actions';
// import context from '../../context/CreateNewButtonContext';
// import NoRecordFound from '../../components/Layout/NoRecordFound';
// import {Button, Card, CardContent, Grid, InputAdornment, TextField} from '@mui/material';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import MaterialTable from 'utils/SafeMaterialTable';
// import LotsPopover from './lotsPopup';
// import Link from '@mui/material/Link';
// import CreateNewButtonContext from '../../context/CreateNewButtonContext';
// import {Navigate, useNavigate} from 'react-router-dom';
// import NewStockReconcilate from './stockReconcilate';
// import SearchIcon from '@mui/icons-material/Search';
// import ClearIcon from '@mui/icons-material/Clear';
// import _ from 'lodash';


// function Row(props) {
//   const {
//     row,
//     stockReconcilate,
//     checkReconcilateProducts,
//     stockLotItems,
//     handleSubmit,
//   } = props;
//   const [open, setOpen] = React.useState(false);
//   const [disableButton, setDisableButton] = React.useState();
//   const [lotTable, setLotTable] = React.useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [stockLots, setStockLots] = useState([]);
//   const [checkReconcilateButton, setCheckReconcilateButton] =
//     React.useState(true);

//   const dispatch = useDispatch();
//   const {
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     commoncookie,
//     headerLocationId,
//   } = useContext(context);

//   // const handleSubmit = async (data) => {
//   //   //setNewPage(true)
//   //   navigate('/stockReconcilate/missedItems');
//   // };
//   // const handleSubmit = async (data) => {
//   //   await dispatch(
//   //     listCheckReconcilateProductsAction(
//   //       data,
//   //       setModalTypeHandler,
//   //       setLoaderStatusHandler,
//   //     ),
//   //   );
//   //   dispatch(
//   //     listStockReconcilateAction(
//   //       commoncookie,
//   //       headerLocationId,
//   //       setModalTypeHandler,
//   //       setLoaderStatusHandler,
//   //     ),
//   //   );
//   //   setOpen(true)
//   //   setDisableButton(true)
//   // }




//   return (
//     <React.Fragment>
//       <TableRow key={row.id} sx={{'& > *': {borderBottom: 'unset'}}}>
//         <TableCell>
//           <IconButton
//             aria-label='expand row'
//             size='small'
//             onClick={() => setOpen(!open)}
//             disabled={row.childData.length > 0 ? false : true}
//           >
//             {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </TableCell>
//         <TableCell component='th' scope='row'>
//           {row.username === null ? '-' : row.username}
//         </TableCell>
//         <TableCell>
//           {row.location_name === null ? '-' : row.location_name}
//         </TableCell>
//         <TableCell>
//           {/* <Link href="#" aria-describedby={id} onClick={handleClick}> */}
//           <IconButton
//             aria-label='expand row'
//             size='small'
//             onClick={(e) => {
//               setStockLots(row.lots);
//               setAnchorEl(e.currentTarget);
//               setLotTable(!open);
//             }}
//           >
//             <AssignmentIcon />
//           </IconButton>
//           {/* </Link> */}
//         </TableCell>
//         <TableCell>{row.createDate === null ? '-' : row.createDate}</TableCell>
//         <TableCell>{row.category === null ? '-' : row.category}</TableCell>
//         <TableCell>
//           <Button
//             onClick={() => handleSubmit()}
//             style={{}}
//             name='reconcilate'
//             variant='contained'
//             color='primary'
//             size='medium'
//             text='button'
//             fullWidth={false}
//             disabled={row.reconcilateStatus === 1 ? true : false}
//           >
//             RECONCILATE
//           </Button>
//         </TableCell>
//       </TableRow>

//       <TableRow>
//         <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
//           <Collapse in={open} timeout='auto' unmountOnExit>
//             <Box sx={{margin: 1}}>
//               <Typography variant='h6' gutterBottom component='div'>
//                 Reconcilate Products
//               </Typography>
//               <Table size='small' aria-label='purchases'>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Lot Number</TableCell>
//                     <TableCell>Product Name</TableCell>
//                     <TableCell>Location Name</TableCell>
//                     {/* <TableCell>Name</TableCell>
//                     <TableCell>Qty</TableCell>
//                     <TableCell>Reason</TableCell> */}
//                     <TableCell>Create Date</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {
//                     // row.chilData.length > 0 ?
//                     row.childData?.map((historyRow) => (
//                       <TableRow key={historyRow.id}>
//                         <TableCell>{historyRow.lot_number}</TableCell>
//                         <TableCell>{historyRow.product_name}</TableCell>
//                         <TableCell>{historyRow.location_name}</TableCell>
//                         {/* <TableCell >{historyRow.name}</TableCell>
//                           <TableCell >{historyRow.qty}</TableCell>
//                           <TableCell >{historyRow.reason}</TableCell> */}
//                         <TableCell>{historyRow.createDate}</TableCell>
//                       </TableRow>
//                     ))
//                     // :
//                     // <NoRecordFound />
//                   }
//                 </TableBody>
//               </Table>
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>

//       {lotTable && (
//         <LotsPopover
//           stockLotItems={stockLotItems}
//           open={lotTable}
//           anchorEl={anchorEl}
//           setAnchorEl={setAnchorEl}
//           setLotTable={setLotTable}
//           stockReconcilate={stockReconcilate}
//           stockLots={stockLots}
//         />
//       )}

//       {/* {
//         lotTable &&

//         <>
//           <Card sx={{ minWidth: '5vw', minHeight: '20vh' }}>

//             <CardContent>
//               <MaterialTable

//                 options={{
//                   showTitle: false,
//                   toolbar: false,
//                   pageSize: stockLotItems.length,
//                   exportButton: true,
//                 }}

//                 columns={[
//                   {
//                     title: 'Lot Number',
//                     field: 'lotNumber',
//                   },
//                 ]}
//                  data = {stockLotItems}
//                 // data={
//                 //   stockLotItems ? stockLotItems.map((r, i) => {
//                 //     const { tableData, ...record } = r;
//                 //     return { i, ...record }
//                 //   }) : []
//                 // }
//               />
//             </CardContent>
//           </Card>
//         </>
//       } */}
//     </React.Fragment>
//   );
// }

// export default function StockReconcilate() {
//   const dispatch = useDispatch();

//   const [newPage, setNewPage] = useState(false);
//   const [searchData, setSearchData] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const {
//     stockReconcilateReducer: {
//       stockReconcilate,
//       checkReconcilateProducts,
//       stockLotItems,
//     },
//   } = useSelector((state) => state);
//   const [PayData, setPayData] = React.useState({
//     paymentOpen: false,
//     itemsData: [],
//     Tdata: [],
//     getVendor: {},
//     paid_amount: 0,
//   });
//   const tempinitsform = useRef(null);

//   const {paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id} =
//     PayData;
//   const {
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     commoncookie,
//     headerLocationId,
//   } = useContext(context);

//   const initsform = () => {
//     dispatch(
//       listStockReconcilateAction(
//         commoncookie,
//         headerLocationId,
//         setModalTypeHandler,
//         setLoaderStatusHandler,
//       ),
//     );
//     // dispatch(listStockLotItemsAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
//   };

//   useEffect(() => {
//     setSearchData(_.uniqBy(stockReconcilate, 'id'));
// }, [stockReconcilate]);

//   tempinitsform.current = initsform;
//   // useEffect(() => {
//   //   tempinitsform.current();
//   // }, [])
//   useEffect(() => {
//     tempinitsform.current();
//   }, [headerLocationId]);

//   const handleSubmit = () => {
//     setNewPage(true);
//   };
//   const handleSearch = (value) => {
//     setSearchText(value);
//     filterData(value);
//   };

//   const filterData = (value) => {
//     const lowerCaseValue = value.toLowerCase().trim();
//     if (!lowerCaseValue) {
//       setSearchData(_.uniqBy(stockReconcilate, 'id'));
//     } else {
//       const filteredData = _.uniqBy(stockReconcilate, 'id').filter((item) => {
//         return Object.keys(item).some((key) => {
//           if(item[key] !== null || undefined){
//             return item[key].toString().toLowerCase().includes(lowerCaseValue);
//           }
//         });
//       });


//       // -------------
//       // This filter only lot number
//       const filterBasedOnLot = _.uniqBy(stockReconcilate, 'id').filter((item) => {
//         return Object.keys(item).some(key => {
//           if(key === 'lots'){
//             let lot = item[key];
//             let l3A = lot.filter(l3 => {
//               return l3.lotNumber.toString().toLowerCase().includes(lowerCaseValue);
//             })
//             if(l3A.length > 0){
//               return true
//             }
//           }
//       })
//       });

//       let temp = [...filteredData,...filterBasedOnLot]
//       const unique = [...new Map(temp.map(item => [item['id'], item])).values()];

//       // -------------

//       setSearchData(unique);
//     }
//   };

//   const cancelSearch = (e) => {
//     setSearchText('');
//     setSearchData(_.uniqBy(stockReconcilate, 'id'));
//   };

//   let location_id = stockReconcilate.map((l) => l.location_id);
//   let category = stockReconcilate.map((c) => c.category);


//   return (
//     <>
//       {newPage === false ? (
//         <CreateNewButtonContext.Consumer>
//           {({loaderStatus}) => (
//             <div>
//               <Grid
//                 container
//                 spacing={3}
//                 display='flex'
//                 alignItems='center'
//                 >

                
//                 <Grid size={{ xs: 12, sm: 6, md: 8, lg: 8 }}>
//                   <h2>Physical Stocks</h2>
//                 </Grid>
//                   <Grid size={{ xs: 10, sm: 4, md: 3, lg: 3 }}>
//                     <TextField
//                       autoFocus={searchData ? true : false}
//                       sx={{
//                         borderRadius: '8px',
//                         pr: '10px',
//                         '& .MuiOutlinedInput-root': {
//                           height: '42px',
//                         },
//                       }}
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position='start'>
//                             <SearchIcon />
//                           </InputAdornment>
//                         ),
//                         endAdornment: (
//                           <InputAdornment position='end'>
//                             <ClearIcon
//                               onClick={cancelSearch}
//                               sx={{ cursor: 'pointer' }}
//                             />
//                           </InputAdornment>
//                         ),
//                       }}
//                       placeholder='Search'
//                       value={searchText}
//                       onChange={(e) => handleSearch(e.target.value)}
//                     />
//                   </Grid>
//                 </Grid>


//               <TableContainer component={Paper}>
//                 <Table aria-label='collapsible table'>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell />
//                       <TableCell>User Name</TableCell>
//                       <TableCell>Location Name</TableCell>
//                       <TableCell>Lot Number</TableCell>
//                       <TableCell>Creation Date</TableCell>
//                       <TableCell>Category</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {/* {stockReconcilate.map((row) => (
//                       <Row
//                         key={row.id}
//                         row={row}
//                         stockReconcilate={stockReconcilate}
//                         checkReconcilateProducts={checkReconcilateProducts}
//                         stockLotItems={stockLotItems}
//                         handleSubmit={handleSubmit}
//                       /> //row={{...row,checkReconcilateProducts:[]}} index = {i}
//                     ))} */}
//                     {searchData?.map((row, i) => (
//                       <Row
//                       key={row.id}
//                       row={row}
//                       stockReconcilate={stockReconcilate}
//                       checkReconcilateProducts={checkReconcilateProducts}
//                       stockLotItems={stockLotItems}
//                       handleSubmit={handleSubmit}
//                       />
//                     ))}

//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               {/* {!stockReconcilate.length && <NoRecordFound />} */}
//               {!stockReconcilate.length && loaderStatus === false && (
//                 <NoRecordFound />
//               )}
//             </div>
//           )}
//         </CreateNewButtonContext.Consumer>
//       ) : (
//         <NewStockReconcilate
//           setNewPage={setNewPage}
//           newPage={newPage}
//           location_id={location_id}
//           category={category}
//           stockReconcilate={stockReconcilate}
//         />
//       )}
//     </>
//   );
// }

