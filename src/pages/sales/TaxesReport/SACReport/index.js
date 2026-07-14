import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import DataGridTemp from 'components/dataGridTemp';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Autocomplete, Box, Breadcrumbs, Button, Card, Dialog, Fade, Grid, IconButton, InputAdornment, Link, Stack, TextField, Tooltip, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useDispatch, useSelector } from 'react-redux';
import { costSummaryReportAction, setSearchcostSummaryReportAction, getSearchcostSummaryReportAction } from 'redux/actions/salary_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { filterLeaveHistoryAction } from 'redux/actions/shifts.actions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAlt from '@mui/icons-material/FilterAlt';
import CommonSearch from 'utils/commonSearch';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';

const SACReport = (props) => {

  const { SalaryReducers: { costSummaryReport } } = useSelector((state) => state);
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(
    CreateNewButtonContext,
  )
  const dispatch = useDispatch();
  const [ searchData, setSearchData ] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: [],
    "current_month": null,
    "last_three_months": null,
    "last_six_months": null,
    "previous_month": null
  })
  const [ pageCount, setPageCount ] = useState(0)
  const [ pageSize, setPageSize ] = useState(20)
  const [ selectedTimeFilter, setSelectedTimeFilter ] = useState("current_month");
  const [ button, setButton ] = useState('current_month')
  const [ filterOpen, setFilterOpen ] = useState(false)
  const [ data, setData ] = useState({
    "current_month": "current_month",
    "last_three_months": null,
    "last_six_months": null,
    "previous_month": null
  });
  const timeFilterOptions = [ 'current_month', 'previous_month', 'last_three_months', 'last_six_months' ];
  const timeFilterDisplayNames = {
    'current_month': 'Current Month',
    'previous_month': 'Previous Month',
    'last_three_months': 'last Three Months',
    'last_six_months': 'Last Six Months',
  };

  useEffect(() => {
    const body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      "searchString": "",
      "pageCount": pageCount,
      "numPerPage": pageSize,
      "employee_id": null
    }
    dispatch(costSummaryReportAction(body))
  }, [ pageCount, pageSize ]);

  const maincolumns = [
    { field: 'employee_code', headerName: 'Emp code', width: 150 },
    { field: 'full_name', headerName: 'Emp Name', width: 150 },
    { field: 'salary_month', headerName: 'Salary Month', width: 150 },
    { field: 'salary_year', headerName: 'Salary Year', width: 150, align : 'right' }
  ];

  const dynamicAllowances = [
    { field: 'BasicPay', headerName: 'Basic Pay', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }, headerAlign: 'right' },
    { field: 'DearnessAllowance', headerName: 'Dearness Allowance', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }, headerAlign: 'right' },
    { field: 'HouseRentAllowance', headerName: 'HouseRent Allowance', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' },  headerAlign: 'right'},
    { field: 'ConveyanceAllowance', headerName: 'Conveyance Allowance', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }, headerAlign: 'right' },
    { field: 'Incentive', headerName: 'Incentive', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }, headerAlign: 'right' },
    { field: 'OverTimeAllowance', headerName: 'OverTime Allowance', width: 180, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' }, headerAlign: 'right' },
  ];

  const columns = [ ...maincolumns, ...dynamicAllowances ]

  const originalData = costSummaryReport?.data;
  console.log(originalData, "originalData")
  const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []
  console.log(dataWithId, "dataWithId");

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
      updatedData[ value.toLowerCase().replace(/\s/g, '_') ] = value;
    }

    setData(updatedData);
  };



  const requestSearch = (e) => {
    let val = e.target.value;
    console.log("Search value:", val);
    setSearchData({ ...searchData, searchVal: val });
    setPageCount(0)
    setPageSize(20)
    if(val.length >= 3 || val.length === 0) {
      dispatch(setSearchcostSummaryReportAction({ data: [], numRows: 0 }))
    }
    const body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      "searchString": val,
      "pageCount": pageCount,
      "numPerPage": pageSize,
      "employee_id": null
    }
    dispatch(getSearchcostSummaryReportAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  };

  const cancelSearch = (e) => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    dispatch(setSearchcostSummaryReportAction({ data: [], numRows: 0 }))
    setPageCount(0)
    setPageSize(20)
    const body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    console.log("ddddd");
    dispatch(getSearchcostSummaryReportAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    ))
  };

  const handleDialogClose = () => {
    setFilterOpen(false)
  }


  const applyFilter = () => {
    setButton()
    setPageCount(0)
    setPageSize(20)
    const body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      "searchString": searchData.searchVal,
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    dispatch(costSummaryReportAction(body))
    setFilterOpen(false)
  }

  const handleClearButtonClick = () => {
    setButton('current_month')
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    setSelectedTimeFilter("current_month");
    setFilterOpen(false)

    const body = {
      "current_month": "current_month",
      "last_three_months": null,
      "last_six_months": null,
      "previous_month": null,
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    dispatch(costSummaryReportAction(body))

    setData({
      "current_month": "current_month",
      "last_three_months": null,
      "last_six_months": null,
      "previous_month": null
    });

  };

  const handlePreviousMonthClick = (filter) => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    setSelectedTimeFilter(filter)
    setButton(filter)
    console.log(filter, selectedTimeFilter, 'checkeddata');
    setPageCount(0)
    // setPageSize(20)
    const body = {
      "current_month": filter === "current_month" ? "current_month" : null,
      "last_three_months": filter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": filter === "last_six_months" ? "last_six_months" : null,
      "previous_month": filter === "previous_month" ? "previous_month" : null,
      "searchString": searchData.searchVal,
      "pageCount": 0,
      "numPerPage": pageSize,
      "employee_id": null
    }
    dispatch(costSummaryReportAction(body))
  }

  const exportToExcel = useCallback((columns, data) => {
    console.log(data, 'data');
    const columnNames = {
      employee_id: 'Emp id',
      employee_name: 'Emp Name',
      allowance_type_id: 'Allowance id',
      allowance_name: 'Allowance Name',
      allowance_code: 'Allowance Code',
      allowance_amount: 'Allowance Amount'
    };
    const selectedColumns = [
      'employee_id',
      'employee_name',
      'allowance_type_id',
      'allowance_name',
      'allowance_code',
      'allowance_amount'
    ];
    const headers = selectedColumns.map(col => columnNames[ col ] || col);
    const sheetData = [ headers, ...data.map(row => selectedColumns.map(col => row[ col ] || '')) ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([ excelBuffer ], { type: 'application/octet-stream' });
    saveAs(blob, 'CostSummary Report.xlsx');
  }, []);


  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | SAC Report </title>
      </Helmet>
      {filterOpen === true && <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Grid container style={{ height: '250px', width: '280px', padding: '20px' }}>
          <div style={{ marginLeft: '200px' }}>
            <IconButton
              onClick={() => handleDialogClose(true)}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Autocomplete
              options={timeFilterOptions}
              value={selectedTimeFilter}
              onChange={handleTimeFilterChange}
              getOptionLabel={(option) => timeFilterDisplayNames[ option ] || option}
              renderInput={(params) => <TextField {...params} label="CostSummary Report" />}
            />
          </Grid>
          <Grid container style={{ display: 'flex', justifyContent: 'space-between' }} >
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Button
                fullWidth
                onClick={handleClearButtonClick}
                variant='contained'
                color='warning'
              >
                Clear
              </Button>
            </Grid>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Button
                fullWidth
                onClick={applyFilter}
                variant='contained'
              >
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
              <Typography className='page-title'>SAC Report</Typography>
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
              {/* <Tooltip
                title='Export'
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement='top'
              >
                <IconButton
                  onClick={async () => {
                    let body = {
                      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
                      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
                      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
                      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
                       exportData: true,
                      "searchString": searchData.searchVal,
                      "employee_id": null
                    };

                    try {
                      const response = await apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                        dispatch(costSummaryReportAction(body, setModalTypeHandler, setLoaderStatusHandler, (res) => {
                          exportToExcel(Object.keys(res[ 0 ] || {}), res);
                        })
                        ));
                    } catch (error) {
                      console.error('Error exporting data:', error);
                    }
                  }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip> */}

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
              rowCount={costSummaryReport.numRows}
              pageSizeOptions={[ 20, 50, 100 ]}
              
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth='true'
              sx={{
                '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { width: 12 },
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

export default SACReport