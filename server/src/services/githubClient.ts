import { Octokit } from '@octokit/rest';
import type { CommitDetail, CommitSummary, RepoSummary } from 'shared';
import { env } from '../env.js';

const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

export const githubClient = {
  async listRepos(query?: string): Promise<RepoSummary[]> {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'pushed',
    });
    const needle = query?.trim().toLowerCase();
    const filtered = needle
      ? data.filter((r) => r.full_name.toLowerCase().includes(needle))
      : data;
    return filtered.map((r) => ({
      name: r.full_name,
      defaultBranch: r.default_branch,
    }));
  },

  async listBranches(repo: string): Promise<string[]> {
    const [owner, name] = repo.split('/');
    const { data } = await octokit.repos.listBranches({
      owner: owner!,
      repo: name!,
      per_page: 100,
    });
    return data.map((b) => b.name);
  },

  async listCommits(repo: string, branch: string, limit = 20): Promise<CommitSummary[]> {
    const [owner, name] = repo.split('/');
    const { data } = await octokit.repos.listCommits({
      owner: owner!,
      repo: name!,
      sha: branch,
      per_page: limit,
    });
    return data.map((c) => ({
      sha: c.sha,
      message: c.commit.message.split('\n')[0] ?? '',
      author: c.author?.login ?? c.commit.author?.name ?? 'unknown',
      date: c.commit.author?.date ?? new Date(0).toISOString(),
    }));
  },

  async getCommit(repo: string, sha: string): Promise<CommitDetail> {
    const [owner, name] = repo.split('/');
    const { data } = await octokit.repos.getCommit({
      owner: owner!,
      repo: name!,
      ref: sha,
    });

    const fullMessage = data.commit.message;
    const newlineIdx = fullMessage.indexOf('\n');
    const message = newlineIdx === -1 ? fullMessage : fullMessage.slice(0, newlineIdx);
    const body = newlineIdx === -1 ? '' : fullMessage.slice(newlineIdx + 1).trim();

    const files = data.files ?? [];
    const diffSummary =
      files.length === 0
        ? 'no files changed'
        : files
            .slice(0, 20)
            .map((f) => `${f.filename} (+${f.additions ?? 0}/-${f.deletions ?? 0})`)
            .join(', ');

    return {
      sha: data.sha,
      message,
      body,
      author: data.author?.login ?? data.commit.author?.name ?? 'unknown',
      date: data.commit.author?.date ?? new Date(0).toISOString(),
      diffSummary,
    };
  },

  async putContent(
    repo: string,
    path: string,
    content: string,
    message: string,
  ): Promise<string> {
    const [owner, name] = repo.split('/');

    let sha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({
        owner: owner!,
        repo: name!,
        path,
      });
      if (!Array.isArray(existing.data) && 'sha' in existing.data) {
        sha = existing.data.sha;
      }
    } catch (e: unknown) {
      const status = (e as { status?: number } | null)?.status;
      if (status !== 404) throw e;
    }

    const result = await octokit.repos.createOrUpdateFileContents({
      owner: owner!,
      repo: name!,
      path,
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      sha,
    });

    return result.data.content?.html_url ?? result.data.commit.html_url ?? '';
  },
};
