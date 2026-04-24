<template>
	<view class="calendar-page-container">
		<!-- 紫色标题区-->
		<view class="dashboard-header">
			<text class="dashboard-title">日历 📅</text>
		</view>

		<!-- 白色内容区 -->
		<view class="dashboard-content">
			<scroll-view class="calendar-scroll-view" scroll-y>
				<view class="calendar-card">
					<!-- 月份控制器 -->
					<view class="calendar-controls">
						<button @click="prevMonth" class="control-btn"> &lt; </button>
						<text class="current-date">{{ currentYear }}年 {{ currentMonth }}月</text>
						<button @click="nextMonth" class="control-btn"> &gt; </button>
					</view>
					
					<!-- 星期头部 -->
					<view class="week-header">
						<view v-for="day in weekDays" :key="day" class="week-day">{{ day }}</view>
					</view>
					
					<!-- 日历网格 -->
					<view class="calendar-grid">
					<view 
						v-for="(day, index) in calendarDays" 
						:key="index" 
						class="date-cell" 
						:class="{
							'not-current-month': !day.isCurrentMonth, 
							'is-today': day.isToday, 
							'selected': isSelected(day),
							'is-weekend': day.isWeekend,
							'has-task': day.hasTask
						}" 
						@click="selectDate(day)"
					>
						<!-- 只在有日期时显示数字 -->
						<text class="date-text" v-if="day.day">{{ day.day }}</text>
						<view v-if="day.hasTask" class="task-marker"></view>
					</view>
					</view>
				</view>
				
				<view class="tasks-section">
					<view class="tasks-header">
						<text class="tasks-title">{{ selectedDateFormatted }}</text>
						<text class="tasks-subtitle">的任务清单</text>
					</view>
					<view v-if="selectedDateTasks.length === 0" class="empty-tasks-new">
						<image src="/static/images/empty-calendar-2.png" mode="aspectFit" class="empty-image-new"></image>
						<text class="empty-title-new">太棒了！</text>
						<text class="empty-subtitle-new">今天所有任务都已完成</text>
					</view>
					<view v-else class="task-list-new">
						<view v-for="task in selectedDateTasks" :key="task.id" class="task-item-new">
							<view class="task-indicator" :style="{ backgroundColor: getCategoryColor(task.type) }"></view>
							<text class="task-content-new">{{ task.text }}</text>
							<view class="task-tag-new" :style="{ backgroundColor: getCategoryColor(task.type) }">{{ task.type || '其他' }}</view>
						</view>
					</view>
				</view>

				<!-- 增加底部安全区 -->
				<view class="safe-area-bottom"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	const TASK_STORAGE_KEY = 'tasks';

	export default {
		data() {
			return {
				selectedDate: new Date(),
				currentYear: new Date().getFullYear(),
				currentMonth: new Date().getMonth() + 1,
				calendarDays: [],
				allTasks: [],
				selectedDateTasks: [],
				weekDays: ['日', '一', '二', '三', '四', '五', '六'],
				categoryColors: {
					'学习': '#4a90e2',
					'工作': '#50e3c2',
					'生活': '#f8e71c',
				}
			};
		},
		computed: {
			selectedDateFormatted() {
				if (!this.selectedDate) return '';
				const month = this.selectedDate.getMonth() + 1;
				const day = this.selectedDate.getDate();
				return `${month}月${day}日`;
			}
		},
		onShow() {
			// 每次进入页面都重新加载，确保数据同步
			this.loadTasksAndGenerateCalendar();
		},
		methods: {
			loadTasksAndGenerateCalendar() {
				this.loadTasksFromStorage(); 
				this.generateCalendar();
				this.updateSelectedDateTasks(this.selectedDate);
			},
			loadTasksFromStorage() {
				try {
					// 直接从StorageSync获取最新的数据
					const tasks = uni.getStorageSync(TASK_STORAGE_KEY);
					this.allTasks = tasks ? (typeof tasks === 'string' ? JSON.parse(tasks) : tasks) : [];
				} catch (e) {
					console.error("日历页加载任务失败:", e);
					this.allTasks = [];
				}
			},
			generateCalendar() {
				const days = [];
				const date = new Date(this.currentYear, this.currentMonth - 1, 1);
				const firstDayOfWeek = date.getDay();
				const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
				
				// 填充上个月的空白格子，但不显示日期
				for (let i = 0; i < firstDayOfWeek; i++) {
					days.push({ day: null, isCurrentMonth: false });
				}

				// 填充本月的天数
				for (let i = 1; i <= daysInMonth; i++) {
					const currentDate = new Date(this.currentYear, this.currentMonth - 1, i);
					const today = new Date();
					const isToday = today.toDateString() === currentDate.toDateString();
					const dayOfWeek = currentDate.getDay();
					const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0是周日，6是周六
					const hasTask = this.allTasks.some(task => {
						const taskDate = task.dueDate || task.date;
						if (!taskDate) return false;
						const taskDateObj = new Date(taskDate);
						return taskDateObj.toDateString() === currentDate.toDateString();
					});
					days.push({ day: i, isCurrentMonth: true, isToday, hasTask, isWeekend, fullDate: currentDate });
				}
				
				// 填充下个月的空白格子，但不显示日期
				const totalCells = 42; 
				while (days.length < totalCells) {
					days.push({ day: null, isCurrentMonth: false });
				}
				this.calendarDays = days.slice(0, 42); 
			},
			selectDate(day) {
				if (!day.isCurrentMonth) return;
				this.selectedDate = day.fullDate;
				this.updateSelectedDateTasks(day.fullDate);
			},
			updateSelectedDateTasks(date) {
				if (!date) return;
				this.selectedDateTasks = this.allTasks.filter(task => {
					const taskDate = new Date(task.dueDate);
					return taskDate.getFullYear() === date.getFullYear() &&
						   taskDate.getMonth() === date.getMonth() &&
						   taskDate.getDate() === date.getDate();
				});
			},
			prevMonth() {
				if (this.currentMonth === 1) {
					this.currentMonth = 12;
					this.currentYear--;
				} else {
					this.currentMonth--;
				}
				this.generateCalendar();
			},
			nextMonth() {
				if (this.currentMonth === 12) {
					this.currentMonth = 1;
					this.currentYear++;
				} else {
					this.currentMonth++;
				}
				this.generateCalendar();
			},
			isSelected(day) {
				if (!day.fullDate || !this.selectedDate) return false;
				return day.fullDate.toDateString() === this.selectedDate.toDateString();
			},
			getCategoryColor(category) {
				const colorMap = {
					'study': '#4a90e2',
					'work': '#50e3c2',
					'life': '#f5a623',
					'default': '#b8e986'
				};
				return colorMap[category] || colorMap['default'];
			}
		}
	};
</script>

<style scoped>
.calendar-page-container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	width: 100%;
	background-color: #342d59;
	padding-top: env(safe-area-inset-top);
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: border-box;
}
.dashboard-header {
	background-color: #342d59;
	padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 50rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}
.dashboard-title {
	font-size: 46rpx !important;
	color: #ffffff !important;
	font-weight: bold !important;
	text-align: center !important;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
}
.dashboard-content {
	background-color: #ffffff;
	border-top-left-radius: 40rpx;
	border-top-right-radius: 40rpx;
	margin-top: -20rpx;
	flex: 1;
	padding: 0; 
	position: relative;
	z-index: 1;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
	overflow: hidden; 
}

.calendar-scroll-view {
	height: calc(100vh - 160rpx);
}

.calendar-card {
	background-color: #ffffff;
	border-radius: 30rpx;
	padding: 30rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
	margin: 30rpx 30rpx 0; 
}

/* 日历控件 */
.calendar-controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	padding: 0 10rpx;
}
.current-date {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}
.control-btn {
	background-color: #342d59;
	border: none;
	font-size: 40rpx;
	color: #ffffff;
	padding: 10rpx 20rpx;
	border-radius: 8rpx;
}

/* 星期头部 */
.week-header {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-bottom: 10rpx;
}
.week-day {
	text-align: center;
	font-size: 26rpx;
	color: #999;
}

/* 日历网格 */
.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 10rpx;
}
.date-cell {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 90rpx;
	border-radius: 16rpx;
	transition: all 0.3s ease;
	position: relative;
	background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
	border: 2rpx solid transparent;
}
.date-text {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	transition: all 0.3s ease;
}
.task-marker {
	position: absolute;
	bottom: 8rpx;
	width: 10rpx;
	height: 10rpx;
	background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
	border-radius: 50%;
	box-shadow: 0 2rpx 4rpx rgba(255, 107, 157, 0.4);
}
/* 非当前月份的日期 */
.not-current-month {
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	opacity: 0.5;
}
.not-current-month .date-text {
	color: #ccc;
}
/* 周末样式 */
.is-weekend {
	background: linear-gradient(135deg, #fff5f5 0%, #ffeef0 100%);
	border-color: rgba(255, 182, 193, 0.3);
}
.is-weekend .date-text {
	color: #ff6b9d;
}
/* 今天样式 */
.is-today {
	background: linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%);
	border: 2rpx solid #4a90e2;
	box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}
.is-today .date-text {
	color: #4a90e2;
	font-weight: bold;
	font-size: 34rpx;
}
/* 有任务的日期 */
.has-task {
	background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
	border-color: rgba(255, 193, 7, 0.4);
}
.has-task .date-text {
	color: #ff9800;
}
.has-task.is-today {
	background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
	border-color: #2196f3;
}
.has-task.is-today .date-text {
	color: #2196f3;
}
/* 选中的日期 */
.selected {
	background: linear-gradient(135deg, #a55eea 0%, #8854d0 100%) !important;
	border-color: #8854d0 !important;
	color: white;
	box-shadow: 0 6rpx 20rpx rgba(165, 94, 234, 0.5);
	transform: scale(1.05);
}
.selected .date-text {
	color: white !important;
	font-weight: bold;
	font-size: 34rpx;
}
.selected .task-marker {
	background: white;
	box-shadow: 0 2rpx 4rpx rgba(255, 255, 255, 0.5);
}
.selected.is-today {
	background: linear-gradient(135deg, #6c5ce7 0%, #a55eea 100%) !important;
	border-color: #6c5ce7 !important;
}
/* 周末且有任务 */
.has-task.is-weekend {
	background: linear-gradient(135deg, #ffeef0 0%, #ffd6e0 100%);
	border-color: rgba(255, 107, 157, 0.5);
}
.has-task.is-weekend .date-text {
	color: #e91e63;
}
/* 选中且是周末 */
.selected.is-weekend {
	background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%) !important;
}
/* 选中且有任务 */
.selected.has-task {
	background: linear-gradient(135deg, #ff6b9d 0%, #e91e63 100%) !important;
}
/* 悬停效果 */
.date-cell:active {
	transform: scale(0.95);
}

/* 任务列表区域 */
.tasks-section {
	margin: 30rpx; 
	background-color: #ffffff;
	border-radius: 30rpx;
	padding: 30rpx;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
}

.tasks-header {
	display: flex;
	align-items: baseline;
	margin-bottom: 25rpx;
	padding-left: 10rpx;
}

.tasks-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
}

.tasks-subtitle {
	font-size: 28rpx;
	color: #888;
	margin-left: 10rpx;
}

.empty-tasks-new {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
}

.empty-image-new {
	width: 220rpx;
	height: 220rpx;
	margin-bottom: 20rpx;
}

.empty-title-new {
	font-size: 34rpx;
	font-weight: 600;
	color: #555;
}

.empty-subtitle-new {
	font-size: 28rpx;
	color: #999;
	margin-top: 10rpx;
}

.task-list-new {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.task-item-new {
	display: flex;
	align-items: center;
	background-color: #f8f9fa;
	padding: 25rpx;
	border-radius: 20rpx;
}

.task-indicator {
	width: 10rpx;
	height: 40rpx;
	border-radius: 5rpx;
	margin-right: 20rpx;
}

.task-content-new {
	flex: 1;
	font-size: 30rpx;
	color: #34495e;
}

.task-tag-new {
	font-size: 24rpx;
	color: white;
	padding: 8rpx 16rpx;
	border-radius: 12rpx;
	font-weight: 500;
}

.date-cell.selected {
    background-color: #a55eea;
}
.date-cell.selected .date-text {
    color: white;
}

.safe-area-bottom {
	height: 80rpx;
}
</style> 