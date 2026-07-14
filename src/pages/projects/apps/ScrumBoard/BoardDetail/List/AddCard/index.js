import React, {useContext, useEffect, useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {
  onAddNewCard,
  onDeleteSelectedCard,
  onEditCardDetails,
} from '../../../../../../../redux/actions';
import context from '../../../../../../../context/CreateNewButtonContext';
import AppConfirmDialog from '@crema/core/AppConfirmDialog';
import IntlMessages from '@crema/utility/IntlMessages';
import CardHeader from './CardHeader';
import PropTypes from 'prop-types';
import AddCardForm from './AddCardForm';
import {useAuthUser} from '../../../../../../../@crema/utility/AuthHooks';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import AddTaskDialog from 'pages/projects/AssignTask';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import {
  createTaskAction,
  getTaskByStatusAction,
  showTasklistAction,
  updateTaskAction,
} from 'redux/actions/payrollDashboard_actions';
import {useLocation, useParams} from 'react-router-dom';
import { getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import CreateNewButtonContext from '../../../../../../../context/CreateNewButtonContext'
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { projectTypesaction } from 'redux/actions/payrollDashboard_actions';


const validationSchema = yup.object({
  title: yup.string().required(<IntlMessages id='validation.titleRequired' />),
});

const AddCard = (props) => {
  const {
    open,
    handleClose,
    board,
    list,
    selectedCard,
    projectData,
    selectedTaskForEdit,
    BackLogTasks,
    onRefreshTaskStatus,
  } = props;
  const dispatch = useDispatch();
  // const {id} = useParams();
  const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')

  const {user} = useAuthUser();
  const {
    PayrolldashboardReducers: {get_projects, get_taskProjects,getProjectLanes},
    attendanceReducer: { get_empbasecompany,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter  },
    stockLocationReducer: {stocklocation},
  } = useSelector((state) => state);

  const [checkedList, setCheckedList] = useState(() =>
    selectedCard ? selectedCard.checkedList : [],
  );

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedMembers, setMembersList] = useState(() =>
    selectedCard ? selectedCard.members : [],
  );

  const [selectedLabels, setSelectedLabels] = useState(() =>
    selectedCard ? selectedCard.label : [],
  );

  const [comments, setComments] = useState(() =>
    selectedCard ? selectedCard.comments : [],
  );

  const [attachments, setAttachments] = useState(() =>
    selectedCard ? selectedCard.attachments : [],
  );

  const onAddAttachments = (files) => {
    setAttachments([...attachments, ...files]);
  };

  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);

  const [value, setValue] = React.useState([]);
  
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

const handleChangeEmployeeName =(val)=>{
  setValue(val)
  // if(val){
  //   setUserSelectError('');
   
  // }

}

const getAssigneeId = (fallback) => {
  if (Array.isArray(value)) {
    return value[0]?.employee_id ?? fallback;
  }
  return value?.employee_id ?? fallback;
};

const requestSearchEmployeeFilter = (val) => {

  // let allDept = list_department.map((d) => d.department);

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

useEffect(() => {
  let data1 = {
    searchString:""
  }
 

 dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
   dispatch({
     type: GET_EMP_BASECOMPANY_FILTER,
     payload: res,
   });
 }))
 dispatch(projectTypesaction());
}, [])

  useEffect(() => {
    if (selectedCard) {
      setCheckedList(selectedCard ? selectedCard.checkedList : []);
      setMembersList(selectedCard ? selectedCard.members : []);
      setSelectedLabels(selectedCard ? selectedCard.label : []);
      setComments(selectedCard ? selectedCard.comments : []);
      setAttachments(selectedCard ? selectedCard.attachments : []);
    }
  }, [selectedCard]);

  const onDeleteCard = () => {
    const boardId = board.id;
    const listId = list.id;
    const cardId = selectedCard.id;
    dispatch(onDeleteSelectedCard(boardId, listId, cardId));
    setDeleteDialogOpen(false);
    handleClose();
  };

  const onClickDeleteIcon = () => {
    if (selectedCard) {
      setDeleteDialogOpen(true);
    } else {
      handleClose();
    }
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

  const handleSaveTask = (task, actionName) => {
    if (actionName === 'copy') {
      // let previewData = selectedTaskForEdit.filter((f) => f.id === id)
      let newTaskData = {
        task_name: task.taskName,
        user_id: task.selectedStaff === '' ? null : task.selectedStaff,
        start_date: moment().format('yyyy-MM-DD'),
        project_id: task.project_id,
        priority: 2,
        status: task.status,
        repeat: task?.repeat ?? null,
        sprint_id: task?.sprint_id ?? null,
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
        epic_id: task.epic_id,
        story_id: task.story_id,
        sub_parent_id: task.sub_parent_id ?? null,
        // sprint_id: task.sprint_id
      };
      apiCalls(
        dispatch(
          createTaskAction(newTaskData, (response) => {
            if (response === 200) {
              let payload = {
                project_id: task.project_id,
              };
              dispatch(getTaskByStatusAction(task.project_id));
              dispatch(showTasklistAction(payload));
              handleClose();
            }
          }),
        ),
      );
    } else if (actionName === 'SubTask') {
      let newTaskData = {
        task_name: task.taskName,
        user_id: task.selectedStaff === '' ? null : task.selectedStaff,
        start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
        due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
        location_id: task.projectLocation,
        project_id: task?.project_id,
        priority: task.priority === '' ? 2 : task.priority,
        description: task.description,
        status: task.status,
        repeat: task.repeat,
        sprint_id: task.sprint_id,
        reporter: task.reporter,
        orginalEstimation: task.orginalEstimation,
        asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
        remarks: task.remarks,
        previews: task.previews,
        taskLocation: task.taskLocation,
        task_latitude: task.task_latitude,
        task_longitude: task.task_longitude,
        task_id: task.task_id,
        issue_type: task?.issueType,
        project_key: task.project_key,
        epic_name: task.epic_name,
        epic_id: task.epic_id,
        story_id: task.story_id,
        sub_parent_id: task.sub_parent_id ?? null
      };

      let data = {
        project_id: task.selectedProject,
      };

      apiCalls(
        dispatch(
          createTaskAction(newTaskData, (response) => {
            if (response === 200) {
              let payload = {
                project_id: task?.project_id,
              };
              dispatch(getTaskByStatusAction(task?.project_id));
              dispatch(showTasklistAction(payload));
              handleClose();
            }
          }),
        ),
      );

    }

    else if (actionName === 'task') {
      let newTaskData1 = {
        task_name: task.taskName,
        user_id: task.selectedStaff === '' ? null : task.selectedStaff,
        start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
        due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
        location_id: task.projectLocation,
        project_id: task?.project_id,
        priority: task.priority === '' ? 2 : task.priority,
        description: task.description,
        status: task.status,
        repeat: task.repeat,
        sprint_id: task.sprint_id,
        reporter: task.reporter,
        orginalEstimation: task.orginalEstimation,
        asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
        remarks: task.remarks,
        previews: task.previews,
        taskLocation: task.taskLocation,
        task_latitude: task.task_latitude,
        task_longitude: task.task_longitude,
        task_id: task.task_id,
        issue_type: task?.issueType,
        project_key: task.project_key,
        epic_name: task.epic_name,
        epic_id: task.epic_id,
        story_id: task.story_id,
        sub_parent_id: task.sub_parent_id ?? null
      };

      let data = {
        project_id: task.selectedProject,
      };

      apiCalls(
        dispatch(
          createTaskAction(newTaskData1, (response) => {
            if (response === 200) {
              let payload = {
                project_id: task?.project_id,
              };
              if (onRefreshTaskStatus) {
                onRefreshTaskStatus();
              } else {
                dispatch(getTaskByStatusAction(task?.project_id));
              }
              dispatch(showTasklistAction(payload));
              handleClose();
            }
          }),
        ),
      );

    }

     else {
      const resolvedTaskId =
        task.id ??
        task.taskId ??
        task.task_id ??
        selectedTaskForEdit?.id ??
        selectedTaskForEdit?.taskId ??
        selectedTaskForEdit?.task_id;

      if (resolvedTaskId) {
        let updatedTaskData = {
          task_name: task.taskName,
          user_id: task.selectedStaff === '' ? null : task.selectedStaff,
          start_date: task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
          due_date: task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
          location_id: task.projectLocation,
          project_id: task.selectedProject,
          priority: task.priority,
          priority_name: task.priority_name,
          description: task.description,
          status: task.status,
          repeatId: task.repeat,
          sprint_id: task.sprint_id,
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
         epic_id: task.epic_id,
         story_id: task.story_id,
         sub_parent_id: task.sub_parent_id ?? null
        };

        let data = {
          project_id: task.selectedProject,
        };
        const resolvedProjectId =
          task.selectedProject || selectedTaskForEdit?.project_id || task?.project_id || id;
        apiCalls(
          setModalTypeHandler, setLoaderStatusHandler,
          dispatch(
            updateTaskAction(resolvedTaskId, {
              ...updatedTaskData,
              project_id: resolvedProjectId,
              image_key: task.imageKey,
              asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
              updatedAt: selectedTaskForEdit?.updatedAt ?? null,
            }, (response, conflictInfo) => {
              if (response === 200) {
                let payload = {
                  project_id: resolvedProjectId,
                };
                if (onRefreshTaskStatus) {
                  onRefreshTaskStatus();
                } else {
                  dispatch(getTaskByStatusAction(resolvedProjectId));
                }
                dispatch(showTasklistAction(payload));
                handleClose();
              } else if (response === 409) {
                window.alert(conflictInfo?.message || 'This task was modified by someone else. Please reload and try again.');
                if (onRefreshTaskStatus) {
                  onRefreshTaskStatus();
                } else {
                  dispatch(getTaskByStatusAction(resolvedProjectId));
                }
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
          project_id: task?.project_id,
          priority: task.priority === '' ? 2 : task.priority,
          description: task.description,
          status: task.status,
          repeat: task.repeat,
          sprint_id: task.sprint_id,
          reporter: task.reporter,
          orginalEstimation: task.orginalEstimation,
          asignee: getAssigneeId(task?.asignee ?? selectedTaskForEdit?.asignee),
          remarks: task.remarks,
          previews: task.previews,
          taskLocation: task.taskLocation,
          task_latitude: task.task_latitude,
         task_longitude: task.task_longitude,
         task_id : task.task_id,
         issue_type : task?.issueType,
         project_key:task.project_key,
         epic_name:task.epic_name,
         epic_id: task.epic_id,
         story_id: task.story_id,
         sub_parent_id: task.sub_parent_id ?? null
        };

        let data = {
          project_id: task.selectedProject,
        };

        apiCalls(
          dispatch(
            createTaskAction(newTaskData, (response) => {
              if (response === 200) {
                let payload = {
                  project_id: task?.project_id,
                };
                if (onRefreshTaskStatus) {
                  onRefreshTaskStatus();
                } else {
                  dispatch(getTaskByStatusAction(task?.project_id));
                }
                dispatch(showTasklistAction(payload));
                handleClose();
              }
            }),
          ),
        );
      }
    }
  };

  useEffect(() => {
    let payload = {
      project_id: id,
    };
    dispatch(showTasklistAction(payload));
  }, [open])

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: {xs: 420, sm: 600, md: 850, lg: 852},
          boxSizing: 'border-box',
        },
      }}
      anchor='right'
      open={open}
      onClose={handleClose}
    >
      <>
        <CardHeader
          onAddAttachments={onAddAttachments}
          onClickDeleteIcon={onClickDeleteIcon}
          onCloseAddCard={handleClose}
          taskDataForEdit={selectedTaskForEdit}
        />

        <Box
          sx={{
            height: 'calc(100% - 60px)',
          }}
        >
          <AddTaskDialog
           searchVal={searchValEmployeeFilter}
           setSearchValEmployeeFilter={setSearchValEmployeeFilter}
           requestSearch={requestSearchEmployeeFilter}
           value={value}
           setValue={handleChangeEmployeeName}
            open={open}
            onClose={() => handleClose()}
            projectData={projectData}
            onSave={handleSaveTask}
            projectSelection={get_projects}
            staffsList={getCompanyBasedEmployeeFilter}
            searchType={searchCompanyBasedEmployeeFilter}
            taskDataForEdit={selectedTaskForEdit}
            location={stocklocation}
            type={'board'}
            BackLogTasks={BackLogTasks}
          />
        </Box>
      </>
    </Drawer>
  );
};

export default AddCard;

AddCard.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  board: PropTypes.object,
  list: PropTypes.object,
  selectedCard: PropTypes.object,
};
