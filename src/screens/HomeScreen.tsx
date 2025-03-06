import React, {useCallback, useState} from 'react';
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {Text, Avatar, List} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  useFocusEffect,
  StackActions,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MeetingRecord {
  id: string;
  room: string;
  date: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [meetingHistory, setMeetingHistory] = useState<MeetingRecord[]>([]);

  // 读取会议历史
  const loadMeetingHistory = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('meetingHistory');
      if (storedRecords) {
        setMeetingHistory(JSON.parse(storedRecords));
      }
    } catch (error) {
      console.log('Error loading meeting history', error);
    }
  };

  // 删除某条会议记录
  const deleteMeetingRecord = async (id: string) => {
    try {
      const updated = meetingHistory.filter(item => item.id! == id);
      setMeetingHistory(updated);
      await AsyncStorage.setItem('meetingHistory', JSON.stringify(updated));
    } catch (error) {
      console.log('Error deleting meeting record', error);
    }
  };

  // 组件加载或返回时，更新会议记录
  useFocusEffect(
    useCallback(() => {
      loadMeetingHistory();
    }, []),
  );

  // 渲染历史会议列表项
  const renderMeetingItem = ({item}: {item: MeetingRecord}) => {
    return (
      <List.Item
        title={item.room}
        description={item.date}
        left={props => <List.Icon {...props} icon="video" />}
        right={() => (
          <TouchableOpacity
            onPress={() => deleteMeetingRecord(item.id)}
            style={styles.deleteButton}>
            <Image
              source={require('../assets/delete.png')}
              style={styles.deleteIcon}
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
    <LinearGradient colors={['#FFEFBA', '#FFD194']} style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* 自定义顶部栏 */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>视频会议</Text>
        <Avatar.Image size={40} source={require('../assets/avatar.jpg')} />
      </View>

      {/* 按钮区域 */}
      <View style={styles.buttonRow}>
        {/* 加入会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('JoinMeeting')}>
          <Image
            source={require('../assets/plus.png')}
            style={[styles.iconImage, {tintColor: undefined}]}
          />
          <Text style={styles.iconText}>加入会议</Text>
        </TouchableOpacity>

        {/* 快速会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            const newRoom = `quick-room-${Date.now()}`;
            navigation.navigate('Meeting', {room: newRoom, isHost: true});
          }}>
          <Image
            source={require('../assets/quick_meeting.png')}
            style={[styles.iconImage, {tintColor: undefined}]}
          />
          <Text style={styles.iconText}>快速会议</Text>
        </TouchableOpacity>

        {/* 创建加密会议 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('CreateSecureMeeting')}>
          <Image
            source={require('../assets/lock.png')}
            style={[styles.iconImage, {tintColor: undefined}]}
          />
          <Text style={styles.iconText}>加密会议</Text>
        </TouchableOpacity>
      </View>

      {/* 历史会议 */}
      <Text style={styles.sectionTitle}>历史会议</Text>
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
            style={[styles.emptyImage, {tintColor: '#FFA500'}]}
          />
          <Text style={styles.emptyText}>暂无会议记录</Text>
        </View>
      )}

      {/* 自定义底部导航栏 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/video.png')}
            style={[styles.footerIcon, {tintColor: '#FF6F61'}]}
          />
          <Text style={styles.footerText}>会议</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/ai.png')}
            style={[styles.footerIcon, {tintColor: '#d7501d'}]}
          />
          <Text style={styles.footerText}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.footerItem}>
          <Image
            source={require('../assets/people.png')}
            style={[styles.footerIcon, {tintColor: '#d7501d'}]}
          />
          <Text style={styles.footerText}>我的</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  /*********** 容器 ***********/
  container: {
    flex: 1,
  },

  /*********** 顶部栏 ***********/
  topBar: {
    marginTop: 40, // 让背景延伸到状态栏下
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  /*********** 功能按钮区 ***********/
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 10,
  },
  iconButton: {
    alignItems: 'center',
    width: 80,
  },
  iconImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
    // tintColor: undefined  // 保持原色，防止被背景遮盖
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  /*********** 历史会议区 ***********/
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#333',
  },
  deleteButton: {
    justifyContent: 'center',
    marginRight: 15,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: undefined, // 红色删除按钮
  },

  /*********** 空状态 ***********/
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },

  /*********** 底部导航 ***********/
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    color: '#333',
  },
});

export default HomeScreen;
