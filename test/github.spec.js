import { describe, it, expect } from 'vitest';
import { getEventMessage } from '../src/github';

const repo = {
  name: 'notifier',
  html_url: 'https://github.com/byodian/notifier',
};

const sender = {
  login: 'byodian',
  html_url: 'https://github.com/byodian',
};

const baseBody = {
  action: 'created',
  repository: repo,
  sender,
};

describe('getEventMessage', () => {
  it('handles commit_comment', () => {
    const message = getEventMessage('commit_comment', {
      ...baseBody,
      comment: {
        html_url: 'https://github.com/byodian/notifier/commit/abc#r1',
        user: sender,
      },
    });

    expect(message).toContain('Commit comment');
    expect(message).toContain('https://github.com/byodian/notifier/commit/abc#r1');
    expect(message).toContain('byodian');
  });

  it('handles discussion_comment', () => {
    const message = getEventMessage('discussion_comment', {
      ...baseBody,
      comment: {
        html_url: 'https://github.com/byodian/notifier/discussions/1#discussioncomment-1',
        user: sender,
      },
      discussion: {
        html_url: 'https://github.com/byodian/notifier/discussions/1',
        title: 'A great idea',
      },
    });

    expect(message).toContain('Discussion comment');
    expect(message).toContain('A great idea');
  });

  it('handles discussion', () => {
    const message = getEventMessage('discussion', {
      ...baseBody,
      action: 'created',
      discussion: {
        html_url: 'https://github.com/byodian/notifier/discussions/1',
        title: 'A great idea',
        user: sender,
      },
    });

    expect(message).toContain('Discussion');
    expect(message).toContain('A great idea');
  });

  it('handles issue_comment', () => {
    const message = getEventMessage('issue_comment', {
      ...baseBody,
      comment: {
        html_url: 'https://github.com/byodian/notifier/issues/1#issuecomment-1',
        user: sender,
      },
      issue: {
        html_url: 'https://github.com/byodian/notifier/issues/1',
        number: 1,
        title: 'Bug report',
      },
    });

    expect(message).toContain('Issue comment');
    expect(message).toContain('Issue #1: Bug report');
  });

  it('handles package', () => {
    const message = getEventMessage('package', {
      ...baseBody,
      action: 'published',
      package: {
        name: 'notifier',
        html_url: 'https://github.com/byodian/notifier/packages/123',
        package_type: 'npm',
        owner: sender,
        namespace: 'byodian',
      },
    });

    expect(message).toContain('Package');
    expect(message).toContain('npm');
  });

  it('handles pull_request_review', () => {
    const message = getEventMessage('pull_request_review', {
      ...baseBody,
      action: 'submitted',
      pull_request: {
        html_url: 'https://github.com/byodian/notifier/pull/2',
        title: 'Fix bug',
        number: 2,
      },
      review: {
        html_url: 'https://github.com/byodian/notifier/pull/2#review-1',
        state: 'approved',
        user: sender,
      },
    });

    expect(message).toContain('Review');
    expect(message).toContain('PR #2: Fix bug');
    expect(message).toContain('approved');
  });

  it('handles pull_request_review_comment', () => {
    const message = getEventMessage('pull_request_review_comment', {
      ...baseBody,
      comment: {
        html_url: 'https://github.com/byodian/notifier/pull/2#discussion_r1',
        user: sender,
      },
      pull_request: {
        html_url: 'https://github.com/byodian/notifier/pull/2',
        title: 'Fix bug',
        number: 2,
      },
    });

    expect(message).toContain('PR review comment');
    expect(message).toContain('PR #2: Fix bug');
  });

  it('handles pull_request_review_thread', () => {
    const message = getEventMessage('pull_request_review_thread', {
      ...baseBody,
      action: 'resolved',
      pull_request: {
        html_url: 'https://github.com/byodian/notifier/pull/2',
        title: 'Fix bug',
        number: 2,
      },
      thread: {},
    });

    expect(message).toContain('resolved');
    expect(message).toContain('PR #2: Fix bug');
  });

  it('handles push', () => {
    const message = getEventMessage('push', {
      ...baseBody,
      action: 'pushed',
      ref: 'refs/heads/main',
      created: false,
      deleted: false,
      forced: false,
      compare: 'https://github.com/byodian/notifier/compare/abc...def',
      commits: [{ message: 'first commit' }, { message: 'second commit' }],
      pusher: { name: 'byodian' },
      repository: repo,
    });

    expect(message).toContain('2 commits pushed');
    expect(message).toContain('first commit');
    expect(message).toContain('main');
  });

  it('handles push branch creation', () => {
    const message = getEventMessage('push', {
      ...baseBody,
      action: 'pushed',
      ref: 'refs/heads/feature',
      created: true,
      deleted: false,
      forced: false,
      compare: 'https://github.com/byodian/notifier/compare/abc...xyz',
      commits: [],
      pusher: { name: 'byodian' },
      repository: repo,
    });

    expect(message).toContain('New branch *feature* created');
  });

  it('handles push branch deletion', () => {
    const message = getEventMessage('push', {
      ...baseBody,
      action: 'pushed',
      ref: 'refs/heads/feature',
      created: false,
      deleted: true,
      forced: false,
      compare: 'https://github.com/byodian/notifier/compare/abc...xyz',
      commits: [],
      pusher: { name: 'byodian' },
      repository: repo,
    });

    expect(message).toContain('*feature* *deleted*');
  });

  it('handles registry_package', () => {
    const message = getEventMessage('registry_package', {
      ...baseBody,
      action: 'published',
      registry_package: {
        name: 'notifier',
        html_url: 'https://github.com/byodian/notifier/packages',
        package_type: 'container',
        owner: sender,
        namespace: 'byodian',
      },
    });

    expect(message).toContain('Registry package');
    expect(message).toContain('container');
  });

  it('handles release', () => {
    const message = getEventMessage('release', {
      ...baseBody,
      action: 'published',
      release: {
        html_url: 'https://github.com/byodian/notifier/releases/tag/v0.1.0',
        name: 'v0.1.0',
        tag_name: 'v0.1.0',
        draft: false,
        prerelease: false,
        author: sender,
      },
    });

    expect(message).toContain('Release');
    expect(message).toContain('v0.1.0');
  });

  it('handles watch', () => {
    const message = getEventMessage('watch', {
      ...baseBody,
      action: 'started',
      repository: repo,
      sender,
    });

    expect(message).toContain('started watching');
    expect(message).toContain('notifier');
  });

  it('handles workflow_run completed', () => {
    const message = getEventMessage('workflow_run', {
      ...baseBody,
      action: 'completed',
      repository: repo,
      workflow: { name: 'CI' },
      workflow_run: {
        html_url: 'https://github.com/byodian/notifier/actions/runs/1',
        name: 'CI',
        display_title: 'CI on main',
        conclusion: 'success',
        status: 'completed',
        actor: sender,
      },
    });

    expect(message).toContain('CI on main');
    expect(message).toContain('success');
  });

  it('handles workflow_run in_progress', () => {
    const message = getEventMessage('workflow_run', {
      ...baseBody,
      action: 'in_progress',
      repository: repo,
      workflow: null,
      workflow_run: {
        html_url: 'https://github.com/byodian/notifier/actions/runs/1',
        name: 'CI',
        display_title: 'CI on main',
        status: 'in_progress',
        actor: sender,
      },
    });

    expect(message).toContain('CI on main');
    expect(message).toContain('in_progress');
  });
});

describe('existing handlers', () => {
  it('still handles issues, pull_request, star, fork', () => {
    expect(getEventMessage('issues', {
      action: 'opened',
      repository: repo,
      issue: { html_url: 'https://github.com/byodian/notifier/issues/1', user: sender },
    })).toContain('Issue');

    expect(getEventMessage('pull_request', {
      action: 'opened',
      repository: repo,
      pull_request: { html_url: 'https://github.com/byodian/notifier/pull/1', user: sender },
    })).toContain('Pull request');

    expect(getEventMessage('star', {
      action: 'created',
      repository: { ...repo, stargazers_count: 10, forks_count: 2 },
      sender,
    })).toContain('Star');

    expect(getEventMessage('fork', { repository: repo, sender })).toContain('forked');
  });
});

describe('unknown event fallback', () => {
  it('escapes Telegram Markdown special characters', () => {
    expect(getEventMessage('unknown_event', {})).toBe('Event type: unknown\\_event');
    expect(getEventMessage('gollum', {})).toBe('Event type: gollum');
  });
});