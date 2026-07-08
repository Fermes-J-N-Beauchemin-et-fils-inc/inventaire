const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace Float with Decimal
schema = schema.replace(/Float\?/g, 'Decimal?');
schema = schema.replace(/Float/g, 'Decimal');

// Add GroupPerformanceHistory
const historyModel = `
model GroupPerformanceHistory {
  id               Int      @id @default(autoincrement())
  group_id         Int
  date             DateTime
  pushed_ration_id Int?
  
  cows_fed         Int
  total_kg_ms      Decimal
  total_kg_tqs     Decimal
  total_cost       Decimal
  
  group            Group    @relation(fields: [group_id], references: [id], onDelete: Cascade)
  pushed_ration    PushedRation? @relation(fields: [pushed_ration_id], references: [id], onDelete: Cascade)

  @@index([group_id, date])
  @@map("group_performance_history")
}
`;

if (!schema.includes("model GroupPerformanceHistory")) {
    schema += historyModel;
}

fs.writeFileSync(schemaPath, schema);
console.log("Updated schema.prisma successfully.");
