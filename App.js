import React, {Component} from 'react';
import {TextInput, StyleSheet, Text, View,Alert } from 'react-native';
import Permissions from 'react-native-permissions'
import MapView,{Marker} from 'react-native-maps';

type Props = {};
export default class App extends Component<Props> {
  state={
    location_string:'',
    locationPermission:'undetermined',
   
  }

  requestLocationPermission=async()=> {
    Permissions.request('location').then(response=>{
      this.setState({
        locationPermission:response
      })
    }).catch(err=>console.log(err))
    console.log(this.state);
}

_alertForLocationPermission() {
    console.log(this.state);
    Alert.alert(
      'we need to access your Location',
      'we need to access your Location',
      [
        {
          text: 'Disable',
          onPress: () => this.setState({locationPermission:'denied'}),
          style: 'cancel',
        },
        this.state.locationPermission == 'undetermined'
          ? { text: 'allow', onPress: this.requestLocationPermission }
          : { text: 'Open Settings', onPress: Permissions.openSettings },
      ],
    )
  }

componentDidMount(){
    this._alertForLocationPermission();
    console.log(this.state);
    this.watchID = navigator.geolocation.watchPosition((position) => {
      // Create the object to update this.state.mapRegion through the onRegionChange function
      let region = {
        latitude:       position.coords.latitude,
        longitude:      position.coords.longitude,
        latitudeDelta:  0.00922*1.5,
        longitudeDelta: 0.00421*1.5
      }
      this.onRegionChange(region, region.latitude, region.longitude);
    });
    if(this.state.draggedlocation!==undefined){
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.draggedlocation.latitude + ',' + this.state.draggedlocation.longitude + '&key=' + 'AIzaSyCxXoRqTcOTvsOLQPOiVtPnSxLUyGJBFqw')
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
              location_string:JSON.stringify(responseJson.results[0]['formatted_address'])
            });
      }).catch(err=>this.setState({location_string:err}))
    }
  }
  onRegionChange(region, lastLat, lastLong) {
    this.setState({
      mapRegion: region,
      // If there are no new values set the current ones
      lastLat: lastLat || this.state.lastLat,
      lastLong: lastLong || this.state.lastLong
    });
    const obj = {
      latitude:this.state.lastLat,
      longitude:this.state.lastLong
    }
    this.getDraggedAddress(obj);
  }
  getDraggedAddress=async(obj)=>{
    
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + obj.latitude + ',' + obj.longitude + '&key=' + 'AIzaSyCxXoRqTcOTvsOLQPOiVtPnSxLUyGJBFqw')
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
              location_string:JSON.stringify(responseJson.results[0]['formatted_address'])
            });
      })  

  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    if(this.state.locationPermission==='undetermined'){
      return(
          <View style={styles.container}>
          </View>
        )
    }
    if(this.state.locationPermission==='denied'){
      return(
          <View style={styles.container}>
            <View style={styles.upper_container}>
              <Text>this is a location test app!</Text>
            </View>
            <View style={styles.lower_container}>
              <Text>you need to allow access to your current location</Text>
            </View>
          </View>
        )
    }
    return (
      <View style={styles.container}>
        <View style={styles.upper_container}>
          <Text>this is a location test app!</Text>
          <Text style={styles.welcome}> {this.state.location_string} </Text>
        </View>
        <View style={styles.map_container}>
          <MapView
          style={styles.map}
          initialRegion={this.state.mapRegion}
          showsUserLocation={true}
          followUserLocation={true}
          >
            <Marker 
            coordinate={{
              latitude: (this.state.lastLat ) || -36.82339,
              longitude: (this.state.lastLong ) || -73.03569,
            }}
            draggable
            onDragEnd={e=>{
             // this.setState({ draggedlocation: e.nativeEvent.coordinate });
              this.getDraggedAddress(e.nativeEvent.coordinate);
              }}
            />
          </MapView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map_container:{
    flex:3
  },
  upper_container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lower_container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 10,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin:5,
    ...StyleSheet.absoluteFillObject
  },
});
