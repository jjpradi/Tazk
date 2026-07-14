import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTablePagination, MTableToolbar} from 'utils/SafeMaterialTable';
import NewTransaction from '../../../components/NewTransaction';
import {
  listTransactionAction,
  updateTransactionAction,
  getbyidTransactionAction,
  deleteTransactionAction,
  createTransactionAction,
  listTransactionByPaginationAction,
  ExportListACTION,
  setSearchTransactionAction,
  getSearchTransactionsAction,
  transactionSearchPagination
} from '../../../redux/actions/transaction_actions';
import AlertDialog from '../../common/Dialog';
import {listChartOfAccountsdataAction, listJournalAccount} from '../../../redux/actions/chartOfAccounts';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {TextField, InputAdornment, Typography, TablePagination} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {getDateTime} from '../../../utils/getTimeFormat';
import FilterTransaction from './filterTransaction';
import moment from 'moment';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


class Transaction extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      pageSize: pageSize,
      page: 0,
      id: '',
      searchData: [],
      searchVal: '',
      searchPageData: [],
      filteredValue: {
        from: this.firstDay,
        to: this.lastDay,
      },
      filterOpen: false,
      isApiFinished: false,
      openAlert: false
    };
  } 
  
  storage = getsessionStorage()



  async componentDidMount() {
    const selectedRole = this.storage?.role_name;
    this.props.setSearchTransactionAction({data:[], numRows:0})
    const context = this.context;
    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString : '',
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.transactionSearchPagination(data),
      this.props.getMenuAccessAction(selectedRole)
      // this.props.listJournalAccount(),
      // this.props.getUserRightsByRoleIdAction()
      // this.props.listTransactionByPaginationAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   {
      //     pageCount: 0,
      //     numPerPage:  pageSize,
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
      // this.props.listTransactionAction(),
      // !this.props.chartOfAccounts.length && this.props.listChartOfAccountsdataAction(),
	  ).finally(() => this.setState({isApiFinished: true}));

    // await this.props.listTaxCategoryAction()
    // await this.props.listProductCategoryAction()
    // await this.props.listVendorAction()
    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  async componentDidUpdate(preProps, preState) { 
    const context = this.context;
    if (preState.pageSize !== this.state.pageSize) { 
      const data = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString : this.state.searchVal,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      }
      

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.transactionSearchPagination(data),
      )
    }
    if (preState.page !== this.state.page) { 
      const data = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString : this.state.searchVal,
        from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
        to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
      }
      
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.transactionSearchPagination(data),
      )
    }

  }

  handleEdit = async (id) => {
    const context = this.context;
    await this.props.getbyidTransactionAction(id, context.setModalTypeHandler,context.setLoaderStatusHandler);
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    await this.props.deleteTransactionAction(
      id,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.sample,
    );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('transaction', true);
    }
    await this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('transaction', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };

  sample = async (value) => {
    const context = this.context;
    const data = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString : this.state.searchVal,
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.transactionSearchPagination(data),
    )
    // await this.props.listTransactionByPaginationAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   {
    //     pageCount: 0,
    //     numPerPage:  pageSize,
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
    // );
    // await this.props.listTransactionAction();
    this.setState({open: value});
  };

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size})
  };
  handlePageChange = async (page) => {
    this.setState({page: page});
  };

  handleSubmit = async (data) => {
    const context = this.context;

    // const values = data
    // for (let val in values) {
    //   if(val==='is_serialized'){
    //   values[val]=values[val]===true ? 1 : 0
    // }
    // }
    // const {accountBalance,amount,code,...record} = values
    // if (data && context.headerLocationId !== 'null') {
      if (data.id && context.headerLocationId !== 'null') {
        data.location_id = context.headerLocationId

        await this.props.updateTransactionAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        ); //, record
        // await this.setState({ open: false })
      } else if (data && context.headerLocationId !== 'null') {
        
        data.location_id = context.headerLocationId
        // await this.props.createProductAction(values, this.responseDialog)
        // await this.setState({ open: false })
        // if(this.props.setModalStatusHandler)
        // this.props.setModalStatusHandler(false)
        // await this.props.createProductAction(values, this.responseDialog)
        // await this.setState({ open: false })
        
        await this.props.createTransactionAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (value) => {
            const context = this.context;
            const data = {
              pageCount: 0,
              numPerPage: this.state.pageSize,
              searchString : this.state.searchVal,
              from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
              to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
            }
            apiCalls(
              context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              this.props.transactionSearchPagination(data),
            )
            this.setState({open: value});
          }
        );
      }else{
        this.setState({openAlert: true})
      }
  };
  handleDeactive = async (data, status) => {
    const active = {is_active: status};
    if (data.id) {
      await this.props.updateTransactionAction(data.id, active);
      await this.setState({open: false});
    }
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  // requestSearch = (e) => {
  //   let val = e;
  //   this.setState({searchVal: val});
  //   const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
  //   const filteredRows = this.props.transaction.filter((row) => {
  //     return Object.keys(row).some((field) => {
  //       return searchRegex.test(row[field]);
  //     });
  //   });
  //   this.setState({searchData: filteredRows, searchPageData: filteredRows});
  //   this.setState({page: 0});
  // };

  // cancelSearch = (e) => {
  //   this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
  // };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    this.props.setSearchTransactionAction({ data: [], numRows: 0 })
    const data = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString : '',
      from: moment(this.state.filteredValue.from,'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format( 'yyyy-MM-DD',),
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.transactionSearchPagination(data),
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page:0});

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0){
      this.props.setSearchTransactionAction({data:[], numRows:0})
    }
    // }
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: val,
      from: moment( this.state.filteredValue.from, 'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD',),
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.getSearchTransactionsAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };
  handleFilter = (data) => this.setState({filterOpen: data});

  handleChange = (e) => {
    const {value, name} = e.target;
    this.setState({
      filteredValue: {...this.state.filteredValue, [name]: value},
    });
  };
  ApplyButton = () => {
    this.setState({searchVal: ''});
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: "",
      from: moment( this.state.filteredValue.from, 'year','month','day',).format('yyyy-MM-DD'),
      to: moment(this.state.filteredValue.to, 'year', 'month', 'day').format('yyyy-MM-DD',),
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.transactionSearchPagination(body),
    )

    // this.props.listTransactionByPaginationAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   {
    //     pageCount: 0,
    //     numPerPage:  pageSize,
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
    // );
    this.setState({filterOpen: false, page:0});
  };
  clearButton = () => {

    const context = this.context;
    const data = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString : '',
      from: this.firstDay, 
      to: this.lastDay
    }

    this.props.transactionSearchPagination(data)
    this.setState({filteredValue: {from: this.firstDay, to: this.lastDay}});
    this.setState({filterOpen: false, page:0});
  };
  render() {

        
    let storage = getsessionStorage();
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
    // const { user_rights } = this.props;
    const AddRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__journal_entry', 'can_create')
    const EditRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__journal_entry', 'can_edit')
    const DeleteRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__journal_entry', 'can_delete')
    const exportRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__journal_entry', 'can_export')

    const pageSize = this.props.search_transaction?.length > 0 ? 20 : 10;
        const pageSizeOptions = this.props.search_transaction?.length > 0 
        ? [20, 50, 100] 
        : []; 

    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Journal Entry </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen, setLoaderStatusHandler}) => (
            <div
              // style={{
              //   width: drawerOpen
              //     ? 'calc(100vw - 325px)'
              //     : 'calc(100vw - 143px)',
              // }}
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              ></AlertDialog>
              {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
            {this.state.dialog.msg}
          </Alert>
        </Snackbar> */}
              {this.state.open === false && (
                <MaterialTable
                style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
                  // totalCount={
                  //   this.state.searchVal
                  //     ? this.state.searchPageData.length
                  //     : this.props.transaction_count || 0
                  // }
                  totalCount={this.props.search_transaction_count}
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
                      </>
                    ),
                     Pagination: (props) => (
                                <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  }}>
                                    <MTablePagination
                                    {...props}
                                    count={this.props.search_transaction_count} 
                                    page={this.state.page}
                                    onPageChange={(event, page) => this.handlePageChange(page)}
                                    onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                                    </div>),
                  }}
                  actions={[
                    EditRights ? {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) => this.handleEdit(rowData.id),
                    } : null,
                    DeleteRights ? {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handledialog(rowData.id),
                    } : null,
                    AddRights ? {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({open: true, status: 'create'}),
                    }:null,
                    {
                      icon: () => (
                        <div style={{display: 'flex'}}>
                          <FilterTransaction
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
                        </div>
                      ),
                      tooltip: 'Filter',
                      isFreeAction: true,
                    },
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) =>this.handlePageSizeChange(size)}
                  options={getStickyTableOptions({
                     headerStyle,
                     bodyOffset: 200,
                    cellStyle,
                    options:{
                       showEmptyDataSourceMessage: this.state.isApiFinished,
                    search: false,
                    exportButton: true,
                    filtering: false,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                     pageSize: pageSize,
                     pageSizeOptions: pageSizeOptions,
                    totalCount: this.props.transaction_count,
                    actionsColumnIndex: -1,
                     tableLayout: "auto",
                     toolbar: true,
                    exportMenu: exportRights ? [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                        {
                        this.props.ExportListACTION(
                         
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                           moment(

                            this.state.filteredValue.from,
                  
                            'year',
                  
                            'month',
                  
                            'day',
                  
                          ).format('yyyy-MM-DD'),
                  
                          moment(this.state.filteredValue.to, 'year', 'month', 'day').format(
                  
                            'yyyy-MM-DD',
                  
                          ),
                        
                        (exportData) => {
                          ExportPdf(
                            cols,
                            exportData,
                            'TransactionData',
                          );
                        },
                      );
                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                        {
                          this.props.ExportListACTION(
                           
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                             moment(
  
                              this.state.filteredValue.from,
                    
                              'year',
                    
                              'month',
                    
                              'day',
                    
                            ).format('yyyy-MM-DD'),
                    
                            moment(this.state.filteredValue.to, 'year', 'month', 'day').format(
                    
                              'yyyy-MM-DD',
                    
                            ),
                          
                          (exportData) => {
                            ExportCsv(
                              cols,
                              exportData,
                              'TransactionData',
                            );
                          },
                        );
                          }
                      },
                    ]: [],
                    }
                  })}
                  page={this.state.page}
                  // columns={filteredCol}
                  columns={[
                    // {
                    //   field:'code',
                    //   title:'Code',
                    // },
                    {
                      field: 'voucher_name',
                      title: 'Voucher name',
                    },
                    {
                      field: 'id',
                      title: 'Voucher Type',
                    },
                    {
                      field: 'transactionDateConverted',
                      title: 'Transaction Date',
                    },
                    {
                      field: 'note',
                      title: 'Note',
                    },
                    {
                      field: 'accountTransaction',
                      title: 'Credit',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                      render: (rowData) => {
                        let total = 0
                        rowData.accountTransaction?.map((data) => {
                          total += Number(data.credit || 0)
                        })
                        return total
                      }
                    },
                    {
                      field: 'accountTransaction',
                      title: 'Debit',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                      render: (rowData) => {
                        let total = 0
                        rowData.accountTransaction?.map((data) => {
                          total += Number(data.debit || 0)
                        })
                        return total
                      }
                    },
                    // {
                    //   field: 'specialNumber',
                    //   title: 'Special Number',
                    // },
                    // {
                    //   field:'entity',
                    //   title:'Entity',
                    // },
                    // {
                    //   field:'status',
                    //   title:'Status',
                    // },
                    // {
                    //   field: 'creationDateConverted',
                    //   title: 'Creation Date',
                    // },
                  ]}
                  // data={
                  //   (this.props.search_transaction.length > 0 || this.state.searchVal.length > 0) ?
                  //     this.props.search_transaction
                  //     :
                  //     this.props.transaction_by_pagination
                  // }
                  data={this.props.search_transaction}
                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Journals</Typography>}
                />
              )}
              {this.state.open === true && (
                <NewTransaction
                  edit_id_data={this.props.transaction_id_data}
                  status={this.state.status}
                  type='transaction'
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  handleDelete={this.handleDelete}
                  handleDeactive={this.handleDeactive}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                />
              )}
              <LocationAlert open={this.state.openAlert} onClose={ ()=> this.setState({openAlert:false})}/>
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    transaction: state.transactionReducer.transaction,
    transaction_by_pagination:
      state.transactionReducer.transaction_by_pagination,
    transaction_id_data: state.transactionReducer.transaction_id_data,
    transaction_count: state.transactionReducer.transaction_count,
    chartOfAccounts: state.ChartOfAccountsReducer.journalaccount,
    search_transaction : state.transactionReducer.search_transaction,
    search_transaction_count : state.transactionReducer.search_transaction_count,
     menuAccess: state.rbacReducer.menuAccess || []
    // user_rights : state.roleReducer.user_rights
    // productcategory: state.productCategoryReducer.productcategory,
    // taxcategory: state.taxCategoryReducer.taxcategory,
    // vendor:state.vendorReducer.vendor
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTransactionAction: () => {
      return dispatch(listTransactionAction());
    },
    ExportListACTION: (setModalTypeHandler, setLoaderStatusHandler, from, to, exportDataCallBack) => {
      dispatch(ExportListACTION(setModalTypeHandler, setLoaderStatusHandler, from, to, exportDataCallBack));
    },
    listTransactionByPaginationAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
    ) => {
      return dispatch(
        listTransactionByPaginationAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
        ),
      );
    },
    listChartOfAccountsdataAction: () => {
      return dispatch(listChartOfAccountsdataAction());
    },
    createTransactionAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        createTransactionAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidTransactionAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(getbyidTransactionAction(id, setModalTypeHandler, setLoaderStatusHandler));
    },

    setSearchTransactionAction: (val ) => { return dispatch(setSearchTransactionAction(val))
    },
    getSearchTransactionsAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchTransactionsAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },



    updateTransactionAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        updateTransactionAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteTransactionAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        deleteTransactionAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    // listProductCategoryAction: () => {
    //   dispatch(listProductCategoryAction())
    // },
    // listCustomerAction: () => {
    //   dispatch(listCustomerAction())
    // },
    // listTaxCategoryAction: () => {
    //   dispatch(listTaxCategoryAction())
    // },
    transactionSearchPagination: (data) => {
      return dispatch(transactionSearchPagination(data))
    },
    listJournalAccount: () => {
      return dispatch(listJournalAccount())
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
    },
    getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);

