import React, {useEffect, useState} from 'react';
//import NewCustomer from '../../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import _, {concat, filter} from 'lodash';

// import { listStockLedgerAction, createStockLedgerAction, getbyidStockLedgerAction } from '../../redux/actions/stock_Ledger_actions';
import AlertDialog from '../../../common/Dialog';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterProductList from './productfilter';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  FormControl,
  TextField,
  InputLabel,
  Grid,
  Typography,
  InputAdornment,
  Link,
  Button,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  Card,
  Box,
  Divider,
} from '@mui/material';
// import {getDateTime} from '../../utils/getTimeFormat';
// import {ExportCsv, ExportPdf} from '@material-table/exporters';
// import CommonFilter from '../../components/pos/payment_section/CommonFilter';
// import NoRecordFound from '../../components/Layout/NoRecordFound';
// import FilterAltIcon from '@mui/icons-material/FilterAlt';
// import FilterSalesMan from './filtersalesman'
import {ThirtyFpsSharp} from '@mui/icons-material';
// import App from 'components/customer_erpDesign';
// import {
//   listCustomerSalesManAction,
//   SalesmaninsertAction,
//   ListsalesmanAction,
// } from '../../redux/actions/customer_actions';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
// import EmployeeSelection from './employeeselection';
// import {listUserCreationAction} from '../../redux/actions/userCreation_actions';
// import FilterEmployee from './filteremployee'
import {Data} from '@react-google-maps/api';
import ProductList from './productList';
import ProductListMapping from './productListMapping';
import ProductListSubmitPage from '../ProductListSubmitPage';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from '../../../../utils/DateFixer';

export default function ProductPriceListMapping(props) {
  const [open, setOpen] = useState(false);
  const [filterBy, setFiterBy] = useState([
    {id: 1, name: 'Products'},
    {id: 2, name: 'Category'},
    {id: 3, name: 'Brand'},
  ]);
  const [filterId, setFilterId] = useState(1);
  const [filterProduct, setFilterProduct] = useState([]);
  const [priceListName, setPriceListName] = useState('');
    const date = new Date();
    const current_date =  moment(date, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [filteredProductList, setFilteredProductList] = useState(props.product_list);
  const [errors, setErrors] = useState({
    priceListName: null,
  });
  const [filtervalue, SetFiltervalue] = useState(false);
  // const [formValue, setFormValue] = useState({
  //   min_price: '',
  //   max_price: '',
  //   brand: [],
  //   category: [],
  // });
  const [checkedType, setCheckedType] = useState('');
  // const [click,setClick]=useState(false)


  const [filter, setFilterValue] = useState({
    min_price: '',

    max_price: '',

    brand: [],

    category: [],
  });

    const [page, setPage] = React.useState(0);

  //  useEffect(() => {
  //   if(filterId === 1){
  //     props.handleStatusFilter('product')
  //   }else if(filterId === 2){
  //     props.handleStatusFilter('category')
  //   }
  //   else {
  //     props.handleStatusFilter('brand')
  //   }
  //  },[filterId])

  console.log(props.price_list,'editprfrwefer')

  useEffect(() => { (async () => {
    if (props.editPriceList.length > 0) {
      if (props.editPriceList[0].id !== undefined) {
        let editData = await props.editPriceList[0];
        let FilterId = editData.filterId !== null && editData.filterId !== undefined ? editData.filterId : 1;
        await setFilterId(FilterId);
        await setPriceListName(editData.price_list_name);
        await setToDate(editData.toDate)
        await setFromDate(editData.fromDate)
        if (FilterId === 3) {
          let EditData = await editData.Category.map((f) => {
            return {...f, name: f.product_name};
          });
          await setFilterProduct(EditData);
        } else {
          let EditData = await editData.productData.map((f) => {
            return {...f, name: f.product_name};
          });
          await setFilterProduct(EditData);
        }
      } else {
        let editData = await props.editPriceList[0];
        let FilterId = (await editData.filterId) || 1;
        await setFilterId(FilterId);
        await setPriceListName(editData.price_list_name);
        await setToDate(editData.toDate)
        await setFromDate(editData.fromDate)

        let EditData = await props.editPriceList.map((d) => {
          return {
            ...d,
            Category: d.Category.map((f) => {
              return {...f, name: f.product_name};
            }),
          };
        });
        await setFilterProduct(EditData);
      }
    }
  })();
}, [props.editPriceList]);

  const handleChangeFilter = (value) => {
    // if (!click) {

    //   setFormValue({
    //     max_price: '',

    //     min_price: '',
    //     brand: [],

    //     category: [],
    //   });
    // }
    SetFiltervalue(value);
  };

  const commonMapping = (array, columnName) => {
    if (Array.isArray(array)) {
      let Data = array.map((a) => a[columnName]?.toLowerCase());
      return Data;
    } else {
      return [];
    }
  };

  const ApplyButton = (formValue) => {
    setPage(0)
    setFilterValue(formValue)
    const min_price =
      formValue.min_price !== '' ? parseInt(formValue.min_price) : 0;
    const max_price =
      formValue.max_price !== ''
        ? parseInt(formValue.max_price)
        : Number.MAX_VALUE;

    const arr = [
      ...commonMapping(formValue.category, 'category'),
      ...commonMapping(formValue.brand, 'brand'),
    ];
    let tempFil = props.product_list.filter(
      (i) =>
        (i.category && arr.includes(i.category.toLowerCase())) ||
        (i.brand && arr.includes(i.brand.toLowerCase())) ||
        (i.unit_price && (formValue.min_price !== '' || formValue.max_price !== '') && i.unit_price > min_price && i.unit_price < max_price),
    );
      if(arr.length === 0 && formValue.min_price === '' && formValue.max_price === ''){
        setFilteredProductList(props.product_list);
      }else{
        setFilteredProductList(tempFil);
      }


    // if (filterVal === 1) {
    //   props.handleStatusFilter('product', data);
    // } else if (filterVal === 2) {
    //   props.handleStatusFilter('category', data);
    // } else {
    //   props.handleStatusFilter('brand', data);
    // }
    // SetFormminmax({
    //   min_price: formValue.min_price,
    //   max_price: formValue.max_price,
    //   filtertype: formValue.filtertype,
    // });
    // setFilterId(filterVal);

    // setClick(true)
    SetFiltervalue(false);
  };
  const handleBack = () => {
    setOpen(false);
  };

  const handleProductData = (valid, data, type) => {
    if (filterId === 1) {
      if (type === 'Single') {
        if (valid) {
          // let dataValue = filterProduct.findIndex((ind) => ind.product_id === data[0].product_id)
          // filterProduct.slice(dataValue,1)
          data.filterId = filterId;
          setFilterProduct([...filterProduct, data]);
        } else {
          data.filterId = filterId;
          let temp = [...filterProduct].filter(
            (i) => i.product_id !== data.product_id,
          );
          setFilterProduct(temp);
        }
      } else {
        if (valid) {
          // let dataValue = filterProduct.findIndex((ind) => ind.product_id === data[0].product_id)
          // filterProduct.slice(dataValue,1)
          setCheckedType('All');
          data.filterId = filterId;
          setFilterProduct(data);
        } else if (type === 'All') {
          setCheckedType('');
          data.filterId = filterId;
          // let temp = [...filterProduct].filter((i) => i.product_id !== data.product_id);
          setFilterProduct([]);
        } else {
          setCheckedType('');
          data.filterId = filterId;
          let temp = [...filterProduct].filter(
            (i) => i.product_id !== data.product_id,
          );
          setFilterProduct(temp);
        }
      }
    } else {
      if (type === 'Single') {
        if (valid) {
          // let dataValue = filterProduct.findIndex((ind) => ind.product_id === data[0].product_id)
          // filterProduct.slice(dataValue,1)
          data.filterId = filterId;
          setFilterProduct([...filterProduct, data]);
        } else {
          data.filterId = filterId;
          let temp = [...filterProduct].filter(
            (i) => i.product_id !== data.product_id,
          );
          setFilterProduct(temp);
        }
      } else {
        if (valid) {
          setCheckedType('All');
          // let dataValue = filterProduct.findIndex((ind) => ind.product_id === data[0].product_id)
          // filterProduct.slice(dataValue,1)
          data.filterId = filterId;
          setFilterProduct(data);
        } else if (type === 'All') {
          setCheckedType('');
          data.filterId = filterId;
          // let temp = [...filterProduct].filter((i) => i.product_id !== data.product_id);
          setFilterProduct([]);
        } else {
          setCheckedType('');
          data.filterId = filterId;
          let temp = [...filterProduct].filter(
            (i) => i.product_id !== data.product_id,
          );
          setFilterProduct(temp);
        }
      }
    }
    // const productData = props.product_list.filter((f) => f.product_id === data.product_id)
  };

 const handleSearchPriceList = (e) => {
  const inputValue = e.target.value;

  const isDuplicate = props.price_list.some(
    (item) => item.price_list_name.toLowerCase().trim() === inputValue.toLowerCase().trim()
  );

  if (isDuplicate) {
    setErrors({ ...errors, priceListName: 'Price list already exists' });
  } else {
    setErrors({ ...errors, priceListName: null });
  }

  setPriceListName(inputValue);
};

  console.log(fromDate,toDate,'dasdade')
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
          {/* <AlertDialog
              delete={this.state.delete}
              handleClose={this.handleClose}
              handleDelete={this.handleDelete}
              id={this.state.id}
            /> */}
          {filtervalue === true && (
            <FilterProductList
              // formValue={formValue}
              // setFormValue={setFormValue}
              handleChangeFilter={handleChangeFilter}
              SetFiltervalue={SetFiltervalue}
              filtervalue={filtervalue}
              filterBy={filterBy}
              filterId={filterId}
              setFilterId={setFilterId}
              ApplyButton={ApplyButton}
              filter={filter}
              // setClick={setClick}
              setFilteredProductList={setFilteredProductList}
              initial_product_list={props.product_list}
            ></FilterProductList>
          )}
          {open === false && (
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
                <Card>
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
                      {props.status === 'Cust_Map' && (
                        <Autocomplete
                          disablePortal
                          name='employee'
                          id='combo-box-demo'
                          fullWidth
                          sx={{mr: '12px'}}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Employee'
                              variant='outlined'
                              // sx={{pr:'12px'}}
                            />
                          )}
                        />
                      )}
                      <TextField
                        fullWidth
                        label='Price List Name'
                        placeholder='Enter price list name'
                        variant='filled'
                        value={priceListName}
                        onChange={handleSearchPriceList}
                         helperText={errors.priceListName || ''}
                        error={errors.priceListName === null ? false : true}
                        required={true}
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
                        value={toMomentOrNull(fromDate)}
                        format='DD/MM/YYYY'
                        minDate={moment()}
                        onChange={(date) =>
                          setFromDate(moment(date).format('YYYY-MM-DD'))
                        }
                        views={['year', 'month', 'day']}
                        slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: (e) => {
                              e.preventDefault();
                            }, required: true } }}
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
                        value={toMomentOrNull(toDate)}
                        format='DD/MM/YYYY'
                        minDate={moment()}
                        onChange={(date) =>
                          setToDate(moment(date).format('YYYY-MM-DD'))
                        }
                        views={['year', 'month', 'day']}
                        slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: (e) => {
                              e.preventDefault();
                            } } }}
                      />
                    </LocalizationProvider>
                    </Grid>
                  <Grid size="grow" />

                  <Grid
                    size={{
                      xs: 2,
                      sm: 1.5,
                      md: 1,
                      lg: 1
                    }}>
                    <Button
                      onClick={() => props.handleClose()}
                      variant='contained'
                      color='secondary'
                      fullWidth
                      sx={{ height: '42px' }}
                    >
                      Back
                    </Button>
                  </Grid>


                <Grid
                  size={{
                    xs: 6,
                    sm: 1.5,
                    md: 1,
                    lg: 1
                  }}>
                  <Button
                    onClick={() => setOpen(true)}
                    disabled={priceListName !== '' && fromDate !== ''  && errors.priceListName === null ? false : true}
                    variant='contained'
                    fullWidth
                    sx={{ height: '42px', ml: 1 }}
                  >
                    Next
                  </Button>
                </Grid>
                  </Grid>
                </Card>
              </Grid>

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container spacing={3}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <Card sx={{borderRadius: '4px'}}>
                      <Grid
                        container
                        display='flex'
                        alignItems='center'
                        p='5px 10px'
                      >
                        <Grid
                          size={{
                            lg: 8,
                            md: 8,
                            sm: 8,
                            xs: 8
                          }}>
                          <Typography
                            variant='h6'
                            style={{
                              fontWeight: 'bold',
                              // padding: '10px 0px 10px 0px',
                            }}
                          >
                            Product List
                          </Typography>
                        </Grid>

                        <Grid
                          display='flex'
                          justifyContent='flex-end'
                          style={{textAlign: 'center'}}
                          gap='10px'
                          size={{
                            lg: 2,
                            md: 2,
                            sm: 3,
                            xs: 3
                          }}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color='primary'
                                  checked={checkedType === 'All' ? true : false}
                                  onClick={(e) =>
                                    handleProductData(
                                      e.target.checked,
                                      filteredProductList,
                                      'All',
                                    )
                                  }
                                  inputProps={{
                                    'aria-label': 'select all desserts',
                                  }}
                                />
                              }
                              label={
                                <span style={{fontWeight: 'bold'}}>
                                  Check All
                                </span>
                              }
                            />
                          </FormGroup>
                        </Grid>
                        <Grid
                          style={{textAlign: 'center', paddingTop: 10}}
                          size={{
                            lg: 1,
                            md: 1,
                            sm: 1,
                            xs: 1
                          }}>
                          <FilterAltIcon
                            style={{cursor: 'pointer'}}
                            onClick={() => handleChangeFilter(true)}
                          ></FilterAltIcon>
                        </Grid>
                      </Grid>
                      <Divider />
                      <ProductList
                        statusId={filterId}
                        setFilterId={setFilterId}
                        product_list={filteredProductList}
                        handleProductData={handleProductData}
                        filterProduct={filterProduct}
                        page = {page}
                        setPage = {setPage}
                      />
                    </Card>
                  </Grid>
                  {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    <Card sx={{borderRadius: '4px'}}>
                      <Box p='5px 10px'>
                        <Typography
                          variant='h6'
                          style={{
                            fontWeight: 'bold',
                            padding: '10px 0px 10px 0px',
                            // paddingBottom: '52px',
                          }}
                        >
                          Product List Mapping
                        </Typography>
                      </Box>
                      <Divider />
                      <ProductListMapping
                        statusId={filterId}
                        filterProduct={filterProduct}
                      />
                    </Card>
                  </Grid> */}
                </Grid>
              </Grid>

              {/* </Grid> */}
            </Grid>
          )}
          {open === true && (
            <ProductListSubmitPage
              price_list={props.price_list}
              statusId={filterId}
              filterProduct={filterProduct}
              handleBack={handleBack}
              priceListName={priceListName}
              fromDate={fromDate}
              toDate={toDate}
              handleSubmit={props.handleSubmit}
              editPriceList={props.editPriceList}
            />
          )}
          {/*            
            <EmployeeSelection
                          catabrand={true}
                          locat={true}
                          customer={this.state.customer}
                          employeeselect={this.props.userCreation}
                          filtedValue={this.state.employee_selected_value}
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
