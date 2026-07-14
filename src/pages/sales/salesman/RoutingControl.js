import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

var redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const toLatLng = (point) => {
  if (Array.isArray(point)) {
    return L.latLng(point[0], point[1]);
  }
  return L.latLng(point.lat, point.lng);
};

const Routing = ({ map, start, end }) => {
  const routingControlRef = useRef(null);

  useEffect(() => {
    const leafletMap = map && map.leafletElement ? map.leafletElement : map;
    if (!leafletMap || !start || !end) return;

    const control = L.Routing.control({
      lineOptions: {
        styles: [{ color: "red" }],
      },
      waypoints: [toLatLng(start), toLatLng(end)],
      show: true,
      createMarker: function (i, wp, nWps) {
        return L.marker(wp.latLng, { icon: redIcon });
      },
    }).addTo(leafletMap);

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) {
        leafletMap.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
};

export default Routing;
