import getEventMessage from "./github"
import { stores } from "./stores"
import { getMilestonePng } from "./utils"

/**
 * Telegram Bot API Docs -  https://core.telegram.org/bots/api#sendmessage
 */
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Invalid request method', { status: 405 })
    }

    if (!request.headers.has('X-GitHub-Event')) {
      return new Response('Invalid github event', { status: 404 })
    }

    const githubEvent = request.headers.get('X-GitHub-Event')

    try {
      // send message
      const body = await request.json()
      const message = getEventMessage(githubEvent, body)
      await sendTelegramMessage(env.TELEGRAM_TOKEN, env.TELEGRAM_CHAT_ID, message)

      // send milestone photo
      if (githubEvent === stores.eventType && 
          stores.action === 'created' && 
          env.MILESTONES.includes(stores.stars)) {
        try {
          const photoBuffer = await getMilestonePng(stores.stars)
          await sendTelegramPhoto(env.TELEGRAM_TOKEN, env.TELEGRAM_CHAT_ID, photoBuffer)
        } catch (error) {
          console.log('Failed to send milestone photo:', error.message)
        }
      }

      return new Response('Message sent to Telegram', { status: 200 })
    } catch (error) {
      console.error('Error send message:', error.message)
      return new Response("Failed to handle github event.", { status: 500 })
    }
  }
}

async function sendTelegramMessage(token, chatId, message) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true }
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to send message to Telegram')
  }
  return response
}

async function sendTelegramPhoto(token, chatId, photoBuffer) {
  const formData = new FormData()
  formData.append('chat_id', chatId)
  formData.append('photo', new Blob([photoBuffer], { type: 'image/png' }), 'image.png')
  
  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData
  })
  if (!response.ok) {
    throw new Error('Failed to send photo to Telegram')
  }
  return response
}