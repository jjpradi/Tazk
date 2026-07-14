import React, {useRef, useState} from 'react';
import {Grid} from '@mui/material';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import activeIcon from '../../../assets/icon/active.png';
import {osmMapTiler as osm} from 'shared/constants/MapTiles';

const ActiveIcon = new L.Icon({
  iconUrl: activeIcon,
  iconSize: [40, 45],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46],
});

export default function OpenStreetMap({zoom, style, location, setFieldValue, setOpenMap}) {
  const [center, setCenter] = useState({lat: location.lat, lng: location.lng});
  const [clickPosition, setClickPosition] = useState(null); // State to store click position
  const ZOOM_LEVEL = zoom;
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const {lat, lng} = event.latlng;
    setClickPosition({lat, lng}); // Update click position
    setFieldValue('latitude', lat);
    setFieldValue('longitude', lng);
    setOpenMap(false);
    console.log('Clicked location:', lat, lng); // Optional: log the latitude and longitude
  };

  return (
    <Grid>
      <MapContainer
        style={style}
        center={center}
        zoom={ZOOM_LEVEL}
        ref={mapRef}
        onClick={handleMapClick} // Add click handler here
      >
        <TileLayer
          url={osm.mapTiler.url}
          attribution={osm.mapTiler.attribution}
        />
        {clickPosition ? (
          <Marker
            position={[clickPosition.lat, clickPosition.lng]}
            icon={ActiveIcon}
          >
            <Popup>
              Clicked Location: {clickPosition.lat.toFixed(5)},{' '}
              {clickPosition.lng.toFixed(5)}
            </Popup>
          </Marker>
        ) : (
          <Marker position={[location.lat, location.lng]} icon={ActiveIcon}>
            <Popup>
              <b>Current Location</b>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Grid>
  );
}

