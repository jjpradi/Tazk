import React, { useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { useRef } from "react";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import MarkIcon from '../../../../src/assets/icon/marker_icon.png'
import {osmMapTiler as osm} from 'shared/constants/MapTiles';

const markerIcon = new L.Icon({
    iconUrl: MarkIcon,
    iconSize: [30, 40],
  });

const AttendanceMap = (props) => {
    const [center, setCenter] = useState({ lat: 12.99096710656273, lng: 80.21823689140845 });
    const ZOOM_LEVEL = 9;
    const mapRef = useRef(null);
    const [OpenIndex, setOpenIndex] = React.useState({});



    return (
        <>

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

                {/* <Polyline 
           path={props.coordinates?.map((d) => ({
            lat: d.latitude,
            lng: d.longitude,
          }))}

          options={{
            strokeColor: '#ff2527',
            strokeOpacity: 0.75,
            strokeWeight: 2,
          }}
        
        /> */}


                {props.coordinates?.map((d, index) => {
                    return (
                        <Marker
                        icon={markerIcon}
                            key={index}
                            onClick={() => {
                                setOpenIndex((d) => ({ ...d, [index]: true }));
                            }}
                            name={d.company_name}
                            position={{ lat: d.latitude, lng: d.longitude }}
                        >
                            {OpenIndex[index] && (
                                <Popup
                                    key={index}
                                    onCloseClick={() => {
                                        {
                                            setOpenIndex((d) => ({ ...d, [index]: false }));
                                        }
                                    }}
                                >
                                    <div>
                                        <h4>{d.company_name}</h4>
                                    </div>
                                </Popup>
                            )}

                        </Marker>
                    );
                })}

            </MapContainer>

        </>
    );
};

export default AttendanceMap;

