import router from "@/router/index.js";

export const openVideoDetail = (videoId) => {
  if (!videoId) return

  // 1. 利用 Vue Router 的 resolve 神技，把动态路由转换为真实的浏览器绝对 URL（比如 /video/12）
  const routeUrl = router.resolve({ path: `/video/${videoId}` })
  // 2. 召唤浏览器底层 API：'_blank' 代表强制开启全新标签页！
  window.open(routeUrl.href, '_blank')
}
