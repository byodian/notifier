export default {
	async fetch(request, env, ctx) {
		if (request.method !== 'POST') {
			return new Response('Invalid request method', { status: 405 })
		}

		const githubEvent = request.headers.get('X-GitHub-Event')
    try {
			const body = await request.json()

			// 构建发送到 Telegram 的消息内容
			let message = "Hello world"
			if (githubEvent === 'watch') {
				message = makeMessage(body)
			}

			// 发送消息到 Telegram
			const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`

			const telegramPayload = {
				chat_id: env.TELEGRAM_CHAT_ID,
				text: message,
				parse_mode: "Markdown"
			}

			const telegramResponse = await fetch(telegramUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(telegramPayload),
			})

			if (telegramResponse.ok) {
				return new Response('Message sent to Telegram', { status: 200 })
			} else {
				console.log(telegramResponse)
				return new Response(`Failed to send message to Telegram`, { status: 500 })
			}
    } catch (error) {
      return new Response("Failed to process webhook event.", {
        status: 500,
      });
    }
	}	
}

function makeMessage(body) {
	const repo = body.repository.repository
	const repoUrl = body.repository.html_url
	const stars = body.repository.stargazers_count
	const forks = body.repository.forks_count
	const sender = body.sender.login
	const senderUrl = body.sender.html_url

	return `
New Github star for [${repo}](${repoUrl}) repo!
The **${repo}** repo now has **${stars}** starts and **${forks}** forks!🎉
Your new fan is [${sender}](${senderUrl})
`
}