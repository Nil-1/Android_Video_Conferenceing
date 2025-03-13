import RNFetchBlob from 'rn-fetch-blob';

const API_KEY = 'sk-e7f6568c533d4743a308cfa9a7953d5c'; // 请替换为实际 API Key
const API_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

/**
 * parseResponseData - 解析完整响应数据，提取每行 JSON 中的 content 并拼接成一句话
 * @param data 完整响应数据（字符串），可能包含 "data:" 前缀、多行 JSON 以及 "[DONE]" 标记
 * @returns 拼接后的文本内容
 */
function parseResponseData(data: string): string {
  const lines = data.split('\n').filter(Boolean);
  let accumulatedContent = '';

  for (let line of lines) {
    // 如果包含 "data:" 前缀，则移除
    if (line.startsWith('data:')) {
      line = line.substring(5).trim();
    }
    // 跳过 "[DONE]" 标记
    if (line === '[DONE]') {
      continue;
    }
    try {
      const json = JSON.parse(line);
      // 根据阿里大模型返回格式，提取 choices[0].delta.content 的内容
      if (
        json.choices &&
        Array.isArray(json.choices) &&
        json.choices.length > 0 &&
        json.choices[0].delta &&
        json.choices[0].delta.content
      ) {
        accumulatedContent += json.choices[0].delta.content;
      }
    } catch (err) {
      console.warn('JSON parse error on line:', line, err);
    }
  }
  console.log('Final accumulated content:', accumulatedContent);
  return accumulatedContent;
}

/**
 * chatWithQwenStream - 通过 RNFetchBlob 调用阿里大模型接口（qwen-omni-turbo，只支持流式响应）
 * 获取完整响应后解析出所有 JSON 块中的 content 并拼接成一句话返回
 * @param messages 聊天消息数组，如 [{ role: 'user', content: '你好' }]
 * @returns 拼接后的文本内容
 */
export async function chatWithQwenStream(messages: any[]): Promise<string> {
  try {
    const res = await RNFetchBlob.config({
      // 根据需要可添加配置项，如 timeout 等
    }).fetch(
      'POST',
      API_URL,
      {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        model: 'qwen-omni-turbo', // 该模型只支持 stream 模式
        messages,
        stream: true, // 必须开启流式响应
        stream_options: {include_usage: true},
        modalities: ['text'],
      }),
    );
    console.log('Raw response data:', res.data);
    const finalContent = parseResponseData(res.data);
    return finalContent;
  } catch (error) {
    console.error('Error calling Qwen API with RNFetchBlob:', error);
    throw error;
  }
}
