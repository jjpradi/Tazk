import React, { useEffect, useRef, useState } from 'react';
import { Grid, TextField, IconButton, Select, FormControl, InputLabel, MenuItem, ListItem, ListItemText, List, Paper } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const NewsundryAcc = ({ onAddAccount, onCancel, selectedLedgerName, ledgerData, onexistUpdate }) => {
    const [accountData, setAccountData] = useState({
        name: '',
        debit: '',
        credit: '',
        parentAccountId: '',
        accountGroup: ''
    });
    const [pendingChanges, setPendingChanges] = useState([]);
    const [ledgerNameExists, setLedgerNameExists] = useState(false);
    const ledgerNameInputRef = useRef(null);

    useEffect(() => {
        if (accountData.parentAccountId) {
            const selectedLedger = selectedLedgerName.find(s => s.id === accountData.parentAccountId);
            if (selectedLedger) {
                setAccountData(prevData => ({
                    ...prevData,
                    accountGroup: selectedLedger.accountGroup
                }));
            }
        }
    }, [accountData.parentAccountId, selectedLedgerName]);

    const handleChange = (field, value) => {
        if (field === 'name') {
            const exists = ledgerData.some(ledger => ledger.accountName === value);
            setLedgerNameExists(exists);
        }

        setAccountData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };


    const handleAddAccount = () => {
        if (ledgerNameExists) {
            setLedgerNameExists(false);
            if (ledgerNameInputRef.current) {
                ledgerNameInputRef.current.focus();
                ledgerNameInputRef.current.setSelectionRange(accountData.name.length, accountData.name.length);
            }
            return; 
        }

        if (!accountData.name === false && !accountData.parentAccountId === false) {
            const existingLedger = ledgerData.find(ledger => ledger.accountName === accountData.name);

            if (existingLedger) {
                const updatedData = {
                    id: existingLedger.id,
                    changes: { ...accountData }
                };
                setPendingChanges(prevChanges => [...prevChanges, updatedData]);
                onexistUpdate(existingLedger.id, updatedData);
            } else {
                const newData = { ...accountData };
                setPendingChanges(prevChanges => [...prevChanges, newData]);
                onAddAccount(newData);
            }

            setAccountData({
                name: '',
                debit: '',
                credit: '',
                parentAccountId: '',
                accountGroup: ''
            });
        }
    };

    const handleCancel = () => {
        setAccountData({
            name: '',
            debit: '',
            credit: '',
            parentAccountId: '',
            accountGroup: ''
        });
    };

    return (
        <Grid container spacing={3} alignItems="flex" textAlign={"center"} >
            <Grid
                size={{
                    lg: 2.5,
                    md: 2.5,
                    xs: 3
                }}>
                <FormControl
                    fullWidth
                    required={true}
                >
                    <InputLabel>Account Group</InputLabel>
                    <Select
                        style={{}}
                        name='parentAccountId'
                        onChange={(e) => handleChange('parentAccountId', e.target.value)}
                        value={
                            accountData.parentAccountId
                        }
                    >
                        {selectedLedgerName.map((s) => (
                            <MenuItem value={s.id} key={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid
                size={{
                    lg: 2.5,
                    md: 2.5,
                    xs: 3
                }}>
                <TextField
                    label="Ledger Name"
                    value={accountData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required={true}
                    fullWidth
                    inputProps={{
                        id: 'ledgerNameInput' 
                    }}
                    inputRef={ledgerNameInputRef}
                    style={{ borderColor: ledgerNameExists ? 'red' : 'initial' }} 
                    error={ledgerNameExists}
                    helperText={ledgerNameExists && 'Ledger name already exists'}
                />
            </Grid>
            <Grid
                size={{
                    lg: 2.5,
                    md: 2.5,
                    xs: 2
                }}>
                <TextField
                    label="Debit"
                    type='number'
                    value={accountData.debit}
                    onChange={(e) => handleChange('debit', e.target.value)}
                    fullWidth
                    onWheel={ (e) => e.target.blur()}
                />
            </Grid>
            <Grid
                size={{
                    lg: 2.5,
                    md: 2.5,
                    xs: 2
                }}>
                <TextField
                    label="Credit"
                    type='number'
                    value={accountData.credit}
                    onChange={(e) => handleChange('credit', e.target.value)}
                    fullWidth
                    onWheel={ (e) => e.target.blur()}
                />
            </Grid>
            <Grid
                sx={{ textAlign: 'center' }}
                size={{
                    lg: 2,
                    md: 2,
                    xs: 3
                }}>
                <IconButton onClick={handleCancel}>
                    <CancelIcon sx={{ color: 'red' }} />
                </IconButton>
                <IconButton
                    onClick={handleAddAccount}
                    disabled={ledgerNameExists} 
                >
                    <CheckCircleIcon sx={{ color: 'green' }} />
                </IconButton>
            </Grid>
            {/* List of entered accounts */}
            <Grid size={12}>
                {pendingChanges.length > 0 && (
                    <Paper elevation={3} style={{ padding: '10px' }}>
                        <List>
                            {pendingChanges.map((change, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`Account ${index + 1}`}
                                        secondary={`Name: ${change.name}, Debit: ${change.debit}, Credit: ${change.credit}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
};

export default NewsundryAcc;
