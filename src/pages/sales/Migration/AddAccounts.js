import React, { useEffect, useRef, useState } from 'react';
import { Grid, TextField, IconButton, Select, FormControl, InputLabel, MenuItem, Paper, List, ListItem, ListItemText, Box, Autocomplete } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


const AddAccountComponent = ({ onAddAccount, onCancel, selectedLedgerName, ledgerData, onexistUpdate, existsdata, showGrid }) => {
  const [accountData, setAccountData] = useState({
    name: '',
    debit: '',
    credit: '',
    accountGroup: '',
    parentAccountId: null,
  });
  const [pendingChanges, setPendingChanges] = useState([]);
  const [ledgerNameExists, setLedgerNameExists] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const ledgerNameInputRef = useRef(null);

  useEffect(() => {
    if (existsdata.length > 0) {
      setPendingChanges(existsdata);
    }
  }, [existsdata]);

  const handleChange = (field, value) => {
    let existsInPendingChanges = false;

    if (field === 'name') {
      existsInPendingChanges = pendingChanges.some((change) => change.name === value);
    }

    const existsInLedgerData = ledgerData.some((ledger) => ledger.accountName === value);

    const ledgerNameExists = existsInPendingChanges || existsInLedgerData;
    setLedgerNameExists(ledgerNameExists);

    setAccountData((prevData) => ({
      ...prevData,
      [field]: value,
      [field === 'debit' ? 'credit' : 'debit']: '',
    }));
  };

  const handlegroupChange = (field, value) => {
    const selectedAccountGroup = selectedLedgerName.find(s => s.accountledger_id === value);

    setAccountData(prevData => ({
      ...prevData,
      [field]: value,
      parentAccountId: selectedAccountGroup?.accountgroupId,
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

    if (!accountData.name && !accountData.accountGroup) {
      return;
    }

    const existingLedger = ledgerData.find(ledger => ledger.accountName === accountData.name);

    if (existingLedger) {
      const updatedData = {
        id: existingLedger.id,
        changes: { ...accountData }
      };
      setPendingChanges(prevChanges => [...prevChanges, updatedData]);
      // onexistUpdate(existingLedger.id, updatedData);
    } else {
      const newData = { ...accountData };
      const combinedData = [...pendingChanges, newData];
      setPendingChanges(combinedData);
      onAddAccount(combinedData);
    }

    setAccountData({
      name: '',
      debit: '',
      credit: '',
      parentAccountId: null,
      accountGroup: ''
    });
  };

  const handlePendingChange = (index, field, value) => {
    const updatedPendingChanges = [...pendingChanges];
    const change = updatedPendingChanges[index];

    if (field === 'debit') {
      change.credit = '';
    } else if (field === 'credit') {
      change.debit = '';
    }

    change[field] = value;
    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };



  const handleSave = (index) => {
    const updatedPendingChanges = [...pendingChanges];

    updatedPendingChanges[index].editMode = false;

    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };

  const handleEdit = (index) => {
    const updatedPendingChanges = [...pendingChanges];
    updatedPendingChanges[index].editMode = true;
    setPendingChanges(updatedPendingChanges);
  };


  const handleDelete = (indexToDelete) => {
    const updatedPendingChanges = [...pendingChanges];
    updatedPendingChanges.splice(indexToDelete, 1);
    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };



  return (
    <Grid container spacing={3} alignItems='flex' textAlign={'center'}>
      <Grid
        size={{
          lg: 2.5,
          md: 2.5,
          xs: 3
        }}>
        <FormControl fullWidth required>
           <InputLabel id='acc-id'>Account Group</InputLabel>
          <Select
            name='accountGroup'
            value={accountData.accountGroup}
            onChange={(e) => handlegroupChange('accountGroup', e.target.value)}
            MenuProps={{
              getContentAnchorEl: null,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              PaperProps: {
                style: {
                  maxHeight: 300, 
                  overflowY: 'auto',
                  zIndex: 1300, 
                },
              },
            }}
            label='Account Group'
            labelId='acc-id'
          >
            {selectedLedgerName.map((s) => (
              <MenuItem key={s.accountledger_id} value={s.accountledger_id}>
                {s.accountledger_name}
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
        <Autocomplete
          options={rawData}
          freeSolo
          inputValue={accountData.name}
          onInputChange={(e, newValue) => {
            setAccountData((prevData) => ({
              ...prevData,
              name: newValue,
            }));
          }}
          filterOptions={(options, params) => {
            if (params.inputValue.length > 1) {
              return options.filter((option) =>
                option.toLowerCase().includes(params.inputValue.toLowerCase()),
              );
            }
            return [];
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label='Ledger Name'
              required={true}
              fullWidth
              inputProps={{
                ...params.inputProps,
                id: 'ledgerNameInput',
              }}
              InputProps={params.InputProps}
              inputRef={ledgerNameInputRef}
              style={{borderColor: ledgerNameExists ? 'red' : 'initial'}}
              error={ledgerNameExists}
              helperText={ledgerNameExists && 'Ledger name already exists'}
            />
          )}
        />
      </Grid>
      <Grid
        size={{
          lg: 2.5,
          md: 2.5,
          xs: 2
        }}>
        <TextField
          label='Debit'
          type='number'
          value={accountData.debit}
          onChange={(e) => handleChange('debit', e.target.value)}
          fullWidth
          onWheel={(e) => e.target.blur()}
          disabled={accountData.credit !== ''}
        />
      </Grid>
      <Grid
        size={{
          lg: 2.5,
          md: 2.5,
          xs: 2
        }}>
        <TextField
          label='Credit'
          type='number'
          value={accountData.credit}
          onChange={(e) => handleChange('credit', e.target.value)}
          fullWidth
          onWheel={(e) => e.target.blur()}
          disabled={accountData.debit !== ''}
        />
      </Grid>
      <Grid
        sx={{textAlign: 'center'}}
        size={{
          lg: 2,
          md: 2,
          xs: 3
        }}>
        <IconButton onClick={onCancel} disabled={true}>
          <CancelIcon sx={{color: 'red'}} />
        </IconButton>
        <IconButton onClick={handleAddAccount} disabled={ledgerNameExists}>
          <CheckCircleIcon sx={{color: 'green'}} />
        </IconButton>
      </Grid>
      {/* List of entered accounts */}
      <Grid size={12}>
        {pendingChanges.length > 0 && showGrid && (
          <Box>
            {pendingChanges.map((change, index) => {
              // Filter the selectedLedgerName to find a matching accountGroup
              const selectedGroup = selectedLedgerName.find(
                (s) => s.accountledger_id === change.accountGroup,
              );

              // Only render if a matching group is found
              if (selectedGroup) {
                return (
                  <Grid
                    container
                    spacing={3}
                    key={index}
                    sx={{marginBottom: '10px'}}
                  >
                    <Grid
                      size={{
                        lg: 2.5,
                        md: 2.5,
                        xs: 3
                      }}>
                      <FormControl fullWidth required={true}>
                        <InputLabel>Account Group</InputLabel>
                        <Select
                          style={{}}
                          name='accountGroup'
                          value={change.accountGroup}
                          disabled={!change.editMode}
                          onChange={(e) =>
                            handlePendingChange(
                              index,
                              'accountGroup',
                              e.target.value,
                            )
                          }
                        >
                          {selectedLedgerName.map((s) => (
                            <MenuItem
                              value={s.accountledger_id}
                              key={s.accountledger_id}
                            >
                              {s.accountledger_name}
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
                        label='Ledger Name'
                        value={change.name}
                        required={true}
                        fullWidth
                        inputProps={{
                          id: `ledgerNameInput-${index}`,
                        }}
                        // InputProps={{ readOnly: !change.editMode }}
                        disabled={!change.editMode}
                        style={{borderColor: 'initial'}}
                        onChange={(e) =>
                          handlePendingChange(index, 'name', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid
                      size={{
                        lg: 2.5,
                        md: 2.5,
                        xs: 2
                      }}>
                      <TextField
                        label='Debit'
                        type='number'
                        value={change.debit}
                        fullWidth
                        onWheel={(e) => e.target.blur()}
                        disabled={!change.editMode}
                        onChange={(e) =>
                          handlePendingChange(index, 'debit', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid
                      size={{
                        lg: 2.5,
                        md: 2.5,
                        xs: 2
                      }}>
                      <TextField
                        label='Credit'
                        type='number'
                        value={change.credit}
                        fullWidth
                        onWheel={(e) => e.target.blur()}
                        disabled={!change.editMode}
                        onChange={(e) =>
                          handlePendingChange(index, 'credit', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid
                      sx={{textAlign: 'center'}}
                      size={{
                        lg: 2,
                        md: 2,
                        xs: 3
                      }}>
                      {!change.editMode ? (
                        <>
                          <IconButton onClick={() => handleEdit(index)}>
                            <EditIcon sx={{color: 'blue'}} />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleDelete(index)}>
                            <CancelIcon sx={{color: 'red'}} />
                          </IconButton>
                          <IconButton onClick={() => handleSave(index)}>
                            <CheckCircleIcon sx={{color: 'green'}} />
                          </IconButton>
                        </>
                      )}
                    </Grid>
                  </Grid>
                );
              }
              // Return null if no matching group is found
              return null;
            })}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default AddAccountComponent;


const rawData = [
  'Carriage on Goods',
  'Purchase',
  'Operating Expenses',
  'Banking Charges',
  'Administrative Expenses',
  'Marketing Expenses',
  'Employees Welfare',
  'Loans & Advances (Asset)',
  'IGST Receivable',
  'SGST Receivable',
  'CGST Receivable',
  'TCS Receivable',
  'Bank',
  'Bank OCC A/c',
  'Cash-in-hand',
  'Petty Cash',
  'Sundry Debtors',
  'Stock-in-hand',
  'Asset Purchase',
  'Share Capital',
  'Sales',
  'IGST Payable',
  'Bank OD A/c',
  'Sundry Creditors',
  'Sucured Loan',
  'Unsecured Loan',
  'Loans From Bank',
  'Loans From Individual',
  'Discount Received',
  'Interest on Investment',
  'Interest on Loan',
  'Other Income',
  'Website and Hosting',
  'Staff Welfare',
  'Rounded Off',
  'Salary',
  'Advertisement Expense',
  'Rental Expense',
  'Director Remuneration',
  'Printing Charges',
  'Stationary Purchase',
  'Audit Fees',
  'Professional Charges',
  'Legal Expenses/Charges',
  'Depreciation',
  'Interest on Tax',
  'Tax Penalty',
  'Royalty',
  'Vehicle Maintenance',
  'Discount allowed',
  'Donation & charity',
  'Free sample',
  'Insurance premium',
  'Legal charge',
  'Loss by fire',
  'Postage & courier',
  'Repair charge',
  'Telephone charge',
  'Travelling expenses',
  'Outstanding expenses',
  'Accrued expenses',
  'Bad debt',
  'Loss on theft',
  'Coffee Expenses',
  'Office Party',
  'Outdoor Party',
  'Bus Fare Allowance',
  'Fuel Allowance',
  'Vehicle Maintenance Allowance',
  'Other Allowance',
  'Other Commission',
  'Fuel Expenses',
  'Liability of Expenses',
  'Preliminary Expenses',
  'Professional Fees',
  'Internet Charges',
  'Prepaid Rent',
  'Salary Advance',
  'Prepaid Expense',
  'Prepaid Insurance Charges',
  'Interest Receivables',
  'Bill Receivable',
  'Accrued income',
  'Mutual Fund',
  'Furniture',
  'Machine',
  'Plant and Machinery',
  'Mobile',
  'Computers',
  'Electrical Fittings',
  'Car',
  'Scooter',
  'Laptops',
  'Land & Building',
  'Good will',
  'Air Conditioner',
  'Accumulated depreciation',
  'Other Assets',
  'SGST Payable',
  'CGST Payable',
  'TCS Payable',
  'Cash-MPK',
  'Credit Notes',
  'Debit Notes',
  'Pos Refund',
  'Other Expenses',
  'Cost of Goods Sold',
  'Stock',
  'Cashbox Adjustment',
  'Round Off',
  'Schemes',
  'Accounts Receivable',
  'Accounts Payable',
  'Purchase Schemes',
  'Sales Promotions',
  'Schemes Paid',
  'Schemes Received',
  'Schemes Payable',
  'Duties & Taxes',
  'Advance Received',
  'Advance Paid'
];