import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TextInput, Title} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themes} from '../ui-util/themes';
import {chatWithQwenStream} from '../ui-util/aliApi';

interface Message {
  role: string;
  content: string;
}

const THEME_KEY = 'uiTheme';

const AIChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {role: 'system', content: 'You are a helpful assistant.'},
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState(themes.elegantViolet);

  // 背景渐变动画：当前角度状态与动画值
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const angleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    angleAnim.setValue(0);
    const anim = Animated.loop(
      Animated.timing(angleAnim, {
        toValue: 360,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false, // 不能对非 transform 属性使用 native driver
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

  const flatListRef = useRef<FlatList<Message>>();

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: messages.length - 1,
          animated: true,
        });
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    // 添加用户消息
    const userMessage: Message = {role: 'user', content: input};
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 添加一个助手占位消息
    const assistantMessage: Message = {role: 'assistant', content: ''};
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 调用 aliApi，传入最新的消息数组
      const finalContent = await chatWithQwenStream([...messages, userMessage]);
      // 更新助手消息
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...assistantMessage,
          content: finalContent,
        };
        return updated;
      });
      scrollToBottom();
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...assistantMessage,
          content: '⚠️ AI 服务器错误，请稍后重试。',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Title style={[styles.navTitle, {color: currentTheme.textColor}]}>
          AI 聊天
        </Title>
        <Image
          source={require('../assets/logo-m.png')}
          style={[styles.navLogo, {tintColor: currentTheme.logoTint}]}
        />
      </SafeAreaView>

      {/* 聊天内容 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor:
                  item.role === 'user'
                    ? currentTheme.userBubble || '#DCF8C6'
                    : currentTheme.assistantBubble || '#EAEAEA',
              },
            ]}>
            <Text style={[styles.messageText, {color: currentTheme.textColor}]}>
              {item.content}
            </Text>
          </View>
        )}
        onContentSizeChange={scrollToBottom}
        style={styles.chatList}
      />
      {loading && (
        <ActivityIndicator size="small" color={currentTheme.secureIcon} />
      )}

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="输入你的问题..."
          style={[
            styles.textInput,
            {backgroundColor: currentTheme.inputBackground || '#fff'},
          ]}
          placeholderTextColor={currentTheme.placeholderColor || '#999'}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendButton,
            {backgroundColor: currentTheme.secureIcon},
          ]}>
          <Text style={styles.sendText}>发送</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  navbar: {
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
    width: 48,
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
  chatList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {fontSize: 16},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AIChatScreen;
