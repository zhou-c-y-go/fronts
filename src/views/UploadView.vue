<template>
  <div class="h-screen bg-[#161823] text-white flex flex-col font-sans select-none overflow-hidden">
    <TheNavbar />

    <div class="flex flex-1 overflow-hidden w-full max-w-[1200px] mx-auto p-4 md:p-6 space-x-6">

      <div class="hidden lg:flex flex-col w-96 bg-[#1e202c] border border-gray-800 rounded-2xl p-4 flex-shrink-0 justify-between">
        <div class="space-y-4">
          <div class="text-xs text-gray-400 font-mono tracking-widest">// 🎥 创作者实时预览霓虹监视器</div>

          <div class="aspect-video bg-black rounded-xl border border-gray-900 overflow-hidden relative flex items-center justify-center shadow-inner">
            <video v-if="videoPreviewUrl" :src="videoPreviewUrl" controls class="w-full h-full object-contain z-10"></video>
            <div v-else class="text-center text-xs text-gray-600 space-y-2">
              <p class="text-2xl">📽️</p>
              <p>暂无待投递视频流</p>
            </div>
          </div>

          <div class="aspect-[3/4] max-w-[200px] mx-auto bg-black rounded-xl border border-gray-900 overflow-hidden relative flex items-center justify-center shadow-inner mt-4">
            <img v-if="coverPreviewUrl" :src="coverPreviewUrl" class="w-full h-full object-cover z-10" alt="Cover Preview" />
            <div v-else class="text-center text-[11px] text-gray-600 space-y-1">
              <p class="text-xl">🖼️</p>
              <p>封面海报占位</p>
            </div>
          </div>
        </div>

        <button @click="router.back()" class="w-full py-2 bg-gray-800 hover:bg-gray-700 transition rounded-xl text-xs font-medium border border-gray-700/60 text-gray-300">
          🔙 返回上一页
        </button>
      </div>

      <main class="flex-1 bg-[#1e202c] border border-gray-800 rounded-2xl p-6 md:p-8 overflow-y-auto relative shadow-2xl">
        <h2 class="text-xl font-bold tracking-wide border-b border-gray-800 pb-4 mb-6">发布全新精选短视频作品</h2>

        <form @submit.prevent="handlePublishVideo" class="space-y-6">

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">1. 上传精选短视频源文件</label>
            <div class="bg-[#161823] border border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-pink-500/60 transition-all cursor-pointer relative group" @click="triggerVideoInput">
              <input type="file" ref="videoInput" class="hidden" accept="video/*" @change="onVideoFileSelected" />
              <div class="space-y-2 text-xs text-gray-400" v-if="!uploadForm.videoFile">
                <p class="text-3xl group-hover:animate-bounce transition-all">📤</p>
                <p class="text-gray-300 font-semibold">点击选择本地视频文件进行上架</p>
                <p class="text-[10px] text-gray-600">支持 MP4、MOV 等高质感视频格式（不超 50MB）</p>
              </div>
              <div v-else class="text-xs text-emerald-400 flex items-center justify-center space-x-2 font-mono">
                <span>✅ 已捕获成功：{{ uploadForm.videoFile.name }} ({{ (uploadForm.videoFile.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">2. 上传吸睛高亮封面图</label>
            <div class="bg-[#161823] border border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-purple-500/60 transition-all cursor-pointer" @click="triggerCoverInput">
              <input type="file" ref="coverInput" class="hidden" accept="image/*" @change="onCoverFileSelected" />
              <div class="space-y-1 text-xs text-gray-400" v-if="!uploadForm.coverFile">
                <p class="text-xl">🎨</p>
                <p class="text-gray-300 font-semibold">点击选择或者拖拽封面图海报</p>
              </div>
              <div v-else class="text-xs text-purple-400 flex items-center justify-center space-x-2 font-mono">
                <span>✅ 封面图已就位：{{ uploadForm.coverFile.name }}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">4. 打上潮流分类标签（Tags）</label>
            <input
              v-model="uploadForm.tags"
              type="text"
              class="w-full bg-[#161823] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all text-gray-100 placeholder-gray-600 shadow-inner"
              placeholder="输入视频标签，用逗号或空格隔开（如：游戏, 二次元, 搞笑）..."
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">3. 创作灵魂视频标题/描述</label>
            <input
              v-model="uploadForm.title"
              type="text"
              maxlength="80"
              class="w-full bg-[#161823] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all text-gray-100 placeholder-gray-600 shadow-inner"
              placeholder="写个震撼全场、引爆热度的震撼标题吧（最多80字）..."
              required
            />
          </div>

          <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
            <span class="text-[11px] text-gray-500 font-mono animate-pulse" v-if="isSubmitting">
              ⚡ 正在将多媒体流向 MinIO 投送...
            </span>
            <span v-else class="text-[11px] text-gray-600 font-mono">// 提示：发布成功后作品将自动并网全广场Feed流</span>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transform-gpu"
            >
              {{ isSubmitting ? '正在拼命上架中...' : '🚀 立即公开发布作品' }}
            </button>
          </div>

        </form>

        <div v-if="isSubmitting" class="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 rounded-2xl">
          <svg class="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div class="text-center space-y-1">
            <p class="text-sm font-bold tracking-widest text-gray-200">全栈多媒体管道正在高速落盘...</p>
            <p class="text-[11px] text-gray-500 font-mono">正在跨域投递多媒体块至 MinIO 桶阵列 ➡️ 落盘 MySQL</p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request.js'
import TheNavbar from '@/components/TheNavbar.vue'

const router = useRouter()
const isSubmitting = ref(false)

const videoInput = ref(null)
const coverInput = ref(null)

// 响应式本地无损预览路径纽带
const videoPreviewUrl = ref('')
const coverPreviewUrl = ref('')

const uploadForm = reactive({
  title: '',
  tags: '',
  videoFile: null,
  coverFile: null,
  duration: 0,
})

const triggerVideoInput = () => videoInput.value.click()
const triggerCoverInput = () => coverInput.value.click()

// 💡 核心机制：捕获视频本地流，并建立高速虚拟本地预览通道
const onVideoFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 50 * 1024 * 1024) {
    alert('作品体积太大啦，请压缩至 50MB 以内再来投稿哦！')
    return
  }

  uploadForm.videoFile = file
  // 如果之前已经生成过老虚拟预览，先手动销毁释放内存空间，防止浏览器爆栈
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value)
  // 生成秒级拉流预览网络黑魔法
  const vUrl = URL.createObjectURL(file)
  videoPreviewUrl.value = vUrl
  const tempVideo = document.createElement('video')
  tempVideo.src = vUrl
  tempVideo.onloadedmetadata = () => {
    // tempVideo.duration 返回的是带小数的秒数（如 45.23），我们用 Math.round 取整
    uploadForm.duration = Math.round(tempVideo.duration)
    console.log(`🎬 浏览器前端已成功捕获本地视频绝对时长: [${uploadForm.duration}] 秒`)
  }
}

// 捕获封面图片
const onCoverFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('封面图片不能超过 5MB')
    return
  }
  uploadForm.coverFile = file
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  coverPreviewUrl.value = URL.createObjectURL(file)
}

const handlePublishVideo = async () => {
  // 防御前置：检查必填单据
  if (!uploadForm.videoFile || !uploadForm.coverFile) {
    alert('视频文件和封面海报都是必填的，一个都不能少哦！')
    return
  }

  try {
    isSubmitting.value = true // 拉起带有高阶毛玻璃的防爆阻断大舱门！

    // 拼装大厂级标准的二进制多媒体包对象
    const formData = new FormData()
    formData.append('title', uploadForm.title)
    formData.append('video', uploadForm.videoFile) // 💡 严格对齐你 Go 后端的 c.FormFile("video")
    formData.append('cover', uploadForm.coverFile) // 💡 严格对齐你 Go 后端的 c.FormFile("cover")
    formData.append('tags', uploadForm.tags)
    formData.append('duration', uploadForm.duration)
    console.log('📤 [Upload] 正在全力将多媒体复合 FormData 送至服务器网关...')

    // 轰炸我们在 Go 后端配置的授权路由：authGroup.POST("/video/publish", ...)
    const res = await request.post('/video/publish', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } // 强行拉满多媒体传输信道
    })

    if (res && res.code === 1) {
      alert('🎉 作品发布成功！新视频已并网，正在全速加入广场推荐池！')
      router.push('/')
    } else {
      alert(`发布失败啦：${res.msg || '未知服务器错误'}`)
    }
  } catch (error) {
    console.error('❌ [Upload] 全栈上传链路遭遇严重事故崩溃:', error)
    alert('网络管道大崩溃，请检查后端网关和 MinIO 服务状态！')
  } finally {
    isSubmitting.value = false // 无论死活，最后关闭阻断舱
  }
}

// 💡 终极战后打扫：页面销毁时，顺手帮浏览器把本地的 blob 临时内存碎片一网打尽，绝不留任何泄露漏洞！
onBeforeUnmount(() => {
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value)
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
})
</script>
