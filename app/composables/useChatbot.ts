import Fuse from 'fuse.js'
import { ref } from 'vue'

export const useChatbot = () => {
  const faq = ref<any[]>([])
  const fuse = ref<any>(null)

  // =========================
  // 🧠 MEMORY (context)
  // =========================
  const lastContext = ref({
    keyword: '',
    intent: ''
  })

  // =========================
  // 🔧 NORMALIZE TEXT
  // =========================
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\bkalo\b/g, '')
      .replace(/\bgimana\b/g, 'cara')
      .replace(/\bapa itu\b/g, '')
      .replace(/\bapa\b/g, '')
      .trim()
  }

  // =========================
  // 🔍 EXTRACT KEYWORD
  // =========================
  const extractKeyword = (text: string) => {
    const match = text.match(/\b[A-Z]{2,}\b/i)
    return match ? match[0].toLowerCase() : null
  }

  // =========================
  // 🎯 DETECT INTENT
  // =========================
  const detectIntent = (text: string) => {
    const t = text.toLowerCase()

    if (t.includes('cara') || t.includes('bagaimana')) return 'cara'
    if (t.includes('apa') || t.includes('pengertian')) return 'definisi'
    if (t.includes('jelas') || t.includes('detail')) return 'detail'
    if (t.includes('kenapa') || t.includes('alasan')) return 'alasan'
    if (t.includes('error') || t.includes('gagal')) return 'error'

    return 'umum'
  }

  // =========================
  // ✨ FORMAT BIAR RAPI
  // =========================
  const formatAnswer = (text: string) => {
    return text
      .replace(/(\d+\.\s)/g, '\n$1')
      .replace(/\n{2,}/g, '\n')
  }

  // =========================
  // 📥 LOAD FAQ
  // =========================
  const loadFAQ = async () => {
    try {
      const data: any = await $fetch('/api/faq')

      faq.value = data

      fuse.value = new Fuse(data, {
        keys: ['pertanyaan'],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 3
      })

    } catch (err) {
      console.error('Gagal load FAQ', err)
    }
  }

  // =========================
  // 🧠 RESPONSE ENGINE
  // =========================
  const getResponse = (query: string) => {
    if (!faq.value.length) return 'Bot belum siap...'

    const normalized = normalize(query)
    const keyword = extractKeyword(query)
    const intent = detectIntent(query)

    const followUpWords = ['kalau', 'terus', 'lalu', 'yang itu', 'yang tadi']
    const isFollowUp = followUpWords.some(w =>
      query.toLowerCase().includes(w)
    )

    let keywordFinal = keyword

    if (!keywordFinal && lastContext.value.keyword) {
      keywordFinal = lastContext.value.keyword
    }

    if (isFollowUp && lastContext.value.keyword) {
      keywordFinal = keyword || lastContext.value.keyword
    }

    if (keywordFinal) {
      const found = faq.value.find(item =>
        item.pertanyaan.toLowerCase().includes(keywordFinal!)
      )

      if (found) {
        const answer = found.jawaban

        lastContext.value.keyword = keywordFinal
        lastContext.value.intent = intent

        if (intent === 'detail') {
          return `### 📘 Penjelasan Lengkap ${keywordFinal.toUpperCase()}\n\n${answer}`
        }

        if (intent === 'definisi') {
          return `### 📌 Penjelasan\n\n${answer}`
        }

        if (intent === 'cara') {
          return `### 🛠️ Cara / Prosedur\n\n${answer}`
        }

        if (intent === 'error') {
          return `### ⚠️ Kemungkinan Masalah\n\n${answer}`
        }

        return answer
      }
    }

    if (fuse.value) {
      const result = fuse.value.search(normalized)

      if (result.length) {
        const answer = result[0].item.jawaban

        lastContext.value.keyword =
          extractKeyword(result[0].item.pertanyaan) || ''

        return answer
      }
    }

    if (normalized.length <= 5) {
      const found = faq.value.find(item =>
        item.pertanyaan.toLowerCase().includes(normalized)
      )

      if (found) return found.jawaban
    }

    return 'Maaf, saya belum menemukan jawaban 😅\nCoba gunakan kata lain ya.'
  }

  return {
    loadFAQ,
    getResponse
  }
}