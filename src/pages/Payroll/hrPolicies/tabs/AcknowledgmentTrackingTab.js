import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, MenuItem, TextField, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getPolicyAcknowledgmentsAction } from 'redux/actions/hrPolicies.actions';

export default function AcknowledgmentTrackingTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { HrPoliciesReducer: { activePolicies, acknowledgments } } = useSelector((s) => s);

  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const pList = activePolicies || [];
  const ackList = acknowledgments || [];

  const handleSelectPolicy = (id) => {
    setSelectedPolicyId(id);
    if (id) {
      dispatch(getPolicyAcknowledgmentsAction(id, setModalTypeHandler, setLoaderStatusHandler));
    }
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Acknowledgment Tracking</Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          label='Select Policy' size='small' fullWidth select
          value={selectedPolicyId}
          onChange={(e) => handleSelectPolicy(e.target.value)}
        >
          <MenuItem value=''>-- Select a Policy --</MenuItem>
          {pList.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.policy_name} (v{p.version})</MenuItem>
          ))}
        </TextField>
      </Paper>

      {!selectedPolicyId ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            Select a policy above to view acknowledgment details.
          </Typography>
        </Paper>
      ) : ackList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No acknowledgments recorded for this policy yet.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
            display: 'flex', gap: 2, alignItems: 'center',
          }}>
            <Chip label={`${ackList.length} Acknowledged`}
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 11 }} />
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Acknowledged At</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Version</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ackList.map((ack, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Avatar src={ack.image || undefined}
                          sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.light' }}>
                          {(ack.employee_name || '?')[0]}
                        </Avatar>
                        <Typography sx={{ fontSize: 12 }}>{ack.employee_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>{ack.employee_code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 11 }}>{ack.department_name || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 11 }}>
                        {ack.acknowledged_at ? new Date(ack.acknowledged_at).toLocaleString('en-IN') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size='small' label={`v${ack.policy_version || '-'}`}
                        sx={{ fontSize: 9, height: 18 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
