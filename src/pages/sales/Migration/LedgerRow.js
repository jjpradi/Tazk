import { Grid, IconButton, Paper, TextField, Typography } from '@mui/material';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const LedgerRow = ({
    isEditable,
    currentLedgerData,
    handleDebitChange,
    handleCreditChange,
    item,
    setEditable,
}) => {
    return (
        <Grid container spacing={2}>
            <Grid size={3}>
                <Typography variant="body1">{item.accountName}</Typography>
            </Grid>
            <Grid style={{ textAlign: 'center' }} size={3}>
                <Typography variant="body1">
                    {item.opening_balance !== null ? item.opening_balance : '-'}
                </Typography>
            </Grid>
            <Grid style={{ textAlign: 'end' }} size={2}>
                {isEditable ? (
                    <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(event) => {
                            const inputValue = event.target.value.replace(/[-+]/g, '');
                            handleDebitChange(item.id, inputValue);
                        }}
                        value={currentLedgerData.debit || ''}
                        disabled={currentLedgerData.credit !== null && currentLedgerData.credit !== ''}
                    />
                ) : (
                    <Typography variant="body1">
                        {currentLedgerData.debit || ''}
                    </Typography>
                )}
            </Grid>
            <Grid style={{ textAlign: 'end' }} size={2}>
                {isEditable ? (
                    <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(event) => {
                            const inputValue = event.target.value.replace(/[-+]/g, '');
                            handleCreditChange(item.id, inputValue);
                        }}
                        value={currentLedgerData.credit || ''}
                        disabled={currentLedgerData.debit !== null && currentLedgerData.debit !== ''}
                    />
                ) : (
                    <Typography variant="body1">
                        {currentLedgerData.credit || ''}
                    </Typography>
                )}
            </Grid>
            <Grid style={{ textAlign: 'end' }} size={2}>
                <IconButton
                    onClick={() => {
                        if (currentLedgerData.debit || currentLedgerData.credit) {
                            setEditable();
                        } else {
                            alert('Please enter a value in at least one field');
                        }
                    }}
                >
                    {isEditable ? <CheckCircleIcon color="primary" /> : <EditIcon color="secondary" />}
                </IconButton>
            </Grid>
        </Grid>
    );
};

export default LedgerRow;
