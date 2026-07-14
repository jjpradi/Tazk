import React, {useEffect, useState, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Dialog,
  DialogContent,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import context from '../../../context/CreateNewButtonContext';
import {Helmet} from 'react-helmet-async';
import {pageSize} from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import {
  paySlipReportPaginationAction,
  paySlipReportTempAction,
  searchPaySlipReportAction,
  searchPaySlipReportState,
  updateProcessSalaryAction,
} from 'redux/actions/salary_actions';
import apiCalls from 'utils/apiCalls';
import {getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee} from 'redux/actions/attendance_actions';
import CancelIcon from '@mui/icons-material/Cancel';
import CommonToolTip from 'components/ToolTip';
import { titleURL } from 'http-common';
import { getCompanyLogo } from 'redux/actions/company_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { FilterAlt } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useCustomFetch } from 'utils/useCustomFetch';
import { setInvoiceTempAction } from 'redux/actions/vendor_actions';
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp';
import { formatName } from 'utils/nameFormatter';

export default function PaySlipReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const date = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [paySlipData, setPaySlipData] = useState({});
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [isSelectUserEmpty, setIsSelectUserEmpty] = useState(false)
  const [userSelectError, setUserSelectError] = useState('');
  const [filterOpen,setFilterOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [button, setButton] = useState('4');
  const [ytdButton, setytdButton] = useState('1');
  const [data, setData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
  });
console.log("year",year)
    const customFetch = useCustomFetch();
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  // const [option,setOption] = useState(false)
  const [selectedAll, setSelectedAll] = useState(false);

  const {
    SalaryReducers: {paySlipReportData, paySlipReportCount,paySlipReportTemp},
    attendanceReducer: { get_empbasecompany ,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
     CompanyReducers: { company_logo }, UserCreationReducer: {departmentList},
     vendorReducer : { po_temp }
  } = useSelector((state) => state);

  console.log("po_temppo_temp",po_temp)
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);


  const [value, setValue] = React.useState([]);
  const handleChangeEmployeeName =(val)=>{
    setValue(val)
    if(val?.length > 0){
      setUserSelectError('');
     
    }

}



// console.log('Previous Month Number:', previousMonthNumber + 1);



  useEffect(() => {
    let previousMonthNumber = date.getMonth() - 1;
    if (previousMonthNumber === -1) { 
        previousMonthNumber = 11
    }
    
    const getPreviousYear = date => {
      const clone = new Date(date.getTime())
      clone.setMonth(date.getMonth() - 1)
      const year = clone.getFullYear()
      
      return year
    }
    const lastMonthYear = getPreviousYear(date)
    setYear(lastMonthYear)
    setMonth(previousMonthNumber + 1)

    const body = storage?.role_name === "Employee" ? { 
      fromMonth: "1",
      toMonth: "12",
      fromYear: year,
      toYear: year,
      pageCount: data.page,
      numPerPage: data.pageSize,
      searchString: data.searchVal
     } : {
      month_id: previousMonthNumber + 1,
      year: lastMonthYear,
      selectedEmployees:
        selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
      pageCount: data.page,
      numPerPage: data.pageSize,
      searchString: data.searchVal,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    }

    let data1 = {
   
      searchString:''
     }
   
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(paySlipReportPaginationAction(body, commoncookie)),
      
      dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
        console.log("resss",res)
        dispatch({
          type: GET_EMP_BASECOMPANY_FILTER,
          payload: res,
        });
      })),
      dispatch(getCompanyLogo()),
    ).finally(() => setIsApiFinished(true));
  }, []);

  const handlePageSizeChange = async (size) => {
    const body = {
      month_id: month,
      year: year,
      selectedEmployees:
        selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
      pageCount: data.page,
      numPerPage: size,
      searchString: data.searchVal,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(paySlipReportPaginationAction(body, commoncookie)),
    );
    setData({...data,pageSize: size})
  };

  const handlePageChange = (page) => {
    const body = {
      month_id: month,
      year: year,
      selectedEmployees:
        selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
      pageCount: page,
      numPerPage: pageSize,
      searchString: data.searchVal,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(paySlipReportPaginationAction(body, commoncookie)),
    );
    setData({...data,page: page})
  };

  const handleChange = (e) => {
    setMonth(e.target.value);
    setIsApiFinished(false);
  };

  const requestSearch = async (e) => {
    let val = e.target.value;
    setData({...data, searchVal: val});
    await setIsApiFinished(false);
    setLoaderStatusHandler(true);

    dispatch(searchPaySlipReportState({data: [], numRows: 0}));
    const body = {
      month_id: month,
      year: year,
      selectedEmployees:
        selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: val,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
      dispatch(
        searchPaySlipReportAction(
          body,
          setModalTypeHandler,
          (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
        ),
      )
    
  };

  const cancelSearch = () => {
    setData({...data, page: 0, searchVal: ''});
    dispatch(searchPaySlipReportState({data: [], numRows: 0}));
    const body = {
      month_id: month,
      year: year,
      selectedEmployees:
        selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(paySlipReportPaginationAction(body, commoncookie)),
    );
  };

  const handleEdit = (newData) => {
    let id = newData.id;
    newData.month_id = month;

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateProcessSalaryAction(newData, id)),
    );
  };

const submitAction = () => {
  if (storage?.role_name === 'Employee') {
    // Employees don't select names, just process with current month/year
    processFunction([]);
  } else if (selectedAll) {
    dispatch(getEmpbasecompanyAction({}, (res) => {
      if (res) processFunction(res);
    }));
  } else {
    processFunction(value);
  }
};
  


const processFunction = (selectedValue) => {
  const isEmployee = storage?.role_name === 'Employee';

  if (!isEmployee && (!selectedValue || selectedValue.length === 0)) {
    setUserSelectError('Employee is required');
    setIsSelectUserEmpty(true);
    return;
  }

  const employeeIds = isEmployee ? null : selectedValue.map((d) => d.employee_id);
  setSelectedNames(employeeIds ? [employeeIds] : ['']);

  const body = {
    month_id: month,
    year: year,
    selectedEmployees: employeeIds,
    pageCount: 0,
    numPerPage: data.pageSize,
    searchString: '',
    employeeId: commoncookie,
    headerLocationId: headerLocationId,
  };

  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(paySlipReportPaginationAction(body)),
  ).finally(() => {
    setIsApiFinished(true);
    setFilterOpen(false);
  });
};

  const handleFilterClear = () => {
    let previousMonthNumber = date.getMonth() - 1;
    if (previousMonthNumber === -1) { 
        previousMonthNumber = 11
    }
    
    const getPreviousYear = date => {
      const clone = new Date(date.getTime())
      clone.setMonth(date.getMonth() - 1)
      const year = clone.getFullYear()
      
      return year
    }
    const lastMonthYear = getPreviousYear(date)
    setYear(lastMonthYear)
    setMonth(previousMonthNumber + 1)
    setButton('4');
    setData({...data, page: 0, searchVal: ''});
    setFilterOpen(false)
    setSelectedNames([''])
    setMonth(previousMonthNumber + 1)
    setYear(lastMonthYear)
    setValue([])
    setSelectedDepartment([])
    const body = {
      month_id: previousMonthNumber + 1,
      year: year,
      selectedEmployees: '',
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(paySlipReportPaginationAction(body)),
    ).finally(() => setIsApiFinished(true));
  }

  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);
  
    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));
  
    if (!val) {
      return
    }
  
    let data = {
      
      searchString: val
    }
  
  
  
    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );
  
  };

  const handleOpen = async (rowData) => {
    console.log(rowData, "rowData")

    const id = rowData.employee_id
    const datas = {
      month_id: rowData.month,
      year: rowData.year,
      pageCount: data.page,
      numPerPage: data.pageSize,
      searchString: data.searchVal,
      employeeId: id,
      headerLocationId: headerLocationId,
      ytd:ytdButton
    }
    console.log(datas, "datafffffddd")
    // const {response} =await customFetch(`/salary/paySlipReportTemp/${id}`,`POST`,datas)
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(paySlipReportTempAction(datas, id, (response) => {
        if (response) {
          dispatch(setInvoiceTempAction(response))
        }
      }))
    )
    const updatedData = Object.fromEntries(
      Object.entries(rowData).map(([key, value]) => [
        key,
        value,
      ]),
    );
    setOpen(true);
    setPaySlipData(updatedData);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const monthNames = [
    {id: 1, name: 'January'},
    {id: 2, name: 'February'},
    {id: 3, name: 'March'},
    {id: 4, name: 'April'},
    {id: 5, name: 'May'},
    {id: 6, name: 'June'},
    {id: 7, name: 'July'},
    {id: 8, name: 'August'},
    {id: 9, name: 'September'},
    {id: 10, name: 'October'},
    {id: 11, name: 'November'},
    {id: 12, name: 'December'},
  ];

  const getCurrentMonth = date.getMonth(); // current month - 1

  const getCurrentYear = date.getFullYear(); // current year
  const filteredMonths = monthNames.filter(
    (month) => month.id <= getCurrentMonth,
  );

  function generateArrayOfYears() {
    var max = new Date().getFullYear();
    var min = max - 9;
    var years = [];

    for (var i = max; i >= min; i--) {
      years.push(i);
    }
    return years;
  }

  const handleFilterClose = () =>{
    setFilterOpen(false)
  }
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const previousMonths = [];
    for (let i = 1; i <= 4; i++) {
        const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
        let prevMonthYear = currentYear;
        if (prevMonthIndex > currentMonthIndex) {
            prevMonthYear--;
        }
        const prevMonthString = `${months[prevMonthIndex]} ${prevMonthYear}`;
        previousMonths.push(prevMonthString);
    }
  const PrevMonth = previousMonths[0];
  const firstPrevMonth = previousMonths[1];
  const secondPrevMonth = previousMonths[2];
  const thirdPrevMonth = previousMonths[3];

    const getStartAndEndDate = (monthName, year) => {

        const monthMap = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        
        const monthNumber = monthMap[monthName.toLowerCase()];
        const startDate = new Date(year, monthNumber, 1);
       
        const endDate = new Date(year, monthNumber + 1, 0);
        const count = monthNumber + 1
        console.log(count,'monthcount');
        return { startDate, endDate, count };
      }

  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  const [filterDate, setFilterDate] = useState({
    from: defaultFrom,
    to: defaultTo
    });

      const handlePreviousMonthClick = (datas) => {
        setData({...data, page: 0, searchVal: ''});
        const month = datas.split(' ')[0];
        const year = datas.split(' ')[1];
        const  {startDate,endDate,count}=getStartAndEndDate(month,year)
        // console.log(startDate,count,'startdateee');
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const date = new Date(filterDate.month_year);
        setMonth(count);
        setYear(year)
        setFilterDate({...filterDate,from: startDate,
          to: endDate})

        dispatch(getEmpbasecompanyAction({} ,(res)=>{
          const body = {
            month_id: count,
            year: year,
            selectedEmployees:
            value.map((d)=> d.employee_id),
            pageCount: 0,
            numPerPage: data.pageSize,
            searchString: '',
            employeeId: commoncookie,
            headerLocationId: headerLocationId,
          };
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(paySlipReportPaginationAction(body)),
          ).finally(() => setIsApiFinished(true));
        }))
      }

      const commonCellStyle = {
        fontFamily: "poppins",
        fontSize: "11px",
        fontWeight: "400",
        color: 'rgba(0, 0, 0, 0.7)',
      };

      const reviveLayout = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(reviveLayout)
        }

        if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => {
                        return [key, reviveLayout(value)]
                })
            );
        }

    if (typeof obj === 'string' && /^\s*\(.*\)\s*=>/.test(obj)) {
      try {
        return eval(obj);
      } catch (e) {
        console.warn("Function eval failed:", obj);
        return obj;
      }
    }

    return obj
  }

  const handleDownloadReceipt = () => {
    try {
      const base64Data = po_temp?.pdfBase64;

      if (!base64Data) {
        console.error("No PDF data found in po_temp");
        return;
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([ byteArray ], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `PaySlip_${paySlipReportData?.first_name || "Download"}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("PDF Download Error:", err);
    }
  };

  console.log(isApiFinished,'isApiFinishedcasd')


  const dataGridColumns = [
    {
      field: 'first_name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => formatName(params.row.first_name ? (params.row.first_name + (params.row.last_name && params.row.last_name.length > 0 ? ' ' + params.row.last_name : '')) : '-'),
    },
    {
      field: 'take_home',
      headerName: 'Take Home',
      width: 150,
      renderCell: (params) => {
        const { total_deductions, total_earnings, claim } = params.row;
        return (total_earnings - total_deductions) + claim;
      },
    },
    {
      field: 'deduction',
      headerName: 'Deduction',
      width: 150,
      renderCell: (params) => params.row.total_deductions,
    },
    {
      field: 'tds_permonth',
      headerName: 'Tds',
      width: 120,
    },
    {
      field: 'no_of_leaves',
      headerName: 'No of Leaves',
      width: 140,
    },
    {
      field: 'month',
      headerName: 'Month',
      width: 120,
      renderCell: (params) => {
        const obj = monthNames.find((m) => m.id === parseInt(params.row.month));
        return obj ? obj.name.slice(0, 3) : '-';
      },
    },
    {
      field: 'payment_mode',
      headerName: 'Mode Of Payment',
      width: 170,
    },
    {
      field: 'payslip_action',
      headerName: 'Pay Slip',
      width: 120,
      renderCell: (params) => (
        <CommonToolTip title='View Payslip'>
          <IconButton onClick={() => handleOpen(params.row)}>
            <VisibilityIcon />
          </IconButton>
        </CommonToolTip>
      ),
    },
  ];

  const dataWithId = paySlipReportData?.length
    ? paySlipReportData.map((row, index) => ({ ...row, id: index }))
    : [];

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Payslip Report  </title>
      </Helmet>

      {/* Filter Dialog */}
      <Dialog
        open={filterOpen}
        onClose={handleFilterClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogContent>
          <Grid
            container
            display='flex'
            flexDirection='row'
            alignItems='center'
            spacing={2}
          >
            <Grid
              display={'flex'}
              justifyContent={'flex-end'}
              sx={{mt:'5px',ml:'5px'}}
              size={{ lg: 12, md: 12, sm: 12, xs: 12 }}
            >
              <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
                <IconButton aria-label="close" onClick={() => handleFilterClose()}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            {storage?.role_name !== 'Employee' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth error={isSelectUserEmpty}>
                  <CommonUserAutoComplete
                    fullWidth
                    searchVal={searchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}
                    error={userSelectError}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    isMandatory={true}
                  />
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Select Month</InputLabel>
                <Select
                  autoFocus
                  value={month === 0 ? getCurrentMonth : month}
                  label='Select Month'
                  onChange={handleChange}
                  sx={{height: '42px'}}
                >
                  {(year === getCurrentYear ? filteredMonths : monthNames).map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <FormControl variant='outlined' fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year === 0 ? setYear(getCurrentYear) : year}
                  onChange={(e) => setYear(e.target.value)}
                  sx={{height: '42px'}}
                  label='Year'
                  required
                >
                  {generateArrayOfYears().map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {storage?.role_name !== 'Employee' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-multiple-name-label'>
                    Select Department <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Select
                    sx={{minHeight: '65px'}}
                    name='department'
                    required={true}
                    multiple
                    value={selectedDepartment}
                    onChange={(e) => {
                      const {value} = e.target;
                      setSelectedDepartment(value.includes('') ? [''] : value);
                      handleChange(e);
                    }}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                    }}
                    renderValue={(selected) => (
                      <Stack gap={1} direction='row' flexWrap='wrap'>
                        {selected.includes('') ? (
                          <Chip
                            key=''
                            label='All Department'
                            onDelete={() => {
                              setSelectedDepartment([]);
                              handleChange({ target: {name: 'department', value: []} });
                            }}
                            deleteIcon={
                              <CommonToolTip title='Cancel'>
                                <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                              </CommonToolTip>
                            }
                          />
                        ) : (
                          selected.map((value) => {
                            const locate = departmentList.find((emp) => emp.department === value);
                            return (
                              <Chip
                                key={value}
                                label={locate ? locate.department : ''}
                                onDelete={() => {
                                  setSelectedDepartment(selectedDepartment.filter((item) => item !== value));
                                  handleChange({
                                    target: { name: 'department', value: selectedDepartment.filter((item) => item !== value) },
                                  });
                                }}
                                deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                              />
                            );
                          })
                        )}
                      </Stack>
                    )}
                  >
                    <MenuItem value=''>All Department</MenuItem>
                    {departmentList.map((m) => (
                      <MenuItem key={m.department} value={m.department} disabled={selectedDepartment.includes('')}>
                        {m.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid display={'flex'} justifyContent={'center'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <Button color="secondary" variant="contained" style={{ marginRight: '20px' }} onClick={handleFilterClear}>
                Clear
              </Button>
              <Button color="primary" variant="contained" style={{ marginRight: '20px' }} onClick={submitAction}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

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
            Pay Slip Report
          </Typography>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Calendar / Financial year toggle */}
            <ButtonGroup
              variant="outlined"
              color="primary"
              size="small"
              sx={{
                height: '30px',
                '& .MuiButton-root': { padding: '4px 8px', fontSize: '11px' },
              }}
            >
              <Button
                variant={ytdButton === '1' ? 'contained' : 'outlined'}
                onClick={() => setytdButton('1')}
              >
                Calendar year
              </Button>
              <Button
                variant={ytdButton === '2' ? 'contained' : 'outlined'}
                onClick={() => setytdButton('2')}
              >
                Financial year
              </Button>
            </ButtonGroup>

            {/* Month buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
              {[
                { label: thirdPrevMonth, key: '1' },
                { label: secondPrevMonth, key: '2' },
                { label: firstPrevMonth, key: '3' },
                { label: PrevMonth, key: '4' },
              ].map((m) => (
                <Chip
                  key={m.key}
                  label={m.label}
                  size='small'
                  clickable
                  onClick={() => {
                    handlePreviousMonthClick(m.label);
                    setButton(m.key);
                  }}
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

            {storage?.role_name !== 'Employee' && (
              <CommonSearch
                searchVal={data.searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
            )}

            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
              <IconButton size='small' onClick={() => setFilterOpen(true)}>
                <FilterAlt sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

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
              columns={dataGridColumns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={paySlipReportCount || 0}
              paginationModel={{ page: data.page, pageSize: data.pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== data.page) handlePageChange(model.page);
                if (model.pageSize !== data.pageSize) handlePageSizeChange(model.pageSize);
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

      {open && (
        <ReceiptTempDialog
          open={open}
          handleClose={handleClose}
          type="Payslip"
          onclick={handleDownloadReceipt}
        />
      )}
    </>
  );
}

