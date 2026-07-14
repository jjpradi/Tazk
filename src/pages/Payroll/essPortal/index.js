import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PortalIcon from '@mui/icons-material/Dashboard';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getMyChangeRequestsAction,
  getMySalaryStructureAction,
  getMySalaryDeductionsAction,
  getMyTeamMembersAction,
  getTeamAttendanceSummaryAction,
  getTeamPendingRequestsAction,
  getMyRequestsAction,
  getPendingChangeRequestsAction,
} from 'redux/actions/essPortal.actions';
import ProfileChangesTab from './tabs/ProfileChangesTab';
import MySalaryTab from './tabs/MySalaryTab';
import MyTeamTab from './tabs/MyTeamTab';
import MyRequestsTab from './tabs/MyRequestsTab';
import HRApprovalsTab from './tabs/HRApprovalsTab';

const tabConfig = [
  { label: 'Profile Changes', icon: <PersonIcon /> },
  { label: 'My Salary', icon: <AccountBalanceWalletIcon /> },
  { label: 'My Team', icon: <GroupsIcon /> },
  { label: 'My Requests', icon: <ListAltIcon /> },
  { label: 'HR Approvals', icon: <FactCheckIcon /> },
];

export default function EssPortalPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMyChangeRequestsAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMySalaryStructureAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMySalaryDeductionsAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMyTeamMembersAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getMyRequestsAction(setModalTypeHandler, setLoaderStatusHandler))),
      ]);
    };
    loadAll();
  }, []);

  const loadTeamData = () => {
    dispatch(getTeamAttendanceSummaryAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getTeamPendingRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  const loadApprovals = () => {
    dispatch(getPendingChangeRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  useEffect(() => {
    if (activeTab === 2) loadTeamData();
    if (activeTab === 4) loadApprovals();
  }, [activeTab]);

  const refreshChangeRequests = () => {
    dispatch(getMyChangeRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  const refreshRequests = () => {
    dispatch(getMyRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <PortalIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Employee Self-Service
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
          {activeTab === 0 && <ProfileChangesTab onRefresh={refreshChangeRequests} />}
          {activeTab === 1 && <MySalaryTab />}
          {activeTab === 2 && <MyTeamTab />}
          {activeTab === 3 && <MyRequestsTab />}
          {activeTab === 4 && <HRApprovalsTab onRefresh={refreshChangeRequests} />}
        </Box>
      </Paper>
    </Box>
  );
}
