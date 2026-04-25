<template>
	<view class="container">
		<!-- 标题区域 -->
		<view class="header">
			<text class="title">我的</text>
		</view>
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 用户信息区域 -->
			<view class="user-info-section">
			<view class="avatar-container" @click="chooseAvatar">
				<view v-if="!avatarUrl" class="avatar-fallback">
					{{ usernameFirstChar }}
				</view>
				<image v-else class="avatar" :src="avatarUrl" mode="aspectFill" @error="handleAvatarError" @load="handleAvatarLoad"></image>
				<view class="avatar-edit-overlay">
					<view class="avatar-edit-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
							<circle cx="12" cy="13" r="4"></circle>
						</svg>
					</view>
				</view>
			</view>
			<view class="user-details">
				<text class="username">{{ username }}</text>
				<text class="user-level">普通会员</text>
			</view>
		</view>
		
		<!-- 功能区域 -->
		<view class="options-section">
			<view class="option-group">
				<view class="option-item" @click="syncData">
					<text class="option-icon">🔄</text>
					<text class="option-text">同步数据</text>
					<text class="option-arrow">›</text>
				</view>
				
				<view class="option-item" @click="goToFeedback">
					<text class="option-icon">📝</text>
					<text class="option-text">意见反馈</text>
					<text class="option-arrow">›</text>
				</view>
				
				<view class="option-item" @click="goToSettings">
					<text class="option-icon">⚙️</text>
					<text class="option-text">设置</text>
					<text class="option-arrow">›</text>
				</view>
				
				<view class="option-item" @click="goToAbout">
					<text class="option-icon">ℹ️</text>
					<text class="option-text">关于我们</text>
					<text class="option-arrow">›</text>
				</view>
			</view>
		</view>
		
			<!-- 退出登录按钮 -->
			<view class="logout-section">
				<button class="logout-btn" @click="handleLogout">退出登录</button>
			</view>
		</view>
		
		<!-- 头像选择弹窗 -->
		<view class="avatar-action-sheet" v-if="showAvatarActions">
			<view class="action-sheet-mask" @click="closeAvatarActions"></view>
			<view class="action-sheet-content">
				<view class="action-sheet-title">选择头像</view>
				<view class="action-sheet-item" @click="takePhoto">
					<text>拍照</text>
				</view>
				<view class="action-sheet-item" @click="chooseFromAlbum">
					<text>从相册选择</text>
				</view>
				<view class="action-sheet-cancel" @click="closeAvatarActions">
					<text>取消</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// 防抖函数 - 优化事件处理
function debounce(fn, delay = 300) {
	let timer = null;
	return function() {
		const context = this;
		const args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function() {
			fn.apply(context, args);
		}, delay);
	};
}

export default {
	data() {
		return {
			username: '加载中...',
			userId: '',
			avatarLoaded: false,
			avatarUrl: '',
			showAvatarActions: false
		}
	},
	computed: {
		// 获取用户名的首字母作为头像的备用显示
		usernameFirstChar() {
			if (this.username && this.username !== '加载中...') {
				return this.username.charAt(0).toUpperCase();
			}
			return 'U';
		}
	},
	onLoad() {
		// 加载用户信息
		this.loadUserInfo();
	},
	onShow() {
		// 页面显示时也重新加载用户信息
		this.loadUserInfo();
	},
	methods: {
		// 加载用户信息
		loadUserInfo() {
			try {
				const userInfoStr = uni.getStorageSync('userInfo');
				if (userInfoStr) {
					const userInfo = JSON.parse(userInfoStr);
					this.username = userInfo.username;
					this.userId = userInfo.id;
					
					// 加载保存的头像
					if (userInfo.avatarUrl) {
						this.avatarUrl = userInfo.avatarUrl;
					}
				} else {
					// 未登录，跳转到登录页
					uni.reLaunch({
						url: '/pages/login/login'
					});
				}
			} catch (e) {
				console.error('加载用户信息出错:', e);
				uni.showToast({
					title: '加载用户信息失败',
					icon: 'none'
				});
			}
		},
		
		// 处理头像加载失败
		handleAvatarError() {
			this.avatarUrl = ''; 
		},
		
		// 处理头像加载成功
		handleAvatarLoad() {
			this.avatarLoaded = true;
		},
		
		// 选择头像
		chooseAvatar: debounce(function() {
			this.showAvatarActions = true;
		}, 300),
		
		// 关闭头像选择弹窗
		closeAvatarActions() {
			this.showAvatarActions = false;
		},
		
		// 拍照
		takePhoto() {
			uni.chooseImage({
				count: 1,
				sourceType: ['camera'],
				sizeType: ['compressed'],
				success: (res) => {
					this.processAvatar(res.tempFilePaths[0]);
					this.closeAvatarActions();
				},
				fail: (err) => {
					console.error('拍照失败:', err);
					uni.showToast({
						title: '拍照失败',
						icon: 'none'
					});
					this.closeAvatarActions();
				}
			});
		},
		
		// 从相册选择
		chooseFromAlbum() {
			uni.chooseImage({
				count: 1,
				sourceType: ['album'],
				sizeType: ['compressed'],
				success: (res) => {
					this.processAvatar(res.tempFilePaths[0]);
					this.closeAvatarActions();
				},
				fail: (err) => {
					console.error('选择图片失败:', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
					this.closeAvatarActions();
				}
			});
		},
		
		// 处理头像图片
		processAvatar(tempFilePath) {
			this.avatarUrl = tempFilePath;
			
			try {
				const userInfoStr = uni.getStorageSync('userInfo');
				if (userInfoStr) {
					const userInfo = JSON.parse(userInfoStr);
					userInfo.avatarUrl = tempFilePath; 
					uni.setStorageSync('userInfo', JSON.stringify(userInfo));
					
					uni.showToast({
						title: '头像已更新',
						icon: 'success'
					});
				}
			} catch (e) {
				console.error('保存用户头像信息失败:', e);
			}
		},
		
		// 同步数据
		syncData: debounce(function() {
			uni.showToast({
				title: '数据同步中...',
				icon: 'loading',
				mask: true,
				duration: 1500
			});
			setTimeout(() => {
				uni.showToast({
					title: '同步成功',
					icon: 'success'
				});
			}, 1500);
		}, 500),
		
		// 退出登录
		handleLogout: debounce(function() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除登录状态
						uni.removeStorageSync('userInfo');
						
						// 跳转到登录页
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}
				}
			});
		}, 300),
		
		// 跳转到反馈页面
		goToFeedback: debounce(function() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		}, 300),
		
		// 跳转到设置页面
		goToSettings: debounce(function() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		}, 300),
		
		// 跳转到关于页面
		goToAbout: debounce(function() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		}, 300)
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #342d59;
	padding-top: env(safe-area-inset-top);
	position: relative;
	box-sizing: border-box;
}

/* 标题区域 */
.header {
	background-color: #342d59;
	padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 50rpx;
	display: flex;
	justify-content: center;
	align-items: flex-end;
	position: relative;
	text-align: center;
}

.title {
	font-size: 46rpx !important;
	color: #ffffff !important;
	font-weight: bold !important;
	text-align: center !important;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
	margin-right: 0 !important;
}

.user-icon {
	position: static;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	width: 70rpx;
	height: 70rpx;
}

.user-icon svg {
	width: 48rpx;
	height: 48rpx;
	stroke: #ffffff;
	stroke-width: 2;
}

/* 主内容区 */
.main-content {
	flex: 1;
	background-color: #ffffff;
	border-top-left-radius: 40rpx;
	border-top-right-radius: 40rpx;
	margin-top: -20rpx;
	position: relative;
	z-index: 1;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

/* 用户信息区域 */
.user-info-section {
	padding: 40rpx 30rpx;
	display: flex;
	align-items: center;
}

.avatar-container {
	position: relative;
	margin-right: 30rpx;
	cursor: pointer;
	border-radius: 60rpx;
	overflow: hidden;
	width: 120rpx;
	height: 120rpx;
	transition: transform 0.3s ease;
}

.avatar-container:active {
	transform: scale(0.95);
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	border: 2rpx solid rgba(0, 0, 0, 0.05);
	will-change: transform;
	transition: all 0.3s ease;
}

.avatar-fallback {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	background: linear-gradient(135deg, #4ECDC4 0%, #56B4D3 100%);
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 48rpx;
	font-weight: bold;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.avatar-edit-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 40%;
	background-image: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
	display: flex;
	justify-content: center;
	align-items: flex-end;
	padding-bottom: 8rpx;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.avatar-container:hover .avatar-edit-overlay,
.avatar-container:active .avatar-edit-overlay {
	opacity: 1;
}

.avatar-edit-icon {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.avatar-edit-icon svg {
	width: 32rpx;
	height: 32rpx;
	stroke: #ffffff;
	stroke-width: 2;
}

.user-details {
	display: flex;
	flex-direction: column;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.user-level {
	font-size: 28rpx;
	color: #56B4D3;
	background-color: rgba(78, 205, 196, 0.1);
	padding: 6rpx 16rpx;
	border-radius: 100rpx;
	display: inline-block;
}

/* 功能区域 */
.options-section {
	background-color: #ffffff;
	padding: 0 30rpx;
}

.option-group {
	margin-top: 20rpx;
}

.option-item {
	padding: 30rpx 0;
	display: flex;
	align-items: center;
	border-bottom: 2rpx solid #f0f0f0;
	transition: background-color 0.2s ease;
}

.option-item:active {
	background-color: #f9f9f9;
}

.option-icon {
	margin-right: 20rpx;
	font-size: 40rpx;
}

.option-text {
	flex: 1;
	font-size: 32rpx;
	color: #333333;
}

.option-arrow {
	color: #999999;
	font-size: 40rpx;
}

/* 退出登录按钮 */
.logout-section {
	padding: 60rpx 30rpx;
	background-color: #ffffff;
	flex: 1;
}

.logout-btn {
	width: 100%;
	height: 90rpx;
	line-height: 90rpx;
	background-color: #ff6b6b;
	color: #ffffff;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	transition: opacity 0.2s ease;
}

.logout-btn:active {
	opacity: 0.8;
}

/* 头像选择弹窗样式 */
.avatar-action-sheet {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 999;
}

.action-sheet-mask {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
}

.action-sheet-content {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: #ffffff;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	padding-bottom: env(safe-area-inset-bottom);
	transform: translateY(0);
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.action-sheet-title {
	font-size: 32rpx;
	color: #999;
	text-align: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.action-sheet-item {
	height: 100rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 34rpx;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;
}

.action-sheet-cancel {
	height: 100rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 34rpx;
	color: #333;
	margin-top: 20rpx;
	margin-bottom: env(safe-area-inset-bottom);
}
</style> 