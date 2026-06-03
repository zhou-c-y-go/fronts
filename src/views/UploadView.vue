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

        <form @submit.prevent="handleMultipartUpload" class="space-y-6">

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">1. 上传精选短视频源文件</label>
            <div class="bg-[#161823] border border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-pink-500/60 transition-all cursor-pointer relative group" @click="triggerVideoInput">
              <input type="file" ref="videoInput" class="hidden" accept="video/*" @change="onVideoFileSelected" />
              <div class="space-y-2 text-xs text-gray-400" v-if="!uploadForm.videoFile">
                <p class="text-3xl group-hover:animate-bounce transition-all">📤</p>
                <p class="text-gray-300 font-semibold">点击选择本地视频文件进行上架</p>
                <p class="text-[10px] text-gray-600">🚀 已并网分片直传：打破50MB局限，支持最大 1GB 超清极客作品！</p>
              </div>
              <div v-else class="text-xs text-emerald-400 flex items-center justify-center space-x-2 font-mono">
                <span>✅ 已成功捕获视频流：{{ uploadForm.videoFile.name }} ({{ (uploadForm.videoFile.size / 1024 / 1024).toFixed(2) }} MB)</span>
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
                <span>✅ 封面图已就位：{{ uploadForm.coverFile.name }} ({{ (uploadForm.coverFile.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">3. 打上潮流分类标签（Tags）</label>
            <input
              v-model="uploadForm.tags"
              type="text"
              class="w-full bg-[#161823] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all text-gray-100 placeholder-gray-600 shadow-inner"
              placeholder="输入视频标签，用逗号或空格隔开（如：游戏, 二次元, 搞笑）..."
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">4. 创作灵魂视频标题/描述</label>
            <input
              v-model="uploadForm.title"
              type="text"
              maxlength="80"
              class="w-full bg-[#161823] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-all text-gray-100 placeholder-gray-600 shadow-inner"
              placeholder="写个震撼全场、引爆热度的震撼标题吧（最多80字）..."
              required
            />
          </div>

          <div v-if="uploadProgress > 0" class="space-y-2 bg-[#161823] p-4 rounded-xl border border-gray-800 animate-pulse">
            <div class="flex justify-between text-xs font-mono text-gray-400">
              <span>🚀 绕过业务服务器：正在通过分布式专属信道向 MinIO 投递分片肉块...</span>
              <span class="text-pink-500 font-bold">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-900 rounded-full overflow-hidden p-[1px]">
              <div
                class="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-200 rounded-full"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
            <span class="text-[11px] text-gray-500 font-mono animate-pulse" v-if="isSubmitting">
              ⚡ 正在轰炸分布式直传管道，拒绝任何内存占用...
            </span>
            <span v-else class="text-[11px] text-gray-600 font-mono">// 提示：发布成功后作品将自动并网全广场Feed流</span>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl transition-all active:scale-95 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed transform-gpu"
            >
              {{ isSubmitting ? '正在安全投递切片...' : '🚀 立即公开发布作品' }}
            </button>
          </div>

        </form>

        <div v-if="isSubmitting && uploadProgress === 0" class="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 rounded-2xl">
          <svg class="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div class="text-center space-y-1">
            <p class="text-sm font-bold tracking-widest text-gray-200">切片已全部收网！</p>
            <p class="text-[11px] text-gray-500 font-mono">Go 后端指挥部正命令 MinIO 底层执行零拷贝组装合并 ➡️ 写入 MySQL</p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request.js' //
import TheNavbar from '@/components/TheNavbar.vue' //
import axios from "axios"; //

const router = useRouter() //
const isSubmitting = ref(false) //

const videoInput = ref(null) //
const coverInput = ref(null) //

const videoPreviewUrl = ref('') //
const coverPreviewUrl = ref('') //
const uploadProgress = ref(0) //

const uploadForm = reactive({ //
  title: '', //
  tags: '', //
  videoFile: null, //
  coverFile: null, //
  duration: 0, //
})

const triggerVideoInput = () => videoInput.value.click() //
const triggerCoverInput = () => coverInput.value.click() //

// 大文件分片直传防爆发动机
const handleMultipartUpload = async () => {
    // ==================== 🎬 第一步：拿着单据，去 Go 后端“拿通行证” ====================
  console.log('🎨 [直传雷达] 正在向 Go 后端申请封面海报的单次直传通行证...')

  const coverSignRes = await request.post('/video/get-presigned-url', {
    bucket: 'covers',               // 🎯 告诉后端：我要往 covers 桶里存货
    object_name: uniqueCoverName    // 🎯 告诉后端：我给这张图起名叫 uniqueCoverName
  })
  if (!coverSignRes || coverSignRes.code !== 1) {
    alert('❌ 封面直传通道并网初始化失败')
    return
  }
  // 拿到后端利用 MinIO 算出来的黄金签名直传链接！
  const presignedPutUrl = coverSignRes.data.url
  // ==================== 🚀 第二步：绕过 Go 后端，拿着链接“直接轰炸 MinIO” ====================
  console.log('🚀 [直传雷达] 拿到直传票据，正在越过业务服务直击 MinIO covers 桶...')
  // 💡 大厂至尊微操：这里必须使用原生的、干净的 `import axios from "axios"`
  // 绝对不能用加了全局 Token 拦截器的 `request`！否则请求头带上 Token 会导致 MinIO 报签名不匹配（SignatureDoesNotMatch）！
  await axios.put(presignedPutUrl, uploadForm.coverFile, {
    headers: {
      // 动态识别图片的真实 MIME 类型（如 image/jpeg, image/png），让浏览器拉取时能秒级渲染
      'Content-Type': uploadForm.coverFile.type || 'image/jpeg'
    }
  })
  console.log('✅ 封面海报直传大功告成！流量完全被 MinIO 扛下，Go 后端内存毫发无损！')
  // 1. 安全前置安检：一个都不能少
  if (!uploadForm.videoFile || !uploadForm.coverFile) {
    alert('视频源文件和海报封面都是必填的，一个都不能少哦！')
    return
  }

  const videoFile = uploadForm.videoFile
  const coverFile = uploadForm.coverFile

  // 2. 规整切片尺寸：大厂标准单块 5MB
  const chunkSize = 5 * 1024 * 1024 //
  const totalChunks = Math.ceil(videoFile.size / chunkSize) //

  // 生成独一无二的对象名，防止多人在同一微秒内发布重名多媒体文件
  const uniqueVideoName = `${Date.now()}_video_${videoFile.name}`
  const uniqueCoverName = `${Date.now()}_cover_${coverFile.name}`

  try {
    // 💡 状态提权：拉起毛玻璃并全自动初始化进度条
    isSubmitting.value = true
    uploadProgress.value = 1 // 给进度条一个初始的启动视觉

    // ==================== 🎬 第一战场：搞定封面海报的预签名直传 ====================
    console.log('🎨 [直传雷达] 正在向 Go 后端申请封面海报的单次直传通行证...')
    const coverSignRes = await request.post('/video/get-presigned-url', {
      bucket: 'covers',
      object_name: uniqueCoverName
    })

    if (!coverSignRes || coverSignRes.code !== 1) {
      throw new Error('海报直传通道并网初始化失败')
    }

    console.log('🚀 [直传雷达] 拿到了海报直传票据，正在越过业务服务直击 MinIO covers 桶...')
    // 使用纯净的 axios 单次 PUT 发送海报二进制流
    await axios.put(coverSignRes.data.url, coverFile, {
      headers: { 'Content-Type': coverFile.type || 'image/jpeg' }
    })
    console.log('✅ 封面海报直传大功告成！')

    // ==================== 🎥 第二战场：开启大视频的“五马分尸”分片直传 ====================
    console.log(`📦 [分片引擎] 视频启动切片！总体积: ${(videoFile.size/1024/1024).toFixed(2)}MB, 将被裁切为 [${totalChunks}] 块`); //

    // 🔔 步骤 A：回源 Go 后端，初始化分片大局，索要 UploadID 和 预签名 URL 阵列
    const initRes = await request.post('/video/init-multipart', {
      object_name: uniqueVideoName,
      chunk_count: totalChunks
    }) //

    if (!initRes || initRes.code !== 1) { //
      throw new Error('视频分片通道并网初始化失败')
    }

    const { upload_id, urls } = initRes.data //
    const completedParts = [] //

    // 🔔 步骤 B：多线程串行无感搬运切片大军
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize //
      const end = Math.min(start + chunkSize, videoFile.size) //
      const chunkBlob = videoFile.slice(start, end) // 👑 原地零拷贝逻辑切片！

      // 调用纯净 axios 直传给指定分片的预签名 URL 通道
      const uploadChunkRes = await axios.put(urls[i], chunkBlob, {
        headers: { 'Content-Type': 'application/octet-stream' }
      }) //

      // 强行扣留当前切片专属的 ETag 身份证
      const etag = uploadChunkRes.headers['etag'] //
      if (!etag) throw new Error(`第 [${i+1}] 片上架时丢失了 ETag 身份证`)

      completedParts.push({
        part_number: i + 1, //
        etag: etag.replace(/"/g, '') // 擦除引号干扰
      }) //

      // 刷新炫酷的流光进度条
      uploadProgress.value = Math.round(((i + 1) / totalChunks) * 100) //
    }

    console.log('✅ 所有视频切片在 MinIO 稳妥落盘！向后端下发最终合并指令...') //

    // ==================== 🧱 第三战场：向 Go 指挥部丢收网合并暗号（控制流合并入库） ====================
    // 进度条归零，让毛玻璃出现“正在执行零拷贝组装合并”的提示
    uploadProgress.value = 0

    const completeRes = await request.post('/video/complete-multipart', {
      upload_id: upload_id, //
      object_name: uniqueVideoName, //
      cover_name: uniqueCoverName,  // 顺带捎上刚才直传成功的唯一海报对象名
      title: uploadForm.title, //
      tags: uploadForm.tags, //
      duration: uploadForm.duration // 捎上我们在 onVideoFileSelected 扣留的高精度时长！
    }) //

    if (completeRes && completeRes.code === 1) { //
      alert('🎉 大视频高并发分片直传完全体并网成功！') //
      router.push('/')
    } else {
      alert(`合并入库大出问题啦：${completeRes.msg || '未知错误'}`)
    }

  } catch (error) {
    console.error('❌ [Multipart Error] 全栈抛投链路遭遇大灾难崩溃:', error) //
    alert('直传信道彻底翻车，内存隔离失败！请检查后端网关和 MinIO 桶状态！')
  } finally {
    isSubmitting.value = false // 无论死活，最后关闭阻断舱
    uploadProgress.value = 0
  }
}

// 前置雷达安检线：建立高速虚拟本地预览通道
const onVideoFileSelected = (event) => {
  const file = event.target.files[0] //
  if (!file) return //

  if (file.size > 1024 * 1024 * 1024) {
    alert('作品体积有点太大了，分片通道上限为 1GB 哦！')
    return
  }

  uploadForm.videoFile = file //
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value) //

  const vUrl = URL.createObjectURL(file) //
  videoPreviewUrl.value = vUrl //

  const tempVideo = document.createElement('video') //
  tempVideo.src = vUrl //
  tempVideo.onloadedmetadata = () => { //
    uploadForm.duration = Math.round(tempVideo.duration) //
    console.log(`🎬 浏览器前端已成功捕获本地视频绝对时长: [${uploadForm.duration}] 秒`) //
  }
}

// 捕获封面图片并建立预览通道
const onCoverFileSelected = (event) => {
  const file = event.target.files[0] //
  if (!file) return //
  if (file.size > 10 * 1024 * 1024) { // 提权到 10MB，适应高精度原画海报
    alert('封面图片不能超过 10MB')
    return
  }
  uploadForm.coverFile = file //
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value) //
  coverPreviewUrl.value = URL.createObjectURL(file) //
}

// 战后大扫除：清空 Blob 内存碎片，防范长期霸占浏览器爆栈
onBeforeUnmount(() => {
  if (videoPreviewUrl.value) URL.revokeObjectURL(videoPreviewUrl.value) //
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value) //
})
</script>

<style scoped>
/* 注入精美毛玻璃背景动画支持 */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
