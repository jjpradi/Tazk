import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import React, { Component } from 'react'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { TextField, InputAdornment, Typography, Card } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from '@mui/icons-material/Clear';
import { connect } from 'react-redux';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import {chequeReportAction, pendingChequeReportPaginationAction, searchChequeReportAction, searchChequeReportState} from '../../../redux/actions/reports_actions';
import apiCalls from 'utils/apiCalls';
import { pageSize, headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import DataGridTemp from 'components/dataGridTemp';
import {Helmet} from "react-helmet-async";
import { titleURL } from 'http-common';

class ChequeReport extends Component {
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
      erp_id: '',
      count: 0,
      page: 0,
      edit_id_data: [],
      rowPopup: {open: false, rowIndex: '', item_id: ''},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      pageSize: 100,
      columnData: [
        {headerName: 'ID', field: 'id', width: 100},
        {headerName: 'Date', field: 'sale_date', width: 200},
        {headerName: 'Customer Name', field: 'customername', width: 300},
        // {headerName: 'Cheque bank', field: '', width: 150},
        // {headerName: 'Cheque Number', field: '', width: 0},
        {headerName: 'Cheque Date', field: 'chequedate', width: 200},
        {headerName: 'Cheque Value', field: 'cheque_amount', width: 200},
        {headerName: 'Invoice number', field: 'invoice_number', width: 200},
        {headerName: 'Invoice date', field: 'invoice_date', width: 200},
        // {headerName: 'Invoice Amount', field: '', width: 150},
      ],
      columns: {},
      title: 'Pending Cheque Reports',
      isApiFinished: false
    };
  }


  async componentDidMount() {
    this.props.searchChequeReportState([]);
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
        
        

        this.props.pendingChequeReportPaginationAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler)
    ).finally(() => this.setState({isApiFinished: true}));
      // this.props.chequeReportAction(context.setModalTypeHandler, context.setLoaderStatusHandler, )
    // this.props.salesReportDataInPagination(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, context.setLoaderStatusHandler, {
    //   pageCount: 0,
    //   numPerPage:  pageSize
    // })
  }


  // handlePageSizeChange = async (size) => {
  //   if (this.state.searchVal) {
  //     this.setState({ pageSize: size })
  //     let pageChangeData = this.state.searchPageData?.slice((0 + size) * (this.state.page), size * (this.state.page + 1))
  //     return this.setState({ searchData: pageChangeData })
  //   }

  //   this.setState({ pageSize: size }, async () => {
  //     const context = this.context;
  //     this.props.paginatedPurchaseReportAction(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, context.setLoaderStatusHandler, {
  //       pageCount: this.state.page || 0,
  //       numPerPage: size
  //     })
  //   })
  // }


  // handlePageChange = async (page) => {
  //   if (this.state.searchVal) {
  //     this.setState({ page: page })
  //     let pageChangeData = this.state.searchPageData?.slice((0 +  pageSize) * (page),  pageSize * (page + 1))
  //     return this.setState({ searchData: pageChangeData })
  //   }

  //   this.setState({ page: page })
  //   const context = this.context;
  //   this.props.paginatedPurchaseReportAction(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, context.setLoaderStatusHandler, {
  //     pageCount: page || 0,
  //     numPerPage:  pageSize
  //   })
  // }

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size})
    const context = this.context;

    const body = {
      pageCount:this.state.page,
      numPerPage: size,
      searchString:this.state.searchVal,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.pendingChequeReportPaginationAction(body)
    )
  }
  handlePageChange = async (page) => {
    const context = this.context;
    this.setState({ page: page })
    
    const body = {
      pageCount:page,
      numPerPage: this.state.pageSize,
      searchString:this.state.searchVal,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.pendingChequeReportPaginationAction(body)
    )
  }
  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});

    // if(val.trim() !== ''){
      this.props.searchChequeReportState([])
    // }
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:val,
      employeeId:context.commoncookie,
      headerLocationId:context.headerLocationId    }
    this.props.searchChequeReportAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  cancelSearch = (e) => {
    // this.setState({searchVal: ''});
    // this.props.searchChequeReportState([])
    const context = this.context;
    this.setState({searchPageData: [], page: 0, searchVal: ''});
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
      this.props.pendingChequeReportPaginationAction(body)
    )

  }

  render() {
    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Cheque Report </title>
       </Helmet>
        <CreateNewButtonContext.Consumer>
          {({drawerOpen, setModalTypeHandler, setLoaderStatusHandler}) => (
            // <div style={{ width: drawerOpen ? 'calc(100vw - 400px)' : 'calc(100vw - 143px)' }}>
            (<React.Fragment>
              {/* <MaterialTable
                //totalCount={this.state.searchVal ? this.state.searchPageData.length : this.props.purchases || 0}
                components={{
                  Toolbar: props => (
                    <>
                      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <div style={{ width: '100%' }} >
                          <MTableToolbar {...props} />
                        </div>
                        <div>
                          {/* <TextField
                            autoFocus={this.state.searchVal ? true : false}
                            sx={{
                              width: "250px",
                              borderRadius: "8px",
                              pr: '20px',
                              '& .MuiOutlinedInput-root': {
                                height: '50px'
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <ClearIcon
                                    onClick={this.cancelSearch}
                                    sx={{ cursor: 'pointer' }} />
                                </InputAdornment>
                              ),
                            }}
                            placeholder='Search'
                            value={this.state.searchVal}
                            onChange={(e) => this.requestSearch(e.target.value)}
                          /> 
                        </div>
                      </div>
                    </>

                  ),
                }}

                options={{
                  headerStyle,
                  cellStyle,
                  // search: true,
                  exportButton: true,
                  filtering: false,
                  actionsColumnIndex: -1,
                  maxBodyHeight,
                  // pageSize: pageSize,
                  pageSizeOptions: [20, 50, 100],
                  //totalCount: this.state.purchase_count,
                  exportMenu: [{
                    label: 'Export PDF',
                    exportFunc: (cols, datas) => {
                      
                      apiCalls(
                        setModalTypeHandler, 
                        setLoaderStatusHandler,
                        this.props.chequeReportAction(
                       
                          setModalTypeHandler, 
                          setLoaderStatusHandler,
                        (exportData) => {
                          ExportPdf(
                            cols,
                            exportData,
                            'Cheque Report',
                          );
                        },
                      )
                      );
                    }
                  }, {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) => {
                      
                      apiCalls(
                        setModalTypeHandler, 
                        setLoaderStatusHandler,
                        this.props.chequeReportAction(
                       
                          setModalTypeHandler, 
                          setLoaderStatusHandler,
                        (exportData) => {
                          ExportCsv(
                            cols,
                            exportData,
                            'Cheque Report',
                          );
                        },
                      )
                      );
                    }
                  }]
                }}

                // onPageChange={(page) => this.handlePageChange(page)}
                // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                page={this.props.page}

                columns={[
                  { title: 'Date', field: 'sale_date' },
                  { title: 'Customer Name', field: 'customername' },
                  { title: 'Cheque bank', field: '' },
                  { title: 'Cheque Number', field: '' },
                  { title: 'Cheque Date', field: 'chequedate' },
                  { title: 'Cheque Value', field: 'cheque_amount' },
                  { title: 'Invoice number', field: 'invoice_number' },
                  { title: 'Invoice date', field: 'invoice_date' },
                  { title: 'Invoice Amount', field: '' },
                ]}

                data={this.props.cheque_report}

                // data={
                //   searchVal ? searchData  : purchase_by_pagination
                // }

                title={<Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                Pending Cheque Reports</Typography>}
              />  */}
              <DataGridTemp
                 pageSize={this.state.pageSize}
                 page={this.state.page}
                 pageType= 'task'
                title={this.state.title}
                data={this.props.searchChequeReportData}
                  columns={this.state.columnData}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onPageSizeChange={(size) => this.handlePageSizeChange(size)}
                  rowCount={this.props.searchChequeReportData.numRows}

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
                //   ></TextField>
                // }
                requestSearch={(e) => this.requestSearch(e)}
                cancelSearch={this.cancelSearch}
                  // searchVal={this.state.searchVal}
                  isApiFinished={this.state.isApiFinished}
              />
            </React.Fragment>)
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    purchases: state.purchasesReducer.purchases || [],
    cheque_report: state.reportsReducer.cheque_report || [],
    searchChequeReportData: state.reportsReducer.searchChequeReportData || [],
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    chequeReportAction: (setModalTypeHandler, setLoaderStatusHandler, exportCallBack) => {
      return dispatch(chequeReportAction(setModalTypeHandler, setLoaderStatusHandler, exportCallBack))
    },
    searchChequeReportState: (val ) => { return dispatch(searchChequeReportState(val))
    },
    searchChequeReportAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        searchChequeReportAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },

    pendingChequeReportPaginationAction: (data) => { 
      return dispatch(pendingChequeReportPaginationAction(data));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChequeReport);



