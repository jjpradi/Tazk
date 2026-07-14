import {
  Autocomplete,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {Helmet} from 'react-helmet-async';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {titleURL} from 'http-common';
import DataGridTemp from 'components/dataGridTemp';
import {FilterAlt} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { get_purchaseSummaryAction, purchaseSummaryAction, set_purchaseSummaryAction } from 'redux/actions/purchase_actions';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { FilterAction } from 'redux/actions/customer_actions';
import { listProductAction } from 'redux/actions/product_actions';
import API_URLS from 'utils/customFetchApiUrls';
import { useCustomFetch } from 'utils/useCustomFetch';
import CloseIcon from '@mui/icons-material/Close';
import toMomentOrNull from '../../../utils/DateFixer';

const PurchaseSummary = () => {
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [type, setType] = useState('monthly');
  const [button, setButton] = useState('1');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(true);
  const customFetch = useCustomFetch();

  const getFiscalYearDates = () => {
  const today = moment();
  const currentMonth = today.month(); // 0 = Jan, 3 = April
  const fiscalYearStartMonth = 3; // April

  let fromDate, toDate;

  if (currentMonth >= fiscalYearStartMonth) {
    // We are in current FY (Apr -> Dec/Jan/Feb/Mar)
    fromDate = moment().month(fiscalYearStartMonth).startOf('month');
    toDate = today;
  } else {
    // We are in Jan-Feb-Mar -> FY started last year
    fromDate = moment().subtract(1, 'year').month(fiscalYearStartMonth).startOf('month');
    toDate = today;
  }

  return {
    fromDate: fromDate.format('YYYY-MM-DD'),
    toDate: toDate.format('YYYY-MM-DD')
  };
};

const fy = getFiscalYearDates();

  const [filterValues, setFilterValues] = useState({
    selectRange: 'Current Fiscal Year',
    fromDate: fy.fromDate,
    toDate: fy.toDate,
    supplier_id: null,
    location_id: null,
    brand: null,
    category: null

  });

      const { purchasesReducer: {getPurchaseSummary},stockLocationReducer:{stocklocation},customerReducer:{customer_filter},productReducer:{product} } = useSelector((state) => state);

          const dataWithId = getPurchaseSummary.data?.length ? getPurchaseSummary.data?.map((row, index) => ({ ...row, id: index })) : []
  
      const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(CreateNewButtonContext);
  
      const dispatch = useDispatch();

       const handleExport = async () => {

         const brands = type === 'brand' ?  [...new Set(filterValues.brand?.map(item => item.brand))] : null;
    console.log(filterValues,'dsfjhsdhkh')
    const categories =  type === 'category' ? [...new Set(filterValues.category?.map(item => item.category))] : null;
    const locations =  type === 'location' ? [...new Set(filterValues.location_id?.map(item => item.location_id))] : null;
    const suppliers =  type === 'customer' ? [...new Set(filterValues.supplier_id?.map(item => item.supplier_id))] : null;
              let payLoad = {
                fromDate: filterValues.fromDate,
                toDate: filterValues.toDate,
                pageCount: page,
                numPerPage: pageSize,
                searchString: searchVal,
                supplier_id: suppliers,
                brand:  brands,
                category:  categories,
                location_id :  locations,
                exportType : 'export',
                type : type

            }
          
                const { data: resData } = await customFetch(
                  API_URLS.GET_PURCHASE_SUMMARY,
                  'POST',
                  payLoad
              );

              console.log(resData,'sdfsdfgsj')
      
      
                if (!resData || !resData.data) {
                  console.error("Unexpected", resData);
                  alert("No data ");
                  return;
              }
          
              const columnHeaders = columns.map(column => column.headerName); // Extract column headers
              const rows = resData?.data?.map(row => columns.map(column => row[column.field])); // Extract row data
          
              // Construct CSV content
              let csvContent = "data:text/csv;charset=utf-8,";
              csvContent += columnHeaders.join(",") + "\n"; // Add column headers
              csvContent += rows.map(row => row.join(",")).join("\n"); // Add row data
          
              // Create a temporary anchor element and trigger download
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", 'Purchase Summary Report' + ".csv");
              document.body.appendChild(link);
              link.click();
          }

 const rangeOptions = ['This Quater','Last Quater','Current Fiscal Year','Previous Fiscal Year','Last 365 days'];

  const handleClear = () => {
    setFilterValues((prev) => ({
      ...prev,
      selectRange: 'Current Fiscal Year',
      fromDate: fy.fromDate,
      toDate: fy.toDate,
      brand : null,
      category : null,
      location_id : null,
      supplier_id : null
    }));
      let payLoad = {
                fromDate:  moment().month(3).startOf('month'),
                toDate: moment(),
                pageCount: page,
                numPerPage: pageSize,
                searchString: searchVal,
                supplier_id: null,
                location_id:  null,
                brand:  null,
                category:  null,
                type : type
            }
      
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      dispatch(purchaseSummaryAction(payLoad)),
      )

    setFilterOpen(false);
  };

  const handleApply = () => {
    const brands =( type === 'brand' && filterValues.brand !== null) ?  [...new Set(filterValues.brand?.map(item => item.brand))] : null;
    console.log(filterValues,'dsfjhsdhkh')
    const categories =  (type === 'category' || filterValues.category !== null) ? [...new Set(filterValues.category?.map(item => item.category))] : null;
    const locations =  (type === 'location' || filterValues.location_id !== null) ? [...new Set(filterValues.location_id?.map(item => item.location_id))] : headerLocationId;
    const suppliers =  (type === 'customer' || filterValues.supplier_id !== null) ? [...new Set(filterValues.supplier_id?.map(item => item.supplier_id))] : null;
    let payLoad = {
                fromDate: filterValues.fromDate,
                toDate: filterValues.toDate,
                pageCount: page,
                numPerPage: pageSize,
                searchString: searchVal,
                supplier_id: suppliers,
                brand:  brands,
                category:  categories,
                location_id :  locations,
                type : type
            }
      
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      dispatch(purchaseSummaryAction(payLoad)),
      )
    setFilterOpen(false);
  };

 const isCompactType = ['brand', 'category', 'location', 'customer'].includes(type);

const columns = [
  { field: 'year', headerName: 'Year', flex: isCompactType ? 1 : 2, minWidth: 150 },
  { field: 'month', headerName: 'Month', flex: isCompactType ? 1 : 2, minWidth: 150 },
  type === 'brand' && { field: 'brand', headerName: 'Brand', flex: 1, minWidth: 150 },
  type === 'category' && { field: 'category', headerName: 'Category', flex: 1, minWidth: 150 },
  type === 'location' && { field: 'location_name', headerName: 'Location', flex: 1, minWidth: 150 },
  type === 'customer' && { field: 'company_name', headerName: 'Supplier', flex: 1.5, minWidth: 200 },
  { field: 'value', headerName: 'Value', flex: isCompactType ? 1 : 2, minWidth: 150, align : 'left' },
].filter(Boolean);


  const handlePageChange = async (page) => {
    setPage(page);
  };

  const handlePageSizeChange = async (size) => {
    setPage(0);
    setPageSize(size);
  };

  const requestSearch = async(e) => {
       let val = e;
            setSearchVal(val)
            dispatch(set_purchaseSummaryAction({data:[], numRows:0}));
            let payLoad = {
              fromDate: filterValues.fromDate,
              toDate: filterValues.toDate,
              pageCount: page,
              numPerPage: pageSize,
              searchString: val,
              supplier_id: filterValues.supplier_id,
              brand: filterValues.brand,
              category: filterValues.category,
              location_id: filterValues.location_id,
            }
            await dispatch(get_purchaseSummaryAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))
  };

  const cancelSearch = () => {
            setPage(0)
            setSearchVal('')
    
            let payLoad = {
                fromDate: filterValues.fromDate,
                toDate: filterValues.toDate,
                pageCount: page,
                numPerPage: pageSize,
                searchString: '',
                supplier_id: null,
                location_id: null,
                brand: null,
                category: null
            }
            dispatch(purchaseSummaryAction(payLoad))
  };

  const handlePreviousMonthClick = (type) => {
    setType(type);
  };

  const handleChange = (name, value) => {
  setFilterValues((prev) => ({ ...prev, [name]: value }));

  if (name === 'selectRange') {
    let fromDate = moment();
    let toDate = moment();

    if (value === 'This Quater') {
      fromDate = moment().startOf('quarter');
      toDate = moment().endOf('quarter');

    } else if (value === 'Last Quater') {
      fromDate = moment().subtract(1, 'quarter').startOf('quarter');
      toDate = moment().subtract(1, 'quarter').endOf('quarter');

    } else if (value === 'Current Fiscal Year') {
      const currentMonth = moment().month();
      const fiscalYearStartMonth = 3; 
      if (currentMonth >= fiscalYearStartMonth) {
        fromDate = moment().month(fiscalYearStartMonth).startOf('month');
        toDate = moment();
      } else {
        fromDate = moment().subtract(1, 'year').month(fiscalYearStartMonth).startOf('month');
        toDate = moment();
      }

    } else if (value === 'Previous Fiscal Year') {
      fromDate = moment()
        .subtract(1, 'year')
        .month(3)
        .startOf('month');
      toDate = moment()
        .month(2)
        .endOf('month');

    } else if (value === 'Last 365 days') {
      fromDate = moment().subtract(365, 'days').startOf('day');
      toDate = moment().endOf('day');
    }

    setFilterValues((prev) => ({
      ...prev,
      fromDate: fromDate.format('YYYY-MM-DD'),
      toDate: toDate.format('YYYY-MM-DD'),
    }));
  }
};


  const handleDateChange = (event, name) => {
    if (event === null) {
      setFilterValues((prev) => ({...prev, [name]: null}));
    } else if (!event?._isValid) {
      setFilterValues((prev) => ({...prev, [name]: null}));
    } else {
      setFilterValues((prev) => ({
        ...prev,
        [name]: moment(event._d).format('YYYY-MM-DD'),
      }));
    }
  };

      useEffect(() => {
         let payLoad = {
                fromDate: filterValues.fromDate,
                toDate: filterValues.toDate,
                pageCount: page,
                numPerPage: pageSize,
                searchString: searchVal,
                supplier_id: null,
                brand: null,
                category: null,
                location_id : headerLocationId == "null" ? null : headerLocationId,
                type : type
            }

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      dispatch(purchaseSummaryAction(payLoad)),
      )

      dispatch(
            listStockLocationAction(
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
          );

          dispatch(
                  FilterAction(
                     3,
                    'vendor',
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                  ),
                );

                 dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));



      }, [page, pageSize])


      useEffect(()=>{
         setFilterValues((prev) => ({
      ...prev,
      supplier_id : null,
      location_id : null,
      category : null,
      brand : null,


    }));

    let payLoad = {
                fromDate: filterValues.fromDate,
                toDate: filterValues.toDate,
                pageCount: page,
                numPerPage: pageSize,
                searchString: searchVal,
                supplier_id: null,
                brand: null,
                category: null,
                location_id : headerLocationId == "null" ? null : headerLocationId,
                type : type
            }
      
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      dispatch(purchaseSummaryAction(payLoad)),
      )
      },[type,headerLocationId])

      console.log(dataWithId,'ghfhgfzs',getPurchaseSummary)

  return (
    <div>
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Purchase Summary Report </title>
        </Helmet>
        <DataGridTemp
          columns={columns}
          columnData={columns}
          rowData={dataWithId}
          exportData={true}
          data={dataWithId}
          pageType={'purchaseSummary'}
          pageSize={pageSize}
          total = {dataWithId.length > 0 ? dataWithId[0].total_value : 0}
          isApiFinished = {isApiFinished}
          // pageType='task'
          page={page}
          type='latestPayrollReport'
          onPageChange={(page) => handlePageChange(page)}
          onPageSizeChange={(size) => handlePageSizeChange(size)}
          requestSearch={(e) => requestSearch(e.target.value)}
          cancelSearch={cancelSearch}
          title={
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize='small' />}
              aria-label='breadcrumb'
            >
              <Link
                href='/report'
                underline='hover'
                sx={{display: 'flex', alignItems: 'center'}}
              >
                <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
                Home
              </Link>
              <Typography className='page-title'>Purchase Summary</Typography>
            </Breadcrumbs>
          }
          rowCount={getPurchaseSummary.numRows}
          // handlePreviousMonthClick={handlePreviousMonthClick}
          handleExport={handleExport}
          // button={button}
          // setButton={setButton}
          // searchVal={searchVal}
          chips={
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Grid
                gap={3}
                display='flex'
                flexDirection='row'
                justifyContent='flex-end'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Button
                  variant={button === '1' ? 'contained' : 'outlined'}
                  color='primary'
                  sx={{
                    height: {xs: '28px', sm: '30px'},
                    padding: {xs: '2px 6px', sm: '4px 8px'},
                    minWidth: {xs: '60px', sm: 'auto'},
                    fontSize: {xs: '10px', sm: '12px'},
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    borderRadius: 8,
                    '& .MuiSvgIcon-root': {
                      fontSize: 26,
                    },
                  }}
                  onClick={() => {
                    handlePreviousMonthClick('monthly');
                    setButton('1');
                  }}
                >
                  {'Month'}
                </Button>
                <Button
                  variant={button === '2' ? 'contained' : 'outlined'}
                  color='primary'
                  sx={{
                    height: {xs: '28px', sm: '30px'},
                    padding: {xs: '2px 6px', sm: '4px 8px'},
                    minWidth: {xs: '60px', sm: 'auto'},
                    fontSize: {xs: '10px', sm: '12px'},
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    borderRadius: 8,
                    '& .MuiSvgIcon-root': {
                      fontSize: 26,
                    },
                  }}
                  onClick={() => {
                    handlePreviousMonthClick('brand');
                    setButton('2');
                  }}
                >
                  {'Brand Wise'}
                </Button>
                <Button
                  variant={button === '3' ? 'contained' : 'outlined'}
                  color='primary'
                  sx={{
                    height: {xs: '28px', sm: '30px'},
                    padding: {xs: '2px 6px', sm: '4px 8px'},
                    minWidth: {xs: '60px', sm: 'auto'},
                    fontSize: {xs: '10px', sm: '12px'},
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    borderRadius: 8,
                    '& .MuiSvgIcon-root': {
                      fontSize: 26,
                    },
                  }}
                  onClick={() => {
                    handlePreviousMonthClick('category');
                    setButton('3');
                  }}
                >
                  {'category Wise'}
                </Button>
                <Button
                  variant={button === '4' ? 'contained' : 'outlined'}
                  color='primary'
                  sx={{
                    height: {xs: '28px', sm: '30px'},
                    padding: {xs: '2px 6px', sm: '4px 8px'},
                    minWidth: {xs: '60px', sm: 'auto'},
                    fontSize: {xs: '10px', sm: '12px'},
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    borderRadius: 8,
                    '& .MuiSvgIcon-root': {
                      fontSize: 26,
                    },
                  }}
                  onClick={() => {
                    handlePreviousMonthClick('location');
                    setButton('4');
                  }}
                >
                  {'Location Wise'}
                </Button>

                <Button
                  variant={button === '5' ? 'contained' : 'outlined'}
                  color='primary'
                  sx={{
                    height: {xs: '28px', sm: '30px'},
                    padding: {xs: '2px 6px', sm: '4px 8px'},
                    minWidth: {xs: '60px', sm: 'auto'},
                    fontSize: {xs: '10px', sm: '12px'},
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    borderRadius: 8,
                    '& .MuiSvgIcon-root': {
                      fontSize: 26,
                    },
                  }}
                  onClick={() => {
                    handlePreviousMonthClick('customer');
                    setButton('5');
                  }}
                >
                  {'Supplier Wise'}
                </Button>
              </Grid>
            </div>
          }
          filter={
            <Grid>
              <IconButton onClick={() => setFilterOpen(true)}>
                <FilterAlt />
              </IconButton>
            </Grid>
          }
        />

        <Dialog
          open={filterOpen}
          onClose={!filterOpen}
          maxWidth={'xs'}
          fullWidth
          align
        >
          <DialogContent>
            <div style={{display: 'flex', justifyContent: 'end' , marginBottom : 2}}>
            <IconButton aria-label="close" onClick={() => setFilterOpen(false)} >
              <CloseIcon />
            </IconButton>
          </div>
            <Grid container spacing={3}>
              <Grid
                sx={12}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12
                }}>
                <Autocomplete
                  value={filterValues.selectRange}
                  onChange={(event, newValue) =>
                    handleChange('selectRange', newValue)
                  }
                  options={rangeOptions}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Select Range'
                      variant='filled'
                    />
                  )}
                />
              </Grid>
              <Grid
                sx={12}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='From Date'
                    value={toMomentOrNull(filterValues.fromDate)}
                    format='DD/MM/YYYY'
                    onChange={(event) => handleDateChange(event, 'fromDate')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'filled',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid
                sx={12}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label='To Date'
                    value={toMomentOrNull(filterValues.toDate)}
                    format='DD/MM/YYYY'
                    onChange={(event) => handleDateChange(event, 'toDate')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'filled',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {type === 'brand' && 
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                            <Autocomplete
                              multiple
                              value={filterValues.brand !== 'null' ? filterValues.brand || [] : []}
                              onChange={(event, newValue) => {
                                setFilterValues({
                                  ...filterValues,
                                  brand: newValue.length === 0 ? '' : newValue,
                                });
                              }}
                              disablePortal = {false}
                              name='brand'
                              id='combo-box-demo'
                              options={_.uniqBy(product, 'brand')}
                              getOptionLabel={(option) => option.brand || ''}
                              fullWidth
                              renderInput={(params) => (
                                <TextField 
                                {...params} 
                                label='Brand' 
                                variant='filled' />
                              )}
                            />
                          </Grid>}

                           {type === 'category' && <Grid
                             size={{
                               lg: 12,
                               md: 12,
                               sm: 12,
                               xs: 12
                             }}>
                                        <Autocomplete
                                          multiple
                                          value={
                                            filterValues.category !== 'null' ? filterValues.category || [] : []
                                          }
                                          onChange={(event, newValue) => {
                                            setFilterValues({
                                              ...filterValues,
                                              category: newValue.length === 0 ? '' : newValue,
                                            });
                                          }}
                                          // disablePortal
                                          name='category'
                                          id='combo-box-demo'
                                          options={_.uniqBy(product, 'category')}
                                          getOptionLabel={(option) => option.category || ''}
                                          fullWidth
                                          renderInput={(params) => (
                                            <TextField 
                                            {...params} 
                                            label='Category' 
                                            variant='filled' />
                                          )}
                                        />
                                      </Grid>}

                                         {type === 'location' && <Grid
                                           size={{
                                             lg: 12,
                                             md: 12,
                                             sm: 12,
                                             xs: 12
                                           }}>
                                                    <Autocomplete
                                                      multiple
                                                      value={
                                                        filterValues.location_id !== 'null'
                                                          ? filterValues.location_id || []
                                                          : []
                                                      }
                                                      onChange={(event, newValue) => {
                                                        setFilterValues({
                                                          ...filterValues,
                                                          location_id: newValue.length === 0 ? 'null' : newValue,
                                                        });
                                                      }}
                                                      disablePortal
                                                      name='location_id'
                                                      id='combo-box-demo'
                                                      options={_.uniqBy(stocklocation, 'location_name')}
                                                      getOptionLabel={(option) => option.location_name || ''}
                                                      fullWidth='true'
                                                      renderInput={(params) => (
                                                        <TextField {...params} 
                                                        label='Location'
                                                         variant='filled' 
                                                         />
                                                      )}
                                                    />
                                                  </Grid>}

                                                   {type === 'customer' && <Grid
                                                     size={{
                                                       lg: 12,
                                                       md: 12,
                                                       sm: 12,
                                                       xs: 12
                                                     }}>
                                                                <Autocomplete
                                                                  multiple
                                                                  value={filterValues.supplier_id !== 'null' ? filterValues.supplier_id || [] : []}
                                                                  onChange={(event, newValue) => {
                                                  
                                                                    setFilterValues({
                                                                      ...filterValues,
                                                                      supplier_id: newValue.length === 0 ? 'null' : newValue,
                                                                    });
                                                                  }}
                                                                  disablePortal
                                                                  name='supplier'
                                                                  id='combo-box-demo'
                                                                  options={_.uniqBy(customer_filter, 'company_name')}
                                                                  getOptionLabel={(option) => option.company_name || ''}
                                                                  fullWidth
                                                                  renderOption={(props, option) => (
                                                                    <li {...props} style={{ textAlign: 'left' }}>
                                                                      {option.company_name}
                                                                    </li>
                                                                  )}
                                                                  ListboxProps={{
                                                                    style: {
                                                                      maxHeight: "170px",
                                                                    },
                                                                  }}
                                                                  renderInput={(params) => (
                                                                    <TextField 
                                                                    {...params} 
                                                                    label='Supplier' 
                                                                    variant='filled' 
                                                                    />
                                                                  )}
                                                                />
                                                              </Grid>}
            </Grid>
          </DialogContent>

          <DialogActions sx={{justifyContent: 'flex-end', paddingBottom: 2}}>
            <Button variant='contained' color='error' onClick={handleClear}>
              Clear
            </Button>
            <Button variant='contained' color='primary' onClick={handleApply}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </div>
  );
};

export default PurchaseSummary;
