import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Button,
} from '@mui/material';
import moment from 'moment';
import PayrollDashboardServices from 'services/payrollDashboard_services';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const getPriorityMeta = (priority) => {
  const value = String(priority || '').toLowerCase();
  if (value.includes('highest') || value === '1') {
    return { label: 'Highest', color: '#750909' };
  }
  if (value.includes('high')) {
    return { label: 'High', color: '#e02847' };
  }
  if (value.includes('medium') || value === '2') {
    return { label: 'Medium', color: '#ed6c02' };
  }
  if (value.includes('low') || value === '3') {
    return { label: 'Low', color: '#2e7d32' };
  }
  return { label: 'None', color: '#9e9e9e' };
};

const formatDate = (date) => {
  if (!date) return '-';
  const m = moment(date);
  return m.isValid() ? m.format('MMM D, YYYY') : '-';
};

const getEpicKey = (epic, epicId, projectKey) => {
  return (
    epic?.epic_key ||
    epic?.key ||
    epic?.epicCode ||
    (epicId ? `${projectKey || 'EPIC'}-${epicId}` : '-') ||
    '-'
  );
};

const ProjectEpicTaskList = ({
  epicGroups = [],
  projectKey = '',
  projectId,
  onRefreshEpics,
}) => {
  const normalizedGroups = useMemo(() => {
    return Array.isArray(epicGroups) ? epicGroups : [];
  }, [epicGroups]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [epicDetail, setEpicDetail] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const epicRows = useMemo(() => {
    return normalizedGroups
      .filter((group) => group?.epic)
      .map((group, index) => {
        const epic = group.epic || {};
        const epicId = group.epicId ?? epic?.epic_id ?? epic?.id ?? index + 1;
        const epicName =
          group.epicName ||
          epic?.epic_name ||
          epic?.epic_title ||
          epic?.name ||
          epic?.title ||
          `Epic ${epicId}`;
        const owner =
          epic?.owner_name ||
          epic?.assignee_name ||
          epic?.assigned_staff_name ||
          epic?.reporter_name ||
          epic?.reporter ||
          epic?.assigned_staff ||
          epic?.full_name ||
          '-';
        const status = epic?.status_name || epic?.status || epic?.STATUS || '-';
        const goal = epic?.goal || epic?.objective || epic?.description || '-';
        const dueDate = formatDate(
          epic?.due_date ||
            epic?.dueDate ||
            epic?.end_date ||
            epic?.endDate ||
            epic?.deadline,
        );
        const priority = getPriorityMeta(epic?.priority_name || epic?.priority);

        return {
          id: epicId || group.key || epicName,
          epicId,
          rawEpic: epic,
          key: getEpicKey(epic, epicId, projectKey),
          name: epicName,
          goal,
          status,
          owner,
          dueDate,
          priority,
          taskCount: Array.isArray(group.tasks) ? group.tasks.length : 0,
        };
      });
  }, [normalizedGroups, projectKey]);

  const handleClose = () => {
    setIsDialogOpen(false);
    setIsLoading(false);
    setLoadError('');
    setEpicDetail(null);
    setSelectedRow(null);
  };

  const handleOpenDelete = (event, row) => {
    event.stopPropagation();
    setDeleteTarget(row);
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    if (isDeleting) return;
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.epicId || !projectId) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await PayrollDashboardServices.deleteEpicData(deleteTarget.epicId, {
        project_id: projectId,
      });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      if (onRefreshEpics) {
        onRefreshEpics();
      }
    } catch (err) {
      setDeleteError('Unable to delete epic.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEpic = async (row) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
    setIsLoading(true);
    setLoadError('');
    setEpicDetail(null);

    if (!projectId || !row?.epicId) {
      setEpicDetail(row?.rawEpic ?? null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await PayrollDashboardServices.getEpic(projectId, row.epicId);
      setEpicDetail(res?.data?.data ?? res?.data ?? null);
    } catch (err) {
      setLoadError('Unable to load epic details.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayEpic = epicDetail || selectedRow?.rawEpic || {};
  const detailName =
    displayEpic?.epic_name ||
    displayEpic?.epic_title ||
    displayEpic?.name ||
    displayEpic?.title ||
    selectedRow?.name ||
    'Epic';
  const detailKey = getEpicKey(
    displayEpic,
    selectedRow?.epicId ?? displayEpic?.epic_id ?? displayEpic?.id,
    projectKey,
  );
  const detailOwner =
    displayEpic?.owner_name ||
    displayEpic?.assignee_name ||
    displayEpic?.assigned_staff_name ||
    displayEpic?.reporter_name ||
    displayEpic?.reporter ||
    displayEpic?.assigned_staff ||
    displayEpic?.full_name ||
    selectedRow?.owner ||
    '-';
  const detailStatus =
    displayEpic?.status_name || displayEpic?.status || displayEpic?.STATUS || selectedRow?.status || '-';
  const detailGoal =
    displayEpic?.goal ||
    displayEpic?.objective ||
    displayEpic?.description ||
    selectedRow?.goal ||
    '-';
  const detailPriority = getPriorityMeta(displayEpic?.priority_name || displayEpic?.priority);
  const detailDueDate = formatDate(
    displayEpic?.due_date ||
      displayEpic?.dueDate ||
      displayEpic?.end_date ||
      displayEpic?.endDate ||
      displayEpic?.deadline,
  );
  const detailCreated = formatDate(
    displayEpic?.createdAt || displayEpic?.created_at || displayEpic?.creationDate,
  );
  const detailUpdated = formatDate(
    displayEpic?.updatedAt || displayEpic?.updated_at || displayEpic?.modificationDate,
  );

  if (!epicRows.length) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
        <Typography variant='body2' color='text.secondary'>
          No epics available.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size='small' sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell sx={{ minWidth: 220 }}>Epic</TableCell>
              <TableCell sx={{ minWidth: 240 }}>Goal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Due date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align='right'>Tasks</TableCell>
              <TableCell align='right' sx={{ width: 90 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {epicRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => handleOpenEpic(row)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{row.key}</TableCell>
                <TableCell>
                  <Typography variant='body2'>{row.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {row.goal}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size='small' label={row.status} />
                </TableCell>
                <TableCell>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 11 }}>
                      {row.owner !== '-' ? row.owner[0]?.toUpperCase() : '-'}
                    </Avatar>
                    <Typography variant='body2'>{row.owner}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ color: row.priority.color }}>
                    {row.priority.label}
                  </Typography>
                </TableCell>
                <TableCell align='right' sx={{ width: 90 }}>
                  <Chip size='small' label={row.taskCount} />
                </TableCell>
                <TableCell align='right'>
                  <Tooltip title='Delete epic'>
                    <span>
                      <IconButton
                        size='small'
                        onClick={(event) => handleOpenDelete(event, row)}
                        disabled={isDeleting}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDelete}>
        <DialogTitle>Delete Epic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this epic?
          </DialogContentText>
          {deleteError ? (
            <Typography variant='body2' color='error' sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 2.5,
            background:
              'linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.02))',
          }}
        >
          <Box display='flex' alignItems='center' justifyContent='space-between' gap={2}>
            <Box display='flex' alignItems='center' gap={2}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>
                {detailName?.[0]?.toUpperCase() || 'E'}
              </Avatar>
              <Box>
                <Box display='flex' alignItems='center' gap={1} mb={0.5}>
                  <Chip size='small' label={detailStatus} />
                  <Typography variant='caption' color='text.secondary'>
                    {detailKey}
                  </Typography>
                </Box>
                <Typography variant='h6'>{detailName}</Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size='small'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            backgroundColor: 'background.default',
          }}
        >
          <Box display='grid' gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={0}>
            <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
              {isLoading ? (
                <Box display='flex' alignItems='center' gap={2} py={3}>
                  <CircularProgress size={20} />
                  <Typography variant='body2' color='text.secondary'>
                    Loading epic details...
                  </Typography>
                </Box>
              ) : loadError ? (
                <Typography variant='body2' color='error' sx={{ py: 1 }}>
                  {loadError}
                </Typography>
              ) : (
                <Box display='flex' flexDirection='column' gap={2}>
                  <Box>
                    <Typography variant='subtitle2' gutterBottom>
                      Goal
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {detailGoal}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant='subtitle2' gutterBottom>
                      Activity
                    </Typography>
                    <Box display='flex' gap={2} flexWrap='wrap'>
                      <Chip size='small' label={`Created: ${detailCreated}`} />
                      <Chip size='small' label={`Updated: ${detailUpdated}`} />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                p: 3,
                borderLeft: { xs: 'none', md: '1px solid' },
                borderColor: { md: 'divider' },
                backgroundColor: 'background.default',
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                Details
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Owner
                  </Typography>
                  <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>
                      {detailOwner !== '-' ? detailOwner[0]?.toUpperCase() : '-'}
                    </Avatar>
                    <Typography variant='body2'>{detailOwner}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Due date
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {detailDueDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Priority
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5, color: detailPriority.color }}>
                    {detailPriority.label}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Tasks
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {selectedRow?.taskCount ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProjectEpicTaskList;
