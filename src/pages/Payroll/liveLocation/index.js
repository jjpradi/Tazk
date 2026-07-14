import {Grid, Typography, Button, Card, ButtonGroup, Box, Tab, FormControl, InputLabel, Select, MenuItem, FormHelperText, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, CssBaseline, Toolbar, IconButton} from '@mui/material';
import React, {useEffect, useState, useContext, useRef} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {setLiveLocationData} from 'redux/actions/fuelAllowance_actions';
import {getEmpBasedTravelHistoryAction, getTravelTimeLineAction, liveLocationAction,setLiveLocationAction, projectLiveLocationAction, setProjectLiveLocationAction, getProjectEmpBasedTravelHistoryAction, getProjectTravelTimeLineAction  } from 'redux/actions/liveLocation';
import {getSalesManVisitsAction} from 'redux/actions/salesMan_action';
import { Helmet } from "react-helmet-async";
import http, { titleURL } from '../../../http-common';
import {clientwebsocket } from '../../../http-common'
import {eventList, websocketEvents} from '../../../http-common';
import CloseIcon from '@mui/icons-material/Close';

// import io from 'socket.io-client';
// const socket = io.connect('http://localhost:5000');

import moment from 'moment';
import {
  GoogleMap,
  InfoWindow,
  // Marker,
  useLoadScript,
} from '@react-google-maps/api';
import _ from 'lodash';
import activeIcon from '../../../assets/icon/active.png';
import flag from '../../../assets/icon/flag.png';
import inActiveIcon from '../../../assets/icon/inactive.png';
import redFlag from '../../../assets/icon/redFlag.png';
import greenFlag from '../../../assets/icon/greenFlag.png';
import {MapContainer, TileLayer, Marker, Popup, Polyline, Polygon as polygons} from 'react-leaflet';
import L from 'leaflet';
import '../../../assets/styleSheet/Leaflet/index.css';
import useGeoLocation from 'utils/useGeoLocation';
import apiCalls from 'utils/apiCalls';
import axios from 'axios';
import { parse } from 'stylis';
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
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import MuiAppBar from '@mui/material/AppBar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import FlagCircleTwoToneIcon from '@mui/icons-material/FlagCircleTwoTone';
import StoreIcon from '@mui/icons-material/Store';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import payrollDashboard_services from 'services/payrollDashboard_services';
import context from '../../../context/CreateNewButtonContext';
import { capitalize } from 'lodash';
import DoDisturbOnIcon from '@mui/icons-material/DoDisturbOn';
import { getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee} from '../../../redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import  CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import Routing from "../../sales/salesman/RoutingControl";
import socketManager from '../../../utils/socketManager';
import toMomentOrNull from 'utils/DateFixer';
import {MAPTILER_TILE_URL, osmMapTiler as osm} from 'shared/constants/MapTiles';


const InActiveIcon = new L.Icon({
  iconUrl: inActiveIcon,
  iconSize: [40, 45],
});

const ActiveIcon = new L.Icon({
  iconUrl: activeIcon,
  iconSize: [20, 23],
  iconAnchor: [17, 35],
  popupAnchor: [3, -46],
});

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

export function OpenStreetMap({zoom}) {
  const dispatch = useDispatch();
  const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
  const ZOOM_LEVEL = zoom;
  const mapRef = useRef(null);
  const location = useGeoLocation();
  const {
    fuelAllowanceReducer: {salesManLiveTrackingData},
    LiveLocationReducer :{liveLocationDetails, ProjectLiveLocationDetails },
   
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
    // console.log("0000",liveLocationDetails?.length > 0)

    if (liveLocationDetails?.length > 0 && mapRef.current) {
      
      const bounds = liveLocationDetails.map(marker => [parseFloat(marker?.latitude),parseFloat(marker?.longitude)]);
      // console.log("bounds",bounds)
      mapRef.current.leafletElement.fitBounds(bounds);
    }
  }, [liveLocationDetails?.length, mapRef?.current]);

  return (
    <Grid size={12}>
      {/* <Button onClick={showMyLocation} variant='contained'>
        Show my location
      </Button> */}
      <MapContainer
        center={center} zoom={zoom} scrollWheelZoom={true} ref={mapRef}
        // bounds={liveLocationDetails?.map((i)=>{
        //   return [i?.latitude,i?.longitude]
        // })}
      >
        <TileLayer
          url={osm.mapTiler.url}
          attribution={osm.mapTiler.attribution}
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
        {liveLocationDetails.length > 0 &&
          liveLocationDetails.map(
            ({employee_id,latitude,longitude,first_name, taskMap}) => (
              <Marker
                icon={
                  // moment(new Date()).diff(moment(timestamp), 'minutes') > 10
                  //   ? InActiveIcon
                  //   :
                     ActiveIcon
                }
                key={employee_id}
                position={[latitude,longitude]}
              >
                <Popup>
                  <b>{first_name}</b>
                  <b>{employee_id}</b>
                </Popup>
              </Marker>
            ),
          )}
      </MapContainer>
    </Grid>
  );
}



export function MapTravelHistory({zoom, employeeId, polylineCoords, setPolylineCoords}) {
  const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
  // const [polylineCoords, setPolylineCoords] = useState([])
  const { LiveLocationReducer :{empBasedTravelHistory}, } = useSelector((state) => state);
  const ZOOM_LEVEL = 13;
  const mapRef = useRef(null);
    const dispatch = useDispatch();
    const currentDateTime = moment();
    console.log('Current Date and Time:', currentDateTime.format('DD-MM-YYYY hh:mm A'));
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
    }, [polylineCoords?.length, mapRef?.current,routingControlVisible]);

    const toggleRoutingControl = () => {
      setRoutingControlVisible(prevState => !prevState);
    };

    console.log('employeeId',employeeId);

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

    console.log('empBasedTravelHistory',empBasedTravelHistory)

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
              ({ first_name, employee_id, latitude, longitude, last_name, createdAt,type }, index) => (
                <React.Fragment key={employee_id}>
                 {type !== "MOTION" && (
                  <Marker
                    icon={type === "START" ? startIcon : type === "END" ? endIcon : ActiveIcon}
                    position={[latitude, longitude]}
                  >
                    <Popup>
                      {/* <Typography>{first_name} {last_name}</Typography> */}
                      <Typography>{type}</Typography>
                      <Typography>{latitude}</Typography>
                      <Typography>{longitude}</Typography>
                      {/* <Typography>{moment(createdAt).format('DD/MM/YYYY hh:mm A')}</Typography> */}
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
  
// export function MapTravelHistoryProject({zoom, employeeId, projectPolylineCoords, setprojectPolylineCoords}) {
//   const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
//   // const [polylineCoords, setPolylineCoords] = useState([])
//   const { LiveLocationReducer :{empBasedTravelHistory}, } = useSelector((state) => state);
//   const ZOOM_LEVEL = zoom;
//   const mapRef = useRef(null);
//     const dispatch = useDispatch();
//     const currentDateTime = moment();
//     console.log('Current Date and Time:', currentDateTime.format('DD-MM-YYYY hh:mm A'));

   
    
//     useEffect(() => {
  
//       if (projectPolylineCoords?.length > 0 && mapRef.current) {
        
//         const bounds = projectPolylineCoords.map(marker => [parseFloat(marker?.latitude),parseFloat(marker?.longitude)]);
//         mapRef.current.leafletElement.fitBounds(bounds);
//       }
//     }, [projectPolylineCoords?.length, mapRef?.current]);

//     console.log('employeeId',employeeId);

//     // useEffect(() => {      
//     //   setPolylineCoords([])
//     //   if(employeeId){
//     //     dispatch(getEmpBasedTravelHistoryAction(employeeId, (response, resdata) => {
//     //       if (response === 200) {
//     //         setPolylineCoords(resdata)
//     //       }
//     //     }));
//     //   }
//     // }, [employeeId])

//     console.log('empBasedTravelHistory',empBasedTravelHistory)

//     const polylineCoords1 = [
//       [12.9716, 77.5946], // Bangalore, India
//       [19.076, 72.8777],  // Mumbai, India
//       // [28.7041, 77.1025], // Delhi, India
//     ];
  
//     return (
//       <Grid size={12}>
//         <Map center={center} zoom={ZOOM_LEVEL} scrollWheelZoom={true} ref={mapRef}>
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap1</a> contributors'
//             // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             url={MAPTILER_TILE_URL}
//           />

//           {/* Render polyline */}
//           {
//             projectPolylineCoords.length > 0 && projectPolylineCoords.map(
//               ({ first_name, employee_id, latitude, longitude, last_name, createdAt }, index) => (
//                 <React.Fragment key={employee_id}>
//                   <Marker
//                     icon={ActiveIcon}
//                     position={[latitude, longitude]}
//                   >
//                     <Popup>
//                       <Typography>{first_name} {last_name}</Typography>
//                       <Typography>{latitude}</Typography>
//                       <Typography>{longitude}</Typography>
//                       <Typography>{moment(createdAt).format('DD/MM/YYYY hh:mm A')}</Typography>
//                     </Popup>
//                   </Marker>
//                   {index > 0 && (
//                     <Polyline
//                       pathOptions={{ color: 'black' }}
//                       positions={[
//                         [projectPolylineCoords[index - 1].latitude, projectPolylineCoords[index - 1].longitude],
//                         [latitude, longitude]
//                       ]}
//                     />
//                   )}
//                 </React.Fragment>
//               )
//             )
//           }

//         </Map>
//       </Grid>
//     );
//   };


function LiveLocation() {
  const {setModalTypeHandler, setLoaderStatusHandler, headerLocationId,
    setHeaderLocationIdHandeler} = useContext(
    CreateNewButtonContext,
  );

  const curDate = moment()
  const yesterday = curDate.subtract(1, 'days')

  const [zoom, setZoom] = useState(10); 
  const [manualUser, setManualUser] = useState({
    lat: 13.002201,
    lng: 80.248281,
  });
  const dispatch = useDispatch();
  const {
    // fuelAllowanceReducer: {salesManLiveTrackingData},
    LiveLocationReducer :{liveLocationDetails, empTravelTimeline, ProjectLiveLocationDetails, getProjectTravelTimeLine, getProjectEmpBasedTravelHistory },
    attendanceReducer: { get_empbasecompany ,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
  } = useSelector((state) => state);

  localStorage.setItem('travelHistory', JSON.stringify(liveLocationDetails));
  localStorage.setItem('projectTravelHistory', JSON.stringify(ProjectLiveLocationDetails));

  function liveLocation({event, content}){
    if (event === 'liveLocation') {
      console.log("tttttt",liveLocationDetails)
      let tempArr = [];
      let index = liveLocationDetails.findIndex(
        (x) => x.employee_id === content.employee_id,
      );
      console.log("emfgf",index);
      if (index === -1) {
        tempArr = liveLocationDetails;
        tempArr.push(content);
        console.log("dffv",tempArr);
      } else {
        tempArr = liveLocationDetails;
        tempArr[index] = content;
      }
      console.log("thusdf",tempArr);
      dispatch(setLiveLocationAction(tempArr));
    }
  }


console.log("empTravelTimeline",empTravelTimeline.timeline);

  const [selectedAll, setSelectedAll] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

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
    // }
    // }),
    // );
  
  };

  useEffect(() => {
    if (!get_empbasecompany.length) {
      dispatch(getEmpbasecompanyAction())
    }
    
  }, []);

    useEffect(() => {
    const rootSocket = socketManager.getSocket("/");

    if (!rootSocket) {
      return;
    }

    const handleliveTracking = (content) => {
     try{
  
      console.log("tttttt",liveLocationDetails)
      let tempArr = [];
      let index = liveLocationDetails.findIndex(
        (x) => x.employee_id === content.employee_id,
      );
      console.log("emfgf",index);
      if (index === -1) {
        tempArr = liveLocationDetails;
        tempArr.push(content);
        console.log("dffv",tempArr);
      } else {
        tempArr = liveLocationDetails;
        tempArr[index] = content;
      }
      console.log("thusdf",tempArr);
      dispatch(setLiveLocationAction(tempArr));
    
     }catch(e){
        console.log("e",e)
     }
    };
    rootSocket.on("liveLocation", handleliveTracking);

    return () => {
      rootSocket.off("liveLocation", handleliveTracking);
    };
  }, []);


  const [employeeId, setEmployeeId] = useState();
  const [date, setDate] = useState(null);
  const [date1, setDate1] = useState(null);
  const [value, setValue] = React.useState('1');
  const currentMonth = moment().startOf('month');
  const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
  const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');
  const currentDate = moment().format('YYYY-MM-DD');
  const [filterDate, setFilterDate] = React.useState({
    date:  new Date(new Date().setDate(new Date().getDate() - 1)),
    // to: moment(lastDateOfMonth),
  });
  const [filterDate1, setFilterDate1] = React.useState({
    date1:  new Date(),
    // to: moment(lastDateOfMonth),
  });
  console.log('ssss',filterDate.date);
  const [formErrors, setFormErrors] = useState({
    date: null,
    date1: null,
    to: null,
    empName:null
  });
  const [error, setError] = useState(false);
  const [polylineCoords, setPolylineCoords] = useState([])
  const [projectPolylineCoords, setprojectPolylineCoords] = useState([])
  const [openProject, setOpenProject] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const toggleDrawerProject = (newOpenProject) => () => {
    setOpenProject(newOpenProject);
  };

  // const handleSelectChange = (event) => {
  //   setEmployeeId(event.target.value);
  //   setError(event.target.value === '');
  // };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const handleDateChange = (data) => {
  //   var date_val = data.target.value._d;
  //   setFilterDate({ ...filterDate, [data.target.name]: date_val });
  //   if (moment(filterDate.from, 'year') <= moment(filterDate.to, 'year')) {
  //       if (moment(filterDate.from, 'month') <= moment(filterDate.to, 'month')) {
  //         if (moment(filterDate.from, 'day') <= moment(filterDate.to, 'day')) {    
  //             setFormErrors({ ...formErrors, from: '', to: '' });
  //         } else {
  //             setFormErrors({...formErrors, [data.target.name]: 'Invalid Date 1'});
  //         }
  //       } else {
  //           setFormErrors({...formErrors, [data.target.name]: 'Invalid Date 2'});
  //       }
  //   } else {
  //       setFormErrors({...formErrors, [data.target.name]: 'Invalid Date 3'});
  //   }
  // };

  const handleDateChange = (data) => {
    const { name, value } = data?.target;
    const date_val = value?._d;
    setFilterDate(prevState => ({ ...prevState, [name]: date_val }));
    const fromDate = moment(name === "date" ? date_val : filterDate.date);
    const toDate = moment(name === "to" ? date_val : filterDate.to);
    if (toDate.isSameOrAfter(fromDate)) {
        setFormErrors(prevState => ({ ...prevState, date : null, to : null }));
    } else {
        setFormErrors(prevState => ({ ...prevState, [name]: 'Invalid Date' }));
    }
  }

  const handleDateChange1 = (data) => {
    const { name, value } = data?.target;
    const date_val = value?._d;
    setFilterDate1(prevState => ({ ...prevState, [name]: date_val }));
    const fromDate = moment(name === "date1" ? date_val : filterDate1.date1);
    const toDate = moment(name === "to" ? date_val : filterDate1.to);
    if (toDate.isSameOrAfter(fromDate)) {
        setFormErrors(prevState => ({ ...prevState, date1 : null, to : null }));
    } else {
        setFormErrors(prevState => ({ ...prevState, [name]: 'Invalid Date' }));
    }
  }

  const [value1, setValue1] = React.useState([]);
  const [value2, setValue2] = React.useState([]);
 
  console.log("sdfsdf",value1)

  const handleChangeEmployeeName =(val)=>{
    setValue1(val)
    if(val?.length > 0){
     setFormErrors({...formErrors,empName:null})
    }

  }
  
  const handleChangeEmployeeNameProject =(val)=>{
    setValue2(val)
    if(val?.length > 0){
     setFormErrors({...formErrors,empName:null})
    }

}


  const handleSubmit = async () => {

    if (selectedAll) {

    

      dispatch(getEmpbasecompanyAction({} ,(res)=>{
        if (res) {
          processFunction(res)
        }
      }))
     
    }

    else {

      processFunction(value1)
    }
  };

  const projectHandleSubmit = async () => {

    if (selectedAll) {

    

      dispatch(getEmpbasecompanyAction({} ,(res)=>{
        if (res) {
          processProjectFunction(res)
        }
      }))
     
    }

    else {

      processProjectFunction(value2)
    }
  };

  const processFunction = (value) =>{
    
    if(value.length === 0){
      setFormErrors({...formErrors,empName:'Employee is required'})
      return 
    }
    console.log("dfgsssfs")
    let payLoad = {
      date : moment(filterDate?.date).format('YYYY-MM-DD'),
      // toDate : moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      employeeId : value.map((d)=> d.employee_id)
    }

    console.log("sdsf",payLoad)

    setPolylineCoords([])
      // if(employeeId){  
        console.log("dgdfgdfg")      
        setError(false)
        if(formErrors.date === null && formErrors.to === null){
          dispatch(getEmpBasedTravelHistoryAction(payLoad, (response, resdata) => {
            if (response === 200) {
              setPolylineCoords(resdata)
            }
          }));
          dispatch(getTravelTimeLineAction(payLoad, () => {
            toggleDrawer(true)()
          } ));
        }
  }
  const processProjectFunction = (value) =>{
    
    if(value.length === 0){
      setFormErrors({...formErrors,empName:'Employee is required'})
      return 
    }
    console.log("dfgsssfs")
    let payLoad = {
      date1 : moment(filterDate1?.date1).format('YYYY-MM-DD'),
      employeeId: value.map((d) => d.employee_id),
      project_id: 1,
      task_id: 2
    }

    console.log("sdsf",payLoad)

    setPolylineCoords([])
      // if(employeeId){  
        console.log("dgdfgdfg")      
        setError(false)
        if(formErrors.date1 === null && formErrors.to === null){
          dispatch(getProjectEmpBasedTravelHistoryAction(payLoad, (response, resdata) => {
            if (response === 200) {
              setPolylineCoords(resdata)
            }
          }));
          dispatch(getProjectTravelTimeLineAction(payLoad, () => {
            toggleDrawerProject(true)()
          } ));
        }
  }

  const TimeLine = (
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
          style={{display: 'flex', alignItems: 'center', padding: '5px'}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='subtitle1'>
            {'Total Duration : '}
            {empTravelTimeline.totalDuration ?? '0'}
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
            {empTravelTimeline.totalHaltTime ?? '0'}
          </Typography>

          <Typography>
            {'Driven : '}
            {empTravelTimeline.totalMotion ?? '0'}
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
      <Grid sx={{marginLeft: '-50px'}}>
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
          
          {open === true && empTravelTimeline.timeline?.length > 0 ? (
            <TimelineItem>
              <TimelineOppositeContent
                color='text.secondary'
                sx={{width: '100%', fontSize: '11px', paddingLeft: '45px'}}
              >
                {moment(
                  empTravelTimeline?.timeline[0]?.time,
                  'HH:mm:ss',
                ).format('hh:mm A')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                {/* {"Start"} */}
                {/* <br/> */}
                <FlagCircleIcon />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent  sx={{width: '100%', fontSize: '11px'}}>
                <Grid>
                        {empTravelTimeline?.timeline[0]?.latitude}
                        <br />
                        {empTravelTimeline?.timeline[0]?.longitude}
                      </Grid>
                      </TimelineContent>
            </TimelineItem>
          ) : (
            ''
          )}
          {empTravelTimeline.timeline &&
            empTravelTimeline.timeline.slice(1,-1).map((item, i) => {
              return (
                <TimelineItem key={i}>
                  <TimelineOppositeContent
                    color='text.secondary'
                    sx={{width: '100%', fontSize: '12px', paddingLeft: '50px'}}
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
                      <DoDisturbOnIcon sx={{fontSize: '15px'}} />
                    ) : (
                      <span style={{color: 'grey'}}>⯯</span>
                    )}
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{width: '100%', fontSize: '11px'}}>
                    <Grid
                      style={{display: 'flex', justifyContent: 'space-between'}}
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
                          <DoDisturbOnIcon sx={{fontSize: '15px'}} />
                          {`${item.timeDiff}`}
                        </div>
                      ) : (
                        <div
                          style={{display: 'flex', align: 'left', gap: '5px'}}
                        >
                          <DirectionsBikeIcon sx={{fontSize: '15px'}} />
                          {item.timeDiff ?? '0'}
                        </div>
                      )}
                    </Grid>
                  </TimelineContent>
                </TimelineItem>
              );
            })}

{empTravelTimeline.timeline && (
                <TimelineItem>
                  <TimelineOppositeContent
                    color='text.secondary'
                    sx={{ width: '100%', fontSize: '11px', paddingLeft: '45px' }}
                  >
                    {moment(empTravelTimeline?.timeline[empTravelTimeline.timeline.length - 1]?.time, 'HH:mm:ss').format('hh:mm A')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                  <FlagCircleTwoToneIcon/>
                  <br />
                  {"End"}
                    {/* <TimelineConnector /> */}
                  </TimelineSeparator>
                  <TimelineContent sx={{ width: '100%', fontSize: '11px' }}>
                  <Grid>
                        {empTravelTimeline?.timeline[empTravelTimeline.timeline.length - 1]?.latitude}
                        <br />
                        {empTravelTimeline?.timeline[empTravelTimeline.timeline.length - 1]?.longitude}
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
          {moment(empTravelTimeline.timeline[lastIndexOf].startTime, 'HH:mm:ss').format('hh:mm A')}
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

  // const projectTimeLine = (

  //   <Grid 
  //     sx={{ 
  //       width: 400,
  //       height:'70vh',
  //       overflowY: 'scroll',
  //       '&::-webkit-scrollbar': {
  //         width: 5,
  //       },
  //       '&::-webkit-scrollbar-track': {
  //         // backgroundColor: "#E0E0E0"
  //         '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
  //       },
  //       '&::-webkit-scrollbar-thumb': {
  //         backgroundColor: '#B2B2B2',
  //         borderRadius: 2,
  //         border: '2px solid white',
  //       }
  //     }}
  //     onClick={toggleDrawerProject(false)}
  //   >
  //     <Grid 
  //       style={{display:'flex', justifyContent:'flex-start', gap:"40px", padding:'20px'}}
  //     >
  //       <div style={{display:'flex', alignItems:'center'}}>
  //         <StoreIcon />
  //         {getProjectEmpBasedTravelHistory?.totalHaltTime ?? '0'}
  //       </div>

  //       <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
  //         <DirectionsBikeIcon />
  //         {getProjectEmpBasedTravelHistory?.totalMotion ?? '0'}
  //       </div>

  //       <Box
  //           sx={{
  //             ml: 'auto',
  //             textAlign: 'right',
  //           }}
  //         >
  //           <IconButton
  //             onClick={() => {
  //               toggleDrawerProject(false)
  //             }}
  //             sx={{
  //               p: 2,
  //               color: (theme) => theme.palette.text.secondary,
  //             }}
  //           >
  //             <CloseIcon />
  //           </IconButton>
  //         </Box>

  //     </Grid>
  //     <Timeline 
  //       sx={{
  //         [`& .${timelineOppositeContentClasses.root}`]: {
  //           flex: 0.5,
  //         },
          
  //       }}
  //     >
  //       {getProjectEmpBasedTravelHistory?.timeline && getProjectEmpBasedTravelHistory?.timeline.map((item,i) => {
  //         return (
  //           <TimelineItem key={i}>
  //           <TimelineOppositeContent color="text.secondary" sx={{width:100}}>
  //             {item.type === 'HALT' ? `${item.startTime} - ${item.endTime}` : '' }
  //           </TimelineOppositeContent>
  //           <TimelineSeparator>
  //             {item.type === 'HALT' ? <TimelineDot /> : <span style={{color:'grey'}}>⯯</span>  }
  //             <TimelineConnector /> 
  //           </TimelineSeparator >
  //           <TimelineContent>
  //             <Grid style={{display:'flex', justifyContent:'space-between'}}>
  //               <Grid>
  //                 {item.latitude}
  //                 <br />
  //                 {item.longitude}
  //               </Grid>
  //              {item.type === 'HALT' ? `${item.timeDiff}` : 
  //              <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
  //                 <DirectionsBikeIcon sx={{fontSize:'15px'}}/>
  //                 {item.timeDiff ?? '0'}
  //               </div>
  //              }

  //             </Grid>
  //           </TimelineContent>
  //         </TimelineItem>
  //         )
  //       })}

  //     </Timeline>
  //   </Grid>
  // );

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  console.log("rrereee",empTravelTimeline, filterDate);

  return (
    <>
      <Helmet>
         <meta charSet="utf-8" />
         <title> {titleURL} | Live Tracking </title>
       </Helmet>
      <Card sx={{padding: '20px'}}>
        <Grid container spacing={2}>
          <Grid size={12}>
            {/* <Typography variant='h6'>
              Live Location
            </Typography> */}
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Live Location" value="1" className='page-title'/>
                    <Tab label="Travel History" value="2" className='page-title'/>
                      {/* <Tab label=" Project Location Tracking" value="3" /> */}
                      {/* <Tab label="Live Task Location" value="4" /> */}
                  </TabList>
                  {
                    value === '2' &&
                    <>
                      <Grid container display={'flex'} flexDirection={'row'} alignItems={'center'} spacing={4}>
                          <Grid
                            size={{
                              lg: 4,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}>
                          <FormControl fullWidth variant='filled'>
                              <CommonUserAutoCompleteForSingleUser
                                searchVal={searchValEmployeeFilter}
                                setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                                requestSearch={requestSearchEmployeeFilter}
                                value={value1[0]}
                                setValue={(d) => {
                                  handleChangeEmployeeName([d])
                                }}
                                type={get_empbasecompany}
                                searchType={searchCompanyBasedEmployeeFilter}
                                labelName = "Select Employee"
                               
                              />
                
                </FormControl>  
                          </Grid>

                          <Grid
                            size={{
                              lg: 4,
                              md: 3,
                              sm: 6,
                              xs: 12
                            }}>
                            <Stack direction='row' diaplay='flex' alignItems='center' gap={1} sx={{ m: 1}}>
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
                                  views={['year', 'month', 'day']}
                                  fullWidth={true}
                                  slotProps={{ textField: { fullWidth: true, variant: 'filled', error: formErrors.date === null ? false : true, helperText: formErrors.date === null ? '' : formErrors.date } }}
                                />
                              </LocalizationProvider>
                            </Stack>
                          </Grid>
                          <Grid
                            size={{
                              lg: 1.5,
                              md: 3,
                              sm: 6,
                              xs: 12
                            }}>
                            <Button color="primary"
                              variant="contained" 
                              style={{marginRight:'20px'}} 
                              onClick={handleSubmit}
                              disabled={!value1.filter(Boolean).length || !isValidDate(filterDate.date)}
                              >
                              Apply
                            </Button>
                          </Grid> 
                          {/* <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2.5 }}>
                            <Button 
                              color="primary"
                              variant="outlined" 
                              style={{marginRight:'20px'}} 
                              onClick={toggleDrawer(!open)}>
                              {open ? 'Close Timeline': 'Open Timeline'}
                            </Button>
                          </Grid>  */}
                      </Grid>
                    </>
                    }
                              
                   


                </Box>
                <TabPanel value="1">
                  <Grid size={12}>
                    <OpenStreetMap zoom={zoom} />
                  </Grid>
                </TabPanel>
                <TabPanel value="2">
                  <Grid style={{display:'flex'}} size={12}>
                    {open === true ? (
                    <Grid
                      size={{
                        lg: 5.5,
                        md: 6,
                        sm: 6,
                        xs: 6
                      }}>
                      {TimeLine}
                    </Grid>
                    ) : ''}
                    {/* <Grid  
                     lg={7} md={7} sm={6.5} xs={6}
                    // style={{width:400, display:open? 'block': 'none'}}
                    > */}
                      <MapTravelHistory zoom={zoom} employeeId={employeeId} polylineCoords={empTravelTimeline.timeline} setPolylineCoords={setPolylineCoords}/>
                    {/* </Grid> */}
                    
                  </Grid>
                  </TabPanel>
                  {/* <TabPanel value="3">
                  <Grid size={12}
                    style={{display:'flex'}}
                  >
                    
                    <Grid  style={{width:400, display:openProject? 'block': 'none'}}>
                      {projectTimeLine}
                    </Grid>
                    <MapTravelHistoryProject zoom={zoom} employeeId={employeeId} projectPolylineCoords={projectPolylineCoords} setprojectPolylineCoords={setprojectPolylineCoords}/>
                  </Grid>
                  </TabPanel> */}
                  {/* <TabPanel value="4">
                  <Grid size={12}>
                    <OpenStreetMap1 zoom={zoom} />
                  </Grid>
                </TabPanel> */}
              </TabContext>
            </Box>

          </Grid>
          {/* <Grid size={12}>
            <OpenStreetMap zoom={zoom} />
          </Grid> */}
        </Grid>
      </Card>
    </>
  );
}


export default LiveLocation;

