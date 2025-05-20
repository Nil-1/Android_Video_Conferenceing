// import React, {useCallback, useRef} from 'react';
// import {JitsiMeeting} from '@jitsi/react-native-sdk';
// import {useNavigation} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// interface MeetingProps {
//   route: {params: {room: string; isHost?: boolean; password?: string}};
// }
//
// const MeetingScreen: React.FC<MeetingProps> = ({route}) => {
//   const jitsiMeeting = useRef<any>(null);
//   const navigation = useNavigation();
//   const {room, isHost, password} = route.params;
//
//   const saveMeetingRecord = async (roomName: string, meetingDate: string) => {
//     try {
//       const existingRecords = await AsyncStorage.getItem('meetingHistory');
//       const records = existingRecords ? JSON.parse(existingRecords) : [];
//       const newRecord = {
//         id: Date.now().toString(),
//         room: roomName,
//         date: new Date().toLocaleString(),
//       };
//       const updatedRecords = [newRecord, ...records];
//       await AsyncStorage.setItem(
//         'meetingHistory',
//         JSON.stringify(updatedRecords),
//       );
//     } catch (error) {
//       console.log('Error saving meeting record', error);
//     }
//   };
//
//   const onReadyToClose = useCallback(() => {
//     console.log('onReadyToClose triggered');
//     const meetingDate = new Date().toLocaleString();
//     saveMeetingRecord(room, meetingDate);
//     navigation.navigate('Home');
//     if (jitsiMeeting.current) {
//       jitsiMeeting.current.close();
//     }
//   }, [navigation, room]);
//
//   const onEndpointMessageReceived = useCallback(() => {
//     console.log('You got a message!');
//   }, []);
//
//   const onConferenceJoined = useCallback(() => {
//     console.log('Conference joined!');
//     console.log('isHost:', isHost, 'password:', password);
//     console.log('jitsiMeeting.current:', jitsiMeeting.current);
//     if (
//       isHost &&
//       password &&
//       jitsiMeeting.current &&
//       typeof jitsiMeeting.current.setPassword === 'function'
//     ) {
//       jitsiMeeting.current.setPassword(password);
//       console.log('Password set to:', password);
//     } else {
//       console.log('条件未满足，无法设置密码');
//     }
//   }, [isHost, password]);
//
//   const eventListeners = {
//     onReadyToClose,
//     onEndpointMessageReceived,
//     onConferenceJoined,
//   };
//
//   return (
//     <JitsiMeeting
//       config={{
//         hideConferenceTimer: true,
//         // 直接在 config 中启用大厅模式
//         configOverwrite: {
//           lobbyEnabled: true,
//           recordingServiceEnabled: true,
//           fileRecordingsEnabled: true,
//         },
//         customToolbarButtons: [],
//         startWithAudioMuted: !isHost,
//         startWithVideoMuted: !isHost,
//       }}
//       eventListeners={eventListeners as any}
//       flags={{
//         'audioMute.enabled': true,
//         'ios.screensharing.enabled': true,
//         'fullscreen.enabled': false,
//         'audioOnly.enabled': false,
//         'android.screensharing.enabled': true,
//         'pip.enabled': true,
//         'pip-while-screen-sharing.enabled': true,
//         'conference-timer.enabled': true,
//         'close-captions.enabled': false,
//         'toolbox.enabled': true,
//         'ios.recording': true,
//         'android.recording': true,
//         'live-streaming.enabled': false, // ✅ 确保关闭直播
//         'file-recording.enabled': true, // ✅ 允许文件录制
//         'recording.enabled': true, // ✅ 允许录制
//       }}
//       ref={jitsiMeeting}
//       style={{flex: 1}}
//       room={room}
//       serverURL={'https://gibranzhang.xyz/'}
//     />
//   );
// };
//
// export default MeetingScreen;

import React, {useCallback, useEffect, useRef} from 'react';
import {JitsiMeeting} from '@jitsi/react-native-sdk';
import {
  useNavigation,
  StackActions,
  NavigationProp,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RootStackParamList {
  Home: undefined;
  Meeting: {
    room: string;
    isHost?: boolean;
    password?: string;
  };
}

type MeetingScreenProps = {
  route: {params: RootStackParamList['Meeting']};
};

const STORAGE_KEY = 'meetingHistory';

const MeetingScreen: React.FC<MeetingScreenProps> = ({route}) => {
  const {room, isHost, password} = route.params;
  const jitsiMeeting = useRef<any>(null);
  const hasHandled = useRef(false); // 幂等开关
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  /* -------- 会议历史记录 -------- */
  const saveMeetingRecord = async (roomName: string) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const records = existing ? JSON.parse(existing) : [];

      const newRecord = {
        id: Date.now().toString(),
        room: roomName,
        date: new Date().toLocaleString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([newRecord, ...records]),
      );
    } catch (err) {
      console.warn('Failed to save meeting record:', err);
    }
  };

  /* -------- 会议结束回调 -------- */
  const onReadyToClose = useCallback(() => {
    if (hasHandled.current) {
      return;
    } // 只处理一次
    hasHandled.current = true;

    saveMeetingRecord(room); // 记录历史

    navigation.reset({
      // 清栈直达 Home
      index: 0,
      routes: [{name: 'Home'}],
    });

    // ⚠️ 不要再调用 jitsiMeeting.current.close()
  }, [navigation, room]);

  /* -------- 其余事件保持不变 -------- */
  const onConferenceJoined = useCallback(() => {
    if (
      isHost &&
      password &&
      jitsiMeeting.current?.setPassword instanceof Function
    ) {
      jitsiMeeting.current.setPassword(password);
    }
  }, [isHost, password]);

  const eventListeners = {
    onReadyToClose,
    onConferenceJoined,
  };

  /* -------- 组件卸载时清理 -------- */
  useEffect(
    () => () => {
      jitsiMeeting.current?.dispose?.();
      jitsiMeeting.current = null;
    },
    [],
  );

  return (
    <JitsiMeeting
      ref={jitsiMeeting}
      room={room}
      serverURL="https://gibranzhang.xyz/"
      eventListeners={eventListeners as any}
      style={{flex: 1}}
      /* --- 直接合并 config / configOverwrite 避免多层 --- */
      config={{
        hideConferenceTimer: true,
        lobbyEnabled: true,
        recordingServiceEnabled: true,
        fileRecordingsEnabled: true,
        startWithAudioMuted: !isHost,
        startWithVideoMuted: !isHost,
      }}
      flags={{
        'audioMute.enabled': true,
        'fullscreen.enabled': false,
        'pip.enabled': true,
        'conference-timer.enabled': true,
        'file-recording.enabled': true,
        'recording.enabled': true,
      }}
    />
  );
};

export default MeetingScreen;
