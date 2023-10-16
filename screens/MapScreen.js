import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MaskedView from '@react-native-community/masked-view';
import LinearGradient from 'react-native-linear-gradient';


import MapboxGL, { Location } from "@rnmapbox/maps";

MapboxGL.setAccessToken("pk.eyJ1IjoidWtlbm55IiwiYSI6ImNsbnBuZHp0bDBud3Aya28yZXBybjhrN3cifQ.HsbkVyx1192KKvBZkydQtw")

class FogPoint {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}
function relativeDistance(lat1, lon1, lat2, lon2) {
  const turf = require('@turf/turf');

  const point1 = turf.point([lon1, lat1]); // [longitude, latitude]
  const point2 = turf.point([lon2, lat2]);
  
  const distanceX = turf.distance(turf.point([point1.geometry.coordinates[0], point1.geometry.coordinates[1]]), turf.point([point2.geometry.coordinates[0], point1.geometry.coordinates[1]]), {units: 'meters'});
  const distanceY = turf.distance(turf.point([point1.geometry.coordinates[0], point1.geometry.coordinates[1]]), turf.point([point1.geometry.coordinates[0], point2.geometry.coordinates[1]]), {units: 'meters'});
  
  const deltaX = (point2.geometry.coordinates[0] - point1.geometry.coordinates[0]) > 0 ? distanceX : -distanceX;
  const deltaY = (point2.geometry.coordinates[1] - point1.geometry.coordinates[1]) > 0 ? distanceY : -distanceY;
  return{
    distX: deltaX,
    distY: deltaY
  }
}


function XYDistanceToScreenPoint(distX, distY, latitude, angle) {
  screenWidth = Dimensions.get('window').width
  screenHeight = Dimensions.get('window').height
  const absLatitude = Math.abs(latitude)
  let zoom_cons = 0
  if (absLatitude < 20) {
    zoom_cons = 1.194
  }
  else if (absLatitude < 40) {
    zoom_cons = 1.122

  }
  else if (absLatitude < 60) {
    zoom_cons = 0.915
  }
  else if (absLatitude < 80) {
    zoom_cons = 0.597

  }
  else {
    zoom_cons = 0.207

  }

  meterX = distX / zoom_cons
  meterY = distY / zoom_cons
  rotated_x = meterX * Math.cos(angle / 180 * Math.PI) - meterY * Math.sin(angle / 180 * Math.PI)
  rotated_y = meterX * Math.sin(angle / 180 * Math.PI) + meterY * Math.cos(angle / 180 * Math.PI)
  return {
    x: rotated_x + screenWidth / 2,
    y: -rotated_y + screenHeight / 2
  };
}

const MapScreen = ({ navigation }) => {


  const [points, setPoints] = useState([]);

  const [location, setLocation] = useState();

  console.log(location)

  const recordLocation = (userLocation) => {
    setPoints([...points, userLocation]);
    setLocation(userLocation);
  }
  let fogs = []
  if (location) {
    fogs = points.map((point, index) => {

      const { distX, distY } = relativeDistance(location["coords"]["latitude"], location["coords"]["longitude"], point["coords"]["latitude"], point["coords"]["longitude"]);
      const { x, y } = XYDistanceToScreenPoint(distX, distY, location["coords"]["latitude"], location["coords"]["heading"]);
      return <LinearGradient start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={['transparent', 'black', 'transparent']} key={index} style={fogMask(x, y, 20)} />
    })
  }






  return (
    <View style={styles.fullScreen}>
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "white" }}></View>
      <MaskedView style={{
        ...StyleSheet.absoluteFillObject
      }} maskElement={
        <View style={styles.maskWrapper}>{fogs}</View>
      }>
        <MapboxGL.MapView style={styles.map} zoomEnabled={true}>
          <MapboxGL.UserLocation onUpdate={(location) => recordLocation(location)} showsUserHeadingIndicator requestsAlwaysUse ></MapboxGL.UserLocation>
          <MapboxGL.Camera followUserLocation followZoomLevel={16} />
        </MapboxGL.MapView>
      </MaskedView>
    </View>
  );
};

function fogMask(x, y, r) {
  return {
    width: r * 2,
    height: r * 2,
    left: x - r,
    top: y - r * 3,
    borderRadius: r,

    position: "absolute",
  }
}

const styles = StyleSheet.create({
  maskWrapper: {
    backgroundColor: 'transparent',
    ...StyleSheet.absoluteFillObject,
  },
  fullScreen: {
    width: "100%",
    height: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  fog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "grey",
  }
})

export default MapScreen;