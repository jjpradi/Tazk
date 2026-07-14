import React, { useState , useEffect,useContext,useRef} from 'react';
import { Dialog, Grid,DialogContent,Tooltip ,MenuItem, Menu, DialogContentText,DialogTitle, IconButton , DialogActions,Button} from '@mui/material';
import { useSelector, useDispatch  } from 'react-redux';
import Card from '@mui/material/Card';
import { CardContent,Typography,Avatar } from '@mui/material';
import { Height } from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import CardHeader from 'pages/projects/apps/ScrumBoard/BoardDetail/List/AddCard/CardHeader';
import AddCard from 'pages/projects/apps/ScrumBoard/BoardDetail/List/AddCard';
import AddTaskDialog from 'pages/projects/AssignTask';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { taskDetailsCountAction , getActivityAction, filterTaskDetailsAction,showTasklistAction, createTaskAction,getTaskByStatusAction,updateTaskAction,updataTaskStatusAction, getProjectDetailsAction, tasksDeleteAction} from 'redux/actions/payrollDashboard_actions';
import usePaginatedTasks from './usePaginatedTasks';
import CircularProgress from '@mui/material/CircularProgress';
import { get_search_company_based_employee,getEmpbasecompanyFilterAction,set_search_company_based_employee } from 'redux/actions/attendance_actions';
import moment from 'moment';
import {useParams} from 'react-router-dom';
import apiCalls from 'utils/apiCalls';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import context from '../../../src/context/CreateNewButtonContext';
import {getsessionStorage} from 'pages/common/login/cookies';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';


const TaskView = ({ projectname,duedate,search, employee}) => {
    const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
    const [selectedProjectData, setSelectedProjectData] = useState ({page:"task"});
    const [value, setValue] = useState([])
    const dispatch = useDispatch();
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const storage = getsessionStorage();
    const {
        PayrolldashboardReducers: { get_projects,taskDetailsCount,filterTaskDetails ,getTasklist},
        attendanceReducer: { searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
        stockLocationReducer: { stocklocation },
        LiveLocationReducer:{getTaskLogs},
        roleReducer: {user_rights}
      } = useSelector((state) => state);

      const [selectedTaskForEdit, setselectedTaskForEdit]=useState({})
      const [projectData, setProjectData] = useState({})

      // Server-paginated task list with infinite scroll. Page resets when any
      // filter prop changes; sentinelRef sits at the end of the grid and
      // triggers the next page when scrolled into view.
      const {
        tasks,
        setTasks,
        loading,
        appending,
        hasMore,
        sentinelRef,
        refetch: refetchTasks,
      } = usePaginatedTasks({
        search,
        projectname,
        duedate,
        employee,
        typeFilter: 'all',
        refreshKey: showAddTaskDialog ? 0 : 1, // refresh when dialog closes after edits
      });

      useEffect(() => {
        dispatch(taskDetailsCountAction());
        dispatch(getActivityAction());
        dispatch(getUserRightsByRoleIdAction());
      }, [dispatch]);

         useEffect(() => {
          let data1 = {
            searchString:""
          }
        }, [])


      const handleAddTaskClick = async (projectId, val) => {
  await dispatch(
    getProjectDetailsAction(val.project_id, async (response) => {
      const res = await response;
      const details = res?.status === 200 ? res.data || {} : {};

      if (res?.status === 200) {
        setProjectData(details);
      }

      setselectedTaskForEdit({
        ...val,
        id: val?.id ?? val?.taskId ?? val?.task_id ?? null,
        taskId: val?.taskId ?? val?.task_id ?? val?.id ?? null,
        task_id: val?.task_id ?? val?.taskId ?? val?.id ?? null,
        issue_type: val?.issue_type ?? val?.issueType ?? '',
        issueType: val?.issue_type ?? val?.issueType ?? '',
        employee_id: val?.employee_id ?? val?.asignee ?? val?.assignee ?? val?.user_id ?? '',
        asignee: val?.employee_id ?? val?.asignee ?? val?.assignee ?? val?.user_id ?? '',
        repeatId: val?.repeatId ?? val?.repeat ?? '',
        storyId: val?.storyId ?? val?.story_id ?? '',
        story_id: val?.story_id ?? val?.storyId ?? '',
        epic_id: val?.epic_id ?? val?.epicId ?? '',
        sprint_id: val?.sprint_id ?? val?.sprintId ?? '',
        epic_key: val?.epic_key ?? val?.project_key ?? details?.project_key ?? '',
        story_key_id: val?.story_key_id ?? val?.storyKeyId ?? null,
        parent_task_key: val?.parent_task_key ?? val?.parentTaskKey ?? '',
        reporter: val?.reporter ?? val?.reporter_id ?? '',
        orginalEstimation: val?.orginalEstimation ?? val?.original_estimation ?? '',
        timeSpent: val?.timeSpent ?? val?.time_spent ?? '',
        start_date: val?.start_date ?? val?.startDate ?? null,
        due_date: val?.due_date ?? val?.dueDate ?? null,
      });

      setShowAddTaskDialog(true);
    }),
  );
};


    
  const handleChangeEmployeeName =(val)=>{
    setValue(val)
  }

  const getAssigneeId = (fallback) => {
    if (Array.isArray(value)) {
      return value[0]?.employee_id ?? fallback;
    }
    return value?.employee_id ?? fallback;
  };

      const requestSearchEmployeeFilter = (val) => {
        setSearchValEmployeeFilter(val);
        dispatch(set_search_company_based_employee([]));
      
        if (!val) {
          return
        }
      
        let data = {
          searchString: val
        }
      
        dispatch(
          get_search_company_based_employee(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        );

      };

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

      const [anchorEl, setAnchorEl] = useState(null);
      const [deleteDialog, setDeleteDialog] = useState(false);

      const handleClose = (event) => {
        event.stopPropagation();
        setDeleteDialog(false);
      };

      const handleMenuOpen = (event,id) => {
        event.stopPropagation();
        setSelectedTaskId(id);
        setAnchorEl(event.currentTarget);
      };

      const handleMenuClose = (event) => {
        if (event) {
          event.stopPropagation();
        }
        setAnchorEl(null);
      };
      
      
      const handleDelete = (event) => {
        event.stopPropagation();
        dispatch(tasksDeleteAction({ id: selectedTaskId, type: "all" }, async () => {
          refetchTasks();
        }));
        setDeleteDialog(false);
      };

      const handleSaveTask = async(task, actionName) => {
        if (actionName === 'copy') {
          // let previewData = selectedTaskForEdit.filter((f) => f.id === id)
          // console.log('previewData',previewData)
          let newTaskData = {
            task_name: task.taskName,
            user_id: task.selectedStaff === '' ? null : task.selectedStaff,
            start_date: moment().format('yyyy-MM-DD'),
            project_id: selectedTaskForEdit.project_id,
            priority: 2,
            status: 1,
            repeat: task?.repeat ?? null,
            description: task.description,
            orginalEstimation: task.orginalEstimation,
            asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
            previews: [task.preImage],
            type: 'copy',
            taskLocation: task.taskLocation,
            task_latitude: task.task_latitude,
            task_longitude: task.task_longitude,
            due_date : task.dueDate,
            issue_type : task?.issueType,
            project_key:task.project_key,
            epic_name:task.epic_name,
            epic_id: task.epic_id
          };
          apiCalls(
            dispatch(
              createTaskAction(newTaskData, (response) => {
                if (response === 200) {
                  dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id));
                  dispatch(taskDetailsCountAction());
                  refetchTasks();
                }
              }),
            ),
          );
        } else {
          if (selectedTaskForEdit.project_id) {
            // console.log('taskk', task);
            let updatedTaskData = {
              task_name: task.taskName,
              user_id: task.selectedStaff === '' ? null : task.selectedStaff,
              start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
              due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
              location_id: task.projectLocation,
              project_id: selectedTaskForEdit.project_id,
              priority: task.priority,
              priority_name: task.priority_name,
              description: task.description,
              status: task.status,
              repeatId: task.repeat,
              status_name: task.status_name,
              reporter: task.reporter,
              orginalEstimation: task.orginalEstimation,
              asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
              remarks: task.remarks,
              previews: task.previews?.length ? task.previews : [''],
              taskLocation: task.taskLocation,
              task_latitude: task.task_latitude,
             task_longitude: task.task_longitude,
             issue_type : task?.issueType,
             epic_name:task.epic_name,
             epic_id: task.epic_id
            };
    
            let data = {
              project_id: task.selectedProject,
            };
            let payload = compareObjects(selectedTaskForEdit, updatedTaskData);
            // console.log('payload',payload,updatedTaskData)
            // let arr=[]
            // arr.push(selectedTaskForEdit)
            // setTasks(arr)
            await apiCalls(
              setModalTypeHandler, setLoaderStatusHandler,
              dispatch(
                updateTaskAction(selectedTaskForEdit.taskId, {...payload,project_id: selectedTaskForEdit.project_id,image_key : task.imageKey, updatedAt: selectedTaskForEdit?.updatedAt ?? null}, (response, conflictInfo) => {
                  if (response === 409) {
                    window.alert(conflictInfo?.message || 'This task was modified by someone else. Please reload and try again.');
                    dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id));
                    return;
                  }
                  if (response === 200) {
                    dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id));
                    dispatch(taskDetailsCountAction());
                    refetchTasks();
                  }
                }),
              ),

            );
          } else {
            let newTaskData = {
              task_name: task.taskName,
              user_id: task.selectedStaff === '' ? null : task.selectedStaff,
              start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
              due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
              location_id: task.projectLocation,
              project_id: task.project_id,
              priority: task.priority === '' ? 2 : task.priority,
              description: task.description,
              status: task.status === '' ? 4 : task.status,
              repeat: task.repeat,
              reporter: task.reporter,
              orginalEstimation: task.orginalEstimation,
              asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
              remarks: task.remarks,
              previews: task.previews,
              taskLocation: task.taskLocation,
              task_latitude: task.task_latitude,
             task_longitude: task.task_longitude,
             issue_type : task?.issueType,
             project_key:task.project_key,
             epic_name:task.epic_name,
             epic_id: task.epic_id
            };
    
            let data = {
              project_id: task.selectedProject,
            };
    
            // console.log('sdsfww',newTaskData)
    
            apiCalls(
              dispatch(
                createTaskAction(newTaskData, (response) => {
                  if (response === 200) {
                    dispatch(getTaskByStatusAction(task.project_id));
                    dispatch(taskDetailsCountAction());
                    refetchTasks();
                  }
                }),
              ),
            );
          }
        }
    
        setShowAddTaskDialog(false)
      };


      // console.log(selectedProjectData,"dfgh")
      const renderPriorityIcon = (priority) => {
        switch (priority) {
            case 'Highest':
                return (
                    <Tooltip title="Highest Priority">
                        <KeyboardDoubleArrowUpIcon sx={{ color: '#bf2e2e' }} />
                    </Tooltip>
                );
            case 'High':
                return (
                    <Tooltip title="High Priority">
                        <KeyboardArrowUpIcon sx={{ color: '#bf2e2e' }} />
                    </Tooltip>
                );
            case 'Low':
                return (
                    <Tooltip title="Low Priority">
                        <KeyboardArrowDownIcon sx={{ color: '#de893a' }} />
                    </Tooltip>
                );
                case 'Medium':
                  return (
                      <Tooltip title="Medium Priority">
                          <DragHandleIcon sx={{ color: '#de893a' }} />
                      </Tooltip>
                  );
            default:
                return null;
        }
    };

    const alltask = getRoleAuthorization(user_rights,'DeleteTask')

    return (
      <div style={{
      padding: '0 10px',
      height: '90vh',
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
        }
      `}
    </style>
        <Grid
     container
     direction="row"
     spacing={3}
     sx={{ overflowX: 'auto', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}
   >
         {loading ? (
           <div>Loading...</div>
         ) :
           tasks.length > 0 ? (
             tasks?.map((t, index) => (
               <Grid
                 key={index}
                 size={{
                   lg: 4,
                   md: 4,
                   sm: 12,
                   xs: 12
                 }}>
                 <div style={{ cursor: 'pointer', position: 'relative' }} 
                      onClick={() => handleAddTaskClick(t.id, t)}>
                   <Card 
                     style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px'}}
                   >
                     {/* IconButton */}
                     {alltask && (
                      <IconButton
                      title="More"
                      onClick={(event) => handleMenuOpen(event, t.taskId)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                       zIndex: 1,
                      }}
                      >
                        <MoreVertIcon
                        sx={{
                          fontSize: 20,
                          color: 'black',
                        }}/>
                        </IconButton>
                      )}
             
                     {/* Menu */}
                     <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                       anchorOrigin={{
                         vertical: 'top',
                         horizontal: 'right',
                       }}
                       transformOrigin={{
                         vertical: 'top',
                         horizontal: 'right',
                       }}
                       getContentAnchorEl={null}
                       PaperProps={{
                         style: {
                           maxHeight: 200,
                           width: 80,
                           boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)', // Lighter shadow
                           borderRadius: '8px',
                           backgroundColor: 'white',
                         },
                       }}
                     >
                       {/* <MenuItem
                         onClick={(event) => {
                           event.stopPropagation();
                           handleMenuClose();
                         }}
                       >
                         Edit
                       </MenuItem> */}

                       {alltask && (
                         <MenuItem
                         onClick={(event) => {
                           event.stopPropagation();
                           setDeleteDialog(true);
                           handleMenuClose();
                         }}
                       >
                         Delete
                       </MenuItem>
                       )}

                     </Menu>

                     <Dialog
                       open={deleteDialog}
                       onClose={handleClose}
                       slotProps={{
                         backdrop: {
                           sx: {
                             backgroundColor: 'rgba(0, 0, 0, 0.02)',
                           },
                         },
                       }}
                       PaperProps={{ 
                         style: {
                           boxShadow: 'none',
                           borderRadius: 0,
                           background: 'white',
                         },
                       }}
                     >
                 <DialogTitle>{'Delete Alert'}</DialogTitle>
                 <DialogContent>
                   <DialogContentText>
                     Are you sure you want to delete this Task?
                   </DialogContentText>
                 </DialogContent>
                 <DialogActions>
                   <Button variant="contained" color="primary" onClick={handleClose}>
                     Cancel
                   </Button>
                   <Button variant="contained"  color="error" onClick={handleDelete} autoFocus>
                     Delete
                   </Button>
                 </DialogActions>
               </Dialog>
             
                     {/* Card Content */}
                     <CardContent style={{ display: 'flex', alignItems: 'center', padding: '4px 8px' }}>
                       <Avatar sx={{ width: 25, height: 25, fontSize: 15, backgroundColor: '#CECECE', marginRight: '4px' }}>
                         {t?.assignee_name ? t?.assignee_name[0].toUpperCase() : <AccountCircleIcon sx={{ fontSize: 20, color: '#CECECE' }} />}
                       </Avatar>
                       <Typography 
                         variant="subtitle2" 
                         sx={{
                           fontWeight: 'bold', 
                           fontSize: '0.85rem', 
                           marginRight: '8px', 
                           whiteSpace: 'nowrap', 
                           overflow: 'hidden', 
                           textOverflow: 'ellipsis', 
                           fontFamily: 'poppins'
                         }}
                       >
                         {t?.assignee_name || 'Unassigned'}
                       </Typography>
                     </CardContent>
                     <CardContent style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
                       <Typography 
                         variant="body2" 
                         sx={{
                           fontSize: '0.8rem', 
                           whiteSpace: 'nowrap', 
                           overflow: 'hidden', 
                           fontFamily: 'poppins', 
                           fontWeight: '400',
                           mb:2, pt:2,
                           color: 'rgba(0, 0, 0, 0.7)'
                         }}
                       >
                         {t?.project_name}
                       </Typography>
                     </CardContent>
                     <CardContent style={{ padding: '0 8px 4px 8px', display: 'flex', alignItems: 'center' }}>
                       <Typography 
                         variant="body2" 
                         sx={{
                           fontSize: '0.8rem', 
                           whiteSpace: 'nowrap', 
                           overflow: 'hidden',
                           marginLeft: '4px', 
                           fontFamily: 'poppins', 
                           fontWeight: '400', 
                           color: 'rgba(0, 0, 0, 0.7)'
                         }}
                       >
                         {t?.task_name}
                       </Typography>
                     </CardContent>
                     <CardContent 
                       style={{ 
                         display: 'flex', 
                         justifyContent: 'flex-end', 
                         alignItems: 'center', 
                         padding: '4px 4px 4px 4px', 
                         marginTop: 'auto',
                         fontFamily: 'poppins', 
                         fontWeight: '400', 
                         color: 'rgba(0, 0, 0, 0.7)'
                       }}
                     >
                       <Typography variant="body2" sx={{ fontSize: '0.7rem', marginRight: '4px' }}>
                         {t?.task_id}
                       </Typography>
                       <Typography 
                         variant="body2" 
                         sx={{
                           fontSize: '0.7rem',
                           display: 'flex',
                           alignItems: 'center',
                           fontFamily: 'poppins',
                           fontWeight: '400',
                           color: 'rgba(0, 0, 0, 0.7)'
                         }}
                       >
                         {renderPriorityIcon(t?.priority_name)}
                       </Typography>
                     </CardContent>
                   </Card>
                 </div>
               </Grid>
             ))
             
         ) : (
           <Grid size={12}>
             <Typography variant="h6" align="center">
               No Records Found
             </Typography>
           </Grid>
         )}
         {(hasMore || appending) && (
           <Grid size={12} ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
             {appending && <CircularProgress size={24} />}
           </Grid>
         )}
   </Grid>
        <Drawer
          sx={{
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: { xs: 420, sm: 600, md: 750, lg: 850 },
              boxSizing: 'border-box',
            },
          }}
          anchor='right'
          open={showAddTaskDialog}
          onClose={() => setShowAddTaskDialog(false)}
        >
          <>
            <CardHeader
              onAddAttachments={() => { }}
              onClickDeleteIcon={() => { }}
              onCloseAddCard={() => setShowAddTaskDialog(false)}
              taskDataForEdit={selectedTaskForEdit}
            />


            <AddTaskDialog
              type = {'board'}
              searchVal={searchValEmployeeFilter}
              setSearchValEmployeeFilter={setSearchValEmployeeFilter}
              requestSearch={requestSearchEmployeeFilter}
              open={showAddTaskDialog}
              onClose={() => setShowAddTaskDialog(false)}
              value={value}
              onSave={handleSaveTask}
              setValue={handleChangeEmployeeName}
              projectData={projectData}
              taskDataForEdit={selectedTaskForEdit}
              projectSelection={get_projects}
              staffsList={getCompanyBasedEmployeeFilter}
              searchType={searchCompanyBasedEmployeeFilter}
              location={stocklocation}
            />
          </>
        </Drawer>
      </div>
    );
}

export default TaskView;


   
