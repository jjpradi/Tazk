import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, Chip, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DescriptionIcon from '@mui/icons-material/Description';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  acknowledgePolicyAction,
  getPendingAcknowledgmentsAction,
  getMyAcknowledgedPoliciesAction,
} from 'redux/actions/hrPolicies.actions';

export default function MyPoliciesTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { HrPoliciesReducer: { pendingAcks, myAcknowledged } } = useSelector((s) => s);

  const pending = pendingAcks || [];
  const acknowledged = myAcknowledged || [];

  const handleAcknowledge = async (policy_id) => {
    await dispatch(acknowledgePolicyAction({ policy_id }, setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getPendingAcknowledgmentsAction(setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getMyAcknowledgedPoliciesAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box>
      {/* Pending Acknowledgments */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PendingActionsIcon sx={{ fontSize: 20, color: '#ed6c02' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Pending Acknowledgments ({pending.length})
        </Typography>
      </Box>

      {pending.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', mb: 0.5 }} />
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            You have acknowledged all required policies.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {pending.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: '#ffe0b2',
                borderLeft: '4px solid #ed6c02', bgcolor: '#fffbf5',
              }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5 }}>
                  <DescriptionIcon sx={{ fontSize: 18, color: '#ed6c02' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.policy_name}</Typography>
                </Box>
                <Chip size='small' label={p.policy_category?.replace(/_/g, ' ')}
                  sx={{ fontSize: 9, height: 16, mb: 1, textTransform: 'capitalize' }} />

                {p.description && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {p.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {p.acknowledgment_deadline && (
                    <Typography sx={{ fontSize: 10, color: '#c62828', fontWeight: 500 }}>
                      Due: {p.acknowledgment_deadline.substring(0, 10)}
                    </Typography>
                  )}
                  <Button size='small' variant='contained' onClick={() => handleAcknowledge(p.id)}
                    sx={{ textTransform: 'none', fontSize: 11, ml: 'auto' }}>
                    Acknowledge
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Acknowledged Policies */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Acknowledged ({acknowledged.length})
        </Typography>
      </Box>

      {acknowledged.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No acknowledged policies yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {acknowledged.map((p, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                borderLeft: '4px solid #2e7d32',
              }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{p.policy_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  <Chip size='small' label={p.policy_category?.replace(/_/g, ' ')}
                    sx={{ fontSize: 9, height: 16, textTransform: 'capitalize' }} />
                  <Chip size='small' label={`v${p.policy_version || p.version}`}
                    sx={{ fontSize: 9, height: 16 }} />
                </Box>
                <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                  Acknowledged: {p.acknowledged_at ? new Date(p.acknowledged_at).toLocaleDateString('en-IN') : '-'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
