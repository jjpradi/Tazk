import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewBankCreation from '../../../components/BankCreation';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listBankCreationAction,
  createBankCreationAction,
  updateBankCreationAction,
  deleteBankCreationAction,
  listBankCreationByPaginationAction,
  set_searchBankAction,
  get_searchBankAction,
  backCreationPaginationAction,
} from '../../../redux/actions/bankCreation_actions';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {TextField, InputAdornment, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { maxBodyHeight, maxHeight, pageSize } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import {Helmet} from "react-helmet-async";
import {headerStyle,cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class BankCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      page: 0,
      count: 0,
      id: '',
      searchData: [],
      searchVal: '',
      searchPageData: [],
      pageSize: 20,
      isApiFinished: false,
      pageType: '',
      status:'New',
      headerupdate : null
    };
  }

  async componentDidMount() {
    this.props.set_searchBankAction({data:[], numRows:0});
    const context = this.context;
    let storage = getsessionStorage()
    const selectedRole = storage.role_name
    this.setState({
      headerupdate: context.headerLocationId
    })
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
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.backCreationPaginationAction(body)
          ),
      // this.props.getUserRightsByRoleIdAction()
      this.props.getMenuAccessAction(selectedRole),
      // this.props.listBankCreationAction(),

    ).finally(() => this.setState({isApiFinished: true}));
    if (this.props.setModalStatusHandler) this.setState({open: true});
    if(this.props.pageType === 'detailpage') this.setState({open : true})
    // if(!this.props.stocklocation.lengrh){
    //   this.props.listStockLocationAction(context.commoncookie,context.headerLocationId)
    // }
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    
   if (headerLocationId !== this.headerupdate) {
    this.headerupdate = headerLocationId;
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
            this.props.backCreationPaginationAction(body)
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
            this.props.backCreationPaginationAction(body)
          )
        
    }

    //page 
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
          this.props.backCreationPaginationAction(body)
        )
      
    }
  }

  handlePageSizeChange = async (size) => {
    // const context = this.context;
    // if (this.state.searchVal) {
      this.setState({ pageSize: size });

    //   const body = {
    //     pageCount: this.state.page,
    //     numPerPage: size,
    //     searchString: this.state.searchVal,
    //     employeeId: context.commoncookie,
    //     headerLocationId: context.headerLocationId
    //   }
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.backCreationPaginationAction(body)
    //   )
    // } else {
    //   this.setState({ pageSize: size })

    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.listBankCreationByPaginationAction(
    //       context.setModalTypeHandler,
    //       context.setLoaderStatusHandler,
    //       { pageCount: this.state.page || 0, numPerPage: size },
    //     )
    //   );
    // }
  };

  handlePageChange = async (page) => {
    // const context = this.context;
    // if (this.state.searchVal) {
      this.setState({page: page});
    //   const body = {
    //     pageCount: page,
    //     numPerPage: this.state.pageSize,
    //     searchString: this.state.searchVal,
    //     employeeId: context.commoncookie,
    //     headerLocationId: context.headerLocationId
    //   }
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.backCreationPaginationAction(body)
    //   )
    // } else {
    //   this.setState({page: page});
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.listBankCreationByPaginationAction(
    //       context.setModalTypeHandler,
    //       context.setLoaderStatusHandler,
    //       {pageCount: page || 0, numPerPage:  pageSize},
    //     )
    //   );
    // }
  };

  handleEdit = async (id, data) => {
    // if (_.isEmpty(id)) {
      // let getId = await this.props.bank_creation_list_by_pagination
      //   .map((m) => {
      //     return m.id === id ? m : null;
      //   })
      //   .filter((f) => f !== null);
     
      await this.setState({edit_id_data: data , open: true, pageType: 'EDIT', status : 'edit'});
    // }
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteBankCreationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        async (res) => {
          if (res) {
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
                this.props.backCreationPaginationAction(body)
              )
           
          }
        },
      )
      
	  );

    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('bank_creation_list', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };

  responseDialog = async (res) => {
    const context = this.context;
    if (res === true) {
      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.listBankCreationByPaginationAction(
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //     {pageCount: 0, numPerPage:  pageSize},
      //   ),
      //   this.props.listBankCreationAction(),
        
      // );

      if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('bank_creation_list', true);
      }
    }
    this.setState({open: false});
    // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  };

  handleSubmit = async (data) => {
    const context = this.context;
    let formDatas ={
      bankName : data.bankName,
      branchName : data.branchName,
      ifsc_code : data.ifsc_code,
      address    : data.address,
      accountNumber : data.accountNumber,
      location_id : data.location_id,
      credit : data.credit,
      debit : data.debit,
      trans_date : data.trans_date,
      opening_balance: !data.debit ? parseFloat(data.credit) * -1 : parseFloat(data.debit) * +1
    }
    this.setState({ page: data.bankAccountId ? this.state.page : 0 })
    if(this.props.pageType === 'detailpage') {
    if (this.props.searchBankData?.length > 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateBankCreationAction(
          data.bankAccountId,
          formDatas,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (res) => {

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
                this.props.backCreationPaginationAction(body)
              )
            
            this.responseDialog(res)
          }
        )
        );
        
    } else {
      
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createBankCreationAction(
          formDatas,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (res) => {
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
                this.props.backCreationPaginationAction(body)
              )
            
            this.responseDialog(res)
          }
        )
      );
    } }
    else {
    if (data.bankAccountId) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateBankCreationAction(
          data.bankAccountId,
          formDatas,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (res) => {

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
                this.props.backCreationPaginationAction(body)
              )
            
            this.responseDialog(res)
          }
        )
        );
        
    } else {
      
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createBankCreationAction(
          formDatas,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          (res) => {
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
                this.props.backCreationPaginationAction(body)
              )
           
            this.responseDialog(res)
          }
        )
      );
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
  //   const filteredRows = this.props.bank_creation_list.filter((row) => {
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

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page : 0 });

    // if(val.trim() !== ''){
    this.props.set_searchBankAction({ data: [], numRows: 0 })
    // }
    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.props.get_searchBankAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_searchBankAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.backCreationPaginationAction(body)
    );
  };

  render() {
        let storage = getsessionStorage()
        const selectedRole = storage.role_name
        const bankCreate = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'settings__cash_box', 'can_create')
        const bankEdit = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'settings__cash_box', 'can_edit')
        const bankDelete = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'settings__cash_box', 'can_edit')
        const bankExport = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'settings__cash_box', 'can_export')
        
    return (
      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Bank Creation </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              {this.state.open === false && (
                <MaterialTable
                style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
                  totalCount={this.props.searchBankCount}
                  components={{
                    Toolbar: (props) => (
                      <>
                        {/* <div
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
                              onChange={(e) =>
                                this.requestSearch(e.target.value)
                              }
                            />
                          </div>
                        </div> */}
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <div style={{ width: '100%' }} >
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
                  }}
                  actions={[
                    bankEdit ? {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) => this.handleEdit(rowData.id, rowData),
                    } : null,
                    bankDelete ? {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handledialog(rowData.bankAccountId),
                    } : null,
                    bankCreate ? {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({edit_id_data: [], open: true, isApiFinished: false, pageType: "CREATE"}),
                    } : null,
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) =>
                    this.handlePageSizeChange(size)
                  }
                  options={{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                   headerStyle,
                   cellStyle,      
                    search: false,
                    exportButton: bankExport ? true : false,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    pageSize: pageSize,
                    pageSizeOptions: [20, 50, 100],
                    totalCount:
                      this.state.searchVal ? this.props.searchBankCount : this.props.bankcreation_count,
                    exportMenu: bankExport ? [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                        {
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.listBankCreationAction(  
                              setModalTypeHandler, setLoaderStatusHandler,               
                            (exportData) => {
                              ExportPdf(
                                cols,
                                exportData,
                                'BankCreation',
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
                            this.props.listBankCreationAction(  
                              setModalTypeHandler, setLoaderStatusHandler,               
                            (exportData) => {
                              ExportCsv(
                                cols,
                                exportData,
                                'BankCreation',
                              );
                            },
                          ),
                            
                          );
                        }
                      },
                    ] : [],
                  }}
                  page={this.state.page}
                  columns={[
                    {title: 'Bank Name', field: 'bankName'},
                    {title: 'Account Number', field: 'accountNumber'},
                    {title: 'IFSC Code', field: 'ifsc_code'},
                    {title: 'Branch', field: 'branchName'},
                    {title: 'Address', field: 'address'},
                    {
                      field: 'location_names',
                      title: 'Location Name',
                      // render: (rowData) => (
                      //   <div>
                      //     {rowData?.Locations_name.map((d) => d.location_name)
                      //       .join(', ')}
                      //   </div>
                      // ),
                    },
                    // { title: 'Account Type', field: 'accountType' },
                    // { title: 'Bank Name', field: 'bankName' },
                  ]}

                  // data={
                  //   this.state.searchVal
                  //     ? this.state.searchData
                  //     : this.props.bank_creation_list_by_pagination
                  //     ? this.props.bank_creation_list_by_pagination
                  //     : []
                  // }

                  data = {this.props.searchBankData}

                  title={<Typography variant='h6'>Bank Creation</Typography>}
                />
              )}
              {this.state.open && (
                <NewBankCreation
                  edit_id_data={this.state.edit_id_data}
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  status = {this.state.status}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  pageType={this.props.pageType === "detailpage" ? this.props.pageType : this.state.pageType}
                />
              )}
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    bank_creation_list: state.bankCreationReducer.bank_creation_list || [],
    bank_creation_list_by_pagination:
      state.bankCreationReducer.bank_creation_list_by_pagination || [],
    bankcreation_count: state.bankCreationReducer.bankcreation_count,
    stocklocation: state.stockLocationReducer.stocklocation || [],
    searchBankData:state.bankCreationReducer.searchBankData,
    searchBankCount: state.bankCreationReducer.searchBankCount,
    // user_rights : state.roleReducer.user_rights,
    menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listBankCreationAction: (setModalTypeHandler, setLoaderStatusHandler,exportCallBack) => {
      return dispatch(listBankCreationAction(setModalTypeHandler, setLoaderStatusHandler,exportCallBack));
    },
    listBankCreationByPaginationAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
    ) => {
      return dispatch(
        listBankCreationByPaginationAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
        ),
      );
    },
    createBankCreationAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        createBankCreationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    updateBankCreationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        updateBankCreationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    deleteBankCreationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        deleteBankCreationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    listStockLocationAction: (commoncookie, headerLocationId) => {
      dispatch(listStockLocationAction(commoncookie, headerLocationId));
    },
    set_searchBankAction: (val ) => { 
      return dispatch(set_searchBankAction(val));
    },
    getMenuAccessAction:(selectedRole)=>{
      dispatch(getMenuAccessAction(selectedRole))
    },
    get_searchBankAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchBankAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    backCreationPaginationAction: (data) => { 
      return dispatch(backCreationPaginationAction(data));
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BankCreation);

