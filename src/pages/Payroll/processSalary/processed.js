import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import { Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, LinearProgress, TablePagination, Typography } from '@mui/material';
import PaySlip from 'components/processSalary/paySlip';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getDetailsBasedonMonth, processSalaryPaginationAction, searchProcessSalaryAction, searchProcessSalaryState, updateProcessStatusAction } from 'redux/actions/salary_actions';
import apiCalls from 'utils/apiCalls';
import CommonSearch from 'utils/commonSearch';
import context from '../../../context/CreateNewButtonContext';
import { maxHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { sendNtfy } from 'firebase/firebase.service';
import { commonDateFormat, getDateTimeFormat } from 'utils/getTimeFormat';
import moment from 'moment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommonToolTip from '../../../components/ToolTip';
import * as XLSX from 'xlsx-js-style';
import { useCustomFetch } from 'utils/useCustomFetch';
import {saveAs} from 'file-saver';
import { SET_SEARCH_PROCESS_SALARY } from 'redux/actionTypes';
import { format } from 'date-fns';
import API_URLS from '../../../utils/customFetchApiUrls';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';


function Processed(props) {
    const dispatch = useDispatch();
    const customFetch = useCustomFetch()
    const date = new Date();
    const getCurrentMonth = date.getMonth() + 1; // current month - 1
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(getCurrentMonth);
    const [paySlipData, setPaySlipData] = useState({});
    const [isApiFinished, setIsApiFinished] = useState(false);
    const [openDialoug , setopenDialoug] = useState(false);
    const [progress, setProgress] = useState(0);
    const [linearLoading, setLinearloading] = useState(false);
    const [loading, setLoading] = useState(null);


    const [data, setData] = useState({
        page: 0,
        pageSize: 20,
        searchVal: "",
    });
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
    } = useContext(context);

    const {
        SalaryReducers: { processSalaryData, processSalaryCount }, 
        stockLocationReducer: { stocklocation }, 
        attendanceReducer: { get_empbasecompany },
        CompanyReducers: { company_logo },
    } = useSelector((state) => state);
    console.log("itititit", processSalaryData);
  useEffect(() => {
    let timer;
    if (linearLoading) {
      timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 100 ? 100 : prevProgress + 10));
      }, 400);
    }
    return () => {
      clearInterval(timer);
    };
  }, [linearLoading]);

    useEffect(() => {
        const body = {
            process_monthid : props.rowData.processedMonth_id,
            salary_month: props.rowData.month,
            salary_year: props.rowData.year,
            pageCount: data.page,
            numPerPage: data.pageSize,
            searchString: data.searchVal,
            employeeId: commoncookie,
            headerLocationId: headerLocationId,
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(processSalaryPaginationAction(body, commoncookie)),
        );
        window.scrollTo(0, 0);

        return () => {
            dispatch({type: SET_SEARCH_PROCESS_SALARY, payload: {data:[], numRows:0}})
        }
    }, [month,data.page,data.pageSize]);

    let emp_id = processSalaryData?.map((v)=>v.employee_id) 

    const handleOpen = (rowData) => {
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
    const cancelSearch = () => {
        setData({ ...data, page: 0, searchVal: "" });
        dispatch(searchProcessSalaryState({ data: [], numRows: 0 }));
        const body = {
            process_monthid : props.rowData.processedMonth_id,
            salary_month: props.rowData.month,
            salary_year: props.rowData.year,
            pageCount: data.page,
            numPerPage: data.pageSize,
            searchString: "",
            employeeId: commoncookie,
            headerLocationId: headerLocationId,
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(processSalaryPaginationAction(body, commoncookie)),
        );
    };

    // const handlePageSizeChange = async (size) => {
    //     const body = {
    //         salary_month: props.rowData.month,
    //         salary_year: props.rowData.year,
    //         pageCount: data.page,
    //         numPerPage: size,
    //         searchString: '',
    //         employeeId: commoncookie,
    //         headerLocationId: headerLocationId,
    //     };
    //     apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         await dispatch(processSalaryPaginationAction(body, commoncookie)),
    //     );
    // };
   
    // const handlePageChange = (page) => {
    //     const body = {
    //         salary_month: props.rowData.month,
    //         salary_year: props.rowData.year,
    //         pageCount: page,
    //         numPerPage: data.pageSize,
    //         searchString: '',
    //         employeeId: commoncookie,
    //         headerLocationId: headerLocationId,
    //     };
    //     apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(processSalaryPaginationAction(body, commoncookie)),
    //     );
    // };
    // const handlePageChange = (page) => {
    //     setData({ ...data, page:page }); 
    // };

    const handlePageChange = (newPage) => {
        setData((prev) => ({
          ...prev,
          page: newPage,
        }));
      };
      
    //   const handlePageSizeChange = (size) => {
    //     setData({ ...data, pageSize: size, page: 0 }); 
    // };

      const handlePageSizeChange = (newSize) => {
        setData((prev) => ({
          ...prev,
          pageSize: newSize,
          page: 0, 
        }));
      };

    const requestSearch = async (e) => {
        let val = e.target.value;
        setData({ ...data, searchVal: val });
        await setIsApiFinished(false);

        dispatch(searchProcessSalaryState({ data: [], numRows: 0 }));
        const body = {
            month_id: month,
            salary_month: props.rowData.month,
            salary_year: props.rowData.year,
            pageCount: data.page,
            numPerPage: data.pageSize,
            searchString: val,
            employeeId: commoncookie,
            headerLocationId: headerLocationId,
        };
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
                searchProcessSalaryAction(
                    body,
                    commoncookie,
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                ),
            ),
        ).finally(() => setIsApiFinished(true));
    };

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

    const filteredMonths = monthNames.filter(
        (month) => month.id <= getCurrentMonth,
    );

    const handleOpentab = () => {
            setopenDialoug(true)
    };
        const pendingEmployeeIds = processSalaryData.filter(emp => emp.status === "pending").map(emp => emp.employee_id);
        const advanceAmtDeduction = Array.isArray(processSalaryData)? processSalaryData.filter(
        emp =>
          emp?.status?.trim().toLowerCase() === "pending" &&
          emp?.loan_deduction != null
        ).map(emp => emp.employee_id)
        : [];

    const finalConfirm = () => {
        setLinearloading(true)
        const body = {
            salary_month: props.rowData.month,
            salary_year: props.rowData.year,
            pageCount: 0,
            numPerPage: pageSize,
            searchString: '',
            employeeId: commoncookie,
            headerLocationId: headerLocationId,
        };
        const payload = {
            ...props.rowData,
            employee_ids : pendingEmployeeIds,
            autodeduction_ids : advanceAmtDeduction
        }
            setTimeout(() => {
                setopenDialoug(false);
                setLinearloading(false);
                props.setRowData({...props.rowData, status : 'Confirmed'})
                    dispatch(updateProcessStatusAction(payload, () => {
                        props.handleClose()
                        apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            dispatch(
                                getLoginRoleAction(emp_id, (role_name, token, content) => {
                                    let notify_content = "Salary Processed"
                                    let content_body = `Salary Processed successfully`;
                                   // sendNtfy(token, notify_content, content_body);
                                    dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content, time: getDateTimeFormat(new Date()), "active": "1" }))
                                }),
                                // dispatch(processSalaryPaginationAction(body, commoncookie)),
                            )
                        );
                    }))
            }, 3000);

    }
    const handleDialougeClose = ()=>{
        setopenDialoug(false)
      }

const DataSet =[
{
    columns:[
        {title: "id"},
        {title: "amount"},
        {title: "name"},
        {title: "age"},
        {title: "expirence"}
    
    ]
}
]

const prepareData = (data = []) => {
    
    try {

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const curMonth = monthNames[data[0]?.salary_month - 1];

        const fixedAllowanceNames = [
            ...new Set(data.flatMap(v =>
                v.fixed_allowance?.filter(i => +i.allowance_amount > 0)
                .map(allowance => `Actual ${allowance.allowance_name}`) || []
            )),
            "Actual Gross"
        ];

        const allowanceNames = [
            ...new Set(data.flatMap(v => v.allowance_json?.map(a => a.allowance_name) || []))
        ];
        const deductionNames = [
            ...new Set(data.flatMap(v => v.deduction_json?.map(d => d.deduction_name) || []))
        ];

        // Construct header row
        const secondRow = [
            "S. No.",
            "Emp. Code",
            "Employee",
            "Joining Date",
            "Pay Days",
            ...fixedAllowanceNames,
            ...allowanceNames,
            "Earned Gross",
            ...deductionNames,
            "Net Pay",
            "Tds"
        ];

        const formatDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return isNaN(date) ? "" : format(date, "dd/MM/yyyy");
        };

        const updatedData = data.map((row, index) => {
            const fixedAllowances = row.fixed_allowance?.reduce((acc, curr) => {
                acc[`Actual ${curr.allowance_name}`] = +curr.allowance_amount || "";
                return acc;
            }, {}) || {};

            fixedAllowances["Actual Gross"] = row.fixed_allowance?.reduce((acc, curr) => acc + (+curr.allowance_amount || 0), 0) || 0;

            const allowances = row.allowance_json?.reduce((acc, curr) => {
                acc[curr.allowance_name] = +curr.allowance_amount || "";
                return acc;
            }, {}) || {};

            const deductions = row.deduction_json?.reduce((acc, curr) => {
                acc[curr.deduction_name] = +curr.deduction_amount || "";
                return acc;
            }, {}) || {};

            return {
                "S. No.": index + 1,
                "Emp. Code": row.employee_code || "",
                "Employee": `${row.first_name ? row.first_name.charAt(0).toUpperCase() + row.first_name.slice(1) : ""} ${row.last_name ? row.last_name.charAt(0).toUpperCase() + row.last_name.slice(1) : ""}`.trim(),
                "Joining Date": formatDate(row.dateOfJoining),
                "Pay Days": row.net_payable_days || 0,
                "Earned Gross": row.total_earnings || 0,
                "Net Pay": row.status === "pending"
                    ? (row.total_earnings - row.total_deductions - (row.loan_deduction || 0) + (row.claim || 0))
                    : (row.total_earnings - row.total_deductions + (row.claim || 0)),
                ...fixedAllowances,
                ...allowances,
                ...deductions,
                "Tds": row.Tds || "",
                "month": row.salary_month || "",
                "status": row.status || ""
            };
        });

        return {
            secondRow,
            updatedData,
            fixedAllowanceNames,
            allowanceNames,
            deductionNames,
            curMonth,
        };
    } catch (error) {
        console.error("error", error);
        return {
            secondRow: [],
            updatedData: [],
            fixedAllowanceNames: [],
            allowanceNames: [],
            deductionNames: [],
            curMonth: "Unknown",
        };
    }
};


const exportToExcel = useCallback((data) => {
    try{
        console.log("ooooo", data);
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

        console.log({updatedData});
    
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
        const excelData = [parentHeaderRow, headerRow.map(header => ({ v: header.v, s: boldStyle })), ...excelDataRows];
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

        console.log({
            "fixedAllowanceNames.length": fixedAllowanceNames.length,
            "allowanceNames.length": allowanceNames.length,
            "deductionNames.length": deductionNames.length,
        });
    
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
    
        
        const sheetName = 'Processed Salary Data';
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
        
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `${sheetName}.xlsx`);

    }catch(e){
        console.log("excel export error", e);
    }
    
}, []);

const handleExport = async() => {
    console.log("export clicked");
    
    const { month, year,  processedMonth_id} = props.rowData
    const { data } = await customFetch(
        API_URLS.EXPORT_PROCESSED_SALARY_DATA,
        'POST',
        { salary_month: month, salary_year: year, process_monthid :  processedMonth_id}
    );
    console.log("fdfd", data);
    exportToExcel(data)


}

const { columns, tableData } = useMemo(() => {
    console.log('outer111', processSalaryData)
    if (!processSalaryData || !Array.isArray(processSalaryData) || processSalaryData.length === 0) {
        console.error("processSalaryData is invalid or empty", processSalaryData);
        return { columns: [], tableData: [] };
    }

    const preparedData = prepareData(processSalaryData);
    console.log('preparedData', preparedData)
    if (!preparedData || !Array.isArray(preparedData.secondRow) || !preparedData.updatedData) {
        console.error("prepareData did not return expected values", preparedData);
        return { columns: [], tableData: [] };
    }

    const { secondRow, updatedData } = preparedData;
    console.log(preparedData,'rowData');
    
    const columns = secondRow.map((i) => ({ title: i, field: i }));
    columns.push(
        {
            title: 'Month',
            field: 'month',
            render: (rowData) => {
                const obj = monthNames.find((m) => m.id === parseInt(rowData.month));
                return obj ? obj.name.slice(0, 3) : null;
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
                return <span style={{ color }}>{rowData.status}</span>;
            },
        }
    );

    console.log("Generated columns:", columns);

    return {
        columns,
        tableData: updatedData || [],
    };
}, [processSalaryData.length]);


// const {columns, tableData} = useMemo(() => {

//     let { 
//         secondRow, 
//         updatedData, 
//     } = prepareData(processSalaryData);
//     // const data = prepareData(processSalaryData)
//     // const secondRow = data.secondRow
//     // const updatedData = data.updatedData
// // console.log("gdgdfgfdg",secondRow,updatedData,prepareData(processSalaryData));

//     const columns = secondRow.map(i => ({title: i, field: i}))
//     columns.push(
//       {
//         title: 'Month',
//         field: 'month',
//         render: (rowData) => {
//           const obj = monthNames.find((m) => m.id === parseInt(rowData.month));
//           const monthName = obj ? obj.name.slice(0, 3) : null;
//           return monthName;
//         },
//       },
//       {
//         title: 'Status',
//         field: 'status',
//         render: (rowData) => {
//           let color = ''; 
//           switch (rowData.status) {
//             case 'pending':
//               color = 'orange';
//               break;
//             case 'Confirmed':
//               color = 'green';
//               break;
//           }
//           return <span style={{color}}>{rowData.status}</span>;
//         },
//       },
//     );


//     console.log("fdfdfd column", columns);

//     const tableData = updatedData;
//     return{
//         columns,
//         tableData,
//     }
// },[processSalaryData])


console.log("outer ", columns, tableData);




    return (
        <Grid>
            <Grid
                size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                }}>
                <Grid>
                    <Dialog open={openDialoug} onClose={handleDialougeClose}>
                        <DialogTitle>{'Final Confirmation'}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                This Action Cannot be Reverted. Would you like to confirm?
                            </DialogContentText>
                            {linearLoading &&
                                <div>
                                    <span>
                                        <LinearProgress determinate value={progress}
                                            sx={{
                                                borderRadius: '0px',
                                                height: '10px',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: '0px',
                                                    backgroundColor: '#4caf50',
                                                },
                                            }}
                                        />
                                    </span>
                                    <span style={{
                                        fontWeight: "bold", position: 'absolute',
                                        top: '60%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '10px'
                                    }}>
                                        Processingâ€¦ {`${Math.round(progress)}%`}
                                    </span>
                                </div>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant='contained' color='error' onClick={handleDialougeClose}>
                                Cancel
                            </Button>
                            <Button variant='contained' onClick={finalConfirm} autoFocus>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
                <Card>
                    <MaterialTable
                        totalCount={processSalaryCount || 0}
                        components={{
                            // ...stickyTableComponents,
                            Toolbar: (props) => (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <MTableToolbar {...props} />
                                    </Box>
                                    <Box>
                                        <CommonSearch
                                            searchVal={data.searchVal}
                                            cancelSearch={cancelSearch}
                                            requestSearch={requestSearch}
                                        />
                                    </Box>
                                </Box>
                            ),
                            // Pagination: (props) => (
                            //     <div
                            //       style={{
                            //         display: "flex",
                            //         justifyContent: "flex-end",
                            //         alignItems: "center",
                            //         padding: "8px 16px",
                            //       }}
                            //     >
                            //       <TablePagination
                            //         {...props}
                            //         component="div"
                            //         count={processSalaryCount || 0}
                            //         page={data.page || 0}
                            //         rowsPerPage={data.pageSize || 20}
                            //         rowsPerPageOptions={[20, 50, 100]}
                            //         onPageChange={(event, newPage) => handlePageChange(newPage)}
                            //         onRowsPerPageChange={(event) =>
                            //           handlePageSizeChange(parseInt(event.target.value, 10))
                            //         }
                            //         labelRowsPerPage="Rows per page:"
                            //       />
                            //     </div>
                            //   ),
                        }}
                        actions={[]}
                        // page={data.page}
                        page={data.page}
                        onPageChange={(page) => handlePageChange(page)}
                        onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                      
                        options={{
                            showEmptyDataSourceMessage: isApiFinished,
                            headerStyle: { position: 'sticky', ...headerStyle },
                            cellStyle,
                            search: false,
                            exportButton: true,
                            filtering: false,
                            actionsColumnIndex: -1,
                            //maxBodyHeight: maxHeight,
                            pageSize: 20,
                            pageSizeOptions: [20, 50, 100],
                            totalCount: processSalaryCount || 0,
                            paging: true,
                            //minBodyHeight: '100px'
                             maxBodyHeight: '65vh',
                             exportMenu: [{
                                label: 'Export to Excel',
                                exportFunc: (cols, datas) => 
                                    handleExport()
                              }],
                        }}
                        columns={columns}
                        data={tableData}
                        title={
                            <Typography
                            fontFamily="sans-serif" fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)'
                                variant='h6'
                                align='left'
                                style={{ paddingTop: '10px', paddingBottom: '10px' }}
                            >
                                {'Process Salary'}
                            </Typography>
                        }
                    />
                </Card>
            </Grid>
            {open && (
                <PaySlip
                    open={open}
                    handleClose={handleClose}
                    paySlipData={paySlipData}
                    company_logo={company_logo}
                />
            )}
            <Grid style={{ display: 'flex', justifyContent: 'end' ,padding:'10px 5px'}}>
                <Grid>
                    <Button
                        color='secondary'
                        variant='contained'
                        onClick={() => props.handleClose()}
                        style={{ textTransform: 'none' }}
                    >
                        <Typography variant='body1'>Back</Typography>
                    </Button>
                </Grid>
                <Grid paddingLeft={3}>
                    {['Partially Confirmed', 'pending'].includes(props.rowData.status) && <Button
                        color='secondary'
                        variant='contained'
                        onClick={() => handleOpentab()}
                        style={{ textTransform: 'none',backgroundColor:'green' }}
                    >
                        <Typography variant='body1'>FinalConfirm</Typography>
                    </Button>}
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Processed
