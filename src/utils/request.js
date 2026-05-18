import axios from 'axios'
import { useUserStore } from '../stores/user'
import router from '../router'

// 1. 创建 Axios 实例
const request = axios.create({
  // 这里写你 Go 后端的地址，注意修改端口号以匹配你的 Gin 启动端口
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000 // 请求超时时间：5秒
})

// 2. 请求拦截器 (发往 Go 后端前执行)
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    // 如果本地有 Token，就按照 JWT 标准加上 Bearer 前缀带在请求头里
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (拿到 Go 后端的数据后执行)
request.interceptors.response.use(
  response => {
    // 假设你的 Go 后端返回格式是 { code: 200, data: {...}, msg: "success" }
    // 这里直接剥离外层，返回真实的业务数据
    const res = response.data

    // 如果业务状态码不对（根据你 Go 代码的约定修改）
    if (res.code !== 200) {
      alert(res.msg || '服务器开小差了')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    // 统一处理 HTTP 状态码错误
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // 401 未授权：说明 Token 没传、过期、或者造假
          alert('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.clearToken() // 清除失效 Token
          router.push('/') // 踢回登录页
          break
        }
        case 403: {
          // 403 被拒绝：说明 JWT 过了，但 Casbin 发现你没权限
          alert('权限不足，禁止访问！')
          break
        }
        default:{
          alert('网络错误，请稍后再试')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default request
