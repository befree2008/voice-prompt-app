import { ref, onUnmounted } from 'vue'

/**
 * Web Speech API 语音识别 Hook
 * 支持中英文，实时返回识别结果
 */
export function useVoiceRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref(null)
  const isSupported = ref(false)

  let recognition = null

  // 检查浏览器支持
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  isSupported.value = !!SpeechRecognition

  if (isSupported.value) {
    recognition = new SpeechRecognition()
    recognition.continuous = true       // 持续识别
    recognition.interimResults = true   // 返回临时结果
    recognition.lang = 'zh-CN'          // 默认中文
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalText) {
        transcript.value += finalText
      }
      interimTranscript.value = interimText
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      error.value = getErrorMessage(event.error)
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
      // 把临时结果合并到最终结果
      if (interimTranscript.value) {
        transcript.value += interimTranscript.value
        interimTranscript.value = ''
      }
    }
  }

  /**
   * 开始录音
   */
  const startListening = () => {
    if (!isSupported.value) {
      error.value = '您的浏览器不支持语音识别，请使用 Chrome 浏览器'
      return
    }

    if (isListening.value) return

    // 清空之前的结果
    transcript.value = ''
    interimTranscript.value = ''
    error.value = null

    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      error.value = '启动语音识别失败，请刷新页面重试'
    }
  }

  /**
   * 停止录音
   */
  const stopListening = () => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  /**
   * 切换语言
   */
  const setLanguage = (lang) => {
    if (recognition) {
      recognition.lang = lang
    }
  }

  /**
   * 清空结果
   */
  const clearTranscript = () => {
    transcript.value = ''
    interimTranscript.value = ''
  }

  /**
   * 错误信息映射
   */
  function getErrorMessage(errorCode) {
    const messages = {
      'no-speech': '未检测到语音，请重试',
      'audio-capture': '无法获取麦克风，请检查权限设置',
      'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许',
      'network': '网络错误，请检查网络连接',
      'aborted': '语音识别被中止',
      'language-not-supported': '不支持该语言',
      'service-not-allowed': '语音识别服务不可用'
    }
    return messages[errorCode] || `识别错误: ${errorCode}`
  }

  // 组件卸载时停止识别
  onUnmounted(() => {
    stopListening()
  })

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    setLanguage,
    clearTranscript
  }
}
