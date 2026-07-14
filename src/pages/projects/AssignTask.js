import React, {useEffect, useState, useContext, useMemo} from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Box,
  Divider,
  Card,
  Grid,
  FormHelperText,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Avatar,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { DatePicker, DesktopDatePicker, LocalizationProvider,  } from '@mui/x-date-pickers';
 
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { clearTaskLog, getActivityAction, getCompanyAdminAction, showTasklistAction, startEndAction, updateTaskAction, updateTimeSpentAction, getTaskStatusAction, getTaskCommentsAction, dragUpdateStatusAction, updataTaskStatusAction ,projectTypesaction,timeSheetEnableDisableListAction, deleteLogDataAction, updateLogDataAction, getSprintDetailsAction, getTaskIdBySearchAction} from 'redux/actions/payrollDashboard_actions';
import moment from 'moment';
import {getsessionStorage} from 'pages/common/login/cookies';
import {titleURL} from 'http-common';
import {AppGridContainer, AppScrollbar} from '@crema';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import {roleType} from 'utils/roleType';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { comment } from 'stylis';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRef } from 'react';

import CommentAttachment from 'pages/common/Timesheet/commentAttachment';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { updateImageAction } from 'redux/actions/asset_actions';
import useGeoLocation from 'utils/useGeoLocation';
import CardDetail from 'pages/projects/apps/ScrumBoard/BoardDetail/List/CardDetail';
import ChildDataGrid from 'pages/projects/apps/ScrumBoard/ChildDataGrid';
import EpicCreation from 'pages/projects/apps/ScrumBoard/BoardDetail/Epic/EpicCreation';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {makeStyles} from 'tss-react/mui';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import { get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BugReportIcon from '@mui/icons-material/BugReport';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddIcon from '@mui/icons-material/Add';
import { useMediaQuery } from '@mui/system';
import toMomentOrNull from 'utils/DateFixer';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import PayrollDashboardServices from 'services/payrollDashboard_services';
import { useSearchParams } from 'react-router-dom';
const storage = getsessionStorage()




var style = { border: "solid 2px red" };
const config = {

    buttons: [
      "image", // Only allow image upload
    ],
    uploader: {
      insertImageAsBase64URI: true // Ensure images are inserted as base64 URIs
    },

  style: { style }
};

const ACTIVITY_TABS = {
  all: 'all',
  comments: 'comments',
  history: 'history',
  worklog: 'worklog',
};

const STORY_PAGE_SIZE = 20;

const AddTaskDialog = ({
  open,
  onClose,
  onSave,
  projectSelection,
  taskDataForEdit,
  projectData,
  orginalEstimation,
  staffsList,
  location,
  type,
  searchVal,
  setSearchValEmployeeFilter,
  requestSearch,  
  value,
  setValue,
  searchType,
  activityView,
  BackLogTasks
}) => {

  const labelStyles = {
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: 600,
  };

  useEffect(() => {
    if (BackLogTasks === true) {
      setDontCreateActiveSprint(true);
    }
  }, [BackLogTasks]);

  const inputStyles = {
    fontSize: '11px',
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: 400,
  };

  const menuItemStyles = {
    fontSize: '11px',
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: 400,
  };
  const [progress, setProgress] = useState(0);
   const [opened, setopened] = useState(false);
  const [subTaskName, setSubTaskName] = useState('');
  const [trackOpen, setTrackOpen] = useState(false);
  const [progressClicked, setProgressClicked] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  // const [onClose, setOnClose] = useState(true)
  const storage = getsessionStorage();
  const isAdmin = roleType.includes(storage?.role_name);
  const fileInputRef = useRef(null)
  const [taskData, setTaskData] = useState({
    id: '',
    taskName: '',
    issueType: '',
    selectedStaff: '',
    startDate: '',
    dueDate: '',
    selectedProject: '',
    status: '',
    status_name: '',
    priority: '',
    // epicName: '',
    repeat: '',
    priority_name: '',
    description: '',
    orginalEstimation: '',
    asignee: '',
    reporter: '',
    timeSpent: '',
    remarks: '',
    comment: '',
    comment_attachment: [],
    preImage: [],
    taskLocation: 0,
    task_latitude: null,
    task_longitude: null,
    issue_type : "",
    epic_name: '',
    epic_id: '',
    sprint_id: '',
    story_id: '',
    sub_parent_id: '',


  });

const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
  CreateNewButtonContext,
);
// taskedit changes
    const [showEditPopup, setShowEditPopup] = useState(false);

 const [activityEnable,setActivityEnable]=useState(false);
  const [previews, setPreviews] = useState([]);
  const [commentAttachment, setCommentAttachment] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formErrors, setFormErrors] = useState({
    taskName: null,
    issueType: null,
    selectedProject: null,
    orginalEstimation: null,
    upload: null,
    task_latitude: null,
  task_longitude: null,
  isChecked : null ,
  selectedStoryOption : null,
  taskKeySearch : null

  });
  const fieldLabels = {
    task_latitude: 'Task Location - Latitude',
    task_longitude: 'Task Location - Longitude',
  };
  const [requiredFields, setRequiredFields] = useState(['taskName', 'issueType']);
  /////////---------start and end time --------////////////////
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [imageKey,setImageKey]=useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [flag, setFlag] = useState(false);
  const [update, setUpdate] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [buttonClose,setButtonClose] = useState(false)
  const [editComment, setEditComment] = useState(false)
  const [editCommentData, setEditCommentData] = useState({});
  const [activityTab, setActivityTab] = useState(ACTIVITY_TABS.all);
  const [id,setId] = useState(null)
  const [remainingTime, setRemainingTime] = useState();
  const { lat, lon } = useGeoLocation();
  const [epicOptions, setEpicOptions] = useState([]);
  const [isEpicLoading, setIsEpicLoading] = useState(false);
  const [isEpicDialogOpen, setIsEpicDialogOpen] = useState(false);
  const [storyOptions, setStoryOptions] = useState([]);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [storySearch, setStorySearch] = useState('');
  const [storyPage, setStoryPage] = useState(0);
  const [storyHasMore, setStoryHasMore] = useState(false);
  const [selectedStoryOption, setSelectedStoryOption] = useState(null);
  const [taskKeySearch, setTaskKeySearch] = useState('');
  const [taskKeyError, setTaskKeyError] = useState('');
  
const [storyData, setStoryData] = useState('');
  const dispatch = useDispatch();
  const initialRender = useRef(true);

  const [timeSpent, setTimeSpent] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [linkCopiedOpen, setLinkCopiedOpen] = useState(false);

  const handleCopyTaskLink = async () => {
    const projectId =
      projectData?.id ||
      taskData?.selectedProject ||
      taskDataForEdit?.project_id;
    const taskId = taskDataForEdit?.id || taskDataForEdit?.taskId;
    if (!projectId || !taskId) return;
    const type = BoardType || 1;
    const url = `${window.location.origin}/projects/projects?id=${projectId}&type=${type}&t=${taskId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopiedOpen(true);
  };

  const refreshTaskTimerState = () => {
    const currentProjectId = projectData?.id || projectData?.project_id;
    if (!currentProjectId) return;

    dispatch(showTasklistAction({project_id: currentProjectId}));
    dispatch(getTaskByStatusAction(currentProjectId));
  };
  const [workLogEditOpen, setWorkLogEditOpen] = useState(false);
  const [selectedWorkLog, setSelectedWorkLog] = useState(null);
  const [selectedWorkLogKey, setSelectedWorkLogKey] = useState('');
  const [workLogEditData, setWorkLogEditData] = useState({
    id: null,
    timeSpent: '',
    startedDate: null,
    startedTime: ''
  });
  const [workLogOverrides, setWorkLogOverrides] = useState({});
  const [deletedWorkLogKeys, setDeletedWorkLogKeys] = useState({});
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [zoom, setZoom] = useState(1);

  const [workLogData, setWorkLogData] = useState({  // changes for current worklog data
    id: null,
    timeSpent: '',
    startedDate: null,
    startedTime: moment().format('HH:mm')
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const[isChecked, setIsChecked] = useState(false);
  const [isStoryBasedChecked, setIsStoryBasedChecked] = useState(false);
  const [dontCreateActiveSprint, setDontCreateActiveSprint] = useState(false);
  

  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  useEffect(() => {
  if (trackOpen) {
    setWorkLogData((prev) => ({
      ...prev,
      startedDate: moment(),
      startedTime: moment().format('HH:mm')
    }));
  }
}, [trackOpen]);

const [searchParams] = useSearchParams()
const BoardType = Number(searchParams.get('type'))
  // useEffect(() => {
  //  if(compan)
  // },[])
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const issueTypeIcons = {
    Task: <CheckBoxIcon style={{ color: '#3CB371' , fontSize: 'small' }} />, // Green
    Story: <BookmarkIcon style={{ color: '#3DB4F2' , fontSize: 'small'}} />, // Blue
    Bug: <BugReportIcon style={{ color: '#FF4500', fontSize: 'small' }} />, // Red
    Epic: <FlashOnIcon style={{ color: '#9370DB', fontSize: 'small' }} />, // Purple
  };
  const issueTypeLabelById = {
    1: 'Task',
    2: 'Epic',
    3: 'Story',
    4: 'Bug',
    5: 'SubTask',
  };
  const coalesceNonEmpty = (...values) =>
    values.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== 0,
    ) ?? '';
  const {
    PayrolldashboardReducers: { adminName, tasklogsDetails,taskActivityDetails,taskCommentsList ,getProjectLanes,timeSheetEnableDisableList, taskByStatus, get_projects}
  } = useSelector((state) => state);
  // let reporter = adminName[0]?.username.split('.')[1];
  // let creationDate = taskActivityDetails[0]?.creationDate;
  const currentProjectId = useMemo(
    () => projectData?.id || taskData?.selectedProject || taskDataForEdit?.project_id || '',
    [projectData?.id, taskData?.selectedProject, taskDataForEdit?.project_id],
  );
  const CurrentProjectReport = get_projects?.find((project) => project.id === currentProjectId);

  const fetchEpicOptions = async (projectId) => {
    if (!projectId) {
      setEpicOptions([]);
      return [];
    }

    setIsEpicLoading(true);
    try {
      const res = await PayrollDashboardServices.getEpicList(projectId);
      const list = res?.data?.data ?? res?.data ?? [];
      const nextOptions = Array.isArray(list) ? list : [];
      setEpicOptions(nextOptions);
      return nextOptions;
    } catch (error) {
      setEpicOptions([]);
      return [];
    } finally {
      setIsEpicLoading(false);
    }
  };

  useEffect(() => {
    findRemaining();
    dispatch(getCompanyAdminAction());
    dispatch(timeSheetEnableDisableListAction())

    const selectedProject = projectSelection?.find(
      (project) => project?.project_name === taskDataForEdit?.project_name,
    );

    if (taskDataForEdit) {
      setActivityEnable(true)
      setActivityTab(ACTIVITY_TABS.all);
      const selectedStaff = staffsList?.find(
        (staff) => staff?.employee_id  === taskDataForEdit?.employee_id ,
      );
      const projectLocation = location?.find(
        (locate) => locate?.location_name === taskDataForEdit?.location_name,
      );
      const parseJsonSafely = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } 
        catch { return []; }
      };

      let parseAtatchment = parseJsonSafely(taskDataForEdit?.attachment)
      let parsePreview = parseJsonSafely(taskDataForEdit?.previews)
      const editIssueType = Number(taskDataForEdit?.issue_type ?? taskDataForEdit?.issueType);
      const editParentIssueType = Number(
        taskDataForEdit?.parent_issue_type ?? taskDataForEdit?.parentIssueType,
      );
      const isStoryBasedSubTask =
        editIssueType === 5 && editParentIssueType === 3;
      setTaskData({
        id: taskDataForEdit.id || taskDataForEdit?.taskId,
        taskName: taskDataForEdit.task_name,
        issueType: taskDataForEdit.issue_type ?? '',
        selectedStaff: selectedStaff ? selectedStaff.employee_id : '',
        startDate: taskDataForEdit.start_date ? moment(taskDataForEdit.start_date).format('YYYY-MM-DD') : null,
        dueDate: taskDataForEdit.due_date ? moment(taskDataForEdit.due_date).format('YYYY-MM-DD') : null,
        projectLocation: projectLocation ? projectLocation.location_id : '',
        selectedProject: selectedProject ? selectedProject.id : '',
        priority: taskDataForEdit.priority,
        repeat: taskDataForEdit.repeatId,
        description: taskDataForEdit.description,
        orginalEstimation: taskDataForEdit.orginalEstimation,
        asignee: taskDataForEdit.employee_id,
        status: taskDataForEdit.status,
        timeSpent: taskDataForEdit.timeSpent,
        preImage: taskDataForEdit.previews,
        comment: taskDataForEdit.comment,
        comment_attachment: taskDataForEdit.comment_attachment,
        taskLocation: taskDataForEdit.taskLocation,
        task_latitude: taskDataForEdit.task_latitude,
        task_longitude: taskDataForEdit.task_longitude,
        issue_type: taskDataForEdit.issue_type ?? '',
        epic_name : taskDataForEdit.epic_name,
        epic_id: taskDataForEdit.epic_id ?? '',
        sprint_id: taskDataForEdit.sprint_id ?? taskDataForEdit.sprintId ?? '',
        story_id: taskDataForEdit.storyId ?? '',
        sub_parent_id: taskDataForEdit.sub_parent_id ?? '',
        // timeSpent: tasklogsDetails[0]?.total_work_hours_for_task
      });
      setIsChecked(isStoryBasedSubTask);
      setTaskKeySearch(
        editIssueType === 5 && !isStoryBasedSubTask
          ? taskDataForEdit?.parent_task_key ?? taskDataForEdit?.parentTaskKey ?? ''
          : '',
      );
      setTaskKeyError('');
      const selectedAssignee = staffsList.find((staff) => staff.employee_id == taskDataForEdit.employee_id );
      // // console.log("selectedAssignee",selectedAssignee)
      setValue(selectedAssignee)
      // let attachment = taskDataForEdit.attachment !== null ? taskDataForEdit.attachment : ''
      setPreviews(parseAtatchment);
      setImageKey(parsePreview);
      const orginalEstimation = parseFloat(taskDataForEdit.orginalEstimation);
      const timeSpent = parseFloat(taskDataForEdit.timeSpent);
      const calculatedProgress = (timeSpent / orginalEstimation) * 100;
      setProgress(calculatedProgress);
    } else {
      setActivityTab(ACTIVITY_TABS.all);
      setTaskData({
        id: '',
        taskName: '',
        status: getProjectLanes?.[0]?.laneId ?? '',
        repeat: '',
        startDate:'' ,
        dueDate: '',
        projectLocation: projectData?.location_id,
        selectedProject: projectData?.id,
        priority:2,
        description: '',
        reporter: adminName[0]?.employee_id,
        timeSpent: '',
        preImage: '',
        comment: '',
        comment_attachment: '',
        taskLocation: 0,
        task_latitude: null,
        task_longitude: null,
        issueType: '',
        issue_type: '',
        epic_name: '',
        epic_id: '',
        sprint_id: '',
        story_id: '',
        sub_parent_id: '',
      });
      setIsChecked(false);
      setDontCreateActiveSprint(false);
      setTaskKeySearch('');
      setTaskKeyError('');
      setValue([])
      setPreviews([]);

      setProgress(
        taskData.orginalEstimation === taskData.timeSpent
          ? 0
          : taskData.timeSpent,
      );
    }
    }, [taskDataForEdit, open, projectData?.id, projectData?.location_id]);
  useEffect(() => {
    if (!projectData?.id) return;

    dispatch(getTaskStatusAction(projectData));

  }, [projectData?.id]);

  useEffect(() => {
    if (!open) return;
    if (!currentProjectId) {
      setEpicOptions([]);
      return;
    }

    fetchEpicOptions(currentProjectId);
  }, [open, currentProjectId]);

  const handleEpicSaved = async (savedEpic) => {
    const nextOptions = await fetchEpicOptions(currentProjectId);
    if (!Array.isArray(nextOptions) || !nextOptions.length) return;

    const savedEpicName = String(
      savedEpic?.epic_name ??
        savedEpic?.epic_title ??
        savedEpic?.name ??
        savedEpic?.title ??
        '',
    ).trim();

    const matchedEpic = savedEpicName
      ? nextOptions.find((epic) => {
          const optionName = String(
            epic?.epic_name ?? epic?.epic_title ?? epic?.name ?? epic?.title ?? '',
          ).trim();
          return optionName.toLowerCase() === savedEpicName.toLowerCase();
        })
      : nextOptions[nextOptions.length - 1];

    const latestEpicId =
      matchedEpic?.epic_id ?? matchedEpic?.id ?? matchedEpic?.epicId ?? '';
    const latestEpicName =
      matchedEpic?.epic_name ??
      matchedEpic?.epic_title ??
      matchedEpic?.name ??
      matchedEpic?.title ??
      '';

    if (!latestEpicId) return;

    setTaskData((prev) => ({
      ...prev,
      epic_id: latestEpicId,
      epic_name: latestEpicName,
    }));
  };

  useEffect(() => {
    if (!open) {
      setStorySearch('');
      setStoryPage(0);
      setStoryOptions([]);
      setStoryHasMore(false);
      setSelectedStoryOption(null);
      return;
    }

    if (!currentProjectId) {
      setStoryOptions([]);
      setStoryHasMore(false);
      setSelectedStoryOption(null);
      return;
    }

    setStoryPage(0);
  }, [open, currentProjectId]);

  useEffect(() => {
    if (!open || !currentProjectId) return;

    let isCancelled = false;
    const debounceMs = storyPage === 0 ? 250 : 0;

    const fetchStories = async () => {
      setIsStoryLoading(true);
      try {
        const selectedStoryTaskId =
          Number(taskData?.issueType || taskData?.issue_type) === 5
            ? taskData?.sub_parent_id || undefined
            : taskData?.story_id || undefined;
        const res = await PayrollDashboardServices.getStory({
          project_id: currentProjectId,
          searchString: storySearch,
          pageCount: storyPage,
          numPerPage: STORY_PAGE_SIZE,
          selectedTaskId: selectedStoryTaskId,
          type : BoardType 
        });

        if (isCancelled) return;

        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        const totalRows = Number(res?.data?.numRows ?? 0);

        setStoryOptions((prevOptions) => {
          if (storyPage === 0) return rows;
          const mergedOptions = new Map(
            (prevOptions || []).map((item) => [String(item?.taskId), item]),
          );
          rows.forEach((item) => {
            mergedOptions.set(String(item?.taskId), item);
          });
          return Array.from(mergedOptions.values());
        });
        setStoryHasMore((storyPage + 1) * STORY_PAGE_SIZE < totalRows);
      } catch (error) {
        if (isCancelled) return;
        if (storyPage === 0) {
          setStoryOptions([]);
        }
        setStoryHasMore(false);
      } finally {
        if (!isCancelled) {
          setIsStoryLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchStories, debounceMs);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    open,
    currentProjectId,
    storySearch,
    storyPage,
    taskData?.story_id,
    taskData?.sub_parent_id,
    taskData?.issueType,
    taskData?.issue_type,
  ]);

  useEffect(() => {
    const selectedStoryTaskId =
      Number(taskData?.issueType || taskData?.issue_type) === 5
        ? taskData?.sub_parent_id
        : taskData?.story_id;

    if (!selectedStoryTaskId) {
      setSelectedStoryOption(null);
      return;
    }

    const matchedStory = storyOptions.find(
      (option) => String(option?.taskId) === String(selectedStoryTaskId),
    );

    if (matchedStory) {
      setSelectedStoryOption(matchedStory);
    }
  }, [
    storyOptions,
    taskData?.story_id,
    taskData?.sub_parent_id,
    taskData?.issueType,
    taskData?.issue_type,
  ]);

  useEffect(() => {
    if (!open) {
      setTaskKeySearch('');
      setTaskKeyError('');
    }
  }, [open]);

  // useEffect(() => {
  //   dispatch(showTasklistAction(value));
  // }, [dispatch]);

  useEffect(() => {
    if (storage.role_name === "Employee") {
      if (initialRender.current) {
        initialRender.current = false;
        return;
      }

      const payload = {
        status: taskData.status,
        task_id: taskData.id,
        project_id: currentProjectId,
      };

      dispatch(updataTaskStatusAction(payload));
    }
  }, [taskData.status, dispatch]);

  useEffect(() => {}, [update]);

  const {
    PayrolldashboardReducers: {taskStatus, taskPriority, taskRepeat,taskIssueType,parentList, getSprintDetails},
  } = useSelector((state) => state);
  // console.log(taskPriority,taskStatus,taskRepeat,taskIssueType,"taskPriority")

 const LANE_ORDER = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Completed'];

  const taskByStatusList = useMemo(() => {
    if (!Array.isArray(taskByStatus)) return [];
    return taskByStatus.flatMap((group) => (Array.isArray(group) ? group : []));
  }, [taskByStatus]);

  const parentTaskFromTaskList = useMemo(() => {
    const subParentId = taskData?.sub_parent_id ?? taskDataForEdit?.sub_parent_id;
    if (!subParentId) return null;

    return (
      taskByStatusList.find((task) => {
        const taskId = task?.id ?? task?.taskId ?? task?.task_id;
        return String(taskId) === String(subParentId);
      }) ?? null
    );
  }, [taskByStatusList, taskData?.sub_parent_id, taskDataForEdit?.sub_parent_id]);

  const parentIssueTypeForSubTask = coalesceNonEmpty(
    taskDataForEdit?.parent_issue_type,
    taskDataForEdit?.parentIssueType,
    parentTaskFromTaskList?.issue_type,
    parentTaskFromTaskList?.issueType,
  );

  const parentTaskKeyForSubTask = coalesceNonEmpty(
    taskDataForEdit?.parent_task_key,
    taskDataForEdit?.parentTaskKey,
    parentTaskFromTaskList?.task_id,
    parentTaskFromTaskList?.taskId,
  );

  const parentTaskNameForSubTask = coalesceNonEmpty(
    taskDataForEdit?.parent_task_name,
    taskDataForEdit?.parentTaskName,
    parentTaskFromTaskList?.task_name,
    parentTaskFromTaskList?.title,
  );

  const issueTypeFromTaskList = useMemo(() => {
    if (!taskDataForEdit) return null;
    const editId =
      taskDataForEdit.id ??
      taskDataForEdit.taskId ??
      taskDataForEdit.task_id;
    if (!editId) return null;
    const match = taskByStatusList.find((task) => {
      const taskId = task?.id ?? task?.taskId ?? task?.task_id;
      return String(taskId) === String(editId);
    });
    return match?.issue_type ?? match?.issueType ?? null;
  }, [taskByStatusList, taskDataForEdit]);

  const selectedIssueTypeValue = coalesceNonEmpty(
    taskData?.issueType,
    taskData?.issue_type,
    taskDataForEdit?.issue_type,
    taskDataForEdit?.issueType,
    issueTypeFromTaskList,
  );
  const selectedSprintValue = coalesceNonEmpty(
    taskData?.sprint_id,
    taskDataForEdit?.sprint_id,
    taskDataForEdit?.sprintId,
  );
  const selectedEpicValue = coalesceNonEmpty(
    taskData?.epic_id,
    taskDataForEdit?.epic_id,
  );

  useEffect(() => {
    if (!open || !taskDataForEdit) return;
    if (Number(selectedIssueTypeValue) !== 5) return;

    const subParentId = taskData?.sub_parent_id ?? taskDataForEdit?.sub_parent_id;
    if (!subParentId) return;

    const isStoryBasedSubTask = Number(parentIssueTypeForSubTask) === 3;
    setIsChecked(isStoryBasedSubTask);
    setTaskKeyError('');

    if (isStoryBasedSubTask) {
      setTaskKeySearch('');
      return;
    }

    if (parentTaskKeyForSubTask) {
      setTaskKeySearch(String(parentTaskKeyForSubTask));
    }
  }, [
    open,
    taskDataForEdit,
    selectedIssueTypeValue,
    taskData?.sub_parent_id,
    parentIssueTypeForSubTask,
    parentTaskKeyForSubTask,
  ]);

  const sortedTaskStatus = [...taskStatus].filter((task) => LANE_ORDER.includes(task.status_name)).sort((a, b) => {
    const indexA = LANE_ORDER.indexOf(a.status_name);
    const indexB = LANE_ORDER.indexOf(b.status_name);
    return indexA - indexB;
  });

  const sprintOptions = useMemo(() => {
    const sprintList = Array.isArray(getSprintDetails) ? getSprintDetails : [];

    const options = sprintList.filter((sprint) => Number(sprint.isActive) === 0).map((sprint) => ({
        id: sprint?.sprint_id ?? sprint?.id,
        name: sprint?.sprint_name || `Sprint ${sprint?.sprint_id ?? sprint?.id}`,
      }))
      .filter((sprint) => sprint.id);

    const editingSprintId = taskDataForEdit?.sprint_id ?? taskDataForEdit?.sprintId;
    if (editingSprintId && !options.some((s) => String(s.id) === String(editingSprintId))) {
      options.unshift({
        id: editingSprintId,
        name: taskDataForEdit?.sprint_name || `Sprint ${editingSprintId}`,
      });
    }
    return options;
  }, [getSprintDetails, taskDataForEdit?.sprint_id, taskDataForEdit?.sprintId, taskDataForEdit?.sprint_name]);
  const sprintNameById = useMemo(() => {
    return new Map(sprintOptions.map((sprint) => [String(sprint.id), sprint.name]));
  }, [sprintOptions]);

  

  const normalizedEpicOptions = useMemo(() => {
    const currentProjectId =
      projectData?.id || taskData?.selectedProject || taskDataForEdit?.project_id;
    const hasProjectId = Boolean(currentProjectId);
    const sourceList = hasProjectId ? epicOptions : epicOptions.length ? epicOptions : parentList || [];
    const filtered = sourceList
      .filter((epic) => {
        if (!currentProjectId) return true;
        const epicProjectId =
          epic?.project_id ?? epic?.projectId ?? epic?.projectID ?? epic?.project;
        return !epicProjectId || Number(epicProjectId) === Number(currentProjectId);
      });
    const mapped = filtered.map((epic, index) => {
      const epicId = epic?.epic_id ?? epic?.id ?? epic?.epicId ?? null;
      const epicName =
        epic?.epic_name ?? epic?.epic_title ?? epic?.name ?? epic?.title ?? `Epic ${epicId}`;
      return { epicId, epicName, key: epicId ?? `${epicName}-${index}` };
    });
    const uniqueById = new Map();
    mapped.forEach((epic) => {
      if (!epic.epicName) return;
      const key = epic.epicId ?? epic.epicName;
      if (!uniqueById.has(String(key))) {
        uniqueById.set(String(key), epic);
      }
    });
    return Array.from(uniqueById.values());
  }, [epicOptions, parentList, projectData?.id, taskData?.selectedProject, taskDataForEdit?.project_id]);

  const epicNameById = useMemo(() => {
    return new Map(normalizedEpicOptions.map((epic) => [String(epic.epicId), epic.epicName]));
  }, [normalizedEpicOptions]);

  const storyOptionsWithSelection = useMemo(() => {
    const options = [selectedStoryOption, ...storyOptions].filter(Boolean);

    return options.filter(
      (option, index, self) =>
        index ===
        self.findIndex(
          (item) => String(item?.taskId) === String(option?.taskId),
        ),
    );
  }, [selectedStoryOption, storyOptions]);

  useEffect(() => {
    if (!normalizedEpicOptions.length) return;
    if (taskData?.epic_id) return;
    if (!taskData?.epic_name) return;
    const match = normalizedEpicOptions.find(
      (epic) => String(epic.epicName).toLowerCase() === String(taskData.epic_name).toLowerCase(),
    );
    if (match) {
      setTaskData((prev) => ({
        ...prev,
        epic_id: match.epicId,
      }));
    }
  }, [normalizedEpicOptions, taskData?.epic_id, taskData?.epic_name]);

  useEffect(() => {
    const currentProjectId =
      projectData?.id || taskData?.selectedProject || taskDataForEdit?.project_id;
    if (!currentProjectId) return;
    if (!taskData?.epic_id) return;
    const exists = normalizedEpicOptions.some(
      (epic) => String(epic.epicId) === String(taskData.epic_id),
    );
    if (exists) return;
    setTaskData((prev) => ({
      ...prev,
      epic_id: '',
      epic_name: '',
    }));
  }, [normalizedEpicOptions, projectData?.id, taskData?.selectedProject, taskDataForEdit?.project_id, taskData?.epic_id]);
  useEffect(() => {
    if (!normalizedEpicOptions.length) return;
    if (!taskData?.epic_id) return;
    const epicName = epicNameById.get(String(taskData.epic_id));
    if (!epicName) return;
    if (taskData.epic_name === epicName) return;
    setTaskData((prev) => ({
      ...prev,
      epic_name: epicName,
    }));
  }, [normalizedEpicOptions, epicNameById, taskData?.epic_id, taskData?.epic_name]);

  useEffect(() => {
    if (!taskDataForEdit) return;
    if (!taskIssueType || !taskIssueType.length) return;
    if (taskData?.issueType) return;
    const rawIssueType = taskDataForEdit?.issue_type ?? taskDataForEdit?.issueType;
    const resolvedRaw =
      rawIssueType !== null && rawIssueType !== undefined && rawIssueType !== ''
        ? rawIssueType
        : issueTypeFromTaskList;
    if (!resolvedRaw) return;
    const matchedById = taskIssueType.find(
      (item) => String(item.id) === String(resolvedRaw),
    );
    const matchedByName = taskIssueType.find(
      (item) =>
        String(item.issue_type || '').toLowerCase() ===
        String(resolvedRaw || '').toLowerCase(),
    );
    const resolved = matchedById?.id ?? matchedByName?.id ?? resolvedRaw;
    setTaskData((prev) => ({
      ...prev,
      issueType: resolved !== null && resolved !== undefined ? String(resolved) : '',
      issue_type: resolved !== null && resolved !== undefined ? String(resolved) : '',
    }));
  }, [taskDataForEdit, taskIssueType, taskData?.issueType, issueTypeFromTaskList]);

  useEffect(() => {
    if (!taskDataForEdit) return;
    const nextIssueType = coalesceNonEmpty(
      taskData?.issueType,
      taskData?.issue_type,
      taskDataForEdit?.issue_type,
      taskDataForEdit?.issueType,
      issueTypeFromTaskList,
    );
    const nextSprint = coalesceNonEmpty(
      taskData?.sprint_id,
      taskDataForEdit?.sprint_id,
      taskDataForEdit?.sprintId,
    );
    const nextEpic = coalesceNonEmpty(
      taskData?.epic_id,
      taskDataForEdit?.epic_id,
    );
    setTaskData((prev) => ({
      ...prev,
      issueType: prev.issueType || nextIssueType,
      issue_type: prev.issue_type || nextIssueType,
      sprint_id: prev.sprint_id || nextSprint,
      epic_id: prev.epic_id || nextEpic,
    }));
  }, [
    taskDataForEdit,
    issueTypeFromTaskList,
    taskData?.issueType,
    taskData?.issue_type,
    taskData?.sprint_id,
    taskData?.epic_id,
  ]);

  useEffect(() => {
    if (!open || !projectData?.id) return;
    dispatch(getSprintDetailsAction({ project_id: projectData.id }));
  }, [dispatch, open, projectData?.id]);
    
  useEffect(() => {
    if (!taskDataForEdit?.id || !open) return;

    const taskId = taskDataForEdit.id || taskDataForEdit.taskId;

    dispatch(getActivityAction({ taskId }));
    dispatch(getTaskCommentsAction({
      task_id: taskId,
      type: 'GET'
    }));

  }, [taskDataForEdit?.id, open]);

  useEffect(() => {
    if (taskDataForEdit && open) {
      if (taskDataForEdit?.task_recent_start_time !== null && taskDataForEdit?.task_recent_end_time === null ) {
        setStartTime(moment.utc(taskDataForEdit?.task_recent_start_time).toDate());
        setIsTimerRunning(true);
      } else {
        const timerData = (() => {
          try {
            const raw = localStorage.getItem('taskTimerData');
            return raw ? JSON.parse(raw) : null;
          } catch {
            localStorage.removeItem('taskTimerData');
            return null;
          }
        })();
        const currentTaskId = taskDataForEdit?.id || taskDataForEdit?.taskId;

        if (
          timerData?.isTimerRunning &&
          String(timerData?.taskId) === String(currentTaskId) &&
          timerData?.startTime
        ) {
            const parsed = moment.utc(timerData.startTime);
            setStartTime(parsed.isValid() ? parsed.toDate() : new Date(timerData.startTime));
          setIsTimerRunning(true);
        }
      }
    }
  }, [taskDataForEdit, open]);
  useEffect(() => {
}, [tasklogsDetails]);
  const handleCancel = () => {
    if (taskDataForEdit) {
      setFormErrors({
        taskName: null,
        selectedProject: null,
        orginalEstimation: null,
        task_latitude: null,
        task_longitude: null,
      });
      dispatch(clearTaskLog());
      setStartTime(null);
      setIsTimerRunning(false);
      setElapsedTime(0);
      onClose();
    } else {
      setTaskData({
        id: '',
        taskName: '',
        selectedStaff: '',
        startDate:'',
        dueDate: '',
        projectLocation: '',
        selectedProject: '',
        priority: '',
        repeat: '',
        description: '',
        reporter: '',
        asignee: '',
      taskLocation: 0,
      task_latitude: null,
      task_longitude: null,
      issueType: '',
      issue_type: '',
      epic_name: '',
      epic_id: '',
      sprint_id: '',
      story_id: '',
      sub_parent_id: '',

      });
      setFormErrors({
        taskName: null,
        selectedProject: null,
        orginalEstimation: null,
        task_latitude: null,
        task_longitude: null,
      });
      setDontCreateActiveSprint(false);
      onClose();
    }
  };

  const handleTaskLocation = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    let updatedValue = value;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
    validationHandler(name, newValue);
  };

  // console.log(projectData, 'projectData')

  const handleChange = async(e) => {
    try{
    setFlag(true)
    // setButtonClose(true)
    const { name, value } = e.target;
    let updatedValue = value;
    setTimeSpent(value);
    
    const regex = /^(?!.*([WwDdHhMm]).*\1)(?:(\d+w)?\s*(\d+d)?\s*(\d+h)?\s*(\d+m)?)?$/;
    const isValid = regex.test(value);
    setIsValidFormat(isValid);

    if (name === 'status') {
      await setTaskData((prev) => ({
        ...prev,
        status_name: taskStatus.find((s) => s.id === value).status_name,
      }));
    }

    if (name === 'priority') {
      const selectedPriority = taskPriority.find((p) => p.id === value);
      if (selectedPriority) {
        setTaskData((prevData) => ({
          ...prevData,
          priority: value,
          priority_name: selectedPriority.priority_name,
        }));
      }
    }

    if (name === 'issueType') {
      setTaskData((prevData) => ({
        ...prevData,
        issueType: value !== null && value !== undefined ? String(value) : '',
        issue_type: value !== null && value !== undefined ? String(value) : '',
      }));
      validationHandler(name, value);
      return;
    }

    if (name === 'epic_id') {
      const epicName = epicNameById.get(String(value)) || '';
      setTaskData((prevData) => ({
        ...prevData,
        epic_id: value,
        epic_name: epicName,
      }));
      validationHandler(name, value);
      return;
    }

    if (name === 'issueType') {
      // console.log("ssueTye", value);
      
      setTaskData((prevData) => ({
        ...prevData,
        issueType: value,
        issue_type: value,
      }));
      validationHandler(name, value);
      return;
    }

    await setStateHandler(name, updatedValue);
  }catch(error){
    console.error('Error',error)
  }
  };

  const handleStoryChange = (event, selectedOption) => {
    setSelectedStoryOption(selectedOption);
    setTaskData((prevData) => ({
      ...prevData,
      story_id: selectedOption?.taskId ?? '',
    }));
  };
  const handleSubTaskChange = (event, selectedOption) => {
    setSelectedStoryOption(selectedOption);
    setTaskKeySearch('');
    setTaskKeyError('');
    setTaskData((prevData) => ({
      ...prevData,
      sub_parent_id: selectedOption?.taskId ?? '',
    }));
    setFormErrors((prev) => ({ ...prev, selectedStoryOption: null }))
  };

  const handleTaskKeyChange = (event) => {
    const value = event.target.value;
    setTaskKeySearch(value);
    setTaskKeyError('');
    setSelectedStoryOption(null);
    setTaskData((prevData) => ({
      ...prevData,
      sub_parent_id: '',
    }));

    if (String(value || '').trim()) {
      handleTaskKeyLookup(value);
    }
    setFormErrors((prev) => ({ ...prev, taskKeySearch: null }))
  };

  const handleTaskKeyLookup = (lookupValue = taskKeySearch) => {
    const key = String(lookupValue || '').trim();

    if (!key) return;

    if (!currentProjectId) {
      setTaskKeyError('Select a project first');
      setAlertMessage('Select a project first');
      setAlertOpen(true);
      return;
    }

    dispatch(
      getTaskIdBySearchAction(
        {
          project_id: currentProjectId,
          projects_id: currentProjectId,
          searchString: key,
          task_id: key,
          type : BoardType
        },
        setModalTypeHandler,
        setLoaderStatusHandler,
        (res) => {
          const rows = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
                ? res
                : [];
          const first = rows[0] ?? null;
          const resolvedTaskId = first?.id;

          if (!resolvedTaskId) {
            setTaskKeyError('Task key not found');
            setAlertMessage('No task found for this key');
            setAlertOpen(true);
            return;
          }

          setTaskKeyError('');
          setTaskData((prevData) => ({
            ...prevData,
            sub_parent_id: resolvedTaskId,
          }));
        },
      ),
    );
  };

  const handleStorySearchChange = (event, value, reason) => {
    if (reason === 'input') {
      setStoryPage(0);
      setStoryOptions([]);
      setStoryHasMore(false);
      setStorySearch(value);
      return;
    }

    if (reason === 'clear') {
      setStoryPage(0);
      setStoryOptions([]);
      setStoryHasMore(false);
      setStorySearch('');
    }
  };

  const handleStoryListScroll = (event) => {
    const listNode = event.currentTarget;

    if (isStoryLoading || !storyHasMore) return;

    const isNearBottom =
      listNode.scrollTop + listNode.clientHeight >= listNode.scrollHeight - 10;

    if (isNearBottom) {
      setStoryPage((prevPage) => prevPage + 1);
    }
  };

  
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditCommentData({
      ...editCommentData,
      [name]: value
    });
  };
  const CommentAttachments = (attachment) => {
    if (!attachment) return [];
    if (Array.isArray(attachment)) return attachment.filter(Boolean);
    if (typeof attachment === 'string') {
      try {
        const parsedAttachment = JSON.parse(attachment);
        if (Array.isArray(parsedAttachment)) {
          return parsedAttachment.filter(Boolean);
        }
      } catch (error) {
        return attachment ? [attachment] : [];
      }
      return attachment ? [attachment] : [];
    }
    return [];
  };
  const getLatestCommentAttachment = (attachment) => {
    const attachments = CommentAttachments(attachment);
    return attachments.length ? attachments[attachments.length - 1] : null;
  };
  const handleSubTaskCheckBox = (event) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    setSelectedStoryOption(null);
    setTaskKeySearch('');
    setTaskKeyError('');
    setTaskData((prevData) => ({
      ...prevData,
      sub_parent_id: '',
    }));
  };

  const handlestoryBasedTaskCheckBox = (event) => {
    const checked = event.target.checked;
    setIsStoryBasedChecked(checked);
    setSelectedStoryOption(null);
    setTaskKeySearch('');
    setTaskKeyError('');
    setTaskData((prevData) => ({
      ...prevData,
      sub_parent_id: '',
    }));
  };

  const handleDontCreateActiveSprintCheckBox = (event) => {
    const checked = event.target.checked;
    setDontCreateActiveSprint(checked);
    if (!checked) {
      setTaskData((prevData) => ({
        ...prevData,
        sprint_id: '',
      }));
    }
  };
 
  const setStateHandler = async (name, value) => {
    await setTaskData((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
    validationHandler(name, value);
  };

  // const capitalize = (s) => {
  //   if (typeof s !== 'string') return '';
  //   return  s.charAt(0).toUpperCase() + s.slice(1);
  // };
  const capitalize = (name) => {
    if (fieldLabels[name]) {
      return fieldLabels[name];
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'orginalEstimation') {
      if (/^(\d+[dwhm](\s|$))*\d*$/.test(value) || value === '') {
        setTaskData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]:
            'Invalid format. Please enter the correct format, e.g., "1w" or "2d,3h,30m".',
        });
      }
    }

    const currentRequiredFields = [...requiredFields];
    if (taskData.taskLocation === 1) {
    if (!currentRequiredFields.includes('task_latitude')) currentRequiredFields.push('task_latitude');
    if (!currentRequiredFields.includes('task_longitude')) currentRequiredFields.push('task_longitude');
  } 

    if (currentRequiredFields.includes(name)) {
      const isValueEmpty =
        value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        value === 'undefined' ||
        (Object.keys(value) && value.value === null);

      setFormErrors({
        ...formErrors,
        [name]: isValueEmpty ? `${capitalize(name)} is Required!` : null,
      });
    }
  };

  const handleMouseOver = () => {
    setIsMouseOver(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
  };

  const isOverLogged = progress > orginalEstimation; 
  const progressColor = isOverLogged ? '#D5170D' : progress <= orginalEstimation ? '#428727' : '#1976D2';

  const handleDateChange = (date) => {
    setTaskData((prevTaskData) => ({
      ...prevTaskData,
      startDate: date ? moment(date).format('YYYY-MM-DD') : null,
    }));
  };


  const handleSave = async (event, actionName) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };
    const currentRequiredFields = [...requiredFields];
    if (taskData.taskLocation === 1) {
      if (!currentRequiredFields.includes('task_latitude')) currentRequiredFields.push('task_latitude');
      if (!currentRequiredFields.includes('task_longitude')) currentRequiredFields.push('task_longitude');
    }
    if (Number(selectedIssueTypeValue) === 5) {  
      if (isChecked) {
        if (!selectedStoryOption) {
          isValid = false;
          formErrorsObj.selectedStoryOption = 'Please select a story'
        }
      } else {
        if (!taskKeySearch?.trim()) {
          isValid = false;
          formErrorsObj.taskKeySearch = 'Please enter a task key'
        } else if (taskKeyError) {
          isValid = false;
          formErrorsObj.taskKeySearch = taskKeyError
        }
      }
    }    
    Object.keys(taskData).forEach((key) => {
      if (
        currentRequiredFields.includes(key) &&
        (taskData[key] === null ||
          taskData[key] === '' ||
          taskData[key] === 'undefined')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
    });
    if (formErrorsObj.orginalEstimation) {
      isValid = false;
    }
    setFormErrors(formErrorsObj);
    if (isValid) {
      const resolvedIssueTypeRaw =
        taskData?.issueType ??
        taskData?.issue_type ??
        taskDataForEdit?.issue_type ??
        taskDataForEdit?.issueType ??
        '';
      const resolvedIssueType =
        resolvedIssueTypeRaw === '' || resolvedIssueTypeRaw === null || resolvedIssueTypeRaw === undefined
          ? ''
          : Number.isNaN(Number(resolvedIssueTypeRaw))
          ? resolvedIssueTypeRaw
          : Number(resolvedIssueTypeRaw);
      let data = {
        ...taskData,
        issueType: resolvedIssueType,
        issue_type: resolvedIssueType,
        previews,
        imageKey,
        project_id: projectData?.id,
        project_key : projectData?.project_key
        
      };
      if (resolvedIssueType === '') {
        delete data.issueType;
        delete data.issue_type;
      }

      if (BackLogTasks === true) {
        data.sprint_id = '';
      } else if (!dontCreateActiveSprint && [1, 3, 4].includes(Number(resolvedIssueType)) && CurrentProjectReport?.active_sprint_ids) {
        const firstActiveSprintId = CurrentProjectReport.active_sprint_ids;
        if (firstActiveSprintId) {
          data.sprint_id = firstActiveSprintId;
        }
      }
      if (data.sprint_id === '' || data.sprint_id === null || data.sprint_id === undefined) {
        delete data.sprint_id;
      }
      if (data.epic_id === '' || data.epic_id === null || data.epic_id === undefined) {
        delete data.epic_id;
      }
       // console.log('asdsdfe', taskData)
      onSave(data, actionName);
      setTaskData({
        id: '',
        taskName: '',
        selectedStaff: '',
        startDate: '', 
        dueDate: '',
        projectLocation: '',
        status: '',
        asignee: '',
        priority: '',
        repeat: '',
        orginalEstimation: '',
        description: '',
        remarks: '',
        preImage: [],
        taskLocation: 0,
        task_latitude: null,
        task_longitude: null, 
        issueType: '',
        issue_type: '',
        epic_name: '',
        epic_id: '',
        sprint_id: '',
        story_id: '',
        sub_parent_id: '',
      });
    }
  };
const handleStorySubmit = (e) => {
    e.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };
    const currentRequiredFields = [...requiredFields];

    const parentId = taskDataForEdit?.id || taskDataForEdit?.taskId;


    let data3 = {
        ...taskData,
        issueType: 1,
        issue_type: 1,
        previews,
        imageKey,
        project_id: projectData?.id,
        project_key : projectData?.project_key,
        taskName: storyData
        
      };

      // const payload = {...taskData, taskName: subTaskName, issueType: 5, issue_type: 5};
    // data.story_id = parentType === 3 ? parentId : '';
    data3.story_id = parentId ;
    data3.issueType = 1;
    data3.issue_type = 1;

    onSave(data3, 'task');
     setTaskData({
        id: '',
        taskName: '',
        selectedStaff: '',
        startDate: '', 
        dueDate: '',
        projectLocation: '',
        status: '',
        asignee: '',
        priority: '',
        repeat: '',
        orginalEstimation: '',
        description: '',
        remarks: '',
        preImage: [],
        taskLocation: 0,
        task_latitude: null,
        task_longitude: null, 
        issueType: '',
        issue_type: '',
        epic_name: '',
        epic_id: '',
        sprint_id: '',
        story_id: '',
        sub_parent_id: '',
      });
    setStoryData('');
    setShowEditPopup(false);
  };

  const handleSubTaskSave = (e) => {
    e.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };
    const currentRequiredFields = [...requiredFields];

    const parentId = taskDataForEdit?.id || taskDataForEdit?.taskId;


    let data = {
        ...taskData,
        issueType: 5,
        issue_type: 5,
        previews,
        imageKey,
        project_id: projectData?.id,
        project_key : projectData?.project_key,
        taskName: subTaskName
        
      };

      // const payload = {...taskData, taskName: subTaskName, issueType: 5, issue_type: 5};
    // data.story_id = parentType === 3 ? parentId : '';
    data.sub_parent_id = parentId ;
    data.issueType = 5;
    data.issue_type = 5;

    onSave(data, 'SubTask');
     setTaskData({
        id: '',
        taskName: '',
        selectedStaff: '',
        startDate: '', 
        dueDate: '',
        projectLocation: '',
        status: '',
        asignee: '',
        priority: '',
        repeat: '',
        orginalEstimation: '',
        description: '',
        remarks: '',
        preImage: [],
        taskLocation: 0,
        task_latitude: null,
        task_longitude: null, 
        issueType: '',
        issue_type: '',
        epic_name: '',
        epic_id: '',
        sprint_id: '',
        story_id: '',
        sub_parent_id: '',
      });
    setSubTaskName('');
    setopened(false);
  };

  const findRemaining = () => {
    // Function to convert weeks, days, hours, and minutes to hours
    function convertWDHMToHours(w = 0, d = 0, h = 0, m = 0) {
      return w * 8 * 6 + d * 8 + h + m / 60;
    }
  
    // Function to convert time string (HH:MM) to hours
    function timeToHours(timeString) {
      if (!timeString) return 0; // Return 0 if timeString is undefined or empty
      const [hours, minutes] = timeString.split(':').map(parseFloat);
      return hours + minutes / 60;
    }
  
    // // Function to convert hours to days, hours, and minutes
    // function convertHoursToDHM(totalHours) {
    //   const days = Math.floor(totalHours / 8);
    //   const remainingHours = totalHours % 8;
    //   const hours = Math.floor(remainingHours);
    //   const minutes = Math.round((remainingHours - hours) * 60);
    //   return { days, hours, minutes };
    // }

    function convertHoursToDHM(totalHours) {
      const workdayHours = 8; // Define the number of hours in a workday
      const daysPerWeek = 6; // Define the number of days in a week
    
      const weeks = Math.floor(totalHours / (workdayHours * daysPerWeek));
      const remainingHours = totalHours % (workdayHours * daysPerWeek);
    
      const days = Math.floor(remainingHours / workdayHours);
      const remainingWorkdayHours = remainingHours % workdayHours;
    
      const hours = Math.floor(remainingWorkdayHours);
      const minutes = Math.round((remainingWorkdayHours - hours) * 60);
    
      return { weeks, days, hours, minutes };
    }
  
  
    const time = taskDataForEdit?.orginalEstimation;
    let w = 0, d = 0, h = 0, m = 0;
  
    // Parsing time string to extract weeks, days, hours, and minutes
    time?.split(' ').forEach((segment) => {
      if (segment.endsWith('w')) w = parseInt(segment);
      else if (segment.endsWith('d')) d = parseInt(segment);
      else if (segment.endsWith('h')) h = parseInt(segment);
      else if (segment.endsWith('m')) m = parseInt(segment);
    });
  
    // Total estimated hours
    const totalHours = convertWDHMToHours(w, d, h, m);
  
    // Formatting total hours as HH:MM
    const totalHoursString = `${String(Math.floor(totalHours)).padStart(2, '0')}:${String(Math.round((totalHours - Math.floor(totalHours)) * 60)).padStart(2, '0')}`;
  
    // Converting time strings to hours
    const remainingHours = timeToHours(totalHoursString);
    const totalWorkHoursForTaskHours = tasklogsDetails[0]?.total_work_hours_for_task === "0" ? 0 : timeToHours(tasklogsDetails[0]?.total_work_hours_for_task); // Ensure taskDataForEdit?.timeSpent is defined
  
    // Calculating remaining hours, handling NaN case
    let remainingHoursValue = remainingHours - totalWorkHoursForTaskHours;
    if (isNaN(remainingHoursValue)) {
      remainingHoursValue = 0;
    }
  
    // Convert remaining hours to days, hours, and minutes
    const remainingTime = convertHoursToDHM(remainingHoursValue);
    function formatTime(weeks, days, hours, minutes) {
      let formattedTime = '';
      if (weeks > 0) {
        formattedTime += `${weeks}w `;
      }
      if (days > 0) {
        formattedTime += `${days}d `;
      }
      if (hours > 0 || (weeks === 0 && days === 0)) {
        formattedTime += `${hours}h `;
      }
      if (minutes > 0 || (weeks === 0 && days === 0 && hours === 0)) {
        formattedTime += `${minutes}m `;
      }
      return formattedTime.trim(); 
    }
    const formattedTime = formatTime(remainingTime.weeks,remainingTime.days,remainingTime.hours,remainingTime.minutes)
    // // console.log('Total Estimated Hours:', totalHours);
    // // console.log('Total Estimated Time:', totalHoursString);
    // // console.log('Remaining Time:', `${remainingTime.days} days ${remainingTime.hours} hours ${remainingTime.minutes} minutes`);
    setRemainingTime(remainingTime.days >= 0 ? `${formattedTime} remaining` : "Exceeded estimation!")
  };
  
  // // console.log( ?.timeSpent,'fhghg');


const handleSubmitTimeSpent = (Ftime) => {
  setFlag(false);


  const time = Ftime || taskData.timeSpent;
  if (!time) return;

  let w = 0, d = 0, h = 0, m = 0, s = 0;

  // Parse input like "1w 1d 1d 30m 30s"
  time.split(' ').forEach(token => {
    const value = parseInt(token);
    if (isNaN(value)) return;

    if (token.endsWith('w')) w += value;
    else if (token.endsWith('d')) d += value;
    else if (token.endsWith('h')) h += value;
    else if (token.endsWith('m')) m += value;
    else if (token.endsWith('s')) s += value;
  });

  // Convert everything to seconds
  const totalSeconds =
    w * 6 * 8 * 3600 + 
    d * 8 * 3600 +     
    h * 3600 +
    m * 60 +
    s;
  
  // determine end time
  let endTime;

  if (workLogData.startedDate && workLogData.startedTime) {
    endTime = moment(
      `${moment(workLogData.startedDate).format("YYYY-MM-DD")} ${workLogData.startedTime}`,
      "YYYY-MM-DD HH:mm"
    );
  } else {
    endTime = moment();
  }

  // calculate start time
  const startTime = endTime.clone().subtract(totalSeconds, "seconds");
  const formattedStartTime = startTime.format("YYYY-MM-DD HH:mm:ss");

  // Convert seconds → HH:MM:SS
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const timePortion =
    `${String(hours).padStart(2, '0')}:` +
    `${String(minutes).padStart(2, '0')}:` +
    `${String(seconds).padStart(2, '0')}`;

  setTimeSpent('');

  const data = {
    timeSpent: timePortion,
    task_id: taskData.id,
    start_time: formattedStartTime,
  };

  const value = {
    project_id: projectData?.id,
  };

  // Progress calculation
  const orginalEstimation = parseFloat(taskDataForEdit.orginalEstimation);
  const spentHours = totalSeconds / 3600;

  const calculatedProgress =
    orginalEstimation > 0
      ? (spentHours / orginalEstimation) * 100
      : 0;

  setProgress(calculatedProgress);

  dispatch(updateTaskAction(data.task_id, data, (response) => {
    if (response === 200) {
      setUpdate(true);
      dispatch(showTasklistAction(value));

      dispatch(
        getActivityAction(
          { taskId: taskData?.id || taskDataForEdit?.id || taskDataForEdit?.taskId },
          (status, activityData) => {
            if (status === 200) {
              setProgress(
                taskData.orginalEstimation === taskData.timeSpent
                  ? 0
                  : activityData?.res1?.[0]?.total_work_hours_for_task
              );
            }
          },
        ),
      );
    }
  }));
};
  useEffect(() => {
    findRemaining()
  }, [tasklogsDetails[0]?.total_work_hours_for_task])
  
  const hours = parseInt(taskData.timeSpent?.split('h')[0]) || 0;
  const minutes =
    parseInt(taskData.timeSpent?.split('h')[1]?.split('m')[0]) || 0;
  const hoursOg = parseInt(taskData.orginalEstimation?.split('h')[0]) || 0;
  const minutesOg =
    parseInt(taskData.orginalEstimation?.split('h')[1]?.split('m')[0]) || 0;

  // convert timespent to min
  function convertHoursToMinutesTimeSpent(hours, minutes) {
    let totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  }

  let totalMinutesTimespent = convertHoursToMinutesTimeSpent(hours, minutes);

  // convert Estimations to Minute
  function convertHoursToMinutesOrginalesti(hours, minutes) {
    let totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  }

  let totalMinutesOrginalesti = convertHoursToMinutesOrginalesti(
    hoursOg,
    minutesOg,
  );

  // Calculate the remaining time
  let remainingMinutes = totalMinutesOrginalesti - totalMinutesTimespent;

  // Extract hours and minutes from the remaining time
  let remainingHours = Math.floor(remainingMinutes / 60);
  let remainingMinutesPart = remainingMinutes % 60;

  // Format the result
  let formattedResult = `${remainingHours}h ${remainingMinutesPart}m`;

  // const startTimer = () => {
  //   let data = {
  //     type: 'start',
  //     task_id: taskData.id,
  //   };
  //   setStartTime(moment());
  //   setIsTimerRunning(true);
  //   dispatch(startEndAction(data));
  // };
  const startTimer = () => {

    if (projectData.project_type === 2 || projectData.project_type === 3) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // // console.log("projectData",projectData)
                // // console.log("taskDataForEdit",taskDataForEdit)
                let data = {
                    type: 'start',
                    task_id: taskData.id  , 
                    startLatitude: latitude,
                    startLongitude: longitude,
                    projectId: projectData.id || projectData.project_id,
                    project_type: projectData.project_type,
                    stockLocationId : projectData.location_id,
                    location_restriction: projectData.location_restriction,
                    taskLocation: taskDataForEdit.taskLocation ? taskDataForEdit.taskLocation : 0,
                };
                dispatch(startEndAction(data))
                  .then(response => {
                      // console.log(response.data.response_code === 404 && response.data.response_message === "Distance is more than allowed limit","API")
                      if (response.data.response_code === 404 && response.data.response_message === "Distance is more than allowed limit") {
                          // console.log("Running")
                        // alert(response.data.response_message);
                        setAlertMessage(response.data.response_message);
                                setAlertOpen(true);
                      } else {
                        // console.log("Running")
                            setStartTime(moment());
                            setIsTimerRunning(true);
                            setErrorMessage(null);
                            refreshTaskTimerState();
                        }
                    })
                    .catch(error => {
                        console.error("Error starting timer: ", error);
                    });
            },
            (error) => {
              console.error("Error getting location:", error);
              let message = "Error getting location. Please try again.";
              if (error.code === 1) {
                message = "Location access denied. Please enable location permissions.";
              } else if (error.code === 2) {
                message = "Location unavailable. Ensure your device's GPS is on.";
              } else if (error.code === 3) {
                message = "Location request timed out. Please try again.";
              }
              setAlertMessage(message);
              setAlertOpen(true);
            }
          );
        } else {
          setAlertMessage("Please turn on your location to start the timer.");
          setAlertOpen(true);
        }
    } else {
      let data = {
        type: 'start',
        task_id: taskData.id,
        projectId: projectData.id || projectData.project_id,
        location_restriction: projectData.location_restriction,
        project_type: projectData.project_type,
        taskLocation: taskDataForEdit.taskLocation ? taskDataForEdit.taskLocation : 0,
      };

      dispatch(startEndAction(data))
      .then((response) => {
        const startTime = new Date();
        localStorage.setItem('taskTimerData', JSON.stringify({
          taskId: taskData.id,
          startTime,
          isTimerRunning: true,
        }));
        setStartTime(startTime);
        setIsTimerRunning(true);
        setErrorMessage(null);
        refreshTaskTimerState();
      })
      .catch((error) => {
        console.error("Error starting timer: ", error);
      });
  }
};
  
  const handleCloseAlert = () => {
    setAlertOpen(false);
};

const stopTimer = () => {
  const currentTime = new Date();
  const start = new Date(startTime); 
  const timeDifference = currentTime - start; 

  const hours = Math.floor(timeDifference / 3600000);
  const minutes = Math.floor((timeDifference % 3600000) / 60000);
  const seconds = Math.floor((timeDifference % 60000) / 1000);

   const FtimeSpent = `${hours}h ${minutes}m ${seconds}s`
  if (projectData.project_type === 2 || projectData.project_type === 3) {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              let data = {
                type: 'end',
                task_id: taskData.id,
                endLatitude: latitude,
                endLongitude: longitude,
                projectId: projectData.id || projectData.project_id,
                project_type: projectData.project_type,
                stockLocationId: projectData.location_id,
                location_restriction: projectData.location_restriction,
                taskLocation: taskDataForEdit.taskLocation,
              };
              dispatch(startEndAction(data))
                  .then(response => {
                      if (response.data.response_code === 404 && response.data.response_message === "Distance is more than allowed limit") {
                          setAlertMessage(response.data.response_message);
                          setAlertOpen(true);
                      } else {
                        // console.log("Not Running")
                        const currentTime = new Date();
                        const startTime = new Date(startTime);  // Ensure startTime is a Date object
                        const timeDifference = currentTime - startTime; // Difference in milliseconds

      // Convert time difference from milliseconds to a readable format (hh:mm:ss)
                       const hours = Math.floor(timeDifference / 3600000);
                       const minutes = Math.floor((timeDifference % 3600000) / 60000);
                        const seconds = Math.floor((timeDifference % 60000) / 1000);
                        setTaskData({...taskData , timeSpent:`${hours}h ${minutes}m ${seconds}s`})
                          setIsTimerRunning(false);
                          setStartTime(null);
                          setElapsedTime(0);
                          setErrorMessage(null);
                          refreshTaskTimerState();
                      }
                  })
                  .catch(error => {
                      console.error("Error stopping timer: ", error);
                  });
          },
          (error) => {
            console.error("Error getting location:", error);
            let message = "Error getting location. Please try again.";
            if (error.code === 1) {
              message = "Location access denied. Please enable location permissions.";
            } else if (error.code === 2) {
              message = "Location unavailable. Ensure your device's GPS is on.";
            } else if (error.code === 3) {
              message = "Location request timed out. Please try again.";
            }
            setAlertMessage(message);
            setAlertOpen(true);
          }
        );
      } else {
        setAlertMessage("Please turn on your location to start the timer.");
        setAlertOpen(true);
      }
} else {
  let data = {
    type: 'end',
    task_id: taskData.id,
    projectId: projectData.id || projectData.project_id,
    location_restriction: projectData.location_restriction,
    project_type: projectData.project_type,
    taskLocation: taskDataForEdit.taskLocation
      ? taskDataForEdit.taskLocation
      : 0,
  };

  dispatch(startEndAction(data))
    .then((response) => {
      localStorage.removeItem('taskTimerData');
      setStartTime(null);
      setIsTimerRunning(false);
      setElapsedTime(0);
      setErrorMessage(null);
      refreshTaskTimerState();
    })
    .catch((error) => {
      console.error('Error stopping timer: ', error);
    });
    handleSubmitTimeSpent(FtimeSpent);
}};
  // const stopTimer = () => {
  //   let data = {
  //     type: 'End',
  //     task_id: taskData.id,
  //   };
  //   setIsTimerRunning(false);
  //   setStartTime(null);
  //   setElapsedTime(0);
  //   dispatch(startEndAction(data));
  // };

  useEffect(() => {
    if (!taskDataForEdit || !isTimerRunning || !startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(moment().diff(startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime, taskDataForEdit]);

  useEffect(() => {
    if (commentAttachment?.length > 0 && formErrors.upload) {
      setFormErrors((prev) => ({...prev, upload: null}));
    }
  }, [commentAttachment, formErrors.upload]);

  const handleCommentSubmit = async (type) => {
    // if (type !== 'EDIT' && (!commentAttachment || commentAttachment.length === 0)) {
    //   setFormErrors((prev) => ({...prev, upload: 'Image upload is required'}));
    //   return;
    // }
    let values = { ...editCommentData }
    const latestCommentAttachment = getLatestCommentAttachment(commentAttachment);

    let data1 = {
      id: values?.id,
      task_id: values?.task_id,
      comment: values?.comment,
      comment_attachment: latestCommentAttachment,
      type: type,
    }

const comment_attachment = latestCommentAttachment
// // console.log("vfgg",taskData.id,values.task_id);
// // console.log("taskidfrs",taskDataForEdit.id);
    let data2 = {
      task_id: taskDataForEdit.id || taskDataForEdit.taskId,
      comment: taskData.comment,
      comment_attachment: comment_attachment,
      type: "CREATE"
    }
    // // console.log("hhhggg",data2);

    let data = type === "EDIT" ? data1 : data2
   // console.log('sdf',data);
    await dispatch(getTaskCommentsAction(data))
    await dispatch(getTaskCommentsAction({
      task_id: taskDataForEdit.id || taskDataForEdit.taskId,
      type: 'GET'
    }))
    setButtonClose(false)
    setTaskData({...taskData,comment:''})
    setEditComment(false)
    setCommentAttachment([])

  }

 const handleCommentClose = () =>{
  setButtonClose(false)
  setTaskData((prev) => ({...prev, comment: ''}))
  setCommentAttachment([])
  setFormErrors((prev) => ({...prev, upload: null}));
  }

  // const handleCommentEditOpen = () =>{
  //   // setButtonClose(false)
  //   // setTaskData({comment: ''})
  //   setEditComment(true)
  //   }

    const handleCommentEditOpen = (data) => {
    let editObj = {...data}
    setId(editObj.id)
      setEditCommentData(editObj);
      setCommentAttachment(CommentAttachments(editObj?.comment_attachment));
      setEditComment(true)
  }

  const handleCommentDelete = async (id,task_id) => {
    // setEditCommentId(data);
    // // console.log("iddd",id);
    let data1 = {
    id: id,
    type: "DELETE",
    task_id: task_id
    }
    await dispatch(getTaskCommentsAction(data1))
    await dispatch(getTaskCommentsAction({
      task_id: task_id,
      type: 'GET'
    }))


}

  const handleCommentEditClose = () => {
    setEditComment(false);
    setCommentAttachment([]);
}
const handleImageDelete = (index) => {
  if (taskDataForEdit) {
      const updatedImages = [...previews];
      updatedImages.splice(index, 1);
      setPreviews(updatedImages);

      const updatedImageKeys = [...imageKey]
      updatedImageKeys.splice(index, 1)
      setImageKey(updatedImageKeys)
     // dispatch(updateImageAction({ index: index, asset_id: props.assetData.asset_id }));
  } else {
      console.error('asdad');
  }
};

    // // console.log("openorClose", taskDataForEdit != null);

  const formattedElapsedTime = moment.utc(elapsedTime).format('HH:mm:ss');

  
// let disabled=storage?.role_name!=="Administrator"

function IsInvalidTimeFormat(timespanStr, maltiSpacesSeparation = false) {
  if(!timespanStr) return false;
 if (maltiSpacesSeparation) {
   timespanStr = timespanStr.toLowerCase().split(" ");
 }
 else {
   timespanStr = timespanStr.toLowerCase().split(/ +/);
 }
 let status  = []
 timespanStr.forEach((item) => {
   if (!/^\d{1,2}[dhwm]$/.test(item)) {
     status.push(false);
   }
   else{
     status.push(true);
   }
 });
 
 return status?.filter(x => !x)?.length > 0
}



function convertToMinutes(val) {
    val = val?.toString()?.trim();
  if(!val) return 0
  let totalMinutes = 0;
  if(!IsInvalidTimeFormat(val)){
    const parts = val?.split(/\s+/);

    for (const part of parts) {
      const value = parseInt(part, 10);
      const unit = part.slice(-1).toLowerCase();
  
      switch (unit) {
        case 'w':
          totalMinutes += value * 7 * 24 * 60;
          break;
        case 'd':
          totalMinutes += value * 24 * 60;
          break;
        case 'h':
          totalMinutes += value * 60;
          break;
        case 'm':
          totalMinutes += value;
          break;
        default:
         totalMinutes = 0;
          
      }
    }
  }

  return parseInt(totalMinutes);
}


let loggedtime = tasklogsDetails?.length? tasklogsDetails[0]?.total_work_hours_format !== null && tasklogsDetails[0]?.total_work_hours_format !== ''? `${tasklogsDetails[0]?.total_work_hours_format}`: '0': '0'
let convertedIntoMinutes = convertToMinutes(loggedtime)
let orginalEstimationInMinutes = convertToMinutes(taskData?.orginalEstimation)

// Base progress (0–100)
const basePercentage = Math.min(
  Math.round((convertedIntoMinutes / orginalEstimationInMinutes) * 100),
  100
);

// Overflow progress (only excess)
const overflowPercentage =
  convertedIntoMinutes > orginalEstimationInMinutes
    ? Math.round(((convertedIntoMinutes - orginalEstimationInMinutes) / orginalEstimationInMinutes) * 100)
    : 0;
// const percentage = Math.round((convertedIntoMinutes / orginalEstimationInMinutes) * 100);
// // console.log("loggedtime:",loggedtime,"convertedIntoMinutes:",convertedIntoMinutes,"percentage converted data :",percentage);


// // console.log("logData",convertToMinutes(loggedtime)>convertToMinutes(taskData?.orginalEstimation)?"red" : "blue","rtyuik", taskData.orginalEstimation, taskData.timeSpent)
// // console.log("logData",loggedtime);



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

// console.log(taskActivityDetails,'taskActivityDetails');

  const workLogEntries = useMemo(
    () =>
      (taskActivityDetails || []).filter(
        (item) => item?.work_hours && (item?.start_time || item?.createdAt),
      ),
    [taskActivityDetails],
  );

  const allFeedItems = useMemo(() => {
    const getTimeValue = (dateValue) => {
      if (!dateValue) return 0;
      const time = new Date(dateValue).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const commentsFeed = (taskCommentsList || []).filter(Boolean).map((item, idx) => {
      const joinedName = [item?.first_name, item?.last_name].filter(Boolean).join(' ').trim();
      return {
        id: `comment-${item?.id ?? `idx-${idx}`}`,
        type: 'comment',
        createdAt: item?.createdAt,
        title: item?.createdBy || joinedName || 'Comment',
        body: item?.comment || '',
        raw: item,
      };
    });

    const historyFeed = (taskActivityDetails || [])
      .filter((item) => !!item?.remarks)
      .map((item, idx) => ({
        id: `history-${item?.id ?? `idx-${idx}`}`,
        type: 'history',
        createdAt: item?.updatedAt || item?.createdAt,
        title: 'History',
        body: item?.remarks,
        raw: item,
      }));

    if (taskDataForEdit?.full_name) {
      historyFeed.push({
        id: `history-assigned-${taskDataForEdit?.id || taskDataForEdit?.taskId}`,
        type: 'history',
        createdAt: taskDataForEdit.updatedAt || taskDataForEdit.createdAt,
        title: 'History',
        body: `Assigned for ${taskDataForEdit?.full_name}`,
        raw: taskDataForEdit,
      });
    }

    const workLogFeed = (workLogEntries || []).filter(Boolean).map((item, idx) => ({
      id: `worklog-${item?.id || item?.log_id || item?.createdAt || `idx-${idx}`}`,
      type: 'worklog',
      createdAt: item?.start_time || item?.updatedAt || item?.createdAt,
      title: item?.full_name || item?.createdBy || 'Work log',
      body: item?.work_hours || '',
      raw: item,
    }));

    return [...commentsFeed, ...historyFeed, ...workLogFeed].sort(
      (a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt),
    );
  }, [taskCommentsList, taskDataForEdit, taskActivityDetails, workLogEntries]);

  const renderCommentComposer = () => (
    <Grid container spacing={2} style={{width: '100%', margin: 0}}>
      <Grid
        item
        xs={12}
        style={{
          paddingTop: '10px',
          paddingLeft: '0px',
          paddingRight: '0px',
        }}
      >
        <FormControl style={{width: '108%'}}>
          <CommentAttachment
            status={taskData.status}
            commentAttachment={commentAttachment}
            setCommentAttachment={setCommentAttachment}
          >
            <TextField
              name='comment'
              multiline
              rows={2}
              rowsMax={4}
              value={taskData.comment}
              onChange={handleChange}
              variant='outlined'
              fullWidth
              placeholder='Enter comments here...'
              disabled={taskData.status === 6}
              sx={{paddingRight: '30px', border: 0}}
            />
          </CommentAttachment>
          {formErrors.upload ? (
            <FormHelperText error>{formErrors.upload}</FormHelperText>
          ) : null}
        </FormControl>
        {/* {buttonClose && ( */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginTop: '10px',
              gap: '12px'
            }}
          >
            <Button variant='contained' size='small' onClick={handleCommentSubmit}>
              Submit
            </Button>{' '}
            <Button variant='outlined' size='small' onClick={handleCommentClose}>
              Cancel
            </Button>
          </div>
        {/* )} */}
      </Grid>
    </Grid>
  );

  const renderCommentsList = () => {

    const handeImageOpen = (img) => {
      setSelectedImage(img)
      setZoom(1);
      setOpenImage(true);
    };
    const handleClose = () => {
      setOpenImage(false);
    };
    const zoomIn = () => {
      setZoom((prev) => prev + 0.2);
    };

    const zoomOut = () => {
      setZoom((prev) => Math.max(prev - 0.2, 1));
    };

    const resetZoom = () => {
      setZoom(1);
    };
    const handleWheel = (e) => {
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };
    const handleMouseDown = (e) => {
      dragging.current = true;
      start.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    };

    const handleMouseMove = (e) => {
      if (!dragging.current) return;

      setPosition({
        x: e.clientX - start.current.x,
        y: e.clientY - start.current.y
      });
    };

    const handleMouseUp = () => {
      dragging.current = false;
    };
    if (!taskCommentsList?.length) {
      return (
        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
          No comments yet
        </Typography>
      );
    }

    const safeComments = (taskCommentsList || []).filter(Boolean);

    return (
      <Grid item lg={12} md={12} sm={12} xs={12} pt={'20px'}>
        {safeComments.map((v, index) => (
          <div
            key={v?.id ?? `idx-${index}`}
            style={{
              marginBottom: index !== safeComments.length - 1 ? '30px' : '0',
            }}
          >
            <Typography
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '5px',
              }}
            >
              {(v?.createdBy || 'User') + ' - ' + (v?.createdAt ? moment(v.createdAt).format('DD/MM/YYYY hh:mm A') : '-')}
            </Typography>
            {editComment && v?.id === id ? (
              <>
                <FormControl fullWidth sx={{}}>
                  <CommentAttachment
                    status={taskData.status}
                    commentAttachment={commentAttachment}
                    setCommentAttachment={setCommentAttachment}
                    singleAttachment
                  >
                    <TextField
                      name='comment'
                      multiline
                      rows={2}
                      value={editCommentData.comment || ''}
                      onChange={handleEditChange}
                      variant='outlined'
                      fullWidth={true}
                      placeholder='Enter comments here...'
                    />
                  </CommentAttachment>
                </FormControl>
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => handleCommentSubmit('EDIT')}
                >
                  Submit
                </Button>{' '}
                <Button
                  variant='outlined'
                  size='small'
                  onClick={handleCommentEditClose}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {(() => {
                  // Normalize whatever shape the backend gave us (plain URL,
                  // JSON-encoded array, or already-array) into a simple list of URLs.
                  const normalized = CommentAttachments(v?.comment_attachment);
                  const raw = v?.comment_attachment;
                  const urls = normalized.length
                    ? normalized
                    : typeof raw === 'string' && raw.trim()
                    ? [raw]
                    : [];
                  return urls.map((url, attachmentIndex) => (
                    <img
                      key={`${v?.id ?? index}-${attachmentIndex}`}
                      src={url}
                      alt='attachment'
                      style={{ width: '200px', height: '200px', cursor: 'pointer', marginRight: '8px' }}
                      onClick={() => handeImageOpen && handeImageOpen(url)}
                    />
                  ));
                })()}
                <Typography>{v?.comment}</Typography>
                <Button size='small' onClick={() => handleCommentEditOpen(v)}>
                  Edit
                </Button>
                <Button size='small' onClick={() => handleCommentDelete(v?.id, v?.task_id)}>
                  Delete
                </Button>
                <Dialog open={openImage} onClose={handleClose} maxWidth="lg">
                  <div style={{ marginBottom: 10 }}>
                    <Button onClick={zoomIn}>Zoom In</Button>
                    <Button onClick={zoomOut}>Zoom Out</Button>
                    <Button onClick={resetZoom}>Reset</Button>
                    <Button onClick={handleClose}>Close</Button>
                  </div>
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    <img
                      src={selectedImage}
                      alt='preview'
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        transform: `scale(${zoom})`,
                        transition: "0.3s",
                        maxWidth: "100%",
                        maxHeight: "80vh"
                      }}

                    />
                  </div>
                </Dialog>

              </>
            )}
          </div>
        ))}
      </Grid>
    );
  };

  const renderHistoryTimeline = () => {
    if (!taskActivityDetails?.length && !taskDataForEdit?.full_name) {
      return (
        <Typography sx={{fontSize: '12px', color: 'text.secondary'}}>
          No history available
        </Typography>
      );
    }

    return (
      <Timeline>
        {taskDataForEdit === null ? (
          ''
        ) : (
          <>
            {taskActivityDetails?.map(
              (v) =>
                v.remarks !== 'Admin created this task' && (
                  <TimelineItem key={v.id}
                    sx={{
                      // maxWidth: '800px', // set your limit
                      // width: '100%',
                      // mx: 'auto', // optional: center it
                    }}
                  >
                    <Box
                      sx={{
                        width: '150px',
                        marginTop: '8px',
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          color: 'gray',
                          fontSize: '10px',
                          mb: 0.5,
                          textAlign: 'left',
                          paddingRight: '15px',
                          marginLeft: '-10px',
                        }}
                      >
                        {moment.utc(v.updatedAt).format('DD/MM/YYYY')}
                      </Box>
                      <Box
                        sx={{
                          color: 'gray',
                          fontSize: '10px',
                          mb: 0.5,
                          paddingRight: '20px',
                          marginLeft: '-10px',
                        }}
                      >
                        {moment.utc(v.updatedAt).format('hh:mm A')}
                      </Box>
                    </Box>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent
                      sx={{
                        fontSize: '10px',
                        marginTop: '8px',
                        marginLeft: '9px',
                        whiteSpace: 'normal',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {v.remarks ? (
                        v.remarks
                      ) : (
                        <span style={{visibility: 'hidden'}}>Placeholder</span>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ),
            )}
            {taskDataForEdit?.full_name && (
              <TimelineItem>
                <Box
                  sx={{
                    width: '150px',
                    marginTop: '8px',
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    paddingRight: '10px',
                  }}
                >
                  <Box
                    sx={{
                      color: 'gray',
                      fontSize: '10px',
                      mb: 0.5,
                      textAlign: 'left',
                      paddingRight: '15px',
                      marginLeft: '-10px',
                    }}
                  >
                    {moment(taskDataForEdit.updatedAt).format('DD/MM/YYYY')}
                  </Box>
                  <Box
                    sx={{
                      color: 'gray',
                      fontSize: '10px',
                      mb: 0.5,
                      paddingRight: '20px',
                      marginLeft: '-15px',
                    }}
                  >
                    {moment(taskDataForEdit.updatedAt).format('hh:mm A')}
                  </Box>
                </Box>
                <TimelineSeparator>
                  <TimelineDot />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent
                  sx={{
                    fontSize: '10px',
                    marginTop: '8px',
                    marginLeft: '9px',
                    whiteSpace: 'normal',
                    wordBreak: 'normal',
                  }}
                >
                  {taskDataForEdit?.full_name ? (
                    `Assigned for ${taskDataForEdit?.full_name}`
                  ) : (
                    <span style={{visibility: 'hidden'}}>Placeholder</span>
                  )}
                </TimelineContent>
              </TimelineItem>
            )}
            {taskActivityDetails?.map(
              (v) =>
                v.remarks === 'Admin created this task' && (
                  <TimelineItem key={v.id}>
                    <Box
                      sx={{
                        width: '150px',
                        marginTop: '8px',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          color: 'gray',
                          fontSize: '10px',
                          mb: 0.5,
                          textAlign: 'left',
                          paddingRight: '15px',
                          marginLeft: '-10px',
                        }}
                      >
                        {moment(v.createdAt).format('DD/MM/YYYY')}
                      </Box>
                      <Box
                        sx={{
                          color: 'gray',
                          fontSize: '10px',
                          mb: 0.5,
                        }}
                      >
                        {moment(v.createdAt).format('hh:mm A')}
                      </Box>
                    </Box>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent
                      sx={{
                        fontSize: '10px',
                        marginTop: '8px',
                        marginLeft: '9px',
                      }}
                    >
                      {`Admin created this task`}
                    </TimelineContent>
                  </TimelineItem>
                ),
            )}
          </>
        )}
      </Timeline>
    );
  };

  // Custom Styles for matching the Dark Theme
const actionBtnStyle = { color: '#d7dadc', textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '13px', '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } };

  const formatWorkLogDuration = (durationStr) => {
    if (!durationStr) return '';
    const [hours = 0, minutes = 0] = durationStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;

    const minsInHour = 60;
    const minsInDay = 8 * minsInHour;
    const minsInWeek = 6 * minsInDay;

    const weeks = Math.floor(totalMinutes / minsInWeek);
    totalMinutes %= minsInWeek;
    const days = Math.floor(totalMinutes / minsInDay);
    totalMinutes %= minsInDay;
    const h = Math.floor(totalMinutes / minsInHour);
    const m = totalMinutes % minsInHour;

    const result = [];
    if (weeks > 0) result.push(`${weeks}w`);
    if (days > 0) result.push(`${days}d`);
    if (h > 0) result.push(`${h}h`);
    if (m > 0 || result.length === 0) result.push(`${m}m`);

    return result.join(' ');
  };

  const convertWorkLogToDatabaseFormat = (inputTime) => {
    const time = inputTime || taskData.timeSpent;
    if (!time) return '';

    let w = 0;
    let d = 0;
    let h = 0;
    let m = 0;
    let s = 0;

    time.split(' ').forEach((token) => {
      const value = parseInt(token, 10);
      if (Number.isNaN(value)) return;

      if (token.endsWith('w')) w += value;
      else if (token.endsWith('d')) d += value;
      else if (token.endsWith('h')) h += value;
      else if (token.endsWith('m')) m += value;
      else if (token.endsWith('s')) s += value;
    });

    const totalSeconds = w * 6 * 8 * 3600 + d * 8 * 3600 + h * 3600 + m * 60 + s;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const handleEditClick = (log) => {
    setWorkLogEditData({
      id: log.id || log.log_id,
      timeSpent: formatWorkLogDuration(log.work_hours),
      startedDate: toMomentOrNull(log.start_time || log.createdAt),
      startedTime: moment(log.start_time || log.createdAt).format('HH:mm'),
    });
    setWorkLogEditOpen(true);
  };

  const handleWorkLogEditInputChange = (eventOrName, valueArg) => {
    if (typeof eventOrName === 'string') {
      setWorkLogEditData((prev) => ({
        ...prev,
        [eventOrName]: valueArg,
      }));
      return;
    }

    const {name, value} = eventOrName.target;
    setWorkLogEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkLogInput = (field, value) => {    // changes for current worklog

  if (field === 'startedDate') {
    setWorkLogData((prev) => ({
      ...prev,
      startedDate: value
    }));
    return;
  }

  const { name, value: inputValue } = field.target;

  setWorkLogData((prev) => ({
    ...prev,
    [name]: inputValue
  }));
};

  const handleWorkLogEditSubmit = () => {
    const formattedWorkHours = convertWorkLogToDatabaseFormat(workLogEditData.timeSpent);
    const taskId = taskData?.id || taskDataForEdit?.id || taskDataForEdit?.taskId;
    const startedDate = moment(workLogEditData.startedDate).format('YYYY-MM-DD');
    const startedTime = workLogEditData.startedTime || '00:00';
    const fullStartTime = `${startedDate} ${startedTime}:00`;

    if (!workLogEditData.id || !taskId || !formattedWorkHours) {
      return;
    }

    const payload = {
      id: workLogEditData.id,
      work_hours: formattedWorkHours,
      start_time: fullStartTime,
      task_id: taskId,
    };

    dispatch(
      updateLogDataAction(payload, () => {
        dispatch(getActivityAction({taskId}));
        setWorkLogEditOpen(false);
      }),
    );
  };

  const handleWorkLogDelete = (log) => {
    const logId = log?.id ?? log?.log_id;
    const taskId =
      taskDataForEdit?.taskId ||
      taskDataForEdit?.id ||
      taskData?.id ||
      log?.task_id;

    if (!taskId || !logId) {
      console.warn('Missing identifiers for work log delete', {log, taskId});
      return;
    }

    const payload = {
      task_id: taskId,
      id: logId,
    };

    dispatch(
      deleteLogDataAction(payload, () => {
        dispatch(getActivityAction({taskId}));
      }),
    );
  };



  const renderWorkLog = () => {
    if (!tasklogsDetails?.length && !workLogEntries?.length) {
      return <Typography sx={{ fontSize: '12px', color: '#202020' }}>No work log data</Typography>;
    }

    const totalLoggedText = tasklogsDetails?.[0]?.total_work_hours_format || '0h';

    return (
      <Box sx={{ p: 3, minHeight: '100vh', color: '#d7dadc' }}>

        {/* LOG LIST VIEW */}
        <Typography sx={{ fontSize: '13px', color: '#202020', mb: 2 }}>
          {totalLoggedText} logged
        </Typography>

        {workLogEntries.map((log, index) => (
          <Box key={log.id || index} sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#ff4500', fontSize: '14px', fontWeight: 'bold' }}>
              {log.full_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#202020' }}>{log.full_name}</Typography>
                <Typography sx={{ fontSize: '14px', color: '#202020' }}>logged {formatWorkLogDuration(log.work_hours)}</Typography>
                {/* Show "Edited" if record was updated after creation */}
                {log.updatedAt !== log.createdAt && (
                  <Typography sx={{ color: '#202020', fontSize: '12px', ml: 1 }}>Edited</Typography>
                )}
              </Stack>
              <Typography sx={{ color: '#202020', fontSize: '12px' }}>
                {moment(log.start_time || log.createdAt).fromNow()}
              </Typography>
              {storage.role_name !== 'Administrator' && <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Button
                  onClick={() => handleEditClick(log)}
                  sx={{ ...actionBtnStyle, color: '#202020' }}
                >
                  Edit
                </Button>

                <Typography sx={{ color: '#202020', fontSize: '10px', pt: '4px' }}>•</Typography>

                <Button onClick={() => handleWorkLogDelete(log)} sx={{ ...actionBtnStyle, color: '#202020' }}>Delete</Button>
              </Stack>}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };


  const renderWorkLogEditDialog = () => (
    <Dialog
      open={workLogEditOpen}
      onClose={() => setWorkLogEditOpen(false)}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>Edit Work log</DialogTitle>
      <Divider />
      <DialogContent>
        <Typography sx={{ fontSize: '18px', mb: 2 }}>
          The original estimate for this work item was{' '}
          <strong>
            {taskData?.orginalEstimation ||
              taskDataForEdit?.orginalEstimation ||
              '-'}
          </strong>.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Time spent'
              name='timeSpent'
              value={workLogEditData.timeSpent}
              onChange={handleWorkLogEditInputChange}
              placeholder='1h 30m'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Time remaining'
              disabled
            />
          </Grid>
        </Grid>

        <Typography sx={{ fontSize: '16px', mt: 2 }}>
          Use the format: 2w 4d 6h 45m
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: 0.5 }}>
          * w = weeks
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
          * d = days
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
          * h = hours
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary', mb: 2 }}>
          * m = minutes
        </Typography>

        <Typography sx={{ fontSize: '16px', mb: 1 }}>Date started *</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                value={toMomentOrNull(workLogEditData.startedDate)}
                onChange={(value) => handleWorkLogEditInputChange('startedDate', value)}
                name='startedDate'
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='time'
              name='startedTime'
              value={workLogEditData.startedTime ? workLogEditData.startedTime : workLogData.startedTime}
              onChange={handleWorkLogEditInputChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ pr: '24px' }}>
        <Button
          onClick={() => setWorkLogEditOpen(false)}
          color='primary'>
          Cancel
        </Button>
        <Button
          onClick={handleWorkLogEditSubmit}
          color='primary'
          variant='contained'
          sx={{ bgcolor: '#3d3d3d', textTransform: 'none' }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
  const renderAllFeed = () => {
    if (!allFeedItems.length) {
      return (
        <Typography sx={{fontSize: '12px', color: 'text.secondary', pt: 2}}>
          No activity available
        </Typography>
      );
    }

    return (
      <Box sx={{pt: 2}}>
        {allFeedItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              p: 1.5,
              mb: 1.5,
            }}
          >
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              sx={{mb: 0.5}}
            >
              <Stack direction='row' alignItems='center' spacing={1}>
                <Chip
                  size='small'
                  label={
                    item.type === 'comment'
                      ? 'Comments'
                      : item.type === 'history'
                      ? 'History'
                      : 'Work log'
                  }
                  color={item.type === 'comment' ? 'primary' : 'default'}
                  variant={item.type === 'comment' ? 'filled' : 'outlined'}
                  sx={{fontSize: '10px', height: '20px'}}
                />
                <Typography sx={{fontSize: '12px', fontWeight: 600}}>
                  {item.title}
                </Typography>
              </Stack>
              <Typography sx={{fontSize: '10px', color: 'text.secondary'}}>
                {item.createdAt ? moment.utc(item.createdAt).format('DD/MM/YYYY hh:mm A') : '-'}
              </Typography>
            </Stack>

            {item.type === 'worklog' ? (
              <>
                <Typography sx={{fontSize: '12px'}}>
                  logged {formatWorkLogDuration(item.raw?.work_hours)}
                  {item.raw?.updatedAt !== item.raw?.createdAt ? '  Edited' : ''}
                </Typography>
                <Typography sx={{fontSize: '12px', color: 'text.secondary', mt: 0.5}}>
                  {moment(item.raw?.start_time || item.raw?.createdAt).fromNow()}
                </Typography>
                <Stack direction='row' spacing={1} sx={{mt: 0.5}}>
                  <Button
                    onClick={() => handleEditClick(item.raw)}
                    sx={{...actionBtnStyle, color: '#202020'}}
                  >
                    Edit
                  </Button>
                  <Typography sx={{ color: '#202020', fontSize: '10px', pt: '4px' }}>.</Typography>
                  <Button
                    onClick={() => handleWorkLogDelete(item.raw)}
                    sx={{...actionBtnStyle, color: '#202020'}}
                  >
                    Delete
                  </Button>
                </Stack>
              </>
            ) : item.type === 'comment' && editComment && item.raw?.id === id ? (
              <>
                <FormControl fullWidth>
                  <CommentAttachment
                    status={taskData.status}
                    commentAttachment={commentAttachment}
                    setCommentAttachment={setCommentAttachment}
                    singleAttachment
                  >
                    <TextField
                      name='comment'
                      multiline
                      rows={2}
                      value={editCommentData.comment || ''}
                      onChange={handleEditChange}
                      variant='outlined'
                      fullWidth
                      placeholder='Enter comments here...'
                    />
                  </CommentAttachment>
                </FormControl>
                <Stack direction='row' spacing={1} sx={{mt: 1}}>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={() => handleCommentSubmit('EDIT')}
                  >
                    Submit
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={handleCommentEditClose}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                {CommentAttachments(item.raw?.comment_attachment).map((attachment, attachmentIndex) => (
                  <img
                    key={`${item.id}-attachment-${attachmentIndex}`}
                    src={attachment}
                    style={{width: '150px', height: '150px', marginBottom: '8px', marginRight: '8px'}}
                  />
                ))}
                <Typography sx={{fontSize: '12px'}}>{item.body || '-'}</Typography>
                {item.type === 'comment' && (
                  <Stack direction='row' spacing={1} sx={{mt: 0.5}}>
                    <Button
                      onClick={() => handleCommentEditOpen(item.raw)}
                      sx={{...actionBtnStyle, color: '#202020'}}
                    >
                      Edit
                    </Button>
                    <Typography sx={{ color: '#202020', fontSize: '10px', pt: '4px' }}>.</Typography>
                    <Button
                      onClick={() => handleCommentDelete(item.raw?.id, item.raw?.task_id)}
                      sx={{...actionBtnStyle, color: '#202020'}}
                    >
                      Delete
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderActivityTabContent = () => {
    switch (activityTab) {
      case ACTIVITY_TABS.comments:
        return (
          <>
            {!editComment && (
              <>
                {renderCommentComposer()}
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{mt: 2}}>
                  <Divider />
                </Grid>
              </>
            )}
            {renderCommentsList()}
          </>
        );
      case ACTIVITY_TABS.history:
        return <Box sx={{pt: 2}}>{renderHistoryTimeline()}</Box>;
      case ACTIVITY_TABS.worklog:
        return <Box sx={{pt: 2}}>{renderWorkLog()}</Box>;
      default:
        return (
          <>
            {!editComment && (
              <>
                {renderCommentComposer()}
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{mt: 2}}>
                  <Divider />
                </Grid>
              </>
            )}
            {renderAllFeed()}
          </>
        );
    }
  };



  return (
    <>
      {renderWorkLogEditDialog()}

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}} // Positioning the Snackbar in the top right corner
      >
        <Alert onClose={handleCloseAlert} severity='error' sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={linkCopiedOpen}
        autoHideDuration={3000}
        onClose={() => setLinkCopiedOpen(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert
          onClose={() => setLinkCopiedOpen(false)}
          severity='success'
          sx={{width: '100%'}}
        >
          Task link copied to clipboard
        </Alert>
      </Snackbar>
      <Grid
        container
        display='flex'
        flexDirection='row'
        spacing={type === 'board' ? 2 : 0}
        px={type === 'board' ? {xs: 2, lg: 4, xl: 6} : 0}
        style={{width: '98%', margin: 'auto'}}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12,
          }}
        >
          <Divider />
        </Grid>

       <Grid
       container
      sx={{
        maxHeight: 'calc(100vh - 140px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
       '&::-webkit-scrollbar': {width: '8px'},
       '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '4px',
        py:2,
      },
      '&::-webkit-scrollbar-thumb:hover': {backgroundColor: '#6c6c6c'},
      }}
      >
          <Grid
            sx={{pl: '1px'}}
            size={{
              lg: !activityEnable ? 12 : 12,
              md: !activityEnable ? 12 : 12,
              sm: !activityEnable ? 12 : 12,
              xs: 12,
            }}
          >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12,
              }}
            >
              <Stack display='flex' direction='row' alignItems='center' pb={3} gap={2}>
                <TextField
                  name='taskName'
                  label='Task Name'
                  fullWidth
                  value={taskData.taskName}
                  onChange={handleChange}
                  margin='normal'
                  required
                  error={formErrors.taskName === null ? false : true}
                  helperText={
                    formErrors.taskName === null ? '' : formErrors.taskName
                  }
                  disabled={taskData.status === 6}
                />
                {taskDataForEdit && roleType.includes(storage.role_name) && (
                  <IconButton
                    title='Copy task link'
                    size='large'
                    onClick={handleCopyTaskLink}
                    sx={{mt: '7px'}}
                    color='primary'
                    disabled={taskData.status === 6}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </Stack>
            </Grid>

            {/* {!taskDataForEdit && ( */}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12,
              }}
            >
              <FormControl
                fullWidth
                error={!!formErrors.issueType}
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '36px',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                  },
                }}
              >
                <InputLabel
                  required
                  sx={{
                    fontSize: '0.85rem',
                    color: '#000 !important',
                    fontWeight: 'normal !important',
                    '&.Mui-focused': {
                      color: '#000 !important',
                    },
                  }}
                >
                  Issue Type
                </InputLabel>
                <Select
                  name='issueType'
                  label='Issue Type'
                  size='small'
                  value={
                    selectedIssueTypeValue !== null &&
                    selectedIssueTypeValue !== undefined &&
                    selectedIssueTypeValue !== ''
                      ? String(selectedIssueTypeValue)
                      : ''
                  }
                  onChange={handleChange}
                  displayEmpty
                  sx={{
                    fontSize: '0.85rem',
                    color: '#000',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      paddingY: '5px',
                      color: '#000',
                    },
                    '& fieldset': {
                      borderColor: '#d3d3d3',
                    },
                    '&:hover fieldset': {
                      borderColor: '#aaa',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 250,
                        borderRadius: 2,
                        boxShadow: 3,
                        backgroundColor: '#fff',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.85rem',
                          color: '#000',
                          py: 1,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#e0e0e0 !important',
                            fontWeight: 500,
                          },
                        },
                      },
                    },
                  }}
                  renderValue={(selected) => {
                    const selectedItem = taskIssueType?.find(
                      (item) => String(item.id) === String(selected),
                    );
                    const fallbackLabel =
                      issueTypeLabelById?.[Number(selected)] ||
                      `Issue Type ${selected}`;

                    return selectedItem ? (
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {issueTypeIcons[selectedItem.issue_type]}
                        <Typography variant='body2' sx={{color: '#000'}}>
                          {selectedItem.issue_type}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant='body2'
                        sx={{color: selected ? '#000' : '#aaa'}}
                      >
                        {selected ? fallbackLabel : ''}
                      </Typography>
                    );
                  }}
                >
                  {selectedIssueTypeValue &&
                !taskIssueType?.some(
                  (item) => String(item.id) === String(selectedIssueTypeValue),
                ) && (
                  <MenuItem value={String(selectedIssueTypeValue)}>
                    <Typography variant="body2" sx={{ color: '#000' }}>
                      {issueTypeLabelById?.[Number(selectedIssueTypeValue)] ||
                        `Issue Type ${selectedIssueTypeValue}`}
                    </Typography>
                  </MenuItem>
                )}
                  {taskIssueType
                    ?.filter((e) => e.id !== 2) // 
                    .map((e) => (
                      <MenuItem key={e.id} value={String(e.id)}>
                        <Box
                          sx={{display: 'flex', alignItems: 'center', gap: 1}}
                        >
                          {issueTypeIcons[e.issue_type]}
                          <Typography variant='body2' sx={{color: '#000'}}>
                            {e.issue_type}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{formErrors.issueType || ''}</FormHelperText>
              </FormControl>
            </Grid>
            {/* )} */}
              <Grid container direction='row'>
                <Grid
                  sx={{ pt: '5px' }}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12,
                  }}
                >
                {Number(taskData?.issueType || taskData?.issue_type) === 5  && (
                  <Grid container spacing={3}>
                    <FormControlLabel
                      label="Story Based Sub-Task"
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={handleSubTaskCheckBox}
                        />
                      }
                    />
                  </Grid>
                )}
                {(Number(taskData?.issueType || taskData?.issue_type) === 4 || Number(taskData?.issueType || taskData?.issue_type) === 1) && (
                  <FormControlLabel
                      label="Based On Story"
                      control={
                        <Checkbox
                          checked={isStoryBasedChecked}
                          onChange={handlestoryBasedTaskCheckBox}
                        />
                      }
                    />
                )}
                {BackLogTasks !== true &&
                  (Number(taskData?.issueType || taskData?.issue_type) === 1 || Number(taskData?.issueType || taskData?.issue_type) === 3 || Number(taskData?.issueType || taskData?.issue_type ) === 4 ) && (
                  <FormControlLabel
                    label="Dont want to Create Active Sprint Task"
                    control={
                      <Checkbox
                        checked={dontCreateActiveSprint}
                        onChange={handleDontCreateActiveSprintCheckBox}
                      />
                    }
                  />
                )}
              </Grid>
              </Grid>
            <Grid container direction='row'>
              <Grid
                sx={{pt: '5px'}}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12,
                }}
              >
                <Grid container spacing={3} pb={3}>
                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                    pb={3}
                  >
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='startDate'
                        label='Start Date'
                        value={toMomentOrNull(taskData.startDate)}
                        format='DD/MM/YYYY'
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputLabelProps: {
                              sx: labelStyles,
                            },
                          },
                        }}
                        style={{flex: 1, marginRight: 16}}
                        disabled={taskData.status === 6}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='dueDate'
                        label='Due Date'
                        value={toMomentOrNull(taskData.dueDate)}
                        format='DD/MM/YYYY'
                        onChange={(e) => {
                          const formattedDate = e
                            ? moment(e._d).format('YYYY-MM-DD')
                            : null;
                          setStateHandler('dueDate', formattedDate);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputLabelProps: {
                              sx: labelStyles,
                            },
                          },
                        }}
                        style={{flex: 1, marginRight: 16}}
                        disabled={taskData.status === 6}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Repeat Task</InputLabel>
                      <Select
                        name='repeat'
                        label='Repeat Task'
                        value={taskData.repeat}
                        disabled={taskData.status === 6}
                        onChange={handleChange}
                        // sx={inputStyles}
                      >
                        {taskRepeat?.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.repeat_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                    pb={3}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Priority</InputLabel>
                      <Select
                        name='priority'
                        label='Priority'
                        value={taskData.priority}
                        disabled={taskData.status === 6}
                        onChange={handleChange}
                      >
                        {taskPriority &&
                          taskPriority.map((e) => (
                            <MenuItem key={e.id} value={e.id}>
                              <Box display='flex' alignItems='center' gap={1}>
                                {e.id === 1 && (
                                  <KeyboardArrowDownIcon
                                    sx={{color: '#2cadc4'}}
                                  /> /* lowest */
                                )}
                                {e.id === 2 && (
                                  <DragHandleIcon
                                    sx={{color: '#de893a'}}
                                  /> /* medium */
                                )}
                                {e.id === 3 && (
                                  <KeyboardArrowUpIcon
                                    sx={{color: '#bf2e2e'}}
                                  /> /* high*/
                                )}
                                {e.id === 4 && (
                                  <KeyboardDoubleArrowUpIcon
                                    sx={{color: '#bf2e2e'}}
                                  /> /* Highest */
                                )}
                                {e.priority_name}
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Status</InputLabel>
                      <Select
                        name='status'
                        label='Status'
                        value={taskData.status}
                        onChange={handleChange}
                        required
                      >
                        {sortedTaskStatus?.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.status_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{}}>
                      <TextField
                        name='orginalEstimation'
                        label='Original Estimation'
                        multiline
                        rows={1}
                        value={taskData.orginalEstimation}
                        onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        placeholder='Enter estimation in Weeks,Days,Hrs,Mins  --2w,2d,2h,2m'
                        error={
                          formErrors.orginalEstimation === null ? false : true
                        }
                        helperText={
                          formErrors.orginalEstimation === null
                            ? ''
                            : formErrors.orginalEstimation
                        }
                      />
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 6,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{}}>
                      <TextField
                        multiline
                        rows={1}
                        label='Reporter'
                        value={adminName[0]?.username?.split('.')?.[1] || ''}
                        InputLabelProps={{shrink: true, sx: labelStyles}}
                        // onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                      />
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 6,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth variant='outlined'>
                      <CommonUserAutoCompleteForSingleUser
                        searchVal={searchVal}
                        setSearchValEmployeeFilter={(value) => {
                          setSearchValEmployeeFilter(value.trimStart());
                        }}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value || taskDataForEdit}
                        setValue={setValue}
                        type={staffsList}
                        searchType={searchType}
                        labelName='Assignee'
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        disabled={taskData.status === 6}
                      />
                    </FormControl>
                  </Grid>
                  {/* {taskData?.issueType == 1 && taskData?.issueType == 3 && taskData?.issueType == 4 && ( */}
                  {[1, 3, 4].includes(
                    Number(taskData?.issueType || taskData?.issue_type),
                  ) && (

                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={labelStyles}> Parent</InputLabel>
                          <Select
                            name='epic_id'
                            label='Parent'
                            value={taskData.epic_id || ''}
                            onChange={handleChange}
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <Typography
                                    variant='body2'
                                    sx={{color: '#aaa'}}
                                  />
                                );
                              }
                              return (
                                epicNameById.get(String(selected)) || selected
                              );
                            }}
                          >
                            {isEpicLoading ? (
                              <MenuItem disabled>Loading epics...</MenuItem>
                            ) : normalizedEpicOptions.length ? (
                              normalizedEpicOptions.map((epic) => (
                                <MenuItem key={epic.key} value={epic.epicId}>
                                  {epic.epicName}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No epics found</MenuItem>
                            )}
                           <MenuItem
                            onClick={() => setIsEpicDialogOpen(true)}
                            disabled={taskData.status === 6}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                            Add Epic
                          </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  {taskData?.issueType == 2 && (
                    <Grid
                      size={{
                        lg: 4,
                        md: 6,
                        sm: 6,
                        xs: 12,
                      }}
                    >
                      <FormControl fullWidth>
                        <TextField
                          name='epic_name'
                          label='Epic Name'
                          value={taskData.epic_name}
                          onChange={handleChange}
                          sx={labelStyles}
                        />
                      </FormControl>
                    </Grid>
                  )}

                  {BackLogTasks !== true &&
                    taskByStatus?.[2]?.length &&
                    (taskByStatus[2][0].boardType !== 2 && Number(taskData?.issueType || taskData?.issue_type) !== 5) &&
                    (Number(taskData?.issueType || taskData?.issue_type) === 2 || dontCreateActiveSprint) && (
                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={labelStyles}>Sprint</InputLabel>
                          <Select
                            name='sprint_id'
                            label='Sprint'
                            value={taskData.sprint_id || ''}
                            disabled={taskData.status === 6}
                            onChange={handleChange}
                            // sx={inputStyles}   //testing
                          >
                            {sprintOptions.length > 0 ? (
                              sprintOptions.map((sprint) => (
                                <MenuItem key={sprint.id} value={sprint.id}>
                                  {sprint.name}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled value=''>
                                No In-active sprint found
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  {taskByStatus?.[2]?.length  &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 2 &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 3 &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 5 && isStoryBasedChecked && (
                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <Autocomplete
                          fullWidth
                          options={storyOptionsWithSelection}
                          value={selectedStoryOption}
                          loading={isStoryLoading}
                          disabled={taskData.status === 6 || !currentProjectId}
                          filterOptions={(options) => options}
                          isOptionEqualToValue={(option, value) =>
                            String(option?.taskId) === String(value?.taskId)
                          }
                          getOptionLabel={(option) =>
                            option?.label ||
                            [option?.task_id, option?.name].filter(Boolean).join(' - ')
                          }
                          onChange={handleStoryChange}
                          onInputChange={handleStorySearchChange}
                          ListboxProps={{
                            onScroll: handleStoryListScroll,
                          }}
                          noOptionsText={
                            currentProjectId
                              ? 'No stories found'
                              : 'Select a project first'
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Story'
                              placeholder='Search by task id or name'
                              InputLabelProps={{
                                sx: labelStyles,
                              }}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isStoryLoading ? (
                                      <CircularProgress color='inherit' size={18} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component='li' {...props} key={option?.taskId}>
                              {option?.label}
                            </Box>
                          )}
                        />
                      </Grid>
                    )}
                {(taskDataForEdit?.id || taskDataForEdit?.taskId) &&
                  [1, 3, 4].includes(Number(taskData?.issueType || taskData?.issue_type)) &&  
                       (
                      <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12,
                      }}
                    >
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<AddIcon sx={{ size: 30}} />}
                        onClick={() => {
                          setSubTaskName('');
                          setopened(true);
                        }}
                        disabled={taskData.status === 6}
                        sx={{
                          color: '#1d1c1c',
                          borderColor: '#c7bebe',
                          fontWeight: 500,
                          '&:hover': {
                            borderColor: '#1a1818',
                          },
                        }}
                      >
                        Sub Task
                      </Button>
                    </Grid>)}
                    <Dialog
                      open={opened}
                      onClose={() => {
                        setSubTaskName('');
                        setopened(false);
                      }}
                      PaperProps={{sx: {width: 900, }}}
                    >
                    <DialogTitle   sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              Sub Task 
                              <IconButton onClick={() => {
                                setSubTaskName('');
                                setopened(false);
                              }}>
                                 <CloseIcon />
                              </IconButton>
                    </DialogTitle>
                      <DialogContent
                      >
                        <Grid container spacing={2} >
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12,
                            }}
                          >
                            <TextField
                              name='taskName'
                              label='Task Name'
                              fullWidth
                              value={subTaskName}
                              onChange={(e) => setSubTaskName(e.target.value)}
                              margin='normal'
                              required
                              error={formErrors.taskName === null ? false : true}
                              helperText={
                                formErrors.taskName === null
                                  ? ''
                                  : formErrors.taskName
                              }
                              disabled={taskData.status === 6}

                            />
                          </Grid>

                          <Grid
                            size={{
                              lg: 4,
                              md: 6,
                              sm: 6,
                              xs: 12,
                            }}
                          >
                            <FormControl fullWidth>
                              <InputLabel sx={labelStyles}>Priority</InputLabel>
                              <Select
                                name='priority'
                                label='Priority'
                                value={taskData.priority}
                                disabled={taskData.status === 6}
                                onChange={handleChange}
                              >
                                {taskPriority &&
                                  taskPriority.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>
                                      <Box display='flex' alignItems='center' gap={1}>
                                        {e.id === 1 && (
                                          <KeyboardArrowDownIcon
                                            sx={{color: '#2cadc4'}}
                                          />
                                        )}
                                        {e.id === 2 && (
                                          <DragHandleIcon sx={{color: '#de893a'}} />
                                        )}
                                        {e.id === 3 && (
                                          <KeyboardArrowUpIcon sx={{color: '#bf2e2e'}} />
                                        )}
                                        {e.id === 4 && (
                                          <KeyboardDoubleArrowUpIcon
                                            sx={{color: '#bf2e2e'}}
                                          />
                                        )}
                                        {e.priority_name}
                                      </Box>
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid
                            size={{
                              lg: 4,
                              md: 6,
                              sm: 6,
                              xs: 12,
                            }}
                          >
                            <FormControl fullWidth>
                              <InputLabel sx={labelStyles}>Status</InputLabel>
                              <Select
                                name='status'
                                label='Status'
                                value={taskData.status}
                                onChange={handleChange}
                                required
                              >
                                {sortedTaskStatus?.map((e) => (
                                  <MenuItem key={e.id} value={e.id}>
                                    {e.status_name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid
                            size={{
                              lg: 4,
                              md: 6,
                              sm: 6,
                              xs: 12,
                            }}
                          >
                            <FormControl fullWidth sx={{}}>
                              <TextField
                                name='orginalEstimation'
                                label='Original Estimation'
                                multiline
                                rows={1}
                                value={taskData.orginalEstimation}
                                onChange={handleChange}
                                variant='outlined'
                                fullWidth
                                disabled={taskData.status === 6}
                                InputLabelProps={{
                                  sx: labelStyles,
                                }}
                                placeholder='Enter estimation in Weeks,Days,Hrs,Mins  --2w,2d,2h,2m'
                                error={
                                  formErrors.orginalEstimation === null
                                    ? false
                                    : true
                                }
                                helperText={
                                  formErrors.orginalEstimation === null
                                    ? ''
                                    : formErrors.orginalEstimation
                                }
                              />
                            </FormControl>
                          </Grid>

                          <Grid
                            size={{
                              lg: 6,
                              md: 12,
                              sm: 12,
                              xs: 12,
                            }}
                          >
                            <FormControl fullWidth sx={{}}>
                              <TextField
                                multiline
                                rows={1}
                                label='Reporter'
                                value={adminName[0]?.username?.split('.')?.[1] || ''}
                                InputLabelProps={{shrink: true, sx: labelStyles}}
                                variant='outlined'
                                fullWidth
                                disabled={taskData.status === 6}
                              />
                            </FormControl>
                          </Grid>

                          <Grid
                            size={{
                              lg: 6,
                              md: 12,
                              sm: 12,
                              xs: 12,
                            }}
                          >
                            <FormControl
                              fullWidth
                              variant='outlined'
                              sx={{
                                '& .MuiOutlinedInput-root': {height: 40},
                              }}
                            >
                              <CommonUserAutoCompleteForSingleUser
                                searchVal={searchVal}
                                setSearchValEmployeeFilter={(value) => {
                                  setSearchValEmployeeFilter(value.trimStart());
                                }}
                                requestSearch={requestSearchEmployeeFilter}
                                value={value || taskDataForEdit}
                                setValue={setValue}
                                type={staffsList}
                                searchType={searchType}
                                labelName='Assignee'
                                InputLabelProps={{
                                  sx: labelStyles,
                                }}
                                disabled={taskData.status === 6}
                              />
                            </FormControl>
                          </Grid>
                          <Grid
                                size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12,
                                }}
                          >

                            <AttachmentField
                              previews={previews}
                              setPreviews={setPreviews}
                              status={taskData.status}
                              handleImageDelete={handleImageDelete}
                            />
                          </Grid>
                          <Grid  
                            size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12,
                                    }}
                            sx={{ display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center" }} >      
                                <Button
                                  onClick={() => {
                                    setSubTaskName('');
                                    setopened(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant='contained'
                                  onClick={handleSubTaskSave}
                                 >
                                  Submit
                                </Button>
                              </Grid>
                        </Grid>
                      </DialogContent>

                    </Dialog>
                    {(taskDataForEdit?.id || taskDataForEdit?.taskId) &&
                    Number(taskData?.issueType || taskData?.issue_type) === 3 && (
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12,
                      }}
                    >
                      <Button
                        variant='outlined'
                        size='small'
                         onClick={() => {
                           setStoryData('');
                           setShowEditPopup(true);
                         }}
                        disabled={taskData.status === 6}
                        sx={{
                          color: '#1d1c1c',
                          borderColor: '#c7bebe',
                          fontWeight: 500,
                          '&:hover': {
                            borderColor: '#1a1818',
                          },
                        }}
                      >
                      Task
                      </Button></Grid>)}              
                            <Dialog
                      open={showEditPopup}
                      onClose={() => {
                        setStoryData('');
                        setShowEditPopup(false);
                      }}
                      PaperProps={{sx: {width:'900px',} }}
                    >
                    <DialogTitle   sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              New Task 
                              <IconButton onClick={() => {
                                setShowEditPopup(false);
                                setStoryData('');
                              }}>
                                 <CloseIcon />
                              </IconButton>
                    </DialogTitle>
                      <DialogContent
                      >
                        <Grid container spacing={2} >
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12,
                            }}
                          >
                            <TextField
                              name='taskName'
                              label='Task Name'
                              fullWidth
                              value={storyData}
                              onChange={(e) =>setStoryData(e.target.value)}
                              margin='normal'
                              required
                              error={formErrors.taskName === null ? false : true}
                              helperText={
                                formErrors.taskName === null
                                  ? ''
                                  : formErrors.taskName
                              }
                              disabled={taskData.status === 6}

                            />
                          </Grid>
                                      <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12,
              }}
            >
              <FormControl
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '36px',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                  },
                }}
              >
                <InputLabel
                  required
                  sx={{
                    fontSize: '0.85rem',
                    color: '#000 !important',
                    fontWeight: 'normal !important',
                    '&.Mui-focused': {
                      color: '#000 !important',
                    },
                  }}
                >
                  Issue Type
                </InputLabel>
                <Select
                  name='issueType'
                  label='Issue Type'
                  size='small'
                  value={
                    selectedIssueTypeValue !== null &&
                    selectedIssueTypeValue !== undefined &&
                    selectedIssueTypeValue !== ''
                      ? String(selectedIssueTypeValue)
                      : ''
                  }
                  onChange={handleChange}
                  displayEmpty
                  sx={{
                    fontSize: '0.85rem',
                    color: '#000',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      paddingY: '5px',
                      color: '#000',
                    },
                    '& fieldset': {
                      borderColor: '#d3d3d3',
                    },
                    '&:hover fieldset': {
                      borderColor: '#aaa',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 250,
                        borderRadius: 2,
                        boxShadow: 3,
                        backgroundColor: '#fff',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.85rem',
                          color: '#000',
                          py: 1,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#e0e0e0 !important',
                            fontWeight: 500,
                          },
                        },
                      },
                    },
                  }}
                  renderValue={(selected) => {
                    const selectedItem = taskIssueType?.find(
                      (item) => String(item.id) === String(selected),
                    );
                    const fallbackLabel =
                      issueTypeLabelById?.[Number(selected)] ||
                      `Issue Type ${selected}`;

                    return selectedItem ? (
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {issueTypeIcons[selectedItem.issue_type]}
                        <Typography variant='body2' sx={{color: '#000'}}>
                          {selectedItem.issue_type}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant='body2'
                        sx={{color: selected ? '#000' : '#aaa'}}
                      >
                        {selected ? fallbackLabel : ''}
                      </Typography>
                    );
                  }}
                >
                  {selectedIssueTypeValue &&
                !taskIssueType?.some(
                  (item) => String(item.id) === String(selectedIssueTypeValue),
                ) && (
                  <MenuItem value={String(selectedIssueTypeValue)}>
                    <Typography variant="body2" sx={{ color: '#000' }}>
                      {issueTypeLabelById?.[Number(selectedIssueTypeValue)] ||
                        `Issue Type ${selectedIssueTypeValue}`}
                    </Typography>
                  </MenuItem>
                )}
                  {taskIssueType
                    ?.filter((e) => e.id !== 2) // 
                    .map((e) => (
                      <MenuItem key={e.id} value={String(e.id)}>
                        <Box
                          sx={{display: 'flex', alignItems: 'center', gap: 1}}
                        >
                          {issueTypeIcons[e.issue_type]}
                          <Typography variant='body2' sx={{color: '#000'}}>
                            {e.issue_type}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            {/* )} */}

            <Grid container direction='row'>
              <Grid
                sx={{pt: '5px'}}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12,
                }}
              >
                <Grid container spacing={3}>
                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='startDate'
                        label='Start Date'
                        value={toMomentOrNull(taskData.startDate)}
                        format='DD/MM/YYYY'
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputLabelProps: {
                              sx: labelStyles,
                            },
                          },
                        }}
                        style={{flex: 1, marginRight: 16}}
                        disabled={taskData.status === 6}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='dueDate'
                        label='Due Date'
                        value={toMomentOrNull(taskData.dueDate)}
                        format='DD/MM/YYYY'
                        onChange={(e) => {
                          const formattedDate = e
                            ? moment(e._d).format('YYYY-MM-DD')
                            : null;
                          setStateHandler('dueDate', formattedDate);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            InputLabelProps: {
                              sx: labelStyles,
                            },
                          },
                        }}
                        style={{flex: 1, marginRight: 16}}
                        disabled={taskData.status === 6}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Repeat Task</InputLabel>
                      <Select
                        name='repeat'
                        label='Repeat Task'
                        value={taskData.repeat}
                        disabled={taskData.status === 6}
                        onChange={handleChange}
                        // sx={inputStyles}
                      >
                        {taskRepeat?.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.repeat_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Priority</InputLabel>
                      <Select
                        name='priority'
                        label='Priority'
                        value={taskData.priority}
                        disabled={taskData.status === 6}
                        onChange={handleChange}
                      >
                        {taskPriority &&
                          taskPriority.map((e) => (
                            <MenuItem key={e.id} value={e.id}>
                              <Box display='flex' alignItems='center' gap={1}>
                                {e.id === 1 && (
                                  <KeyboardArrowDownIcon
                                    sx={{color: '#2cadc4'}}
                                  /> /* lowest */
                                )}
                                {e.id === 2 && (
                                  <DragHandleIcon
                                    sx={{color: '#de893a'}}
                                  /> /* medium */
                                )}
                                {e.id === 3 && (
                                  <KeyboardArrowUpIcon
                                    sx={{color: '#bf2e2e'}}
                                  /> /* high*/
                                )}
                                {e.id === 4 && (
                                  <KeyboardDoubleArrowUpIcon
                                    sx={{color: '#bf2e2e'}}
                                  /> /* Highest */
                                )}
                                {e.priority_name}
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={labelStyles}>Status</InputLabel>
                      <Select
                        name='status'
                        label='Status'
                        value={taskData.status}
                        onChange={handleChange}
                        required
                      >
                        {sortedTaskStatus?.map((e) => (
                          <MenuItem key={e.id} value={e.id}>
                            {e.status_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{}}>
                      <TextField
                        name='orginalEstimation'
                        label='Original Estimation'
                        multiline
                        rows={1}
                        value={taskData.orginalEstimation}
                        onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        placeholder='Enter estimation in Weeks,Days,Hrs,Mins  --2w,2d,2h,2m'
                        error={
                          formErrors.orginalEstimation === null ? false : true
                        }
                        helperText={
                          formErrors.orginalEstimation === null
                            ? ''
                            : formErrors.orginalEstimation
                        }
                      />
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 6,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{}}>
                      <TextField
                        multiline
                        rows={1}
                        label='Reporter'
                        value={adminName[0]?.username?.split('.')?.[1] || ''}
                        InputLabelProps={{shrink: true, sx: labelStyles}}
                        // onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                      />
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      lg: 6,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth variant='outlined'>
                      <CommonUserAutoCompleteForSingleUser
                        searchVal={searchVal}
                        setSearchValEmployeeFilter={(value) => {
                          setSearchValEmployeeFilter(value.trimStart());
                        }}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value || taskDataForEdit}
                        setValue={setValue}
                        type={staffsList}
                        searchType={searchType}
                        labelName='Assignee'
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        disabled={taskData.status === 6}
                      />
                    </FormControl>
                  </Grid>
                  {/* {taskData?.issueType == 1 && taskData?.issueType == 3 && taskData?.issueType == 4 && ( */}
                  {[1, 3, 4].includes(
                    Number(taskData?.issueType || taskData?.issue_type),
                  ) && (

                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={labelStyles}> Parent</InputLabel>
                          <Select
                            name='epic_id'
                            label='Parent'
                            value={taskData.epic_id || ''}
                            onChange={handleChange}
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <Typography
                                    variant='body2'
                                    sx={{color: '#aaa'}}
                                  />
                                );
                              }
                              return (
                                epicNameById.get(String(selected)) || selected
                              );
                            }}
                          >
                            {isEpicLoading ? (
                              <MenuItem disabled>Loading epics...</MenuItem>
                            ) : normalizedEpicOptions.length ? (
                              normalizedEpicOptions.map((epic) => (
                                <MenuItem key={epic.key} value={epic.epicId}>
                                  {epic.epicName}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No epics found</MenuItem>
                            )}
                           <MenuItem
                            onClick={() => setIsEpicDialogOpen(true)}
                            disabled={taskData.status === 6}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                            Add Epic
                          </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  {taskData?.issueType == 2 && (
                    <Grid
                      size={{
                        lg: 4,
                        md: 6,
                        sm: 6,
                        xs: 12,
                      }}
                    >
                      <FormControl fullWidth>
                        <TextField
                          name='epic_name'
                          label='Epic Name'
                          value={taskData.epic_name}
                          onChange={handleChange}
                          sx={labelStyles}
                        />
                      </FormControl>
                    </Grid>
                  )}

                  {BackLogTasks !== true &&
                    taskByStatus?.[2]?.length &&
                    (taskByStatus[2][0].boardType !== 2 && Number(taskData?.issueType || taskData?.issue_type) !== 5) &&
                    (Number(taskData?.issueType || taskData?.issue_type) === 2 || dontCreateActiveSprint) && (
                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel sx={labelStyles}>Sprint</InputLabel>
                          <Select
                            name='sprint_id'
                            label='Sprint'
                            value={taskData.sprint_id || ''}
                            disabled={taskData.status === 6}
                            onChange={handleChange}
                            // sx={inputStyles}   //testing
                          >
                            {sprintOptions.length > 0 ? (
                              sprintOptions.map((sprint) => (
                                <MenuItem key={sprint.id} value={sprint.id}>
                                  {sprint.name}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled value=''>
                                No active sprint found
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  {taskByStatus?.[2]?.length &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 2 &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 3 &&
                    Number(taskData?.issueType || taskData?.issue_type) !== 5 && isStoryBasedChecked && (
                      <Grid
                        size={{
                          lg: 4,
                          md: 6,
                          sm: 6,
                          xs: 12,
                        }}
                      >
                        <Autocomplete
                          fullWidth
                          options={storyOptionsWithSelection}
                          value={selectedStoryOption}
                          loading={isStoryLoading}
                          disabled={taskData.status === 6 || !currentProjectId}
                          filterOptions={(options) => options}
                          isOptionEqualToValue={(option, value) =>
                            String(option?.taskId) === String(value?.taskId)
                          }
                          getOptionLabel={(option) =>
                            option?.label ||
                            [option?.task_id, option?.name].filter(Boolean).join(' - ')
                          }
                          onChange={handleStoryChange}
                          onInputChange={handleStorySearchChange}
                          ListboxProps={{
                            onScroll: handleStoryListScroll,
                          }}
                          noOptionsText={
                            currentProjectId
                              ? 'No stories found'
                              : 'Select a project first'
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Story'
                              placeholder='Search by task id or name'
                              InputLabelProps={{
                                sx: labelStyles,
                              }}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {isStoryLoading ? (
                                      <CircularProgress color='inherit' size={18} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component='li' {...props} key={option?.taskId}>
                              {option?.label}
                            </Box>
                          )}
                        />
                      </Grid>
                    )}
             

                                      
                  { Number(taskData?.issueType || taskData?.issue_type) === 5 && (
                    <>
                      {isChecked ? (
                        <Grid
                          size={{
                            lg: 4,
                            md: 6,
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <Autocomplete
                            fullWidth
                            options={storyOptionsWithSelection}
                            value={selectedStoryOption || null}
                            loading={isStoryLoading}
                            disabled={taskData.status === 6 || !currentProjectId}
                            filterOptions={(options) => options}
                            isOptionEqualToValue={(option, value) =>
                              String(option?.taskId) === String(value?.taskId)
                            }
                            getOptionLabel={(option) =>
                              option?.label ||
                              [option?.taskId, option?.name].filter(Boolean).join(' - ')
                            }
                            onChange={handleSubTaskChange}
                            onInputChange={handleStorySearchChange}
                            ListboxProps={{
                              onScroll: handleStoryListScroll,
                            }}
                            noOptionsText={
                              currentProjectId
                                ? 'No stories found'
                                : 'Select a project first'
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Story"
                                placeholder="Search by task id or name"
                                error={Boolean(formErrors.selectedStoryOption)}
                                helperText={formErrors.selectedStoryOption || ''} 
                                InputLabelProps={{
                                  sx: labelStyles,
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {isStoryLoading ? (
                                        <CircularProgress color="inherit" size={18} />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} key={option?.taskId}>
                                {option?.label}
                              </Box>
                            )}
                          />
                        </Grid>
                      ) : (
                        <Grid
                          size={{
                            lg: 4,
                            md: 6,
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <FormControl fullWidth>
                            <TextField
                              name='task_key'
                              label='Task Key'
                              placeholder='Enter full task key (e.g: AB-12365)'
                              value={taskKeySearch}
                              onChange={handleTaskKeyChange}
                              helperText={
                                formErrors.taskKeySearch ||
                                taskKeyError ||
                                parentTaskNameForSubTask ||
                                (taskData.sub_parent_id
                                  ? `Linked Task ID: ${taskData.sub_parent_id}`
                                  : undefined)
                              }
                              error={Boolean(formErrors.taskKeySearch || taskKeyError)}
                              sx={labelStyles}
                              disabled={taskData.status === 6 || !currentProjectId}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>

               
            
            <Box sx={{mt:'10px'}}>                    


                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{labelStyles}}>
                      <TextField
                        name='description'
                        label='Description'
                        multiline
                        rows={2}
                        value={taskData.description}
                        onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        placeholder='Enter description here...'
                      />
                    </FormControl>
                  </Grid>
                  {/* child data showing */}
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    {/* <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} upload={formErrors.upload} amount= {100} /> */}

                    <AttachmentField
                      previews={previews}
                      setPreviews={setPreviews}
                      status={taskData.status}
                      handleImageDelete={handleImageDelete}
                    />
                  </Grid>
</Box>
                  {taskData?.asignee == storage?.employee_id && (
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12,
                      }}
                    >
                      <FormControl fullWidth sx={{}}>
                        <TextField
                          name='remarks'
                          label='Remarks'
                          multiline
                          rows={1}
                          value={taskData.remarks}
                          onChange={handleChange}
                          variant='outlined'
                          fullWidth
                          disabled={taskData.status === 6}
                          placeholder='Enter remarks here...'
                        />
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>     
            <Box sx={{mt:'10px'}}>                    
                          <Grid  
                            size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12,
                                    }}
                            sx={{ display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center" }} >      
                                <Button
                                  onClick={() => {
                                    setShowEditPopup(false);
                                    setStoryData('');
                                  }}
                                > 
                                  Cancel
                                </Button>
                                <Button
                                  variant='contained'
                                  onClick={handleStorySubmit}              
                                >
                                  Submit
                                </Button>
                              </Grid>
                              </Box> 
                      </DialogContent>

                    </Dialog>
              
                    
                    
                  { Number(taskData?.issueType || taskData?.issue_type) === 5 && (
                    <>
                      {/* <FormControlLabel
                        label="Story Based Sub-Task"
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={handleSubTaskCheckBox}
                          />
                        }
                      /> */}

                      {isChecked ? (
                        <Grid
                          size={{
                            lg: 4,
                            md: 6,
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <Autocomplete
                            fullWidth
                            options={storyOptionsWithSelection}
                            value={selectedStoryOption || null}
                            loading={isStoryLoading}
                            disabled={taskData.status === 6 || !currentProjectId}
                            filterOptions={(options) => options}
                            isOptionEqualToValue={(option, value) =>
                              String(option?.taskId) === String(value?.taskId)
                            }
                            getOptionLabel={(option) =>
                              option?.label ||
                              [option?.taskId, option?.name].filter(Boolean).join(' - ')
                            }
                            onChange={handleSubTaskChange}
                            onInputChange={handleStorySearchChange}
                            ListboxProps={{
                              onScroll: handleStoryListScroll,
                            }}
                            noOptionsText={
                              currentProjectId
                                ? 'No stories found'
                                : 'Select a project first'
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Story"
                                placeholder="Search by task id or name"
                                error={Boolean(formErrors.selectedStoryOption)}
                                helperText={formErrors.selectedStoryOption || ''} 
                                InputLabelProps={{
                                  sx: labelStyles,
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {isStoryLoading ? (
                                        <CircularProgress color="inherit" size={18} />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} key={option?.taskId}>
                                {option?.label}
                              </Box>
                            )}
                          />
                        </Grid>
                      ) : (
                        <Grid
                          size={{
                            lg: 4,
                            md: 6,
                            sm: 6,
                            xs: 12,
                          }}
                        >
                          <FormControl fullWidth>
                            <TextField
                              name='task_key'
                              label='Task Key'
                              placeholder='Enter full task key (e.g: AB-12365)'
                              value={taskKeySearch}
                              onChange={handleTaskKeyChange}
                              helperText={
                                formErrors.taskKeySearch ||
                                taskKeyError ||
                                parentTaskNameForSubTask ||
                                (taskData.sub_parent_id
                                  ? `Linked Task ID: ${taskData.sub_parent_id}`
                                  : undefined)
                              }
                              error={Boolean(formErrors.taskKeySearch || taskKeyError)}
                              sx={labelStyles}
                              disabled={taskData.status === 6 || !currentProjectId}
                            />
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  )}
                  
                  {projectData && projectData.project_type === 3 && (
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            name='taskLocation'
                            checked={taskData.taskLocation === 1}
                            onChange={handleTaskLocation}
                            disabled={taskData.status === 6}
                          />
                        }
                        label='Task location'
                      />
                    </Grid>
                  )}

                  {taskData.taskLocation === 1 &&
                    (projectData.project_type === 3 ||
                      projectData.project_type === 4) && (
                      <>
                        <Grid
                          size={{
                            lg: 6,
                            md: 12,
                            sm: 12,
                            xs: 12,
                          }}
                        >
                          <TextField
                            name='task_latitude'
                            label='Latitude'
                            type='number'
                            value={taskData.task_latitude}
                            onChange={handleTaskLocation}
                            fullWidth
                            required
                            onWheel={(e) => e.target.blur()}
                            error={
                              formErrors.task_latitude === null ? false : true
                            }
                            helperText={
                              formErrors.task_latitude === null
                                ? ''
                                : formErrors.task_latitude
                            }
                            disabled={taskData.status === 6}
                            InputLabelProps={{shrink: true}}
                          />
                        </Grid>
                        <Grid
                          size={{
                            lg: 6,
                            md: 12,
                            sm: 12,
                            xs: 12,
                          }}
                        >
                          <TextField
                            name='task_longitude'
                            label='Longitude'
                            type='number'
                            value={taskData.task_longitude}
                            onChange={handleTaskLocation}
                            fullWidth
                            required
                            onWheel={(e) => e.target.blur()}
                            error={
                              formErrors.task_longitude === null ? false : true
                            }
                            helperText={
                              formErrors.task_longitude === null
                                ? ''
                                : formErrors.task_longitude
                            }
                            disabled={taskData.status === 6}
                            InputLabelProps={{shrink: true}}
                          />
                        </Grid>
                      </>
                    )}

                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <Dialog
                      open={trackOpen}
                      onClose={() => setTrackOpen(false)}
                      fullWidth
                      maxWidth='xs'
                    >
                      <DialogTitle disabled={!isAdmin || taskData.status === 6}>
                        Time Tracking
                      </DialogTitle>
                      <Divider />
                      <DialogContent>
                        <LinearProgress
                          variant='determinate'
                          value={progress}
                          sx={{
                            boxShadow: isMouseOver
                              ? '0 0 10px rgba(0, 0, 0, 0.5)'
                              : 'none',
                            transition: 'box-shadow 0.3s ease',
                            height: '6px',
                            borderRadius: '10px',
                          }}
                          onMouseOver={handleMouseOver}
                          onMouseLeave={handleMouseLeave}
                        />
                        <br />
                        <TextField
                          label='Time spent'
                          name='timeSpent'
                          style={{maxWidth: '150px', padding: '5px'}}
                          value={timeSpent}
                          onChange={handleChange}
                          error={!isValidFormat && flag}
                          helperText={!isValidFormat && flag}
                          disabled={taskData.status === 6}
                        />
                        <TextField
                          label='Time remaining!'
                          style={{maxWidth: '150px', padding: '5px'}}
                          // value={
                          //   // (() => {
                          //   //   if (tasklogsDetails[0]?.total_work_hours_for_task) {
                          //   //     const orginalEstimation = parseFloat(taskData.orginalEstimation);
                          //   //     const timeSpent = parseFloat(taskData.timeSpent);
                          //   //     // return `${orginalEstimation - tasklogsDetails[0]?.total_work_hours_for_task}h`
                          //   //     return tasklogsDetails[0]?.total_work_hours_for_task <= parseFloat(taskData.orginalEstimation) ? `${parseFloat(taskData.orginalEstimation) - tasklogsDetails[0]?.total_work_hours_for_task}h` : `0h`
                          //   //     // return `${isNaN(orginalEstimation - tasklogsDetails[0]?.total_work_hours_for_task) ? '-' : orginalEstimation - tasklogsDetails[0]?.total_work_hours_for_task + 'h'}`
                          //   //   }
                          //   //   return taskData.orginalEstimation
                          //   // })()
                          // }
                          value={remainingTime}
                          disabled
                        />
                        <br />
                        <br />
                        Use the format: 2w 4d 6h 45m
                        <br />
                        * w = weeks
                        <br />
                        * d = days
                        <br />
                        * h = hours
                        <br />* m = minutes
                        <br />
                        <Typography sx={{fontSize: '16px', mb: 1}}>
                          Date started *
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                              <DatePicker
                                value={toMomentOrNull(workLogData.startedDate)}
                                onChange={(value) =>
                                  handleWorkLogInput('startedDate', value)
                                }
                                name='startedDate'
                                renderInput={(params) => (
                                  <TextField {...params} fullWidth />
                                )}
                              />
                            </LocalizationProvider>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              type='time'
                              name='startedTime'
                              value={workLogData.startedTime}
                              onChange={handleWorkLogInput}
                              InputLabelProps={{shrink: true}}
                              inputProps={{step: 60}}
                              />
                          </Grid>
                        </Grid>
                      </DialogContent>
                      <Divider />
                      <DialogActions sx={{pr: '24px'}}>
                        <Button
                          onClick={() => setTrackOpen(false)}
                          color='primary'
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            setTrackOpen(false);
                            handleSubmitTimeSpent();
                          }}
                          color='primary'
                          disabled={!isValidFormat}
                        >
                          Submit
                        </Button>
                      </DialogActions>
                    </Dialog>
                    {taskDataForEdit !== null && (
                      <Grid container display='flex' flexDirection='row'>
                        <Grid
                          size={{
                            lg: 12,
                            sm: 12,
                            md: 12,
                            xs: 12,
                          }}
                        >
                          {/* <Box
                            sx={{bgcolor: 'background.paper', width: '100%'}}
                          >
                            <span
                              style={{fontSize: '15px', fontWeight: 'bold'}}
                            >
                              Time Tracking{' '}
                            </span>
                            <LinearProgress
                              variant='determinate'
                              value={progress}
                              onClick={() => {
                                if (!isAdmin) {
                                  if (projectData?.time_tracking === 0) {
                                    setTrackOpen(true);
                                  } else {
                                    setTrackOpen(false);
                                  }
                                }
                              }}
                              sx={{
                                boxShadow: isMouseOver
                                  ? '0 0 10px rgba(0, 0, 0, 0.5)'
                                  : 'none',
                                transition: 'box-shadow 0.3s ease',
                                height: '6px',
                                borderRadius: '10px',
                                backgroundColor:
                                  convertToMinutes(loggedtime) > convertToMinutes(taskData?.orginalEstimation) ? '#D12122' : '#248DCE',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor:
                                    convertToMinutes(loggedtime) > convertToMinutes(taskData?.orginalEstimation) ? '#D12122': '#248DCE',},
                              }}
                              onMouseOver={handleMouseOver}
                              onMouseLeave={handleMouseLeave}
                              // disabled={projectData?.time_tracking === 1}
                            />
                          </Box>  */}
                          <Box
                            sx={{width: '100%'}}
                            onClick={() => {
                              if (!isAdmin) {
                                if (projectData?.time_tracking === 0) {
                                  setTrackOpen(true);
                                } else {
                                  setTrackOpen(false);
                                }
                              }
                            }}
                          >
                            <span
                              style={{fontSize: '15px', fontWeight: 'bold'}}
                            >
                              Time Tracking
                            </span>

                            {/* Outer wrapper */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '6px',
                                width: '100%',
                                backgroundColor: '#858d92',
                                borderRadius: '10px 0 0 10px',
                                transition: 'width 0.3s ease',
                              }}
                            >
                              {/* Estimated bar (always max 100%) */}
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${basePercentage}%`,
                                  backgroundColor: '#248DCE',
                                  borderRadius: '10px 0 0 10px',
                                  transition: 'width 0.3s ease',
                                }}
                              />

                              {/* Overflow bar (extends to the right) */}
                              {overflowPercentage > 0 && (
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${overflowPercentage}%`,
                                    backgroundColor: '#D12122',
                                    borderRadius: '0 10px 10px 0',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              )}

                              {/* Remaining space (when < 100%) */}
                              {basePercentage < 100 && (
                                <Box
                                  sx={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundColor: '#E0E0E0',
                                    borderRadius: '0 10px 10px 0',
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                    {taskDataForEdit !== null && (
                      <Grid
                        container
                        size={{
                          lg: 12,
                          sm: 12,
                          md: 12,
                          xs: 12,
                        }}
                      >
                        <Grid
                          style={{display: 'flex', justifyContent: 'start'}}
                          size={{
                            lg: 5,
                            sm: 5,
                            md: 5,
                            xs: 5,
                          }}
                        >
                          <span style={{fontSize: '10px'}}>
                            {tasklogsDetails?.length
                              ? tasklogsDetails[0]?.total_work_hours_format !==
                                  null &&
                                tasklogsDetails[0]?.total_work_hours_format !==
                                  ''
                                ? `${tasklogsDetails[0]?.total_work_hours_format} logged`
                                : 'No time logged'
                              : 'No time logged'}
                          </span>
                        </Grid>
                        {taskData.timeSpent && (
                          <Grid
                            style={{display: 'flex', justifyContent: 'end'}}
                            size={{
                              lg: 5,
                              sm: 5,
                              md: 5,
                              xs: 5,
                            }}
                          >
                            <span style={{fontSize: '10px'}}>
                              {/* {tasklogsDetails.length
                          ? tasklogsDetails[0]?.total_work_hours_format <=
                            parseFloat(taskData.orginalEstimation)
                            ? `${
                                parseFloat(taskData.orginalEstimation) -
                                tasklogsDetails[0]?.total_work_hours_format
                              } Remaining`
                            : `0h Remaining`
                          : `${taskData.orginalEstimation} Remaining`} */}
                              {remainingTime}
                            </span>
                          </Grid>
                        )}
                        {/* {isTimerRunning && <Grid size={{ xs: 5, sm: 5, md: 5, lg: 5 }} style={{ display: 'flex', justifyContent: 'end' }}>
                        <span style={{ fontSize: '10px' }}>{formattedElapsedTime}</span>
                      </Grid>} */}
                      </Grid>
                    )}
                    {taskDataForEdit !== null &&
                      !roleType.includes(storage.role_name) &&
                      projectData.project_type !== 4 &&
                      projectData?.time_tracking === 1 && (
                        <Grid
                          container
                          display='flex'
                          flexDirection='row'
                          sx={{marginTop: '10px'}}
                          size={{
                            lg: 12,
                            sm: 12,
                            md: 12,
                            xs: 12,
                          }}
                        >
                          <Grid
                            size={{
                              lg: 4,
                              md: 4,
                              sm: 4,
                              xs: 4,
                            }}
                          >
                            <Button
                              color='success'
                              variant='contained'
                              onClick={startTimer}
                              fullWidth
                              disabled={isTimerRunning || taskData.status === 6}
                            >
                              Start
                            </Button>
                          </Grid>
                          <Grid
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            size={{
                              lg: 4,
                              md: 4,
                              sm: 4,
                              xs: 4,
                            }}
                          >
                            {taskData.status === 6 ? '' : formattedElapsedTime}
                          </Grid>
                          <Grid
                            size={{
                              lg: 4,
                              md: 4,
                              sm: 4,
                              xs: 4,
                            }}
                          >
                            <Button
                              color='error'
                              variant='contained'
                              onClick={stopTimer}
                              fullWidth
                              disabled={
                                !isTimerRunning || taskData.status === 6
                              }
                            >
                              End
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                  </Grid>

                  {/* story child details */}
                  {taskDataForEdit !== null &&
                    Number(selectedIssueTypeValue) === 3  &&
                    currentProjectId &&
                    (taskData?.id || taskDataForEdit?.id || taskDataForEdit?.taskId) && (
                      <Grid
                        size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12,
                        }}
                      >
                        <ChildDataGrid
                          open={open}
                          id={
                            taskData?.id ||
                            taskDataForEdit?.id ||
                            taskDataForEdit?.taskId
                          }
                          project_id={currentProjectId}
                        />
                      </Grid>
                    )}
                  {taskDataForEdit !== null &&
                    Number(selectedIssueTypeValue) === 1  &&
                    currentProjectId &&
                    (taskData?.id || taskDataForEdit?.id || taskDataForEdit?.taskId) && (
                      <Grid
                        size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12,
                        }}
                      >
                        <ChildDataGrid
                          open={open}
                          id={
                            taskData?.id ||
                            taskDataForEdit?.id ||
                            taskDataForEdit?.taskId
                          }
                          project_id={currentProjectId}
                        />
                      </Grid>
                    )}

                  {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <FormControl fullWidth sx={{}}>
                      <TextField
                        name='orginalEstimation'
                        label='Orginal Estimation'
                        multiline
                        rows={1}
                        value={taskData.orginalEstimation}
                        onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={!isAdmin || taskData.status === 6}
                        placeholder='Enter estimation in Weeks,Days,Hrs,Mins  --2w,2d,2h,2m'
                        error={
                          formErrors.orginalEstimation === null ? false : true
                        }
                        helperText={
                          formErrors.orginalEstimation === null
                            ? ''
                            : formErrors.orginalEstimation
                        }
                      />
                    </FormControl>
                  </Grid> */}

                  {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
                  {/* <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} upload={formErrors.upload} amount= {100} /> */}
                  {/* <AttachmentField
                      previews={previews}
                      setPreviews={setPreviews}
                      status={taskData.status}
                      handleImageDelete={handleImageDelete}
                    /> */}
                  {/* </Grid> */}



                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    <FormControl fullWidth sx={{labelStyles}}>
                      <TextField
                        name='description'
                        label='Description'
                        multiline
                        rows={2}
                        value={taskData.description}
                        onChange={handleChange}
                        variant='outlined'
                        fullWidth
                        disabled={taskData.status === 6}
                        InputLabelProps={{
                          sx: labelStyles,
                        }}
                        placeholder='Enter description here...'
                      />
                    </FormControl>
                  </Grid>
                  {/* child data showing */}
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12,
                    }}
                  >
                    {/* <FilePicker uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} upload={formErrors.upload} amount= {100} /> */}

                    <AttachmentField
                      previews={previews}
                      setPreviews={setPreviews}
                      status={taskData.status}
                      handleImageDelete={handleImageDelete}
                    />
                  </Grid>

                  {taskData?.asignee == storage?.employee_id && (
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12,
                      }}
                    >
                      <FormControl fullWidth sx={{}}>
                        <TextField
                          name='remarks'
                          label='Remarks'
                          multiline
                          rows={1}
                          value={taskData.remarks}
                          onChange={handleChange}
                          variant='outlined'
                          fullWidth
                          disabled={taskData.status === 6}
                          placeholder='Enter remarks here...'
                        />
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {/* {activityEnable && (
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Box
                  mt={2}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '10px',
                    padding: '20px',
                    height:
                      isLgUp === 'lg'
                        ? Array.isArray(previews)
                          ? '700px'
                          : '550px'
                        : Array.isArray(previews)
                        ? '750px'
                        : '600px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    border: '1px solid #ccc',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '15px',
                      display: 'block',
                    }}
                  >
                    Timeline
                  </span>

                  <Timeline>
                    {taskDataForEdit === null ? (
                      ''
                    ) : (
                      <>
                        {taskActivityDetails?.map(
                          (v) =>
                            v.remarks !== 'Admin created this task' && (
                              <TimelineItem key={v.id}>
                                <Box
                                  sx={{
                                    width: '150px',
                                    marginTop: '8px',
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // alignItems: 'flex-end',
                                    // paddingRight: '10px',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      color: 'gray',
                                      fontSize: '10px',
                                      mb: 0.5,
                                      textAlign: 'left',
                                      paddingRight: '15px',
                                      marginLeft: '-10px',
                                    }}
                                  >
                                    {moment(v.updatedAt).format('DD/MM/YYYY')}
                                  </Box>
                                  <Box 
                                  sx={{
                                    color: 'gray',
                                    fontSize: '10px',
                                    mb: 0.5,
                                    paddingRight: '20px',
                                    marginLeft: '-10px',
                                  }}
                                  >
                                    {moment(v.updatedAt).format('hh:mm A')}
                                  </Box>
                                </Box>
                                <TimelineSeparator>
                                  <TimelineDot />
                                  <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent
                                  sx={{
                                    fontSize: '10px',
                                    marginTop: '8px',
                                    marginLeft: '9px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'normal',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  {v.remarks ? (
                                    v.remarks
                                  ) : (
                                    <span style={{ visibility: 'hidden' }}>Placeholder</span> 
                                  )}
                                </TimelineContent>
                              </TimelineItem>
                            ),
                        )}
                        {taskDataForEdit?.full_name && (
                          <TimelineItem>
                            <Box
                              sx={{
                                width: '150px',
                                marginTop: '8px',
                                textAlign: 'right',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                paddingRight: '10px',
                              }}
                            >
                              <Box
                                 sx={{
                                      color: 'gray',
                                      fontSize: '10px',
                                      mb: 0.5,
                                      textAlign: 'left',
                                      paddingRight: '15px',
                                      marginLeft: '-10px',
                                    }}
                              >
                                {moment(taskDataForEdit.updatedAt).format(
                                  'DD/MM/YYYY',
                                )}
                              </Box>
                              <Box 
                                   sx={{
                                    color: 'gray',
                                    fontSize: '10px',
                                    mb: 0.5,
                                    paddingRight: '20px',
                                      marginLeft: '-15px',
                                  }}
                              >
                                {moment(taskDataForEdit.updatedAt).format(
                                  'hh:mm A',
                                )}
                              </Box>
                            </Box>
                            <TimelineSeparator>
                              <TimelineDot />
                              <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent
                              sx={{
                                fontSize: '10px',
                                marginTop: '8px',
                                marginLeft: '9px',
                                whiteSpace: 'normal',
                                wordBreak: 'normal',
                                // overflowWrap: 'break-word',
                              }}
                            >
                                {taskDataForEdit?.full_name ? (
                                  `Assigned for ${taskDataForEdit?.full_name}`
                                ) : (
                                  <span style={{ visibility: 'hidden' }}>Placeholder</span> 
                                )}
                            </TimelineContent>
                          </TimelineItem>
                        )}
                        {taskActivityDetails?.map(
                          (v) =>
                            v.remarks === 'Admin created this task' && (
                              <TimelineItem key={v.id}>
                                <Box
                                  sx={{
                                    width: '150px',
                                    marginTop: '8px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // alignItems: 'flex-end',
                                    // paddingRight: '10px',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      color: 'gray',
                                      fontSize: '10px',
                                      mb: 0.5,
                                      textAlign: 'left',
                                      paddingRight: '15px',
                                      marginLeft: '-10px',
                                    }}
                                  >
                                    {moment(v.createdAt).format('DD/MM/YYYY')}
                                  </Box>
                                  <Box
                                    sx={{
                                      color: 'gray',
                                      fontSize: '10px',
                                      mb: 0.5,
                                    }}
                                  >
                                    {moment(v.createdAt).format('hh:mm A')}
                                  </Box>
                                </Box>
                                <TimelineSeparator>
                                  <TimelineDot />
                                  <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent
                                  sx={{
                                    fontSize: '10px',
                                    marginTop: '8px',
                                    marginLeft: '9px',
                                    // whiteSpace: 'normal',
                                    // wordBreak: 'normal',
                                    // overflowWrap: 'break-word',
                                  }}
                                >
                                  {`Admin created this task`}
                                </TimelineContent>
                              </TimelineItem>
                            ),
                        )}
                      </>
                    )}
                  </Timeline>
                </Box>
              </Grid>
            </Grid>
          )} */}

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12,
            }}
          >
            <Box
              mt={3}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              {activityEnable && (
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    // display:'block'
                  }}
                >
                  Activity
                </span>
              )}

              {activityEnable && (
                <>
                  <Tabs
                    value={activityTab}
                    onChange={(event, newValue) => setActivityTab(newValue)}
                    sx={{
                      mt: 1,
                      minHeight: '32px',
                      maxWidth: 'fit-content',
                      border: '1px solid #d7d7d7',
                      borderRadius: '6px',
                      '& .MuiTabs-indicator': {
                        display: 'none',
                      },
                      '& .MuiTab-root': {
                        minHeight: '32px',
                        minWidth: '100px',
                        fontSize: '16px',
                        textTransform: 'none',
                        color: 'text.secondary',
                        borderRight: '1px solid #d7d7d7',
                        padding: '4px 10px',
                      },
                      // '& .MuiTab-root:last-of-type': {
                      //   borderRight: 'none',
                      // },
                      '& .Mui-selected': {
                        color: '#1976d2 !important',
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <Tab label='All' value={ACTIVITY_TABS.all} />
                    <Tab label='Comments' value={ACTIVITY_TABS.comments} />
                    <Tab label='History' value={ACTIVITY_TABS.history} />
                    <Tab label='Work log' value={ACTIVITY_TABS.worklog} />
                  </Tabs>
                  <Box sx={{pt: 1}}>{renderActivityTabContent()}</Box>
                </>
              )}
            </Box>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Divider />
          </Grid> */}
          
        </Grid>
        <>
        <Grid
  display='flex'
  justifyContent='flex-end'
  gap={2}
  size={{
    lg: 12,
    md: 12,
    sm: 12,
    xs: 12,
  }}
  sx={{
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'background.paper',
    py: 1.5,
    px: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    mt: 1,
  }}
>
  <Button
    onClick={handleCancel}
    color='primary'
    disabled={taskData.status === 6}
  >
    Cancel
  </Button>
  <Button
    onClick={(e) => handleSave(e, 'save')}
    color='primary'
    variant='contained'
    disabled={taskData.status === 6}
  >
    Save
  </Button>
</Grid>


          </>
      </Grid>
      <EpicCreation
        open={isEpicDialogOpen}
        onClose={() => setIsEpicDialogOpen(false)}
        projectId={currentProjectId}
        onSaved={handleEpicSaved}
      />
    </>
  );
};

export default AddTaskDialog;

