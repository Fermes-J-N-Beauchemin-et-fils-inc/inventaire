import { expect, test, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../../app/lib/db';
import { resetDb } from '../utils/db';

beforeAll(async () => {
  // Connect to the DB (optional, Prisma does it lazily)
  await prisma.$connect();
});

beforeEach(async () => {
  // Reset the DB before each test to ensure isolation
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('can create and retrieve a food from the real database', async () => {
  // Create a unit type first
  const unit = await prisma.unit_type.create({
    data: { name: 'kg', ration_to_kg: 1.0 }
  });

  const newFood = await prisma.food.create({
    data: {
      name: 'Test Aliment',
      price_per_ms: 15.5,
      price_per_tqs: 10.0,
      ms_percentage: 80,
      unit_type_id: unit.id,
      is_active: true
    }
  });

  expect(newFood.id).toBeDefined();
  expect(newFood.name).toBe('Test Aliment');

  const retrieved = await prisma.food.findUnique({
    where: { id: newFood.id }
  });

  expect(retrieved).not.toBeNull();
  expect(retrieved?.name).toBe('Test Aliment');
});
