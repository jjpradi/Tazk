import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, MenuItem, Chip, Rating,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider,
} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getTeamAppraisalsAction, submitManagerReviewAction, getAppraisalsByCycleAction,
} from 'redux/actions/performance.actions';

const statusColors = {
  not_started: { color: '#757575', label: 'Not Started' },
  self_review: { color: '#ed6c02', label: 'Self Review' },
  manager_review: { color: '#9c27b0', label: 'Awaiting Your Review' },
  hr_review: { color: '#0097a7', label: 'HR Review' },
  completed: { color: '#2e7d32', label: 'Completed' },
};

export default function TeamAppraisalsTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { cycles, teamAppraisals } } = useSelector((s) => s);

  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [openReview, setOpenReview] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    manager_rating: 0, manager_comments: '',
    increment_recommended: false, promotion_recommended: false, training_recommended: '',
  });

  const activeCycles = (cycles || []).filter((c) => c.status !== 'draft' && c.status !== 'completed');
  const team = teamAppraisals || [];

  const handleSelectCycle = (id) => {
    setSelectedCycleId(id);
    if (id) dispatch(getTeamAppraisalsAction(id, setModalTypeHandler, setLoaderStatusHandler));
  };

  const openManagerReview = (a) => {
    setSelected(a);
    setReviewForm({
      manager_rating: a.manager_rating || 0,
      manager_comments: a.manager_comments || '',
      increment_recommended: !!a.increment_recommended,
      promotion_recommended: !!a.promotion_recommended,
      training_recommended: a.training_recommended || '',
    });
    setOpenReview(true);
  };

  const handleSubmit = async () => {
    await dispatch(submitManagerReviewAction(
      { id: selected.id, ...reviewForm },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setOpenReview(false);
    dispatch(getTeamAppraisalsAction(selectedCycleId, setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>Team Appraisals (Manager View)</Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <TextField label='Select Cycle' size='small' fullWidth select
          value={selectedCycleId} onChange={(e) => handleSelectCycle(e.target.value)}>
          <MenuItem value=''>-- Select --</MenuItem>
          {activeCycles.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.cycle_name} ({c.status.replace(/_/g, ' ')})</MenuItem>
          ))}
        </TextField>
      </Paper>

      {!selectedCycleId ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Select a cycle to view your team members' appraisals.</Typography>
        </Paper>
      ) : team.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>No team appraisals found for this cycle.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {team.map((a) => {
            const sc = statusColors[a.status] || statusColors.not_started;
            const canReview = a.status === 'manager_review';
            return (
              <Grid key={a.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>
                      {(a.employee_name || '?')[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{a.employee_name}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                        {a.employee_code} | {a.designation || ''} {a.department_name ? `| ${a.department_name}` : ''}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip size='small' label={sc.label}
                    sx={{ fontSize: 9, height: 18, fontWeight: 600, color: sc.color, mb: 1 }} />

                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Self</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.self_rating || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Manager</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.manager_rating || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Final</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: a.final_rating ? '#e65100' : 'text.disabled' }}>
                        {a.final_rating || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {canReview && (
                    <Button size='small' variant='contained' fullWidth onClick={() => openManagerReview(a)}
                      sx={{ textTransform: 'none', fontSize: 11, mt: 0.5 }}>
                      Submit Manager Review
                    </Button>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Manager Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          Manager Review — {selected?.employee_name}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {selected?.self_rating && (
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.3 }}>Employee Self Assessment</Typography>
              <Typography sx={{ fontSize: 11 }}>Rating: {selected.self_rating}/{selected.rating_scale}</Typography>
              {selected.self_comments && (
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{selected.self_comments}</Typography>
              )}
            </Paper>
          )}
          <Divider />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Manager Rating</Typography>
            <Rating value={reviewForm.manager_rating} max={selected?.rating_scale || 5}
              onChange={(_, v) => setReviewForm({ ...reviewForm, manager_rating: v })} size='large' />
          </Box>
          <TextField label='Manager Comments' size='small' fullWidth multiline rows={3}
            value={reviewForm.manager_comments}
            onChange={(e) => setReviewForm({ ...reviewForm, manager_comments: e.target.value })} />
          <TextField label='Training Recommended' size='small' fullWidth
            value={reviewForm.training_recommended}
            onChange={(e) => setReviewForm({ ...reviewForm, training_recommended: e.target.value })}
            placeholder='Suggest training programs if any' />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label='Recommend Increment' clickable
              color={reviewForm.increment_recommended ? 'success' : 'default'}
              variant={reviewForm.increment_recommended ? 'filled' : 'outlined'}
              onClick={() => setReviewForm({ ...reviewForm, increment_recommended: !reviewForm.increment_recommended })}
              sx={{ fontSize: 11 }} />
            <Chip label='Recommend Promotion' clickable
              color={reviewForm.promotion_recommended ? 'primary' : 'default'}
              variant={reviewForm.promotion_recommended ? 'filled' : 'outlined'}
              onClick={() => setReviewForm({ ...reviewForm, promotion_recommended: !reviewForm.promotion_recommended })}
              sx={{ fontSize: 11 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReview(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit} disabled={!reviewForm.manager_rating}
            sx={{ textTransform: 'none' }}>Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
