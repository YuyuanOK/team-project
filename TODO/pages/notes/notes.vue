<template>
	<view class="page-container">
		<!-- 紫色头部 -->
		<view class="header-section">
			<text class="header-title">灵感便签 ✍️</text>
		</view>

		<!-- 白色主体内容 -->
		<view class="main-content">
			<scroll-view class="notes-scroll-view" scroll-y="true" :style="{ height: scrollViewHeight }">
				<view v-if="notes.length === 0" class="empty-state">
					<view class="empty-animation-container full-center">
						<image class="empty-image animate-float" src="/static/images/empty-notes-2.png" mode="aspectFit"></image>
						<span class="sparkle" style="top: 6%; left: 6%; animation-delay: 0s;">🎉</span>
						<span class="sparkle" style="top: 6%; right: 6%; animation-delay: 0.3s;">💖</span>
						<span class="sparkle" style="bottom: 6%; left: 6%; animation-delay: 0.6s;">✨</span>
						<span class="sparkle" style="bottom: 6%; right: 6%; animation-delay: 0.9s;">👍</span>
						<span class="sparkle" style="top: 20%; right: 10%; animation-delay: 1.2s;">🔥</span>
						<span class="sparkle" style="bottom: 18%; left: 12%; animation-delay: 1.5s;">🌟</span>
					</view>
					<view class="empty-center-content">
						<text class="empty-title animate-fade-in" style="margin-top: 60rpx;">灵感还没来？</text>
						<text class="empty-subtitle animate-fade-in" style="animation-delay: 0.2s;">快来捕捉你的第一个想法火花吧！</text>
					</view>
				</view>
				
				<view v-else class="notes-grid">
					<view class="column">
						<view
							v-for="(note, index) in column1"
							:key="note.id"
							class="note-card-force-large animate-enter"
							:style="{ backgroundColor: note.color }"
							@click="openNoteModal(note)"
						>
							<text class="note-content-force-large">{{ note.content }}</text>
							<text class="note-date-new">{{ formatDate(note.timestamp) }}</text>
						</view>
					</view>
					<view class="column">
						<view
							v-for="(note, index) in column2"
							:key="note.id"
							class="note-card-force-large animate-enter"
							:style="{ backgroundColor: note.color }"
							@click="openNoteModal(note)"
						>
							<text class="note-content-force-large">{{ note.content }}</text>
							<text class="note-date-new">{{ formatDate(note.timestamp) }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 悬浮添加按钮 -->
		<view class="fab-button" @click="openNoteModal(null)">
			<text class="fab-icon">+</text>
		</view>

		<note-modal
			:visible="isNoteModalVisible"
			:note="editingNote"
			@close="closeNoteModal"
			@save="saveNote"
			@delete="confirmDelete"
		></note-modal>

		<!-- 删除确认弹窗 -->
		<view v-if="isDeleteConfirmVisible" class="popup-overlay confirm-overlay" @click.self="isDeleteConfirmVisible = false">
			<view class="confirm-box-new animate-pop">
				<view class="confirm-emoji">😭🗑️</view>
				<text class="confirm-title-new">真的要丢掉这条便签吗？</text>
				<text class="confirm-content-new">小便签会很伤心哦~<br>删除后就找不回啦！</text>
				<view class="confirm-actions-new">
					<button class="confirm-btn-new cancel bounce-btn" @click="isDeleteConfirmVisible = false">再抱抱</button>
					<button class="confirm-btn-new delete bounce-btn" @click="deleteNote">狠心删除</button>
				</view>
				<view class="confirm-footer-emoji">🌈✨💔</view>
			</view>
		</view>
	</view>
</template>

<script>
	import NoteModal from './NoteModal.vue'; 

	const STORAGE_KEY = 'notes_data_v2';

	export default {
		components: {
			NoteModal,
		},
		data() {
			return {
				notes: [],
				column1: [],
				column2: [],
				isNoteModalVisible: false,
				editingNote: null,
				isDeleteConfirmVisible: false,
				noteToDeleteId: null,
				scrollViewHeight: 'calc(100vh - 240rpx)',
			};
		},
		onReady() {
			// 计算滚动视图高度
			uni.getSystemInfo({
				success: (res) => {
					// 头部高度约 160rpx，底部导航栏约 100rpx，再加上间距
					const headerHeight = 160; // rpx 单位
					const bottomNavHeight = 100; // rpx 单位
					// 转换为px：rpx * (屏幕宽度 / 750)
					const rpxToPx = res.windowWidth / 750;
					const totalHeight = (headerHeight + bottomNavHeight) * rpxToPx;
					this.scrollViewHeight = `${res.windowHeight - totalHeight}px`;
				}
			});
		},
		onShow() {
			this.loadNotesFromStorage();
		},
		methods: {
			distributeNotes() {
				this.column1 = [];
				this.column2 = [];
				this.notes.forEach((note, index) => {
					if (index % 2 === 0) {
						this.column1.push(note);
					} else {
						this.column2.push(note);
					}
				});
			},
			loadNotesFromStorage() {
				const savedNotes = uni.getStorageSync(STORAGE_KEY);
				if (savedNotes && Array.isArray(savedNotes)) {
					this.notes = savedNotes;
				} else {
					this.notes = [];
				}
				this.distributeNotes();
			},
			saveNotesToStorage() {
				uni.setStorageSync(STORAGE_KEY, this.notes);
				this.distributeNotes();
			},
			openNoteModal(note) {
				this.editingNote = note ? { ...note } : null;
				this.isNoteModalVisible = true;
			},
			closeNoteModal() {
				this.isNoteModalVisible = false;
				this.editingNote = null;
			},
			saveNote(noteData) {
				const notes = this.notes;
				if (noteData.id) {
					// 编辑
					const index = notes.findIndex(n => n.id === noteData.id);
					if (index !== -1) {
						notes.splice(index, 1, noteData);
					}
				} else {
					// 新增
					const newNote = {
						...noteData,
						id: Date.now(),
						timestamp: Date.now(),
					};
					notes.unshift(newNote);
				}
				this.notes = notes;
				this.saveNotesToStorage();
				this.closeNoteModal();
			},
			showDeleteConfirmation(noteId) {
				this.noteToDeleteId = noteId;
				this.isDeleteConfirmVisible = true;
			},
			confirmDelete(noteId) {
				this.noteToDeleteId = noteId;
				this.isDeleteConfirmVisible = true;
				this.isNoteModalVisible = false; 
			},
			deleteNote() {
				this.notes = this.notes.filter(n => n.id !== this.noteToDeleteId);
				this.saveNotesToStorage();
				this.isDeleteConfirmVisible = false;
				this.noteToDeleteId = null;
			},
			formatDate(timestamp) {
				const date = new Date(timestamp);
				return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
			},
		},
	};
</script>

<style scoped>
	/* 页面总容器 */
	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #342d59;
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	/* 紫色头部 */
	.header-section {
		background-color: #342d59;
		color: white;
		padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 50rpx !important;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
	
	.header-title {
		font-size: 46rpx !important;
		font-weight: bold !important;
		color: #ffffff !important;
		text-align: center !important;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
	}

	/* 白色主体内容 */
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
	
	.notes-scroll-view {
		width: 100%;
		padding: 40rpx; 
		box-sizing: border-box;
		-webkit-overflow-scrolling: touch;
	}
	
	.empty-state {
		position: relative;
		min-height: calc(100vh - 300rpx);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.empty-animation-container.full-center {
		position: absolute;
		top: 0; left: 0; width: 100%; height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	
	.sparkle {
		position: absolute;
		font-size: 60rpx;
		opacity: 0;
		animation: sparkle 2.5s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%, 100% { transform: scale(0.8) translateY(0); opacity: 0; }
		50% { transform: scale(1.3) translateY(-30px); opacity: 1; }
		75% { transform: scale(1.0) translateY(10px); opacity: 1; }
	}

	.empty-image {
		width: 350rpx;
		height: 350rpx;
		opacity: 0.8;
		margin-bottom: 20rpx;
	}

	.empty-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #7f8c8d;
		margin-top: 30rpx;
	}

	.empty-subtitle {
		font-size: 28rpx;
		color: #95a5a6;
		margin-top: 15rpx;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-15px); }
	}

	.animate-float {
		animation: float 4s ease-in-out infinite;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-fade-in {
		opacity: 0;
		animation: fadeIn 0.8s 0.2s ease-out forwards;
	}
	
	.notes-grid {
		display: flex;
		gap: 35rpx;
		padding: 35rpx;
		padding-bottom: 200rpx;
	}

	.column {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 35rpx;
	}
	
	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	
	.animate-enter {
		animation: enter 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	.note-card {
		display: none;
	}

	.note-card-force-large {
		padding: 50rpx !important;
		border-radius: 40rpx !important;
		box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.1) !important;
		border: 3rpx solid rgba(255, 182, 193, 0.3) !important;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		position: relative;
		overflow: hidden;
	}

	.note-card-force-large::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255, 192, 203, 0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.note-card-force-large:active {
		transform: scale(0.97) !important;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15) !important;
	}

	.note-content-new {
		display: none; 
	}

	.note-content-force-large {
		font-size: 36rpx !important;
		color: #2c3e50;
		line-height: 1.8 !important;
		white-space: pre-wrap;
		word-wrap: break-word;
		flex-grow: 1;
		position: relative;
		z-index: 1;
	}

	.note-date-new {
		font-size: 22rpx;
		color: rgba(44, 62, 80, 0.4);
		margin-top: 25rpx;
		display: block;
		align-self: flex-end;
	}

	.note-text-content { 
		font-size: 28rpx;
		color: #3d405b;
		line-height: 1.65;
		white-space: pre-wrap;
		word-wrap: break-word;
		flex-grow: 1; 
		padding-top: 20rpx; 
	}

	/* 日期样式调整 */
	.note-date {
		font-size: 22rpx;
		color: rgba(0, 0, 0, 0.35);
		margin-top: 20rpx;
		display: block;
		align-self: flex-end; 
	}

	/* 悬浮按钮样式 */
	.fab-button {
		position: fixed;
		bottom: calc(140rpx + env(safe-area-inset-bottom));
		right: 40rpx;
		width: 120rpx;
		height: 120rpx;
		background-color: #342d59;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 8rpx 16rpx rgba(52, 45, 89, 0.4);
		z-index: 999;
		transition: transform 0.2s ease, background-color 0.2s ease;
	}

	.fab-button:active {
		transform: scale(0.9);
		background-color: #4a3f7a;
	}

	.fab-icon {
		font-size: 70rpx;
		color: #ffffff;
	}

	.confirm-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1001; 
	}

	.empty-center-content {
		position: relative;
		z-index: 2;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 0 !important;
	}

	.confirm-box-new {
		background: #fff;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(52,45,89,0.10);
		padding: 48rpx 36rpx 36rpx 36rpx;
		width: 520rpx;
		max-width: 90vw;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: popIn 0.35s cubic-bezier(0.4,1.6,0.4,1) both;
	}
	.confirm-emoji {
		font-size: 64rpx;
		margin-bottom: 12rpx;
		animation: shake 0.7s infinite alternate;
	}
	.confirm-title-new {
		font-size: 34rpx;
		font-weight: bold;
		color: #fa5252;
		margin-bottom: 8rpx;
		text-align: center;
	}
	.confirm-content-new {
		font-size: 26rpx;
		color: #666;
		text-align: center;
		margin-bottom: 28rpx;
		line-height: 1.7;
	}
	.confirm-actions-new {
		display: flex;
		gap: 28rpx;
		width: 100%;
		justify-content: center;
	}
	.confirm-btn-new {
		flex: 1;
		font-size: 28rpx;
		padding: 18rpx 0;
		border-radius: 16rpx;
		border: none;
		font-weight: bold;
		box-shadow: 0 2rpx 8rpx rgba(52,45,89,0.06);
		margin-bottom: 0;
	}
	.confirm-btn-new.cancel {
		background: linear-gradient(90deg, #f3f3f3, #f9e6e6);
		color: #fa5252;
	}
	.confirm-btn-new.delete {
		background: linear-gradient(90deg, #ff6a6a, #ffb86c);
		color: #fff;
	}
	.confirm-footer-emoji {
		margin-top: 18rpx;
		font-size: 32rpx;
		opacity: 0.7;
	}
	.bounce-btn {
		transition: transform 0.1s;
	}
	.bounce-btn:active {
		transform: scale(1.08);
	}
	@keyframes popIn {
		0% { transform: scale(0.7); opacity: 0; }
		80% { transform: scale(1.08); opacity: 1; }
		100% { transform: scale(1); opacity: 1; }
	}
	.animate-pop {
		animation: popIn 0.35s cubic-bezier(0.4,1.6,0.4,1) both;
	}
	@keyframes shake {
		0% { transform: rotate(-6deg); }
		100% { transform: rotate(6deg); }
	}
</style>