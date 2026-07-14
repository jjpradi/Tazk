import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Avatar, Chip, Tabs, Tab, Grid, Divider, Paper,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getProfileAction,
  getQualificationsAction,
  getEmergencyContactsAction,
  getWorkHistoryAction,
  getGradesAction,
} from 'redux/actions/employeeProfile.actions';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import QualificationsTab from './tabs/QualificationsTab';
import EmergencyContactsTab from './tabs/EmergencyContactsTab';
import WorkHistoryTab from './tabs/WorkHistoryTab';
import EmploymentInfoTab from './tabs/EmploymentInfoTab';
import BankStatutoryTab from './tabs/BankStatutoryTab';

const tabConfig = [
  { label: 'Personal', icon: <PersonIcon fontSize='small' /> },
  { label: 'Employment', icon: <BadgeIcon fontSize='small' /> },
  { label: 'Qualifications', icon: <SchoolIcon fontSize='small' /> },
  { label: 'Emergency Contacts', icon: <ContactPhoneIcon fontSize='small' /> },
  { label: 'Work History', icon: <WorkHistoryIcon fontSize='small' /> },
  { label: 'Bank & Statutory', icon: <AccountBalanceIcon fontSize='small' /> },
];

export default function EmployeeProfileDetail({ employeeId }) {
  const [activeTab, setActiveTab] = useState(0);

  const dispatch = useDispatch();
  const { EmployeeProfileReducer: { currentProfile, grades } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    if (employeeId) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getProfileAction(employeeId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(getQualificationsAction(employeeId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(getEmergencyContactsAction(employeeId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(getWorkHistoryAction(employeeId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(getGradesAction(setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
  }, [employeeId]);

  const profile = currentProfile;

  return (
    <Box sx={{ px: { xs: 1, md: 2 } }}>
      {/* Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}15)`,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            src={profile?.image || undefined}
            sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}
          >
            {!profile?.image && (profile?.full_name?.[0] || <PersonIcon />)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 0.3 }}>
              {profile?.full_name || '-'}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
              {profile?.employee_code || '-'} &nbsp;|&nbsp; {profile?.designation || '-'} &nbsp;|&nbsp; {profile?.department_name || '-'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {profile?.grade_name && (
                <Chip label={`${profile.grade_code} - ${profile.grade_name}`} size='small' color='primary' variant='outlined' />
              )}
              {profile?.employment_type && (
                <Chip
                  label={profile.employment_type.charAt(0).toUpperCase() + profile.employment_type.slice(1)}
                  size='small'
                  color={profile.employment_type === 'permanent' ? 'success' : 'warning'}
                  variant='outlined'
                />
              )}
              {profile?.email && (
                <Chip label={profile.email} size='small' variant='outlined' sx={{ fontSize: 11 }} />
              )}
              {profile?.phone_number && (
                <Chip label={profile.phone_number} size='small' variant='outlined' sx={{ fontSize: 11 }} />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 500, minHeight: 48 },
          }}
        >
          {tabConfig.map((tab, idx) => (
            <Tab key={idx} label={tab.label} icon={tab.icon} iconPosition='start' />
          ))}
        </Tabs>

        <Box sx={{ p: 3, minHeight: 400 }}>
          {activeTab === 0 && <PersonalInfoTab profile={profile} employeeId={employeeId} />}
          {activeTab === 1 && <EmploymentInfoTab profile={profile} employeeId={employeeId} grades={grades} />}
          {activeTab === 2 && <QualificationsTab employeeId={employeeId} />}
          {activeTab === 3 && <EmergencyContactsTab employeeId={employeeId} />}
          {activeTab === 4 && <WorkHistoryTab employeeId={employeeId} />}
          {activeTab === 5 && <BankStatutoryTab profile={profile} />}
        </Box>
      </Paper>
    </Box>
  );
}
