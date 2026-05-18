<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">

    <div class="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 w-[1000px] h-[650px] p-12 relative flex flex-col">

      <button class="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 class="text-3xl font-extrabold text-gray-900 text-center mt-6 mb-12">
        登录后免费畅享高清视频
      </h2>

      <div class="flex flex-1 border-t border-gray-100 pt-10">

        <div class="flex-1 flex flex-col items-center px-10 text-center">
          <h3 class="text-xl font-bold text-gray-800 mb-8">扫码登录</h3>

          <div class="bg-white p-2 border border-gray-100 rounded-3xl shadow-lg shadow-gray-100 mb-8 relative">
            <img
              src="../../public/img.png"
              alt="Scan QR Code"
              class="w-56 h-56 rounded-2xl"
            />
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 bg-black rounded-full border-4 border-white flex items-center justify-center shadow-md">
                    <span class="text-white text-2xl font-black">d</span>
                </div>
            </div>
          </div>

          <p class="text-gray-500 text-sm mb-12">
            打开<span class="text-dy-red">「抖音APP」</span>点击左上角<span class="inline-block mx-1">≡</span>扫一扫
          </p>

          <button class="bg-gray-100 text-gray-600 text-sm px-6 py-2 rounded-full hover:bg-gray-200 transition">
            如何扫码
          </button>
        </div>

        <div class="w-px bg-gray-100 mx-4"></div>

        <div class="flex-1 px-10">

          <div class="flex gap-8 mb-10 text-lg border-b border-gray-100 pb-3">
            <button :class="['font-bold pb-2', 'text-gray-950 border-b-4 border-gray-950']">
              密码登录
            </button>
          </div>

          <div class="space-y-6">
            <div class="bg-gray-100 rounded-2xl p-4">
              <input type="text" placeholder="手机号" class="w-full bg-transparent text-lg focus:outline-none" v-model="phone"/>
            </div>
            <div class="bg-gray-100 rounded-2xl p-4">
              <input type="password" placeholder="密码" class="w-full bg-transparent text-lg focus:outline-none" v-model="password"/>
            </div>
          </div>

          <button
            @click="handleLogin"
            :disabled="isLoginDisabled"
            :class="[
              'w-full text-center text-xl font-bold text-white py-5 rounded-2xl mt-12 mb-8 transition',
              isLoginDisabled ? 'bg-dy-red/50 cursor-not-allowed' : 'bg-dy-red hover:bg-dy-red/90'
            ]"
          >
            登录
          </button>

          <div class="text-center text-sm text-gray-500">
            登录即代表同意 <a href="#" class="text-dy-red hover:underline">用户协议</a> 和 <a href="#" class="text-dy-red hover:underline">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // 引入路由
import { useUserStore } from '../stores/user'; // 引入咱们的仓库
import request from '../utils/request';

const phone = ref('');         // 用户输入的手机号
const password = ref('');          // 用户输入的验证码
const router = useRouter();
const userStore = useUserStore();
// 2. 计算属性：判断登录按钮是否应该禁用
// 只有当两个输入框都有内容时，按钮才变亮（模仿抖音的原型逻辑）
const isLoginDisabled = computed(() => {
  return !phone.value || !password.value;
});

// 3. 登录逻辑处理
const handleLogin = async () => {
  if (isLoginDisabled.value) return;
  const payload = {
    // 注意：这里的字段名要和你 Go 后端 request.go 结构体里的 json 标签对齐
    username: phone.value,
    password: password.value,
  };
  try {
    // 真正的网络请求！
    const res = await request.post('/user/login', payload);
    // 假设 Go 返回的数据在 res.data.token 里
    const token = res.data.token;
    // 1. 把 Token 存进 Pinia 和 localStorage
    userStore.setToken(token);
    console.log('登录成功，准备跳转！');
    // 2. 跳转到首页 (记得在 router/index.js 里建一个路径为 '/home' 的路由)
    router.push('/home');
  } catch (error) {
    console.error('登录失败:', error);
    // 错误已经在 request.js 拦截器里 alert 过了，这里无需额外处理
  }
};
</script>

<style scoped>

</style>
