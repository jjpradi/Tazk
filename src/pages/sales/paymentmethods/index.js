import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import NewPaymentMethod from '../../../components/NewPaymentMethod';
import {
  listPaymentMethodAction,
  updatePaymentMethodAction,
  getbyidPaymentMethodAction,
  deletePaymentMethodAction,
  createPaymentMethodAction,
  listPaymentTypeDetails,
  set_searchPaymentMethodAction,
  get_searchPaymentMethodAction,
  paymentMethodPaginationAction,
} from '../../../redux/actions/payment_method_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listBankCreationAction,
  createBankCreationAction,
} from '../../../redux/actions/bankCreation_actions';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
class PaymentMethod extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      payment_method_data: [],
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      pageData: [],
      currentPage:0,
      searchVal: '',
      searchPageData: [],
      count: 0,
      page: 0,
      pageSize: 20,
      isApiFinished: false
    };
  }

  // async componentDidMount() {
  //   this.props.set_searchPaymentMethodAction({data:[], numRows:0});
  //   const context = this.context;
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.listPaymentMethodAction(
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler,
  //     ),
  //     this.props.listBankCreationAction(),
  //     this.props.listPaymentTypeDetails(),
      
  //   );
  //   this.setState({payment_method_data: this.props.paymentMethod});
  //   if (this.props.setModalStatusHandler) this.setState({open: true});
  // }

  async componentDidMount() {
    if(this.props.pageType === 'detailpage') this.setState({open : true})
    this.props.set_searchPaymentMethodAction({data:[], numRows:0})
    const context = this.context;

    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:'',
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paymentMethodPaginationAction(body),
      this.props.getUserRightsByRoleIdAction()
    ).finally(() => this.setState({isApiFinished: true}))
  }

  headerUpdate = 'null';
  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerUpdate) {
      this.headerUpdate = headerLocationId;
      //............................................................
      this.props.set_searchPaymentMethodAction({ data: [], numRows: 0 })

      const body = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paymentMethodPaginationAction(body)
      )
    }

    // page size
    if (prevState.pageSize !== this.state.pageSize) {

      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paymentMethodPaginationAction(body)
      )
    }

    // page
    if (prevState.page !== this.state.page) {

      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.paymentMethodPaginationAction(body)
      )
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
  }

  handlePageChange = async (page) => {
    this.setState({ page: page })
  }

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidPaymentMethodAction(id)
	  );
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deletePaymentMethodAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    ).then(res => {
      this.props.paymentMethodPaginationAction(body)
    });
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('paymentMethod', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('paymentMethod', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    this.setState({page : data.paymentId? this.state.page : 0})
    const body = {
      pageCount: data.paymentId ? this.state.page : 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    if (this.props.pageType === 'detailpage') {
      // if (this.props.search_paymentmethod_data?.length > 0) {
      //   apiCalls(
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //     this.props.updatePaymentMethodAction(
      //       this.props.search_paymentmethod_data[0]?.paymentId,
      //       data,
      //       context.setModalTypeHandler,
      //       context.setLoaderStatusHandler,
      //       this.sample,
      //       this.props.setModalStatusHandler,
      //       this.props.setselectData,
      //     ),
      //   ).then(res => {
      //     this.props.paymentMethodPaginationAction(body)
      //   });
      // } 
      // else {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          await this.props.createPaymentMethodAction(
            data,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.sample,
          ),
        ).then(res => {
          this.props.paymentMethodPaginationAction(body)
        });
      // }
    } else {
      if (data.paymentId) {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.updatePaymentMethodAction(
            data.paymentId,
            data,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.sample,
            this.props.setModalStatusHandler,
            this.props.setselectData,
          ),
        ).then(res => {
          this.props.paymentMethodPaginationAction(body)
        });
      } else {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          await this.props.createPaymentMethodAction(
            data,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.sample,
          ),
        ).then(res => {
          this.props.paymentMethodPaginationAction(body)
        });
      }
    }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_searchPaymentMethodAction({ data: [], numRows: 0 })
    
    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.paymentMethodPaginationAction(body)
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});

    this.props.set_searchPaymentMethodAction({ data: [], numRows: 0 })
    
    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString:val,
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.get_searchPaymentMethodAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
    )
  };

  render() {
  let storage = getsessionStorage()
        const { user_rights } = this.props;
        const AddRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'AddPaymentMethods') : true;
        const EditRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'EditPaymentMethods') : true;
        const DeleteRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'DeletePaymentMethods') : true;
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Payment Methods </title>
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
              />
              {this.state.open === false && (
                <MaterialTable
                style={{height: 'calc(100vh - 80px)'}}
                totalCount={this.props.search_paymentmethod_count || 0}
                components= {{
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
                    </div>
                  ),
                }}
                  // key={data.length}
                  actions={[
                    rowData => ({
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      disabled: rowData.paymentName === 'Cash',
                      onClick: (event, rowData) => {
                        this.handleEdit(rowData.paymentId);
                      }
                    }),
                    
                    rowData => ({
                      icon: 'delete',
                      tooltip: 'Delete',
                      disabled: rowData.paymentName === 'Cash',
                      onClick: (event, rowData) => {
                        if (rowData.paymentName === 'Cash') return; 
                        this.handledialog(rowData.paymentId);
                      }
                    }),

                   {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({
                          edit_id_data: [],
                          open: true,
                          status: 'create',
                          isApiFinished: false
                        }),
                    },
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                  options={{
                    // fixedColumns: {
                    //   left: 2,
                    //   right: 0
                    // },
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    search:false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    pageSize: this.state.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.props.search_paymentmethod_count,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                        {
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.listPaymentMethodAction(  
                              setModalTypeHandler, setLoaderStatusHandler,               
                            (exportData) => {
                              ExportPdf(
                                cols,
                                exportData,
                                'PaymentMethodData',
                              );
                            },
                          )
                          );
                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                        {
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.listPaymentMethodAction(  
                              setModalTypeHandler, setLoaderStatusHandler,               
                            (exportData) => {
                              ExportCsv(
                                cols,
                                exportData,
                                'PaymentMethodData',
                              );
                            },
                          )
                          );
                        }
                      },
                    ],
                  }}
                  // columns={
                  //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
                  //     Object.keys(t).map((o) => { return { title: o, field: o }
                  //   }))[0] : []
                  // }
                  // columns={filteredCol}
                  page={this.state.page}
                  columns={[
                    {
                      field: 'paymentName',
                      title: 'Payment Name',
                    },
                    {
                      field: 'paymentType',
                      title: 'Payment Type',
                    },

                    {
                      field: 'shortCode',
                      title: 'Short Code',
                    },
                    {
                      field: 'bankName',
                      title: 'Bank Name',
                    },
                    // {
                    //   field:'accountNumber',
                    //   title:'Account Number',
                    // },
                    // {
                    //   field:'accountType',
                    //   title:'Account Type',
                    // },
                  ]}
                  // components={{
                  //   Row: props => <MTableBodyRow id="1" {...props} />
                  //  }}
                  // data={
                  //   this.props.search_paymentmethod_data.length > 0 || this.state.searchVal.length > 0 ? this.props.search_paymentmethod_data :
                  //   this.props.paymentMethod
                  //     ? this.props.paymentMethod
                  //         .slice(0, this.props.pageSize)
                  //         .map((r, i) => {
                  //           const {tableData, ...record} = r;
                  //           return {i, ...record};
                  //         })
                  //     : []
                  // }

                  data= {this.props.search_paymentmethod_data}
                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Payment Methods</Typography>}
                />
              )}
              {this.state.open && (
                <NewPaymentMethod
                  status={this.state.status}
                  {...this.props}
                  edit_id_data={this.props.paymentMethod_id_data}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  type='paymentMethod'
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                />
              )}
              {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} onClose={this.handleClose} anchorOrigin = {{ vertical: 'top', horizontal: 'right' }} >setModalStatusHandler={setModalStatusHandler} setModalTypeHandler={setModalTypeHandler} 
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
       </Snackbar> */}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    paymentMethod: state.paymentMethodReducer.paymentMethod || [],
    paymentMethod_id_data:
      state.paymentMethodReducer.paymentMethod_id_data || [],
    bank_creation_list: state.bankCreationReducer.bank_creation_list || [],
    list_payment_type: state.paymentMethodReducer.list_payment_type || [],
    search_paymentmethod_data: state.paymentMethodReducer.search_paymentmethod_data || [],
    search_paymentmethod_count: state.paymentMethodReducer.search_paymentmethod_count || [],
    user_rights : state.roleReducer.user_rights
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listPaymentMethodAction: (setModalTypeHandler, setLoaderStatusHandler, exportCallBack) => {
      return dispatch(
        listPaymentMethodAction(setModalTypeHandler, setLoaderStatusHandler, exportCallBack),
      );
    },
    listPaymentTypeDetails: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentTypeDetails(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listBankCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listBankCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    createPaymentMethodAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        createPaymentMethodAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidPaymentMethodAction: (id) => {
      return dispatch(getbyidPaymentMethodAction(id));
    },
    updatePaymentMethodAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updatePaymentMethodAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deletePaymentMethodAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deletePaymentMethodAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    set_searchPaymentMethodAction: (val ) => { return dispatch(set_searchPaymentMethodAction(val))
    },
    get_searchPaymentMethodAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchPaymentMethodAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    paymentMethodPaginationAction: (data) => { 
      return dispatch(paymentMethodPaginationAction(data));
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaymentMethod);

