import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// @ts-ignore
import Home from './screens/HomeScreen';
// @ts-ignore
import Meeting from './screens/MeetingScreen';

const RootStack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <RootStack.Navigator initialRouteName="Home">
      <RootStack.Screen
        component={Home}
        name="Home"
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        component={Meeting}
        name="Meeting"
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  </NavigationContainer>
);

export default App;
