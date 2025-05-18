import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import {Text, List} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  useFocusEffect,
  StackActions,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNShake from 'react-native-shake';
import {themes} from '../ui-util/themes';

interface MeetingRecord {
  id: string;
  room: string;
  date: string;
}

const THEME_KEY = 'uiTheme';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [meetingHistory, setMeetingHistory] = useState<MeetingRecord[]>([]);
  const [currentThemeKey, setCurrentThemeKey] =
    useState<string>('elegantViolet');
  const currentTheme = themes[currentThemeKey];

  // 用于旋转动画
  const rotation = useState(new Animated.Value(0))[0];

  // 定义动画边框颜色：插值效果，形成流光效果
  const animatedBorderColor = rotation.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      currentTheme.gradient[0],
      currentTheme.gradient[1],
      currentTheme.gradient[2],
      currentTheme.gradient[0],
    ],
  });

  useEffect(() => {
    // 重置动画值
    rotation.setValue(0);
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => {
      // 在组件卸载时停止动画
      anim.stop();
    };
  }, [rotation]); // 只在组件挂载时运行一次

  // 读取会议历史
  const loadMeetingHistory = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('meetingHistory');
      if (storedRecords) {
        const parsed = JSON.parse(storedRecords) as MeetingRecord[];
        const valid = parsed.filter(item => item.id && item.id.trim() !== '');
        setMeetingHistory(valid);
      }
    } catch (error) {
      console.log('Error loading meeting history', error);
    }
  };

  // 加载存储的主题
  const loadTheme = async () => {
    try {
      const storedThemeKey = await AsyncStorage.getItem(THEME_KEY);
      if (storedThemeKey && themes[storedThemeKey]) {
        setCurrentThemeKey(storedThemeKey);
      } else {
        setCurrentThemeKey('elegantViolet');
      }
    } catch (error) {
      console.log('Error loading theme', error);
    }
  };

  // 删除某条会议记录
  const deleteMeetingRecord = async (id: string) => {
    setMeetingHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      AsyncStorage.setItem('meetingHistory', JSON.stringify(updated));
      console.log('Deleted ID:', id);
      console.log('Updated list:', updated);
      return updated;
    });
  };

  // 切换主题
  const toggleTheme = useCallback(async () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentThemeKey);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const newThemeKey = themeKeys[nextIndex];
    setCurrentThemeKey(newThemeKey);
    await AsyncStorage.setItem(THEME_KEY, newThemeKey);
  }, [currentThemeKey]);

  // 监听手机摇晃事件自动切换主题
  useEffect(() => {
    const subscription = RNShake.addListener(() => {
      toggleTheme();
    });
    return () => subscription.remove();
  }, [toggleTheme]);

  // 组件加载或返回时，更新会议记录
  useFocusEffect(
    useCallback(() => {
      loadMeetingHistory();
      loadTheme();
    }, []),
  );

  // 渲染历史会议列表项
  const renderMeetingItem = ({item}: {item: MeetingRecord}) => {
    return (
      <List.Item
        title={item.room}
        description={item.date}
        left={() => (
          <Image
            source={require('../assets/video-item.png')}
            style={[
              styles.listIcon,
              {tintColor: currentTheme.footerIcon.meeting},
            ]}
          />
        )}
        right={() => (
          <TouchableOpacity
            onPress={() => deleteMeetingRecord(item.id)}
            style={styles.deleteButton}>
            <Image
              source={require('../assets/delete.png')}
              style={[
                styles.deleteIcon,
                {tintColor: currentTheme.footerIcon.meeting},
              ]}
            />
          </TouchableOpacity>
        )}
        onPress={() => {
          navigation.dispatch(StackActions.push('Meeting', {room: item.room}));
        }}
      />
    );
  };

  return (
    <LinearGradient colors={currentTheme.gradient} style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* 顶部区域：Logo + 标题（竖向排列），右侧放主题切换按钮 */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-m.png')}
            style={[styles.logo, {tintColor: currentTheme.logoTint}]}
          />
          <Text style={[styles.topBarTitle, {color: currentTheme.textColor}]}>
            意行千山，天涯咫尺
          </Text>
        </View>
        <Animated.View
          style={[
            styles.themeToggleContainer,
            {
              borderColor: animatedBorderColor,
              transform: [
                {
                  rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}>
          <TouchableOpacity onPress={toggleTheme}>
            <Image
              source={require('../assets/MoreColors.png')}
              style={[styles.themeToggleIcon]}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 按钮区域 */}
      <View style={styles.line} />
      <View style={styles.buttonRow}>
        {/* 加入会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('JoinMeeting')}>
          <Image
            source={require('../assets/plus.png')}
            style={[styles.iconImage, {tintColor: currentTheme.joinIcon}]}
          />
          <Text style={[styles.iconText, {color: currentTheme.textColor}]}>
            加入会议
          </Text>
        </TouchableOpacity>

        {/* 快速会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('Meeting', {
              room: `quick-room-${Date.now()}`,
              isHost: true,
            })
          }>
          <Image
            source={require('../assets/quick_meeting.png')}
            style={[styles.iconImage, {tintColor: currentTheme.quickIcon}]}
          />
          <Text style={[styles.iconText, {color: currentTheme.textColor}]}>
            快速会议
          </Text>
        </TouchableOpacity>

        {/* 创建加密会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('CreateSecureMeeting')}>
          <Image
            source={require('../assets/lock.png')}
            style={[styles.iconImage, {tintColor: currentTheme.secureIcon}]}
          />
          <Text style={[styles.iconText, {color: currentTheme.textColor}]}>
            加密会议
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.line} />

      {/* 历史会议 */}
      <Text style={[styles.sectionTitle, {color: currentTheme.textColor}]}>
        历史会议
      </Text>
      {meetingHistory.length > 0 ? (
        <FlatList
          data={meetingHistory}
          keyExtractor={item => item.id}
          renderItem={renderMeetingItem}
          style={{flex: 1}}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/coffee.png')}
            style={[styles.emptyImage, {tintColor: currentTheme.joinIcon}]}
          />
          <Text style={[styles.emptyText, {color: currentTheme.textColor}]}>
            暂无会议记录
          </Text>
        </View>
      )}

      {/* 自定义底部导航栏 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Image
            source={require('../assets/video.png')}
            style={[
              styles.footerIcon,
              {tintColor: currentTheme.footerIcon.meeting},
            ]}
          />
          <Text style={[styles.footerText, {color: currentTheme.textColor}]}>
            会议
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('AIChat')}>
          <Image
            source={require('../assets/ai.png')}
            style={[styles.footerIcon, {tintColor: currentTheme.footerIcon.ai}]}
          />
          <Text style={[styles.footerText, {color: currentTheme.textColor}]}>
            AI
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('MyPage')}>
          <Image
            source={require('../assets/people.png')}
            style={[
              styles.footerIcon,
              {tintColor: currentTheme.footerIcon.account},
            ]}
          />
          <Text style={[styles.footerText, {color: currentTheme.textColor}]}>
            我的
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  line: {height: 1, backgroundColor: 'rgba(0,0,0,0.15)'},
  /******** 顶部区域 ********/
  topBar: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 0, // 缩小 logo 与标题间距
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleIcon: {
    width: 36,
    height: 36,
    // 保持原始彩色，不添加 tintColor
  },
  /******** 功能按钮区 ********/
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 10,
    borderRadius: 8,
    width: 80,
  },
  iconImage: {
    width: 48,
    height: 48,
    marginBottom: 5,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '600',
  },
  /******** 历史会议 ********/
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
    marginTop: 10,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    marginRight: 10,
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
  /******** 空状态 ********/
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  /******** 底部导航 ********/
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  footerItem: {
    alignItems: 'center',
    width: 80,
  },
  footerIcon: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
