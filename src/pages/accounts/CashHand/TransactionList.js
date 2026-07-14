import { Box, Card, Chip, Drawer, Grid, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography, LinearProgress } from "@mui/material"
import moment from "moment"
import CommonSearch from "utils/commonSearch"
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getBankAndCashAccountsAction, getConsolidatedTotalAmountsAction, getTransactionListAction } from "redux/actions/cash_box_actions"
import PropTypes from "prop-types"
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import AccountList from "./AccountList"
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import apiCalls from "utils/apiCalls"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import ReportsService from "services/reports_services"

// No hardcoded type arrays — debit/credit determined by backend from accounting entries

const fmtAmt = (v) => v != null && v !== '' ? `₹${Number(v).toLocaleString('en-IN')}` : ''

const TransactionList = forwardRef((props, ref) => {

    const mediaQuery = window.matchMedia('(max-width: 1279px)')
    const dispatch = useDispatch()
    const {
        cashBoxReducer: { cashAndBankTransactionList, cashAndBankConsolidatedTotal, cashAndBankAccounts }
    } = useSelector(state => state)
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

    // Transaction-type chip is lifted to parent (NewCashInHand) so the filter dialog and the
    // right-panel chip row share a single source of truth. chipFullScreen is derived from it
    // (any non-'All' value puts us in full-screen chip view).
    const selectedChip = props.txnChip || 'All'
    const setSelectedChip = props.setTxnChip
    const chipFullScreen = selectedChip === 'All' ? null : selectedChip
    const [searchString, setSearchString] = useState('')
    const [ledgerView, setLedgerView] = useState(null)
    const [pagination, setPagination] = useState({
        pageCount: 0,
        numPerPage: 20,
        searchString: ''
    })
    const fetchRef = useRef(null)
    const [downloadAnchor, setDownloadAnchor] = useState(null)
    // Set synchronously when a refetch is scheduled and cleared from the action's
    // success callback. Prevents the stale-data flash that happened when the view
    // switched (e.g. to the Receipt/Payment chip) before the new fetch returned.
    const [loading, setLoading] = useState(false)

    // Reset chip + pagination on account selection change
    useEffect(() => {
        if(props.resetToAll){
            setSelectedChip('All')
            setPagination(prev => ({ ...prev, pageCount: 0 }))
            setLedgerView(null)
            props.setResetToAll(false)
        }
    }, [props.resetToAll])

    // Single data fetch — debounced 150ms to absorb cascading state changes
    // IMPORTANT: props.filter is in deps so date/payment/range changes trigger refetch
    const fetchData = useCallback(() => {
        if(cashAndBankAccounts.length === 0) return;

        const type = new Set(cashAndBankAccounts.map(d => d.type))
        const basePayload = {
            id: (type.has('Cash') && type.has('Bank')) || [...type].length === 0 ? null : cashAndBankAccounts.map(d => d.id),
            type: (type.has('Cash') && type.has('Bank')) || [...type].length === 0 ? null : [...type][0],
            chip: selectedChip,
            ...props.filter
        }
        if(props.selectedAccount !== null){
            basePayload.id = props.selectedAccount.id
            basePayload.type = props.selectedAccount.type
        }

        setLoading(true)

        if(fetchRef.current) clearTimeout(fetchRef.current)
        fetchRef.current = setTimeout(() => {
            const transactionPayload = { ...basePayload, searchString: pagination.searchString, pageCount: pagination.pageCount, numPerPage: pagination.numPerPage }
            dispatch(getTransactionListAction(transactionPayload, null, () => setLoading(false)))
            dispatch(getConsolidatedTotalAmountsAction(basePayload))
            fetchRef.current = null
        }, 150)
    }, [props.selectedAccount, selectedChip, pagination.pageCount, pagination.numPerPage, cashAndBankAccounts, props.filter])

    useEffect(() => {
        fetchData()
        return () => { if(fetchRef.current) clearTimeout(fetchRef.current) }
    }, [fetchData])

    const requestSearch = (event) => {
        const val = event.target.value
        setSearchString(val)
    }

    const cancelSearch = () => {
        setSearchString('')
    }

    // Filter apply/clear: fetch accounts respecting left panel chip (Cash/Bank/All)
    // Always reset pageCount so a smaller filtered set doesn't leave the user on an out-of-range page.
    const handleApplyFilter = (filter) => {
        setPagination(prev => ({ ...prev, pageCount: 0 }))
        dispatch(getBankAndCashAccountsAction({ chip: props.accountChip || 'All', searchString: '', from: filter.from, to: filter.to }))
    }

    const handleClearFilter = (filter) => {
        setPagination(prev => ({ ...prev, pageCount: 0 }))
        dispatch(getBankAndCashAccountsAction({ chip: props.accountChip || 'All', searchString: '', from: filter.from, to: filter.to }))
    }

    const handleExport = (format = 'csv') => {
        // if(cashAndBankAccounts.length === 0) return;
        const type = new Set(cashAndBankAccounts.map(d => d.type))
        const basePayload = {
            id: (type.has('Cash') && type.has('Bank')) || [...type].length === 0 ? null : cashAndBankAccounts.map(d => d.id),
            type: (type.has('Cash') && type.has('Bank')) || [...type].length === 0 ? null : [...type][0],
            chip: selectedChip,
            ...props.filter
        }
        if(props.selectedAccount !== null){
            basePayload.id = props.selectedAccount.id
            basePayload.type = props.selectedAccount.type
        }
        const transactionListPayload = {
            ...basePayload,
            searchString: '',
            pageCount: 0,
            numPerPage: cashAndBankTransactionList.count || 10000,
        }
        dispatch(getTransactionListAction(transactionListPayload, 'export', async(response) => {
            const res = await response
            const columns = [
                { title: 'Date', field: 'transactionDate' },
                { title: 'Type', field: 'type' },
                { title: 'Particular', field: 'particulars' },
                { title: 'Reference #', field: 'reference' },
                { title: 'Debit', field: 'debit' },
                { title: 'Credit', field: 'credit' },
            ]
            const finalData = res.map((r) => ({
                ...r,
                transactionDate: moment(r.transactionDate).format('DD/MM/YYYY'),
                reference: r.referenceNumber ?? r.receipt_number,
                debit: Number(r.debit) > 0 ? `₹${Number(r.debit).toLocaleString('en-IN')}` : '',
                credit: Number(r.credit) > 0 ? `₹${Number(r.credit).toLocaleString('en-IN')}` : '',
            }))
            const fileName = `Transaction ${props.selectedAccount?.name ?? 'All'}`
            if (format === 'pdf') {
                ExportPdf(columns, finalData, fileName)
            } else {
                ExportCsv(columns, finalData, fileName)
            }
        }))
    }

    useImperativeHandle(ref, () => ({
        handleApplyFilter,
        handleClearFilter,
        handleExport
    }))

    // OB always comes bundled with the transaction list response so OB and rows can never mismatch.
    // Falls back to derived value from accounts only if backend hasn't responded yet.
    const openingBalance = useMemo(() => {
        if (cashAndBankTransactionList.openingBalance != null) {
            return Number(cashAndBankTransactionList.openingBalance)
        }
        if (props.selectedAccount) {
            const acct = cashAndBankAccounts.find(a => a.id === props.selectedAccount.id)
            return Number(acct?.openingBalance ?? acct?.ob ?? 0)
        }
        return cashAndBankAccounts.reduce((sum, a) => sum + Number(a.openingBalance ?? a.ob ?? 0), 0)
    }, [cashAndBankTransactionList.openingBalance, cashAndBankAccounts, props.selectedAccount])

    // Build rows with OB, running balance, CB
    const processedRows = useMemo(() => {
        const raw = cashAndBankTransactionList.data || []
        if (raw.length === 0 && openingBalance === 0) return []

        // API returns DESC order — reverse for OB-forward running balance
        const sorted = [...raw].reverse()

        const rows = []
        // OB row
        rows.push({ _isOBCB: true, _label: 'Opening Balance', _balance: openingBalance })

        let runBal = openingBalance
        for (const row of sorted) {
            // Use backend debit/credit directly — no fallback inference
            const rowDebit = Number(row.debit) || 0
            const rowCredit = Number(row.credit) || 0
            runBal = runBal + rowDebit - rowCredit
            rows.push({ ...row, _debit: rowDebit, _credit: rowCredit, _balance: runBal })
        }

        // CB row
        rows.push({ _isOBCB: true, _label: 'Closing Balance', _balance: runBal })
        return rows
    }, [cashAndBankTransactionList.data, openingBalance])

    const type = new Set(cashAndBankAccounts.map(d => d.type))

    // Transaction notes and generic system values — NOT clickable as ledgers
    const SYSTEM_VALUES = new Set([
        'Sales Payment', 'Purchase Payment', 'Purchase Expense', 'Advance Received',
        'Vendor Advance', 'Receipt Advance Refund', 'Payment Advance Refund',
        'Pay(OUT) Entry', 'Pay(IN) Entry', 'Opening Balance', 'Journal Entry',
        'POS Invoice', '',
    ])

    // Payment method names — shown but not clickable as customer/vendor
    const PAYMENT_METHODS = new Set([
        'Online', 'Cash', 'Bank', 'UPI', 'Card', 'Cheque', 'NEFT / RTGS / IMPS',
        'Default-Cashbox', 'Cash-in-hand',
    ])

    const isClickableLedger = (name, row) => {
        if (!name) return false
        if (SYSTEM_VALUES.has(name)) return false
        // For customer/vendor rows — always clickable
        if (row.customer_id || row.supplier_id) return true
        // For Pay In/Out/Contra — particular is a ledger name if it's not a payment method
        if (!PAYMENT_METHODS.has(name)) return true
        return false
    }

    const handleParticularClick = (row) => {
        const name = row.particulars
        if (!name || !isClickableLedger(name, row)) return

        let contactId = null
        let contactType = null
        if (row.customer_id) {
            contactId = row.customer_id
            contactType = 'Customer'
        } else if (row.supplier_id) {
            contactId = row.supplier_id
            contactType = 'Supplier'
        } else if (['Receipt', 'Advance Received'].includes(row.type)) {
            contactType = 'Customer'
        } else if (['Payments', 'Vendor Advance'].includes(row.type)) {
            contactType = 'Supplier'
        }

        setLedgerView({
            accountName: name,
            contactId,
            contactType,
            contraAccountId: row.contraAccountId || null,
        })
    }

    const transactionCard = (
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <Grid container spacing={3} sx={{ p: 2, flexShrink: 0 }}>
                <Grid size={12}>
                    <Grid container display='flex' justifyContent='space-between' alignItems='center'>
                        <Grid>
                            <Grid container spacing={3} display='flex' justifyContent='flex-start' alignItems='center'>
                                {
                                    mediaQuery.matches ?
                                    <Grid>
                                        <Box sx={{ display: { lg: 'none' } }}>
                                                <IconButton onClick={() => props.setIsDrawerOpen(true)}>
                                                    <MenuIcon fontSize='small' />
                                                </IconButton>
                                                <Drawer open={props.isDrawerOpen} onClose={() => props.setIsDrawerOpen(false)}>
                                                    <AccountList setSelectedAccount={props.setSelectedAccount} filter={props.filter} setIsDrawerOpen ={props.setIsDrawerOpen} setResetToAll={props.setResetToAll} setFilterOpen={props.setFilterOpen} />
                                                </Drawer>
                                        </Box>
                                    </Grid>
                                    : ''
                                }

                                <Grid>
                                    <Box sx={{ display:'inline-flex', alignItems:'center' }}>
                                        <Typography textAlign='center' variant='h6'>{props.selectedAccount?.name ?? 'All'}</Typography>
                                        <Box sx={{ mx:1, width:4, height:4, borderRadius:'50%', bgcolor:'#94A3B8' }} />
                                        <Typography textAlign='center' color='text.secondary' variant='caption'>{props.selectedAccount ? props.selectedAccount.type : type.has('Cash') && type.has('Bank') ? 'Cash & Bank' : [...type][0]}</Typography>
                                        <Box sx={{ mx:1, width:4, height:4, borderRadius:'50%', bgcolor:'#94A3B8' }} />
                                        <Typography textAlign='center' variant='h6'>{`${cashAndBankTransactionList.count ?? 0} Entries`}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid>
                            <Grid container spacing={3} display='flex'>
                                <Grid>
                                    <Typography variant='h6'>{`Receipt: ₹ ${Number(cashAndBankConsolidatedTotal[0]?.receiptTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                </Grid>
                                <Grid>
                                    <Typography variant='h6'>{`Payment: ₹ ${Number(cashAndBankConsolidatedTotal[0]?.paymentTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid>
                            <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                                <Grid display='flex' justifyContent='center' alignItems='center' gap={3}>
                                    <Box>
                                        <Chip label='All' color='primary' variant={selectedChip === 'All' ? 'filled' : 'outlined'} onClick={() => {setSelectedChip('All'); setPagination((prev) => ({ ...prev, pageCount: 0 }))}} />
                                        &nbsp;
                                        <Chip label='Receipt' color='primary' variant={selectedChip === 'Receipt' ? 'filled' : 'outlined'} onClick={() => {setSelectedChip('Receipt'); setPagination((prev) => ({ ...prev, pageCount: 0 }))}} />
                                        &nbsp;
                                        <Chip label='Payment' color='primary' variant={selectedChip === 'Payment' ? 'filled' : 'outlined'} onClick={() => {setSelectedChip('Payment'); setPagination((prev) => ({ ...prev, pageCount: 0 }))}} />
                                        &nbsp;
                                        <Chip label='Transfers' color='primary' variant={selectedChip === 'Transfers' ? 'filled' : 'outlined'} onClick={() => {setSelectedChip('Transfers'); setPagination((prev) => ({ ...prev, pageCount: 0 }))}} />
                                        &nbsp;
                                        <Chip label='Others' color='primary' variant={selectedChip === 'Others' ? 'filled' : 'outlined'} onClick={() => {setSelectedChip('Others'); setPagination((prev) => ({ ...prev, pageCount: 0 }))}} />
                                        &nbsp;
                                        <Tooltip title='Download'>
                                            <span>
                                                <IconButton size='small' onClick={(e) => setDownloadAnchor(e.currentTarget)}>
                                                    <DownloadIcon fontSize='small' />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Menu anchorEl={downloadAnchor} open={Boolean(downloadAnchor)} onClose={() => setDownloadAnchor(null)}>
                                            <MenuItem onClick={() => { handleExport('pdf'); setDownloadAnchor(null) }}>Export PDF</MenuItem>
                                            <MenuItem onClick={() => { handleExport('csv'); setDownloadAnchor(null) }}>Export CSV</MenuItem>
                                        </Menu>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {loading && <LinearProgress />}
            <TableContainer sx={{ flex: 1, overflow: 'auto', px: 1 }}>
                       <Table stickyHeader aria-label="sticky table" size="small" sx={{ width: '100%' }} key={props.selectedAccount ? `tbl-${props.selectedAccount.id}` : 'tbl-all'}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Particular</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Ref #</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Debit</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Credit</TableCell>
                                    {props.selectedAccount && <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', textAlign: 'right' }}>Balance</TableCell>}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow style={{height: 'calc(100vh - 350px)'}}>
                                        <TableCell colSpan={props.selectedAccount ? 7 : 6} style={{ textAlign: 'center', color: '#999' }}>
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                ) : processedRows.length === 0 ? (
                                    <TableRow style={{height: 'calc(100vh - 350px)'}}>
                                        <TableCell colSpan={props.selectedAccount ? 7 : 6} style={{ textAlign: 'center' }}>
                                            No Transaction Found
                                        </TableCell>
                                    </TableRow>
                                ) : processedRows.map((row, idx) => {
                                    if (row._isOBCB) {
                                        return (
                                            <TableRow key={`obcb-${idx}`} sx={{ bgcolor: '#F5F7FA' }}>
                                                <TableCell colSpan={4}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{row._label}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'right' }}>
                                                    {row._balance >= 0 ? <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#2e7d32' }}>{fmtAmt(row._balance)}</Typography> : ''}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'right' }}>
                                                    {row._balance < 0 ? <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#d32f2f' }}>{fmtAmt(Math.abs(row._balance))}</Typography> : ''}
                                                </TableCell>
                                                {props.selectedAccount && <TableCell sx={{ textAlign: 'right' }}>
                                                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{fmtAmt(row._balance)}</Typography>
                                                </TableCell>}
                                            </TableRow>
                                        )
                                    }
                                    const particular = row.contraAccountName || row.particulars || row.company_name || row.ledgerName || ''
                                    // Contra IN + OUT entries share the same transactionId — using transactionId
                                    // alone as the React key produced collisions, and the reconciler kept
                                    // stale DOM rows from previous pages mounted on pagination. Compose a
                                    // unique key from id + type + position.
                                    return (
                                        <TableRow key={`${row.transactionId ?? 'x'}-${row.type ?? ''}-${idx}`} hover>
                                            <TableCell>
                                                <Typography sx={{fontSize: 12}}>{moment(row.transactionDate).format('DD/MM/YYYY')}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{fontSize: 12}}>{row.type}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {isClickableLedger(particular, row) ? (
                                                    <Typography
                                                        sx={{
                                                            fontSize: 12, fontWeight: 600,
                                                            color: '#1976d2', cursor: 'pointer',
                                                            '&:hover': { textDecoration: 'underline' },
                                                        }}
                                                        onClick={() => handleParticularClick(row)}
                                                    >
                                                        {particular}
                                                    </Typography>
                                                ) : (
                                                    <Typography sx={{ fontSize: 12, color: '#666' }}>
                                                        {particular || '-'}
                                                    </Typography>
                                                )}
                                                {/* Show payment method as secondary info for Pay In/Out */}
                                                {['Pay In', 'Pay Out', 'IN (Contra)', 'OUT (Contra)', 'Contra'].includes(row.type) && row.paymentMethod && (
                                                    <Typography sx={{ fontSize: 10, color: '#999' }}>{row.paymentMethod}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{fontSize: 12}}>{row.referenceNumber ?? row.receipt_number}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'right' }}>
                                                {row._debit > 0 && <Typography sx={{fontSize: 12, color: '#2e7d32'}}>{fmtAmt(row._debit)}</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'right' }}>
                                                {row._credit > 0 && <Typography sx={{fontSize: 12, color: '#d32f2f'}}>{fmtAmt(row._credit)}</Typography>}
                                            </TableCell>
                                            {props.selectedAccount && <TableCell sx={{ textAlign: 'right' }}>
                                                <Typography sx={{fontSize: 12}}>{fmtAmt(row._balance)}</Typography>
                                            </TableCell>}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <TablePagination
                        component='div'
                        sx={{ borderBottom: 'none !important' }}
                        count={cashAndBankTransactionList.count}
                        page={pagination.pageCount}
                        rowsPerPage={pagination.numPerPage}
                        rowsPerPageOptions={[20, 50, 100]}
                        showFirstButton
                        showLastButton
                        onPageChange={(event, page) => setPagination((prev) => ({ ...prev, pageCount: page }))}
                        onRowsPerPageChange={(event) => setPagination((prev) => ({ ...prev, numPerPage: parseInt(event.target.value, 10), pageCount: 0 }))}
                    />
                </Box>
        </Card>
    )

    // Full-screen chip filter view (Receipt / Payment / Transfers)
    if (chipFullScreen) {
        const chipLabel = chipFullScreen === 'Receipt' ? 'Receipts' : chipFullScreen === 'Payment' ? 'Payments' : chipFullScreen === 'Others' ? 'Others' : 'Transfers'
        const acctName = props.selectedAccount?.name || 'All Accounts'
        return (
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#F5F7FA', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton size="small" onClick={() => { setSelectedChip('All'); setPagination((prev) => ({ ...prev, pageCount: 0 })) }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2E3A59' }}>{chipLabel}</Typography>
                            <Typography sx={{ fontSize: 11, color: '#999' }}>{acctName}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Entries</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{loading ? '—' : cashAndBankTransactionList.count}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Total</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: chipFullScreen === 'Receipt' ? '#2e7d32' : '#d32f2f' }}>
                                {loading ? '—' : fmtAmt(cashAndBankTransactionList.data.reduce((s, r) => s + (Number(r.amount) || 0), 0))}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => { setSelectedChip('All'); setPagination((prev) => ({ ...prev, pageCount: 0 })) }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
                {loading && <LinearProgress />}

                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Particular</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Ref #</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Method</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA', textAlign: 'right' }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#999' }}>Loading {chipLabel.toLowerCase()}…</TableCell>
                                </TableRow>
                            ) : cashAndBankTransactionList.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#999' }}>No {chipLabel.toLowerCase()} found</TableCell>
                                </TableRow>
                            ) : cashAndBankTransactionList.data.map((row, idx) => {
                                const particular = row.particulars || ''
                                return (
                                    <TableRow key={idx} hover>
                                        <TableCell sx={{ fontSize: 12 }}>{moment(row.transactionDate).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{row.type}</TableCell>
                                        <TableCell>
                                            {isClickableLedger(particular, row) ? (
                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                    onClick={() => { setSelectedChip('All'); handleParticularClick(row); }}>
                                                    {particular}
                                                </Typography>
                                            ) : (
                                                <Typography sx={{ fontSize: 12, color: '#666' }}>{particular || '-'}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>{row.referenceNumber ?? row.receipt_number}</TableCell>
                                        <TableCell sx={{ fontSize: 12, color: '#999' }}>{row.paymentMethod}</TableCell>
                                        <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 600, color: Number(row.debit) > 0 ? '#2e7d32' : '#d32f2f' }}>
                                            {fmtAmt(Number(row.debit) > 0 ? Number(row.debit) : Number(row.credit) || Number(row.amount) || 0)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2 }}>
                    <TablePagination
                        component='div'
                        sx={{ borderBottom: 'none !important' }}
                        count={cashAndBankTransactionList.count}
                        page={pagination.pageCount}
                        rowsPerPage={pagination.numPerPage}
                        rowsPerPageOptions={[20, 50, 100]}
                        showFirstButton
                        showLastButton
                        onPageChange={(e, page) => setPagination((prev) => ({ ...prev, pageCount: page }))}
                        onRowsPerPageChange={(e) => setPagination((prev) => ({ ...prev, numPerPage: parseInt(e.target.value, 10), pageCount: 0 }))}
                    />
                </Box>
            </Card>
        )
    }

    // Full-screen ledger view replaces the entire transaction list
    if (ledgerView) {
        return (
            <LedgerFullScreen
                name={ledgerView.accountName}
                contactId={ledgerView.contactId}
                contactType={ledgerView.contactType}
                contraAccountId={ledgerView.contraAccountId}
                filter={props.filter}
                onClose={() => setLedgerView(null)}
            />
        )
    }

    return transactionCard
})

// Full-screen ledger view backed by the GL Detail report API.
// One endpoint (/reports/generalLedgerDetail) handles all three drill-down cases:
//   - Customer ledger (with linked vendor merge done server-side)
//   - Vendor ledger (with linked customer merge done server-side)
//   - Cash/Bank/Contra account ledger
// The previous implementation called three different endpoints (checkLinkedAccount,
// Customerservice.getAllStatement, reportsApi.ledgerVouchers) and reconciled them
// in the frontend — this is a one-call replacement that mirrors what the GL Detail
// report page already does.
function LedgerFullScreen({ name, contactId, contactType, contraAccountId, filter, onClose }) {
    const [data, setData] = useState(null)  // raw response from generalLedgerDetail
    const [loading, setLoading] = useState(true)
    // contraAccountId can be reassigned when the user clicks a contra particular
    // for in-place drill-down navigation (matches GeneralLedgerNew.LedgerDetail behavior).
    const [drillAccountId, setDrillAccountId] = useState(null)
    const [drillName, setDrillName] = useState(null)

    useEffect(() => {
        const targetContactId = drillAccountId ? null : contactId
        const targetAccountId = drillAccountId || contraAccountId
        if (!targetContactId && !targetAccountId) return

        setLoading(true)
        const fromDate = filter?.from || moment().format('YYYY-MM-DD')
        const toDate = filter?.to || moment().format('YYYY-MM-DD')

        // generalLedgerDetail expects either (contactId + contactType) OR (accountId).
        // contactType for the API is 'Customer' | 'Vendor' (not 'Supplier').
        const payload = {
            accountId: targetAccountId || undefined,
            contactId: targetContactId || undefined,
            contactType: targetContactId
                ? (contactType === 'Supplier' ? 'Vendor' : (contactType || 'Customer'))
                : undefined,
            fromDate,
            toDate,
        }

        ReportsService.getGeneralLedgerDetail(payload)
            .then(res => {
                const body = res.data || {}
                setData(body)
                setLoading(false)
            })
            .catch(() => {
                setData(null)
                setLoading(false)
            })
    }, [contactId, contactType, contraAccountId, drillAccountId, filter])

    // Build rows for rendering: OB + transaction rows with running balance + CB.
    // The API already provides running_balance per row, but we also wrap in OB/CB markers
    // so the table layout matches the rest of the cash-in-hand page.
    const processedRows = useMemo(() => {
        if (!data) return []
        const txns = Array.isArray(data.data) ? data.data : []
        const opening = Number(data.openingBalance) || 0
        const closing = Number(data.closingBalance) || 0
        const rows = []
        rows.push({ _isOBCB: true, _label: 'Opening Balance', _balance: opening })
        for (const t of txns) {
            rows.push({ ...t, _balance: Number(t.running_balance) || 0 })
        }
        rows.push({ _isOBCB: true, _label: 'Closing Balance', _balance: closing })
        return rows
    }, [data])

    const totals = {
        debit: Number(data?.totalDebit) || 0,
        credit: Number(data?.totalCredit) || 0,
        closing: Number(data?.closingBalance) || 0,
        opening: Number(data?.openingBalance) || 0,
    }
    const linked = data?.linked || null
    const headerTitle = drillName || name
    const headerSubtitle = drillAccountId
        ? 'Ledger Detail'
        : (contactId ? `Statement of Accounts (${contactType || 'Customer'})` : 'Ledger Detail')

    // Click handler for contra-account particulars — drills into that account's ledger
    // in place. The user can click "Back" to return to the parent ledger view.
    const handleContraClick = (contraName) => {
        // We don't have an accountId for the contra here — the API only returns the name.
        // In the GL Detail report this lookup happens via the parent table mapping.
        // For the cash-in-hand drill-down we don't have that mapping at hand, so contra
        // drill-down is currently a no-op. Left as a placeholder for future enhancement.
        return contraName
    }

    return (
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#F5F7FA', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="small" onClick={onClose}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2E3A59' }}>
                            {headerTitle}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#999' }}>
                            {headerSubtitle}
                            {linked && ` • Linked ${linked.type}: ${linked.name}`}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Total Debit</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2e7d32' }}>{fmtAmt(totals.debit)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Total Credit</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#d32f2f' }}>{fmtAmt(totals.credit)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>Closing</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: totals.closing >= 0 ? '#2e7d32' : '#d32f2f' }}>{fmtAmt(Math.abs(totals.closing))}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {/* Table — column shape mirrors the GL Detail report (GeneralLedgerNew.LedgerDetail) */}
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Date</TableCell>
                            {linked && <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Source</TableCell>}
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Particulars</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA' }}>Narration</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA', textAlign: 'right' }}>Debit</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA', textAlign: 'right' }}>Credit</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FAFAFA', textAlign: 'right' }}>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedRows.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={linked ? 8 : 7} sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                                    No transactions found in selected date range
                                </TableCell>
                            </TableRow>
                        ) : processedRows.map((row, idx) => {
                            if (row._isOBCB) {
                                const obcbColspan = linked ? 5 : 4
                                return (
                                    <TableRow key={`obcb-${idx}`} sx={{ bgcolor: '#F5F5F5' }}>
                                        <TableCell colSpan={obcbColspan}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{row._label}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            {row._balance >= 0 ? <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#2e7d32' }}>{fmtAmt(row._balance)}</Typography> : ''}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            {row._balance < 0 ? <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#d32f2f' }}>{fmtAmt(Math.abs(row._balance))}</Typography> : ''}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{fmtAmt(row._balance)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            const debit = Number(row.debit) || 0
                            const credit = Number(row.credit) || 0
                            const contraNames = (row.contra_account || '').split(',').map(s => s.trim()).filter(Boolean)
                            return (
                                <TableRow key={`${row.txn_id || idx}-${idx}`} hover>
                                    <TableCell sx={{ fontSize: 12 }}>{row.date ? moment(row.date).format('DD/MM/YYYY') : ''}</TableCell>
                                    {linked && (
                                        <TableCell sx={{ fontSize: 11 }}>
                                            <Chip
                                                label={row.source === 'customer' ? 'Sale' : row.source === 'vendor' ? 'Purchase' : '-'}
                                                size="small"
                                                sx={{
                                                    fontSize: 10, height: 18,
                                                    bgcolor: row.source === 'customer' ? '#E8F5E9' : row.source === 'vendor' ? '#FFF3E0' : '#F5F5F5',
                                                    color: row.source === 'customer' ? '#2E7D32' : row.source === 'vendor' ? '#E65100' : '#999',
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ fontSize: 12 }}>
                                        {contraNames.length > 0 ? contraNames.map((cName, ci) => (
                                            <Typography
                                                key={ci}
                                                component="span"
                                                sx={{ fontSize: 12, color: '#1976d2', fontWeight: 500, mr: 0.5 }}
                                            >
                                                {cName}{ci < contraNames.length - 1 ? ',' : ''}
                                            </Typography>
                                        )) : ''}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: 12 }}>{row.voucher_type || ''}</TableCell>
                                    <TableCell sx={{ fontSize: 12, color: '#666' }}>{row.narration || ''}</TableCell>
                                    <TableCell sx={{ fontSize: 12, textAlign: 'right', color: '#2e7d32' }}>{debit > 0 ? fmtAmt(debit) : ''}</TableCell>
                                    <TableCell sx={{ fontSize: 12, textAlign: 'right', color: '#d32f2f' }}>{credit > 0 ? fmtAmt(credit) : ''}</TableCell>
                                    <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: 500 }}>{row._balance != null ? fmtAmt(row._balance) : ''}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    )
}

TransactionList.propTypes = {
    selectedAccount: PropTypes.object,
    filter: PropTypes.object,
    isDrawerOpen: PropTypes.bool,
    setIsDrawerOpen: PropTypes.func,
    setSelectedAccount: PropTypes.func,
    setFilterOpen: PropTypes.func,
    resetToAll: PropTypes.bool,
    setResetToAll: PropTypes.func
}

export default TransactionList