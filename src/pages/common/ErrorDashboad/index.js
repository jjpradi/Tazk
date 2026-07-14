import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewBankCreation from '../../../components/BankCreation';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listErrorDashboardAction,
  sendMailErrorsAction,
} from '../../../redux/actions/errorDashboard_actions';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {TextField, InputAdornment, Typography, IconButton, Grid, Dialog, Button, Card, TablePagination} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import {Helmet} from "react-helmet-async";
import { commonDateFormat } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import EmailIcon from '@mui/icons-material/Email';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import moment from 'moment';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
// import { MTablePagination } from '@material-table/core';
import { MTablePagination } from 'utils/SafeMaterialTable';

class ErrorDashboard extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      page: 0,
      pageSize: 20,
      id: '',
      searchData: [],
      searchVal: '',
      searchPageData: [],
      isApiFinished: false,
      rowdataError: '',
      openEmailDialog: false,
      formValues: {issues: ''},
      formErrors: {issues: ''},
      requiredFields: ['issues']
    };
  }
  async componentDidMount() {
    const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    const body = {
      numPerPage: pageSize,
      pageCount: this.state.page,
      company_id: 'currentCompany'
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listErrorDashboardAction(body, context.setModalTypeHandler, context.setLoaderStatusHandler)
    ).finally((res) => this.setState({ isApiFinished: true }))
     
    // );
    // if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;

    const body = {
      numPerPage: this.state.pageSize,
      pageCount: this.state.page,
      company_id: 'currentCompany'
    }
    console.log(body, "JJJJH")

    // page size
    if (prevState.pageSize !== this.state.pageSize) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listErrorDashboardAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      );
    }

    //page 
    if (prevState.page !== this.state.page) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listErrorDashboardAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      );
    }
  }

    input = this.props.error_dashboard_list?.map((f) => 
     { return{
      level: f.level,
      message: f.message,
      meta: f.meta,
      date: f.timestamp,
      occurance: f.occurance,
      issueType: f.issueType,
      }
    }
  );
  
safeSplit = (val, key = ": ") => {
    return val && val.includes(key) ? val.split(key)[1] : '';
  };

  tableData = (dat) => { 
  return dat?.map((d) => {

    const message = d.message || '';
    const meta = d.meta || '';

    const parts = message.split(/,\s?/);
    const metaParts = meta.split(/,\s?/);

    const [
      route = '',
      method = '',
      requestBody = '',
      params = '',
      responseBody = '',
      companyId = '',
      employeeName = ''
    ] = parts;

    const [urls = ''] = metaParts;

    function extractEmployeeName(message) {
      const parts = message.split(',').map(part => part.trim());
      for (const part of parts) {
        if (part.includes("Employee_name")) {
          const startIndex = part.indexOf(":") + 1;
          return part.substring(startIndex).trim();
        }
      }
      return '';
    }

    const checkIssueType = (issueType) => {
      return issueType === null ? "Error" : issueType;
    };

    return {
      level: d.level,
      occurance: d.occurance,
      issueType: checkIssueType(d.issueType),
      date: d.timestamp || d.createdAt || d.created_at || null,

      route: this.safeSplit(route),
      method: this.safeSplit(method),
      body: this.safeSplit(requestBody, ":"),

      response: urls,
      company_id: this.safeSplit(companyId),
      employeeName: extractEmployeeName(message)
    };
  });
};
  formatErrorDate = (value) => {
  if (!value) return '-';
  const parsed = moment(value, ['YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true);
  if (!parsed.isValid()) return '-';
  return commonDateFormat(parsed.toDate());
  };
  

///nxt page func()////////-->
  handlePageChange = async (page) => {
    this.setState({ page: page });
    // const context = this.context;
    // const body = {
    //   numPerPage: pageSize,
    //   pageCount: page || 0,
    //   company_id: 'currentCompany'
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listErrorDashboardAction(
    //     body,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler
    //   )
    // );
  };
  /////page total row func()////
  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size }, async () => {
      // const context = this.context;
      // const body = {
      //   numPerPage: this.state.pageSize,
      //   pageCount: this.state.page,
      //   company_id: 'currentCompany'
      // }
      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.listErrorDashboardAction(
      //     body,
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler
      //   )
      // );
    })
  }

  sendMail = async (rowData) => {
    const context = this.context;
    this.setState({rowdataError: rowData})

    const body = {
content: rowData
    }
      await this.props.sendMailErrorsAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    // );
  }

   setStateHandler = async (name, value) => {
    let formObj = {};
  
    formObj = {
      ...this.formValues,
      [name]: value === '' ? null : value,
    };
  
    await this.setState({formValues: formObj});
  };
  
   handleChange = async (e) => {
    let {name, value} = e.target;
    if(name !== '') {
      this.setStateHandler(name, value);
    }
  };

   handleSubmit = async (event) => {
    const context = this.context;
    event.preventDefault();
  
    let isValid = true;
    let formErrorsObj = {...this.state.formErrors};
     Object.keys(this.state.formValues).map((key, i) => {
      if (
        this.state.requiredFields.includes(key) &&
        (this.state.formValues[key] === null || this.state.formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = 'This field is Required!';
      }
      return null;
    });
  
  
     this.setState({setFormErrors: formErrorsObj});
    
    if (isValid) {
      const body = {
        content: this.state.formValues.issues,
        type: 'Direct'
            }
              await this.props.sendMailErrorsAction(
                body,
                context.setModalTypeHandler,
                context.setLoaderStatusHandler
              )
      this.setState({openEmailDialog: false});
    }
    this.setState({
      // ...this.state.formValues,
      formValues: {issues: null}
    })
    
  };
  

  handleMailDialogOpen = () => {
    this.setState({openEmailDialog: true})
  }

  handleMailDialogClose = () => {
    this.setState({openEmailDialog: false})
  }


  render() {

    return (

      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Support </title>
         </Helmet>
         <Card sx={{ width: '100%'}}>
               <MaterialTable
                  totalCount={
                    this.props.error_dashboard_list_count
                  }
                  style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', }}
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
                          <IconButton
                    style={{ marginRight: '16px', align: 'right' }}
                    onClick={this.handleMailDialogOpen}
                  >
                    <EmailIcon />
                  </IconButton>
                        </div>
                      </>
                    ),
                    Pagination: (props) => (
                      <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "8px 16px",
                      }}>
                        <TablePagination
                        {...props}
                        count={this.props.error_dashboard_list_count || 0}
                        page={this.state.page}
                        rowsPerPage={pageSize || 20}
                        onPageChange={(page) => this.handlePageChange(page)}
                        onRowsPerPageChange={(event) =>
                    this.handlePageSizeChange(parseInt(event.target.value, 10))
                  }
                  labelRowsPerPage="Rows per page:"
                        />
                      </div>
                    ),
                  }}
          // style={{
          //   boxShadow: 'none',
          //   border: 'none',
          // }}
                  // onPageChange={(page) => this.handlePageChange(page)}
                  // onRowsPerPageChange={(size) =>
                  //   this.handlePageSizeChange(size)
                  // }
                  options={getStickyTableOptions({
                    bodyOffset: 200,
                    headerStyle,
          options:{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    cellStyle,
                    tableLayout: 'auto',
                    toolbar,
                    pageSize:pageSize,
                    pageSizeOptions: [20, 50, 100],
                    search: false,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    paging: true,
                    // maxBodyHeight:maxBodyHeight,
                    // minBodyHeight:maxBodyHeight,
                    // overflowY:'hidden'
              
                  }
                  })}
                   
                  //  page={this.state.page}
                  columns={[
                    {title: 'Employee', field: 'employeeName'},
                    {
                      title: ' Date',
                      field: 'date',
                      render: (r) => (
                       this.formatErrorDate(r.date)
                      )
                    },
                    {title: 'Route', field: 'route'},
                    // { title: 'Params', field: 'params' },
                    {title: 'Payload', field: 'body'},
                    {title: 'Method', field: 'method'},
                    {title: 'Response', field: 'response'},
                    { title: ' Issue Type', field: 'issueType' },
                    { title: ' Occurrence', field: 'occurance' },
                    {
                      title: 'Priority',
                      field: 'issueType', 
                      render: rowData => {
                        let priority;
                        switch (rowData.issueType) {
                          case 'error':
                            priority = 'High';
                            break;
                          case 'Not found':
                            priority = 'Medium';
                            break;
                          case 'Network-error':
                            priority = 'Highest';
                            break;
                          default:
                            priority = 'High'; 
                        }
                        return priority;
                      }
                    },
                    {
                      title: 'Send Mail',
                      field: 'SendMail',
                      render: (rowData) => (
                        <IconButton 
                          onClick={() => { 
                            this.sendMail(rowData)
                          }}
                        >
                          <ForwardToInboxIcon />
                        </IconButton> 
                      ),
                    }
                    // { title: 'Response', field: 'meta' },
                    // {title: 'Status', field: 'status'},
                    // { title: 'AccessedBy', field: 'accessedBy' },
                    // { title: 'AssignedBy', field: 'assignedBy' },
                  ]}
                  data={
                    this.props.error_dashboard_list.length > 0 ? this.tableData(this.props.error_dashboard_list) : []
                    //this.props.error_dashboard_list.data
                  }
                  title={<Typography fontFamily="sans-serif" fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)'>Support</Typography>}
                />
         </Card>   
        {this.state.openEmailDialog === true && (
        <Dialog  
        PaperProps={{
            sx: {
              width: "50%",
              maxWidth: "none",
            },
          }}
           open={this.state.openEmailDialog}
           >
     
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            p: 5
          }}
        >
          <Typography>Reach Us</Typography>
        <TextField
        onChange={this.handleChange}
        onBlur={this.handleChange}
            required={true}
            fullWidth={true}
            placeholder='Issue'
            name='issues'
            value={this.state.formValues.issues === null ? '' : this.state.formValues.issues}
            color='primary'
            type='text'
            regex=''
            variant='filled'
            error={this.state.formErrors.issues === null ? false : true}
            helperText={
              this.state.formErrors.issues === null ? '' : this.state.formErrors.issues
            }
          />
        </Grid>
        <Grid container justifyContent="flex-end" gap={5} sx={{p: 3}} >
        <Button  variant="contained" color="success" onClick={this.handleSubmit}>
          Send
        </Button>
        <Button variant="contained" color="error" onClick={this.handleMailDialogClose}>
          Close
        </Button>
        </Grid>
     
    </Dialog>
  )}
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    error_dashboard_list: state.ErrorDashboardReducer.error_dashboard_list || [],
    error_dashboard_list_count: state.ErrorDashboardReducer.error_dashboard_list_count,

  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listErrorDashboardAction: (body,setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listErrorDashboardAction(body,setModalTypeHandler, setLoaderStatusHandler));
    },
    sendMailErrorsAction: (data) => { 
      return dispatch(sendMailErrorsAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorDashboard);

