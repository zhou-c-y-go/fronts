import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 初始化 token，防止刷新丢失
  const token = ref(localStorage.getItem('token') || '')

  // 存 Token 的动作
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除 Token 的动作（退出登录或 Token 过期时调用）
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
  }

  return { token, setToken, clearToken }
})
