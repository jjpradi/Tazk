import { Grid, Typography, Button, Card, ButtonGroup, Box, IconButton } from '@mui/material';
import React, { useEffect, useState, useContext, useRef } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { getSalesManListAction, setLiveLocationData } from 'redux/actions/fuelAllowance_actions';
import { getSalesManVisitsAction } from 'redux/actions/salesMan_action';
import { Helmet } from "react-helmet-async";
import http, { titleURL } from '../../../http-common';
import { clientwebsocket } from '../../../http-common'
import { eventList, websocketEvents } from '../../../http-common';

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
import inActiveIcon from '../../../assets/icon/inactive.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../../../assets/styleSheet/Leaflet/index.css';
import useGeoLocation from 'utils/useGeoLocation';
import apiCalls from 'utils/apiCalls';
import axios from 'axios';
import { maxHeight } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SalesManVisitsFilter from './SalesManVisitsFilter';
import socketManager from '../../../utils/socketManager';

import {osmMapTiler as osm} from 'shared/constants/MapTiles';

const InActiveIcon = new L.Icon({
  iconUrl: inActiveIcon,
  iconSize: [40, 45],
});

const ActiveIcon = new L.Icon({
  iconUrl: activeIcon,
  iconSize: [40, 45],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46],
});

export function OpenStreetMap({ zoom }) {
  const [center, setCenter] = useState({ lat: 12.9909, lng: 80.21845 });
  const ZOOM_LEVEL = zoom;
  const mapRef = useRef(null);
  const location = useGeoLocation();
  const {
    fuelAllowanceReducer: { salesManLiveTrackingData },
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

  return (
    <Grid>
      {/* <Button onClick={showMyLocation} variant='contained'>
        Show my location
      </Button> */}
      <MapContainer
        center={center}
        zoom={ZOOM_LEVEL}
        scrollWheelZoom={true}
        ref={mapRef}
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
        {salesManLiveTrackingData.length > 0 &&
          salesManLiveTrackingData.map(
            ({ empId, position, empName, timestamp }) => (
              <Marker
                icon={
                  moment(new Date()).diff(moment(timestamp), 'minutes') > 10
                    ? InActiveIcon
                    : ActiveIcon
                }
                key={empId}
                position={[position.lat, position.lng]}
              >
                <Popup>
                  <b>{empName}</b>
                </Popup>
              </Marker>
            ),
          )}
      </MapContainer>
    </Grid>
  );
}

function SalesManLiveLocation() {
  const { setModalTypeHandler, setLoaderStatusHandler, headerLocationId,
    setHeaderLocationIdHandeler } = useContext(
      CreateNewButtonContext,
    );

  const [zoom, setZoom] = useState(9);
  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [manualUser, setManualUser] = useState({
    lat: 13.002201,
    lng: 80.248281,
  });
  const dispatch = useDispatch();
  const {
    fuelAllowanceReducer: { salesManLiveTrackingData, salesManList },
  } = useSelector((state) => state);

  // function liveTracking({ event, content }) {
  //   if (event === 'liveTracking') {
  //     let tempArr = [];
  //     let index = salesManLiveTrackingData.findIndex(
  //       (x) => x.empId === content.empId,
  //     );
  //     if (index === -1) {
  //       tempArr = salesManLiveTrackingData;
  //       tempArr.push(content);
  //     } else {
  //       tempArr = salesManLiveTrackingData;
  //       tempArr[index] = content;
  //     }
  //     dispatch(setLiveLocationData(tempArr));
  //   }
  // }

  // useEffect(() => {
  //   websocketEvents.addListener({
  //     eventName: 'liveTracking',
  //     callbackFun: liveTracking,
  //   });
  // }, []);

    useEffect(() => {
    const rootSocket = socketManager.getSocket("/");

    if (!rootSocket) {
      return;
    }

    const handleliveTracking = (content) => {
     try{
          let tempArr = [];
      let index = salesManLiveTrackingData.findIndex(
        (x) => x.empId === content?.empId,
      );
      if (index === -1) {
        tempArr = salesManLiveTrackingData;
        tempArr.push(content);
      } else {
        tempArr = salesManLiveTrackingData;
        tempArr[index] = content;
      }
      dispatch(setLiveLocationData(tempArr));
     }catch(e){

     }
    };
    rootSocket.on("liveTracking", handleliveTracking);

    return () => {
      rootSocket.off("liveTracking", handleliveTracking);
    };
  }, []);

  const handleApply = (selectedDate) => {
    setDate(selectedDate);
    const matched = quickDates.find(({ daysAgo }) =>
      moment().subtract(daysAgo, 'days').format('YYYY-MM-DD') === selectedDate
    );
    if (matched) {
      setSelectedDaysAgo(matched.daysAgo);
    } else {
      setSelectedDaysAgo(null);
    }
    setOpenFilter(false);
  }

  const user_1_feedLatLong = () => {
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      let lat = 13.002578;
      let lng = 80.219379;
      setInterval(() => {
        lat = lat - 0.0001;
        lng = lng - 0.0001;
        let data = {
          empId: 1,
          empName: 'Karthik',
          position: { lat, lng },
        };
        clientwebsocket.socket.send(
          JSON.stringify({ event: 'liveTracking', content: data }),
        );
      }, 3000);
    }
  };

  const user_2_feedLatLong = () => {
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      let lat = 13.002801;
      let lng = 80.242281;
      setInterval(() => {
        lat = lat - 0.0001;
        lng = lng - 0.0001;
        let data = {
          empId: 2,
          empName: 'SANjau',
          position: { lat, lng },
          timestamp: new Date(),
        };
        clientwebsocket.socket.send(
          JSON.stringify({ event: 'liveTracking', content: data }),
        );
      }, 3000);
    }
  };

  const quickDates = [
    { label: 'Today', daysAgo: 0 },
    { label: 'Yesterday', daysAgo: 1 },
    { label: moment().subtract(2, 'days').format('DD MMM'), daysAgo: 2 },
    { label: moment().subtract(3, 'days').format('DD MMM'), daysAgo: 3 },
    { label: moment().subtract(4, 'days').format('DD MMM'), daysAgo: 4 },
    { label: moment().subtract(5, 'days').format('DD MMM'), daysAgo: 5 },
  ];

  const user_3_feedLatLong = () => {
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      let lat = 13.001901;
      let lng = 80.248281;
      setInterval(() => {
        lat = lat - 0.0001;
        lng = lng - 0.0001;
        let data = {
          empId: 3,
          empName: 'Gopal',
          position: { lat, lng },
          timestamp: new Date(),
        };
        clientwebsocket.socket.send(
          JSON.stringify({ event: 'liveTracking', content: data }),
        );
      }, 3000);
    }
  };

  const user_4_feedLatLong = () => {
    if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
      let lat = manualUser.lat - 0.0001;
      let lng = manualUser.lng - 0.0001;
      setManualUser({ lat, lng });
      let data = {
        empId: 4,
        empName: 'Kumaru',
        position: { lat, lng },
        timestamp: '2022-11-26T16:20:04+05:30',
      };
      clientwebsocket.socket.send(
        JSON.stringify({ event: 'liveTracking', content: data }),
      );
    }
  };

  const printer = () => {
    // const socket = io.connect('http://localhost:5000');
    // socket.emit('test', 'test message');
    // if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
    //   let data = {
    //     empId: 4,
    //     empName: 'Kumaru',
    //     timestamp: '2022-11-26T16:20:04+05:30',
    //   };
    //   clientwebsocket.socket.send(JSON.stringify({event: 'printer', content: data}));
    // } else {
    //   alert('Reload Page to restart websocket');
    // }
  };

  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(null);

  useEffect(() => {
    let data = {searchString: searchVal}
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSalesManListAction(data, setModalTypeHandler, setLoaderStatusHandler),
      )
    );
  }, []);

  useEffect(() => {
    if (salesManList && salesManList.length > 0 && !employeeId) {
      setEmployeeId(salesManList[0].empId);
      setDate(moment().format('YYYY-MM-DD'));
    }
  }, [salesManList]);
  console.log('salesManList', salesManList)

  useEffect(() => {
    let data = { employee_id: employeeId, date };
    console.log(employeeId, date, data, 'payloadoflive1')
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSalesManVisitsAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );
  }, [date, employeeId]);

  const handleQuickDate = (daysAgo) => {
    const selectedDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
    setDate(selectedDate);
    console.log(selectedDate, 'selectedDAtee')
    setSelectedDaysAgo(daysAgo);
  };

  const requestSearch = (e) => {
  const val = e?.target?.value || '';
  setSearchVal(val);

  const payload = {
    searchString: val
  };

  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      getSalesManListAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    )
  );
};

  const cancelSearch = () => {
  setSearchVal('');

  const payload = {
    searchString: ''
  };

  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      getSalesManListAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    )
  );
};

  return (
    <>
      <Card sx={{ height: 'calc(100vh - 80px)', padding: '20px' }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title> {titleURL} | Live Tracking </title>
        </Helmet>
        {/* <Card sx={{padding: '20px'}}> */}
        <Grid container spacing={2}>
          <Grid
            sx={{ borderRight: '1px solid #e0e0e0', backgroundColor: '#fff', p: 2 }}
            size={{
              lg: 3,
              md: 3,
              sm: 12,
              xs: 12
            }}>
            <Grid container>
              <Grid
                marginBottom='20px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  Live Location
                </Typography>
              </Grid>
            </Grid>

            <div>
              <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
              />
            </div>
           <Box
              sx={{
                height: 'calc(100vh - 220px)', 
                overflowY: 'auto',
                pr: 1
              }}
            >
            <Stack spacing={1} marginTop='20px'>
              {salesManList?.map((item) => {
                const isActive = employeeId === item.empId;
                return (
                  <Box key={item.empId} onClick={() => setEmployeeId(item.empId)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#0288d1' : '#000',
                      backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Box>
                      <Typography fontSize={14} textTransform="capitalize">
                        {item.first_name} {item.last_name || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bike: {item.bike_name || '-'} | Mileage: {item.mileage || '-'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
            </Box>
          </Grid>
          <Grid
            size={{
              lg: 9,
              md: 9,
              sm: 12,
              xs: 12
            }}>
            <Grid container spacing={2}>
              <Grid
                display='flex'
                alignContent='center'
                size={{
                  lg: 3.5,
                  md: 3.5,
                  sm: 3.5,
                  xs: 12
                }}>
                <Typography variant="h6">Sales Executive Live location</Typography>
              </Grid>

              <Grid
                display='flex'
                justifyContent='end'
                size={{
                  lg: 8,
                  md: 8,
                  sm: 8,
                  xs: 12
                }}>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {quickDates.map(({ label, daysAgo }) => {
                    const isSelected = selectedDaysAgo !== null && selectedDaysAgo === daysAgo;
                    return (
                      <Button
                        key={label}
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleQuickDate(daysAgo)}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 2,
                          color: isSelected ? '#fff' : '#0288d1',
                          backgroundColor: isSelected ? '#0288d1' : 'transparent',
                          borderColor: '#0288d1',
                          '&:hover': {
                            backgroundColor: isSelected ? '#0288d1' : '#e1f5fe',
                            color: isSelected ? '#fff' : '#0288d1',
                          },
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Box>
              </Grid>

              <Grid
                display='flex'
                justifyContent='end'
                size={{
                  lg: 0.5,
                  md: 0.5,
                  sm: 0.5,
                  xs: 12
                }}>
                <IconButton onClick={() => setOpenFilter(true)} size="large">
                  <FilterAltIcon />
                </IconButton>
              </Grid>

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <OpenStreetMap zoom={zoom} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      {/* </Card> */}
      <SalesManVisitsFilter
        open={openFilter}
        onClose={() => {
          const today = moment().format('YYYY-MM-DD');
          setDate(today);
          setOpenFilter(false);
          setSelectedDaysAgo(0);

        }}
        onApply={handleApply}
        date={date}
        setDate={setDate}
      />
    </>
  );
}

export default SalesManLiveLocation;

