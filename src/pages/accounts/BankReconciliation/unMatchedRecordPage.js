import { Card, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, Menu } from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addBankReconciliationTableAction, getRecordsAction, listBankReconciliation } from 'redux/actions/bankCreation_actions';
import apiCalls from 'utils/apiCalls';
import EditIcon from '@mui/icons-material/Edit';
import PayInOutDialog from './payInOutDialog';
import Expenses from 'pages/accounts/Expenses';
import ExpensesDialog from './ExpensesDialog';
import PaymentDialog from './vendorPaymentDialog';
import VendorPaymentDialog from './vendorPaymentDialog';
import ReceiptEntryDialog from './receiptEntry';
import { ErrormsgAlert } from 'redux/actions/load';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';

export default function UnMatchedRecordPage() {
    const dispatch = useDispatch();
    const {
        bankCreationReducer: {
            bank_id, bank_reconciliation,
        },
        CashOutInReducer: { cashOutInData },
    } = useSelector((state) => state);

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
    } = useContext(CreateNewButtonContext);

    const location = useLocation();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [payInOpen, setPayInOpen] = useState(false);
    const [payOutOpen, setPayOutOpen] = useState(false);
    const [contraOpen, setContraOpen] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [expensesOpen, setExpensesOpen] = useState(false);
    const [vendorPaymentOpen, setVendorPaymentOpen] = useState(false);

    // console.log("bank_reconciliation",bank_reconciliation)

    const handleClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handlePayIn = (action) => {
        setPayInOpen(true);
        handleClose();
    };

    const handlePayOut = (action) => {
        setPayOutOpen(true);
        handleClose();
    };

    const handleContra = (action) => {
        setContraOpen(true);
        handleClose();
    };
    const handleExpenses = (action) => {
        setExpensesOpen(true);
        handleClose();
    };
    const handleVendorPayment = (action) => {
        setVendorPaymentOpen(true);
        handleClose();
    };
    const handleReceipt = (action) => {
        setReceiptOpen(true);
        handleClose();
    };


    // const matchedRowData = location.state?.matchedRowData || [];
    const unmatchedRowData = location.state?.unmatchedRowData || [];
    // const computedBankReconciliation =  location.state?.computedBankReconciliation || [];
    const [matchedData, setMatchedData] = useState(
        [],
    );
    const [isApiFinished, setIsApiFinished] = useState(false);
    const [matchedLeft, setMatchedLeft] = useState(matchedData);
    // console.log("computedBankReconciliation", computedBankReconciliation)
    // console.log("unMatchedExcelData", unmatchedRowData)
    const [computedBankReconciliation, setComputedBankReconciliation] = useState(
        [],
    );
    const handleCancel = () => {
        navigate('/accounts/bankReconciliation');
    };



    // useEffect(() => {
    //   setComputedBankReconciliation(bank_reconciliation);
    // }, [bank_reconciliation]);

    // console.log("bank_reconciliation",bank_reconciliation)


    const handleSubmit = async () => {
        await dispatch(
            listBankReconciliation(bank_id, setModalTypeHandler, setLoaderStatusHandler)
        );
    };

    useEffect(() => { (async () => {
        if (bank_reconciliation?.length > 0) {
            // console.log("111",bank_reconciliation)
            let data = {
                overAllRecord: bank_reconciliation,
                excelData: unmatchedRowData
            }
            // console.log("data",data)
            let tempArray = [];
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                await dispatch(
                    getRecordsAction(
                        data,
                        async (res) => {
                            // console.log("res",res)
                            setMatchedData(res.matched);
                            if (res.matched && res.matched.length > 0) {
                                let mathcedLeft = res.matched
                                let tempObj = {
                                    bankReconciliation: {},
                                    matchedLeft: mathcedLeft,
                                };
                                mathcedLeft.map((item) => {
                                    const dateParts = item.date.split('/');
                                    const rearrangedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                                    tempArray.push(convertExcelDateToString(item?.date));
                                });
                                tempObj.bankReconciliation.fromDate = moment(
                                    new Date(Math.min(...tempArray)),
                                ).format('yyyy-MM-DD');
                                tempObj.bankReconciliation.toDate = moment(
                                    new Date(Math.max(...tempArray)),
                                ).format('yyyy-MM-DD');
                                tempObj.bankReconciliation.reconciliateDate = moment(new Date()).format(
                                    'yyyy-MM-DD',
                                );

                                tempObj.bankReconciliation.bankId = bank_id;
                                tempObj.bankReconciliation.noOfEntries = matchedLeft.length;
                                tempObj.bankReconciliation.isActive = '';
                                tempObj.bankReconciliation.isDeleted = 0;
                                tempObj.bankReconciliation.createdAt = moment(new Date()).format(
                                    'yyyy-MM-DD',
                                );
                                tempObj.bankReconciliation.modifiedAt = '';
                                apiCalls(
                                    setModalTypeHandler,
                                    setLoaderStatusHandler,
                                    await dispatch(
                                        addBankReconciliationTableAction(
                                            tempObj,
                                            setModalTypeHandler,
                                            setLoaderStatusHandler,
                                        ),
                                    ),
                                );
                                navigate('/bankdetails')


                            } else {
                                ErrormsgAlert(dispatch, "No matched data found!.Please put entry to continue");
                            }
                        }
                    ),
                ),
            );
        }
    })();
}, [bank_reconciliation]);





    const convertExcelDateToString = (excelDate) => {
        if (!excelDate) return '-';
        const excelEpoch = new Date((excelDate - 25569) * 86400 * 1000);
        return excelEpoch.toLocaleDateString('en-GB') === 'Invalid Date' ? excelDate : excelEpoch.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    const isOlderThan30Days = (excelDate) => {
        if (!excelDate) return false;
        
        let date;
        if (typeof excelDate === 'string' && excelDate.includes('T')) {
            // Handle ISO date strings like "2025-09-29T00:00:00.000Z"
            date = new Date(excelDate);
        } else {
            // Handle Excel date numbers
            const excelEpoch = new Date((excelDate - 25569) * 86400 * 1000);
            date = excelEpoch.toLocaleDateString('en-GB') === 'Invalid Date' ? new Date(excelDate) : excelEpoch;
        }
        
        if (isNaN(date.getTime())) return false;
        
        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    };

    return (
        <Card sx={{ p: '20px', width: '100%', height: '100%' }}>
            <Grid container flexDirection="column" spacing={2}>

                {/* Matched Transactions Section */}
                <Grid>
                    <Typography variant="h6" align="left" pb="15px">
                        Not Matched Transactions
                    </Typography>
                </Grid>

                <Grid>
                    <TableContainer component={Paper} sx={{
                        minHeight: 500,
                        maxHeight: 500,
                        overflowY: 'auto',
                    }} >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    {/* <TableCell>Reference Number</TableCell> */}
                                    <TableCell>Description</TableCell>
                                    <TableCell>Withdrawal</TableCell>
                                    <TableCell>Deposit</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {unmatchedRowData.length > 0 ? (
                                    unmatchedRowData.map((item, index) => {
                                        const isOld = isOlderThan30Days(item?.Date);
                                        return (
                                            <TableRow 
                                                key={index} 
                                                sx={{ 
                                                    backgroundColor: isOld ? '#fff3cd' : 'inherit',
                                                    '&:hover': { backgroundColor: isOld ? '#ffeaa7' : '#f5f5f5' }
                                                }}
                                            >
                                                <TableCell>
                                                    {convertExcelDateToString(item?.Date)}
                                                    {isOld && <Typography variant="caption" color="error" sx={{ ml: 1 }}>(30 days)</Typography>}
                                                </TableCell>
                                                {/* <TableCell>{item?.reference || '-'}</TableCell> */}
                                                <TableCell>{item?.Description || '-'}</TableCell>
                                                <TableCell>
                                                    {item?.Debit
                                                        ? item.Debit

                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {item?.Credit
                                                        ? item.Credit

                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={(e) => handleClick(e, item)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No Unmatched records available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {selectedRow?.Credit && (
                                <>
                                    <MenuItem onClick={() => handleReceipt()}>Receipt Entry</MenuItem>
                                    <MenuItem onClick={() => handlePayIn()}>PayIn</MenuItem>
                                </>
                            )}
                            {selectedRow?.Debit && (
                                <>
                                    <MenuItem onClick={() => handlePayOut()}>PayOut</MenuItem>
                                    <MenuItem onClick={() => handleExpenses()} >Expenses</MenuItem>
                                    <MenuItem onClick={() => handleVendorPayment()} >Payment Entry</MenuItem>
                                    <MenuItem onClick={() => handleContra()}>Contra</MenuItem>
                                </>
                            )}
                        </Menu>
                    </TableContainer>
                </Grid>

                {/* <Grid mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="error" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Grid> */}
                {/* Action Buttons */}
                <Grid mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="error" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" disabled={unmatchedRowData.length === 0} onClick={handleSubmit}>
                        Submit
                    </Button>
                </Grid>
                {
                    (payInOpen || payOutOpen || contraOpen) && <PayInOutDialog
                        open={payInOpen || payOutOpen || contraOpen}
                        handleClose={() => {
                            setPayInOpen(false)
                            setPayOutOpen(false)
                            setContraOpen(false)
                        }}
                        type={'BANKRECONCILIATION'}
                        requestMode={payInOpen ? '1' : payOutOpen ? '0' : '2'}
                        reconciliateData={selectedRow}
                    />
                }
                {/* {
                    payOutOpen && <PayInOutDialog
                        open={payOutOpen}
                        handleClose={() => setPayOutOpen(false)}
                        type={'BANKRECONCILIATION'}
                        requestMode={'0'}
                    />
                }

                {
                    contraOpen && <PayInOutDialog
                        open={contraOpen}
                        handleClose={() => setContraOpen(false)}
                        type={'BANKRECONCILIATION'}
                        requestMode={'2'}
                    />
                } */}

                {/* {
                    expensesOpen && <ExpensesDialog
                        open={expensesOpen}
                        handleClose={() => setExpensesOpen(false)}
                        type={'BANKRECONCILIATION'}
                    />
                } */}

                {/* {
                    vendorPaymentOpen && <VendorPaymentDialog
                        open={vendorPaymentOpen}
                        handleClose={() => setVendorPaymentOpen(false)}
                        type={'BANKRECONCILIATION'}
                        custType='VENDOR'
                    />
                } */}
                {
                    (receiptOpen || vendorPaymentOpen || expensesOpen) && <ReceiptPayments
                        paymentOpen={receiptOpen || vendorPaymentOpen || expensesOpen}
                        handleClose={() => {
                            setReceiptOpen(false)
                            setVendorPaymentOpen(false)
                            setExpensesOpen(false)
                        }}
                        editData={{}}
                        type='BANK_RECONCILIATION'
                        pageType={expensesOpen ? 'EXPENSES' : ''}
                        custType={selectedRow.Credit ? 'CUSTOMER' : 'VENDOR'}
                        responseType={selectedRow.Credit ? 'cashIn' : 'cashOut'}
                        entryType = {'new'}
                        sales_items={[]}
                        selectedInvoice={null}
                        selectedCustomer={{}}
                        reconciliateData={selectedRow}
                    />
                }
            </Grid>
        </Card>
    );
}
