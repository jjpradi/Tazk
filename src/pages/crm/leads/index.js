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
  leadsPaginationAction,
} from '../../../redux/actions/leads_actions';
import AlertDialog from '../../common/Dialog';
// import {listChartOfAccountsAction} from '../../redux/actions/chartOfAccounts';
import {listProductAction} from '../../../redux/actions/product_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NewLeads from '../../../components/NewLeads';
import CheckIcon from '@mui/icons-material/Check';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
  Typography
} from '@mui/material';
import {ConstructionOutlined} from '@mui/icons-material';
import {commonDateFormat, getDateTime} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';

class Leads extends Component {
  static contextType = CreateNewButtonContext;
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
      pageSize: 20,
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
      isApiFinished: false
    };
  }

  async componentDidMount() {
    this.props.setSearchLeadsAction({ data: [], numRows: 0 });
    const context = this.context;
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString: this.state.searchVal,
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // //this.props.listLeadsAction(),
      // this.props.listLeadsByPaginationAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   {searchString:this.state.searchVal, pageCount: 0, numPerPage: pageSize },
      // ),
      // this.props.listChartOfAccountsAction(),
      // this.props.listTaxCategoryAction(),
      // this.props.listVendorAction(),
      this.props.leadsPaginationAction(body)
    ).finally(() => this.setState({ isApiFinished: true }));

    if (this.props.setModalStatusHandler) this.setState({ open: true });
    // if (this.props.product.length < 1)
    //   this.props.listProductAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
    
    //let val = e.target.value
  }

  handleEdit = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidLeadsAction(id)
	  );
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteLeadsAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.sample,
      )
	  );
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

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateInvoiceModelAction(
          this.state.dialogId,
          this.state.invoiceData,
        ), //, record
        // await this.setState({ open: false })
        this.props.listLeadsAction(),
      );
    } else if (
      this.state.invoiceData.reason !== '' &&
      this.state.invoiceData.reason !== null
    ) {
      this.setState({openDialog: false}); //, errormsg : "", errmsg :""
      this.state.invoiceData.status = 'close';

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateInvoiceModelAction(
          this.state.dialogId,
          this.state.invoiceData,
        ), //, record
        // await this.setState({ open: false })
        this.props.listLeadsAction(),
        
      );
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
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchLeadsAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
      // this.props.listLeadsAction(),
	  );

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
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({pageSize: size}, async () => {
      // const context = this.context;
      // await this.props.getlimitdatafromproduct(context.setModalTypeHandler,context.setLoaderStatusHandler,{ pageCount: this.state.page || 1,
      //   numPerPage: size })
      const context = this.context;
      const body = {
        numPerPage: this.state.pageSize,
        pageCount: this.state.page,
        searchString: this.state.searchVal,
        employee_id: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getSearchLeadsAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      );
    });
  };

  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 +  pageSize) * page,
    //      pageSize * (page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({page: page});
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listLeadsByPaginationAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     {pageCount: page || 0, numPerPage:  pageSize},
    //   )
	  // );
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: page || 0,
     searchString:this.state.searchVal,
     employee_id:context.commoncookie,
     headerLocationId:context.headerLocationId
   }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getSearchLeadsAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      ) 
    );
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
  handleSubmit = async (data) => {
    const context = this.context;
    // const values = data
    // for (let val in values) {
    //   if(val==='is_serialized'){
    //   values[val]=values[val]===true ? 1 : 0
    // }
    // }
    // const {accountBalance,amount,code,...record} = values
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateLeadsAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      );
       //, record
      // await this.setState({ open: false })
    } else {
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })
      // if(this.props.setModalStatusHandler)
      // this.props.setModalStatusHandler(false)
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createLeadsAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
        )
      );
    }
  };
  handleDeactive = async (data, status) => {
    const context = this.context;
    const active = {is_active: status};
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateLeadsAction(data.id, active)
      );
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
    const body = {
      numPerPage: this.state.pageSize,
      pageCount: 0,
      searchString:'',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.props.getSearchLeadsAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };

  requestSearch = (e) => {
    this.setState({searchData: [], searchPageData: [], page: 0});
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val});

    // if(val.trim() !== ''){
      this.props.setSearchLeadsAction({data:[], numRows:0})
    // }
    const body = {
      numPerPage : this.state.pageSize,
      pageCount: 0,
      searchString:val,
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.getSearchLeadsAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };
  render() {
    // const filteredCol = leads_col.length ? leads_col.map((d) => ({ title: d, field: d }))
    //   : this.props.leads[0] ?
    //     Object.keys(this.props.leads[0]).map((o) => ({ title: o, field: o })) : []
    // const error = this.state.invoiceData.invoice !== "";
    // const err = this.state.invoiceData.reason !=="";

    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Leads </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, setLoaderStatusHandler}) => (
            <div
              // style={{
              //   width: this.context.drawerOpen
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
                style={{height:'89vh',overflow:'hidden'}}
                  totalCount={
                    // this.state.searchVal
                    //   ? this.state.searchPageData.length
                    //   : this.props.leads_count || 0
                    this.props.search_leads_count

                  }
                  components={{
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
                  }}
                  actions={[
                    {
                      icon: () => <CheckIcon />,
                      tooltip: 'Check_Icon',
                      position: 'row',
                      onClick: (event, rowData) =>
                        this.handleClickOpen(rowData.id),
                    },
                    // {
                    //   icon: 'delete',
                    //   tooltip: 'Delete',
                    //   onClick: (event, rowData) => this.handledialog(rowData.id)
                    // },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({open: true, status: 'create'}),
                    },
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
                    exportButton: true,
                    filtering: false,
                    maxBodyHeight: maxBodyHeight,
                     pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.props.leads_count,
                    actionsColumnIndex: -1,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                          {
                            apiCalls(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
                              this.props.listLeadsAction(
                                setModalTypeHandler,
                                setLoaderStatusHandler,
   
                              (exportData) => {
                                ExportPdf(
                                  cols,
                                  exportData,
                                  'LeadsData',
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
                            this.props.listLeadsAction(
                              setModalTypeHandler,
                              setLoaderStatusHandler,
  
                            (exportData) => {
                              ExportCsv(
                                cols,
                                exportData,
                                'LeadsData',
                              );
                            },
                          )
                          );
                        }
                      },
                    ],
                  }}
                  page={this.state.page}
                  // columns={filteredCol}
                  columns={[
                    // {
                    //   field:'id',
                    //   title:'ID',
                    // },
                    {
                      field: 'first_name',
                      title: 'Customer',
                    },
                    {
                      field: 'date',
                      title: 'Date',
                    },
                    {
                      field: 'name_other',
                      title: 'Item',
                    },
                    {
                      field: 'note',
                      title: 'Note',
                    },
                    {
                      field: 'required_on',
                      title: 'Required On',
                      render: (rowData) => (
                        commonDateFormat(rowData.required_on)
                      )
                    },
                    // {
                    //   field:'specialNumber',
                    //   title:'Special Number',
                    // },
                    // {
                    //   field:'entity',
                    //   title:'Entity',
                    // },
                    {
                      field: 'status',
                      title: 'Status',
                    },
                    // {
                    //   field:'creationDate',
                    //   title:'Creation Date',
                    // },
                  ]}
                  data={
                    // this.props.search_leads.length > 0 ||  this.state.searchVal.length > 0 ? 
                    // this.props.search_leads :
                    //   ( this.state.searchData ? this.state.searchData 
                    //   : this.props.leads_by_pagination)
                    //this.props.search_leads.length > 0 || this.state.searchVal.length > 0 ?
                    this.props.search_leads 
                    //: this.props.leads_by_pagination
                  }
                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Leads</Typography>}
                />
              )}
              {this.state.open === true && (
                <NewLeads
                  edit_id_data={this.props.leads_id_data}
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
        <Dialog
          open={this.state.openDialog}
          onClose={this.handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
          fullWidth={true}
          maxWidth='md'
        >
          <DialogTitle id='alert-dialog-title'>{'INVOICE NUMBER'}</DialogTitle>
          <DialogContent>
            <FormControl>
              {/* <FormLabel id="demo-controlled-radio-buttons-group">
                Gender
              </FormLabel> */}
              <RadioGroup
                row
                aria-labelledby='demo-controlled-radio-buttons-group'
                name='controlled-radio-buttons-group'
                value={this.state.value}
                onChange={this.handleChange1}
              >
                <FormControlLabel
                  value='Billed'
                  control={<Radio />}
                  label='Billed'
                />
                <FormControlLabel
                  value='UnBilled'
                  control={<Radio />}
                  label='UnBilled'
                />
              </RadioGroup>
            </FormControl>

            {/* <DialogContentText id="index-dialog-description">
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText> */}
            {this.state.value === 'Billed' && (
              <>
                <TextField
                  margin='dense'
                  id='invoiceNo'
                  name='invoice'
                  onChange={this.handleChange}
                  onBlur={() =>
                    this.state.invoiceData.invoice === ''
                      ? this.setState({invoice: true})
                      : this.setState({invoice: false})
                  }
                  placeholder='Enter Invoice Number'
                  label='Bill/Invoice Number'
                  type='number'
                  error={this.state.invoice}
                  helperText={this.state.invoice ? 'Invoice is Required' : ''}
                  required={true}
                  fullWidth={true}
                  onWheel={ (e) => e.target.blur()}
                  variant='standard'
                />
                {/* <div style={{color: 'red'}}>
                  {this.state.invoice ? 'Invoice is required' : ' '}
                </div> */}
              </>
            )}
            {this.state.value === 'UnBilled' && (
              <>
                <TextField
                  margin='dense'
                  id='reason'
                  required={true}
                  name='reason'
                  onChange={this.handleChange}
                  onBlur={() =>
                    this.state.invoiceData.reason === ''
                      ? this.setState({reason: true})
                      : this.setState({reason: false})
                  }
                  placeholder='Enter Reason'
                  label='Reason'
                  type='text'
                  error={this.state.reason}
                  helperText={this.state.reason ? 'Reason is Required' : ''}
                  multiline={true}
                  fullWidth={true}
                  variant='standard'
                />
                {/* <div style={{color: 'red'}}>
                  {this.state.reason ? 'Reason is required' : ' '}
                </div> */}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCancel} color='secondary'>
              CANCEL
            </Button>
            <Button onClick={this.handleDialogClose} color='primary'>
              CLOSE
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    leads: state.leadsReducer.leads,
    leads_by_pagination: state.leadsReducer.leads_by_pagination,
    leads_id_data: state.leadsReducer.leads_id_data,
    leads_count: state.leadsReducer.leads_count,
    // chartOfAccounts: state.ChartOfAccountsReducer.chartOfAccounts,
    product: state.productReducer.product,
    search_leads: state.leadsReducer.search_leads,
    search_leads_count: state.leadsReducer.search_leads_count,
    // taxcategory: state.taxCategoryReducer.taxcategory,
    // vendor:state.vendorReducer.vendor
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listLeadsAction: (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => {
      return dispatch(listLeadsAction(setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack));
    },
    listLeadsByPaginationAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
    ) => {
      return dispatch(
        listLeadsByPaginationAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
        ),
      );
    },
    // listProductAction: () => {
    //   return dispatch(listProductAction());
    // },
    // listChartOfAccountsAction: () => {
    //   dispatch(listChartOfAccountsAction())
    // listChartOfAccountsAction: () => {
    //   dispatch(listChartOfAccountsAction())
    // },
    createLeadsAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        createLeadsAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidLeadsAction: (id, alertResponce) => {
      return dispatch(getbyidLeadsAction(id, alertResponce));
    },
    updateLeadsAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateLeadsAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteLeadsAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        deleteLeadsAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    updateInvoiceModelAction: (id, data) => {
      return dispatch(updateInvoiceModelAction(id, data));
    },
    leadsPaginationAction: (data) => {
      return dispatch(leadsPaginationAction(data));
    },
    setSearchLeadsAction: (val ) => { return dispatch(setSearchLeadsAction(val))
    },
    getSearchLeadsAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchLeadsAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    // listCustomerAction: () => {
    //   dispatch(listCustomerAction())
    // },
    // listTaxCategoryAction: () => {
    //   dispatch(listTaxCategoryAction())
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Leads);

