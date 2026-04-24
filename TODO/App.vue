<script>
export default {
  globalData: {
    navigating: false // 用于防止重复导航
  },
  onLaunch: function() {
    uni.removeStorageSync('userInfo'); // 每次启动都清空登录状态
    console.log('App Launch')
    
    // 启动任务到期提醒服务
    try {
      const reminderService = require('./utils/reminderService.js').default;
      reminderService.startChecking();
    } catch (e) {
      console.error('启动提醒服务失败:', e);
    }
    
    // 检查登录状态，未登录强制跳转到登录页
    const userInfo = uni.getStorageSync('userInfo');
    const currentPage = getCurrentPages().length > 0 ? getCurrentPages()[0].route : '';
    if (!userInfo && !currentPage.includes('pages/login/login')) {
      uni.reLaunch({ url: '/pages/login/login' });
      return;
    }
    
    try {
      // 确保任务列表存在
      const tasks = uni.getStorageSync('tasks');
      if (!tasks) {
        uni.setStorageSync('tasks', JSON.stringify([]));
      } else {
        // 验证存储的数据是否为有效的JSON
        try {
          JSON.parse(tasks);
        } catch (e) {
          console.error('任务数据无效，重置为空数组');
          uni.setStorageSync('tasks', JSON.stringify([]));
        }
      }
      
      // 确保笔记列表存在
      const notes = uni.getStorageSync('notes');
      if (!notes) {
        uni.setStorageSync('notes', JSON.stringify([]));
      } else {
        // 验证存储的数据是否为有效的JSON
        try {
          JSON.parse(notes);
        } catch (e) {
          console.error('笔记数据无效，重置为空数组');
          uni.setStorageSync('notes', JSON.stringify([]));
        }
      }
      
      // 确保日历任务存在
      const calendarTasks = uni.getStorageSync('calendarTasks');
      if (!calendarTasks) {
        uni.setStorageSync('calendarTasks', JSON.stringify({}));
      } else {
        // 验证存储的数据是否为有效的JSON
        try {
          JSON.parse(calendarTasks);
        } catch (e) {
          console.error('日历任务数据无效，重置为空对象');
          uni.setStorageSync('calendarTasks', JSON.stringify({}));
        }
      }
      
      // 确保专注历史记录存在
      const focusHistory = uni.getStorageSync('focusHistory');
      if (!focusHistory) {
        uni.setStorageSync('focusHistory', JSON.stringify([]));
      } else {
        // 验证存储的数据是否为有效的JSON
        try {
          JSON.parse(focusHistory);
        } catch (e) {
          console.error('专注历史数据无效，重置为空数组');
          uni.setStorageSync('focusHistory', JSON.stringify([]));
        }
      }
      
      // 确保用户数据存在
      const users = uni.getStorageSync('users');
      if (!users) {
        uni.setStorageSync('users', JSON.stringify([]));
      } else {
        try {
          JSON.parse(users);
        } catch (e) {
          console.error('用户数据无效，重置为空数组');
          uni.setStorageSync('users', JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error('初始化数据时出错:', e);
    }
    
    // 添加uni对象全局方法
    if (!uni.myNavigateTo) {
      uni.myNavigateTo = function(options) {
        // 防止快速点击
        const app = getApp();
        if (app.globalData.navigating) {
          console.log('导航太频繁，请稍后再试');
          return;
        }
        
        app.globalData.navigating = true;
        console.log('正在导航到：', options.url);
        
        // 判断是否是tabBar页面
        const tabBarPages = [
          '/pages/index/index',
          '/pages/focus/focus',
          '/pages/notes/notes',
          '/pages/calendar/calendar',
          '/pages/stats/stats',
          '/pages/profile/profile'
        ];
        
        const url = options.url;
        const isTabBarPage = tabBarPages.some(page => url.startsWith(page));
        
        if (isTabBarPage) {
          // 使用switchTab方法
          uni.switchTab({
            url,
            success: function() {
              console.log('switchTab成功：', url);
              options.success && options.success();
            },
            fail: function(err) {
              console.error('switchTab失败：', err);
              // 如果失败，尝试使用reLaunch
        uni.reLaunch({
                url,
                success: function() {
                  console.log('reLaunch成功：', url);
                  options.success && options.success();
                },
                fail: function(err2) {
                  console.error('reLaunch也失败：', err2);
                  options.fail && options.fail(err2);
                }
              });
            },
            complete: function() {
              setTimeout(() => {
                app.globalData.navigating = false;
              }, 500);
              options.complete && options.complete();
            }
          });
        } else {
          // 使用普通导航方法
          uni.navigateTo({
            url,
          success: function() {
              console.log('navigateTo成功：', url);
            options.success && options.success();
          },
          fail: function(err) {
              console.error('navigateTo失败：', err);
            options.fail && options.fail(err);
          },
          complete: function() {
              setTimeout(() => {
                app.globalData.navigating = false;
              }, 500);
            options.complete && options.complete();
          }
        });
        }
      };
    }
    
    // 初始化应用数据
    this.initAppData();
  },
  onShow: function() {
    console.log('App Show')
    
    // 检查登录状态，未登录强制跳转到登录页
    const userInfo = uni.getStorageSync('userInfo');
    const currentPage = getCurrentPages().length > 0 ? getCurrentPages()[0].route : '';
    if (!userInfo && !currentPage.includes('pages/login/login')) {
      uni.reLaunch({ url: '/pages/login/login' });
      return;
    }
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    // 初始化应用数据
    initAppData() {
      // 检查是否有任务数据，如果没有则初始化
      try {
        const tasks = uni.getStorageSync('tasks');
        if (!tasks) {
          // 初始化示例任务
          const initialTasks = [
            {
              id: 1,
              text: '完成Todo应用开发',
              completed: false,
              dueDate: new Date().toISOString().split('T')[0],
              priority: 'high',
              type: 'work'
            },
            {
              id: 2,
              text: '学习Vue.js文档',
              completed: false,
              dueDate: new Date().toISOString().split('T')[0],
              priority: 'medium',
              type: 'study'
            }
          ];
          uni.setStorageSync('tasks', JSON.stringify(initialTasks));
        }
      } catch (e) {
        console.error('初始化任务数据失败:', e);
      }
    }
  }
}
</script>

<style>
	/* #ifndef APP-PLUS-NVUE */
	@import './common/css/main.css';
	@import './common/css/icon.css';
	/* #endif */
	
	/*每个页面公共css */
	
	/* 隐藏所有 scroll-view 的滚动条 */
	scroll-view::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
		color: transparent;
	}
	
	/* 为了兼容一些旧的Android WebView */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
		color: transparent;
	}
</style>