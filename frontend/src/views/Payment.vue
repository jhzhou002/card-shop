<template>
  <div class="payment-page">
    <div class="container">
      <div class="payment-container">
        <div class="payment-header">
          <h2>订单支付</h2>
          <div class="order-info">
            <p>订单号：{{ orderInfo.order_no }}</p>
            <p class="amount">支付金额：<span>￥{{ orderInfo.total_price }}</span></p>
          </div>
        </div>

        <div class="payment-methods" v-if="!paymentData">
          <h3>选择支付方式</h3>
          <div class="method-list">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="method-item"
              :class="{ active: selectedMethod === method.id }"
              @click="selectMethod(method.id)"
            >
              <div class="method-icon">
                <el-icon size="24">
                  <CreditCard v-if="method.type === 'alipay'" />
                  <ChatDotRound v-else-if="method.type === 'wechat'" />
                  <Wallet v-else />
                </el-icon>
              </div>
              <div class="method-info">
                <h4>{{ method.name }}</h4>
                <p>{{ method.type === 'alipay' ? '支付宝扫码支付' : method.type === 'wechat' ? '微信扫码支付' : '其他支付方式' }}</p>
              </div>
            </div>
          </div>
          
          <div class="payment-actions">
            <el-button 
              type="primary" 
              size="large" 
              @click="createPayment"
              :loading="loading"
              :disabled="!selectedMethod"
            >
              确认支付
            </el-button>
            <el-button size="large" @click="$router.go(-1)">取消</el-button>
          </div>
        </div>

        <div class="payment-qrcode" v-if="paymentData && paymentStatus === 'pending'">
          <QRCodeDisplay
            :qr-code-data="paymentData.qr_code"
            title="扫码支付"
            tips="请使用支付宝或微信扫描二维码完成支付"
            :countdown="countdown"
            countdown-text="支付剩余时间"
            :show-actions="true"
            :refreshing="checking"
            @refresh="checkPaymentStatus"
            @cancel="cancelPayment"
          />
        </div>

        <div class="payment-status-display" v-if="paymentStatus !== 'pending'">
          <PaymentStatus
            :status="paymentStatus"
            :payment-info="currentPaymentInfo"
            :checking="checking"
            @check-status="checkPaymentStatus"
            @cancel-payment="cancelPayment"
            @retry-payment="retryPayment"
            @view-order="goToOrder"
            @continue-shopping="goToHome"
            @back-to-order="goToOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  CreditCard, 
  ChatDotRound, 
  Wallet, 
  Clock, 
  CircleCheck 
} from '@element-plus/icons-vue'
import { payments, orders } from '@/api'
import QRCodeDisplay from '@/components/QRCodeDisplay.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'

const router = useRouter()
const route = useRoute()

const orderInfo = ref({})
const paymentMethods = ref([])
const selectedMethod = ref(null)
const paymentData = ref(null)
const paymentStatus = ref('pending')
const loading = ref(false)
const checking = ref(false)
const countdown = ref(0)

let countdownTimer = null
let statusTimer = null

// 当前支付信息
const currentPaymentInfo = computed(() => {
  if (!paymentData.value) return {}
  
  return {
    payment_no: paymentData.value.payment_no,
    amount: orderInfo.value.total_price,
    created_at: new Date().toISOString(),
    expires_at: paymentData.value.expires_at
  }
})

// 获取订单信息
const loadOrderInfo = async () => {
  try {
    const { order_no } = route.params
    const response = await orders.detail(order_no)
    orderInfo.value = response.data
    
    if (orderInfo.value.status !== 'pending') {
      ElMessage.error('订单状态异常，无法支付')
      router.push('/orders')
    }
  } catch (error) {
    ElMessage.error('获取订单信息失败')
    router.push('/orders')
  }
}

// 获取支付方式
const loadPaymentMethods = async () => {
  try {
    const response = await payments.methods()
    paymentMethods.value = response.data
  } catch (error) {
    ElMessage.error('获取支付方式失败')
  }
}

// 选择支付方式
const selectMethod = (methodId) => {
  selectedMethod.value = methodId
}

// 创建支付订单
const createPayment = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  loading.value = true
  
  try {
    const response = await payments.create({
      order_id: orderInfo.value.id,
      payment_method_id: selectedMethod.value,
      amount: orderInfo.value.total_price,
      return_url: `/orders/${orderInfo.value.order_no}`
    })
    
    paymentData.value = response.data
    
    // 开始倒计时
    const expiresAt = new Date(paymentData.value.expires_at)
    countdown.value = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
    startCountdown()
    
    // 开始轮询支付状态
    startStatusPolling()
    
    ElMessage.success('支付订单创建成功，请扫码支付')
  } catch (error) {
    ElMessage.error('创建支付订单失败')
  } finally {
    loading.value = false
  }
}

// 查询支付状态
const checkPaymentStatus = async () => {
  if (!paymentData.value) return
  
  checking.value = true
  
  try {
    const response = await payments.status(paymentData.value.payment_no)
    const status = response.data.status
    
    if (status === 'paid') {
      paymentStatus.value = 'paid'
      stopTimers()
      ElMessage.success('支付成功！')
      
      // 3秒后跳转到订单页面
      setTimeout(() => {
        goToOrder()
      }, 3000)
    } else if (status === 'failed') {
      ElMessage.error('支付失败，请重新支付')
      cancelPayment()
    }
  } catch (error) {
    ElMessage.error('查询支付状态失败')
  } finally {
    checking.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  
  countdownTimer = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      ElMessage.warning('支付已超时，请重新下单')
      cancelPayment()
    }
  }, 1000)
}

// 开始轮询支付状态
const startStatusPolling = () => {
  if (statusTimer) clearInterval(statusTimer)
  
  statusTimer = setInterval(() => {
    if (paymentStatus.value === 'pending') {
      checkPaymentStatus()
    }
  }, 3000) // 每3秒查询一次
}

// 停止定时器
const stopTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

// 取消支付
const cancelPayment = () => {
  ElMessageBox.confirm('确定要取消支付吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '继续支付',
    type: 'warning'
  }).then(() => {
    stopTimers()
    paymentData.value = null
    paymentStatus.value = 'pending'
    countdown.value = 0
  }).catch(() => {
    // 用户选择继续支付
  })
}

// 格式化倒计时
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 跳转到订单页面
const goToOrder = () => {
  router.push(`/orders/${orderInfo.value.order_no}`)
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 重新支付
const retryPayment = () => {
  stopTimers()
  paymentData.value = null
  paymentStatus.value = 'pending'
  countdown.value = 0
  selectedMethod.value = null
}

onMounted(() => {
  loadOrderInfo()
  loadPaymentMethods()
})

onUnmounted(() => {
  stopTimers()
})
</script>

<style lang="scss" scoped>
.payment-page {
  min-height: calc(100vh - 120px);
  background: var(--el-bg-color-page);
  padding: 20px 0;
}

.payment-container {
  max-width: 600px;
  margin: 0 auto;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.payment-header {
  padding: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  
  h2 {
    margin: 0 0 16px 0;
    color: var(--el-text-color-primary);
  }
  
  .order-info {
    p {
      margin: 4px 0;
      color: var(--el-text-color-regular);
    }
    
    .amount {
      font-size: 18px;
      font-weight: 600;
      
      span {
        color: var(--el-color-danger);
        font-size: 24px;
      }
    }
  }
}

.payment-methods {
  padding: 24px;
  
  h3 {
    margin: 0 0 20px 0;
    color: var(--el-text-color-primary);
  }
  
  .method-list {
    margin-bottom: 24px;
  }
  
  .method-item {
    display: flex;
    align-items: center;
    padding: 16px;
    margin-bottom: 12px;
    border: 2px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--el-color-primary-light-7);
      background: var(--el-color-primary-light-9);
    }
    
    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
    
    .method-icon {
      margin-right: 16px;
      color: var(--el-color-primary);
    }
    
    .method-info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .payment-actions {
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
  }
}

.payment-qrcode,
.payment-status-display {
  padding: 24px;
}

@media (max-width: 768px) {
  .payment-container {
    margin: 0 16px;
  }
  
  .payment-header,
  .payment-methods,
  .payment-qrcode,
  .payment-status-display {
    padding: 16px;
  }
  
  .payment-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>