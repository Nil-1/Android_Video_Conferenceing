import React, {useCallback, useRef} from 'react';

import {JitsiMeeting} from '@jitsi/react-native-sdk';

import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MeetingProps {
  route: {params: {room: string; isHost?: boolean; password?: string}};
}

const MeetingScreen: React.FC<MeetingProps> = ({route}) => {
  const jitsiMeeting = useRef(null);
  const navigation = useNavigation();
  const {room, isHost} = route.params; // Added isHost

  const saveMeetingRecord = async (room: string, date: string) => {
    try {
      // 获取当前存储的会议记录
      const existingRecords = await AsyncStorage.getItem('meetingHistory');
      const records = existingRecords ? JSON.parse(existingRecords) : [];

      // 添加新的会议记录
      const newRecord = {id: Date.now().toString(), room, date};
      const updateRecords = [newRecord, ...records];

      // 存入 AsynStorage
      await AsyncStorage.setItem(
        'meetingHistory',
        JSON.stringify(updateRecords),
      );
    } catch (error) {
      console.log('Error saving meeting record', error);
    }
  };

  const onReadyToClose = useCallback(() => {
    const meetingDate = new Date().toLocaleString();
    saveMeetingRecord(room, meetingDate);
    navigation.navigate('Home');
    // @ts-ignore
    jitsiMeeting.current.close();
  }, [navigation, room]);

  const onEndpointMessageReceived = useCallback(() => {
    console.log('You got a message!');
  }, []);

  const eventListeners = {
    onReadyToClose,
    onEndpointMessageReceived,
  };

  return (
    // @ts-ignore
    <JitsiMeeting
      config={{
        hideConferenceTimer: true,
        customToolbarButtons: [
          {
            icon: 'https://w7.pngwing.com/pngs/987/537/png-transparent-download-downloading-save-basic-user-interface-icon-thumbnail.png',
            id: 'btn1',
            text: 'Button one',
          },
          {
            icon: 'https://w7.pngwing.com/pngs/987/537/png-transparent-download-downloading-save-basic-user-interface-icon-thumbnail.png',
            id: 'btn2',
            text: 'Button two',
          },
        ],
        startWithAudioMuted: !isHost, // Host starts unmuted
        startWithVideoMuted: !isHost, // Host starts unmuted
      }}
      eventListeners={eventListeners as any}
      flags={{
        'audioMute.enabled': true,
        'ios.screensharing.enabled': true,
        'fullscreen.enabled': false,
        'audioOnly.enabled': false,
        'android.screensharing.enabled': true,
        'pip.enabled': true,
        'pip-while-screen-sharing.enabled': true,
        'conference-timer.enabled': true,
        'close-captions.enabled': false,
        'toolbox.enabled': true,
      }}
      ref={jitsiMeeting}
      style={{flex: 1}}
      room={room}
      serverURL={'https://gibranzhang.xyz/'}
    />
  );
};

export default MeetingScreen;
