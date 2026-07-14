import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getPoliciesAction,
  getActivePoliciesAction,
  getComplianceDashboardAction,
  getPendingAcknowledgmentsAction,
  getMyAcknowledgedPoliciesAction,
} from 'redux/actions/hrPolicies.actions';
import PoliciesListTab from './tabs/PoliciesListTab';
import ComplianceDashboardTab from './tabs/ComplianceDashboardTab';
import MyPoliciesTab from './tabs/MyPoliciesTab';
import AcknowledgmentTrackingTab from './tabs/AcknowledgmentTrackingTab';

const tabConfig = [
  { label: 'All Policies', icon: <ListAltIcon /> },
  { label: 'Compliance Dashboard', icon: <DashboardIcon /> },
  { label: 'My Policies', icon: <FactCheckIcon /> },
  { label: 'Acknowledgment Tracking', icon: <PersonSearchIcon /> },
];

export default function HrPoliciesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    dispatch(getPoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getActivePoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getComplianceDashboardAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getPendingAcknowledgmentsAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getMyAcknowledgedPoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  const refreshPolicies = () => {
    dispatch(getPoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getActivePoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getComplianceDashboardAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <GavelIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          HR Policies & Compliance
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
          {activeTab === 0 && <PoliciesListTab onRefresh={refreshPolicies} />}
          {activeTab === 1 && <ComplianceDashboardTab />}
          {activeTab === 2 && <MyPoliciesTab />}
          {activeTab === 3 && <AcknowledgmentTrackingTab />}
        </Box>
      </Paper>
    </Box>
  );
}
