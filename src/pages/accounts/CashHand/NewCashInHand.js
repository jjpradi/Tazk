import { useRef, useState } from 'react'
import moment from 'moment'
import { Box, Drawer, Grid, Typography, Card, IconButton, Tooltip } from '@mui/material'
import SortIcon from '@mui/icons-material/Sort'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import MenuIcon from '@mui/icons-material/Menu'
import AccountList from './AccountList'
import TransactionList from './TransactionList'
import { useSelector } from 'react-redux'
import CashInHandFilter from './CashInHandFilter'
import { Helmet } from 'react-helmet-async'
import { titleURL } from 'http-common'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import TotalBalance from '../../../assets/dashboardIcons/total-balance-card.svg'
import BankBalance from '../../../assets/dashboardIcons/bank-balance-card.svg'
import CashBalance from '../../../assets/dashboardIcons/cash-balance-card.svg'
import ReceiptCard from '../../../assets/dashboardIcons/receipts-card.svg'
import PaymentCard from '../../../assets/dashboardIcons/payments-card.svg'
import TotalEntries from '../../../assets/dashboardIcons/total-entries-card.svg'

function NewCashInHand(){
    const {
        cashBoxReducer: { cashAndBankConsolidatedTotal }
    } = useSelector(state => state)

    const transactionRef = useRef(null)

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [accountChip, setAccountChip] = useState('All')
    // txnChip controls the transaction-type filter (All/Receipt/Payment/Transfers/Others).
    // Lifted from TransactionList so the filter dialog and the right-panel chips share state.
    const [txnChip, setTxnChip] = useState('All')
    const [filterOpen, setFilterOpen] = useState(false)
    // Filter shape matches backend req.body field names exactly — no rename needed downstream.
    const [filter, setFilter] = useState({
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        paymentMode: null,
        min_amount: null,
        max_amount: null
    })
    const [resetToAll, setResetToAll] = useState(false)

    // CashInHandFilter emits backend-shaped data directly — no field rename gymnastics needed.
    // accountChip is split off because it controls the LEFT panel scope (separate state),
    // not the row-level filter object. txnChip is set from the right-panel chips only.
    const applyFilter = (filterData) => {
        const { accountChip: nextAcctChip, ...filterRest } = filterData
        if (nextAcctChip && nextAcctChip !== accountChip) {
            setAccountChip(nextAcctChip)
            setResetToAll(true)
        }
        setFilter({ ...filterRest, paymentMode: null })
        transactionRef.current.handleApplyFilter({ ...filterRest, paymentMode: null })
        setFilterOpen(false)
    }

    const clearFilter = (filterData) => {
        const { accountChip: nextAcctChip, ...filterRest } = filterData
        if (nextAcctChip && nextAcctChip !== accountChip) {
            setAccountChip(nextAcctChip)
            setResetToAll(true)
        }
        setFilter({ ...filterRest, paymentMode: null })
        transactionRef.current.handleClearFilter({ ...filterRest, paymentMode: null })
        setFilterOpen(false)
    }

    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Cash-In-Hand </title>
            </Helmet>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 1.5 }}>
            {/* Consolidated Cards */}
            <Grid container spacing={1.5}>
                <Grid
                    size={{
                        xl: 4,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Total Balance</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{`₹ ${Number(cashAndBankConsolidatedTotal[0]?.totalBalance ?? 0).toLocaleString('en-IN')}`}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>All cashbox & bank accounts</Typography>
                            </Grid>
                            <Grid size={2}>
                                {/* <SortIcon fontSize='small' /> */}
                                <img src={TotalBalance} alt='' height={30} width={30} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xl: 4,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Bank Balance</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{`₹ ${Number(cashAndBankConsolidatedTotal[0]?.bankTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>All bank combined</Typography>
                            </Grid>
                            <Grid size={2}>
                                {/* <AccountBalanceIcon fontSize='small' /> */}
                                <img src={BankBalance} alt='' height={25} width={25} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xl: 4,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Cash Balance</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{`₹ ${Number(cashAndBankConsolidatedTotal[0]?.cashTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>All cash combined</Typography>
                            </Grid>
                            <Grid size={2}>
                                {/* <AccountBalanceWalletIcon fontSize='small' /> */}
                                <img src={CashBalance} alt='' height={25} width={25} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* <Grid
                    size={{
                        xl: 2,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Receipts</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{`₹ ${Number(cashAndBankConsolidatedTotal[0]?.receiptTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>All Receipts</Typography>
                            </Grid>
                            <Grid size={2}>
                                <img src={ReceiptCard} alt='' height={25} width={25} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid> */}

                {/* <Grid
                    size={{
                        xl: 2,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Payments</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{`₹ ${Number(cashAndBankConsolidatedTotal[0]?.paymentTotal ?? 0).toLocaleString('en-IN')}`}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>All Payments</Typography>
                            </Grid>
                            <Grid size={2}>
                                <img src={PaymentCard} alt='' height={25} width={25} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid> */}

                {/* <Grid
                    size={{
                        xl: 2,
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Card sx={{ p: '3px !important' }}>
                        <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' sx={{padding: '10px !important'}}>
                            <Grid size={10}>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Total Entries</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{cashAndBankConsolidatedTotal[0]?.transactionCount ?? 0}</Typography>
                                <Typography sx={{ fontWeight: 500, fontSize: '12px' }} color='text.secondary'>Transactions shown in table</Typography>
                            </Grid>
                            <Grid size={2}>
                                <img src={TotalEntries} alt='' height={25} width={25} />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid> */}
                
            </Grid>

            {/* Bottom Section: Account List + Transaction List — fills remaining height */}
            <Box sx={{ flex: 1, display: 'flex', gap: 1.5, minHeight: 0, overflow: 'hidden' }}>
                <Box sx={{ width: '25%', display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', minHeight: 0 }}>
                    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <AccountList setSelectedAccount={setSelectedAccount} filter={filter} setIsDrawerOpen={setIsDrawerOpen} setResetToAll={setResetToAll} setFilterOpen={setFilterOpen} accountChip={accountChip} setAccountChip={setAccountChip} />
                    </Card>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <TransactionList
                        ref={transactionRef}
                        selectedAccount={selectedAccount}
                        filter={filter}
                        isDrawerOpen={isDrawerOpen}
                        setIsDrawerOpen={setIsDrawerOpen}
                        setSelectedAccount={setSelectedAccount}
                        setFilterOpen={setFilterOpen}
                        setResetToAll={setResetToAll}
                        resetToAll={resetToAll}
                        accountChip={accountChip}
                        txnChip={txnChip}
                        setTxnChip={setTxnChip}
                    />
                </Box>
            </Box>
            </Box>
            <CashInHandFilter
                open={filterOpen}
                currentFilter={filter}
                currentAccountChip={accountChip}
                onApply={applyFilter}
                onClear={clearFilter}
                onClose={() => setFilterOpen(false)}
            />
        </>
    );
}

export default NewCashInHand