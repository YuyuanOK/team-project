/**
 * AI服务封装
 * 提供统一的AI功能接口，包括缓存、队列管理等
 */

// AI服务配置 - 通义千问（DashScope）
const AI_SERVICE_CONFIG = {

  API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', 

  API_KEY: 'sk-a94bd765531f4634822f878e0d01ebcd', 
  
  // 模型名称（通义千问模型）
  MODEL: 'qwen-flash', // 或 'qwen-turbo', 'qwen-max' 等
  
  // 缓存配置
  CACHE_KEY: 'ai_cache',
  CACHE_EXPIRE: 24 * 60 * 60 * 1000, // 24小时
  
  // 请求队列配置
  MAX_CONCURRENT: 3, // 最大并发数
  REQUEST_TIMEOUT: 30000, // 30秒超时
};

// AI请求队列管理
class AIRequestQueue {
  constructor() {
    this.queue = [];
    this.processing = 0;
    this.maxConcurrent = AI_SERVICE_CONFIG.MAX_CONCURRENT;
  }
  
  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.processing++;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      this.process();
    }
  }
}

// 本地缓存管理
const AICache = {
  get(key) {
    try {
      const cache = uni.getStorageSync(AI_SERVICE_CONFIG.CACHE_KEY);
      if (cache && cache[key]) {
        const { data, timestamp } = cache[key];
        // 检查缓存是否过期
        if (Date.now() - timestamp < AI_SERVICE_CONFIG.CACHE_EXPIRE) {
          return data;
        } else {
          // 删除过期缓存
          delete cache[key];
          uni.setStorageSync(AI_SERVICE_CONFIG.CACHE_KEY, cache);
        }
      }
    } catch (e) {
      console.error('读取AI缓存失败:', e);
    }
    return null;
  },
  
  set(key, data) {
    try {
      let cache = uni.getStorageSync(AI_SERVICE_CONFIG.CACHE_KEY) || {};
      cache[key] = {
        data,
        timestamp: Date.now()
      };
      uni.setStorageSync(AI_SERVICE_CONFIG.CACHE_KEY, cache);
    } catch (e) {
      console.error('保存AI缓存失败:', e);
    }
  },
  
  // 生成缓存键
  generateKey(prompt, options = {}) {
    return `ai_${JSON.stringify({ prompt, options })}`;
  }
};

// AI请求封装（使用模拟数据，实际需要替换为真实API）
async function callAI(prompt, options = {}) {
  const cacheKey = AICache.generateKey(prompt, options);
  
  // 检查缓存
  if (!options.forceRefresh) {
    const cached = AICache.get(cacheKey);
    if (cached) {
      console.log('使用AI缓存结果');
      return cached;
    }
  }
  
  // 如果没有配置API，返回模拟数据（去除空格后检查）
  const apiKey = AI_SERVICE_CONFIG.API_KEY ? AI_SERVICE_CONFIG.API_KEY.trim() : '';
  if (!apiKey || apiKey === '') {
    console.warn('AI API未配置，返回模拟数据');
    return getMockAIResponse(prompt, options);
  }
  
  // 加入请求队列
  const requestQueue = new AIRequestQueue();
  const result = await requestQueue.add(async () => {
    try {
      // 通义千问API调用（使用OpenAI兼容格式）
      const response = await new Promise((resolve, reject) => {
        uni.request({
          url: AI_SERVICE_CONFIG.API_URL,
          method: 'POST',
          data: {
            model: options.model || AI_SERVICE_CONFIG.MODEL,
            messages: [
              { role: 'system', content: getSystemPrompt(options.type) },
              { role: 'user', content: prompt }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 500
          },
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-DashScope-SSE': 'disable'
          },
          timeout: AI_SERVICE_CONFIG.REQUEST_TIMEOUT,
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
      
      // 检查响应状态
      if (response.statusCode === 200) {
        // 实际API数据在 response.data 中
        const apiData = response.data;
        if (!apiData) {
          console.error('API返回数据为空:', response);
          throw new Error('API返回数据格式不正确');
        }
        
        // 如果response.data是字符串，尝试解析
        let parsedData = apiData;
        if (typeof apiData === 'string') {
          try {
            parsedData = JSON.parse(apiData);
          } catch (e) {
            console.error('解析API响应失败:', e);
            throw new Error('API返回数据格式不正确');
          }
        }
        
        const result = parseAIResponse(parsedData, options.type);
        // 缓存结果
        AICache.set(cacheKey, result);
        return result;
      } else {
        console.error('通义千问API调用失败:', response);
        throw new Error(`AI请求失败: ${response.statusCode} - ${response.data?.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('通义千问API调用异常:', error);
      // API调用失败时返回模拟数据
      console.warn('API调用失败，返回模拟数据');
      return getMockAIResponse(prompt, options);
    }
  });
  
  return result;
}

// 获取系统提示词
function getSystemPrompt(type) {
  const prompts = {
    task_decompose: '你是一个专业的任务管理助手。请将用户输入的主任务拆解为3-5个可执行的子任务，每个子任务应该具体、可操作。必须返回纯JSON格式，不要包含任何其他文字：{"subtasks": ["子任务1", "子任务2", ...]}',
    focus_recommend: '你是一个专注力提升专家。根据任务类型推荐合适的专注音效和时长。返回JSON格式：{"mode": 0, "audioIndex": 0, "duration": 25}，mode: 0=深度工作, 1=短休息, 2=长休息',
    emotional_guidance: '你是一个温暖贴心的心理咨询师。当用户分享情绪、压力或困扰时，请先表达理解和共情，认可他们的感受，然后提供简洁而有力的建设性建议（不超过50字）。建议要具体可行，避免空洞的安慰。语气要温和、支持性，让用户感受到被理解和陪伴。可以适当使用emoji（如💕、✨、🌟、💪等）每次回复要有不同的表达方式和角度，避免重复。如果用户情绪严重，要温和地建议寻求专业帮助。',
    intelligent_review: '你是一个温暖而专业的数据分析助手。基于用户的任务完成历史数据，用150-200字进行温和、鼓励性的分析。请按以下三段式结构：第一段【完成效率】：肯定用户的完成情况，用温和的语气指出效率亮点；第二段【任务制定改进建议】：用建设性的方式提出1-2个具体可行的改进建议，语气要温和，避免批评；第三段【优点鼓励】：发现并强调用户的优点和进步，给予真诚的鼓励。整体语气要像朋友一样温暖、支持，多用"你已经做得很好了"、"相信你可以"等鼓励性表达。',
    overdue_prediction: '你是一个任务管理专家。分析任务列表，预测哪些任务有逾期风险，并给出原因和建议。返回JSON格式：{"risks": [{"task": "任务名", "reason": "原因", "suggestion": "建议"}]}',
    distraction_reminder: '你是一个专注力教练。生成一条温和、鼓励性的防分心提醒文案，不超过30字。'
  };
  
  return prompts[type] || '你是一个有用的AI助手。';
}

// 解析AI响应
function parseAIResponse(data, type) {
  // OpenAI格式
  if (data.choices && data.choices[0]) {
    const content = data.choices[0].message.content;
    
    // 尝试解析JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // 如果不是JSON，返回文本
      return { text: content };
    }
  }
  
  // 其他格式的响应处理
  return data;
}

// 模拟AI响应（用于开发和测试）
function getMockAIResponse(prompt, options) {
  const type = options.type || 'default';
  
  switch (type) {
    case 'task_decompose':
      return {
        subtasks: [
          '分析任务需求和目标',
          '制定详细执行计划',
          '准备所需资源和工具',
          '执行任务并记录进度',
          '检查完成情况并总结'
        ]
      };
      
    case 'focus_recommend':
      return {
        mode: 0, // 深度工作
        audioIndex: 0, // 雨声
        duration: 25
      };
      
    case 'emotional_guidance':
      return {
        text: '我理解你的感受。每个人都会有情绪波动的时候，这是很正常的。建议你尝试深呼吸，或者做一些让自己放松的事情。记住，困难都是暂时的，你一定能度过难关。'
      };
      
    case 'intelligent_review':
      return {
        text: '根据你的任务完成情况，本周完成率较高，表现不错！建议继续保持，同时注意合理分配时间，避免任务堆积。',
        strengths: ['任务完成及时', '专注度高'],
        improvements: ['可以提前规划任务', '注意休息时间']
      };
      
    case 'overdue_prediction':
      return {
        risks: [
          {
            task: '示例任务',
            reason: '截止日期临近且优先级较高',
            suggestion: '建议优先处理，或调整截止日期'
          }
        ]
      };
      
    case 'distraction_reminder':
      return {
        text: '专注当下，成就未来。保持专注，你正在变得更好！'
      };
      
    default:
      return { text: '这是一个模拟响应。请配置AI API以获取真实结果。' };
  }
}

// 导出AI服务
export default {
  // 设置API密钥
  setAPIKey(key) {
    AI_SERVICE_CONFIG.API_KEY = key;
  },
  
  // 设置API URL
  setAPIUrl(url) {
    AI_SERVICE_CONFIG.API_URL = url;
  },
  
  // 任务拆解
  async decomposeTask(mainTask) {
    const prompt = `请将以下任务拆解为3-5个可执行的子任务：${mainTask}`;
    return await callAI(prompt, { type: 'task_decompose' });
  },
  
  // 专注场景推荐
  async recommendFocusScene(taskType) {
    const typeMap = {
      'work': '工作',
      'study': '学习',
      'life': '生活'
    };
    const prompt = `根据任务类型"${typeMap[taskType] || taskType}"，推荐合适的专注音效和时长。`;
    return await callAI(prompt, { type: 'focus_recommend' });
  },
  
  // 情绪疏导
  async emotionalGuidance(noteContent, forceRefresh = false) {
    // 提取原始内容（去除时间戳和随机数）
    const cleanContent = noteContent.replace(/\n\[生成时间:.*?随机:.*?\]/g, '').trim();
    const prompt = `用户写下了以下内容：${cleanContent}。请生成共情回复和建议。`;
    return await callAI(prompt, { type: 'emotional_guidance', forceRefresh: forceRefresh });
  },
  
  // 智能复盘
  async intelligentReview(historyData) {
    const prompt = `基于以下历史数据，生成个性化复盘建议：${JSON.stringify(historyData)}`;
    return await callAI(prompt, { type: 'intelligent_review' });
  },
  
  // 逾期预测
  async predictOverdue(tasks) {
    const prompt = `分析以下任务，预测逾期风险：${JSON.stringify(tasks)}`;
    return await callAI(prompt, { type: 'overdue_prediction' });
  },
  
  // 防分心提醒文案
  async generateDistractionReminder() {
    const prompt = '生成一条温和的防分心提醒文案';
    return await callAI(prompt, { type: 'distraction_reminder' });
  },
  
  // 清除缓存
  clearCache() {
    try {
      uni.removeStorageSync(AI_SERVICE_CONFIG.CACHE_KEY);
      return true;
    } catch (e) {
      console.error('清除AI缓存失败:', e);
      return false;
    }
  }
};
