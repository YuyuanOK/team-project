/**
 * 任务到期提醒服务
 * 功能：检查任务到期情况并发送提醒
 */

export default {
  // 记录上次提醒的时间戳和任务列表
  lastReminderTime: null,
  lastReminderTaskIds: null,
  reminderIntervalId: null,
  
  // 检查到期任务
  checkDueTasks() {
    try {
      const tasksStr = uni.getStorageSync('tasks');
      if (!tasksStr) return;
      
      const tasks = typeof tasksStr === 'string' ? JSON.parse(tasksStr) : tasksStr;
      if (!Array.isArray(tasks)) return;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 筛选出今天到期或已逾期的未完成任务
      const dueTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        
        try {
          const dueDate = new Date(task.dueDate);
          const taskDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          
          // 今天到期或已逾期
          return taskDue <= today;
        } catch (e) {
          return false;
        }
      });
      
      if (dueTasks.length > 0) {
        // 获取任务ID列表用于比较
        const taskIds = dueTasks.map(t => t.id || t.text).sort().join(',');
        
        // 检查是否有未处理的提醒
        if (this.lastReminderTime && this.lastReminderTaskIds === taskIds) {
          // 如果任务列表相同且上次提醒未处理，不重复提醒
          const timeSinceLastReminder = Date.now() - this.lastReminderTime;
          if (timeSinceLastReminder < 5 * 60 * 1000) {
            // 距离上次提醒不足5分钟，且任务列表相同，不提醒
            return;
          }
        }
        
        // 检查任务列表是否有变化
        if (this.lastReminderTaskIds !== taskIds) {
          // 任务列表有变化，可以提醒
          this.showReminder(dueTasks);
        } else {
          // 任务列表相同，检查是否超过5分钟
          const timeSinceLastReminder = Date.now() - (this.lastReminderTime || 0);
          if (timeSinceLastReminder >= 5 * 60 * 1000) {
            // 超过5分钟，可以再次提醒
            this.showReminder(dueTasks);
          }
        }
      } else {
        // 没有到期任务，清除提醒记录
        this.lastReminderTime = null;
        this.lastReminderTaskIds = null;
      }
    } catch (e) {
      console.error('检查到期任务失败:', e);
    }
  },
  
  // 显示提醒
  showReminder(tasks) {
    const overdueTasks = [];
    const todayTasks = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      
      if (taskDateStr < todayStr) {
        overdueTasks.push(task);
      } else {
        todayTasks.push(task);
      }
    });
    
    let content = '';
    if (overdueTasks.length > 0) {
      content += `⚠️ 已逾期任务（${overdueTasks.length}个）：\n`;
      overdueTasks.slice(0, 3).forEach(task => {
        content += `• ${task.text}\n`;
      });
      if (overdueTasks.length > 3) {
        content += `...还有${overdueTasks.length - 3}个任务已逾期\n`;
      }
    }
    
    if (todayTasks.length > 0) {
      if (content) content += '\n';
      content += `📅 今日到期任务（${todayTasks.length}个）：\n`;
      todayTasks.slice(0, 3).forEach(task => {
        content += `• ${task.text}\n`;
      });
      if (todayTasks.length > 3) {
        content += `...还有${todayTasks.length - 3}个任务今日到期\n`;
      }
    }
    
    // 记录提醒时间和任务列表
    const taskIds = tasks.map(t => t.id || t.text).sort().join(',');
    
    uni.showModal({
      title: '📅 任务提醒',
      content: content.trim(),
      showCancel: true,
      confirmText: '去查看',
      cancelText: '稍后',
      success: (res) => {
        // 无论用户点击什么，都记录提醒时间和任务列表
        this.lastReminderTime = Date.now();
        this.lastReminderTaskIds = taskIds;
        
        if (res.confirm) {
          // 跳转到首页查看任务
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
        // 如果用户点击"稍后"，lastReminderTime已记录，5分钟内不会再次提醒相同任务
      }
    });
  },
  
  // 启动定时检查
  startChecking() {
    // 清除之前的定时器（如果存在）
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
    }
    
    // 应用启动时立即检查一次
    this.checkDueTasks();
    
    // 每5分钟检查一次
    this.reminderIntervalId = setInterval(() => {
      this.checkDueTasks();
    }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000毫秒
  },
  
  // 停止定时检查
  stopChecking() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  },
  
  // 检查单个任务是否即将到期（提前1天提醒）
  checkUpcomingTasks() {
    try {
      const tasksStr = uni.getStorageSync('tasks');
      if (!tasksStr) return;
      
      const tasks = typeof tasksStr === 'string' ? JSON.parse(tasksStr) : tasksStr;
      if (!Array.isArray(tasks)) return;
      
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      
      const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        
        try {
          const dueDate = new Date(task.dueDate);
          const taskDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
          
          // 明天到期
          return taskDateStr === tomorrowStr;
        } catch (e) {
          return false;
        }
      });
      
      if (upcomingTasks.length > 0) {
        const taskTexts = upcomingTasks.slice(0, 3).map(t => t.text).join('、');
        uni.showToast({
          title: `明天有${upcomingTasks.length}个任务到期`,
          icon: 'none',
          duration: 3000
        });
      }
    } catch (e) {
      console.error('检查即将到期任务失败:', e);
    }
  }
};
