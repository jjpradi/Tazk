import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

const AccountDialog = ({ isOpen, accountName, message, onClose }) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ style: { backgroundColor: 'white', padding: '20px' } }}
        >
            <DialogTitle>Exciting Entries ({accountName.length})</DialogTitle>
            <DialogContent style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px' }}>
                    <strong>Notes:</strong>
                    <ol>
                        <li>This ledger already contains existing entries.</li>
                        <li>Please review the data and consider making necessary adjustments.</li>
                        <li>If you intend to add new entries, ensure that the date is accurate.</li>
                    </ol>
                </Typography>
                {accountName.length > 0 ? (
                    <>
                        <ul>
                            {accountName.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <Typography variant="body1">No Exciting Entries found.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountDialog;
