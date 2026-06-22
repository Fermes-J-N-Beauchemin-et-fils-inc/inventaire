#!/bin/bash

# Configuration
LOCAL_DB="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"

echo "========================================"
echo "    Synchronisation Local -> Prod       "
echo "========================================"
echo ""
echo "Veuillez coller votre DATABASE_URL de Railway (la version publique commençant par postgresql://...):"
read PROD_DB

if [ -z "$PROD_DB" ]; then
  echo "Erreur: L'URL de la base de données de production est requise."
  exit 1
fi

echo ""
echo "Attention: Cette action va SUPPRIMER toutes les données de la base de production et les Remplacer par vos données locales."
read -p "Êtes-vous sûr de vouloir continuer ? (O/n) " confirm

if [[ $confirm == [nN] || $confirm == [nN][oO][nN] ]]; then
  echo "Annulé."
  exit 0
fi

echo ""
echo "Début de la copie... (Cela peut prendre quelques instants)"

# Export local and import into remote
pg_dump "$LOCAL_DB" --clean --if-exists --no-owner --no-privileges | psql "$PROD_DB"

if [ $? -eq 0 ]; then
  echo "✅ Succès ! La base de données de production est maintenant identique à la version locale."
else
  echo "❌ Une erreur s'est produite lors de la synchronisation."
fi
