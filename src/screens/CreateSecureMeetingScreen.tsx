import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {themes} from '../ui-util/themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const THEME_KEY = 'uiTheme';

const CreateSecureMeetingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [currentTheme, setCurrentTheme] = useState(themes.elegantViolet);
  const [currentAngle, setCurrentAngle] = useState(0);
  const angleAnim = useState(new Animated.Value(0))[0];
  const [roomName, setRoomName] = useState(''); // 新增会议室名称

  useEffect(() => {
    angleAnim.setValue(0);
    const anim = Animated.loop(
      Animated.timing(angleAnim, {
        toValue: 360,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [angleAnim]);

  // 监听动画值变化，将其转换为角度状态
  useEffect(() => {
    const listenerId = angleAnim.addListener(({value}) => {
      setCurrentAngle(value);
    });
    return () => angleAnim.removeListener(listenerId);
  }, [angleAnim]);

  const loadTheme = async () => {
    try {
      const storedThemeKey = await AsyncStorage.getItem(THEME_KEY);
      if (storedThemeKey && themes[storedThemeKey]) {
        setCurrentTheme(themes[storedThemeKey]);
      } else {
        setCurrentTheme(themes.elegantViolet);
      }
    } catch (error) {
      console.log('CreateSecureMeetingSCreen Error loading theme', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, []),
  );

  const handleCreateSecureMeeting = () => {
    if (password.length < 4) {
      Alert.alert('密码至少为4位');
      return;
    }
    const newRoom = roomName.trim()
      ? roomName.trim()
      : `secure-room-${Date.now()}`;
    navigation.navigate('Meeting', {room: newRoom, password, isHost: true});
  };

  return (
    <LinearGradient
      colors={currentTheme.gradient}
      useAngle={true}
      angle={currentAngle}
      angleCenter={{x: 0.5, y: 0.5}}
      style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* 顶部导航栏：左侧返回箭头，中间标题，右侧染色后的 logo */}
      <SafeAreaView style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Title style={[styles.navTitle, {color: currentTheme.textColor}]}>
          创建加密会议
        </Title>
        <Image
          source={require('../assets/logo-m.png')}
          style={[styles.navLogo, {tintColor: currentTheme.logoTint}]}
        />
      </SafeAreaView>

      {/* 内容区域 */}
      <View style={styles.content}>
        <Title style={[styles.title, {color: currentTheme.textColor}]}>
          创建加密会议
        </Title>
        <TextInput
          label="会议室名称（可选）"
          value={roomName}
          onChangeText={text => setRoomName(text)}
          mode="outlined"
          style={styles.input}
          placeholder="输入会议室名称"
        />
        <TextInput
          label="设置会议密码"
          value={password}
          onChangeText={text => setPassword(text)}
          mode="outlined"
          style={styles.input}
          placeholder="输入会议密码"
          secureTextEntry
        />
        <Button
          mode="contained"
          onPress={handleCreateSecureMeeting}
          style={[styles.button, {backgroundColor: currentTheme.secureIcon}]}
          contentStyle={styles.buttonContent}
          disabled={password.length < 4}>
          创建加密会议
        </Button>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
  },
  backIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'white',
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
