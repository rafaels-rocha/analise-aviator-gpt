const db = require('../src/db');

jest.mock('mysql2/promise');

describe('Database operations', () => {
  beforeAll(async () => {
    await db.connect();
  });

  test('saveMultiplier should insert a multiplier', async () => {
    await expect(db.saveMultiplier(1.5)).resolves.not.toThrow();
  });

  test('saveBet should insert a bet', async () => {
    await expect(db.saveBet(1.5, 1, 1)).resolves.not.toThrow();
  });

  test('loadTrainingData should return data and labels', async () => {
    const result = await db.loadTrainingData();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('labels');
  });
});