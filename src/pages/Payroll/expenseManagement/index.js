import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PolicyIcon from '@mui/icons-material/Policy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getExpensePoliciesAction,
  getClaimsWithPolicyInfoAction,
  getViolationClaimsAction,
} from 'redux/actions/expenseManagement.actions';
import PoliciesConfigTab from './tabs/PoliciesConfigTab';
import ClaimsOverviewTab from './tabs/ClaimsOverviewTab';
import ViolationsTab from './tabs/ViolationsTab';
import ExpenseReportsTab from './tabs/ExpenseReportsTab';

const tabConfig = [
  { label: 'Expense Policies', icon: <PolicyIcon /> },
  { label: 'Claims Overview', icon: <ReceiptLongIcon /> },
  { label: 'Violations', icon: <WarningAmberIcon /> },
  { label: 'Expense Reports', icon: <AssessmentIcon /> },
];

export default function ExpenseManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    dispatch(getExpensePoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getClaimsWithPolicyInfoAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getViolationClaimsAction(setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  const refreshPolicies = () => {
    dispatch(getExpensePoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  const refreshClaims = () => {
    dispatch(getClaimsWithPolicyInfoAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getViolationClaimsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box
      sx={{
        p: 2,
        px: '10px',
        height: '90vh',
        overflowY: 'auto',
        msOverflowStyle: 'none', 
        scrollbarWidth: 'none',  
        '&::-webkit-scrollbar': {
          display: 'none',       
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Expense Management
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontSize: 12, fontWeight: 600, minHeight: 48 },
          }}
        >
          {tabConfig.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition='start' />
          ))}
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && <PoliciesConfigTab onRefresh={refreshPolicies} />}
          {activeTab === 1 && <ClaimsOverviewTab onRefresh={refreshClaims} />}
          {activeTab === 2 && <ViolationsTab />}
          {activeTab === 3 && <ExpenseReportsTab />}
        </Box>
      </Paper>
    </Box>
  );
}
