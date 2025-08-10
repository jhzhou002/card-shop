import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import Cookies from 'js-cookie'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { success, message, data } = response.data
    
    if (success) {
      return { data, message }
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    let message = '请求失败'
    
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        message = '登录已过期，请重新登录'
        const userStore = useUserStore()
        userStore.clearAuth()
        router.push('/auth/login')
      } else if (status === 403) {
        message = '权限不足'
      } else if (status === 404) {
        message = '请求的资源不存在'
      } else if (status === 500) {
        message = '服务器内部错误'
      } else if (data && data.message) {
        message = data.message
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else {
      message = '网络错误'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// API模块
export const auth = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  adminLogin: (data) => request.post('/auth/admin/login', data),
  logout: () => request.post('/auth/logout'),
  refreshToken: () => request.post('/auth/refresh'),
  changePassword: (data) => request.put('/auth/password', data)
}

export const goods = {
  list: (params) => request.get('/goods', { params }),
  detail: (id) => request.get(`/goods/${id}`),
  hot: (params) => request.get('/goods/hot/list', { params }),
  recommend: (params) => request.get('/goods/recommend/list', { params }),
  search: (keyword, params) => request.get(`/goods/search/${keyword}`, { params })
}

export const categories = {
  list: (params) => request.get('/categories', { params }),
  detail: (id) => request.get(`/categories/${id}`),
  goods: (id, params) => request.get(`/categories/${id}/goods`, { params })
}

export const orders = {
  create: (data) => request.post('/orders', data),
  detail: (orderNo) => request.get(`/orders/${orderNo}`),
  userList: (params) => request.get('/orders/user/list', { params })
}

export const payments = {
  methods: () => request.get('/payments/methods'),
  create: (data) => request.post('/payments/create', data),
  status: (paymentNo) => request.get(`/payments/status/${paymentNo}`)
}

export const user = {
  profile: () => request.get('/user/profile'),
  updateProfile: (data) => request.put('/user/profile', data),
  balanceRecords: (params) => request.get('/user/balance-records', { params }),
  recharge: (data) => request.post('/user/recharge', data)
}

export const admin = {
  profile: () => request.get('/admin/profile'),
  stats: () => request.get('/admin/stats'),
  
  // 商品管理
  goods: (params) => request.get('/admin/goods', { params }),
  createGood: (data) => request.post('/admin/goods', data),
  updateGood: (id, data) => request.put(`/admin/goods/${id}`, data),
  deleteGood: (id) => request.delete(`/admin/goods/${id}`),
  
  // 订单管理
  orders: (params) => request.get('/admin/orders', { params }),
  updateOrder: (id, data) => request.put(`/admin/orders/${id}`, data),
  
  // 用户管理
  users: (params) => request.get('/admin/users', { params }),
  updateUser: (id, data) => request.put(`/admin/users/${id}`, data),
  
  // 分类管理
  categories: (params) => request.get('/admin/categories', { params }),
  createCategory: (data) => request.post('/admin/categories', data),
  updateCategory: (id, data) => request.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => request.delete(`/admin/categories/${id}`),
  
  // 卡密管理
  cards: (params) => request.get('/admin/cards', { params }),
  importCards: (data) => request.post('/admin/cards', data),
  deleteCard: (id) => request.delete(`/admin/cards/${id}`),
  
  // 系统日志
  logs: (params) => request.get('/admin/logs', { params })
}

export const settings = {
  public: () => request.get('/settings/public')
}

export const upload = {
  image: (data) => request.post('/upload/image', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export default request