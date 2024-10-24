export async function sendTelegramMessage(token, chatId, message) {
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

export async function sendTelegramPhoto(token, chatId, photoBuffer) {
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