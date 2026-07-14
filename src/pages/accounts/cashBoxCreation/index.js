import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewCashBox from '../../../components/NewCashBox';
import {
  listCashBoxAction,
  createCashBoxAction,
  updateCashBoxAction,
  deleteCashBoxAction,
  set_searchCashBoxAction,
  get_searchCashBoxAction,
  cashBoxPaginationAction,
} from '../../../redux/actions/cash_box_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
class CashBoxCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      headerupdate : null,
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      ledger_id :'',
      status:'',
      currentPage: 0,
      searchVal: '',
      count: 0,
      page: 0,
      pageSize: 20,
      isApiFinished: false
    };
  }

  async componentDidMount() {
    if(this.props.pageType === 'detailpage') this.setState({open : true})    
    this.props.set_searchCashBoxAction({data:[], numRows:0})
    const context = this.context;

      this.setState({
      headerupdate: context.headerLocationId
    })

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
      this.props.cashBoxPaginationAction(body),
      this.props.getUserRightsByRoleIdAction()
    ).finally(() => this.setState({isApiFinished: true}));
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listCashBoxAction(
    //     context.headerLocationId,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
	  // );
    if (this.props.setModalStatusHandler) this.setState({open: true});

    if(!this.props.stocklocation.length){
      this.props.listStockLocationAction(context.commoncookie,context.headerLocationId)
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;
//............................................................
      this.props.set_searchCashBoxAction({ data: [], numRows: 0 })

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
        this.props.cashBoxPaginationAction(body)
      );

      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   await this.props.listCashBoxAction(
      //     context.headerLocationId,
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //   ),

      // );
    }

    // page size
    if (prevState.pageSize !== this.state.pageSize) {
//............................................................

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
        this.props.cashBoxPaginationAction(body)
      );
    }

    // page num
    if (prevState.page !== this.state.page) {
//............................................................

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
        this.props.cashBoxPaginationAction(body)
      );
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
    // const context = this.context;

    // const body = {
    //   pageCount: this.state.page,
    //   numPerPage: size,
    //   searchString: this.state.searchVal,
    //   employeeId: context.commoncookie,
    //   headerLocationId: context.headerLocationId
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.cashBoxPaginationAction(body)
    // )
  }

  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })

    // const body = {
    //   pageCount: page,
    //   numPerPage: this.state.pageSize,
    //   searchString: this.state.searchVal,
    //   employeeId: context.commoncookie,
    //   headerLocationId: context.headerLocationId
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.cashBoxPaginationAction(body)
    // )
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.searchCashBoxData
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true, status:'edit'});
    }
  };
    handleDelete = async (id, ledger_id) => {
      const context = this.context;
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
        this.props.deleteCashBoxAction(id, ledger_id, context.setModalTypeHandler, context.setLoaderStatusHandler)
      ).then(()=>{
        this.props.cashBoxPaginationAction(body)
      })
      this.setState({ delete: false })
    }
  handledialog = (id, ledger_id) => {
    this.setState({delete: true, id: id, ledger_id: ledger_id });
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('cash_box_list', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res) => {
    if (res === true) {
      if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('cash_box_list', true);
      }
    }
    // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  };
  handleSubmit = async (data) => {
    const context = this.context;
    const body = {
      pageCount: data.id ? this.state.page : 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    if(this.props.pageType === 'detailpage') {
    if (this.props.searchCashBoxData?.length > 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateCashBoxAction(
          this.props.searchCashBoxData[0]?.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        ).then(res => {
          
          this.props.cashBoxPaginationAction(body)
      });
      await this.setState({open: false});
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createCashBoxAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog,
        ),
      ).then(res => {
          
        this.props.cashBoxPaginationAction(body)
    });

      await this.setState({open: false});
    }
  } else {
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateCashBoxAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
        ).then(res => {
          
          this.props.cashBoxPaginationAction(body)
      });
      await this.setState({open: false});
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createCashBoxAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog,
        ),
      ).then(res => {
          
        this.props.cashBoxPaginationAction(body)
    });

      await this.setState({open: false});
    }
  }
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page : 0 });

    this.props.set_searchCashBoxAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.props.get_searchCashBoxAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_searchCashBoxAction({ data: [], numRows: 0 })

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
      this.props.cashBoxPaginationAction(body)
    );
  };

  render() {
            let storage = getsessionStorage()
            const { user_rights } = this.props;
            const AddRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'AddCashBox') : true;
            const EditRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'EditCashBox') : true;
            const DeleteRights = storage?.company_type === 3 ? getRoleAuthorization(user_rights, 'DeleteCashBox') : true;
    return (
      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | CashBox </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler, headerLocationId}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
                ledger_id = {this.state.ledger_id}
              />
              {this.state.open === false && (
                <MaterialTable
                  totalCount={this.props.searchCashBoxCount || 0}
                  style={{height: 'calc(100vh - 80px)'}}
                  components={{
                    Toolbar: (props) => (
                      <>
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
                    {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) => this.handleEdit(rowData.id)
                    },
                   {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) => this.handledialog(rowData.id, rowData.ledger_id)
                    },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({edit_id_data: [], open: true, status:'create', isApiFinished: false}),
                    },
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                  options={{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    pageSize: this.state.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.props.searchCashBoxCount,
                    // initialPage:this.state.currentPage,
                    search:false,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                        {
                          // apiCalls(
                          //   setModalTypeHandler,
                          //   setLoaderStatusHandler,
                          //   this.props.listCashBoxAction(  
                          //     headerLocationId,
                          //     // setModalTypeHandler, setLoaderStatusHandler,               
                          //   (exportData) => {
                          //     ExportPdf(
                          //       cols,
                          //       exportData,
                          //       'CashBoxList',
                          //     );
                          //   },
                          // )
                          // ); 
                          const context = this.context;
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
                            this.props.cashBoxPaginationAction(body,
                              (exportData) => {
                                console.log('cashboxxx', exportData)
                                ExportPdf(
                                  cols,
                                  exportData,
                                  'CashBoxList',
                                );
                              },)
                          );

                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                        {
                          const context = this.context;
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
                            this.props.cashBoxPaginationAction(body,
                              (exportData) => {
                                  const formattedData = exportData.map(item => ({
                                    ...item,
                                    denomination: item.allowdenomination === 0 ? '#' : 'Yes',
                                    negDenomination: item.negativeDenomination === 0 ? '#' : 'Yes',
                                  }));

                              const exportCols = [
                            ...this.columns.filter(c => !["allowdenomination","negativeDenomination"].includes(c.field)), // keep your normal columns
                            { title: "Allow Denomination", field: "denomination" },
                            { title: "Allow Negative Denomination", field: "negDenomination" }
                          ];
                                console.log('cashboxxx', formattedData)
                                ExportCsv(
                                  exportCols,
                                  formattedData,
                                  'CashBoxList',
                                );
                              },)
                          );
                          // apiCalls(
                          //   setModalTypeHandler,
                          //   setLoaderStatusHandler,
                          //   this.props.listCashBoxAction(  
                          //     headerLocationId,
                          //     // setModalTypeHandler, setLoaderStatusHandler, 
                          //     console.log('exportData', exportData),              
                          //   (exportData) => {
                          //     ExportCsv(
                          //       cols,
                          //       exportData,
                          //       'CashBoxList',
                          //     );
                          //   },
                          // )
                            
                          // );
                        }
                      },
                    ],
                  }}
                  page={this.state.page}
                  columns={[
                    {
                      title: 'CashBox Name', 
                      field: 'name'
                    },
                    {
                      title: 'Location', 
                      field: 'location_name'
                    },
                    {
                      title: 'Allow Denomination', 
                      field: 'allowdenomination',
                      render: (rowData) => {
                        if(rowData.allowdenomination === 1){
                          return 'Yes'
                        }
                        else{
                          return 'No'
                        }
                      }
                    },
                    {
                      title: 'Allow Negative Denomination', 
                      field: 'negativeDenomination',
                      render: (rowData) => {
                        if(rowData.negativeDenomination === 1){
                          return 'Yes'
                        }
                        else{
                          return 'No'
                        }
                      }
                    }
                  ]}

                  // data={
                  //   this.props.cash_box_list
                  //     ? this.props.cash_box_list
                  //         .slice(0, this.props.pageSize)
                  //         .map((r) => {
                  //           const {tableData, ...record} = r;
                  //           return record;
                  //         })
                  //     : []
                  // }

                  // data={this.props.searchCashBoxData?.length > 0 || this.state.searchVal.length > 0 ? this.props.searchCashBoxData : this.props.cash_box_list
                  //   .slice(0, this.props.pageSize)
                  //   .map((r) => {
                  //     const { tableData, ...record } = r;
                  //     return record;
                  //   })}

                  data = {this.props.searchCashBoxData}

                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                      CashBox List
                    </Typography>}
                />
              )}
              {this.state.open && (
                <NewCashBox
                  status={this.state.status}
                  edit_id_data={this.state.edit_id_data}
                  handleDialogClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  type='cashBoxCreation'
                  setModalTypeHandler={setModalTypeHandler}
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
    cash_box_list: state.cashBoxReducer.cash_box_list || [],
    stocklocation: state.stockLocationReducer.stocklocation || [],
    searchCashBoxData : state.cashBoxReducer.searchCashBoxData,
    searchCashBoxCount : state.cashBoxReducer.searchCashBoxCount,
    user_rights : state.roleReducer.user_rights
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCashBoxAction: (headerLocationId,exportCallBack) => {
      return dispatch(listCashBoxAction(headerLocationId,exportCallBack));
    },
    createCashBoxAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        createCashBoxAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    updateCashBoxAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateCashBoxAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deleteCashBoxAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteCashBoxAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listStockLocationAction: (commoncookie, headerLocationId) => {
      dispatch(listStockLocationAction(commoncookie, headerLocationId));
    },
    set_searchCashBoxAction: (val ) => { 
      return dispatch(set_searchCashBoxAction(val));
    },
    get_searchCashBoxAction: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_searchCashBoxAction(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    cashBoxPaginationAction: (data, exportDataCallBack) => { 
      return dispatch(cashBoxPaginationAction(data, exportDataCallBack));
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CashBoxCreation);

