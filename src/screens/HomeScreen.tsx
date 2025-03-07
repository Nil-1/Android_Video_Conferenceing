import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
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
import {themes} from '../util/themes';

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
              style={[styles.deleteIcon, {tintColor: '#F44E4E'}]}
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
        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.themeToggleButton}>
          <Text
            style={[styles.themeToggleText, {color: currentTheme.textColor}]}>
            切换主题
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/video.png')}
            style={[styles.footerIcon, {tintColor: '#E87EA0'}]}
          />
          <Text style={styles.footerText}>会议</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/ai.png')}
            style={[styles.footerIcon, {tintColor: '#FFA500'}]}
          />
          <Text style={styles.footerText}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/people.png')}
            style={[styles.footerIcon, {tintColor: '#FF4500'}]}
          />
          <Text style={styles.footerText}>我的</Text>
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
  themeToggleButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginRight: 15,
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
