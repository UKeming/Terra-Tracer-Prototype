
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App (){
  return (
  <NavigationContainer>
    <Stack.Navigator  initialRouteName="Home">
      <Stack.Screen name='Home' component={HomeScreen}></Stack.Screen>
      <Stack.Screen name='Map' component={MapScreen}></Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
  );
}

export default App;