import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RouteMap = ({ coordinates }) => {
  const mapRef = useRef(null);
  const routeControlRef = useRef(null);

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      if (coordinates.length === 1) {
        const [singlePoint] = coordinates;
        const { end_lat, end_long } = singlePoint;

        if (!mapRef.current) {
          const map = L.map('map').setView([end_lat, end_long], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;
        }

        if (routeControlRef.current) {
          routeControlRef.current.remove();
          routeControlRef.current = null;
        }
      } else {
        const waypoints = coordinates.map((point) => L.latLng(point.end_lat, point.end_long));

        if (!mapRef.current) {
          const map = L.map('map').setView([coordinates[0].end_lat, coordinates[0].end_long], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapRef.current = map;
        }

        if (routeControlRef.current) {
          routeControlRef.current.remove();
        }

        const routeControl = L.Routing.control({
          waypoints,
          routeWhileDragging: true,
        });

        routeControl.addTo(mapRef.current);

        routeControlRef.current = routeControl;
      }
    }
  }, [coordinates]);

  return <div id="map" style={{ height: '400px', width: '100%' }} />;
};

export default RouteMap;
