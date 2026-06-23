const fs = require('fs');

const fActions = fs.readFileSync('app/fournisseurs/actions.ts', 'utf8');
const vActions = fs.readFileSync('app/ventes/actions.ts', 'utf8');

const imports = `
'use server';
import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";
`;

const cleanF = fActions.replace(/'use server';/g, '').replace(/import .*;/g, '').replace(/revalidatePath\('\/fournisseurs'\)/g, "revalidatePath('/transactions')");
const cleanV = vActions.replace(/'use server';/g, '').replace(/import .*;/g, '').replace(/revalidatePath\('\/ventes'\)/g, "revalidatePath('/transactions')");

let combined = imports + cleanF + cleanV;

fs.writeFileSync('app/transactions/actions.ts', combined);
