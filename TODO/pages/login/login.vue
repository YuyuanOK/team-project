<template>
	<view class="login-container">
		<view class="login-header">
			<text class="app-title">Todo清单</text>
		</view>
		
		<view class="login-form">
			<!-- 用户名输入框 -->
			<view class="form-group">
				<text class="label">用户名</text>
				<input 
					class="input" 
					:class="{ 'input-active': usernameFocus || username.length > 0 }"
					type="text" 
					v-model="username" 
					placeholder="请输入用户名" 
					@focus="usernameFocus = true"
					@blur="usernameFocus = false"
				/>
			</view>
			
			<!-- 密码输入框 -->
			<view class="form-group">
				<text class="label">密码</text>
				<view class="password-wrapper">
					<input 
						class="input" 
						:class="{ 'input-active': passwordFocus || password.length > 0 }"
						:type="passwordVisible ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码" 
						@focus="passwordFocus = true"
						@blur="passwordFocus = false"
					/>
					<view class="eye-icon" @tap="togglePasswordVisibility">
						<view v-if="passwordVisible" class="eye-svg">
							<!-- 显示密码的SVG图标 -->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
						</view>
						<view v-else class="eye-svg">
							<!-- 隐藏密码的SVG图标 -->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
								<line x1="1" y1="1" x2="23" y2="23"></line>
							</svg>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 协议勾选 -->
			<view class="agree-row">
				<checkbox 
					:checked="agreed"
					@tap="toggleAgreement"
					style="transform:scale(0.8)"
					color="#333"
				/>
				<text class="agree-text" @tap="toggleAgreement">登录即表示同意<text class="protocol-text">《用户协议》</text>和<text class="protocol-text">《隐私政策》</text></text>
			</view>
			
			<!-- 登录按钮 -->
			<button class="btn login-btn" @tap="handleLogin">登录</button>
			
			<!-- 注册引导文字 -->
			<view class="register-guide">
				<text class="guide-text">还没有账号，</text>
				<text class="register-link" @tap="goToRegister">请立即注册</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',           // 用户名输入值
			password: '',           // 密码输入值
			agreed: false,          // 协议同意状态
			passwordVisible: false, // 密码可见性状态
			loading: false,         // 加载状态
			usernameFocus: false,   // 用户名输入框焦点状态
			passwordFocus: false    // 密码输入框焦点状态
		}
	},
	
	methods: {
		// 切换密码可见性
		togglePasswordVisibility() {
			this.passwordVisible = !this.passwordVisible;
		},
		
		// 切换协议同意状态
		toggleAgreement() {
			this.agreed = !this.agreed;
			console.log('Agreement toggled:', this.agreed);
		},
		
		// 跳转到注册页面
		goToRegister() {
			uni.navigateTo({
				url: '/pages/register/register'
			});
		},
		
		// 登录处理
		handleLogin() {
			console.log('Login attempt with:', this.username, this.password, this.agreed);
			
			// 检查是否同意协议
			if (!this.agreed) {
				uni.showToast({
					title: '请先同意用户协议和隐私政策',
					icon: 'none'
				});
				return;
			}
			
			// 检查用户名和密码是否输入
			if (!this.username || !this.password) {
				uni.showToast({
					title: '请输入用户名和密码',
					icon: 'none'
				});
				return;
			}
			
			this.loading = true;
			
			// 获取已注册用户列表
			try {
				// 引入加密工具
				const encryption = require('@/utils/encryption.js').default;
				
				// 统一处理数据格式
				const usersStr = uni.getStorageSync('users');
				let userList = [];
				if (usersStr) {
					try {
						userList = typeof usersStr === 'string' ? JSON.parse(usersStr) : usersStr;
						if (!Array.isArray(userList)) {
							userList = [];
						}
					} catch (e) {
						console.error('解析用户数据失败:', e);
						userList = [];
					}
				}
				
				// 查找匹配的用户（支持加密和未加密的密码）
				const matchedUser = userList.find(u => {
					if (u.username !== this.username) return false;
					
					// 尝试解密密码进行比较
					try {
						const decryptedPassword = encryption.decrypt(u.password);
						console.log('解密后的密码:', decryptedPassword);
						console.log('输入的密码:', this.password);
						return decryptedPassword === this.password;
					} catch (e) {
						console.log('解密失败，尝试直接比较:', e);
						// 兼容未加密的旧数据
						return u.password === this.password;
					}
				});
				
				console.log('用户列表:', userList);
				console.log('匹配的用户:', matchedUser);
				
				if (matchedUser) {
					// 登录成功，存储用户信息
					const userInfo = {
						id: matchedUser.id,
						username: matchedUser.username
					};
					
					uni.setStorageSync('userInfo', JSON.stringify(userInfo));
					
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						success: () => {
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/index/index'
								});
							}, 1500);
						}
					});
				} else {
					// 登录失败
					uni.showToast({
						title: '用户名或密码错误',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('登录出错:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		}
	},
	
	onLoad() {
		// 检查是否已登录
		const userInfo = uni.getStorageSync('userInfo');
		if (userInfo) {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		}
	},
  
  // 每次页面显示时清空输入框
  onShow() {
    this.username = '';
    this.password = '';
    this.passwordVisible = false;
    console.log('登录页面显示，已清空输入框');
  }
}
</script>

<style>
.login-container {
	min-height: 100vh;
	padding: 0 40rpx;
	background-color: #f5f9ff;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.login-header {
	margin-top: 200rpx;
	margin-bottom: 80rpx;
	text-align: center;
}

.app-title {
	font-size: 72rpx;
	font-weight: bold;
	color: #222;
}

.login-form {
	width: 100%;
	max-width: 600rpx;
}

.form-group {
	margin-bottom: 40rpx;
}

.label {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 16rpx;
	display: block;
}

.input {
	width: 100%;
	height: 96rpx;
	background-color: #fff;
	border-radius: 12rpx;
	padding: 0 32rpx;
	font-size: 32rpx;
	border: 2rpx solid #e0e0e0;
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.input-active {
	border-color: #ffa500;
	box-shadow: 0 0 8rpx rgba(255, 165, 0, 0.5);
}

.password-wrapper {
	position: relative;
}

.eye-icon {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.eye-svg {
	width: 40rpx;
	height: 40rpx;
	opacity: 0.7;
	color: #666;
}

.agree-row {
	display: flex;
	align-items: center;
	margin: 20rpx 0 40rpx;
}

.agree-text {
	font-size: 28rpx;
	color: #666;
	margin-left: 8rpx;
}

.protocol-text {
	color: #8a2be2;
}

.btn {
	width: 100%;
	height: 96rpx;
	border-radius: 12rpx;
	font-size: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-btn {
	background: linear-gradient(90deg, #8a2be2, #6a5acd);
	color: white;
}

.register-guide {
	margin-top: 40rpx;
	text-align: center;
}

.guide-text {
	font-size: 28rpx;
	color: #999;
}

.register-link {
	font-size: 28rpx;
	color: #8a2be2;
}
</style>	