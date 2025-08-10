<template>
  <div class="qr-code-display">
    <div class="qr-container" :class="{ 'with-border': showBorder }">
      <div class="qr-header" v-if="title">
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="qr-code-wrapper">
        <div class="qr-loading" v-if="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>生成中...</p>
        </div>
        
        <div class="qr-code" v-else-if="qrCodeData">
          <img :src="qrCodeData" :alt="alt || '二维码'" />
        </div>
        
        <div class="qr-error" v-else-if="error">
          <el-icon><Warning /></el-icon>
          <p>{{ error }}</p>
          <el-button size="small" @click="$emit('retry')" v-if="showRetry">重新生成</el-button>
        </div>
      </div>
      
      <div class="qr-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
      
      <div class="qr-tips" v-if="tips">
        <p>{{ tips }}</p>
      </div>
      
      <!-- 倒计时显示 -->
      <div class="qr-countdown" v-if="countdown > 0">
        <el-icon><Clock /></el-icon>
        <span>{{ countdownText }}：{{ formatTime(countdown) }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="qr-actions" v-if="showActions">
        <el-button 
          type="primary" 
          size="small" 
          @click="$emit('refresh')"
          :loading="refreshing"
        >
          刷新状态
        </el-button>
        <el-button 
          size="small" 
          @click="$emit('cancel')"
        >
          取消支付
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Loading, Warning, Clock } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  // 二维码数据（base64 或 URL）
  qrCodeData: {
    type: String,
    default: ''
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 提示文字
  tips: {
    type: String,
    default: '请使用手机扫描二维码'
  },
  // 图片alt属性
  alt: {
    type: String,
    default: '二维码'
  },
  // 是否显示边框
  showBorder: {
    type: Boolean,
    default: true
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: false
  },
  // 是否显示重试按钮
  showRetry: {
    type: Boolean,
    default: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 刷新状态
  refreshing: {
    type: Boolean,
    default: false
  },
  // 错误信息
  error: {
    type: String,
    default: ''
  },
  // 倒计时（秒）
  countdown: {
    type: Number,
    default: 0
  },
  // 倒计时文字
  countdownText: {
    type: String,
    default: '剩余时间'
  },
  // 二维码尺寸
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
})

// Events
defineEmits(['refresh', 'cancel', 'retry'])

// 计算属性
const qrSize = computed(() => {
  const sizes = {
    small: '150px',
    medium: '200px', 
    large: '250px'
  }
  return sizes[props.size] || sizes.medium
})

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.qr-code-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  max-width: 350px;
  
  &.with-border {
    border: 1px solid var(--el-border-color-light);
    box-shadow: var(--el-box-shadow-light);
  }
}

.qr-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 8px 0;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.qr-code-wrapper {
  margin-bottom: 16px;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: v-bind(qrSize);
  color: var(--el-text-color-secondary);
  
  .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}

.qr-code {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: inline-block;
  border: 1px solid var(--el-border-color-lighter);
  
  img {
    width: v-bind(qrSize);
    height: v-bind(qrSize);
    display: block;
  }
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: v-bind(qrSize);
  color: var(--el-color-danger);
  
  .el-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  p {
    margin: 0 0 12px 0;
    font-size: 14px;
  }
}

.qr-footer {
  margin-bottom: 16px;
}

.qr-tips {
  margin-bottom: 16px;
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.qr-countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--el-color-warning);
  font-weight: 600;
  
  .el-icon {
    margin-right: 8px;
  }
}

.qr-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  
  .el-button {
    min-width: 80px;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .qr-container {
    padding: 16px;
    margin: 0 16px;
    max-width: none;
  }
  
  .qr-code img,
  .qr-loading,
  .qr-error {
    width: 160px !important;
    height: 160px !important;
  }
  
  .qr-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}

// 动画效果
.qr-code {
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: var(--el-box-shadow);
  }
}

.qr-loading .el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>