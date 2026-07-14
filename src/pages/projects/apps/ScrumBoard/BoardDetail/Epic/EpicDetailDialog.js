import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { Fonts } from 'shared/constants/AppEnums';

const getStatusColor = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'done' || s === 'completed' || s === 'closed') return { bg: '#e8f5e9', color: '#2e7d32' };
  if (s === 'in progress' || s === 'in-progress' || s === 'inprogress') return { bg: '#e3f2fd', color: '#1565c0' };
  if (s === 'blocked' || s === 'on hold' || s === 'onhold') return { bg: '#fce4ec', color: '#c62828' };
  if (s === 'to do' || s === 'todo' || s === 'open' || s === 'new') return { bg: '#f3e5f5', color: '#7b1fa2' };
  return { bg: '#f5f5f5', color: '#616161' };
};

const getPriorityMeta = (priority) => {
  const value = String(priority || '').toLowerCase();
  if (value.includes('highest') || value === '1') return { label: 'Highest', color: '#750909' };
  if (value.includes('high')) return { label: 'High', color: '#e02847' };
  if (value.includes('medium') || value === '2') return { label: 'Medium', color: '#ed6c02' };
  if (value.includes('low') || value === '3') return { label: 'Low', color: '#2e7d32' };
  return { label: 'None', color: '#9e9e9e' };
};

const formatHoursDisplay = (totalHours) => {
  if (!totalHours || totalHours <= 0) return '0h';
  let mins = Math.round(totalHours * 60);
  const w = Math.floor(mins / (48 * 60));
  mins %= 48 * 60;
  const d = Math.floor(mins / (8 * 60));
  mins %= 8 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const parts = [];
  if (w) parts.push(`${w}w`);
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
};

const EpicDetailDialog = ({
  open,
  onClose,
  isLoading,
  selectedRow,
  detailName,
  detailKey,
  detailStatus,
  detailGoal,
  detailDescription,
  detailOwner,
  detailReporter,
  detailCreated,
  detailUpdated,
  detailTasks,
  tasksLoading,
  taskStats,
  progressView,
  setProgressView,
  handleOpenEdit,
  setEpicFormData,
  setIsEpicFormOpen,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'hidden',
          padding: 1,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={1.5}>
            <Typography
              variant='h4'
              sx={{ color: 'text.primary', fontWeight: Fonts.BOLD }}
            >
              {detailName}
            </Typography>
            <Chip
              size='small'
              label='Epic'
              sx={{
                bgcolor: theme.palette.info.light,
                color: theme.palette.info.main,
                fontWeight: Fonts.SEMI_BOLD,
                fontSize: 11,
              }}
            />
            {detailStatus !== '-' && (
              <Chip
                size='small'
                label={detailStatus}
                sx={{
                  bgcolor: getStatusColor(detailStatus).bg,
                  color: getStatusColor(detailStatus).color,
                  fontWeight: Fonts.SEMI_BOLD,
                  fontSize: 11,
                }}
              />
            )}
          </Box>
          <Box display='flex' alignItems='center' gap={1}>
            <Button
              size='small'
              variant='outlined'
              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
              onClick={(e) => {
                onClose();
                handleOpenEdit(e, selectedRow);
              }}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Edit
            </Button>
            <Button
              size='small'
              variant='contained'
              color='primary'
              onClick={() => {
                onClose();
                setEpicFormData(null);
                setIsEpicFormOpen(true);
              }}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              + Add New
            </Button>
            <IconButton onClick={onClose} size='small' sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <Box display='flex' alignItems='center' justifyContent='center' gap={2} py={6}>
            <CircularProgress size={24} color='primary' />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Loading epic details...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Details Grid */}
            <Box sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: 'background.default' }}>
              <Typography
                variant='subtitle2'
                sx={{ color: 'text.primary', fontWeight: Fonts.BOLD, mb: 1.5 }}
              >
                Details
              </Typography>
              <Box display='grid' gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2} sx={{ py: 1.5, px: 1 }}>
                <DetailRow label='Epic Id'>
                  <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: Fonts.SEMI_BOLD }}>
                    {detailKey}
                  </Typography>
                </DetailRow>

                <DetailRow label='Status'>
                  {detailStatus !== '-' ? (
                    <Chip size='small' label={detailStatus} sx={{ fontWeight: Fonts.SEMI_BOLD, fontSize: 11, height: 24 }} />
                  ) : (
                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>-</Typography>
                  )}
                </DetailRow>

                <DetailRow label='Assignee'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'primary.main' }}>
                      {detailOwner !== '-' ? detailOwner[0]?.toUpperCase() : '-'}
                    </Avatar>
                    <Typography variant='body2' sx={{ color: 'text.primary' }}>{detailOwner}</Typography>
                  </Box>
                </DetailRow>

                <DetailRow label='Reporter'>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'info.main' }}>
                      {detailReporter !== '-' ? detailReporter[0]?.toUpperCase() : '-'}
                    </Avatar>
                    <Typography variant='body2' sx={{ color: 'text.primary' }}>{detailReporter}</Typography>
                  </Box>
                </DetailRow>

                <DetailRow label='Created'>
                  <Typography variant='body2' sx={{ color: 'text.primary' }}>{detailCreated}</Typography>
                </DetailRow>

                <DetailRow label='Updated'>
                  <Typography variant='body2' sx={{ color: 'text.primary' }}>{detailUpdated}</Typography>
                </DetailRow>
              </Box>
            </Box>

            <Divider />

            {/* Lane Chips + Progress */}
            <Box sx={{ px: 3, pt: 2, pb: 2 }}>
              <Box display='flex' flexWrap='wrap' gap={1} mb={2} sx={{ py: 2 }}>
                {taskStats.laneBreakdown.map((lane) => (
                  <Chip
                    key={lane.name}
                    size='small'
                    label={`${lane.name}: ${lane.TaskStatusCounts}`}
                    sx={{
                      bgcolor: getStatusColor(lane.name).bg,
                      color: getStatusColor(lane.name).color,
                      fontWeight: Fonts.SEMI_BOLD,
                      fontSize: 11,
                      py: 3,
                    }}
                  />
                ))}
                <Chip
                  size='small'
                  label={`Total: ${taskStats.total}`}
                  sx={{
                    bgcolor: theme.palette.gray[100],
                    color: 'text.primary',
                    fontWeight: Fonts.BOLD,
                    fontSize: 11,
                  }}
                />
              </Box>

              {/* Progress Toggle */}
              <Box display='flex' alignItems='center' justifyContent='space-between' mb={2} sx={{ py: 2 }}>
                <ToggleButtonGroup
                  value={progressView}
                  exclusive
                  onChange={(e, val) => { if (val) setProgressView(val); }}
                  size='small'
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'capitalize',
                      fontSize: 12,
                      fontWeight: Fonts.MEDIUM,
                      px: 2,
                      py: 0.5,
                    },
                  }}
                >
                  <ToggleButton value='task'>Task Progress</ToggleButton>
                  <ToggleButton value='log'>Log Progress</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Progress Bar */}
              {progressView === 'task' ? (
                <TaskProgressBar taskStats={taskStats} />
              ) : (
                <LogProgressBar taskStats={taskStats} />
              )}
            </Box>

            <Divider />

            {/* Goal/Description (left) | Child Tasks (right) */}
            <Box
              display='grid'
              gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
              gap={0}
              sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
            >
              {/* Left Column */}
              <Box sx={{ p: 3, borderRight: (t) => ({ md: `1px solid ${t.palette.divider}` }) }}>
                <Box display='flex' flexDirection='column' gap={2.5}>
                  <InfoBlock label='Goal'>
                    <Typography variant='body2' sx={{ color: detailGoal !== '-' ? 'text.primary' : 'text.disabled' }}>
                      {detailGoal !== '-' ? detailGoal : 'No goal defined.'}
                    </Typography>
                  </InfoBlock>
                  <InfoBlock label='Description'>
                    <Typography
                      variant='body2'
                      sx={{ color: detailDescription ? 'text.primary' : 'text.disabled', whiteSpace: 'pre-wrap' }}
                    >
                      {detailDescription || 'No description provided.'}
                    </Typography>
                  </InfoBlock>
                </Box>
              </Box>

              {/* Right Column — Child Tasks */}
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box display='flex' alignItems='center' justifyContent='space-between' mb={1.5} flexShrink={0}>
                  <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: Fonts.SEMI_BOLD }}>
                    Child Tasks ({taskStats.total})
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
                  {tasksLoading ? (
                    <Box display='flex' alignItems='center' gap={1} py={2}>
                      <CircularProgress size={16} />
                      <Typography variant='body2' sx={{ color: 'text.disabled' }}>Loading tasks...</Typography>
                    </Box>
                  ) : detailTasks.length ? (
                    <Box display='flex' flexDirection='column' gap={0.5}>
                      {detailTasks.map((task, index) => {
                        const taskName = task?.task_name || task?.name || `Task ${index + 1}`;
                        const taskKey = task?.task_id || task?.id || '-';
                        const statusLabel = task?.status_name || '-';
                        const sc = getStatusColor(statusLabel);
                        const assigneeName = task?.full_name || '-';
                        const taskPriority = getPriorityMeta(task?.priority_name || task?.priority);
                        return (
                          <Box
                            key={taskKey}
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                            sx={{
                              bgcolor: 'background.default',
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'grey.100' },
                            }}
                          >
                            <Box display='flex' alignItems='center' gap={1} minWidth={0}>
                              <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0 }}>
                                {taskKey}
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: 'text.primary',
                                  fontSize: 13,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {taskName}
                              </Typography>
                            </Box>
                            <Box display='flex' alignItems='center' gap={0.5} flexShrink={0} ml={1}>
                              <Tooltip title={assigneeName}>
                                <Avatar sx={{ width: 18, height: 18, fontSize: 9, bgcolor: 'primary.main' }}>
                                  {assigneeName !== '-' ? assigneeName[0]?.toUpperCase() : '-'}
                                </Avatar>
                              </Tooltip>
                              <Typography
                                variant='caption'
                                sx={{ color: taskPriority.color, fontWeight: Fonts.SEMI_BOLD, fontSize: 10 }}
                              >
                                {taskPriority.label}
                              </Typography>
                              <Chip
                                size='small'
                                label={statusLabel}
                                sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: Fonts.SEMI_BOLD, fontSize: 10, height: 22 }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        py: 3,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                        No tasks linked to this epic.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, children }) => (
  <Box display='flex' justifyContent='space-between' alignItems='center'>
    <Typography variant='caption' sx={{ color: 'text.secondary' }}>{label}</Typography>
    {children}
  </Box>
);

const InfoBlock = ({ label, children }) => (
  <Box>
    <Typography
      variant='caption'
      sx={{ color: 'text.secondary', fontWeight: Fonts.SEMI_BOLD, mb: 0.5, display: 'block' }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  </Box>
);

const TaskProgressBar = ({ taskStats }) => {
  const completedCount = taskStats.laneBreakdown.reduce((sum, l) => {
    const n = String(l.name || '').toLowerCase();
    return (n === 'done' || n === 'completed' || n === 'closed') ? sum + l.TaskStatusCounts : sum;
  }, 0);
  const progressValue = taskStats.total > 0 ? Math.round((completedCount / taskStats.total) * 100) : 0;

  return (
    <>
      <LinearProgress
        variant='determinate'
        value={progressValue}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'grey.300',
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'text.primary' },
        }}
      />
      <Box display='flex' justifyContent='space-between' mt={0.5}>
        <Typography variant='caption' sx={{ color: 'text.primary', fontWeight: Fonts.SEMI_BOLD }}>
          {completedCount} / {taskStats.total} tasks
        </Typography>
      </Box>
    </>
  );
};

const LogProgressBar = ({ taskStats }) => (
  <>
    <Box sx={{ display: 'flex', height: 6, borderRadius: 3, bgcolor: 'grey.300', overflow: 'hidden' }}>
      <Box
        sx={{
          width: taskStats.overloggedHours > 0
            ? `${Math.round((taskStats.estimatedHours / taskStats.loggedHours) * 100)}%`
            : `${Math.min(taskStats.logProgress, 100)}%`,
          bgcolor: 'text.primary',
          borderRadius: taskStats.overloggedHours > 0 ? '3px 0 0 3px' : 3,
          transition: 'width 0.3s',
        }}
      />
      {taskStats.overloggedHours > 0 && (
        <Box
          sx={{
            width: `${Math.round((taskStats.overloggedHours / taskStats.loggedHours) * 100)}%`,
            bgcolor: 'error.main',
            borderRadius: '0 3px 3px 0',
            transition: 'width 0.3s',
          }}
        />
      )}
    </Box>
    <Box display='flex' justifyContent='space-between' mt={0.5}>
      <Typography variant='caption' sx={{ color: 'primary.main', fontWeight: Fonts.SEMI_BOLD }}>
        {formatHoursDisplay(taskStats.loggedHours)} logged
      </Typography>
      {taskStats.overloggedHours > 0 ? (
        <Typography variant='caption' sx={{ color: 'error.main', fontWeight: Fonts.SEMI_BOLD }}>
          {formatHoursDisplay(taskStats.overloggedHours)} over-logged
        </Typography>
      ) : (
        <Typography variant='caption' sx={{ color: 'warning.main', fontWeight: Fonts.SEMI_BOLD }}>
          {formatHoursDisplay(taskStats.remainingHours)} remaining
        </Typography>
      )}
    </Box>
  </>
);

export default EpicDetailDialog;
