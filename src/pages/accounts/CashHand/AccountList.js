import { useContext, useEffect, useState } from 'react'
import { Chip, Divider, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip, Typography } from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CommonSearch from 'utils/commonSearch'
import { useDispatch, useSelector } from 'react-redux'
import { getBankAndCashAccountsAction } from 'redux/actions/cash_box_actions'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import PropTypes from 'prop-types'
import BankAccount from '../../../assets/dashboardIcons/bank-account.svg'
import CashAccount from '../../../assets/dashboardIcons/cash-account.svg'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import moment from 'moment'
import apiCalls from 'utils/apiCalls'

function AccountList(props){

    const dispatch = useDispatch()
    const {
        cashBoxReducer: { cashAndBankAccounts, cashAndBankConsolidatedTotal }
    } = useSelector(state => state)
    const { headerLocationId, setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

    const selectedChip = props.accountChip || 'All'
    const setSelectedChip = props.setAccountChip || (() => {})
    const [selectedRow, setSelectedRow] = useState(null)
    const [searchString, setSearchString] = useState('')

    useEffect(() => {
        const payload = {
            chip: selectedChip,
            searchString: searchString,
            from: props.filter.from,
            to: props.filter.to
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getBankAndCashAccountsAction(payload, (response) => {
                if(response === 200){
                    props.setResetToAll(true)
                }
            }))
        )
    }, [selectedChip])

    // Only clear selection if the previously-selected account is NO LONGER in the new list
    // (e.g., user switched left chip from All → Bank and the selected cashbox is no longer visible).
    // Otherwise preserve the user's selection across filter/refresh.
    useEffect(() => {
        if(cashAndBankAccounts.length > 0 && selectedRow){
            const stillVisible = cashAndBankAccounts.some(a => a.id === selectedRow.id && a.type === selectedRow.type)
            if(!stillVisible){
                setSelectedRow(null)
                props.setSelectedAccount(null)
            }
        }
    }, [cashAndBankAccounts])

    const requestSearch = (event) => {
        const val = event.target.value
        setSearchString(val)
    }

    const cancelSearch = () => {
        setSearchString('')
    }

    const handleRowClick = (row) => {
        if(selectedRow?.id === row.id && selectedRow?.type === row.type){
            // Deselecting — go back to all view, reset chips
            setSelectedRow(null)
            props.setSelectedAccount(null)
            props.setIsDrawerOpen(false)
            props.setResetToAll(true)
        }
        else{
            // Selecting a specific account — fetch immediately, reset chip to All
            setSelectedRow(row)
            props.setSelectedAccount(row)
            props.setIsDrawerOpen(false)
            props.setResetToAll(true)
        }
    }

    const filterDateCondition = () => {
        if(props.filter.from === null && props.filter.to === null){
            return 'Today'
        }
        else if(props.filter.from !== null && props.filter.to !== null){
            return `${moment(props.filter.from).format('DD/MM/YYYY')} - ${moment(props.filter.to).format('DD/MM/YYYY')}`
        }
        else if(props.filter.from !== null){
            return `${moment(props.filter.from).format('DD/MM/YYYY')} - Today`
        }
    }

    return (
        <Grid container spacing={3} sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Grid size={12}>
                <Grid container spacing={2} display='flex' justifyContent='space-between' alignItems='center'>
                    <Grid>
                        <Typography variant='h6'>{`Cash In Hand - ${filterDateCondition()}`}</Typography>
                    </Grid>

                    {/* <Grid>
                        <Typography variant='h6'>{`${cashAndBankConsolidatedTotal[0]?.transactionCount ?? 0} Entries`}</Typography> 
                    </Grid> */}
                </Grid>
                <Divider />
            </Grid>
            <Grid size={12}>
                <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center'>
                    <Grid>
                        <Chip label='All' color='primary' variant={selectedChip === 'All' ? 'filled' : 'outlined'} onClick={() => { setSelectedChip('All'); props.setResetToAll(true) }} />
                        &nbsp;
                        <Chip label='Cash' color='primary' variant={selectedChip === 'Cash' ? 'filled' : 'outlined'} onClick={() => { setSelectedChip('Cash'); props.setResetToAll(true) }} />
                        &nbsp;
                        <Chip label='Bank' color='primary' variant={selectedChip === 'Bank' ? 'filled' : 'outlined'} onClick={() => { setSelectedChip('Bank'); props.setResetToAll(true) }} />
                    </Grid>

                    <Grid>
                        <Tooltip title='Filter'>
                            <IconButton onClick={() => props.setFilterOpen(true)}>
                                <FilterAltIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
            {/* <Grid size={12}>
                <CommonSearch
                    searchString={searchString}
                    requestSearch={requestSearch}
                    cancelSearch={cancelSearch}
                />
            </Grid> */}
            <Grid size={12}>
                <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                    <Table>
                        <TableBody>
                            {
                                cashAndBankAccounts.map(row => (
                                    <TableRow key={row.id} selected={selectedRow !== null && selectedRow?.id === row.id} hover onClick={() => handleRowClick(row)} sx={{ cursor: 'pointer' }}>
                                        <TableCell width={10}>
                                            {row.type === 'Bank' ? <img src={BankAccount} alt='' height={25} width={25} /> : <img src={CashAccount} alt='' height={25} width={25} />}
                                        </TableCell>

                                        <TableCell width={145}>
                                            <Typography sx={{ fontWeight: 600, fontSize: '13px' }}>{row.name}</Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '11px' }}>{row.type === 'Bank' ? 'Bank Account' : 'Cash Account'}</Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '11px' }}>{`OB: ₹${Number(row.openingBalance).toLocaleString('en-IN')}`}</Typography>
                                        </TableCell>

                                        <TableCell width={145}>
                                            <Typography sx={{ fontWeight: 600, fontSize: '13px' }} textAlign='right'>{`₹${Number(row.amount).toLocaleString('en-IN')}`}</Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '11px' }} textAlign='right'>{row.type}</Typography>
                                            <Typography sx={{ fontWeight: 500, fontSize: '11px' }} textAlign='right'>{`CB: ₹${Number(row.closingBalance).toLocaleString('en-IN')}`}</Typography>

                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}

AccountList.proptypes = {
    setSelectedAccount: PropTypes.func,
    setIsDrawerOpen: PropTypes.func,
    setResetToAll: PropTypes.func,
    setFilterOpen: PropTypes.func
}

export default AccountList