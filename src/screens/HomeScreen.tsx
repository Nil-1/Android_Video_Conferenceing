import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native'; // Ensure this library is installed

const HomeScreen = () => {
  const navigation = useNavigation();
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LinearGradient
      colors={['#FFEFBA', '#FFFFFF']} // Warm color gradient
      style={styles.container}>
      <Title style={styles.title}>Video Conference</Title>

      <TextInput
        label="Room Name"
        value={room}
        onChangeText={setRoom}
        mode="outlined"
        style={styles.input}
        placeholder="Enter or create a room"
      />

      <TextInput
        label="Meeting Password(Optional)"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        placeholder="Set a password (optional)"
        secureTextEntry={true}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Meeting', {room, password})}
          style={styles.button}
          contentStyle={styles.buttonContent}
          disabled={!room} // Disable button if no room
        >
          Join Meeting
        </Button>

        <Button
          mode="contained"
          onPress={() => {
            const newRoom = 'room-${Date.now()}';
            setRoom(newRoom);
            navigation.navigate('Meeting', {room: newRoom, isHost: true});
          }}
          style={styles.button}
          contentStyle={styles.buttonContent}>
          Quick Meeting
        </Button>

        <Button
          mode="contained"
          onPress={() => {
            if (!password) {
              Alert.alert('Please set a password for encryption');
              return;
            }
            const newRoom = 'secure-room-${Date.now()}';
            setRoom(newRoom);
            navigation.navigate('Meeting', {
              room: newRoom,
              password,
              isHost: true,
            });
          }}
          style={[styles.button, styles.secureButton]}
          constentStyle={styles.buttonContent}
          disabled={!password}>
          Create Secure Meeting
        </Button>
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginVertical: 5,
    borderRadius: 8,
  },
  secureButton: {
    backgroundColor: '#FF6F61', // 红色，强调安全会议
  },
  buttonContent: {
    height: 50,
  },
});

export default HomeScreen;
