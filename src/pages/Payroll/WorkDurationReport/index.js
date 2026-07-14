import React, {useEffect} from 'react';
import DataGridTemp from 'components/dataGridTemp';
import {
  getWorkDurationReportAction,
  getWorkDurationTotalHoursReportAction,
} from 'redux/actions/attendance_actions';
import {useDispatch, useSelector} from 'react-redux';
import {useState} from 'react';
import FilterPossale from 'pages/pointofsale/posSale/FilterPossale';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import {Helmet} from 'react-helmet-async';
import {titleURL} from 'http-common';
import {
  Box,
  Card,
  Fade,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const WorkDurationReport = () => {
  const [companyBasedEmpData, setCompanyBasedEmpData] = useState();
  const [companyBasedEmpDetailsData, setCompanyBasedEmpDetailsData] =
    useState();
  const date = new Date();
  const [filterDate, setFilterDate] = useState({
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: new Date(),
  });
  const [errMsg, setErrMsg] = useState({
    from: '',
    to: '',
  });
  const [count, setCount] = useState(0);
  const [filterOpen, handleFilter] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const {
    attendanceReducer: {workDurationReport, workDurationTotalHoursReport},
  } = useSelector((state) => state);

  const dispatch = useDispatch();

  useEffect(() => {
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      searchString: '',
    };

    dispatch(
      getWorkDurationTotalHoursReportAction(payLoad, (response, resData) => {
        if (response === 200) {
          setCompanyBasedEmpData(resData);
          dispatch(
            getWorkDurationReportAction(payLoad, (response, resData) => {
              if (response === 200) {
                setCompanyBasedEmpDetailsData(resData);
              }
            }),
          );
        }
      }),
    );
  }, []);

  const columns = [
    {field: 'employee_code', headerName: 'Emp.Code', width: 100},
    {field: 'full_name', headerName: 'Name', width: 120},
    {field: 'totalWorkHours', headerName: 'Duration', width: 100},
    {field: 'present', headerName: 'P', width: 50},
    {field: 'absent', headerName: 'A', width: 50},
    {field: 'status', headerName: 'Status', width: 80},
    {field: 'in_time', headerName: 'InTime', width: 80},
    {field: 'out_time', headerName: 'OutTime', width: 80},
    {field: 'late_in_by', headerName: 'Late By', width: 80},
    {field: 'early_out_by', headerName: 'Early By', width: 80},
    {field: 'ot', headerName: 'OT', width: 50},
    {field: 'shift', headerName: 'Shift', width: 50},
  ];

  const dataMap = new Map();

  if (companyBasedEmpData) {
    companyBasedEmpData.forEach((employee) => {
      dataMap.set(employee.employee_id, {
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        totalWorkHours: employee.totalWorkHours,
        present: employee.present,
        absent: employee.absent,
        status: employee.status,
        in_time: employee.in_time,
        out_time: employee.out_time,
        late_in_by: employee.late_in_by,
        early_out_by: employee.early_out_by,
        ot: employee.ot,
        shift: employee.shift_name,
      });
    });
  }

  // Populate the map with log data
  if (companyBasedEmpDetailsData) {
    companyBasedEmpDetailsData.forEach((log) => {
      const employeeData = dataMap.get(log.employee_id);
      if (employeeData) {
        employeeData[log.log_date] = log.work_hours;
      }
    });
  }

  const rowData = Array.from(dataMap.values());

  if (companyBasedEmpDetailsData) {
    companyBasedEmpDetailsData.forEach((log) => {
      const logDate = log.log_date;

      const dateObj = new Date(logDate);
      const date = dateObj.getDate();
      const days = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
      const dayIndex = dateObj.getDay();
      const day = days[dayIndex];
      const dateDay = date + ' ' + day;

      const column = {field: logDate, headerName: dateDay, width: 60};
      if (!columns.some((col) => col.field === logDate)) {
        columns.push(column);
      }
    });
  }

  columns.sort((a, b) => new Date(a.field) - new Date(b.field));

  const finalColumns = columns.map((column) => ({
    field: column.field,
    headerName: column.headerName,
    width: column.width,
  }));

  const finalRows = rowData.map((row, index) => ({
    id: index,
    ...row,
  }));

  const handleChange = (data) => {
    var date_val = data.target.value._d;
    setFilterDate({...filterDate, [data.target.name]: date_val});
    if (moment(filterDate.from, 'year') <= moment(filterDate.to, 'year')) {
      if (moment(filterDate.from, 'month') <= moment(filterDate.to, 'month')) {
        if (moment(filterDate.from, 'day') <= moment(filterDate.to, 'day')) {
          setErrMsg({...errMsg, from: '', to: ''});
        } else {
          setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 1'});
        }
      } else {
        setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 2'});
      }
    } else {
      setErrMsg({...errMsg, [data.target.name]: 'Invalid Date 3'});
    }
  };

  const ApplyButton = async () => {
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format(
        'YYYY-MM-DD',
      ),
      searchString: '',
    };

    dispatch(
      getWorkDurationTotalHoursReportAction(payLoad, (response, resData) => {
        if (response === 200) {
          setCompanyBasedEmpData(resData);
          dispatch(
            getWorkDurationReportAction(payLoad, (response, resData) => {
              if (response === 200) {
                setCompanyBasedEmpDetailsData(resData);
              }
            }),
          );
        }
      }),
    );

    handleFilter(false);
    setSearchVal('');
  };

  const clearButton = () => {
    setSearchVal('')
    handleFilter(false);
    const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
    let firstDay = defaultFrom;
    let lastDay = defaultTo;
   
    setFilterDate({
      ...filterDate,
      from: firstDay,
      to: lastDay,
    })

  };

  function ExportCsv2(columnData, rowData, fileName) {
    const columnHeaders = [
      'Days',
      ...columnData
        .filter(
          (column) =>
            ![
              'employee_id',
              'first_name',
              'last_name',
              'totalWorkHours',
              'status',
              'in_time',
              'out_time',
              'late_in_by',
              'early_out_by',
              'ot',
              'shift',
              'present',
              'absent',
            ].includes(column.field),
        )
        .map((column) => column.headerName),
    ]; // Extract column headers

    // Construct CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += columnHeaders.join(',') + '\n'; // Add column headers

    // Add data for each employee
    for (const employee of rowData) {
      csvContent += `Employee: ${employee.employee_id} : ${
        employee.first_name
      }${
        employee.last_name ? ' ' + employee.last_name : ''
      }   "Total Duration: ${employee.totalWorkHours || 'null'} Total OT: ${
        employee.ot || '-'
      } Present: ${employee.present || 0} Absent: ${
        employee.absent || 0
      } WeeklyOff: ${employee.weeklyOff || '-'} Holidays: ${
        employee.holidays || '-'
      } Leaves Taken: ${employee.leaves}"\n`;

      csvContent += `Status ${employee.status || '-'}\n InTime ${
        employee.in_time || '-'
      }\n  OutTime ${employee.out_time || '-'}\n Duration ${
        employee.work_hours || '-'
      }\n  Late By ${employee.late_in_by || '-'}\n  Early By ${
        employee.early_out_by || 0
      }\n OT ${employee.ot || '-'}\n Shift ${employee.shift || '-'}\n`;

      // Add data for each employee
      const employeeRow = [
        'status',
        'in_time',
        'out_time',
        'late_in_by',
        'early_out_by',
        'ot',
        'shift',
      ].map((field) => employee[field] || '');
      csvContent += employeeRow.join(',') + '\n';
    }
    // Create a temporary anchor element and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName + '.csv');
    document.body.appendChild(link);
    link.click();
  }

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Brand Report </title>
      </Helmet>
      <Card sx={{p: '20px', width: '100%', height: '100%'}}>
        <Grid
          container
          display='flex'
          flexDirection='row'
          pb='15px'
          alignItems='center'
        >
          <Grid
            size={{
              lg: 8,
              md: 8,
              sm: 8,
              xs: 12
            }}>
            <Typography variant='h6' align='left' p='0px 0px 15px 0px'>
              {'Work Duration Reports'}
            </Typography>
          </Grid>

          <Grid
            display='flex'
            justifyContent='flex-end'
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Stack direction='row' display='flex' alignItems='center' gap={1}>
              <Tooltip
                title='Export'
                TransitionComponent={Fade}
                TransitionProps={{timeout: 600}}
                placement='top'
              >
                <IconButton
                  onClick={() =>
                    ExportCsv2(finalColumns, finalRows, 'Work Duration Reports')
                  }
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title='Filter'
                TransitionComponent={Fade}
                TransitionProps={{timeout: 600}}
                placement='top'
              >
                <IconButton>
                  <CommonFilter
                    fromTo={true}
                    from={filterDate.from}
                    to={filterDate.to}
                    count={count}
                    handleChange={handleChange}
                    handleClose={handleFilter}
                    open={filterOpen}
                    clearButton={clearButton}
                    ApplyButton={ApplyButton}
                    companySearch={false}
                    shouldFetchData={true}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        <Box
          style={{cursor: 'pointer'}}
          p='20px'
          sx={{
            backgroundColor: '#F4F7FE',
            width: '100%',
            height: '92%',
            // border: '2px solid black'
          }}
        >
          <DataGrid
            
            rows={finalRows}
            columns={finalColumns}
            hideScrollbar={true}
            
            pageSizeOptions={[20, 50, 100]}
            density='compact'
            disableRowSelectionOnClick
            disableExtendRowFullWidth='true'
            sx={{
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {width: 10},
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                backgroundColor: '#B2B2B2',
                borderRadius: 2,
                border: '2px solid white',
              },
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
          />
        </Box>
      </Card>
    </>
  );
};

export default WorkDurationReport;
