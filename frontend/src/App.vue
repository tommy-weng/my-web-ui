<script setup>
import { ref } from 'vue'

const user = ref('')
const pw = ref('')
const msg = ref('')
const msgColor = ref('#333')
const loading = ref(false)

const doLogin = async () => {
  if (loading.value) return
  msg.value = ''
  msgColor.value = '#333'
  loading.value = true

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.value, password: pw.value })
    })

    const result = await response.json()
    msg.value = result.message
    msgColor.value = response.ok ? 'green' : 'red'
  } catch (error) {
    msg.value = '无法连接到服务器，请检查后端是否运行'
    msgColor.value = 'red'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h3>系统登录</h3>
      <input v-model.trim="user" type="text" placeholder="用户名" autocomplete="username" />
      <input v-model.trim="pw" type="password" placeholder="密码" autocomplete="current-password" />
      <button :disabled="loading" @click="doLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p class="msg" :style="{ color: msgColor }">{{ msg }}</p>
    </div>
  </div>
</template>
