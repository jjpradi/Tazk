import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Select,
  MenuItem,
  IconButton,
  Button,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Divider,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Box,
} from "@mui/material";
import { ExpandLess, ExpandMore, MoreVert } from "@mui/icons-material";
import { completeSprintAction, createSprintAction, deleteSprintAction, getSprintDetailsAction, getTaskByStatusAction, showTasklistAction, updateSprintAction } from "redux/actions/payrollDashboard_actions";
import { useSelector, useDispatch } from 'react-redux';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';


const DataGridForBacklog = ({ data, columns, setTasks, onAddTask, onEditTask }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsForSprint, setSelectedRowsForSprint] = useState([]);
  const [showRows, setShowRows] = useState(true);
  const [createdSprintData, setCreatedSprintData] = useState([]);
  const [existingSprintData, setExistingSprintData] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openStartDialog, setOpenStartDialog] = React.useState(false);
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

  const {
    PayrolldashboardReducers: { getSprintDetails, get_projects, get_taskProjects, taskByStatus, getProjectDetails },
  } = useSelector((state) => state);

  console.log("kjhgjhf", data);

  useEffect(() => {
    dispatch(getSprintDetailsAction())
  }, [dispatch]);

  useEffect(() => {
    const groupBySprint = () => {
      const filteredData = data.filter(task => task.sprint_isDeleted === 0);
      const groupedData = filteredData.reduce((acc, task) => {
        console.log("dataaa", filteredData);

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

      setExistingSprintData(Object.values(groupedData));
      console.log("groupedData", groupedData);

    };

    groupBySprint();
  }, [data]);

  const groupedData = data.reduce((acc, row) => {
    const groupKey = row.status || "Ungrouped";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(row);
    return acc;
  }, {});


  const paginatedData = Object.entries(groupedData)
    .slice(page * pageSize, (page + 1) * pageSize);

  const handleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const selectedSprint = existingSprintData.find((sprint) => sprint.tasks[0].sprint_id === selectedSprintId);
  console.log("selectedSprint", existingSprintData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => {
      let updatedEndDate = prev.end_date;

      if (name === 'sprint_duration') {
        if (value !== 'Custom' && prev.start_date) {
          const startDate = moment(prev.start_date);
          switch (value) {
            case '1 week':
              updatedEndDate = startDate.clone().add(1, 'weeks');
              break;
            case '2 week':
              updatedEndDate = startDate.clone().add(2, 'weeks');
              break;
            case '3 week':
              updatedEndDate = startDate.clone().add(3, 'weeks');
              break;
            case '4 week':
              updatedEndDate = startDate.clone().add(4, 'weeks');
              break;
            default:
              updatedEndDate = null;
          }
        } else if (value === 'Custom') {
          updatedEndDate = null;
        }
      }

      return {
        ...prev,
        [name]: value,
        end_date: updatedEndDate,
      };
    });

    console.log("Updated form values:", formValues);
  };

  const handleDateChange = (field, value) => {
    const selectedDate = value ? moment(value) : null;

    setFormValues((prev) => {
      let updatedEndDate = prev.end_date;

      if (field === 'start_date' && prev.sprint_duration && prev.sprint_duration !== 'Custom' && selectedDate) {
        const startDate = moment(selectedDate);
        switch (prev.sprint_duration) {
          case '1 week':
            updatedEndDate = startDate.clone().add(1, 'weeks');
            break;
          case '2 week':
            updatedEndDate = startDate.clone().add(2, 'weeks');
            break;
          case '3 week':
            updatedEndDate = startDate.clone().add(3, 'weeks');
            break;
          case '4 week':
            updatedEndDate = startDate.clone().add(4, 'weeks');
            break;
          default:
            updatedEndDate = null;
        }
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
    console.log("sprintIdsssss", tasks);
    const taskIds = tasks.map((task) => task.id);
    setSelectedRowsForSprint((prev) => ({
      ...prev,
      [sprintId]: isChecked ? taskIds : [],
    }));
  };

  const filteredData = data.filter((task) => task.sprint_id === 0);

  const handleCreateSprint = () => {
    const projectName = data[0].project_name
    const projectId = data[0].project_id;


    dispatch(getSprintDetailsAction({ project_id: projectId }))
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
          alert("Please select tasks to add to the sprint.");
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
            console.log("Sprint created successfully:", response);
            setCreatedSprintData((prevData) => [
              ...prevData,
              { title: newSprintName, tasks: selectedTasks },
            ]);
            setSelectedRows([]);
            dispatch(
              showTasklistAction(
                { project_id: projectId },
                (res) => setTasks(res || [])
              )
            );
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
    console.log("kjhgkhf", sprintId)
    setAnchorEl((prev) => ({ ...prev, [sprintId]: event.currentTarget }));
  };

  const handleMoreForTask = (event, taskId) => {
    console.log("dscdecc", taskId)
    setTaskAnchorEl((prev) => ({ ...prev, [taskId]: event.currentTarget }));
  };

  const handleMoveTask = (taskId, sprintId) => {
    console.log("eercfercfer", taskId, sprintId)
    const projectId = data[0].project_id;

    const payload = {
      taskId: taskId,
      sprintId: sprintId
    };

    dispatch(createSprintAction(payload))
      .then((response) => {
        console.log("Sprint created successfully:", response);
        setSelectedRows([]);
        dispatch(
          showTasklistAction(
            { project_id: projectId },
            (res) => setTasks(res || [])
          )
        );
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

  const handleSubMenuOpen = (event) => {
    setSubMenuAnchorEl(event.currentTarget);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchorEl(null);
  };

  const handleDeleteSprint = (sprintId) => {
    console.log("Deleting Sprint ID:", sprintId);
    setSelectedSprintId(sprintId);
    setOpenDeleteDialog(true);
  };

  const handleEditSprint = (sprint) => {
    console.log("Deleting Sprint ID:", sprint);
    setSelectedSprintId(sprint.sprint_id);
    setFormValues({
      sprint_name: sprint.sprint_name || '',
      sprint_duration: sprint.sprint_duration || '',
      start_date: sprint.sprint_startDate ? moment(sprint.sprint_startDate) : null,
      end_date: sprint.sprint_endDate ? moment(sprint.sprint_endDate) : null,
      sprint_goal: sprint.sprint_goal
        || '',
    });
    setOpenEditDialog(true);
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
    setOpenEditDialog(false);
    setSelectedSprintId(null);
  };

  const handleConfirmDeleteSprint = (sprintId, sprintData) => {
    const taskIds = sprintData?.tasks?.map((task) => task.id) || [];
    console.log('taskIds', taskIds);
    const payload = {
      sprintId: sprintId,
      taskIds
    };

    dispatch(deleteSprintAction(payload))
      .then((response) => {
        console.log('Response from deleteSprintAction:', response);
        if (response.message) {
          console.log(`Sprint ${sprintId} deleted successfully`);
          setOpenDeleteDialog(false);
          setSelectedSprintId(null);

          dispatch(
            showTasklistAction(
              { project_id: sprintData?.tasks?.[0]?.project_id || null },
              (res) => setTasks(res || [])
            )
          );
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
          console.log(`Sprint ${sprintId} Completed successfully`);
          setOpenCompleteDialog(false);
          setSelectedSprintId(null);

          dispatch(
            showTasklistAction(
              { project_id: projectId || null },
              (res) => setTasks(res || [])
            )
          );
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
    const startDate = sprintTask?.sprint_startDate
      ? moment(sprintTask.sprint_startDate)
      : moment();

    let endDate = sprintTask?.sprint_endDate
      ? moment(sprintTask.sprint_endDate)
      : null;

    if (!endDate) {
      const startMoment = moment(startDate);
      switch (duration) {
        case '1 week':
          endDate = startMoment.clone().add(1, 'weeks');
          break;
        case '2 week':
          endDate = startMoment.clone().add(2, 'weeks');
          break;
        case '3 week':
          endDate = startMoment.clone().add(3, 'weeks');
          break;
        case '4 week':
          endDate = startMoment.clone().add(4, 'weeks');
          break;
        default:
          endDate = startMoment.clone().add(1, 'weeks');
      }
    }

    setSelectedSprintId(sprintGroup?.sprintId);
    setStartSprintData(sprintGroup);
    setFormValues({
      sprint_name: sprintTask?.sprint_name || sprintGroup?.title || '',
      sprint_duration: duration,
      start_date: startDate,
      end_date: endDate,
      sprint_goal: sprintTask?.sprint_goal || '',
    });
    setOpenStartDialog(true);
  };

  const handleCloseStartDialog = () => {
    setOpenStartDialog(false);
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
    };

    dispatch(updateSprintAction(payload))
      .then((response) => {
        if (response?.message) {
          setOpenStartDialog(false);
          setSelectedSprintId(null);
          setStartSprintData(null);
          dispatch(getTaskByStatusAction(projectId));
          dispatch(getSprintDetailsAction());
          dispatch(
            showTasklistAction(
              { project_id: projectId },
              (res) => setTasks(res || [])
            )
          );
        }
      })
      .catch(() => {
        console.error('Error starting sprint');
      });
  };

  const handleConfirmEditSprint = (sprintId, sprintData) => {
    console.log('Deleting Sprint with ID:', sprintData);
    const taskIds = sprintData?.tasks?.map((task) => task.id) || [];
    console.log('taskIds', taskIds);

    const payload = {
      sprintId: sprintId,
      sprint_name: formValues.sprint_name,
      duration: formValues.sprint_duration,
      start_date: moment(formValues.start_date).format('YYYY-MM-DD HH:mm'),
      end_date: moment(formValues.end_date).format('YYYY-MM-DD HH:mm'),
      goal: formValues.sprint_goal
    };

    dispatch(updateSprintAction(payload))
      .then((response) => {
        console.log('Response from deleteSprintAction:', response);
        if (response.message) {
          console.log(`Sprint ${sprintId} deleted successfully`);
          setOpenEditDialog(false);
          setSelectedSprintId(null);

          dispatch(
            showTasklistAction(
              { project_id: sprintData?.tasks?.[0]?.project_id || null },
              (res) => setTasks(res || [])
            )
          );
        } else {
          setOpenEditDialog(false);
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
        console.log("Sprint ID:", task.sprint_id);
      });
    });
  }, [existingSprintData]);

  console.log("formm", existingSprintData);

  return (
    <div style={{ position: "relative", height: '780px' }}>
      <TableContainer
        style={{
          maxHeight: "calc(100% - 60px)",
          overflow: "auto",
        }}
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

        {existingSprintData.map((sprint, index) => (
          <TableContainer
            key={index}
            style={{
              maxHeight: "calc(100% - 60px)",
              overflow: "auto",
              marginTop: "20px",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={columns.length + 3} padding="checkbox">
                    <Checkbox
                      onChange={(e) => handleGroupSelectionForSprint(sprint.tasks[0].sprint_id, e.target.checked, sprint.tasks)}
                      indeterminate={
                        selectedRowsForSprint[sprint.tasks[0].sprint_id]?.length > 0 &&
                        selectedRowsForSprint[sprint.tasks[0].sprint_id]?.length < sprint.tasks.length
                      }
                      checked={
                        selectedRowsForSprint[sprint.tasks[0].sprint_id]?.length ===
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
                      {sprint.tasks[0]?.sprint_isCompleted !== 1 && !sprint.tasks[0]?.sprint_startDate && (
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
                        onClick={(event) => handleMoreMenuClick(event, sprint.tasks[0].sprint_id)}
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[sprint.tasks[0].sprint_id]}
                        open={Boolean(anchorEl[sprint.tasks[0].sprint_id])}
                        onClose={() => handleMoreMenuClose(sprint.tasks[0].sprint_id)}
                      >
                        <MenuItem onClick={() => handleEditSprint(sprint.tasks[0])}>Edit Sprint</MenuItem>
                        <MenuItem onClick={() => handleDeleteSprint(sprint.tasks[0].sprint_id)}>Delete Sprint</MenuItem>

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
                <TableCell colSpan={columns.length + 2} padding="checkbox">
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
                      selectedRows.some((rowId) =>
                        filteredData.some((row) => row.id === rowId)
                      )
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
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateSprint}
                    >
                      Create Sprint
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {showRows &&
                filteredData.map((row, index) => (
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
                            onClick={(event) => handleMoreForTask(event, row.id)}
                            style={{ padding: 4 }}
                          >
                            <MoreVert />
                          </IconButton>
                          <Menu
                            anchorEl={taskAnchorEl[row.id]}
                            open={Boolean(taskAnchorEl[row.id])}
                            onClose={() => handleMoreClose(row.id)}
                          >
                            <MenuItem onClick={(e) => handleSubMenuOpen(e)}>
                              <ListItemText primary="Move to" />
                              <ListItemIcon>
                                <ArrowRightIcon />
                              </ListItemIcon>
                            </MenuItem>

                            <Menu
                              anchorEl={subMenuAnchorEl}
                              open={Boolean(subMenuAnchorEl)}
                              onClose={handleSubMenuClose}
                              anchorOrigin={{ vertical: "top", horizontal: "left" }}
                              transformOrigin={{ vertical: "top", horizontal: "right" }}
                              slotProps={{
                                paper: {
                                  sx: {
                                    mt: 0,
                                    mr: 5,
                                  },
                                },
                              }}
                            >
                              {existingSprintData.filter((sprint) => sprint.sprint_isCompleted === 0).map((sprint) => (
                                <MenuItem
                                  key={sprint.title}
                                  onClick={() => handleMoveTask(row.id, sprint.sprintId)}
                                >
                                  {sprint.title}
                                </MenuItem>
                              ))}
                            </Menu>
                          </Menu>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>

          </Table>
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

        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography
              component="div"
              variant="h6"
              sx={{ fontSize: '1rem', fontWeight: 'bold', }}
            >
              Edit Sprint: {selectedSprint ? selectedSprint.title : ''}
            </Typography>
          </DialogTitle>
          <br />
          <DialogContent>
            <Grid container spacing={2} direction="row">
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6
                }}>
                <TextField
                  label="Sprint Name"
                  name="sprint_name"
                  variant="outlined"
                  required
                  value={formValues.sprint_name}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row">
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6
                }}>
                <TextField
                  label="Duration"
                  name="sprint_duration"
                  variant="outlined"
                  fullWidth
                  select
                  value={formValues.sprint_duration}
                  onChange={handleInputChange}
                  Select
                >
                  <MenuItem value="1 week">1 week</MenuItem>
                  <MenuItem value="2 week">2 week</MenuItem>
                  <MenuItem value="3 week">3 week</MenuItem>
                  <MenuItem value="4 week">4 week</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                  {/* Add more options as needed */}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row">
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/yyyy hh:mm A"
                    label="Start Date"
                    value={formValues.start_date}
                    onChange={(newValue) => handleDateChange('start_date', newValue)}
                    slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                    fullWidth={true}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row">
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/yyyy hh:mm A"
                    label="End Date"
                    value={formValues.end_date}
                    onChange={(newValue) => handleDateChange('end_date', newValue)}
                    disabled={formValues.sprint_duration !== 'Custom'}
                    slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                    fullWidth={true}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row">
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 12
                }}>
                <TextField
                  label="Sprint Goal"
                  name="sprint_goal"
                  variant="outlined"
                  value={formValues.sprint_goal}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmEditSprint(selectedSprintId, selectedSprint)}
              color="secondary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openStartDialog}
          onClose={handleCloseStartDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography component="div" variant="h6" sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Start another sprint
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 1 }}>
              <b>{startSprintData?.tasks?.length || 0}</b> work items will be included in this sprint.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Required fields are marked with an asterisk <b>*</b>
            </Typography>
            <Grid container spacing={2} direction="row">
              <Grid size={{ xs: 12, md: 6 }}  sx={{ m : 4 }}>
                <TextField
                  label="Sprint name *"
                  name="sprint_name"
                  variant="outlined"
                  required
                  value={formValues.sprint_name}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row"   sx={{ m : 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Duration *"
                  name="sprint_duration"
                  variant="outlined"
                  fullWidth
                  select
                  value={formValues.sprint_duration}
                  onChange={handleInputChange}
                >
                  <MenuItem value="1 week">1 week</MenuItem>
                  <MenuItem value="2 week">2 week</MenuItem>
                  <MenuItem value="3 week">3 week</MenuItem>
                  <MenuItem value="4 week">4 week</MenuItem>
                  <MenuItem value="Custom">custom</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row"   sx={{ m : 4 }}>
              <Grid size={{ xs: 12, md: 12 }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/yyyy hh:mm A"
                    label="Start date *"
                    value={formValues.start_date}
                    onChange={(newValue) => handleDateChange('start_date', newValue)}
                    slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                    fullWidth={true}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row"   sx={{ m : 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DateTimePicker
                    format="DD/MM/yyyy hh:mm A"
                    label="End date *"
                    value={formValues.end_date}
                    onChange={(newValue) => handleDateChange('end_date', newValue)}
                    disabled={formValues.sprint_duration !== 'Custom'}
                    slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                    fullWidth={true}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Grid container spacing={2} direction="row"   sx={{ m : 4 }}>
              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  label="Sprint goal"
                  name="sprint_goal"
                  variant="outlined"
                  value={formValues.sprint_goal}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStartDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmStartSprint} variant="contained" color="primary">
              Start
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </div>
  );
};

export default DataGridForBacklog;
