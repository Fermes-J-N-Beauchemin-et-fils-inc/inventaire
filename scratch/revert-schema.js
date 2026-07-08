const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace Decimal with Float
schema = schema.replace(/Decimal\?/g, 'Float?');
schema = schema.replace(/Decimal/g, 'Float');

fs.writeFileSync(schemaPath, schema);
console.log("Reverted Decimal to Float in schema.prisma");
