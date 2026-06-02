<template>
  <header class="h-16 w-full border-b border-gray-800 bg-[#161823] flex-shrink-0 flex items-center justify-between px-6 sticky top-0 z-50 select-none">

    <div class="flex items-center space-x-2 text-xl font-bold tracking-wider text-red-500 cursor-pointer" @click="router.push('/')">
      🎵 <span class="text-white text-lg">抖音精选</span>
    </div>

    <div class="w-1/3 md:min-w-[320px] min-w-[240px] flex items-center bg-[#2f3142] rounded-full px-4 py-1.5 border border-transparent focus-within:border-gray-500 transition-all">
      <input type="text" placeholder="搜索你感兴趣的内容" class="bg-transparent w-full outline-none text-sm text-gray-200 placeholder-gray-500 pr-2"/>
      <button class="text-gray-400 hover:text-white text-sm px-2 flex-shrink-0 whitespace-nowrap">🔍 搜索</button>
    </div>

    <div class="flex items-center space-x-4">
      <button
      @click="handleGoToUpload"
      class="flex items-center space-x-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-md transition-all transform-gpu active:scale-95 flex-shrink-0 whitespace-nowrap cursor-pointer"
      >
        <span>🚀</span>
        <span>投稿</span>
      </button>
      <div class="relative group cursor-pointer flex items-center space-x-2">
        <img
          :src="isLoginIn ? userAvatar : 'https://api.dicebear.com/7.x/initials/svg?seed=NoLogin&backgroundColor=374151'"
          alt="avatar"
          class="w-8 h-8 rounded-full border border-gray-600 group-hover:border-gray-400 transition-all object-cover"
        />

        <span class="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
          {{ isLoginIn ? '已登录' : '未登录' }}
        </span>

        <div class="absolute right-0 top-full pt-2 w-36 hidden group-hover:block z-50">
          <div class="bg-[#2f3142] rounded-md shadow-lg border border-gray-700 overflow-hidden">

            <template v-if="isLoginIn">
              <div class="px-4 py-2.5 text-xs text-gray-200 hover:text-white hover:bg-gray-600 transition-colors" @click="router.push('/center')">
                👤 个人主页
              </div>
              <div class="px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-gray-600 transition-colors border-t border-gray-700" @click="handleLogout">
                🚪 退出登录
              </div>
            </template>

            <template v-else>
              <div class="px-4 py-3 text-[11px] text-center text-gray-400 bg-gray-800/40">
                您还未登录哦🥺
              </div>
              <div class="px-4 py-2.5 text-xs text-center text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 font-bold transition-all cursor-pointer" @click="router.push('/login')">
                ✨ 立即登录
              </div>
            </template>

          </div>
        </div>

      </div>
    </div>

  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from "vue"
import request from "@/utils/request.js"

const router = useRouter()
const isLoginIn = ref(false)
const userAvatar = ref('')

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const res = await request.get('/profile')
      if (res && res.code === 1 && res.data && res.data.avatar) {
        userAvatar.value = res.data.avatar
        isLoginIn.value = true // 💡 只有后端真正吐回正确数据了，才亮起登录成功的绿灯！
      } else {
        isLoginIn.value = false
      }
    } catch (error) {
      isLoginIn.value = false
      console.error(error)
    }
  }
})
const handleGoToUpload = () => {
  const token = localStorage.getItem('token')
  if (!token || !isLoginIn.value) {
    alert('发布你的精选大作需要先登录身份哦！')
    router.push('/login')
    return
  }
  router.push('/public')
}
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('expired_at')
  isLoginIn.value = false
  router.push('/')
}
</script>
