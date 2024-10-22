import { stores } from "./stores"

// event types
const events = {
  issues : 'issues',
  pull_request : 'pull_request',
  star : 'star',
  fork : 'fork'
}

// event actions
const actions = {
  opened: 'opened',
  closed: 'closed',
  created: 'created',
  deleted: 'deleted'
}

/**
 * Function to get the event message
 * @param {string} event github event - issues, pull_request, star
 * @param {Object} body
 * @returns
 */
export default function getEventMessage(event, body) {
  const strategy = getStrategy(event)
  return strategy(body)
}

// Factory function to get Strategy
function getStrategy(event) {
  const strategies = {
    [events.issues]: issuesEventHandler,
    [events.pull_request]: pullRequestEventHandler,
    [events.star]: starEventHandler,
    [events.fork]: forkEventHandler,
  }

  return strategies[event] || (() => `Event type: ${event}`)
}

function issuesEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    issue: {
      html_url: issueUrl,
      user: {
        login: issueCreator,
        html_url: issueCreatorUrl
      }
    },
  } = body

  if (action === actions.opened) {
    return `
[Issue](${issueUrl}) opened in [${repo}](${repoUrl}) repo by [${issueCreator}](${issueCreatorUrl})!
Great chance to improve your project! 🚀
Let's keep making *${repo}* better! 🌟
`
  }

  if (action === actions.closed) {
    return `
[Issue](${issueUrl}) closed in [${repo}](${repoUrl}) repo!
Nice! You’ve made *${repo}* stronger.
Keep it up! 💪
`
  }

  return `Issue action: *${action}*`
}

function pullRequestEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    pull_request: {
      html_url: prUrl,
      user: {
        login: prCreator,
        html_url: prCreatorUrl
      }
    },
  } = body
  if (action === actions.opened) {
    return `
[Pull request](${prUrl}) opened in [${repo}](${repoUrl}) repo by [${prCreator}](${prCreatorUrl})!
Your hard work is getting recognized! 💡
`
  }

  if (action === actions.closed) {
    return `
[Pull request](${prUrl}) closed in [${repo}](${repoUrl}) repo!
Contribution reviewed and done!
*${repo}* is growing stronger! 👏
`
  }

  return `Pull request action: *${action}*`
}

function starEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
      stargazers_count,
      forks_count
    },
    sender: {
      login: sender,
      html_url: senderUrl
    },
  } = body
  stores.stars = stargazers_count
  stores.forks = forks_count
  stores.repo = repo
  stores.action = action
  if (action === actions.created) {
    return `
Star created for [${repo}](${repoUrl}) repo!
The *${repo}* repo now has *${stargazers_count}* stars and *${forks_count}* forks!🎉
Your new fan is [${sender}](${senderUrl})
`
  }

  if (action === actions.deleted) {
    return `
Star removed from [${repo}](${repoUrl}) repo by [${sender}](${senderUrl})!
The *${repo}* repo now has *${stargazers_count}* stars and *${forks_count}* forks!
Don’t worry, keep going!  More stars will come. 🌱
`
  }

  return `Star action: ${action}`
}

function forkEventHandler(body) {
  const {
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    sender: {
      login: sender,
      html_url: senderUrl
    },
  } = body

  return `
The repo [${repo}](${repoUrl}) has been forked by [${sender}](${senderUrl})!
Your project is spreading!
*${repo}* is reaching more people! 🌍
`
}
