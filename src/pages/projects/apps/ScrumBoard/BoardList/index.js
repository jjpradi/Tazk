import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import AddNewBoard from './AddNewBoard';
import IntlMessages from '@crema/utility/IntlMessages';
import AppGridContainer from '@crema/core/AppGridContainer';
import BoardItem from './BoardItem';
import AddBoardButton from './AddBoardButton';
import AppInfoView from '@crema/core/AppInfoView';
import { Zoom, IconButton, Tooltip, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography, Grid } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import GridViewIcon from '@mui/icons-material/GridView';
import ListViewIcon from '@mui/icons-material/List';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiCalls from 'utils/apiCalls';
import {
  CreateProject,
  // CreateProjectAction,
  deleteProjectsAction,
  getEmployeeListAction,
  getProjectLanesAction,
  getProjectsAction,
  updateProjectsAction,
  viewmodeAction
} from 'redux/actions/payrollDashboard_actions';
import {getEmpbasecompanyAction} from 'redux/actions/attendance_actions';
import {listStockLocationAction} from 'redux/actions/stock_Location_actions';
import context from '../../../../../context/CreateNewButtonContext';
import AddProjectForm from 'pages/projects/AddProjectForm';
import {roleType} from 'utils/roleType';
import { getsessionStorage } from 'pages/common/login/cookies';
import { titleURL } from 'http-common';
import { Helmet } from 'react-helmet-async';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import BoardDetail from '../BoardDetail';
import CommonSearch from '../../../../../utils/commonSearch';
import {  setProjectsAction,getProjectsDataAction } from '../../../../../redux/actions/payrollDashboard_actions';
import CsvImport from 'pages/projects/CsvImport';
import { UserRightsAuthorization } from '../../../../../@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from '../../../../../redux/actions/rbac_actions';

const BoardList = () => {
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    PayrolldashboardReducers: {get_projects, get_taskProjects,getprojectTypes,createProject},
    attendanceReducer: {get_empbasecompany},
    stockLocationReducer: {stocklocation},
    roleReducer: {user_rights}, rbacReducer: { menuAccess }
  } = useSelector((state) => state);
  const selectedRole = storage.role_name
  const {
    commoncookie,
    headerLocationId,
    setLoaderStatusHandler,
    setModalTypeHandler,
  } = useContext(context);

  const [projects, setProjects] = useState(new Array());
  const [isAddBoardOpen, setAddBoardOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [navigateBoardDetails, setnavigateBoardDetails] = useState(false);
  const [selectedProjectedId, setselectedProjectedId] = useState(null);
  const [paginateData,setPaginateData] = useState({
    searchString : ''
  });
  const [showCsvImport, setShowCsvImport] = useState(false);
  
  const projectsCreate = UserRightsAuthorization(menuAccess[selectedRole], 'projects', 'can_create')
  
  useEffect(() => {
    setProjects(get_projects);
  }, [get_projects]);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getProjectsAction({ headerLocationId })),
      // dispatch(getProjectLanesAction()),
      // !get_empbasecompany.length && dispatch(getEmpbasecompanyAction()),
      !stocklocation.length &&
        dispatch(listStockLocationAction(commoncookie, headerLocationId)),
        dispatch(getUserRightsByRoleIdAction()),
        dispatch(getMenuAccessAction(selectedRole))
    );
  }, [dispatch, headerLocationId]);

  useEffect(() => {
    const employeeId = storage.employee_id;
    if (employeeId) {
      dispatch(viewmodeAction({ type: 'Get', employee_id: employeeId })).then((response) => {
        if (response && response.length > 0 && response[0].projectView !== undefined) {
          setViewMode(response[0].projectView === 0 ? 'grid' : 'list');
        }
      });
    } else {
      setViewMode('grid'); 
    }
  }, [dispatch, storage.employee_id]);

  const handleViewModeChange = (newViewMode) => {
    const employeeId = storage.employee_id;
    if (employeeId) {
      dispatch(viewmodeAction({ type: 'Update', employee_id: employeeId, projectView: newViewMode === 'grid' ? 0 : 1 })).then((response) => {
        if (response && response.length > 0 && response[0].projectView !== undefined) {
          setViewMode(response[0].projectView === 0 ? 'grid' : 'list');
        }
      });
    }
  };

  const onCloseAddBoardModal = () => {
    setAddBoardOpen(false);
  };

  const onAddButtonClick = () => {
    setSelectedBoard(null);
    setAddBoardOpen(true);
  };

  const onOpenCsvImport = () => {
    dispatch(getEmployeeListAction());
    setShowCsvImport(true);
  };

  const onEditButtonClick = (id) => {
    const projectData = projects.find((project) => project.id === id);
    setSelectedBoard(projectData);
    setAddBoardOpen(true);
  };

  const onDeleteButtonClick = (projectId) => {
    let data = {
      project_id: projectId,
      headerLocationId,
    };

    apiCalls(dispatch(deleteProjectsAction(data)));

    setSelectedBoard(null);
  };

  const onViewBoardDetail = (id, boardType) => {
    navigate(`/projects/projects?id=${id}&type=${boardType}`)
  };

  const handleSaveProjectEdit = async(formData, projectId) => {
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
        // externalProject: formData.externalProject,
        location_restriction : formData.location_restriction,
        time_tracking: formData.time_tracking,
        live_location: formData.live_location,
        id: projectId,
        backlog: formData.backlog,
        todo: formData.todo,
        inProgress: formData.inProgress,
        testing: formData.testing,
        completed: formData.completed,
        editType:formData.editType,
        boardType : formData.board,
        headerLocationId,

      };
      apiCalls(dispatch(updateProjectsAction(updatedProjectData)));
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
        // externalProject: formData.externalProject,
        location_restriction : formData.location_restriction,
        time_tracking: formData.time_tracking,
        live_location: formData.live_location,
        backlog: formData.backlog,
        todo: formData.todo,
        inProgress: formData.inProgress,
        testing: formData.testing,
        completed: formData.completed,
        boardType : formData.board,
        temp_id: formData.template,
        project_key : formData.key,
        headerLocationId,
      };
      await apiCalls(dispatch(CreateProject(newProjectData)));

    }
  };

  useEffect(()=>{ (async () => {
    const d = {
      searchString : '',
      headerLocationId
    }
    await apiCalls(dispatch(getProjectsAction(d)));

  })();
},[createProject])

  const getProjectTypeLabel = (type) => {
    switch (type) {
      case 2:
        return 'Single Location';
      case 3:
        return 'Multiple Location';
      case 4:
        return 'Live Location';
      default:
        return 'Regular';
    }
  }

  const getLocationRestrictionLabel = (type, restriction) => {
    if (type !== 1 && type !== 4) {
      return restriction === 0 ? 'Disabled' : restriction === 1 ? 'Enabled' : '-';
    }
    return '-';
  };
  
  const getTimeTrackingLabel = (tracking) => {
    return tracking === 0 ? 'Disabled' : tracking === 1 ? 'Enabled' : '-';
  };
  
  const getLiveLocationLabel = (type, location) => {
    if (type === 4) {
      return location === 0 ? 'Disabled' : location === 1 ? 'Enabled' : '-';
    }
    return '-';
  };

  const addProject = getRoleAuthorization(user_rights,'ProjectCreation')

  const isAdmin = roleType.includes(storage?.role_name);

  const requestSearch = (e)=>{
    const val =e.target.value
    setPaginateData({...paginateData,searchString : val})

    dispatch(setProjectsAction({
      data : []
    }))

    const payload = {
      searchString : val,
      headerLocationId
    }

    dispatch(
      getProjectsDataAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    )
  }

  const cancelSearch =()=>{
    setPaginateData({...paginateData,searchString : ''})

    dispatch(setProjectsAction({
      data : []
    }))

    const payload = {
      searchString : '',
      headerLocationId
    }

    dispatch(
      getProjectsDataAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    )

  }

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Projects </title>
      </Helmet>
      <Zoom direction='up' in mountOnEnter unmountOnExit>
        <Box>
          <Grid
            container
            alignItems='center'
            justifyContent='space-between'
            sx={{height: '50px'}}
          >
            <Grid>
              <Typography
               className='page-title'
              >
                Projects
              </Typography>
            </Grid>
            <Grid>
              <Box display='flex' justifyContent='flex-end'>
                {isAdmin && (
                  <Tooltip title='Import CSV'>
                    <IconButton color='primary' onClick={onOpenCsvImport}>
                      <UploadFileIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip
                  title={
                    viewMode === 'grid'
                      ? 'Switch to List View'
                      : 'Switch to Grid View'
                  }
                >
                  <IconButton
                    color='primary'
                    onClick={() => {
                      const newViewMode = viewMode === 'grid' ? 'list' : 'grid';
                      setViewMode(newViewMode);
                      handleViewModeChange(newViewMode);
                    }}
                  >
                    {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          {viewMode === 'grid' ? (
            <Box sx={{ maxHeight: "80vh", overflowY: "auto", paddingRight: 1,}}>
            <AppGridContainer
              sx={{
                justifyContent: 'center',
              }}
            >
              {addProject && (
                <AddBoardButton onAddButtonClick={onAddButtonClick} />
              )}
              {projects && projects.length
                ? projects.map((board) => (
                    <BoardItem
                      key={board.id}
                      board={board}
                      onEditButtonClick={onEditButtonClick}
                      onViewBoardDetail={onViewBoardDetail}
                      onDeleteButtonClick={onDeleteButtonClick}
                    />
                  ))
                : null}
            </AppGridContainer>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              {/* {roleType.includes(storage.role_name) && ( */}
                <Box>
                   {projectsCreate && (
                 <Grid spacing={2} display={'flex'} justifyContent='space-between' alignItems='center' padding={2}>
                    <Grid>
                      <CommonSearch
                        searchVal={paginateData.searchString}
                        requestSearch={requestSearch}
                        cancelSearch={cancelSearch}
                    />
                    </Grid>
                    <Grid>
                  <Tooltip title={<IntlMessages id='scrumboard.addNewProject' />}>
                    <IconButton onClick={onAddButtonClick} color='primary'>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                    </Grid>
                  </Grid>
                  )}
                </Box>
              {/* )} */}
              <TableContainer component={Paper}
              sx={{maxHeight: "80vh", overflow: "auto"}}>
              <Table stickyHeader aria-label='projects table'>
                <TableHead>
                  <TableRow>
                    <TableCell className='table-title'
                    >
                      Project Name
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Key
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Project Owner
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Project Type
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Time Tracking
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Location Restriction
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Live Location
                    </TableCell>
                    <TableCell className='table-title'
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects && projects.length ? (
                    projects.map((board) => (
                      <TableRow key={board.id}>
                        <TableCell className='table-content'
                        >
                          {board.project_name}
                        </TableCell>
                        <TableCell className='table-content'
                        >
                          {board.project_key}
                        </TableCell>
                        <TableCell className='table-content'
                        >
                          {storage.last_name ?`${storage.first_name } ${storage.last_name} ` : storage.first_name} 
                        </TableCell>
                        <TableCell className='table-content'
                        >
                          {getProjectTypeLabel(board.project_type)}
                        </TableCell>
                        <TableCell
                         className='table-content'
                        >
                          {getTimeTrackingLabel(board.time_tracking)}
                        </TableCell>
                        <TableCell
                          className='table-content'
                        >
                          {getLocationRestrictionLabel(
                            board.project_type,
                            board.location_restriction,
                          )}
                        </TableCell>
                        <TableCell
                          className='table-content'
                        >
                          {getLiveLocationLabel(
                            board.project_type,
                            board.live_location,
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title='View'>
                            <IconButton
                              onClick={() => onViewBoardDetail(board.id)}
                              color='#f2f2f2'
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          {roleType.includes(storage.role_name) && (
                            <Tooltip title='Edit'>
                              <IconButton
                                onClick={() => onEditButtonClick(board.id)}
                                color='#f2f2f2'
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {roleType.includes(storage.role_name) && (
                            <Tooltip title='Delete'>
                              <IconButton
                                onClick={() => onDeleteButtonClick(board.id)}
                                color='#f2f2f2'
                                disabled={board.total_count !== 0}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align='center' sx={{ fontFamily: 'poppins', fontSize: '11px', fontWeight: '400', color: 'rgba(0, 0, 0, 0.7)' }}>
                        No projects available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </TableContainer>
            </TableContainer>
          )}
        </Box>
      </Zoom>
      {isAddBoardOpen ? (
        <AddProjectForm
          open={isAddBoardOpen}
          onClose={onCloseAddBoardModal}
          onSave={handleSaveProjectEdit}
          projectData={selectedBoard}
          showLocation={stocklocation}
        />
      ) : null}
      <CsvImport
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
      />
      <AppInfoView />
    </>
  );
};

export default BoardList;
