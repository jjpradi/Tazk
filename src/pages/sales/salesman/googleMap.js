import React, {useState, useEffect, useRef} from 'react';
import {Button, Grid} from '@mui/material';
import {MapContainer, TileLayer, Popup, Marker} from 'react-leaflet';
import L from 'leaflet';
import '../../../assets/styleSheet/Leaflet/index.css';
import useGeoLocation from 'utils/useGeoLocation';
import MarkIcon from '../../../assets/icon/marker-shop.png';

const osm = {
  mapTiler: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

const markerIcon = new L.Icon({
  iconUrl: MarkIcon,
  iconSize: [30, 40],
  // iconAnchor: [17, 46],
  // popupAnchor: [0, -46],
});

// const cities = [
//   {id: 1, lat: 28.66, long: 77.2333},
//   {id: 1, lat: 18.9667, long: 72.8333},
//   {id: 1, lat: 22.5411, long: 88.3378},
//   {id: 1, lat: 12.9699, long: 77.598},
// ];

function OpenStreetMapHistory({getSalesManVisits}) {
  const [center, setCenter] = useState({lat: 12.9909, lng: 80.21845});
  const ZOOM_LEVEL = 9;
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (getSalesManVisits !== undefined && getSalesManVisits.length > 0) {
      let tempArr = [];
      getSalesManVisits.map((place) => {
        console.log(getSalesManVisits,'useefectsalesman')
        let tempObj1 = {
          // id: place.customer_id,
          name: place.company_name,
          position: {lat: place.start_lat, lng: place.start_long},
          entry_time: place.entry_time?.slice(10, 16),
        };

        let tempObj2 = {
          // id: place.customer_id,
          name: place.company_name,
          position: {lat: place.end_lat, lng: place.end_long},
          entry_time: place.entry_time?.slice(10, 16),
        };

        tempArr.push(tempObj1);
        tempArr.push(tempObj2);
      });

      setMarkers(tempArr);
    } else {
      setMarkers([]);
    }
  }, [getSalesManVisits]);

  return (
    <Grid>
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

        {markers.map((visit, index) => {
          const positionLat = visit.position.lat;
          const positionLng = visit.position.lng;

          return (
            <Marker
              position={[positionLat, positionLng]}
              // position={[28.6600, 77.2333]}
              icon={markerIcon}
              key={index}
            >
              <Popup>
                {visit.name}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Grid>
  );
}

// function Map({getSalesManVisits}) {
//   const [markers, setMarkers] = useState([]);
//   useEffect(() => {
//     if (getSalesManVisits !== undefined && getSalesManVisits.length > 0) {
//       let tempArr = [];
//       getSalesManVisits.map((place) => {
//         let tempObj1 = {
//           // id: place.customer_id,
//           name: place.company_name,
//           position: {lat: place.start_lat, lng: place.start_long},
//           entry_time: place.entry_time.slice(10, 16),
//         };

//         let tempObj2 = {
//           // id: place.customer_id,
//           name: place.company_name,
//           position: {lat: place.end_lat, lng: place.end_long},
//           entry_time: place.entry_time.slice(10, 16),
//         };

//         tempArr.push(tempObj1);
//         tempArr.push(tempObj2);
//       });

//       setMarkers(tempArr);
//     } else {
//       setMarkers([]);
//     }
//   }, [getSalesManVisits]);

//   const [activeMarker, setActiveMarker] = useState(null);

//   const handleActiveMarker = (marker) => {
//     if (marker === activeMarker) {
//       return;
//     }
//     setActiveMarker(marker);
//   };

//   const handleOnLoad = (map) => {
//     // eslint-disable-next-line no-undef
//     const bounds = new google.maps.LatLngBounds();
//     markers.forEach(({position}) => bounds.extend(position));
//     map.fitBounds(bounds);
//   };

//   let icon = {
//     url: ShopIcon,
//     scaledSize: {width: 30, height: 30},
//   };

//   return (
//     <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//       <GoogleMap
//         onLoad={handleOnLoad}
//         onClick={() => setActiveMarker(null)}
//         mapContainerStyle={{width: '75vw', height: '65vh'}}
//         center={{lat: 12.9791133, lng: 80.2022623}}
//         zoom={15}
//       >
//         {markers.map(({name, position, entry_time}) => (
//           <Marker
//             icon={icon}
//             key={name}
//             position={position}
//             onClick={() => handleActiveMarker(name)}
//           >
//             {activeMarker === name ? (
//               <InfoWindow onCloseClick={() => setActiveMarker(null)}>
//                 <div>
//                   <div>ShopName:{name}</div>
//                   <div>VisitTime:{entry_time}</div>
//                 </div>
//               </InfoWindow>
//             ) : null}
//           </Marker>
//         ))}
//       </GoogleMap>
//     </Grid>
//   );
// }

// export default function App({getSalesManVisits}) {
//   const {isLoaded} = useLoadScript({
//     googleMapsApiKey: 'AIzaSyDUZJF8REx161fNeD_MeTwR4UYm24SJOOc', // Add your API key
//   });

//   return isLoaded ? <Map getSalesManVisits={getSalesManVisits} /> : null;
// }

export default OpenStreetMapHistory;

