'use server';

import { prisma } from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const phone_number = formData.get("phone_number") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const url = (formData.get("url") as string) || null;

  if (!name || !phone_number || !email || !address) {
    throw new Error("Veuillez remplir tous les champs obligatoires du client.");
  }

  await prisma.client.create({
    data: {
      name,
      phone_number,
      email,
      address,
      url,
      is_active: true
    }
  });

  revalidatePath('/ventes');
}

export async function createSaleContract(formData: FormData) {
  const name = formData.get("name") as string;
  const client_id = parseInt(formData.get("supplier_id") as string, 10); // Note: form might pass supplier_id field name, we parse it as client_id
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const price_per_kg = parseFloat(formData.get("price_per_kg") as string);
  const date_start = formData.get("date_start") as string;
  let date_end = formData.get("date_end") as string;
  const is_spot = formData.get("is_spot") === "true";

  if (!name || isNaN(client_id) || isNaN(food_id) || isNaN(total_kg) || isNaN(price_per_kg) || !date_start) {
    throw new Error("Veuillez remplir tous les champs obligatoires du contrat.");
  }
  
  if (is_spot) {
    date_end = date_start;
  }

  if (!date_end) {
    throw new Error("La date de fin est requise pour un contrat non-spot.");
  }

  await prisma.$transaction(async (tx) => {
    const masterContract = await tx.saleContract.create({
      data: {
        name,
        client_id,
        food_id,
        total_kg,
        price_per_kg,
        date_start: new Date(date_start),
        date_end: new Date(date_end)
      }
    });

    if (is_spot) {
      await tx.saleSubContract.create({
        data: {
          sale_contract_id: masterContract.id,
          name: "Spot " + name,
          expected_kg: total_kg,
          kg_left_to_deliver: total_kg
        }
      });
    } else {
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
        await tx.saleSubContract.create({
          data: {
            sale_contract_id: masterContract.id,
            name: `${mName} ${yName}`,
            expected_kg: monthly_kg,
            kg_left_to_deliver: monthly_kg
          }
        });
      }
    }
  });

  revalidatePath('/ventes');
}

export async function createSale(formData: FormData) {
  const contract_id = parseInt(formData.get("contract_id") as string, 10);
  const quantity_sold = parseFloat(formData.get("quantity_sold") as string);
  const date_expected = formData.get("date_expected") as string;
  const date_sold = formData.get("date_sold") as string;
  
  if (isNaN(contract_id) || isNaN(quantity_sold) || !date_expected) {
    throw new Error("Veuillez remplir tous les champs obligatoires de la vente.");
  }

  const contract = await prisma.saleContract.findUnique({ select: { food_id: true, client_id: true }, where: { id: contract_id } });
  if (!contract) throw new Error("Contrat introuvable.");
  const food_id = contract.food_id;
  const client_id = contract.client_id;

  await prisma.$transaction(async (tx) => {
    // Determine if we are recording an immediate sale or a planned one
    if (date_sold) {
      // Immediate sale, we MUST verify stock
      // Sum all stock for this food across storages
      const storages = await tx.foodStorage.findMany({
        where: { food_id },
        orderBy: { current_stock: 'desc' }
      });
      
      const food = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
      const isTm = food?.unit_type.name.toLowerCase() === 'tm';
      const qtyToDeduct = isTm ? quantity_sold / 1000 : quantity_sold;
      
      const totalStock = storages.reduce((acc, s) => acc + s.current_stock, 0);
      if (totalStock < qtyToDeduct) {
         throw new Error(`Stock insuffisant ! Stock actuel: ${totalStock.toFixed(2)}, Quantité demandée: ${qtyToDeduct.toFixed(2)}.`);
      }

      // Deduct from storages sequentially
      let remainingToDeduct = qtyToDeduct;
      let primaryStorageId = storages.length > 0 ? storages[0].storage_id : null;

      for (const storage of storages) {
        if (remainingToDeduct <= 0) break;
        const deductAmt = Math.min(storage.current_stock, remainingToDeduct);
        
        await tx.foodStorage.update({
          where: { food_id_storage_id: { food_id, storage_id: storage.storage_id } },
          data: { current_stock: { decrement: deductAmt } }
        });
        
        // Log transaction
        await tx.stockTransaction.create({
          data: {
            food_id,
            storage_id: storage.storage_id,
            quantity: -deductAmt,
            transaction_type: "SALE",
            recorded_at: new Date(date_sold)
          }
        });
        
        remainingToDeduct -= deductAmt;
      }
    }

    // Create the Sale record
    const sale = await tx.sale.create({
      data: {
        client_id,
        food_id,
        quantity_sold,
        date_expected: new Date(date_expected),
        date_sold: date_sold ? new Date(date_sold) : null
      }
    });

    // Link it to the FIRST active sub_contract
    const firstSubContract = await tx.saleSubContract.findFirst({
      where: { sale_contract_id: contract_id, kg_left_to_deliver: { gt: 0 } },
      orderBy: { id: 'asc' }
    });

    const subContractToLink = firstSubContract || await tx.saleSubContract.findFirst({
      where: { sale_contract_id: contract_id },
      orderBy: { id: 'asc' }
    });

    if (subContractToLink) {
      await tx.saleSubContractAllocation.create({
        data: {
          sale_id: sale.id,
          sale_sub_contract_id: subContractToLink.id,
          quantity: quantity_sold
        }
      });
      
      if (date_sold) {
        await tx.saleSubContract.update({
          where: { id: subContractToLink.id },
          data: {
            kg_left_to_deliver: {
              decrement: quantity_sold
            }
          }
        });
      }
    }
  });

  revalidatePath('/ventes');
  revalidatePath('/inventaire');
  revalidatePath('/dashboard');
  revalidatePath('/comptabilite');
}

export async function toggleClientStatus(clientId: number, isActive: boolean) {
  if (isNaN(clientId)) throw new Error("ID invalide.");
  
  await prisma.client.update({
    where: { id: clientId },
    data: { is_active: isActive }
  });

  revalidatePath('/ventes');
}

export async function toggleSaleContractStatus(contractId: number, isActive: boolean) {
  if (isNaN(contractId)) throw new Error("ID invalide.");
  
  await prisma.saleContract.update({
    where: { id: contractId },
    data: { is_active: isActive }
  });

  revalidatePath('/ventes');
}

export async function updateClient(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const phone_number = formData.get("phone_number") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const url = (formData.get("url") as string) || null;

  if (isNaN(id) || !name || !phone_number || !email || !address) {
    throw new Error("Veuillez remplir tous les champs obligatoires du client.");
  }

  await prisma.client.update({
    where: { id },
    data: { name, phone_number, email, address, url }
  });

  revalidatePath('/ventes');
}

export async function updateSaleSubContract(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);
  const kg_left_to_deliver = parseFloat(formData.get("kg_left_to_deliver") as string);

  if (isNaN(id) || !name || isNaN(expected_kg) || isNaN(kg_left_to_deliver)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.saleSubContract.update({
    where: { id },
    data: { name, expected_kg, kg_left_to_deliver }
  });

  revalidatePath('/ventes');
}

export async function createSaleSubContract(formData: FormData) {
  const contract_id = parseInt(formData.get("contract_id") as string, 10);
  const name = formData.get("name") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);
  const kg_left_to_deliver = parseFloat(formData.get("kg_left_to_deliver") as string);

  if (isNaN(contract_id) || !name || isNaN(expected_kg) || isNaN(kg_left_to_deliver)) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  await prisma.saleSubContract.create({
    data: { sale_contract_id: contract_id, name, expected_kg, kg_left_to_deliver }
  });

  revalidatePath('/ventes');
}

export async function deleteSaleSubContract(id: number) {
  try {
    if (isNaN(id)) {
      throw new Error("ID invalide.");
    }

    await prisma.saleSubContract.delete({
      where: { id }
    });

    revalidatePath('/ventes');
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new Error("Impossible de supprimer ce sous-contrat car il est lié à des ventes.");
    }
    throw new Error(error.message || "Erreur lors de la suppression du sous-contrat.");
  }
}

export async function deleteSale(saleId: number) {
  if (isNaN(saleId)) throw new Error("ID de vente invalide.");

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId }
    });

    if (!sale) throw new Error("Vente introuvable.");
    if (sale.date_sold) {
      throw new Error("Impossible de supprimer une vente déjà traitée. Veuillez créer un ajustement manuel d'inventaire si nécessaire.");
    }

    await tx.sale.delete({ where: { id: saleId } });
  });

  revalidatePath('/inventaire');
  revalidatePath('/ventes');
}

export async function validateSale(saleId: number) {
  if (isNaN(saleId)) throw new Error("ID de vente invalide.");

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId }
    });

    if (!sale) throw new Error("Vente introuvable.");
    if (sale.date_sold) throw new Error("Cette vente a déjà été validée.");

    const food_id = sale.food_id;
    const quantity_sold = sale.quantity_sold;

    // Deduct stock
    const storages = await tx.foodStorage.findMany({
      where: { food_id },
      orderBy: { current_stock: 'desc' }
    });
    
    const food = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
    const isTm = food?.unit_type.name.toLowerCase() === 'tm';
    const qtyToDeduct = isTm ? quantity_sold / 1000 : quantity_sold;
    
    const totalStock = storages.reduce((acc, s) => acc + s.current_stock, 0);
    if (totalStock < qtyToDeduct) {
       throw new Error(`Stock insuffisant ! Stock actuel: ${totalStock.toFixed(2)}, Quantité demandée: ${qtyToDeduct.toFixed(2)}.`);
    }

    let remainingToDeduct = qtyToDeduct;

    for (const storage of storages) {
      if (remainingToDeduct <= 0) break;
      const deductAmt = Math.min(storage.current_stock, remainingToDeduct);
      
      await tx.foodStorage.update({
        where: { food_id_storage_id: { food_id, storage_id: storage.storage_id } },
        data: { current_stock: { decrement: deductAmt } }
      });
      
      await tx.stockTransaction.create({
        data: {
          food_id,
          storage_id: storage.storage_id,
          quantity: -deductAmt,
          transaction_type: "SALE",
          recorded_at: new Date()
        }
      });
      
      remainingToDeduct -= deductAmt;
    }

    // Update Sale Date and SubContract
    await tx.sale.update({
      where: { id: saleId },
      data: { date_sold: new Date() }
    });

    const allocation = await tx.saleSubContractAllocation.findFirst({
      where: { sale_id: saleId }
    });

    if (allocation) {
      await tx.saleSubContract.update({
        where: { id: allocation.sale_sub_contract_id },
        data: {
          kg_left_to_deliver: {
            decrement: quantity_sold
          }
        }
      });
    }
  });

  revalidatePath('/ventes');
  revalidatePath('/inventaire');
  revalidatePath('/dashboard');
  revalidatePath('/comptabilite');
}
