import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import React, { Component } from 'react'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { BrandReportFinal, brandReportAction,getSearchBrandReportAction,setSearchBrandReportState } from '../../../redux/actions/reports_actions';
import { TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from '@mui/icons-material/Clear';
import { connect } from 'react-redux';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import FilterBrandsales from './Filterbrand';
import {listProductAction} from '../../../redux/actions/product_actions';
import moment from 'moment';
import { pageSize, maxBodyHeight } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import DataGridTemp from 'components/dataGridTemp';
import {Helmet} from "react-helmet-async";
import { titleURL } from 'http-common';




class BrandReport extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
      pageSize: 100,
      edit_id_data: [],
      rowPopup: {open: false, rowIndex: '', item_id: ''},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      from: firstDay,
      to: lastDay,
      filtedValue: {
        product_name: '',
        brand: '',
        // category: '',
        // location_id: 'null',
        // max_price: '',
        // min_price: '',
      },
      title: 'Brand Reports',
      columnData: [
        {headerName: 'Brand Name', field: 'brand', width: 200},
        {headerName: 'Product Name', field: 'item', width: 300},
        {headerName: 'Quantity', field: 'quantity', width: 100},
        {
          headerName: 'Purchase Price', field: 'purchase_price',
          align:"right", width: 150
        },
        {
          headerName: 'Sale Price', field: 'sale_price', 
          align:'right', width: 150
        },
        {
          headerName: 'Profit', field: 'profit', width: 200
        },
        {headerName: 'ROI', field: 'roi', width: 150},
        {headerName: 'Avg shelf Time.', field: 'avg_shelf', width: 200},
      ],
      isApiFinished: false
    };
  }

  async componentDidMount() {
    this.props.setSearchBrandReportState({data:[]});
    const context = this.context;

    const data = {
      brand: '',
      from: moment(this.state.from, 'year', 'month', 'day').format(
        'yyyy-MM-DD',
      ),
      to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      product_name: '',
      searchString: '',
      pageCount: 0,
      numPerPage:  this.state.pageSize,
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.BrandReportFinal(
        data
      ),
      // this.props.listProductAction(),
    ).finally(() => this.setState({isApiFinished: true}));

    // await this.props.salesReportDataInPagination(context.commoncookie, context.headerLocationId, context.setModalTypeHandler, context.setLoaderStatusHandler, {
    //   pageCount: 0,
    //   numPerPage:  pageSize
    // })
  }

  handlePageSizeChange = async (size) => {
    // if (this.state.searchVal) {
    //   this.setState({ pageSize: size, page: 0 });
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({ searchData: pageChangeData });
    // }

    this.setState({ pageSize: size, page: 0 }, async () => {
      const context = this.context;
      const { brand, category, location_id, payment_type,name } = this.state.filtedValue;

      const { invoice_amount, due_amount, due_days } =
        this.state.filtedValue;

      const data = {
        brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

        product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
        from:
          this.state.from === null
            ? null
            : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
        to:
          this.state.from === null
            ? null
            : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        user_id: context.commoncookie,
        pageCount: this.state.page || 0,
        numPerPage: size,
        searchString: this.state.searchVal,
      };


      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.BrandReportFinal(data)
      );
    });
  };

  handlePageChange = async (page) => {
    // if (this.state.searchVal) {
    //   this.setState({ page: page });
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + pageSize) * page,
    //     pageSize * (page + 1),
    //   );
    //   return this.setState({ searchData: pageChangeData });
    // }

    this.setState({ page: page });
    const context = this.context;
    const { brand, category, location_id, payment_type,name } = this.state.filtedValue;

    const { invoice_amount, due_amount, due_days } =
      this.state.filtedValue;
    const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
            'yyyy-MM-DD',
          ),
      to:
        this.state.from === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: page || 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.BrandReportFinal(data)
    );
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  // requestSearch = (e) => {
  //   let val = e
  //   this.setState({ searchVal: val })
  //   const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
  //   const filteredRows = this.props.purchases.filter((row) => {
  //     return Object.keys(row).some((field) => {
  //       return searchRegex.test(row[field]);
  //     });
  //   })
  //   this.setState({ searchData: filteredRows, searchPageData: filteredRows })
  //   this.setState({ page: 0 })
  // }

  filterHandler = (name, value) => {
    this.setState({filtedValue: {...this.state.filtedValue, [name]: value}});
  };
  clearButton = () => {
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    this.setState({
      from: firstDay,
      to: lastDay,
      filtedValue: {
        product_name: '',
        brand: '',
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
  };
  commonMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else if (typeof array === 'string') {
      return array;
    }
  };
  exportValue = () => {
    const context = this.context;
    const {name, brand} = this.state.filtedValue;

    const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.from === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
    };
    return data;
  };
  ApplyButton = async (formData) => {
    const {name, brand} = formData;
    const context = this.context;
    this.setState({filtedValue: formData});

    // const data={product_name: name !== undefined ? this.commonMapping(name,"name") : '', brand: brand !== undefined ? this.commonMapping(brand,"brand") : '',category: category !== undefined ? this.commonMapping(category,"category") : '',location_id: location_id !== undefined ? this.commonMapping(location_id,"location_id") : context.headerLocationId,user_id:context.commoncookie,max_price: max_price !== undefined ? max_price : '',min_price: min_price !== undefined ? min_price : '',pageCount:0,
    // numPerPage:  pageSize}
    // this.props.listInventoryByIdAction(data,context.commoncookie,context.headerLocationId,context.setModalTypeHandler,context.setLoaderStatusHandler)
    const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.from === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: this.state.searchVal,
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.BrandReportFinal(
        data
      ),
    );

    this.setState({page: 0});
    this.setState({filterOpen: false});
  };

  handleFilterClose = (data) => {
    // this.setState({ filterOpen: data, open: false, rowPopup : {open:false}})
    this.setState({
      filterOpen: data,
      open: false,
      dialog: false,
      delete: false,
      rowPopup: {open: false, rowIndex: ''},
      status: '',
    });
    // this.setState({cnPopupData: {...this.state.cnPopupData, Dopen: false}});
  };

  handleChange = async (data) => {
    var date_val = data.target.value._d;
    await this.setState({[data.target.name]: date_val});

    if (moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
      if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
        if (moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
          this.setState({errormsg: {from: '', to: ''}}); // balancesheet_data: filterData ,
        } else {
          this.setState({
            errormsg: {
              ...this.state.errormsg,
              [data.target.name]: 'Invalid Date 1',
            },
          });
        }
      } else {
        this.setState({
          errormsg: {
            ...this.state.errormsg,
            [data.target.name]: 'Invalid Date 2',
          },
        });
      }
    } else {
      this.setState({
        errormsg: {
          ...this.state.errormsg,
          [data.target.name]: 'Invalid Date 3',
        },
      });
    }
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val});
    // if(val.trim() !== ''){
      this.props.setSearchBrandReportState({data:[]})
    // }

    const {brand,name} = this.state.filtedValue;
    const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.from === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: val,
    };

    this.props.getSearchBrandReportAction(
      data
    )
  };
  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    this.props.setSearchBrandReportState({data:[]})
    const {brand,name} = this.state.filtedValue;
    const data = {
      brand: brand !== undefined ? this.commonMapping(brand, 'brand') : '',

      product_name: name !== undefined ? this.commonMapping(name, 'name') : '',
      from:
        this.state.from === null
          ? null
          : moment(this.state.from, 'year', 'month', 'day').format(
              'yyyy-MM-DD',
            ),
      to:
        this.state.from === null
          ? null
          : moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      user_id: context.commoncookie,
      pageCount: 0,
      numPerPage:  this.state.pageSize,
      searchString: '',
    };

    this.props.BrandReportFinal(
      data
    )
  };

  render() {
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Brand Report </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({drawerOpen, setModalTypeHandler, setLoaderStatusHandler}) => (
            //   <div style={{ width: drawerOpen ? 'calc(100vw - 400px)' : 'calc(100vw - 143px)' }}>
            (<React.Fragment>
              <DataGridTemp
                pageSize={this.state.pageSize}
                page={this.state.page}
                pageType= 'task'
                title={this.state.title}
                data={this.props.searchBrandReportData}
                columns={this.state.columnData}
                filter={
                  <FilterBrandsales
                    fromTo={true}
                    from={this.state.from}
                    to={this.state.to}
                    product={this.props.product}
                    handleChange={this.handleChange}
                    handleFilterClose={this.handleFilterClose}
                    open={this.state.filterOpen}
                    ApplyButton={this.ApplyButton}
                    clearButton={this.clearButton}
                    filterHandler={this.filterHandler}
                    filtedValue={this.state.filtedValue}
                  />
                }
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
                //   />
                // }
                onPageChange={(page) => this.handlePageChange(page)}
                onPageSizeChange={(size) => this.handlePageSizeChange(size)}
                rowCount={this.props.searchBrandReportData.numRows}
                requestSearch={(e) => this.requestSearch(e)}
                cancelSearch={this.cancelSearch}
                s
                searchVal={this.state.searchVal}
                type='filter'
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
    
    brandReport: state.reportsReducer.brand_report || [],
    product: state.productReducer.product || [],
    searchBrandReportData: state.reportsReducer.searchBrandReportData,
    
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
 
    brandReportAction: (data,setModalTypeHandler, setLoaderStatusHandler,exportCallBack) => {
      return dispatch(brandReportAction(data, setModalTypeHandler, setLoaderStatusHandler, exportCallBack))
    },
    listProductAction: () => {
      return dispatch(listProductAction());
    },
    getSearchBrandReportAction: (
      val
    ) => {
      return dispatch(
        getSearchBrandReportAction(
          val
        ),
      );
    },
    setSearchBrandReportState: (val) => {
      return dispatch(setSearchBrandReportState(val));
    },
    BrandReportFinal: (val) => {
      return dispatch(BrandReportFinal(val));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BrandReport);


{
  /* <MaterialTable
             actions={[

                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                     <FilterBrandsales
                        fromTo={true}
                        from={this.state.from}
                        to={this.state.to}
                        product={this.props.product}
                        handleChange={this.handleChange}
                        handleFilterClose={this.handleFilterClose}
                        open={this.state.filterOpen}
                        ApplyButton={this.ApplyButton}
                        clearButton={this.clearButton}
                        filterHandler={this.filterHandler}
                        filtedValue={this.state.filtedValue}
                      />
                    </div>
                  ),
                  tooltip: 'Filter',
                  isFreeAction: true,
                },
              ]}
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
                            borderRadius: "8px",
                            pr: '10px',
                            '& .MuiOutlinedInput-root': {
                              height: '42px'
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
                headerStyle: {
                  fontSize: 15
                },
                search: true,
                exportButton: true,
                filtering: false,
                actionsColumnIndex: -1,
                maxBodyHeight,
                //  pageSize: pageSize,
                pageSizeOptions: [20, 50, 100],
                //totalCount: this.state.purchase_count,
                exportMenu: [{
                  label: 'Export PDF',
                  exportFunc: (cols, datas) => {
                    this.props.brandReportAction(
                      this.exportValue(),
                      setModalTypeHandler, 
                      setLoaderStatusHandler,
                    (exportData) => {
                      ExportPdf(
                        cols,
                        exportData,
                        'Brand Report',
                      );
                    },
                  );
                  }
                }, {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>{
                    this.props.brandReportAction(
                      this.exportValue(),
                      setModalTypeHandler, 
                      setLoaderStatusHandler,
                    (exportData) => {
                      ExportCsv(
                        cols,
                        exportData,
                        'Brand Report',
                      );
                    },
                  );
                  }
                }]
              }}

              // onPageChange={(page) => this.handlePageChange(page)}
              // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

              page={this.props.page}

              columns={[
                { title: 'Brand Name', field: 'brand' },
                { title: 'Product Name', field: 'item' },
                { title: 'Quantity', field: 'quantity' },
                { title: 'Purchase Price', field: 'purchase_price' },
                { title: 'Sale Price', field: 'sale_price' },
                { title: 'Profit', field: 'profit' },
                { title: 'ROI', field: 'roi' },
                {title: 'Avg shelf Time.', field: 'avg_shelf'}
               
              ]}

              data={this.props.brandReport}

              // data={
              //   searchVal ? searchData  : purchase_by_pagination
              // }

              title={<Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              Brand Reports
              </Typography>
              }
            /> */
}
