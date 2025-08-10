import { defineStore } from 'pinia'
import { auth } from '@/api'
import Cookies from 'js-cookie'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
    admin: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => !!state.admin,
    userInfo: (state) => state.user || state.admin
  },

  actions: {
    // 初始化用户状态
    initUserState() {
      const token = Cookies.get('token')
      const user = localStorage.getItem('user')
      const admin = localStorage.getItem('admin')

      if (token) {
        this.token = token
      }

      if (user) {
        try {
          this.user = JSON.parse(user)
        } catch (e) {
          localStorage.removeItem('user')
        }
      }

      if (admin) {
        try {
          this.admin = JSON.parse(admin)
        } catch (e) {
          localStorage.removeItem('admin')
        }
      }
    },

    // 用户登录
    async login(credentials) {
      try {
        const response = await auth.login(credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user
        this.admin = null

        // 保存到本地存储
        Cookies.set('token', token, { expires: 7 })
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.removeItem('admin')

        return response
      } catch (error) {
        throw error
      }
    },

    // 用户注册
    async register(userData) {
      try {
        const response = await auth.register(userData)
        const { token, user } = response.data

        this.token = token
        this.user = user
        this.admin = null

        // 保存到本地存储
        Cookies.set('token', token, { expires: 7 })
        localStorage.setItem('user', JSON.stringify(user))

        return response
      } catch (error) {
        throw error
      }
    },

    // 管理员登录
    async adminLogin(credentials) {
      try {
        const response = await auth.adminLogin(credentials)
        const { token, admin } = response.data

        this.token = token
        this.admin = admin
        this.user = null

        // 保存到本地存储
        Cookies.set('token', token, { expires: 7 })
        localStorage.setItem('admin', JSON.stringify(admin))
        localStorage.removeItem('user')

        return response
      } catch (error) {
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        await auth.logout()
      } catch (error) {
        // 忽略退出登录的错误
      } finally {
        this.clearAuth()
      }
    },

    // 清除认证信息
    clearAuth() {
      this.token = null
      this.user = null
      this.admin = null

      // 清除本地存储
      Cookies.remove('token')
      localStorage.removeItem('user')
      localStorage.removeItem('admin')
    },

    // 更新用户信息
    updateUser(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },

    // 更新管理员信息
    updateAdmin(adminData) {
      if (this.admin) {
        this.admin = { ...this.admin, ...adminData }
        localStorage.setItem('admin', JSON.stringify(this.admin))
      }
    }
  }
})