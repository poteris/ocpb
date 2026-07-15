import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { uniqueName } from './helpers/participant';

dotenv.config({ path: '../.env' });

const baseUrl = process.env.E2E_TEST_BASE_URL;
const SCENARIO_ID = 'member-recruitment';

test.describe('Leaderboard API', () => {
  test('GET /api/leaderboard without scenarioId returns 400', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/leaderboard`);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('scenarioId is required');
  });

  test('GET /api/leaderboard returns a well-formed, rank-contiguous payload', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/leaderboard?scenarioId=${SCENARIO_ID}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.scenarioId).toBe(SCENARIO_ID);
    expect(Array.isArray(body.entries)).toBe(true);

    for (const entry of body.entries) {
      expect(typeof entry.user_id).toBe('string');
      expect(typeof entry.display_name).toBe('string');
      expect(entry.best_score).toBeGreaterThanOrEqual(1);
      expect(entry.best_score).toBeLessThanOrEqual(5);
      expect(entry.attempt_count).toBeGreaterThanOrEqual(1);
    }

    // Ranks are order-derived: contiguous 1..n, never absolute positions.
    const ranks = body.entries.map((entry: { rank: number }) => entry.rank);
    expect(ranks).toEqual(Array.from({ length: ranks.length }, (_, index) => index + 1));
  });

  test('GET /api/leaderboard for an unknown scenario returns empty entries', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/leaderboard?scenarioId=e2e-nonexistent-${Date.now()}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.entries).toEqual([]);
  });

  test('POST /api/users rejects invalid bodies', async ({ request }) => {
    const invalidBodies = [
      { userId: randomUUID() }, // missing displayName
      { userId: randomUUID(), displayName: '   ' }, // whitespace trims to empty
      { userId: randomUUID(), displayName: 'x'.repeat(41) }, // exceeds 40 chars
      { displayName: 'No Id' }, // missing userId
    ];

    for (const body of invalidBodies) {
      const response = await request.post(`${baseUrl}/api/users`, { data: body });
      expect(response.status()).toBe(400);
    }
  });

  test('POST /api/users upserts idempotently', async ({ request }) => {
    const userId = randomUUID();

    const first = await request.post(`${baseUrl}/api/users`, {
      data: { userId, displayName: uniqueName('Api') },
    });
    expect(first.status()).toBe(200);
    expect((await first.json()).userId).toBe(userId);

    // Same id, different name — the upsert must succeed, not conflict.
    const second = await request.post(`${baseUrl}/api/users`, {
      data: { userId, displayName: uniqueName('ApiRenamed') },
    });
    expect(second.status()).toBe(200);
  });

  test('POST /api/users rejects a name already owned by another id with 409', async ({ request }) => {
    const name = uniqueName('Dup');

    const owner = await request.post(`${baseUrl}/api/users`, {
      data: { userId: randomUUID(), displayName: name },
    });
    expect(owner.status()).toBe(200);

    // A different id claiming the same name (case-insensitively) must be rejected.
    const clash = await request.post(`${baseUrl}/api/users`, {
      data: { userId: randomUUID(), displayName: name.toUpperCase() },
    });
    expect(clash.status()).toBe(409);
  });

  test('POST /api/users lets the same id re-register its own name (self-heal upsert)', async ({ request }) => {
    const userId = randomUUID();
    const name = uniqueName('Heal');

    const first = await request.post(`${baseUrl}/api/users`, { data: { userId, displayName: name } });
    expect(first.status()).toBe(200);

    // The chat-start self-heal re-POSTs the same id+name on every conversation; it
    // must stay a 200, never a 409 against the participant's own row.
    const again = await request.post(`${baseUrl}/api/users`, { data: { userId, displayName: name } });
    expect(again.status()).toBe(200);
  });
});
