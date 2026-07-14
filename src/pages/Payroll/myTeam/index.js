import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getMyTeamMembersAction,
  getTeamAttendanceSummaryAction,
  getTeamPendingRequestsAction,
} from 'redux/actions/essPortal.actions';
import MyTeamTab from '../essPortal/tabs/MyTeamTab';

export default function MyTeamPage() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    dispatch(getMyTeamMembersAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getTeamAttendanceSummaryAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getTeamPendingRequestsAction(setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <GroupsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          My Team
        </Typography>
      </Box>
      <MyTeamTab />
    </Box>
  );
}
