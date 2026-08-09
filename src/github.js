import { stores } from "./stores"

// event types
const events = {
  issues : 'issues',
  pull_request : 'pull_request',
  star : 'star',
  fork : 'fork',
  commit_comment : 'commit_comment',
  discussion : 'discussion',
  discussion_comment : 'discussion_comment',
  issue_comment : 'issue_comment',
  package : 'package',
  pull_request_review : 'pull_request_review',
  pull_request_review_comment : 'pull_request_review_comment',
  pull_request_review_thread : 'pull_request_review_thread',
  push : 'push',
  registry_package : 'registry_package',
  release : 'release',
  watch : 'watch',
  workflow_run : 'workflow_run'
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
export function getEventMessage(event, body) {
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
    [events.commit_comment]: commitCommentEventHandler,
    [events.discussion]: discussionEventHandler,
    [events.discussion_comment]: discussionCommentEventHandler,
    [events.issue_comment]: issueCommentEventHandler,
    [events.package]: packageEventHandler,
    [events.pull_request_review]: pullRequestReviewEventHandler,
    [events.pull_request_review_comment]: pullRequestReviewCommentEventHandler,
    [events.pull_request_review_thread]: pullRequestReviewThreadEventHandler,
    [events.push]: pushEventHandler,
    [events.registry_package]: registryPackageEventHandler,
    [events.release]: releaseEventHandler,
    [events.watch]: watchEventHandler,
    [events.workflow_run]: workflowRunEventHandler,
  }

  return strategies[event] || (() => `Event type: ${sanitizeMarkdown(event)}`)
}

// Escape Telegram Markdown special characters for fallback messages
function sanitizeMarkdown(text) {
  return text.replace(/[_*`[\]]/g, (char) => `\\${char}`)
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

function commitCommentEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    comment: {
      html_url: commentUrl,
      user: {
        login: commenter,
        html_url: commenterUrl
      }
    },
  } = body

  return `
[Commit comment](${commentUrl}) *${action}* by [${commenter}](${commenterUrl}) in [${repo}](${repoUrl})!
Your code is getting noticed!
Keep the great work rolling! 🚀
`
}

function discussionEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    discussion: {
      html_url: discussionUrl,
      title,
      user: {
        login: discussionCreator,
        html_url: discussionCreatorUrl
      }
    },
  } = body

  return `
[Discussion](${discussionUrl}) *${action}* in [${repo}](${repoUrl})!
"[${title}](${discussionUrl})" by [${discussionCreator}](${discussionCreatorUrl})
Great conversation happening! 💬
`
}

function discussionCommentEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    comment: {
      html_url: commentUrl,
      user: {
        login: commenter,
        html_url: commenterUrl
      }
    },
    discussion: {
      html_url: discussionUrl,
      title,
    },
  } = body

  return `
[Discussion comment](${commentUrl}) *${action}* by [${commenter}](${commenterUrl}) on [${title}](${discussionUrl}) in [${repo}](${repoUrl})!
The community is talking! 🗣️
`
}

function issueCommentEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    comment: {
      html_url: commentUrl,
      user: {
        login: commenter,
        html_url: commenterUrl
      }
    },
    issue: {
      html_url: issueUrl,
      number,
      title,
    },
  } = body

  return `
[Issue comment](${commentUrl}) *${action}* by [${commenter}](${commenterUrl}) on [Issue #${number}: ${title}](${issueUrl}) in [${repo}](${repoUrl})!
Great thoughts moving the project forward! 💬
`
}

function packageEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    package: {
      name: packageName,
      html_url: packageUrl,
      package_type: packageType,
      owner: {
        login: packageOwner,
        html_url: packageOwnerUrl
      },
      namespace: packageNamespace
    },
  } = body

  return `
Package [${packageName}](${packageUrl}) *${action}* by [${packageOwner}](${packageOwnerUrl}) in [${repo}](${repoUrl})!
*${packageType}* in *${packageNamespace}* is living its best life. 📦
`
}

function pullRequestReviewEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    pull_request: {
      html_url: prUrl,
      title,
      number,
    },
    review: {
      html_url: reviewUrl,
      state,
      user: {
        login: reviewer,
        html_url: reviewerUrl
      }
    },
  } = body

  return `
[Review](${reviewUrl}) ${formatReviewState(state)} by [${reviewer}](${reviewerUrl}) on [PR #${number}: ${title}](${prUrl}) in [${repo}](${repoUrl})!
*${state}* — you are getting closer! 🚀
`
}

function formatReviewState(action) {
  if (action === 'submitted') return 'submitted'
  if (action === 'edited') return 'updated'
  if (action === 'dismissed') return 'dismissed'
  return action
}

function pullRequestReviewCommentEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    comment: {
      html_url: commentUrl,
      user: {
        login: commenter,
        html_url: commenterUrl
      }
    },
    pull_request: {
      html_url: prUrl,
      title,
      number,
    },
  } = body

  return `
[PR review comment](${commentUrl}) *${action}* by [${commenter}](${commenterUrl}) on [PR #${number}: ${title}](${prUrl}) in [${repo}](${repoUrl})!
Detailed feedback always makes it stronger! 💡
`
}

function pullRequestReviewThreadEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    pull_request: {
      html_url: prUrl,
      title,
      number,
    },
  } = body

  return `
Pull request review thread *${action}* on [PR #${number}: ${title}](${prUrl}) in [${repo}](${repoUrl})!
Marking threads helps everyone move fast. ✅
`
}

function pushEventHandler(body) {
  const {
    ref,
    created,
    deleted,
    forced,
    compare,
    commits,
    pusher: {
      name: pusher,
    },
    repository: {
      name: repo,
      html_url: repoUrl,
    },
  } = body

  const refName = ref.replace(/^refs\/(heads|tags)\//, '')

  if (deleted) {
    return `
Branch *${refName}* *deleted* in [${repo}](${repoUrl}) by *${pusher}*!
Cleaning up always keeps things tidy. 🧹
`
  }

  if (created) {
    const commitCount = formatCommitCount(commits)
    return `
New branch *${refName}* created in [${repo}](${repoUrl}) by *${pusher}*!
${commitCount} is on its way!
Your project is growing! 🌱
`
  }

  const commitMessages = commits.map(commit => `- ${commit.message}`).join('\n')
  const commitCount = commits.length
  return `
[Push](${compare}) by *${pusher}* to *${refName}* in [${repo}](${repoUrl})!
${commitCount} commit${commitCount === 1 ? '' : 's'} pushed${forced ? ' (forced)' : ''}:
${commitMessages}
Keep pushing, keep building! 💪
`
}

function formatCommitCount(commits) {
  const count = commits.length
  return `${count} commit${count === 1 ? '' : 's'}`
}

function registryPackageEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    registry_package: {
      name: packageName,
      html_url: packageUrl,
      package_type: packageType,
      owner: {
        login: packageOwner,
        html_url: packageOwnerUrl
      },
      namespace: packageNamespace
    },
  } = body

  return `
Registry package [${packageName}](${packageUrl}) *${action}* by [${packageOwner}](${packageOwnerUrl}) in [${repo}](${repoUrl})!
*${packageType}* in *${packageNamespace}* is out in the world! 📦
`
}

function releaseEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    release: {
      html_url: releaseUrl,
      name: releaseName,
      tag_name: tagName,
      draft,
      prerelease,
      author: {
        login: releaseAuthor,
        html_url: releaseAuthorUrl
      }
    },
  } = body

  const releaseLabel = releaseName || tagName
  const badges = []
  if (draft) badges.push('draft')
  if (prerelease) badges.push('pre-release')
  const badgeText = badges.length ? ` (${badges.join(', ')})` : ''

  return `
Release [${releaseLabel}](${releaseUrl}) *${action}*${badgeText} by [${releaseAuthor}](${releaseAuthorUrl}) in [${repo}](${repoUrl})!
Time to celebrate and share it with the world! 🎉
`
}

function watchEventHandler(body) {
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
[${sender}](${senderUrl}) started watching [${repo}](${repoUrl})!
Someone is keeping an eye on your project. 👀
`
}

function workflowRunEventHandler(body) {
  const {
    action,
    repository: {
      name: repo,
      html_url: repoUrl,
    },
    workflow,
    workflow_run: {
      html_url: workflowRunUrl,
      name: runName,
      display_title: displayTitle,
      conclusion,
      status,
      actor: {
        login: actor,
        html_url: actorUrl
      }
    },
  } = body

  const workflowName = workflow && workflow.name
  const workflowLabel = workflowName || runName
  const runTitle = displayTitle || workflowLabel

  if (action === 'completed') {
    return `
Workflow run [${runTitle}](${workflowRunUrl}) *completed* with conclusion *${conclusion}* by [${actor}](${actorUrl}) in [${repo}](${repoUrl})!
Come out clean and strong! 🎉
`
  }

  return `
Workflow run [${runTitle}](${workflowRunUrl}) *${action}* with status *${status}* by [${actor}](${actorUrl}) in [${repo}](${repoUrl})!
Keep the pipeline flowing! ⚙️
`
}
