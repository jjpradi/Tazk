import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTablePagination, MTableToolbar} from 'utils/SafeMaterialTable';
import {
  Exportlistaction,
  get_searchLedgerAction,
  listGeneralLedgerAction,
  listGeneralLedgerdateAction,
  listGeneralLedgerMonthlySummaryAction,
  searchLedgerPaginationAction,
  set_searchLedgerAction,
} from '../../../redux/actions/generalLedger';
import {listStockLedgerAction} from '../../../redux/actions/stock_Ledger_actions';
import {
  listLedgerAction,
  listLedgerPaginateAction,
  createLedgerAction,
  updateLedgerAction,
  getbyidLedgerAction,
  deleteLedgerAction,
  listLedgerParentGroupAction,
  listAllParentLedgerAction,
  listAllLedgerVouchersAction,
  updateAllParentLedgerAction,
  generalLedgerFilterDataAction,
} from '../../../redux/actions/ledger_actions';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {InputAdornment, TablePagination, TextField, Typography} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import moment from 'moment';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import Ledger from '../../../components/Ledger';
import TopOrder from '../../../components/ledger_erpDesign';
import LedgerMonthlySummary from './ledgerMonthlySummary';
import {
  getDateTimeFormat,
  getDateFormat,
  yyyymmdd_ddmmyyyy,
} from '../../../utils/getTimeFormat';
import {stubFalse} from 'lodash';
import Cookies from 'universal-cookie';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import AccountFilter from './generaledgerFilter';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
// import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getFYPresets } from '../reports/reportUtils';

class GeneralLedger extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      open: false,
      monthlyOpen: false,
      voucherOpen: false,
      GeneralLedger_data: [],
      edit_id_data: [],
      from: null,
      to: null,
      ledgerName:'',
      export:0,
      ledger_id:'',
      count: 0,
      status: '',
      errormsg: {
        from: '',
        to: '',
      },
      dialog: {open: false, msg: '', severity: ''},
      rowPopup: {open: false, rowIndex: '', item_id: ''},
      hello: false,
      arr: [],
      currentPage:0,
      updateParentLedger:'',
      searchVal: '',
      searchPageData: [],
      pageSize: 20,
      page: 0,
      isApiFinished: false,
      filteredData: {
        accountTypes: [],
        accountGroups: [],
        parentLedgers: [],
      },
      columns: [
              {
                field: 'accountCode',
                title: 'Account Code',
                editable: 'never',
              },
              {
                field: 'name',
                title: 'Account Name',
              },
              {
                field: 'amount',
                title: 'Balance',
                editable: 'never',
                // align: 'right', 
                // cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '10px'},
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
                    {rowData?.accountBalance ?? 0}

                  </div>
                )
              },
              {
                field: 'accountGroupName',
                title: 'Account Group',
                editable: 'never'
              },
            ],
      fyPresets: getFYPresets()
    };
    this.getRoleName = this.getRoleName.bind(this);  
  }
    storage = getsessionStorage()
  getRoleName(){  
    // const cookies = new Cookies();
    let storage = getsessionStorage()
    const cookieData= storage;
  return cookieData.role_name === "Administrator";
  } 
  async componentDidMount() {
    this.props.set_searchLedgerAction({data:[], numRows:0});
    const context = this.context;
     const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString:'',
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId,
      accountTypes: [],
      accountGroups: [],
      parentLedgers: [],
    }
    const selectedRole = this.storage?.role_name;

    

   await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listGeneralLedgerAction('fromto', 'fromto', context.setModalTypeHandler,context.setLoaderStatusHandler),
      // this.props.listLedgerParentGroupAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.listAllParentLedgerAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      this.props.searchLedgerPaginationAction(
        body
      ),
      this.props.generalLedgerFilterDataAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
         this.props.getMenuAccessAction(selectedRole)
      // this.props.getUserRightsByRoleIdAction()
    ).finally(() => this.setState({ isApiFinished: true }));
    
    this.setState({GeneralLedger_data: this.props.generalLedger});
    const Data = [...this.props.all_parent_ledger].concat(
      this.props.generalLedger.map((b) => {
        return {...b};
      }),
    );
    await this.setState({arr: Data});
  }

  async componentDidUpdate(preProps, preState) {

    const context = this.context;
    if (preState.pageSize !== this.state.pageSize) {

      if (this.state.from && this.state.to) {


        const data = {
          from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
          to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
          numPerPage: this.state.pageSize,
          pageCount: this.state.page,
           ...this.getFilterPayload(),
        }


        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listGeneralLedgerdateAction(data)
        );

      } else {

        const body = {
          numPerPage: this.state.pageSize,
          pageCount: this.state.page,
          searchString: this.state.searchVal,
          employee_id: context.commoncookie,
          headerLocationId: context.headerLocationId,
           ...this.getFilterPayload(),
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.searchLedgerPaginationAction(body)
        )
      }
    }

    if (preState.page !== this.state.page) {
      if (this.state.from && this.state.to) {


        const data = {
          from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
          to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
          numPerPage: this.state.pageSize,
          pageCount: this.state.page,
           ...this.getFilterPayload(),
        }


        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listGeneralLedgerdateAction(data)
        );

      } else {
        const body = {
          numPerPage: this.state.pageSize,
          pageCount: this.state.page,
          searchString: this.state.searchVal,
          employee_id: context.commoncookie,
          headerLocationId: context.headerLocationId,
           ...this.getFilterPayload(),
        }
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.searchLedgerPaginationAction(body)
        )
      }
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size,page:0})
  }

  handlePageChange = async (page) => {
    this.setState({ page: page })
  }

  responseDialog = (res, resSeverity) => {
    this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('customer', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };

  handleChange = async (data) => {
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          // await this.props.listGeneralLedgerdateAction((moment(this.state.from ,'year','month','day')).format("yyyy-MM-DD"),(moment(this.state.to ,'year','month','day')).format("yyyy-MM-DD"))

          // var filterData = [];

          // if(this.state.start_date && this.state.end_date) {
          // await this.props.generalLedger.map((d,i)=>{
          //    if(d.transactionDate !== null) {
          //         if(this.state.from.getTime() <= new Date(d.transactionDate).getTime() && this.state.to.getTime() >= new Date(d.transactionDate).getTime())
          //             filterData.push(d);
          //     }
          // })

          this.setState({errormsg: {from: '', to: ''}}); // GeneralLedger_data: filterData ,
        } else {
          this.setState({
            errormsg: {
              ...this.state.errormsg,
              [data.target.name]: 'Invalid Date',
            },
          });
        }
      } else {
        this.setState({
          errormsg: {
            ...this.state.errormsg,
            [data.target.name]: 'Invalid Date',
          },
        });
      }
    } else {
      this.setState({
        errormsg: {...this.state.errormsg, [data.target.name]: 'Invalid Date'},
      });
    }
  };

  handleFilter = (data) => this.setState({filterOpen: data});

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
      // await this.setState({ ledger_data: this.props.ledger_list })
    }
  };

  clearButton = async () => {
    var date = new Date();
    // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const context = this.context;
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      accountTypes: [],
      accountGroups: [],
      parentLedgers: [],
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.searchLedgerPaginationAction(body),

    ).finally(() => this.setState({ isApiFinished: true }));
    // this.setState({from: null, to: null});
    this.setState({ filterOpen: false, page: 0, searchVal: '' });
  };

  ApplyButton = async (filteredDataFromModal) => {
    const context = this.context;
   this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    const data = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      accountTypes: filteredDataFromModal.accountTypes.map((d) => d.id),
      accountGroups: filteredDataFromModal.accountGroups.map((d) => d.id),
      parentLedgers: filteredDataFromModal.parentLedgers.map((d) => d.id),
    };
  
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.searchLedgerPaginationAction(
        data
      ),
    );
    this.setState({ filterOpen: false, searchVal: '', export: 0 ,filteredData: filteredDataFromModal});
  }
  
  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidLedgerAction(id)
	  );
    this.setState({
      open: true,
      status: 'edit',
      rowPopup: {...this.state.rowPopup, open: false},
    });
  };

  handleDelete = (event, data) => {
    event.stopPropagation()
    console.log(data, 'data')
    this.props.deleteLedgerAction(data)
  }

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  rowPopupClose = () => {
    this.setState({rowPopup: {open: false, rowIndex: ''}});
  };

  handleBackBtn = () => {
    this.setState({monthlyOpen: false});
  };

  handleMonthlySummayOpen = (id) => {
    if (id) {
      const context = this.context;
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listGeneralLedgerMonthlySummaryAction(
          id,
          this.state.fyPresets[0]?.fromDate,
          this.state.fyPresets[0]?.toDate,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
       );
      this.setState({monthlyOpen: true, voucherOpen: false, ledger_id: id});
    }
  };

  handleVoucherOpen = (bol, data) => {
    if (bol === true && data.month) {
      const context = this.context;
      let ledger_id = this.state.ledger_id
      let payload = {
        ledger_id ,
        monthStart : data.monthStart,
        monthEnd : data.monthEnd
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listAllLedgerVouchersAction(
          payload,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      );
    }
    this.setState({voucherOpen: bol});
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    this.props.set_searchLedgerAction({data:[], numRows:0})
    // const body = {
    //   numPerPage: this.state.pageSize,
    //   pageCount: 0,
    //   searchString: '',
    //   employee_id: context.commoncookie,
    //   headerLocationId: context.headerLocationId
    // }
    // this.props.get_searchLedgerAction(
    //   body,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    // )
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId,
      accountTypes: [],
      accountGroups: [],
      parentLedgers: [],
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
     this.props.searchLedgerPaginationAction(body),
      
    ).finally(() => this.setState({ isApiFinished: true }));
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page: 0 });

    this.props.set_searchLedgerAction({ data: [], numRows: 0 });

    if (val.trim() === '') {
      const body = {
        numPerPage: this.state.pageSize,
        pageCount: 0,
        searchString: '',
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        accountTypes: [],
        accountGroups: [],
        parentLedgers: [],
      };

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.searchLedgerPaginationAction(body)
      ).finally(() => this.setState({ isApiFinished: true }));

    } else {
      const body = {
        numPerPage: this.state.pageSize,
        pageCount: 0,
        searchString: val,
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId,
        accountTypes: [],
        accountGroups: [],
        parentLedgers: [],
      };

      this.props.get_searchLedgerAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      );
    }
  };

  getFilterPayload = () => {
  const { filteredData } = this.state;

  return {
    accountTypes: filteredData.accountTypes.map(d => d.id),
    accountGroups: filteredData.accountGroups.map(d => d.id),
    parentLedgers: filteredData.parentLedgers.map(d => d.id),
  };
};


  setFilterValues = (callback) => {
    this.setState((prevState) => ({
      filteredData: typeof callback === "function"
        ? callback(prevState.filteredData)
        : callback
    }));
  };

  render() {
    const error = this.state.errormsg.from !== '';
    const err = this.state.errormsg.to !== '';
    const Data = [...this.props.all_parent_ledger].concat(
      this.props.generalLedger.map((b) => {
        return {...b};
      }),
    );
       const { menuAccess = {} } = this.props;
       const selectedRole = this.storage?.role_name;
       const storage = this.storage;
       const AddRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_create')
       const EditRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_edit')
       const DeleteRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_delete')
       const exportRights = UserRightsAuthorization(menuAccess[selectedRole], 'accounts__ledgers', 'can_export')

    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | General Ledger </title>
       </Helmet>
        {/* <Snackbar open={this.state.dialog.open} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity={this.state.dialog.severity} variant="filled">
          {this.state.dialog.msg}
        </Alert>
      </Snackbar> */}
        {this.state.monthlyOpen === true && (
          <LedgerMonthlySummary
            handleBackBtn={this.handleBackBtn}
            {...this.props}
            voucherOpen={this.state.voucherOpen}
            handleVoucherOpen={this.handleVoucherOpen}
            ledgerName={this.state.ledgerName}
            ledger_id={this.state.ledger_id}
            exportRights={exportRights}
            onLedgerClick={(id, name) => { this.setState({ ledgerName: name }); this.handleMonthlySummayOpen(id); }}
          />
        )}
        {this.state.open === false && this.state.monthlyOpen === false && (
          <MaterialTable
          style={{height: 'calc(100vh - 80px)'}}
          // localization={{
          //   body: {
          //     emptyDataSourceMessage:
          //       <div style={{ marginTop: '6%', position: 'absolute', top: '16%',  textAlign: 'center' ,display:'flex',justifyContent:'center'}}>
          //         No records found
          //       </div>
          //   }
          // }}
          totalCount={this.props.searchLedgerCount}
          // style={{height:'87vh',overflow:'auto'}}

          components={{
            ...stickyTableComponents,
             Pagination: (props) => (
            <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "8px 16px",
              }}>
                <TablePagination
                {...props}
                count={this.props.searchLedgerCount} 
                rowsPerPage={this.state.pageSize}
                page={this.state.page}
                onPageChange={(event, page) => this.handlePageChange(page)}
                onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                </div>),
            Toolbar: (props) => (
            <div>
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
              {/* <span style={{ paddingLeft: '100px' }}> */}
                {/* <MuiPickersUtilsProvider utils={MomentUtils}>
                <DatePicker
                name="from"
                label="From Date"
                inputVariant="outlined"
                format="DD/MM/yyyy"
                error = {error}
                value={this.state.from === null ?  this.state.from : this.state.from }
                onChange={(date) =>
                    this.handleChange({
                    target: { value: date, name: "from" },
                    })
                }
                fullWidth={false}
                />
            </MuiPickersUtilsProvider> */}
                {/* <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                   name="from"
                   label="From Date"
                   inputVariant="outlined"
                  //  format="DD/MM/yyyy"
                   inputFormat="DD/MM/yyyy"
                   error = {error}
                   value={this.state.from === null ?  this.state.from : this.state.from }
                   onChange={(date) =>
                       this.handleChange({
                       target: { value: date, name: "from" },
                       })
                   }
                   fullWidth={false}
                renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider> */}
              {/* </span> */}

              {/* <span style={{ paddingLeft: '100px' }}> */}
                {/* <MuiPickersUtilsProvider utils={MomentUtils}>
                <DatePicker
                name="to"
                label="To Date"
                inputVariant="outlined"
                format="DD/MM/yyyy"
                error = {err}
                value={this.state.to === null ? this.state.to : this.state.to }
                onChange={(date) =>
                    this.handleChange({
                    target: { value: date, name: "to" },
                    })
                }
                fullWidth={false}
                />
            </MuiPickersUtilsProvider> */}
                {/* <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                name="to"
                label="To Date"
                inputVariant="outlined"
                // format="DD/MM/yyyy"
                inputFormat="DD/MM/yyyy"
                error = {err}
                value={this.state.to === null ? this.state.to : this.state.to }
                onChange={(date) =>
                    this.handleChange({
                    target: { value: date, name: "to" },
                    })
                }
                fullWidth={false}
                renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider> */}
              {/* </span> */}
              {/* <div>
                  <span style={{paddingLeft: '200px', color: 'red'}}>
                    {this.state.errormsg.from}
                  </span>
                  <span
                    style={{
                      paddingLeft:
                        this.state.errormsg.from === '' ? '310px' : '240px',
                      color: 'red',
                    }}
                  >
                    {this.state.errormsg.to}
                  </span>
                </div> */}
            </div>
          ),
        }}
        actions={[
         exportRights ? {
            icon: 'save_alt', 
            tooltip: 'Export',
            isFreeAction: true,
            onClick: () => {
              apiCalls(
                this.props.Exportlistaction(
                  this.state.export === 0 ? 'fromto' : moment(this.state.from).format('YYYY-MM-DD'),
                  this.state.export === 0 ? 'fromto' : moment(this.state.to).format('YYYY-MM-DD'),
                  (exportData) => {
                    ExportPdf(this.state.columns || [], exportData, 'GeneralLedgerData');
                  }
                )
              );
            }
          } : null,
          {
            icon: () => (
              // <CommonFilter
              //   fromTo={true}
              //   from={this.state.from}
              //   to={this.state.to}
              //   count={this.state.count}
              //   handleChange={this.handleChange}
              //   handleClose={this.handleFilter}
              //   open={this.state.filterOpen}
              //   ApplyButton={this.ApplyButton}
              //   clearButton={this.clearButton}
              //   locationFilter={false}
              //   shouldFetchData={this.state.filterOpen}
              // />
              // <AccountFilter
              //   accountTypes={this.props.generalLedgerFilterData.accountType}
              //   accountGroups={this.props.generalLedgerFilterData.accountGroup}
              //   parentLedgers={this.props.generalLedgerFilterData.parentLedger}
              //   filterValues={this.state.filteredData}
              //   setFilterValues={this.setFilterValues}
              // />
              (<AccountFilter
                open={this.state.filterOpen}
                handleClose={(flag) => this.setState({ filterOpen: flag })}
                filterValues={this.state.filteredData}
                setFilterValues={this.setFilterValues}
                applyFilter={this.ApplyButton}
                clearFilter={() => {
                  const cleared = { accountTypes: [], accountGroups: [], parentLedgers: [] };
                  this.setState(
                    { filteredData: cleared },
                    () => this.clearButton()
                  );
                }}
                accountTypes={this.props.generalLedgerFilterData.accountType}
                accountGroups={this.props.generalLedgerFilterData.accountGroup}
                parentLedgers={this.props.generalLedgerFilterData.parentLedger}
                count={
                  (this.state.filteredData.accountTypes.length +
                    this.state.filteredData.accountGroups.length +
                    this.state.filteredData.parentLedgers.length) || 0
                }
              />)

            ),
            tooltip: 'Filter',
            isFreeAction: true,
          },
          AddRights ? {
            icon: 'add',
            tooltip: 'Add',
            isFreeAction: true,
            onClick: () => this.setState({ edit_id_data: [], open: true, status: 'create' }),
          } : null,
          EditRights ? {
            icon: 'edit',
            tooltip: 'Edit',
            position: 'row',
            onClick: (event, rowData) => this.handleEdit(rowData.id, rowData),
          } : null,
          DeleteRights ? {
            icon: 'delete',
            tooltip: 'Delete',
            position: 'row',
            onClick: (event, rowData) => this.handleDelete(event, rowData.id)
          } : null
          
          // {
          //   icon: 'save_alt',
          //   tooltip: 'Export as CSV',
          //   isFreeAction: true,
          //   onClick: () => {
          //     apiCalls(
          //       this.props.Exportlistaction(
          //         this.state.export === 0 ? 'fromto' : moment(this.state.from).format('YYYY-MM-DD'),
          //         this.state.export === 0 ? 'fromto' : moment(this.state.to).format('YYYY-MM-DD'),
          //         (exportData) => {
          //           ExportCsv(this.state.columns || [], exportData, 'GeneralLedgerData');
          //         }
          //       )
          //     );
          //   }
          // }
        ]}
        
            onRowClick={(evt, rowData) => {
              this.setState({ ledgerName: rowData.name});
              this.handleMonthlySummayOpen(rowData.id)

            }
            }

            // editable={{
            //     onRowUpdate:this.getRoleName() && ((newRow,oldRow)=>new Promise((resolve,reject)=>{
            //       setTimeout(() => {    
            //         const context = this.context;
            //         const data = {
            //           pageCount: this.state.page,
            //           numPerPage: this.state.pageSize,
            //           updateData: newRow
            //         }
            //         this.props.updateAllParentLedgerAction(data , context.setModalTypeHandler , context.setLoaderStatusHandler)
            //         resolve()
            //       }, 500);
            //     }))
            // }}
           
          page={this.state.page}
          onPageChange={(page) => this.handlePageChange(page)}
          onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
          options={getStickyTableOptions({
            headerStyle,
            bodyOffset: 190,
            cellStyle,
            options:{
              showEmptyDataSourceMessage: this.state.isApiFinished,
            exportButton: true,
            filtering: false,
            actionsColumnIndex: -1,
             tableLayout: "auto",
                toolbar: true,
            // maxBodyHeight: maxBodyHeight ,
            // minBodyHeight: maxBodyHeight,
            pageSize: this.state.pageSize,
            pageSizeOptions: [20, 50, 100],
            initialPage: this.state.currentPage,
            search: false,
            },
          })
            
            // exportMenu: [
            //   {
            //     label: 'Export PDF',
            //     exportFunc: (cols, datas) =>
            //     {
            //       apiCalls(
                 
            //         this.props.Exportlistaction(
            //          this.state.export ===0 ? 'fromto':  moment(this.state.from, 'year', 'month', 'day').format(
            //             'yyyy-MM-DD',
            //           ),
            //           this.state.export ===0 ? 'fromto':  moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
                   
            //        (exportData) => {
            //          ExportPdf(
            //            cols,
            //            exportData,
            //            'GeneralLedgerData',
            //          );
            //        },
            //      )
                    
            //       );
            //    }
            //   },
            //   {
            //     label: 'Export CSV',
            //     exportFunc: (cols, datas) =>
            //     {
            //       apiCalls(
                
            //         this.props.Exportlistaction(
            //          this.state.export ===0 ? 'fromto':  moment(this.state.from, 'year', 'month', 'day').format(
            //             'yyyy-MM-DD',
            //           ),
            //           this.state.export ===0 ? 'fromto':  moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
                   
            //        (exportData) => {
            //          ExportCsv(
            //            cols,
            //            exportData,
            //            'GeneralLedgerData',
            //          );
            //        },
            //      )
                    
            //       );
            //    }
            //   },
            // ],
          }
          columns={this.state.columns}

          data={this.props.searchLedgerData
            // _.uniqBy(this.props.all_parent_ledger.concat(this.props.generalLedger,this.props.ledger_list), 'accountCode')
            // this.state.arr ? this.state.arr.slice( 0 , this.props.pageSize).map(r => {
            //   const { tableData, ...record } = r;
            //   return record;
            // }) : []
          }
          title={
            <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              General Ledger</Typography>}
        />
      )}
        {this.state.open && (
          <Ledger
            status={this.state.status}
            edit_id_data={this.props.ledger_id_data}
            handleClose={this.handleClose}
            handleSubmit={this.handleSubmit}
            {...this.props}
            type='LedgerList'
          />
        )}
        {/* {this.state.rowPopup.open&&<TopOrder rowPopupClose={this.rowPopupClose} item_id = {this.state.rowPopup.item_id} rowIndex={this.state.rowPopup.rowIndex} handleEdit={this.handleEdit} handleDelete={this.handledialog} type={'product'} />} */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    generalLedger: state.generalLedgerReducer.generalLedger,
    ledger_parent_group_list: state.ledgerReducer.ledger_parent_group_list || [],
    ledger_id_data: state.ledgerReducer.ledger_id_data || [],
    generalLedger_id_data: state.generalLedgerReducer.generalLedger_id_data,
    stock_ledger_list: state.stockLedgerReducer.stock_ledger_list || [],
    all_parent_ledger: state.ledgerReducer.all_parent_ledger || [],
    ledger_list: state.ledgerReducer.ledger_list || [],
    ledger_list_count: state.ledgerReducer.ledger_list_count || 0,
    generalLedger_monthly_summary: state.generalLedgerReducer.generalLedger_monthly_summary || { data: {}, openingbalance: null, ledgerName: [] },
    all_ledger_vouchers: state.ledgerReducer.all_ledger_vouchers || [],
    update_parent_ledger:state.ledgerReducer.update_parent_ledger || [],
    searchLedgerData: state.generalLedgerReducer.searchLedgerData,
    searchLedgerCount: state.generalLedgerReducer.searchLedgerCount || 0,
    ledgerPagination: state.ledgerReducer.ledgerPagination || [],
    ledgerPaginationCount: state.ledgerReducer.ledgerPaginationCount || 0,
    generalLedgerFilterData: state.ledgerReducer.generalLedgerFilterData || 0,
    menuAccess: state.rbacReducer.menuAccess || []
    // user_rights : state.roleReducer.user_rights
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listGeneralLedgerAction: (
      from,
      to,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listGeneralLedgerAction(
          from,
          to,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listLedgerParentGroupAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listLedgerParentGroupAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listStockLedgerAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(
        listStockLedgerAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listGeneralLedgerdateAction: (data,setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listGeneralLedgerdateAction(data,setModalTypeHandler, setLoaderStatusHandler));
    },
    getbyidLedgerAction: (id) => {
      return dispatch(getbyidLedgerAction(id));
    },
    createLedgerAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      id,
      current_seq,
    ) => {
      return dispatch(
        createLedgerAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          current_seq,
        ),
      );
    },
    updateLedgerAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateLedgerAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listAllParentLedgerAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listAllParentLedgerAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listLedgerPaginateAction: (data) => {
      return dispatch(listLedgerPaginateAction(data));
    },
    listGeneralLedgerMonthlySummaryAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listGeneralLedgerMonthlySummaryAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listAllLedgerVouchersAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listAllLedgerVouchersAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateAllParentLedgerAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      dispatch(
        updateAllParentLedgerAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    set_searchLedgerAction: (val ) => { return dispatch(set_searchLedgerAction(val))
    },
    get_searchLedgerAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchLedgerAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    searchLedgerPaginationAction: (
      data
      ) => { 
      return dispatch(
        searchLedgerPaginationAction(
          data
          )
        );
    },

    Exportlistaction: (
     
      from,to,
       exportDataCallBack
     ) => {
       return dispatch(
         Exportlistaction(
           
          from,
           to,exportDataCallBack
         ),
       );
     },
     generalLedgerFilterDataAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        generalLedgerFilterDataAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
    deleteLedgerAction: (data) => {
      return dispatch(deleteLedgerAction(data))
    },
    getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralLedger);


