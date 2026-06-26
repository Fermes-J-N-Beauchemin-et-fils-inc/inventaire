
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

  revalidatePath('/transactions');
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

  if (!name) throw new Error("Le nom du contrat est requis.");
  if (isNaN(supplier_id)) throw new Error("Le fournisseur est invalide.");
  if (isNaN(food_id)) throw new Error("L'aliment est invalide.");
  if (isNaN(total_kg)) throw new Error("La quantité totale est invalide.");
  if (isNaN(price_per_kg)) throw new Error("Le prix est invalide.");
  if (!date_start) throw new Error("La date de début est requise.");
  
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
    await updateFoodAveragePrice(food_id, tx);
  });

  revalidatePath('/transactions');
  revalidatePath('/transactions');
}

export async function updateContract(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const supplier_id = parseInt(formData.get("supplier_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const price_per_kg = parseFloat(formData.get("price_per_kg") as string);

  if (isNaN(id) || !name || isNaN(supplier_id) || isNaN(food_id) || isNaN(price_per_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du contrat.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id },
      data: {
        name,
        supplier_id,
        food_id,
        price_per_kg,
      }
    });

    await updateFoodAveragePrice(food_id, tx);
  });

  revalidatePath('/transactions');
}

export async function deleteContract(id: number) {
  if (isNaN(id)) throw new Error("ID de contrat invalide.");

  await prisma.$transaction(async (tx) => {
    const contract = await tx.contract.findUnique({ where: { id }, select: { food_id: true } });
    if (!contract) throw new Error("Contrat introuvable.");

    const subContracts = await tx.subContract.findMany({ where: { contract_id: id } });
    for (const sc of subContracts) {
      if ((sc.expected_kg - sc.kg_left_to_deliver) > 0.01) {
        throw new Error("Impossible de supprimer ce contrat car des livraisons ont déjà été réceptionnées pour celui-ci.");
      }
    }
    
    const scIds = subContracts.map(sc => sc.id);
    
    // Find delivery links
    const links = await tx.deliverySubContract.findMany({ where: { sub_contract_id: { in: scIds } } });
    const deliveryIds = links.map(l => l.delivery_id);
    
    // Delete links
    await tx.deliverySubContract.deleteMany({ where: { sub_contract_id: { in: scIds } } });
    
    // Delete planned deliveries
    if (deliveryIds.length > 0) {
      await tx.delivery.deleteMany({
        where: {
          id: { in: deliveryIds },
          date_delivered: null
        }
      });
    }
    
    await tx.subContract.deleteMany({ where: { contract_id: id } });
    await tx.contract.delete({ where: { id } });

    await updateFoodAveragePrice(contract.food_id, tx);
  });

  revalidatePath('/transactions');
}

export async function createDelivery(formData: FormData) {
  const contract_id = parseInt(formData.get("contract_id") as string, 10);
  const quantity_received = parseFloat(formData.get("quantity_received") as string);
  const date_expected = formData.get("date_expected") as string;
  const date_delivered = formData.get("date_delivered") as string;
  
  if (isNaN(contract_id) || isNaN(quantity_received) || !date_expected) {
    throw new Error("Veuillez remplir tous les champs obligatoires de la livraison.");
  }

  // Auto-fetch food_id and supplier_id from the contract
  const contract = await prisma.contract.findUnique({ select: { food_id: true, supplier_id: true }, where: { id: contract_id } });
  if (!contract) throw new Error("Contrat introuvable.");
  const food_id = contract.food_id;
  const supplier_id = contract.supplier_id;

  await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.create({
      data: {
        supplier_id,
        food_id,
        quantity_received,
        date_expected: new Date(date_expected),
        date_delivered: date_delivered ? new Date(date_delivered) : null
      }
    });

    // Link it to the FIRST active sub_contract of this contract
    const firstSubContract = await tx.subContract.findFirst({
      where: { contract_id, kg_left_to_deliver: { gt: 0 } },
      orderBy: { id: 'asc' }
    });

    const subContractToLink = firstSubContract || await tx.subContract.findFirst({
      where: { contract_id },
      orderBy: { id: 'asc' }
    });

    if (subContractToLink) {
      await tx.deliverySubContract.create({
        data: {
          delivery_id: delivery.id,
          sub_contract_id: subContractToLink.id,
          quantity: quantity_received
        }
      });
      
      if (date_delivered) {
        await tx.subContract.update({
          where: { id: subContractToLink.id },
          data: {
            kg_left_to_deliver: {
              decrement: quantity_received
            }
          }
        });
      }
    }

    if (date_delivered) {
      const firstStorage = await tx.storage.findFirst({ where: { is_active: true } });
      let storageIdToLog = null;

      if (firstStorage) {
        const food = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
        if (food) {
          storageIdToLog = firstStorage.id;
          const ration_to_kg = food.unit_type?.ration_to_kg || 1;
          const qtyInUnit = quantity_received / ration_to_kg;
          
          await tx.foodStorage.upsert({
            where: { food_id_storage_id: { food_id: food_id, storage_id: firstStorage.id } },
            update: { current_stock: { increment: qtyInUnit } },
            create: { food_id: food_id, storage_id: firstStorage.id, current_stock: qtyInUnit }
          });

          await tx.stockTransaction.create({
            data: {
              food_id: food_id,
              storage_id: storageIdToLog,
              quantity: qtyInUnit,
              transaction_type: "DELIVERY",
              recorded_at: new Date(date_delivered)
            }
          });
        }
      }
    }
  });

  revalidatePath('/transactions');
  revalidatePath('/inventaire');
}

export async function toggleSupplierStatus(supplierId: number, isActive: boolean) {
  if (isNaN(supplierId)) throw new Error("ID invalide.");
  
  await prisma.supplier.update({
    where: { id: supplierId },
    data: { is_active: isActive }
  });

  revalidatePath('/transactions');
}

export async function toggleContractStatus(contractId: number, isActive: boolean) {
  if (isNaN(contractId)) throw new Error("ID invalide.");
  
  await prisma.contract.update({
    where: { id: contractId },
    data: { is_active: isActive }
  });

  revalidatePath('/transactions');
}

export async function updateSupplier(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const phone_number = formData.get("phone_number") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const url = (formData.get("url") as string) || null;

  if (isNaN(id) || !name || !phone_number || !email || !address) {
    throw new Error("Veuillez remplir tous les champs obligatoires du fournisseur.");
  }

  await prisma.supplier.update({
    where: { id },
    data: { name, phone_number, email, address, url }
  });

  revalidatePath('/transactions');
}

export async function createSubContract(formData: FormData) {
  const contract_id = parseInt(formData.get("contract_id") as string, 10);
  const name = formData.get("name") as string;
  const custom_id = formData.get("custom_id") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);

  if (isNaN(contract_id) || !name || isNaN(expected_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du sous-contrat.");
  }

  await prisma.subContract.create({
    data: {
      contract_id,
      name,
      custom_id: custom_id || null,
      expected_kg,
      kg_left_to_deliver: expected_kg
    }
  });

  revalidatePath('/transactions');
}

export async function updateSubContract(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const custom_id = formData.get("custom_id") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);

  if (isNaN(id) || !name || isNaN(expected_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du sous-contrat.");
  }

  await prisma.$transaction(async (tx) => {
    const sc = await tx.subContract.findUnique({ where: { id } });
    if (!sc) throw new Error("Sous-contrat introuvable.");

    const delivered_kg = sc.expected_kg - sc.kg_left_to_deliver;
    if (expected_kg < delivered_kg) {
      throw new Error(`Impossible de définir la quantité prévue en dessous de la quantité déjà réceptionnée (${delivered_kg} kg).`);
    }

    await tx.subContract.update({
      where: { id },
      data: {
        name,
        custom_id: custom_id || null,
        expected_kg,
        kg_left_to_deliver: expected_kg - delivered_kg
      }
    });
  });

  revalidatePath('/transactions');
}

export async function createSaleSubContract(formData: FormData) {
  const sale_contract_id = parseInt(formData.get("sale_contract_id") as string, 10);
  const name = formData.get("name") as string;
  const custom_id = formData.get("custom_id") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);

  if (isNaN(sale_contract_id) || !name || isNaN(expected_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du sous-contrat de vente.");
  }

  await prisma.saleSubContract.create({
    data: {
      sale_contract_id,
      name,
      custom_id: custom_id || null,
      expected_kg,
      kg_left_to_deliver: expected_kg
    }
  });

  revalidatePath('/transactions');
}

export async function updateSaleSubContract(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const custom_id = formData.get("custom_id") as string;
  const expected_kg = parseFloat(formData.get("expected_kg") as string);

  if (isNaN(id) || !name || isNaN(expected_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du sous-contrat.");
  }

  await prisma.$transaction(async (tx) => {
    const sc = await tx.saleSubContract.findUnique({ where: { id } });
    if (!sc) throw new Error("Sous-contrat introuvable.");

    const delivered_kg = sc.expected_kg - sc.kg_left_to_deliver;
    if (expected_kg < delivered_kg) {
      throw new Error(`Impossible de définir la quantité prévue en dessous de la quantité déjà expédiée (${delivered_kg} kg).`);
    }

    await tx.saleSubContract.update({
      where: { id },
      data: {
        name,
        custom_id: custom_id || null,
        expected_kg,
        kg_left_to_deliver: expected_kg - delivered_kg
      }
    });
  });

  revalidatePath('/transactions');
}

export async function deleteSubContract(id: number) {
  try {
    if (isNaN(id)) {
      throw new Error("ID invalide.");
    }

    await prisma.$transaction(async (tx) => {
      const sc = await tx.subContract.findUnique({ where: { id } });
      if (sc && (sc.expected_kg - sc.kg_left_to_deliver) > 0.01) {
        throw new Error("Impossible de supprimer ce sous-contrat car des livraisons ont déjà été réceptionnées.");
      }

      // Find delivery links
      const links = await tx.deliverySubContract.findMany({ where: { sub_contract_id: id } });
      const deliveryIds = links.map(l => l.delivery_id);

      // Delete links
      await tx.deliverySubContract.deleteMany({ where: { sub_contract_id: id } });

      // Delete planned deliveries
      if (deliveryIds.length > 0) {
        await tx.delivery.deleteMany({
          where: {
            id: { in: deliveryIds },
            date_delivered: null
          }
        });
      }

      await tx.subContract.delete({
        where: { id }
      });
    });

    revalidatePath('/transactions');
  } catch (error: any) {
    throw new Error(error.message || "Erreur lors de la suppression du sous-contrat.");
  }
}

export async function markDeliveryAsReceived(deliveryId: number) {
  if (isNaN(deliveryId)) throw new Error("ID de livraison invalide.");

  await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: deliveryId },
      include: { delivery_subcontracts: true }
    });

    if (!delivery || delivery.date_delivered) {
      throw new Error("Livraison introuvable ou déjà reçue.");
    }

    // Mark as delivered today
    const now = new Date();
    await tx.delivery.update({
      where: { id: deliveryId },
      data: { date_delivered: now }
    });

    // Deduct from sub-contracts
    for (const dsc of delivery.delivery_subcontracts) {
      await tx.subContract.update({
        where: { id: dsc.sub_contract_id },
        data: { kg_left_to_deliver: { decrement: dsc.quantity } }
      });
    }

    // Add to global stock via a default storage (first active storage)
    const firstStorage = await tx.storage.findFirst({ where: { is_active: true } });
    if (firstStorage) {
      const food = await tx.food.findUnique({ where: { id: delivery.food_id }, include: { unit_type: true } });
      if (food) {
        const ration_to_kg = food.unit_type?.ration_to_kg || 1;
        const qtyInUnit = delivery.quantity_received / ration_to_kg;
        
        await tx.foodStorage.upsert({
          where: { food_id_storage_id: { food_id: delivery.food_id, storage_id: firstStorage.id } },
          update: { current_stock: { increment: qtyInUnit } },
          create: { food_id: delivery.food_id, storage_id: firstStorage.id, current_stock: qtyInUnit }
        });

        await tx.stockTransaction.create({
          data: {
            food_id: delivery.food_id,
            storage_id: firstStorage.id,
            quantity: qtyInUnit,
            transaction_type: "DELIVERY",
            recorded_at: now
          }
        });
      }
    }
  });

  revalidatePath('/inventaire');
  revalidatePath('/transactions');
}

export async function deleteDelivery(deliveryId: number) {
  if (isNaN(deliveryId)) throw new Error("ID de livraison invalide.");

  await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: deliveryId }
    });

    if (!delivery) throw new Error("Livraison introuvable.");
    if (delivery.date_delivered) throw new Error("Impossible de supprimer une livraison déjà reçue.");

    await tx.delivery.delete({ where: { id: deliveryId } });
  });

  revalidatePath('/inventaire');
  revalidatePath('/transactions');
}

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

  revalidatePath('/transactions');
}

export async function createSaleContract(formData: FormData) {
  const name = formData.get("name") as string;
  const client_id = parseInt((formData.get("client_id") || formData.get("supplier_id")) as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const total_kg = parseFloat(formData.get("total_kg") as string);
  const price_per_kg = parseFloat(formData.get("price_per_kg") as string);
  const date_start = formData.get("date_start") as string;
  let date_end = formData.get("date_end") as string;
  const is_spot = formData.get("is_spot") === "true";

  if (!name) throw new Error("Le nom du contrat est requis.");
  if (isNaN(client_id)) throw new Error("Veuillez sélectionner un client.");
  if (isNaN(food_id)) throw new Error("Veuillez sélectionner un aliment.");
  if (isNaN(total_kg)) throw new Error("La quantité totale est invalide.");
  if (isNaN(price_per_kg)) throw new Error("Le prix est invalide.");
  if (!date_start) throw new Error("La date de début est requise.");
  
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

  revalidatePath('/transactions');
}

export async function updateSaleContract(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const client_id = parseInt(formData.get("client_id") as string, 10);
  const food_id = parseInt(formData.get("food_id") as string, 10);
  const price_per_kg = parseFloat(formData.get("price_per_kg") as string);

  if (isNaN(id) || !name || isNaN(client_id) || isNaN(food_id) || isNaN(price_per_kg)) {
    throw new Error("Veuillez remplir tous les champs obligatoires du contrat.");
  }

  await prisma.saleContract.update({
    where: { id },
    data: {
      name,
      client_id,
      food_id,
      price_per_kg,
    }
  });

  revalidatePath('/transactions');
}

export async function deleteSaleContract(id: number) {
  if (isNaN(id)) throw new Error("ID de contrat invalide.");

  await prisma.$transaction(async (tx) => {
    const subContracts = await tx.saleSubContract.findMany({ where: { sale_contract_id: id } });
    for (const sc of subContracts) {
      if ((sc.expected_kg - sc.kg_left_to_deliver) > 0.01) {
        throw new Error("Impossible de supprimer ce contrat car des ventes ont déjà été validées pour celui-ci.");
      }
    }

    const scIds = subContracts.map(sc => sc.id);

    // Find sale links
    const links = await tx.saleSubContractAllocation.findMany({ where: { sale_sub_contract_id: { in: scIds } } });
    const saleIds = links.map(l => l.sale_id);

    // Delete links
    await tx.saleSubContractAllocation.deleteMany({ where: { sale_sub_contract_id: { in: scIds } } });

    // Delete planned sales
    if (saleIds.length > 0) {
      await tx.sale.deleteMany({
        where: {
          id: { in: saleIds },
          date_sold: null
        }
      });
    }

    await tx.saleSubContract.deleteMany({ where: { sale_contract_id: id } });
    await tx.saleContract.delete({ where: { id } });
  });

  revalidatePath('/transactions');
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
      if (!food) throw new Error("Aliment introuvable.");
      const ration_to_kg = food.unit_type?.ration_to_kg || 1;
      const qtyToDeduct = quantity_sold / ration_to_kg;
      
      const totalStock = storages.reduce((acc, s) => acc + s.current_stock, 0);
      if (totalStock < qtyToDeduct) {
         throw new Error(`Stock insuffisant ! Stock actuel: ${totalStock.toFixed(2)} ${food.unit_type.name}, Quantité demandée: ${quantity_sold.toFixed(2)} kg.`);
      }

      // Deduct from storages sequentially
      let remainingToDeduct = qtyToDeduct;
      const primaryStorageId = storages.length > 0 ? storages[0].storage_id : null;

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

  revalidatePath('/transactions');
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

  revalidatePath('/transactions');
}

export async function toggleSaleContractStatus(contractId: number, isActive: boolean) {
  if (isNaN(contractId)) throw new Error("ID invalide.");
  
  await prisma.saleContract.update({
    where: { id: contractId },
    data: { is_active: isActive }
  });

  revalidatePath('/transactions');
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

  revalidatePath('/transactions');
}



export async function deleteSaleSubContract(id: number) {
  try {
    if (isNaN(id)) {
      throw new Error("ID invalide.");
    }

    await prisma.$transaction(async (tx) => {
      const sc = await tx.saleSubContract.findUnique({ where: { id } });
      if (sc && (sc.expected_kg - sc.kg_left_to_deliver) > 0.01) {
        throw new Error("Impossible de supprimer ce sous-contrat car des ventes ont déjà été validées.");
      }

      // Find sale links
      const links = await tx.saleSubContractAllocation.findMany({ where: { sale_sub_contract_id: id } });
      const saleIds = links.map(l => l.sale_id);

      // Delete links
      await tx.saleSubContractAllocation.deleteMany({ where: { sale_sub_contract_id: id } });

      // Delete planned sales
      if (saleIds.length > 0) {
        await tx.sale.deleteMany({
          where: {
            id: { in: saleIds },
            date_sold: null
          }
        });
      }

      await tx.saleSubContract.delete({
        where: { id }
      });
    });

    revalidatePath('/transactions');
  } catch (error: any) {
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
  revalidatePath('/transactions');
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
    const ration_to_kg = isTm ? 1000 : (food?.unit_type.ration_to_kg || 1);
    const qtyToDeduct = quantity_sold / ration_to_kg;
    
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

  revalidatePath('/transactions');
  revalidatePath('/inventaire');
  revalidatePath('/dashboard');
  revalidatePath('/comptabilite');
}


export async function createQuickSpotDelivery(formData: FormData) {
  const supplier_id = parseInt(formData.get('supplier_id') as string, 10);
  const food_id = parseInt(formData.get('food_id') as string, 10);
  const quantity = parseFloat(formData.get('quantity') as string);
  const price_per_kg = parseFloat(formData.get('price_per_kg') as string);
  const dateStr = formData.get('date_delivered') as string;

  if (isNaN(supplier_id) || isNaN(food_id) || isNaN(quantity) || isNaN(price_per_kg) || !dateStr) {
    throw new Error('Veuillez remplir tous les champs obligatoires.');
  }

  const now = new Date(dateStr);

  const food = await prisma.food.findUnique({ where: { id: food_id } });
  if (!food) throw new Error('Aliment introuvable.');

  await prisma.$transaction(async (tx) => {
    // 1. Create Spot Contract
    const contract = await tx.contract.create({
      data: {
        name: `Spot ${food.name} ${now.toLocaleDateString('fr-CA')}`,
        supplier_id,
        food_id,
        total_kg: quantity,
        price_per_kg,
        date_start: now,
        date_end: now
      }
    });

    const subContract = await tx.subContract.create({
      data: {
        contract_id: contract.id,
        name: 'Spot',
        expected_kg: quantity,
        kg_left_to_deliver: 0 // Delivered instantly
      }
    });

    // 2. Create Delivery
    const delivery = await tx.delivery.create({
      data: {
        supplier_id,
        food_id,
        quantity_received: quantity,
        date_expected: now,
        date_delivered: now
      }
    });

    await tx.deliverySubContract.create({
      data: {
        delivery_id: delivery.id,
        sub_contract_id: subContract.id,
        quantity: quantity
      }
    });

    const firstStorage = await tx.storage.findFirst({ where: { is_active: true } });
    if (firstStorage) {
      const foodData = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
      if (foodData) {
        const isTm = foodData.unit_type?.name.toLowerCase() === 'tm';
        const ration_to_kg = isTm ? 1000 : (foodData.unit_type?.ration_to_kg || 1);
        const qtyInUnit = quantity / ration_to_kg;
        await tx.foodStorage.upsert({
          where: { food_id_storage_id: { food_id, storage_id: firstStorage.id } },
          update: { current_stock: { increment: qtyInUnit } },
          create: { food_id, storage_id: firstStorage.id, current_stock: qtyInUnit }
        });

        await tx.stockTransaction.create({
          data: {
            food_id,
            storage_id: firstStorage.id,
            quantity: qtyInUnit,
            transaction_type: 'DELIVERY',
            recorded_at: now
          }
        });
      }
    }
    await updateFoodAveragePrice(food_id, tx);
  });

  const { revalidatePath } = require('next/cache');
  revalidatePath('/transactions');
  revalidatePath('/inventaire');
}

export async function createQuickSpotSale(formData: FormData) {
  const client_id = parseInt(formData.get('client_id') as string, 10);
  const food_id = parseInt(formData.get('food_id') as string, 10);
  const quantity = parseFloat(formData.get('quantity') as string);
  const price_per_kg = parseFloat(formData.get('price_per_kg') as string);
  const dateStr = formData.get('date_delivered') as string;

  if (isNaN(client_id) || isNaN(food_id) || isNaN(quantity) || isNaN(price_per_kg) || !dateStr) {
    throw new Error('Veuillez remplir tous les champs obligatoires.');
  }

  const now = new Date(dateStr);

  const food = await prisma.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
  if (!food) throw new Error('Aliment introuvable.');

  await prisma.$transaction(async (tx) => {
    
    // Validate stock
    const storages = await tx.foodStorage.findMany({
      where: { food_id },
      orderBy: { current_stock: 'desc' }
    });
    
    const isTm = food.unit_type?.name.toLowerCase() === 'tm';
    const ration_to_kg = isTm ? 1000 : (food.unit_type?.ration_to_kg || 1);
    const qtyToDeduct = quantity / ration_to_kg;
    
    const totalStock = storages.reduce((acc, s) => acc + s.current_stock, 0);
    if (totalStock < qtyToDeduct) {
       throw new Error(`Stock insuffisant ! Stock actuel: ${totalStock.toFixed(2)} ${food.unit_type.name}, Quantité demandée: ${quantity.toFixed(2)} kg.`);
    }

    // Deduct stock sequentially
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
          transaction_type: 'SALE',
          recorded_at: now
        }
      });
      
      remainingToDeduct -= deductAmt;
    }

    // 1. Create Spot Contract
    const contract = await tx.saleContract.create({
      data: {
        name: `Spot ${food.name} ${now.toLocaleDateString('fr-CA')}`,
        client_id,
        food_id,
        total_kg: quantity,
        price_per_kg,
        date_start: now,
        date_end: now
      }
    });

    const subContract = await tx.saleSubContract.create({
      data: {
        sale_contract_id: contract.id,
        name: 'Spot',
        expected_kg: quantity,
        kg_left_to_deliver: 0 // Sold instantly
      }
    });

    // 2. Create Sale
    const sale = await tx.sale.create({
      data: {
        client_id,
        food_id,
        quantity_sold: quantity,
        date_expected: now,
        date_sold: now
      }
    });

    await tx.saleSubContractAllocation.create({
      data: {
        sale_id: sale.id,
        sale_sub_contract_id: subContract.id,
        quantity: quantity
      }
    });
  });

  const { revalidatePath } = require('next/cache');
  revalidatePath('/transactions');
  revalidatePath('/inventaire');
}

export async function receiveDeliveryWithDetails(
  deliveryId: number, 
  totalReceived: number, 
  storageAllocations: {storage_id: number, quantity: number}[]
) {
  if (isNaN(deliveryId) || isNaN(totalReceived)) throw new Error("Données invalides.");

  await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: deliveryId }
    });

    if (!delivery) throw new Error("Livraison introuvable.");
    if (delivery.date_delivered) throw new Error("Cette livraison a déjà été reçue.");

    const food_id = delivery.food_id;
    const food = await tx.food.findUnique({ where: { id: food_id }, include: { unit_type: true } });
    if (!food) throw new Error("Aliment introuvable.");
    const isTm = food.unit_type?.name.toLowerCase() === 'tm';
    const ration_to_kg = isTm ? 1000 : (food.unit_type?.ration_to_kg || 1);

    // Update global and specific storages based on allocation
    for (const alloc of storageAllocations) {
      if (alloc.quantity <= 0) continue;

      const qtyInUnit = alloc.quantity / ration_to_kg;

      await tx.foodStorage.upsert({
        where: { food_id_storage_id: { food_id, storage_id: alloc.storage_id } },
        update: { current_stock: { increment: qtyInUnit } },
        create: { food_id, storage_id: alloc.storage_id, current_stock: qtyInUnit }
      });

      await tx.stockTransaction.create({
        data: {
          food_id,
          storage_id: alloc.storage_id,
          quantity: qtyInUnit,
          transaction_type: "DELIVERY",
          recorded_at: new Date()
        }
      });
    }

    // Update Delivery Date and final received quantity
    await tx.delivery.update({
      where: { id: deliveryId },
      data: { 
        date_delivered: new Date(),
        quantity_received: totalReceived
      }
    });

    // Update subcontracts kg_left_to_deliver
    const allocations = await tx.deliverySubContract.findMany({
      where: { delivery_id: deliveryId }
    });

    let remainingReceived = totalReceived;
    for (const alloc of allocations) {
      if (remainingReceived <= 0) break;
      const deduct = Math.min(alloc.quantity, remainingReceived);
      await tx.subContract.update({
        where: { id: alloc.sub_contract_id },
        data: {
          kg_left_to_deliver: {
            decrement: deduct
          }
        }
      });
      remainingReceived -= deduct;
    }
  });

  const { revalidatePath } = require('next/cache');
  revalidatePath('/transactions');
  revalidatePath('/inventaire');
}

async function updateFoodAveragePrice(foodId: number, tx: any) {
  // 1. Get all contracts for this food
  const contracts = await tx.contract.findMany({
    where: { food_id: foodId }
  });

  if (contracts.length === 0) return;

  // 2. Calculate average price_per_kg
  const sumPrice = contracts.reduce((sum: number, c: any) => sum + c.price_per_kg, 0);
  const avgPricePerKg = sumPrice / contracts.length;

  // 3. Get food to check unit_type and ms_percentage
  const food = await tx.food.findUnique({
    where: { id: foodId },
    include: { unit_type: true }
  });

  if (!food) return;

  const ration_to_kg = food.unit_type.ration_to_kg || 1;
  const ms_percentage = food.ms_percentage || 0;

  // 4. Calculate new price_per_tqs and price_per_ms
  const price_per_tqs = avgPricePerKg * ration_to_kg;
  const price_per_ms = ms_percentage > 0 ? (price_per_tqs / (ms_percentage / 100)) : 0;

  // 5. Update food
  await tx.food.update({
    where: { id: foodId },
    data: {
      price_per_tqs,
      price_per_ms
    }
  });
}

