import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import { SetSalaryReportForBankAction, getSalaryReportForBankAction, getSearchSalaryReportForBankAction } from 'redux/actions/salary_actions';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useCustomFetch } from 'utils/useCustomFetch';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Card, Chip, IconButton, Paper, Switch, FormControlLabel, TextField, Tooltip, Fade } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import CommonSearch from 'utils/commonSearch';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API_URLS from '../../../utils/customFetchApiUrls';
import { getBankReportColumnsAction, updateBankReportColumnsAction } from 'redux/actions/userRole_actions';
import NewDynamicProperties from 'pages/assets/DynamicProperties/DynamicProp';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const SalaryReportForBank = () => {
    const navigate = useNavigate();
    const customFetch = useCustomFetch();
    const [salaryReportForBankData, setSalaryReportForBankData] = useState()
    const [data1, setData1] = useState({
        datas: null,
        btn: null
    })
    const [button, setButton] = useState('4');
    const [salaryReportForBankDataRows, setSalaryReportForBankDataRows] = useState()
    const [companyBasedEmpDetailsData, setCompanyBasedEmpDetailsData] = useState()
    const date = new Date();
    const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
    const [filterDate, setFilterDate] = useState({
        from: defaultFrom,
        to: defaultTo
    });
    const [errMsg, setErrMsg] = useState({
        from: '',
        to: '',
    });
    const [searchVal, setSearchVal] = useState('')
    const [employeeId, setEmployeeId] = useState('');
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const [count, setCount] = useState(0)
    const [filterOpen, handleFilter] = useState(false);
    const [month, setMonth] = useState(date.getMonth());
    const [year, setYear] = useState(0);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [editableColumns, setEditableColumns] = useState([]);
    const [originalColumns, setOriginalColumns] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [dynamicPropOpen, setDynamicPropOpen] = useState(false);
    const FIELD_KEY_STORAGE = 'salaryReportForBank_fieldKeys';

    const currentMonthStart = moment().startOf('month');
    const firstDateOfMonth = currentMonthStart.format('YYYY-MM-DD');
    const lastDateOfMonth = currentMonthStart.endOf('month').format('YYYY-MM-DD');
    const [isApiFinished, setIsApiFinished] = useState(false);
    const [monthYear, setMonthYear] = React.useState({
        empName: [],
        location: [''],
        from: moment(firstDateOfMonth),
        to: moment(lastDateOfMonth),
    });

    const [data, setData] = useState({
        pageCount: 0,
        pageSize: 20,
        currentMonth: currentMonth,
        currentYear: currentYear
    })
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
    );
    const { SalaryReducers: { salaryReportForBank, salaryReportForBankCount }, attendanceReducer: { get_empbasecompany }, stockLocationReducer: { stocklocation }, UserCreationReducer: { departmentList }, UserRoleReducer: { reportColumns }, rbacReducer: {menuAccess = []} } = useSelector((state) => state);

    const dispatch = useDispatch();
    const storage = getsessionStorage();

    console.log('sdafawef', salaryReportForBank)

    useEffect(() => {
        console.log(data1, 'currentYearrrrr')
        const currentDate = new Date();

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

        let payLoad = {
            employeeId: monthYear.empName,
            month: previousMonthNumber + 1,
            year: lastMonthYear,
            pageCount: data.pageCount,
            numPerPage: data.pageSize
        }

        dispatch(getSalaryReportForBankAction(payLoad, (response, resData) => {
            if (response === 200) {
                setSalaryReportForBankData(resData.data)
                setSalaryReportForBankDataRows(resData.numRows)
            }
        })).finally(() => {
            setIsApiFinished(true)
            setLoaderStatusHandler(false)
        })
        dispatch(getEmpbasecompanyAction())
        dispatch(listStockLocationAction(commoncookie, headerLocationId))
    }, [data.pageCount, data.pageSize])

    useEffect(() => {
        if (reportColumns && reportColumns.length > 0) {
            const columnsWithStableIds = buildColumnsWithFieldKey(reportColumns);
            setEditableColumns(columnsWithStableIds);
            setOriginalColumns(columnsWithStableIds);
        }
    }, [reportColumns]);

    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchVal(val)

        dispatch(SetSalaryReportForBankAction({ data: [], numRows: 0 }));
        let payLoad = {
            employeeId: '',
            month: month,
            year: year,
            pageCount: data.pageCount,
            numPerPage: data.pageSize,
            searchString: val,
        }
        dispatch(getSearchSalaryReportForBankAction(payLoad, setModalTypeHandler, (loaderStatus) => {
            setLoaderStatusHandler(loaderStatus);
            // when your loader turns false => API done
            if (loaderStatus === false) {
                setIsApiFinished(true);
            }
        },))
    };

    const cancelSearch = () => {
        setSearchVal('')
        dispatch(SetSalaryReportForBankAction({ data: [], numRows: 0 }));
        let payLoad = {
            employeeId: '',
            month: month,
            year: year,
            pageCount: data.pageCount,
            numPerPage: data.pageSize,
            searchString: ""
        }
        dispatch(getSearchSalaryReportForBankAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))

    };

    useEffect(() => {
        setSalaryReportForBankData(salaryReportForBank)
        dispatch(getBankReportColumnsAction())
    }, [salaryReportForBank])

    console.log('salaryReportForBankData', salaryReportForBankData)

    const columnFieldMap = {
        'Debit Account No': 'debitAccount',
        'Debit Account Name': 'debitAccountName',
        'Value Date': 'valueDate',
        'Transaction Type': 'transactionType',
        'Beneficiary Name': 'beneficiaryName',
        'Beneficiary A/c No': 'beneficiaryAccountNo',
        'Beneficiary IFSC Code': 'ifscCode',
        'Transaction Amount': 'transactionAmount',
        'Beneficiary Email ID': 'beneficiaryEmailID',
        'Beneficiary Mobile No': 'beneficiaryMobileNo',
        'Description': 'description'
    };

    const normalizeDynamicKey = (value = '') =>
        String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

    const getDynamicFieldName = (columnKey = '') => `dynamic_${normalizeDynamicKey(columnKey)}`;

    const getSavedFieldKeyMap = () => {
        try {
            const saved = localStorage.getItem(FIELD_KEY_STORAGE);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            return {};
        }
    };

    const persistFieldKeyMap = (columns = []) => {
        try {
            const map = columns.reduce((acc, col) => {
                if (col?.id && col?.fieldKey) {
                    acc[col.id] = col.fieldKey;
                }
                return acc;
            }, {});
            localStorage.setItem(FIELD_KEY_STORAGE, JSON.stringify(map));
        } catch (error) {
            // ignore local storage failures
        }
    };

    const buildColumnsWithFieldKey = (columns = []) => {
        const savedFieldKeyMap = getSavedFieldKeyMap();
        const sortedColumns = [...columns].sort((a, b) => a.displayOrder - b.displayOrder);
        return sortedColumns.map((col, index) => ({
            ...col,
            fieldKey:
                col.fieldKey ||
                (col.id ? savedFieldKeyMap[col.id] : null) ||
                columnFieldMap[col.columnKey] ||
                getDynamicFieldName(col.columnKey),
            dragId: col.id ? `drag-${col.id}` : `drag-${col.columnKey.replace(/\s+/g, '-')}-${index}`
        }));
    };

    const getDynamicValueByColumnKey = (item, columnKey, fieldKey) => {
        if (!item || !columnKey) return '-';

        const directCandidates = [
            fieldKey ? item[fieldKey] : undefined,
            item[columnKey],
            item[columnKey.replace(/\s+/g, '')],
            item[columnKey.toLowerCase()],
            item[columnKey.replace(/\s+/g, '_').toLowerCase()],
        ];
        const directValue = directCandidates.find((val) => val !== undefined && val !== null && val !== '');
        if (directValue !== undefined) return directValue;

        const dynamicSources = [
            item.dynamic_fields,
            item.dynamicFields,
            item.custom_fields,
            item.customFields,
        ];

        for (const source of dynamicSources) {
            let parsedSource = source;
            if (typeof parsedSource === 'string') {
                try {
                    parsedSource = JSON.parse(parsedSource);
                } catch (error) {
                    parsedSource = null;
                }
            }
            if (!parsedSource) continue;

            if (!Array.isArray(parsedSource) && typeof parsedSource === 'object') {
                const objectKeys = Object.keys(parsedSource);
                const matchedKey = objectKeys.find(
                    (key) => normalizeDynamicKey(key) === normalizeDynamicKey(columnKey)
                );
                if (matchedKey) {
                    const value = parsedSource[matchedKey];
                    return value !== undefined && value !== null && value !== '' ? value : '-';
                }
            }

            if (Array.isArray(parsedSource)) {
                const matchedItem = parsedSource.find((entry) => {
                    const key =
                        entry?.name ||
                        entry?.label ||
                        entry?.field ||
                        entry?.columnKey ||
                        entry?.key;
                    return normalizeDynamicKey(key) === normalizeDynamicKey(columnKey);
                });
                if (matchedItem) {
                    const value =
                        matchedItem?.value ??
                        matchedItem?.defaultValue ??
                        matchedItem?.fieldValue ??
                        matchedItem?.field_value;
                    return value !== undefined && value !== null && value !== '' ? value : '-';
                }
            }
        }

        return '-';
    };

    const columnsTest = editableColumns
        ?.filter(col => col.isVisible === 1)
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        ?.map(col => ({
            field: col.fieldKey || columnFieldMap[col.columnKey] || getDynamicFieldName(col.columnKey),
            headerName: col.columnKey,
            width: col.columnKey.includes('IFSC') ? 160 :
                col.columnKey.includes('Email') ? 160 :
                    col.columnKey.includes('Mobile') ? 160 :
                        col.columnKey.includes('Amount') ? 160 : 150
        })) || [];

    const defaultColumns = [
        { field: 'debitAccount', headerName: 'Debit Account No', width: 150 },
        { field: 'debitAccountName', headerName: 'Debit Account Name', width: 150 },
        { field: 'valueDate', headerName: 'Value Date', width: 150 },
        { field: 'transactionType', headerName: 'Transaction Type', width: 150 },
        { field: 'beneficiaryName', headerName: 'Beneficiary Name', width: 150 },
        { field: 'beneficiaryAccountNo', headerName: 'Beneficiary A/c No', width: 150 },
        { field: 'ifscCode', headerName: 'Beneficiary IFSC Code', width: 160 },
        { field: 'transactionAmount', headerName: 'Transaction Amount', width: 160 },
        { field: 'beneficiaryEmailID', headerName: 'Beneficiary Email ID', width: 160 },
        { field: 'beneficiaryMobileNo', headerName: 'Beneficiary Mobile No', width: 160 },
        { field: 'description', headerName: 'Description', width: 160 },
    ];

    const finalColumns = columnsTest.length > 0 ? columnsTest : defaultColumns;

    const handleOpenColumnDialog = () => {
        if (reportColumns && reportColumns.length > 0) {
            const columnsWithStableIds = buildColumnsWithFieldKey(reportColumns);
            setEditableColumns(columnsWithStableIds);
        }
        setColumnDialogOpen(true);
    };

    const handleCloseColumnDialog = () => {
        setColumnDialogOpen(false);
        if (!isSaving) {
            setEditableColumns(originalColumns);
        }
    };

    const handleOpenDynamicPropDialog = () => {
        setDynamicPropOpen(true);
    };

    const handleCloseDynamicPropDialog = () => {
        setDynamicPropOpen(false);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;

        const items = Array.from(editableColumns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            displayOrder: index + 1,
            dragId: item.dragId
        }));

        setEditableColumns(updatedItems);
    };

    const handleVisibilityChange = (index) => (event) => {
        const updatedColumns = [...editableColumns];
        updatedColumns[index] = {
            ...updatedColumns[index],
            isVisible: event.target.checked ? 1 : 0
        };
        setEditableColumns(updatedColumns);
    };

    const handleColumnNameChange = (index) => (event) => {
        const updatedColumns = [...editableColumns];
        updatedColumns[index] = {
            ...updatedColumns[index],
            columnKey: event.target.value
        };
        setEditableColumns(updatedColumns);
    };

    const handleDynamicFieldAdd = async (val) => {
        const columnName = val?.name?.trim();
        if (!columnName) return;

        const exists = editableColumns.some(
            (col) => (col.columnKey || '').toLowerCase() === columnName.toLowerCase()
        );
        if (exists) return;

        const nextColumns = [
            ...editableColumns,
            {
                id: null,
                columnKey: columnName,
                fieldKey: getDynamicFieldName(columnName),
                isVisible: 1,
                displayOrder: editableColumns.length + 1,
                dragId: `drag-new-${Date.now()}-${editableColumns.length}`
            }
        ];

        setEditableColumns(nextColumns);
        setOriginalColumns(nextColumns);
    };

    const handleSaveColumns = async () => {
        setIsSaving(true);

        const updatedColumnsData = editableColumns.map((col, index) => ({
            id: col.id,
            columnKey: col.columnKey,
            isVisible: col.isVisible,
            displayOrder: index + 1
        }));

        try {
            const result = await dispatch(updateBankReportColumnsAction(updatedColumnsData));
            if (result === "API_FINISHED_SUCCESS") {
                persistFieldKeyMap(editableColumns);
                await dispatch(getBankReportColumnsAction());
                setOriginalColumns(editableColumns);
                setColumnDialogOpen(false);
            }
        } catch (error) {
        } finally {
            setIsSaving(false);
        }
    };

    const onLocationchange = (e) => {
        const { value } = e.target;
        setMonthYear((prevMonthYear) => ({
            ...prevMonthYear,
            location: value.includes('') ? [''] : value,
        }));
    }

    const handlePageChange = async (page) => {
        setData({ ...data, pageCount: page })
    }

    const handlePageSizeChange = async (size) => {
        setData({ ...data, pageSize: size })
    }

    function generateRows(data) {
        return data?.map((item, index) => {
            const formattedDate = moment(item.valueDate, 'YYYY-MM-DD').format('DD/MM/YYYY');

            const row = {
                id: index + 1,
                debitAccount: item.debitAccount || '-',
                debitAccountName: item.debitAccountName || '-',
                valueDate: formattedDate || '-',
                transactionType: item.transactionType || '-',
                beneficiaryName: item.beneficiaryName || '-',
                beneficiaryAccountNo: item.beneficiaryAccountNo || '-',
                ifscCode: item.ifscCode || '-',
                transactionAmount: item.transactionAmount || '-',
                beneficiaryEmailID: item.beneficiaryEmailID || '-',
                beneficiaryMobileNo: item.beneficiaryMobileNo || '-',
                description: item.description || '-'
            };

            editableColumns
                ?.filter((col) => !Object.values(columnFieldMap).includes(col.fieldKey))
                ?.forEach((col) => {
                    const dynamicField = col.fieldKey || getDynamicFieldName(col.columnKey);
                    row[dynamicField] = getDynamicValueByColumnKey(item, col.columnKey, dynamicField);
                });

            return row;
        }) || [];
    }

    const rowssTest = Array.isArray(salaryReportForBankData) ? generateRows(salaryReportForBankData) : [];

    const handleChange = (e) => {
        let { name, value } = e.target;
        setFilterDate({
            ...filterDate,
            from: value?._d,
        });
        return;
    }

    const handleSelectChange = (event) => {
        setEmployeeId(event.target.value);
    };

    const ApplyButton = async (val) => {
        setSearchVal('')
        setButton(getChipIdByDate(filterDate.from))
        const date = new Date(filterDate.from);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        setMonthYear({
            ...monthYear,
            empName: val.length ? val?.map(v => v?.employee_id) : ['']
        })

        let payLoad = {
            month: month,
            year: year,
            searchString: '',
            employeeId: val.length ? val?.map(v => v?.employee_id) : [],
            pageCount: data.pageCount,
            numPerPage: data.pageSize
        }
        dispatch(getSalaryReportForBankAction(payLoad, (response, resData) => {
            if (response === 200) {
                setSalaryReportForBankData(resData.data)
            }
        }))

        handleFilter(false)
    };
    console.log("monthYeardfg", monthYear);

    const clearButton = (e) => {
        setSearchVal('')
        setButton('4')
        const currentDate = new Date();
        handleFilter(false)
        setFilterDate({ from: defaultFrom })
        setEmployeeId('')
        let payLoad = {
            employeeId: [],
            month: month,
            year: year,
            pageCount: 0,
            numPerPage: data.pageSize
        }

        dispatch(getSalaryReportForBankAction(payLoad, (response, resData) => {
            if (response === 200) {
                setSalaryReportForBankData(resData.data)
                setSalaryReportForBankDataRows(resData.numRows)
            }
        }))
    }

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
    const monthChips = [
        { id: '1', label: thirdPrevMonth },
        { id: '2', label: secondPrevMonth },
        { id: '3', label: firstPrevMonth },
        { id: '4', label: PrevMonth },
    ];
    const getChipIdByDate = (dateValue) => {
        if (!dateValue) return '';
        const chipLabel = moment(dateValue).format('MMM YYYY');
        const matchedChip = monthChips.find((chip) => chip.label === chipLabel);
        return matchedChip?.id || '';
    };

    const getStartAndEndDate = (monthName, year) => {
        const monthMap = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        const monthNumber = monthMap[monthName.toLowerCase()];
        const startDate = new Date(year, monthNumber, 1);
        const endDate = new Date(year, monthNumber + 1, 0);
        const count = monthNumber + 1
        console.log(count, 'monthcount');
        return { startDate, endDate, count };
    }

    const handlePreviousMonthClick = (datas, btn) => {
        setSearchVal('')
        console.log(data1, 'sadsda')
        const month = datas.split(' ')[0];
        const year = datas.split(' ')[1];
        const { startDate, endDate, count } = getStartAndEndDate(month, year)
        console.log(startDate, count, 'startdateee');
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const date = new Date(filterDate.month_year);
        setButton(btn)
        setData({ ...data, pageCount: 0 })

        let payLoad = {
            month: count,
            year: year,
            employeeId: employeeId ? employeeId : '',
            pageCount: 0,
            numPerPage: data.pageSize
        }

        data1.datas = payLoad
        data1.btn = btn

        dispatch(getSalaryReportForBankAction(payLoad, (response, resData) => {
            if (response === 200) {
                setSalaryReportForBankData(resData.data)
            }
        }))
    }
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__salary__salary_report_for_bank', 'can_export')
    const handleExport = async () => {
        if (!reportExport) return;
        let formData = {
            employeeId: '',
            month: month,
            year: year,
            searchString: searchVal,
            exportData: true
        }

        const { data: resData } = await customFetch(
            API_URLS.SALARY_REPORT_FOR_BANK,
            'POST',
            formData
        );

        const exportRows = Array.isArray(resData?.data) ? generateRows(resData.data) : [];
        const columnHeaders = finalColumns.map(column => column.headerName);
        const rows = exportRows?.map(row => finalColumns.map(column => row[column.field] || '-'));

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += columnHeaders.join(",") + "\n";
        csvContent += rows.map(row => row.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", 'Salary Report For Bank' + ".csv");
        document.body.appendChild(link);
        link.click();
    }

    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Salary Report For Bank </title>
            </Helmet>

            <Dialog
                open={columnDialogOpen}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                        return;
                    }
                    handleCloseColumnDialog();
                }}
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: '96vw', sm: 620 },
                    },
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Customize Columns</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Tooltip title='Add' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                                <IconButton onClick={handleOpenDynamicPropDialog} size="small">
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            <IconButton onClick={handleCloseColumnDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Drag and drop to reorder columns. Toggle switches to show/hide columns.
                    </Typography>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="columns" direction="vertical">
                            {(provided) => (
                                <Box {...provided.droppableProps} ref={provided.innerRef}>
                                    {editableColumns.map((column, index) => {
                                        const draggableId = column.dragId || (column.id ? `drag-${column.id}` : `drag-fallback-${index}`);

                                        return (
                                            <Draggable
                                                key={draggableId}
                                                draggableId={draggableId}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Paper
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        elevation={snapshot.isDragging ? 4 : 1}
                                                        style={provided.draggableProps.style}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            p: 1,
                                                            mb: 0.75,
                                                            gap: 0.75,
                                                            bgcolor: snapshot.isDragging ? 'grey.100' : 'background.paper',
                                                            border: '1px solid',
                                                            borderColor: 'grey.200',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Box {...provided.dragHandleProps} sx={{ mr: 1, display: 'flex', alignItems: 'center', cursor: 'grab' }}>
                                                            <DragIndicatorIcon color="action" />
                                                        </Box>

                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={column.isVisible === 1}
                                                                    onChange={handleVisibilityChange(index)}
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                            }
                                                            label=""
                                                            sx={{ mr: 1 }}
                                                        />

                                                        <TextField
                                                            value={column.columnKey}
                                                            onChange={handleColumnNameChange(index)}
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={false}
                                                            sx={{
                                                                flex: 1,
                                                                minWidth: { xs: 110, sm: 150, md: 180 },
                                                                maxWidth: { xs: '52vw', sm: '50vw', md: '42vw' }
                                                            }}
                                                        />

                                                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1, minWidth: 50 }}>
                                                            Order: {index + 1}
                                                        </Typography>
                                                    </Paper>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseColumnDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveColumns}
                        variant="contained"
                        color="primary"
                        disabled={isSaving}
                        startIcon={<SaveIcon />}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dynamicPropOpen}
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
                    handleCloseDynamicPropDialog();
                }}
                maxWidth="md"
                fullWidth
            >
                <NewDynamicProperties
                    type='proDynamicNewForm'
                    handleClose={handleCloseDynamicPropDialog}
                    dynamicProp={handleDynamicFieldAdd}
                    variation='bankReport'
                    pageType='salaryColumn'
                />
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
                        Salary Report For Bank
                    </Typography>

                    {/* Right: Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Month buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: '20px', p: '3px' }}>
                            {monthChips.map((m) => (
                                <Chip
                                    key={m.id}
                                    label={m.label}
                                    size='small'
                                    clickable
                                    onClick={() => {
                                        handlePreviousMonthClick(m.label, m.id);
                                        setButton(m.id);
                                    }}
                                    sx={{
                                        fontWeight: button === m.id ? 600 : 400,
                                        fontSize: '0.75rem',
                                        height: 26,
                                        bgcolor: button === m.id ? 'primary.main' : 'transparent',
                                        color: button === m.id ? '#fff' : 'text.secondary',
                                        '&:hover': {
                                            bgcolor: button === m.id ? 'primary.dark' : '#e0e0e0',
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        <CommonSearch
                            searchVal={searchVal}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                        />

                        <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                            {/* <IconButton size='small'> */}
                                <CommonFilter
                                    month_year={filterDate.from}
                                    count={count}
                                    handleChange={handleChange}
                                    handleClose={handleFilter}
                                    open={filterOpen}
                                    monthYear={monthYear}
                                    clearButton={clearButton}
                                    ApplyButton={ApplyButton}
                                    userFilter={true}
                                    handleSelectChange={handleSelectChange}
                                    shouldFetchData={true}
                                />
                            {/* </IconButton> */}
                        </Tooltip>

                        <Tooltip title='Customize Columns' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                            <IconButton size='small' onClick={handleOpenColumnDialog}>
                                <SettingsIcon sx={{ fontSize: 20 }} />
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
                            rows={rowssTest}
                            columns={finalColumns}
                            pageSizeOptions={[20, 50, 100]}
                            paginationMode='server'
                            density='compact'
                            disableRowSelectionOnClick
                            disableExtendRowFullWidth
                            rowCount={salaryReportForBankCount ?? 0}
                            paginationModel={{ page: data.pageCount, pageSize: data.pageSize }}
                            onPaginationModelChange={(model) => {
                                if (model.page !== data.pageCount) handlePageChange(model.page);
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
};

export default SalaryReportForBank;