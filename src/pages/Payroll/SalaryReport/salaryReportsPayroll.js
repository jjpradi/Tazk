import { DataGrid } from '@mui/x-data-grid'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { getSearchSalaryReport, listSalaryReportAction, setSearchSalaryReport } from 'redux/actions/salary_actions';
import context from '../../../context/CreateNewButtonContext';
import * as XLSX from 'xlsx-js-style';
import { useCustomFetch } from 'utils/useCustomFetch';
import {saveAs} from 'file-saver';
import { Box, Button, Card, Chip, Dialog, DialogContent, Fade, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import CommonSearch from 'utils/commonSearch';
import { FilterAlt } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { getCompanyLogo } from 'redux/actions/company_actions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import moment from 'moment';
import { formatName } from 'utils/nameFormatter';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { useNavigate } from 'react-router-dom';

const SalaryReportsPayroll = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const customFetch = useCustomFetch()
const {
  SalaryReducers: { salaryReport,salaryReportCount },
  attendanceReducer: { get_empbasecompany ,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
     CompanyReducers: { company_logo }, UserCreationReducer: {departmentList},  rbacReducer: {menuAccess = []}
} = useSelector((state) => state);

const {
  commoncookie,
  setModalTypeHandler,
  setLoaderStatusHandler,
  headerLocationId,
} = useContext(context);

console.log("getCompanyBasedEmployeeFilter",getCompanyBasedEmployeeFilter);
const date = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(date.getMonth());
  const [year, setYear] = useState(0);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [isSelectUserEmpty, setIsSelectUserEmpty] = useState(false)
  const [userSelectError, setUserSelectError] = useState('');
  const [filterOpen,setFilterOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [button, setButton] = useState('4');
  const [data, setData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
  });

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  // const [option,setOption] = useState(false)

  const [selectedAll, setSelectedAll] = useState(false);
  const [value, setValue] = React.useState([]);
  const handleChangeEmployeeName =(val)=>{
    setValue(val)
    if(val?.length > 0){
      setUserSelectError('');
     
    }

}
let previousMonthNumber = date.getMonth() - 1;
if (previousMonthNumber === -1) { 
    previousMonthNumber = 11
}
console.log("va;urf",value);

useEffect(()=>{

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

  const body = {
    salary_month: previousMonthNumber + 1,
    salary_year: lastMonthYear,
    pageCount: data.page,
    numPerPage: data.pageSize,
    searchString:data.searchVal,
    selectedEmployees: selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    headerLocationId: null,
};
let data1 = {
   
  searchString:''
 }
apiCalls(
  setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    })),
    dispatch(getCompanyLogo()),
  ).finally(() => setIsApiFinished(true));
},[])

console.log("ddsfgg",salaryReport);

const monthNames = [
  { id: 1, name: 'January' },
  { id: 2, name: 'February' },
  { id: 3, name: 'March' },
  { id: 4, name: 'April' },
  { id: 5, name: 'May' },
  { id: 6, name: 'June' },
  { id: 7, name: 'July' },
  { id: 8, name: 'August' },
  { id: 9, name: 'September' },
  { id: 10, name: 'October' },
  { id: 11, name: 'November' },
  { id: 12, name: 'December' },
];

const prepareData = (data) => {
  try{

      const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
      ];
      const curMonth = monthNames[data[0]?.salary_month - 1];
      // Extracting unique allowance and deduction names from data remove deplicates------------------------
      const fixedAllowanceNames = [...new Set(data?.flatMap(v => v.fixed_allowance.filter(i => +i.allowance_amount > 0).map(allowance => `Actual ${allowance.allowance_name}`)))];
      fixedAllowanceNames.push('Actual Gross')
      
      const allowanceNames = [...new Set(data?.flatMap(v => v.allowance_json.map(allowance => allowance.allowance_name)))];
      const deductionNames = [...new Set(data?.flatMap(v => v.deduction_json.map(deduction => deduction.deduction_name)))];
          
      // Construct the header row for columns---------------
      const secondRow = [
          "S. No.",
          "Emp. Code",
          "Employee",
          "Joining date",
          "Mode Of Payment",
          'Pay Days',
          ...fixedAllowanceNames,
          ...allowanceNames,
          'Earned Gross',
          ...deductionNames,
          "Claim",
          "Tds",
          "Net Pay",
      ];
  
      const updatedData = data.map((row, index) => {
          // Combine fixed allowances, allowances, and deductions into the row data-----------
          const fixedAllowances = row.fixed_allowance.reduce((acc, curr) => {
              acc[`Actual ${curr.allowance_name}`] = +curr.allowance_amount === 0 ? "" : +curr.allowance_amount;    
              return acc;
          }, {});
  
          fixedAllowances['Actual Gross'] = row.fixed_allowance.reduce((acc, curr) => {
              acc += curr.allowance_amount;
              return acc;
          }, 0);
  
          const allowances = row.allowance_json.reduce((acc, curr) => {
              acc[curr.allowance_name] = +curr.allowance_amount === 0 ? "" : +curr.allowance_amount;
              return acc; 
          }, {});
  
          const deductions = row.deduction_json.reduce((acc, curr) => {
              acc[curr.deduction_name] = +curr.deduction_amount === 0 ? "" : +curr.deduction_amount;
              return acc;
          }, {});
  
          console.log(row,'row');
          
          
          const combinedRow = { ...row, ...fixedAllowances, ...allowances, ...deductions };
          // other details
          console.log(combinedRow,'combinedRow');
          combinedRow['Pay Days'] = row.net_payable_days;
          combinedRow['Net Pay'] = (row.total_earnings - row.total_deductions) + row.claim;
          combinedRow['Earned Gross'] = row.total_earnings;
          combinedRow['S. No.'] = ++index;
          combinedRow['Emp. Code'] = row.employee_code;
          combinedRow['Claim'] = row.claim;
          combinedRow['Mode Of Payment'] = row.payment_mode;
          combinedRow['Tds'] = row.tds_permonth;
          const firstName = row.first_name?.charAt(0).toUpperCase() + row.first_name?.slice(1) || '';
          const lastName = row.last_name ? row.last_name.charAt(0).toUpperCase() + row.last_name.slice(1) : '';
  
          combinedRow['Employee'] = formatName(firstName + (row.last_name ? ' ' + lastName : ''));
          combinedRow['Joining date'] = row.dateOfJoining
  
          return combinedRow;
      });
  
  
      return {
          secondRow,
          updatedData,
          fixedAllowanceNames,
          allowanceNames,
          deductionNames,
          curMonth,
      }
  }catch(e){
      console.log("dsds", e);
  }
  
}

console.log("hrrds",salaryReport);

const {columns, tableData} = useMemo(() => {

  
  const { 
      secondRow, 
      updatedData, 
  } = prepareData(salaryReport);

 
  const columns = secondRow.map((i) => {
    return {
      title: i,
      field: i
    };
  });
  columns.push(
    {
      title: 'Month',
      field: 'month',
      render: (rowData) => {
        const obj = monthNames.find((m) => m.id === parseInt(rowData.month));
        const monthName = obj ? obj.name.slice(0, 3) : null;
        return monthName;
      },
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => {
        let color = ''; 
        switch (rowData.status) {
          case 'pending':
            color = 'orange';
            break;
          case 'Confirmed':
            color = 'green';
            break;
        }
        return <span style={{color}}>{rowData.status}</span>;
      },
    },
  );


  

  const tableData = updatedData;
  return{
      columns,
      tableData,
  }
},[salaryReport])

console.log("fdfdfd column", columns,tableData);

const exportToExcel = useCallback((data) => {
  try{
      
      if(data.length === 0){
          return alert('No data available.')
      }

      const { 
          secondRow, 
          updatedData, 
          fixedAllowanceNames,
          allowanceNames,
          deductionNames,
          curMonth,
      } = prepareData(data)

    
  
      // Define bold style and alignment for headers------------
      const boldStyle = { font: { bold: true }, alignment: { horizontal: 'left', vertical: 'left', wrapText: true } };
      const FboldStyle = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
  
      // Create the header row with bold styling and line breaks---------------
      const headerRow = secondRow.map(column => ({ v: column, s: boldStyle }));
  
  
      const getExcelDataRow = (row) => {
          const rowValues = [];

          secondRow.forEach(col => {
              rowValues.push(row[col.replace(/\n/g, ' ')] || '');
          });
  
          return rowValues;
      };
  
      // Allowance and deduction parent header rows--------------
      const parentHeaderRow = [
          "", 
          "", 
          "", 
          "", 
          ...Array(fixedAllowanceNames.length).fill(`${curMonth} ${data[0]?.salary_year} - Fixed Allowances`), 
          "",
          ...Array(allowanceNames.length).fill(`${curMonth} ${data[0]?.salary_year}-Earnings`), 
          ...Array(deductionNames.length).fill("Deductions"),
          "",
      ].map(column => ({ v: column, s: FboldStyle }));
  
      // Generate data rows------------------
      const excelDataRows = updatedData.map((row,index) => getExcelDataRow(row, index));

      const excludedColumns = ['Emp. Code', 'Joining date', 'Pay Days'];
        const excludedIndexes = excludedColumns.map(col => secondRow.indexOf(col)).filter(i => i !== -1);


        const totals = Array(secondRow.length).fill('');
        for (let colIndex = 0; colIndex < secondRow.length; colIndex++) {
            if (excludedIndexes.includes(colIndex)) continue;

            let sum = 0;
            let isNumeric = false;
            for (let row of excelDataRows) {
                const val = parseFloat(row[colIndex]);
                if (!isNaN(val)) {
                    sum += val;
                    isNumeric = true;
                }
            }
            if (isNumeric) {
                totals[colIndex] = sum.toFixed(2);
            }
        }
        totals[0] = 'Grand Total :';

      const excelData = [
            parentHeaderRow,
            headerRow,
            ...excelDataRows,
            totals.map((val, index) => ({
                v: val,
                s: {
                    font: { bold: true },
                    alignment: { horizontal: index === 0 ? 'left' : 'right', vertical: 'center' }
                }
            }))
        ];
      console.log({excelDataRows});
      //-----------------------
  
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);
  
      // Apply styles to the header row----------------
      for (let i = 0; i < headerRow.length; i++) {
          const cellAddress = XLSX.utils.encode_cell({ c: i, r: 1 });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = { font: { bold: true }, alignment: boldStyle.alignment };
      }
  
      ws['!merges'] = [
        {s: {c: 4, r: 0}, e: {c: 3 + fixedAllowanceNames.length, r: 0}},
        {
          s: {c: 5 + fixedAllowanceNames.length, r: 0},
          e: {
            c: 4 + fixedAllowanceNames.length + allowanceNames.length,
            r: 0,
          },
        },
        {
          s: {
            c: 5 + fixedAllowanceNames.length + allowanceNames.length,
            r: 0,
          },
          e: {
            c:
              4 +
              fixedAllowanceNames.length +
              allowanceNames.length +
              deductionNames.length,
            r: 0,
          },
        },
      ];
  
      // Adjust column widths based on header content--------------
      const colWidths = secondRow.map(col => {
          const maxLength = Math.max(...col.split('\n').map(word => word.length));
          return { wch: maxLength + 1 };
      });
      ws['!cols'] = colWidths;
      ws['!rows'] = [{ hpt: 20 }, { hpt: 40 }, { hpt: 20 }];
  
      
      const sheetName = 'Salary Report';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${sheetName}.xlsx`);

  }catch(e){
      console.log("excel export error", e);
  }
  
}, []);

const handleExport = async() => {
  // const { month, year } = tableData
  console.log("nvhjbv",month,year);
  // const { data } = await customFetch(`/salary/exportProcessedSalaryData`, 'POST', {salary_month: month, salary_year: year})
  // console.log("fdfd", data);
  exportToExcel(salaryReport)
}

const handlePageSizeChange = async (size) => {
  const body = {
    salary_month: month,
    salary_year: year,
    pageCount: data.page,
    numPerPage: size,
    searchString: data.searchVal,
    selectedEmployees: selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    headerLocationId: null,
};
apiCalls(
    // setModalTypeHandler,
    // setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
);
  setData({...data,pageSize: size})
};

const handlePageChange = (page) => {
  const body = {
    salary_month: month,
    salary_year: year,
    pageCount: page,
    numPerPage: data.pageSize,
    searchString: data.searchVal,
    selectedEmployees: selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    headerLocationId: null,
};
apiCalls(
    // setModalTypeHandler,
    // setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
);
  setData({...data,page: page})
};

const handleChange = (e) => {
  setMonth(e.target.value);
  setIsApiFinished(false);
};

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

console.log("thatdffff",PrevMonth,firstPrevMonth,secondPrevMonth,thirdPrevMonth);

const requestSearch = async (e) => {
  let val = e.target.value;
  setData({...data, searchVal: val});
  setIsApiFinished(false);
  setLoaderStatusHandler(true);

  dispatch(setSearchSalaryReport({data: [], numRows: 0}));
  const body = {
    // month_id: previousMonthNumber + 1,
    salary_month: month,
    salary_year: year,
    // selectedEmployees:
    //   selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    pageCount: 0,
    numPerPage: data.pageSize,
    searchString: val,
    selectedEmployees: selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    headerLocationId: null,
  };
  await apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      getSearchSalaryReport(
        body,
        commoncookie,
        setModalTypeHandler,
        (loaderStatus) => {
        setLoaderStatusHandler(loaderStatus);
        // when your loader turns false => API done
        if (loaderStatus === false) {
          setIsApiFinished(true);
        }
      },
      ),
    ),
  )
};

const cancelSearch = () => {
  setData({...data, page: 0, searchVal: ''});
  dispatch(setSearchSalaryReport({data: [], numRows: 0}));
  const body = {
    // month_id: previousMonthNumber + 1,
    salary_month: month,
    salary_year: year,
    // selectedEmployees:
    //   selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    pageCount: 0,
    numPerPage: data.pageSize,
    searchString: '',
    selectedEmployees: selectedNames[0] === '' || !selectedNames.length ? null : selectedNames,
    headerLocationId: null,
  };
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
  );
};

const handleFilterClose = () =>{
  setFilterOpen(false)
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
      // setModalTypeHandler,
      // setLoaderStatusHandler,
    ),
  );
  // }
  // }),
  // );

};

const getCurrentMonth = date.getMonth(); // current month - 1
console.log("fthid",getCurrentMonth);
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

const handlePreviousMonthClick = (temp_data) => {
  setData({...data, page: 0, searchVal: ''});
  const month = temp_data.split(' ')[0];
  const year = temp_data.split(' ')[1];
  const  {startDate,count}=getStartAndEndDate(month,year)
  console.log(startDate,count,'startdateee');
  setMonth(count)

  dispatch(getEmpbasecompanyAction({} ,(res)=>{
    const body = {
      salary_month: count,
      salary_year: year,
      pageCount: 0,
      numPerPage: data.pageSize,
      searchString: '',
      selectedEmployees: null,
      headerLocationId: null,
  };
  apiCalls(
      // setModalTypeHandler,
      // setLoaderStatusHandler,
      dispatch(listSalaryReportAction(body)),
    ).finally(() => setIsApiFinished(true));
    setData({...data, page: 0, searchVal: ''});
  }))
}

const submitAction = () => {

  if (selectedAll) {
    dispatch(getEmpbasecompanyAction({}, (res) => {
      if (res) {
        processFunction(res)
      }
    }))
  }
  else {
    processFunction(value)
  }
  // setMonth(0);
  // setYear(0);
  setSelectedDepartment([]);
  // setValue([]);
};

const  processFunction = (value) =>{
  setData({...data, page: 0, searchVal: ''});
  setButton()
  console.log("value",value)
  if (value?.length === 0  ) {
    setUserSelectError('Employee is required');
    setIsSelectUserEmpty(true);
    return;
}
  setSelectedNames(value.map((d)=> d.employee_id))
  setUserSelectError('');
  setIsSelectUserEmpty(false);
  const body = {
    salary_month: month,
    salary_year: year,
    pageCount: 0,
    numPerPage: data.pageSize,
    searchString: '',
    selectedEmployees:value.map((d)=> d.employee_id),
    headerLocationId: null,
};
apiCalls(
    // setModalTypeHandler,
    // setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
).finally(() => setIsApiFinished(true));
  setFilterOpen(false)
  setData({...data, page: 0, searchVal: ''});
}

const handleFilterClear = () =>{
  setData({...data, page: 0, searchVal: ''});
  setButton('4')
  setFilterOpen(false)
  setMonth(date.getMonth())
  setSelectedNames([''])
  setValue([])
  const body = {
    salary_month: date.getMonth(),
    salary_year: year,
    pageCount: data.page,
    numPerPage: data.pageSize,
    searchString:data.searchVal,
    selectedEmployees: null,
    headerLocationId: null,
};
console.log("thisff",body);
let data1 = {
   
  searchString:''
 }
apiCalls(
  setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(listSalaryReportAction(body)),
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    })),
    dispatch(getCompanyLogo()),
  ).finally(() => setIsApiFinished(true));
}
const selectedRole = storage?.role_name;
const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__salary__salary_report', 'can_export')
return (
  <>
    <Helmet>
      <meta charSet='utf-8' />
      <title> {titleURL} | Salary Report </title>
    </Helmet>

    {/* Filter Dialog */}
    <Dialog
      open={filterOpen}
      onClose={handleFilterClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogContent>
        <Grid container display='flex' flexDirection='row' alignItems='center' spacing={2}>
          <Grid display={'flex'} justifyContent={'flex-end'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
              <IconButton aria-label="close" onClick={() => handleFilterClose()}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <FormControl fullWidth error={isSelectUserEmpty}>
              <CommonUserAutoComplete
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
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Select Month</InputLabel>
              <Select
                autoFocus
                value={month}
                label='Select Month'
                onChange={handleChange}
                sx={{ height: '42px' }}
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
                sx={{ height: '42px' }}
                label='Year'
                required
              >
                {generateArrayOfYears().map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid display={'flex'} justifyContent={'center'} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Button color='secondary' variant='contained' style={{ marginRight: '20px' }} onClick={handleFilterClear}>
              Clear
            </Button>
            <Button color='primary' variant='contained' style={{ marginRight: '20px' }} onClick={submitAction}>
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
          Salary Report
        </Typography>

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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

          <CommonSearch
            searchVal={data.searchVal}
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
              <IconButton size='small' onClick={handleExport}>
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
            rows={tableData}
            columns={columns}
            pageSizeOptions={[20, 50, 100]}
            paginationMode='server'
            density='compact'
            disableRowSelectionOnClick
            disableExtendRowFullWidth
            rowCount={salaryReportCount}
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
  </>
);
}

export default SalaryReportsPayroll;