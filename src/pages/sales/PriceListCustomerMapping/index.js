import React, {Component} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _, {concat, filter} from 'lodash';

// import { listStockLedgerAction, createStockLedgerAction, getbyidStockLedgerAction } from '../../redux/actions/stock_Ledger_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  Link,
  Button,
  FormControlLabel,
  FormGroup,
  Card,
  Box,
  TableContainer,
  Table,
} from '@mui/material';
import {getDateTime} from '../../../utils/getTimeFormat';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
// import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
// import NoRecordFound from '../../../components/Layout/NoRecordFound';
// import FilterSalesMan from './filtersalesman'
import {ThirtyFpsSharp} from '@mui/icons-material';
// import App from 'components/customer_erpDesign';
import {
  listCustomerSalesManAction,
  SalesmaninsertAction,
  ListsalesmanAction,
} from '../../../redux/actions/customer_actions';
import {
  getPriceListAction,
  getProductPriceListAction,
  getProductListAction,
  createPriceListAction,
  updatePriceListAction,
  listPriceListCustomerAction,
  listPriceListAllCustomerAction,
  createPriceListMappingCustomerAction,
} from 'redux/actions/priceList_actions';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
// import pricelistSelection from './pricelistselection';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
// import Filterpricelist from './filterpricelist'
import {Data} from '@react-google-maps/api';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from '../../../utils/DateFixer';

class PriceListCustomerMapping extends Component {
  static contextType = CreateNewButtonContext;
  Ledger;
  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let headerupdate = '';
    this.state = {
      open: false,
      type: 0,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
      filterData: [],
      brand: '',
      category: '',
      customer: '',
      Dopen: false,
      page: 0,
      pageSize: 20,
      from: firstDay,
      to: lastDay,
      filtedValue: {
        customer: 'null',
        pricelist: 'null',
      },
      pricelist_selected_value: {
        pricelist: 'null',
      },
      pricelist: 'null',
      fromDate: null,
      toDate: null,
      cancelSale: false,
      indexValue: '',
      // rowPopup: {
      //   open: false,
      //   rowIndex: '',
      //   receivings_items: []
      // },
      count: 0,
      errormsg: {
        from: '',
        to: '',
      },
      appConfigData: {},
      stocklistaddress: {},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      columPopup: {open: false, rowIndex: ''},
      rowPopup: {open: false, rowIndex: ''},
      Customerid: '',
      mappingpricelist: 'null',
      priceListValue: [],
      checkedPriceList: [],
      customer_table: [],
      previous_mapping_id: [],
      checkedType: '',
    };
  }

  async componentDidMount() {
    const context = this.context;

    const data = {
      customer: 'null',
    };

    let pricelist_data = {
      pricelist: 'null',
      customer: 'null',
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listPriceListAllCustomerAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      this.props.getPriceListAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );

    // this.setState({customer_table:this.props.getcustomersalesman})
    //await this.props.ListsalesmanAction(pricelist_data, context.setModalTypeHandler, context.setLoaderStatusHandler)
  }

  componentDidUpdate(preProps, preState) {
    const context = this.context;
    // if(typeof this.props.selectedRow !== 'undefined' ? this.props.selectedRow.length > 0 : false){
    if (typeof this.props.selectedRow !== 'undefined') {
      if (preState.pricelist !== this.props.selectedRow?.id) {
        this.setState({pricelist: this.props.selectedRow.id});
      }
    }
    let statevalue = this.state.pricelist;
    if (preState.pricelist !== statevalue) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listPriceListCustomerAction(
          this.state.pricelist,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        ),
      );
      this.setState({pricelist: statevalue});
      // this.setState({customer_table:this.props.get_price_list_all_customer})
      // this.setState({checkedPriceList:this.props.customer_mapping})
    }
    if (
      preProps.get_price_list_customer !== this.props.get_price_list_customer
    ) {
      this.setState({checkedPriceList: this.props.get_price_list_customer});
      let value =
        this.props.get_price_list_customer.length > 0
          ? this.props.get_price_list_customer.map((d) => {
              return d;
            })
          : [];
      let newarray = value.concat(this.state.customer_table);
      // this.setState({customer_table:newarray})
      let previos_map =
        this.props.get_price_list_customer.length > 0
          ? this.props.get_price_list_customer.map((d) => d.customer_id)
          : [];
      this.setState({previous_mapping_id: previos_map});
      //this.setState({customer_table:[...this.state.customer_table],...this.props.customer_mapping})
    }
  }

  setFilter = (data) => this.setState({filter: data});

  handleFilter = (data) => this.setState({filterOpen: data});

  handlerowclick = (data) => this.setState({rowopen: data});

  handlePriceListClick = (data) => this.setState({pricelistOpen: data});

  handlecheckboxclick = (data) => this.setState({checkedPriceList: data});

  s = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.ledger_list
        .map((m) => {
          return m.id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };

  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  handleClose = (id) => {
    this.setState({open: false, dialog: false, delete: false});
  };
  addNote = (msg) => {
    this.setState({note: msg});
  };
  responseDialog = async (res, resSeverity) => {
    await this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };
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
        ),
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
        ),
      );
      await this.setState({open: false});
    }
  };

  handlecheckbox = (e, rowData, type) => {
    if (type === 'single') {
      if (e.target.checked) {
        this.setState({
          checkedPriceList: [...this.state.checkedPriceList, rowData],
        });
      } else {
        let temp = this.state.checkedPriceList.filter(
          (i) => i.customer_id !== rowData.id,
        );
        this.setState({checkedPriceList: temp});
      }
    } else {
      if (e.target.checked) {
        this.setState({checkedPriceList: rowData, checkedType: 'All'});
      } else if (type === 'All') {
        this.setState({checkedPriceList: [], checkedType: ''});
      } else {
        let temp = this.state.checkedPriceList.filter(
          (i) => i.customer_id !== rowData.id,
        );
        this.setState({checkedPriceList: temp});
      }
    }
  };

  handleCustomerData = () => {
    return this.state.customer_table.length > 0
      ? this.state.customer_table.map((r, id) => {
          const {tableData, ...record} = r;
          record.company =
            record.customer_type === '0'
              ? record.first_name
              : record.company_name;

          return {id, ...record};
        })
      : this.props.get_price_list_all_customer
      ? this.props.get_price_list_all_customer
          //  this.props.getcustomersalesman.filter(({ customer_id: id1 }) => !this.props.customer_mapping.some(({ customer_id: id2 }) => id2 === id1))
          .slice(0, this.props.pageSize)
          .map((r, id) => {
            const {tableData, ...record} = r;
            record.company =
              record.customer_type === '0'
                ? record.first_name
                : record.company_name;

            return {id, ...record};
          })
      : [];
  };

  commonFilterMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else {
      return array;
    }
  };

  sample = (value) => {
    this.setState({
      open: value,
      rowPopup: {open: value},
      columPopup: {open: value},
      cancelSale: value,
    });
  };

  clearButton = () => {
    this.setState({
      filtedValue: {
        customer: 'null',
        pricelist: 'null',
      },
    }); //from:firstDay, to:lastDay, ...this.state.filtedValue,
  };
  handleclear = () => {
    this.setState({
      priceListValue: [],
    });
  };
  ApplyButton = async (formValue) => {
    await this.setState({filtedValue: formValue});

    const context = this.context;
    const {customer} = this.state.filtedValue;

    const data = {
      customer,
      // customer: this.commonFilterMapping(customer, 'customer'),
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listCustomerSalesManAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    this.setState({filterOpen: false});
  };
  Applypricelist = async (formValue) => {
    await this.setState({filtedValue: formValue});

    const context = this.context;
    const {customer, pricelist} = this.state.filtedValue;

    const data = {
      customer,
      pricelist,
      // customer: this.commonFilterMapping(customer, 'customer'),
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.ListsalesmanAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    this.setState({filterOpen: false});
  };

  handleinsert = async () => {
    // await this.setState({ pricelist_selected_value: formValue });

    const context = this.context;
    //   const { pricelist } = this.state.pricelist_selected_value;

    const data = {
      price_list_id: this.state.pricelist,
      customer_id: this.state.checkedPriceList.map((d) => d.customer_id),
      previous_id: this.state.previous_mapping_id,
      // customer: this.commonFilterMapping(customer, 'customer'),
    };

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.createPriceListMappingCustomerAction(
        data,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
      this.props.listPriceListAllCustomerAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      ),
    );
    this.props.customerMapClose();
    this.setState({pricelist: 'null'});
    this.setState({checkedPriceList: []});
    this.setState({customer_table: []});
  };

  removeDuplicateCharacters(string) {
    if (!string) return '';

    const getFilter = string?.split(',').filter(function (item, pos, self) {
      return self.indexOf(item) == pos;
    });
    const removeInr = _.uniqBy(
      getFilter.map((d, i) => {
        const getType = d.trim().split(' ')[0];
        return getType;
      }),
    ).join(', ');

    return removeInr;
  }

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  cancelSearch = (e) => {
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
  };
  handleEdit = async (data, editIndex) => {
    this.setState({
      edit_id_data: data,
      open: true,
      status: 'edit',
      columPopup: {open: false, rowIndex: editIndex},
    });
  };

  customerid = () => {
    this.setState({Customerid: ''});
  };

  render() {
    // if(typeof this.props.selectedRow !== 'undefined' ? this.props.selectedRow.id : false){
    //   this.setState({pricelist:this.props.selectedRow.id})

    console.log(this.props.price_list, 'pricelisstttttt', this.state.pricelist);
    // }
    const test = [
      {name: 'Banana'},
      {name: 'Orange'},
      {name: 'Apple'},
      {name: 'Mango'},
      {name: 'Kiwi'},
    ];
    const selectedPriceList =
      this.state.pricelist !== null && this.state.pricelist !== 'null'
        ? this.props.price_list.find(
            (f) => String(f.id) === String(this.state.pricelist),
          )
        : null;
    return (
      <CreateNewButtonContext.Consumer>
        {({
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          setModalStatusHandler,
        }) => (
          <React.Fragment>
            <AlertDialog
              delete={this.state.delete}
              handleClose={this.handleClose}
              handleDelete={this.handleDelete}
              id={this.state.id}
            />

            <Grid
              container
              display='flex'
              // justifyContent='flex-end'
              // alignItems='center'
              // spacing={3}
            >
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }} marginBottom='10px'>
                <Card>
                  <Grid
                    container
                    spacing={5}
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                  >
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 8,
                        xs: 8
                      }}>
                      <Grid
                        container
                        display='flex'
                        // justifyContent='flex-end'
                        alignItems='center'
                        spacing={3}
                        // p={5}
                      >
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Grid
                            container
                            display='flex'
                            alignItems='center'
                            spacing={5}
                            p='20px'
                          >
                            <Grid
                              size={{
                                lg: 2,
                                md: 2,
                                sm: 6,
                                xs: 8
                              }}>
                              <TextField
                                fullWidth
                                label='Price List Name'
                                placeholder='Enter price list name'
                                variant='filled'
                                disabled={true}
                                value={
                                  selectedPriceList?.price_list_name || ''
                                }
                                onChange={(event, newValue) => {
                                  this.setState({
                                    pricelist:
                                      newValue === null ? 'null' : newValue,
                                  });
                                }}
                              />
                            </Grid>
                            <Grid
                              size={{
                                lg: 2,
                                md: 2,
                                sm: 6,
                                xs: 8
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                  label='From Date'
                                  disabled={true}
                                  value={
                                    selectedPriceList?.fromDate
                                      ? toMomentOrNull(selectedPriceList.fromDate)
                                      : null
                                  }
                                  minDate={moment()}
                                  onChange={(event, newValue) => {
                                    this.setState({
                                      fromDate:
                                        newValue === null ? 'null' : newValue,
                                    });
                                  }}
                                  slotProps={{ textField: { fullWidth: true, variant: 'filled', disabled: true, onKeyDown: (e) => {
                                        e.preventDefault();
                                      } } }}
                                />
                              </LocalizationProvider>
                            </Grid>
                            <Grid
                              size={{
                                lg: 2,
                                md: 2,
                                sm: 6,
                                xs: 8
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                  label='To Date'
                                  disabled={true}
                                    value={
                                    selectedPriceList?.toDate
                                      ? toMomentOrNull(selectedPriceList.toDate)
                                      : null
                                  }
                                  minDate={moment()}
                                  onChange={(event, newValue) => {
                                    this.setState({
                                      toDate:
                                        newValue === null ? 'null' : newValue,
                                    });
                                  }}
                                  slotProps={{ textField: { fullWidth: true, variant: 'filled', disabled: true, onKeyDown: (e) => {
                                        e.preventDefault();
                                      } } }}
                                />
                              </LocalizationProvider>
                            </Grid>
                            <Grid size="grow" />

                            {typeof this.props.selectedRow !== 'undefined' && (
                              <Grid
                                size={{
                                  xs: 2,
                                  sm: 1.5,
                                  md: 1,
                                  lg: 1
                                }}>
                                <Button
                                  fullWidth
                                  onClick={() => {
                                    this.props.close;
                                    this.props.customerMapClose();
                                  }}
                                  variant='contained'
                                  color='secondary'
                                  sx={{height: '42px'}}
                                  //  disabled={this.state.pricelist=== 'null' && this.state.priceListValue.length===0 ? true :false}
                                >
                                  Back
                                </Button>
                              </Grid>
                            )}

                            <Grid
                              size={{
                                xs: 2,
                                sm: 1.5,
                                md: 1,
                                lg: 1
                              }}>
                              <Button
                                fullWidth
                                onClick={this.handleinsert}
                                variant='contained'
                                disabled={
                                  this.state.checkedPriceList.length === 0
                                    ? true
                                    : false
                                }
                                sx={{height: '42px', ml: 1}}
                              >
                                {'Submit'}
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>

                        {/* </Grid> */}
                      </Grid>
                      {/* <TextField
                    required={false}
                    style={{}}
                    fullWidth={true}
                    placeholder='Price List'
                    label='Price List'
                    name='pricelist'
                    value={
                      this.state.pricelist !== null
                        ?this.props.price_list.filter(f => f.id === this.state.pricelist)?.[0]?.price_list_name || {}
                        : ''}
                        onChange={(event, newValue) => {
                          this.setState({      
                          pricelist: newValue === null ? 'null' : newValue.id
    
                          });
                        }}
                    color='primary'
                    multiline={false}
                    type='text'
                    regex=''
                    variant='outlined'
                    x
                  /> */}
                    </Grid>
                    {/* {typeof this.props.selectedRow !== 'undefined' && (<Grid lg={1} md={1} sm={1.5} xs={1}
                // style={{justifyContent:'right'}}
                >
                      <Button
                        fullWidth
                       onClick={() => {this.props.close; this.props.customerMapClose()}}
                      variant='contained'
                      color='inherit'
                      //  disabled={this.state.pricelist=== 'null' && this.state.priceListValue.length===0 ? true :false}
                    >
                      Back
                    </Button>
                  </Grid>
                )} */}

                    {/* <Grid size={{ xs: 1, sm: 1.5, md: 1, lg: 1 }}>
                    <Button fullWidth
                      onClick={this.handleinsert}
                      variant='contained'
                       disabled={this.state.checkedPriceList.length === 0 ? true :false}
                    >
                      {"Submit"}
                    </Button>
                  </Grid> */}
                  </Grid>
                </Card>
              </Grid>

              <Box display='flex' gap={2}></Box>
              <Grid
                size={{lg: 6, md: 6, sm: 12, xs: 12}}>
                <Box sx={{flexGrow: 1}}>
                  {this.state.open === false && (
                    <MaterialTable
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
                              <div style={{ width: '100%' }}>
                                <MTableToolbar {...props} />
                                {/* <div style={{ paddingLeft: '20px'}}>

                            <FormGroup>
                              <FormControlLabel control={ 
                                <Checkbox
                                color="primary"
                                checked={this.state.checkedType === 'All' ? true:false}
                                // onClick={(e) => handleProductData(e.target.checked,props.product_list,'All')}
                                onClick={(e)=> this.handlecheckbox(e, this.handleCustomerData(),'All')}
                                inputProps={{
                                  'aria-label': 'select all desserts',
                                }}/>} label="Check All" />
                            </FormGroup>
                            </div> */}
                              </div>
                            </div>
                            {/* <div>
                        <span style={{ paddingLeft: '10px', color: 'red' }}>
                          {this.state.errormsg.from}
                        </span>
                      </div> */}
                          </>
                        ),
                      }}
                      actions={
                        [
                          // {
                          //   icon: () => (
                          //     <div style={{ display: 'flex' }}>
                          //       <FilterSalesMan
                          //         catabrand={true}
                          //         locat={true}
                          //         customer={this.state.customer}
                          //         salesmancustomer={this.props.getcustomersalesman}
                          //         filtedValue={this.state.filtedValue}
                          //         setFilter={this.setFilter}
                          //         handleChange={this.handleChange}
                          //         handleClose={this.handleFilter}
                          //         open={this.state.filterOpen}
                          //         ApplyButton={this.ApplyButton}
                          //         clearButton={this.clearButton}
                          //       />
                          //     </div>
                          //   ),
                          //   tooltip: 'Filter',
                          //   isFreeAction: true,
                          // },
                          // {
                          //   tooltip: "Customer mapping on selected rows",
                          //   icon: "add",
                          //   onChange: (evt, data) =>{
                          //     this.setState({ priceListValue:data})
                          //   }
                          // }
                        ]
                      }
                      // onRowClick={(evt, rowData) => {
                      //   this.setState({
                      //     rowPopup: {
                      //       rowIndex: this.props.pos_sale_by_pagination.findIndex((i) =>
                      //         rowData.sale_id
                      //           ? i.sale_id === rowData.sale_id
                      //           : i.customer_id === rowData.customer_id,
                      //       ),
                      //       open: true,
                      //     },
                      //   });
                      // }}
                      // onPageChange={(page) => this.handlePageChange(page)}
                      // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                      options={{
                        headerStyle,
                        cellStyle,
                        search: true,
                        //selection:true,
                        //   selectionProps: rowData => ({

                        //     checked: rowData.customer_id === this.props.customer_mapping.map((d)=>d.customer_id)
                        // }),
                        exportButton: true,
                        filtering: false,
                        actionsColumnIndex: -1,
                        maxBodyHeight: '68vh',
                        pageSize: pageSize,
                        pageSizeOptions: [20, 50, 100],
                        totalCount: this.props.possale_count,
                        // exportMenu: [
                        //   {
                        //     label: 'Export PDF',
                        //     exportFunc: (cols, datas) => {
                        //      ExportPdf(cols, datas)
                        //     }
                        //   },
                        //   {
                        //     label: 'Export CSV',
                        //     exportFunc: (cols, datas) => {
                        //      ExportCsv(cols, datas)
                        //     },
                        //   },
                        // ],
                      }}
                      // onSelectionChange={data => {
                      //   // this.toggle.bind(this, data.id);
                      //   this.setState({priceListValue : data})
                      // }}

                      page={this.state.page}
                      columns={[
                        {
                          title: (
                            <Checkbox
                              color='primary'
                              checked={
                                this.state.checkedType === 'All' ? true : false
                              }
                              // onClick={(e) => handleProductData(e.target.checked,props.product_list,'All')}
                              onClick={(e) =>
                                this.handlecheckbox(
                                  e,
                                  this.handleCustomerData(),
                                  'All',
                                )
                              }
                              inputProps={{
                                'aria-label': 'select all desserts',
                              }}
                            />
                          ),
                          field: 'surname',
                          render: (rowData) => (
                            <Checkbox
                              checked={
                                this.state.checkedPriceList.filter(
                                  (d) => d.customer_id === rowData.customer_id,
                                ).length > 0
                                  ? true
                                  : false
                              }
                              // value = {this.state.checkedPriceList}
                              // onChange={this.setState({priceListValue:  Object.entries(rowData)})}
                              onChange={
                                (e) => this.handlecheckbox(e, rowData, 'single')
                                // this.setState({checkedPriceList:[...this.state.checkedPriceList,rowData]}).splice(rowData.id, 1)
                              }
                              //this.setState({checkedPriceList:[rowData]})
                              // }
                            />
                          ),
                        },
                        {
                          field: 'company',
                          title: 'Name',
                          render: (rowData) => (
                            <List
                              component='nav'
                              aria-label='main mailbox folders'
                              disablePadding
                            >
                              <ListItem
                                disableGutters
                                sx={{
                                  padding: 0, // remove default padding
                                  alignItems: 'center',
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  {' '}
                                  {/* default is 56px */}
                                  {rowData.customer_type === '0' ? (
                                    <PersonIcon />
                                  ) : (
                                    <BusinessIcon />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={rowData.company}
                                  sx={{
                                    margin: 0,
                                    padding: 0,
                                    '.MuiTypography-root': {
                                      fontSize: '0.875rem', // optional: make text smaller
                                    },
                                  }}
                                />
                              </ListItem>
                            </List>
                          ),
                        },
                        {
                          field: 'phone_number',
                          title: 'Phone Number',
                        },
                        {
                          field: 'area',
                          title: 'Area',
                        },
                      ]}
                      data={this.handleCustomerData()}
                      title={
                        <Typography
                          variant='h6'
                          align='left'
                          style={{ paddingTop: '10px', paddingBottom: '10px' }}
                        >
                          Customer List
                        </Typography>
                      }
                    />
                  )}
                </Box>
              </Grid>

              <Grid
                size={{lg: 6, md: 6, sm: 12, xs: 12}}>
                <Box sx={{flexGrow: 1}}>
                  <MaterialTable
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
                            <div style={{ width: '100%' }}>
                              <MTableToolbar {...props} />
                            </div>
                          </div>
                          {/* <div>
                       <span style={{ paddingLeft: '10px', color: 'red' }}>
                         {this.state.errormsg.from}
                       </span>
                     </div> */}
                        </>
                      ),
                    }}
                    actions={
                      [
                        //  {
                        //    icon: () => (
                        //      <div style={{ display: 'flex' }}>
                        //        <Filterpricelist
                        //          catabrand={true}
                        //          locat={true}
                        //          customer={this.state.customer}
                        //          salesmancustomer={this.props.getcustomersalesman}
                        //          customer_mapping={this.props.customer_mapping}
                        //          filtedValue={this.state.filtedValue}
                        //          setFilter={this.setFilter}
                        //          handleChange={this.handleChange}
                        //          handleClose={this.handlePriceListClick}
                        //          open={this.state.pricelistOpen}
                        //          ApplyButton={this.Applypricelist}
                        //          clearButton={this.clearButton}
                        //        />
                        //      </div>
                        //    ),
                        //    tooltip: 'Filter',
                        //    isFreeAction: true,
                        //  },
                        //  {
                        //    tooltip: "Customer mapping on selected rows",
                        //    icon: "add",
                        //    onClick: (evt, data) =>{
                        //      this.setState({rowopen:true, priceListValue:data})
                        //    }
                        //  }
                      ]
                    }
                    // onRowClick={(evt, rowData) => {
                    //   this.setState({
                    //     rowPopup: {
                    //       rowIndex: this.props.pos_sale_by_pagination.findIndex((i) =>
                    //         rowData.sale_id
                    //           ? i.sale_id === rowData.sale_id
                    //           : i.customer_id === rowData.customer_id,
                    //       ),
                    //       open: true,
                    //     },
                    //   });
                    // }}
                    //  onPageChange={(page) => this.handlePageChange(page)}
                    //  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                    options={{
                      headerStyle,
                      cellStyle,
                      search: true,
                      //  selection:true,
                      //  exportButton: true,
                      filtering: false,
                      actionsColumnIndex: -1,
                      maxBodyHeight: '68vh',
                      pageSize: pageSize,
                      pageSizeOptions: [20, 50, 100],
                      totalCount: this.props.possale_count,
                      //  exportMenu: [
                      //    {
                      //      label: 'Export PDF',
                      //      exportFunc: (cols, datas) => {
                      //       ExportPdf(cols, datas)
                      //      }
                      //    },
                      //    {
                      //      label: 'Export CSV',
                      //      exportFunc: (cols, datas) => {
                      //       ExportCsv(cols, datas)
                      //      },
                      //    },
                      //  ],
                    }}
                    page={this.state.page}
                    columns={[
                      // {
                      //   field:'username',
                      //   title:'pricelist Name'
                      // },
                      {
                        field: 'company',
                        title: 'Name',
                        render: (rowData) => (
                          <List
                            component='nav'
                            aria-label='main mailbox folders'
                            disablePadding
                          >
                            <ListItem
                              disableGutters
                              sx={{
                                padding: 0, // remove default padding
                                alignItems: 'center',
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                {' '}
                                {/* default is 56px */}
                                {rowData.customer_type === '0' ? (
                                  <PersonIcon />
                                ) : (
                                  <BusinessIcon />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={rowData.company}
                                sx={{
                                  margin: 0,
                                  padding: 0,
                                  '.MuiTypography-root': {
                                    fontSize: '0.875rem', // optional: make text smaller
                                  },
                                }}
                              />
                            </ListItem>
                          </List>
                        ),
                      },

                      {
                        field: 'phone_number',
                        title: 'Phone Number',
                      },
                      {
                        field: 'area',
                        title: 'Area',
                      },
                    ]}
                    data={
                      this.state.checkedPriceList
                        ? this.state.checkedPriceList
                            .slice(0, this.props.pageSize)
                            .map((r, id) => {
                            const { tableData, ...record } = r;

                              record.company =
                                record.customer_type === '0'
                                  ? record.first_name
                                  : record.company_name;
                            return { id, ...record };
                            })
                        : []
                      // this.props.getcustomersalesman.filter ((d)=> this.props.customer_mapping.some(s=>  d.customer_id === s.customer_id))
                    }
                    title={
                      <Typography
                        variant='h6'
                        align='left'
                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                      >
                        Customer Mapped List
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              {/* <Grid container spacing={7} display= 'flex' justifyContent='flex-end' alignItems='center' p='20px 0px 5px 0px' > */}
              {/* <Grid >
                    <Button
                      onClick={() => this.handleclear()}
                      variant='contained'
                      color='secondary'
                    >
                      Clear
                    </Button>
                  </Grid> */}
              {/* {typeof this.props.selectedRow !== 'undefined' && (
                    <Grid >
                    <Button
                      onClick={this.props.customerMapClose}
                      variant='contained'
                      color="error"
                      //  disabled={this.state.pricelist=== 'null' && this.state.priceListValue.length===0 ? true :false}
                    >
                    {"Cancel"}
                    </Button>
                  </Grid>
                )} */}

              {/* <Grid >
                    <Button
                      onClick={this.handleinsert}
                      variant='contained'
                       disabled={this.state.pricelist=== 'null' && this.state.priceListValue.length===0 ? true :false}
                    >
                      {"Submit"}
                    </Button>
                  </Grid> */}
              {/* </Grid> */}
            </Grid>
            {/*            
            <pricelistSelection
                          catabrand={true}
                          locat={true}
                          customer={this.state.customer}
                          pricelistselect={this.props.userCreation}
                          filtedValue={this.state.pricelist_selected_value}
                          setFilter={this.setFilter}
                          handleChange={this.handleChange}
                          handleClose={this.handlerowclick}
                          open={this.state.rowopen}
                          ApplyButton={this.handleinsert}
                          clearButton={this.clearButton}
                        /> */}
          </React.Fragment>
        )}
      </CreateNewButtonContext.Consumer>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    getcustomersalesman: state.customerReducer.getcustomersalesman || [],
    userCreation: state.UserCreationReducer.createUser || [],
    customer_mapping: state.customerReducer.customer_mapping || [],
    price_list: state.PriceListReducer.price_list || [],
    get_price_list_customer:
      state.PriceListReducer.get_price_list_customer || [],
    get_price_list_all_customer:
      state.PriceListReducer.get_price_list_all_customer || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listCustomerSalesManAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listCustomerSalesManAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    getPriceListAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        getPriceListAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },

    createPriceListMappingCustomerAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        createPriceListMappingCustomerAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    ListsalesmanAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        ListsalesmanAction(data, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    listPriceListCustomerAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listPriceListCustomerAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listPriceListAllCustomerAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listPriceListAllCustomerAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PriceListCustomerMapping);

