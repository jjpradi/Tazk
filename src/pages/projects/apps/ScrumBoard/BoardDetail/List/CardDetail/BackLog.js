import React, {useState, useEffect, useContext} from 'react';
import {Grid} from '@mui/material';
import {useDispatch} from 'react-redux';
import {
  showTasklistAction,
  getSprintDetailsAction,
} from 'redux/actions/payrollDashboard_actions';
import apiCalls from 'utils/apiCalls';
import context from '../../../../../../../../src/context/CreateNewButtonContext';
import AddCard from '../AddCard';
import DataGridForBacklog from '../../../DataGridForBacklog';
import { useSelector } from 'react-redux';

const BackLog = ({ projectname, projectId }) => {

  const { PayrolldashboardReducers: { getSprintDetails }, } = useSelector((state) => state)
  
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isAddCardOpen, setAddCardOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    if (!projectId) return;

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        showTasklistAction(
          { project_id: projectId, type: 'backlog' },
          (res) => {
            setTasks(res || []);
            setLoading(false);
          },
        ),
      ),
    );
  };

// const fetchSprintDetails = () => {
//   if (!projectId) return;

//   apiCalls(
//     setModalTypeHandler,
//     setLoaderStatusHandler,
//     dispatch(
//       getSprintDetailsAction(
//         { project_id: projectId },
//         (res) => {
//           console.log("raw sprint response:", res);
//           console.log("isArray:", Array.isArray(res));
//           console.log("res.data:", res?.data);

//           setSprints(Array.isArray(res) ? res : res?.data || []);
//           setLoading(false);
//         },
//       ),
//     ),
//   );
// };

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    fetchTasks();
    // fetchSprintDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

    useEffect(() => {
      dispatch(getSprintDetailsAction({project_id: projectId}));
    }, [projectId]);

  const handleOpenAddTask = () => {
    setSelectedTaskForEdit(null);
    setAddCardOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setAddCardOpen(true);
  };

  const handleCloseAddTask = () => {
    setAddCardOpen(false);
    setSelectedTaskForEdit(null);
    fetchTasks();
    dispatch(getSprintDetailsAction({ project_id: projectId }));
  };

  const columns = [
    { field: 'task_name', headerName: 'Task Name', flex: 1 },
    { field: 'sprint_name', headerName: 'Sprint Name', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'priority_name', headerName: 'Priority', flex: 1 },
    { field: 'assigned_staff_name', headerName: 'Assigned To', flex: 1 },
  ];

  const rows =
    tasks.length > 0
      ? tasks.map((task, index) => ({
          id: task?.id || index + 1,
          task_id: task?.task_id,
          task_name: task?.task_name,
          assigned_staff_name: task?.assigned_staff_name || 'Not Assigned',
          priority_name: task?.priority_name,
          project_name: task?.project_name,
          status: task?.status_name,
          sprint_id: task?.sprint_id,
          project_id: task?.project_id,
          sprint_name: task?.sprint_name,
        sprint_startDate: task?.sprint_startDate,
        sprint_endDate: task?.sprint_endDate,
        sprint_duration: task?.sprint_duration,
        sprint_goal: task?.sprint_goal,
        sprint_isDeleted: task?.sprint_isDeleted,
        sprint_isCompleted: task?.sprint_isCompleted,
        sprint_completionDate: task?.sprint_completionDate
        }))
      : getSprintDetails
          .filter((sprint) => !Number(sprint?.isDeleted ?? sprint?.sprint_isDeleted))
          .map((sprint, index) => ({
          id: sprint?.id || index + 1,
          task_name: '-',
          assigned_staff_name: '-',
          priority_name: '-',
          status: '-',
          sprint_id: sprint?.sprint_id || sprint?.id,
          project_id: projectId,
          sprint_name: sprint?.sprint_name,
        }));

  return (
    <>
      <div style={{ height: 300, width: '100%' }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Grid size={12} sx={{ mb: 20 }}>
            <DataGridForBacklog
              data={rows}
              columns={columns}
              project_id={projectId}
              setTasks={setTasks}
              onAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
            />
          </Grid>
        )}
      </div>

      <AddCard
        open={isAddCardOpen}
        handleClose={handleCloseAddTask}
        projectData={{id: projectId, project_name: projectname}}
        selectedTaskForEdit={selectedTaskForEdit}
        BackLogTasks={true}
      />
    </>
  );
};

export default BackLog;
