import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const CreateSecureMeetingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState<string>('');

  const handleCreateSecureMeeting = () => {
    if (password.length < 4) {
      Alert.alert('密码至少为4位');
      return;
    }
    const newRoom = `secure-room-${Date.now()}`;
    navigation.navigate('Meeting', {room: newRoom, password, isHost: true});
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>创建加密会议</Title>

      <TextInput
        label="设置会议密码"
        value={password}
        onchangeText={text => setPassword(text)}
        mode="outlined"
        style={styles.input}
        placeholder="输入会议密码"
        left={<TextInput.Icon name="lock" />}
        secureTextEntry
      />

      <Button
        mode="contained"
        onPress={handleCreateSecureMeeting}
        style={styles.button}
        contentStyle={styles.buttonContent}
        disabled={password.length < 4}>
        创建加密会议
      </Button>
    </View>
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
});

export default CreateSecureMeetingScreen;
