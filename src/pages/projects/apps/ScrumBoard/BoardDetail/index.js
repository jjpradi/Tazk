import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import AppsContainer from '@crema/core/AppsContainer';
import BoardDetailView from './BoardDetailView';
import EpicDeatail from "./Epic/index";
import Stack from '@mui/material/Stack';
import StoreIcon from '@mui/icons-material/Store';
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import TextField from '@mui/material/TextField';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import FlagCircleTwoToneIcon from '@mui/icons-material/FlagCircleTwoTone';
import moment from 'moment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import {eventList, websocketEvents} from '../../../../http-common';
import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import {
  createProjectBoardAction,
  getProjectDetailsAction,
  getProjectLanesAction,
  getProjectsAction,
  getTaskByStatusAction,
  loadMoreLaneAction,
  getTasksDataAction,
  setTaskByStatusAction,
  showTasklistAction,
  showEpicListAction,
  loadMoreProjectsReportListAction,
  getEmployeeListAction,
  getTasksStatusDataAction,
  getTaskPriorityAction,
  teamWorkLoadAction,
  typesOfWorkAction,
  workLogReportAction,
  filterTaskDetailsAction,
  getProjectsReportListAction,
  tasksDeleteAction,
} from 'redux/actions/payrollDashboard_actions';
import {
  GET_TASK_BY_STATUS,
  GET_EPIC_LIST,
  GET_PROJECT_DETAILS,
  GET_PROJECT_LANES,
  GET_PROJECTS_REPORT_LIST,
} from 'redux/actionTypes';
import { Breadcrumbs, Button, Link, Typography, Tabs, Tab, Paper, Grid, FormControl, IconButton, Alert, InputLabel, Select, MenuItem, Dialog, Divider, Autocomplete,Tooltip, Popover, Checkbox } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Fonts } from 'shared/constants/AppEnums';
import CloseIcon from '@mui/icons-material/Close';
import context from '../../../../../context/CreateNewButtonContext'
import { roleType } from 'utils/roleType';
import { getsessionStorage } from 'pages/common/login/cookies';
import useGeoLocation from 'utils/useGeoLocation';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon as polygons } from 'react-leaflet';
import activeIcon from '../../../../../assets/icon/active.png';
import L from 'leaflet';
import greenFlag from '../../../../../assets/icon/greenFlag.png';
import redFlag from '../../../../../assets/icon/redFlag.png';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee, getEmpbasecompanyAction } from '../../../../../redux/actions/attendance_actions';
import { getEmpBasedTravelHistoryAction, getTravelTimeLineAction, liveLocationAction, setLiveLocationAction, projectLiveLocationAction, setProjectLiveLocationAction, getProjectEmpBasedTravelHistoryAction, getProjectTravelTimeLineAction, getTaskLogsAction } from 'redux/actions/liveLocation';
import ScrumBoard from '../BoardList/index';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import CommonSearch from 'utils/commonSearch';
import { setSearchLeadsTaskAction } from 'redux/actions/leads_task_actions';
import ConfigurationSubMenu from './List/ConfigurationSubMenu';

import BackLog from './List/CardDetail/BackLog';
import { DEFAULT_LANE_PAGE_SIZE, DEFAULT_REPORT_PAGE_SIZE } from './boardPagination';
import Avatar from '@mui/material/Avatar';
import ProjectDashboard from './List/CardDetail/ProjectDashboard';
import { getTasksStatusAction } from '../../../../../redux/actions/payrollDashboard_actions';
// import WorkLogReport from './List/CardDetail/WorkLogReport';
import { now } from 'lodash';
import ProjectSettings from './List/ProjectSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ProjectTimeline from './ProjectTimeline';
import socketManager from 'utils/socketManager';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import toMomentOrNull from 'utils/DateFixer';
import ProjectReport from './List/CardDetail/ProjectReport';


import {MAPTILER_TILE_URL, osmMapTiler} from 'shared/constants/MapTiles';

const mapsUrl = osmMapTiler;

const ActiveIcon = new L.Icon({
  iconUrl: activeIcon,
  iconSize: [20, 23],
  iconAnchor: [17, 35],
  popupAnchor: [3, -46],
});
const avatarSize = 30;
const overlap = 22;

const startIcon = new L.Icon({
  iconUrl: greenFlag,
  iconSize: [25, 40],
  iconAnchor: [20, 35],
  popupAnchor: [3, -46],
});

const endIcon = new L.Icon({
  iconUrl: redFlag,
  iconSize: [25, 45],
  iconAnchor: [20, 40],
  popupAnchor: [3, -46],
});

export function OpenStreetMap({ zoom, selectedEmployeeId, selectedDate, projectData }) {
  const dispatch = useDispatch();
  const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
  const ZOOM_LEVEL = zoom;
  const mapRef = useRef(null);
  const location = useGeoLocation();
  const {
    fuelAllowanceReducer: { salesManLiveTrackingData },
    LiveLocationReducer: { ProjectLiveLocationDetails, getTaskLogs }

  } = useSelector((state) => state);
  const showMyLocation = () => {
    if (location.loaded && !location.error) {
      mapRef.current.leafletElement.flyTo([
        location.coordinates.lat,
        location.coordinates.lng,
      ]);
    } else {
      alert(location.error.message);
    }
  };


  
  useEffect(() => {

    if (ProjectLiveLocationDetails?.length > 0 && mapRef.current) {

      const bounds = ProjectLiveLocationDetails?.map(marker => [parseFloat(marker?.latitude), parseFloat(marker?.longitude)]);
      // console.log("bounds",bounds)
      mapRef.current.leafletElement.fitBounds(bounds);
    }
  }, [ProjectLiveLocationDetails?.length, mapRef?.current]);

  useEffect(() => {
    if (selectedEmployeeId && selectedDate && getTaskLogs?.length > 0) {
      const filteredLogs = getTaskLogs.filter(
        log =>
          log.emp_id === selectedEmployeeId &&
          moment(log.updatedAt).isSame(selectedDate, 'day') &&
          log.project_type === projectData.project_type &&
          !(log.location_restriction === 0 && log.taskLocation === 0) &&
          log.projectId === projectData.id
      );

      const filteredAndSortedLogs = filteredLogs.filter(
        log => log.project_type === projectData.project_type
      );

      // console.log(projectData.project_type, "BBYEE")
      // console.log(filteredAndSortedLogs, "BBYEE1")

      if (filteredAndSortedLogs.length > 0 && mapRef.current) {
        const bounds = [];
        filteredAndSortedLogs.forEach(log => {
          if (log.startLatitude && log.startLongitude) {
            bounds.push([parseFloat(log.startLatitude), parseFloat(log.startLongitude)]);
          }
          if (log.endLatitude && log.endLongitude) {
            bounds.push([parseFloat(log.endLatitude), parseFloat(log.endLongitude)]);
          }
        });
        if (bounds.length > 0) {
          mapRef.current.leafletElement.fitBounds(bounds);
        }
      }
    }
  }, [selectedEmployeeId, selectedDate, getTaskLogs, projectData]);

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };

  const getLatestLogs = (logs) => {
    const latestLogs = {};
    logs.forEach(log => {
      if (!latestLogs[log.task_id] || moment(log.updatedAt).isAfter(latestLogs[log.task_id].updatedAt)) {
        latestLogs[log.task_id] = log;
      }
    });
    return Object.values(latestLogs);
  };

  const latestLogs = getLatestLogs(
    getTaskLogs.filter(
      log =>
        log.emp_id === selectedEmployeeId &&
        moment(log.updatedAt).isSame(selectedDate, 'day') &&
        log.project_type === projectData.project_type &&
        !(log.location_restriction === 0 && log.taskLocation === 0) &&
        log.projectId === projectData.id
    )
  );

  const markerRefs = useRef([]);

  // Initialize markerRefs with empty values
  useEffect(() => {
    markerRefs.current = markerRefs.current.slice(0, latestLogs.length * 2);
  }, [latestLogs]);

  // Use a useEffect to open all popups after markers are rendered
  useEffect(() => {
    markerRefs.current.forEach(marker => {
      if (marker && marker.leafletElement) {
        marker.leafletElement.openPopup();
      }
    });
  }, [latestLogs]);
  // console.log('ProjectLiveLocationDetails', ProjectLiveLocationDetails)
  // console.log("sdffsf",ProjectLiveLocationDetails.map(marker => [parseFloat(marker?.latitude),parseFloat(marker?.longitude)]))

  return (
    <Grid size={12}>
      {/* <Button onClick={showMyLocation} variant='contained'>
        Show my location
      </Button> */}
      <MapContainer
        center={center} zoom={zoom} scrollWheelZoom={true} ref={mapRef}
      // bounds={ProjectLiveLocationDetails?.map((i)=>{
      //   return [i?.latitude,i?.longitude]
      // })}
      >
        <TileLayer
          url={mapsUrl.mapTiler.url}
          attribution={mapsUrl.mapTiler.attribution}
        />
        {/* {location.loaded && !location.error && (
          <Marker
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={ActiveIcon}
          >
            <Popup>
              <b>Current Location</b>
            </Popup>
          </Marker>
        )} */}

        {ProjectLiveLocationDetails?.length > 0 &&
          ProjectLiveLocationDetails?.map(
            ({ first_name, employee_id, company_id, startLatitude, startLongitude, endLatitude, endLongitude, projectId, project_type, location_restriction, taskLocation, project_name, task_id, latitude, longitude }) => (
              <Marker
                icon={
                  // moment(new Date()).diff(moment(timestamp), 'minutes') > 10
                  //   ? InActiveIcon
                  //   :
                  ActiveIcon
                }
                key={employee_id}
                position={[latitude, longitude]}
              >
                <Popup>
                  <b>{first_name}</b><br />
                  <b>Project Name: {project_name}</b><br />
                  <b>Task ID: {task_id}</b>
                  <b>{employee_id}</b>

                </Popup>
              </Marker>
            ),
          )}
        {latestLogs.map((log, index) => (
          <React.Fragment key={log.task_id}>
            {log.startLatitude && log.startLongitude && (
              <Marker
                icon={ActiveIcon}
                key={`start-${log.task_id}`}
                position={[parseFloat(log.startLatitude), parseFloat(log.startLongitude)]}
              // ref={el => (markerRefs.current[index * 2] = el)}
              >
                <Popup>
                  <b>Start : {log.task_name}</b><br />
                  <b>Task ID : {log.task_id}</b><br />
                  <b>Time : {formatTimestamp(log.creationDate)}</b>
                </Popup>
              </Marker>
            )}
            {/* {log.endLatitude && log.endLongitude && (
              <Marker
                icon={ActiveIcon}
                key={`end-${log.task_id}`}
                position={[parseFloat(log.endLatitude), parseFloat(log.endLongitude)]}
                // ref={el => (markerRefs.current[index * 2 + 1] = el)}
              >
                <Popup>
                  <b>End : {log.task_name}</b><br />
                  <b>Task ID : {log.task_id}</b><br />
                  <b>Time : {formatTimestamp(log.updatedAt)}</b>
                </Popup>
              </Marker>
            )} */}
          </React.Fragment>
        ))}
      </MapContainer>
    </Grid>
  );
}

export function MapTravelHistory({ zoom, employeeId, polylineCoords, setPolylineCoords }) {
  const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
  // const [polylineCoords, setPolylineCoords] = useState([])
  const { LiveLocationReducer: { empBasedTravelHistory }, getProjectEmpBasedTravelHistory, getProjectTravelTimeLine } = useSelector((state) => state);
  const ZOOM_LEVEL = 13;
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const currentDateTime = moment();
  // console.log('Current Date and Time:', currentDateTime.format('DD-MM-YYYY hh:mm A'));
  const [routingControlVisible, setRoutingControlVisible] = useState(false);


  // useEffect(() => {

  //   if (polylineCoords?.length > 0 && mapRef.current) {

  //     const bounds = polylineCoords.map(marker => [parseFloat(marker?.latitude),parseFloat(marker?.longitude)]);
  //     mapRef.current.leafletElement.fitBounds(bounds);
  //   }
  // }, [polylineCoords?.length, mapRef?.current]);
  const routingControlRef = useRef(null);
  useEffect(() => {
    if (polylineCoords?.length > 0 && mapRef.current) {
      const bounds = polylineCoords.map(marker => [parseFloat(marker?.latitude), parseFloat(marker?.longitude)]);
      mapRef.current.leafletElement.fitBounds(bounds);

      const routingControl = L.Routing.control({
        waypoints: polylineCoords.map(coord => L.latLng(coord.latitude, coord.longitude)),
        // waypoint_names: polylineCoords.map(coord => L.latLng(coord.latitude, coord.longitude)),
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: 'black', weight: 2.5 }]
        },
        show: routingControlVisible,
        // position: 'bottomright',
        // className: 'custom-routing-control'
      }).addTo(mapRef.current.leafletElement);
      return () => {
        mapRef?.current?.leafletElement.removeControl(routingControl);
      };
    }
  }, [polylineCoords?.length, mapRef?.current, routingControlVisible]);

  const toggleRoutingControl = () => {
    setRoutingControlVisible(prevState => !prevState);
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };


  // console.log('employeeId', employeeId);
  // console.log('polylineCoords', polylineCoords);

  // useEffect(() => {      
  //   setPolylineCoords([])
  //   if(employeeId){
  //     dispatch(getEmpBasedTravelHistoryAction(employeeId, (response, resdata) => {
  //       if (response === 200) {
  //         setPolylineCoords(resdata)
  //       }
  //     }));
  //   }
  // }, [employeeId])

  const polylineCoords1 = [
    [12.9716, 77.5946], // Bangalore, India
    [19.076, 72.8777],  // Mumbai, India
    // [28.7041, 77.1025], // Delhi, India
  ];


  const createArrows = (coords) => {
    const arrowMarkers = [];
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lng1] = [parseFloat(coords[i - 1].latitude), parseFloat(coords[i - 1].longitude)];
      const [lat2, lng2] = [parseFloat(coords[i].latitude), parseFloat(coords[i].longitude)];

      const angle = Math.atan2(lat2 - lat1, lng2 - lng1) * 180 / Math.PI;
      const arrowIcon = L.divIcon({
        html: `<div style="transform: rotate(${angle}deg)">&#8594;</div>`,
        className: 'arrow-icon',
      });

      // Find the midpoint for better placement
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;

      arrowMarkers.push(
        <Marker key={`arrow-${i}`} position={[midLat, midLng]} icon={arrowIcon} />
      );
    }
    return arrowMarkers;
  };

  return (
    <Grid size={12}>
      <Button
        onClick={toggleRoutingControl}
        style={{
          position: 'absolute',
          bottom: '40px',
          zIndex: 1000,
          backgroundColor: 'white',
        }}
      >
        {routingControlVisible ? 'Hide Route' : 'Show Route'}
      </Button>
      <MapContainer center={center} zoom={ZOOM_LEVEL} scrollWheelZoom={true} ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          url={MAPTILER_TILE_URL}
        />

        {/* Render polyline */}
        {
          polylineCoords != undefined && polylineCoords.map(
            ({ first_name, employee_id, latitude, longitude, last_name, createdAt, type }, index) => (
              <React.Fragment key={employee_id}>
                {type !== "MOTION" && (
                  <Marker
                    icon={type === "START" ? startIcon : type === "END" ? endIcon : ActiveIcon}
                    position={[latitude, longitude]}
                  >
                    <Popup>
                      <b>Name : {first_name} </b><br />
                      <b>ID :{employeeId}</b><br />
                      {/* <b>Time : {formatTimestamp(createdAt)}</b><br /> */}
                      <b>Coordinates: {latitude}, {longitude}</b><br />
                      {/* <b>Time : {formatTimestamp(log.creationDate)}</b> */}
                    </Popup>

                  </Marker>
                )}
                {/* {createArrows(polylineCoords)} */}
                {/* {index > 0 && (
                    <Polyline
                      pathOptions={{ color: 'black' }}
                      positions={[
                        [polylineCoords[index - 1].latitude, polylineCoords[index - 1].longitude],
                        [latitude, longitude]
                      ]}
                    />
                  )} */}
              </React.Fragment>
            )
          )
        }
        {/* {createArrows(polylineCoords)} */}
      </MapContainer>
    </Grid>
  );
};

function BoardDetail(id) {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    setHeaderLocationIdHandeler,
  } = useContext(context);
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  // const {id} = useParams();
  // const id = id.id;
  const navigate = useNavigate();
  const storage = getsessionStorage();
  const [selectedEmpId, setSelectedEmpId] = useState('all');

  const {
    PayrolldashboardReducers: { get_projects, get_taskProjects, get_epicList, taskByStatus,getProjectDetails,createProjectBoard,getProjectLanes,getEmployeeList, getprojectTypes, getProjectsReportList, getProjectsReportListTotal },
    LiveLocationReducer :{liveLocationDetails, empTravelTimeline, ProjectLiveLocationDetails,getTaskLogs, getProjectTravelTimeLine, getProjectEmpBasedTravelHistory},
    attendanceReducer: {get_empbasecompany, searchCompanyBasedEmployeeFilter, getCompanyBasedEmployeeFilter},
    stockLocationReducer: {stocklocation},
    roleReducer: {user_rights}
  } = useSelector((state) => state);
  
useEffect(() => {
  if (!ProjectLiveLocationDetails || !ProjectLiveLocationDetails.length) return;
  try {
    localStorage.setItem(
      'projectTravelHistory',
      JSON.stringify(ProjectLiveLocationDetails),
    );
  } catch (err) {
    // localStorage can throw QuotaExceededError on large payloads or in private mode.
    console.warn('projectTravelHistory: localStorage write failed', err);
  }
}, [ProjectLiveLocationDetails]);  // console.log(get_projects, "get_projects")
  const rights = user_rights?.find(r => r.right_name === "CreateTask")


  useEffect(() => {
    const rootSocket = socketManager.getSocket("/");

    if (!rootSocket) {
      return;
    }

    const taskLiveLocation = (content) => {
    const current = ProjectLiveLocationDetails || [];
    const index = current.findIndex((x) => x.employee_id === content.employee_id);

    const tempArray =
    index === -1
      ? [...current, content]
      : current.map((item, i) => (i === index ? content : item));

     dispatch(setLiveLocationAction(tempArray));
};
    rootSocket.on("taskLiveLocation", taskLiveLocation);

    return () => {
      rootSocket.off("taskLiveLocation", taskLiveLocation);
    };
  }, []);

  // console.log(get_taskProjects, 'gettask', taskByStatus, id);



  const [projectData, setProjectData] = useState({});
  const [isAddCardOpen, setAddCardOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [zoom, setZoom] = useState(10);
  const [employeeId, setEmployeeId] = useState();
  const [task_id, setTaskId] = useState();
  const [polylineCoords, setPolylineCoords] = useState([])
  const [projectPolylineCoords, setprojectPolylineCoords] = useState([])
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value, setValue] = React.useState('1');
  const [value1, setValue1] = React.useState([]);
  const [value2, setValue2] = React.useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const curDate = moment()
  const yesterday = curDate.subtract(1, 'days')
  const [error, setError] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appliedEmployeeId, setAppliedEmployeeId] = useState(null);
  const [appliedDate, setAppliedDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedTask, setSelectedTask] = useState(false);
  const [boardOpen,setBoardOpen] = useState(false)
  const [createBoard,setCreateBoard]= useState(false)
  const [boardType,setBoardType]=useState()
  const [boardName,setBoardName]=useState()
  const [menu,setMenu] = useState()
  const [anchorEl, setAnchorEl] = useState(null);
  const [configure,setConfigure] = useState(false)
  const [settings,setSettings] = useState(false)
  const [avatarOverflowAnchorEl, setAvatarOverflowAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(
    taskByStatus?.[2]?.length && taskByStatus[2][0].boardType === 2 
      ? 'KanbanBoard' 
      : 'ActiveSprints'
  );
  // console.log(configure,'configurerr')

  const [boardValues,setBoardValue] = useState({
    BoardName: null,
    project:null,
    location : null
  })

  const [errBoardValues,setErrBoardValue] = useState({
    BoardName: null,
    project:null,
    location : null
  })

  // console.log(boardOpen,'board555')
  const [formErrors, setFormErrors] = useState({
    date: null,
    date1: null,
    to: null,
    empName: null,
    task_id: null
  });
  const [filterDate, setFilterDate] = React.useState({
    date: new Date(),
    // to: moment(lastDateOfMonth),
  });
  const [filterDate1, setFilterDate1] = React.useState({
    date: new Date(),
    // to: moment(lastDateOfMonth),
  });


  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

//  console.log(projectData,'projectData',getProjectLanes);
  const onClickAddCard = (listId) => {
    setAddCardOpen(true);
    let data = {
      searchString: ''
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


    if (!get_empbasecompany.length) {
      dispatch(getEmpbasecompanyAction())
    }

    dispatch(getTaskLogsAction());

  }, []);

  useEffect(() => {
    let payload = {
      project_id: id.id,
    };

    dispatch(
      getProjectDetailsAction(id.id)
    );
    dispatch(getEmployeeListAction())


    //   dispatch(showTasklistAction(payload));
    //   !get_empbasecompany.length && dispatch(getEmpbasecompanyAction());
    // }, [id]);

    // dispatch(showTasklistAction({ project_id: id }));
    if (!get_empbasecompany.length) {
      // dispatch(getEmpbasecompanyAction());
    }
  }, [dispatch, get_empbasecompany.length]);

  useEffect(() => {
    if (Object.keys(getProjectDetails).length > 0) {
      setProjectData(getProjectDetails)
    }
  }, [getProjectDetails])

  const [data, setData] = useState({
    lanes: getProjectLanes
  });

  const lanePageRef = useRef({});
  const [lanePage, setLanePage] = useState({});

  const onLoadMoreLane = useCallback((laneId) => {
    if (!id?.id) return;
    const current = lanePageRef.current[laneId] || { page: 0, loading: false };
    if (current.loading) return;
    const nextPage = current.page + 1;
    const pending = {
      ...lanePageRef.current,
      [laneId]: { page: nextPage, loading: true },
    };
    lanePageRef.current = pending;
    setLanePage(pending);
    dispatch(
      loadMoreLaneAction(id.id, {
        pageCount: nextPage,
        numPerPage: DEFAULT_LANE_PAGE_SIZE,
        status: laneId,
      }),
    ).finally(() => {
      const next = {
        ...lanePageRef.current,
        [laneId]: { page: nextPage, loading: false },
      };
      lanePageRef.current = next;
      setLanePage(next);
    });
  }, [dispatch, id?.id]);
// console.log(getProjectLanes,'getProjectLanes')
  useEffect(() => {
    if (id?.id) {
      // Clear previous project's cached redux slices before fetching the new one
      // so the board doesn't flash stale data from the last project while the
      // new requests are in flight.
      dispatch({ type: GET_TASK_BY_STATUS, payload: [] });
      dispatch({ type: GET_EPIC_LIST, payload: [] });
      dispatch({ type: GET_PROJECT_DETAILS, payload: {} });
      dispatch({ type: GET_PROJECT_LANES, payload: [] });
      dispatch({ type: GET_PROJECTS_REPORT_LIST, payload: [], numRows: 0 });

      dispatch(
        getTaskByStatusAction(id.id, { numPerPage: DEFAULT_LANE_PAGE_SIZE }),
      ).catch((error) => {
        console.error('Failed to fetch task statuses:', error);
      });

      dispatch(showEpicListAction(id.id));

      const data = {
        project_id: id.id,
      };
      dispatch(getProjectLanesAction(data));
      dispatch(getTasksStatusAction(data));
      dispatch(getTasksStatusDataAction(data));
      dispatch(getTaskPriorityAction(data));
      dispatch(teamWorkLoadAction(data));
      dispatch(typesOfWorkAction(data));
    }

    dispatch(getUserRightsByRoleIdAction());
  }, [dispatch, id?.id]);

  const refreshEpicList = useCallback(() => {
    if (!id?.id) return;
    dispatch(showEpicListAction(id.id));
  }, [dispatch, id?.id]);

  const [reportSearchVal, setReportSearchVal] = useState('');
  const reportPageRef = useRef({ page: 0, loading: false, search: '', reachedEnd: false });
  const [reportPage, setReportPage] = useState({ page: 0, loading: false });

  const fetchReportPage = useCallback(
    ({ page, searchString }) => {
      if (!id?.id) return Promise.resolve();
      const pending = {
        ...reportPageRef.current,
        page,
        loading: true,
        search: searchString,
      };
      reportPageRef.current = pending;
      setReportPage({ page, loading: true });
      const action = page === 0 ? getProjectsReportListAction : loadMoreProjectsReportListAction;
      return dispatch(
        action({
          project_id: id.id,
          pageCount: page,
          numPerPage: DEFAULT_REPORT_PAGE_SIZE,
          searchString,
        }),
      )
        .then((result) => {
          const groupsLen = Array.isArray(result?.groups) ? result.groups.length : 0;
          reportPageRef.current = {
            page,
            loading: false,
            search: searchString,
            reachedEnd: groupsLen === 0,
          };
          setReportPage({ page, loading: false });
        })
        .catch(() => {
          reportPageRef.current = { ...reportPageRef.current, loading: false };
          setReportPage({ page, loading: false });
        });
    },
    [dispatch, id?.id],
  );

  const loadProjectReportTasks = useCallback(
    (searchString = '') => {
      reportPageRef.current = { ...reportPageRef.current, reachedEnd: false };
      fetchReportPage({ page: 0, searchString });
    },
    [fetchReportPage],
  );

  const onReportLoadMore = useCallback(() => {
    const curr = reportPageRef.current;
    if (curr.loading || curr.reachedEnd) return;
    fetchReportPage({ page: curr.page + 1, searchString: curr.search || '' });
  }, [fetchReportPage]);

  const onDeleteReportTasks = useCallback(
    (ids) => {
      if (!id?.id || !Array.isArray(ids) || ids.length === 0) return Promise.resolve();
      return dispatch(
        tasksDeleteAction({ id: ids, projectid: id.id }),
      ).then(() => {
        loadProjectReportTasks(reportPageRef.current.search || '');
      });
    },
    [dispatch, id?.id, loadProjectReportTasks],
  );

  useEffect(() => {
    if (selectedOption === 'List') {
      loadProjectReportTasks(reportSearchVal);
    }
    // Only refetch on view switch or search change; reportSearchVal drives the search reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, reportSearchVal]);


  useEffect(() => {
    if (
      !Array.isArray(getProjectLanes) ||
      !getProjectLanes.length ||
      !Object.keys(taskByStatus || {}).length ||
      !Object.keys(projectData || {}).length
    ) {
      return;
    }

    const taskRows = Array.isArray(taskByStatus?.[0]) ? taskByStatus[0] : [];
    const groupedCounts = Array.isArray(taskByStatus?.[1]) ? taskByStatus[1] : [];
    const countByName = new Map();
    groupedCounts.forEach((g) => {
      if (g && g.STATUS) {
        countByName.set(
          String(g.STATUS).trim().toLowerCase(),
          Number(g.total_task || 0),
        );
      }
    });

    const lanes = getProjectLanes.map((lane) => {
      const normalizedLaneName = String(lane?.name || '').trim().toLowerCase();
      const cards = taskRows.filter(
        (item) =>
          String(item?.STATUS || item?.status_name || '')
            .trim()
            .toLowerCase() === normalizedLaneName,
      );
      const totalCount = countByName.has(normalizedLaneName)
        ? countByName.get(normalizedLaneName)
        : cards.length;
      const laneState = lanePage[lane.laneId] || { page: 0, loading: false };

      return {
        id: lane.laneId,
        laneId: lane.laneId,
        name: lane.name,
        cards,
        totalCount,
        hasMore: cards.length < totalCount,
        loading: laneState.loading,
        onLoadMore: () => onLoadMoreLane(lane.laneId),
      };
    });

    setData({lanes});
  }, [taskByStatus, projectData, getProjectLanes, lanePage, onLoadMoreLane]);

  // console.log("data", data)


  // console.log(projectData,data,taskByStatus, 'prohect');

const onGoToBoardList = () => {
  navigate(-1);
  dispatch(get_taskProjects([]));
  dispatch(get_epicList([]));
  dispatch(getTaskByStatus([]));
  dispatch(getProjectDetails([]));
  dispatch(createProjectBoard([]));
  dispatch(getProjectLanes([]));
  dispatch(getEmployeeList([]));
  dispatch(getprojectTypes([]));
  dispatch(getProjectsReportList([]));

};

  if (!get_taskProjects) {
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }


  const isAdmin = roleType.includes(storage?.role_name);
  // const todoTaskCount = taskByStatus?.todo?.length || 0;
  // const inProgress = taskByStatus?.todo?.length || 0;

  const handleChangeEmployeeName = (val) => {
    setValue1(val)
    if (val?.length > 0) {
      setFormErrors({ ...formErrors, empName: null })
    }
  }

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleShowBacklog = () => {
    setSelectedOption('Backlog');
  };

  const handleChangeEmployeeNameLocation = (val1) => {
    setValue2(val1)
    if (val1?.length > 0) {
      setFormErrors({ ...formErrors, empName: null })
    }
  }

  const handleDateChange = (data) => {
    const { name, value } = data?.target;
    const date_val = value?._d;
    setFilterDate(prevState => ({ ...prevState, [name]: date_val }));
    const fromDate = moment(name === "date" ? date_val : filterDate.date);
    const toDate = moment(name === "to" ? date_val : filterDate.to);
    if (toDate.isSameOrAfter(fromDate)) {
      setFormErrors(prevState => ({ ...prevState, date: null, to: null }));
    } else {
      setFormErrors(prevState => ({ ...prevState, [name]: 'Invalid Date' }));
    }
  }

  const handleDateChangeLocation = (data) => {
    const { name, value } = data?.target;
    const date_val = value?._d;
    setFilterDate1(prevState => ({ ...prevState, [name]: date_val }));
    const fromDate = moment(name === "date" ? date_val : filterDate1.date);
    const toDate = moment(name === "to" ? date_val : filterDate1.to);
    if (toDate.isSameOrAfter(fromDate)) {
      setFormErrors(prevState => ({ ...prevState, date: null, to: null }));
    } else {
      setFormErrors(prevState => ({ ...prevState, [name]: 'Invalid Date' }));
    }
  }


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

  const requestSearchEmployeeFilter1 = (val1) => {
    // let allDept = list_department.map((d) => d.department);
    setSearchValEmployeeFilter(val1);
    dispatch(set_search_company_based_employee([]));
    if (!val1) {
      return
    }
    let data = {
      searchString: val1
    }
    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const processFunction = (value) => {
    if (value.length === 0) {
      setFormErrors({ ...formErrors, empName: 'Employee is required' })
      return
    }
    if (!selectedTask) {
      setFormErrors({ ...formErrors, task_id: 'Task is required' });
      return;
    }
    // console.log("dfgsssfs")
    let payLoad = {
      date: moment(filterDate?.date).format('YYYY-MM-DD'),
      // toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employeeId: value.map((d) => d.employee_id),
      task_id: selectedTask,
    }

    // console.log("sdsf", payLoad)

    setPolylineCoords([])
    // if(employeeId){  
    // console.log("dgdfgdfg")
    setError(false)
    if (formErrors.date === null && formErrors.to === null) {
      dispatch(getProjectEmpBasedTravelHistoryAction(payLoad, (response, resdata) => {
        if (response === 200) {
          setPolylineCoords(resdata)
        }
      }));
      dispatch(getProjectTravelTimeLineAction(payLoad, () => {
        toggleDrawer(true)()
      }));
    }
  }

  const handleSubmit = async () => {

    if (selectedAll) {
      dispatch(getEmpbasecompanyAction({}, (res) => {
        if (res) {
          processFunction(res)
        }
      }))
    }
    else {
      processFunction(value1)
    }

    setSubmitted(true);
  };

  const handleSubmitLocation = () => {
    const selectedEmployeeId = value2[0]?.employee_id;
    const selectedDate = filterDate1.date;

    if (selectedEmployeeId && selectedDate) {
      const filteredLogs = getTaskLogs.filter(
        log =>
          log.emp_id === selectedEmployeeId &&
          moment(log.updatedAt).isSame(selectedDate, 'day') &&
          log.project_type === projectData.project_type &&
          !(log.location_restriction === 0 && log.taskLocation === 0) &&
          log.projectId === projectData.id
      );

      if (filteredLogs.length === 0) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      } else {
        setAppliedEmployeeId(selectedEmployeeId);
        setAppliedDate(selectedDate);
      }
    }
  };

  const handleBoardChange = (name, value) => {
    const formObj = { ...boardValues, [name]: value };
  
    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
      setErrBoardValue((err) => ({ ...err, [name]: `${name} is required` }));
    } else {
      setErrBoardValue((err) => ({ ...err, [name]: null }));
    }
  
    setBoardValue(formObj);
  };

  const handleBoardCreate = () => {
    // console.log(boardValues, 'boardValues');
  
    let valid = true;
  
    if (!boardValues.BoardName || boardValues.BoardName.trim() === "") {
      setErrBoardValue((err) => ({ ...err, BoardName: "Board Name is required" }));
      valid = false;
    }
  
    if (!boardValues.project || boardValues.project.length === 0) {
      setErrBoardValue((err) => ({ ...err, project: "Project is required" }));
      valid = false;
    }
  
    // console.log(valid, "valid");
  
    if (valid) {
      const ids = boardValues.project.map(e => e.id);
      // console.log(ids,'val888')
      const body = {
        board_name: boardValues.BoardName,
        board_type : boardType,
        Project_id: ids, 
      };
  
      dispatch(createProjectBoardAction(body));
      setCreateBoard(false)

    }
  };

  const handleDialog  = (event)=>{
    // setBoardOpen(true)
    setAnchorEl(event.currentTarget);
    setMenu(true)

  }

  const handleBoard = ()=>{
    setBoardOpen(true)
   setMenu(false)
  }
  const handleConfigure = ()=>{
    setConfigure(true)
   setMenu(false)
  }

  const handleClose = ()=>{
    setAnchorEl(null);
    setConfigure(false

    )
  }

  const handleMenuClose =()=>{
    setAnchorEl(null);
    setMenu(false)
  }

  useEffect(()=>{
    setBoardValue((prev)=>({...prev,BoardName : null,project : null}))
  },[createBoard])

  // console.log(id.id,'id7777',createProjectBoard)

  useEffect(() => { (async () => {
    const fetchData = async () => {
      await dispatch(getProjectsAction());
      const body = {
        Project_id: [],
      };
      await dispatch(createProjectBoardAction(body));
    };
  
    fetchData();
  })();
}, [dispatch,taskByStatus]);

  useEffect(() => {
    if (!taskByStatus?.[2]?.length) {
      return;
    }

    const boardTypeValue = taskByStatus[2][0].boardType;
    const defaultOption = boardTypeValue === 2 ? 'KanbanBoard' : 'ActiveSprints';
    const allowedOptions =
      boardTypeValue === 2
        ? ['Dashboard', 'Timeline', 'Epic', 'KanbanBoard', 'List', 'Reports']
        : ['Dashboard', 'Timeline', 'Epic', 'Backlog', 'ActiveSprints', 'List', 'Reports'];

    setSelectedOption((prev) => {
      if (prev && allowedOptions.includes(prev)) {
        return prev;
      }
      return defaultOption;
    });
  }, [taskByStatus]);

  useEffect(()=>{

    if(createProjectBoard.length > 0){
      const boardDetails = createProjectBoard.filter(e=>  e.project_id == id.id )
      const projectDetails = get_projects.filter(e=> e.boardType == boardDetails[boardDetails.length - 1]?.board_type && e.id == id.id)
      // console.log(projectDetails,'proje6666')
      if(boardDetails.length > 0){
        const lastBoardName = boardDetails[boardDetails.length - 1]?.board_name;
          setBoardName(lastBoardName)
      }
      // console.log(boardDetails,'boardDetails')
    }

    

  },[dispatch,createProjectBoard])

  // console.log(boardName,'boarfbbb7788',get_projects)

  const [paginateData,setPaginateData] = useState({
    searchString : '' 
  })

  const getTaskStatusPayload = useCallback(
    (searchString = '', empId = selectedEmpId) => ({
      searchString,
      id: id.id,
      ...(empId && empId !== 'all' ? { empId } : {}),
    }),
    [id.id, selectedEmpId],
  );

  const refreshTaskStatus = useCallback(
    (searchString = paginateData.searchString, empId = selectedEmpId) => {
      dispatch(
        setTaskByStatusAction({
          data: [],
        }),
      );

      dispatch(
        getTasksDataAction(
          getTaskStatusPayload(searchString, empId),
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    [
      dispatch,
      getTaskStatusPayload,
      paginateData.searchString,
      selectedEmpId,
      setLoaderStatusHandler,
      setModalTypeHandler,
    ],
  );

  const requestReportSearch = (e) => {
    const val = e.target.value;
    setReportSearchVal(val);
  };

  const cancelReportSearch = () => {
    setReportSearchVal('');
  };

  const requestSearch = (e)=>{
    const val = e.target.value;
    setPaginateData({...paginateData, searchString: val});
    refreshTaskStatus(val);
  }

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchString: ''});
    refreshTaskStatus('');
  }
  

  

  const projectTimeLine = (
    <Grid
      sx={{
        width: '100%',
        height: '70vh',
        overflowY: 'scroll',
        '&::-webkit-scrollbar': {
          width: 5,
        },
        '&::-webkit-scrollbar-track': {
          // backgroundColor: "#E0E0E0"
          '-webkit-box-shadow': 'inset 0 0 1px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#B2B2B2',
          borderRadius: 1,
          border: '2px solid white',
        },
      }}
    // onClick={toggleDrawer(false)}
    >
      <Grid>
        <Grid
          direction='row'
          justifyContent='center'
          alignItems='left'
          style={{ display: 'flex', alignItems: 'center', padding: '5px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Box
          // sx={{ 
          //   borderBottom: '2px solid black', 
          //   display: 'inline-block', 
          //   paddingBottom: '3px' 
          // }}
          >
            <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
              {'Time Line'}
            </Typography>
          </Box>
        </Grid>
        <Grid
          direction='row'
          justifyContent='center'
          alignItems='center'
          style={{ display: 'flex', alignItems: 'center', padding: '5px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='subtitle1'>
            {'Total Duration : '}
            {getProjectTravelTimeLine.totalDuration ?? '0'}
          </Typography>
        </Grid>

        <Grid
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px',
          }}
        >
          <Typography>
            {'Halt : '}
            {getProjectTravelTimeLine.totalHaltTime ?? '0'}
          </Typography>

          <Typography>
            {'Driven : '}
            {getProjectTravelTimeLine.totalMotion ?? '0'}
          </Typography>
        </Grid>
        {/* <Box
          sx={{
            ml: 'auto',
            textAlign: 'right',
          }}
        >
          <IconButton
            onClick={() => {
              toggleDrawer(false)
            }}
            sx={{
              p: 2,
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box> */}
      </Grid>
      <Grid sx={{ marginLeft: '-50px' }}>
        <Typography>
          {'Start'}
        </Typography>
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.4,
              // marginLeft: '10px'
            },
          }}
        >

          {open === true && getProjectTravelTimeLine.timeline?.length > 0 ? (
            <TimelineItem>
              <TimelineOppositeContent
                color='text.secondary'
                sx={{ width: '100%', fontSize: '11px', paddingLeft: '45px' }}
              >
                {moment(
                  getProjectTravelTimeLine?.timeline[0]?.time,
                  'HH:mm:ss',
                ).format('hh:mm A')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                {/* {"Start"} */}
                {/* <br/> */}
                <FlagCircleIcon />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ width: '100%', fontSize: '11px' }}>
                <Grid>
                  {getProjectTravelTimeLine?.timeline[0]?.latitude}
                  <br />
                  {getProjectTravelTimeLine?.timeline[0]?.longitude}
                </Grid>
              </TimelineContent>
            </TimelineItem>
          ) : (
            ''
          )}
          {getProjectTravelTimeLine.timeline &&
            getProjectTravelTimeLine.timeline.slice(1, -1).map((item, i) => {
              return (
                <TimelineItem key={i}>
                  <TimelineOppositeContent
                    color='text.secondary'
                    sx={{ width: '100%', fontSize: '12px', paddingLeft: '50px' }}
                  >
                    {item.type === 'HALT' && (
                      <>
                        <div>{moment(item.startTime, 'HH:mm:ss').format('hh:mm A')} - </div>
                        <div>{moment(item.endTime, 'HH:mm:ss').format('hh:mm A')}</div>
                      </>
                    )}

                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    {item.type === 'HALT' ? (
                      <DoDisturbOnIcon sx={{ fontSize: '15px' }} />
                    ) : (
                      <span style={{ color: 'grey' }}>⯯</span>
                    )}
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ width: '100%', fontSize: '11px' }}>
                    <Grid
                      style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Grid>
                        {item.type === 'HALT' && (
                          <>
                            {item.latitude}
                            <br />
                            {item.longitude}
                          </>
                        )}

                      </Grid>
                      {item.type === 'HALT' ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <DoDisturbOnIcon sx={{ fontSize: '15px' }} />
                          {`${item.timeDiff}`}
                        </div>
                      ) : (
                        <div
                          style={{ display: 'flex', align: 'left', gap: '5px' }}
                        >
                          <DirectionsBikeIcon sx={{ fontSize: '15px' }} />
                          {item.timeDiff ?? '0'}
                        </div>
                      )}
                    </Grid>
                  </TimelineContent>
                </TimelineItem>
              );
            })}

          {getProjectTravelTimeLine.timeline && (
            <TimelineItem>
              <TimelineOppositeContent
                color='text.secondary'
                sx={{ width: '100%', fontSize: '11px', paddingLeft: '45px' }}
              >
                {moment(getProjectTravelTimeLine?.timeline[getProjectTravelTimeLine.timeline.length - 1]?.time, 'HH:mm:ss').format('hh:mm A')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <FlagCircleTwoToneIcon />
                <br />
                {"End"}
                {/* <TimelineConnector /> */}
              </TimelineSeparator>
              <TimelineContent sx={{ width: '100%', fontSize: '11px' }}>
                <Grid>
                  {getProjectTravelTimeLine?.timeline[getProjectTravelTimeLine.timeline.length - 1]?.latitude}
                  <br />
                  {getProjectTravelTimeLine?.timeline[getProjectTravelTimeLine.timeline.length - 1]?.longitude}
                </Grid>
              </TimelineContent>
            </TimelineItem>
          )}
          {/* </>
        ) : (
          ''
        )} */}
          {/* <TimelineItem sx={{paddingRight:'35px'}}>
      <TimelineOppositeContent color="text.secondary" sx={{width:'100%',fontSize: '11px'}}>
        {moment(getProjectTravelTimeLine.timeline[lastIndexOf].startTime, 'HH:mm:ss').format('hh:mm A')}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <FlagCircleIcon />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>{'Ended'}</TimelineContent>
    </TimelineItem> */}
        </Timeline>
      </Grid>
    </Grid>
  );

  const colors = ['#f44336', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
  const MAX_VISIBLE_AVATARS = 5;
  const selectedRing = {
  boxShadow: '0 0 0 2px #1976d2', 
};

  const avatarItems = [
    {
      key: 'all',
      label: 'All',
      name: 'All Tasks',
      tooltip: 'All Tasks',
      bgColor: '#1976d2',
      selected: selectedEmpId === 'all',
      onClick: () => handleAvatarClick('all'),
    },
    {
      key: 'unassigned',
      label: 'U',
      name: 'Unassigned',
      tooltip: 'Unassigned Tasks',
      bgColor: '#9e9e9e',
      selected: selectedEmpId === 'unassigned',
      onClick: () => handleAvatarClick('unassigned'),
    },
    ...getEmployeeList.map((employee, index) => ({
      key: employee.employee_id,
      label: employee.first_name?.[0]?.toUpperCase() || '?',
      name: `${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}`,
      tooltip: `${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}`,
      bgColor: colors[index % colors.length],
      selected: selectedEmpId === employee.employee_id,
      onClick: () => handleAvatarClick(employee),
    })),
  ];

  const visibleAvatarItems = avatarItems.slice(0, MAX_VISIBLE_AVATARS);
  const overflowAvatarItems = avatarItems;
  const avatarStackCount = visibleAvatarItems.length + (overflowAvatarItems.length > 0 ? 1 : 0);
  const avatarStackWidth = Math.max(avatarStackCount, 1) * overlap + avatarSize;
  
  const handleAvatarClick = async (employee) => {
    let nextEmpId = 'all';

    if (employee === 'unassigned') {
      nextEmpId = selectedEmpId === 'unassigned' ? 'all' : 'unassigned';
    } else if (employee === 'all') {
      nextEmpId = 'all';
    } else {
      const employeeId = employee?.employee_id;
      nextEmpId = selectedEmpId === employeeId ? 'all' : employeeId;
    }

    setSelectedEmpId(nextEmpId);
    refreshTaskStatus(paginateData.searchString, nextEmpId);
  };
  
  
  // const currentUserRole = Storage?.role_name
  // const filteredEmployeeList = getEmployeeList.filter(
  //   (employee) =>
  //     (employee.role_name === 'Administrator' && currentUserRole === 'Administrator') ||
  //     employee.role_name !== 'Administrator'
  // ); 


  return (
    <>
      {!configure && !settings && (
       <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#f4f5f7' 
        }}
      >
          <Box
            width='100%'
            display='flex'
            flexDirection='row'
            alignItems='center'
            justifyContent='space-between'
            py={3}
          >
            <Breadcrumbs separator='>>' aria-label='breadcrumb'>
              <Button 
                onClick={onGoToBoardList}
                sx={{
                  mx: 2,
                  fontWeight: Fonts.MEDIUM,
                  fontSize: 15,
                  color: 'primary',
                  cursor: 'pointer',
                }}
              >
                {'Projects'}
              </Button >

              <Typography
                sx={{
                  mx: 2,
                  fontWeight: Fonts.MEDIUM,
                  fontSize: 15,
                  color: '#111827',
                }}
              >
                {projectData.project_name} {boardName ? `/ ${boardName}` : ''}
              </Typography>
              {(() => {
                const isScrum = Number(taskByStatus?.[2]?.[0]?.boardType) === 1;
                const isKanban = Number(taskByStatus?.[2]?.[0]?.boardType) === 2;
                const validOptions = [
                  'Dashboard', 'Timeline', 'Epic', 'List', 'Reports',
                  ...(isScrum ? ['Backlog', 'ActiveSprints'] : []),
                  ...(isKanban ? ['KanbanBoard'] : []),
                ];
                const safeSelectedOption = validOptions.includes(selectedOption) ? selectedOption : '';
                return (
              <Select
                value={safeSelectedOption}
                onChange={handleSelectChange}
                displayEmpty
                sx={{
                  ml: 2,
                  fontSize: 14,
                  fontWeight: 'medium',
                  color: '#111827',
                  '.MuiSelect-icon': {color: '#111827'},
                  height: 30,
                  lineHeight: 'normal',
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 'unset', // Remove scroll by removing height limit
                    },
                  },
                  MenuListProps: {
                    sx: {
                      padding: 0,
                    },
                  },
                }}
              >
                <MenuItem value='Dashboard'>Dashboard</MenuItem>
                <MenuItem value='Timeline'>Timeline</MenuItem>
                <MenuItem value='Epic'>Epic</MenuItem>
                {isScrum && <MenuItem value='Backlog'>Backlog</MenuItem>}
                {isScrum && <MenuItem value='ActiveSprints'>Active Sprints</MenuItem>}
                {isKanban && <MenuItem value='KanbanBoard'>Kanban Board</MenuItem>}
                <MenuItem value='List'>List</MenuItem>
                <MenuItem value='Reports'>Reports</MenuItem>
              </Select>
                 );
              })()}
            </Breadcrumbs>

            {selectedOption !== 'Dashboard' && (
              <Grid display={'flex'} justifyContent={'flex-end'} mr={10}>
                <Tooltip
                  title={'Settings'}
                  TransitionComponent={Fade}
                  TransitionProps={{timeout: 600}}
                  placement='top'
                >
                  <IconButton onClick={() => setSettings(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Box>

          {isAdmin &&
            (projectData.project_type === 4 ||
              projectData.project_type === 3) && (
              <>
                <Paper
                  elevation={3}
                  sx={{
                    backgroundColor: 'white',
                    padding: 2,
                    borderRadius: 2,
                    marginBottom: 3,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        aria-label='basic tabs example'
                        variant='fullWidth'
                        indicatorColor='secondary'
                        textColor='inherit'
                        sx={{
                          '& .MuiTabs-indicator': {
                            backgroundColor: '#757575',
                          },
                          '& .MuiTab-root.Mui-selected': {
                            color: '#757575',
                            // backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        {isAdmin && <Tab label='Tasks' />}
                        {isAdmin && <Tab label='Location History' />}
                        {isAdmin && projectData.project_type !== 3 && (
                          <Tab label='Travel History' />
                        )}
                      </Tabs>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}

          {tabIndex === 0 && (
            <>
              {projectData.project_type === 4 ? (
                <>
                  <Box
                    width='100%'
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    justifyContent='space-between'
                    px={3}
                    pt={2}
                  >
                    <Typography>
                      Total Task - {taskByStatus?.[3]?.[0]?.total_task ?? 0}
                    </Typography>
                    <Button onClick={onClickAddCard}>Create</Button>
                  </Box>
                  {Object.keys(taskByStatus).length &&
                    Object.keys(projectData).length && (
                      <AppsContainer fullView>
                        {selectedOption !== 'Backlog' && (
                          <Box
                            width='100%'
                            display='flex'
                            flexDirection='row'
                            alignItems='center'
                            justifyContent='space-between'
                            px={3}
                            pt={2}
                          >
                            <Typography>
                              Total Task - {taskByStatus?.[3]?.[0]?.total_task ?? 0}
                            </Typography>
                            <Button onClick={onClickAddCard}>Create</Button>
                          </Box>
                        )}
                        {selectedOption === 'Backlog' ? (
                          <>
                            <BackLog
                              projectId={projectData.id}
                              projectname={projectData.project_name}
                            />
                          </>
                        ) : (
                          // {selectedOption === "Timeline" ? (
                          //   <>
                          //   {/* <ProjectTimeline
                          //     projectId={projectData.id}
                          //     projectname={projectData.project_name}
                          //   /> */}
                          //   </>
                          // )}
                          <BoardDetailView
                            data={data}
                            boardDetail={data}
                            projectData={projectData}
                            setProjectData={setProjectData}
                            get_taskProjects={get_taskProjects}
                            taskByStatus={taskByStatus}
                            isAddCardOpen={isAddCardOpen}
                            setAddCardOpen={setAddCardOpen}
                            onClickAddCard={onClickAddCard}
                            onShowBacklog={handleShowBacklog}
                            rights={rights?.value}
                          />
                        )}
                      </AppsContainer>
                    )}
                </>
              ) : selectedOption === 'Backlog' ? (
                <>
                  <BackLog
                    projectId={projectData.id}
                    projectname={projectData.project_name}
                  />
                </>
              ) : selectedOption === 'Dashboard' ? (
                <ProjectDashboard projectId={projectData.id} />
              ) : selectedOption === 'Reports' ? (
                // <WorkLogReport project_id={id.id} />
                <ProjectReport project_id = {id.id} />
              ) : selectedOption === 'Timeline' ? (
                <>
                  <ProjectTimeline
                    projectId={projectData.id}
                    projectname={projectData.project_name}
                  />
                </>
              ) : selectedOption === 'List' ? (
                <>
                  {Object.keys(projectData).length && (
                      <BoardDetailView
                        data={data}
                        boardDetail={data}
                        projectData={projectData}
                        setProjectData={setProjectData}
                        get_taskProjects={get_taskProjects}
                        getProjectsReportList={getProjectsReportList}
                        get_epicList={get_epicList}
                        taskByStatus={taskByStatus}
                        isAddCardOpen={isAddCardOpen}
                        setAddCardOpen={setAddCardOpen}
                        onClickAddCard={onClickAddCard}
                        onShowBacklog={handleShowBacklog}
                        rights={rights?.value}
                        selectedOption={selectedOption}
                        reportSearchVal={reportSearchVal}
                        onRequestReportSearch={requestReportSearch}
                        onCancelReportSearch={cancelReportSearch}
                        onReportLoadMore={onReportLoadMore}
                        reportLoading={reportPage.loading}
                        reportTotalCount={getProjectsReportListTotal}
                        onDeleteReportTasks={onDeleteReportTasks}
                        onRefreshTaskStatus={refreshTaskStatus}
                      />
                    )}
                </>
              ) : selectedOption === 'Epic' ? (
                <>
                  {Object.keys(projectData).length && (
                    <EpicDeatail
                      data={data}
                      boardDetail={data}
                      projectData={projectData}
                      get_taskProjects={get_taskProjects}
                      taskByStatus={taskByStatus}
                      get_epicList={get_epicList}
                      setProjectData={setProjectData}
                      onRefreshEpics={refreshEpicList}

                    />
                  )}
                </>
              ) : (
                // :
                // selectedOption === "EpicList" ? (
                //   <>
                //     {Object.keys(projectData).length && (
                //       <BoardDetailView
                //         data={data}
                //         boardDetail={data}
                //         projectData={projectData}
                //         setProjectData={setProjectData}
                //         get_taskProjects={get_taskProjects}
                //         get_epicList={get_epicList}
                //         taskByStatus={taskByStatus}
                //         isAddCardOpen={isAddCardOpen}
                //         setAddCardOpen={setAddCardOpen}
                //         onClickAddCard={onClickAddCard}
                //         onShowBacklog={handleShowBacklog}
                //         rights={rights?.value}
                //         selectedOption={selectedOption}
                //       />
                //     )}
                //   </>
                // )

                <AppsContainer fullView>
                  <Box
                    width='100%'
                    display='flex'
                    flexDirection='row'
                    justifyContent='space-between'
                    flexWrap='nowrap'
                    alignItems='center' 
                    px={3}
                    pt={2}
                  >
                    <Grid container alignItems={'center'} width={'100%'} spacing={8}>
                      <Grid item>
                        <Box
                          sx={{
                            width: 280,
                            minWidth: 280,
                            maxWidth: 280,
                            '& .searchRoot': {
                              width: '100%',
                            },
                            '& .MuiInputBase-root': {
                              width: '100%',
                            },
                            '& .MuiInputBase-input': {
                              width: '100% !important',
                              boxSizing: 'border-box',
                            },
                            '& .MuiInputBase-input:focus': {
                              width: '100% !important',
                            },
                          }}
                        >
                          <CommonSearch
                            searchVal={paginateData.searchString}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                          />
                        </Box>
                      </Grid>
                          <Grid item>
                            <Typography>
                              Total Task - {taskByStatus?.[3]?.[0]?.total_task ?? 0}
                              </Typography>
                              </Grid>
                              </Grid>

                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                        width: `${avatarStackWidth}px`,
                        height: avatarSize,
                        flexShrink:0,
                          }}
                    >
                      {visibleAvatarItems.map((avatarItem, index) => (
                        <Tooltip
                          key={avatarItem.key}
                          title={avatarItem.tooltip}
                          arrow
                          placement='top'
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: `${index * overlap}px`,
                              width: avatarSize,
                              height: avatarSize,
                              display: 'inline-flex',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: avatarSize,
                                height: avatarSize,
                                fontSize: 'small',
                                bgcolor: avatarItem.bgColor,
                                zIndex: avatarStackCount - index + 1,
                                border: '2px solid white',
                                cursor: 'pointer',
                                ...(avatarItem.selected && selectedRing),
                              }}
                              onClick={avatarItem.onClick}
                            >
                              {avatarItem.label}
                            </Avatar>
                          </span>
                        </Tooltip>
                      ))}

                      {overflowAvatarItems.length > 0 && (
                        <Tooltip
                          title={`+${overflowAvatarItems.length} more`}
                          arrow
                          placement='top'
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: `${visibleAvatarItems.length * overlap}px`,
                              width: avatarSize,
                              height: avatarSize,
                              display: 'inline-flex',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: avatarSize,
                                height: avatarSize,
                                fontSize: 'small',
                                bgcolor: '#4b5563',
                                border: '2px solid white',
                                cursor: 'pointer',
                              }}
                              onClick={(event) =>
                                setAvatarOverflowAnchorEl(event.currentTarget)
                              }
                            >
                              +{overflowAvatarItems.length}
                            </Avatar>
                          </span>
                        </Tooltip>
                      )}
                    </Box>

                    <Popover
                      open={Boolean(avatarOverflowAnchorEl)}
                      anchorEl={avatarOverflowAnchorEl}
                      onClose={() => setAvatarOverflowAnchorEl(null)}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                      transformOrigin={{vertical: 'top', horizontal: 'right'}}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 240,
                          maxHeight: 220,
                          overflowY: 'auto',
                          color: '#f3f4f6',
                          border: '1px solid #3f4350',
                          p: 2,
                        },
                      }}
                    >
                      <Box py={0.5}>
                        {overflowAvatarItems.map((avatarItem) => (
                          <Box
                            key={avatarItem.key}
                            onClick={() => {
                              avatarItem.onClick();
                              setAvatarOverflowAnchorEl(null);
                            }}
                            sx={{
                              px: 1,
                              py: 0.75,
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Checkbox
                              checked={avatarItem.selected}
                              onChange={() => {}}
                              sx={{
                                color: '#9ca3af',
                                '&.Mui-checked': {
                                  color: '#60a5fa',
                                },
                                p: 0.5,
                                mr: 1,
                              }}
                            />
                            <Avatar
                              sx={{
                                width: 26,
                                height: 26,
                                fontSize: 12,
                                bgcolor: avatarItem.bgColor,
                                mr: 1.2,
                              }}
                            >
                              {avatarItem.label}
                            </Avatar>
                            <Typography variant='body2' sx={{color: '#2c2d2e'}}>
                              {avatarItem.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Popover>

                    <Dialog open={boardOpen} fullWidth maxWidth='md'>
                      <Grid container spacing={3} p={7}>
                        <Typography variant='H1' pb={2}>
                          Update Board Type
                        </Typography>
                        <Grid container spacing={5}>
                          <Grid size={6}>
                            <Box
                              display='flex'
                              flexDirection='column'
                              justifyContent='space-between'
                              height='100%'
                            >
                              <Typography variant='H1' fontWeight='bold' pb={1}>
                                Scrum
                              </Typography>
                              <Typography pb={2} lineHeight={1.5}>
                                Scrum focuses on planning, committing, and
                                delivering time-boxed chunks of work called
                                Sprints.
                              </Typography>
                              <Button
                                variant='outlined'
                                onClick={() => {
                                  setBoardOpen(false);
                                  setCreateBoard(true);
                                  setBoardType(1);
                                }}
                              >
                                Update a Scrum Board
                              </Button>
                            </Box>
                          </Grid>
                          <Grid size={6}>
                            <Box
                              display='flex'
                              flexDirection='column'
                              justifyContent='space-between'
                              height='100%'
                            >
                              <Typography variant='H1' fontWeight='bold' pb={1}>
                                Kanban
                              </Typography>
                              <Typography pb={2} lineHeight={1.5}>
                                Kanban focuses on visualizing your workflow and
                                limiting work-in-progress to facilitate
                                incremental improvements to your existing
                                process.
                              </Typography>
                              <Button
                                variant='outlined'
                                onClick={() => {
                                  setBoardOpen(false);
                                  setCreateBoard(true);
                                  setBoardType(2);
                                }}
                              >
                                Update a Kanban Board
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                        <Grid
                          container
                          justifyContent='flex-end'
                          mt={2}
                          size={12}
                        >
                          <Button
                            variant='contained'
                            onClick={() => setBoardOpen(false)}
                          >
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </Dialog>

                    <Dialog open={createBoard} fullWidth maxWidth='md'>
                      <Grid p={'2%'}>
                        <Grid pb={'10px'}>
                          <Typography variant='H1'>Name this board</Typography>
                        </Grid>
                        <Grid container spacing={5}>
                          <Grid
                            size={{
                              lg: 5,
                              md: 5,
                              sm: 6,
                              xs: 12,
                            }}
                          >
                            <TextField
                              label='Board Name'
                              name='BoardName'
                              fullWidth
                              value={boardValues.BoardName || ''}
                              required
                              variant='filled'
                              onChange={(e) =>
                                handleBoardChange('BoardName', e.target.value)
                              }
                              error={errBoardValues.BoardName}
                              helperText={errBoardValues.BoardName || ''}
                            />
                          </Grid>

                          <Grid
                            size={{
                              lg: 5,
                              md: 5,
                              sm: 6,
                              xs: 12,
                            }}
                          >
                            <Autocomplete
                              sx={{zIndex: '1'}}
                              multiple
                              disablePortal={false}
                              options={get_projects}
                              getOptionLabel={(option) => option.project_name}
                              value={boardValues.project || []}
                              onChange={(event, newValue) =>
                                handleBoardChange('project', newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label='Select Projects'
                                  required
                                  variant='filled'
                                  error={Boolean(errBoardValues.project)}
                                  helperText={errBoardValues.project || ''}
                                />
                              )}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 200,
                                    overflow: 'auto',
                                  },
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid
                          container
                          justifyContent='flex-end'
                          mt={2}
                          spacing={3}
                          size={12}
                        >
                          <Grid>
                            <Button
                              variant='outlined'
                              onClick={() => {
                                setCreateBoard(false);
                                setBoardOpen(true);
                              }}
                            >
                              Back
                            </Button>
                          </Grid>
                          <Grid>
                            <Button
                              variant='contained'
                              onClick={handleBoardCreate}
                            >
                              Create Board
                            </Button>
                          </Grid>

                          <Grid>
                            <Button
                              variant='outlined'
                              onClick={() => setCreateBoard(false)}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Dialog>
                    <Grid
                      container
                      maxWidth={'600px'}
                      spacing={2}
                      justifyContent={'flex-end'}
                      sx={{ flexShrink:0}}
                    >
                      <Grid>
                        <Button
                          sx={{
                            bgcolor: 'rgb(240, 240, 240)',
                            color: 'rgb(60, 60, 60)',
                  }}
                          onClick={onClickAddCard}
                        >
                          Create Task
                        </Button>
                      </Grid>

                      <Menu
                        id='fade-menu'
                        MenuListProps={{
                          'aria-labelledby': 'fade-button',
                        }}
                        anchorEl={anchorEl}
                        open={menu}
                        onClose={handleMenuClose}
                        TransitionComponent={Fade}
                      >
                        <MenuItem onClick={handleBoard}>Create Board</MenuItem>
                        <MenuItem onClick={handleConfigure}>
                          Configure Board
                        </MenuItem>
                      </Menu>
                      <Grid>
                        <IconButton onClick={handleDialog}>
                          <MoreHorizIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                  {Object.keys(taskByStatus).length &&
                    Object.keys(projectData).length && (
                      <BoardDetailView
                        data={data}
                        boardDetail={data}
                        projectData={projectData}
                        setProjectData={setProjectData}
                        get_taskProjects={get_taskProjects}
                        taskByStatus={taskByStatus}
                        isAddCardOpen={isAddCardOpen}
                        setAddCardOpen={setAddCardOpen}
                        onClickAddCard={onClickAddCard}
                        onShowBacklog={handleShowBacklog}
                        rights={rights?.value}
                        onRefreshTaskStatus={refreshTaskStatus}
                      />
                    )}
                </AppsContainer>
              )}
            </>
          )}

          {tabIndex === 1 && (
            <>
              {projectData.project_type === 3 ? (
                <>
                  <Grid
                    container
                    display={'flex'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    spacing={4}
                  >
                    <Grid
                      size={{
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12,
                      }}
                    >
                      <FormControl fullWidth variant='filled'>
                        <CommonUserAutoCompleteForSingleUser
                          searchVal={searchValEmployeeFilter}
                          setSearchValEmployeeFilter={
                            setSearchValEmployeeFilter
                          }
                          requestSearch={requestSearchEmployeeFilter1}
                          value={value2[0]}
                          setValue={(d) => {
                            handleChangeEmployeeNameLocation([d]);
                          }}
                          type={get_empbasecompany}
                          searchType={searchCompanyBasedEmployeeFilter}
                          labelName='Select Employee'
                        />
                      </FormControl>
                    </Grid>

                    <Grid
                      size={{
                        lg: 4,
                        md: 3,
                        sm: 6,
                        xs: 12,
                      }}
                    >
                      <Stack
                        direction='row'
                        display='flex'
                        alignItems='center'
                        gap={1}
                        sx={{m: 1}}
                      >
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                            name='date'
                            disableFuture
                            label='Date'
                            inputVariant='outlined'
                            format='DD/MM/YYYY'
                            value={toMomentOrNull(filterDate1.date)}
                            required={true}
                            onChange={(date) =>
                              handleDateChangeLocation({
                                target: {value: date, name: 'date'},
                              })
                            }
                            fullWidth={true}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'filled',
                                error: formErrors.date === null ? false : true,
                                helperText:
                                  formErrors.date === null
                                    ? ''
                                    : formErrors.date,
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                    <Grid
                      size={{
                        lg: 1.5,
                        md: 3,
                        sm: 6,
                        xs: 12,
                      }}
                    >
                      <Button
                        color='primary'
                        variant='contained'
                        style={{marginRight: '20px'}}
                        onClick={handleSubmitLocation}
                        disabled={
                          !value2.filter(Boolean).length ||
                          !isValidDate(filterDate1.date)
                        }
                      >
                        Apply
                      </Button>
                    </Grid>
                  </Grid>
                </>
              ) : (
                ''
              )}
              {showAlert && (
                <Alert severity='error' onClose={() => setShowAlert(false)}>
                  No data available for the selected employee and date.
                </Alert>
              )}
              <Grid size={12}>
                <OpenStreetMap
                  zoom={zoom}
                  selectedEmployeeId={appliedEmployeeId}
                  selectedDate={appliedDate}
                  projectData={projectData}
                  getTaskLogs={getTaskLogs}
                />
              </Grid>
            </>
          )}

          {tabIndex === 2 && (
            <>
              <Grid
                container
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                spacing={4}
              >
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 5,
                    xs: 11,
                  }}
                >
                  <FormControl fullWidth variant='filled'>
                    <InputLabel id='demo-multiple-name-label'>
                      Select Task
                    </InputLabel>
                    <Select
                      labelId='demo-multiple-name-label'
                      id='task-dropdown'
                      required={true}
                      value={selectedTask || ''}
                      onChange={(e) => {
                        setSelectedTask(e.target.value);
                        setFormErrors({...formErrors, task_id: null});
                      }}
                    >
                      {get_taskProjects.map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                          {task.task_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 5,
                    xs: 11,
                  }}
                >
                  <FormControl fullWidth variant='filled'>
                    <CommonUserAutoCompleteForSingleUser
                      searchVal={searchValEmployeeFilter}
                      setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                      requestSearch={requestSearchEmployeeFilter}
                      value={value1[0]}
                      setValue={(d) => {
                        handleChangeEmployeeName([d]);
                      }}
                      type={get_empbasecompany}
                      searchType={searchCompanyBasedEmployeeFilter}
                      labelName='Select Employee'
                    />
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 5,
                    xs: 11,
                  }}
                >
                  <Stack
                    direction='row'
                    diaplay='flex'
                    alignItems='center'
                    gap={1}
                    sx={{m: 1}}
                  >
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='date'
                        disableFuture
                        label='Date'
                        maxDate={yesterday}
                        inputVariant='outlined'
                        format='DD/MM/YYYY'
                        value={toMomentOrNull(filterDate.date)}
                        required={true}
                        onChange={(date) =>
                          handleDateChange({
                            target: {value: date, name: 'date'},
                          })
                        }
                        fullWidth={true}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'filled',
                            error: formErrors.date === null ? false : true,
                            helperText:
                              formErrors.date === null ? '' : formErrors.date,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>
                </Grid>
                <Grid
                  size={{
                    lg: 1.5,
                    md: 3,
                    sm: 6,
                    xs: 12,
                  }}
                >
                  <Button
                    color='primary'
                    variant='contained'
                    style={{marginRight: '20px'}}
                    onClick={handleSubmit}
                    disabled={
                      !value1.filter(Boolean).length ||
                      !isValidDate(filterDate.date) ||
                      !selectedTask
                    }
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {submitted ? (
                  <>
                    <Grid
                      sx={{backgroundColor: 'white'}}
                      size={{
                        lg: 4,
                        md: 6,
                        sm: 12,
                      }}
                    >
                      {projectTimeLine}
                    </Grid>
                    <Grid
                      size={{
                        lg: 8,
                        md: 6,
                        sm: 12,
                      }}
                    >
                      <MapTravelHistory
                        zoom={zoom}
                        employeeId={employeeId}
                        polylineCoords={getProjectTravelTimeLine.timeline}
                        setPolylineCoords={setPolylineCoords}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid size={12}>
                    <MapTravelHistory
                      zoom={zoom}
                      // employeeId={employeeId}
                      // polylineCoords={getProjectTravelTimeLine.timeline}
                      // setPolylineCoords={setPolylineCoords}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </Box>
      )}
      {configure && (
        <div>
          <ConfigurationSubMenu id={id.id} handleClose={handleClose} />
        </div>
      )}
      {settings && (
        <div>
          <ProjectSettings
            handleClose={() => setSettings(false)}
            data={get_projects}
            project_id={id.id}
          />
        </div>
      )}
    </>
  );
};

export default BoardDetail;

