<template>
  <div class="h-screen bg-[#161823] text-white flex flex-col font-sans select-none overflow-hidden">

    <header class="h-16 border-b border-gray-800 bg-[#161823] sticky top-0 z-50 flex items-center justify-between px-6">
      <TheNavbar/>
    </header>

    <div class="flex flex-1 overflow-hidden">

      <aside class="w-60 border-r border-gray-800 bg-[#161823] overflow-y-auto p-4 flex flex-col justify-between hidden md:flex flex-shrink-0">
        <div class="space-y-6">
          <div class="space-y-1">
            <div class="flex items-center space-x-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-500 border-l-4 border-pink-500 px-4 py-3 rounded-r-lg cursor-pointer font-medium">
              🏠 <span>精选广场</span>
            </div>
            <div class="flex items-center space-x-3 hover:bg-gray-900 px-4 py-3 rounded-lg cursor-pointer text-gray-400 hover:text-white transition">
              ✨ <span>推荐关注</span>
            </div>
            <div class="flex items-center space-x-3 hover:bg-gray-900 px-4 py-3 rounded-lg cursor-pointer text-gray-400 hover:text-white transition">
              🤖 <span>AI 智能搜索</span>
            </div>
          </div>
          <hr class="border-gray-800"/>
          <div class="space-y-1 text-gray-400 text-sm">
            <div
              v-for="subItem in subMenuItems"
              :key="subItem.id"
              @click="handleSubMenuClick(subItem.id)"
              class="px-4 py-2 hover:text-white hover:bg-gray-800/30 rounded-lg cursor-pointer transition-all duration-150 flex items-center space-x-2 active:scale-[0.99]"
            >
              <span>{{ subItem.icon }}</span>
              <span>{{ subItem.name }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="showDownloadCard"
          class="relative bg-[#2f3142]/60 border border-gray-800 p-3 rounded-xl text-center space-y-2 text-xs backdrop-blur-xs group transition-all duration-300"
        >
          <button
            @click="showDownloadCard = false"
            class="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-all text-[10px] font-sans cursor-pointer active:scale-90"
            title="关闭提示"
          >
            ✕
          </button>
          <p class="text-gray-300 font-medium tracking-wide pt-1">客户端看视频更方便</p>
          <button class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-1.5 rounded-lg font-bold shadow-md active:scale-95 transition-all text-white">
            下载 APP
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-[#060716] p-6 space-y-6" style="scrollbar-gutter: stable;">

        <div class="flex items-center space-x-4 overflow-x-auto whitespace-nowrap scrollbar-none text-sm text-gray-400 pb-2">
          <span class="text-white font-medium bg-gray-800 px-3 py-1 rounded-full cursor-pointer">全部</span>
          <span v-for="tag in ['公开课', '游戏', '二次元', '音乐', '影视', '美食', '知识']" :key="tag" class="hover:text-white cursor-pointer px-1 py-1">{{ tag }}</span>
        </div>

        <template v-if="videoFeedList.length > 0">
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div
              class="xl:col-span-2 bg-black rounded-xl overflow-hidden aspect-video relative group border border-gray-900 flex flex-col justify-end p-6 transform-gpu will-change-transform shadow-2xl"
              style="backface-visibility: hidden;"
              @click="openVideoDetail(videoFeedList[0].id)"
            >
<!--推荐视频-->
              <video
                :src="videoFeedList[0].video_url"
                :poster="videoFeedList[0].cover_url"
                @loadedmetadata="handleHistoricalDurationRepair($event, videoFeedList[0])"
                autoplay
                muted
                loop
                playsinline
                preload="auto"
                class="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-300 z-0"
              ></video>

              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-10"></div>

              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20 cursor-pointer z-20">
                <span class="text-4xl bg-black/50 p-3 rounded-full backdrop-blur-md transform hover:scale-105 transition duration-150">⏸️</span>
              </div>

              <div class="relative z-20 space-y-2 pointer-events-none">
                <h2 class="text-xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white tracking-wide">
                  {{ videoFeedList[0].title }}
                </h2>
                <p class="text-xs text-gray-300 drop-shadow">
                  @{{ videoFeedList[0].author?.username || '匿名极客' }} · 强力推荐
                </p>

                <div
                  v-if="parseVideoTags(videoFeedList[0].tags).length > 0"
                  class="text-[11px] text-blue-400 flex flex-wrap gap-2 items-center pt-1"
                >
                  <span class="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm animate-pulse tracking-widest">HOT</span>
                  <span
                    v-for="(tag, index) in parseVideoTags(videoFeedList[0].tags)"
                    :key="index"
                    class="backdrop-blur-md bg-blue-500/10 px-1.5 py-0.5 rounded-sm"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              <div
                v-for="video in videoFeedList.slice(1, 4)"
                :key="video.id"
                @mouseenter="handleVideoHover"
                @mouseleave="handleVideoLeave"
                @click="openVideoDetail(video.id)"
                class="flex space-x-3 bg-[#161823] p-2 rounded-lg hover:bg-gray-900 cursor-pointer transition-colors duration-200 border border-gray-800/40"
              >
                <div class="w-32 h-20 bg-black rounded overflow-hidden flex-shrink-0 relative shadow-md">
                  <video
                    :src="video.video_url"
                    :poster="video.cover_url"
                    muted
                    loop
                    @loadedmetadata="handleHistoricalDurationRepair($event, video)"
                    playsinline
                    preload="none"
                    class="w-full h-full object-cover"
                  ></video>
                  <span class="absolute bottom-1 right-1 bg-black/60 text-[10px] px-1 rounded font-mono z-10">
                    {{ video.duration > 0 ? `${Math.floor(video.duration/60)}:${video.duration%60}` : '00:45' }}
                  </span>
                </div>
                <div class="flex flex-col justify-between text-xs py-0.5 flex-1 min-w-0 pointer-events-none">
                  <p class="font-medium line-clamp-2 text-gray-200 leading-tight">{{ video.title }}</p>
                  <p class="text-gray-500 truncate">@{{ video.author?.username || '匿名' }} · ❤️ {{ video.like_count }}赞</p>
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    <span>{{ video.favorite_count || 0 }}</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div>
            <h3 class="text-sm font-bold mb-4 flex items-center text-gray-200 tracking-wide">🔥 广场热门精选</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="item in videoFeedList.slice(4)"
                :key="item.id"
                @mouseenter="handleVideoHover"
                @mouseleave="handleVideoLeave"
                class="bg-[#161823] rounded-lg overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-200 transform-gpu will-change-transform border border-gray-800/40"
                style="backface-visibility: hidden; -webkit-backface-visibility: hidden;">

                <div class="aspect-video bg-black relative overflow-hidden">
                  <video
                    :src="item.video_url"
                    :poster="item.cover_url"
                    muted
                    @loadedmetadata="handleHistoricalDurationRepair($event, item)"
                    loop
                    playsinline
                    preload="none"
                    class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  ></video>
                  <span class="absolute bottom-2 left-2 text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded-full text-pink-400 z-10">
                    👍 {{ item.like_count }}
                  </span>
                </div>

                <div class="p-3 text-xs space-y-1 pointer-events-none">
                  <p class="font-medium text-gray-200 truncate">{{ item.title }}</p>
                  <p class="text-gray-500 font-mono">@{{ item.author?.username || '匿名' }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="flex flex-col items-center justify-center py-32 text-gray-500 space-y-4 border border-dashed border-gray-800 rounded-xl bg-[#161823]/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 stroke-gray-700 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
          </svg>
          <div class="text-center space-y-1">
            <p class="text-sm tracking-widest text-gray-400 font-medium">公网视频流雷达全速扫描中...</p>
            <p class="text-xs text-gray-600 font-mono">等待注入：GET /feed 数据流线索</p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref } from "vue";
import request from "@/utils/request.js"; //
import TheNavbar from "@/components/TheNavbar.vue"; //

const router = useRouter() //
const showDownloadCard = ref(true) //
const isLoginIn = ref(false) //
const userAvatar = ref('https://api.dicebear.com/7.x/adventurer/svg?seed=Felix') //

const videoFeedList = ref([])

// 🎯 核心网络编排：只要进入主页，立刻轰炸后端公开推荐流接口！
const fetchGlobalVideoFeed = async () => {
  try {
    const res = await request.get('/video/feed') //
    if (res && res.code === 1 && Array.isArray(res.data)) {
      // 瞬间把后端的视频源文件、MinIO封面海报、作者模型无损灌入！
      videoFeedList.value = res.data
      console.log('⚡ [HomeView] 视频推荐流成功并网！当前装载真实条数:', res.data.length)
    }
  } catch (error) {
    console.error('❌ [HomeView] 拉取后端视频源失败，启动空状态安全舱门:', error)
  }
}

const handleVideoHover = (event) => {
  const video = event.currentTarget.querySelector('video')
  if (video) {
    video.preload = 'auto' // 动态加速拉流
    video.play().catch((err) => {
      console.warn('⚠️ [HoverPlay] 视频流并网高频打断:', err)
    })
  }
}

const handleVideoLeave = (event) => {
  const video = event.currentTarget.querySelector('video')
  if (video) {
    video.pause()
    video.currentTime = 0 // 强行校准归零，回源显示海报封面！
  }
}

// 获取顶部导航栏头像（保持原本逻辑）
const getAvatar = async () => {
  const token = localStorage.getItem('token') //
  if (token) {
    isLoginIn.value = true //
    try {
      const res = await request.get('/profile') //
      if (res && res.code === 1 && res.data && res.data.avatar) { //
        userAvatar.value = res.data.avatar //
      }
    } catch (error) {
      console.error('❌ [Navbar] 拉取最新用户头像失败啦:', error) //
    }
  } else {
    isLoginIn.value = false //
  }
}

onMounted(() => {
  getAvatar() // 1. 捞取个人状态
  fetchGlobalVideoFeed() // 2. ⚡ 灌注全场公网视频流！
})

const activeSubMenu = ref('') //

const subMenuItems = ref([ //
  { id: 'following', name: '关注', icon: '👥' }, //
  { id: 'friends',   name: '朋友', icon: '🤝' }, //
  { id: 'center',    name: '我的', icon: '👤' } //
])

// 左侧边栏未登录路由拦截安检线
const handleSubMenuClick = (subId) => {
  if (subId === 'center') {
    const token = localStorage.getItem('token') //
    if (!token) {
      alert('您还没有登录哦！请先在右上方登录，才能解锁个人中心~')
      router.push('/login')
      return
    }
  }
  activeSubMenu.value = subId //
  router.push(`/${subId}`) //
}

const parseVideoTags = (tagsStr) => {
  if (!tagsStr) return []
  return tagsStr.split(/[,，；;\s]+/).filter(tag => tag.trim() !== '')
}

const handleHistoricalDurationRepair = async (event, videoItem) => {
  if (!videoItem) return
  // 浏览器利用本地硬件解码器秒级抓取到的绝对真实时长
  const realDuration = Math.round(event.target.duration)

  // 🎯 判定红线：如果后端传过来的数据是 0（或者是 null），而浏览器探测到了大于 0 的真时长
  if ((videoItem.duration === 0 || !videoItem.duration) && realDuration > 0) {

    // 🚀 动作一：前端组件内存模型先秒级同步，让用户立刻看到漂亮的时间戳
    videoItem.duration = realDuration

    // 🚀 动作二：悄悄发射一笔轻量级请求，回源清洗 MySQL 历史陈旧数据！
    try {
      await request.put('/video/repair-duration', {
        id: videoItem.id,
        duration: realDuration
      })
      console.log(`🎯 [自愈系统] 成功悄悄清洗并修复历史视频 [ID: ${videoItem.id}] 的时长为 ${realDuration} 秒！`)
    } catch (error) {
      // 静默失败，绝对不打扰、不中断用户的正常刷视频体验
      console.error('⚠️ [Self-Healing] 悄悄修复历史数据失败:', error)
    }
  }
}
//  剥离当前单页应用，在浏览器中打开新的标签页
const openVideoDetail = (videoId) => {
  if (!videoId) return

  // 1. 利用 Vue Router 的 resolve 神技，把动态路由转换为真实的浏览器绝对 URL（比如 /video/12）
  const routeUrl = router.resolve({ path: `/video/${videoId}` })
  // 2. 召唤浏览器底层 API：'_blank' 代表强制开启全新标签页！
  window.open(routeUrl.href, '_blank')
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
