<template>
  <div class="min-h-screen bg-[#0f1015] text-white flex flex-col font-sans">
    <header class="h-16 w-full border-b border-gray-800/60 bg-[#161823] flex items-center justify-between px-6 flex-shrink-0 z-50">
      <div class="flex items-center space-x-2 text-pink-500 font-bold text-lg tracking-wider cursor-pointer" @click="router.push('/')">
        <span>🚀</span>
        <span>GeekVideo</span>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden w-full max-w-[1700px] mx-auto px-4 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-6">

      <main class="flex-[7] flex flex-col bg-[#161823] relative overflow-y-auto rounded-2xl shadow-2xl border border-gray-800/60" style="scrollbar-width: none;">

        <div class="flex-[3] bg-[#161823] flex flex-col h-full relative shadow-2xl z-10 rounded-2xl border border-gray-800/60">
          <video
            v-if="videoDetail.videoUrl"
            :src="videoDetail.videoUrl"
            :poster="videoDetail.coverUrl"
            controls
            autoplay
            class="w-full h-full object-contain outline-none"
          ></video>
          <div v-else class="text-gray-600 flex flex-col items-center space-y-2 animate-pulse">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span class="text-sm tracking-widest">正在建立底层流媒体连接...</span>
          </div>
        </div>

        <div class="p-6 md:p-8 space-y-6">
          <div class="space-y-3">
            <h1 class="text-2xl md:text-3xl font-bold tracking-wide text-gray-100 drop-shadow-sm">{{ videoDetail.title || '加载中...' }}</h1>
            <div class="flex items-center text-xs font-mono text-gray-500 space-x-6">
              <span>📅 {{ formatDate(videoDetail.createdAt) }}</span>
              <span>⏱️ {{ videoDetail.duration || 0 }} 秒</span>
              <span v-if="!parsedTags.length" class="text-gray-500">🏷️ 暂无标签</span>
                <a
                  v-else
                  v-for="(tag, index) in parsedTags"
                  :key="index"
                  @click.prevent="handleTagClick(tag)"
                  class="group flex items-center text-[13px] text-gray-300 hover:text-pink-400 transition-colors duration-200 cursor-pointer"
                >
                  <span class="group-hover:underline underline-offset-4">#{{ tag }}</span>
                </a>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-b border-gray-800/60 py-5">
            <div class="flex items-center space-x-4 cursor-pointer group">
              <img :src="videoDetail.author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'"
                   class="w-12 h-12 rounded-full border border-gray-700 group-hover:border-pink-500 transition-all"
                   @click="goToCenter(videoDetail.author.id)"
              />
              <div>
                <p class="font-bold text-gray-200 group-hover:text-pink-400 transition-colors">{{ videoDetail.author?.username || '神秘极客' }}</p>
                <p class="text-xs text-gray-500">{{ videoDetail.author?.signature || '这个人很懒，什么都没留下' }}</p>
              </div>
              <button class="ml-4 px-4 py-1.5 bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full text-xs font-bold transition-all">
                + 关注
              </button>
            </div>

            <div class="flex items-center space-x-6">
              <LikeButton
                v-model:is-liked="videoDetail.isLiked"
                v-model:like-count="videoDetail.likeCount"
                :target-id="videoDetail.id"
                target-type="video"
              />

              <FavoriteButton
                v-model:is-favorited="videoDetail.isFavorite"
                v-model:favorite-count="videoDetail.favoriteCount"
                target-type="video"
                :target-id="videoDetail.id"
              />
            </div>
          </div>
        </div>
      </main>

      <aside class="flex-[3] bg-[#161823] flex flex-col h-full border-l border-gray-800/50 relative shadow-[-10px_0_20px_rgba(0,0,0,0.3)] z-10">

        <div class="p-4 border-b border-gray-800/80 shrink-0">
<!--          TODO：视频对应多少个评论-->总共{{ commentTree.length }}条主评论
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-6" style="scrollbar-width: thin; scrollbar-color: #374151 #161823;">
          <div v-if="commentTree.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
            <svg class="w-10 h-10 stroke-current opacity-50" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span class="text-xs">还没有人说话，快来抢沙发！</span>
          </div>

          <div v-for="rootComment in commentTree" :key="rootComment.id" class="space-y-4">

            <div class="flex space-x-3 group">
              <img :src="rootComment.user.avatar"
                   class="w-8 h-8 rounded-full border border-gray-700 mt-1 cursor-pointer"
                   @click="goToCenter(rootComment.user.id)"
              />
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-400 font-medium">{{ rootComment.user.username }}</span>
                  <span class="text-[10px] text-gray-600 font-mono">{{ formatDate(rootComment.created_at) }}</span>
                  <LikeButton
                    v-model:is-liked="rootComment.is_liked"
                    v-model:like-count="rootComment.like_count"
                    :target-id="rootComment.id"
                    target-type="comment"
                  />
                </div>
                <p class="text-sm text-gray-200 leading-relaxed">{{ rootComment.content }}</p>
                <div class="text-[11px] text-gray-500 pt-1 cursor-pointer hover:text-gray-300 transition-colors w-max" @click="setReplyTarget(rootComment)">
                  回复
                </div>
              </div>
            </div>

            <div v-if="rootComment.children && rootComment.children.length > 0" class="pl-11 space-y-4">
              <div v-for="child in flattenChildren(rootComment.children)" :key="child.id" class="flex space-x-3 group">
                <img
                  :src="child.user.avatar"
                  class="w-6 h-6 rounded-full border border-gray-700 mt-1 cursor-pointer"
                  @click="goToCenter(child.user.id)"
                />
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <div class="text-[12px] font-medium flex items-center">
                      <span class="text-gray-400">{{ child.user.username }}</span>

                      <template v-if="child.targetUsername">
                        <span class="text-gray-600 mx-1.5 text-[10px]">▸</span>
                        <span class="text-gray-500">{{ child.targetUsername }}</span>
                      </template>
                      <LikeButton
                          v-model:is-liked="child.is_liked"
                          v-model:like-count="child.like_count"
                          :target-id="child.id"
                          target-type="comment"
                      />
                    </div>
                    <span class="text-[10px] text-gray-600 font-mono">{{ formatDate(child.created_at) }}</span>
                  </div>
                  <p class="text-[13px] text-gray-300 leading-relaxed">{{ child.content }}</p>
                  <div class="text-[11px] text-gray-500 pt-1 cursor-pointer hover:text-gray-300 transition-colors w-max" @click="setReplyTarget(child)">
                    回复
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="p-4 bg-[#1a1c29] border-t border-gray-800 shrink-0">
          <div v-if="replyTarget" class="flex items-center justify-between bg-gray-800/50 px-3 py-1.5 rounded-t-lg text-xs text-gray-400">
            <span>正在回复 @<span class="text-pink-400">{{ replyTarget.user.username }}</span></span>
            <button @click="clearReplyTarget" class="hover:text-gray-200">❌</button>
          </div>
          <div class="flex items-end space-x-2">
            <textarea
              v-model="commentInput"
              rows="2"
              class="flex-1 bg-[#0f1015] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-pink-500 focus:outline-none transition-colors resize-none shadow-inner"
              :placeholder="replyTarget ? '写下你的神回复...' : '发一条友善的评论支持一下吧...'"
            ></textarea>
            <button
              @click="submitComment"
              :disabled="!commentInput.trim() || isSubmittingComment"
              class="px-5 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shrink-0"
            >
              {{ isSubmittingComment ? '发送中' : '发送' }}
            </button>
          </div>
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request.js'
import LikeButton from "@/components/LikeButton.vue";
import FavoriteButton from "@/components/FavoriteButton.vue";

const route = useRoute()
const router = useRouter()
const videoId = route.params.id


// ==================== 🎬 视频详情流 ====================
const videoDetail = ref({})
// 预留的状态墙

const fetchVideoDetail = async () => {
  try {
    const res = await request.get(`/video/detail?id=${videoId}`)
    if (res && res.code === 1) {
      const d = res.data   // 注意：这里 res.data 就是视频详情对象，因为后端返回的是 { code, data } 结构
      videoDetail.value = {
        id: d.id,
        title: d.title,
        videoUrl: d.video_url || d.VideoUrl,
        coverUrl: d.cover_url || d.CoverUrl,
        createdAt: d.created_at || d.CreatedAt,
        likeCount: d.like_count || d.LikeCount || 0,
        favoriteCount: d.favorite_count || d.FavoriteCount || 0,
        duration: d.duration || 0,
        tags: d.tags || '',
        author: d.author || {},
        isLiked: d.is_like || d.IsLike || false,   // ✅ 直接从 d 中取
        isFavorite: d.is_favorite || d.isFavorite || false,
      }
    }
  } catch (error) {
    console.error("❌ 拉取视频详情失败:", error)
  }
}
console.log(videoDetail.value.isLiked)
// ==================== 💬 评论树流 ====================
const commentTree = ref([])
const commentInput = ref('')
const isSubmittingComment = ref(false)
const replyTarget = ref(null) // 锁定当前正在回复谁

const fetchCommentTree = async () => {
  try {
    // 召唤我们在上一轮用双轮指针零递归写出的完美的树状查询接口！
    const res = await request.get(`/comment/tree?video_id=${videoId}`)
    if (res && res.code === 1) {
      commentTree.value = res.data || []
    }
  } catch (error) {
    console.error("❌ 捞取评论大军遭遇滑铁卢:", error)
  }
}

// 设定回复靶标
const setReplyTarget = (commentItem) => {
  replyTarget.value = commentItem
}
// 清除回复靶标
const clearReplyTarget = () => {
  replyTarget.value = null
}

const submitComment = async () => {
  if (!commentInput.value.trim()) return
  try {
    isSubmittingComment.value = true

    // 组装评论投递大礼包
    const payload = {
      video_id: Number(videoId),
      content: commentInput.value.trim(),
      reply_to_id: replyTarget.value ? replyTarget.value.id : 0
    }

    // 轰炸我们刚预留的鉴权写入管道！
    const res = await request.post('/comment', payload)

    if (res && res.code === 1) {
      commentInput.value = ''
      clearReplyTarget()
      // 评论发送成功后，原地秒级刷新整棵评论树，享受 MySQL Path 字典序带来的极致回显！
      await fetchCommentTree()
    } else {
      alert(res.msg || '评论发送失败')
    }
  } catch (error) {
    console.error("❌ 评论写入管道崩溃:", error)
  } finally {
    isSubmittingComment.value = false
  }
}


// ==================== 工具函数 ====================
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 跳转到个人空间
const goToCenter = (authorId) => {
  if(!authorId) {
    return
  }
  const routeUrl = router.resolve({path: `/user/${authorId}`})
  window.open(routeUrl.href, '_blank')
}

// 标签切片器：将后端的单行字符串切碎成超级话题数组
const parsedTags = computed(() => {
  const rawTags = videoDetail.value.tags
  if (!rawTags) return []
  // 使用正则同时兼容英文逗号、中文逗号、甚至空格，并过滤掉空切片
  return rawTags.split(/[,，\s]+/).filter(tag => tag.trim() !== '')
})

//TODO 预留的标签点击事件
const handleTagClick = (tag) => {
  console.log(`🚀 准备起飞，前往搜索超级话题：#${tag}`)
  // router.push(`/search?keyword=${tag}`)
}

// 生命周期大满贯启动
onMounted(() => {
  fetchVideoDetail()
  fetchCommentTree()
})

const flattenChildren = (children, targetUsername = null) => {
  let result = []
  // 没有子评论
  if (!children || children.length === 0) return result

  children.forEach(child => {
    // 1. 给当前子孙打上烙印：你到底是在回复谁？
    const flatChild = {
      ...child,
      // 🎯 一级子评论（儿子）这里是 null，不会显示小箭头
      // 🎯 二级及以上子评论（孙子、重孙），这里会带上上一代的名字！
      targetUsername: targetUsername
    }
    result.push(flatChild)

    // 2. 如果它还有下一代，把【自己的名字】作为下一代的 targetUsername 传下去！
    if (child.children && child.children.length > 0) {
      // 核心微操：把 child.user.username 传给下一层
      result = result.concat(flattenChildren(child.children, child.user.username))
    }
  })

  return result
}
</script>

<style scoped>
/* 隐藏原生浏览器滚动条，保持极客面板清爽 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0f1015;
}
::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
