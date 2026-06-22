const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replacements
  content = content.replace(/fournisseur/g, 'client');
  content = content.replace(/Fournisseur/g, 'Client');
  content = content.replace(/fournisseurs/g, 'clients');
  content = content.replace(/Fournisseurs/g, 'Clients');
  content = content.replace(/delivery/g, 'sale');
  content = content.replace(/Delivery/g, 'Sale');
  content = content.replace(/deliveries/g, 'sales');
  content = content.replace(/Deliveries/g, 'Sales');
  content = content.replace(/Livraisons/g, 'Ventes');
  content = content.replace(/Livraison/g, 'Vente');
  content = content.replace(/livraisons/g, 'ventes');
  content = content.replace(/livraison/g, 'vente');

  content = content.replace(/fetchFournisseurs/g, 'fetchClients');
  content = content.replace(/VentesClient/g, 'VentesClient'); // just in case
  
  // Re-adjust schema references
  content = content.replace(/quantity_received/g, 'quantity_sold');
  content = content.replace(/date_delivered/g, 'date_sold');

  // sub_contracts
  content = content.replace(/delivery_subcontracts/g, 'sale_subcontracts');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

const files = [
  'app/ventes/page.tsx',
  'app/ventes/actions.ts',
  'app/ventes/components/VentesClient.tsx',
  'app/ventes/data/fetchClients.ts'
];

files.forEach(replaceInFile);
