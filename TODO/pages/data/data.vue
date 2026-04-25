<template>
	<view class="container">
		<!-- 紫色标题区域 -->
		<view class="header">
			<text class="title">数据 📊</text>
		</view>
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 滚动视图 -->
			<scroll-view class="scroll-view-vertical" scroll-y="true" show-scrollbar="true" enhanced="true">
				<!-- 统计卡片区（柔和色块+单位） -->
				<view class="stats-cards-new soft-bg">
					<view class="stat-card-new completed">
						<view class="stat-icon"><text>✔️</text></view>
						<view class="stat-info">
							<text class="stat-value">{{completedTasksCount}}<span class="stat-unit">个</span></text>
							<text class="stat-label">已完成</text>
						</view>
					</view>
					<view class="stat-card-new pending">
						<view class="stat-icon"><text>🕒</text></view>
						<view class="stat-info">
							<text class="stat-value">{{pendingTasksCount}}<span class="stat-unit">个</span></text>
							<text class="stat-label">待完成</text>
						</view>
					</view>
					<view class="stat-card-new rate">
						<view class="stat-icon"><text>📈</text></view>
						<view class="stat-info">
							<text class="stat-value">{{completionRatePercent}}<span class="stat-unit">%</span></text>
							<text class="stat-label">完成率</text>
						</view>
					</view>
				</view>
				
				<!-- 任务类型分布 -->
				<view class="chart-container animate-fade-in soft-bg">
					<text class="section-title">任务类型分布</text>
					<view class="chart-body">
						<canvas canvas-id="pieChart" id="pieChart" class="pie-canvas"></canvas>
						<view class="chart-legend vertical-legend">
							<view class="legend-item">
								<view class="legend-color work"></view>
								<text class="legend-text">工作 {{workPercent}}%</text>
							</view>
							<view class="legend-item">
								<view class="legend-color study"></view>
								<text class="legend-text">学习 {{studyPercent}}%</text>
							</view>
							<view class="legend-item">
								<view class="legend-color life"></view>
								<text class="legend-text">生活 {{lifePercent}}%</text>
							</view>
						</view>
					</view>
					<view class="pie-total-info">
						<text class="pie-total-value">{{tasks.length}}</text>
						<text class="pie-total-label">总任务</text>
					</view>
				</view>
				
				<!-- 任务完成趋势 -->
				<view class="chart-container animate-fade-in soft-bg">
					<text class="section-title">任务完成趋势</text>
					<view class="chart-body">
						<canvas canvas-id="lineChart" id="lineChart" class="line-canvas"></canvas>
					</view>
				</view>
				
				<!-- 深度分析 -->
				<view class="analysis-container soft-bg animate-pop-in">
					<view class="analysis-header">
						<text class="analysis-title">AI智能分析</text>
						<button class="ai-refresh-btn" @tap="generateIntelligentReview">🔄 刷新</button>
					</view>
					<view v-if="aiReviewLoading" class="analysis-loading">
						<text>AI分析中...</text>
					</view>
					<view v-else class="analysis-list">
						<view v-if="aiReview" class="analysis-item">
							<text class="analysis-icon">💡</text>
							<view class="analysis-main">
								<text class="analysis-main-title">智能复盘</text>
								<view class="analysis-desc-wrapper">
									<text class="analysis-desc">{{ aiReview.text || '暂无复盘建议' }}</text>
								</view>
							</view>
						</view>
						<view v-if="overduePrediction && overduePrediction.risks && overduePrediction.risks.length > 0" class="analysis-item">
							<text class="analysis-icon">⚠️</text>
							<view class="analysis-main">
								<text class="analysis-main-title">逾期风险预测</text>
								<text class="analysis-desc">
									{{ overduePrediction.risks.length }}个任务存在逾期风险
									<text v-for="(risk, index) in overduePrediction.risks.slice(0, 2)" :key="index" class="risk-item">
										{{ risk.task }}：{{ risk.reason }}
									</text>
								</text>
							</view>
						</view>
						<view v-if="!aiReview && !overduePrediction" class="analysis-item">
							<text class="analysis-icon">📊</text>
							<view class="analysis-main">
								<text class="analysis-main-title">点击刷新获取AI分析</text>
								<text class="analysis-desc">基于您的任务数据生成个性化建议</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 成就系统 -->
				<view class="achievement-system soft-bg animate-pop-in">
					<view class="achievement-header">
						<text class="achievement-title">成就系统</text>
						<text class="achievement-more" @tap="handleMoreClick">详情 &gt;</text>
					</view>
					<view class="achievement-stats">
						<view class="achievement-stat achievement-stat-animated">
							<text class="achievement-stat-icon achievement-icon-pulse">🏆</text>
							<view class="achievement-stat-main">
								<text class="achievement-stat-value">{{todayAchievement}}</text>
								<text class="achievement-stat-label">今日成就</text>
							</view>
						</view>
						<view class="achievement-stat achievement-stat-animated">
							<text class="achievement-stat-icon achievement-icon-flame">🔥</text>
							<view class="achievement-stat-main">
								<text class="achievement-stat-value">{{consecutiveDays}}天</text>
								<text class="achievement-stat-label">连续打卡</text>
							</view>
						</view>
						<view class="achievement-stat achievement-stat-animated">
							<text class="achievement-stat-icon achievement-icon-spin">✨</text>
							<view class="achievement-stat-main">
								<text class="achievement-stat-value">{{achievementPoints}}</text>
								<text class="achievement-stat-label">成就点数</text>
							</view>
						</view>
					</view>
					<view class="achievement-progress">
						<text class="progress-label progress-label-active">青铜</text>
						<view class="progress-bar-bg">
							<view class="progress-bar progress-bar-animated" :style="{width: achievementProgress + '%'}"></view>
						</view>
						<text class="progress-label">白银</text>
						<text class="progress-value">{{achievementProgress}}%</text>
					</view>
					<view class="achievement-motivational">
						<text class="motivational-text">🎯 再接再厉！距离下一等级还差{{100 - achievementProgress}}%</text>
					</view>
				</view>
				
				<view class="content-spacer"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
// 常量定义
const CHART_TYPES = Object.freeze({
	LINE: 'line',
	BAR: 'bar',
	PIE: 'pie'
});

const TIME_RANGES = Object.freeze({
	TODAY: 'today',
	WEEK: 'week',
	MONTH: 'month'
});

const STORAGE_KEYS = Object.freeze({
	TASKS: 'tasks',
	FOCUS_HISTORY: 'focus_history'
});

const CHART_CONFIG = Object.freeze({
	COLORS: Object.freeze({
		PRIMARY: '#6A1B9A',
		SECONDARY: '#9C4DCC',
		TERTIARY: '#C17EE6',
		LIGHT: '#D8B4E8',
		BACKGROUND: '#f9f9f9',
		TEXT: '#333333',
		GRID: '#eeeeee'
	}),
	ANIMATION: Object.freeze({
		DURATION: 500
	})
});

// 工具函数
const DateUtils = {
	// 获取今天的日期字符串 (YYYY-MM-DD)
	getTodayString() {
		const date = new Date();
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	},
	
	// 获取本周的日期范围
	getWeekRange() {
		const now = new Date();
		const dayOfWeek = now.getDay() || 7; 
		const monday = new Date(now);
		monday.setDate(now.getDate() - dayOfWeek + 1);
		
		const sunday = new Date(now);
		sunday.setDate(now.getDate() - dayOfWeek + 7);
		
		return {
			start: monday,
			end: sunday
		};
	},
	
	// 格式化日期
	formatDateRange(start, end) {
		const formatDate = (date) => {
			return `${date.getMonth() + 1}月${date.getDate()}日`;
		};
		return `${formatDate(start)}-${formatDate(end)}`;
	}
};

// 数据处理工具
const DataProcessor = {
	// 计算完成率
	calculateCompletionRate(tasks) {
		if (!tasks || tasks.length === 0) return 0;
		
		const completed = tasks.filter(task => task.completed).length;
		return Math.round((completed / tasks.length) * 100);
	},
	
	// 按类型分组任务
	groupTasksByType(tasks) {
		const result = {};
		
		if (!tasks || tasks.length === 0) return result;
		
		tasks.forEach(task => {
			const type = task.type || '其他';
			if (!result[type]) {
				result[type] = {
					total: 0,
					completed: 0
				};
			}
			
			result[type].total++;
			if (task.completed) {
				result[type].completed++;
			}
		});
		
		return result;
	},
	
	// 过滤指定日期范围的任务
	filterTasksByDateRange(tasks, startDate, endDate) {
		if (!tasks || tasks.length === 0) return [];
		
		const start = startDate.getTime();
		const end = endDate.getTime();
		
		return tasks.filter(task => {
			// 兼容date和dueDate字段
			const taskDateStr = task.date || task.dueDate;
			if (!taskDateStr) return false;
			
			const taskDate = new Date(taskDateStr).getTime();
			if (isNaN(taskDate)) return false;
			
			return taskDate >= start && taskDate <= end;
		});
	},
	
	// 获取专注时间统计
	getFocusTimeStats(focusHistory) {
		if (!focusHistory || focusHistory.length === 0) {
			return {
				total: 0,
				daily: 0,
				sessions: 0
			};
		}
		
		const today = DateUtils.getTodayString();
		let totalMinutes = 0;
		let todayMinutes = 0;
		
		focusHistory.forEach(session => {
			const duration = session.duration || 0;
			totalMinutes += duration;
			
			if (session.date === today) {
				todayMinutes += duration;
			}
		});
		
		return {
			total: Math.round(totalMinutes / 60), // 转换为小时
			daily: todayMinutes,
			sessions: focusHistory.length
		};
	}
};

// 存储工具
const StorageUtils = {
	// 获取存储数据（只返回实际存储的数据，不使用静态示例数据）
	getData(key, defaultValue = []) {
		try {
			const data = uni.getStorageSync(key);
			if (!data) {
				// 如果没有数据，返回默认值（空数组）
				return defaultValue;
			}
			
			// 如果数据是字符串，尝试解析
			if (typeof data === 'string') {
				try {
					const parsed = JSON.parse(data);
					// 确保返回的是数组
					return Array.isArray(parsed) ? parsed : defaultValue;
				} catch (e) {
					console.error(`解析存储失败 [${key}]:`, e);
					return defaultValue;
				}
			}
			
			// 如果数据已经是数组，直接返回
			if (Array.isArray(data)) {
				return data;
			}
			
			// 如果是对象，尝试转换为数组
			if (typeof data === 'object' && data !== null) {
				return Object.values(data);
			}
			
			// 其他情况返回默认值
			return defaultValue;
		} catch (e) {
			console.error(`读取存储失败 [${key}]:`, e);
			return defaultValue;
		}
	}
};

export default {
	name: 'DataPage',
	
	data() {
		return {
			currentTab: 3, 
			
			// 数据源
			tasks: [],
			focusHistory: [],
			
			// 当前选择的时间范围
			currentTimeRange: TIME_RANGES.WEEK,
			
			// 图表类型
			chartType: CHART_TYPES.BAR,
			
			// 图表数据缓存
			chartData: {
				labels: ['周一','周二','周三','周四','周五','周六','周日'],
				datasets: [{
					label: '任务完成率',
					data: [0, 0, 0, 0, 0, 0, 0],
					backgroundColor: CHART_CONFIG.COLORS.SECONDARY,
					borderColor: CHART_CONFIG.COLORS.PRIMARY,
					borderWidth: 1
				}]
			},
			
			// UI状态
			isLoading: false,
			dateRangeText: '',
			// 统计卡片数据
			completedTasks: 0,
			pendingTasks: 0,
			completionRate: 0,
			// AI分析数据
			aiReview: null,
			overduePrediction: null,
			aiReviewLoading: false,
			focusAdvice: '保持专注，每天进步一点点！建议使用番茄钟进行25分钟专注学习，适当休息，提升效率。',
			achievements: [
				{ emoji: '🏆', text: '累计完成10个任务' },
				{ emoji: '🔥', text: '连续专注3天' },
				{ emoji: '💡', text: '本周学习时长达5小时' }
			],
			pieChartAnimProgress: 0,
			lineChartAnimProgress: 0,
		};
	},
	
	computed: {
		// 完成率统计
		completionStats() {
			// 获取本周日期范围
			const weekRange = DateUtils.getWeekRange();
			
			// 过滤本周任务
			const weekTasks = DataProcessor.filterTasksByDateRange(
				this.tasks,
				weekRange.start,
				weekRange.end
			);
			
			// 计算完成率
			const weekCompletionRate = DataProcessor.calculateCompletionRate(weekTasks);
			
			// 获取今日任务
			const today = DateUtils.getTodayString();
			const todayTasks = this.tasks.filter(task => task.date === today);
			const todayCompletionRate = DataProcessor.calculateCompletionRate(todayTasks);
			
			return {
				week: weekCompletionRate,
				today: todayCompletionRate
			};
		},
		
		// 专注时间统计
		focusStats() {
			return DataProcessor.getFocusTimeStats(this.focusHistory);
		},
		
		// 任务类型分布
		taskTypeDistribution() {
			return DataProcessor.groupTasksByType(this.tasks);
		},
		workPercent() {
			const dist = this.taskTypeDistribution;
			const total = (dist.work?.total || 0) + (dist.study?.total || 0) + (dist.life?.total || 0);
			return total ? Math.round((dist.work?.total || 0) / total * 100) : 0;
		},
		studyPercent() {
			const dist = this.taskTypeDistribution;
			const total = (dist.work?.total || 0) + (dist.study?.total || 0) + (dist.life?.total || 0);
			return total ? Math.round((dist.study?.total || 0) / total * 100) : 0;
		},
		lifePercent() {
			const dist = this.taskTypeDistribution;
			const total = (dist.work?.total || 0) + (dist.study?.total || 0) + (dist.life?.total || 0);
			return total ? Math.round((dist.life?.total || 0) / total * 100) : 0;
		},
		
		// 今日成就：今日完成/今日总数
		todayAchievement() {
			const today = DateUtils.getTodayString();
			const todayTasks = this.tasks.filter(task => task.date === today);
			const todayCompleted = todayTasks.filter(task => task.completed).length;
			const todayTotal = todayTasks.length;
			return todayTotal > 0 ? `${todayCompleted}/${todayTotal}` : '0/0';
		},
		
		// 连续打卡天数（简化版：基于最近完成的任务日期）
		consecutiveDays() {
			if (!this.tasks || this.tasks.length === 0) return 0;
			
			// 获取所有已完成任务，按日期去重并排序
			const completedDates = [...new Set(
				this.tasks
					.filter(task => task.completed && task.date)
					.map(task => task.date)
			)].sort().reverse();
			
			if (completedDates.length === 0) return 0;
			
			// 计算连续天数（从今天往前计算）
			let consecutive = 0;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			for (let i = 0; i < 30; i++) { // 最多检查30天
				const checkDate = new Date(today);
				checkDate.setDate(today.getDate() - i);
				const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
				
				if (completedDates.includes(dateStr)) {
					consecutive++;
				} else if (i > 0) {
					// 如果今天没有完成任务，从昨天开始计算
					break;
				}
			}
			
			return consecutive;
		},
		
		// 成就点数（每个完成的任务10分）
		achievementPoints() {
			const completedCount = this.tasks.filter(task => task.completed).length;
			return completedCount * 10;
		},
		
		// 成就进度百分比（0-100%）
		achievementProgress() {
			const points = this.achievementPoints;
			// 青铜(0-500) -> 白银(500-1000) -> 黄金(1000+)
			// 这里显示从青铜到白银的进度
			if (points >= 1000) return 100;
			if (points <= 0) return 0;
			if (points <= 500) {
				return Math.round((points / 500) * 100);
			} else {
				return Math.round(((points - 500) / 500) * 100);
			}
		},
		
		// 已完成任务数（动态计算）
		completedTasksCount() {
			return this.tasks.filter(t => t.completed).length;
		},
		
		// 待完成任务数（动态计算）
		pendingTasksCount() {
			return this.tasks.filter(t => !t.completed).length;
		},
		
		// 完成率（动态计算）
		completionRatePercent() {
			if (!this.tasks || this.tasks.length === 0) return 0;
			return Math.round((this.completedTasksCount / this.tasks.length) * 100);
		},
	},
	
	onLoad() {
		this.loadData();
		this.updateDateRangeText();
		// 自动生成AI分析
		this.generateIntelligentReview();
		// 监听任务更新事件
		uni.$on('taskUpdated', this.handleTaskUpdate);
		// 监听专注历史更新事件
		uni.$on('focusHistoryUpdated', this.handleFocusHistoryUpdate);
	},
	
	onShow() {
		uni.setTabBarItem({
			index: 4, // 修正索引：数据页面是第5个（索引4）
			selected: true
		});
		
		uni.$emit('tabChange', 4);
		
		// 每次显示页面时刷新数据
		this.refreshData();
	},
	
	onUnload() {
		// 页面卸载时移除事件监听
		uni.$off('taskUpdated', this.handleTaskUpdate);
		uni.$off('focusHistoryUpdated', this.handleFocusHistoryUpdate);
	},
	
	mounted() {
		this.animatePieChart();
		this.animateLineChart();
	},
	
	watch: {
		tasks: {
			handler() {
				// 任务数据变化时重新绘制图表
				this.updateChartData();
				this.$nextTick(() => {
					this.animatePieChart();
					this.animateLineChart();
				});
			},
			deep: true
		},
		chartData: {
			handler() {
				this.animateLineChart();
			},
			deep: true
		},
		// 监听任务类型分布变化，重新绘制饼图
		taskTypeDistribution: {
			handler() {
				this.$nextTick(() => {
					this.animatePieChart();
				});
			},
			deep: true
		}
	},
	
	methods: {
		// 加载数据
		loadData() {
			this.isLoading = true;
			
			try {
				// 直接从存储读取任务数据，兼容不同的存储格式
				let tasksData = uni.getStorageSync(STORAGE_KEYS.TASKS);
				if (!tasksData) {
					this.tasks = [];
				} else if (typeof tasksData === 'string') {
					try {
						this.tasks = JSON.parse(tasksData);
						if (!Array.isArray(this.tasks)) {
							this.tasks = [];
						}
					} catch (e) {
						console.error('解析任务数据失败:', e);
						this.tasks = [];
					}
				} else if (Array.isArray(tasksData)) {
					this.tasks = tasksData;
				} else {
					this.tasks = [];
				}
				
				// 读取专注历史数据
				let focusData = uni.getStorageSync(STORAGE_KEYS.FOCUS_HISTORY);
				if (!focusData) {
					this.focusHistory = [];
				} else if (typeof focusData === 'string') {
					try {
						this.focusHistory = JSON.parse(focusData);
						if (!Array.isArray(this.focusHistory)) {
							this.focusHistory = [];
						}
					} catch (e) {
						console.error('解析专注历史数据失败:', e);
						this.focusHistory = [];
					}
				} else if (Array.isArray(focusData)) {
					this.focusHistory = focusData;
				} else {
					this.focusHistory = [];
				}
				
				// 更新图表数据
				this.updateChartData();
				// 注意：统计卡片已改为计算属性，会自动更新
			} catch (e) {
				console.error('加载数据失败:', e);
				this.tasks = [];
				this.focusHistory = [];
			} finally {
				this.isLoading = false;
			}
		},
		
		// 刷新数据
		refreshData() {
			this.loadData();
			// 数据更新后重新绘制图表
			this.$nextTick(() => {
				this.animatePieChart();
				this.animateLineChart();
			});
		},
		
		// 处理任务更新事件
		handleTaskUpdate() {
			// 实时刷新任务数据
			this.refreshData();
		},
		
		// 处理专注历史更新事件
		handleFocusHistoryUpdate() {
			// 实时刷新专注历史数据
			this.refreshData();
		},
		
		// 更新日期范围文本
		updateDateRangeText() {
			const weekRange = DateUtils.getWeekRange();
			this.dateRangeText = DateUtils.formatDateRange(weekRange.start, weekRange.end);
		},
		
		// 更新图表数据
		updateChartData() {
			// 生成图表数据
			const weekRange = DateUtils.getWeekRange();
			const weekTasks = DataProcessor.filterTasksByDateRange(
				this.tasks,
				weekRange.start,
				weekRange.end
			);
			
			// 按日期分组统计完成率
			const dailyStats = {};
			const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			
			// 初始化每天的数据
			for (let i = 0; i < 7; i++) {
				const date = new Date(weekRange.start);
				date.setDate(weekRange.start.getDate() + i);
				const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
				
				dailyStats[dayKey] = {
					day: days[date.getDay()],
					total: 0,
					completed: 0,
					rate: 0
				};
			}
			
			// 统计每天的任务完成情况
			weekTasks.forEach(task => {
				// 兼容date和dueDate字段
				const dayKey = task.date || task.dueDate;
				if (dayKey && dailyStats[dayKey]) {
					dailyStats[dayKey].total++;
					if (task.completed) {
						dailyStats[dayKey].completed++;
					}
				}
			});
			
			// 计算每天的完成率
			Object.keys(dailyStats).forEach(key => {
				const stat = dailyStats[key];
				stat.rate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
			});
			
			this.chartData = {
				labels: Object.values(dailyStats).map(stat => stat.day),
				datasets: [
					{
						label: '任务完成率',
						data: Object.values(dailyStats).map(stat => stat.rate),
						backgroundColor: CHART_CONFIG.COLORS.SECONDARY,
						borderColor: CHART_CONFIG.COLORS.PRIMARY,
						borderWidth: 1
					}
				]
			};
			// 注意：统计卡片已改为计算属性，不需要在这里赋值
		},
		
		// 切换时间范围
		switchTimeRange(range) {
			if (this.currentTimeRange === range) return;
			
			this.currentTimeRange = range;
			this.updateDateRangeText();
			this.updateChartData();
		},
		
		// 切换图表类型
		switchChartType(type) {
			if (this.chartType === type) return;
			
			this.chartType = type;
			this.updateChartData();
		},
		
		// 兼容requestAnimationFrame
		raf(callback) {
			if (typeof requestAnimationFrame !== 'undefined') {
				return requestAnimationFrame(callback);
			} else {
				// 使用setTimeout替代，约60fps
				return setTimeout(callback, 16);
			}
		},
		
		animatePieChart() {
			this.pieChartAnimProgress = 0;
			const step = () => {
				if (this.pieChartAnimProgress < 1) {
					this.pieChartAnimProgress += 0.02; // 减小步进值，使动画更慢
					this.drawPieChart(this.pieChartAnimProgress);
					this.raf(step);
				} else {
					this.drawPieChart(1);
				}
			};
			step();
		},
		
		animateLineChart() {
			this.lineChartAnimProgress = 0;
			const step = () => {
				if (this.lineChartAnimProgress < 1) {
					this.lineChartAnimProgress += 0.05;
					this.drawLineChart(this.lineChartAnimProgress);
					this.raf(step);
				} else {
					this.drawLineChart(1);
				}
			};
			step();
		},
		
		drawPieChart(progress = 1) {
			const ctx = uni.createCanvasContext('pieChart', this);
			const tasks = this.tasks;
			const dist = this.taskTypeDistribution;
			const total = tasks.length;
			
			// 饼图Canvas尺寸（360rpx，适配手机屏幕）
			// 为兼容性，使用固定像素值，CSS中的rpx会自动适配显示
			const canvasWidth = 180;
			const canvasHeight = 180;
			
			// 清空画布
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			
			// 设置饼图的中心点和半径
			const centerX = canvasWidth / 2;
			const centerY = canvasHeight / 2;
			const pieRadius = 70; // 减小饼图半径以适配缩小后的画布
			
			// 如果没有数据，绘制一个灰色的空圆作为占位
			if (total === 0) {
				ctx.beginPath();
				ctx.arc(centerX, centerY, pieRadius, 0, 2 * Math.PI);
				ctx.setFillStyle('#f0f0f0'); // 浅灰色背景
				ctx.fill();
				
				// 绘制一个稍小的圆作为内圈
				ctx.beginPath();
				ctx.arc(centerX, centerY, pieRadius - 20, 0, 2 * Math.PI);
				ctx.setFillStyle('#ffffff'); // 白色内圈
				ctx.fill();
				
				// 显示提示文字
				ctx.setFontSize(16);
				ctx.setFillStyle('#999999');
				ctx.setTextAlign('center');
				ctx.setTextBaseline('middle');
				ctx.fillText('暂无数据', centerX, centerY);
				ctx.draw();
				return;
			}
			
			// 设置颜色
			const colors = [
				{from: '#5C7CFA', to: '#82A0FF'},  // 工作(蓝色)
				{from: '#51CF66', to: '#69DB7C'},  // 学习(绿色)
				{from: '#FFD43B', to: '#FFE066'}   // 生活(黄色)
			];
			const values = [dist.work?.total || 0, dist.study?.total || 0, dist.life?.total || 0];
			let startAngle = -Math.PI / 2 + 2 * Math.PI * (1 - progress);
			
			for (let i = 0; i < values.length; i++) {
				const angle = (values[i] / total) * 2 * Math.PI * progress;
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, pieRadius, startAngle, startAngle + angle);
				ctx.closePath();
				// 扇形渐变
				const grad = ctx.createLinearGradient(centerX, centerY - pieRadius, centerX, centerY + pieRadius);
				grad.addColorStop(0, colors[i].from);
				grad.addColorStop(1, colors[i].to);
				ctx.setFillStyle(grad);
				ctx.shadowColor = 'rgba(134,114,248,0.10)';
				ctx.shadowBlur = 8;
				ctx.fill();
				ctx.restore();
				// 扇形边框
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, pieRadius, startAngle, startAngle + angle);
				ctx.closePath();
				ctx.setLineWidth(2);
				ctx.setStrokeStyle('#fff');
				ctx.stroke();
				ctx.restore();
				// 百分比指向 - 改为外侧显示并添加指向线
				const percent = total ? Math.round(values[i] / total * 100) : 0;
				const midAngle = startAngle + angle / 2;
				
				// 优化标签位置，避免重叠和超出边界
				let labelX, labelY;
				const labelRadius = 85; // 统一标签距离
				
				// 计算标签位置
				labelX = centerX + Math.cos(midAngle) * labelRadius;
				labelY = centerY + Math.sin(midAngle) * labelRadius;
				
				// 确保标签在画布范围内，留出足够边距
				const margin = 30;
				labelX = Math.max(margin, Math.min(canvasWidth - margin, labelX));
				labelY = Math.max(margin, Math.min(canvasHeight - margin, labelY));
				
				// 如果百分比为0，不显示标签
				if (percent === 0) {
					startAngle += angle;
					continue;
				}
				
				// 计算指向线的起点和终点（统一处理）
				const startX = centerX + Math.cos(midAngle) * pieRadius;
				const startY = centerY + Math.sin(midAngle) * pieRadius;
				const endX = labelX;
				const endY = labelY;
				
				// 绘制指向线（只在百分比大于0时绘制）
				if (percent > 0) {
					ctx.beginPath();
					ctx.moveTo(startX, startY);
					ctx.lineTo(endX, endY);
					ctx.setStrokeStyle(colors[i].from);
					ctx.setLineWidth(1.5);
					ctx.stroke();
				}
				
				// 文字底色（增大背景圆，确保文字可见）
				ctx.beginPath();
				ctx.arc(labelX, labelY, 20, 0, 2 * Math.PI);
				ctx.setFillStyle('rgba(255,255,255,0.98)');
				ctx.setShadow(0, 0, 4, 'rgba(0,0,0,0.15)');
				ctx.fill();
				ctx.setShadow(0, 0, 0, 'transparent');
				
				// 文字（增大字体，确保可见）
				ctx.setFontSize(18);
				ctx.setFillStyle(colors[i].from);
				ctx.setTextAlign('center');
				ctx.setTextBaseline('middle');
				ctx.fillText(percent + '%', labelX, labelY);
				startAngle += angle;
			}
			ctx.draw();
		},
		
		drawLineChart(progress = 1) {
			const ctx = uni.createCanvasContext('lineChart', this);
			// 使用动态数据，如果没有则使用空数组
			const chartData = this.chartData && this.chartData.datasets && this.chartData.datasets[0] 
				? this.chartData.datasets[0].data 
				: [0, 0, 0, 0, 0, 0, 0];
			const labels = this.chartData && this.chartData.labels 
				? this.chartData.labels 
				: ['周一','周二','周三','周四','周五','周六','周日'];
			const data = chartData;
			
			// 折线图Canvas尺寸（660rpx max-width，实际按设备宽度，这里使用固定值适配）
			// 为兼容性，使用固定像素值，CSS中的rpx会自动适配显示
			const canvasWidth = 330;
			const canvasHeight = 200;
			
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			
			// 计算绘图区域
			const paddingLeft = 60;
			const paddingRight = 20;
			const paddingTop = 30;
			const paddingBottom = 40;
			const chartWidth = canvasWidth - paddingLeft - paddingRight;
			const chartHeight = canvasHeight - paddingTop - paddingBottom;
			const chartStartX = paddingLeft;
			const chartStartY = paddingTop;
			const chartEndX = canvasWidth - paddingRight;
			const chartEndY = canvasHeight - paddingBottom;
			
			// y轴
			ctx.setStrokeStyle('#666');
			ctx.setLineWidth(1);
			ctx.beginPath();
			ctx.moveTo(chartStartX, chartStartY); 
			ctx.lineTo(chartStartX, chartEndY); 
			ctx.lineTo(chartEndX, chartEndY); 
			ctx.stroke();
			// y轴刻度
			ctx.setFontSize(14);
			ctx.setFillStyle('#333');
			for (let i = 0; i <= 5; i++) {
				const y = chartEndY - i * (chartHeight / 5); 
				ctx.fillText(i * 20 + '%', 18, y + 6);
				ctx.beginPath();
				ctx.moveTo(chartStartX, y);
				ctx.lineTo(chartEndX, y);
				ctx.setStrokeStyle('#f4f2ff');
				ctx.setLineWidth(1);
				ctx.stroke();
			}
			// 折线
			const max = 100;
			const min = 0;
			const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth; 
			ctx.setStrokeStyle('#333');
			ctx.setLineWidth(2);
			ctx.beginPath();
			for (let i = 0; i < data.length * progress; i++) {
				const x = chartStartX + i * stepX;
				const y = chartEndY - ((data[i] - min) / (max - min)) * chartHeight;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			
			ctx.stroke();
			// 数据点
			for (let i = 0; i < data.length * progress; i++) {
				const x = chartStartX + i * stepX;
				const y = chartEndY - ((data[i] - min) / (max - min)) * chartHeight; 
				ctx.beginPath();
				ctx.arc(x, y, 5, 0, 2 * Math.PI); 
				ctx.setFillStyle('#fff');
				
				ctx.fill();
				ctx.setLineWidth(2);
				ctx.setStrokeStyle('#333');
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(x, y, 2.5, 0, 2 * Math.PI); 
				ctx.setFillStyle('#333');
				ctx.fill();
				// 百分比（增大字体，确保可见，调整位置避免重叠）
				ctx.setFontSize(14); 
				ctx.setFillStyle('#333');
				ctx.setTextAlign('center');
				ctx.setTextBaseline('bottom');
				// 根据数据点位置调整标签位置，避免重叠
				const labelOffsetY = y < chartStartY + 30 ? 15 : -12;
				ctx.fillText(data[i] + '%', x, y + labelOffsetY);
			}
			// x轴标签
			ctx.setFontSize(12); 
			ctx.setFillStyle('#666');
			for (let i = 0; i < labels.length; i++) {
				const x = chartStartX + i * stepX;
				ctx.fillText(labels[i], x, chartEndY + 20);
			}
			// 绘制x轴
			ctx.beginPath();
			ctx.setStrokeStyle('#ddd');
			ctx.setLineWidth(1);
			ctx.moveTo(chartStartX, chartEndY);
			ctx.lineTo(chartEndX, chartEndY);
			ctx.stroke();
			ctx.draw();
		},
		
		// 处理"更多"和"详情"点击的方法
		handleMoreClick() {
			uni.showToast({
				title: '功能开发中，敬请期待',
				icon: 'none',
				duration: 2000
			});
		},
		
		// 生成AI智能复盘和逾期预测
		async generateIntelligentReview() {
			this.aiReviewLoading = true;
			
			try {
				const aiService = require('@/utils/aiService.js').default;
				
				// 准备历史数据
				const historyData = {
					tasks: this.tasks,
					focusHistory: this.focusHistory,
					completionRate: this.completionRate,
					taskTypeDistribution: this.taskTypeDistribution,
					completedTasks: this.completedTasks,
					pendingTasks: this.pendingTasks
				};
				
				// 并行请求AI复盘和逾期预测
				const [reviewResult, predictionResult] = await Promise.all([
					aiService.intelligentReview(historyData),
					aiService.predictOverdue(this.tasks)
				]);
				
				// 处理复盘结果
				if (reviewResult) {
					if (typeof reviewResult === 'string') {
						this.aiReview = { text: reviewResult };
					} else if (reviewResult.text) {
						this.aiReview = reviewResult;
					} else {
						this.aiReview = { text: JSON.stringify(reviewResult) };
					}
				}
				
				// 处理预测结果
				if (predictionResult) {
					if (predictionResult.risks) {
						this.overduePrediction = predictionResult;
					} else if (typeof predictionResult === 'string') {
						this.overduePrediction = { risks: [{ task: '未知', reason: predictionResult }] };
					} else {
						this.overduePrediction = predictionResult;
					}
				}
				
				uni.showToast({
					title: 'AI分析完成',
					icon: 'success'
				});
			} catch (error) {
				console.error('生成AI复盘失败:', error);
				uni.showToast({
					title: '分析失败，请重试',
					icon: 'none'
				});
			} finally {
				this.aiReviewLoading = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	position: relative;
	height: 100vh;
	background-color: #ffffff;
	padding-top: env(safe-area-inset-top);
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: border-box;
}

/* 标题区域 */
.header {
	padding: calc(80rpx + env(safe-area-inset-top)) 40rpx 50rpx !important;
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
	background-color: #342d59 !important;
}

.title {
	font-size: 46rpx !important;
	font-weight: bold !important;
	color: #ffffff !important;
	text-align: center !important;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
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

/* 滚动视图样式 */
.scroll-view-vertical {
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	padding: 30rpx 20rpx 30rpx 30rpx;
	padding-right: 15rpx;
	-webkit-overflow-scrolling: touch;
	overflow-y: scroll !important;
}

/* 修改滚动条样式 */
.scroll-view-vertical::-webkit-scrollbar {
	width: 8rpx;
	background-color: transparent;
	display: block !important;
}

.scroll-view-vertical::-webkit-scrollbar-thumb {
	background-color: rgba(134, 114, 248, 0.7);
	border-radius: 10rpx;
}

.scroll-view-vertical::-webkit-scrollbar-track {
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 10rpx;
}

/* 统计卡片区 */
.stats-cards-new {
	display: flex;
	justify-content: space-between;
	margin-bottom: 30rpx;
	gap: 24rpx;
}
.stat-card-new {
	flex: 1;
	display: flex;
	align-items: center;
	background: linear-gradient(120deg, #f4f2ff 0%, #e9e4ff 100%);
	border-radius: 22rpx;
	box-shadow: 0 4rpx 16rpx rgba(134,114,248,0.08);
	padding: 28rpx 20rpx;
	min-width: 0;
	transition: box-shadow 0.2s;
}
.stat-card-new.completed { border-left: 8rpx solid #6A1B9A; }
.stat-card-new.pending { border-left: 8rpx solid #FFC107; }
.stat-card-new.rate { border-left: 8rpx solid #34a853; }
.stat-icon {
	font-size: 44rpx;
	margin-right: 18rpx;
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border-radius: 50%;
	box-shadow: 0 2rpx 8rpx rgba(134,114,248,0.08);
}
.stat-info {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}
.stat-value {
	font-size: 38rpx;
	font-weight: bold;
	color: #342d59;
	margin-bottom: 6rpx;
}
.stat-label {
	font-size: 22rpx;
	color: #8672f8;
}
.stat-unit {
	font-size: 20rpx;
	color: #b3a6e2;
	margin-left: 2rpx;
}

/* 图表容器 */
.chart-container {
	background-color: #f9f9f9;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 20rpx;
	display: block;
}

.chart-body {
	height: 400rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

/* 饼图Canvas适配 */
.pie-canvas {
	width: 360rpx !important;
	height: 360rpx !important;
	margin: 0 auto;
	display: block;
}

/* 折线图Canvas适配 */
.line-canvas {
	width: 100% !important;
	max-width: 660rpx;
	height: 400rpx !important;
	margin: 0 auto;
	display: block;
	border-radius: 18rpx;
	box-shadow: 0 4rpx 16rpx rgba(134,114,248,0.10);
	background: #fff;
}

/* 饼图样式 */
.pie-chart {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	background-color: #f0f0f0;
	overflow: hidden;
}

.pie-segment {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transform-origin: 50% 50%;
	--segment-size: 33%;
}

.pie-segment.work {
	background-color: #4285f4;
	clip-path: polygon(50% 50%, 50% 0, calc(50% + 50% * var(--segment-size) / 100) 0, 100% 0, 100% 100%, 50% 100%);
}

.pie-segment.study {
	background-color: #34a853;
	clip-path: polygon(50% 50%, 50% 0, calc(50% + 50% * var(--segment-size) / 100) 0, 100% 0, 100% 100%, 50% 100%);
}

.pie-segment.life {
	background-color: #fbbc05;
	clip-path: polygon(50% 50%, 50% 0, calc(50% + 50% * var(--segment-size) / 100) 0, 100% 0, 100% 100%, 50% 100%);
}

.chart-legend {
	margin-left: 40rpx;
}

.legend-item {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.legend-color {
	width: 20rpx;
	height: 20rpx;
	border-radius: 4rpx;
	margin-right: 10rpx;
}

.legend-color.work {
	background-color: #4285f4;
}

.legend-color.study {
	background-color: #34a853;
}

.legend-color.life {
	background-color: #fbbc05;
}

.legend-text {
	font-size: 24rpx;
	color: #666666;
}

/* 趋势图样式 */
.trend-chart {
	position: relative;
	width: 100%;
	height: 300rpx;
}

.trend-line {
	position: absolute;
	bottom: 40rpx;
	left: 0;
	right: 0;
	height: 200rpx;
}

.trend-point {
	position: absolute;
	width: 12rpx;
	height: 12rpx;
	background-color: #8672f8;
	border-radius: 50%;
	transform: translate(-50%, 50%);
	z-index: 2;
}

.trend-line-segment {
	position: absolute;
	background-color: #8672f8;
	height: 2rpx;
	z-index: 1;
}

.trend-labels {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 40rpx;
	display: flex;
}

.trend-label {
	position: absolute;
	font-size: 22rpx;
	color: #999999;
	transform: translateX(-50%);
}

/* 柱状图样式 */
.bar-chart {
	width: 100%;
	height: 300rpx;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}

.bar-container {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding: 0 20rpx;
}

.bar-item {
	flex: 1;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
}

.bar-column {
	width: 40rpx;
	background: linear-gradient(to top, #8672f8, #a992ff);
	border-radius: 10rpx 10rpx 0 0;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 10rpx;
	box-shadow: 0 4rpx 8rpx rgba(134, 114, 248, 0.2);
}

.bar-value {
	color: #ffffff;
	font-size: 20rpx;
	font-weight: bold;
}

.bar-label {
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #666666;
}

.content-spacer {
	height: 150rpx;
	width: 100%;
}

.animate-fade-in {
	animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1);
}
@keyframes fadeIn {
	from { opacity: 0; transform: translateY(30px); }
	to { opacity: 1; transform: translateY(0); }
}
.animate-pop-in {
	animation: popIn 0.7s cubic-bezier(0.4,0,0.2,1);
}
@keyframes popIn {
	0% { transform: scale(0.7); opacity: 0; }
	80% { transform: scale(1.08); opacity: 1; }
	100% { transform: scale(1); opacity: 1; }
}
.animate-sparkle-soft {
	animation: sparkleSoft 2.2s infinite linear alternate;
}
@keyframes sparkleSoft {
	0%, 100% { filter: brightness(1); box-shadow: 0 0 0 #fff; }
	50% { filter: brightness(1.12) drop-shadow(0 0 12px #b39ddb); box-shadow: 0 0 18px #b39ddb; }
}
.animate-sparkle-gold {
	animation: sparkleGold 2.8s infinite linear alternate;
}
@keyframes sparkleGold {
	0%, 100% { filter: brightness(1); box-shadow: 0 0 0 #ffd700; }
	50% { filter: brightness(1.18) drop-shadow(0 0 24px #ffe066); box-shadow: 0 0 32px #ffe066; }
}
.advice-container {
	background: linear-gradient(90deg, #f4f2ff 0%, #e9e4ff 100%);
	border-radius: 18rpx;
	box-shadow: 0 2rpx 8rpx rgba(134,114,248,0.08);
	margin-bottom: 30rpx;
	padding: 28rpx 32rpx;
}
.advice-flex {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 18rpx;
}
.advice-icon {
	font-size: 44rpx;
	margin-top: 6rpx;
}
.advice-main {
	display: flex;
	flex-direction: column;
}
.advice-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #8672f8;
	margin-bottom: 10rpx;
}
.advice-content {
	font-size: 26rpx;
	color: #333;
}
.achievement-container {
	background: linear-gradient(90deg, #f4f2ff 0%, #e9e4ff 100%);
	border-radius: 18rpx;
	box-shadow: 0 2rpx 8rpx rgba(134,114,248,0.08);
	margin-bottom: 30rpx;
	padding: 28rpx 32rpx;
}
.achievement-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #8672f8;
	margin-bottom: 12rpx;
}
.achievement-list-vertical {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.achievement-item {
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 18rpx rgba(255, 215, 0, 0.18), 0 2rpx 8rpx rgba(134,114,248,0.06);
	padding: 32rpx 32rpx;
	min-width: 180rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 28rpx;
	position: relative;
}
.achievement-emoji {
	font-size: 48rpx;
}
.big-achievement-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}
.soft-bg {
	background: linear-gradient(120deg, #f4f2ff 0%, #e9e4ff 100%);
	box-shadow: 0 4rpx 16rpx rgba(134,114,248,0.06);
}
.pie-center-info {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	pointer-events: none;
}
.pie-center-value {
	font-size: 38rpx;
	font-weight: bold;
	color: #6A1B9A;
}
.pie-center-label {
	font-size: 22rpx;
	color: #8672f8;
}
.vertical-legend {
	display: flex;
	flex-direction: column;
	margin-left: 32rpx;
}
.achievement-list-vertical {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}
.achievement-item {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(134,114,248,0.06);
	padding: 18rpx 20rpx;
	min-width: 120rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 18rpx;
}
.achievement-emoji {
	font-size: 32rpx;
}
.achievement-text {
	font-size: 22rpx;
	color: #333;
}
.big-title {
	font-size: 64rpx !important;
	font-weight: 900;
	letter-spacing: 2rpx;
}
.analysis-container {
	background: #f7f5ff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(134,114,248,0.10);
	margin-bottom: 36rpx;
	padding: 38rpx 40rpx;
}
.analysis-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 18rpx;
}
.analysis-title {
	font-size: 38rpx;
	font-weight: bold;
	color: #4F3C8C;
}
.analysis-more {
	font-size: 32rpx;
	color: #666;
	font-weight: bold;
	cursor: pointer;
}

.ai-refresh-btn {
	background: linear-gradient(90deg, #4a90e2, #8672f8);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	padding: 8rpx 16rpx;
	font-size: 24rpx;
}

.analysis-loading {
	padding: 40rpx;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}

.risk-item {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #ff6b6b;
}
.analysis-list {
	display: flex;
	flex-direction: column;
	gap: 28rpx;
}
.analysis-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 24rpx;
}
.analysis-icon {
	font-size: 48rpx;
	margin-top: 2rpx;
}
.analysis-main-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #4F3C8C;
	margin-bottom: 12rpx;
	display: block;
}

.analysis-desc-wrapper {
	margin-top: 12rpx;
	display: block;
}

.analysis-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	display: block;
	white-space: pre-wrap;
}
.achievement-system {
	background: #f7f5ff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(134,114,248,0.10);
	margin-bottom: 36rpx;
	padding: 38rpx 40rpx;
}
.achievement-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 18rpx;
}
.achievement-title {
	font-size: 38rpx;
	font-weight: bold;
	color: #4F3C8C;
}
.achievement-more {
	font-size: 32rpx;
	color: #666;
	font-weight: bold;
	cursor: pointer;
}
.achievement-stats {
	display: flex;
	flex-direction: row;
	justify-content: space-around; 
	gap: 16rpx; 
	margin-bottom: 24rpx;
	background: rgba(255,255,255,0.5);
	border-radius: 16rpx;
	padding: 16rpx;
}
.achievement-stat {
	flex: 1; 
	display: flex;
	flex-direction: column; 
	align-items: center; 
	justify-content: center;
	gap: 12rpx;
	transition: all 0.3s ease;
	padding: 16rpx 12rpx;
	border-radius: 16rpx;
	text-align: center;
}
.achievement-stat:hover, .achievement-stat:active {
	background-color: rgba(255,255,255,0.6);
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 16rpx rgba(134,114,248,0.15);
}
.achievement-stat-icon {
	font-size: 48rpx;
	margin-bottom: 8rpx; 
}
.progress-active {
	color: #4F8CFF;
	font-weight: bold;
}
.achievement-motivational {
	text-align: center;
	margin-top: 16rpx;
	animation: fadeIn 1s ease-in-out;
}
.motivational-text {
	font-size: 26rpx;
	color: #666;
	background: rgba(255,255,255,0.6);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}
.progress-bar-bg {
	flex: 1;
	height: 22rpx;
	background: #e0d7fa;
	border-radius: 12rpx;
	margin: 0 12rpx;
	position: relative;
}
.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #a992ff 0%, #4F8CFF 100%);
	border-radius: 12rpx;
	animation: progressPulse 2s infinite alternate ease-in-out;
}
@keyframes iconPulse {
	0% { transform: scale(1); }
	100% { transform: scale(1.1); }
}
@keyframes fadeIn {
	0% { opacity: 0; transform: translateY(10rpx); }
	100% { opacity: 1; transform: translateY(0); }
}
@keyframes progressPulse {
	0% { background-position: 0% 50%; }
	100% { background-position: 100% 50%; }
}
.pie-total-info {
	display: flex;
	flex-direction: row;
	align-items: baseline;
	justify-content: center;
	margin-top: 18rpx;
	gap: 12rpx;
	background: #fff;
	padding: 12rpx 30rpx;
	border-radius: 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	display: inline-flex;
	position: relative;
	margin-top: 20rpx;
	margin-left: 180rpx; 
}
.pie-total-value {
	font-size: 38rpx;
	font-weight: bold;
	color: #333;
}
.pie-total-label {
	font-size: 24rpx;
	color: #666;
}
.achievement-stat-animated {
	transition: all 0.3s ease;
}
.achievement-stat-animated:active {
	transform: scale(1.05);
}
.achievement-icon-pulse {
	animation: iconPulse 2s infinite alternate ease-in-out;
}
.achievement-icon-flame {
	animation: iconFlame 1.5s infinite alternate ease-in-out;
}
.achievement-icon-spin {
	animation: iconSpin 6s infinite linear;
}
.progress-label-active {
	font-size: 24rpx;
	color: #4F8CFF;
	font-weight: bold;
}
.progress-bar-animated {
	background-size: 200% 200%;
	animation: progressPulse 2s infinite alternate ease-in-out;
}
.achievement-motivational {
	text-align: center;
	margin-top: 12rpx;
	animation: fadeIn 1s ease-in-out;
}
.motivational-text {
	font-size: 26rpx;
	color: #666;
	background: rgba(255,255,255,0.6);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}
@keyframes iconPulse {
	0% { transform: scale(1); }
	100% { transform: scale(1.1); }
}
@keyframes iconFlame {
	0% { transform: translateY(0); }
	100% { transform: translateY(-3rpx); }
}
@keyframes iconSpin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
	0% { opacity: 0; transform: translateY(10rpx); }
	100% { opacity: 1; transform: translateY(0); }
}
@keyframes progressPulse {
	0% { background-position: 0% 50%; }
	100% { background-position: 100% 50%; }
}
.achievement-stat-main {
	display: flex;
	flex-direction: column;
	align-items: center; 
}
.achievement-stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #4F3C8C;
}
.achievement-stat-label {
	font-size: 24rpx;
	color: #888;
}
.achievement-progress {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 18rpx;
	margin-top: 12rpx;
	background: rgba(255,255,255,0.5); 
	border-radius: 16rpx;
	padding: 16rpx;
}
.progress-label {
	font-size: 24rpx;
	color: #888;
}
.progress-value {
	font-size: 24rpx;
	color: #a992ff;
}
</style> 
</style> 