import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getStagesAction,
  getJobPositionsAction,
  getCandidatesAction,
  getApplicationsAction,
  getUpcomingInterviewsAction,
  getDashboardStatsAction,
  getPipelineSummaryAction,
  getSourceEffectivenessAction,
} from 'redux/actions/recruitment.actions';
import JobPositionsTab from './tabs/JobPositionsTab';
import CandidatesTab from './tabs/CandidatesTab';
import ApplicationsPipelineTab from './tabs/ApplicationsPipelineTab';
import InterviewsTab from './tabs/InterviewsTab';
import StagesConfigTab from './tabs/StagesConfigTab';
import RecruitDashboardTab from './tabs/RecruitDashboardTab';

const tabConfig = [
  { label: 'Job Positions', icon: <WorkOutlineIcon /> },
  { label: 'Candidates', icon: <PeopleOutlineIcon /> },
  { label: 'Applications', icon: <AssignmentOutlinedIcon /> },
  { label: 'Interviews', icon: <EventAvailableIcon /> },
  { label: 'Pipeline Stages', icon: <SettingsIcon /> },
  { label: 'Dashboard', icon: <DashboardIcon /> },
];

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const {
    stages, jobPositions, candidates, applications,
    upcomingInterviews, dashboard, pipeline, sources,
  } = useSelector((s) => s.RecruitmentReducer);

  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  useEffect(() => {
    dispatch(getStagesAction(s, l));
    dispatch(getJobPositionsAction(s, l));
    dispatch(getCandidatesAction(s, l));
    dispatch(getApplicationsAction(s, l));
    dispatch(getUpcomingInterviewsAction(s, l));
    dispatch(getDashboardStatsAction(s, l));
    dispatch(getPipelineSummaryAction(s, l));
    dispatch(getSourceEffectivenessAction(s, l));
  }, []);

  const refreshStages = () => dispatch(getStagesAction(s, l));
  const refreshJobs = () => {
    dispatch(getJobPositionsAction(s, l));
    dispatch(getDashboardStatsAction(s, l));
  };
  const refreshCandidates = () => {
    dispatch(getCandidatesAction(s, l));
    dispatch(getSourceEffectivenessAction(s, l));
  };
  const refreshApplications = () => {
    dispatch(getApplicationsAction(s, l));
    dispatch(getPipelineSummaryAction(s, l));
    dispatch(getDashboardStatsAction(s, l));
  };
  const refreshInterviews = () => {
    dispatch(getUpcomingInterviewsAction(s, l));
    dispatch(getDashboardStatsAction(s, l));
  };
  const refreshDashboard = () => {
    dispatch(getDashboardStatsAction(s, l));
    dispatch(getPipelineSummaryAction(s, l));
    dispatch(getSourceEffectivenessAction(s, l));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Recruitment & Applicant Tracking
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
        <JobPositionsTab jobPositions={jobPositions} stages={stages} refreshJobs={refreshJobs} />
      )}
      {activeTab === 1 && (
        <CandidatesTab candidates={candidates} refreshCandidates={refreshCandidates} />
      )}
      {activeTab === 2 && (
        <ApplicationsPipelineTab
          applications={applications}
          jobPositions={jobPositions}
          candidates={candidates}
          stages={stages}
          refreshApplications={refreshApplications}
        />
      )}
      {activeTab === 3 && (
        <InterviewsTab
          upcomingInterviews={upcomingInterviews}
          applications={applications}
          refreshInterviews={refreshInterviews}
        />
      )}
      {activeTab === 4 && (
        <StagesConfigTab stages={stages} refreshStages={refreshStages} />
      )}
      {activeTab === 5 && (
        <RecruitDashboardTab
          dashboard={dashboard}
          pipeline={pipeline}
          sources={sources}
          refreshDashboard={refreshDashboard}
        />
      )}
    </Box>
  );
}
