import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Tab, Tabs, Paper,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getHeadcountSummaryAction,
  getHeadcountByDeptAction,
  getHeadcountByGradeAction,
  getHeadcountTrendAction,
  getAttritionSummaryAction,
  getAttritionTrendAction,
  getAttritionByDeptAction,
  getAttritionByTenureAction,
  getGenderDiversityAction,
  getAgeDistributionAction,
  getTenureDistributionAction,
  getEmploymentTypeAction,
  getSalaryCostByDeptAction,
  getSalaryCostTrendAction,
  getSalaryCostByGradeAction,
  getProbationDueAction,
  getDocumentExpiryAction,
  getPolicyAckAction,
  getNewJoinersAction,
  getUpcomingBirthdaysAction,
  getWorkAnniversariesAction,
  getHrDashboardKpisAction,
} from 'redux/actions/hrAnalytics.actions';
import HeadcountTab from './tabs/HeadcountTab';
import AttritionTab from './tabs/AttritionTab';
import DemographicsTab from './tabs/DemographicsTab';
import SalaryCostTab from './tabs/SalaryCostTab';
import ComplianceTrackerTab from './tabs/ComplianceTrackerTab';
import HrDashboardTab from './tabs/HrDashboardTab';

const tabConfig = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Headcount & FTE', icon: <PeopleOutlineIcon /> },
  { label: 'Attrition & Turnover', icon: <TrendingDownIcon /> },
  { label: 'Demographics', icon: <GroupsIcon /> },
  { label: 'Salary Cost', icon: <AttachMoneyIcon /> },
  { label: 'Compliance Tracker', icon: <VerifiedUserIcon /> },
];

export default function HrAnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const ha = useSelector((st) => st.HrAnalyticsReducer);
  const s = setModalTypeHandler;
  const l = setLoaderStatusHandler;

  useEffect(() => {
    // Dashboard KPIs
    dispatch(getHrDashboardKpisAction(s, l));
    // Headcount
    dispatch(getHeadcountSummaryAction(s, l));
    dispatch(getHeadcountByDeptAction(s, l));
    dispatch(getHeadcountByGradeAction(s, l));
    dispatch(getHeadcountTrendAction(s, l));
    // Attrition (defaults to current year)
    dispatch(getAttritionSummaryAction(null, null, s, l));
    dispatch(getAttritionTrendAction(s, l));
    dispatch(getAttritionByDeptAction(null, null, s, l));
    dispatch(getAttritionByTenureAction(null, null, s, l));
    // Demographics
    dispatch(getGenderDiversityAction(s, l));
    dispatch(getAgeDistributionAction(s, l));
    dispatch(getTenureDistributionAction(s, l));
    dispatch(getEmploymentTypeAction(s, l));
    // Salary Cost (current month)
    const now = new Date();
    dispatch(getSalaryCostByDeptAction(now.getMonth() + 1, now.getFullYear(), s, l));
    dispatch(getSalaryCostTrendAction(null, null, s, l));
    dispatch(getSalaryCostByGradeAction(now.getMonth() + 1, now.getFullYear(), s, l));
    // Compliance
    dispatch(getProbationDueAction(s, l));
    dispatch(getDocumentExpiryAction(s, l));
    dispatch(getPolicyAckAction(s, l));
    // Events
    dispatch(getNewJoinersAction(null, null, s, l));
    dispatch(getUpcomingBirthdaysAction(s, l));
    dispatch(getWorkAnniversariesAction(s, l));
  }, []);

  const refreshDashboard = () => {
    dispatch(getHrDashboardKpisAction(s, l));
    dispatch(getHeadcountSummaryAction(s, l));
    dispatch(getHeadcountTrendAction(s, l));
    dispatch(getAttritionTrendAction(s, l));
    dispatch(getGenderDiversityAction(s, l));
    dispatch(getUpcomingBirthdaysAction(s, l));
    dispatch(getWorkAnniversariesAction(s, l));
  };

  return (
    <Box sx={{ p: 2 ,maxHeight:'calc(100vh - 80px)',overflowY:'auto'}}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        HR Analytics & Reports
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
        <HrDashboardTab
          dashboard={ha.dashboard}
          headcountSummary={ha.headcountSummary}
          headcountTrend={ha.headcountTrend}
          attritionTrend={ha.attritionTrend}
          genderDiversity={ha.genderDiversity}
          birthdays={ha.birthdays}
          anniversaries={ha.anniversaries}
          refreshDashboard={refreshDashboard}
        />
      )}
      {activeTab === 1 && (
        <HeadcountTab
          headcountSummary={ha.headcountSummary}
          headcountByDept={ha.headcountByDept}
          headcountByGrade={ha.headcountByGrade}
          headcountTrend={ha.headcountTrend}
          newJoiners={ha.newJoiners}
        />
      )}
      {activeTab === 2 && (
        <AttritionTab
          attritionSummary={ha.attritionSummary}
          attritionTrend={ha.attritionTrend}
          attritionByDept={ha.attritionByDept}
          attritionByTenure={ha.attritionByTenure}
          headcountSummary={ha.headcountSummary}
        />
      )}
      {activeTab === 3 && (
        <DemographicsTab
          genderDiversity={ha.genderDiversity}
          ageDistribution={ha.ageDistribution}
          tenureDistribution={ha.tenureDistribution}
          employmentType={ha.employmentType}
        />
      )}
      {activeTab === 4 && (
        <SalaryCostTab
          salaryCostByDept={ha.salaryCostByDept}
          salaryCostTrend={ha.salaryCostTrend}
          salaryCostByGrade={ha.salaryCostByGrade}
        />
      )}
      {activeTab === 5 && (
        <ComplianceTrackerTab
          probationDue={ha.probationDue}
          documentExpiry={ha.documentExpiry}
          policyAck={ha.policyAck}
          birthdays={ha.birthdays}
          anniversaries={ha.anniversaries}
        />
      )}
    </Box>
  );
}
