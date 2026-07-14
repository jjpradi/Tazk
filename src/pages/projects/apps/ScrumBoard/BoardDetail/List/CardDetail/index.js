import React, { useState } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import moment from 'moment';
import {
  Box,
  Stack,
  Tooltip,
  Typography,
  MenuItem,
  Menu,
  IconButton,
  DialogActions,
  Button,
  DialogContent,
  DialogContentText,
  Dialog,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import PropTypes from 'prop-types';
import Members from './Members';
import { Fonts } from '../../../../../../../shared/constants/AppEnums';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from 'react-redux';
import {
  createSprintAction,
  dragUpdateStatusAction,
  getSprintDetailsAction,
  getTaskByStatusAction,
  getTaskStatusAction,
  showTasklistAction,
  tasksDeleteAction
} from 'redux/actions/payrollDashboard_actions';
import { useLocation } from 'react-router-dom';
import { getsessionStorage } from 'pages/common/login/cookies';
import {IssueTypeIcon} from 'pages/projects/CommenData';

const CardDetail = ({
  id,
  project_id,
  title,
  attachments = [],
  label = '',
  members = [],
  date = '',
  comments = [],
  onClick,
  pic_filename,
  full_name,
  priority,
  task_id,
  epic_key,
  story_key_id,
  issue_type,
  sprint_id,
  status,
  status_name

}) => {

  const getLevel = (p) => {
    if (p === 1) {
      return { icon: <KeyboardArrowDownIcon  sx={{color:'#2cadc4'}}/>, name: 'Low' , };                           
    } else if (p === 2) {
      return { icon: <DragHandleIcon sx={{color: '#de893a'}} />, name: 'Medium' };
    } else if (p === 3) {
      return { icon: <KeyboardArrowUpIcon   sx={{color: '#bf2e2e'}} />, name: 'High' };
    } else if (p === 4) {
      return { icon: <KeyboardDoubleArrowUpIcon    sx={{color: '#bf2e2e'}} />, name: 'Highest' };
    } else {
      return { icon: null, name: 'Invalid' };
    }
  };

  const dispatch = useDispatch();
  const location = useLocation();
  const queryparams = new URLSearchParams(location.search);
  const queryProjectId = queryparams.get('id');

  const [anchorEl, setAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [changeSprintDialog, setChangeSprintDialog] = useState(false);
  const [targetedSprint, setTargetedSprint] = useState(" ");
  const { PayrolldashboardReducers: { filterTaskDetails, taskByStatus, getSprintDetails, taskStatus },
    LiveLocationReducer: { ProjectLiveLocationDetails, getTaskLogs },
  } = useSelector((state) => state);

  const ALLOWED_TRANSITIONS = {
    backlog: ['todo', 'inprogress'],
    todo: ['backlog', 'inprogress', 'testing'],
    inprogress: ['todo', 'testing', 'completed'],
    testing: ['inprogress', 'completed'],
    completed: ['inprogress'],
  };
  const normalizeLaneName = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, '');
  const isTransitionAllowed = (fromName, toName) => {
    const from = normalizeLaneName(fromName);
    const to = normalizeLaneName(toName);
    if (!from || !to || from === to) return false;
    if (!ALLOWED_TRANSITIONS[from]) return true;
    return ALLOWED_TRANSITIONS[from].includes(to);
  };

  const allowedStatusOptions = (Array.isArray(taskStatus) ? taskStatus : [])
    .filter((s) => isTransitionAllowed(status_name, s?.status_name));

  const sprintOptions = (Array.isArray(getSprintDetails) ? getSprintDetails : [])
    .filter((sprint) => Number(sprint?.isActive) === 0)
    .map((sprint) => ({
      id: sprint?.sprint_id ?? sprint?.id,
      name: sprint?.sprint_name || `Sprint ${sprint?.sprint_id ?? sprint?.id}`,
    }))
    .filter((sprint) => sprint.id && String(sprint.id) !== String(sprint_id));

  const handleOpenChangeSprint = (event) => {
    event.stopPropagation();
    const projectId = project_id ?? Number(queryProjectId);
    if (projectId) {
      dispatch(getSprintDetailsAction({ project_id: projectId }));
    }
    setTargetedSprint(' ');
    setChangeSprintDialog(true);
    handleMenuClose();
  };

  const handleCloseChangeSprint = (event) => {
    event?.stopPropagation?.();
    setChangeSprintDialog(false);
  };

  const handleConfirmChangeSprint = async (event) => {
    event.stopPropagation();
    const taskIdValue = id ?? task_id;
    if (!taskIdValue || !targetedSprint || String(targetedSprint).trim() === '') {
      setChangeSprintDialog(false);
      return;
    }
    const projectId = project_id ?? Number(queryProjectId);
    try {
      await dispatch(createSprintAction({ taskId: taskIdValue, sprintId: targetedSprint }));
      if (projectId) {
        dispatch(getTaskByStatusAction(projectId));
        dispatch(showTasklistAction({ project_id: projectId }));
      }
    } catch (error) {
      console.error('Error changing sprint:', error);
    }
    setChangeSprintDialog(false);
  };

  const handleClose = (event) => {
    event?.stopPropagation?.();
    setDeleteDialog(false);
  };

  const handleDelete = async (event) => {
    event.stopPropagation();

    const allTasks = Array.isArray(taskByStatus?.allTasks)
      ? taskByStatus.allTasks
      : Array.isArray(taskByStatus)
      ? taskByStatus
      : [];

    const selectedTask = allTasks.find(
      (task) =>
        String(task?.id) === String(id) ||
        String(task?.task_id) === String(task_id)
    );

    const deletePayload = {
      id: id ?? task_id ?? selectedTask?.id,
      projectid: project_id ?? selectedTask?.project_id ?? Number(queryProjectId),
      project_id: project_id ?? selectedTask?.project_id ?? Number(queryProjectId),
    };

    if (!deletePayload.id || !deletePayload.projectid) {
      setDeleteDialog(false);
      return;
    }

    try {
      await dispatch(tasksDeleteAction(deletePayload));
      dispatch(getTaskByStatusAction(deletePayload.projectid));
      dispatch(showTasklistAction({ project_id: deletePayload.projectid }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }

    setDeleteDialog(false);
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    const projectId = project_id ?? Number(queryProjectId);
    if (projectId) {
      dispatch(getTaskStatusAction({ id: projectId, project_id: projectId }));
    }
  };

  const handleMenuClose = (event) => {
    event?.stopPropagation?.();
    setAnchorEl(null);
    setStatusAnchorEl(null);
  };

  const handleOpenStatusSubmenu = (event) => {
    event.stopPropagation();
    setStatusAnchorEl(event.currentTarget);
  };

  const handleCloseStatusSubmenu = (event) => {
    event?.stopPropagation?.();
    setStatusAnchorEl(null);
  };

  const handleStatusChange = (targetStatus) => (event) => {
    event.stopPropagation();
    const projectId = project_id ?? Number(queryProjectId);
    if (!id || !projectId || !targetStatus?.id) {
      handleMenuClose();
      return;
    }
    const payload = {
      task_id: id,
      project_id: projectId,
      status: Number(targetStatus.id),
    };
    dispatch(dragUpdateStatusAction(id, payload, (res) => {
      if (res === 200) {
        dispatch(getTaskByStatusAction(projectId));
        dispatch(showTasklistAction({ project_id: projectId }));
      }
    }));
    handleMenuClose();
  };

  const session = getsessionStorage();

  return (
    // <Card
    //   sx={{
    //     py: 4,
    //     px: 6,
    //     mb: 2,
    //     cursor: 'pointer',
    //     whiteSpace: 'normal',
    //     minWidth: 390,
    //     backgroundColor: 'red',
    //     border: '2px solid black',
    //     borderRadius: 10
    //   }}
    //   onClick={(e) => {
    //     e.stopPropagation();
    //   }}
    // </Card>
    <Box
      sx={{
        py: 4,
        px: 6,
        mb: 2,
        cursor: 'pointer',
        whiteSpace: 'normal',
        minWidth: 0,
        backgroundColor: '#FFF',
        borderRadius: '8px',
        fontSize: 15,
        overflow: 'scroll',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        position: 'relative',

        // ✅ NEW STYLING
        borderLeft: '5px solid #D3D3D3',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',

        '&:hover': {
          borderLeft: '5px solid #FFA500',
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },

        // OPTIONAL right border (priority)
        borderRight: `5px solid ${
          priority === 4
            ? '#D32F2F'
            : priority === 1
            ? '#FFA500'
            : '#FFA500'
        }`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ mr: 2, fontWeight: Fonts.MEDIUM }}>
          {title}
        </Box>

        {attachments?.length > 0 && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Box component='span' sx={{ fontWeight: Fonts.LIGHT }}>
              {attachments.length}
            </Box>
            <AttachFileIcon sx={{ ml: 2 }} />
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            top: 18,
            right: 42,
          }}
        >
          <Tooltip title={getLevel(priority).name}>
            <Box>{getLevel(priority).icon}</Box>
          </Tooltip>
        </Box>
       
        <IconButton
          onClick={handleMenuOpen}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <MoreVertIcon />
        </IconButton>

        {(session?.role_name === "Administrator" ||
          session?.role_name === "Manager") && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={(event) => {
                event.stopPropagation();
                onClick?.(event);
                handleMenuClose();
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={(event) => {
                event.stopPropagation();
                onClick?.(event);
                handleMenuClose();
              }}
            >
              View
            </MenuItem>
            <MenuItem onClick={handleOpenStatusSubmenu}>
              Change Status
              <ChevronRightIcon sx={{ ml: 'auto' }} fontSize="small" />
            </MenuItem>
            <MenuItem onClick={handleOpenChangeSprint}>
              Change Sprint
            </MenuItem>

            <Divider />
            <MenuItem
              onClick={(event) => {
                event.stopPropagation();
                setDeleteDialog(true);
                handleMenuClose();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        )}

        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={handleCloseStatusSubmenu}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {allowedStatusOptions.length === 0 ? (
            <Box sx={{ px: 2, py: 1, color: 'text.disabled', fontSize: 14 }}>
              No allowed transitions
            </Box>
          ) : (
            allowedStatusOptions.map((s) => (
              <MenuItem key={s.id} onClick={handleStatusChange(s)}>
                {s.status_name}
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>
      {/* {label.length > 0 ? <Labels labels={label} /> : null} */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Stack direction='row' display='flex' alignItems='center' gap={2}>
          <Members
            members={pic_filename}
            assignee_name={full_name ?? 'Unassigned'}
          />

          <Box
            sx={{
              ml: 1,
              mr: 'auto',
              color: 'text.secondary',
            }}
          >
          <Typography>{full_name}</Typography>

          </Box>

        </Stack>

        <Stack direction='row' alignItems='center' gap={2}>
            <Typography variant="caption"  alignItems='center' mt={2}>
              {issue_type ? <IssueTypeIcon type={issue_type} /> : ""}
            </Typography>      
          <Typography variant="caption" color='text.secondary'>
            {`${epic_key ? `${epic_key}/` : ""} ${story_key_id !=0 && story_key_id != null ? `${story_key_id}-story/`:""} ${task_id}`}
          </Typography>

        </Stack>

        {/* {comments && comments.length > 0 ? (
            <Box
              sx={{
                ml: 2,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              <Box
                component='span'
                sx={{
                  mr: 2,
                  fontWeight: Fonts.LIGHT,
                }}
              >
                {comments.length}
              </Box>
              <ChatBubbleIcon />
            </Box>
          ) : null} */}
      </Box>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={handleClose}>
        <DialogTitle>Delete Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Sprint Dialog */}
      <Dialog
        open={changeSprintDialog}
        onClose={handleCloseChangeSprint}
        onClick={(e) => e.stopPropagation()}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change Sprint</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel id="change-sprint-label">Move to Sprint</InputLabel>
            <Select
              labelId="change-sprint-label"
              label="Move to Sprint"
              value={targetedSprint?.toString().trim() ? targetedSprint : ''}
              onChange={(e) => setTargetedSprint(e.target.value)}
            >
              {sprintOptions.length === 0 && (
                <MenuItem value="" disabled>
                  No other sprints available
                </MenuItem>
              )}
              {sprintOptions.map((sprint) => (
                <MenuItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseChangeSprint}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmChangeSprint}
            disabled={!targetedSprint || String(targetedSprint).trim() === ''}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(CardDetail, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.status_name === next.status_name &&
    prev.priority === next.priority &&
    prev.assigned_staff === next.assigned_staff &&
    prev.laneId === next.laneId
  );
});


CardDetail.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  project_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string,
  task_id: PropTypes.string,
  attachments: PropTypes.array,
  label: PropTypes.string,
  members: PropTypes.array,
  date: PropTypes.string,
  comments: PropTypes.array,
  onClick: PropTypes.func,
  pic_filename: PropTypes.string,
  full_name: PropTypes.string,
  priority: PropTypes.number,
  sprint_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status_name: PropTypes.string,

};
