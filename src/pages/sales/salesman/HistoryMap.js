import React, { Component } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import Routing from "./RoutingControl";
import MarkIcon from '../../../../src/assets/icon/marker_icon.png'
import L from 'leaflet';


const markerIcon = new L.Icon({
  iconUrl: MarkIcon,
  iconSize: [30, 40],
});

const osm = {
  mapTiler: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  },
};


export default class HistoryMap extends Component {
  state = {
    lat: 13.078293584541901,
    lng: 80.17420018268193,
    zoom: 8,
    isMapInit: false
  };
  saveMap = map => {
    this.map = map;
    this.setState({
      isMapInit: true
    });
  };

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <MapContainer center={position} zoom={this.state.zoom} ref={this.saveMap} >
        <TileLayer
          url={osm.mapTiler.url}
          attribution={osm.mapTiler.attribution}
        />
        {this.props.getSalesManVisits.map((d, i) => {
          return <Routing key={i} map={this.map} start={[d.start_lat, d.start_long]}
            end={[d.end_lat, d.end_long]} getSalesManVisits={this.props.getSalesManVisits} markerIcon={markerIcon} markers={this.props.markers} />
        }
        )},
      </MapContainer>
    );
  }
}

