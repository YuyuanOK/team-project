<template>
  <view class="container">
    <view class="header">
      <view class="title-container">
        <text class="title">今日待办 · {{ formattedCurrentDate }}</text>
        <view class="weather-info" @click="refreshWeather">
          <text :class="['weather-emoji', rotateClass]">{{ weatherEmoji }}</text>
          <text v-if="weatherInfo.temperature" class="weather-text">
            {{ weatherInfo.city ? weatherInfo.city + ' · ' : '' }}{{ weatherInfo.temperature }} {{ weatherInfo.weather }}
          </text>
          <text v-if="!weatherInfo.temperature && !weatherInfo.loading" class="weather-error">
            <text>点击获取天气</text>
            <text class="refresh-icon">🔄</text>
          </text>
        </view>
        <text class="quote-small">{{ hitokoto.text }}</text>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <scroll-view class="main-content scroll-view-vertical" scroll-y="true" :style="{ height: 'calc(100vh - 240rpx)' }">
      <!-- 任务类型过滤器 -->
      <view class="task-type-tabs">
        <view 
          v-for="(type, index) in taskTypes" 
          :key="index" 
          class="task-type-tab" 
          :class="{ active: activeTypeFilter === type.value }"
          @click="filterTasksByType(type.value)"
        >
          <view class="type-indicator" :style="{ backgroundColor: getTypeColor(type.value) }"></view>
          <text>{{type.label}}</text>
        </view>
        <view 
          class="task-type-tab" 
          :class="{ active: activeTypeFilter === 'all' }"
          @click="filterTasksByType('all')"
        >
          <view class="type-indicator" style="background-color: #8672f8;"></view>
          <text>全部</text>
        </view>
      </view>
      
      <!-- 任务列表 -->
      <view class="tasks-list">
        <view v-if="filteredTasks.length === 0" class="empty-list">
          <text class="empty-title">今日尚无计划</text>
          <text class="empty-subtitle">点击右下角+号添加首个任务</text>
        </view>
        
        <!-- 任务项 -->
        <view 
          v-for="(task, index) in filteredTasks" 
          :key="task.id"
          class="task-item"
        >
          <!-- 勾选框 -->
          <view class="task-checkbox" :class="{ checked: task.completed }" @click="toggleTaskStatus(index)">
            <view class="check-circle">
              <text v-if="task.completed" class="check-icon">✓</text>
            </view>
          </view>
          <!-- 任务内容（可编辑） -->
          <view class="task-content" @click="editTask(index)">
            <text class="task-text" :class="{ 'completed': task.completed }">{{ task.text }}</text>
            <view class="task-details">
              <text class="task-type-label" :style="{ backgroundColor: getTypeColor(task.type) }">{{ getTypeLabel(task.type) }}</text>
              <text class="task-priority-label" :class="task.priority">{{ getPriorityLabel(task.priority) }}</text>
            </view>
            <!-- 新增：截止日期 -->
            <view class="task-deadline" v-if="task.dueDate">
              <text style="font-size:22rpx;color:#fbbc05;margin-right:6rpx;">⏰</text>
              截止：{{ formatDisplayDate(task.dueDate) }}
            </view>
            <!-- 子任务显示 -->
            <view v-if="task.subtasks && task.subtasks.length > 0" class="task-subtasks">
              <view v-for="(subtask, subIndex) in task.subtasks" :key="subtask.id || subIndex" class="subtask-display" @click.stop="toggleSubtaskStatus(index, subIndex)">
                <view class="subtask-checkbox" :class="{ checked: subtask.completed }">
                  <text class="subtask-icon">{{ subtask.completed ? '✓' : '○' }}</text>
                </view>
                <text class="subtask-text" :class="{ 'completed': subtask.completed }">{{ subtask.text }}</text>
              </view>
            </view>
          </view>
          <!-- 删除按钮 -->
          <view class="delete-btn" @click="deleteTask(index)">
            <text class="delete-icon">×</text>
          </view>
        </view>
        
        <view class="task-spacer" v-if="filteredTasks.length > 0"></view>
      </view>
    </scroll-view>
    
    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @click="showAddTaskModal" :class="{'fab-bottom': isAddTaskPopupVisible}">
      <text class="fab-icon">+</text>
    </view>
    
    <!-- 添加任务弹窗 -->
    <uni-popup ref="addTaskPopup" type="center">
      <view class="popup-card">
        <view class="popup-title-new">{{ isEditMode ? '编辑任务' : '添加新任务' }}</view>
        <view class="popup-divider"></view>
        <textarea class="popup-textarea-new" v-model="newTask.text" placeholder="请输入任务内容..." maxlength="200" />
        <view class="popup-section-new">
          <text class="popup-section-label"><span class="popup-dot work"></span>任务类型</text>
          <view class="popup-type-row">
            <view v-for="type in taskTypes" :key="type.value" class="popup-type-tag" :class="{selected: newTask.type === type.value}" :style="{background: newTask.type === type.value ? getTypeColor(type.value) : '#f6f8fa', color: newTask.type === type.value ? '#fff' : '#333'}" @click="newTask.type = type.value">
              {{ type.label }}
            </view>
          </view>
        </view>
        <view class="popup-section-new">
          <text class="popup-section-label"><span class="popup-dot date"></span>截止日期</text>
          <view class="popup-date-row">
            <uni-datetime-picker type="date" v-model="newTask.dueDate" :clear-icon="true" :border="false" placeholder="请选择截止日期" />
          </view>
        </view>
        <view class="popup-section-new">
          <text class="popup-section-label"><span class="popup-dot priority"></span>任务重要程度</text>
          <view class="popup-priority-row">
            <view v-for="item in priorityOptions" :key="item.value" class="popup-priority-tag" :class="{selected: newTask.priority === item.value}" :style="{background: newTask.priority === item.value ? getPriorityColor(item.value) : '#f6f8fa', color: newTask.priority === item.value ? '#fff' : '#333'}" @click="newTask.priority = item.value">
              {{ item.label }}
            </view>
          </view>
        </view>
        <!-- 子任务管理 -->
        <view class="popup-section-new">
          <view class="subtasks-header">
            <text class="popup-section-label"><span class="popup-dot subtask"></span>子任务</text>
            <view class="subtask-btns">
              <button class="ai-decompose-btn" @click="decomposeTask" :disabled="!newTask.text || newTask.text.trim().length === 0">
                🤖 AI拆解
              </button>
              <button class="add-subtask-btn" @click="addSubtask">+ 手动添加</button>
            </view>
          </view>
          <view v-if="newTask.subtasks && newTask.subtasks.length > 0" class="subtasks-list">
            <view v-for="(subtask, index) in newTask.subtasks" :key="subtask.id || index" class="subtask-item">
              <checkbox :checked="subtask.completed" @tap="toggleSubtask(index)" color="#8672f8" />
              <input 
                v-model="subtask.text" 
                class="subtask-input" 
                placeholder="输入子任务内容"
                @blur="saveSubtask(index)"
              />
              <button class="delete-subtask-btn" @click="removeSubtask(index)">删除</button>
            </view>
          </view>
          <view v-else class="subtasks-empty">
            <text class="subtasks-empty-text">暂无子任务，点击上方按钮添加</text>
          </view>
        </view>
        <view class="popup-btn-row">
          <button class="popup-btn add" @click="saveTask">{{ isEditMode ? '保存' : '添加' }}</button>
          <button class="popup-btn cancel" @click="closeAddTaskModal">取消</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 完成统计 -->
    <view class="completion-bar">
      <text class="completion-text">{{ completedTasksCount == 0 ? '轻装前行' : '已完成' + completedTasksCount + '项' }} · 总计{{totalTasksCount}}项</text>
    </view>
  </view>
</template>

<script>
const typeColors = {
  work: '#4ee3c9',
  study: '#4a90e2',
  life: '#fbbc05'
};

const priorityColors = {
  high: '#ff6b6b',
  medium: '#feca57',
  low: '#1dd1a1',
  default: '#cccccc'
};

const STORAGE_KEYS = Object.freeze({
  TASKS: 'tasks',
  LAST_TASK_ID: 'last_task_id'
});

const TASK_TYPES = Object.freeze({
  WORK: 'work',
  STUDY: 'study',
  LIFE: 'life'
});

const TASK_STATUS = Object.freeze({
  PENDING: false,
  COMPLETED: true
});

const UI_CONSTANTS = Object.freeze({
  TOAST_DURATION: 5000, // 从2000ms增加到5000ms，减少提醒频率
  ANIMATION_DELAY: 300,
  EMPTY_TASK_MESSAGE: '暂无任务，点击右下角添加'
});

// 日期工具
const DateUtils = {
  // 获取今天的日期(YYYY-MM-DD)
  getTodayString() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },
  
  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },
  

  getCurrentDate() {
    return new Date();
  },
  
  // 格式化为月日格式
  formatMonthDay(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },
  
  // 获取星期几
  getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  }
};

/**
 * 将 uni.request 封装成 Promise 形式，并增加健壮性检查
 * @param {object} options uni.request 的配置项
 * @returns {Promise<any>}
 */
function promisifiedRequest(options) {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				// 200是HTTP成功状态码
				if (res.statusCode === 200) {
					// 确保返回的是对象或数组，而不是HTML字符串等
					if (typeof res.data === 'object' && res.data !== null) {
						resolve(res.data);
					} else {
						// 如果返回的不是有效JSON，拒绝Promise
						reject(new Error('响应数据格式不正确'));
					}
				} else {
					// 处理非200状态码
					reject(new Error(`HTTP错误，状态码: ${res.statusCode}`));
				}
			},
			fail: (err) => {
				// 网络层面的失败
				reject(new Error(`网络请求失败: ${err.errMsg || '未知错误'}`));
			}
		});
	});
}

// 存储工具
const StorageUtils = {
  // 获取存储数据
  getData(key, defaultValue = []) {
    try {
      const data = uni.getStorageSync(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`读取存储失败 [${key}]:`, e);
      return defaultValue;
    }
  },
  
  // 保存数据
  saveData(key, data) {
    try {
      uni.setStorageSync(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`保存数据失败 [${key}]:`, e);
      return false;
    }
  }
};

// 任务管理器
const TaskManager = {
  // 生成新任务ID
  generateTaskId() {
    let lastId = StorageUtils.getData(STORAGE_KEYS.LAST_TASK_ID, 0);
    lastId++;
    StorageUtils.saveData(STORAGE_KEYS.LAST_TASK_ID, lastId);
    return lastId.toString();
  },
  
  // 创建新任务
  createTask(title, type, date = DateUtils.getTodayString()) {
    return {
      id: this.generateTaskId(),
      title,
      type,
      date,
      completed: TASK_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };
  },
  
  // 添加任务
  addTask(tasks, task) {
    const newTasks = [...tasks, task];
    const saved = StorageUtils.saveData(STORAGE_KEYS.TASKS, newTasks);
    return saved ? newTasks : tasks;
  },
  
  // 切换任务状态
  toggleTaskStatus(tasks, taskId) {
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed
        };
      }
      return task;
    });
    
    const saved = StorageUtils.saveData(STORAGE_KEYS.TASKS, newTasks);
    return saved ? newTasks : tasks;
  },
  
  // 删除任务
  deleteTask(tasks, taskId) {
    const newTasks = tasks.filter(task => task.id !== taskId);
    const saved = StorageUtils.saveData(STORAGE_KEYS.TASKS, newTasks);
    return saved ? newTasks : tasks;
  },
  
  // 过滤今日任务
  filterTodayTasks(tasks) {
    const today = DateUtils.getTodayString();
    return tasks.filter(task => task.date === today);
  }
};

// UI工具
const UIUtils = {
  showToast(title, icon = 'none') {
    uni.showToast({
      title,
      icon,
      duration: UI_CONSTANTS.TOAST_DURATION
    });
  }
};

export default {
  name: 'HomePage',
  
  data() {
    const currentDate = DateUtils.getCurrentDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    // 计算日期格式
    const formattedToday = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    const formattedCurrentDate = `${currentMonth}月${currentDay}日`;
    
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    
    // 定义天气表情映射
    const weatherMap = {
      '晴': '☀️',
      '多云': '⛅',
      '阴': '☁️',
      '小雨': '🌧️',
      '中雨': '🌧️',
      '大雨': '⛈️',
      '暴雨': '⛈️',
      '雷阵雨': '⛈️',
      '小雪': '❄️',
      '中雪': '❄️',
      '大雪': '❄️',
      '雾': '🌫️',
      '霾': '🌫️',
      'default': '🌈'
    };
    
    // 定义日期格式
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    return {
      currentTab: 0,
      tasks: [],
      todayTasks: [],
      newTask: {
        text: '',
        type: 'work',
        priority: 'medium',
        completed: false,
        dueDate: formattedToday,
        subtasks: [] // 子任务列表
      },
      isEditMode: false,
      editingTaskIndex: -1,
      showHint: false,
      activeTypeFilter: 'all',
      isAddTaskPopupVisible: false,
      
      // 天气相关
      apiKey: 'c3a8deb40adcb804e00017290fee186e',
      weatherInfo: {
        loading: false,
        city: '定位中...',
        temperature: 'N/A',
        weather: 'N/A',
        emoji: '🤔'
      },
      weatherEmoji: '',
      city: '定位中...',
      isRefreshing: false,
      rotateClass: '',
      userLocation: null,
      
      // 任务类型
      taskTypes: [
        { label: '工作', value: 'work', color: 'work' },
        { label: '学习', value: 'study', color: 'study' },
        { label: '生活', value: 'life', color: 'life' }
      ],
      
      // 日期选择器相关
      years: [currentYear, currentYear + 1],
      months: Array.from({length: 12}, (_, i) => i + 1),
      days: Array.from({length: 31}, (_, i) => i + 1),
      datePickerValue: [0, currentMonth - 1, currentDay - 1],
      tempDate: null,
      
      // 静态常量
      CONST: {
        typeColors,
        priorityColors,
        priorityOrder,
        weatherMap,
        dayNames,
        msPerDay: 24*60*60*1000
      },
      
      // 缓存数据
      cache: {
        formattedCurrentDate,
        sortedTasks: [],
        filteredTasks: [],
        completedCount: 0,
        totalCount: 0,
        today: new Date().toDateString(),
        tomorrow: new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()
      },

      // 名言
      hitokoto: {
        text: '正在获取今日名言...',
        from: ''
      },
      priorityOptions: [
        { label: '高', value: 'high', color: 'high' },
        { label: '中', value: 'medium', color: 'medium' },
        { label: '低', value: 'low', color: 'low' }
      ],
    }
  },
  
  computed: {
    formattedCurrentDate() {
      return this.cache.formattedCurrentDate;
    },
    
    filteredTasks() {
      return this.cache.filteredTasks;
    },
    
    sortedTasks() {
      return this.cache.sortedTasks;
    },
    
    completedTasksCount() {
      return this.cache.completedCount;
    },
    
    totalTasksCount() {
      return this.cache.totalCount;
    }
  },
  
  created() {
    uni.$on('tabChange', this.handleTabChange);
  },
  
  destroyed() {
    uni.$off('tabChange', this.handleTabChange);
  },
  
  onLoad() {
    this.loadTasks();
    this.refreshWeather();
    this.fetchQuote();
  },
  
  onShow() {
    this.loadTasks();
    this.fetchQuote();
    this.refreshWeather();
  },
  
  methods: {
    // 处理标签页切换
    handleTabChange(index) {
      this.currentTab = index;
    },
    
    // 添加新任务
    addTask() {
      if (!this.validateTaskText()) return;
      
      this.tasks.push({
        text: this.newTask.text,
        type: this.newTask.type,
        priority: this.newTask.priority,
        completed: false,
        dueDate: this.newTask.dueDate
      });
      
      this.saveTasks();
      this.closeTaskPopup();
    },
    
    // 验证任务文本
    validateTaskText() {
      if (this.newTask.text.trim().length === 0) {
        uni.showToast({
          title: '任务内容不能为空',
          icon: 'none'
        });
        return false;
      }
      return true;
    },
    
    // 关闭任务弹窗
    closeTaskPopup() {
      this.$refs.addTaskPopup.close();
      this.resetNewTaskForm();
      setTimeout(() => {
        this.isAddTaskPopupVisible = false;
      }, 300);
    },
    
    // 重置新任务表单
    resetNewTaskForm() {
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      this.newTask = {
        text: '',
        type: 'work',
        priority: 'medium',
        completed: false,
        dueDate: formattedToday,
        subtasks: []
      };
      
      if (this.isEditMode) {
        this.resetEditMode();
      }
    },
    
    // 显示添加任务弹窗
    showAddTaskModal() {
      this.isAddTaskPopupVisible = true;
      this.$refs.addTaskPopup.open();
    },
    
    // 取消添加任务
    cancelAddTask() {
      this.$refs.addTaskPopup.close();
      this.resetNewTaskForm();
      setTimeout(() => {
        this.isAddTaskPopupVisible = false;
      }, 300);
    },
    
    // 切换任务完成状态
    toggleTaskStatus(index) {
      const taskIndex = this.getOriginalIndex(index);
      if (taskIndex !== -1) {
        const task = this.tasks[taskIndex];
        task.completed = !task.completed;
        
        // 如果父任务完成，所有子任务自动完成
        if (task.completed && task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.completed = true;
          });
        }
        
        this.saveTasks();
      }
    },
    
    // 切换子任务完成状态
    toggleSubtaskStatus(taskIndex, subtaskIndex) {
      const originalTaskIndex = this.getOriginalIndex(taskIndex);
      if (originalTaskIndex !== -1) {
        const task = this.tasks[originalTaskIndex];
        if (task.subtasks && task.subtasks[subtaskIndex]) {
          const subtask = task.subtasks[subtaskIndex];
          subtask.completed = !subtask.completed;
          
          // 检查所有子任务是否都完成
          const allCompleted = task.subtasks.every(st => st.completed);
          if (allCompleted && task.subtasks.length > 0) {
            task.completed = true;
          } else if (!allCompleted) {
            task.completed = false;
          }
          
          this.saveTasks();
        }
      }
    },
    
    // 删除任务
    deleteTask(index) {
      const taskId = this.filteredTasks[index].id;
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      uni.setStorageSync('tasks', this.tasks);
      this.updateCachedData();
      // 发送任务更新事件，通知其他页面刷新数据
      uni.$emit('taskUpdated');
    },
    
    // 获取原始任务索引
    getOriginalIndex(filteredIndex) {
      const filteredTask = this.cache.filteredTasks[filteredIndex];
      return this.tasks.findIndex(task => 
        task.text === filteredTask.text && 
        task.type === filteredTask.type && 
        task.priority === filteredTask.priority
      );
    },
    
    // 保存任务到本地存储
    saveTasks() {
      try {
        uni.setStorageSync('tasks', JSON.stringify(this.tasks));
        this.updateCachedData();
        // 发送任务更新事件，通知其他页面刷新数据
        uni.$emit('taskUpdated');
      } catch (e) {
        console.error('保存任务失败:', e);
      }
    },
    
    // 从本地存储加载任务
    loadTasks() {
      try {
        let storedTasks = uni.getStorageSync('tasks');
        if (typeof storedTasks === 'string') {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed)) {
            this.tasks = parsed;
          } else {
            console.warn('任务数据无效，未赋值');
          }
        } else if (Array.isArray(storedTasks)) {
          this.tasks = storedTasks;
        } else if (typeof storedTasks === 'object' && storedTasks !== null) {
          // 兼容直接存对象的情况
          this.tasks = Object.values(storedTasks);
        } else {
          console.warn('任务数据无效，未赋值');
        }
        this.updateCachedData();
      } catch (e) {
        console.error('加载任务失败:', e);
      }
    },
    
    // 更新缓存数据
    updateCachedData() {
      // 更新当前日期
      const now = new Date();
      this.cache.formattedCurrentDate = `${now.getMonth() + 1}月${now.getDate()}日`;
      
      // 更新任务统计数据
      let completedCount = 0;
      const totalCount = this.tasks.length;
      
      // 使用预排序的任务数组 - 未完成的任务优先显示
      const sortedTasks = [...this.tasks];
      sortedTasks.sort((a, b) => {
        // 首先按完成状态排序：未完成的在前
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // 如果完成状态相同，按优先级排序
        return this.CONST.priorityOrder[a.priority] - this.CONST.priorityOrder[b.priority];
      });
      
      // 计算完成数量
      for (let i = 0; i < totalCount; i++) {
        if (sortedTasks[i].completed) {
          completedCount++;
        }
      }
      
      // 更新缓存
      this.cache.completedCount = completedCount;
      this.cache.totalCount = totalCount;
      this.cache.sortedTasks = sortedTasks;
      
      // 按类型过滤
      if (this.activeTypeFilter === 'all') {
        this.cache.filteredTasks = sortedTasks;
      } else {
        this.cache.filteredTasks = [];
        for (let i = 0; i < sortedTasks.length; i++) {
          if (sortedTasks[i].type === this.activeTypeFilter) {
            this.cache.filteredTasks.push(sortedTasks[i]);
          }
        }
      }
    },
    
    // 打开日期选择器
    openDatePicker() {
      this.tempDate = null;
      
      try {
        if (this.newTask.dueDate) {
          this.setDatePickerFromString(this.newTask.dueDate);
        } else {
          this.setDatePickerToToday();
        }
      } catch(e) {
        this.setDatePickerToToday();
      }
      
      this.$refs.datePopup.open();
    },
    
    // 从日期字符串设置日期选择器
    setDatePickerFromString(dateString) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const yearIndex = this.years.indexOf(date.getFullYear());
        const monthIndex = date.getMonth();
        const dayIndex = date.getDate() - 1;
        
        this.datePickerValue = [
          yearIndex >= 0 ? yearIndex : 0, 
          monthIndex >= 0 && monthIndex < 12 ? monthIndex : 0, 
          dayIndex >= 0 && dayIndex < 31 ? dayIndex : 0
        ];
      } else {
        this.setDatePickerToToday();
      }
    },
    
    // 设置日期选择器为今天
    setDatePickerToToday() {
      const today = new Date();
      this.datePickerValue = [0, today.getMonth(), today.getDate() - 1];
    },
    
    // 日期选择器变更事件
    onDatePickerChange(e) {
      try {
        const values = e.detail.value;
        const year = this.years[values[0]] || new Date().getFullYear();
        const month = this.months[values[1]] || 1;
        const day = this.days[values[2]] || 1;
        
        this.datePickerValue = values;
        this.tempDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } catch(e) {
        console.error('日期选择器变更出错:', e);
      }
    },
    
    // 确认日期选择
    confirmDateSelection() {
      if (this.tempDate) {
        this.newTask.dueDate = this.tempDate;
      } else {
        const values = this.datePickerValue;
        if (values && values.length === 3) {
          const year = this.years[values[0]] || new Date().getFullYear();
          const month = this.months[values[1]] || 1;
          const day = this.days[values[2]] || 1;
          
          this.newTask.dueDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      
      this.tempDate = null;
      this.closeDatePopup();
    },
    
    // 清除选择的日期
    clearDate() {
      this.newTask.dueDate = '';
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '选择日期';
      
      const date = new Date(dateString);
      if (date.toDateString() === this.cache.today) {
        return '今天';
      }
      
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    // 按任务类型筛选
    filterTasksByType(type) {
      this.activeTypeFilter = type;
      this.updateCachedData();
    },
    
    // 显示添加按钮提示
    showAddHint() {
      this.showHint = true;
      setTimeout(() => {
        this.showHint = false;
      }, 3000);
    },
    
    // 使用 "Hitokoto 一言" API 获取名言 (https://v1.hitokoto.cn)
    // 当API请求失败时才使用本地名言作为兜底
    async fetchQuote() {
      try {
        // 直接使用完整的API URL，不依赖代理配置（代理只在H5生效）
        const data = await promisifiedRequest({
          url: 'https://v1.hitokoto.cn',
          method: 'GET',
          data: {
            c: 'i', // 文学分类
            encode: 'json',
            charset: 'utf-8'
          },
          timeout: 5000
        });
        
        if (data && data.hitokoto) {
          this.hitokoto = {
            text: data.hitokoto,
            from: data.from ? `——《${data.from}》` : ''
          };
        } else {
          // 数据格式不对时使用本地名言兜底
          this.hitokoto = {
            text: this.getLocalQuote(),
            from: '—— todoapp'
          };
        }
      } catch (error) {
        console.error('获取名言失败:', error);
        // API失败时使用本地名言兜底
        this.hitokoto = {
          text: this.getLocalQuote(),
          from: '—— todoapp'
        };
      }
    },
    
    // 直接调用 Hitokoto API (https://v1.hitokoto.cn) 获取名言
    async getHitokoto() {
      try {
        const data = await promisifiedRequest({
          url: 'https://v1.hitokoto.cn',
          method: 'GET',
          data: {
            c: 'i', // 文学分类
            encode: 'json',
            charset: 'utf-8'
          }
        });
        this.hitokoto = {
          text: data.hitokoto,
          from: `——《${data.from}》`
        };
      } catch (error) {
        // API失败时使用本地名言兜底
        this.hitokoto = {
          text: this.getLocalQuote(),
          from: '—— todoapp'
        };
      }
    },
    
    // 获取任务类型颜色
    getTypeColor(type) {
      return this.CONST.typeColors[type] || '#cccccc';
    },
    
    // 获取优先级颜色
    getPriorityColor(priority) {
      return this.CONST.priorityColors[priority] || this.CONST.priorityColors.default;
    },
    
    // 获取天气信息
    async refreshWeather() {
      this.weatherInfo.loading = true;
      try {
        const location = await this.getLocation();
        this.userLocation = {
          latitude: location.latitude,
          longitude: location.longitude
        };
        
        // 逆地理编码（添加output参数和错误处理）
        let adcode = '440100'; // 默认使用广州城市代码（备用方案）
        let cityName = '本地'; // 默认城市名称
        
        try {
          const geoData = await promisifiedRequest({
            url: 'https://restapi.amap.com/v3/geocode/regeo',
            method: 'GET',
            data: {
              key: this.apiKey,
              location: `${location.longitude},${location.latitude}`,
              output: 'JSON',
              radius: 1000
            }
          });
          
          if (geoData.status === '1' && geoData.regeocode && geoData.regeocode.addressComponent) {
            const address = geoData.regeocode.addressComponent;
            adcode = address.adcode || address.citycode || '440100';
            cityName = (address.city && address.city.length > 0) ? address.city : (address.province || '本地');
          } else {
            console.warn('逆地理编码失败，使用默认城市代码:', geoData.info || '返回数据无效');
            // 如果逆地理编码失败，尝试使用城市名称直接查询天气
            if (geoData.info && geoData.info.includes('INVALID_USER_IP')) {
              console.warn('API Key可能配置了IP白名单限制，尝试使用城市名称查询');
            }
          }
        } catch (geoError) {
          // 逆地理编码失败不影响天气获取，使用默认城市代码
          console.warn('逆地理编码失败，使用默认城市代码:', geoError.message || '未知错误');
        }
        
        // 2. 获取天气（如果adcode获取失败，尝试使用城市名称）
        let weatherData;
        try {
          weatherData = await promisifiedRequest({
            url: 'https://restapi.amap.com/v3/weather/weatherInfo',
            method: 'GET',
            data: {
              key: this.apiKey,
              city: adcode,
              extensions: 'base',
              output: 'JSON'
            }
          });
          
          // 如果使用adcode失败，尝试使用城市名称
          if (weatherData.status !== '1' && cityName !== '本地') {
            console.warn('使用城市代码获取天气失败，尝试使用城市名称:', cityName);
            weatherData = await promisifiedRequest({
              url: 'https://restapi.amap.com/v3/weather/weatherInfo',
              method: 'GET',
              data: {
                key: this.apiKey,
                city: cityName,
                extensions: 'base',
                output: 'JSON'
              }
            });
          }
        } catch (weatherError) {
          throw new Error(`获取天气信息失败: ${weatherError.message || '网络错误'}`);
        }

        if (weatherData.status !== '1' || !weatherData.lives || weatherData.lives.length === 0) {
          throw new Error(`获取天气信息失败: ${weatherData.info || '返回数据无效'}`);
        }
        const liveWeather = weatherData.lives[0];
        
        // 设置城市名称（使用之前获取的cityName）
        this.weatherInfo.city = cityName;
        this.weatherInfo.temperature = liveWeather.temperature;
        this.weatherInfo.weather = liveWeather.weather;
        this.weatherInfo.emoji = this.getWeatherEmoji(liveWeather.weather);

      } catch (error) {
        // 失败时用本地默认数据，附带表情
        console.error('获取天气失败:', error);
        this.weatherInfo = {
          city: '本地',
          temperature: '25',
          weather: '晴',
          emoji: '☀️',
          loading: false
        };
      } finally {
        this.weatherInfo.loading = false;
      }
    },

    resetRotateAnimation() {
      setTimeout(() => {
        this.rotateClass = '';
      }, 500); // 动画时长
    },

    // 根据天气文本获取表情
    getWeatherEmoji(weatherText) {
      for (const key in this.CONST.weatherMap) {
        if (key !== 'default' && weatherText.includes(key)) {
          return this.CONST.weatherMap[key];
        }
      }
      return this.CONST.weatherMap.default;
    },

    // 判断是否为今天
    isToday(dateString) {
      if (!dateString) return false;
      const date = new Date(dateString);
      return date.toDateString() === this.cache.today;
    },
    
    // 判断是否为逾期
    isOverdue(dateString) {
      if (!dateString) return false;
      const date = new Date(dateString);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date < now;
    },
    
    // 格式化日期显示
    formatDisplayDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      
      // 判断是否为今天
      if (date.toDateString() === this.cache.today) {
        return '今天';
      }
      
      // 判断是否为明天
      if (date.toDateString() === this.cache.tomorrow) {
        return '明天';
      }
      
      // 本周内的日期
      const dayDiff = Math.floor((date - new Date(this.cache.today)) / this.CONST.msPerDay);
      if (dayDiff >= 0 && dayDiff < 7) {
        return this.CONST.dayNames[date.getDay()];
      }
      
      // 其他日期
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    // 关闭日期选择器
    closeDatePopup() {
      this.$refs.datePopup.close();
    },

    // 获取模拟天气数据
    getMockWeather(latitude, longitude) {
      const now = new Date();
      const month = now.getMonth();
      
      // 确定季节
      let season;
      if (month >= 2 && month <= 4) season = 'spring';
      else if (month >= 5 && month <= 7) season = 'summer';
      else if (month >= 8 && month <= 10) season = 'autumn';
      else season = 'winter';

      // 根据季节和位置确定温度范围
      const isSouthChina = latitude !== null && latitude < 35;
      let minTemp, maxTemp;
      
      if (season === 'summer') {
        minTemp = isSouthChina ? 26 : 22; 
        maxTemp = isSouthChina ? 36 : 32;
      } else if (season === 'winter') {
        minTemp = isSouthChina ? 5 : -10; 
        maxTemp = isSouthChina ? 15 : 5;
      } else {
        minTemp = isSouthChina ? 15 : 8; 
        maxTemp = isSouthChina ? 25 : 20;
      }
      
      // 生成随机温度
      const temp = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
      
      // 天气选项
      const weatherOptions = [
        { text: '晴', emoji: '☀️' },
        { text: '多云', emoji: '⛅' },
        { text: '阴', emoji: '☁️' },
        { text: '小雨', emoji: '🌧️' }
      ];
      
      // 随机选择一种天气
      const selectedWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      
      return { temp, weather: selectedWeather.text, emoji: selectedWeather.emoji };
    },
    
    // 编辑任务
    editTask(index) {
      const taskIndex = this.getOriginalIndex(index);
      if (taskIndex !== -1) {
        const task = this.tasks[taskIndex];
        
        // 设置编辑模式
        this.isEditMode = true;
        this.editingTaskIndex = taskIndex;
        
        // 填充表单数据
        this.newTask = {
          text: task.text,
          type: task.type,
          priority: task.priority,
          completed: task.completed,
          dueDate: task.dueDate,
          subtasks: task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : []
        };
        
        // 显示编辑弹窗
        this.showAddTaskModal();
      }
    },
    
    // 更新任务
    updateTask() {
      if (!this.validateTaskText()) return;
      
      if (this.editingTaskIndex !== -1) {
        // 更新任务数据
        this.tasks[this.editingTaskIndex] = {
          text: this.newTask.text,
          type: this.newTask.type,
          priority: this.newTask.priority,
          completed: this.tasks[this.editingTaskIndex].completed,
          dueDate: this.newTask.dueDate
        };
        
        // 保存到本地存储
        this.saveTasks();
        
        // 重置编辑模式
        this.resetEditMode();
        
        // 关闭弹窗
        this.$refs.addTaskPopup.close();
        setTimeout(() => {
          this.isAddTaskPopupVisible = false;
        }, 300);
      }
    },
    
    // 重置编辑模式
    resetEditMode() {
      this.isEditMode = false;
      this.editingTaskIndex = -1;
    },

    async getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'wgs84',
          success: function(res) {
            console.log('地理位置权限获取成功', res);
            resolve(res);
          },
          fail: function(err) {
            console.error('地理位置权限获取失败', err);
            reject(new Error('无法获取地理位置'));
          }
        });
      });
    },

    getTypeLabel(type) {
      const map = { work: '工作', study: '学习', life: '生活' };
      return map[type] || '其他';
    },

    getPriorityLabel(priority) {
      const map = { high: '高', medium: '中', low: '低' };
      return map[priority] || '无';
    },

    saveTask() {
      if (!this.newTask.text || !this.newTask.text.trim()) {
        uni.showToast({ title: '请输入任务内容', icon: 'none' });
        return;
      }
      if (this.isEditMode && this.editingTaskIndex !== -1) {
        this.tasks[this.editingTaskIndex] = { 
          ...this.newTask,
          subtasks: this.newTask.subtasks || []
        };
      } else {
        const newTask = {
          ...this.newTask,
          id: Date.now(),
          completed: false,
          dueDate: this.newTask.dueDate || '',
          subtasks: this.newTask.subtasks || []
        };
        this.tasks.push(newTask);
      }
      uni.setStorageSync('tasks', this.tasks);
      this.updateCachedData();
      // 发送任务更新事件，通知其他页面刷新数据
      uni.$emit('taskUpdated');
      this.closeAddTaskModal();
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      this.newTask = { text: '', type: 'work', priority: 'medium', completed: false, dueDate: formattedToday, subtasks: [] };
      this.isEditMode = false;
      this.editingTaskIndex = -1;
    },
    
    // 添加子任务
    addSubtask() {
      if (!this.newTask.subtasks) {
        this.newTask.subtasks = [];
      }
      this.newTask.subtasks.push({
        id: Date.now() + Math.random(),
        text: '',
        completed: false
      });
    },
    
    // 删除子任务
    removeSubtask(index) {
      if (this.newTask.subtasks && this.newTask.subtasks.length > index) {
        this.newTask.subtasks.splice(index, 1);
      }
    },
    
    // 切换子任务完成状态
    toggleSubtask(index) {
      if (this.newTask.subtasks && this.newTask.subtasks.length > index) {
        this.newTask.subtasks[index].completed = !this.newTask.subtasks[index].completed;
      }
    },
    
    // 保存子任务（输入框失焦时）
    saveSubtask(index) {
      // 如果子任务内容为空，自动删除
      if (this.newTask.subtasks[index].text.trim() === '') {
        this.removeSubtask(index);
      }
    },
    
    // AI任务拆解
    async decomposeTask() {
      if (!this.newTask.text || !this.newTask.text.trim()) {
        uni.showToast({ title: '请先输入任务内容', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: 'AI拆解中...' });
      
      try {
        const aiService = require('@/utils/aiService.js').default;
        const result = await aiService.decomposeTask(this.newTask.text);
        
        // 解析AI返回的子任务列表
        // 处理不同格式的返回：可能是对象、字符串或数组
        let subtasks = null;
        if (result && result.subtasks && Array.isArray(result.subtasks)) {
          subtasks = result.subtasks;
        } else if (Array.isArray(result)) {
          subtasks = result;
        } else if (typeof result === 'string') {
          try {
            const parsed = JSON.parse(result);
            if (parsed.subtasks && Array.isArray(parsed.subtasks)) {
              subtasks = parsed.subtasks;
            } else if (Array.isArray(parsed)) {
              subtasks = parsed;
            }
          } catch (e) {
            console.error('解析AI返回失败:', e);
          }
        }
        
        if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
          // 如果已有子任务，询问是否替换
          if (this.newTask.subtasks && this.newTask.subtasks.length > 0) {
            uni.showModal({
              title: '提示',
              content: '已存在子任务，是否替换为AI拆解的结果？',
              success: (res) => {
                if (res.confirm) {
                  this.newTask.subtasks = subtasks.map((text, index) => ({
                    id: Date.now() + index,
                    text: typeof text === 'string' ? text.trim() : (text.text || String(text)),
                    completed: false
                  }));
                  uni.showToast({ title: '拆解成功', icon: 'success' });
                }
              }
            });
          } else {
            this.newTask.subtasks = subtasks.map((text, index) => ({
              id: Date.now() + index,
              text: typeof text === 'string' ? text.trim() : (text.text || String(text)),
              completed: false
            }));
            uni.showToast({ title: '拆解成功', icon: 'success' });
          }
        } else {
          throw new Error('AI返回格式不正确，未找到子任务列表');
        }
      } catch (error) {
        console.error('AI拆解失败:', error);
        uni.showToast({ title: '拆解失败，请重试', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    closeAddTaskModal() {
      this.isAddTaskPopupVisible = false;
      if (this.$refs.addTaskPopup && this.$refs.addTaskPopup.close) {
        this.$refs.addTaskPopup.close();
      }
      this.isEditMode = false;
      this.editingTaskIndex = -1;
    },
    refreshFilteredTasks() {
      // 重新筛选任务，确保首页和日历同步
      let filtered = this.tasks;
      if (this.activeTypeFilter && this.activeTypeFilter !== 'all') {
        filtered = filtered.filter(task => task.type === this.activeTypeFilter);
      }
      this.updateCachedData();
    },
    // 本地名言池
    getLocalQuote() {
      const quotes = [
        '今日事，今日毕',
        '每一个今天都是独特的礼物',
        '轻装前行，保持专注',
        '认真完成今天的任务',
        '把每一件小事做好就是大事',
        '行动是治愈恐惧的良药',
        '不积跬步，无以至千里',
        '你所浪费的今天，是昨天死去的人奢望的明天',
        '只要路是对的，就不怕路远',
        '星光不问赶路人，时光不负有心人'
      ];
      const idx = Math.floor(Math.random() * quotes.length);
      return quotes[idx];
    },
  }
}
</script>

<style>
.container {
  background-color: #342d59;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); 
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
  position: relative;
}

.header {
  padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #342d59;
  z-index: 20;
  position: relative;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}

.title {
  font-size: 46rpx;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.weather-info {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  margin-bottom: 12rpx;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 30rpx;
  padding: 8rpx 16rpx;
  cursor: pointer;
}

.weather-emoji {
  font-size: 32rpx;
  margin-right: 8rpx;
  transition: transform 0.3s ease;
}

.weather-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.weather-error {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
}

.weather-rotate {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.quote-small {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.refresh-icon {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12rpx;
  transition: transform 0.3s ease;
}

.refresh-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 主内容区域 */
.main-content {
  background-color: #ffffff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  margin-top: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 滚动容器的特定样式 */
.main-content.scroll-view-vertical {
  scrollbar-color: rgba(134, 114, 248, 0.2) transparent;
  scrollbar-width: thin;
}

/* 任务类型标签 */
.task-type-tabs {
  display: flex;
  padding: 30rpx 30rpx 15rpx;
  overflow-x: auto;
  white-space: nowrap;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
}

.task-type-tabs::-webkit-scrollbar {
  display: none;
}

.task-type-tab {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 30rpx;
  background-color: rgba(0, 0, 0, 0.05);
}

.task-type-tab.active {
  background-color: rgba(134, 114, 248, 0.2);
}

.type-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

/* 任务列表区域 */
.tasks-list {
  padding: 20rpx 30rpx 100rpx;
  width: 100%;
  box-sizing: border-box;
}

.task-spacer {
  height: 400rpx; 
}

/* 空列表提示 */
.empty-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  margin-top: 50rpx;
}

.empty-title {
  color: #666666;
  font-size: 36rpx;
  margin-bottom: 20rpx;
}

.empty-subtitle {
  color: #999999;
  font-size: 28rpx;
}

/* 任务项 */
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(52,45,89,0.08);
  padding: 32rpx 28rpx;
  margin-bottom: 20rpx;
}

.task-checkbox {
  margin-right: 20rpx;
  cursor: pointer;
}

.check-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #dddddd;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}

.task-checkbox.checked .check-circle {
  background-color: #8672f8;
  border-color: #8672f8;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-text {
  font-size: 32rpx;
  color: #2c3e50;
}

.task-text.completed {
  text-decoration: line-through;
  color: #b2bec3;
}

.task-details {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.task-type-label {
  font-size: 22rpx;
  color: #fff;
  border-radius: 10rpx;
  padding: 2rpx 14rpx;
  background: #4285f4;
}

.task-priority-label {
  font-size: 22rpx;
  border-radius: 10rpx;
  padding: 2rpx 14rpx;
  color: #fff;
  background: #b2bec3;
}

.task-priority-label.high {
  background: #ff6b6b;
}

.task-priority-label.medium {
  background: #feca57;
  color: #333;
}

.task-priority-label.low {
  background: #1dd1a1;
}

.delete-btn {
  margin-left: 20rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
}

.delete-icon {
  font-size: 38rpx;
  color: #fa5252;
  font-weight: bold;
}

.completion-bar {
  text-align: center;
  padding: 12rpx 0 10rpx;
  background-color: transparent;
}

.completion-text {
  color: rgba(153, 153, 153, 0.8);
  font-size: 26rpx;
}

/* 悬浮按钮样式 */
.fab-button {
  position: fixed;
  right: 24rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  z-index: 120;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #342d59;
  box-shadow: 0 8rpx 32rpx rgba(52,45,89,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: bottom 0.2s, right 0.2s;
}

.fab-button.fab-bottom {
  bottom: calc(120rpx + env(safe-area-inset-bottom)) !important;
}

.fab-icon {
  font-size: 60rpx;
  color: #ffffff;
}

.fab-hint {
  position: absolute;
  right: 140rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.fab-hint::after {
  content: '';
  position: absolute;
  right: -10rpx;
  top: 50%;
  transform: translateY(-50%);
  border-left: 10rpx solid rgba(0, 0, 0, 0.7);
  border-top: 10rpx solid transparent;
  border-bottom: 10rpx solid transparent;
}

/* 弹窗样式 */
.popup-card {
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(52,45,89,0.10);
  padding: 40rpx 36rpx 32rpx 36rpx;
  width: 540rpx;
  min-width: 340rpx;
  max-width: 95vw;
  min-height: 340rpx;
  max-height: 90vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  box-sizing: border-box;
  overflow: hidden;
}

.popup-title-new {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10rpx;
  color: #222;
}

.popup-divider {
  height: 2rpx;
  background: linear-gradient(90deg, #4ee3c9 0%, #4a90e2 50%, #fbbc05 100%);
  border-radius: 2rpx;
  margin-bottom: 18rpx;
}

.popup-textarea-new {
  width: 100%;
  min-height: 70rpx;
  border-radius: 12rpx;
  border: 1.5rpx solid #e0e0e0;
  background: #f6f8fa;
  font-size: 26rpx;
  padding: 12rpx 14rpx;
  margin-bottom: 16rpx;
  resize: none;
  box-sizing: border-box;
}

.popup-section-new {
  margin-bottom: 14rpx;
}

.popup-section-label {
  font-size: 28rpx !important;
  color: #222;
  font-weight: 500;
  margin-bottom: 6rpx;
  display: flex;
  align-items: center;
}

.popup-dot {
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.popup-dot.work { background: #4ee3c9; }
.popup-dot.date { background: #4a90e2; }
.popup-dot.priority { background: #fbbc05; }

.popup-type-row, .popup-priority-row {
  display: flex;
  gap: 12rpx;
  margin-top: 4rpx;
}

.popup-type-tag, .popup-priority-tag {
  padding: 8rpx 22rpx;
  border-radius: 14rpx;
  font-size: 28rpx !important;
  cursor: pointer;
  background: #f6f8fa;
  color: #333;
  transition: all 0.2s;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(52,45,89,0.04);
}

.popup-type-tag.selected {
  background: #4ee3c9;
  color: #fff;
}

.popup-type-tag.selected:nth-child(2) { background: #4a90e2; }
.popup-type-tag.selected:nth-child(3) { background: #fbbc05; }

.popup-priority-tag.selected {
  box-shadow: 0 4rpx 16rpx rgba(134,114,248,0.10);
}

.popup-date-row {
  display: flex;
  align-items: center;
  margin-top: 2rpx;
}

.popup-btn-row {
  display: flex;
  gap: 18rpx;
  margin-top: 18rpx;
  justify-content: center;
}

.popup-btn {
  flex: 1;
  font-size: 26rpx;
  padding: 14rpx 0;
  border-radius: 12rpx;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(52,45,89,0.06);
  margin-bottom: 0;
  font-weight: bold;
}

.popup-btn.add {
  background: #8672f8;
  color: #fff;
}

.popup-btn.cancel {
  background: #ffd6db;
  color: #fa5252;
}

.weather-rotate {
  animation: rotate 1s ease;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.weather-info .weather-text {
  font-size: 26rpx;
  color: #ffffff;
}

.weather-info .weather-error {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #ffcdd2;
}

.popup-card-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 340rpx;
  padding-bottom: 10rpx;
}

.popup-section-label, .popup-type-tag, .popup-priority-tag, .popup-date-row, .popup-textarea-new {
  font-size: 28rpx !important;
}

.task-deadline {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  display: flex;
  align-items: center;
}

/* 子任务样式 */
.task-subtasks {
  margin-top: 12rpx;
  padding-left: 20rpx;
  border-left: 2rpx solid #e0e0e0;
}

.subtask-display {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  font-size: 26rpx;
  cursor: pointer;
  padding: 8rpx 0;
}

.subtask-checkbox {
  margin-right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2rpx solid #8672f8;
  background: #fff;
}

.subtask-checkbox.checked {
  background-color: #8672f8;
  border-color: #8672f8;
}

.subtask-icon {
  color: #8672f8;
  font-size: 20rpx;
}

.subtask-checkbox.checked .subtask-icon {
  color: #fff;
}

.subtask-text {
  color: #666;
  flex: 1;
}

.subtask-text.completed {
  text-decoration: line-through;
  color: #999;
}

/* 子任务管理样式 */
.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.subtask-btns {
  display: flex;
  gap: 12rpx;
}

.add-subtask-btn {
  background: #8672f8;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
}

.ai-decompose-btn {
  background: linear-gradient(90deg, #4a90e2, #8672f8);
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
}

.ai-decompose-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

.subtasks-list {
  margin-top: 12rpx;
}

.subtask-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  padding: 12rpx;
  background: #f6f8fa;
  border-radius: 8rpx;
}

.subtask-input {
  flex: 1;
  margin: 0 12rpx;
  padding: 8rpx 12rpx;
  background: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 26rpx;
}

.delete-subtask-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 6rpx;
  padding: 6rpx 12rpx;
  font-size: 22rpx;
}

.subtasks-empty {
  margin-top: 12rpx;
  text-align: center;
  padding: 20rpx;
}

.subtasks-empty-text {
  font-size: 24rpx;
  color: #999;
}

.popup-dot.subtask {
  background: #8672f8;
}
</style>