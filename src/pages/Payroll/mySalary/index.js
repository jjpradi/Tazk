import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getMySalaryStructureAction,
  getMySalaryDeductionsAction,
} from 'redux/actions/essPortal.actions';
import MySalaryTab from '../essPortal/tabs/MySalaryTab';

export default function MySalaryPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMySalaryStructureAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMySalaryDeductionsAction(setModalTypeHandler, setLoaderStatusHandler))),
      ]);
    };
    loadData();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          My Salary
        </Typography>
      </Box>
      <MySalaryTab />
    </Box>
  );
}
