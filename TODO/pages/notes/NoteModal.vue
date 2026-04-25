<template>
	<view v-if="visible" class="popup-overlay-new" @click.self="close">
		<!-- 动态渐变背景 -->
		<view class="popup-backdrop" :style="{ backgroundImage: getGradientBackground(noteColor) }"></view>
		
		<view class="popup-content-wrapper-new" :class="{ show: visible }">
			<!-- 悬浮关闭按钮 -->
			<view class="close-button" @click="close">×</view>
			
			<view class="textarea-wrapper-new">
				<textarea
					class="note-textarea-new"
					v-model="internalContent"
					placeholder="写点什么吧..."
					maxlength="500"
					:focus="false"
				></textarea>
			</view>
			
			<view class="color-palette">
				<view
					v-for="color in noteColors"
					:key="color"
					class="color-dot"
					:class="{ 'selected': internalColor === color }"
					:style="{ backgroundColor: color }"
					@click="internalColor = color"
				></view>
			</view>
			
			<!-- AI情绪疏导 -->
			<view v-if="internalContent && internalContent.trim().length > 0" class="ai-guidance-section">
				<button class="ai-guidance-btn" @click="getAIGuidance">
					💬 AI情绪疏导
				</button>
			</view>
			
			<!-- AI回复显示区域 -->
			<view v-if="aiGuidance" class="ai-guidance-result">
				<view class="ai-guidance-header">
					<text class="ai-guidance-title">💡 AI建议</text>
					<text class="ai-guidance-close" @click="closeAIGuidance">×</text>
				</view>
				<scroll-view class="ai-guidance-scroll" scroll-y="true">
					<text class="ai-guidance-text">{{ aiGuidance }}</text>
				</scroll-view>
			</view>
			
			<view class="popup-actions">
				<button v-if="isEditing" class="action-btn delete" @click="handleDelete">删除</button>
				<button class="action-btn save" @click="handleSave">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: "NoteModal",
	props: {
		visible: {
			type: Boolean,
			default: false,
		},
		note: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			internalContent: '',
			internalColor: '#FFF5E1', 
			noteColors: ['#FFF5E1', '#F5E1FF', '#E1F5FF', '#E1FFF5', '#F5FFE1', '#FFE1E1'],
			aiGuidance: '', // AI疏导回复
		};
	},
	computed: {
		isEditing() {
			return this.note && this.note.id;
		},
		noteColor() {
			return this.internalColor;
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				if (this.note) {
					this.internalContent = this.note.content;
					this.internalColor = this.note.color;
				} else {
					this.internalContent = '';
					this.internalColor = this.noteColors[0];
				}
				// 每次打开都重置AI疏导结果
				this.aiGuidance = '';
			}
		},
	},
	methods: {
		close() {
			this.$emit('close');
		},
		handleSave() {
			const noteData = {
				...this.note,
				content: this.internalContent,
				color: this.internalColor,
			};
			this.$emit('save', noteData);
		},
		handleDelete() {
			this.$emit('delete', this.note.id);
		},
		getGradientBackground(hex) {
			if (!hex || !hex.startsWith('#')) {
				return 'linear-gradient(160deg, #e3eeff 0%, #f3e7e9 100%)';
			}
			let r = parseInt(hex.slice(1, 3), 16);
			let g = parseInt(hex.slice(3, 5), 16);
			let b = parseInt(hex.slice(5, 7), 16);
			
			let r1 = Math.min(255, r + 40);
			let g1 = Math.min(255, g + 40);
			let b1 = Math.min(255, b + 40);

			let r2 = Math.floor((r + 255 * 3) / 4);
			let g2 = Math.floor((g + 255 * 3) / 4);
			let b2 = Math.floor((b + 255 * 3) / 4);

			return `linear-gradient(160deg, rgba(${r1},${g1},${b1},0.3) 0%, rgba(${r2},${g2},${b2},0.3) 100%)`;
		},
		
		// AI情绪疏导
		async getAIGuidance() {
			if (!this.internalContent || this.internalContent.trim().length === 0) {
				uni.showToast({ title: '请输入内容', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: 'AI分析中...' });
			
			try {
				const aiService = require('@/utils/aiService.js').default;
				// 添加时间戳和随机数，确保每次生成不同的内容
				const uniquePrompt = `${this.internalContent}\n[生成时间:${Date.now()},随机:${Math.random()}]`;
				const result = await aiService.emotionalGuidance(uniquePrompt, true); // 第二个参数true表示强制刷新，不使用缓存
				
				// 解析AI返回
				if (result && result.text) {
					this.aiGuidance = result.text;
				} else if (typeof result === 'string') {
					this.aiGuidance = result;
				} else {
					throw new Error('AI返回格式不正确');
				}
				
				uni.hideLoading();
			} catch (error) {
				console.error('AI疏导失败:', error);
				uni.hideLoading();
				uni.showToast({ title: '分析失败，请重试', icon: 'none' });
			}
		},
		
		// 关闭AI疏导
		closeAIGuidance() {
			this.aiGuidance = '';
		},
	}
};
</script>

<style scoped>
.popup-overlay-new {
	position: fixed; top: 0; left: 0; width: 100%; height: 100%;
	display: flex; justify-content: center; align-items: flex-end;
	z-index: 1000;
}
.popup-backdrop {
	position: absolute; top: 0; left: 0; width: 100%; height: 100%;
	background-color: rgba(0,0,0,0.2);
	backdrop-filter: blur(20px) saturate(180%);
	-webkit-backdrop-filter: blur(20px) saturate(180%);
	z-index: 0;
}
.popup-content-wrapper-new {
	width: 100%;
	background-color: transparent;
	padding: 100rpx 40rpx 40rpx;
	box-sizing: border-box;
	position: relative;
	z-index: 1;
	transform: translateY(100%);
	transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.popup-content-wrapper-new.show {
	transform: translateY(0);
}
.close-button {
	position: absolute; top: 40rpx; right: 40rpx;
	width: 60rpx; height: 60rpx;
	border-radius: 50%;
	background-color: rgba(0,0,0,0.2);
	color: white;
	display: flex; justify-content: center; align-items: center;
	font-size: 36rpx;
	line-height: 60rpx;
}
.textarea-wrapper-new {
	background-color: rgba(255,255,255,0.25);
	border: 1px solid rgba(255,255,255,0.3);
	border-radius: 24rpx;
	padding: 25rpx;
	margin-bottom: 30rpx;
}
.note-textarea-new {
	width: 100%; height: 350rpx;
	font-size: 32rpx;
	line-height: 1.6;
	color: #1a1a1a;
}
.note-textarea-new::placeholder {
	color: rgba(0,0,0,0.4);
}
.color-palette {
	display: flex;
	justify-content: center;
	gap: 20rpx;
	margin-bottom: 30rpx;
}
.color-dot {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: 2px solid transparent;
	transition: transform 0.2s;
}
.color-dot.selected {
	border-color: #ffffff;
	transform: scale(1.2);
}
.popup-actions {
	display: flex;
	gap: 20rpx;
}
.action-btn {
	flex: 1;
	border-radius: 20rpx;
	font-size: 32rpx;
}
.save {
	background-color: #34495e;
	color: white;
}
.delete {
	background-color: #e74c3c;
	color: white;
}

/* AI情绪疏导样式 */
.ai-guidance-section {
	margin: 20rpx 0;
	display: flex;
	justify-content: center;
}

.ai-guidance-btn {
	background: linear-gradient(90deg, #4a90e2, #8672f8);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	padding: 12rpx 24rpx;
	font-size: 26rpx;
}

.ai-guidance-result {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 75vw;
	height: 65vh;
	min-width: 600rpx;
	max-width: 850rpx;
	min-height: 500rpx;
	max-height: 750rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, #fff5f5 0%, #ffeef0 50%, #fff0f5 100%);
	border-radius: 24rpx;
	border: 3rpx solid #ffb3d9;
	box-shadow: 0 12rpx 32rpx rgba(255, 182, 193, 0.4), 0 0 0 8rpx rgba(255, 192, 203, 0.1);
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;
	z-index: 1000;
	position: relative;
	box-sizing: border-box;
}

.ai-guidance-result::before {
	content: '✨';
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	font-size: 40rpx;
	opacity: 0.6;
	animation: sparkle 2s ease-in-out infinite;
}

.ai-guidance-result::after {
	content: '💕';
	position: absolute;
	bottom: 20rpx;
	left: 20rpx;
	font-size: 36rpx;
	opacity: 0.5;
	animation: float 3s ease-in-out infinite;
}

@keyframes sparkle {
	0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
	50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-10rpx); }
}

.ai-guidance-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	width: 100%;
}

.ai-guidance-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #ff6b9d;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.ai-guidance-close {
	font-size: 36rpx;
	color: #ffb3d9;
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 182, 193, 0.2);
	transition: all 0.3s ease;
}

.ai-guidance-close:active {
	background: rgba(255, 182, 193, 0.4);
	transform: scale(0.9);
}

.ai-guidance-scroll {
	width: 100%;
	flex: 1;
	max-height: calc(65vh - 150rpx);
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	overflow-y: auto;
	overflow-x: hidden;
}

.ai-guidance-text {
	font-size: 30rpx;
	color: #5a5a5a;
	line-height: 2;
	white-space: pre-wrap;
	text-align: left;
	width: 100%;
	padding: 20rpx;
	margin: 0;
	background: rgba(255, 255, 255, 0.7);
	border-radius: 16rpx;
	border-left: 4rpx solid #ffb3d9;
	box-sizing: border-box;
	display: block;
}

</style> 