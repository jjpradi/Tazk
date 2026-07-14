import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  MenuItem,
  IconButton,
  Button,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Box,
  ListSubheader,
} from "@mui/material";
import { DeleteOutlined, DirectionsRun, DriveFileMoveOutlined, EditOutlined, ExpandLess, ExpandMore, MoreVert } from "@mui/icons-material";
import { completeSprintAction, createSprintAction, deleteSprintAction, getSprintDetailsAction, getTaskByStatusAction, showTasklistAction, tasksDeleteAction, updateSprintAction } from "redux/actions/payrollDashboard_actions";
import { useSelector, useDispatch } from 'react-redux';
import moment from "moment";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import SprintConfigDialog from "../../../../components/SprintConfigDialog";
import { OpenalertActions } from "redux/actions/alert_actions";

const getEndDateByDuration = (startDate, duration) => {
  if (!startDate || !duration || duration === 'Custom') {
    return null;
  }

  const startMoment = moment(startDate);
  const durationWeeksMap = {
    '1 week': 1,
    '2 week': 2,
    '3 week': 3,
    '4 week': 4,
  };

  const totalWeeks = durationWeeksMap[duration];
  return totalWeeks ? startMoment.clone().add(totalWeeks, 'weeks') : null;
};


const DataGridForBacklog = ({ data, columns, setTasks, onAddTask, onEditTask, project_id }) => {
  const [page, setPage] = useState(0); 
  const [pageSize, setPageSize] = useState(5);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsForSprint, setSelectedRowsForSprint] = useState([]);
  const [showRows, setShowRows] = useState(true);
  const [createdSprintData, setCreatedSprintData] = useState([]);
  const [existingSprintData, setExistingSprintData] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = React.useState(false);
  const [sprintDialogMode, setSprintDialogMode] = useState(null);
  const [selectedSprintId, setSelectedSprintId] = React.useState(null);
  const [startSprintData, setStartSprintData] = useState(null);


  const [formValues, setFormValues] = useState({
    sprint_name: '',
    sprint_duration: null,
    start_date: null,
    end_date: null,
    sprint_goal: ''
  });

  const [showSprints, setShowSprints] = useState(
    existingSprintData.map(() => false)
  );
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const dispatch = useDispatch();
  const rowsPerPageOptions = [5, 10, 20];
  const [anchorEl, setAnchorEl] = useState({});
    const [taskAnchorEl, setTaskAnchorEl] = useState({});
    const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);
    const [subMenuTaskId, setSubMenuTaskId] = useState(null);

  const {
    PayrolldashboardReducers: { getSprintDetails, get_projects, get_taskProjects, taskByStatus, getProjectDetails },
  } = useSelector((state) => state);

  const refreshProjectData = (overrideProjectId) => {
    const activeProjectId = overrideProjectId || project_id || data?.[0]?.project_id || null;

    if (!activeProjectId) {
      return Promise.resolve();
    }

    return Promise.all([
      dispatch(getSprintDetailsAction({ project_id: activeProjectId })),
      dispatch(
        showTasklistAction(
          { project_id: activeProjectId },
          (res) => setTasks(res || [])
        )
      ),
    ]);
  };

  useEffect(() => {
    if (!project_id) {
      return;
    }

    dispatch(getSprintDetailsAction({ project_id }));
  }, [dispatch, project_id]);

  useEffect(() => {
    const groupBySprint = () => {
      const filteredData = data
      const groupedData = filteredData.reduce((acc, task) => {
        if (task.sprint_id) {
          if (!acc[task.sprint_id]) {
            acc[task.sprint_id] = {
              title: task.sprint_name,
              sprintId: task.sprint_id,
              sprint_isCompleted: task.sprint_isCompleted,
              tasks: [],
            };
          }
          acc[task.sprint_id].tasks.push(task);
        }
        return acc;
      }, {});

      if (Array.isArray(getSprintDetails)) {
        
        getSprintDetails
        .filter((sprint) => sprint.project_id === project_id && sprint.isDeleted === 0)
        .forEach((sprint) => {
          const sprintId = sprint?.sprint_id || sprint?.id
          if (sprintId && !groupedData[sprintId]) {
            groupedData[sprintId] = {
              title: sprint.sprint_name,
              sprintId: sprintId,
              sprint_isCompleted: sprint.sprint_isCompleted ?? 0,
              tasks: [], 
            }
          }
        })
    }

      setExistingSprintData(Object.values(groupedData))

    };

    groupBySprint();
  }, [data ,getSprintDetails]);

  const groupedData = data.reduce((acc, row) => {
    const groupKey = row.status || "Ungrouped";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(row);
    return acc;
  }, {});


  const handleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const selectedSprint = existingSprintData.find((sprint) => sprint.sprintId === selectedSprintId);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => {
      let updatedEndDate = prev.end_date;

      if (name === 'sprint_duration') {
        updatedEndDate = getEndDateByDuration(prev.start_date, value);
      }

      return {
        ...prev,
        [name]: value,
        end_date: updatedEndDate,
      };
    });
  };

  const handleDateChange = (field, value) => {
    const selectedDate = value ? moment(value) : null;

    setFormValues((prev) => {
      let updatedEndDate = prev.end_date;

      if (field === 'start_date' && prev.sprint_duration && selectedDate) {
        updatedEndDate = getEndDateByDuration(selectedDate, prev.sprint_duration);
      } else if (field === 'end_date' && selectedDate) {
        updatedEndDate = selectedDate;
      }

      return {
        ...prev,
        [field]: selectedDate,
        end_date: updatedEndDate,
      };
    });
  };



  const handleRowSelectionForSprint = (taskId, sprintId) => {
    setSelectedRowsForSprint((prev) => {
      const selectedRows = prev[sprintId] || [];
      const updatedRows = selectedRows.includes(taskId)
        ? selectedRows.filter((id) => id !== taskId)
        : [...selectedRows, taskId];
      return {
        ...prev,
        [sprintId]: updatedRows,
      };
    });
  };

  const handleGroupSelectionForSprint = (sprintId, isChecked, tasks) => {
    const taskIds = tasks.map((task) => task.id);
    setSelectedRowsForSprint((prev) => ({
      ...prev,
      [sprintId]: isChecked ? taskIds : [],
    }));
  };

  const isBacklogTask = (task) => {
    const sprintId = task?.sprint_id;
    return sprintId === 0 || sprintId === '0' || sprintId === null || sprintId === undefined || sprintId === '';
  };

  const filteredData = data.filter(isBacklogTask);
  
  const handleBulkDeleteBacklogTasks = () => {
    if (selectedRows.length === 0) {
      return
    }

    dispatch(
      tasksDeleteAction({
        id: selectedRows,
        projectid: project_id || data?.[0]?.project_id,
      })
    )
      .then(() => {
        setSelectedRows([]);
        return refreshProjectData();
      })
      .catch(() => {
        console.error('Error deleting backlog tasks');
      });
  }


  const handleBulkDeleteSprintTasks = (sprintId) => {
    const taskIds = selectedRowsForSprint[sprintId] || [];

    if (taskIds.length === 0) {
      return;
    }

    dispatch(
      tasksDeleteAction(
        {
          id: taskIds,
          projectid: project_id || data?.[0]?.project_id,
        }
      )
    )
      .then(() => {
        setSelectedRowsForSprint((prev) => ({
          ...prev,
          [sprintId]: [],
        }));
        return refreshProjectData();
      })
      .catch(() => {
        console.error('Error deleting sprint tasks');
      });
  };

  const handleCreateSprint = () => {
    const projectName = data[0].project_name
    const projectId = data[0].project_id;


    dispatch(getSprintDetailsAction({ project_id: project_id }))
      .then((response) => {

        const allSprints = response || [];
        
        const activeSprints = allSprints.filter(sprint => sprint.isDeleted === 0);
        const filterBasedOnProjectId = activeSprints.filter((data)=> data.project_id === projectId )
        const sprintCount = filterBasedOnProjectId.length;
        // const sprintNumbers = activeSprints
        //   .map((sprint) => {
        //     const match = sprint.sprint_name.match(/Sprint (\d+)$/);
        //     return match ? parseInt(match[1], 10) : 0;
        //   })
        //   .filter((num) => !isNaN(num));

        // const lastSprintNumber = sprintNumbers.length > 0 ? Math.max(...sprintNumbers) : 0;

        const newSprintName = `${projectName} Sprint ${sprintCount + 1}`;
        const selectedTasks = data.filter((row) => selectedRows.includes(row.id));
        const taskIds = selectedTasks.map((task) => task.id);


        if (taskIds.length === 0) {
          dispatch(OpenalertActions({msg: "Please select tasks to add to the sprints.", severity: 'warning' }))
          return;
        }

        const payload = {
          project_id: projectId,
          sprint_name: newSprintName,
          taskIds,
        };

        if (isCreatingSprint) return;
        setIsCreatingSprint(true);

        dispatch(createSprintAction(payload))
          .then((response) => {
            setCreatedSprintData((prevData) => [
              ...prevData,
              { title: newSprintName, tasks: selectedTasks },
            ]);
            setSelectedRows([]);
            return refreshProjectData(projectId);
          })
          .catch((error) => {
            console.error("Error creating sprint:", error.message);
            alert("Failed to create sprint. Please try again.");
          })
          .finally(() => {
            setIsCreatingSprint(false);
          });
      })
      .catch((error) => {
        console.error("Error fetching sprint details:", error.message);
        alert("Failed to fetch the last sprint. Please try again.");
      });
  };

  const handleToggleSprintVisibility = (index) => {
    setShowSprints((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleMoreMenuClick = (event, sprintId) => {
    setAnchorEl((prev) => ({ ...prev, [sprintId]: event.currentTarget }));
  };

  const handleMoreForTask = (event, taskId) => {
    setTaskAnchorEl((prev) => ({ ...prev, [taskId]: event.currentTarget }));
  };

  const handleMoveTask = (taskId, sprintId) => {
    const projectId = data[0].project_id;

    const payload = {
      taskId: taskId,
      sprintId: sprintId
    };

    dispatch(createSprintAction(payload))
      .then((response) => {
        setSelectedRows([]);
        return refreshProjectData(projectId);
      })
      .catch((err) => {
        console.error(`Error deleting sprint`);
      });
  };

  const handleMoreMenuClose = (sprintId) => {
    setAnchorEl((prev) => ({ ...prev, [sprintId]: null }));
  };

  const handleMoreClose = (taskId) => {
    
    setTaskAnchorEl((prev) => ({
      ...prev,
      [taskId]: null,
    }));
    setSubMenuAnchorEl(null); 
  };

  const handleSubMenuOpen = (event, taskId) => {
    setSubMenuAnchorEl(event.currentTarget);
    setSubMenuTaskId(taskId);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchorEl(null);
    setSubMenuTaskId(null);
  };

  const handleDeleteSprint = (sprintId) => {
    setSelectedSprintId(sprintId);
    setOpenDeleteDialog(true);
  };

  const handleEditSprint = (sprint) => {
    const sprintTask = sprint?.tasks?.[0] || sprint || {};
    setSelectedSprintId(sprint?.sprintId || sprintTask.sprint_id);
    setFormValues({
      sprint_name: sprintTask.sprint_name || sprint?.title || '',
      sprint_duration: sprintTask.sprint_duration || '1 week',
      start_date: sprintTask.sprint_startDate ? moment(sprintTask.sprint_startDate) : null,
      end_date: sprintTask.sprint_endDate
        ? moment(sprintTask.sprint_endDate)
        : getEndDateByDuration(
            sprintTask.sprint_startDate ? moment(sprintTask.sprint_startDate) : null,
            sprintTask.sprint_duration || '1 week'
          ),
      sprint_goal: sprintTask.sprint_goal || '',
    });
    setSprintDialogMode('edit');
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSprintId(null);
  };

  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
    setSelectedSprintId(null);
  };

  const handleCloseEditDialog = () => {
    setSprintDialogMode((prev) => (prev === 'edit' ? null : prev));
    setSelectedSprintId(null);
  };

  const handleConfirmDeleteSprint = (sprintId, sprintData) => {
    const taskIds = sprintData?.tasks?.map((task) => task.id) || [];
    const payload = {
      sprintId: sprintId,
      taskIds
    };

    dispatch(deleteSprintAction(payload))
      .then((response) => {
        if (response.message) {
          setOpenDeleteDialog(false);
          setSelectedSprintId(null);
          setSelectedRowsForSprint((prev) => {
            const next = { ...prev };
            delete next[sprintId];
            return next;
          });
          return refreshProjectData(sprintData?.tasks?.[0]?.project_id);
        } else {
          setOpenDeleteDialog(false);
        }
      })
      .catch((err) => {
        console.error(`Error deleting sprint`);
      });
  };

  const handleConfirmCompleteSprint = (sprintId) => {
    // console.log('Completing Sprint with ID:', sprintId,);
    const projectId = data[0].project_id;
    const payload = {
      sprintId: sprintId,
    };

    dispatch(completeSprintAction(payload))
      .then((response) => {
        // console.log('Response from deleteSprintAction:', response);
        if (response.message) {
          setOpenCompleteDialog(false);
          setSelectedSprintId(null);
          return refreshProjectData(projectId);
        } else {
          setOpenCompleteDialog(false);
        }
      })
      .catch((err) => {
        console.error(`Error deleting sprint`);
      });
  };

  const handleCompleteSprint = (sprintId) => {
    // console.log("Deleting Sprint ID:", sprintId);
    setSelectedSprintId(sprintId);
    setOpenCompleteDialog(true);
  };

  const handleStartSprint = (sprintGroup) => {
    const sprintTask = sprintGroup?.tasks?.[0] || {};
    const duration = sprintTask?.sprint_duration || '1 week';
    const startDate = sprintTask?.sprint_startDate ? moment(sprintTask.sprint_startDate) : moment();
    const endDate = sprintTask?.sprint_endDate
      ? moment(sprintTask.sprint_endDate)
      : getEndDateByDuration(startDate, duration) || startDate.clone().add(1, 'weeks');

    setSelectedSprintId(sprintGroup?.sprintId);
    setStartSprintData(sprintGroup);
    setFormValues({
      sprint_name: sprintTask?.sprint_name || sprintGroup?.title || '',
      sprint_duration: duration,
      start_date: startDate,
      end_date: endDate,
      sprint_goal: sprintTask?.sprint_goal || '',
    });
    setSprintDialogMode('start');
  };

  const handleCloseStartDialog = () => {
    setSprintDialogMode((prev) => (prev === 'start' ? null : prev));
    setSelectedSprintId(null);
    setStartSprintData(null);
  };

  const handleConfirmStartSprint = () => {
    const projectId = startSprintData?.tasks?.[0]?.project_id || data?.[0]?.project_id;
    if (!projectId || !selectedSprintId) return;

    if (!formValues.sprint_name || !formValues.sprint_duration || !formValues.start_date || !formValues.end_date) {
      alert('Please fill all required fields.');
      return;
    }

    const payload = {
      sprintId: selectedSprintId,
      sprint_name: formValues.sprint_name,
      duration: formValues.sprint_duration,
      start_date: moment(formValues.start_date).format('YYYY-MM-DD HH:mm'),
      end_date: moment(formValues.end_date).format('YYYY-MM-DD HH:mm'),
      goal: formValues.sprint_goal,
      project_id: projectId,
    };

    dispatch(updateSprintAction(payload))
      .then((response) => {
        if (response?.message) {
          setSprintDialogMode(null);
          setSelectedSprintId(null);
          setStartSprintData(null);
          dispatch(getTaskByStatusAction(projectId));
          return refreshProjectData(projectId);
        }
      })
      .catch(() => {
        console.error('Error starting sprint');
      });
  };

  const handleConfirmEditSprint = (sprintId, sprintData) => {
    const taskIds = sprintData?.tasks?.map((task) => task.id) || [];

    const projectId = sprintData?.tasks?.[0]?.project_id || data?.[0]?.project_id;

    const payload = {
      sprintId: sprintId,
      sprint_name: formValues.sprint_name,
      duration: formValues.sprint_duration,
      start_date: moment(formValues.start_date).format('YYYY-MM-DD HH:mm'),
      end_date: moment(formValues.end_date).format('YYYY-MM-DD HH:mm'),
      goal: formValues.sprint_goal,
      project_id: projectId,
    };

    dispatch(updateSprintAction(payload))
      .then((response) => {
        if (response.message) {
          setSprintDialogMode(null);
          setSelectedSprintId(null);
          return refreshProjectData(sprintData?.tasks?.[0]?.project_id);
        } else {
          setSprintDialogMode(null);
        }
      })
      .catch((err) => {
        console.error(`Error deleting sprint`);
      });
  };

  const generateColorForName = (name) => {
    const colors = [
      '#FFB6C1', '#ADD8E6', '#90EE90', '#FFD700',
      '#FFA07A', '#20B2AA', '#9370DB', '#FF69B4',
      '#CD5C5C', '#87CEFA', '#FF7F50', '#98FB98'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  useEffect(() => {
    existingSprintData.forEach((sprint, index) => {
      sprint.tasks.forEach((task) => {
      });
    });
  }, [existingSprintData]);

  const isSprintDialogOpen = sprintDialogMode === 'start' || sprintDialogMode === 'edit';
  const sprintIssueCount =
    sprintDialogMode === 'start'
      ? startSprintData?.tasks?.length || 0
      : selectedSprint?.tasks?.length || 0;
  const handleSprintDialogClose =
    sprintDialogMode === 'edit' ? handleCloseEditDialog : handleCloseStartDialog;
  const handleSprintDialogSubmit =
    sprintDialogMode === 'edit'
      ? () => handleConfirmEditSprint(selectedSprintId, selectedSprint)
      : handleConfirmStartSprint;

  return (
    <div style={{
      padding: '0 10px',
      height: '80vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
    }}
      className="hide-scrollbar"
    >
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar {
        display: none;
        } `}
      </style>           
     <TableContainer
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              {columns.map((column) => (
                <TableCell key={column.field}>{column.headerName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>           
        <div style={{ position: "relative", margin: "40px 0" }}>
          <Divider style={{ borderColor: "#888" }} />
          <Typography
            variant="h6"
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#f4f7fe",
              padding: "0 10px",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            Sprints
          </Typography>
        </div>
        {existingSprintData.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              color: "#888",
            }}
          >
            <DirectionsRun sx={{ fontSize: 64, color: "#bbb", mb: 1 }} />
            <Typography variant="body1" sx={{ color: "#666", fontWeight: 500 }}>
              No sprints available
            </Typography>
          </Box>
      ) : (
      <>
          {existingSprintData.map((sprint, index) => (
            <TableContainer
              key={index}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={columns.length + 3} padding="checkbox">
                      <Checkbox
                        onChange={(e) => handleGroupSelectionForSprint(sprint.sprintId, e.target.checked, sprint.tasks)}
                        indeterminate={
                          selectedRowsForSprint[sprint.sprintId]?.length > 0 &&
                          selectedRowsForSprint[sprint.sprintId]?.length < sprint.tasks.length
                        }
                        checked={
                          selectedRowsForSprint[sprint.sprintId]?.length ===
                          sprint.tasks.length
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleToggleSprintVisibility(index)}
                      >
                        {showSprints[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <b>{sprint.title} ({sprint.tasks.length} issues)</b>
                      {sprint.tasks[0]?.sprint_isCompleted === 1 && (
                        <Box
                          component="span"
                          sx={{
                            backgroundColor: "#E6F4EA",
                            color: "#137333",
                            padding: "2px 8px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 500,
                            marginLeft: "8px",
                          }}
                        >
                          Completed
                        </Box>
                      )}
                      <div style={{ float: "right" }}>
                        {(selectedRowsForSprint[sprint.sprintId]?.length || 0) > 0 && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleBulkDeleteSprintTasks(sprint.sprintId)}
                            sx={{ mr: 1 }}
                          >
                            Delete
                          </Button>
                        )}
                        {sprint.sprint_isCompleted !== 1 && !sprint.tasks[0]?.sprint_startDate && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleStartSprint(sprint)}
                            sx={{ mr: 1 }}
                          >
                            Start Sprint
                          </Button>
                        )}
                        {sprint.tasks[0]?.sprint_endDate && sprint.tasks[0]?.sprint_isCompleted !== 1 && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleCompleteSprint(sprint.sprintId)}
                          >
                            Complete Sprint
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={(event) => handleMoreMenuClick(event, sprint.sprintId)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl[sprint.sprintId]}
                          open={Boolean(anchorEl[sprint.sprintId])}
                          onClose={() => handleMoreMenuClose(sprint.sprintId)}
                        >
                          <MenuItem onClick={() => handleEditSprint(sprint)}>Edit Sprint</MenuItem>
                          <MenuItem onClick={() => handleDeleteSprint(sprint.sprintId)}>Delete Sprint</MenuItem>

                        </Menu>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body for Sprint */}
                {showSprints[index] && (
                  <TableBody>
                    {sprint.tasks.map((task, index) => (
                      <TableRow
                        key={task.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRowsForSprint[sprint.tasks[0].sprint_id]?.includes(task.id) || false}
                            onChange={() => handleRowSelectionForSprint(task.id, sprint.tasks[0].sprint_id)}
                          />
                        </TableCell>
                        {columns.map((column) => (
                          <TableCell key={column.field}>{task[column.field]}</TableCell>
                        ))}
                        <TableCell align="right" padding="none" style={{ width: "40px" }}>
                          <Tooltip title={task?.assigned_staff_name && task.assigned_staff_name !== "Not Assigned"
                            ? task.assigned_staff_name
                            : "Not Assigned"}
                            arrow
                          >
                            <Avatar
                              sx={{
                                width: 25,
                                height: 25,
                                fontSize: 12,
                                backgroundColor: task?.assigned_staff_name && task.assigned_staff_name !== "Not Assigned"
                                  ? generateColorForName(task.assigned_staff_name)
                                  : '#CECECE',
                                marginRight: '4px',
                              }}
                            >
                              {task?.assigned_staff_name && task.assigned_staff_name !== "Not Assigned" ? (
                                task.assigned_staff_name[0].toUpperCase()
                              ) : (
                                <AccountCircleIcon sx={{ fontSize: 20, color: '#FFFFFF' }} />
                              )}
                            </Avatar>
                          </Tooltip>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          ))}
        </>)}


        <div style={{ position: "relative", margin: "40px 0" }}>
          <Divider style={{ borderColor: "#888" }} />
          <Typography
            variant="h6"
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#f4f7fe",
              padding: "0 10px",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            Backlog
          </Typography>
        </div>

        <TableContainer
          style={{
            maxHeight: "calc(100% - 60px)",
            overflow: "auto",
            marginTop: "20px",
          }}
        >
          <Table>
            <TableBody>
              {/* Group Title */}
              <TableRow>
                <TableCell colSpan={columns.length + 1} padding="checkbox">
                  <Checkbox
                    checked={
                      filteredData.every((row) => selectedRows.includes(row.id)) &&
                      selectedRows.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const groupIds = filteredData.map((row) => row.id);
                        setSelectedRows((prev) => [...prev, ...groupIds]);
                      } else {
                        const groupIds = filteredData.map((row) => row.id);
                        setSelectedRows((prev) =>
                          prev.filter((rowId) => !groupIds.includes(rowId))
                        );
                      }
                    }}
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < filteredData.length
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={() => setShowRows((prev) => !prev)}
                  >
                    {showRows ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  <b>Backlog ({filteredData.length} issues)</b>
                  <div style={{ float: "right", paddingLeft: "20px", paddingBottom: "10px" }}>
                    <IconButton
                      size="small"
                      onClick={onAddTask}
                      sx={{ mr: 1 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    {selectedRows.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleBulkDeleteBacklogTasks}
                        sx={{ mr: 1 }}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateSprint}
                    >
                      Create Sprint
                    </Button>
                  </div>
                </TableCell>
                <TableCell sx={{ display: 'none' }} />
              </TableRow>
            </TableBody>
          </Table>
          {showRows && filteredData.length === 0 && (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
          {showRows && filteredData.length > 0 && (
          <Table>
            <TableBody>
              {filteredData.map((row, index) => (

              // {showRows &&
              //   filteredData.map((row, index) => (

                  <TableRow
                    key={row.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white",
                      cursor: onEditTask ? "pointer" : "default",
                    }}
                    onClick={() => onEditTask && onEditTask(row)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleRowSelection(row.id)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.field}>{row[column.field]}</TableCell>
                    ))}
                    <TableCell
                      align="right"
                      padding="none"
                      style={{ width: "40px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title={row?.assigned_staff_name && row.assigned_staff_name !== "Not Assigned"
                        ? row.assigned_staff_name
                        : "Not Assigned"}
                        arrow
                      >
                        <Avatar sx={{
                          width: 25, height: 25, fontSize: 12, backgroundColor: row?.assigned_staff_name && row.assigned_staff_name !== "Not Assigned"
                            ? generateColorForName(row.assigned_staff_name)
                            : '#CECECE', marginRight: '4px'
                        }}>
                          {row?.assigned_staff_name ? row?.assigned_staff_name[0].toUpperCase() : <AccountCircleIcon sx={{ fontSize: 20, color: '#CECECE' }} />}
                        </Avatar>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      align="right"
                      padding="none"
                      style={{ width: "40px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {existingSprintData.length > 0 && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMoreForTask(e, row.id)}
                            sx={{ padding: '4px', color: 'text.secondary' }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>

                          <Menu
                            anchorEl={taskAnchorEl[row.id]}
                            open={Boolean(taskAnchorEl[row.id])}
                            onClose={() => handleMoreClose(row.id)}
                            slotProps={{
                              paper: {
                                sx: { width: 180, borderRadius: 2, p: 0.5 }
                              }
                            }}
                          >
                            {/* Edit */}
                            <MenuItem
                              onClick={() => {
                                handleMoreClose(row.id);
                                if (typeof onEditTask === 'function') {
                                  onEditTask(row);
                                }
                              }}
                              sx={{ borderRadius: 1, fontSize: 13 }}
                            >
                              <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
                              <ListItemText primary="Edit task" />
                            </MenuItem>

                            {/* Move to — triggers submenu */}
                            <MenuItem
                              onClick={(e) => handleSubMenuOpen(e, row.id)}
                              sx={{ borderRadius: 1, fontSize: 13 }}
                            >
                              <ListItemIcon><DriveFileMoveOutlined fontSize="small" /></ListItemIcon>
                              <ListItemText primary="Move to" />
                              <ArrowRightIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                            </MenuItem>

                          </Menu>

                          {/* Submenu */}
                          <Menu
                            anchorEl={subMenuAnchorEl}
                            open={Boolean(subMenuAnchorEl) && subMenuTaskId === row.id}
                            onClose={handleSubMenuClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            slotProps={{
                              paper: {
                                sx: {
                                  minWidth: 180,
                                  maxWidth: "auto",
                                  borderRadius: 2,
                                  p: 0.5,
                                  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                                }
                              }
                            }}
                          >
                            <ListSubheader sx={{ fontSize: 11, lineHeight: '28px', letterSpacing: '0.05em', fontWeight: 700 }}>
                              SPRINTS
                            </ListSubheader>

                            {(() => {
                              const movableSprints = existingSprintData.filter(
                                (sprint) =>
                                  !Number(sprint.sprint_isCompleted) &&
                                  sprint.sprintId !== row.sprint_id
                              );
                              if (movableSprints.length === 0) {
                                return (
                                  <MenuItem disabled sx={{ borderRadius: 1, fontSize: 13, fontStyle: 'italic', color: 'text.secondary' }}>
                                    <ListItemText primary="No available sprints" />
                                  </MenuItem>
                                );
                              }
                              return movableSprints.map((sprint) => (
                                <MenuItem
                                  key={sprint.sprintId}
                                  onClick={() => {
                                    handleMoveTask(subMenuTaskId, sprint.sprintId);
                                    handleSubMenuClose();
                                    handleMoreClose(row.id);
                                  }}
                                  sx={{ borderRadius: 1, fontSize: 13 }}
                                >
                                  <ListItemText primary={sprint.title} />
                                </MenuItem>
                              ));
                            })()}
                          </Menu>
                        </>)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>)}
        </TableContainer>
      </TableContainer>
      <>

        {/* Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Delete Sprint</DialogTitle>
          <DialogContent>
            Are you sure you want to delete sprint "{selectedSprint ? selectedSprint.title : ''}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmDeleteSprint(selectedSprintId, selectedSprint)}
              color="secondary"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openCompleteDialog}
          onClose={handleCloseCompleteDialog}
        >
          <DialogTitle>Complete Sprint</DialogTitle>
          <DialogContent>
            Are you sure you want to Complete this sprint "{selectedSprint ? selectedSprint.title : ''}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCompleteDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmCompleteSprint(selectedSprintId, selectedSprint)}
              color="secondary"
            >
              Complete
            </Button>
          </DialogActions>
        </Dialog>

        <SprintConfigDialog
          open={isSprintDialogOpen}
          mode={sprintDialogMode}
          issueCount={sprintIssueCount}
          values={formValues}
          onChange={handleInputChange}
          onDateChange={handleDateChange}
          onClose={handleSprintDialogClose}
          onSubmit={handleSprintDialogSubmit}
        />
      </>
    </div>
  );
};

export default DataGridForBacklog;
