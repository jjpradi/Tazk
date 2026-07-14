// import React, { Component } from 'react';
// import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline, lineSymbol } from 'google-maps-react';
// import { Grid } from '@mui/material';

// const style = {
//   width: '40%',
//   height: '85%',
//   overflow: 'hidden',
//   position: 'relative'
// }

// export class MapContainer extends Component {

//   constructor(props) {
//     super(props);
//     // this.markerRef = React.createRef();
//     this.state = {

//       stores: [
//         // {latitude: 9.947042214731027, longitude: 78.115477657094153}
//         // { latitude: 9.947042214731027, longitude: 78.115477657094153, name: 'Current Location', showingInfoWindow: false, activeMarker: {} },//madurai
//         // { latitude: 10.030623, longitude: 78.340210, name: 'Melur', showingInfoWindow: false, activeMarker: {} },//melur
//         // { latitude: 9.866700, longitude: 78.483299, name : 'Sivagangai',showingInfoWindow: false,activeMarker: {} },//sivagangai
//         // { latitude: 11.229592, longitude: 78.171158, name : 'Namakkal',showingInfoWindow: false,activeMarker: {} },//namakkal
//         // { latitude: 11.342423, longitude: 77.728165, name : 'Erode',showingInfoWindow: false,activeMarker: {} },//erode
//         // { latitude: 13.067439, longitude: 80.237617, name : 'Chennai',showingInfoWindow: false,activeMarker: {} },//chennai
//         // {showingInfoWindow: false,activeMarker: {} ,selectedPlace: {}}
//       ],
//       currentIndex: 0,
//       showingInfoWindow: true,
//       activeMarker: {},
//     }
//   }

// componentDidUpdate (pprops,pstate){
//   if(pprops.coordinates !== this.props.coordinates){
//     // const dat = this.props.coordinates.map((d) => {
//     //   const {latitude,longitude,company_name} = d
//     //   return {latitude , longitude, company_name }
//     // })
//     this.setState({stores : this.props.coordinates})
//   }
// }

//   onMarkerClick = (props, marker, e) => {
//     // this.setState({
//     //   // ...this.state.store[index],
//     //   activeMarker: marker,
//     //   showingInfoWindow: true
//     // });

//     let index = this.state.stores.findIndex(f => f.latitude === props.position.lat)
//     let Data = [...this.state.stores]
//     Data[index].activeMarker = marker
//     Data[index].showingInfoWindow = true

//     this.setState({ stores: Data ,currentIndex: index })

//     // this.props.coordinates.findIndex.lat === props.position.lat)
//     // let Data = [...this.state]
//     // Data[index].activeMarker = marker
//     // Data[index].showingInfoWindow = true

//     // this.setState({ stores: Data, currentIndex: index })

//   }

//   render() {


//     // const pathCoordinates = [
//     //   { lat: 9.947042214731027, lng: 78.115477657094153 },
//     //   { lat:10.030623, lng: 78.340210 },
//     //   { lat: 9.866700, lng: 78.483299 },
//     //   { lat: 11.229592, lng: 78.171158 },
//     //   { lat: 11.342423, lng: 77.728165 },
//     //   { lat: 13.067439, lng: 80.237617 },center={{ lat: 9.939093, lng: 78.121719 }}
//     //   { lat: 9.947042214731027, lng: 78.115477657094153 },
//     // ];
//     const { currentIndex, stores } = this.state

//     return (
//       <>
//         <Grid container >
//           <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//             <Map style={style} google={this.props.google} zoom={14} initialCenter={{lat: 9.939093, lng: 78.121719}} center={{ lat: stores[currentIndex]?.latitude, lng: stores[currentIndex]?.longitude}}>

//               <Polyline
//                 path={this.state.stores.map((d) => ({ lat: d.latitude, lng: d.longitude }))}
//                 geodesic={true}
//                 options={{
//                   strokeColor: "#ff2527",
//                   strokeOpacity: 0.75,
//                   strokeWeight: 2,
//                   icons: [
//                     {
//                       icon: lineSymbol,
//                       offset: "0",
//                       repeat: "20px"
//                     }
//                   ]
//                 }}
//               />

//               {
//                 this.state.stores.map((store, index) => {
//                   return <Marker onClick={this.onMarkerClick} name={store.company_name} position={{ lat: store.latitude, lng: store.longitude}} /> //ref = {this.markerRef}
//                 })
//               }
//                <InfoWindow marker={this.state.stores[this.state.currentIndex]?.activeMarker} visible={this.state.stores[this.state.currentIndex]?.showingInfoWindow} >
//                   <div>
//                       <h4>{this.state.stores[this.state.currentIndex]?.company_name}</h4>
//                   </div>
//                 </InfoWindow>

//               {/* {
//                 this.state.stores.map((store, index) => {
//                   return <Marker onClick={this.onMarkerClick} name={store.name} position={{ lat: store.latitude, lng: store.longitude }} />
//                 })
//               }
//               <InfoWindow marker={this.state.stores[this.state.currentIndex].activeMarker} visible={this.state.stores[this.state.currentIndex].showingInfoWindow} >
//                 <div>
//                   <h4>{this.state.stores[this.state.currentIndex].name}</h4>
//                 </div>
//               </InfoWindow> */}

//             </Map>
//           </Grid>
//         </Grid>
//       </>
//     );
//   }
// }

// export default GoogleApiWrapper({
//   apiKey: ("AIzaSyAqZz-jimyZlgXDrVwPcqHU50lBx4f8M0Q")
// })(MapContainer)

import React, {useEffect, useRef} from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

const containerStyle = {
  // width: '400px',
  // height: '400px'
  width: '100%',
  height: '680px',
  overflow: 'hidden',
  position: 'relative',
};

const center = {
  lat: 9.939093,
  lng: 78.121719,
};

function MapContainer(props) {
  const {isLoaded} = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAqZz-jimyZlgXDrVwPcqHU50lBx4f8M0Q',
  });

  const [map, setMap] = React.useState(null);
  const [currentIndex, setcurrentIndex] = React.useState(0);
  const [currentOpenIndex, setcurrentOpenIndex] = React.useState('');
  const [OpenIndex, setOpenIndex] = React.useState({});
  const [currentCloseIndex, setcurrentCloseIndex] = React.useState(0);
  const [showingInfoWindow, setshowingInfoWindow] = React.useState(true);
  const [activeMarker, setactiveMarker] = React.useState({});
  const [stores, setStores] = React.useState([]);
  const [openInfoWindowMarkerId, setOpenInfoWindowMarkerId] =
    React.useState(true);
  const tempinitsform = useRef(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const initsform = () => {
    if (props.coordinates) {
      setStores(props.coordinates);
      const marker = {};
      props.coordinates.forEach((d, i) => {
        marker[i] = true;
      });
      setOpenIndex(marker);
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, [props.coordinates]);

  // const onMarkerClick = (props, marker, e) => {

  //   let index = props.coordinates.findIndex(f => f.latitude === props.position.lat)
  //   let Data = [...props.coordinates]
  //   Data[index].activeMarker = props
  //   Data[index].showingInfoWindow = true
  //   props.setCoordinates(Data)
  //   setcurrentIndex(index)
  // }

  // const handleToggleOpen = (marker) => {
  //   if(marker){
  //     setcurrentOpenIndex(marker)
  //     // setOpenInfoWindowMarkerId(true);
  //   }
  // };

  // const handleToggleClose = (marker) => {
  //   if(marker){
  //     setcurrentOpenIndex('')
  //     // setOpenInfoWindowMarkerId(false);
  //   }
  // };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      // center={{ lat: 9.939093, lng: 78.121719 }}
      initialCenter={{lat: 9.939093, lng: 78.121719}}
      center={{
        lat: stores[currentIndex]?.latitude,
        lng: stores[currentIndex]?.longitude,
      }}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <Polyline
        path={props.coordinates?.map((d) => ({
          lat: d.latitude,
          lng: d.longitude,
        }))}
        geodesic={true}
        options={{
          strokeColor: '#ff2527',
          strokeOpacity: 0.75,
          strokeWeight: 2,
        }}
      />
      {props.coordinates?.map((d, index) => {
        return (
          <Marker
            key={index}
            onClick={() => {
              setOpenIndex((d) => ({...d, [index]: true}));
            }}
            name={d.company_name}
            position={{lat: d.latitude, lng: d.longitude}}
          >
            {OpenIndex[index] && (
              <InfoWindow
                key={index}
                onCloseClick={() => {
                  {
                    setOpenIndex((d) => ({...d, [index]: false}));
                  }
                }}
              >
                <div>
                  <h4>{d.company_name}</h4>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}

      <></>
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MapContainer);
