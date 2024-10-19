import getEventMessage from "./github"

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
			const body = await request.json()
			const message = getEventMessage(githubEvent, body)

			// send message to Telegram
			// api docs -  https://core.telegram.org/bots/api#sendmessage
			const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`

			const telegramPayload = {
				chat_id: env.TELEGRAM_CHAT_ID,
				text: message,
				parse_mode: "Markdown",
				link_preview_options: { is_disabled: true }
			}

			const telegramResponse = await fetch(telegramUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(telegramPayload),
			})

			if (telegramResponse.ok) {
				return new Response('Message sent to Telegram', { status: 200 })
			} else {
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
	const { 
		name: repo, 
		html_url: repoUrl, 
		stargazers_count,
		forks_count
	} = body.repository

	const { login: follwer, html_url: follwerUrl } = body.sender

	return `
New Github star for [${repo}](${repoUrl}) repo!
The *${repo}* repo now has *${stargazers_count}* stars and *${forks_count}* forks!🎉
Your new fan is [${follwer}](${follwerUrl})
`
}