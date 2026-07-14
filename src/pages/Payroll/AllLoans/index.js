import React, {Component} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  listLeadsAction,
  updateLeadsAction,
  getbyidLeadsAction,
  deleteLeadsAction,
  createLeadsAction,
  updateInvoiceModelAction,
  listLeadsByPaginationAction,
  setSearchLeadsAction,
  getSearchLeadsAction,
} from '../../../redux/actions/leads_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NewAllLoans from '../../../components/NewAllLoans';
import LoanDetail from './loandetail';
import CheckIcon from '@mui/icons-material/Check';
import {Accordion, AccordionDetails, AccordionSummary, Divider, List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography} from '@mui/material';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { maxHeight, pageSize,headerStyle,cellStyle, maxBodyHeight } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import { createAllLoanssAction, getSearchCompanyLoanAction, listAllLoansAction, setsearchCompanyLoanAction } from 'redux/actions/allLoans_actions';
import { commonDateFormat } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class AllLoans extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      dialogId: '',
      page: 0,
      pageSize: pageSize,
      openDialog: false,
      closeDialog: '',
      invoiceData: {
        invoice: '',
        reason: '',
        status: '',
      },
      invoice: false,
      reason: false,
      value: 'Billed',
      searchData: [],
      searchVal: '',
      searchPageData: [],
      isApiFinished: false,
      rowPopup: {open: false, data: []},
    };
    this.storage = getsessionStorage();
  }

  

  async componentDidMount() {
    // this.props.setSearchLeadsAction({ data: [], numRows: 0 });
    const context = this.context;
     const selectedRole = this.storage.role_name
    this.props.setsearchCompanyLoanAction({ data: [], numRows: 0 })
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: ''
    }
    apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
    this.props.getSearchCompanyLoanAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler),
        this.props.getMenuAccessAction(selectedRole)
      // this.props.getUserRightsByRoleIdAction()
    ).finally(() => this.setState({ isApiFinished: true }));
    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  handleEdit = async (id) => {
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getbyidLeadsAction(id)
	  // );
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.deleteLeadsAction(
    //     id,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.sample,
    //   )
	  // );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleClickOpen = (id) => {
    this.setState({openDialog: true, dialogId: id});
  };

  handleChange1 = (e) => {
    this.setState({value: e.target.value});
  };

  handleDialogClose = async () => {
    const context = this.context;
    if (
      this.state.invoiceData.invoice !== '' &&
      this.state.invoiceData.invoice !== null
    ) {
      this.setState({openDialog: false}); //, errormsg : "", errmsg :""
      this.state.invoiceData.status = 'close';

      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.updateInvoiceModelAction(
      //     this.state.dialogId,
      //     this.state.invoiceData,
      //   ), //, record
      //   // await this.setState({ open: false })
      //   this.props.listLeadsAction(),
      // );
    } else if (
      this.state.invoiceData.reason !== '' &&
      this.state.invoiceData.reason !== null
    ) {
      this.setState({openDialog: false}); //, errormsg : "", errmsg :""
      this.state.invoiceData.status = 'close';

      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.updateInvoiceModelAction(
      //     this.state.dialogId,
      //     this.state.invoiceData,
      //   ), //, record
      //   // await this.setState({ open: false })
      //   this.props.listLeadsAction(),
        
      // );
    } else if (
      this.state.invoiceData.invoice === '' &&
      this.state.invoiceData.reason === ''
    ) {
      this.setState({openDialog: true, invoice: true, reason: true});
    } else if (this.state.invoiceData.invoice === '') {
      this.setState({openDialog: true, invoice: true});
    } else if (this.state.invoiceData.reason === '') {
      this.setState({openDialog: true, reason: true});
    }
  };

  sample = async (value) => {
    const context = this.context;
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getSearchLeadsAction(
    //     body,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler
    //   )
    //   // this.props.listLeadsAction(),
	  // );

    this.setState({open: value});
  };

  handleCancel = () => {
    this.setState({openDialog: false, invoice: false, reason: false});
  };

  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('leads', true);
    }
    await this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handlePageSizeChange = async (size) => {

    this.setState({pageSize: size}, async () => {

      const context = this.context;
      const body = {
        numPerPage:size,
        pageCount: 0,
        searchString : this.state.searchVal
      }
      this.props.getSearchCompanyLoanAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.getSearchLeadsAction(
      //     body,
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler
      //   )
      // );
    });
  };

  handlePageChange = async (page) => {

    this.setState({page: page});
    const context = this.context;

    const body = {
      numPerPage: this.state.pageSize,
      pageCount: page,
      searchString : this.state.searchVal
    }
    this.props.getSearchCompanyLoanAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getSearchLeadsAction(
    //     body,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler
    //   ) 
    // );
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('leads', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };
  handlerowpopupclose = () =>{
    this.setState({rowPopup: {
      open: false
    },
      
    })
  }
  handleSubmit = async (data) => {
    const context = this.context;    


    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.createAllLoanssAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // this.sample,
      ),
      // this.props.listAllLoansAction(context.setModalTypeHandler,context.setLoaderStatusHandler),
    );
    this.setState({open: false});
  };

  handleDeactive = async (data, status) => {
    const context = this.context;
    const active = {is_active: status};
    if (data.id) {
      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.updateLeadsAction(data.id, active)
      // );
      await this.setState({open: false});
    }
  };

  handleChange = async (e) => {
    let {name, value} = e.target;
    // setStateHandler({ [e.target.name]: e.target.value });
    this.setState({
      invoiceData: {...this.state.invoiceData, [name]: value},
      [name]: value ? false : true,
    });
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
     //this.props.setSearchLeadsAction({data:[], numRows:0});
    //let val = ''

    this.props.setsearchCompanyLoanAction({ data: [], numRows: 0 })
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: ''
    }
    this.props.getSearchCompanyLoanAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
    // this.props.getSearchLeadsAction(
    //   body,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    // )
  };

  requestSearch = (e) => {
    this.setState({searchData: [], searchPageData: [], page: 0});
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val});
    if(val.length >= 3 || val.length === 0) {
      this.props.setsearchCompanyLoanAction({ data: [], numRows: 0 })
    }
    // if(val.trim() !== ''){
      // this.props.setSearchLeadsAction({data:[], numRows:0})
    // }
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: val
    }
    this.props.getSearchCompanyLoanAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
    // this.props.getSearchLeadsAction(
    //     body,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler
    //   )
  };
  render() {
console.log("this.props.searchcompanyLoanData?.data?.EMI_schedule",this.props.searchcompanyLoanData?.data);
const currentYear = new Date().getFullYear();
        let storage = getsessionStorage();
        const selectedRole = this.storage.role_name
        // const { user_rights } = this.props;
        const AddRights = UserRightsAuthorization(this.props.menuAccess[selectedRole], 'cash_bank__loan_accounts', 'can_create')
        const ExportRights =  UserRightsAuthorization(this.props.menuAccess[selectedRole], 'cash_bank__loan_accounts', 'can_export')
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Company Loan </title>
      </Helmet>
      {
  this.state.rowPopup.open === true && (
    <div style={{
      // padding: '0 10px',
      height: '88vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',  
      scrollbarWidth: 'none',   
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      <LoanDetail 
        handleclose={this.handlerowpopupclose}
        data={this.state.rowPopup.data}
        handleSubmit={this.handleSubmit}
      />
      
      {this.state.rowPopup.data?.EMI_schedule && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6" align="left">
            EMI Schedule
          </Typography>

          {Object.keys(this.state.rowPopup.data.EMI_schedule).map((year) => (
            <Accordion key={year} defaultExpanded={parseInt(year) === currentYear}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h4">{year}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <TableContainer component={Paper} sx={{ backgroundColor: "#F4F7FE" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Month</strong></TableCell>
                        <TableCell><strong>Principal Paid</strong></TableCell>
                        <TableCell><strong>Interest Charged</strong></TableCell>
                        <TableCell><strong>Total Payment</strong></TableCell>
                        <TableCell><strong>Balance</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.rowPopup.data.EMI_schedule[year].map((emi, index) => (
                        <TableRow key={index}>
                          <TableCell>{emi.Month}</TableCell>
                          <TableCell>
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
                              {emi.Principal_Paid}
                            </div>
                          </TableCell>
                          <TableCell>
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
                              {emi.Interest_Charged}
                            </div>
                          </TableCell>
                          <TableCell>
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
                              {emi.EMI}
                            </div>
                          </TableCell>
                          <TableCell>
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
                              {emi.Remaining_Balance}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  )
}

        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              ></AlertDialog>

              {this.state.open === false && this.state.rowPopup.open === false && (
                <MaterialTable
                  totalCount={
                    this.props.searchcompanyLoanData.numRows

                  }
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
                          <div style={{width: '100%'}}>
                            <MTableToolbar {...props} />
                          </div>
                          <div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                          </div>
                        </div>
                      </>
                    ),
                    Pagination: (props) => (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          borderTop: 'none',
                          boxShadow: 'none',
                          padding: '8px 16px',
                          borderBottom: 'none',
                        }}
                      >
                        <TablePagination
                          {...props}
                          style={{
                            borderTop: 'none',
                            borderBottom: 'none',
                            boxShadow: 'none',
                            width: 'auto',
                          }}
                        />
                      </div>
                    ),
                  }}
                  actions={[
                    // {
                    //   icon: () => <CheckIcon />,
                    //   tooltip: 'Check_Icon',
                    //   position: 'row',
                    //   onClick: (event, rowData) =>
                    //     this.handleClickOpen(rowData.id),
                    // },
                    AddRights ? {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({open: true, status: 'create'}),
                    } : null,
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) =>
                    this.handlePageSizeChange(size)
                  }
                  options={getStickyTableOptions({
                    headerStyle,
                    bodyOffset: 200,
                    cellStyle,
                    options:{
                       showEmptyDataSourceMessage: this.props.searchcompanyLoanData?.data?.length === 0 && this.state.isApiFinished ? true : false,
                    
                    search: false,
                    exportButton:ExportRights ? true : false,
                    filtering: false,
                    tableLayout: "auto",
                    toolbar: true,
                    // maxBodyHeight: maxBodyHeight,
                    // minBodyHeight: maxBodyHeight,
                     pageSize: pageSize,
                    pageSizeOptions: [20, 50, 100],
                    // totalCount: this.props.leads_count,
                    actionsColumnIndex: -1,
                     exportMenu: ExportRights ? [
                    {
                    label: 'Export PDF',
                    exportFunc: (cols, datas) => {
                      const exportColumns = cols
                        .filter(col => col.field && col.export !== false)
                        .map(col => ({
                          ...col,
                          title:
                            typeof col.title === 'object'
                              ? col.title.props.children
                              : col.title,
                        }));

                      ExportPdf(exportColumns, this.props.searchcompanyLoanData?.data, 'Company Loan Report');
                    },
                  },
                  {
                    label: 'Export Excel',
                    exportFunc: (cols, datas) => {
                      const exportColumns = cols
                        .filter(col => col.field && col.export !== false)
                        .map(col => ({
                          ...col,
                          title:
                            typeof col.title === 'object'
                              ? col.title.props.children
                              : col.title,
                        }));

                      ExportCsv(exportColumns, this.props.searchcompanyLoanData?.data, 'Company Loan Report');
                    },
                  },
                  ] : [],
                    }
                  })}
                  onRowClick={(evt, rowData) => {
                    this.setState({
                      rowPopup: {
                        open: true,
                        data: rowData,
                      },
                    });
                  }}
                  page={this.state.page}

                  columns={[
                    {
                      field: 'typeName',
                      title: 'Type',
                    },
                    {
                      field: 'bank_name',
                      title: 'Bank Name',
                    },
                    {
                      field: 'ROI_amount',
                      title: 'ROI Amount',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                    {
                      field: 'ROIPeriodName',
                      title: 'ROI Period',
                    },
                    {
                      field: 'EMI_amount',
                      title: 'EMI Amount',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                    {
                      field: 'tenor_of_loan',
                      title: 'Tenor Of Loan',
                    },
                    {
                      field: 'EMI_date',
                      title: 'EMI Date',
                      render: (rowData) => (
                        commonDateFormat(rowData.EMI_date)
                      )
                    },
                    {
                      field: 'RepaymentFrequencyPeriod',
                      title: 'Repayment Frequency Period',
                    },
                    {
                      field: 'repayment_frequency_days',
                      title: 'Repayment Frequency Days',
                    },
                    {
                      field: 'processing_fee',
                      title: 'Processing Fee',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                    {
                      field: 'document_charges',
                      title: 'Document Charges',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                    {
                      field: 'other_charges',
                      title: 'Other Charges',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                    {
                      field: 'net_amount',
                      title: 'Net Amount',
                      align: 'right', 
                      cellStyle: { textAlign: 'right', paddingRight: '10px' },
                    },
                  ]}
                  data={
                    // this.props.search_leads
                    this.props.searchcompanyLoanData.data 
                  }
                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Company Loans</Typography>}
                />
              )}
              {this.state.open === true && (
                <NewAllLoans
                  // edit_id_data={this.props.leads_id_data}
                  status={this.state.status}
                  type='leads'
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  handleDelete={this.handleDelete}
                  handleDeactive={this.handleDeactive}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                />
              )}
            
            </div>
          )}
        </CreateNewButtonContext.Consumer>        
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    companyLoanData: state.AllLoansReducer.companyLoanData || [],
    searchcompanyLoanData:state.AllLoansReducer.searchcompanyLoanData || [],
     menuAccess: state.rbacReducer.menuAccess || []
    // user_rights : state.roleReducer.user_rights
    // leads: state.leadsReducer.leads,
    // leads_by_pagination: state.leadsReducer.leads_by_pagination,
    // leads_id_data: state.leadsReducer.leads_id_data,
    // leads_count: state.leadsReducer.leads_count,
    // chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    // product: state.productReducer.product,
    // search_leads: state.leadsReducer.search_leads,
    // search_leads_count: state.leadsReducer.search_leads_count,
    // taxcategory: state.taxCategoryReducer.taxcategory,
    // vendor:state.vendorReducer.vendor
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    // listLeadsAction: (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => {
    //   return dispatch(listLeadsAction(setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));
    // },
     getMenuAccessAction:(selectedRole)=>{
              dispatch(getMenuAccessAction(selectedRole))
            },
    listAllLoansAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listAllLoansAction(setModalTypeHandler, setLoaderStatusHandler));
    },
      getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
    // listLeadsByPaginationAction: (
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   data,
    // ) => {
    //   return dispatch(
    //     listLeadsByPaginationAction(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       data,
    //     ),
    //   );
    // },
    createAllLoanssAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      // sample,
    ) => {
      return dispatch(
        createAllLoanssAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          // sample,
        ),
      );
    },

    setsearchCompanyLoanAction: (val ) => { return dispatch(setsearchCompanyLoanAction(val))
    },
    getSearchCompanyLoanAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchCompanyLoanAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    // getbyidLeadsAction: (id, alertResponce) => {
    //   return dispatch(getbyidLeadsAction(id, alertResponce));
    // },
    // updateLeadsAction: (
    //   id,
    //   data,
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   sample,
    // ) => {
    //   return dispatch(
    //     updateLeadsAction(
    //       id,
    //       data,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       sample,
    //     ),
    //   );
    // },
    // deleteLeadsAction: (
    //   id,
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   sample,
    // ) => {
    //   return dispatch(
    //     deleteLeadsAction(
    //       id,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       sample,
    //     ),
    //   );
    // },
    // updateInvoiceModelAction: (id, data) => {
    //   return dispatch(updateInvoiceModelAction(id, data));
    // },
    // setSearchLeadsAction: (val ) => { return dispatch(setSearchLeadsAction(val))
    // },
    // getSearchLeadsAction: (
    //   val, 
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   ) => { 
    //   return dispatch(
    //     getSearchLeadsAction(
    //       val, 
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       )
    //     );
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllLoans);

