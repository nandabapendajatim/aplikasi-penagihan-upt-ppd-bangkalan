<template>
  <div>
    <!-- FLOATING BUTTON -->
    <button
      @click="open = !open"
      class="fixed bottom-4 right-4 btn btn-primary rounded-full shadow-lg z-50"
    >
      💬
    </button>

    <!-- CHAT BOX -->
    <div
      v-if="open"
      class="fixed bottom-20 right-4 w-80 bg-base-100 shadow-xl rounded-xl flex flex-col z-50"
    >

      <!-- HEADER -->
      <div class="bg-primary text-primary-content p-3 rounded-t-xl font-bold">
        🤖 Asisten Dinas
      </div>

      <!-- CHAT -->
      <div class="space-y-2 max-h-80 overflow-y-auto p-3 text-sm">

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="msg.sender === 'user' ? 'text-right' : 'text-left'"
        >
          <div
            :class="[
              'inline-block px-3 py-2 rounded-lg max-w-[80%]',
              msg.sender === 'user'
                ? 'bg-primary text-white'
                : 'bg-base-200 text-base-content'
            ]"
          >
            <div v-if="msg.isHtml" v-html="msg.text"></div>
            <div v-else>{{ msg.text }}</div>
          </div>
        </div>

        <!-- LOADING -->
        <div v-if="isTyping" class="text-left">
          <div class="inline-block px-3 py-2 rounded-lg bg-base-200">
            <span class="loading loading-dots loading-sm"></span>
          </div>
        </div>

      </div>

      <!-- INPUT -->
      <div class="p-2 border-t flex gap-2">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="Tanya sesuatu..."
          class="input input-bordered input-sm w-full"
        />
        <button @click="sendMessage" class="btn btn-sm btn-primary">
          Kirim
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const open = ref(false)
const input = ref('')

const messages = ref<any[]>([
  {
    sender: 'bot',
    text: md.render('Halo 👋\nSaya bisa bantu seputar **dinas luar**'),
    isHtml: true
  }
])

const isTyping = ref(false)

const { loadFAQ, getResponse } = useChatbot()

onMounted(() => {
  loadFAQ()
})

/**
 * ✨ Typing Effect + Markdown
 */
const typeEffect = async (text: string, targetMsg: any) => {
  let temp = ''
  isTyping.value = true

  for (let i = 0; i < text.length; i++) {
    temp += text[i]

    targetMsg.text = md.render(temp)
    targetMsg.isHtml = true

    await new Promise(resolve => setTimeout(resolve, 15))
  }

  isTyping.value = false
}

/**
 * 🚀 SEND MESSAGE
 */
const sendMessage = async () => {
  if (!input.value) return

  const userText = input.value

  messages.value.push({
    sender: 'user',
    text: userText
  })

  input.value = ''

  // loading dummy
  messages.value.push({
    sender: 'bot',
    text: '...'
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  const response = getResponse(userText)

  // hapus loading
  messages.value.pop()

  const botMsg = {
    sender: 'bot',
    text: '',
    isHtml: true
  }

  messages.value.push(botMsg)

  await typeEffect(response, botMsg)
}
</script>