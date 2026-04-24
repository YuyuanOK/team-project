<template>
	<view class="register-container">
		<view class="register-header">
			<text class="app-title">用户注册</text>
		</view>
		
		<view class="register-form">
			<!-- 用户名输入框 -->
			<view class="form-group">
				<text class="label">用户名</text>
				<input 
					class="input" 
					:class="{ 'input-active': usernameFocus || username.length > 0 }"
					type="text" 
					v-model="username" 
					placeholder="请设置用户名" 
					@focus="setUsernameFocus(true)"
					@blur="setUsernameFocus(false)"
				/>
			</view>
			
			<!-- 密码输入框 -->
			<view class="form-group">
				<text class="label">密码</text>
				<view class="password-wrapper">
					<input 
						class="input" 
						:class="{ 'input-active': passwordFocus || password.length > 0, 'input-error': passwordError }"
						:type="passwordVisible ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请设置密码" 
						@focus="setPasswordFocus(true)"
						@blur="validatePassword"
					/>
					<view class="eye-icon" @tap="togglePasswordVisibility">
						<view v-if="passwordVisible" class="eye-svg">
							<!-- 显示密码 -->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
						</view>
						<view v-else class="eye-svg">
							<!-- 隐藏密码 -->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
								<line x1="1" y1="1" x2="23" y2="23"></line>
							</svg>
						</view>
					</view>
				</view>
				<text class="pwd-tip">密码要求:</text>
				<view class="pwd-tips-container">
					<text class="pwd-tip">• 密码长度至少8位</text>
					<text class="pwd-tip">• 包含至少1个数字</text>
					<text class="pwd-tip">• 包含至少1个字母</text>
				</view>
			</view>
			
			<!-- 确认密码输入框 -->
			<view class="form-group">
				<text class="label">确认密码</text>
				<view class="password-wrapper">
					<input 
						class="input" 
						:class="{ 'input-active': confirmPasswordFocus || confirmPassword.length > 0, 'input-error': confirmPasswordError }"
						:type="passwordVisible ? 'text' : 'password'" 
						v-model="confirmPassword" 
						placeholder="请再次输入密码" 
						@focus="setConfirmPasswordFocus(true)"
						@blur="validateConfirmPassword"
					/>
				</view>
				<text class="error-text" v-if="confirmPasswordError">两次输入的密码不一致</text>
			</view>
			
			<!-- 协议勾选 -->
			<view class="agree-row">
				<checkbox 
					:checked="agreed"
					@tap="toggleAgreement"
					style="transform:scale(0.8)"
					color="#333"
				/>
				<text class="agree-text" @tap="toggleAgreement">注册即表示同意<text class="protocol-text">《用户协议》</text>和<text class="protocol-text">《隐私政策》</text></text>
			</view>
			
			<!-- 注册按钮 -->
			<button class="btn register-btn" @tap="handleRegister" :disabled="isLoading">
				<text v-if="!isLoading">注册</text>
				<text v-else>注册中...</text>
			</button>
			
			<!-- 返回登录 -->
			<view class="login-guide">
				<text class="guide-text">已有账号，</text>
				<text class="login-link" @tap="goToLogin">返回登录</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',              // 用户名输入值
			password: '',              // 密码输入值
			confirmPassword: '',       // 确认密码输入值
			agreed: false,             // 协议同意状态
			usernameFocus: false,      // 用户名输入框焦点状态
			passwordFocus: false,      // 密码输入框焦点状态
			confirmPasswordFocus: false, // 确认密码输入框焦点状态
			passwordVisible: false,    // 密码可见性状态
			passwordError: false,      // 密码格式错误状态
			confirmPasswordError: false, // 确认密码错误状态
			isLoading: false          // 加载状态
		};
	},
	methods: {
		setUsernameFocus(status) {
			this.usernameFocus = status;
		},
		setPasswordFocus(status) {
			this.passwordFocus = status;
		},
		setConfirmPasswordFocus(status) {
			this.confirmPasswordFocus = status;
		},
		togglePasswordVisibility() {
			this.passwordVisible = !this.passwordVisible;
		},
		validatePassword() {
			this.passwordFocus = false;
			const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
			this.passwordError = !passwordRegex.test(this.password);
		},
		validateConfirmPassword() {
			this.confirmPasswordFocus = false;
			if (this.confirmPassword.length > 0) {
				this.confirmPasswordError = this.password !== this.confirmPassword;
			} else {
				this.confirmPasswordError = false;
			}
		},
		toggleAgreement() {
			this.agreed = !this.agreed;
		},
		handleRegister() {
			this.validatePassword();
			this.validateConfirmPassword();

			if (!this.username.trim()) {
				uni.showToast({ title: '请输入用户名', icon: 'none' });
				return;
			}
			if (this.passwordError) {
				uni.showToast({ title: '密码格式不正确', icon: 'none' });
				return;
			}
			if (this.confirmPasswordError) {
				uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
				return;
			}
			if (!this.agreed) {
				uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' });
				return;
			}

			this.isLoading = true;

			try {
				// 引入加密工具
				const encryption = require('@/utils/encryption.js').default;
				
				// 统一使用JSON字符串格式
				const usersStr = uni.getStorageSync('users');
				let users = [];
				if (usersStr) {
					try {
						users = typeof usersStr === 'string' ? JSON.parse(usersStr) : usersStr;
						if (!Array.isArray(users)) {
							users = [];
						}
					} catch (e) {
						users = [];
					}
				}
				
				const isUsernameTaken = users.some(user => {
					// 兼容未加密的旧数据
					return user.username === this.username;
				});
				
				if (isUsernameTaken) {
					uni.showToast({ title: '该用户名已被注册', icon: 'none' });
					this.isLoading = false;
					return;
				}

				// 加密密码
				const encryptedPassword = encryption.encrypt(this.password);
				console.log('原始密码:', this.password);
				console.log('加密后密码:', encryptedPassword);
				
				const newUser = {
					id: Date.now(),
					username: this.username,
					password: encryptedPassword, // 存储加密后的密码
					createdAt: new Date().toISOString()
				};
				
				users.push(newUser);
				// 统一存储为JSON字符串格式
				uni.setStorageSync('users', JSON.stringify(users));
				console.log('注册成功，用户列表:', users);
				
				uni.showToast({
					title: '注册成功！',
					icon: 'success'
				});

				setTimeout(() => {
					uni.navigateBack();
				}, 1500);

			} catch (error) {
				uni.showToast({ title: '注册失败，请稍后重试', icon: 'none' });
			} finally {
				this.isLoading = false;
			}
		},
		goToLogin() {
			uni.navigateBack();
		}
	}
};
</script>

<style>
.register-container {
	padding: 80rpx 60rpx;
	padding-top: 180rpx;
	background-color: #f7f8fc;
	min-height: 100vh;
	box-sizing: border-box;
}

.register-header {
	text-align: center;
	margin-bottom: 80rpx;
}

.app-title {
	font-size: 52rpx;
	font-weight: bold;
	color: #333;
}

.register-form {
	width: 100%;
}

.form-group {
	margin-bottom: 40rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.password-wrapper {
	position: relative;
	width: 100%;
}

.input {
	width: 100%;
	height: 90rpx;
	padding: 0 30rpx;
	background-color: #fff;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	font-size: 28rpx;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.input-active {
	border-color: #8a2be2;
	box-shadow: 0 0 10rpx rgba(138, 43, 226, 0.1);
}

.input-error {
	border-color: #ff5d5d;
}

.eye-icon {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	padding: 10rpx;
	color: #999;
}

.eye-svg {
	width: 40rpx;
	height: 40rpx;
}

.pwd-tips-container {
	margin-top: 12rpx;
	padding-left: 10rpx;
}

.pwd-tip {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-top: 4rpx;
}

.error-text {
	font-size: 24rpx;
	color: #ff5d5d;
	margin-top: 8rpx;
}

.agree-row {
	display: flex;
	align-items: center;
	margin-bottom: 50rpx;
}

.agree-text {
	margin-left: 12rpx;
	font-size: 26rpx;
	color: #666;
}

.protocol-text {
	color: #8a2be2;
	text-decoration: underline;
}

.btn {
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	border-radius: 48rpx;
	background-color: #8a2be2;
	color: #fff;
	box-shadow: 0 8rpx 16rpx rgba(138, 43, 226, 0.2);
	transition: opacity 0.3s;
}

.btn:disabled {
	opacity: 0.6;
}

.login-guide {
	text-align: center;
	margin-top: 40rpx;
}

.guide-text {
	font-size: 28rpx;
	color: #999;
}

.login-link {
	font-size: 28rpx;
	color: #8a2be2;
	font-weight: bold;
}
</style> 