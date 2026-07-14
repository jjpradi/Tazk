import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Chip, Rating, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  submitSelfReviewAction, getMyAppraisalsAction,
  getKraScoresAction, upsertKraScoreAction,
} from 'redux/actions/performance.actions';

const statusColors = {
  not_started: { color: '#757575', bg: '#f5f5f5', label: 'Not Started' },
  self_review: { color: '#ed6c02', bg: '#fff3e0', label: 'Self Review' },
  manager_review: { color: '#9c27b0', bg: '#f3e5f5', label: 'Manager Review' },
  hr_review: { color: '#0097a7', bg: '#e0f7fa', label: 'HR Review' },
  completed: { color: '#2e7d32', bg: '#e8f5e9', label: 'Completed' },
};

export default function MyAppraisalTab() {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { myAppraisals, kraScores } } = useSelector((s) => s);

  const [openReview, setOpenReview] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [selfRating, setSelfRating] = useState(0);
  const [selfComments, setSelfComments] = useState('');

  const appraisals = myAppraisals || [];

  const openSelfReview = (a) => {
    setSelectedAppraisal(a);
    setSelfRating(a.self_rating || 0);
    setSelfComments(a.self_comments || '');
    if (a.template_id) {
      dispatch(getKraScoresAction(a.id, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpenReview(true);
  };

  const handleSubmitSelfReview = async () => {
    await dispatch(submitSelfReviewAction(
      { id: selectedAppraisal.id, self_rating: selfRating, self_comments: selfComments },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setOpenReview(false);
    dispatch(getMyAppraisalsAction(setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>My Appraisals</Typography>

      {appraisals.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No appraisals assigned to you yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {appraisals.map((a) => {
            const sc = statusColors[a.status] || statusColors.not_started;
            const canSelfReview = a.status === 'not_started' || a.status === 'self_review';
            return (
              <Grid key={a.id} size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.cycle_name}</Typography>
                      <Chip size='small' label={sc.label}
                        sx={{ fontSize: 9, height: 18, fontWeight: 600, bgcolor: sc.bg, color: sc.color, mt: 0.3 }} />
                    </Box>
                    {canSelfReview && (
                      <Button size='small' variant='contained' startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                        onClick={() => openSelfReview(a)}
                        sx={{ textTransform: 'none', fontSize: 11 }}>
                        Self Review
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Self Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={a.self_rating || 0} max={a.rating_scale || 5} readOnly size='small' />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{a.self_rating || '-'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Manager Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={a.manager_rating || 0} max={a.rating_scale || 5} readOnly size='small' />
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{a.manager_rating || '-'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Final Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: a.final_rating ? '#ffa726' : '#e0e0e0' }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: a.final_rating ? '#e65100' : 'text.disabled' }}>
                          {a.final_rating || '-'}
                        </Typography>
                        {a.rating_label && (
                          <Chip size='small' label={a.rating_label}
                            sx={{ fontSize: 9, height: 18, bgcolor: '#fff3e0', color: '#e65100' }} />
                        )}
                      </Box>
                    </Grid>
                    {(a.increment_recommended || a.promotion_recommended) && (
                      <Grid size={{ xs: 6 }}>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Recommendations</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                          {a.increment_recommended ? <Chip size='small' label='Increment' sx={{ fontSize: 9, height: 18, bgcolor: '#e8f5e9', color: '#2e7d32' }} /> : null}
                          {a.promotion_recommended ? <Chip size='small' label='Promotion' sx={{ fontSize: 9, height: 18, bgcolor: '#e3f2fd', color: '#1565c0' }} /> : null}
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {a.self_review_deadline && (
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                      Self review due: {a.self_review_deadline.substring(0, 10)}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Self Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          Self Review — {selectedAppraisal?.cycle_name}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Overall Self Rating</Typography>
            <Rating
              value={selfRating} max={selectedAppraisal?.rating_scale || 5}
              onChange={(_, v) => setSelfRating(v)}
              size='large'
            />
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {selfRating} / {selectedAppraisal?.rating_scale || 5}
            </Typography>
          </Box>
          <TextField label='Self Review Comments' size='small' fullWidth multiline rows={4}
            value={selfComments} onChange={(e) => setSelfComments(e.target.value)}
            placeholder='Describe your key achievements, challenges, and areas of improvement...' />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReview(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmitSelfReview}
            disabled={!selfRating}
            sx={{ textTransform: 'none' }}>
            Submit Self Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
