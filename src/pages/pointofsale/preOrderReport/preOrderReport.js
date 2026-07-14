import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Autocomplete, Box, Breadcrumbs, Button, Card, Dialog, Fade, Grid, IconButton, Link, Stack, TextField, Tooltip, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useDispatch, useSelector } from 'react-redux';
import { costSummaryReportAction, } from 'redux/actions/salary_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import FilterAlt from '@mui/icons-material/FilterAlt';
import CommonSearch from 'utils/commonSearch';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import { getAllPreOrdersAction, getSearchPreOrderReportAction, setSearchPreOrderReportAction } from 'redux/actions/preOrder_actions';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';

const PreOrderReport = (props) => {

  const { preOrderReducer: { cancelledPreOrders } } = useSelector((state) => state);
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(
    CreateNewButtonContext,
  )
  const dispatch = useDispatch();
  const date = new Date();
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: ''
  })
  const [filterDate, setFilterDate] = useState({
    from: defaultFrom,
    to: defaultTo
  });
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("current_month");
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const body = {
      "searchString": "",
      "pageCount": pageCount,
      "numPerPage": pageSize,
    }
    dispatch(getAllPreOrdersAction(body))
  }, [pageCount, pageSize]);

  const columns = [
    { field: 'order_id', headerName: 'Order id', flex: 1, headerAlign: 'center', align: 'center' },
    {
      field: 'order_time',
      headerName: 'Order Time',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
    
        return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
      }
    },
    
    { field: 'company_name', headerName: 'Company Name', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'order_status', headerName: 'Order Status', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'total', headerName: 'Total', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'received_amount', headerName: 'Received Amount', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'location_name', headerName: 'Location', flex: 1, headerAlign: 'center', align: 'center' }
  ];


  const originalData = cancelledPreOrders?.data;

  const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []

  const handlePageChange = async (page) => {
    setPageCount(page);
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size);
  };

  const handleTimeFilterChange = (event, value) => {
    setSelectedTimeFilter(value);

    const updatedData = {
      "current_month": null,
      "last_three_months": null,
      "last_six_months": null,
      "previous_month": null
    };

    if (value) {
      updatedData[value.toLowerCase().replace(/\s/g, '_')] = value;
    }

    setData(updatedData);
  };


  const onKeyDown = (e) => {
    e.preventDefault();
  };

  const handleChange = (value, name) => {
    setFilterDate({ ...filterDate, [name]: value });
  };


  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchData({ ...searchData, searchVal: val });
    setPageCount(0)
    setPageSize(20)
    dispatch(setSearchPreOrderReportAction({ data: [], numRows: 0 }))
    const body = {
      "searchString": val,
      "pageCount": pageCount,
      "numPerPage": pageSize
    }
    dispatch(getSearchPreOrderReportAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  };

  const cancelSearch = (e) => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    dispatch(setSearchPreOrderReportAction({ data: [], numRows: 0 }))
    setPageCount(0)
    setPageSize(20)
    const body = {
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20
    }
    dispatch(getSearchPreOrderReportAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    ))
  };

  const handleDialogClose = () => {
    setFilterOpen(false)
  }


  const applyFilter = () => {
    setPageCount(0);
    setPageSize(20);

    const formattedFrom = filterDate.from ? moment(filterDate.from).format("YYYY-MM-DD HH:mm:ss") : null;
    const formattedTo = filterDate.to ? moment(filterDate.to).format("YYYY-MM-DD HH:mm:ss") : null;

    const body = {
      "searchString": searchData.searchVal,
      "pageCount": 0,
      "numPerPage": 20,
      "from": formattedFrom,
      "to": formattedTo
    };

    dispatch(getAllPreOrdersAction(body));
    setFilterOpen(false);
  };


  const handleClearButtonClick = () => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    setFilterOpen(false)

    const body = {
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20
    }
    dispatch(getAllPreOrdersAction(body))
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Pre Order Report </title>
      </Helmet>
      {filterOpen === true && <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Grid container style={{ height: '250px', width: '280px', padding: '20px' }} spacing={2}>
          <Grid style={{ display: 'flex', justifyContent: 'flex-end' }} size={12}>
            <IconButton onClick={() => handleDialogClose(true)}>
              <CloseIcon />
            </IconButton>
          </Grid>

          <Grid size={12}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                disableFuture
                name="from"
                label="From Date"
                inputVariant="outlined"
                format="DD/MM/YYYY"
                value={toMomentOrNull(filterDate.from)}
                onChange={(date) => handleChange(date, "from")}
                fullWidth
                slotProps={{ textField: { fullWidth: true, variant: "filled", onKeyDown: onKeyDown } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid mb={2} size={12}> {/* Added margin-bottom to create space above buttons */}
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                name="to"
                label="To Date"
                inputVariant="outlined"
                format="DD/MM/YYYY"
                value={filterDate.to}
                onChange={(date) => handleChange(date, "to")}
                fullWidth
                slotProps={{ textField: { fullWidth: true, variant: "filled", onKeyDown: onKeyDown } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Buttons with spacing */}
          <Grid container justifyContent="center">
            <Grid
              style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}
              size={12}>
              <Button onClick={handleClearButtonClick} variant="contained" color="warning">
                Clear
              </Button>
              <Button onClick={applyFilter} variant="contained">
                Apply
              </Button>
            </Grid>
          </Grid>
        </Grid>

      </Dialog>}
      <Card sx={{ p: '20px', width: '100%', height: '100%' }}>
        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          spacing={5}
        >

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize='small' />}
              aria-label='breadcrumb'
            >
              <Link
                href='/report'
                underline='hover'
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
                Home
              </Link>
              <Typography className='page-title'>Pre Order Report</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid
            gap={1}
            display='flex'
            flexDirection='row'
            justifyContent='flex-end'
            size={{
              lg: 9,
              md: 9,
              sm: 9,
              xs: 12
            }}>
            <Stack direction='row' display='flex' alignItems='center' gap={1}>

              <Tooltip
                title='Filter'
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement='top'
              >
                <IconButton>
                  <FilterAlt sx={{ color: '#757575' }} onClick={() => setFilterOpen(true)} />
                </IconButton>
              </Tooltip>
              <CommonSearch
                searchVal={searchData.searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
            </Stack>
          </Grid>
          <Box
            style={{ cursor: 'pointer' }}
            p='20px'
            margin='20px'
            sx={{
              backgroundColor: '#F4F7FE',
              width: '100%',
              height: 750
            }}
          >
            <DataGrid
              rows={dataWithId}
              columns={columns}
              hideScrollbar={true}
              rowCount={cancelledPreOrders.numRows}
              pageSizeOptions={[20, 50, 100]}
              
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth='true'
              sx={{
                '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { width: 10 },
                '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                  backgroundColor: '#B2B2B2',
                  borderRadius: 2,
                  border: '2px solid white',
                },
                '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
                  background: '#999',
                },
                '& .MuiDataGrid-columnHeaders': {
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'rgba(0, 0, 0, 0.7)',
                },
              }}
              
              
              
               paginationModel={{ page: pageCount, pageSize: pageSize }} onPaginationModelChange={(model) => { if (model.page !== pageCount) { ((page) => handlePageChange(page))(model.page); } if (model.pageSize !== pageSize) { ((size) => handlePageSizeChange(size))(model.pageSize); } }}
            />
          </Box>
        </Grid>
      </Card>
    </>
  );
}

export default PreOrderReport