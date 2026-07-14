import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper, Chip, Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getDashboardStatsAction,
  getProbationEmployeesAction,
  getOnboardingDashboardAction,
  getChecklistTemplatesAction,
  getAllPendingFnfAction,
} from 'redux/actions/employeeLifecycle.actions';
import LifecycleDashboard from './tabs/LifecycleDashboard';
import OnboardingTab from './tabs/OnboardingTab';
import ProbationTab from './tabs/ProbationTab';
import LifecycleEventsTab from './tabs/LifecycleEventsTab';
import SeparationFnfTab from './tabs/SeparationFnfTab';
import ChecklistConfigTab from './tabs/ChecklistConfigTab';

const tabConfig = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Onboarding', icon: <PlaylistAddCheckIcon /> },
  { label: 'Probation', icon: <TrendingUpIcon /> },
  { label: 'Lifecycle Events', icon: <AssignmentTurnedInIcon /> },
  { label: 'Separation & FnF', icon: <ExitToAppIcon /> },
  { label: 'Checklist Config', icon: <GavelIcon /> },
];

export default function EmployeeLifecyclePage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getProbationEmployeesAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getOnboardingDashboardAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getChecklistTemplatesAction(setModalTypeHandler, setLoaderStatusHandler))),
        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
          dispatch(getAllPendingFnfAction(setModalTypeHandler, setLoaderStatusHandler))),
      ]);
    };
    loadAll();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AssignmentTurnedInIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Employee Lifecycle
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
          {activeTab === 0 && <LifecycleDashboard />}
          {activeTab === 1 && <OnboardingTab />}
          {activeTab === 2 && <ProbationTab />}
          {activeTab === 3 && <LifecycleEventsTab />}
          {activeTab === 4 && <SeparationFnfTab />}
          {activeTab === 5 && <ChecklistConfigTab />}
        </Box>
      </Paper>
    </Box>
  );
}
