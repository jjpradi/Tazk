import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { Autocomplete, Box, Button, Card, Chip, Dialog, Fade, Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { costSummaryReportAction, setSearchcostSummaryReportAction, getSearchcostSummaryReportAction } from 'redux/actions/salary_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAlt from '@mui/icons-material/FilterAlt';
import CommonSearch from 'utils/commonSearch';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const CostSummaryReport = (props) => {
  const navigate = useNavigate();
  const { SalaryReducers: { costSummaryReport }, rbacReducer: {menuAccess = []} } = useSelector((state) => state);
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(
    CreateNewButtonContext,
  )
  const dispatch = useDispatch();
  const storage = getsessionStorage();
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
  const [isApiFinished, setIsApiFinished] = useState(false);
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
    setIsApiFinished(false);
    setLoaderStatusHandler(true);
    apiCalls(dispatch(costSummaryReportAction(body))).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
  }, [ pageCount, pageSize ]);

  const maincolumns = [
    { field: 'employee_code', headerName: 'Emp code', width: 150 },
    { field: 'full_name', headerName: 'Emp Name', width: 150,renderCell: (params) => formatName(params.row.full_name), },
    { field: 'salary_month', headerName: 'Salary Month', width: 150 },
    { field: 'salary_year', headerName: 'Salary Year', width: 150 }
  ];

  const dynamicAllowances = [
    { field: 'BasicPay', headerName: 'Basic Pay', width: 180 },
    { field: 'DearnessAllowance', headerName: 'Dearness Allowance', width: 180 },
    { field: 'HouseRentAllowance', headerName: 'HouseRent Allowance', width: 180 },
    { field: 'ConveyanceAllowance', headerName: 'Conveyance Allowance', width: 180 },
    { field: 'Incentive', headerName: 'Incentive', width: 180 },
    { field: 'OverTimeAllowance', headerName: 'OverTime Allowance', width: 180 },
    { field: 'SpecialAllowance', headerName: 'Special Allowance', width: 180 },
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
    setIsApiFinished(false);
    setLoaderStatusHandler(true);
    setPageCount(0)
    setPageSize(20)
    dispatch(setSearchcostSummaryReportAction({ data: [], numRows: 0 }))
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
      (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
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

  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__salary__costsummary_report', 'can_export')

  const handleExportClick = async () => {
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
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(costSummaryReportAction(body, setModalTypeHandler, setLoaderStatusHandler, (res) => {
          exportToExcel(Object.keys(res[0] || {}), res);
        }))
      );
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const periodChips = [
    { key: 'last_six_months', label: 'Last 6 Months' },
    { key: 'last_three_months', label: 'Last 3 Months' },
    { key: 'previous_month', label: 'Previous Month' },
    { key: 'current_month', label: 'Current Month' },
  ];

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | CostSummary Report </title>
      </Helmet>

      {/* Filter Dialog */}
      {filterOpen && (
        <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="xs">
          <Box sx={{ p: 3 }}>
            <Box display='flex' justifyContent='flex-end' mb={2}>
              <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
                <IconButton onClick={() => handleDialogClose(true)}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Autocomplete
              options={timeFilterOptions}
              value={selectedTimeFilter}
              onChange={handleTimeFilterChange}
              getOptionLabel={(option) => timeFilterDisplayNames[option] || option}
              renderInput={(params) => <TextField {...params} label="CostSummary Report" />}
              sx={{ mb: 3 }}
            />
            <Box display='flex' justifyContent='center' gap={2}>
              <Button color='secondary' variant='contained' onClick={handleClearButtonClick}>
                Clear
              </Button>
              <Button color='primary' variant='contained' onClick={applyFilter}>
                Apply
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      <Card
        sx={{
          width: '100%',
          height: 'calc(100vh - 75px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid #eee',
            flexShrink: 0,
          }}
        >
          {/* Left: Title */}
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            CostSummary Report
          </Typography>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Period chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
              {periodChips.map((m) => (
                <Chip
                  key={m.key}
                  label={m.label}
                  size='small'
                  clickable
                  onClick={() => handlePreviousMonthClick(m.key)}
                  sx={{
                    fontWeight: button === m.key ? 600 : 400,
                    fontSize: '0.75rem',
                    height: 26,
                    bgcolor: button === m.key ? 'primary.main' : 'transparent',
                    color: button === m.key ? '#fff' : 'text.secondary',
                    '&:hover': {
                      bgcolor: button === m.key ? 'primary.dark' : '#e0e0e0',
                    },
                  }}
                />
              ))}
            </Box>

            <CommonSearch
              searchVal={searchData.searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />

            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
              <IconButton size='small' onClick={() => setFilterOpen(true)}>
                <FilterAlt sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={handleExportClick}>
                  <FileDownloadIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title='Close'>
              <IconButton size='small' onClick={() => navigate('/report')}>
                <CloseIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {isApiFinished ? (
            <DataGrid
              rows={dataWithId}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={costSummaryReport.numRows || 0}
              paginationModel={{ page: pageCount, pageSize: pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== pageCount) handlePageChange(model.page);
                if (model.pageSize !== pageSize) handlePageSizeChange(model.pageSize);
              }}
              sx={{
                height: '100%',
                border: 0,
                '& .MuiDataGrid-main': { overflow: 'hidden' },
                '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F4F7FE',
                  fontSize: 12,
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5faf8',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #eee',
                },
              }}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Loading...
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
}

export default CostSummaryReport