import {Grid} from '@mui/material';
import {useEffect, useRef, useState} from 'react';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import useGeoLocation from 'utils/useGeoLocation';
import activeIcon from '../../../../../../../assets/icon/active.png';
import L from 'leaflet';
import {osmMapTiler as osm} from 'shared/constants/MapTiles';

const ActiveIcon = new L.Icon({
  iconUrl: activeIcon,
  iconSize: [40, 45],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46],
});

export function OpenStreetMap({zoom, style, location}) {
  const [center, setCenter] = useState({lat: location.lat, lng: location.lng});
  const ZOOM_LEVEL = zoom;
  const mapRef = useRef(null);

  return (
    <Grid>
      <MapContainer
        style={style}
        center={center}
        zoom={ZOOM_LEVEL}
        scrollWheelZoom={false}
        ref={mapRef}
      >
        <TileLayer
          url={osm.mapTiler.url}
          attribution={osm.mapTiler.attribution}
        />
        <Marker position={[location.lat, location.lng]} icon={ActiveIcon}>
          <Popup>
            <b>Current Location</b>
          </Popup>
        </Marker>
      </MapContainer>
    </Grid>
  );
}

