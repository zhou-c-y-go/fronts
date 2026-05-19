import { createRouter, createWebHistory } from 'vue-router'
// 1. 引入我们刚写的登录组件
import Login from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 当用户访问根目录时
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      // 显示 Login 组件
      component: Login
    }
  ]
})

export default router
