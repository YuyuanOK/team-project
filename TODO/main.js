import App from './App'

// 导入全局样式
import './static/css/global.css'

// #ifndef VUE3
import Vue from 'vue'

// 全局导航辅助方法
Vue.prototype.$navigateTo = function(url) {
  console.log('全局导航方法 - 准备跳转到:', url);
  
  try {
    // 使用navigateTo进行页面跳转
    uni.navigateTo({
      url: '/' + url,
      success: () => console.log('navigateTo成功:', url),
      fail: (err) => {
        console.error('navigateTo失败:', err);
        
        // 如果navigateTo失败，尝试使用redirectTo
        uni.redirectTo({
          url: '/' + url,
          success: () => console.log('redirectTo成功:', url),
          fail: (err2) => {
            console.error('redirectTo失败:', err2);
            
            // 最后尝试使用reLaunch
            uni.reLaunch({
              url: '/' + url,
              success: () => console.log('reLaunch成功:', url),
              fail: (err3) => console.error('所有导航方法都失败:', err3)
            });
          }
        });
      }
    });
  } catch (e) {
    console.error('导航方法执行出错:', e);
    uni.navigateTo({
      url: '/' + url
    });
  }
};

// 为每个页面添加调试信息
Vue.mixin({
  onLoad() {
    console.log('页面加载:', this.$options.name || '未命名页面');
  },
  onShow() {
    console.log('页面显示:', this.$options.name || '未命名页面');
  },
  onHide() {
    console.log('页面隐藏:', this.$options.name || '未命名页面');
  }
});

Vue.config.productionTip = false
App.mpType = 'app'
new Vue({
  render: h => h(App)
}).$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif 