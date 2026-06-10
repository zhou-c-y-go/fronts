<template>
  <div class="favorite-button-container" @click.stop="handleFavoriteToggle">
    <!-- ⭐ 星形收藏图标 SVG -->
    <svg
      class="star-icon"
      :class="{ 'is-active': localIsFavorited, 'is-animating': isAnimating }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>

    <!-- 📊 收藏计数器 -->
    <span class="favorite-count" :class="{ 'is-active': localIsFavorited }">
      {{ displayedFavoriteCount }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import request from '@/utils/request.js'

const props = defineProps({
  targetId: { type: [String, Number], required: true },
  targetType: { type: String, required: true },
  isFavorited: { type: Boolean, default: false },   // ✅ 改为 isFavorited
  favoriteCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:isFavorited', 'update:favoriteCount'])

const localIsFavorited = ref(props.isFavorited)
const localFavoriteCount = ref(props.favoriteCount)
const isAnimating = ref(false)
let debounceTimer = null

watch(() => props.isFavorited, (val) => localIsFavorited.value = val)
watch(() => props.favoriteCount, (val) => localFavoriteCount.value = val)

const displayedFavoriteCount = computed(() => {
  const count = localFavoriteCount.value
  if (count < 0) return 0
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  return count
})

const handleFavoriteToggle = () => {
  if (!localIsFavorited.value) {
    isAnimating.value = true
    setTimeout(() => { isAnimating.value = false }, 800)
  }

  localIsFavorited.value = !localIsFavorited.value
  localFavoriteCount.value += localIsFavorited.value ? 1 : -1
  const targetStatus = localIsFavorited.value ? 1 : 0

  emit('update:isFavorited', localIsFavorited.value)
  emit('update:favoriteCount', localFavoriteCount.value)

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    sendFavoriteRequestToBackend(targetStatus)
  }, 350)
}

const sendFavoriteRequestToBackend = async (status) => {
  try {
    const responseData = await request.post('/favorite', {
      target_id: Number(props.targetId),
      target_type: props.targetType,
      status: status
    })

    if (responseData && responseData.code === 1) {
      // ✅ 修正：后端字段是 is_favorite
      const serverFavorited = responseData.data.is_favorite
      if (localIsFavorited.value !== serverFavorited) {
        localIsFavorited.value = serverFavorited
        localFavoriteCount.value = serverFavorited ? localFavoriteCount.value + 1 : localFavoriteCount.value - 1
        emit('update:isFavorited', localIsFavorited.value)
        emit('update:favoriteCount', localFavoriteCount.value)
      }
    } else {
      console.warn('收藏业务失败，回滚:', responseData?.msg)
      localIsFavorited.value = !localIsFavorited.value
      localFavoriteCount.value += localIsFavorited.value ? 1 : -1
      emit('update:isFavorited', localIsFavorited.value)
      emit('update:favoriteCount', localFavoriteCount.value)
    }
  } catch (error) {
    console.error('收藏请求异常:', error)
    localIsFavorited.value = !localIsFavorited.value
    localFavoriteCount.value += localIsFavorited.value ? 1 : -1
    emit('update:isFavorited', localIsFavorited.value)
    emit('update:favoriteCount', localFavoriteCount.value)
  }
}
</script>

<style scoped>
.favorite-button-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  transition: transform 0.1s ease;
}

.favorite-button-container:active {
  transform: scale(0.92);
}

.star-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #666;
  stroke-width: 2;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.star-icon.is-active {
  fill: #fbbf24;     /* 金黄色填充 */
  stroke: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
}

@keyframes starPulse {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(0.85); }
  42% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.star-icon.is-animating {
  animation: starPulse 0.6s ease-in-out;
}

.favorite-count {
  font-size: 14px;
  color: #666;
  margin-left: 6px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.favorite-count.is-active {
  color: #fbbf24;
}
</style>
