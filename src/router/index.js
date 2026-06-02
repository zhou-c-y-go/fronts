import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
// 1. 引入我们刚写的登录组件
import Login from '../views/LoginView.vue'
import  Register from '../views/RegisterView.vue'
import  Home from '../views/HomeView.vue'
import center from '../views/CenterView.vue'
import UploadView from "@/views/UploadView.vue";
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
      component: Login
    },
    {
      path: '/center',
      name: 'personCenter',
      component: center,
      meta: { requiresAuth: true }
    },
    {
      path: '/public',
      name: 'public',
      component: UploadView,
      meta: { requiresAuth: true }
    }
  ]
})
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 依然是我们的黄金取 Token 逻辑
  const token = localStorage.getItem('token') || userStore.token

  // 如果去往的页面打上了 requiresAuth 标记，并且用户双手空空没带 Token
  if (to.meta.requiresAuth && !token) {
    alert('该页面需要登录后访问，正在为您跳转至登录页...')
    next('/') // 🎯 强行踢回登录页！
  } else {
    next() // 🟢 否则放行通车
  }
})
export default router
