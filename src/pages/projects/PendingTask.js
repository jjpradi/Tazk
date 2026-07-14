import React, { useState , useEffect,useContext} from 'react';
import { Dialog, Grid,DialogContent ,Tooltip, MenuItem, Menu, DialogContentText,DialogTitle, IconButton , DialogActions,Button} from '@mui/material';
import { useSelector, useDispatch  } from 'react-redux';
import Card from '@mui/material/Card';
import { CardContent,Typography , Avatar} from '@mui/material';
import { Height } from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import CardHeader from 'pages/projects/apps/ScrumBoard/BoardDetail/List/AddCard/CardHeader';
import AddCard from 'pages/projects/apps/ScrumBoard/BoardDetail/List/AddCard';
import AddTaskDialog from 'pages/projects/AssignTask';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { get_search_company_based_employee,getEmpbasecompanyFilterAction,set_search_company_based_employee } from 'redux/actions/attendance_actions';
import { taskDetailsCountAction , getActivityAction, filterTaskDetailsAction, showTasklistAction,createTaskAction,getTaskByStatusAction,updateTaskAction, tasksDeleteAction, getProjectDetailsAction} from 'redux/actions/payrollDashboard_actions';
import usePaginatedTasks from './usePaginatedTasks';
import CircularProgress from '@mui/material/CircularProgress';
import context from '../../../src/context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import moment from 'moment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';


const PendingTask = ({ projectname,duedate,search,employee}) => {
    const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
    const [selectedProjectData, setSelectedProjectData] = useState ({page:"task"});
    const [value, setValue] = useState([])
    const dispatch = useDispatch();
    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [projectData, setProjectData] = useState({});

    const {
        PayrolldashboardReducers: { get_projects,taskDetailsCount,filterTaskDetails },
        attendanceReducer: { searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
        stockLocationReducer: { stocklocation },
        roleReducer: {user_rights}
      } = useSelector((state) => state);

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
        typeFilter: 'pending',
        refreshKey: showAddTaskDialog ? 0 : 1,
      });

      useEffect(() => {
        dispatch(taskDetailsCountAction());
        dispatch(getUserRightsByRoleIdAction());
      }, [dispatch]);

      const [selectedTaskForEdit, setselectedTaskForEdit]=useState({})
//  console.log(selectedTaskForEdit,"dfghj")
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
        // taskId: val?.taskId ?? val?.task_id ?? val?.id ?? null,
        task_id: val?.task_id ?? val?.taskId ?? val?.id ?? null,
        project_id: val?.project_id ?? projectId ?? null,
        project_name: val?.project_name ?? details?.project_name ?? '',
        project_key: val?.project_key ?? details?.project_key ?? '',
        epic_key: val?.epic_key ?? details?.project_key ?? '',
        task_name: val?.task_name ?? '',
        description: val?.description ?? '',
        remarks: val?.remarks ?? '',
        issue_type: val?.issue_type ?? val?.issueType ?? '',
        issueType: val?.issue_type ?? val?.issueType ?? '',
        employee_id:
          val?.employee_id ?? val?.asignee ?? val?.assignee ?? val?.user_id ?? '',
        asignee:
          val?.employee_id ?? val?.asignee ?? val?.assignee ?? val?.user_id ?? '',
        assignee_name: val?.assignee_name ?? '',
        status: val?.status ?? val?.status_id ?? '',
        status_name: val?.status_name ?? val?.statusName ?? '',
        priority: val?.priority ?? '',
        priority_name: val?.priority_name ?? '',
        repeatId: val?.repeatId ?? val?.repeat ?? '',
        repeat: val?.repeat ?? val?.repeatId ?? '',
        reporter: val?.reporter ?? val?.reporter_id ?? '',
        orginalEstimation:
          val?.orginalEstimation ?? val?.original_estimation ?? '',
        timeSpent: val?.timeSpent ?? val?.time_spent ?? '',
        start_date: val?.start_date ?? val?.startDate ?? null,
        due_date: val?.due_date ?? val?.dueDate ?? null,
        location_name: val?.location_name ?? '',
        location_id: val?.location_id ?? '',
        taskLocation: val?.taskLocation ?? 0,
        task_latitude: val?.task_latitude ?? null,
        task_longitude: val?.task_longitude ?? null,
        attachment: val?.attachment ?? [],
        previews: val?.previews ?? [],
        epic_name: val?.epic_name ?? '',
        epic_id: val?.epic_id ?? val?.epicId ?? '',
        sprint_id: val?.sprint_id ?? val?.sprintId ?? '',
        storyId: val?.storyId ?? val?.story_id ?? '',
        story_id: val?.story_id ?? val?.storyId ?? '',
        story_key_id: val?.story_key_id ?? val?.storyKeyId ?? '',
        parent_task_key: val?.parent_task_key ?? val?.parentTaskKey ?? '',
        parent_issue_type:
          val?.parent_issue_type ?? val?.parentIssueType ?? '',
        sub_parent_id: val?.sub_parent_id ?? '',
      });

      setShowAddTaskDialog(true);
    }),
  );
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

      const getAssigneeId = (fallback) => {
        if (Array.isArray(value)) {
          return value[0]?.employee_id ?? fallback;
        }
        return value?.employee_id ?? fallback;
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
        dispatch(tasksDeleteAction({ id: selectedTaskId, type: "pending" }, async () => {
          refetchTasks();
        }));
        setDeleteDialog(false);
      };

      const handleSaveTask = (task, actionName) => {
        // console.log('dfekdjf',task, actionName)
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
          // console.log('newTasksjdhData',newTaskData)
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
            // console.log('payload111',selectedTaskForEdit,updatedTaskData)
            let payload = compareObjects(selectedTaskForEdit, updatedTaskData);
            const resolvedTaskId = selectedTaskForEdit?.id ?? selectedTaskForEdit?.taskId ?? selectedTaskForEdit?.task_id;
            // console.log('payload',payload,updatedTaskData)
            apiCalls(
              setModalTypeHandler, setLoaderStatusHandler,
             dispatch(updateTaskAction(resolvedTaskId,{...payload,
              task_id: resolvedTaskId,
              project_id: selectedTaskForEdit.project_id,
              image_key: task.imageKey,
            },(response) => {
              if (response === 200) {
                dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id));
                dispatch(taskDetailsCountAction());
                refetchTasks();
              }
            },
  ),
)
            );
          } else {
            let newTaskData = {
              task_name: task.taskName,
              user_id: task.selectedStaff === '' ? null : task.selectedStaff,
              start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
              due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
              location_id: task.projectLocation,
              project_id: selectedTaskForEdit.project_id,
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
                    dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id));
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


      const handleChangeEmployeeName =(val)=>{
        setValue(val)
      }
    
          useEffect(() => {
              let data1 = {
                searchString:""
              }
             
            
             dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
              //  console.log("resss",res)
              
              }))
         
            }, [])


      // useEffect(() => {
      //   dispatch(taskDetailsCountAction())
      //   dispatch(filterTaskDetailsAction({
      //     "searchString": search ?? '',
      //     "numPerPage": null,
      //     "pageCount": null,
      //     "employeeFilter": employee.length ? employee : null,
      //     "dueDateFilter": duedate?moment(duedate).format("YYYY-MM-DD") : null,
      //     "projectFilter": projectname ?? null,
      //     "typeFilter": "pending"
      //   },(res)=>{setTasks(res.data)}))
      // }, [showAddTaskDialog])

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

    const deletependingtask = getRoleAuthorization(user_rights,'DeleteTask')

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
          direction='row'
          spacing={3}
          sx={{
            overflowX: 'auto',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '16px',
          }}
        >
          {loading ? (
            <div>Loading...</div>
          ) : tasks.length > 0 ? (
            tasks?.map((t, index) => (
              <Grid
                key={index}
                size={{
                  lg: 4,
                  md: 4,
                  sm: 12,
                  xs: 12
                }}>
                <div
                  style={{cursor: 'pointer', position: 'relative'}}
                  onClick={() => handleAddTaskClick(t.id, t)}
                >
                  <Card
                    style={{
                      height: '150px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '8px',
                    }}
                  >
                    {/* IconButton */}
                    {deletependingtask && (
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
                      PaperProps={{
                        style: {
                          maxHeight: 200,
                          width: 80,
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
                          borderRadius: '8px',
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
                      {deletependingtask && (
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
                        <Button
                          variant='contained'
                          color='primary'
                          onClick={handleClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='contained'
                           color='error'
                          onClick={handleDelete}
                          autoFocus
                        >
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <CardContent
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 25,
                          height: 25,
                          fontSize: 15,
                          backgroundColor: '#CECECE',
                          marginRight: '4px',
                        }}
                      >
                        {t.assignee_name ? (
                          t.assignee_name[0].toUpperCase()
                        ) : (
                          <AccountCircleIcon
                            sx={{fontSize: 20, color: '#CECECE'}}
                          />
                        )}
                      </Avatar>
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          marginRight: '8px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'poppins',
                        }}
                      >
                        {t.assignee_name || 'Unassigned'}
                      </Typography>
                    </CardContent>
                    <CardContent
                      style={{
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'poppins',
                        fontSize: '15px',
                        fontWeight: '400',
                        color: 'rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      <Typography variant='body1' sx={{marginBottom: '10px', pt:2}}>
                        {t.project_name}
                      </Typography>
                    </CardContent>
                    <CardContent
                      style={{
                        padding: '0 8px 4px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'poppins',
                        fontSize: '15px',
                        fontWeight: '400',
                        color: 'rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      <Typography variant='body2' sx={{marginBottom: '8px',marginLeft: '4px',}}>
                        {t.task_name}
                      </Typography>
                    </CardContent>
                    <CardContent
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        padding: '4px 8px 4px 8px',
                        marginTop: 'auto',
                        fontFamily: 'poppins',
                        fontSize: '11px',
                        fontWeight: '400',
                        color: 'rgba(0, 0, 0, 0.7)',
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{fontSize: '0.7rem', marginRight: '4px'}}
                      >
                        {t.task_id}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'poppins',
                          fontSize: '15px',
                          fontWeight: '400',
                          color: 'rgba(0, 0, 0, 0.7)',
                        }}
                      >
                        {renderPriorityIcon(t.priority_name)}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Typography variant='h6' align='center'>
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
              width: {xs: 420, sm: 600, md: 750, lg: 850},
              boxSizing: 'border-box',
            },
          }}
          anchor='right'
          open={showAddTaskDialog}
          onClose={() => setShowAddTaskDialog(false)}
        >
          <>
            <CardHeader
              onAddAttachments={() => {}}
              onClickDeleteIcon={() => {}}
              onCloseAddCard={() => setShowAddTaskDialog(false)}
              taskDataForEdit={selectedTaskForEdit}
            />

            <AddTaskDialog
              type={'board'}
              open={showAddTaskDialog}
              onClose={() => setShowAddTaskDialog(false)}
              value={value}
              setValue={handleChangeEmployeeName}
              projectData={projectData}
              taskDataForEdit={selectedTaskForEdit}
              projectSelection={get_projects}
              location={stocklocation}
              searchVal={searchValEmployeeFilter}
              setSearchValEmployeeFilter={setSearchValEmployeeFilter}
              requestSearch={requestSearchEmployeeFilter}
              staffsList={getCompanyBasedEmployeeFilter}
              searchType={searchCompanyBasedEmployeeFilter}
              onSave={handleSaveTask}
            />
          </>
        </Drawer>
      </div>
    );
}

export default PendingTask;


   
