import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from "@react-navigation/native"; // Ensure this library is installed

const HomeScreen = () => {
  const navigation = useNavigation();
  const [room, setRoom] = useState('');

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

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Meeting', {room})}
        style={styles.button}
        contentStyle={styles.buttonContent}
        disabled={!room}>
        Join Meeting
      </Button>

      <Button
        mode="outlined"
        onPress={() => {
          const newRoom = `room-${Date.now()}`;
          setRoom(newRoom);
          navigation.navigate('Meeting', {room: newRoom, isHost: true});
        }}
        style={[styles.button, styles.outlinedButton]}
        contentStyle={styles.buttonContent}>
        Create Meeting
      </Button>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    width: '80%',
    marginVertical: 10,
    borderRadius: 25,
  },
  buttonContent: {
    height: 50,
  },
  outlinedButton: {
    borderWidth: 2,
    borderColor: '#FF6F61', // Warm color border
  },
});

export default HomeScreen;
