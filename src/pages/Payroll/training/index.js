import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getSkillsAction,
  getProgramsAction,
  getSessionsAction,
  getEmployeeSkillsAction,
  getDashboardStatsAction as getTrainingDashboardAction,
  getCategoryBreakdownAction,
  getSkillGapSummaryAction,
} from 'redux/actions/training.actions';
import ProgramsTab from './tabs/ProgramsTab';
import SessionsTab from './tabs/SessionsTab';
import EnrollmentsTab from './tabs/EnrollmentsTab';
import FeedbackTab from './tabs/FeedbackTab';
import SkillsCompetenciesTab from './tabs/SkillsCompetenciesTab';
import TrainingDashboardTab from './tabs/TrainingDashboardTab';

const tabConfig = [
  { label: 'Programs', icon: <SchoolIcon /> },
  { label: 'Sessions', icon: <EventNoteIcon /> },
  { label: 'Enrollments', icon: <HowToRegIcon /> },
  { label: 'Feedback', icon: <RateReviewIcon /> },
  { label: 'Skills & Competencies', icon: <PsychologyIcon /> },
  { label: 'Dashboard', icon: <DashboardIcon /> },
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const {
    skills, programs, sessions, employeeSkills,
    dashboard, categoryBreakdown, skillGap,
  } = useSelector((st) => st.TrainingReducer);

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  useEffect(() => {
    dispatch(getSkillsAction(s, l));
    dispatch(getProgramsAction(s, l));
    dispatch(getSessionsAction(s, l));
    dispatch(getEmployeeSkillsAction(s, l));
    dispatch(getTrainingDashboardAction(s, l));
    dispatch(getCategoryBreakdownAction(s, l));
    dispatch(getSkillGapSummaryAction(s, l));
  }, []);

  const refreshSkills = () => dispatch(getSkillsAction(s, l));
  const refreshPrograms = () => {
    dispatch(getProgramsAction(s, l));
    dispatch(getTrainingDashboardAction(s, l));
  };
  const refreshSessions = () => {
    dispatch(getSessionsAction(s, l));
    dispatch(getTrainingDashboardAction(s, l));
  };
  const refreshEmployeeSkills = () => {
    dispatch(getEmployeeSkillsAction(s, l));
    dispatch(getSkillGapSummaryAction(s, l));
  };
  const refreshDashboard = () => {
    dispatch(getTrainingDashboardAction(s, l));
    dispatch(getCategoryBreakdownAction(s, l));
    dispatch(getSkillGapSummaryAction(s, l));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Training & Learning Management
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabConfig.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <ProgramsTab programs={programs} skills={skills} refreshPrograms={refreshPrograms} />
      )}
      {activeTab === 1 && (
        <SessionsTab sessions={sessions} programs={programs} refreshSessions={refreshSessions} />
      )}
      {activeTab === 2 && (
        <EnrollmentsTab sessions={sessions} refreshSessions={refreshSessions} />
      )}
      {activeTab === 3 && (
        <FeedbackTab sessions={sessions} />
      )}
      {activeTab === 4 && (
        <SkillsCompetenciesTab
          skills={skills}
          employeeSkills={employeeSkills}
          refreshSkills={refreshSkills}
          refreshEmployeeSkills={refreshEmployeeSkills}
        />
      )}
      {activeTab === 5 && (
        <TrainingDashboardTab
          dashboard={dashboard}
          categoryBreakdown={categoryBreakdown}
          skillGap={skillGap}
          refreshDashboard={refreshDashboard}
        />
      )}
    </Box>
  );
}
