import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const { getCommit, generateContent, getContent, createOrUpdateFileContents } = vi.hoisted(
  () => ({
    getCommit: vi.fn(),
    generateContent: vi.fn(),
    getContent: vi.fn(),
    createOrUpdateFileContents: vi.fn(),
  }),
);

vi.mock('@octokit/rest', () => ({
  Octokit: class MockOctokit {
    repos = {
      listForAuthenticatedUser: vi.fn(),
      listBranches: vi.fn(),
      listCommits: vi.fn(),
      getCommit,
      getContent,
      createOrUpdateFileContents,
    };
  },
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent };
  },
}));

vi.mock('../env.js', () => ({
  env: {
    GITHUB_TOKEN: 'test_token',
    GEMINI_API_KEY: 'test_gemini',
    PORT: 3001,
  },
}));

const { createApp } = await import('../app.js');
const { draftStore } = await import('../services/draftStore.js');
const app = createApp();

const stubGetCommit = (overrides = {}) => {
  getCommit.mockResolvedValue({
    data: {
      sha: 'abc1234567890',
      commit: {
        message: 'feat: add login\n\nBody paragraph',
        author: { name: 'Fallback', date: '2026-05-18T12:00:00Z' },
      },
      author: { login: 'octocat' },
      files: [{ filename: 'src/login.ts', additions: 12, deletions: 3 }],
      ...overrides,
    },
  });
};

const stubLLMText = (text: string) => {
  generateContent.mockResolvedValue({ text });
};

const validBody = { repo: 'owner/repo', branch: 'main', sha: 'abc1234' };
const validDraftJson = JSON.stringify({
  title: 'Add login feature',
  summary: 'New login flow.',
  body: 'Markdown body.',
});

beforeEach(() => {
  vi.clearAllMocks();
  for (const d of draftStore.list()) {
    draftStore.delete(d.id);
  }
});

describe('POST /api/drafts/generate', () => {
  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).post('/api/drafts/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 when repo is not "owner/name"', async () => {
    const res = await request(app)
      .post('/api/drafts/generate')
      .send({ repo: 'invalid', branch: 'main', sha: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('creates a draft and returns it on happy path', async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);

    const res = await request(app).post('/api/drafts/generate').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      repo: 'owner/repo',
      branch: 'main',
      commitSha: 'abc1234',
      title: 'Add login feature',
      summary: 'New login flow.',
      body: 'Markdown body.',
      status: 'draft',
    });
    expect(res.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(draftStore.list()).toHaveLength(1);
  });

  it('parses JSON wrapped in a code fence', async () => {
    stubGetCommit();
    stubLLMText('```json\n' + validDraftJson + '\n```');

    const res = await request(app).post('/api/drafts/generate').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Add login feature');
  });

  it('parses JSON when LLM adds preamble before the object', async () => {
    stubGetCommit();
    stubLLMText('Here is the draft:\n' + validDraftJson + '\n— thanks!');

    const res = await request(app).post('/api/drafts/generate').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Add login feature');
  });

  it('returns 502 LLM_PARSE_FAILED when LLM output cannot be parsed', async () => {
    stubGetCommit();
    stubLLMText('sorry, no JSON for you');

    const res = await request(app).post('/api/drafts/generate').send(validBody);
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('LLM_PARSE_FAILED');
    expect(draftStore.list()).toHaveLength(0);
  });

  it('returns 502 when LLM omits required fields', async () => {
    stubGetCommit();
    stubLLMText(JSON.stringify({ title: 'T', summary: 'S' })); // missing body

    const res = await request(app).post('/api/drafts/generate').send(validBody);
    expect(res.status).toBe(502);
    expect(draftStore.list()).toHaveLength(0);
  });

  it('passes commit detail (incl. diffSummary) into Claude prompt', async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);

    await request(app).post('/api/drafts/generate').send(validBody);

    expect(generateContent).toHaveBeenCalledTimes(1);
    const prompt = generateContent.mock.calls[0]?.[0].contents;
    expect(prompt).toContain('owner/repo');
    expect(prompt).toContain('main');
    expect(prompt).toContain('feat: add login');
    expect(prompt).toContain('src/login.ts (+12/-3)');
  });
});

describe('GET /api/drafts', () => {
  it('returns empty array when no drafts exist', async () => {
    const res = await request(app).get('/api/drafts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it('returns drafts in newest-first order', async () => {
    stubGetCommit();
    stubLLMText(JSON.stringify({ title: 'A', summary: 'sa', body: 'ba' }));
    await request(app).post('/api/drafts/generate').send(validBody);

    await new Promise((r) => setTimeout(r, 5));

    stubLLMText(JSON.stringify({ title: 'B', summary: 'sb', body: 'bb' }));
    await request(app).post('/api/drafts/generate').send(validBody);

    const res = await request(app).get('/api/drafts');
    expect(res.status).toBe(200);
    expect(res.body.data.map((d: { title: string }) => d.title)).toEqual(['B', 'A']);
  });
});

describe('GET /api/drafts/:id', () => {
  it('returns the draft by id', async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);
    const created = await request(app).post('/api/drafts/generate').send(validBody);

    const res = await request(app).get(`/api/drafts/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
  });

  it('returns 404 NOT_FOUND for unknown id', async () => {
    const res = await request(app).get('/api/drafts/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/drafts/:id', () => {
  const seedDraft = async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);
    const res = await request(app).post('/api/drafts/generate').send(validBody);
    return res.body.data as { id: string; title: string; summary: string; body: string; updatedAt: string };
  };

  it('updates title only and preserves other fields', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .put(`/api/drafts/${draft.id}`)
      .send({ title: 'New Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
    expect(res.body.data.summary).toBe(draft.summary);
    expect(res.body.data.body).toBe(draft.body);
  });

  it('updates summary and body together', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .put(`/api/drafts/${draft.id}`)
      .send({ summary: 'updated summary', body: 'updated body' });

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBe('updated summary');
    expect(res.body.data.body).toBe('updated body');
    expect(res.body.data.title).toBe(draft.title);
  });

  it('bumps updatedAt timestamp', async () => {
    const draft = await seedDraft();
    await new Promise((r) => setTimeout(r, 5));
    const res = await request(app)
      .put(`/api/drafts/${draft.id}`)
      .send({ title: 'New' });

    expect(res.body.data.updatedAt > draft.updatedAt).toBe(true);
  });

  it('returns 404 NOT_FOUND for unknown id', async () => {
    const res = await request(app)
      .put('/api/drafts/nonexistent-id')
      .send({ title: 'X' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 INVALID_INPUT for empty patch', async () => {
    const draft = await seedDraft();
    const res = await request(app).put(`/api/drafts/${draft.id}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 INVALID_INPUT for empty string field', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .put(`/api/drafts/${draft.id}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('ignores status and publishedUrl fields (PUT does not allow them)', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .put(`/api/drafts/${draft.id}`)
      .send({ title: 'New', status: 'published', publishedUrl: 'https://evil.example' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.publishedUrl).toBeUndefined();
  });
});

describe('POST /api/drafts/:id/publish', () => {
  const PUBLISHED_URL =
    'https://github.com/owner/blog/blob/main/posts/2026-05-22-abc1234.md';

  const seedDraft = async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);
    const res = await request(app).post('/api/drafts/generate').send(validBody);
    return res.body.data as { id: string; title: string; body: string };
  };

  beforeEach(() => {
    // Default: file does not exist on remote (new publish path)
    const notFound = Object.assign(new Error('Not Found'), { status: 404 });
    getContent.mockRejectedValue(notFound);
    createOrUpdateFileContents.mockResolvedValue({
      data: {
        content: { html_url: PUBLISHED_URL },
        commit: { html_url: 'https://github.com/owner/blog/commit/abc' },
      },
    });
  });

  it('returns 404 for nonexistent draft', async () => {
    const res = await request(app)
      .post('/api/drafts/nonexistent/publish')
      .send({ targetRepo: 'owner/blog' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 NO_BLOG_REPO when env has no BLOG_REPO and body has no targetRepo', async () => {
    const draft = await seedDraft();
    const res = await request(app).post(`/api/drafts/${draft.id}/publish`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NO_BLOG_REPO');
  });

  it('returns 400 INVALID_INPUT for malformed targetRepo', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'not-a-repo' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('publishes draft with body targetRepo and returns updated draft', async () => {
    const draft = await seedDraft();
    const res = await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.publishedUrl).toBe(PUBLISHED_URL);
  });

  it('uses default path posts/YYYY-MM-DD-{shortSha}.md when not provided', async () => {
    const draft = await seedDraft();
    await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog' });

    const arg = createOrUpdateFileContents.mock.calls[0]?.[0];
    expect(arg.path).toMatch(/^posts\/\d{4}-\d{2}-\d{2}-[a-f0-9]{7}\.md$/);
  });

  it('uses custom path when provided', async () => {
    const draft = await seedDraft();
    await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog', path: 'custom/dir/file.md' });

    const arg = createOrUpdateFileContents.mock.calls[0]?.[0];
    expect(arg.path).toBe('custom/dir/file.md');
  });

  it('includes YAML frontmatter and body in markdown content', async () => {
    const draft = await seedDraft();
    await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog' });

    const arg = createOrUpdateFileContents.mock.calls[0]?.[0];
    const md = Buffer.from(arg.content, 'base64').toString('utf-8');
    expect(md).toMatch(/^---\n/);
    expect(md).toContain('title:');
    expect(md).toContain('branch: main');
    expect(md).toContain('commit:');
    expect(md).toContain(draft.body);
  });

  it('passes existing sha when file already exists (update path)', async () => {
    const draft = await seedDraft();
    getContent.mockReset();
    getContent.mockResolvedValue({
      data: { sha: 'existing-blob-sha', type: 'file' },
    });

    await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog' });

    const arg = createOrUpdateFileContents.mock.calls[0]?.[0];
    expect(arg.sha).toBe('existing-blob-sha');
  });

  it('omits sha when file does not exist (create path)', async () => {
    const draft = await seedDraft();
    await request(app)
      .post(`/api/drafts/${draft.id}/publish`)
      .send({ targetRepo: 'owner/blog' });

    const arg = createOrUpdateFileContents.mock.calls[0]?.[0];
    expect(arg.sha).toBeUndefined();
  });
});

describe('DELETE /api/drafts/:id', () => {
  const seedDraft = async () => {
    stubGetCommit();
    stubLLMText(validDraftJson);
    const res = await request(app).post('/api/drafts/generate').send(validBody);
    return res.body.data as { id: string };
  };

  it('deletes the draft and returns { ok: true }', async () => {
    const draft = await seedDraft();
    expect(draftStore.list()).toHaveLength(1);

    const res = await request(app).delete(`/api/drafts/${draft.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ ok: true });
    expect(draftStore.list()).toHaveLength(0);
  });

  it('returns 404 NOT_FOUND for unknown id', async () => {
    const res = await request(app).delete('/api/drafts/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
