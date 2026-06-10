<template>
  <div class="like-button-container" @click.stop="handleLikeToggle">
    <!-- 💖 动感爱心图标 SVG 阵列 -->
    <svg
      class="heart-icon"
      :class="{ 'is-active': localIsLiked, 'is-animating': isAnimating }"
      viewBox="0 0 32 32"
    >
      <path d="M16 28.5s-12-7.3-12-14.5c0-4 3.2-7.2 7.2-7.2 2.7 0 5 1.5 6.1 3.7 1.1-2.2 3.4-3.7 6.1-3.7 4 0 7.2 3.2 7.2 7.2 0 7.2-12 14.5-12 14.5z"/>
    </svg>

    <!-- 📈 数字化动态计数器 -->
    <span class="like-count" :class="{ 'is-active': localIsLiked }">
      {{ displayedLikeCount }}
    </span>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import request from "@/utils/request.js"

const props = defineProps({
  targetId: {
    type: [String, Number],
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  likeCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:isLiked', 'update:likeCount'])

const localIsLiked = ref(props.isLiked)
const localLikeCount = ref(props.likeCount)
const isAnimating = ref(false)
let debounceTimer = null

watch(() => props.isLiked, (val) => localIsLiked.value = val)
watch(() => props.likeCount, (val) => localLikeCount.value = val)

const displayedLikeCount = computed(() => {
  const count = localLikeCount.value
  if (count < 0) return 0
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
})

const handleLikeToggle = () => {
  if (!localIsLiked.value) {
    isAnimating.value = true
    setTimeout(() => { isAnimating.value = false }, 800)
  }

  // 1. ⚡ 乐观UI本地更新
  localIsLiked.value = !localIsLiked.value
  localLikeCount.value += localIsLiked.value ? 1 : -1

  // 2. 🎯 【核心微操 1】：在改变的瞬间，用快照锁死最终期望发送的 status 暗号！
  // 坚决剥夺 350ms 内 watch 监听器造反篡改数据的权利！
  const targetStatus = localIsLiked.value ? 1 : 0

  emit('update:isLiked', localIsLiked.value)
  emit('update:likeCount', localLikeCount.value)

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    // 🚀 把锁定的暗号直接灌进发送函数里
    sendLikeRequestToBackend(targetStatus)
  }, 350)
}

const sendLikeRequestToBackend = async (status) => {
  try {
    const responseData = await request.post('/like', {
      target_id: Number(props.targetId),
      target_type: props.targetType,
      status: status
    })

    if (responseData && responseData.code === 1) {
      // 同步服务器真实状态
      const serverLiked = responseData.data.is_liked
      if (localIsLiked.value !== serverLiked) {
        localIsLiked.value = serverLiked
        localLikeCount.value = serverLiked ? localLikeCount.value + 1 : localLikeCount.value - 1
        emit('update:isLiked', localIsLiked.value)
        emit('update:likeCount', localLikeCount.value)
      }
    } else {
      // ⚠️ 业务失败 → 回滚乐观更新
      console.warn('点赞业务失败，回滚:', responseData?.msg)
      localIsLiked.value = !localIsLiked.value
      localLikeCount.value += localIsLiked.value ? 1 : -1
      emit('update:isLiked', localIsLiked.value)
      emit('update:likeCount', localLikeCount.value)
    }
  } catch (error) {
    // 网络错误同样回滚
    console.error('点赞请求异常:', error)
    localIsLiked.value = !localIsLiked.value
    localLikeCount.value += localIsLiked.value ? 1 : -1
    emit('update:isLiked', localIsLiked.value)
    emit('update:likeCount', localLikeCount.value)
  }
}
</script>

<style scoped>
.like-button-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  transition: transform 0.1s ease;
}

.like-button-container:active {
  transform: scale(0.92);
}

.heart-icon {
  width: 22px;
  height: 22px;
  fill: none; /* 🌟 贴心微调：确保未激活时爱心内部是剔透镂空的，不被黑色吞噬 */
  stroke: #666;
  stroke-width: 2.5;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.heart-icon.is-active {
  fill: #ff2442;
  stroke: #ff2442;
  filter: drop-shadow(0 2px 4px rgba(255, 36, 66, 0.3));
}

@keyframes heartPulse {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(0.85); }
  42% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.heart-icon.is-animating {
  animation: heartPulse 0.6s ease-in-out;
}

.like-count {
  font-size: 14px;
  color: #666;
  margin-left: 6px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.like-count.is-active {
  color: #ff2442;
}
</style>
