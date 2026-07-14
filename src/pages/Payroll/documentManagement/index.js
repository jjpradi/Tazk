import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getDocumentDashboardAction,
  getDocumentCategoriesAction,
  getPendingVerificationsAction,
  getExpiringDocumentsAction,
  getVerificationTypesAction,
} from 'redux/actions/documentManagement.actions';
import DocDashboardTab from './tabs/DocDashboardTab';
import EmployeeDocsTab from './tabs/EmployeeDocsTab';
import PendingVerificationsTab from './tabs/PendingVerificationsTab';
import ExpiringDocsTab from './tabs/ExpiringDocsTab';
import CategoriesConfigTab from './tabs/CategoriesConfigTab';

const tabConfig = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Employee Documents', icon: <FolderIcon /> },
  { label: 'Pending Verifications', icon: <PendingActionsIcon /> },
  { label: 'Expiring Documents', icon: <WarningAmberIcon /> },
  { label: 'Categories', icon: <SettingsIcon /> },
];

export default function DocumentManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getDocumentDashboardAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getDocumentCategoriesAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getPendingVerificationsAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getExpiringDocumentsAction(30, setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getVerificationTypesAction(setModalTypeHandler, setLoaderStatusHandler))),
      ]);
    };
    loadAll();
  }, []);

  const refreshDashboard = () => {
    dispatch(getDocumentDashboardAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getPendingVerificationsAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getExpiringDocumentsAction(30, setModalTypeHandler, setLoaderStatusHandler));
  };

  const refreshCategories = () => {
    dispatch(getDocumentCategoriesAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <FolderSharedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Document Management
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
          {activeTab === 0 && <DocDashboardTab />}
          {activeTab === 1 && <EmployeeDocsTab onRefresh={refreshDashboard} />}
          {activeTab === 2 && <PendingVerificationsTab onRefresh={refreshDashboard} />}
          {activeTab === 3 && <ExpiringDocsTab />}
          {activeTab === 4 && <CategoriesConfigTab onRefresh={refreshCategories} />}
        </Box>
      </Paper>
    </Box>
  );
}
