import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ScrollView,
  Alert, // 引入 Alert
} from 'react-native';
import {List, Title, Provider as PaperProvider} from 'react-native-paper'; // 引入 Provider
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themes} from '../ui-util/themes'; // 假设 themes.ts 在 ui-util

const THEME_KEY = 'uiTheme';
const MEETING_HISTORY_KEY = 'meetingHistory'; // 会议记录的 AsyncStorage key

const MyPageScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentThemeKey, setCurrentThemeKey] =
    useState<keyof typeof themes>('elegantViolet');
  const currentTheme = themes[currentThemeKey];

  // 背景渐变动画
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const angleAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const listenerId = angleAnim.addListener(({value}) => {
      setCurrentAngle(value);
    });
    return () => {
      angleAnim.removeListener(listenerId);
    };
  }, [angleAnim]);

  // 加载当前主题
  const loadTheme = async () => {
    try {
      const storedThemeKey = (await AsyncStorage.getItem(THEME_KEY)) as
        | keyof typeof themes
        | null;
      if (storedThemeKey && themes[storedThemeKey]) {
        setCurrentThemeKey(storedThemeKey);
      } else {
        setCurrentThemeKey('elegantViolet'); // 默认主题
      }
    } catch (error) {
      console.log('MyPageScreen: Error loading theme', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, []),
  );

  // 清除会议记录逻辑
  const handleClearHistory = async () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有会议记录吗？此操作不可撤销。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(MEETING_HISTORY_KEY);
              // 可以选择在这里添加一个提示，例如使用 Toast 或者更新一个状态来显示消息
              Alert.alert('成功', '会议记录已清除。');
              // 如果 HomeScreen 在导航栈中，并且你希望它刷新，可能需要更复杂的逻辑
              // 例如使用事件总线或者在 HomeScreen 中也用 useFocusEffect 来刷新
            } catch (error) {
              console.error('Failed to clear meeting history', error);
              Alert.alert('错误', '清除会议记录失败。');
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  // 导航到主题选择页面 (如果存在，否则可以弹出一个 Modal)
  const navigateToThemeSelection = () => {
    // 假设你有一个 ThemeSelectionScreen
    // navigation.navigate('ThemeSelectionScreen');
    // 或者弹出一个 Modal
    Alert.alert('主题选择', '主题选择功能待实现。');
    console.log('Navigate to theme selection or open modal');
  };

  return (
    // <PaperProvider theme={{colors: {primary: currentTheme.secureIcon}}}>
    <LinearGradient
      colors={currentTheme.gradient}
      style={styles.container}
      useAngle={true}
      angle={currentAngle}
      angleCenter={{x: 0.5, y: 0.5}}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/arrow.png')}
            style={[styles.backIcon, {tintColor: currentTheme.logoTint}]}
          />
        </TouchableOpacity>
        <Title style={[styles.navTitle, {color: currentTheme.textColor}]}>
          我的
        </Title>
        {/* 为了使标题居中，可以放一个与返回按钮等宽的占位符 */}
        <View style={styles.rightPlaceholder} />
      </SafeAreaView>

      <ScrollView style={styles.content}>
        {/* 个人信息区域 - 示例 */}
        <View style={styles.section}>
          <Title style={[styles.sectionTitle, {color: currentTheme.textColor}]}>
            账户信息
          </Title>
          <List.Item
            title="用户名"
            description="示例用户" // 这里可以替换为真实数据
            left={() => (
              <List.Icon icon="account" color={currentTheme.textColor} />
            )}
            titleStyle={{color: currentTheme.textColor}}
            descriptionStyle={{color: currentTheme.textColor}}
          />
          {/* 可以添加更多个人信息项 */}
        </View>

        {/* 设置区域 */}
        <View style={styles.section}>
          <Title style={[styles.sectionTitle, {color: currentTheme.textColor}]}>
            设置
          </Title>
          <List.Item
            title="主题选择"
            left={() => (
              <List.Icon
                icon="palette" // 或者 'theme-light-dark'
                color={currentTheme.textColor}
              />
            )}
            onPress={navigateToThemeSelection}
            titleStyle={{color: currentTheme.textColor}}
            right={() => (
              <List.Icon icon="chevron-right" color={currentTheme.textColor} />
            )}
          />
          <List.Item
            title="清除会议记录"
            left={() => (
              <List.Icon icon="delete-sweep" color={currentTheme.textColor} />
            )}
            onPress={handleClearHistory}
            titleStyle={{color: currentTheme.textColor}}
          />
          {/* 可以添加更多设置项，例如： */}
          {/* <List.Item
              title="通知设置"
              left={() => <List.Icon icon="bell" color={currentTheme.textColor} />}
              onPress={() => console.log("Navigate to Notification Settings")}
              titleStyle={{color: currentTheme.textColor}}
              right={() => <List.Icon icon="chevron-right" color={currentTheme.textColor} />}
            />
            <List.Item
              title="关于我们"
              left={() => <List.Icon icon="information" color={currentTheme.textColor} />}
              onPress={() => console.log("Navigate to About Us")}
              titleStyle={{color: currentTheme.textColor}}
              right={() => <List.Icon icon="chevron-right" color={currentTheme.textColor} />}
            /> */}
        </View>

        {/* 更多区域... */}
      </ScrollView>
    </LinearGradient>
    // </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15, // 调整内边距
    paddingTop: (StatusBar.currentHeight || 0) + 10, // 适配状态栏高度
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', // 半透明背景，可以根据主题调整
    zIndex: 1, // 确保导航栏在最上层
  },
  backIcon: {
    width: 28, // 调整图标大小
    height: 28,
    resizeMode: 'contain',
  },
  navTitle: {
    fontSize: 20, // 调整标题字体大小
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    // 用于居中标题
    width: 28, // 与 backIcon 宽度一致
    height: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20, // 导航栏下方的间距
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.3)', // 更透明的背景
    paddingVertical: 10, // 调整垂直内边距
    paddingHorizontal: 15,
    borderRadius: 12, // 更大的圆角
    shadowColor: '#000', // 添加轻微阴影
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18, // 调整章节标题字体
    fontWeight: '600', // 调整字重
    marginBottom: 12,
    paddingHorizontal: 5, // 轻微调整标题内边距
  },
  // 可以为 List.Item 添加通用样式，或在组件上直接应用
});

export default MyPageScreen;
