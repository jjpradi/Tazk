import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const NewAccountsComponent = ({ parsedDataBySection, index, handleCancel, handleSave, selectedLedgerName }) => {
    const [formValues, setFormValues] = useState(parsedDataBySection[index] || []);
    const [isSaveClicked, setIsSaveClicked] = useState(false);

    const handleChange = (subIndex, field, value) => {
        const updatedFormValues = [...formValues];
        updatedFormValues[subIndex][field] = value;

        // Clear the opposite field when editing one field
        if (field === 'debit') {
            updatedFormValues[subIndex]['credit'] = '';
        } else if (field === 'credit') {
            updatedFormValues[subIndex]['debit'] = '';
        }

        setFormValues(updatedFormValues);
    };


    const handleSaveClick = () => {
        setIsSaveClicked(true);
        handleSave(index, formValues);
    };


    return (
        <Card style={{ marginTop: '1rem' }}>
            <CardContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Account Group</TableCell>
                            <TableCell>Ledger Name</TableCell>
                            <TableCell style={{ textAlign: 'end' }}>Debit (INR)</TableCell>
                            <TableCell style={{ textAlign: 'end' }}>Credit (INR)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formValues.map((item, subIndex) => (
                            <TableRow key={subIndex}>
                                <TableCell>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name='parent_name'
                                        value={item.parent_name || ''}
                                        required={true}
                                    // onChange={(e) => handleChange(subIndex, 'accountGroup', e.target.value)}
                                    />
                                </TableCell>

                                <TableCell >
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name='name'
                                        value={item.name || ''}
                                        required={true}
                                        onChange={(e) => handleChange(subIndex, 'name', e.target.value)}
                                    />
                                </TableCell>
                                {/* <TableCell>{item.accountGroup}</TableCell>
                                <TableCell>{item.ledgerName}</TableCell> */}
                                <TableCell style={{ textAlign: 'end' }}>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        type="number"
                                        name='debit'
                                        value={item.debit || ''}
                                        onChange={(e) => handleChange(subIndex, 'debit', e.target.value)}
                                        disabled={item.credit !== ''}
                                    />
                                </TableCell>
                                <TableCell style={{ textAlign: 'end' }}>
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        type="number"
                                        name='credit'
                                        value={item.credit || ''}
                                        onChange={(e) => handleChange(subIndex, 'credit', e.target.value)}
                                        disabled={item.debit !== ''}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Grid container justifyContent="end" alignItems="end">
                    <IconButton onClick={handleCancel}>
                        <CancelIcon sx={{ color: 'red' }} />
                    </IconButton>
                    {!isSaveClicked && (
                        <IconButton onClick={handleSaveClick}>
                            <CheckCircleIcon sx={{ color: 'green' }} />
                        </IconButton>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default NewAccountsComponent;
