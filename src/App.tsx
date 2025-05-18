import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import MeetingScreen from './screens/MeetingScreen';
import JoinMeetingScreen from './screens/JoinMeetingScreen';
import CreateSecureMeetingScreen from './screens/CreateSecureMeetingScreen';
import AIChatScreen from './screens/AiChatScreen';
import MyPageScreen from './screens/MyPageScreen';

const RootStack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <RootStack.Navigator initialRouteName="Home">
      <RootStack.Screen
        component={HomeScreen}
        name="Home"
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          title: 'AI Chat',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        component={MeetingScreen}
        name="Meeting"
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        component={JoinMeetingScreen}
        name="JoinMeeting"
        options={{
          title: '加入会议',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        component={CreateSecureMeetingScreen}
        name="CreateSecureMeeting"
        options={{
          title: '创建加密会议',
          headerShown: false,
        }}
      />
      <RootStack.Screen
        component={MyPageScreen}
        name="MyPage"
        options={{
          title: '我的',
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  </NavigationContainer>
);

export default App;
