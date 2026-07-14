import React, { useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import FlagIcon from '@mui/icons-material/Flag';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getCyclesAction,
  getTemplatesAction,
  getMyAppraisalsAction,
  getGoalsAction,
  getDashboardStatsAction,
} from 'redux/actions/performance.actions';
import AppraisalCyclesTab from './tabs/AppraisalCyclesTab';
import KraTemplatesTab from './tabs/KraTemplatesTab';
import MyAppraisalTab from './tabs/MyAppraisalTab';
import TeamAppraisalsTab from './tabs/TeamAppraisalsTab';
import GoalsTab from './tabs/GoalsTab';
import PerfDashboardTab from './tabs/PerfDashboardTab';

const tabConfig = [
  { label: 'Appraisal Cycles', icon: <EventNoteIcon /> },
  { label: 'KRA Templates', icon: <AssignmentIcon /> },
  { label: 'My Appraisal', icon: <PersonIcon /> },
  { label: 'Team Appraisals', icon: <GroupsIcon /> },
  { label: 'Goals', icon: <FlagIcon /> },
  { label: 'Dashboard', icon: <DashboardIcon /> },
];

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    dispatch(getCyclesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getTemplatesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getMyAppraisalsAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getGoalsAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  const refreshCycles = () => {
    dispatch(getCyclesAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getDashboardStatsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  const refreshTemplates = () => {
    dispatch(getTemplatesAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  const refreshGoals = () => {
    dispatch(getGoalsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <TrendingUpIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Performance Management
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
          {activeTab === 0 && <AppraisalCyclesTab onRefresh={refreshCycles} />}
          {activeTab === 1 && <KraTemplatesTab onRefresh={refreshTemplates} />}
          {activeTab === 2 && <MyAppraisalTab />}
          {activeTab === 3 && <TeamAppraisalsTab />}
          {activeTab === 4 && <GoalsTab onRefresh={refreshGoals} />}
          {activeTab === 5 && <PerfDashboardTab />}
        </Box>
      </Paper>
    </Box>
  );
}
