import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CashInHandDetails,
    CashInHandDetailsByTransactionEntriesAction,
} from 'redux/actions/cash_box_actions';
import {
    Chip,
    Grid,
    Stack,
    Typography,
    Card,
    CardContent,
    IconButton,
    Box,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import moment from 'moment';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { cellStyle } from 'utils/pageSize';
import { titleURL } from 'http-common';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { useCustomFetch } from 'utils/useCustomFetch'
import API_URLS from '../../../utils/customFetchApiUrls';
import apiCalls from 'utils/apiCalls';


export default function CashHand() {
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
      } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    const customFetch = useCustomFetch()
    const theme = useTheme()
    const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl'))

    const {
        cashBoxReducer: {
            cash_box_cashInHandDetails,
            cashIn_hand_details_byTransactions,
            cash_box_cashInBankCash
        },
    } = useSelector((state) => state);

    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const current_date = getCurrentDate();

    const [filterOpen, setFilterOpen] = useState(false);
    const [transactionEntryClicked, setTransactionEntryClicked] = useState(false);
    const [selectedAccountDetails, setSelectedAccountDetails] = useState(false);
    const [filter, setFilter] = useState({
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD')
    });
    const [leftSideTablePagination, setLeftSideTablePagination] = useState({
        page: 0,
        pageSize: 20
    })
    const [rightSideTablePagination, setRightSideTablePagination] = useState({
        page: 0,
        pageSize: 20
    })
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null)

    const columns = [
        {
            field: 'accountName',
            title: 'Particular',
            width: '20%',
        },
        {
            field: 'accountBalance',
            title: 'Closing Balance',
            render: (rowData) => (
                <div
                    style={{
                        textAlign: 'right',
                        minWidth: '60px',
                        maxWidth: '100px',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {rowData.accountBalance?.toFixed(2)}
                </div>
            )
        },
        {
            field: 'total_transactions_per_account',
            title: 'No of Entries',
            width: '10%',
            render: (rowData) => (
                <Typography
                    sx={{
                        color:
                            rowData.total_transactions_per_account > 0
                                ? '#1976d2'
                                : 'text.secondary',
                    }}
                >
                    {rowData.total_transactions_per_account}
                </Typography>
            ),
        }
        
    ];

    const [ledgerView, setLedgerView] = useState(null); // { accountId, accountName }

    const isDebit = (row) => ['Receipt', 'Pay In', 'Advance Received'].includes(row.type);

    const transactionColumns = [
        {
            title: 'Date',
            field: 'transaction_date',
            render: (rowData) => rowData.transaction_date ? moment(rowData.transaction_date).format('DD/MM/YYYY') : '',
            cellStyle: { fontSize: cellStyle.fontSize, width: 90 },
        },
        {
            title: 'Type',
            field: 'type',
            cellStyle: { fontSize: cellStyle.fontSize, width: 80 },
        },
        {
            title: 'Particular',
            field: 'particulars',
            render: (rowData) => {
                if (rowData._isOBCB) return <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{rowData.particulars}</Typography>;
                const ledgerName = rowData.contraAccountName || rowData.particulars;
                const ledgerId = rowData.contraAccountId;
                return ledgerId ? (
                    <Typography
                        sx={{ fontSize: 13, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={(e) => { e.stopPropagation(); setLedgerView({ accountId: ledgerId, accountName: ledgerName }); }}
                    >
                        {ledgerName}
                    </Typography>
                ) : <Typography sx={{ fontSize: 13 }}>{ledgerName || '-'}</Typography>;
            },
        },
        {
            title: 'Ref #',
            field: 'receipt_number',
            cellStyle: { fontSize: cellStyle.fontSize, width: 90 },
        },
        {
            title: 'Debit',
            field: 'debit',
            render: (rowData) => {
                if (rowData._isOBCB) return rowData._obcbDebit ? <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#2e7d32' }}>₹{Number(rowData._obcbDebit).toLocaleString('en-IN')}</Typography> : '';
                const val = Number(rowData.debit) || (isDebit(rowData) ? Number(rowData.amount) || 0 : 0);
                return val > 0 ? <Typography sx={{ fontSize: 13, color: '#2e7d32' }}>₹{val.toLocaleString('en-IN')}</Typography> : '';
            },
            cellStyle: { textAlign: 'right', paddingRight: 10, fontSize: cellStyle.fontSize, width: 100 },
            headerStyle: { textAlign: 'right', paddingRight: 10 },
        },
        {
            title: 'Credit',
            field: 'credit',
            render: (rowData) => {
                if (rowData._isOBCB) return rowData._obcbCredit ? <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#d32f2f' }}>₹{Number(rowData._obcbCredit).toLocaleString('en-IN')}</Typography> : '';
                const val = Number(rowData.credit) || (!isDebit(rowData) ? Number(rowData.amount) || 0 : 0);
                return val > 0 ? <Typography sx={{ fontSize: 13, color: '#d32f2f' }}>₹{val.toLocaleString('en-IN')}</Typography> : '';
            },
            cellStyle: { textAlign: 'right', paddingRight: 10, fontSize: cellStyle.fontSize, width: 100 },
            headerStyle: { textAlign: 'right', paddingRight: 10 },
        },
        {
            title: 'Balance',
            field: '_runningBalance',
            render: (rowData) => {
                const bal = rowData._runningBalance;
                if (bal == null) return '';
                return <Typography sx={{ fontSize: 13, fontWeight: rowData._isOBCB ? 600 : 400 }}>₹{Number(bal).toLocaleString('en-IN')}</Typography>;
            },
            cellStyle: { textAlign: 'right', paddingRight: 10, fontSize: cellStyle.fontSize, width: 110 },
            headerStyle: { textAlign: 'right', paddingRight: 10 },
        },
    ];

    useEffect(() => {
        const payload = {
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            location_id: headerLocationId,
            pageCount: leftSideTablePagination.page,
            numPerPage: leftSideTablePagination.pageSize,
            accountType: selectedCard
        };
          apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, 
        dispatch(CashInHandDetails(payload,headerLocationId, setModalTypeHandler, setLoaderStatusHandler)));
    }, [leftSideTablePagination.page, leftSideTablePagination.pageSize, headerLocationId]);

    useEffect(() => {
        const payload1 = {
            account_id: null,
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            pageCount: rightSideTablePagination.page,
            numPerPage: rightSideTablePagination.pageSize,
            accountType: selectedCard,
            location_id: headerLocationId,
        };
          apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(CashInHandDetailsByTransactionEntriesAction(payload1)));
        setSelectedAccountDetails(true);
    }, [rightSideTablePagination.page, rightSideTablePagination.pageSize, headerLocationId])

    const bankAmount = cash_box_cashInHandDetails?.totalBankBalance || 0;
    const cashAmount = cash_box_cashInHandDetails?.totalCashBalance || 0;

    // Build transaction data with OB, running balance, and CB
    const processedTransactions = React.useMemo(() => {
        const raw = cashIn_hand_details_byTransactions?.res || [];
        if (raw.length === 0) return [];

        // Get OB from selected account(s) on left panel
        const leftData = cash_box_cashInHandDetails?.data || [];
        let openingBalance = 0;
        if (selectedAccountDetails && selectedAccountDetails.accountId) {
            const acct = leftData.find(a => a.accountId === selectedAccountDetails.accountId);
            openingBalance = acct ? Number(acct.openingBalance || 0) : 0;
        } else {
            openingBalance = leftData.reduce((sum, a) => sum + Number(a.openingBalance || 0), 0);
        }

        const rows = [];

        // Opening Balance row
        rows.push({
            _isOBCB: true,
            particulars: 'Opening Balance',
            _runningBalance: openingBalance,
            _obcbDebit: openingBalance >= 0 ? openingBalance : null,
            _obcbCredit: openingBalance < 0 ? Math.abs(openingBalance) : null,
        });

        // Transaction rows with running balance
        let runBal = openingBalance;
        for (const row of raw) {
            const debitVal = Number(row.debit) || (isDebit(row) ? Number(row.amount) || 0 : 0);
            const creditVal = Number(row.credit) || (!isDebit(row) ? Number(row.amount) || 0 : 0);
            runBal = runBal + debitVal - creditVal;
            rows.push({ ...row, _runningBalance: runBal });
        }

        // Closing Balance row
        rows.push({
            _isOBCB: true,
            particulars: 'Closing Balance',
            _runningBalance: runBal,
            _obcbDebit: runBal >= 0 ? runBal : null,
            _obcbCredit: runBal < 0 ? Math.abs(runBal) : null,
        });

        return rows;
    }, [cashIn_hand_details_byTransactions, cash_box_cashInHandDetails, selectedAccountDetails]);

    const handleChange = async (event) => {
        const { name, value } = event.target
        setFilter((prev) => ({ ...prev, [name]: moment(value).format('YYYY-MM-DD') }))
    };

    const handleTransactionEntriesClick = async (data) => {
        const payload1 = {
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            location_id: headerLocationId,
            pageCount: 0,
            numPerPage: leftSideTablePagination.pageSize,
            accountType: selectedCard
        };
          apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(CashInHandDetails(payload1,headerLocationId, setModalTypeHandler, setLoaderStatusHandler)));
        const payload2 = {
            account_id: data.accountId,
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            accountType: selectedCard || data.parentAccountName,
            pageCount: 0,
            numPerPage: rightSideTablePagination.pageSize,
            location_id: headerLocationId
        };
          apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(CashInHandDetailsByTransactionEntriesAction(payload2)));
        setTransactionEntryClicked(true)
        setLeftSideTablePagination((prev) => ({ ...prev, page: 0 }))
        setRightSideTablePagination((prev) => ({ ...prev, page: 0 }))
    };

    const ApplyButton = () => {

        if (filter.from !== null || filter.to !== null) {
            const payload = {
                fromDate: moment(filter.from).format('YYYY-MM-DD'),
                toDate: moment(filter.to).format('YYYY-MM-DD'),
                location_id: headerLocationId,
                pageCount: 0,
                numPerPage: leftSideTablePagination.pageSize,
                accountType: selectedCard
            };
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler, dispatch(CashInHandDetails(payload, setModalTypeHandler, setLoaderStatusHandler)));

            const payload1 = {
                account_id: null,
                fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
                toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
                accountType: selectedCard,
                pageCount: 0,
                numPerPage: rightSideTablePagination.pageSize,
                location_id: headerLocationId
            };
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(CashInHandDetailsByTransactionEntriesAction(payload1))
            );

            setFilterOpen(false);
            setTransactionEntryClicked(false)

        }
    };

    const clearButton = () => {
        setFilter({
            from: moment().format('YYYY-MM-DD'),
            to: moment().format('YYYY-MM-DD')
        })
        const payload = {
            fromDate: moment().format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
            location_id: headerLocationId,
            pageCount: 0,
            numPerPage: leftSideTablePagination.pageSize,
            accountType: selectedCard
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(CashInHandDetails(payload, setModalTypeHandler, setLoaderStatusHandler))
        );
        const payload1 = {
            account_id: null,
            fromDate: moment().format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
            accountType: selectedCard,
            pageCount: 0,
            numPerPage: rightSideTablePagination.pageSize,
            location_id: headerLocationId
        };
        dispatch(CashInHandDetailsByTransactionEntriesAction(payload1));

        setFilterOpen(false);
    };

    const handleReloadEntries = () => {
        const payload = {
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            location_id: headerLocationId,
            pageCount: 0,
            numPerPage: leftSideTablePagination.pageSize,
            accountType: selectedCard
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(CashInHandDetails(payload, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        );

        const payload1 = {
            account_id: null,
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            accountType: selectedCard,
            pageCount: 0,
            numPerPage: rightSideTablePagination.pageSize,
            location_id: headerLocationId
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(CashInHandDetailsByTransactionEntriesAction(payload1))
        );
        setTransactionEntryClicked(false)
        setSelectedRowId(null)
    };

    const handleExportOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleCSVExport = async() => {
         if (!selectedAccountDetails) {
        alert("Please select an account before exporting");
        return;
    }
        const payload = {
            account_id: selectedAccountDetails?.accountId || null,
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            accountType: selectedCard || selectedAccountDetails.parentAccountName,
            pageCount: 0,
            numPerPage: rightSideTablePagination.pageSize,
            location_id: headerLocationId,
            exportOption : 'true'
            };
        const { data } = await customFetch(
            API_URLS.CASH_IN_HAND_DETAILS,
            'POST',
            payload
        );

        if(!data || !data.res){
            alert("No Records Found")
            return
        }

        const columnHeaders = transactionColumns.map(column => column.title)
        

        const escapeCSV = (val, field) => {
            if (val == null) return "";

            const f = field.toLowerCase();

            if (f.includes("date")) {
                return `"${moment(val).format("DD/MM/YYYY")}"`;
            }

            if (f.includes("time")) {
                return `"${moment(val).format("DD/MM/YYYY")}"`;
            }

            // Format amount field
            if (f.includes("amount")) {
                const num = Number(val);
                const formatted = num.toLocaleString("en-IN");  // Indian number format
                return `"${formatted}"`;
            }

            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };


        const rows = data.res.map(row => transactionColumns.map(column => escapeCSV(row[column.field], column.field)))

        let csvContent = columnHeaders.join(",") + "\r\n"
        csvContent += rows.map(row => row.join(",")).join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "Cash and Bank Transaction" + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleCardChange = (card) => {
        setSelectedCard(card)
        setLeftSideTablePagination((prev) => ({ ...prev, page: 0 }))
        setRightSideTablePagination((prev) => ({ ...prev, page: 0 }))

        const payload = {
            fromDate: moment(filter.from).format('YYYY-MM-DD'),
            toDate: moment(filter.to).format('YYYY-MM-DD'),
            location_id: headerLocationId,
            pageCount: 0,
            numPerPage: leftSideTablePagination.pageSize,
            accountType: card
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(CashInHandDetails(payload, setModalTypeHandler, setLoaderStatusHandler))
        );

        const payload1 = {
            account_id: null,
            fromDate: filter.from !== null ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to !== null ? moment(filter.to).format('YYYY-MM-DD') : null,
            accountType: card,
            pageCount: 0,
            numPerPage: rightSideTablePagination.pageSize,
            location_id: headerLocationId
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(CashInHandDetailsByTransactionEntriesAction(payload1))
        );
    }

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Cash In Hand </title>
            </Helmet>
            <style>
                {`
                ::-webkit-scrollbar-button {
                    display : none
                }
                ::-webkit-scrollbar {
                    width : 10px
                }
                ::-webkit-scrollbar-thumb {
                    background-color : #888;
                    border-radius : 10px
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color : #555
                }
                    .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root {
                    border-bottom: none !important;
                };
            `}
            </style>
            <Grid container spacing={2}>
                <Grid size={selectedAccountDetails ? 5 : 12}>
                    <MaterialTable
                        title='Cash In Hand'
                        columns={columns}
                        data={cash_box_cashInHandDetails?.data || []}
                        totalCount={cash_box_cashInHandDetails?.numRows || 0}
                        onRowClick={(event, rowData) => {
                            if (rowData.total_transactions_per_account > 0) {
                                handleTransactionEntriesClick(rowData);
                                setSelectedAccountDetails(rowData);
                                setSelectedRowId(rowData.accountId);
                            }
                        }}
                        options={{
                            pageSize: leftSideTablePagination.pageSize,
                            pageSizeOptions: [20, 50, 100],
                            filtering: false,
                            actionsColumnIndex: -1,
                            paging: true,
                            search: false,
                            maxBodyHeight: !isExtraLarge ? 'calc(100vh - 250px)' : 'calc(100vh - 228px)',
                            minBodyHeight: !isExtraLarge ? 'calc(100vh - 250px)' : 'calc(100vh - 228px)',
                            // overflowY: 'visible',
                            rowStyle: (rowData) => ({
                                backgroundColor:
                                    rowData.accountId === selectedRowId
                                        ? '#f0f0f0' // light grey
                                        : 'inherit',
                                cursor: rowData.total_transactions_per_account > 0 ? 'pointer' : 'default',
                            }),                            
                        }}
                        page={leftSideTablePagination.page}
                        onPageChange={(page) => setLeftSideTablePagination((prev) => ({ ...prev, page: page }))}
                        onRowsPerPageChange={(size) => setLeftSideTablePagination((prev) => ({ ...prev, pageSize: size }))}
                        components={{
                            Toolbar: (props) => (
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ width: '85%' }}>
                                            <MTableToolbar {...props} />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: -1.5,
                                                    ml: 1.5,
                                                    color: '#757575',
                                                }}
                                            >
                                                {`From Date : ${filter.from ? moment(filter.from).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}`}
                                                <br />
                                                {`To Date : ${filter.to ? moment(filter.to).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}`}
                                            </Typography>
                                        </div>
                                        <div
                                            style = {{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems : 'center',
                                                marginLeft :'60px'
                                            }}
                                        >
                                            <Grid
                                            mb={'50px'}
                                            >
                                                <CommonFilter
                                                    financialYear={false}
                                                    fromTo={true}
                                                    from={filter.from}
                                                    to={filter.to}
                                                    count={0}
                                                    open={filterOpen}
                                                    locationFilter={false}
                                                    type='request'
                                                    pageType='cashinhand'
                                                    noEmpFilter={true}
                                                    handleChange={handleChange}
                                                    handleClose={(data) => setFilterOpen(data)}
                                                    ApplyButton={ApplyButton}
                                                    clearButton={clearButton}
                                                />
                                            </Grid>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row', md: 'row' },
                                                    flexWrap: 'wrap',
                                                    gap: 1.5,
                                                    alignItems: 'center',
                                                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                                    mt: { xs: 1, md: 1, sm: 1 },
                                                    mb: { xs: 1, md: 1, sm: 1 },
                                                    mr: 1.25,
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                }}
                                            >
                                                <Chip
                                                    sx={{
                                                        height: { xs: '38px', sm: '45px', md: '50px' },
                                                        width: { xs: '140px', sm: '160px', md: '160px' },
                                                        borderRadius: '10px',
                                                        boxShadow: 2,
                                                        bgcolor: selectedCard === 'Bank' ? '#b2d7faff' : '#e3f2fd',
                                                        color: '#0d47a1',
                                                        position: 'relative',
                                                        pl: 5,
                                                        mr: { xs: 0, lg: 1.25 },
                                                        cursor: selectedCard === null || selectedCard === 'Bank' ? 'pointer' : 'default'
                                                    }}
                                                    label={
                                                        <Box sx={{ width: '100%', textAlign: 'center' }}>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{  fontSize: { xs: '10px', sm: '11px' }, fontWeight: 'bold' }}
                                                            >
                                                                Bank
                                                            </Typography>
                                                            <Typography
                                                                variant='h6'
                                                                sx={{
                                                                    fontSize: { xs: '10px', sm: '11px' },
                                                                    lineHeight: '10px',
                                                                    fontWeight: '700',
                                                                    mt: '4px',
                                                                }}
                                                            >
                                                                ₹ {bankAmount.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    icon={
                                                        <AccountBalanceIcon
                                                            sx={{ position: 'absolute', left: 12 }}
                                                        />
                                                    }
                                                    onClick={() => {
                                                         handleCardChange(selectedCard === 'Bank' ? null : 'Bank');
                                                        // if(selectedCard === null){
                                                        //     handleCardChange('Bank')
                                                        // }
                                                        // else if(selectedCard === 'Bank'){
                                                        //     handleCardChange(null)
                                                        // }
                                                    }}
                                                />

                                                <Chip
                                                    sx={{
                                                        height: { xs: '38px', sm: '45px', md: '50px' },
                                                        width: { xs: '140px', sm: '160px', md: '160px' },
                                                        borderRadius: '10px',
                                                        boxShadow: 2,
                                                        bgcolor: selectedCard === 'Cash-in-hand' ? '#b9e0bdff' : '#e8f5e9',
                                                        color: '#1b5e20',
                                                        position: 'relative',
                                                        pl: 5,
                                                        cursor: selectedCard === null || selectedCard === 'Cash-in-hand' ? 'pointer' : 'default'
                                                    }}
                                                    label={
                                                        <Box sx={{ width: '100%', textAlign: 'center' }}>
                                                            <Typography
                                                                variant='body2'
                                                                sx={{   fontSize: { xs: '10px', sm: '11px' }, fontWeight: 'bold' }}
                                                            >
                                                                Cash
                                                            </Typography>
                                                            <Typography
                                                                variant='h6'
                                                                sx={{
                                                                    fontSize: { xs: '10px', sm: '11px' },
                                                                    lineHeight: '10px',
                                                                    fontWeight: '700',
                                                                    mt: '4px',
                                                                }}
                                                            >
                                                                ₹ {cashAmount.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    icon={
                                                        <LocalAtmIcon sx={{ position: 'absolute', left: 12 }} />
                                                    }
                                                    onClick={() => {
                                                        handleCardChange(selectedCard === 'Cash-in-hand' ? null : 'Cash-in-hand');
                                                        // if(selectedCard === null){
                                                        //     handleCardChange('Cash-in-hand')
                                                        // }
                                                        // else if(selectedCard === 'Cash-in-hand'){
                                                        //     handleCardChange(null)
                                                        // }
                                                    }}
                                                />
                                            </Box>
                                        </div>
                                    </div>
                                </div>
                            ),
                        }}
                    />
                </Grid>

                <Grid size={7}>

                    <MaterialTable
                        title={
                            transactionEntryClicked ? (
                            <Box sx={{ width: '100%' }}>
                                <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ mt: 1, mb: 1 }}
                                >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {['Bank Accounts', 'Bank'].includes(selectedAccountDetails?.parentAccountName) ? (
                                    <AccountBalanceIcon sx={{ color: '#0d47a1' }} />
                                    ) : (
                                    <LocalAtmIcon sx={{ color: '#1b5e20' }} />
                                    )}
                                    <Typography variant="h6">
                                    Transactions for {selectedAccountDetails?.accountName}
                                    </Typography>
                                </Stack>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={handleReloadEntries}>
                                    <RestartAltIcon />
                                    </IconButton>
                                </Box>
                                </Stack>
                            </Box>
                            ) : "Transaction Entries"
                        }
                        columns={transactionColumns}
                        data={processedTransactions}
                        totalCount={cashIn_hand_details_byTransactions.numRows || 0}
                        options={{
                            pageSize: rightSideTablePagination.pageSize,
                            pageSizeOptions: [20, 50, 100],
                            paging: true,
                            exportButton: true,
                            exportMenu: [
                                {
                                label: 'Export CSV',
                                exportFunc: handleCSVExport,
                                },
                            ],
                            search: false,
                            maxBodyHeight: 'calc(100vh - 200px)',
                            minBodyHeight: 'calc(100vh - 200px)',
                            headerStyle: {
                                backgroundColor: transactionEntryClicked
                                    ? ['Bank Accounts', 'Bank'].includes(selectedAccountDetails?.parentAccountName)
                                        ? '#e3f2fd'
                                        : '#e8f5e9'
                                    : '#f5f5f5',
                                color: '#757576',
                                fontWeight: 'bold',
                            },
                            rowStyle: (rowData) => ({
                                backgroundColor: rowData._isOBCB ? '#F5F5F5'
                                    : rowData.parentAccountName === 'Cash-in-hand' ? '#e8f5e9' : '#e3f2fd',
                                fontWeight: rowData._isOBCB ? 700 : 400,
                            }),
                        }}
                        components={{
                            Toolbar: (props) => (
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                        <MTableToolbar {...props} />
</div>
                                        <div>
                                        {props.actions && props.actions.map((action, i) => (
                                            <props.components.Action
                                            key={i}
                                            action={action}
                                            data={props.data}
                                            size="small"
                                            />
                                        ))}
                                        </div>

                                        {/* <IconButton onClick={handleExportOpen}>
                                            <FileDownloadIcon />
                                        </IconButton> */}

                                        {/* <Menu
                                        id='simple-menu'
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={() => setAnchorEl(null)}
                                            keepMounted
                                            anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                            }}
                                        >
                                            <MenuItem onClick={handleCSVExport}>{'Export CSV'}</MenuItem>
                                        </Menu> */}
                                    </div>
                                </div>
                            )
                        }}
                        page={rightSideTablePagination.page}
                        onPageChange={(page) => setRightSideTablePagination((prev) => ({ ...prev, page: page }))}
                        onRowsPerPageChange={(size) => setRightSideTablePagination((prev) => ({ ...prev, pageSize: size }))}
                    />
                </Grid>

            </Grid>

            {/* Inline Ledger View */}
            {ledgerView && (
                <Card sx={{ mt: 2, border: '2px solid #1976d2', borderRadius: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: '#E3F2FD' }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0d47a1' }}>
                                Ledger: {ledgerView.accountName}
                            </Typography>
                            <IconButton size="small" onClick={() => setLedgerView(null)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <LedgerInlineView
                            accountId={ledgerView.accountId}
                            accountName={ledgerView.accountName}
                            filter={filter}
                            headerLocationId={headerLocationId}
                        />
                    </CardContent>
                </Card>
            )}
        </>
    );
}

// Inline ledger component — loads transactions for a specific account
function LedgerInlineView({ accountId, accountName, filter, headerLocationId }) {
    const dispatch = useDispatch();
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const payload = {
            account_id: accountId,
            fromDate: filter.from ? moment(filter.from).format('YYYY-MM-DD') : null,
            toDate: filter.to ? moment(filter.to).format('YYYY-MM-DD') : null,
            accountType: null,
            pageCount: 0,
            numPerPage: 100,
            location_id: headerLocationId,
        };
        dispatch(CashInHandDetailsByTransactionEntriesAction(payload))
            .then?.(() => setLoading(false))
            .catch?.(() => setLoading(false));
        // Use a direct API call instead to avoid overwriting the main table's data
        import('../../../services/cash_box_services').then(({ default: CashBox }) => {
            CashBox.CashInHandDetailsByTransactionEntries(payload).then((res) => {
                setData(res.data?.res || []);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, [accountId, filter, headerLocationId]);

    const columns = [
        { title: 'Date', field: 'transaction_date', render: (r) => r.transaction_date ? moment(r.transaction_date).format('DD/MM/YYYY') : '' },
        { title: 'Type', field: 'type' },
        { title: 'Particular', field: 'particulars', render: (r) => r.contraAccountName || r.particulars || '-' },
        { title: 'Ref #', field: 'receipt_number' },
        {
            title: 'Debit', field: 'debit',
            render: (r) => { const v = Number(r.debit) || 0; return v > 0 ? <span style={{ color: '#2e7d32' }}>₹{v.toLocaleString('en-IN')}</span> : ''; },
            cellStyle: { textAlign: 'right' }, headerStyle: { textAlign: 'right' },
        },
        {
            title: 'Credit', field: 'credit',
            render: (r) => { const v = Number(r.credit) || 0; return v > 0 ? <span style={{ color: '#d32f2f' }}>₹{v.toLocaleString('en-IN')}</span> : ''; },
            cellStyle: { textAlign: 'right' }, headerStyle: { textAlign: 'right' },
        },
    ];

    return (
        <MaterialTable
            title=""
            columns={columns}
            data={data}
            isLoading={loading}
            options={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50],
                paging: true,
                search: false,
                toolbar: false,
                maxBodyHeight: 350,
                headerStyle: { backgroundColor: '#F5F7FA', fontWeight: 'bold', color: '#555' },
            }}
        />
    );
}

