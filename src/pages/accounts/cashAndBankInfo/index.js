import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getsessionStorage } from 'pages/common/login/cookies';
import BankAccounts from 'pages/accounts/BankCreation/index';
import PaymentMethods from 'pages/sales/paymentmethods/index';
import CashBox from 'pages/accounts/cashBoxCreation/index'

function CashAndBankInfo({ onTabChange }) {
    const storage = getsessionStorage()

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (onTabChange) onTabChange(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>

            {
                (storage.company_type === 2 || storage.company_type === 3) &&
                <>
                    <Tabs value={value} onChange={handleChange} aria-label="company tabs">
                        <Tab icon={<AccountBalanceIcon />} label="Bank Accounts" />
                        <Tab icon={<AccountBalanceWalletIcon style={{ color: 'black' }} />} label="Payment Methods" />
                        <Tab icon={<LocalAtmIcon style={{ color: 'black' }} />} label="Cash Box" />
                    </Tabs>

                    {value === 0 && <BankAccounts />}
                    {value === 1 && <PaymentMethods />}
                    {value === 2 && <CashBox />}
                </>
            }


        </Box>

    );
}

export default CashAndBankInfo;
