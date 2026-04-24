<template>
  <view class="task-item" @click="onClick">
    <view class="task-main">
      <text :class="['task-title', completed ? 'completed' : '']">{{ title }}</text>
    </view>
    <view class="task-actions">
      <button class="delete-btn" @click.stop="onDelete">删除</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TaskItem',
  props: {
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit('click');
    },
    onDelete() {
      this.$emit('delete');
    }
  }
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(52,45,89,0.08);
  padding: 32rpx 28rpx;
  margin-bottom: 20rpx;
}
.task-title {
  font-size: 32rpx;
  color: #2c3e50;
}
.task-title.completed {
  text-decoration: line-through;
  color: #b2bec3;
}
.delete-btn {
  background: #fa5252;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
}
</style> 