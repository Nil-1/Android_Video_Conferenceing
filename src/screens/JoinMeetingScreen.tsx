import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Image,
  StatusBar,
  Animated,
  Easing,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themes} from '../ui-util/themes';
import {Title} from 'react-native-paper';

const THEME_KEY = 'uiTheme';

const JoinMeetingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [room, setRoom] = useState('');
  const [currentTheme, setCurrentTheme] = useState(themes.elegantViolet);
  // 记录当前渐变背景的起始和结束坐标
  const [currentAngle, setCurrentAngele] = useState(0);
  // 创建动画值
  const angleAnim = useState(new Animated.Value(0))[0];

  // 启动无限循环动画
  useEffect(() => {
    angleAnim.setValue(0);
    const anim = Animated.loop(
      Animated.timing(angleAnim, {
        toValue: 360,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false, // 不能使用 native driver 动画非 transform 数值
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [angleAnim]);

  // 监听动画值变化，并计算出渐变起始与结束坐标
  useEffect(() => {
    const listenerId = angleAnim.addListener(({value}) => {
      setCurrentAngele(value);
    });
    return () => {
      angleAnim.removeListener(listenerId);
    };
  }, [angleAnim]);

  // 加载当前主题
  const loadTheme = async () => {
    try {
      const storedThemeKey = await AsyncStorage.getItem(THEME_KEY);
      if (storedThemeKey && themes[storedThemeKey]) {
        setCurrentTheme(themes[storedThemeKey]);
      } else {
        setCurrentTheme(themes.elegantViolet);
      }
    } catch (error) {
      console.log('Error loading theme', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, []),
  );

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

      {/* 顶部导航栏：使用 SafeAreaView 保证位于屏幕顶部 */}
      <SafeAreaView style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Title style={[styles.navTitle, {color: currentTheme.textColor}]}>
          加入会议
        </Title>
        <Image
          source={require('../assets/logo-m.png')}
          style={[styles.navLogo, {tintColor: currentTheme.logoTint}]}
        />
      </SafeAreaView>

      {/* 内容区域 */}
      <View style={styles.content}>
        <Title style={[styles.title, {color: currentTheme.textColor}]}>
          加入会议
        </Title>
        <Image
          source={require('../assets/plus.png')}
          style={[styles.icon, {tintColor: currentTheme.joinIcon}]}
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
          style={[styles.button, {backgroundColor: currentTheme.secureIcon}]}
          disabled={!room.trim()}>
          加入会议
        </Button>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  // 顶部导航栏：绝对定位，确保在最上方
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
    width: 48, // 增大返回箭头尺寸
    height: 48,
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
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
});

export default JoinMeetingScreen;
