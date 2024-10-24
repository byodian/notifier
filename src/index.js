import { getEventMessage } from "./github"
import { stores } from "./stores"
import { getMilestonePng } from "./utils"
import { sendTelegramMessage, sendTelegramPhoto } from "./telegram"

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
          const photoBuffer = await getMilestonePng(stores)
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