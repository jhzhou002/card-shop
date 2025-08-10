<template>
  <div class="payment-status" :class="`status-${status}`">
    <div class="status-icon">
      <el-icon size="48">
        <Loading v-if="status === 'pending'" class="is-loading" />
        <CircleCheck v-else-if="status === 'paid'" />
        <CircleClose v-else-if="status === 'failed'" />
        <Clock v-else-if="status === 'expired'" />
        <Warning v-else-if="status === 'cancelled'" />
        <QuestionFilled v-else />
      </el-icon>
    </div>
    
    <div class="status-content">
      <h3>{{ statusTitle }}</h3>
      <p>{{ statusDescription }}</p>
      
      <!-- 支付详情 -->
      <div class="payment-details" v-if="paymentInfo">
        <div class="detail-item" v-if="paymentInfo.payment_no">
          <span class="label">支付单号：</span>
          <span class="value">{{ paymentInfo.payment_no }}</span>
        </div>
        <div class="detail-item" v-if="paymentInfo.amount">
          <span class="label">支付金额：</span>
          <span class="value amount">￥{{ paymentInfo.amount }}</span>
        </div>
        <div class="detail-item" v-if="paymentInfo.created_at">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatTime(paymentInfo.created_at) }}</span>
        </div>
        <div class="detail-item" v-if="paymentInfo.paid_at && status === 'paid'">
          <span class="label">支付时间：</span>
          <span class="value">{{ formatTime(paymentInfo.paid_at) }}</span>
        </div>
      </div>
      
      <!-- 倒计时 -->
      <div class="countdown" v-if="countdown > 0 && status === 'pending'">
        <el-icon><Clock /></el-icon>
        <span>支付剩余时间：{{ formatCountdown(countdown) }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="status-actions" v-if="showActions">
        <template v-if="status === 'pending'">
          <el-button 
            type="primary" 
            @click="$emit('check-status')"
            :loading="checking"
          >
            查询支付状态
          </el-button>
          <el-button @click="$emit('cancel-payment')">
            取消支付
          </el-button>
        </template>
        
        <template v-else-if="status === 'paid'">
          <el-button type="success" @click="$emit('view-order')">
            查看订单
          </el-button>
          <el-button @click="$emit('continue-shopping')">
            继续购物
          </el-button>
        </template>
        
        <template v-else-if="status === 'failed' || status === 'expired'">
          <el-button type="primary" @click="$emit('retry-payment')">
            重新支付
          </el-button>
          <el-button @click="$emit('back-to-order')">
            返回订单
          </el-button>
        </template>
        
        <template v-else-if="status === 'cancelled'">
          <el-button type="primary" @click="$emit('create-payment')">
            重新创建支付
          </el-button>
          <el-button @click="$emit('back-to-order')">
            返回订单
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Loading, 
  CircleCheck, 
  CircleClose, 
  Clock, 
  Warning, 
  QuestionFilled 
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  // 支付状态：pending, paid, failed, expired, cancelled
  status: {
    type: String,
    required: true,
    validator: (value) => {
      return ['pending', 'paid', 'failed', 'expired', 'cancelled'].includes(value)
    }
  },
  // 支付信息
  paymentInfo: {
    type: Object,
    default: () => ({})
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true
  },
  // 是否正在检查状态
  checking: {
    type: Boolean,
    default: false
  },
  // 倒计时（秒）
  countdown: {
    type: Number,
    default: 0
  },
  // 自定义标题
  customTitle: String,
  // 自定义描述
  customDescription: String
})

// Events
defineEmits([
  'check-status',
  'cancel-payment', 
  'retry-payment',
  'create-payment',
  'view-order',
  'continue-shopping',
  'back-to-order'
])

// 状态标题
const statusTitle = computed(() => {
  if (props.customTitle) return props.customTitle
  
  const titles = {
    pending: '等待支付',
    paid: '支付成功',
    failed: '支付失败',
    expired: '支付超时',
    cancelled: '支付已取消'
  }
  return titles[props.status] || '未知状态'
})

// 状态描述
const statusDescription = computed(() => {
  if (props.customDescription) return props.customDescription
  
  const descriptions = {
    pending: '请扫描二维码完成支付，支付完成后页面会自动跳转',
    paid: '您的订单支付成功，我们会尽快为您处理订单',
    failed: '支付过程中发生错误，请重新尝试支付',
    expired: '支付已超时，请重新创建支付订单',
    cancelled: '您已取消支付，可以重新创建支付订单'
  }
  return descriptions[props.status] || '状态异常，请联系客服'
})

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  
  const date = new Date(timeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化倒计时
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.payment-status {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: var(--el-box-shadow-light);
  max-width: 500px;
  margin: 0 auto;
}

.status-icon {
  margin-bottom: 24px;
}

.status-content {
  h3 {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 24px 0;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.payment-details {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
    
    .value {
      color: var(--el-text-color-primary);
      font-weight: 500;
      
      &.amount {
        color: var(--el-color-danger);
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: var(--el-color-warning);
  font-weight: 600;
  
  .el-icon {
    margin-right: 8px;
  }
}

.status-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  
  .el-button {
    min-width: 120px;
  }
}

// 状态样式
.status-pending {
  .status-icon {
    color: var(--el-color-warning);
  }
  
  .status-content h3 {
    color: var(--el-color-warning);
  }
}

.status-paid {
  .status-icon {
    color: var(--el-color-success);
  }
  
  .status-content h3 {
    color: var(--el-color-success);
  }
}

.status-failed {
  .status-icon {
    color: var(--el-color-danger);
  }
  
  .status-content h3 {
    color: var(--el-color-danger);
  }
}

.status-expired {
  .status-icon {
    color: var(--el-color-info);
  }
  
  .status-content h3 {
    color: var(--el-color-info);
  }
}

.status-cancelled {
  .status-icon {
    color: var(--el-text-color-secondary);
  }
  
  .status-content h3 {
    color: var(--el-text-color-secondary);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .payment-status {
    padding: 24px 16px;
    margin: 0 16px;
  }
  
  .status-content h3 {
    font-size: 20px;
  }
  
  .status-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
  
  .payment-details .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 12px;
  }
}

// 动画效果
.status-icon .is-loading {
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

.payment-status {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>