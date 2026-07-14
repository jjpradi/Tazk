import { Card, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addBankReconciliationTableAction } from 'redux/actions/bankCreation_actions';
import apiCalls from 'utils/apiCalls';

export default function MatchedRecordPage() {
    const dispatch = useDispatch();
    const {
        bankCreationReducer: {
            bank_id,
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

    const matchedRowData = location.state?.matchedRowData || [];
    const unmatchedRowData = location.state?.unmatchedRowData || [];
    const [matchedLeft, setMatchedLeft] = useState(matchedRowData);
    const computedBankReconciliation = location.state?.computedBankReconciliation || [];
    // console.log("matchedExcelData", matchedRowData)
    // console.log("unMatchedExcelData", unmatchedRowData)

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = async () => {
        let tempArray = [];


        let tempObj = {
            bankReconciliation: {},
            matchedLeft: matchedRowData,
        };
        matchedLeft.map((item) => {
            const dateParts = item.date.split('/');
            const rearrangedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            tempArray.push(new Date(rearrangedDate));
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

        if (unmatchedRowData && unmatchedRowData.length > 0) {
            navigate('/unMatchedRecordPage', {
                state: {
                    matchedRowData: matchedRowData,
                    unmatchedRowData: unmatchedRowData
                },
            });
        }
        // handleCancel()
        // console.log("tempObj", tempObj);
    };

    const convertExcelDateToString = (excelDate) => {
        if (!excelDate) return '-';
        const excelEpoch = new Date((excelDate - 25569) * 86400 * 1000);
        return excelEpoch.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    return (
        <Card sx={{ p: '20px', width: '100%', height: '100%' }}>
            <Grid container flexDirection="column" spacing={2}>

                {/* Matched Transactions Section */}
                <Grid>
                    <Typography variant="h6" align="left" pb="15px">
                        Matched Transactions
                    </Typography>
                </Grid>

                <Grid>
                    <TableContainer component={Paper} sx={{
                        minHeight: 480,
                        maxHeight: 480,
                        overflowY: 'auto',
                    }} >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Reference Number</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Withdrawal</TableCell>
                                    <TableCell>Deposit</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {matchedRowData.length > 0 ? (
                                    matchedRowData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item?.date}</TableCell>
                                            <TableCell>{item?.reference || '-'}</TableCell>
                                            <TableCell>{item?.description || '-'}</TableCell>
                                            <TableCell>
                                                {item?.withdrawal
                                                    ? item.withdrawal

                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {item?.deposit
                                                    ? item.deposit

                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No matched records available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Action Buttons */}
                <Grid mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="error" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" disabled={matchedRowData.length === 0} onClick={handleSubmit}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
}
