import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewPosCreation from '../../../components/NewPosCreation';
import {
 
  updatePosCreationAction,
  getbyidPosCreationAction,
  deletePosCreationAction,
  createPosCreationAction,
  locationposAction,
  set_searchPoscreateAction,
  get_searchPoscreateAction,
  posCreationPaginationAction
} from '../../../redux/actions/pos_creations_actions';
import {listStockPosAction} from '../../../redux/actions/stock_Pos_actions';
import {listCashBoxAction} from '../../../redux/actions/cash_box_actions';
import {listPaymentMethodAction} from '../../../redux/actions/payment_method_actions';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { InputAdornment, TextField, Typography } from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';

class PosCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      currentPage:0,
      searchVal: '',
      count: 0,
      page: 0,
      pageSize: pageSize,
      isApiFinished: false
    };
  }

  async componentDidMount() {
    this.props.set_searchPoscreateAction({ data: [], numRows: 0 })
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
      this.props.posCreationPaginationAction(body),
      this.props.listPaymentMethodAction()
    ).finally(() => this.setState({isApiFinished: true}))
    
    // this.props.get_searchPoscreateAction(
    //   body,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler
    // )

    // await this.props.locationposAction(
    //   context.headerLocationId,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   ()=>{},

    // );
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.listPaymentMethodAction(),
    //   this.props.listStockLocationAction(
    //     context.commoncookie,
    //     context.headerLocationId,
    //   ),
    //   this.props.listStockPosAction(),
    //   this.props.listCashBoxAction(context.headerLocationId)
    //   );

    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  headerUpdate = 'null';
  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    let headerLocationId = context.headerLocationId
    if (headerLocationId!==this.headerUpdate) {
      this.headerUpdate = headerLocationId
//............................................................
      this.props.set_searchPoscreateAction({ data: [], numRows: 0 });
      const context = this.context;
  
      const body = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: '',
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      this.props.get_searchPoscreateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )

      // apiCalls(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   this.props.locationposAction(
      //     context.headerLocationId,
      //     context.setModalTypeHandler,
      //     context.setLoaderStatusHandler,
      //     ()=>{},
          
      //   )
      // );
    }

    // page size
    if (prevState.pageSize !== this.state.pageSize) {

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
        this.props.posCreationPaginationAction(body)
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
        this.props.posCreationPaginationAction(body)
      )
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
  }

  handlePageChange = async (page) => {
    this.setState({ page: page })
  }

  handleEdit = (edit_data) => {
    this.setState({edit_id_data: edit_data, open: true});
  };
  handleDelete = async (id) => {
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
      this.props.deletePosCreationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  ).then(res => {
      this.props.posCreationPaginationAction(body)
    });
    
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('posCreation', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('posCreation', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  sample =async (value) => {
    // const context = this.context;
    // await this.props.locationposAction(
    //   context.headerLocationId,
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   ()=>{} )

    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    this.setState({ page : data.posId ? this.state.page : 0})
    const body = {
      pageCount: data.posId ? this.state.page : 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    if (data.posId) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updatePosCreationAction(
          data.posId,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
        ).then(res => {
          this.props.posCreationPaginationAction(body)
      });
      await this.setState({open: false});
    } else {
      const id = this.props.stock_pos_list[0]?.sequence_id;
      const current_seq = this.props.stock_pos_list[0]?.current_seq;

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
       await this.props.createPosCreationAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          id,
          {current_seq},
        ),
        ).then(res => {
          this.props.posCreationPaginationAction(body)
      });

      await this.setState({open: false});
    }
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_searchPoscreateAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.posCreationPaginationAction(body)
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page : 0});

    this.props.set_searchPoscreateAction({ data: [], numRows: 0 })
    
    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString:val,
      employee_id:context.commoncookie,
      headerLocationId:context.headerLocationId
    }
    this.props.get_searchPoscreateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
    )
  };

  render() {
    // const { classes } = styles();
    return (
      <React.Fragment>
         <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Pos Creation </title>
      </Helmet>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler, drawerOpen, setLoaderStatusHandler, headerLocationId}) => (
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

                  totalCount={this.props.search_poscreate_count || 0}

                  components={{
                    Toolbar: (props) => (
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
                  ),
                }}

                  // style={{width : '98%'}}
                  actions={[
                    {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      fixedColumns: true,
                      onClick: (event, rowData) =>
                        this.handleEdit(rowData),
                    },
                    {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handledialog(rowData.posId),
                    },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({edit_id_data: [], open: true, isApiFinished: false}),
                    },
                  ]}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                  options={{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    search:false,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxBodyHeight,
                    pageSize: this.state.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.props.search_poscreate_count,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                        {
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.locationposAction( 
                              headerLocationId, 
                              setModalTypeHandler, setLoaderStatusHandler,               
                            (exportData) => {
                              ExportPdf(
                                cols,
                                exportData,
                                'PosListData',
                              );
                            },
  
                          )
                          );
                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) => {
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            this.props.locationposAction(
                              headerLocationId,
                              setModalTypeHandler, setLoaderStatusHandler,
                              (exportData) => {
                                ExportCsv(
                                  cols,
                                  exportData,
                                  'PosListData',
                                );
                              },
                            )
                          );
                        }
                      },
                    ],
                    // fixedColumns: {
                    //   right: 1
                    // }
                  }}
                  page={this.state.page}
                  columns={[
                    // {scrollX:10},
                    {title: 'Pos Name', field: 'posName'},
                    {title: 'Stock Location', field: 'location_name'},
                    {title: 'Status', field: 'status'},
                    // { title: 'ClosingDate', field: 'closingDate' },
                    {title: 'Reason', field: 'reason'},
                    {title: 'TaxInvoice Sequence', field: 'taxInvoiceSequence'},
                    {title: 'TaxInvoice Header', field: 'taxInvoiceHeader'},
                    {title: 'TaxInvoice Footer', field: 'taxInvoiceFooter'},
                    // { title: 'TaxInvoiceHeader', field: 'taxInvoiceHeader'},
                    // { title: 'TaxInvoiceFooter', field: 'taxInvoiceFooter'}
                  ]}
                  // data={
                  //   this.props.search_poscreate_data.length > 0 || this.state.searchVal.length > 0 ? this.props.search_poscreate_data :
                  //   this.props.pos_creation
                  //     ? this.props.pos_creation
                  //         .slice(0, this.props.pageSize)
                  //         .map((r) => {
                  //           const {tableData, ...record} = r;
                  //           return record;
                  //         })
                  //     : []
                  // }

                  data = {this.props.search_poscreate_data}

                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                      Pos List
                    </Typography>}
                />
              )}
              {this.state.open && (
                <NewPosCreation
                  edit_id_data={this.state.edit_id_data}
                  handleClose={this.handleClose}
                  handle_Submit={this.handleSubmit}
                  {...this.props}
                  matches={this.props.search_poscreate_data}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  sample = {this.sample}
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
    pos_creation: state.posCreationReducer.location_pos || [],
    paymentMethod: state.paymentMethodReducer.paymentMethod || [],
    stocklocation: state.stockLocationReducer.stocklocation || [],
    cash_box_list: state.cashBoxReducer.cash_box_list || [],
    stock_pos_list: state.stockPosReducer.stock_pos_list || [],
    search_poscreate_data: state.posCreationReducer.search_poscreate_data || [],
    search_poscreate_count: state.posCreationReducer.search_poscreate_count || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    locationposAction: (headerLocationId, setModalTypeHandler, setLoaderStatusHandler, exportCallBack) => {
      return dispatch(
        locationposAction(headerLocationId,setModalTypeHandler, setLoaderStatusHandler, exportCallBack),
      );
    },
    listStockPosAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listStockPosAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    createPosCreationAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      id,
      current_seq,
      // sample
    ) => {
      return dispatch(
        createPosCreationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          current_seq,
          // sample
        ),
      );
    },
    getbyidPosCreationAction: (id) => {
      dispatch(getbyidPosCreationAction(id));
    },
    updatePosCreationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updatePosCreationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    deletePosCreationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deletePosCreationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listPaymentMethodAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listPaymentMethodAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listStockLocationAction: (commoncookie, headerLocationId) => {
      return dispatch(listStockLocationAction(commoncookie, headerLocationId));
    },
    listCashBoxAction: (location_id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listCashBoxAction(location_id, setModalTypeHandler, setLoaderStatusHandler));
    },
    set_searchPoscreateAction: (val ) => { return dispatch(set_searchPoscreateAction(val))
    },
    get_searchPoscreateAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchPoscreateAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    posCreationPaginationAction: (data) => { 
      return dispatch(posCreationPaginationAction(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PosCreation); //(withStyles(styles)

