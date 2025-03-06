import React, {useState} from 'react';
import {StyleSheet, Image} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const JoinMeetingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [room, setRoom] = useState('');

  return (
    <LinearGradient colors={['#FFA07A', '#FFD700']} style={styles.container}>
      <Title style={styles.title}>加入会议</Title>

      <Image
        source={require('../assets/plus.png')}
        style={[styles.icon, {tintColor: 'white'}]}
      />

      <TextInput
        label="会议号"
        value={room}
        onChangeText={setRoom}
        mode="outlined"
        style={styles.input}
        placeholder="输入会议号"
      />

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Meeting', {room})}
        style={styles.button}
        disabled={!room.trim()}>
        加入会议
      </Button>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20},
  input: {width: '100%', marginBottom: 20, backgroundColor: 'white'},
  button: {width: '100%', borderRadius: 8, backgroundColor: '#FF4500'},
  icon: {width: 80, height: 80, marginBottom: 20},
});

export default JoinMeetingScreen;
