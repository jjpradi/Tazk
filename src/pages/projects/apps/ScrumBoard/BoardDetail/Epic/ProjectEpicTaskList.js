import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EpicCreation from './EpicCreation';
import EpicDetailDialog from './EpicDetailDialog';

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

const getIssueTypeLabel = (issueType) => {
  const value = String(issueType || '').toLowerCase();
  if (value === '1' || value === 'task') return 'Task';
  if (value === '2' || value === 'epic') return 'Epic';
  if (value === '3' || value === 'story') return 'Story';
  if (value === '4' || value === 'bug') return 'Bug';
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Task';
};


const ProjectEpicTaskList = ({
  epicGroups = [],
  projectKey = '',
  projectId,
  onRefreshEpics,
  // epicData,
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
  const [epicTasks, setEpicTasks] = useState([]);
  const [epicTaskCountsByStatus, setEpicTaskCountsByStatus] = useState([]);
  const [epicTimeProgress, setEpicTimeProgress] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskCounts, setTaskCounts] = useState({});
  const [progressView, setProgressView] = useState('task');
  const [isEpicFormOpen, setIsEpicFormOpen] = useState(false);
  const [epicFormData, setEpicFormData] = useState(null);

  const epicIdList = useMemo(() => {
    return normalizedGroups
      .filter((group) => group?.epic)
      .map((group, index) => {
        const epic = group.epic || {};
        return group.epicId ?? epic?.epic_id ?? epic?.id ?? index + 1;
      })
      .filter((epicId) => epicId !== undefined && epicId !== null);
  }, [normalizedGroups]);

  // const taskCount = useMemo(() => {}), [normalizedGroups]);

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
          taskCount:
            taskCounts?.[String(epicId)] ??
            (Array.isArray(group.tasks) ? group.tasks.length : 0),
        };
      });
  }, [normalizedGroups, projectKey, taskCounts]);

  useEffect(() => {
    if (!projectId) return;
    if (!epicIdList.length) {
      setTaskCounts({});
      return;
    }

    let isActive = true;
    const fetchCounts = async () => {
      const results = await Promise.allSettled(
        epicIdList.map((epicId) =>
          PayrollDashboardServices.getTaskviaEpic(projectId, epicId),
        ),
      );
      const nextCounts = {};
      results.forEach((result, index) => {
        const epicId = epicIdList[index];
        if (!epicId) return;
        if (result.status === 'fulfilled') {
          const list = result.value?.data?.data ?? result.value?.data ?? [];
          nextCounts[String(epicId)] = Array.isArray(list) ? list.length : 0;
        }
      });

      if (isActive) {
        setTaskCounts((prev) => ({ ...prev, ...nextCounts }));
      }
    };

    fetchCounts();
    return () => {
      isActive = false;
    };
  }, [projectId, epicIdList]);

  const handleClose = () => {
    setIsDialogOpen(false);
    setIsLoading(false);
    setLoadError('');
    setEpicDetail(null);
    setSelectedRow(null);
    setEpicTaskCountsByStatus([]);
    setEpicTimeProgress(null);
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

  const handleCloseEpicForm = () => {
    setIsEpicFormOpen(false);
    setEpicFormData(null);
  };

  const handleOpenEdit = async (event, row) => {
    event.stopPropagation();
    setEpicFormData(row?.rawEpic ?? { id: row?.epicId, epic_id: row?.epicId });
    setIsEpicFormOpen(true);

    if (!projectId || !row?.epicId) return;
    try {
      const res = await PayrollDashboardServices.getEpic(projectId, row.epicId);
      const epicApiData = res?.data?.data ?? res?.data ?? null;
      const epic = epicApiData?.epic ?? epicApiData ?? null;
      if (epic) {
        setEpicFormData(epic);
      }
    } catch (err) {
      // ignore; fallback to row data
    }
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
    setEpicTasks([]);
    setEpicTaskCountsByStatus([]);
    setEpicTimeProgress(null);
    setTasksLoading(true);

    if (!projectId || !row?.epicId) {
      setEpicDetail(row?.rawEpic ?? null);
      setIsLoading(false);
      setTasksLoading(false);
      return;
    }

    try {
      const [epicRes, tasksRes] = await Promise.allSettled([
        PayrollDashboardServices.getEpic(projectId, row.epicId),
        PayrollDashboardServices.getTaskviaEpic(projectId, row.epicId),
      ]);

      if (epicRes.status === 'fulfilled') {
        const epicApiData = epicRes.value?.data?.data ?? epicRes.value?.data ?? null;
        if (epicApiData?.epic) {
          setEpicDetail(epicApiData.epic);
          setEpicTaskCountsByStatus(epicApiData.taskCounts || []);
          setEpicTimeProgress(epicApiData.timeProgress || null);
        } else {
          setEpicDetail(epicApiData);
        }
      }

      if (tasksRes.status === 'fulfilled') {
        const list = tasksRes.value?.data?.data ?? tasksRes.value?.data ?? [];
        setEpicTasks(Array.isArray(list) ? list : []);
      } else {
        setEpicTasks([]);
      }
    } catch (err) {
      setLoadError('Unable to load epic details.');
    } finally {
      setIsLoading(false);
      setTasksLoading(false);
    }
  };

  const displayEpic = epicDetail || selectedRow?.rawEpic || {};
  const detailName = displayEpic?.name || selectedRow?.name || 'Epic';
  const detailKey = displayEpic?.epic_key || selectedRow?.key || '-';
  const detailStatus = displayEpic?.status_name || selectedRow?.status || '-';
  const detailGoal = displayEpic?.goal || '-';
  const detailDescription = displayEpic?.description || '';
  const detailOwner = displayEpic?.assignee_name || '-';
  const detailReporter = displayEpic?.reporter_name || '-';
  const detailCreated = formatDate(displayEpic?.createdAt);
  const detailUpdated = formatDate(displayEpic?.updatedAt);
  const detailTasks = epicTasks;

  const taskStats = useMemo(() => {
    const total = epicTaskCountsByStatus[0]?.total_epic_tasks || 0;
    const laneBreakdown = epicTaskCountsByStatus
    // .filter((lane) => lane.TaskStatusCounts > 0);

    const loggedHours = epicTimeProgress?.total_logged_hours || 0;
    const estimatedHours = epicTimeProgress?.total_estimated_hours || 0;
    const remainingHours = Math.max(estimatedHours - loggedHours, 0);
    const overloggedHours = Math.max(loggedHours - estimatedHours, 0);
    const logProgress = estimatedHours > 0 ? Math.round((loggedHours / estimatedHours) * 100) : 0;

    return { total, laneBreakdown, loggedHours, estimatedHours, remainingHours, overloggedHours, logProgress };
  }, [epicTaskCountsByStatus, epicTimeProgress]);

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
                  <TableCell align='right'>
                    <Chip size='small' label={row.taskCount} />
                  </TableCell>
                  <TableCell align='right' sx={{ width: 90 }}>
                    <Tooltip title='Edit epic'>
                      <span>
                        <IconButton
                          size='small'
                          onClick={(event) => handleOpenEdit(event, row)}
                          disabled={isDeleting}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </span>
                    </Tooltip>
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

      <EpicDetailDialog
        open={isDialogOpen}
        onClose={handleClose}
        isLoading={isLoading}
        selectedRow={selectedRow}
        detailName={detailName}
        detailKey={detailKey}
        detailStatus={detailStatus}
        detailGoal={detailGoal}
        detailDescription={detailDescription}
        detailOwner={detailOwner}
        detailReporter={detailReporter}
        detailCreated={detailCreated}
        detailUpdated={detailUpdated}
        detailTasks={detailTasks}
        tasksLoading={tasksLoading}
        taskStats={taskStats}
        progressView={progressView}
        setProgressView={setProgressView}
        handleOpenEdit={handleOpenEdit}
        setEpicFormData={setEpicFormData}
        setIsEpicFormOpen={setIsEpicFormOpen}
      />

      <EpicCreation
        open={isEpicFormOpen}
        onClose={handleCloseEpicForm}
        initialData={epicFormData}
        projectId={projectId}
        onSaved={onRefreshEpics}
      />
    </Box>
  );
};

export default ProjectEpicTaskList;
