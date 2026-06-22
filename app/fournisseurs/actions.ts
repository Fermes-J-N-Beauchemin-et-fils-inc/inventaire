'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function createSupplier(formData: FormData) {
  const name = formData.get("name") as string;
  const phone_number = formData.get("phone_number") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const url = (formData.get("url") as string) || null;

  if (!name || !phone_number || !email || !address) {
    throw new Error("Veuillez remplir tous les champs obligatoires du fournisseur.");
  }

  await prisma.supplier.create({
    data: {
      name,
      phone_number,
      email,
      address,
      url,
      is_active: true
    }
  });

  revalidatePath('/fournisseurs');
}

export async function createContract(formData: FormData) {
  const name = formData.get("name") as string;
  const supplier_id = parseInt(formData.get("supplier_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const price_per_kg = parseFloat(formData.get("price_per_kg") as string);
  const date_start = formData.get("date_start") as string;
  let date_end = formData.get("date_end") as string;
  const is_spot = formData.get("is_spot") === "true";

  if (!name || isNaN(supplier_id) || isNaN(food_id) || isNaN(total_kg) || isNaN(price_per_kg) || !date_start) {
    throw new Error("Veuillez remplir tous les champs obligatoires du contrat.");
  }
  
  if (is_spot) {
    date_end = date_start;
  }

  if (!date_end) {
    throw new Error("La date de fin est requise pour un contrat non-spot.");
  }

  await prisma.$transaction(async (tx) => {
    const masterContract = await tx.contract.create({
      data: {
        name,
        supplier_id,
        food_id,
        total_kg,
        price_per_kg,
        date_start: new Date(date_start),
        date_end: new Date(date_end)
      }
    });

    if (is_spot) {
      // Spot contract: 1 single sub_contract
      await tx.subContract.create({
        data: {
          contract_id: masterContract.id,
          name: "Spot " + name,
          expected_kg: total_kg,
          kg_left_to_deliver: total_kg
        }
      });
    } else {
      // Normal contract: generate monthly sub_contracts
      const start = new Date(date_start);
      const end = new Date(date_end);
      
      let monthsCount = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      if (monthsCount <= 0) monthsCount = 1;

      const monthly_kg = total_kg / monthsCount;
      const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

      for (let i = 0; i < monthsCount; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const mName = monthNames[d.getMonth()];
        const yName = d.getFullYear();
        await tx.subContract.create({
          data: {
            contract_id: masterContract.id,
            name: `${mName} ${yName}`,
            expected_kg: monthly_kg,
            kg_left_to_deliver: monthly_kg
          }
        });
      }
    }
  });

  revalidatePath('/fournisseurs');
}

export async function createDelivery(formData: FormData) {
  const contract_id = parseInt(formData.get("contract_id") as string, 10);
  let food_id = parseInt(formData.get("food_id") as string, 10);
  const quantity_received = parseFloat(formData.get("quantity_received") as string);
  const date_expected = formData.get("date_expected") as string;
  const date_delivered = formData.get("date_delivered") as string;
  
  if (isNaN(contract_id) || isNaN(quantity_received) || !date_expected) {
    throw new Error("Veuillez remplir tous les champs obligatoires de la livraison.");
  }

  // Auto-fetch food_id from the contract if missing
  if (isNaN(food_id)) {
    const contract = await prisma.contract.findUnique({ select: { food_id: true }, where: { id: contract_id } });
    if (!contract) throw new Error("Contrat introuvable.");
    food_id = contract.food_id;
  }

  await prisma.$transaction(async (tx) => {
    await tx.delivery.create({
      data: {
        contract_id,
        food_id,
        quantity_received,
        date_expected: new Date(date_expected),
        date_delivered: date_delivered ? new Date(date_delivered) : new Date(date_expected)
      }
    });

    // Also deduct from kg_left_to_deliver if delivered
    if (date_delivered) {
      await tx.contract.update({
        where: { id: contract_id },
        data: {
          kg_left_to_deliver: {
            decrement: quantity_received
          }
        }
      });
      
      // Update food stock directly (units are matching: kg)
      await tx.food.update({
        where: { id: food_id },
        data: {
          current_stock: {
            increment: quantity_received
          }
        }
      });
      
      // Log the transaction
      await tx.stockTransaction.create({
        data: {
          food_id: food_id,
          quantity: quantity_received,
          transaction_type: "DELIVERY",
          recorded_at: new Date(date_delivered)
        }
      });
    }
  });

  revalidatePath('/fournisseurs');
}

export async function toggleSupplierStatus(supplierId: number, isActive: boolean) {
  if (isNaN(supplierId)) throw new Error("ID invalide.");
  
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { is_active: isActive }
  });

  revalidatePath('/fournisseurs');
}

export async function toggleContractStatus(contractId: number, isActive: boolean) {
  if (isNaN(contractId)) throw new Error("ID invalide.");
  
  await prisma.contract.update({
    where: { id: contractId },
    data: { is_active: isActive }
  });

  revalidatePath('/fournisseurs');
}
