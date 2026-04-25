<template>
	<view class="container">
		<!-- 紫色标题区域 -->
		<view class="header">
			<text class="title">专注空间 ⏱️</text>
		</view>
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 滚动视图 -->
			<scroll-view class="scroll-view-vertical" scroll-y="true" show-scrollbar="true" enhanced="true">
				<!-- 计时器区域 -->
				<view class="timer-section">
					<view class="timer-display">
						<text class="timer-text">{{ displayTime }}</text>
						<text class="timer-label">专注预备 <text class="breathing-icon">🧘</text></text>
						<text class="timer-description">推荐专注时段</text>
					</view>
					
					<!-- 按钮区 -->
					<view class="timer-controls">
						<button class="control-btn start" @click="toggleTimerState" hover-class="btn-hover">
							{{ isTimerActive ? '暂停专注' : '沉浸专注' }}
						</button>
						<button class="control-btn reset" @click="resetTimerState" hover-class="btn-hover">
							重置计时
						</button>
					</view>
					
					<!-- AI推荐按钮 -->
					<view class="ai-recommend-section">
						<button class="ai-recommend-btn" @click="getAIRecommendation">
							🤖 AI智能推荐专注场景
						</button>
					</view>
					
					<!-- 计时模式选择区 -->
					<view class="timer-mode">
						<text class="mode-title">工作模式</text>
						<view class="mode-options">
							<view class="mode-item" :class="{ active: currentMode === TIMER_STATES.FOCUS_SESSION }" @click="switchTimerMode(TIMER_STATES.FOCUS_SESSION)">
								<text class="mode-dot">{{ currentMode === TIMER_STATES.FOCUS_SESSION ? '●' : 'O' }}</text>
								<text class="mode-label" :class="{ 'active-text': currentMode === TIMER_STATES.FOCUS_SESSION }">深度工作</text>
								<text class="mode-time">{{ customDuration > 0 ? customDuration + 'min' : '25min' }}</text>
							</view>
							<view class="mode-item" :class="{ active: currentMode === TIMER_STATES.SHORT_PAUSE }" @click="switchTimerMode(TIMER_STATES.SHORT_PAUSE)">
								<text class="mode-dot">{{ currentMode === TIMER_STATES.SHORT_PAUSE ? '●' : 'O' }}</text>
								<text class="mode-label" :class="{ 'active-text': currentMode === TIMER_STATES.SHORT_PAUSE }">短休息</text>
								<text class="mode-time">5min</text>
							</view>
							<view class="mode-item" :class="{ active: currentMode === TIMER_STATES.EXTENDED_PAUSE }" @click="switchTimerMode(TIMER_STATES.EXTENDED_PAUSE)">
								<text class="mode-dot">{{ currentMode === TIMER_STATES.EXTENDED_PAUSE ? '●' : 'O' }}</text>
								<text class="mode-label" :class="{ 'active-text': currentMode === TIMER_STATES.EXTENDED_PAUSE }">长休息</text>
								<text class="mode-time">15min</text>
							</view>
						</view>
						<!-- 自定义时长设置 -->
						<view class="custom-duration-section">
							<text class="custom-duration-label">自定义时长（分钟）：</text>
							<input 
								class="custom-duration-input" 
								type="number" 
								v-model.number="customDuration" 
								placeholder="输入分钟数"
								@input="onCustomDurationChange"
								:disabled="isTimerActive"
							/>
						</view>
					</view>
				</view>
				
				<!-- 环境音效区域 -->
				<view class="ambient-section">
					<view class="section-title">
						<text>氛围音效</text>
						<text class="sound-icon">🔊</text>
					</view>
					<view class="sound-grid">
						<view class="sound-row">
							<view class="sound-item" @click="selectAmbientAudio(0)" :class="{ active: selectedAudioIndex === 0 }">
								<image src="/static/images/sounds/rain.svg" class="sound-image"></image>
								<text class="sound-label">雨声</text>
							</view>
							<view class="sound-item" @click="selectAmbientAudio(1)" :class="{ active: selectedAudioIndex === 1 }">
								<image src="/static/images/sounds/cafe.svg" class="sound-image"></image>
								<text class="sound-label">咖啡厅</text>
							</view>
							<view class="sound-item" @click="selectAmbientAudio(2)" :class="{ active: selectedAudioIndex === 2 }">
								<image src="/static/images/sounds/forest.svg" class="sound-image"></image>
								<text class="sound-label">森林</text>
							</view>
						</view>
						<view class="sound-row">
							<view class="sound-item" @click="selectAmbientAudio(3)" :class="{ active: selectedAudioIndex === 3 }">
								<image src="/static/images/sounds/whitenoise.svg" class="sound-image"></image>
								<text class="sound-label">白噪音</text>
							</view>
							<view class="sound-item" @click="selectAmbientAudio(4)" :class="{ active: selectedAudioIndex === 4 }">
								<image src="/static/images/sounds/fire.svg" class="sound-image"></image>
								<text class="sound-label">篝火</text>
							</view>
							<view class="sound-item" @click="selectAmbientAudio(5)" :class="{ active: selectedAudioIndex === 5 }">
								<image src="/static/images/sounds/waves.svg" class="sound-image"></image>
								<text class="sound-label">海浪</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="content-spacer"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
const TIMER_STATES = Object.freeze({
	FOCUS_SESSION: 0,
	SHORT_PAUSE: 1,
	EXTENDED_PAUSE: 2
});

const TIMER_CONFIGS = {
    [TIMER_STATES.FOCUS_SESSION]: { duration: 25 * 60 },
    [TIMER_STATES.SHORT_PAUSE]: { duration: 5 * 60 },
    [TIMER_STATES.EXTENDED_PAUSE]: { duration: 15 * 60 }
};

const AMBIENT_AUDIO_PROFILES = [
	{ name: '降雨音效', source: '/static/audio/ambience/雨.ogg' },
	{ name: '咖啡厅', source: '/static/audio/ambience/咖啡厅.ogg' },
	{ name: '森林白噪音', source: '/static/audio/ambience/森林.ogg' },
	{ name: '基础白噪音', source: '/static/audio/ambience/白噪音.ogg' },
	{ name: '篝火声', source: '/static/audio/ambience/篝火.ogg' },
	{ name: '海浪声', source: '/static/audio/ambience/海浪.ogg' }
];

export default {
	name: 'FocusTimerView',
	data() {
		return {
			remainingSeconds: TIMER_CONFIGS[TIMER_STATES.FOCUS_SESSION].duration,
			intervalRef: null,
			isTimerActive: false,
			currentMode: TIMER_STATES.FOCUS_SESSION,
			selectedAudioIndex: -1,
			audioController: null,
            TIMER_STATES: TIMER_STATES,
			customDuration: 0 // 自定义时长（分钟）
		};
	},
	computed: {
		displayTime() {
			const minutes = Math.floor(this.remainingSeconds / 60);
			const seconds = this.remainingSeconds % 60;
			return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
	},
    onUnload() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef);
        }
        this.stopAudio();
    },
	methods: {
		toggleTimerState() {
			this.isTimerActive = !this.isTimerActive;
			if (this.isTimerActive) {
				// 如果计时器启动，且当前没有选择音频，则默认播放第一个
				if (this.selectedAudioIndex === -1) {
					this.selectAmbientAudio(0, true); // 传入true表示由计时器自动启动
				} else if (this.audioController) {
					this.audioController.play();
				}
				this.startTimer();
			} else {
				this.pauseTimer();
				if (this.audioController) {
					this.audioController.pause();
				}
			}
		},
		startTimer() {
			if (this.intervalRef) return;
			this.intervalRef = setInterval(() => {
				if (this.remainingSeconds > 0) {
					this.remainingSeconds--;
				} else {
					this.isTimerActive = false;
					clearInterval(this.intervalRef);
					this.intervalRef = null;
                    uni.showToast({ title: '专注时间到！', icon: 'success' });
                    this.stopAudio();
				}
			}, 1000);
		},
		pauseTimer() {
			if (this.intervalRef) {
				clearInterval(this.intervalRef);
				this.intervalRef = null;
			}
		},
		resetTimerState() {
            this.isTimerActive = false;
			this.pauseTimer();
			this.remainingSeconds = TIMER_CONFIGS[this.currentMode].duration;
            this.stopAudio();
            this.selectedAudioIndex = -1;
		},
		switchTimerMode(mode) {
            if (this.isTimerActive) {
                uni.showToast({ title: '请先暂停当前专注', icon: 'none' });
                return;
            }
			this.currentMode = mode;
			if (mode === TIMER_STATES.FOCUS_SESSION && this.customDuration > 0) {
				this.remainingSeconds = this.customDuration * 60;
			} else {
				this.remainingSeconds = TIMER_CONFIGS[mode].duration;
			}
		},
		onCustomDurationChange() {
			if (this.isTimerActive) {
				uni.showToast({ title: '请先暂停当前专注', icon: 'none' });
				this.customDuration = 0;
				return;
			}
			if (this.customDuration > 0 && this.customDuration <= 300) {
				if (this.currentMode === TIMER_STATES.FOCUS_SESSION) {
					this.remainingSeconds = this.customDuration * 60;
				}
			} else if (this.customDuration > 300) {
				uni.showToast({ title: '时长不能超过300分钟', icon: 'none' });
				this.customDuration = 300;
				if (this.currentMode === TIMER_STATES.FOCUS_SESSION) {
					this.remainingSeconds = 300 * 60;
				}
			} else if (this.customDuration < 0) {
				this.customDuration = 0;
				if (this.currentMode === TIMER_STATES.FOCUS_SESSION) {
					this.remainingSeconds = TIMER_CONFIGS[TIMER_STATES.FOCUS_SESSION].duration;
				}
			}
		},
		selectAmbientAudio(index, isAutoPlay = false) {
			if (this.selectedAudioIndex === index && !isAutoPlay) {
                // 如果是用户手动再次点击同一个音效，则停止它
                this.stopAudio();
                this.selectedAudioIndex = -1;
                return;
            }

            this.stopAudio(); // 停止任何当前播放的音频

			this.selectedAudioIndex = index;
			const audioProfile = AMBIENT_AUDIO_PROFILES[index];

			if (audioProfile) {
                this.audioController = uni.createInnerAudioContext();
                this.audioController.src = audioProfile.source;
                this.audioController.loop = true;
				
				// 立即播放的条件：1. 用户手动点击时 / 2. 计时器已在运行时
				if (!isAutoPlay || this.isTimerActive) {
					this.audioController.play();
				}
			}
		},
        stopAudio() {
            if (this.audioController) {
                this.audioController.stop();
                this.audioController.destroy();
                this.audioController = null;
            }
        },
        
        // AI推荐专注场景 - 根据专注时长和当前时间从六个氛围音效中选择
        async getAIRecommendation() {
            if (this.isTimerActive) {
                uni.showToast({ title: '请先暂停当前专注', icon: 'none' });
                return;
            }
            
            uni.showLoading({ title: 'AI分析中...' });
            
            try {
                // 获取当前专注时长（分钟）
                const focusDuration = this.customDuration > 0 ? this.customDuration : 
                    (this.currentMode === TIMER_STATES.FOCUS_SESSION ? 25 : 
                     this.currentMode === TIMER_STATES.SHORT_PAUSE ? 5 : 15);
                
                // 获取当前时间
                const now = new Date();
                const currentHour = now.getHours();
                
                // 根据时长和时间推荐音效
                // 六个音效：0-雨声, 1-咖啡厅, 2-森林, 3-白噪音, 4-篝火, 5-海浪
                let recommendedAudioIndex = 0;
                
                // 根据时间段推荐
                if (currentHour >= 6 && currentHour < 12) {
                    // 上午：推荐清新类音效
                    if (focusDuration <= 15) {
                        recommendedAudioIndex = 1; // 咖啡厅 - 短时间工作
                    } else if (focusDuration <= 30) {
                        recommendedAudioIndex = 2; // 森林 - 中等时长
                    } else {
                        recommendedAudioIndex = 0; // 雨声 - 长时间专注
                    }
                } else if (currentHour >= 12 && currentHour < 18) {
                    // 下午：推荐提神类音效
                    if (focusDuration <= 15) {
                        recommendedAudioIndex = 1; // 咖啡厅
                    } else if (focusDuration <= 30) {
                        recommendedAudioIndex = 3; // 白噪音 - 中等时长
                    } else {
                        recommendedAudioIndex = 5; // 海浪 - 长时间
                    }
                } else if (currentHour >= 18 && currentHour < 22) {
                    // 晚上：推荐放松类音效
                    if (focusDuration <= 15) {
                        recommendedAudioIndex = 4; // 篝火 - 短时间放松
                    } else if (focusDuration <= 30) {
                        recommendedAudioIndex = 0; // 雨声 - 中等时长
                    } else {
                        recommendedAudioIndex = 2; // 森林 - 长时间
                    }
                } else {
                    // 深夜/凌晨：推荐安静类音效
                    recommendedAudioIndex = 3; // 白噪音 - 不打扰
                }
                
                // 应用推荐
                this.selectAmbientAudio(recommendedAudioIndex, false);
                
                uni.hideLoading();
                uni.showToast({
                    title: `已推荐${AMBIENT_AUDIO_PROFILES[recommendedAudioIndex].name}`,
                    icon: 'success'
                });
            } catch (error) {
                console.error('AI推荐失败:', error);
                uni.hideLoading();
                uni.showToast({
                    title: '推荐失败，请重试',
                    icon: 'none'
                });
            }
        }
	}
};
</script>

<style lang="scss" scoped>
/* 注意：不再导入外部CSS文件，避免样式冲突 */
/* 所有样式都在本文件中定义，确保优先级 */

/* 修改滚动条样式 */
::-webkit-scrollbar {
	width: 6rpx;
	background-color: transparent;
}

::-webkit-scrollbar-thumb {
	background-color: #ffffff;
	border-radius: 10rpx;
}

::-webkit-scrollbar-track {
	background-color: transparent;
}

.container {
	min-height: 100vh !important;
	display: flex !important;
	flex-direction: column !important;
	width: 100% !important;
	background-color: #342d59 !important;
	position: relative !important;
	padding-bottom: 0 !important;
	padding-top: 0 !important;
	box-sizing: border-box !important;
}

/* 标题区域 - 覆盖外部CSS，确保样式正确 */
.header {
	background-color: #342d59 !important;
	padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 50rpx !important;
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
	position: relative !important;
	z-index: 1 !important;
	margin: 0 !important;
	width: 100% !important;
	box-sizing: border-box !important;
}
	
.title {
	font-size: 46rpx !important; 
	color: #ffffff !important;
	font-weight: bold !important;
	text-align: center !important;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
	line-height: 1.2 !important;
	margin: 0 !important;
	padding: 0 !important;
}

/* 内容区 */
.main-content {
	background-color: #ffffff !important;
	border-top-left-radius: 40rpx !important;
	border-top-right-radius: 40rpx !important;
	border-radius: 40rpx 40rpx 0 0 !important;
	margin-top: -20rpx !important;
	flex: 1 !important;
	min-height: calc(100vh - calc(80rpx + env(safe-area-inset-top)) - 50rpx + 20rpx - 50px) !important;
	padding: 0 !important; 
	padding-bottom: calc(50px + env(safe-area-inset-bottom)) !important;
	position: relative !important;
	z-index: 2 !important;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1) !important;
	overflow: hidden !important;
	margin-bottom: 0 !important;
}

/* 滚动视图 */
.scroll-view-vertical {
	height: calc(100vh - 180rpx);
	width: 100%;
	box-sizing: border-box;
	padding: 40rpx 30rpx;
	padding-right: 25rpx; 
	overflow: scroll !important;
	-webkit-overflow-scrolling: touch !important;
}

/* 计时器区域 */
.timer-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-bottom: 40rpx;
}

.timer-display {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx; 
	padding-left: 0;
	position: relative;
}

.timer-text {
	font-size: 95rpx;
	font-weight: bold;
	color: #6a3de8;
	position: relative;
	z-index: 1;
}

.timer-label {
	font-size: 38rpx;
	color: #6a3de8;
	margin-bottom: 8rpx;
	align-self: center;
}

.breathing-icon {
	animation: breathe 3s infinite ease-in-out;
}

@keyframes breathe {
	0% { opacity: 0.5; transform: scale(0.9); }
	50% { opacity: 1; transform: scale(1.1); }
	100% { opacity: 0.5; transform: scale(0.9); }
}

.timer-description {
	font-size: 28rpx;
	color: #999;
	align-self: center;
}

/* 按钮区 */
.timer-controls {
	display: flex;
	justify-content: center; 
	width: 95%; 
	margin-bottom: 45rpx;
	padding-left: 0;
}


.control-btn {
	height: 105rpx; 
	width: 200rpx; 
	border-radius: 45rpx; 
	font-size: 30rpx; 
	font-weight: 500;
	border: none;
	outline: none;
	box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease; 
	position: relative;
	overflow: hidden; 
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0; 
	margin: 0 20rpx; 
}

/* 开始按钮样式 */
.start {
	background-color: #6a3de8;
	color: white;
	margin-right: 15rpx; 
	
	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 45rpx; 
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		pointer-events: none;
	}
}

/* 重置按钮样式 */
.reset {
	background-color: #f0f0f0;
	color: #666;
	
	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 45rpx; 
		border: 2rpx solid rgba(0, 0, 0, 0.05);
		pointer-events: none;
	}
}

.btn-hover {
	opacity: 0.85;
	transform: scale(0.98);
}

/* 模式选择区 */
.timer-mode {
	width: 100%;
	background-color: #f8f7fd;
	border-radius: 25rpx;
	padding: 25rpx;
	margin-left: 0;
}

.mode-title {
	font-size: 34rpx;
	color: #333;
	margin-bottom: 25rpx;
	display: block;
	text-align: center; 
}

.mode-options {
	display: flex;
	flex-direction: column;
}

.mode-item {
	display: flex;
	align-items: center;
	justify-content: space-between; 
	padding: 18rpx 25rpx; 
	border-radius: 12rpx;
	margin-bottom: 12rpx;
}

.mode-item.active {
	background-color: #f0ebff;
}

.mode-dot {
	width: 45rpx;
	height: 45rpx;
	text-align: center;
	line-height: 45rpx;
	color: #6a3de8;
	font-size: 32rpx;
	margin-right: 20rpx;
}

.mode-label {
	flex: 1;
	font-size: 32rpx;
	color: #333;
	text-align: left; 
}

.active-text {
	color: #6a3de8;
	font-weight: bold;
}

.mode-time {
	font-size: 28rpx;
	color: #999;
}

/* 自定义时长设置 */
.custom-duration-section {
	margin-top: 30rpx;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.custom-duration-label {
	font-size: 28rpx;
	color: #666;
}

.custom-duration-input {
	flex: 1;
	margin-left: 20rpx;
	padding: 16rpx 24rpx;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 30rpx;
	font-size: 28rpx;
	color: #333;
	text-align: center;
	transition: all 0.3s ease;
}

.custom-duration-input:focus {
	border-color: #8672f8;
	box-shadow: 0 0 0 4rpx rgba(134, 114, 248, 0.1);
}

.custom-duration-input:disabled {
	background-color: #f5f5f5;
	color: #999;
}

/* AI推荐区域 */
.ai-recommend-section {
	margin-bottom: 30rpx;
	width: 100%;
	display: flex;
	justify-content: center;
}

.ai-recommend-btn {
	background: linear-gradient(90deg, #4a90e2, #8672f8);
	color: #fff;
	border: none;
	border-radius: 20rpx;
	padding: 20rpx 40rpx;
	font-size: 28rpx;
	box-shadow: 0 4rpx 12rpx rgba(106, 61, 232, 0.3);
}

.ai-recommend-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

/* 环境音效区域 */
.ambient-section {
	margin-top: 35rpx;
	width: 100%;
	margin-left: 0; 
}

.section-title {
	display: flex;
	align-items: center;
	justify-content: center; 
	margin-bottom: 25rpx;
	font-size: 34rpx;
	color: #333;
}

.sound-icon {
	margin-left: 12rpx;
	font-size: 32rpx;
}

.sound-grid {
	display: flex;
	flex-direction: column;
	align-items: center; 
	width: 100%;
}

.sound-row {
	display: flex;
	justify-content: space-around;
	width: 100%;
	margin-bottom: 25rpx;
}

.sound-item {
	width: 28%; 
	background-color: #f8f7fd;
	border-radius: 18rpx;
	padding: 25rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	transition: all 0.3s;
}

.sound-item.active {
	background-color: #f0ebff;
	box-shadow: 0 0 12rpx rgba(106, 61, 232, 0.2);
}

.sound-image {
	width: 70rpx;
	height: 70rpx;
	margin-bottom: 12rpx;
}

.sound-label {
	font-size: 28rpx;
	color: #666;
}

/* 底部空白 */
.content-spacer {
	height: 150rpx;
	width: 100%;
}
</style> 