import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddCard from './List/AddCard';
import AppsContent from '@crema/core/AppsContainer/AppsContent';
import { useDispatch } from 'react-redux';
import Board from 'components/KanbanBoard';
import CardDetail from './List/CardDetail';
import ListHeader from './List/ListHeader';
import AddCardButton from './List/AddCardButton';
import AddNewList from './AddNewList';
import NewListButton from './NewListButton';
import ProjectReportList from './ProjectReportList';
// import ProjectEpicTaskList from './Epic/ProjectEpicTaskList';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';
import apiCalls from 'utils/apiCalls';
import {
  dragUpdateStatusAction,
  getActivityAction,
  getTaskByStatusAction,
  showTasklistAction,
  showEpicListAction,
  getSprintDetailsAction,
} from 'redux/actions/payrollDashboard_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { useLocation, useParams } from 'react-router-dom';

const BoardWrapper = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: '110%',
        width: '100%',
        overflowX: 'auto',
        overflowY: 'auto', 
        gap: 2,
        pb: 4, 
        '&::-webkit-scrollbar': { width: '10px', height: '10px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#9c9898', borderRadius: '4px' },
        '& .smooth-dnd-container.horizontal': {
          display: 'flex !important',
          height: 'auto', 
        },
      }}
    >
      {children}
    </Box>
  );
};

BoardWrapper.propTypes = {
  children: PropTypes.node,
};

const BoardDetailView = (props) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  // const {id} = useParams();
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id')

  const {
    boardDetail,
    projectData,
    setProjectData,
    get_taskProjects,
    getProjectsReportList,
    get_epicList,
    taskByStatus,
    isAddCardOpen,
    setAddCardOpen,
    onClickAddCard,
    data,
    rights,
    selectedOption,
    onShowBacklog,
    reportSearchVal,
    onRequestReportSearch,
    onCancelReportSearch,
    onReportLoadMore,
    reportLoading,
    reportTotalCount,
    onDeleteReportTasks,
    onRefreshTaskStatus,
  } = props;
  // console.log(data, 'data');

  const LANE_ORDER = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Completed'];

  // Workflow state machine — backend must mirror these rules. Keys/values are lane names normalized
  // to lowercase with whitespace removed so matching is case- and spacing-insensitive.
  const normalizeLaneName = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, '');
  const ALLOWED_TRANSITIONS = {
    backlog: ['todo', 'inprogress'],
    todo: ['backlog', 'inprogress', 'testing'],
    inprogress: ['todo', 'testing', 'completed'],
    testing: ['inprogress', 'completed'],
    completed: ['inprogress'],
  };
  const isTransitionAllowed = (fromName, toName) => {
    const from = normalizeLaneName(fromName);
    const to = normalizeLaneName(toName);
    if (!from || !to || from === to) return true;
    // If a lane is not in the allow-list (custom lane the workflow doesn't know about), permit it.
    if (!ALLOWED_TRANSITIONS[from]) return true;
    return ALLOWED_TRANSITIONS[from].includes(to);
  };

  const sortedBoardDetail = useMemo(() => {
    if (!boardDetail || !boardDetail.lanes) return boardDetail;
    const sortedLanes = [...boardDetail.lanes].sort((a, b) => {
      const indexA = LANE_ORDER.indexOf(a.name);
      const indexB = LANE_ORDER.indexOf(b.name);

      return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99);
    });

    return {
      ...boardDetail,
      lanes: sortedLanes,
    };
  }, [boardDetail]);

const [localBoard, setLocalBoard] = useState(null);
const pendingDragsRef = useRef(0);

useEffect(() => {
  if (!sortedBoardDetail) return;

  if (pendingDragsRef.current > 0) return;

  setLocalBoard(sortedBoardDetail);
}, [sortedBoardDetail]);


  const isScrumBoard = Number(taskByStatus?.[2]?.[0]?.boardType) === 1;
  const hasBoardCards = Array.isArray(sortedBoardDetail?.lanes)
    ? sortedBoardDetail.lanes.some((lane) => (lane.cards || []).length > 0)
    : false;

  const projectIdValue = projectData?.project_id ?? projectData?.id ?? id;
  const [projectSprints, setProjectSprints] = useState([]);

  useEffect(() => {
    if (!isScrumBoard || !projectIdValue) {
      setProjectSprints([]);
      return;
    }

    dispatch(getSprintDetailsAction({ project_id: projectIdValue }))
  .then((res) => {
    setProjectSprints(Array.isArray(res) ? res : []);
  })
  .catch((err) => {
    console.error('Failed to load sprints for project', projectIdValue, err);
    dispatch(
      OpenalertActions({
        msg: 'Failed to load sprints. Please retry.',
        severity: 'error',
      })
    );
  });

  }, [dispatch, isScrumBoard, projectIdValue]);

  const hasActiveSprint = useMemo(() => {
    return (Array.isArray(projectSprints) ? projectSprints : []).some((sprint) => {
      const isDeleted = Number(sprint?.isDeleted ?? sprint?.sprint_isDeleted ?? 0) === 1;
      const isCompleted = Number(sprint?.isCompleted ?? sprint?.sprint_isCompleted ?? 0) === 1;
      const isActive = Number(sprint?.isActive ?? sprint?.sprint_isActive ?? 0) === 1;

      return !isDeleted && !isCompleted && isActive;
    });
  }, [projectSprints]);

 const boardWithEmptyState = useMemo(() => {
  const source = localBoard || sortedBoardDetail;
  if (!source?.lanes?.length) return source;
  if (!isScrumBoard || hasBoardCards) return source;

  const lanes = source.lanes.map((lane) => {
    const laneName = String(lane.name || lane.title || '').trim().toLowerCase();
    if (laneName === 'to do' || laneName === 'todo') {
      return {
        ...lane,
        emptyState: hasActiveSprint
          ? { message: 'No tasks found for the selected assignee in the active sprint.' }
          : {
              message: 'plan and start a sprint to see work here',
              actionLabel: 'Go to Backlog',
              onAction: onShowBacklog,
            },
      };
    }
    return lane;
  });

  return { ...source, lanes };
}, [localBoard, sortedBoardDetail, isScrumBoard, hasBoardCards, hasActiveSprint, onShowBacklog]);


  // const [list, setList] = useState(null);

  const [selectedCard, setSelectedCard] = useState(null);
  const [testingConfirm, setTestingConfirm] = useState(null); // { taskName, onConfirm, onCancel }
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // const getBoardData = useCallback(() => {
  //   return {
  //     ...boardDetail,
  //   };
  // }, [boardDetail]);

  // const [boardData, setBoardData] = useState(getBoardData());

  const listTasks = useMemo(() => {
    if (
      selectedOption === 'List' &&
      Array.isArray(getProjectsReportList) &&
      getProjectsReportList.length > 0
    ) {
      return getProjectsReportList;
    }

    if (Array.isArray(taskByStatus)) {
      if (Array.isArray(taskByStatus[0]) && taskByStatus[0].length) {
        return taskByStatus[0];
      }
      if (taskByStatus.length) {
        return taskByStatus;
      }
    }

    if (taskByStatus && typeof taskByStatus === 'object') {
      if (Array.isArray(taskByStatus.allTasks) && taskByStatus.allTasks.length) {
        return taskByStatus.allTasks;
      }
      if (Array.isArray(taskByStatus.tasks) && taskByStatus.tasks.length) {
        return taskByStatus.tasks;
      }
      if (Array.isArray(taskByStatus.data) && taskByStatus.data.length) {
        return taskByStatus.data;
      }
      if (Array.isArray(taskByStatus[0]) && taskByStatus[0].length) {
        return taskByStatus[0];
      }

      const statusWiseTasks = Object.entries(taskByStatus)
        .filter(([, value]) => Array.isArray(value))
        .flatMap(([statusName, items]) =>
          items.map((item) => ({
            ...item,
            status_name: item.status_name || item.STATUS || statusName,
          })),
        );
      if (statusWiseTasks.length) {
        return statusWiseTasks;
      }
    }

    const laneSource =
      Array.isArray(localBoard?.lanes) && localBoard.lanes.length
        ? localBoard
        : Array.isArray(boardDetail?.lanes) && boardDetail.lanes.length
          ? boardDetail
          : null;

    if (laneSource) {
      const laneTasks = laneSource.lanes.flatMap((lane) =>
        (lane.cards || []).map((card) => ({
          ...card,
          task_name: card.task_name || card.title,
          status_name: card.status_name || lane.name,
        })),
      );
      if (laneTasks.length) {
        return laneTasks;
      }
    }

    return Array.isArray(get_taskProjects) ? get_taskProjects : [];
  }, [selectedOption, taskByStatus, localBoard, boardDetail, get_taskProjects, getProjectsReportList]);


  const refreshEpicList = useCallback(() => {
    if (!projectIdValue) return;
    dispatch(showEpicListAction(projectIdValue));
  }, [dispatch, projectIdValue]);

  const epicGroups = useMemo(() => {
    const tasks = Array.isArray(listTasks) ? listTasks : [];
    const epics = Array.isArray(get_epicList)
      ? get_epicList
      : Array.isArray(get_epicList?.data)
        ? get_epicList.data
        : [];
    const groups = [];
    const byId = new Map();
    const byName = new Map();

    epics.forEach((epic, index) => {
      const epicId = epic?.epic_id ?? epic?.id ?? epic?.epicId;
      const epicName =
        epic?.epic_name ??
        epic?.epic_title ??
        epic?.name ??
        epic?.title ??
        `Epic ${epicId ?? index + 1}`;
      const key = epicId ?? epicName ?? `epic-${index}`;
      const group = { key, epicId, epicName, epic, tasks: [] };
      groups.push(group);
      if (epicId !== undefined && epicId !== null) {
        byId.set(String(epicId), group);
      }
      if (epicName) {
        byName.set(String(epicName).toLowerCase(), group);
      }
    });

    const noEpicGroup = {
      key: 'no-epic',
      epicId: null,
      epicName: 'No Epic',
      epic: null,
      tasks: [],
    };

    tasks.forEach((task) => {
      const taskEpicId = task?.epic_id ?? task?.epicId ?? task?.epicID ?? task?.epic;
      const taskEpicName =
        task?.epic_name ?? task?.epicName ?? task?.epic_title ?? task?.epic;
      let group = null;

      if (taskEpicId !== undefined && taskEpicId !== null) {
        group = byId.get(String(taskEpicId)) || null;
      }

      if (!group && taskEpicName) {
        group = byName.get(String(taskEpicName).toLowerCase()) || null;
      }

      (group ?? noEpicGroup).tasks.push(task);
    });

    if (noEpicGroup.tasks.length > 0) {
      groups.push(noEpicGroup);
    }

    return groups;
  }, [listTasks, get_epicList]);

  // console.log("taskByStatus:",taskByStatus,"boardDetail:", boardDetail,"get_taskProjects:",get_taskProjects );
  

  const onCloseAddCard = () => {
    setSelectedTaskForEdit(null);
    setAddCardOpen(false);
  };

  const getCardById = (lane, cardId) =>
    lane.cards.find((item) => item.id === cardId);

  const onEditCardDetail = (cardId, laneId) => {
    const source = localBoard || boardDetail;
    const lanes = source?.lanes || [];

    let cardData =
      lanes
        .find((ln) => String(ln?.laneId ?? ln?.id) === String(laneId))
        ?.cards?.find((c) => String(c?.id) === String(cardId)) ||
      lanes
        .flatMap((ln) => ln?.cards || [])
        .find((c) => String(c?.id) === String(cardId));

    if (!cardData) return;

const normalizeJsonField = (value) => {
  if (value === null || value === undefined || value === '') return '[]';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '[]'; }
};

const enriched = {
  ...cardData,
  task_name: cardData.title,
  taskId: cardData.taskId ?? cardData.task_id ?? cardData.id,
  employee_id:
    cardData.employee_id ??
    cardData.asignee ??
    cardData.assignee_id ??
    cardData.assigned_staff_id ??
    cardData.assigned_staff ??
    null,
  assigned_staff:
    cardData.assigned_staff ??
    cardData.first_name ??
    (cardData.full_name ? String(cardData.full_name).split(' ')[0] : undefined),
  assigned_staff_name:
    cardData.assigned_staff_name ?? cardData.full_name ?? cardData.assignee_name,
  project_name: cardData.project_name ?? projectData?.project_name,
  location_name: cardData.location_name ?? projectData?.location_name,
  attachment: normalizeJsonField(cardData.attachment),
  previews: normalizeJsonField(cardData.previews),
};
setSelectedTaskForEdit(enriched);
setAddCardOpen(true);
  };

  // console.log('ajskdid', selectedTaskForEdit)

 const handleDragCard = useCallback(
  (cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
    const srcKey = String(sourceLaneId);
    const tgtKey = String(targetLaneId);
    if (srcKey === tgtKey) return;

    let movingCard = null;
    let targetLaneName = '';
    let transitionBlocked = null;

    setLocalBoard((prev) => {
      const base = prev || sortedBoardDetail;
      if (!base?.lanes) return prev;

      const srcLane = base.lanes.find(
        (l) => String(l.laneId ?? l.id) === srcKey,
      );
      const tgtLane = base.lanes.find(
        (l) => String(l.laneId ?? l.id) === tgtKey,
      );
      if (!srcLane || !tgtLane) return prev;

      if (!isTransitionAllowed(srcLane.name, tgtLane.name)) {
        transitionBlocked = { from: srcLane.name, to: tgtLane.name };
        return prev;
      }

      const card =
        srcLane.cards?.find((c) => String(c.id) === String(cardId)) || cardDetails;
      if (!card) return prev;

      movingCard = card;
      targetLaneName = String(tgtLane.name || '').trim().toLowerCase();

      return {
        ...base,
        lanes: base.lanes.map((lane) => {
          const key = String(lane.laneId ?? lane.id);
          if (key === srcKey) {
            return {
              ...lane,
              cards: (lane.cards || []).filter(
                (c) => String(c.id) !== String(cardId),
              ),
              totalCount:
                typeof lane.totalCount === 'number'
                  ? Math.max(0, lane.totalCount - 1)
                  : lane.totalCount,
            };
          }
          if (key === tgtKey) {
            const nextCards = [...(lane.cards || [])];
            const updatedCard = {
              ...card,
              status_name: lane.name,
              status: lane.id,
            };
            const insertAt =
              typeof position === 'number' && position >= 0
                ? Math.min(position, nextCards.length)
                : nextCards.length;
            nextCards.splice(insertAt, 0, updatedCard);
            return {
              ...lane,
              cards: nextCards,
              totalCount:
                typeof lane.totalCount === 'number'
                  ? lane.totalCount + 1
                  : lane.totalCount,
            };
          }
          return lane;
        }),
      };
    });

    if (transitionBlocked) {
      window.alert(`Cannot move task from "${transitionBlocked.from}" to "${transitionBlocked.to}". This workflow transition is not allowed.`);
      return;
    }
    if (!movingCard) return;

    const isTestingLane = targetLaneName === 'testing';

    pendingDragsRef.current += 1;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      // Keep the sync-from-redux effect suppressed for a short grace period
      // after the dispatch resolves, to cover the lag before the backend's
      // updated state reaches sortedBoardDetail.
      setTimeout(() => {
        pendingDragsRef.current = Math.max(0, pendingDragsRef.current - 1);
      }, 1500);
    };

    const statusValue = Number.isNaN(Number(targetLaneId))
      ? targetLaneId
      : Number(targetLaneId);

    const payload = {
      task_id: cardId,
      project_id: parseInt(id),
      status: statusValue,
    };

    const rollback = () => {
      setLocalBoard((curr) => {
        if (!curr?.lanes) return curr;
        return {
          ...curr,
          lanes: curr.lanes.map((lane) => {
            const key = String(lane.laneId ?? lane.id);
            if (key === tgtKey) {
              return {
                ...lane,
                cards: (lane.cards || []).filter(
                  (c) => String(c.id) !== String(cardId),
                ),
                totalCount:
                  typeof lane.totalCount === 'number'
                    ? Math.max(0, lane.totalCount - 1)
                    : lane.totalCount,
              };
            }
            if (key === srcKey) {
              const exists = (lane.cards || []).some(
                (c) => String(c.id) === String(cardId),
              );
              if (exists) return lane;
              return {
                ...lane,
                cards: [movingCard, ...(lane.cards || [])],
                totalCount:
                  typeof lane.totalCount === 'number'
                    ? lane.totalCount + 1
                    : lane.totalCount,
              };
            }
            return lane;
          }),
        };
      });
      finish();
    };

    const commitMove = () => {
      dispatch(
        dragUpdateStatusAction(cardId, payload, (res) => {
          if (res !== 200) {
            rollback();
            return;
          }
          finish();
          if (onRefreshTaskStatus) {
            onRefreshTaskStatus();
          }
        }),
      );
    };

    if (isTestingLane) {
      dispatch(
        getActivityAction({ taskId: cardId }, (response, resData) => {
          if (response !== 200) {
            rollback();
            return;
          }
          const totalWorkHours = resData?.res1?.[0]?.total_work_hours_for_task;
          const hasWorkLogged = !!totalWorkHours && totalWorkHours !== '00:00:00';
          if (hasWorkLogged) {
            commitMove();
          } else {
            setTestingConfirm({
              taskName: movingCard?.title || movingCard?.task_name || 'this task',
              onConfirm: () => {
                setTestingConfirm(null);
                commitMove();
              },
              onCancel: () => {
                setTestingConfirm(null);
                rollback();
              },
            });
          }
        }),
      );
    } else {
      commitMove();
    }
  },
  [sortedBoardDetail, dispatch, id, onRefreshTaskStatus],
);



  // // Please remove the tempBoardDetail code if needed after finishing the full flow....
  // const tempBoardDetail = boardDetail.lanes
  // tempBoardDetail.map((board, index) => {
  //   const card = get_taskProjects.filter((e) => e.status_name.toLowerCase() === board.name.toLowerCase())
  //   boardDetail.lanes[index].cards = card
  // })

  // if (selectedOption === 'EpicList') {
  //   return (
  //     <Box width='100%' sx={{ px: 3 }}>
  //       <ProjectEpicTaskList
  //         epicGroups={epicGroups}
  //         projectKey={projectData?.project_key}
  //         projectId={projectData?.project_id ?? projectData?.id ?? id}
  //       />
  //     </Box>
  //   );
  // }

  if (selectedOption === 'List') {
    return (
      <Box width='100%' sx={{ px: 3 }}>
        <ProjectReportList
          tasks={getProjectsReportList}
          projectKey={projectData?.project_key}
          searchVal={reportSearchVal}
          requestSearch={onRequestReportSearch}
          cancelSearch={onCancelReportSearch}
          onLoadMore={onReportLoadMore}
          loading={reportLoading}
          totalCount={reportTotalCount}
          onDeleteTasks={onDeleteReportTasks}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: '10px',
        width: '100%',
        height: 'calc(100vh - 200px)', 
        display: 'flex',
        flexDirection: 'row',
        px: 3,
        overflow: 'hidden' 
      }}
    >
      <Box
        sx={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Board
          editable
          canAddLanes={false}
          data={boardWithEmptyState}
           laneStyle={{
            borderRadius: 5,
            maxHeight: '90%', 
            backgroundColor: '#EBECF0', 
            width: '400px',     
            minWidth: '380px',  
            display: 'flex',
            flexDirection: 'column',
            marginRight: '12px',
            
          }}
          handleDragEnd={handleDragCard}
          onCardAdd={(card, laneId) => {
            onClickAddCard(laneId);
          }}
          onCardClick={(cardId, metadata, laneId) => {
            // console.log(metadata, "yyy")
            onEditCardDetail(cardId, laneId);
          }}
          t={(listId) => onClickAddCard(listId)}
          components={{
            BoardWrapper: BoardWrapper,
            Card: CardDetail,
            LaneHeader: (props) => <ListHeader {...props} />,
            AddCardLink: (props) => (
              <AddCardButton
                {...props}
                showAddCard={!isScrumBoard || hasBoardCards || hasActiveSprint}
                rights={rights}
              />
            ),
            NewCardForm: AddCard,
            // NewLaneForm: AddNewList,
            // NewLaneSection: NewListButton,
          }}
        />
        <AddCard
          open={isAddCardOpen}
          handleClose={onCloseAddCard}
          board={boardDetail}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          projectData={projectData}
          selectedTaskForEdit={selectedTaskForEdit}
          onRefreshTaskStatus={onRefreshTaskStatus}
        />
      </Box>

      <Dialog
        open={Boolean(testingConfirm)}
        onClose={() => testingConfirm?.onCancel?.()}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Move to Testing?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{py:3}}>
            No work has been logged on <strong> {testingConfirm?.taskName} </strong> Are
            you sure you want to move this task to Testing without any logged time?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => testingConfirm?.onCancel?.()} color="inherit">
            No
          </Button>
          <Button
            onClick={() => testingConfirm?.onConfirm?.()}
            variant="contained"
            color="primary"
            autoFocus
          >
            Yes, move it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoardDetailView;

BoardDetailView.propTypes = {
  boardDetail: PropTypes.object,
  projectData: PropTypes.object,
  get_taskProjects: PropTypes.array,
  getProjectsReportList: PropTypes.array,
  get_epicList: PropTypes.array,
  taskByStatus: PropTypes.any,
  selectedOption: PropTypes.string,
  reportSearchVal: PropTypes.string,
  onRequestReportSearch: PropTypes.func,
  onCancelReportSearch: PropTypes.func,
  onReportLoadMore: PropTypes.func,
  reportLoading: PropTypes.bool,
  reportTotalCount: PropTypes.number,
  onDeleteReportTasks: PropTypes.func,
  onRefreshTaskStatus: PropTypes.func,
};
