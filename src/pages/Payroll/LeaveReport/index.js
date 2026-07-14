import React, { useEffect, useState, useContext, useCallback } from 'react';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { Autocomplete, Box, Breadcrumbs, Button, Card, Chip, Dialog, Fade, Grid, IconButton, InputAdornment, Link, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  filterLeaveHistoryAction,
  getLeaveHistoryAction, get_searchLeaveReportAction, set_searchLeaveReportAction
} from '../../../redux/actions/shifts.actions';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat, commonDateFormat1 } from 'utils/getTimeFormat';
import { Helmet } from 'react-helmet-async';
import FilterAlt from '@mui/icons-material/FilterAlt';
import CommonToolTip from 'components/ToolTip';
import CloseIcon from '@mui/icons-material/Close';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx-js-style';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import moment from "moment";
import { useNavigate } from 'react-router-dom';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const LeaveReport = () => {
  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: [],
    "current_month": null,
    "last_three_months": null,
    "last_six_months": null,
    "previous_month": null,
    // "today": null
  })
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(
    CreateNewButtonContext,
  );
  const timeFilterOptions = ['current_month', 'previous_month', 'last_three_months', 'last_six_months']; //'today',
  const timeFilterDisplayNames = {
    // 'today': 'Today',
    'current_month': 'Current Month',
    'previous_month': 'Previous Month',
    'last_three_months': 'last Three Months',
    'last_six_months': 'Last Six Months',
  };
  const dispatch = useDispatch();
  const {
    ShiftsReducer: { leaveHistory, searchLeaveReportData, filterLeaveHistory, leaveHistoryCount },
    rbacReducer: {menuAccess = []}
  } = useSelector((state) => state);
  console.log(leaveHistory, 'leaveHistory');
  const filteredLeaveHistoryData = (leaveHistory?.data ?? []).filter((row) => {
    if (!row || typeof row !== 'object') return false;
    // Include rows where status is 'A', 'PL', or 'H' and leave_type is not 'Attendance Correction', 'During work hours', 'Late checkin'
    return (row.status === 'A' || row.status === 'PL' || row.status === 'H' || row.status === '1/2PL' || row.status === '1/2P') &&
      !['Attendance Correction', 'During work hours', 'Late checkin'].includes(row.leave_type);
  }).map((row, index) => ({
    ...row,
    id: index,
    // id: row.employee_id ?? index
  }));
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("current_month"); //"today"
  const [button, setButton] = useState('current_month')
    const [isApiFinished, setIsApiFinished] = useState(false);
  const [data, setData] = useState({
    "current_month": "current_month",
    "last_three_months": null,
    "last_six_months": null,
    "previous_month": null,
    // "today": null
	  });
	  const storage = getsessionStorage();
	  const isEmployeeRole = String(storage?.role_name || '').toLowerCase() === 'employee';
	  const [pageCount, setPageCount] = useState(0);
	  const [page, setPage] = useState(0)
	  const [pageSize, setPageSize] = useState(20)
	  const handleTimeFilterChange = (event, value) => {
    setSelectedTimeFilter(value);

    const updatedData = {
      "current_month": null,
      "last_three_months": null,
      "last_six_months": null,
      "previous_month": null,
      // "today": null
    };

    if (value) {
      updatedData[value.toLowerCase().replace(/\s/g, '_')] = value;
    }

    setData(updatedData);
  };

  console.log(selectedTimeFilter, "timefilter");
  useEffect(() => {
    dispatch(set_searchLeaveReportAction({ data: [], numRows: 0 }));
    setIsApiFinished(false);
    setLoaderStatusHandler(true);

    let body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      // "today": selectedTimeFilter === "today" ? "today" : null,
      "pageCount": pageCount,
      "numPerPage": pageSize,
      "searchString": searchData.searchVal,
      "employee_id": null
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(filterLeaveHistoryAction(body, setModalTypeHandler, setLoaderStatusHandler))
    ).finally(() =>
        { 
          setIsApiFinished(true)
          setLoaderStatusHandler(false)
        })
  }, [pageCount, pageSize]);

  console.log('buuefwewfe',button)

  const requestSearch = (e) => {
    // const context = props.context;
    let val = e.target.value;
    setSearchData({ ...searchData, searchVal: val });
    setPageCount(0)
    setPageSize(20)
    setIsApiFinished(false);
    setLoaderStatusHandler(true);
    // if(val.trim() !== ''){
    dispatch(set_searchLeaveReportAction({ data: [], numRows: 0 }))
    // }
    const body = {
      // ...data,
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      // "today": selectedTimeFilter === "today" ? "today" : null,
      "searchString": val,
      "pageCount": pageCount,
      "numPerPage": pageSize,
      "employee_id": null
    }
    dispatch(get_searchLeaveReportAction(
      body,
      setModalTypeHandler,
      (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus)
        // when your loader turns false => API done
        console.log(loaderStatus,'loaderStatus')
        if (loaderStatus === false) {
         setIsApiFinished(true)
        }
      },
    )
    )
  };

  const cancelSearch = (e) => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    dispatch(set_searchLeaveReportAction({ data: [], numRows: 0 }))
    setPageCount(0)
    setPageSize(20)
    const body = {
      "current_month": selectedTimeFilter === "current_month" ? "current_month" : null,
      "last_three_months": selectedTimeFilter === "last_three_months" ? "last_three_months" : null,
      "last_six_months": selectedTimeFilter === "last_six_months" ? "last_six_months" : null,
      "previous_month": selectedTimeFilter === "previous_month" ? "previous_month" : null,
      // "today": selectedTimeFilter === "today" ? "today" : null,
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    console.log("ddddd");
    dispatch(get_searchLeaveReportAction(
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
      // "today": selectedTimeFilter === "today" ? "today" : null,
      "searchString": searchData.searchVal,
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    dispatch(filterLeaveHistoryAction(body))
    setFilterOpen(false)
  }

  const handleClearButtonClick = () => {
    setButton('current_month')
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    setSelectedTimeFilter("current_month");
    setFilterOpen(false)

    const body = {
      "current_month": "current_month",
      "last_three_months":  null,
      "last_six_months":  null,
      "previous_month": null,
      // "today": selectedTimeFilter === "today" ? "today" : null,
      "searchString": "",
      "pageCount": 0,
      "numPerPage": 20,
      "employee_id": null
    }
    dispatch(filterLeaveHistoryAction(body))

    setData({
      "current_month": "current_month",
      "last_three_months": null,
      "last_six_months": null,
      "previous_month": null,
      // "today": null
    });

  };

  const handlePageChange = async (page) => {
    setPageCount(page);
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size);
  };

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };
  const getRowFromGridArgs = (...args) => args?.[0]?.row ?? args?.[1] ?? {};
  const getValueFromGridArgs = (...args) =>
    args?.[0] && typeof args[0] === 'object' && Object.prototype.hasOwnProperty.call(args[0], 'value')
      ? args[0].value
      : args?.[0];

  const columns = [
    {
      headerName: 'Name',
      field: 'first_name',
      width: 240,
      cellStyle: commonCellStyle,
      valueGetter: (...args) => {
        const row = getRowFromGridArgs(...args);
        const first = typeof row.first_name === 'string' ? row.first_name : '';
        const last = typeof row.last_name === 'string' ? row.last_name : '';
        const firstName = first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
        const lastName = last ? last.charAt(0).toUpperCase() + last.slice(1) : '';
        const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
        return fullName || '-';
      },
    },
    {
      headerName: 'Leave Type',
      field: 'leave_type',
      width: 200,
      cellStyle: commonCellStyle,
      valueGetter: (...args) => {
        const row = getRowFromGridArgs(...args);
        return row?.leave_type || '-';
      },
    },
    {
      headerName: 'Start Date',
      field: 'fromDate',
      width: 200,
      cellStyle: commonCellStyle,
      valueFormatter: (...args) => {
        const value = getValueFromGridArgs(...args);
        return value ? commonDateFormat(value) : '-';
      },
    },
    {
      headerName: 'End Date',
      field: 'toDate',
      width: 200,
      cellStyle: commonCellStyle,
      valueFormatter: (...args) => {
        const value = getValueFromGridArgs(...args);
        return value ? commonDateFormat(value) : '-';
      },
    },
    {
      headerName: 'Days',
      field: 'days',
      width: 100,
      cellStyle: commonCellStyle,
      valueGetter: (...args) => {
        const row = getRowFromGridArgs(...args);
        return row?.days ?? '-';
      },
    },
    {
      headerName: 'Log Date',
      field: 'log_date',
      width: 200,
      cellStyle: commonCellStyle,
      valueFormatter: (...args) => {
        const value = getValueFromGridArgs(...args);
        return value ? commonDateFormat(value) : '-';
      },
    },
    {
      headerName: 'Approval',
      field: 'approval_status',
      width: 240,
      cellStyle: commonCellStyle,
      valueGetter: (...args) => {
        const row = getRowFromGridArgs(...args);
        return (row?.approval_status === 'Pending' || row?.approval_status === 'Rejected')
          ? 'Not Approved'
          : (row?.approval_status || '-');
      },
    },
  ];


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
    dispatch(filterLeaveHistoryAction(body))
  }
  const exportToExcel = useCallback((columns, data) => {
    console.log(data, 'data');
    const columnNames = {
      first_name: 'Name',
      leave_type: 'Leave Type',
      fromDate: 'Start Date',
      toDate: 'End Date',
      days: 'Days',
      log_date: 'Log Date',
      approval_status: 'Approval',

    };
    const selectedColumns = [
      'first_name',
      'leave_type',
      'fromDate',
      'toDate',
      'days',     
      'log_date',
      'approval_status',

    ];
    const headers = selectedColumns.map(col => columnNames[col] || col);
     const sheetData = [
    headers,
    ...data.map(row =>
      selectedColumns.map(col => {

        if (
          (col === 'log_date' || col === 'fromDate' || col === 'toDate') &&
          row[col]
        ) {
          return moment(row[col]).format('DD/MM/YYYY');
        }

        return row[col] || '';
      })
    )
  ];


    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Leave Report.xlsx');
  }, []);
    const navigate = useNavigate()
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__attendance__leave_report', 'can_export')
    
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Leave Reports </title>
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
              getOptionLabel={(option) => timeFilterDisplayNames[option] || option}
              renderInput={(params) => <TextField {...params} label="Leave Report" />}
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
          <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
            Leave Report
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Period Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
              {[
                { label: 'Last 6 Months', val: 'last_six_months' },
                { label: 'Last 3 Months', val: 'last_three_months' },
                { label: 'Previous Month', val: 'previous_month' },
                { label: 'Current Month', val: 'current_month' },
              ].map((m) => (
                <Chip
                  key={m.val}
                  label={m.label}
                  size='small'
                  clickable
                  onClick={() => handlePreviousMonthClick(m.val)}
                  sx={{
                    fontWeight: button === m.val ? 600 : 400,
                    fontSize: '0.75rem',
                    height: 26,
                    bgcolor: button === m.val ? 'primary.main' : 'transparent',
                    color: button === m.val ? '#fff' : 'text.secondary',
                    '&:hover': {
                      bgcolor: button === m.val ? 'primary.dark' : '#e0e0e0',
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
            {!isEmployeeRole && (
              <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={() => setFilterOpen(true)}>
                  <FilterAlt sx={{ color: '#757575', fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {reportExport && (
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton
                  size='small'
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
                      await apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                        dispatch(filterLeaveHistoryAction(body, setModalTypeHandler, setLoaderStatusHandler, (res) => {
                          exportToExcel(Object.keys(res[0] || {}), res);
                        }))
                      );
                    } catch (error) {
                      console.error('Error exporting data:', error);
                    }
                  }}
                >
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
              rows={filteredLeaveHistoryData}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={leaveHistoryCount || 0}
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
};

export default LeaveReport;
