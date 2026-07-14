import React, {Component} from 'react';
import {connect} from 'react-redux';
import NewTaxRate from '../../../components/NewTaxRate';
import MaterialTable from 'utils/SafeMaterialTable';
import {
  listTaxRateAction,
  updateTaxRateAction,
  getbyidTaxRateAction,
  deleteTaxRateAction,
  createTaxRateAction,
} from '../../../redux/actions/taxRate_actions';
import AlertDialog from '../../common/Dialog';
import {listTaxCodesAction} from '../../../redux/actions/taxcodes_actions';
// import {listProductCategoryAction} from '../../../redux/actions/product_Category_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {listTaxJurisdictionAction} from '../../../redux/actions/tax_Jurisdiction_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { InputAdornment, TablePagination, TextField, Typography } from '@mui/material';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { MTableToolbar } from 'utils/SafeMaterialTable';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getSearchTaxRatesAction, setSearchTaxRatesAction} from '../../../redux/actions/taxRate_actions'
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';
import { titleURL } from 'http-common';

class TaxRate extends Component {
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
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: 20,
      isApiFinished: false
    };
  }

  async componentDidMount() {
    this.props.setSearchTaxRatesAction([]);
    const context = this.context;

    const data = {pageCount: this.state.page || 0, numPerPage: this.state.pageSize, searchString: ''};

    apiCalls(
      context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      this.props.listTaxRateAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        data
      )
    ).finally(() => this.setState({isApiFinished: true}));

    // await this.props.listTaxCodesAction();
    // await this.props.listTaxCategoryAction();
    // await this.props.listTaxJurisdictionAction();

    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
 
    const data = {pageCount: this.state.page || 0, numPerPage: this.state.pageSize, searchString: this.state.searchVal};
    // page size
    if (prevState.pageSize !== this.state.pageSize) {
 
      // const data = {pageCount: this.state.page || 0, numPerPage: this.state.pageSize, searchString: this.state.searchVal};
     
      await this.props.listTaxRateAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        data
      )
    }
 
    //page
    if (prevState.page !== this.state.page) {
 
      // const data = {pageCount: this.state.page || 0, numPerPage: this.state.pageSize, searchString: this.state.searchVal };
     
      await this.props.listTaxRateAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        data
      )
    }
    if (
      prevProps.deleteTaxrate !== this.props.deleteTaxrate &&
      this.props.deleteTaxrate
    ) {
      await this.props.listTaxRateAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        data
      );
    }
  }
 
  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 +  this.state.pageSize) * page,
    //     this.state.pageSize * (page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   const context = this.context

    //   const data = {pageCount: page || 0, numPerPage: this.state.pageSize, searchString: this.state.searchVal};

    //   // if(typeof data.location_id !== 'object' ){
    //   //   data.location_id = context.headerLocationId
    //   // }
      
    //   await this.props.listTaxRateAction(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     data
    //   )
    // }

    this.setState({page: page});
    // const context = this.context

    // const data = {pageCount: page || 0, numPerPage: this.state.pageSize, searchString: this.state.searchVal };

    // if(typeof data.location_id !== 'object' ){
    //   data.location_id = context.headerLocationId
    // }
    
    // await this.props.listTaxRateAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   data
    // )
	  
  }

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    this.setState({pageSize: size});

    // const context = this.context;

    // const data = {pageCount: this.state.page || 0, numPerPage: size, searchString: this.state.searchVal};

    // if(typeof data.location_id !== 'object' ){
    //   data.location_id = context.headerLocationId
    // }
    
    // await this.props.listTaxRateAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   data
    // )
    
  };

  handleEdit = async (id) => {
    await this.props.getbyidTaxRateAction(id);
    this.setState({open: true, status: 'edit'});
  };
  handleDelete = async (id) => {
    const context = this.context;
    await this.props.deleteTaxRateAction(
      id,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    this.setState({delete: false});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  responseDialog = async (res, resSeverity) => {
    await this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('taxrate', false);
    }
    setTimeout(() => {
      this.setState({open: false, dialog: false, delete: false});
    }, 0);
  };

  sample = (value) => {
    this.setState({open: value});
  };

  handleSubmit = async (data) => {
    const context = this.context;
    // const values = data
    // for (let val in values) {
    //   if (val === 'is_serialized') {
    //     values[val] = values[val] === true ? 1 : 0
    //   }
    // }
    // const {company_name,agency_name,account_number,supplier_tax_id,supplier_category,...record} = values
    if (data.tax_rate_id) {
      await this.props.updateTaxRateAction(
        data.tax_rate_id,
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        (val) => {
          const data = {pageCount: this.state.page, numPerPage: this.state.pageSize, searchString: this.state.searchVal};

          this.props.listTaxRateAction(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            data
          );
          this.sample(val)
        }
      );
      // await this.setState({ open: false })
    } else {
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })
      // if(this.props.setModalStatusHandler)
      // this.props.setModalStatusHandler(false)
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })
      await this.props.createTaxRateAction(
        data,
        this.props.setModalStatusHandler,
        this.props.setselectData,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        (val) => {
        
          const data = {pageCount: this.state.page, numPerPage: this.state.pageSize, searchString: this.state.searchVal};

          this.props.listTaxRateAction(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            data
          );
          this.sample(val)
        }
      );
    }
  };
  handleDeactive = async (data, status) => {
    const active = {is_active: status};
    if (data.id) {
      await this.props.updateTaxRateAction(data.id, active);
      await this.setState({open: false});
    }
  };

  cancelSearch = (e) => {
    this.setState({ searchVal: ''});
    const context = this.context;
    // this.props.setSearchTaxRatesAction([])
    const body = {
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
      searchString : ''
    }
    this.props.getSearchTaxRatesAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val, page: 0});

    this.props.setSearchTaxRatesAction([]);

    const body = {
      pageCount: this.state.page || 0, 
      numPerPage: this.state.pageSize,
      searchString : val
    }
    
    this.props.getSearchTaxRatesAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
  };

  render() {
    // const filteredCol = taxRate_col.length ? taxRate_col.map((d) => ({ title: d, field: d }))
    //   : this.props.taxrate[0] ?
    //     Object.keys(this.props.taxrate[0]).map((o) => ({ title: o, field: o })) : []
    return (
      <>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | TaxRate </title>
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
                style={{height: 'calc(100vh - 80px)'}}
                  // totalCount={this.state.searchVal !== '' ? this.props.searchTaxRatesDataCount : this.props.taxrateCount}
                  totalCount={this.props.taxrateCount}

                  components={{
                    Toolbar: (props) => (
                      <div>
                        {/* <span style={{ paddingLeft: "100px" }}> */}
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
                                borderRadius: 5,
                                backgroundColor: '#F4F7FE',
                                // color: 'black',
                                border: '0px transparent',
                                mr: '10px',
                                '& .MuiOutlinedInput-root': {
                                  height: '42px',
                                },
                                "& fieldset": { border: 'none' },
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
                                      fontSize='small'
                                      sx={{ cursor: 'pointer' }}
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
                      </div>
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
                    {
                      icon: 'edit',
                      tooltip: 'edit',
                      position: 'row',
                      onClick: (event, rowData) =>
                        this.handleEdit(rowData.tax_rate_id),
                    },
                    {
                      icon: 'delete',
                      tooltip: 'Delete',
                      onClick: (event, rowData) =>
                        this.handledialog(rowData.tax_rate_id),
                    },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) =>
                        this.setState({ open: true, status: 'create', isApiFinished: false }),
                    },
                  ]}
                  options={{
                    showEmptyDataSourceMessage: this.state.isApiFinished,
                    headerStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    actionsColumnIndex: -1,
                    search: false,
                    exportMenu: [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) => {
                          const data = {pageCount: this.state.page, numPerPage: this.state.pageSize, searchString: this.state.searchVal};

                          this.props.listTaxRateAction(
                            setModalTypeHandler, setLoaderStatusHandler,data,
                            (exportData) => {
                              // console.log(cols,exportData,'XCXCCXC')
                              ExportPdf(
                                cols,
                                exportData,
                                'Tax Rate',
                              );
                            },
                          );
                        }
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) => {
                          const data = {pageCount: this.state.page, numPerPage: this.state.pageSize, searchString: this.state.searchVal};

                          this.props.listTaxRateAction(
                            setModalTypeHandler, setLoaderStatusHandler,data,
                            (exportData) => {
                              ExportCsv(
                                cols,
                                exportData,
                                'Tax Rate',
                              );
                            },
                          );
                        }
                      },
                    ],
                  }}
                  // columns={filteredCol}
                  page={this.state.page}
                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                  columns={[
                    {
                      field: 'tax_rate',
                      title: 'Tax Rate',
                    },
                    {
                      field: 'tax_code',
                      title: 'Tax Code',
                    },
                    {
                      field: 'tax_code_name',
                      title: 'Tax Code Name',
                    },
                    {
                      field: 'city',
                      title: 'City ',
                    },
                    {
                      field: 'state',
                      title: 'State ',
                    },
                    {
                      field: 'tax_category',
                      title: 'Tax Category ',
                    },
                    {
                      field: 'jurisdiction_name',
                      title: 'Jurisdiction Name ',
                    },
                    {
                      field: 'tax_group',
                      title: 'Tax Group ',
                    },
                    {
                      field: 'tax_type',
                      title: 'Tax Type ',
                    },
                    {
                      field: 'reporting_authority',
                      title: 'Reporting Authority ',
                    },
                  ]}

                  // data={this.props.searchTaxRatesData.length > 0  || this.state.searchVal.length > 0 ?
                  //   this.props.searchTaxRatesData
                  //   :
                  //   this.props.taxrate
                  //     ? this.props.taxrate
                  //       .slice(0, this.props.pageSize)
                  //       .map((r) => {
                  //         const { tableData, ...record } = r;
                  //         return record;
                  //       })
                  //     : []
                  // }

                  data={
                    this.props.taxrate
                      ? this.props.taxrate
                        .slice(0, this.props.pageSize)
                        .map((r) => {
                          const { tableData, ...record } = r;
                          return record;
                        })
                      : []
                  }

                  title={
                    <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                      Tax Rate</Typography>}
                />
              )}
              {this.state.open === true && (
                <NewTaxRate
                  edit_id_data={this.props.taxrate_id_data}
                  status={this.state.status}
                  type='taxrate'
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
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
    taxrate: state.TaxRateReducer.taxrate,
    taxrateCount: state.TaxRateReducer.taxrateCount,
    taxrate_id_data: state.TaxRateReducer.taxrate_id_data,
    taxcodes: state.taxCodeReducer.taxcodes,
    // productcategory: state.productCategoryReducer.productcategory,
    taxcategory: state.taxCategoryReducer.taxcategory,
    taxjurisdiction: state.taxjurisdictionReducer.taxjurisdiction,
    searchTaxRatesData: state.TaxRateReducer.searchTaxRatesData || [],
    searchTaxRatesDataCount: state.TaxRateReducer.searchTaxRatesDataCount,
    deleteTaxrate: state.TaxRateReducer.deleteTaxrate
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listTaxRateAction: (setModalTypeHandler, setLoaderStatusHandler, data, exportDataCallBack) => {
      return dispatch(listTaxRateAction(setModalTypeHandler, setLoaderStatusHandler, data, exportDataCallBack));
    },
    listTaxJurisdictionAction: () => {
      dispatch(listTaxJurisdictionAction());
    },
    createTaxRateAction: (
      data,
      setModalStatusHandler,
      setselectData,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        createTaxRateAction(
          data,
          setModalStatusHandler,
          setselectData,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidTaxRateAction: (id) => {
      dispatch(getbyidTaxRateAction(id));
    },
    updateTaxRateAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      dispatch(
        updateTaxRateAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteTaxRateAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(
        deleteTaxRateAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listTaxCodesAction: () => {
      dispatch(listTaxCodesAction());
    },
    // listCustomerAction: () => {
    //   dispatch(listCustomerAction())
    // },
    listTaxCategoryAction: () => {
      dispatch(listTaxCategoryAction());
    },
    setSearchTaxRatesAction: (val ) => { return dispatch(setSearchTaxRatesAction(val))
    },
    getSearchTaxRatesAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        getSearchTaxRatesAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaxRate);

