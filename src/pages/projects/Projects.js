// ProjectListPage.js
import React, { useContext, useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { CreateProjectAction, createTaskAction, deleteProjectsAction, deleteTaskAction, getProjectsAction, showTasklistAction, updateProjectsAction, updateTaskAction } from 'redux/actions/payrollDashboard_actions';
import context from '../../context/CreateNewButtonContext';
import EditIcon from '@mui/icons-material/Edit';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import moment from 'moment';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import AddProjectForm from './AddProjectForm';
import AddTaskDialog from './AssignTask';
import CsvImport from './CsvImport';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getsessionStorage } from 'pages/common/login/cookies';
import Bulkassign from './Bulkassign';
import CommonToolTip from 'components/ToolTip';
import { Helmet } from 'react-helmet-async';
import { popup } from 'leaflet';
import { commonDateFormat1 } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';

const storage = getsessionStorage()

const projectCardSx = { cursor: 'pointer' };
const selectedProjectSx = { backgroundColor: '#d7dedc' };
const deleteIconSx = { color: '#990000' };

const ProjectListPage = () => {
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const dispatch = useDispatch();
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [taskDataForEdit, setTaskDataForEdit] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [bulkopen, setBulkopen] = useState(false);
  const [isSelectedHasTask, setIsSelectedHasTask] = useState(true);
  const [showCsvImport, setShowCsvImport] = useState(false);

  const storage = getsessionStorage()
  const company_type = storage?.company_type || null

  const {
    PayrolldashboardReducers: { get_projects, get_taskProjects ,getProjectLanes},
    attendanceReducer: { get_empbasecompany },
    stockLocationReducer: { stocklocation }
  } = useSelector((state) => state);
  const { commoncookie,headerLocationId,setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getProjectsAction()),
      dispatch(getEmpbasecompanyAction()),
      dispatch(listStockLocationAction(commoncookie,headerLocationId))
    );
  }, []);

  useEffect(() => {
      if(get_projects.length > 0) {
        const firstProject = get_projects[0]
        let data = {
          project_id: firstProject.id
        };
   
        setSelectedProjectId(firstProject.id);
        // console.log('asdsfs',data)
        dispatch(showTasklistAction(data));
        setSelectedProjectData(firstProject);
      }
    }, [get_projects])

useEffect(()=>{
  if(selectedProjectData !== null){
    let sample = get_taskProjects.some(i => i.project_name === selectedProjectData?.project_name)
    setIsSelectedHasTask(sample)
  }
},[get_taskProjects])

  // useEffect((projectId)=>{
  //   let data1 = {
  //     project_id: projectId
  //   };  

  //   dispatch(showTasklistAction(data1));
  // },[])

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);

    let data = {
      project_id: projectId
    };

    dispatch(showTasklistAction(data));

    const projectData = get_projects.find((project) => project.id === projectId);
    setSelectedProjectData(projectData);
  };

  const handleAddProjectClick = () => {
    setShowAddProjectForm(true);
  };

  const handleSaveProject = async (project) => {
    const data = {
      project_name: project.projectName,
      project_type: project.projectType,
      location_id: project.location_name,
      location_restriction : project.location_restriction,
      time_tracking: project.time_tracking,
      live_location: project.live_location,
      latitude: project.latitude,
      longitude: project.longitude,
      project_lead_id: project.project_lead,
      url: project.project_url,
      category_id: project.category,
      backlog: project.backlog,
      todo: project.todo,
      inProgress: project.inProgress,
      testing: project.testing,
      completed: project.completed,
      boardType: project.board,
      temp_id: project.template,
      project_key: project.key,
    };

    await dispatch(CreateProjectAction(data));
    setShowAddProjectForm(false);
  };

  const handleCancelProject = () => {
    setShowAddProjectForm(false);
  };

  const handleAddTaskClick = () => {
    setSelectedTaskForEdit(null);
    setShowAddTaskDialog(true);
  };
 
  const handleBulkAssign = () => {
    setBulkopen(true)
  }

  function compareObjects(obj1, obj2) {
    const changedValues = {};
    for (const key in obj1) {
      if (
        Object.prototype.hasOwnProperty.call(obj1, key) &&
        Object.prototype.hasOwnProperty.call(obj2, key)
      ) {
        if (obj1[key] !== obj2[key]) {
          changedValues[key] = obj2[key];
        }
      }
    }
    return changedValues;
  }

  const handleSaveTask = (task, actionName) => {
    if(actionName === 'copy'){
      let newTaskData = {
        task_name: task.taskName,
        // user_id: task.selectedStaff === '' ? null : task.selectedStaff,
        start_date: moment().format('yyyy-MM-DD'),
        // location_id: task.projectLocation,
        project_id: task.selectedProject,
        priority: task.priority,
        description: task.description,
        repeat: task?.repeat ?? null,
        status: task.status,
        // reporter:task.reporter,
        orginalEstimation:task.orginalEstimation,
        due_date : task.dueDate,
        project_key:task.project_key,
        epic_name:task.epic_name,
        epic_id: task.epic_id
        // asignee:task.asignee
      };

      // console.log('newTaskData',newTaskData)
      apiCalls(
        dispatch(createTaskAction(newTaskData, () => {}))
      );
    } else {
      if (task.id) {
        let updatedTaskData = {
          task_name: task.taskName,
          user_id: task.selectedStaff === '' ? null : task.selectedStaff,
          start_date: moment(task.startDate).format('yyyy-MM-DD'),
          location_id: task.projectLocation,
          project_id: task.selectedProject,
          company_id: storage?.company_id,
          priority: task.priority,
          description: task.description,
          status:task.status,
          reporter:task.reporter,
          orginalEstimation:task.orginalEstimation,
          asignee:task.asignee,
          remarks:task.remarks
        };

        let data = {
          project_id: task.selectedProject,
          company_id: storage?.company_id
        };

        let payload = compareObjects(selectedTaskForEdit, updatedTaskData)
        payload.updatedAt = selectedTaskForEdit?.updatedAt ?? null;
        // console.log("payloadpayload",payload,selectedTaskForEdit,updatedTaskData)
        apiCalls(
          dispatch(updateTaskAction(task.id, payload, (response, conflictInfo) => {
            if(response === 200){
              dispatch(showTasklistAction(data))
            } else if (response === 409) {
              window.alert(conflictInfo?.message || 'This task was modified by someone else. Please reload and try again.');
              dispatch(showTasklistAction(data));
            }
          }))
        );
      } else {
        let newTaskData = {
          task_name: task.taskName,
          user_id: task.selectedStaff === '' ? null : task.selectedStaff,
          start_date: moment(task.startDate).format('yyyy-MM-DD'),
          location_id: task.projectLocation,
          project_id: task.selectedProject,
          company_id: storage?.company_id,
          priority: task.priority,
          description: task.description,
          status: task.status,
          repeat: task.repeat,
          reporter:task.reporter,
          orginalEstimation:task.orginalEstimation,
          asignee:task.asignee,
          remarks:task.remarks,
          project_key:task.project_key,
          epic_name:task.epic_name,
          epic_id: task.epic_id
        };

        // console.log('newTaskData',newTaskData)
        apiCalls(
          dispatch(createTaskAction(newTaskData, () => {}))
        );
      }
    }

    setShowAddTaskDialog(false);
  };

  const handleSaveProjectEdit = async (formData, projectId) => {
    if (projectId) {
      const updatedProjectData = {
        project_name: formData.projectName,
        project_type: formData.projectType,
        location_id: formData.location_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        project_lead_id: formData.project_lead,
        project_key: formData.key,
        url: formData.project_url,
        category_id: formData.category,
        location_restriction : formData.location_restriction,
        time_tracking: formData.time_tracking,
        live_location: formData.live_location,
        id: projectId,
        backlog: formData.backlog,
        todo: formData.todo,
        inProgress: formData.inProgress,
        testing: formData.testing,
        completed: formData.completed,
        editType: formData.editType,
        boardType: formData.board,
        temp_id: formData.template,
      };
      await dispatch(updateProjectsAction(updatedProjectData));
      setShowEditProjectForm(false);
    } else {
      const newProjectData = {
        project_name: formData.projectName,
        project_type: formData.projectType,
        location_id: formData.location_name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        project_lead_id: formData.project_lead,
        url: formData.project_url,
        category_id: formData.category,
        location_restriction : formData.location_restriction,
        live_location: formData.live_location,
        time_tracking: formData.time_tracking,
        backlog: formData.backlog,
        todo: formData.todo,
        inProgress: formData.inProgress,
        testing: formData.testing,
        completed: formData.completed,
        boardType: formData.board,
        temp_id: formData.template,
        project_key: formData.key,
      };
      await dispatch(CreateProjectAction(newProjectData));
      setShowEditProjectForm(false);
    }
  };


  const handleEditProject = (projectId) => {
    const projectData = get_projects.find((project) => project.id === projectId);
    setSelectedProjectData(projectData);
    setShowEditProjectForm(true);
  };


  const handleDeleteProject = (projectId) => {
    let data = {
      id: projectId
    };

    apiCalls(
      dispatch(deleteProjectsAction(data))).then(()=>{
         let data = {
      id: projectId
    };

    dispatch(deleteTaskAction(data));
      })

  
    setSelectedProjectData(null);

      
  };


  const handleCancel = () => {
    setShowAddTaskDialog(false)
  };

  const handleEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setShowAddTaskDialog(true);
  };
  
  const isAdmin = roleType.includes(storage?.role_name);

  // console.log('dwewqew',get_taskProjects)
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Projects </title>
      </Helmet>
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          {/* <Typography variant="h5" gutterBottom>
            Project List
          </Typography> */}
          <Grid
            size={{
              xs: 12,
              md: 4,
              lg: 4,
              sm: 4
            }}>
            <Card
              sx={{
                height: parseInt(windowHeight) - parseInt(toolbarHeight),
              }}
            >
              {isAdmin && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color='primary'
                    title='Add Project'
                    onClick={handleAddProjectClick}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    color='primary'
                    title='Import CSV'
                    onClick={() => setShowCsvImport(true)}
                  >
                    <UploadFileIcon />
                  </IconButton>
                </Box>
              )}
              <CardContent>
                <List>
                {get_projects.length > 0 ? (
                  get_projects.map((project) => (
                    <React.Fragment key={project.id}>
                      <ListItem
                        button
                        onClick={() => handleProjectClick(project.id)}
                        divider={project.id !== get_projects.length}
                        sx={{
                          ...projectCardSx,
                          ...(selectedProjectId === project.id ? selectedProjectSx : {}),
                        }}
                      >
                        <ListItemText
                          primary={project.project_name}
                          secondary={
                            <Stack display='flex' direction='column' gap={1}>
                              <Typography>
                                {`Type: ${project.project_type}`}
                              </Typography>
                              <Typography>
                                {`Location: ${project.location_name}`}
                              </Typography>
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          {isAdmin && selectedProjectId === project.id ? (
                            <>
                              <CommonToolTip title='Edit'>
                                <IconButton
                                  edge='end'
                                  aria-label='edit'
                                  onClick={() => handleEditProject(project.id)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </CommonToolTip>

                              <CommonToolTip title='Delete'>
                                <IconButton
                                  edge='end'
                                  aria-label='delete'
                                  sx={deleteIconSx}
                                  disabled={isSelectedHasTask}
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </CommonToolTip>
                            </>
                          ) : (
                            <></>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))
                ) :
                 (
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      xs: 12
                    }}>
                  <Typography >No Project found</Typography>
                  </Grid>
                 )
                   }
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 8,
              lg: 8,
              sm: 8
            }}>
            {selectedProjectData && (
              <Card
                sx={{
                  height: parseInt(windowHeight) - parseInt(toolbarHeight),
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{width: '80%'}}>
                    <CardHeader
                      title={`Tasks for ${selectedProjectData.project_name}`}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '20%',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                    textAlign={'right'}
                  >
                    {isAdmin && (
                      <IconButton
                        color='primary'
                        title='Add Task'
                        onClick={handleAddTaskClick}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                    {company_type === 6 && (
                      <IconButton
                        color='primary'
                        title='Bulk Assign'
                        onClick={handleBulkAssign}
                      >
                        <HowToRegIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <CardContent>
                  {get_taskProjects.length > 0 ? (
                    <List>
                      {get_taskProjects.map((task, index) => (
                        <React.Fragment key={task.id}>
                          <ListItem
                            sx={projectCardSx}
                             //onClick={() => handleEditTask(task)}
                          >
                            <ListItemText
                              primary={`${index + 1}: ${task.task_name}`}
                              secondary={
                                <div onClick={() => handleEditTask(task)}>
                                  <div>
                                    <span style={{fontWeight: 'bold'}}>
                                      Staff Assigned:
                                    </span>{' '}
                                    {task.full_name}
                                  </div>
                                  <div>
                                    <span style={{fontWeight: 'bold'}}>
                                      Start Date:
                                    </span>{' '}
                                    {/* {moment(task.start_date).format('DD-MM-YYYY')} */}
                                    {commonDateFormat1(task.start_date)}
                                  </div>
                                  <div>
                                    <span style={{fontWeight: 'bold'}}>
                                      Priority:
                                    </span>{' '}
                                    {task.priority_name}
                                  </div>
                                  <div>
                                    <span style={{fontWeight: 'bold'}}>
                                      Location:
                                    </span>{' '}
                                    {task.location_name}
                                  </div>
                                </div>
                              }
                            />

                            <ListItemSecondaryAction>
                              {/* {isAdmin && ( */}
                                {/* <IconButton
                                  edge='end'
                                  aria-label='edit'
                                  className={classes.editButtonHover}
                                  onClick={() => handleEditTask(task)}
                                >
                                  <EditIcon />
                                </IconButton> */}
                              {/* )} */}
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body1'>
                      No tasks available for this project.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
            {!selectedProjectData && (
              <Typography variant='body1' align='center'>
                Click on a project to view its tasks.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
      <AddProjectForm
        open={showEditProjectForm}
        onClose={() => setShowEditProjectForm(false)}
        onSave={handleSaveProjectEdit}
        projectData={selectedProjectData}
        showLocation={stocklocation}
        data={get_projects}
      />
      {showAddTaskDialog && (
        <Dialog open={showAddTaskDialog} onClose={() => {
          setShowAddTaskDialog(false);
          setTaskDataForEdit(null);
        }} fullWidth maxWidth="md">
        <DialogTitle>Add new task</DialogTitle>
        <DialogContent>
      <AddTaskDialog
        open={showAddTaskDialog}
        onClose={() => {
          setShowAddTaskDialog(false);
          setTaskDataForEdit(null);
        }}
        projectData={selectedProjectData}
        onSave={handleSaveTask}
        projectSelection={get_projects}
        staffsList={get_empbasecompany}
        taskDataForEdit={selectedTaskForEdit}
        location={stocklocation}
          />
        </DialogContent>
        </Dialog>
)}
      <AddProjectForm
        open={showAddProjectForm}
        onClose={() => setShowAddProjectForm(false)}
        onSave={handleSaveProject}
      />
      <Bulkassign open={bulkopen} onClose={() => setBulkopen(false)} />
      <CsvImport
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
      />
    </>
  );
};

export default ProjectListPage;
